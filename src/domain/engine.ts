import rawProfiles from '../data/profiles.json';
import type { Answers, Decision, EligibilityStatus, NextStep, Profile, RankedOption, Scenario } from './types';
import { getQuestions } from './questions';

export const DATA_DATE = '2026-11-07';
export const profiles = rawProfiles as Profile[];
const marketingIds = new Set(['RENEW', 'TRADE']);
const productIds = new Set(['REFI', 'EXTEND', 'EXTRA100', 'BUYOUT', 'RENEW', 'TRADE', 'EXTENDLEASE']);
const titles: Record<string, string> = {
  RETURN: 'Return your lease', BUYOUT: 'Buy out your lease', RENEW: 'Explore a new Toyota',
  KEEP: 'Keep your Toyota', REFI: 'Refinance your loan', EXTEND: 'Explore a longer loan term',
  EXTRA100: 'Pay a little extra each month', DUEDATE: 'Align your payment with payday',
  DEFER: 'Review payment support', TRADE: 'Explore a Toyota upgrade', SERVICE: 'Take care of your Toyota',
  RELOCATE: 'Take your Toyota with you', EXTENDLEASE: 'Give yourself more time', EARLYEND: 'Review an early lease exit',
};

export function money(value: number | null | undefined): string {
  return value == null || !Number.isFinite(value) ? 'Quote needed' : new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
}

export function getProfile(id: string): Profile {
  const profile = profiles.find(p => p.customer.customer_id === id);
  if (!profile) throw new Error(`Unknown demo customer: ${id}`);
  return profile;
}

export function daysUntilEnd(profile: Profile): number {
  return Math.ceil((Date.parse(`${profile.account.contract_end}T00:00:00Z`) - Date.parse(`${DATA_DATE}T00:00:00Z`)) / 86_400_000);
}

export function isHardship(profile: Profile, answers: Answers = {}): boolean {
  return profile.customer.vulnerable_flag === 'Y' || profile.account.missed_payments_12m >= 2 || answers.comfort === 'struggling';
}

