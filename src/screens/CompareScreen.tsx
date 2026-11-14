import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Decision, money, RankedOption } from '../domain';
import { Button, Icon, InfoRow, Pill } from '../ui/components';
import { colors } from '../ui/theme';

interface Props { decision: Decision; onAction: (option: RankedOption) => void }
const statusLabels: Record<RankedOption['status'], string> = { eligible: 'ELIGIBLE IN DATASET', review: 'REVIEW NEEDED', planning: 'FUTURE PLANNING', unavailable: 'NOT ELIGIBLE' };

export function CompareScreen({ decision, onAction }: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(decision.recommended.id);
  const lease = decision.allOptions.some(option => ['RETURN', 'BUYOUT', 'RENEW'].includes(option.id));
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
      <View style={styles.heading}>
        <Text style={styles.eyebrow}>YOUR OPTIONS, SIDE BY SIDE</Text>
        <Text style={styles.title}>A little clarity.{"\n"}A better next move.</Text>
        <Text style={styles.subtitle}>The best fit for you comes first. Explore every available path and the trade-offs behind it.</Text>
      </View>
      <View style={styles.notice}><Icon name="information-circle-outline" size={22} color={colors.green} /><Text style={styles.noticeText}>{lease ? 'These figures cover different costs and time periods. A buyout price, return fee, and new lease quote are not equivalent total costs.' : 'Compare the monthly change and full remaining cost together. A smaller payment can mean a longer loan and more total interest.'}</Text></View>
      {decision.noEligibleOffer && <View style={styles.noOffer}><Icon name="leaf-outline" size={19} color={colors.green} /><Text style={styles.noOfferText}>No suitable eligible product offer is being recommended now. There may still be a useful service or support step.</Text></View>}

      <View style={styles.list}>
        {decision.allOptions.map(option => {
          const expanded = expandedId === option.id;
          const recommended = option.id === decision.recommended.id;
          const unavailable = option.status === 'unavailable';
          const difference = option.totalDifference;
          return <View style={[styles.option, recommended && styles.recommended, unavailable && styles.unavailable]} key={option.id}>
            {recommended && <View style={styles.recommendationStrip}><Icon name="sparkles-outline" size={13} color={colors.white} /><Text style={styles.recommendationText}>YOUR RECOMMENDED NEXT MOVE</Text></View>}
            <Pressable accessibilityRole="button" accessibilityState={{ expanded }} onPress={() => setExpandedId(expanded ? null : option.id)} style={styles.optionHeader}>
              <View style={{ flex: 1, gap: 10 }}>
                <Pill label={statusLabels[option.status]} tone={option.status === 'eligible' ? 'green' : 'neutral'} />
                <Text style={styles.optionTitle}>{option.title}</Text>
                <Text style={styles.optionMetricLabel}>{option.metricLabel}</Text>
                <Text style={[styles.optionMetric, option.metricValue.length > 18 && { fontSize: 23 }]}>{option.metricValue}</Text>
              </View>
              <View style={styles.toggle}><Icon name={expanded ? 'remove' : 'add'} size={20} color={colors.green} /></View>
            </Pressable>
            {expanded && <View style={styles.details}>
              <Text style={styles.summary}>{option.summary}</Text>
              {!['HUMAN', 'SERVICE'].includes(option.id) && <View style={styles.costs}>
                <InfoRow label={option.id === 'RETURN' ? 'After returning' : 'Monthly payment'} value={option.id === 'RETURN' ? 'No vehicle included' : money(option.monthly)} />
                <InfoRow label={option.id === 'BUYOUT' ? 'Lease-end purchase price' : 'Listed upfront estimate'} value={money(option.upfront)} />
                {difference != null && <InfoRow label={difference < 0 ? 'Estimated total cost reduction' : difference > 0 ? 'Estimated total cost increase' : 'Estimated cost change'} value={money(Math.abs(difference))} accent={difference < 0} />}
                {difference != null && <Text style={styles.comparisonLabel}>vs keeping current contract · dataset estimate</Text>}
                {difference == null && !['HUMAN', 'SERVICE'].includes(option.id) && <Text style={styles.comparisonLabel}>Comparable full cost: quote needed</Text>}
              </View>}
              <View style={styles.tradeoff}><Icon name="swap-horizontal-outline" size={18} color={colors.green} /><View style={{ flex: 1, gap: 5 }}><Text style={styles.tradeoffTitle}>The trade-off</Text><Text style={styles.tradeoffText}>{option.tradeoff}</Text></View></View>
              {option.caveats.length > 0 && <View style={styles.caveats}><Text style={styles.caveatTitle}>{unavailable ? 'Why this needs a different path' : 'Before you decide'}</Text>{option.caveats.map((caveat, index) => <View key={index} style={styles.bulletRow}><Text style={styles.bullet}>•</Text><Text style={styles.caveat}>{caveat}</Text></View>)}</View>}
              {option.source?.key_assumption && <Text style={styles.sourceAssumption}>Source assumption: {option.source.key_assumption}</Text>}
              {!unavailable && <Button label={option.status === 'review' ? 'Prepare for a specialist review' : option.nextStep.label} variant={recommended ? 'primary' : 'secondary'} icon="arrow-forward" onPress={() => onAction(option)} />}
              {unavailable && <View style={styles.unavailableNote}><Icon name="lock-closed-outline" size={15} color={colors.muted} /><Text style={styles.unavailableNoteText}>Not currently eligible in this snapshot.</Text></View>}
            </View>}
          </View>;
        })}
      </View>
      <View style={styles.footer}><Icon name="shield-checkmark-outline" size={20} color={colors.green} /><Text style={styles.footerText}>Eligibility comes before preference. Consent and account safeguards determine which options appear here.</Text></View>
      <Text style={styles.disclaimer}>Synthetic dataset estimates, not actual Toyota financing or a verified offer. Taxes, fees, insurance, and costs not included in a scenario need confirmation. The demo submits no applications or account changes.</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 24, gap: 24, paddingBottom: 40 },
  heading: { gap: 14 },
  eyebrow: { fontSize: 10, lineHeight: 16, fontWeight: '700', letterSpacing: 1.7, color: colors.green },
  title: { fontSize: 31, lineHeight: 37, fontWeight: '700', color: colors.ink, letterSpacing: -1.1 },
  subtitle: { fontSize: 13, lineHeight: 21, color: colors.muted },
  notice: { backgroundColor: '#EAF0E5', borderRadius: 18, padding: 17, flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  noticeText: { fontSize: 11, lineHeight: 18, color: '#50634E', flex: 1 },
  noOffer: { flexDirection: 'row', gap: 9, paddingHorizontal: 3, alignItems: 'flex-start' },
  noOfferText: { flex: 1, fontSize: 12, lineHeight: 20, color: colors.muted },
  list: { gap: 16 },
  option: { backgroundColor: colors.white, borderRadius: 22, borderWidth: 1, borderColor: colors.line, overflow: 'hidden' },
  recommended: { borderColor: colors.green },
  unavailable: { backgroundColor: '#F3F4F0' },
  recommendationStrip: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, backgroundColor: colors.green, paddingVertical: 10, paddingHorizontal: 14 },
  recommendationText: { color: colors.white, fontSize: 9, lineHeight: 14, fontWeight: '700', letterSpacing: 1.1 },
  optionHeader: { padding: 20, flexDirection: 'row', alignItems: 'flex-start', gap: 9, minHeight: 70 },
  optionTitle: { fontSize: 21, lineHeight: 28, fontWeight: '700', color: colors.ink, letterSpacing: -0.5 },
  optionMetricLabel: { fontSize: 11, lineHeight: 17, color: colors.muted, marginTop: 2 },
  optionMetric: { fontSize: 29, lineHeight: 35, color: colors.ink, letterSpacing: -1, fontWeight: '600', marginTop: -6 },
  toggle: { backgroundColor: '#F0F4EC', width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  details: { padding: 20, paddingTop: 0, gap: 17 },
  summary: { color: '#59695E', fontSize: 12, lineHeight: 21 },
  costs: { borderTopWidth: 1, borderTopColor: colors.line, paddingTop: 4 },
  comparisonLabel: { fontSize: 9, lineHeight: 15, color: colors.muted, marginTop: 9 },
  tradeoff: { backgroundColor: '#F3F5EF', borderRadius: 13, padding: 14, flexDirection: 'row', gap: 9 },
  tradeoffTitle: { fontSize: 11, fontWeight: '700', color: colors.green, lineHeight: 16 },
  tradeoffText: { fontSize: 11, lineHeight: 18, color: '#596B59' },
  caveats: { gap: 9 },
  caveatTitle: { fontSize: 12, fontWeight: '600', color: colors.ink, marginBottom: 2 },
  bulletRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 7 },
  bullet: { fontSize: 12, lineHeight: 18, color: colors.muted },
  caveat: { fontSize: 11, lineHeight: 18, color: colors.muted, flex: 1 },
  sourceAssumption: { fontSize: 10, lineHeight: 17, color: colors.muted, paddingTop: 5, borderTopWidth: 1, borderTopColor: colors.line },
  unavailableNote: { flexDirection: 'row', alignItems: 'center', gap: 7, paddingVertical: 9 },
  unavailableNoteText: { fontSize: 11, lineHeight: 18, color: colors.muted, flex: 1 },
  footer: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  footerText: { fontSize: 11, lineHeight: 18, color: colors.muted, flex: 1 },
  disclaimer: { fontSize: 10, lineHeight: 17, color: colors.muted, textAlign: 'center' },
});
