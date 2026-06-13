const dict = {
  appTitle: { zh: '家庭信用卡管理中心', en: 'Family Credit Card Hub' },
  subtitle: { zh: '泰國與台灣銀行 ｜ 哩程最佳化 ｜ 還款提醒', en: 'Thai & Taiwan banks · Miles-first optimization · Payment reminders' },

  tabDashboard: { zh: '儀表板', en: 'Dashboard' },
  tabMembers: { zh: '持卡人', en: 'Members' },
  tabCards: { zh: '信用卡', en: 'Cards' },
  tabOptimizer: { zh: '刷卡建議', en: 'Best card' },
  tabTransactions: { zh: '交易紀錄', en: 'Transactions' },
  tabPromotions: { zh: '促銷活動', en: 'Promotions' },
  tabReminders: { zh: '還款提醒', en: 'Reminders' },

  name: { zh: '姓名', en: 'Name' },
  role: { zh: '身份', en: 'Role' },
  primary: { zh: '本人', en: 'Self' },
  spouse: { zh: '配偶', en: 'Spouse' },
  child: { zh: '子女', en: 'Child' },
  parent: { zh: '父母', en: 'Parent' },
  supplementary: { zh: '副卡', en: 'Supplementary' },
  amount: { zh: '金額', en: 'Amount' },
  category: { zh: '類別', en: 'Category' },
  date: { zh: '日期', en: 'Date' },
  bank: { zh: '銀行', en: 'Bank' },
  card: { zh: '信用卡', en: 'Card' },
  country: { zh: '國家', en: 'Country' },
  limit: { zh: '信用額度', en: 'Credit limit' },
  closingDay: { zh: '結帳日', en: 'Statement closing' },
  pointType: { zh: '回饋型態', en: 'Reward type' },
  miles: { zh: '哩程', en: 'Miles' },
  cashback: { zh: '現金回饋', en: 'Cashback' },
  points: { zh: '點數', en: 'Points' },

  catDining: { zh: '餐飲', en: 'Dining' },
  catOnline: { zh: '網購', en: 'Online' },
  catTravel: { zh: '旅遊', en: 'Travel' },
  catOverseas: { zh: '海外消費', en: 'Overseas' },
  catGas: { zh: '加油', en: 'Gas' },
  catSupermarket: { zh: '超市量販', en: 'Supermarket' },
  catTransport: { zh: '大眾運輸', en: 'Transport' },
  catStreaming: { zh: '訂閱服務', en: 'Streaming' },
  catMobile: { zh: '電信', en: 'Mobile' },
  catDefault: { zh: '一般消費', en: 'General' },

  upcomingPayments: { zh: '近期繳款', en: 'Upcoming payments' },
  todaysBestCard: { zh: '今日最佳刷卡', en: "Today's best card" },
  recentTx: { zh: '最近交易', en: 'Recent transactions' },
  totalCreditLimit: { zh: '家庭總額度', en: 'Family credit line' },
  registrationDue: { zh: '待登錄優惠', en: 'Promos awaiting registration' },
  noData: { zh: '尚無資料', en: 'No data yet' },

  optimizerHelp: { zh: '輸入消費日期、金額與類別，系統會推薦延後付款最久且哩程／回饋最佳的卡。', en: 'Enter purchase date, amount, and category for ranked card recommendations.' },
  daysToPay: { zh: '延後付款天數', en: 'Days to pay' },
  estReward: { zh: '預估回饋', en: 'Est. reward' },
  estMiles: { zh: '預估哩程', en: 'Est. miles' },
  estCashback: { zh: '預估現金回饋', en: 'Est. cashback' },
  prefer: { zh: '優先目標', en: 'Optimize for' },
  preferMiles: { zh: '哩程優先 (預設)', en: 'Miles first (default)' },
  preferCashback: { zh: '現金回饋優先', en: 'Cashback first' },
  preferDefer: { zh: '延後付款優先', en: 'Deferral first' },

  membersHelp: { zh: '建立家庭成員，副卡會與其正卡主關聯。', en: 'Add family members. Supplementary cards are linked to their primary holder.' },
  addMember: { zh: '新增成員', en: 'Add member' },

  cardsHelp: { zh: '從卡片資料庫挑選並指派給家庭成員。可標記副卡與額度。', en: 'Pick from the card database and assign to a family member.' },
  addCard: { zh: '指派信用卡', en: 'Assign a card' },
  pickCard: { zh: '選擇卡片', en: 'Pick card template' },
  pickMember: { zh: '選擇持卡人', en: 'Pick member' },
  pickPrimary: { zh: '選擇正卡 (副卡才需)', en: 'Pick primary card (for supplementary only)' },
  cardOwner: { zh: '持卡人', en: 'Holder' },
  isSupplementary: { zh: '副卡', en: 'Supplementary card' },
  nextStatement: { zh: '下次結帳', en: 'Next closing' },
  nextDue: { zh: '下次繳款', en: 'Next due' },
  daysUntilDue: { zh: '距繳款', en: 'Days to due' },

  txHelp: { zh: '記錄每筆消費，系統會自動計算累積回饋。', en: 'Log each purchase; the app aggregates rewards automatically.' },
  addTx: { zh: '新增交易', en: 'Add transaction' },
  merchant: { zh: '商家', en: 'Merchant' },
  thisMonthSpend: { zh: '本月消費', en: 'Spend this month' },

  promoHelp: { zh: '當前可用的銀行促銷與優惠。紅標：必須先登錄／報名才能享優惠。', en: 'Current bank promotions. Red badge = registration required.' },
  registered: { zh: '已登錄', en: 'Registered' },
  needsRegistration: { zh: '需登錄', en: 'Registration required' },
  registerNow: { zh: '前往登錄', en: 'Register now' },
  monthlyCap: { zh: '每月上限', en: 'Monthly cap' },
  validThru: { zh: '優惠期間', en: 'Valid' },

  remindersHelp: { zh: '依結帳日／繳款日自動計算的提醒；逾期會以紅色顯示。', en: 'Reminders derived from each card cycle.' },
  dueIn: { zh: '剩餘', en: 'In' },
  days: { zh: '天', en: ' days' },
  overdue: { zh: '已逾期', en: 'Overdue' },
  payMethod: { zh: '繳款方式', en: 'Payment method' },
  autoDebit: { zh: '自動扣繳', en: 'Auto debit' },
  manualTransfer: { zh: '手動轉帳', en: 'Manual transfer' },
  atCounter: { zh: '臨櫃', en: 'At counter' },

  langToggle: { zh: 'EN', en: '中文' },
  switchLanguage: { zh: 'Switch language', en: '切換語言' },
  footer: { zh: '雲端未啟用時資料只存於本機瀏覽器。', en: 'When cloud is disabled, data is stored only in this browser.' },
};

export function t(key, lang) {
  const e = dict[key];
  if (!e) return key;
  return e[lang] ?? e.en ?? key;
}

export const CATEGORY_LABEL = {
  dining: 'catDining', online: 'catOnline', travel: 'catTravel', overseas: 'catOverseas',
  gas: 'catGas', supermarket: 'catSupermarket', transport: 'catTransport',
  streaming: 'catStreaming', mobile: 'catMobile', default: 'catDefault',
};