function nextStep(id: string, profile: Profile, status: EligibilityStatus): NextStep {
  const phone = profile.customer.preferred_channel === 'Phone';
  const steps: Record<string, NextStep> = {
    BUYOUT: { type: 'Eligible offer', label: 'Build my buyout checklist', description: 'Request an itemized buyout quote and compare financing before you commit.', checklist: ['Confirm the lease-end purchase price and included buyout fee.', 'Get taxes, registration, all fees, and any remaining payments in writing.', 'Compare cash purchase with APR, term, total interest, and monthly payment.', 'Budget for maintenance, insurance, repairs, and future resale value.'] },
    RETURN: { type: 'Self-service', label: 'Prepare my return checklist', description: 'Plan your lease-end inspection and return with your servicing team.', checklist: ['Confirm the contract end date and remaining payments.', 'Ask for an inspection and estimated wear charges.', 'Confirm mileage, disposition fees, and return location.', 'Arrange replacement transport if you will still need a vehicle.'] },
    RENEW: { type: 'Eligible offer', label: 'Prepare my upgrade comparison', description: 'Ask for a written new-vehicle quote, then compare it with keeping your Toyota.', checklist: ['Choose a vehicle that fits your needs.', 'Request the new monthly payment, term, down payment, APR or money factor, and total cost.', 'Confirm any loyalty waiver and its $1,500 synthetic cap.', 'Compare taxes, fees, insurance, mileage limits, and your current lease obligations.'] },
    REFI: { type: 'Eligible offer', label: 'Prepare my refinance questions', description: 'Confirm a written rate and full loan cost before applying.', checklist: ['Confirm eligibility and any credit inquiry.', 'Compare APR, fees, remaining term, monthly payment, and total interest.', 'Check that the new payment fits your budget.', 'Verify the written lender quote; the dataset rate is synthetic.'] },
    TRADE: { type: 'Eligible offer', label: 'Prepare my trade-in comparison', description: 'Get a dealer appraisal and current payoff before considering a new contract.', checklist: ['Request a current payoff quote and written vehicle appraisal.', 'Compare the new vehicle price, APR, term, down payment, fees, and total cost.', 'Account for any negative equity separately.', 'Keep your current Toyota as an option until the full comparison is clear.'] },
    SERVICE: { type: 'Self-service', label: 'Prepare my service checklist', description: 'Contact your Toyota dealer to confirm service and any recall work.', checklist: ['Confirm any open recall against the vehicle identification number.', 'Ask which work is covered by warranty or Toyota Care.', 'Confirm any out-of-pocket service cost.', 'Choose a dealer appointment; this demo does not book one.'] },
    RELOCATE: { type: 'Follow-up', label: 'Prepare my moving checklist', description: 'A servicing specialist can confirm the out-of-state paperwork.', checklist: ['Confirm whether your current lease permits the move.', 'Ask about registration, taxes, insurance, and any fees in the destination state.', 'Keep the existing payment schedule unless the servicer confirms a change.', 'Compare an itemized early-termination quote only if you still want to exit.'] },
    DUEDATE: { type: 'Self-service', label: 'Review my due-date checklist', description: 'Review a due-date change with your servicing team or account portal.', checklist: [`Your recorded payday is day ${profile.customer.payday_day}; confirm that it is still correct.`, 'Check the once-per-12-month change rule.', 'Confirm the first changed payment date and any daily interest adjustment.', 'Keep paying on the existing schedule until the change is confirmed.'] },
    KEEP: { type: 'Self-service', label: 'Make my keep-it plan', description: 'Review your current payment schedule and plan for ownership.', checklist: ['Keep following your existing payment schedule.', 'Review optional autopay if it fits your cash flow.', 'Request an official payoff quote if you want to finish early.', 'Plan for service, insurance, and maintenance costs.'] },
    PAYOFF: { type: 'Self-service', label: 'Prepare my payoff checklist', description: 'Request an official payoff quote and title instructions before paying off the loan.', checklist: ['Confirm the payoff amount and the date through which it is valid.', 'Keep enough cash for your other needs and an emergency reserve.', 'Confirm payment instructions directly with your servicer.', 'Ask when the lien will be released and how you will receive the title.'] },
    EXTRA100: { type: 'Self-service', label: 'Review my extra-payment plan', description: 'Confirm that an extra payment is affordable and will reduce principal.', checklist: ['Check your emergency savings and monthly budget.', 'Confirm the extra $100 is applied to principal.', 'Verify there is no prepayment penalty.', 'Review the revised payoff date and actual interest savings.'] },
  };
  const step = steps[id] ?? { type: 'Follow-up' as const, label: 'Prepare my specialist questions', description: 'A specialist can review eligibility and confirm the full cost.', checklist: ['Ask for written eligibility confirmation.', 'Compare the payment change with any added total interest or fees.', 'Confirm all dates before changing your current payment plan.'] };
  if (status === 'planning') return { ...step, type: 'Follow-up', label: 'Plan for the eligibility window', description: 'This is a future lease-end planning option. The immediate offer window is not open in this dataset.' };
  if (status === 'review' || status === 'unavailable') return { ...step, type: 'Follow-up', description: 'This option is not confirmed as eligible. Ask your servicing team to review it.' };
  if (phone) return { ...step, label: 'Prepare for a specialist call', type: 'Follow-up' };
  return step;
}

