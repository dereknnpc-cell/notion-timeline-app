import { CARDS } from '../data/banks.js';
import { PROMOTIONS } from '../data/promotions.js';
import { nextClosingDate, nextDueDate, daysBetween } from './dates.js';

const MILE_VALUE_CASHBACK_PCT = 0.4;

function multiplier(card, category) {
  return card.categoryMultipliers?.[category] ?? card.defaultMultiplier ?? 1;
}

function activePromos(card, purchaseDate, registeredPromoIds) {
  const iso = purchaseDate.toISOString().slice(0, 10);
  return PROMOTIONS.filter(p =>
    p.cardId === card.id &&
    p.startDate <= iso &&
    p.endDate >= iso &&
    (!p.requiresRegistration || registeredPromoIds?.has?.(p.id))
  );
}

function effectiveCashbackPct(card, category, purchaseDate, registeredPromoIds) {
  const baseMul = multiplier(card, category);
  const basePct = (card.cashbackPct ?? 0) * baseMul;
  if (card.pointType === 'cashback') {
    activePromos(card, purchaseDate, registeredPromoIds);
    return basePct;
  }
  return 0;
}

export function scoreCard(card, opts) {
  const { amount, category, purchaseDate, registeredPromoIds = new Set() } = opts;
  const close = nextClosingDate(purchaseDate, card.statementClosingDay);
  const due = nextDueDate(purchaseDate, card.statementClosingDay, card.paymentDueOffsetDays);
  const daysToPay = daysBetween(purchaseDate, due);

  let miles = 0, cashback = 0, points = 0;
  const mul = multiplier(card, category);

  if (card.pointType === 'miles') {
    miles = (amount / card.pointBaseRate) * mul;
  } else if (card.pointType === 'cashback') {
    const pct = effectiveCashbackPct(card, category, purchaseDate, registeredPromoIds);
    cashback = amount * (pct / 100);
  } else {
    points = (amount / card.pointBaseRate) * mul;
  }

  const valueScore = cashback + miles * MILE_VALUE_CASHBACK_PCT + points * 0.1;
  return { cardId: card.id, card, closeDate: close, dueDate: due, daysToPay, miles, cashback, points, valueScore };
}

export function recommend({ amount, category, purchaseDate, ownedCardKeys, registeredPromoIds, prefer = 'miles' }) {
  const list = ownedCardKeys && ownedCardKeys.length
    ? CARDS.filter(c => ownedCardKeys.includes(c.id))
    : CARDS;
  const scored = list.map(c => scoreCard(c, { amount, category, purchaseDate, registeredPromoIds }));
  const sorters = {
    miles: (a, b) => (b.miles - a.miles) || (b.valueScore - a.valueScore) || (b.daysToPay - a.daysToPay),
    cashback: (a, b) => (b.cashback - a.cashback) || (b.valueScore - a.valueScore) || (b.daysToPay - a.daysToPay),
    defer: (a, b) => (b.daysToPay - a.daysToPay) || (b.valueScore - a.valueScore),
    value: (a, b) => (b.valueScore - a.valueScore) || (b.daysToPay - a.daysToPay),
  };
  return scored.sort(sorters[prefer] ?? sorters.miles).slice(0, 5);
}
