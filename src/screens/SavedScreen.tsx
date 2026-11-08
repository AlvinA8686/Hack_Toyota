import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { getProfile, rankOptions } from '../domain';
import type { SavedMove } from '../storage';
import { Genie } from '../ui/Genie';
import { Button, Icon, Pill } from '../ui/components';
import { colors } from '../ui/theme';

export function SavedScreen({ moves, onOpen, onRemove, onStart }: { moves: SavedMove[]; onOpen: (move: SavedMove) => void; onRemove: (id: string) => void; onStart: () => void }) {
  return <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
    <Text style={s.eyebrow}>A LITTLE CLARITY TO COME BACK TO</Text><Text style={s.title}>Your next moves.</Text><Text style={s.subtitle}>The plans you’ve saved, ready when you are.</Text>
    {moves.length === 0 ? <View style={s.empty}><Genie pose={4} size={190} /><Text style={s.emptyTitle}>Your next chapter is waiting.</Text><Text style={s.emptyText}>Meet your genie, explore your options, and save a plan that feels like you.</Text><Button label="Find my next move" icon="sparkles-outline" onPress={onStart} style={{ alignSelf: 'stretch' }} /></View> : moves.map(move => {
      const profile = getProfile(move.profileId);
      const decision = rankOptions(profile, move.answers);
      const option = decision.allOptions.find(o => o.id === move.optionId);
      if (!option) return null;
      return <View key={move.id} style={s.card}><View style={s.row}><Pill label={option.nextStep.type.toUpperCase()} tone="green" /><Pressable onPress={() => onRemove(move.id)} accessibilityRole="button" accessibilityLabel={`Remove ${option.title} from saved moves`} style={s.delete}><Icon name="trash-outline" size={18} color={colors.muted} /></Pressable></View><Text style={s.cardTitle}>{option.title}</Text><Text style={s.vehicle}>{profile.customer.first_name} · {profile.vehicle.model_year} {profile.vehicle.model}</Text><View style={s.metric}><Text style={s.metricLabel}>{option.metricLabel}</Text><Text style={s.metricValue}>{option.metricValue}</Text></View><View style={s.row}><Text style={s.date}>Saved {new Date(move.savedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</Text><Text style={s.progress}>{move.completedSteps.length} / {option.nextStep.checklist.length} steps reviewed</Text></View><Button label="Open my plan" variant="secondary" icon="arrow-forward" onPress={() => onOpen(move)} /></View>;
    })}
    <View style={s.foot}><Icon name="phone-portrait-outline" size={17} color={colors.green} /><Text style={s.footText}>Saved on this device. Demo profiles only; no account changes or applications are submitted.</Text></View>
  </ScrollView>;
}
const s = StyleSheet.create({ content: { padding: 24, gap: 15, paddingBottom: 40 }, eyebrow: { fontSize: 9, letterSpacing: 1.4, fontWeight: '700', color: colors.green }, title: { fontSize: 34, fontWeight: '700', letterSpacing: -1.1, color: colors.ink }, subtitle: { fontSize: 13, lineHeight: 20, color: colors.muted, marginBottom: 12 }, empty: { alignItems: 'center', padding: 25, gap: 20, backgroundColor: colors.white, borderRadius: 24, borderColor: colors.line, borderWidth: 1 }, emptyTitle: { fontSize: 21, fontWeight: '700', color: colors.ink, textAlign: 'center', letterSpacing: -.5 }, emptyText: { fontSize: 13, lineHeight: 21, color: colors.muted, textAlign: 'center' }, card: { backgroundColor: colors.white, padding: 20, borderRadius: 22, gap: 13, borderWidth: 1, borderColor: colors.line }, row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, delete: { height: 44, width: 44, justifyContent: 'center', alignItems: 'center', marginRight: -10 }, cardTitle: { color: colors.ink, fontSize: 23, lineHeight: 29, letterSpacing: -.6, fontWeight: '700' }, vehicle: { color: colors.muted, fontSize: 12 }, metric: { paddingVertical: 15, borderTopWidth: 1, borderBottomWidth: 1, borderColor: colors.line, gap: 6 }, metricLabel: { fontSize: 11, color: colors.muted }, metricValue: { fontSize: 26, color: colors.green, fontWeight: '600', letterSpacing: -.6 }, date: { color: colors.muted, fontSize: 10 }, progress: { color: colors.green, fontSize: 10 }, foot: { flexDirection: 'row', alignItems: 'flex-start', gap: 9, marginTop: 12 }, footText: { flex: 1, color: colors.muted, fontSize: 10, lineHeight: 17 } });
