import React from 'react';
import { Gift, ExternalLink } from 'lucide-react';
import { Card, SectionTitle, Badge, Empty } from './UI.jsx';
import { CARDS } from '../data/banks.js';
import { PROMOTIONS } from '../data/promotions.js';
import { t } from '../i18n.js';
import { formatDate, parseISO } from '../lib/dates.js';

export function PromotionsTab({ lang, cards, registeredPromos, setRegisteredPromos }) {
  const ownedTemplateIds = new Set(cards.map(c => c.templateId));
  const sorted = [...PROMOTIONS].sort((a, b) => {
    const ao = ownedTemplateIds.has(a.cardId) ? 0 : 1;
    const bo = ownedTemplateIds.has(b.cardId) ? 0 : 1;
    if (ao !== bo) return ao - bo;
    return a.endDate.localeCompare(b.endDate);
  });
  const today = new Date().toISOString().slice(0, 10);
  const toggle = (id) => {
    const has = registeredPromos.includes(id);
    setRegisteredPromos(has ? registeredPromos.filter(x => x !== id) : [...registeredPromos, id]);
  };
  return (
    <Card className="p-5">
      <SectionTitle icon={Gift} hint={t('promoHelp', lang)}>{t('tabPromotions', lang)}</SectionTitle>
      {sorted.length === 0 ? <Empty>{t('noData', lang)}</Empty> : (
        <ul className="space-y-2">
          {sorted.map(p => {
            const tmpl = CARDS.find(c => c.id === p.cardId);
            const owned = ownedTemplateIds.has(p.cardId);
            const isExpired = p.endDate < today;
            const isRegistered = registeredPromos.includes(p.id);
            return (
              <li key={p.id} className={`p-3 rounded-lg border ${owned ? 'border-blue-200 bg-blue-50/50' : 'border-slate-200 bg-white'} ${isExpired ? 'opacity-60' : ''}`}>
                <div className="flex justify-between items-start gap-3">
                  <div className="flex-1">
                    <div className="font-semibold text-slate-800 flex items-center gap-2 flex-wrap">
                      {lang === 'zh' ? p.titleZh : p.titleEn}
                      {owned && <Badge color="blue">{lang === 'zh' ? '已持有' : 'You own this card'}</Badge>}
                      {p.requiresRegistration && (
                        <Badge color={isRegistered ? 'green' : 'red'}>
                          {isRegistered ? t('registered', lang) : t('needsRegistration', lang)}
                        </Badge>
                      )}
                      {isExpired && <Badge color="slate">{lang === 'zh' ? '已過期' : 'Expired'}</Badge>}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      {tmpl ? `${tmpl.bank} · ${lang === 'zh' ? tmpl.nameZh : tmpl.nameEn}` : ''}
                    </div>
                    <p className="text-sm text-slate-600 mt-1">{lang === 'zh' ? p.descZh : p.descEn}</p>
                    <div className="text-xs text-slate-500 mt-1 flex flex-wrap gap-3">
                      <span>{t('validThru', lang)}: {formatDate(parseISO(p.startDate), lang)} – {formatDate(parseISO(p.endDate), lang)}</span>
                      {p.monthlyCap ? <span>{t('monthlyCap', lang)}: {p.monthlyCap.toLocaleString()} {p.currency}</span> : null}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {p.requiresRegistration && (
                      <label className="flex items-center gap-1 text-xs cursor-pointer">
                        <input type="checkbox" checked={isRegistered} onChange={() => toggle(p.id)} />
                        {t('registered', lang)}
                      </label>
                    )}
                    {p.registrationUrl && (
                      <a href={p.registrationUrl} target="_blank" rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                        {t('registerNow', lang)} <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}
