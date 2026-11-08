import assert from 'node:assert/strict';
import test from 'node:test';
import { DATA_DATE, daysUntilEnd, getProfile, getQuestions, money, profiles, rankOptions } from './index';
import type { Answers, Profile } from './types';

const keeper: Answers = { priority: 'keep', happiness: 'love', comfort: 'comfortable', changes: 'none', driving: 'same', ownership: 'own', downPayment: 'cash', repairs: 'no' };
const switcher: Answers = { priority: 'new', happiness: 'outgrown', comfort: 'comfortable', changes: 'family', driving: 'same', ownership: 'newer', downPayment: 'small', upgrade: 'larger' };
const copy = (id: string): Profile => JSON.parse(JSON.stringify(getProfile(id)));

test('all 20 synthetic profiles produce an explained, structurally valid decision', () => {
  assert.equal(profiles.length, 20);
  assert.equal(profiles.filter(p => p.account.contract_type === 'lease').length, 5);
  for (const profile of profiles) {
    for (const answers of [{}, keeper, switcher, { comfort: 'struggling' }]) {
      const result = rankOptions(profile, answers);
      assert.ok(result.recommended);
      assert.ok(['eligible', 'planning'].includes(result.recommended.status));
      assert.ok(result.recommended.reasons.length > 0);
      assert.ok(result.recommended.nextStep.checklist.length > 0);
      assert.ok(result.assumptions.some(s => s.includes('Synthetic')));
      assert.ok(result.allOptions.every(o => Number.isFinite(o.score)));
      assert.ok(result.alternatives.every(o => o.id !== result.recommended.id));
      if (profile.account.contract_type === 'loan') assert.ok(result.allOptions.every(o => !['BUYOUT', 'RETURN', 'RENEW'].includes(o.id)));
    }
  }
});

test('C017 buyout exactly matches source with value advantage separated from savings', () => {
  const decision = rankOptions(getProfile('C017'), keeper);
  assert.equal(decision.recommended.id, 'BUYOUT');
  assert.equal(decision.recommended.upfront, 28550);
  assert.equal(decision.valueAdvantage, 5250);
  assert.equal(decision.recommended.monthly, null);
  assert.equal(decision.recommended.totalDifference, null);
  assert.ok(decision.recommended.caveats.some(s => /Remaining lease payments/.test(s)));
  assert.ok(decision.recommended.caveats.some(s => /not guaranteed savings/.test(s)));
});

test('return can win when no replacement is needed; upgrade wins for changed needs', () => {
  const returned = rankOptions(getProfile('C006'), { priority: 'monthly', happiness: 'different', comfort: 'manageable', changes: 'relocating', driving: 'less', ownership: 'neutral', downPayment: 'none', replacement: 'no' });
  assert.equal(returned.recommended.id, 'RETURN');
  assert.ok(returned.recommended.caveats.some(s => /replacement transportation/.test(s)));
  assert.equal(rankOptions(getProfile('C006'), switcher).recommended.id, 'RENEW');
  assert.equal(rankOptions(getProfile('C006'), keeper).recommended.id, 'BUYOUT');
});

test('catalog offer windows use exact dates, and future options are planning only', () => {
  assert.equal(DATA_DATE, '2026-11-07');
  assert.equal(daysUntilEnd(getProfile('C017')), 61);
  assert.equal(daysUntilEnd(getProfile('C006')), 151);
  assert.equal(daysUntilEnd(getProfile('C013')), 181);
  assert.equal(daysUntilEnd(getProfile('C010')), 547);
  const buyout = rankOptions(getProfile('C006'), keeper).recommended;
  assert.equal(buyout.status, 'planning');
  assert.equal(buyout.nextStep.type, 'Follow-up');
  assert.equal(rankOptions(getProfile('C013'), switcher).allOptions.find(o => o.id === 'RENEW')?.status, 'planning');
  assert.equal(rankOptions(getProfile('C010'), {}).recommended.id, 'RELOCATE');
});

