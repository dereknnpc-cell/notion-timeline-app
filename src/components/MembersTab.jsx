import React, { useState } from 'react';
import { UserPlus, Trash2, Users } from 'lucide-react';
import { Card, SectionTitle, TextField, SelectField, Button, Badge, Empty } from './UI.jsx';
import { t } from '../i18n.js';

export function MembersTab({ lang, members, setMembers, cards }) {
  const [draft, setDraft] = useState({ name: '', role: 'primary' });

  const roleOpts = [
    { value: 'primary', label: t('primary', lang) },
    { value: 'spouse', label: t('spouse', lang) },
    { value: 'child', label: t('child', lang) },
    { value: 'parent', label: t('parent', lang) },
  ];

  const onAdd = () => {
    if (!draft.name.trim()) return;
    setMembers([...members, { id: `m-${Date.now()}`, ...draft }]);
    setDraft({ name: '', role: 'primary' });
  };

  const onRemove = (id) => {
    if (cards.some(c => c.holderId === id)) {
      alert(lang === 'zh' ? '請先移除該成員的信用卡再刪除成員。' : "Remove that member's cards first.");
      return;
    }
    setMembers(members.filter(m => m.id !== id));
  };

  return (
    <Card className="p-5">
      <SectionTitle icon={Users} hint={t('membersHelp', lang)}>{t('tabMembers', lang)}</SectionTitle>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
        <TextField label={t('name', lang)} value={draft.name} onChange={v => setDraft({ ...draft, name: v })} />
        <SelectField label={t('role', lang)} value={draft.role} onChange={v => setDraft({ ...draft, role: v })} options={roleOpts} />
        <div className="flex items-end">
          <Button onClick={onAdd}><UserPlus className="w-4 h-4 inline mr-1" />{t('addMember', lang)}</Button>
        </div>
      </div>
      {members.length === 0 ? <Empty>{t('noData', lang)}</Empty> : (
        <ul className="divide-y divide-slate-100">
          {members.map(m => {
            const owned = cards.filter(c => c.holderId === m.id);
            return (
              <li key={m.id} className="py-3 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-slate-800">{m.name}</div>
                  <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                    <Badge color="indigo">{t(m.role, lang)}</Badge>
                    <span>{owned.length} {t('card', lang)}</span>
                  </div>
                </div>
                <Button variant="danger" onClick={() => onRemove(m.id)}><Trash2 className="w-4 h-4" /></Button>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}