function eligibility(source: Scenario, profile: Profile): { status: EligibilityStatus; caveats: string[] } {
  const caveats: string[] = [];
  let status: EligibilityStatus = source.eligibility === 'Y' ? 'eligible' : source.eligibility.startsWith('N') ? 'unavailable' : 'review';
  if (status === 'unavailable') caveats.push(`Dataset eligibility: ${source.eligibility}.`);
  if (status === 'review') caveats.push(`Specialist review required: ${source.eligibility}.`);
  if (source.option_id === 'TRADE' && status === 'eligible' && profile.account.payoff_quote > profile.vehicle.est_market_value_now) {
    status = 'review';
    caveats.push('The listed payoff exceeds estimated vehicle value. The balance-based source eligibility does not confirm that this payoff gap can be covered.');
  }
  const days = daysUntilEnd(profile);
  if (source.option_id === 'BUYOUT' && days > 120 && status === 'eligible') {
    status = 'planning'; caveats.push(`Lease-end purchase planning only: ${days} days remain. The catalog's buyout financing window starts within 120 days of lease end.`);
  }
  if (source.option_id === 'RENEW' && status === 'eligible') {
    if (!['A', 'B'].includes(profile.customer.credit_tier_now)) {
      status = 'unavailable'; caveats.push('The synthetic renewal catalog requires credit tier A or B.');
    } else if (days > 180) {
      status = 'planning'; caveats.push(`${days} days remain. The catalog's renewal window starts within 180 days of lease end.`);
    }
  }
  if (['RETURN', 'EXTENDLEASE'].includes(source.option_id) && days > 180 && status === 'eligible') {
    status = 'planning'; caveats.push('A future lease-end plan, not permission to end the current lease early.');
  }
  return { status, caveats };
}

function mapOption(source: Scenario, profile: Profile): RankedOption {
  const id = source.option_id;
  const { status, caveats } = eligibility(source, profile);
  let summary = source.plain_language_summary;
  let tradeoff = source.tradeoff;
  let upfront = source.upfront_cost;
  let totalDifference = profile.account.contract_type === 'loan' ? source.total_cost_vs_keep_as_is : null;
  let metricLabel = source.new_monthly_payment == null ? 'Known upfront estimate' : 'Estimated monthly payment';
  let metricValue = money(source.new_monthly_payment ?? source.upfront_cost);
  if (id === 'BUYOUT') {
    summary = `The listed lease-end buyout is ${money(source.upfront_cost)}. Estimated vehicle value is ${money(profile.vehicle.est_market_value_now)}. Compare taxes, fees, financing, and future ownership costs before deciding.`;
    tradeoff = 'You keep the vehicle and take on maintenance, repairs, insurance, and resale risk. Financing needs a separate quote.';
    metricLabel = 'Lease-end buyout'; metricValue = money(source.upfront_cost);
    caveats.push('Includes the listed $350 buyout fee. Taxes, registration, financing, and ownership costs are extra.', 'Remaining lease payments are separate. The value advantage is not guaranteed savings or cash back.');
  }
  if (id === 'RETURN') {
    metricLabel = 'Estimated return fees'; metricValue = money(source.upfront_cost);
    caveats.push('These are lease-end fees only. Remaining payments, wear charges, and replacement transportation are excluded.', 'Returning before the contract end date needs a separate early-termination review.');
    tradeoff = 'You no longer have this vehicle. Include the cost of another vehicle or transportation if needed.';
  }
  if (id === 'RENEW') {
    const returnFees = profile.options.find(o => o.option_id === 'RETURN')?.upfront_cost;
    const waiver = returnFees == null ? null : Math.min(returnFees, 1500);
    metricLabel = 'Potential fee waiver'; metricValue = money(waiver);
    upfront = null; totalDifference = null;
    summary = waiver == null
      ? 'The synthetic loyalty rule caps waived fees at $1,500, but the applicable waiver needs confirmation. The new Toyota’s payment and full cost need a quote.'
      : `The synthetic loyalty rule may waive up to ${money(waiver)} of existing lease-end fees, capped at $1,500. The new Toyota's payment and full cost need a quote.`;
    caveats.push('The dataset does not include a new vehicle price, down payment, payment, or total new-contract cost.', 'A fee waiver is not the total saving from starting a new lease.');
    if (returnFees != null && waiver != null && returnFees > 1500) caveats.push(`The source summary conflicts with its $1,500 cap. Applying that cap leaves about ${money(returnFees - waiver)} of estimated return fees; confirm the actual rule.`);
    tradeoff = 'A new vehicle starts a new contract. Check the full cost and mileage limits before committing.';
  }
  if (id === 'TRADE') {
    const equity = profile.vehicle.est_market_value_now - profile.account.payoff_quote;
    upfront = null; totalDifference = null; metricLabel = equity >= 0 ? 'Estimated value above payoff' : 'Estimated payoff gap'; metricValue = money(Math.abs(equity));
    summary = `Estimated vehicle value of ${money(profile.vehicle.est_market_value_now)} minus the listed payoff quote of ${money(profile.account.payoff_quote)} is ${money(equity)}. A dealer appraisal and current payoff decide the final amount.`;
    caveats.push('Calculated using payoff_quote, not the balance-based est_equity field.', 'A new vehicle price, payment, taxes, fees, and financing terms are not supplied.');
    if (equity < 0) caveats.push('You would need to cover the payoff gap; rolling it into another loan can increase risk and total cost.');
  }
  if (id === 'EXTEND') caveats.push(`This lower payment adds approximately ${money(source.total_cost_vs_keep_as_is)} in total interest in the dataset. It is not a total-cost saving.`);
  if (id === 'REFI') caveats.push('Synthetic rate and savings; final approval, credit inquiry, APR, and fees require confirmation.');
  if (id === 'EARLYEND') caveats.push('The synthetic early-termination formula is not an official payoff or termination quote.');
  if (id === 'SERVICE') { metricLabel = 'Service cost'; metricValue = 'Confirm coverage'; upfront = null; caveats.push('The $0 scenario placeholder is not a quote for all service. Confirm warranty, Toyota Care, and any out-of-pocket work.'); }
  if (id === 'RELOCATE') caveats.push('The scenario shows no contract change fee, but destination taxes, registration, insurance, and other moving costs need confirmation.');
  if (source.new_monthly_payment == null && ['BUYOUT', 'RENEW', 'TRADE'].includes(id)) caveats.push('Monthly payment: quote needed. A missing value does not mean $0.');
  return { id, title: titles[id] ?? source.option_name, source, score: 0, reasons: [], status, caveats, summary, tradeoff, upfront, monthly: source.new_monthly_payment, totalDifference, metricLabel, metricValue, nextStep: nextStep(id, profile, status) };
}

