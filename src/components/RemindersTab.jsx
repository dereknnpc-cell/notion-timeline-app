import React from 'react';
import { BellRing } from 'lucide-react';
import { Card, SectionTitle, Badge, Empty, SelectField } from './UI.jsx';
import { CARDS } from '../data/banks.js';
import { t } from '../i18n.js';
import { nextClosingDate, nextDueDate, daysBetween, formatDate } from '../lib/dates.js';

export function RemindersTab({ lang, members, cards, payMethods, setPayMethods }) {
  const today = new Date();
  const rows = cards.map(c => {
    const tmpl = CARDS.find(x => x.id === c.templateId);
    if (!tmpl) return null;
    const close = nextClosingDate(today, tmpl.statementClosingDay);
    const due = nextDueDate(today, tmpl.statementClosingDay, tmpl.paymentDueOffsetDays);
    const owner = members.find(m => m.id === c.holderId);
    return { c, tmpl, close, due, daysToDue: daysBetween(today, due), owner };
  }).filter(Boolean).sort((a, b) => a.daysToDue - b.daysToDue);

  const methodOpts = [
    { value: 'auto', label: t('autoDebit', lang) },
    { value: 'transfer', label: t('manualTransfer', lang) },
    { value: 'counter', label: t('atCounter', lang) },
  ];

  return (
    <Card className="p-5">
      <SectionTitle icon={BellRing} hint={t('remindersHelp', lang)}>{t('tabReminders', lang)}</SectionTitle>
      {rows.length === 0 ? <Empty>{t('noData', lang)}</Empty> : (
        <ul className="space-y-2">
          {rows.map(({ c, tmpl, close, due, daysToDue, owner }) => {
            const overdue = daysToDue < 0;
            const urgent = !overdue && daysToDue <= 5;
            return (
              <li key={c.key} className={`p-3 rounded-lg border ${overdue ? 'bg-rose-50 border-rose-200' : urgent ? 'bg-amber-50 border-amber-200' : 'bg-white border-slate-200'}`}>
                <div className="flex justify-between items-center gap-3 flex-wrap">
                  <div>
                    <div className="font-semibold text-slate-800">
                      {lang === 'zh' ? tmpl.nameZh : tmpl.nameEn}
                      {c.isSupplementary && <Badge color="amber"> {t('supplementary', lang)}</Badge>}
                    </div>
                    <div className="text-[11px] text-slate-500">{owner?.name} · {tmpl.bank}</div>
                  </div>
                  <div className="text-right text-sm">
                    <div>{t('nextStatement', lang)}: {formatDate(close, lang)}</div>
                    <div className="font-medium">{t('nextDue', lang)}: {formatDate(due, lang)}</div>
                    <div className="text-xs mt-1">
                      {overdue
                        ? <Badge color="red">{t('overdue', lang)} {Math.abs(daysToDue)}{t('days', lang)}</Badge>
                        : <Badge color={urgent ? 'amber' : 'slate'}>{t('dueIn', lang)} {daysToDue}{t('days', lang)}</Badge>}
                    </div>
                  </div>
                  <SelectField className="w-40" label={t('payMethod', lang)}
                    value={payMethods[c.key] ?? 'auto'}
                    onChange={v => setPayMethods({ ...payMethods, [c.key]: v })}
                    options={methodOpts} />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}
