import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { money, type Profile } from '../domain';
import { VehiclePhoto } from '../ui/VehiclePhoto';
import { Genie } from '../ui/Genie';
import { Button, Icon, Pill, SectionTitle } from '../ui/components';
import { colors } from '../ui/theme';

export function HomeScreen({ profile, onStart, onGarage, onHowItWorks }: {
  profile: Profile; onStart: () => void; onGarage: () => void; onHowItWorks: () => void;
}) {
  const lease = profile.account.contract_type === 'lease';
  const support = profile.customer.vulnerable_flag === 'Y' || profile.account.missed_payments_12m >= 2;
  const paths = support ? [['car-outline', 'Keep plan'], ['heart-outline', 'Support'], ['chatbubble-outline', 'Talk it through']]
    : lease ? [['return-down-back-outline', 'Return'], ['key-outline', 'Buy out'], ...(profile.customer.marketing_consent === 'Y' ? [['car-sport-outline', 'Upgrade']] : [])]
    : [['car-outline', 'Keep'], ['swap-horizontal-outline', 'Refinance'], ['checkmark-done-outline', 'Pay off']];
  return <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.content}>
    <View style={s.intro}>
      <View style={s.eyebrowRow}><View style={s.dot} /><Text style={s.eyebrow}>A LITTLE CLARITY FOR {profile.customer.first_name.toUpperCase()}</Text></View>
      <Text style={s.title}>Your Toyota.{ '\n' }Your next chapter.</Text>
      <Text style={s.subtitle}>Big car decisions, made a little more human.</Text>
    </View>

    {profile.vehicle.open_recall === 'Y' && <Pressable accessibilityRole="button" onPress={onGarage} style={s.notice}><Icon name="shield-checkmark-outline" color={colors.green} /><Text style={s.noticeText}>A safety check comes first. Your account has an open recall.</Text><Icon name="chevron-forward" size={16} /></Pressable>}

    <View style={s.genieCard}>
      <View style={s.cardTop}>
        <View style={s.genieCopy}>
          <View style={s.magicLabel}><Icon name="sparkles" size={12} color={colors.red} /><Text style={s.magicText}>MEET YOUR GENIE</Text></View>
          <Text style={s.genieTitle}>{support ? 'Your next step.\nAt your pace.' : 'A few clues.\nYour next move.'}</Text>
          <Text style={s.genieBody}>{support ? 'We’ll find a thoughtful next step, together.' : 'You know your life.\nI know your Toyota.\nLet’s put it together.'}</Text>
        </View>
        <View style={s.genieArt}><Genie pose={support ? 9 : 5} size={177} /><View style={s.star}><Icon name="sparkles-outline" size={19} color="#D8A951" /></View></View>
      </View>
      <Button label="Find my next move" icon="arrow-forward" onPress={onStart} />
      <View style={s.cardFoot}><Icon name="time-outline" size={13} color={colors.muted} /><Text style={s.cardFootText}>About 2 minutes</Text><View style={s.tinyDot} /><Text style={s.cardFootText}>Made around you</Text></View>
    </View>

    <View style={{ gap: 13 }}>
      <SectionTitle title="Already in your corner" action="My Toyota" onAction={onGarage} />
      <Pressable onPress={onGarage} accessibilityRole="button" accessibilityLabel="View your Toyota and account" style={({ pressed }) => [s.vehicleCard, pressed && { opacity: .85 }]}>
        <View style={s.vehicleHeader}><View style={{ gap: 4 }}><Text style={s.vehicleName}>{profile.vehicle.model_year} {profile.vehicle.model}</Text><Text style={s.vehicleTrim}>{profile.vehicle.trim} · {lease ? 'Your current lease' : 'Your current loan'}</Text></View><View style={s.vehicleIcon}><Icon name="arrow-forward" size={17} /></View></View>
        <View style={s.vehicleVisual}><VehiclePhoto vehicle={profile.vehicle} height={150} /><Text style={s.illustration}>Model photo · color and trim may vary</Text></View>
        <View style={s.stats}>
          <View style={s.stat}><Text style={s.statValue}>{money(profile.account.monthly_payment)}<Text style={s.statUnit}> /mo</Text></Text><Text style={s.statLabel}>Current payment</Text></View>
          <View style={s.statDivider} />
          <View style={s.stat}><Text style={s.statValue}>{profile.account.months_remaining}<Text style={s.statUnit}> months</Text></Text><Text style={s.statLabel}>{lease ? 'Until lease end' : 'Left on your loan'}</Text></View>
        </View>
        <View style={s.synced}><Icon name="checkmark-circle" size={13} color={colors.green} /><Text style={s.syncedText}>Account facts are ready. No paperwork needed.</Text></View>
      </Pressable>
    </View>

    <View style={s.explore}>
      <Text style={s.smallTitle}>ONE CONVERSATION. YOUR POSSIBILITIES.</Text>
      <View style={s.pathRow}>{paths.map(([icon, title]) => <Pressable key={title} accessibilityRole="button" accessibilityLabel={`Explore ${title.toLowerCase()} and compare your options`} onPress={onStart} style={s.path}><Icon name={icon as any} color={colors.green} size={23} /><Text style={s.pathText}>{title}</Text></Pressable>)}</View>
      <Text style={s.pathNote}>{support ? 'A thoughtful plan starts with a conversation.' : 'We compare the fit, the costs, and the trade-offs.'}</Text>
    </View>

    <Pressable style={s.how} onPress={onHowItWorks} accessibilityRole="button"><View style={s.howIcon}><Icon name="shield-checkmark-outline" size={21} color={colors.green} /></View><View style={{ flex: 1, gap: 4 }}><Text style={s.howTitle}>Your priorities lead the way.</Text><Text style={s.howText}>See how your next move comes together.</Text></View><Icon name="chevron-forward" size={16} color={colors.muted} /></Pressable>
    <View style={s.disclaimer}><Pill label="HACK UTD · DEMO" /><Text style={s.disclaimerText}>Synthetic account data as of Nov 7, 2026. Estimates for exploration, not actual Toyota offers.</Text></View>
  </ScrollView>;
}

