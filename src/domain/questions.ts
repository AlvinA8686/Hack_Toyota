import type { Answers, Profile, Question } from './types';

const options = (...pairs: [string, string, string?][]) =>
  pairs.map(([value, label, detail]) => ({ value, label, ...(detail ? { detail } : {}) }));

/** A repeatable branching quiz. Account facts are never asked again. */
export function getQuestions(profile: Profile, answers: Answers = {}): Question[] {
  const lease = profile.account.contract_type === 'lease';
  const hardship = profile.customer.vulnerable_flag === 'Y' || profile.account.missed_payments_12m >= 2 || answers.comfort === 'struggling';
  const switching = answers.priority === 'new' || ['outgrown', 'different'].includes(answers.happiness) || ['family', 'features'].includes(answers.changes) || answers.ownership === 'newer';
  const keeping = answers.priority === 'keep' || answers.happiness === 'love' || answers.ownership === 'own';
  const projected = profile.vehicle.odometer_now + profile.vehicle.annual_miles_est * profile.account.months_remaining / 12;
  const questions: Question[] = [
    { id: 'priority', title: "What's your biggest priority right now?", subtitle: "Let's start with what matters to you. There are no wrong answers.", pose: 5, options: options(['monthly', 'Save money monthly', 'A little more breathing room'], ['total', 'Save money long-term', 'Look at the bigger picture'], ['keep', 'Keep my Toyota', "We've got a good thing going"], ['new', 'Get something new', 'Ready for my next chapter']) },
    { id: 'happiness', title: 'How do you feel about your Toyota?', subtitle: `I already know you drive a ${profile.vehicle.model}. Tell me how it fits your life.`, pose: 9, options: options(['love', 'I love it', 'Still the right car for me'], ['okay', "It's okay", 'It gets the job done'], ['outgrown', "I've outgrown it", 'My life needs a little more'], ['different', 'Ready for something different', 'Time for a change']) },
    { id: 'comfort', title: 'How does your monthly payment feel?', subtitle: 'Your account already has the amount. I want to understand how it feels for you.', pose: 7, options: options(['comfortable', 'Very comfortable'], ['manageable', 'Manageable'], ['expensive', 'A little expensive'], ['struggling', "I'm struggling", "Let's find some human support"]) },
    { id: 'changes', title: 'Has life changed your driving needs?', subtitle: 'A new chapter can change what you need from your car.', pose: 4, options: options(['family', 'My family is growing'], ['commute', 'My commute is longer'], ['relocating', "I'm relocating"], ['features', 'I want different features'], ['none', 'No big changes']) },
    { id: 'driving', title: 'How much will you drive from here?', subtitle: 'I know your current mileage. This is about what comes next.', pose: 9, options: options(['more', 'Much more'], ['same', 'About the same'], ['less', 'Much less'], ['unsure', "I'm not sure yet"]) },
    { id: 'ownership', title: 'What feels more like you?', subtitle: 'Think about your next few years, beyond this one decision.', pose: 5, options: options(['own', 'Own my Toyota long-term'], ['newer', 'Regularly drive newer models'], ['neutral', "I'm open to either"]) },
    { id: 'downPayment', title: lease ? 'What could you comfortably put down?' : 'How much cash flexibility do you have?', subtitle: 'Comfortably is the key word. No need to stretch your budget.', pose: 2, options: options(['none', 'Nothing right now'], ['small', 'A small amount'], ['cash', lease ? 'Enough for a buyout' : 'Enough to pay off my loan'], ['finance', "I'd need financing"]) },
  ];
  // Once human support is indicated, do not continue a purchase-preference funnel.
  if (hardship) return questions.slice(0, 3);
  if (keeping && !hardship) questions.push({ id: 'repairs', title: 'Do future repair costs worry you?', subtitle: `Your basic warranty end date is already on file: ${profile.vehicle.basic_warranty_ends}.`, pose: 9, options: options(['yes', 'Yes, I want predictability'], ['no', 'No, I can plan for maintenance'], ['unsure', "I'd like to understand the costs"]) });
  if (switching && profile.customer.marketing_consent === 'Y' && !hardship) questions.push({ id: 'upgrade', title: 'What would your next Toyota offer?', subtitle: 'This helps shape a comparison. Vehicle pricing still needs a real quote.', pose: 11, options: options(['hybrid', 'Hybrid efficiency'], ['ev', 'An all-electric drive'], ['larger', 'More space for my people'], ['unsure', "I'm still exploring"]) });
  if (answers.priority === 'monthly' || ['expensive', 'struggling'].includes(answers.comfort)) questions.push({ id: 'tradeoff', title: 'Would you trade a lower payment for more total cost?', subtitle: 'A longer loan can ease today’s payment and cost more over time.', pose: 7, options: options(['yes', 'Yes, I need breathing room'], ['no', 'No, total cost matters more'], ['unsure', 'Show me both trade-offs']) });
  if (lease && projected > (profile.account.mileage_allowance_total ?? Infinity) && !hardship) questions.push({ id: 'mileage', title: 'Would avoiding mileage fees make keeping it appealing?', subtitle: 'Your account projects excess mileage at lease end. Buying may avoid that fee, but has other costs.', pose: 5, options: options(['yes', 'Yes, let’s compare buying'], ['no', 'No, I still want to move on'], ['unsure', 'Show me the trade-offs']) });
  if (answers.driving === 'less' || answers.changes === 'relocating') questions.push({ id: 'replacement', title: 'Will you need a replacement vehicle?', subtitle: lease ? 'Returning a lease and owning a car solve different needs. Let’s compare fairly.' : 'Keeping or selling your Toyota affects how you get around. Include replacement transportation in the decision.', pose: 7, options: options(['yes', 'Yes, I’ll still need a car'], ['no', 'No, I have another way to get around'], ['unsure', "I'm still figuring that out"]) });
  return questions;
}