test('hardship from account or quiz blocks product pitches and offers human support', () => {
  for (const id of ['C002', 'C011', 'C014', 'C016']) {
    const result = rankOptions(getProfile(id), switcher);
    assert.equal(result.hardship, true);
    assert.equal(result.recommended.id, 'HUMAN');
    assert.ok(result.allOptions.every(o => !['RENEW', 'TRADE', 'BUYOUT', 'REFI', 'EXTEND', 'EXTRA100'].includes(o.id)));
  }
  const result = rankOptions(getProfile('C017'), { ...switcher, comfort: 'struggling' });
  assert.equal(result.recommended.id, 'HUMAN');
  assert.equal(result.noEligibleOffer, true);
  assert.ok(!getQuestions(getProfile('C017'), { ...switcher, comfort: 'struggling' }).some(q => q.id === 'upgrade'));
  assert.ok(rankOptions(getProfile('C011'), {}).recommended.nextStep.label.includes('call'));
});

test('two missed payments trigger support independently of vulnerable flag', () => {
  const profile = copy('C017');
  profile.customer.vulnerable_flag = 'N';
  profile.account.missed_payments_12m = 2;
  assert.equal(rankOptions(profile, switcher).recommended.id, 'HUMAN');
});

test('support indications stop the quiz before purchase questions', () => {
  assert.deepEqual(getQuestions(getProfile('C011'), {}).map(q => q.id), ['priority', 'happiness', 'comfort']);
  assert.deepEqual(getQuestions(getProfile('C017'), { comfort: 'struggling' }).map(q => q.id), ['priority', 'happiness', 'comfort']);
});

test('comfortable cash payoff uses account quote and claims no invented savings', () => {
  const profile = getProfile('C015');
  const decision = rankOptions(profile, keeper);
  assert.equal(decision.recommended.id, 'PAYOFF');
  assert.equal(decision.recommended.source, null);
  assert.equal(decision.recommended.upfront, profile.account.payoff_quote);
  assert.equal(decision.recommended.totalDifference, null);
  assert.ok(decision.recommended.caveats.some(s => s.includes('No interest-savings')));
  assert.notEqual(rankOptions(profile, { ...keeper, downPayment: 'none' }).recommended.id, 'PAYOFF');
  const needsBigger = rankOptions(getProfile('C007'), { ...switcher, ownership: 'own', downPayment: 'cash' });
  assert.equal(needsBigger.recommended.id, 'TRADE');
  assert.ok(needsBigger.allOptions.some(option => option.id === 'PAYOFF'));
});

test('no marketing consent removes new-vehicle offers and conditional upgrade question', () => {
  const profile = copy('C006');
  profile.customer.marketing_consent = 'N';
  const result = rankOptions(profile, switcher);
  assert.ok(!result.allOptions.some(o => o.id === 'RENEW' || o.id === 'TRADE'));
  assert.ok(!getQuestions(profile, switcher).some(q => q.id === 'upgrade'));
  assert.ok(result.insights.some(s => /marketing permission/.test(s)));
});

test('recall safety comes before finance even if customer wants an upgrade', () => {
  const decision = rankOptions(getProfile('C009'), switcher);
  assert.equal(decision.recall, true);
  assert.equal(decision.recommended.id, 'SERVICE');
  assert.equal(decision.recommended.metricValue, 'Confirm coverage');
});

test('C003 inconsistent loyalty figures are corrected to capped fee waiver', () => {
  const result = rankOptions(getProfile('C003'), switcher);
  const renewal = result.allOptions.find(o => o.id === 'RENEW')!;
  assert.equal(renewal.metricValue, '$1,500');
  assert.equal(renewal.totalDifference, null);
  assert.equal(renewal.monthly, null);
  assert.equal(renewal.upfront, null);
  assert.ok(renewal.caveats.some(s => s.includes('$2,270')));
  assert.ok(renewal.caveats.some(s => s.includes('conflicts')));
  assert.equal(getProfile('C003').options.find(o => o.option_id === 'RENEW')?.total_cost_vs_keep_as_is, -3770);
});

test('trade equity uses quoted payoff, not the smaller current balance', () => {
  const profile = getProfile('C004');
  const trade = rankOptions(profile, switcher).allOptions.find(o => o.id === 'TRADE')!;
  assert.equal(trade.metricValue, money(profile.vehicle.est_market_value_now - profile.account.payoff_quote));
  assert.ok(trade.caveats.some(s => /payoff_quote/.test(s)));
  const negative = rankOptions(getProfile('C012'), switcher).allOptions.find(o => o.id === 'TRADE')!;
  assert.equal(negative.status, 'review');
  assert.notEqual(rankOptions(getProfile('C012'), switcher).recommended.id, 'TRADE');
  const inconsistent = copy('C004');
  inconsistent.account.payoff_quote = inconsistent.vehicle.est_market_value_now + 1;
  assert.equal(rankOptions(inconsistent, switcher).allOptions.find(o => o.id === 'TRADE')?.status, 'review');
});

