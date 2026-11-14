import React, { useEffect, useRef } from 'react';
import { AccessibilityInfo, Animated, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { Question } from '../domain';
import { Genie } from '../ui/Genie';
import { Button, Icon } from '../ui/components';
import { colors } from '../ui/theme';

const questionIcons: Record<string, string[]> = {
  priority: ['wallet-outline', 'trending-up-outline', 'heart-outline', 'sparkles-outline'],
  happiness: ['heart-outline', 'thumbs-up-outline', 'people-outline', 'compass-outline'],
  comfort: ['sunny-outline', 'checkmark-circle-outline', 'cloud-outline', 'hand-left-outline'],
  changes: ['people-outline', 'map-outline', 'location-outline', 'options-outline', 'leaf-outline'],
  driving: ['speedometer-outline', 'swap-horizontal-outline', 'leaf-outline', 'help-circle-outline'],
  ownership: ['key-outline', 'car-sport-outline', 'compass-outline'],
  downPayment: ['wallet-outline', 'cash-outline', 'checkmark-circle-outline', 'calculator-outline'],
};

export function QuizScreen({ question, index, count, selected, onSelect, onContinue }: {
  question: Question; index: number; count: number; selected?: string; onSelect: (value: string) => void; onContinue: () => void;
}) {
  const scroll = useRef<React.ElementRef<typeof ScrollView>>(null);
  const opacity = useRef(new Animated.Value(1)).current;
  useEffect(() => { scroll.current?.scrollTo({ y: 0, animated: false }); opacity.setValue(.35); Animated.timing(opacity, { toValue: 1, duration: 230, useNativeDriver: true }).start(); }, [question.id, opacity]);
  useEffect(() => { AccessibilityInfo.announceForAccessibility(`Question ${index + 1}. ${question.title}`); }, [question.id, question.title, index]);
  return <ScrollView ref={scroll} showsVerticalScrollIndicator={false} contentContainerStyle={s.content}>
    <View style={s.progressMeta}><Text style={s.progressLabel}>GETTING TO KNOW YOU</Text><Text style={s.progressCount}>{String(index + 1).padStart(2, '0')} <Text style={{ color: '#8E968D' }}>/ {String(count).padStart(2, '0')}</Text></Text></View>
    <View style={s.track}><View style={[s.progress, { width: `${((index + 1) / count) * 100}%` }]} /></View>
    <Animated.View style={{ opacity, gap: 22 }}>
      <View style={s.genieArea}><View style={s.orbit} /><Genie pose={question.pose} size={146} /><View style={s.clue}><Icon name="sparkles" size={12} color={colors.red} /><Text style={s.clueText}>{index === 0 ? 'Every good guess starts with you.' : index < 4 ? 'I’m getting to know your world.' : 'The picture is coming together.'}</Text></View></View>
      <View style={{ gap: 10 }}><Text accessibilityRole="header" style={s.title}>{question.title}</Text><Text style={s.subtitle}>{question.subtitle}</Text></View>
      <View accessibilityRole="radiogroup" style={s.options}>
        {question.options.map((option, i) => {
          const active = selected === option.value;
          return <Pressable key={option.value} accessibilityRole="radio" accessibilityState={{ checked: active }} accessibilityLabel={`${option.label}${option.detail ? `. ${option.detail}` : ''}`} onPress={() => onSelect(option.value)} style={({ pressed }) => [s.option, active && s.selected, pressed && { opacity: .8 }]}>
            <View style={[s.optionIcon, active && { backgroundColor: '#FFE4E5' }]}><Icon name={(questionIcons[question.id]?.[i] ?? ['checkmark-circle-outline', 'remove-circle-outline', 'help-circle-outline'][i] ?? 'ellipse-outline') as any} size={21} color={active ? colors.red : colors.green} /></View>
            <View style={{ flex: 1, gap: 4 }}><Text style={[s.optionLabel, active && { color: '#C81F2D' }]}>{option.label}</Text>{option.detail && <Text style={s.optionDetail}>{option.detail}</Text>}</View>
            <View style={[s.radio, active && s.radioSelected]}>{active && <Icon name="checkmark" size={11} color="white" />}</View>
          </Pressable>;
        })}
      </View>
      <Button label={index + 1 === count ? 'Reveal my next move' : 'Next question'} icon={index + 1 === count ? 'sparkles' : 'arrow-forward'} disabled={!selected} onPress={onContinue} />
      <View style={s.note}><Icon name="lock-closed-outline" size={12} color={colors.muted} /><Text style={s.noteText}>Your account brings the facts. You bring the context.</Text></View>
    </Animated.View>
  </ScrollView>;
}

const s = StyleSheet.create({
  content: { paddingHorizontal: 24, paddingTop: 18, paddingBottom: 35, gap: 12 }, progressMeta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, progressLabel: { color: colors.green, fontWeight: '700', letterSpacing: 1.6, fontSize: 9 }, progressCount: { fontSize: 11, fontWeight: '700', color: colors.ink }, track: { backgroundColor: '#E5E8DF', height: 4, borderRadius: 3, marginBottom: 6 }, progress: { height: 4, backgroundColor: colors.red, borderRadius: 3 },
  genieArea: { alignItems: 'center', backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line, borderRadius: 22, paddingTop: 5, paddingBottom: 14, minHeight: 188 }, orbit: { position: 'absolute', top: 25, width: 130, height: 130, borderRadius: 80, borderColor: '#F3E7DD', borderWidth: 1 }, clue: { flexDirection: 'row', gap: 6, alignItems: 'center' }, clueText: { fontSize: 10, color: colors.muted }, title: { fontSize: 27, lineHeight: 33, fontWeight: '700', letterSpacing: -.9, color: colors.ink }, subtitle: { fontSize: 12, color: colors.muted, lineHeight: 19 }, options: { gap: 10 }, option: { minHeight: 65, backgroundColor: colors.white, borderRadius: 16, borderWidth: 1, borderColor: colors.line, paddingHorizontal: 14, paddingVertical: 13, flexDirection: 'row', alignItems: 'center', gap: 12 }, selected: { borderColor: colors.red, backgroundColor: '#FFF7F5' }, optionIcon: { height: 35, width: 35, backgroundColor: '#F2F5EF', borderRadius: 10, alignItems: 'center', justifyContent: 'center' }, optionLabel: { fontSize: 13, lineHeight: 18, fontWeight: '600', color: colors.ink }, optionDetail: { fontSize: 10, lineHeight: 15, color: colors.muted }, radio: { width: 17, height: 17, borderRadius: 9, borderColor: '#D7DDD3', borderWidth: 1, alignItems: 'center', justifyContent: 'center' }, radioSelected: { backgroundColor: colors.red, borderColor: colors.red }, note: { flexDirection: 'row', justifyContent: 'center', gap: 6 }, noteText: { color: colors.muted, fontSize: 9, lineHeight: 14 },
});