function scoreOption(option: RankedOption, profile: Profile, answers: Answers): RankedOption {
  const reasons: string[] = [];
  let score = 0;
  const add = (points: number, reason?: string) => { score += points; if (reason && points > 0) reasons.push(reason); };
  const wantsKeep = answers.priority === 'keep' || answers.ownership === 'own';
  const loves = answers.happiness === 'love';
  const wantsNew = answers.priority === 'new' || answers.ownership === 'newer';
  const changed = ['family', 'features'].includes(answers.changes) || ['outgrown', 'different'].includes(answers.happiness);
  const tight = ['expensive', 'struggling'].includes(answers.comfort) || answers.priority === 'monthly';
  const knownSituation = profile.situation.customer_says.toLowerCase();
  const projected = profile.vehicle.odometer_now + profile.vehicle.annual_miles_est * profile.account.months_remaining / 12;
  const excess = projected > (profile.account.mileage_allowance_total ?? Infinity);
  switch (option.id) {
    case 'BUYOUT':
      add(25, 'Buying preserves the option to keep your current Toyota.');
      if (wantsKeep) add(36, 'You want to keep your Toyota or own it long-term.');
      if (loves) add(20, 'You are happy with the vehicle you already know.');
      if (!answers.priority && /want to keep|plan to keep/.test(knownSituation)) add(25, 'Your account situation says you want to keep this Toyota.');
      if ((option.upfront ?? Infinity) < profile.vehicle.est_market_value_now) add(8, 'Estimated market value is above the listed buyout, before other costs.');
      if (excess && answers.mileage !== 'no') add(12, 'Buying avoids the projected lease-return mileage charge.');
      if (answers.driving === 'more') add(7, 'Ownership avoids a new lease mileage limit.');
      if (answers.downPayment === 'cash') add(10, 'You said the cash needed for a buyout is comfortable.');
      if (answers.downPayment === 'finance' || answers.downPayment === 'none') option.caveats.push('Affordability cannot be confirmed until financing terms and your comfortable budget are known.');
      if (answers.repairs === 'yes') add(-14);
      if (wantsNew || changed) add(-27);
      if (answers.replacement === 'no') add(-60);
      break;
    case 'RETURN':
      add(14, 'Returning is a straightforward way to finish the lease at its scheduled end.');
      if (answers.replacement === 'no') add(75, 'You said you will not need a replacement vehicle.');
      if (answers.driving === 'less') add(9, 'You expect to drive less.');
      if (answers.happiness === 'different' || answers.happiness === 'outgrown') add(10, 'Your current Toyota no longer feels like the right fit.');
      if (wantsKeep || loves) add(-18);
      if (excess) add(-12);
      if (answers.replacement === 'yes') option.caveats.push('Include your replacement vehicle budget before treating return fees as the cheapest path.');
      break;
    case 'RENEW':
    case 'TRADE':
      add(10, 'A different Toyota could fit a new stage of your life.');
      if (wantsNew) add(37, 'You prefer something new or regularly driving newer models.');
      if (changed) add(28, 'Your current vehicle no longer fully fits your needs.');
      if (answers.upgrade && answers.upgrade !== 'unsure') add(10, 'You identified a concrete feature or vehicle change to investigate.');
      if (answers.repairs === 'yes') add(6, 'You value predictable ownership and repair costs; compare actual warranty coverage.');
      if (wantsKeep || loves) add(-22);
      if (tight) add(-15);
      if (answers.replacement === 'no') add(-70);
      if (profile.account.months_remaining < 12 && profile.account.contract_type === 'loan') add(-20);
      break;
    case 'KEEP':
      add(35, 'Keeping your current contract avoids starting a new vehicle commitment.');
      if (wantsKeep || loves) add(12, 'You still see a future with your current Toyota.');
      if (profile.account.months_remaining < 12) add(35, `Only ${profile.account.months_remaining} payments remain on your current loan.`);
      if (changed || wantsNew) add(-15);
      break;
    case 'REFI':
      add(43, option.status === 'eligible' ? 'The dataset marks refinancing eligible at a lower rate.' : undefined);
      if ((option.totalDifference ?? 0) < 0) add(12, `It could reduce total remaining interest by ${money(-(option.totalDifference ?? 0))}, subject to a final quote.`);
      if (tight || answers.priority === 'total') add(18, 'Your priority is cost, and this compares monthly payment with total interest.');
      if (wantsNew || changed) add(-12);
      break;
    case 'EXTEND':
      add(5);
      if (tight && answers.tradeoff === 'yes') add(63, 'You explicitly prefer monthly breathing room and accept higher total cost.');
      if (answers.tradeoff === 'no' || answers.priority === 'total') add(-30);
      break;
    case 'EXTRA100':
      add(12);
      if (answers.priority === 'total' && answers.comfort === 'comfortable') add(45, 'Your budget is comfortable and your priority is reducing total interest.');
      if (wantsKeep) add(8, 'Extra principal can move you toward ownership sooner.');
      if (tight || answers.downPayment === 'none') add(-40);
      break;
    case 'DUEDATE':
      add(12);
      if (/overdraft|due the 1st|payday/.test(knownSituation)) add(80, 'Your recorded situation is a mismatch between payday and the payment due date.');
      break;
    case 'RELOCATE':
      add(15);
      if (answers.changes === 'relocating' || /moving|relocat/.test(knownSituation)) add(85, 'Keeping the existing lease while relocating may avoid an early termination.');
      if (answers.replacement === 'no') add(-45);
      break;
    case 'EXTENDLEASE':
      add(5);
      if (answers.ownership === 'neutral' && answers.driving === 'unsure') add(10, 'An extension could give you decision time, subject to its added cost.');
      break;
    case 'SERVICE': add(profile.vehicle.open_recall === 'Y' ? 1000 : 2, profile.vehicle.open_recall === 'Y' ? 'Your account shows an open recall, so service comes first.' : undefined); break;
    case 'EARLYEND': add(-30); break;
    case 'DEFER': add(-20); break;
  }
  if (option.status === 'unavailable') score = -10000;
  if (option.status === 'review') score = Math.min(score, -100);
  if (option.status === 'planning') option.caveats.push('This recommendation is a plan for a future window, not an offer available today.');
  return { ...option, score, reasons: reasons.length ? reasons : [option.status === 'unavailable' ? 'The current dataset does not confirm eligibility.' : 'Keep this alternative in the comparison until its full costs are confirmed.'] };
}

