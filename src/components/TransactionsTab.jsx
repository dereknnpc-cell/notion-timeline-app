import React, { useState } from 'react';
import { Receipt, Trash2, PlusCircle } from 'lucide-react';
import { Card, SectionTitle, TextField, SelectField, Button, Badge, Empty } from './UI.jsx';
import { CARDS, CATEGORIES } from '../data/banks.js';
import { scoreCard } from '../lib/optimizer.js';
import { t, CATEGORY_LABEL } from '../i18n.js';
import { toISODate, parseISO } from '../lib/dates.js';

export function TransactionsTab({ lang, members, cards, transactions, setTransactions, registeredPromos }) {
  const today = new Date();
  const [draft, setDraft] = useState({
    date: toISODate(today), amount: 0, category: 'default', merchant: '', cardKey: cards[0]?.key ?? '',
  });

  const cardOpts = cards.map(c => {
    const tmpl = CARDS.find(x => x.id === c.templateId);
    const owner = members.find(m => m.id === c.holderId);
    return { value: c.key, label: `${lang === 'zh' ? tmpl?.nameZh : tmpl?.nameEn} · ${owner?.name ?? ''}` };
  });
  const catOpts = CATEGORIES.map(c => ({ value: c, label: t(CATEGORY_LABEL[c], lang) }));

  const add = () => {
    if (!draft.cardKey || !draft.amount) return;
    setTransactions([{ id: `tx-${Date.now()}`, ...draft }, ...transactions]);
    setDraft({ ...draft, amount: 0, merchant: '' });
  };
  const remove = (id) => setTransactions(transactions.filter(tx => tx.id !== id));

  const thisMonth = today.toISOString().slice(0, 7);
  const monthlyTx = transactions.filter(tx => tx.date.startsWith(thisMonth));
  let spend = 0, miles = 0, cashback = 0, points = 0;
  for (const tx of monthlyTx) {
    const c = cards.find(c => c.key === tx.cardKey);
    const tmpl = c && CARDS.find(x => x.id === c.templateId);
    if (!tmpl) continue;
    const s = scoreCard(tmpl, {
      amount: Number(tx.amount) || 0, category: tx.category,
      purchaseDate: parseISO(tx.date) ?? new Date(),
      registeredPromoIds: new Set(registeredPromos),
    });
    spend += Number(tx.amount) || 0;
    miles += s.miles; cashback += s.cashback; points += s.points;
  }

  return (
    <Card className="p-5">
      <SectionTitle icon={Receipt} hint={t('txHelp', lang)}>{t('tabTransactions', lang)}</SectionTitle>
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-3 items-end">
        <TextField type="date" label={t('date', lang)} value={draft.date}
          onChange={v => setDraft({ ...draft, date: v })} />
        <SelectField label={t('card', lang)} value={draft.cardKey}
          onChange={v => setDraft({ ...draft, cardKey: v })} options={cardOpts} />
        <TextField type="number" label={t('amount', lang)} value={draft.amount}
          onChange={v => setDraft({ ...draft, amount: v })} />
        <SelectField label={t('category', lang)} value={draft.category}
          onChange={v => setDraft({ ...draft, category: v })} options={catOpts} />
        <TextField label={t('merchant', lang)} value={draft.merchant}
          onChange={v => setDraft({ ...draft, merchant: v })} />
        <Button onClick={add}><PlusCircle className="w-4 h-4 inline mr-1" />{t('addTx', lang)}</Button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <Stat label={t('thisMonthSpend', lang)} value={spend.toLocaleString()} />
        <Stat label={t('estMiles', lang)} value={miles.toFixed(0)} />
        <Stat label={t('estCashback', lang)} value={cashback.toFixed(0)} />
        <Stat label={t('points', lang)} value={points.toFixed(0)} />
      </div>
      {transactions.length === 0 ? <Empty>{t('noData', lang)}</Empty> : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="text-left p-2">{t('date', lang)}</th>
                <th className="text-left p-2">{t('card', lang)}</th>
                <th className="text-left p-2">{t('merchant', lang)}</th>
                <th className="text-left p-2">{t('category', lang)}</th>
                <th className="text-right p-2">{t('amount', lang)}</th>
                <th className="text-right p-2">{t('estReward', lang)}</th>
                <th className="p-2"></th>
              </tr>
            </thead>
            <tbody>
              {transactions.map(tx => {
                const c = cards.find(c => c.key === tx.cardKey);
                const tmpl = c && CARDS.find(x => x.id === c.templateId);
                const s = tmpl && scoreCard(tmpl, {
                  amount: Number(tx.amount) || 0, category: tx.category,
                  purchaseDate: parseISO(tx.date) ?? new Date(),
                  registeredPromoIds: new Set(registeredPromos),
                });
                return (
                  <tr key={tx.id} className="border-t border-slate-100">
                    <td className="p-2">{tx.date}</td>
                    <td className="p-2">{tmpl ? (lang === 'zh' ? tmpl.nameZh : tmpl.nameEn) : '—'}</td>
                    <td className="p-2">{tx.merchant || '—'}</td>
                    <td className="p-2"><Badge>{t(CATEGORY_LABEL[tx.category], lang)}</Badge></td>
                    <td className="p-2 text-right">{Number(tx.amount).toLocaleString()} {tmpl?.currency}</td>
                    <td className="p-2 text-right">
                      {s?.miles > 0 && <div className="text-indigo-600">{s.miles.toFixed(0)} {t('miles', lang)}</div>}
                      {s?.cashback > 0 && <div className="text-emerald-600">{s.cashback.toFixed(0)} {tmpl?.currency}</div>}
                      {s?.points > 0 && <div className="text-slate-600">{s.points.toFixed(0)} {t('points', lang)}</div>}
                    </td>
                    <td className="p-2 text-right">
                      <button onClick={() => remove(tx.id)} className="text-rose-500 hover:text-rose-700">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}

function Stat({ label, value }) {
  return (
    <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
      <div className="text-[11px] text-slate-500">{label}</div>
      <div className="text-xl font-bold text-slate-800">{value}</div>
    </div>
  );
}
