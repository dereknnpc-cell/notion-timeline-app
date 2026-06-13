import React from 'react';
import { Wallet, Plane, AlertTriangle, BellRing, Sparkles } from 'lucide-react';
import { Card, SectionTitle, Badge, Empty } from './UI.jsx';
import { CARDS } from '../data/banks.js';
import { PROMOTIONS } from '../data/promotions.js';
import { recommend, scoreCard } from '../lib/optimizer.js';
import { t } from '../i18n.js';
import { nextClosingDate, nextDueDate, daysBetween, formatDate, parseISO } from '../lib/dates.js';

export function DashboardTab({ lang, members, cards, transactions, registeredPromos, goto }) {
  const today = new Date();
  const todayIso = today.toISOString().slice(0, 10);
  const ownedKeys = cards.map(c => c.templateId);

  const dueRows = cards.map(c => {
    const tmpl = CARDS.find(x => x.id === c.templateId);
    if (!tmpl) return null;
    const close = nextClosingDate(today, tmpl.statementClosingDay);
    const due = nextDueDate(today, tmpl.statementClosingDay, tmpl.paymentDueOffsetDays);
    const owner = members.find(m => m.id === c.holderId);
    return { c, tmpl, close, due, daysToDue: daysBetween(today, due), owner };
  }).filter(Boolean).sort((a, b) => a.daysToDue - b.daysToDue).slice(0, 5);

  const totalLimit = {};
  for (const c of cards) {
    const tmpl = CARDS.find(x => x.id === c.templateId);
    if (!tmpl || c.isSupplementary) continue;
    totalLimit[tmpl.currency] = (totalLimit[tmpl.currency] ?? 0) + (Number(c.limit) || 0);
  }

  const recentTx = transactions.slice(0, 5);
  const todaysBest = recommend({
    amount: 1000, category: 'default', purchaseDate: today,
    ownedCardKeys: ownedKeys, registeredPromoIds: new Set(registeredPromos), prefer: 'miles',
  }).slice(0, 3);

  const pendingRegistrations = PROMOTIONS.filter(p =>
    ownedKeys.includes(p.cardId) && p.requiresRegistration &&
    !registeredPromos.includes(p.id) && p.endDate >= todayIso,
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card className="p-5 lg:col-span-2">
        <SectionTitle icon={Wallet}>{t('totalCreditLimit', lang)}</SectionTitle>
        {Object.keys(totalLimit).length === 0 ? <Empty>{t('noData', lang)}</Empty> : (
          <div className="flex flex-wrap gap-6">
            {Object.entries(totalLimit).map(([cur, amt]) => (
              <div key={cur} className="bg-slate-50 rounded-lg px-4 py-3 border border-slate-100">
                <div className="text-[11px] text-slate-500">{cur}</div>
                <div className="text-2xl font-bold text-slate-800">{amt.toLocaleString()}</div>
              </div>
            ))}
            <div className="bg-blue-50 rounded-lg px-4 py-3 border border-blue-100">
              <div className="text-[11px] text-blue-500">{lang === 'zh' ? '家庭成員' : 'Members'}</div>
              <div className="text-2xl font-bold text-blue-700">{members.length}</div>
            </div>
            <div className="bg-indigo-50 rounded-lg px-4 py-3 border border-indigo-100">
              <div className="text-[11px] text-indigo-500">{lang === 'zh' ? '卡片數' : 'Cards'}</div>
              <div className="text-2xl font-bold text-indigo-700">{cards.length}</div>
            </div>
          </div>
        )}
      </Card>

      <Card className="p-5">
        <SectionTitle icon={BellRing}>{t('upcomingPayments', lang)}</SectionTitle>
        {dueRows.length === 0 ? <Empty>{t('noData', lang)}</Empty> : (
          <ul className="space-y-2">
            {dueRows.map(({ c, tmpl, due, daysToDue, owner }) => (
              <li key={c.key} className="flex justify-between items-center text-sm border-b border-slate-100 pb-2 last:border-b-0">
                <div>
                  <div className="font-medium text-slate-800">{lang === 'zh' ? tmpl.nameZh : tmpl.nameEn}</div>
                  <div className="text-[11px] text-slate-500">{owner?.name} · {formatDate(due, lang)}</div>
                </div>
                <Badge color={daysToDue < 0 ? 'red' : daysToDue <= 5 ? 'amber' : 'slate'}>
                  {daysToDue < 0 ? t('overdue', lang) : t('dueIn', lang)} {Math.abs(daysToDue)}{t('days', lang)}
                </Badge>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card className="p-5">
        <SectionTitle icon={Sparkles}>{t('todaysBestCard', lang)}</SectionTitle>
        {todaysBest.length === 0 ? <Empty>{t('noData', lang)}</Empty> : (
          <ol className="space-y-2">
            {todaysBest.map((r, i) => (
              <li key={r.cardId} className="flex justify-between items-center text-sm">
                <div>
                  <div className="font-medium text-slate-800">
                    <span className="text-xs text-slate-400 mr-2">#{i + 1}</span>
                    {lang === 'zh' ? r.card.nameZh : r.card.nameEn}
                  </div>
                  <div className="text-[11px] text-slate-500">{r.card.bank}</div>
                </div>
                <div className="text-right text-xs">
                  <div>{t('daysToPay', lang)}: <b>{r.daysToPay}</b></div>
                  {r.miles > 0 && <div className="text-indigo-600 flex items-center gap-1"><Plane className="w-3 h-3" />{r.miles.toFixed(0)} {t('miles', lang)}</div>}
                  {r.cashback > 0 && <div className="text-emerald-600">{r.cashback.toFixed(0)} {r.card.currency}</div>}
                </div>
              </li>
            ))}
          </ol>
        )}
        <button onClick={() => goto('optimizer')} className="mt-3 text-xs text-blue-600 hover:underline">
          {lang === 'zh' ? '→ 詳細最佳化建議' : '→ See full optimizer'}
        </button>
      </Card>

      <Card className="p-5">
        <SectionTitle icon={AlertTriangle}>{t('registrationDue', lang)}</SectionTitle>
        {pendingRegistrations.length === 0 ? <Empty>{lang === 'zh' ? '已全部登錄' : 'All registered'}</Empty> : (
          <ul className="space-y-2">
            {pendingRegistrations.map(p => (
              <li key={p.id} className="text-sm flex justify-between items-start gap-2 border-b border-slate-100 pb-2 last:border-b-0">
                <div>
                  <div className="font-medium text-slate-800">{lang === 'zh' ? p.titleZh : p.titleEn}</div>
                  <div className="text-[11px] text-slate-500">{lang === 'zh' ? '截止' : 'ends'} {p.endDate}</div>
                </div>
                <Badge color="red">{t('needsRegistration', lang)}</Badge>
              </li>
            ))}
          </ul>
        )}
        <button onClick={() => goto('promotions')} className="mt-3 text-xs text-blue-600 hover:underline">
          {lang === 'zh' ? '→ 前往登錄' : '→ Go register'}
        </button>
      </Card>

      <Card className="p-5 lg:col-span-2">
        <SectionTitle>{t('recentTx', lang)}</SectionTitle>
        {recentTx.length === 0 ? <Empty>{t('noData', lang)}</Empty> : (
          <table className="w-full text-sm">
            <thead className="text-slate-500 text-xs">
              <tr><th className="text-left p-1">{t('date', lang)}</th><th className="text-left p-1">{t('merchant', lang)}</th><th className="text-left p-1">{t('card', lang)}</th><th className="text-right p-1">{t('amount', lang)}</th><th className="text-right p-1">{t('estReward', lang)}</th></tr>
            </thead>
            <tbody>
              {recentTx.map(tx => {
                const c = cards.find(c => c.key === tx.cardKey);
                const tmpl = c && CARDS.find(x => x.id === c.templateId);
                const s = tmpl && scoreCard(tmpl, {
                  amount: Number(tx.amount) || 0, category: tx.category,
                  purchaseDate: parseISO(tx.date) ?? new Date(),
                  registeredPromoIds: new Set(registeredPromos),
                });
                return (
                  <tr key={tx.id} className="border-t border-slate-100">
                    <td className="p-1">{tx.date}</td>
                    <td className="p-1">{tx.merchant || '—'}</td>
                    <td className="p-1">{tmpl ? (lang === 'zh' ? tmpl.nameZh : tmpl.nameEn) : '—'}</td>
                    <td className="p-1 text-right">{Number(tx.amount).toLocaleString()} {tmpl?.currency}</td>
                    <td className="p-1 text-right">
                      {s?.miles > 0 ? `${s.miles.toFixed(0)} ${t('miles', lang)}` : ''}
                      {s?.cashback > 0 ? `${s.cashback.toFixed(0)} ${tmpl?.currency}` : ''}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