function humanOption(profile: Profile, noOffer = false): RankedOption {
  const phone = profile.customer.preferred_channel === 'Phone';
  return {
    id: 'HUMAN', title: profile.account.missed_payments_12m > 0 ? 'Find a little breathing room' : 'Talk through your next move', source: null, score: 2000, status: 'eligible',
    summary: 'A servicing specialist can help review your situation and available support before you make a vehicle or financing decision.',
    reasons: ['Your situation deserves a person who can confirm support and explain the choices.', 'A new vehicle or larger commitment is not the next step here.'],
    caveats: ['Support, deferral, and payment changes require review; none is approved or scheduled by this demo.', ...(noOffer ? ['No suitable eligible product offer is being recommended.'] : [])],
    tradeoff: 'A specialist must review the account. Deferring or extending payments may add interest or change the end date.',
    upfront: null, monthly: null, totalDifference: null, metricLabel: 'Your next step', metricValue: 'Personal support',
    nextStep: { type: 'Follow-up', label: phone ? 'Prepare for a specialist call' : 'Prepare my support summary', description: `Prepare a concise account summary to discuss with your servicing team${phone ? ' by phone, your recorded preference' : ''}. This demo does not contact anyone.`, checklist: ['Explain what changed and the payment amount you can comfortably manage.', 'Ask which assistance options are available and what each costs over time.', 'Confirm whether a due-date change or temporary support would help.', 'Keep a written record of any confirmed agreement.'] },
  };
}

