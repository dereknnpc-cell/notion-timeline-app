import React, { useState } from 'react';
import { Sparkles, CalendarDays, Coins, Plane } from 'lucide-react';
import { Card, SectionTitle, TextField, SelectField, Badge } from './UI.jsx';
import { CARDS, CATEGORIES } from '../data/banks.js';
import { recommend } from '../lib/optimizer.js';
import { t, CATEGORY_LABEL } from '../i18n.js';
import { formatDate, toISODate, parseISO } from '../lib/dates.js';

export function OptimizerTab({ lang, cards, registeredPromos }) {
  const today = new Date();
  const [form, setForm] = useState({
    purchaseDate: toISODate(today), amount: 1000, category: 'default', prefer: 'miles', scope: 'owned',
  });

  const ownedKeys = cards.map(c => c.templateId);
  const purchaseDate = parseISO(form.purchaseDate) ?? new Date();
  const results = recommend({
    amount: Number(form.amount) || 0,
    category: form.category,
    purchaseDate,
    ownedCardKeys: form.scope === 'owned' ? ownedKeys : null,
    registeredPromoIds: new Set(registeredPromos),
    prefer: form.prefer,
  });

  const catOpts = CATEGORIES.map(c => ({ value: c, label: t(CATEGORY_LABEL[c], lang) }));
  const preferOpts = [
    { value: 'miles', label: t('preferMiles', lang) },
    { value: 'cashback', label: t('preferCashback', lang) },
    { value: 'defer', label: t('preferDefer', lang) },
  ];
  const scopeOpts = [
    { value: 'owned', label: lang === 'zh' ? '只用我有的卡' : 'My cards only' },
    { value: 'all', label: lang === 'zh' ? '所有卡片資料庫' : 'Entire card catalog' },
  ];

  return (
    <Card className="p-5">
      <SectionTitle icon={Sparkles} hint={t('optimizerHelp', lang)}>{t('tabOptimizer', lang)}</SectionTitle>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
        <TextField type="date" label={t('date', lang)} value={form.purchaseDate}
          onChange={v => setForm({ ...form, purchaseDate: v })} />
        <TextField type="number" label={t('amount', lang)} value={form.amount}
          onChange={v => setForm({ ...form, amount: v })} />
        <SelectField label={t('category', lang)} value={form.category}
          onChange={v => setForm({ ...form, category: v })} options={catOpts} />
        <SelectField label={t('prefer', lang)} value={form.prefer}
          onChange={v => setForm({ ...form, prefer: v })} options={preferOpts} />
        <SelectField label={lang === 'zh' ? '範圍' : 'Scope'} value={form.scope}
          onChange={v => setForm({ ...form, scope: v })} options={scopeOpts} />
      </div>
      {results.length === 0 ? (
        <div className="text-sm italic text-slate-400 py-6 text-center">
          {lang === 'zh' ? '尚未指派任何卡，先到信用卡頁面新增。' : 'No cards yet. Add some in the Cards tab.'}
        </div>
      ) : (
        <ol className="space-y-2">
          {results.map((r, i) => (
            <li key={r.cardId}
              className={`p-3 rounded-lg border ${i === 0 ? 'bg-blue-50 border-blue-200' : 'bg-white border-slate-200'}`}>
              <div className="flex justify-between items-start gap-2">
                <div>
                  <div className="font-semibold text-slate-800 flex items-center gap-2">
                    <span className="text-xs text-slate-400">#{i + 1}</span>
                    {lang === 'zh' ? r.card.nameZh : r.card.nameEn}
                    <Badge color={r.card.pointType === 'miles' ? 'indigo' : r.card.pointType === 'cashback' ? 'green' : 'slate'}>
                      {t(r.card.pointType, lang)}
                    </Badge>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">{r.card.bank} · {r.card.network}</div>
                </div>
                <div className="text-right text-xs text-slate-600">
                  <div className="flex items-center gap-1 justify-end"><CalendarDays className="w-3 h-3" /> {t('nextStatement', lang)}: {formatDate(r.closeDate, lang)}</div>
                  <div className="flex items-center gap-1 justify-end mt-0.5">{t('nextDue', lang)}: {formatDate(r.dueDate, lang)}</div>
                </div>
              </div>
              <div className="mt-2 flex flex-wrap gap-3 text-sm">
                <span className="flex items-center gap-1"><CalendarDays className="w-4 h-4 text-blue-500" /> {t('daysToPay', lang)}: <b>{r.daysToPay}</b>{t('days', lang)}</span>
                {r.miles > 0 && <span className="flex items-center gap-1"><Plane className="w-4 h-4 text-indigo-500" /> {t('estMiles', lang)}: <b>{r.miles.toFixed(0)}</b></span>}
                {r.cashback > 0 && <span className="flex items-center gap-1"><Coins className="w-4 h-4 text-emerald-500" /> {t('estCashback', lang)}: <b>{r.cashback.toFixed(0)} {r.card.currency}</b></span>}
                {r.points > 0 && <span>{t('points', lang)}: <b>{r.points.toFixed(0)}</b></span>}
              </div>
            </li>
          ))}
        </ol>
      )}
    </Card>
  );
}
