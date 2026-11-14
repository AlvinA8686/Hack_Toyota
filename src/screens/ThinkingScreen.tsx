import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, StyleSheet, Text, View } from 'react-native';
import { Genie, geniePoses } from '../ui/Genie';
import { Icon } from '../ui/components';
import { colors } from '../ui/theme';

const clues = ['Checking what’s eligible', 'Connecting your priorities', 'Putting the trade-offs in perspective'];
export function ThinkingScreen({ onDone, supportive }: { onDone: () => void; supportive: boolean }) {
  const [step, setStep] = useState(0);
  useEffect(() => { const one = setTimeout(() => setStep(1), 700); const two = setTimeout(() => setStep(2), 1450); const done = setTimeout(onDone, 2300); return () => { clearTimeout(one); clearTimeout(two); clearTimeout(done); }; }, [onDone]);
  return <View style={s.container}><Image source={geniePoses[supportive ? 9 : 12]} accessible={false} style={{ position: 'absolute', width: 1, height: 1, opacity: 0 }} /><View style={s.magic}><Genie pose={supportive ? 9 : step === 0 ? 3 : step === 1 ? 1 : 10} size={250} /></View><Text style={s.eyebrow}>A LITTLE THOUGHT. A CLEARER PATH.</Text><Text style={s.title}>{supportive ? 'Let’s make space\nfor your next step.' : 'The clues are\ncoming together.'}</Text><View style={s.clues}>{clues.map((clue, i) => <View key={clue} style={[s.row, i > step && { opacity: .3 }]}>{i < step ? <Icon name="checkmark-circle" color={colors.green} size={18} /> : i === step ? <ActivityIndicator size="small" color={colors.red} /> : <Icon name="ellipse-outline" color={colors.muted} size={18} />}<Text style={s.clueText}>{clue}</Text></View>)}</View><Text style={s.foot}>Real account facts. Your priorities. A thoughtful match.</Text></View>;
}
const s = StyleSheet.create({ container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 20 }, magic: { width: 265, height: 265, borderRadius: 150, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center' }, eyebrow: { fontSize: 9, letterSpacing: 1.6, color: colors.green, fontWeight: '700' }, title: { fontSize: 31, lineHeight: 37, letterSpacing: -1, fontWeight: '700', color: colors.ink, textAlign: 'center' }, clues: { gap: 18, marginVertical: 10 }, row: { flexDirection: 'row', alignItems: 'center', gap: 10 }, clueText: { fontSize: 12, color: colors.muted }, foot: { fontSize: 10, color: colors.muted, textAlign: 'center', lineHeight: 17 } });