function payoffOption(profile: Profile, answers: Answers): RankedOption {
  const fitsCurrentNeeds = answers.priority !== 'new' && answers.ownership !== 'newer' && !['outgrown', 'different'].includes(answers.happiness) && !['family', 'features'].includes(answers.changes);
  const appropriate = fitsCurrentNeeds && answers.downPayment === 'cash' && answers.comfort === 'comfortable' && (answers.ownership === 'own' || answers.priority === 'total');
  return {
    id: 'PAYOFF', title: 'Explore paying off your Toyota', source: null, score: appropriate ? 95 : 8, status: 'eligible',
    summary: `Your account lists a payoff estimate of ${money(profile.account.payoff_quote)}. Request a current, dated quote before paying off the loan.`,
    reasons: appropriate ? ['You said you can comfortably cover the payoff and want long-term ownership or lower total cost.', 'Paying off the loan could end the scheduled loan payment, while ownership costs continue.'] : ['A dated payoff quote helps you understand the path to owning your Toyota outright.'],
    caveats: ['Derived from account.payoff_quote, not a precomputed option scenario.', 'This account estimate is not an official current payoff quote. Daily interest and fees can change it.', 'No interest-savings amount is supplied for immediate payoff; none is assumed.', 'Paying off the loan uses cash; retain an emergency reserve and budget for ownership costs.'],
    tradeoff: 'You use cash now. Insurance, maintenance, repairs, and other vehicle costs continue after the loan is paid.',
    upfront: profile.account.payoff_quote, monthly: null, totalDifference: null,
    metricLabel: 'Account payoff estimate', metricValue: money(profile.account.payoff_quote), nextStep: nextStep('PAYOFF', profile, 'eligible'),
  };
}

