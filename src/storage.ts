import AsyncStorage from '@react-native-async-storage/async-storage';
import { profiles, rankOptions, type Answers } from './domain';

export interface SavedMove {
  id: string;
  profileId: string;
  answers: Answers;
  optionId: string;
  savedAt: string;
  completedSteps: number[];
}
const KEY = '@toyota-next-move/plans/v1';

export async function loadMoves(): Promise<SavedMove[]> {
  const raw = await AsyncStorage.getItem(KEY);
  if (!raw) return [];
  const value: unknown = JSON.parse(raw);
  if (!Array.isArray(value)) return [];
  const seen = new Set<string>();
  const moves: SavedMove[] = [];
  for (const item of value) {
    if (!item || typeof item !== 'object' || Array.isArray(item)) continue;
    const profile = profiles.find(p => p.customer.customer_id === item.profileId);
    if (!profile || typeof item.optionId !== 'string' || typeof item.savedAt !== 'string'
      || !Number.isFinite(Date.parse(item.savedAt)) || !item.answers
      || typeof item.answers !== 'object' || Array.isArray(item.answers)
      || !Object.values(item.answers).every(answer => typeof answer === 'string')
      || !Array.isArray(item.completedSteps)) continue;
    const option = rankOptions(profile, item.answers).allOptions.find(candidate => candidate.id === item.optionId);
    if (!option) continue;
    const id = planId(profile.customer.customer_id, option.id);
    if (seen.has(id)) continue;
    seen.add(id);
    const completedSteps = [...new Set<number>(item.completedSteps.filter((step: unknown): step is number =>
      typeof step === 'number' && Number.isInteger(step) && step >= 0 && step < option.nextStep.checklist.length))];
    moves.push({ id, profileId: profile.customer.customer_id, optionId: option.id,
      answers: item.answers, savedAt: item.savedAt, completedSteps });
  }
  return moves;
}
export async function persistMoves(moves: SavedMove[]) { await AsyncStorage.setItem(KEY, JSON.stringify(moves)); }
export const planId = (profileId: string, optionId: string) => `${profileId}:${optionId}`;
