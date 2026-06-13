import React, { useState } from 'react';
import {
  LayoutDashboard, Users, CreditCard as CreditCardIcon, Sparkles, Receipt, Gift, BellRing, Languages,
} from 'lucide-react';
import { useLocalState } from './hooks/useLocalState.js';
import { useFamilyState } from './hooks/useFamilyState.js';
import { t } from './i18n.js';
import { DashboardTab } from './components/DashboardTab.jsx';
import { MembersTab } from './components/MembersTab.jsx';
import { CardsTab } from './components/CardsTab.jsx';
import { OptimizerTab } from './components/OptimizerTab.jsx';
import { TransactionsTab } from './components/TransactionsTab.jsx';
import { PromotionsTab } from './components/PromotionsTab.jsx';
import { RemindersTab } from './components/RemindersTab.jsx';
import { AuthGate, UserBadge } from './components/AuthGate.jsx';

const SEED_MEMBERS = [
  { id: 'm-self', name: 'Self', role: 'primary' },
  { id: 'm-spouse', name: 'Spouse', role: 'spouse' },
];

const TABS = [
  { key: 'dashboard', icon: LayoutDashboard, labelKey: 'tabDashboard' },
  { key: 'members', icon: Users, labelKey: 'tabMembers' },
  { key: 'cards', icon: CreditCardIcon, labelKey: 'tabCards' },
  { key: 'optimizer', icon: Sparkles, labelKey: 'tabOptimizer' },
  { key: 'transactions', icon: Receipt, labelKey: 'tabTransactions' },
  { key: 'promotions', icon: Gift, labelKey: 'tabPromotions' },
  { key: 'reminders', icon: BellRing, labelKey: 'tabReminders' },
];

export default function App() {
  const [lang, setLang] = useLocalState('fcc:lang', 'zh');
  return (
    <AuthGate lang={lang}>
      {({ session, family, signOut }) => (
        <Shell lang={lang} setLang={setLang} session={session} family={family} signOut={signOut} />
      )}
    </AuthGate>
  );
}

function Shell({ lang, setLang, session, family, signOut }) {
  const [tab, setTab] = useState('dashboard');
  const [members, setMembers] = useFamilyState(family, 'members', SEED_MEMBERS);
  const [cards, setCards] = useFamilyState(family, 'cards', []);
  const [transactions, setTransactions] = useFamilyState(family, 'transactions', []);
  const [registeredPromos, setRegisteredPromos] = useFamilyState(family, 'registeredPromos', []);
  const [payMethods, setPayMethods] = useFamilyState(family, 'payMethods', {});

  const toggleLang = () => setLang(lang === 'zh' ? 'en' : 'zh');

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      <header className="bg-gradient-to-r from-slate-900 to-indigo-900 text-white">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-5 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold flex items-center gap-2">
              <CreditCardIcon className="w-6 h-6 text-blue-300" />
              {t('appTitle', lang)}
            </h1>
            <p className="text-xs md:text-sm text-slate-300 mt-1">{t('subtitle', lang)}</p>
          </div>
          <div className="flex items-center gap-3">
            <UserBadge lang={lang} session={session} family={family} signOut={signOut} />
            <button
              onClick={toggleLang}
              className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
              title={t('switchLanguage', lang)}
            >
              <Languages className="w-4 h-4" />
              {t('langToggle', lang)}
            </button>
          </div>
        </div>
      </header>

      <nav className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-2 md:px-8 overflow-x-auto">
          <ul className="flex gap-1 md:gap-2">
            {TABS.map((entry) => (
              <li key={entry.key}>
                <button
                  onClick={() => setTab(entry.key)}
                  className={`flex items-center gap-1.5 px-3 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                    tab === entry.key
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {React.createElement(entry.icon, { className: 'w-4 h-4' })}
                  {t(entry.labelKey, lang)}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto p-4 md:p-8">
        {tab === 'dashboard' && (
          <DashboardTab lang={lang} members={members} cards={cards} transactions={transactions} registeredPromos={registeredPromos} goto={setTab} />
        )}
        {tab === 'members' && (
          <MembersTab lang={lang} members={members} setMembers={setMembers} cards={cards} />
        )}
        {tab === 'cards' && (
          <CardsTab lang={lang} members={members} cards={cards} setCards={setCards} />
        )}
        {tab === 'optimizer' && (
          <OptimizerTab lang={lang} cards={cards} registeredPromos={registeredPromos} />
        )}
        {tab === 'transactions' && (
          <TransactionsTab lang={lang} members={members} cards={cards} transactions={transactions} setTransactions={setTransactions} registeredPromos={registeredPromos} />
        )}
        {tab === 'promotions' && (
          <PromotionsTab lang={lang} cards={cards} registeredPromos={registeredPromos} setRegisteredPromos={setRegisteredPromos} />
        )}
        {tab === 'reminders' && (
          <RemindersTab lang={lang} members={members} cards={cards} payMethods={payMethods} setPayMethods={setPayMethods} />
        )}
      </main>

      <footer className="max-w-6xl mx-auto px-4 md:px-8 py-6 text-xs text-slate-400 italic">
        {family
          ? (lang === 'zh' ? `家庭群組${family.name ? `「${family.name}」` : ''}已連線。分享邀請碼給家人即可加入。` : `Connected to family ${family.name ? `"${family.name}" ` : ''}— share the invite code with members.`)
          : t('footer', lang)}
      </footer>
    </div>
  );
}