/** Eligibility gates run before preference scoring; scores are fit heuristics, not probabilities. */
export function rankOptions(profile: Profile, answers: Answers = {}): Decision {
  const activeQuestions = new Map(getQuestions(profile, answers).map(question => [question.id, question]));
  answers = Object.fromEntries(Object.entries(answers).filter(([id, value]) => activeQuestions.get(id)?.options.some(option => option.value === value)));
  const hardship = isHardship(profile, answers);
  const recall = profile.vehicle.open_recall === 'Y';
  const lease = profile.account.contract_type === 'lease';
  const projectedMiles = lease ? Math.round(profile.vehicle.odometer_now + profile.vehicle.annual_miles_est * profile.account.months_remaining / 12) : null;
  const buyout = profile.options.find(o => o.option_id === 'BUYOUT')?.upfront_cost;
  const valueAdvantage = buyout == null ? null : profile.vehicle.est_market_value_now - buyout;
  const filtered = profile.options.filter(o => {
    if (profile.customer.marketing_consent !== 'Y' && marketingIds.has(o.option_id)) return false;
    if (hardship && productIds.has(o.option_id)) return false;
    return true;
  });
  const allOptions = filtered.map(o => scoreOption(mapOption(o, profile), profile, answers));
  if (!lease && !hardship) allOptions.push(payoffOption(profile, answers));
  allOptions.sort((a, b) => b.score - a.score || a.id.localeCompare(b.id));
  const noEligibleOffer = hardship || !allOptions.some(o => o.status === 'eligible' && ['REFI', 'EXTEND', 'BUYOUT', 'RENEW', 'TRADE'].includes(o.id));
  if (hardship) allOptions.unshift(humanOption(profile, noEligibleOffer));
  if (!allOptions.some(o => ['eligible', 'planning'].includes(o.status))) allOptions.unshift(humanOption(profile, true));
  if (recall) {
    const service = allOptions.find(o => o.id === 'SERVICE');
    if (service) { service.score = 3000; service.title = 'Put your Toyota’s safety first'; allOptions.sort((a, b) => b.score - a.score); }
  }
  const recommended = allOptions.find(o => o.status === 'eligible' || o.status === 'planning')!;
  const alternatives = allOptions.filter(o => o.id !== recommended.id && o.status !== 'unavailable').slice(0, lease ? 3 : 2);
  const insights: string[] = [];
  if (lease && projectedMiles != null) insights.push(`Account-based projected lease-end mileage: ${projectedMiles.toLocaleString('en-US')} miles, against ${profile.account.mileage_allowance_total?.toLocaleString('en-US')} allowed.`);
  if (lease && valueAdvantage != null) insights.push(`Estimated market value minus the listed lease-end buyout: ${money(valueAdvantage)}. This is a value comparison, not total-cost savings.`);
  if (answers.driving === 'more' || answers.driving === 'less') insights.push('Your future driving preference may change the projection. No invented mileage multiplier has been applied; ask for an updated estimate.');
  if (profile.account.est_equity < 0 && !lease) insights.push(`The vehicle's estimated value is ${money(profile.account.payoff_quote - profile.vehicle.est_market_value_now)} below the listed payoff quote. Verify the gap before selling or trading.`);
  if (profile.customer.marketing_consent !== 'Y') insights.push('New-vehicle offers are hidden because marketing permission is not enabled.');
  if (hardship) insights.push('Human support comes first. Upgrade and financing product suggestions have been removed.');
  if (noEligibleOffer) insights.push('No suitable eligible product offer is being recommended now. A specialist can confirm whether eligibility changes later.');
  if (recall) insights.push('Your account shows an open recall. Confirm the recall and service needs with a Toyota dealer before the financial next step.');
  if (answers.priority === 'total' && lease) insights.push('The data does not contain comparable full ownership and replacement-vehicle costs, so it cannot establish which path has the lowest total cost.');
  const assumptions = [
    'Synthetic dataset estimates, not actual Toyota financing or a verified offer.',
    `Account snapshot: ${DATA_DATE}. Eligibility windows are measured from this dataset date.`,
    'The recommendation ranks fit with your preferences; it is not a guarantee, approval, or probability of success.',
    ...(lease ? ['Buyout, return, and upgrade figures cover different costs and time periods. They are not comparable full-cost totals.', 'Taxes, registration, insurance, repairs, financing, wear, and replacement transport must be confirmed separately.', 'Lease-end value estimates use today’s synthetic market value, which can change before the contract ends.'] : ['Loan cost differences use the dataset’s remaining-term assumptions; a longer term can lower payments and increase total interest.']),
  ];
  return { recommended, alternatives, allOptions, insights, hardship, recall, noEligibleOffer, projectedMiles, valueAdvantage, assumptions };
}
