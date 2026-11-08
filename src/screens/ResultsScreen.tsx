import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Answers, Decision, money, Profile, RankedOption } from '../domain';
import { Button, Icon, InfoRow, Pill, SectionTitle } from '../ui/components';
import { Genie } from '../ui/Genie';
import { colors } from '../ui/theme';

interface Props {
  profile: Profile;
  answers: Answers;
  decision: Decision;
  onCompare: () => void;
  onAction: (option: RankedOption) => void;
  onSave: () => void;
  saved: boolean;
  onRestart: () => void;
}

export function ResultsScreen({ profile, answers, decision, onCompare, onAction, onSave, saved, onRestart }: Props) {
  const [expanded, setExpanded] = useState(false);
  const choice = decision.recommended;
  const buyout = choice.id === 'BUYOUT';
  const supportive = decision.hardship || decision.recall;
  const lease = profile.account.contract_type === 'lease';
  const difference = choice.totalDifference;
  const remainingPayments = profile.account.monthly_payment * profile.account.months_remaining;
  const warnings = [...new Set([...choice.caveats, ...decision.assumptions])];

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
      <View style={styles.reveal}>
        <View style={styles.eyebrowRow}><Icon name="sparkles-outline" size={15} color={colors.green} /><Text style={styles.eyebrow}>THE REVEAL</Text></View>
        <View style={styles.genieWrap}>
          <View style={styles.halo} />
          <Genie pose={supportive ? 9 : 12} size={176} />
          <View style={styles.matchTag}><Icon name={supportive ? 'heart-outline' : 'checkmark-circle'} size={15} color={colors.green} /><Text style={styles.matchText}>{supportive ? 'Here for you' : 'Made for your next chapter'}</Text></View>
        </View>
        <Text style={styles.intro}>{supportive ? 'Let’s take the next step together.' : 'I think your smartest next move is…'}</Text>
        <Text style={styles.title}>{choice.title}{supportive ? '.' : '!'}</Text>
        <Text style={styles.forYou}>{profile.customer.first_name}’s {profile.vehicle.model_year} {profile.vehicle.model} · {lease ? 'Lease' : 'Loan'} journey</Text>
      </View>

      {choice.status === 'planning' && <View style={styles.notice}><Icon name="time-outline" size={22} color={colors.amber} /><Text style={styles.noticeText}>A plan for lease end. This option’s immediate eligibility window has not opened yet.</Text></View>}

      <View style={styles.metricCard}>
        <View style={styles.metricTop}><Text style={styles.metricLabel}>{choice.metricLabel}</Text><Icon name={supportive ? 'heart-outline' : 'open-outline'} size={21} color="#AEC5B7" /></View>
        <Text style={[styles.metricValue, choice.metricValue.length > 12 && styles.wordMetric]}>{choice.metricValue}</Text>
        {buyout && decision.valueAdvantage !== null && <View style={styles.advantage}>
          <View style={{ flex: 1 }}><Text style={styles.advantageLabel}>{decision.valueAdvantage >= 0 ? 'Estimated value advantage' : 'Estimated value gap'}</Text><Text style={styles.metricHint}>Market estimate minus lease-end buyout</Text></View>
          <Text style={styles.advantageValue}>{money(Math.abs(decision.valueAdvantage))}</Text>
        </View>}
        {!buyout && difference != null && difference !== 0 && <View style={styles.advantage}>
          <View style={{ flex: 1 }}><Text style={styles.advantageLabel}>{difference < 0 ? 'Estimated total cost reduction' : 'Estimated added total cost'}</Text><Text style={styles.metricHint}>Versus keeping the current contract</Text></View>
          <Text style={styles.advantageValue}>{money(Math.abs(difference))}</Text>
        </View>}
        <Text style={styles.metricFoot}>{supportive ? 'Support and service details need confirmation.' : buyout ? 'Before taxes, financing, and future ownership costs.' : 'Synthetic dataset estimate. Confirm with your servicer.'}</Text>
      </View>

      <View style={styles.section}>
        <SectionTitle eyebrow="THE CONNECTIONS" title="Why this matches you" />
        {choice.reasons.map((reason, index) => <View style={styles.reason} key={`${index}-${reason}`}><View style={styles.check}><Icon name="checkmark" size={15} color={colors.green} /></View><Text style={styles.reasonText}>{reason}</Text></View>)}
      </View>

      <View style={styles.costCard}>
        <View style={styles.cardHeading}><Icon name="receipt-outline" size={20} color={colors.green} /><Text style={styles.cardTitle}>The numbers, with context</Text></View>
        <Text style={styles.body}>{choice.summary}</Text>
        {buyout && <>
          <InfoRow label="Lease-end residual" value={money(profile.account.residual_value)} />
          <InfoRow label="Included buyout fee" value={money(choice.upfront != null && profile.account.residual_value != null ? choice.upfront - profile.account.residual_value : null)} />
          <InfoRow label="Listed lease-end buyout" value={money(choice.upfront)} accent />
          <InfoRow label="Estimated market value" value={money(profile.vehicle.est_market_value_now)} />
          <InfoRow label={`Remaining payments · ${profile.account.months_remaining} months`} value={money(remainingPayments)} />
          <Text style={styles.smallPrint}>Remaining payments are separate from the lease-end buyout. The value advantage is an estimate, not guaranteed savings or cash back.</Text>
        </>}
        {!buyout && !supportive && <>
          <InfoRow label={choice.id === 'RETURN' ? 'Payment after return' : 'Estimated monthly payment'} value={choice.id === 'RETURN' ? 'No vehicle included' : money(choice.monthly)} />
          <InfoRow label="Listed upfront estimate" value={money(choice.upfront)} />
          {lease && <InfoRow label="Remaining lease payments" value={money(remainingPayments)} />}
        </>}
        <View style={styles.tradeoff}><Icon name="swap-horizontal-outline" size={18} color={colors.green} /><Text style={styles.tradeoffText}>{choice.tradeoff}</Text></View>
      </View>

      {decision.insights.length > 0 && <View style={styles.insightCard}>
        <View style={styles.cardHeading}><Icon name="bulb-outline" size={20} color={colors.green} /><Text style={styles.cardTitle}>A little more perspective</Text></View>
        {decision.insights.map((insight, index) => <Text key={index} style={styles.insightText}>{insight}</Text>)}
      </View>}

      <View style={styles.section}>
        <SectionTitle eyebrow="KEEP YOUR OPTIONS OPEN" title="The other paths" action="Compare all" onAction={onCompare} />
        {decision.alternatives.length === 0 ? <Text style={styles.body}>There isn’t another confirmed path in this account snapshot. A specialist can help review what might change.</Text> : decision.alternatives.map(option => <Pressable accessibilityRole="button" key={option.id} onPress={onCompare} style={({ pressed }) => [styles.alternative, pressed && { opacity: 0.7 }]}>
          <View style={styles.alternativeIcon}><Icon name={option.id === 'RETURN' ? 'key-outline' : ['RENEW', 'TRADE'].includes(option.id) ? 'car-sport-outline' : 'git-compare-outline'} size={22} color={colors.green} /></View>
          <View style={{ flex: 1, gap: 5 }}><Text style={styles.alternativeTitle}>{option.title}</Text><Text style={styles.alternativeDetail}>{option.status === 'planning' ? 'For future planning' : option.status === 'review' ? 'Needs specialist review' : option.metricLabel}{option.status === 'eligible' ? ` · ${option.metricValue}` : ''}</Text></View>
          <Icon name="chevron-forward" size={18} color={colors.muted} />
        </Pressable>)}
      </View>

      <View style={styles.assumptions}>
        <Pressable accessibilityRole="button" accessibilityState={{ expanded }} onPress={() => setExpanded(!expanded)} style={styles.disclosureButton}><Icon name="information-circle-outline" size={20} color={colors.muted} /><Text style={styles.disclosureTitle}>Assumptions & things to confirm</Text><Icon name={expanded ? 'chevron-up' : 'chevron-down'} size={18} color={colors.muted} /></Pressable>
        {expanded && <View style={styles.disclosureBody}>{warnings.map((warning, index) => <View key={index} style={styles.bulletRow}><Text style={styles.bullet}>•</Text><Text style={styles.disclosureText}>{warning}</Text></View>)}</View>}
      </View>

      <View style={styles.nextStep}>
        <Pill label={choice.nextStep.type.toUpperCase()} tone="green" />
        <Text style={styles.nextTitle}>A clear next step.</Text>
        <Text style={styles.body}>{choice.nextStep.description}</Text>
        <Button label={choice.nextStep.label} icon="arrow-forward" onPress={() => onAction(choice)} />
        <Button label={saved ? 'Saved to My moves' : 'Save my next move'} icon={saved ? 'bookmark' : 'bookmark-outline'} variant="secondary" onPress={onSave} />
        <Pressable accessibilityRole="button" onPress={onRestart} style={styles.retake}><Icon name="refresh-outline" size={17} color={colors.muted} /><Text style={styles.retakeText}>Changed your mind? Update your answers</Text></Pressable>
      </View>
      <Text style={styles.disclaimer}>Built around {Object.keys(answers).length} answers and your account snapshot. Synthetic dataset estimates, not actual Toyota financing or a verified offer. Nothing is submitted or changed by this demo.</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 24, gap: 24, paddingBottom: 40 },
  reveal: { alignItems: 'center', gap: 12 },
  eyebrowRow: { flexDirection: 'row', gap: 7, alignItems: 'center' },
  eyebrow: { fontSize: 10, fontWeight: '700', color: colors.green, letterSpacing: 2.1 },
  genieWrap: { alignItems: 'center', paddingTop: 8, paddingBottom: 22, width: '100%' },
  halo: { position: 'absolute', backgroundColor: '#EAF0E6', width: 178, height: 178, borderRadius: 100, top: 18 },
  matchTag: { position: 'absolute', bottom: 6, flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line, borderRadius: 20, paddingVertical: 8, paddingHorizontal: 13 },
  matchText: { fontSize: 10, fontWeight: '700', color: colors.green, letterSpacing: 0.2 },
  intro: { color: colors.muted, fontSize: 14, lineHeight: 21, textAlign: 'center', maxWidth: 290 },
  title: { color: colors.ink, fontSize: 34, lineHeight: 39, letterSpacing: -1.3, fontWeight: '700', textAlign: 'center', maxWidth: 350 },
  forYou: { fontSize: 11, lineHeight: 17, color: colors.muted, textAlign: 'center' },
  metricCard: { backgroundColor: '#203E33', padding: 24, borderRadius: 24, gap: 11 },
  metricTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  metricLabel: { color: '#D0DED3', fontSize: 12, lineHeight: 18, flex: 1 },
  metricValue: { fontSize: 44, lineHeight: 51, fontWeight: '600', letterSpacing: -1.8, color: colors.white },
  wordMetric: { fontSize: 30, lineHeight: 37, letterSpacing: -0.8 },
  advantage: { borderTopColor: '#446052', borderTopWidth: 1, paddingTop: 17, marginTop: 6, flexDirection: 'row', alignItems: 'center', gap: 14 },
  advantageLabel: { color: '#E8EFE5', fontSize: 12, lineHeight: 18, fontWeight: '500' },
  metricHint: { color: '#A4BBAE', fontSize: 9, lineHeight: 14, marginTop: 4 },
  advantageValue: { color: '#D8E9B2', fontSize: 24, fontWeight: '600', letterSpacing: -0.6 },
  metricFoot: { color: '#B2C4B8', fontSize: 10, lineHeight: 16, marginTop: 5 },
  section: { gap: 16 },
  reason: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  check: { width: 24, height: 24, backgroundColor: colors.greenSoft, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  reasonText: { flex: 1, fontSize: 13, lineHeight: 21, color: '#44534C', paddingTop: 1 },
  costCard: { backgroundColor: colors.white, borderRadius: 22, padding: 20, borderWidth: 1, borderColor: colors.line, gap: 8 },
  cardHeading: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 5 },
  cardTitle: { fontSize: 15, fontWeight: '700', letterSpacing: -0.3, color: colors.ink, flex: 1 },
  body: { color: '#5F6C64', fontSize: 13, lineHeight: 21 },
  smallPrint: { color: colors.muted, fontSize: 11, lineHeight: 18, marginTop: 7 },
  tradeoff: { backgroundColor: '#F4F6F0', borderRadius: 12, padding: 13, flexDirection: 'row', alignItems: 'flex-start', gap: 9, marginTop: 10 },
  tradeoffText: { flex: 1, color: '#536558', fontSize: 11, lineHeight: 18 },
  insightCard: { backgroundColor: '#EEF2E8', borderRadius: 20, padding: 20, gap: 12 },
  insightText: { fontSize: 12, lineHeight: 20, color: '#506149' },
  alternative: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 17, borderRadius: 18, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line, minHeight: 80 },
  alternativeIcon: { width: 40, height: 40, backgroundColor: '#F2F5EE', borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  alternativeTitle: { fontSize: 13, fontWeight: '600', color: colors.ink, lineHeight: 19 },
  alternativeDetail: { fontSize: 10, color: colors.muted, lineHeight: 16 },
  assumptions: { borderWidth: 1, borderColor: colors.line, borderRadius: 17, overflow: 'hidden' },
  disclosureButton: { minHeight: 57, flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 14, gap: 9, alignItems: 'center' },
  disclosureTitle: { fontSize: 12, fontWeight: '600', color: '#536159', flex: 1, lineHeight: 18 },
  disclosureBody: { padding: 16, paddingTop: 0, gap: 12 },
  bulletRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 7 },
  bullet: { fontSize: 13, lineHeight: 19, color: colors.muted },
  disclosureText: { fontSize: 11, lineHeight: 18, color: colors.muted, flex: 1 },
  nextStep: { gap: 13 },
  nextTitle: { fontSize: 25, lineHeight: 32, fontWeight: '700', letterSpacing: -0.8, color: colors.ink },
  retake: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, minHeight: 44 },
  retakeText: { fontSize: 11, lineHeight: 17, color: colors.muted, flexShrink: 1 },
  disclaimer: { fontSize: 10, lineHeight: 17, color: colors.muted, textAlign: 'center' },
  notice: { backgroundColor: colors.amberSoft, borderRadius: 16, padding: 16, gap: 10, flexDirection: 'row', alignItems: 'flex-start' },
  noticeText: { color: colors.amber, flex: 1, fontSize: 12, lineHeight: 19 },
});