const s = StyleSheet.create({
  content: { paddingHorizontal: 24, paddingTop: 20, paddingBottom: 30, gap: 25 },
  intro: { gap: 12 }, eyebrowRow: { flexDirection: 'row', gap: 7, alignItems: 'center' }, dot: { width: 6, height: 6, backgroundColor: colors.green, borderRadius: 3 }, eyebrow: { fontSize: 9, letterSpacing: 1.45, fontWeight: '700', color: colors.green },
  title: { fontSize: 38, lineHeight: 43, letterSpacing: -1.6, fontWeight: '700', color: colors.ink }, subtitle: { fontSize: 13, lineHeight: 20, color: colors.muted },
  genieCard: { backgroundColor: colors.white, padding: 18, borderRadius: 26, borderColor: colors.line, borderWidth: 1, shadowColor: '#25382C', shadowOpacity: .035, shadowRadius: 12, shadowOffset: { width: 0, height: 5 } },
  cardTop: { flexDirection: 'row', minHeight: 197, alignItems: 'center' }, genieCopy: { flex: 1, paddingBottom: 14, zIndex: 1 }, magicLabel: { flexDirection: 'row', gap: 5, alignItems: 'center', marginBottom: 12 }, magicText: { fontSize: 8, letterSpacing: 1.15, color: colors.red, fontWeight: '800' }, genieTitle: { fontSize: 23, lineHeight: 28, letterSpacing: -.7, fontWeight: '700', color: colors.ink }, genieBody: { fontSize: 12, lineHeight: 19, color: colors.muted, marginTop: 10 },
  genieArt: { width: 156, alignItems: 'center', alignSelf: 'stretch', justifyContent: 'center' }, star: { position: 'absolute', top: 12, right: 2, transform: [{ rotate: '10deg' }] }, cardFoot: { flexDirection: 'row', gap: 6, justifyContent: 'center', alignItems: 'center', marginTop: 14 }, cardFootText: { fontSize: 10, color: colors.muted }, tinyDot: { width: 3, height: 3, borderRadius: 2, backgroundColor: '#B6BFB7', marginHorizontal: 5 },
  vehicleCard: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line, borderRadius: 22, overflow: 'hidden', paddingTop: 19 }, vehicleHeader: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 19, alignItems: 'center' }, vehicleName: { fontWeight: '700', fontSize: 17, letterSpacing: -.4, color: colors.ink }, vehicleTrim: { fontSize: 11, color: '#637263' }, vehicleIcon: { borderWidth: 1, borderColor: '#CCD7C8', borderRadius: 20, width: 33, height: 33, justifyContent: 'center', alignItems: 'center' }, vehicleVisual: { height: 175, paddingHorizontal: 14, justifyContent: 'center', alignItems: 'center' }, illustration: { fontSize: 7, color: '#60705F', position: 'absolute', bottom: 3, right: 14 },
  stats: { flexDirection: 'row', paddingHorizontal: 20, paddingTop: 6, paddingBottom: 17, alignItems: 'center' }, stat: { flex: 1, gap: 4 }, statValue: { fontSize: 22, fontWeight: '700', letterSpacing: -.6, color: colors.ink }, statUnit: { fontSize: 11, fontWeight: '400', letterSpacing: 0, color: '#657062' }, statLabel: { fontSize: 10, color: '#657062' }, statDivider: { height: 28, width: 1, backgroundColor: '#CCD6C7', marginRight: 22 }, synced: { backgroundColor: '#E0E8DB', flexDirection: 'row', gap: 6, paddingVertical: 11, justifyContent: 'center' }, syncedText: { fontSize: 9, color: colors.green },
  explore: { gap: 14 }, smallTitle: { fontSize: 9, fontWeight: '700', letterSpacing: 1.35, color: colors.muted }, pathRow: { flexDirection: 'row', gap: 10 }, path: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line, borderRadius: 15, alignItems: 'center', justifyContent: 'center', paddingVertical: 18, gap: 9, flex: 1 }, pathText: { fontSize: 12, fontWeight: '600', color: colors.ink }, pathNote: { fontSize: 11, color: colors.muted, textAlign: 'center' },
  how: { flexDirection: 'row', gap: 12, alignItems: 'center', paddingVertical: 5 }, howIcon: { width: 42, height: 42, borderRadius: 13, backgroundColor: '#EAF0E6', alignItems: 'center', justifyContent: 'center' }, howTitle: { fontSize: 12, fontWeight: '600', color: colors.ink }, howText: { fontSize: 10, color: colors.muted }, disclaimer: { gap: 9, paddingTop: 5 }, disclaimerText: { fontSize: 10, lineHeight: 16, color: colors.muted }, notice: { padding: 14, backgroundColor: colors.greenSoft, borderRadius: 15, flexDirection: 'row', alignItems: 'center', gap: 10 }, noticeText: { flex: 1, fontSize: 12, lineHeight: 18, color: colors.green },
});
