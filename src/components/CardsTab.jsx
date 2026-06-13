import React, { useState } from 'react';
import { CreditCard, Trash2, PlusCircle } from 'lucide-react';
import { Card, SectionTitle, TextField, SelectField, Button, Badge, Empty } from './UI.jsx';
import { CARDS } from '../data/banks.js';
import { t } from '../i18n.js';
import { nextDueDate, daysBetween, formatDate } from '../lib/dates.js';

const COUNTRY_LABEL = { TH: { zh: '泰國', en: 'Thailand' }, TW: { zh: '台灣', en: 'Taiwan' } };

export function CardsTab({ lang, members, cards, setCards }) {
  const [draft, setDraft] = useState({
    templateId: CARDS[0].id, holderId: '', isSupplementary: false, primaryCardKey: '', limit: 100000,
  });

  const memberOpts = members.map(m => ({ value: m.id, label: `${m.name} (${t(m.role, lang)})` }));
  const cardOpts = CARDS.map(c => ({
    value: c.id,
    label: `[${COUNTRY_LABEL[c.country][lang]}] ${lang === 'zh' ? c.nameZh : c.nameEn}`,
  }));
  const primaryCardOpts = cards.filter(c => !c.isSupplementary).map(c => {
    const tmpl = CARDS.find(x => x.id === c.templateId);
    const owner = members.find(m => m.id === c.holderId);
    return { value: c.key, label: `${lang === 'zh' ? tmpl?.nameZh : tmpl?.nameEn} · ${owner?.name ?? ''}` };
  });

  const onAdd = () => {
    if (!draft.holderId) { alert(lang === 'zh' ? '請選擇持卡人。' : 'Please pick a holder.'); return; }
    if (draft.isSupplementary && !draft.primaryCardKey) {
      alert(lang === 'zh' ? '副卡需指定正卡。' : 'Supplementary cards need a primary card.'); return;
    }
    setCards([...cards, { key: `c-${Date.now()}`, ...draft }]);
  };
  const remove = (key) => {
    const linked = cards.filter(c => c.isSupplementary && c.primaryCardKey === key);
    if (linked.length > 0) {
      const ok = confirm(lang === 'zh'
        ? `這張正卡有 ${linked.length} 張副卡，將一併刪除。確定？`
        : `${linked.length} supplementary card(s) are linked to this card and will also be removed. Continue?`);
      if (!ok) return;
    }
    setCards(cards.filter(c => c.key !== key && c.primaryCardKey !== key));
  };

  const today = new Date();

  return (
    <Card className="p-5">
      <SectionTitle icon={CreditCard} hint={t('cardsHelp', lang)}>{t('tabCards', lang)}</SectionTitle>
      <div className="grid grid-cols-1 md:grid-cols-6 gap-3 mb-5 items-end">
        <SelectField className="md:col-span-2" label={t('pickCard', lang)} value={draft.templateId}
          onChange={v => setDraft({ ...draft, templateId: v })} options={cardOpts} />
        <SelectField label={t('pickMember', lang)} value={draft.holderId}
          onChange={v => setDraft({ ...draft, holderId: v })}
          options={[{ value: '', label: '—' }, ...memberOpts]} />
        <TextField type="number" label={t('limit', lang)} value={draft.limit}
          onChange={v => setDraft({ ...draft, limit: v })} />
        <label className="flex items-center gap-2 text-sm pb-2">
          <input type="checkbox" checked={draft.isSupplementary}
            onChange={e => setDraft({ ...draft, isSupplementary: e.target.checked })} />
          {t('isSupplementary', lang)}
        </label>
        <Button onClick={onAdd}><PlusCircle className="w-4 h-4 inline mr-1" />{t('addCard', lang)}</Button>
        {draft.isSupplementary && (
          <SelectField className="md:col-span-3" label={t('pickPrimary', lang)} value={draft.primaryCardKey}
            onChange={v => setDraft({ ...draft, primaryCardKey: v })}
            options={[{ value: '', label: '—' }, ...primaryCardOpts]} />
        )}
      </div>
      {cards.length === 0 ? <Empty>{t('noData', lang)}</Empty> : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="text-left p-2">{t('card', lang)}</th>
                <th className="text-left p-2">{t('cardOwner', lang)}</th>
                <th className="text-left p-2">{t('country', lang)}/{t('bank', lang)}</th>
                <th className="text-right p-2">{t('limit', lang)}</th>
                <th className="text-center p-2">{t('closingDay', lang)}</th>
                <th className="text-left p-2">{t('nextDue', lang)}</th>
                <th className="text-left p-2">{t('pointType', lang)}</th>
                <th className="p-2"></th>
              </tr>
            </thead>
            <tbody>
              {cards.map(c => {
                const tmpl = CARDS.find(x => x.id === c.templateId);
                const owner = members.find(m => m.id === c.holderId);
                if (!tmpl) return null;
                const due = nextDueDate(today, tmpl.statementClosingDay, tmpl.paymentDueOffsetDays);
                const daysToDue = daysBetween(today, due);
                return (
                  <tr key={c.key} className="border-t border-slate-100">
                    <td className="p-2">
                      <div className="font-medium text-slate-800">
                        {lang === 'zh' ? tmpl.nameZh : tmpl.nameEn}
                        {c.isSupplementary && <Badge color="amber"> {t('supplementary', lang)}</Badge>}
                      </div>
                      <div className="text-[11px] text-slate-500">{tmpl.network} · {tmpl.currency}</div>
                    </td>
                    <td className="p-2">{owner?.name ?? '—'}</td>
                    <td className="p-2">{COUNTRY_LABEL[tmpl.country][lang]} · {tmpl.bank}</td>
                    <td className="p-2 text-right">{c.limit?.toLocaleString()} {tmpl.currency}</td>
                    <td className="p-2 text-center">{tmpl.statementClosingDay}</td>
                    <td className="p-2">
                      <div>{formatDate(due, lang)}</div>
                      <div className="text-[11px] text-slate-500">{t('daysUntilDue', lang)}: {daysToDue}{t('days', lang)}</div>
                    </td>
                    <td className="p-2">
                      <Badge color={tmpl.pointType === 'miles' ? 'indigo' : tmpl.pointType === 'cashback' ? 'green' : 'slate'}>
                        {t(tmpl.pointType, lang)}
                      </Badge>
                      {tmpl.airlineProgram ? <div className="text-[11px] text-slate-500 mt-0.5">{tmpl.airlineProgram}</div> : null}
                    </td>
                    <td className="p-2 text-right">
                      <button onClick={() => remove(c.key)} className="text-rose-500 hover:text-rose-700">
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