test('eligibility wins over wishes and term extension exposes added total cost', () => {
  const result = rankOptions(getProfile('C004'), { priority: 'monthly', comfort: 'expensive', tradeoff: 'yes' });
  assert.equal(result.recommended.id, 'EXTEND');
  assert.ok((result.recommended.totalDifference ?? 0) > 0);
  assert.ok(result.recommended.caveats.some(s => /not a total-cost saving/.test(s)));
  assert.equal(result.allOptions.find(o => o.id === 'REFI')?.status, 'unavailable');
  assert.equal(rankOptions(getProfile('C001'), { priority: 'total' }).recommended.id, 'REFI');
  const budgetFirst = rankOptions(getProfile('C019'), { priority: 'monthly', comfort: 'expensive', tradeoff: 'yes' });
  assert.equal(budgetFirst.recommended.id, 'REFI');
  assert.ok(budgetFirst.allOptions.find(o => o.id === 'EXTEND')!.monthly! < budgetFirst.recommended.monthly!);
  assert.ok(!result.allOptions.find(o => o.id === 'REFI')!.reasons.some(reason => reason.includes('refinancing eligible')));
});

test('all seven base topics, only relevant conditionals, and no account-value questions', () => {
  const baseIds = getQuestions(getProfile('C017'), {}).map(q => q.id);
  assert.deepEqual(baseIds, ['priority', 'happiness', 'comfort', 'changes', 'driving', 'ownership', 'downPayment']);
  const ids = getQuestions(getProfile('C003'), { ...keeper, priority: 'monthly', comfort: 'expensive', driving: 'less' }).map(q => q.id);
  assert.ok(ids.includes('repairs'));
  assert.ok(ids.includes('tradeoff'));
  assert.ok(ids.includes('mileage'));
  assert.ok(ids.includes('replacement'));
  assert.ok(!ids.includes('upgrade'));
  assert.ok(!getQuestions(getProfile('C017'), keeper).some(q => q.id === 'mileage'));
  assert.ok(getQuestions(getProfile('C006'), switcher).some(q => q.id === 'upgrade'));
});

test('stale conditional answers do not affect a revised quiz path', () => {
  const profile = getProfile('C006');
  const base = { priority: 'keep', happiness: 'love', comfort: 'comfortable', driving: 'same', changes: 'none', ownership: 'own' };
  assert.deepEqual(rankOptions(profile, base), rankOptions(profile, { ...base, upgrade: 'larger', replacement: 'no' }));
});

test('invalid answer values and unknown keys cannot change ranking', () => {
  const profile = getProfile('C017');
  assert.deepEqual(rankOptions(profile, {}), rankOptions(profile, { priority: 'bogus', happiness: 'bogus', comfort: 'bogus', admin: 'approve' }));
  const { upgrade: _upgrade, ...withoutUpgrade } = switcher;
  assert.deepEqual(rankOptions(profile, withoutUpgrade), rankOptions(profile, { ...withoutUpgrade, upgrade: 'made-up-powertrain' }));
});

test('missing return-fee values never become a fabricated zero-dollar waiver', () => {
  const profile = copy('C003');
  profile.options.find(option => option.option_id === 'RETURN')!.upfront_cost = null;
  const renewal = rankOptions(profile, switcher).allOptions.find(option => option.id === 'RENEW')!;
  assert.equal(renewal.metricValue, 'Quote needed');
  assert.ok(!renewal.summary.includes('$0'));
  assert.equal(renewal.totalDifference, null);
});

test('missing money is a quote request, and source data is never mutated', () => {
  assert.equal(money(null), 'Quote needed');
  assert.equal(money(undefined), 'Quote needed');
  assert.equal(money(Number.NaN), 'Quote needed');
  assert.equal(money(0), '$0');
  const before = JSON.stringify(profiles);
  profiles.forEach(profile => rankOptions(profile, switcher));
  assert.equal(JSON.stringify(profiles), before);
  assert.throws(() => getProfile('missing'), /Unknown demo customer/);
});
