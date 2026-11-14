export type Answers = Record<string, string>;

export interface Question {
  id: string;
  title: string;
  subtitle: string;
  pose: number;
  options: { value: string; label: string; detail?: string; icon?: string }[];
}

export interface Scenario {
  customer_id: string;
  option_id: string;
  option_name: string;
  new_monthly_payment: number | null;
  monthly_payment_change: number | null;
  upfront_cost: number | null;
  total_cost_vs_keep_as_is: number | null;
  eligibility: string;
  plain_language_summary: string;
  key_assumption: string;
  tradeoff: string;
}

export interface Profile {
  customer: {
    customer_id: string;
    first_name: string;
    age: number;
    city: string;
    state: string;
    occupation: string;
    annual_income: number;
    credit_tier_at_origination: string;
    credit_tier_now: string;
    other_monthly_debt: number;
    tenure_months_with_tfs: number;
    autopay: string;
    digital_engagement: string;
    preferred_channel: string;
    marketing_consent: string;
    vulnerable_flag: string;
    payment_to_income_pct: number;
    debt_to_income_pct: number;
    financial_stress_score: number;
    payday_day: number;
  };
  vehicle: {
    vehicle_id: string;
    customer_id: string;
    model_year: number;
    model: string;
    trim: string;
    condition_at_purchase: string;
    purchase_price_or_msrp: number;
    odometer_now: number;
    annual_miles_est: number;
    est_market_value_now: number;
    toyota_care_ends: string;
    basic_warranty_ends: string;
    last_service_date: string;
    next_service_due: string;
    open_recall: string;
  };
  account: {
    account_id: string;
    customer_id: string;
    vehicle_id: string;
    contract_type: 'loan' | 'lease';
    contract_start: string;
    term_months: number;
    months_elapsed: number;
    months_remaining: number;
    contract_end: string;
    missed_payments_12m: number;
    autopay: string;
    amount_financed: number;
    apr: number | null;
    money_factor: number | null;
    monthly_payment: number;
    current_balance: number | null;
    payoff_quote: number;
    residual_value: number | null;
    mileage_allowance_total: number | null;
    est_equity: number;
    payment_due_day: number;
  };
  situation: {
    situation_id: string;
    customer_id: string;
    customer_says: string;
    context_summary: string;
  };
  options: Scenario[];
}

export type EligibilityStatus = 'eligible' | 'review' | 'unavailable' | 'planning';

export interface NextStep {
  type: 'Self-service' | 'Follow-up' | 'Eligible offer';
  label: string;
  description: string;
  checklist: string[];
}

export interface RankedOption {
  id: string;
  title: string;
  source: Scenario | null;
  score: number;
  reasons: string[];
  status: EligibilityStatus;
  caveats: string[];
  summary: string;
  tradeoff: string;
  upfront: number | null;
  monthly: number | null;
  totalDifference: number | null;
  metricLabel: string;
  metricValue: string;
  nextStep: NextStep;
}

export interface Decision {
  recommended: RankedOption;
  alternatives: RankedOption[];
  allOptions: RankedOption[];
  insights: string[];
  hardship: boolean;
  recall: boolean;
  noEligibleOffer: boolean;
  projectedMiles: number | null;
  valueAdvantage: number | null;
  assumptions: string[];
}
