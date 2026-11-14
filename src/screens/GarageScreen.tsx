import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Profile, money } from '../domain';
import { Button, Icon, InfoRow, Pill, SectionTitle } from '../ui/components';
import { VehiclePhoto } from '../ui/VehiclePhoto';
import { colors } from '../ui/theme';

const SNAPSHOT = '2026-11-07';
const date = (value: string) => new Date(`${value}T12:00:00Z`).toLocaleDateString('en-US', {
  month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC',
});
const number = (value: number) => value.toLocaleString('en-US');
const accountMoney = (value: number | null) => value === null ? 'Not supplied' : value.toLocaleString('en-US', {
  style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2,
});

export function GarageScreen({ profile, onSwitch, onRestart }: {
  profile: Profile;
  onSwitch: () => void;
  onRestart: () => void;
}) {
  const { customer, account, vehicle, situation } = profile;
  const lease = account.contract_type === 'lease';
  const buyout = profile.options.find(option => option.option_id === 'BUYOUT')?.upfront_cost
    ?? (account.residual_value === null ? null : account.residual_value + 350);
  const serviceOverdue = vehicle.next_service_due < SNAPSHOT;
  const warrantyExpired = vehicle.basic_warranty_ends < SNAPSHOT;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
      <SectionTitle eyebrow="THE DETAILS, ALREADY HERE" title="Your garage" action="Switch" onAction={onSwitch} />

      <View style={styles.vehicleCard}>
        <View style={styles.vehicleHeading}>
          <Pill label={lease ? 'YOUR LEASE' : 'YOUR TOYOTA'} tone="green" />
          <Text style={styles.accountId}>{customer.customer_id} · Demo</Text>
        </View>
        <View style={styles.carStage}>
          <VehiclePhoto vehicle={vehicle} height={176} />
          <Text style={styles.illustration}>Model photo · color and trim may vary</Text>
        </View>
        <Text style={styles.modelYear}>{vehicle.model_year} TOYOTA</Text>
        <Text style={styles.vehicleName}>{vehicle.model}</Text>
        <Text style={styles.vehicleTrim}>{vehicle.trim} · {number(vehicle.odometer_now)} miles</Text>
        <View style={styles.vehicleFooter}>
          <View style={styles.footerItem}>
            <Icon name="person-circle-outline" size={18} color={colors.green} />
            <Text style={styles.footerText}>{customer.first_name}'s Toyota</Text>
          </View>
          <View style={styles.footerItem}>
            <Icon name="location-outline" size={15} color={colors.muted} />
            <Text style={styles.footerLocation}>{customer.city}, {customer.state}</Text>
          </View>
        </View>
      </View>

      {vehicle.open_recall === 'Y' && (
        <View style={styles.recallNotice}>
          <Icon name="shield-checkmark-outline" size={24} color="#A52A2E" />
          <View style={styles.noticeText}>
            <Text style={styles.noticeTitle}>An open recall needs attention</Text>
            <Text style={styles.noticeBody}>Your demo account shows an open recall. Contact a Toyota dealer to confirm the repair and availability before your next financial move.</Text>
          </View>
        </View>
      )}

      <View style={styles.section}>
        <SectionTitle title={lease ? 'Your lease, at a glance' : 'Your loan, at a glance'} />
        <View style={styles.card}>
          <View style={styles.paymentHero}>
            <Text style={styles.label}>CURRENT MONTHLY PAYMENT</Text>
            <View style={styles.paymentLine}>
              <Text style={styles.payment}>{accountMoney(account.monthly_payment)}</Text>
              <Text style={styles.perMonth}>/ month</Text>
            </View>
            <Text style={styles.small}>{account.months_remaining} scheduled payments remaining</Text>
          </View>
          <InfoRow label={lease ? 'Lease end' : 'Loan end'} value={date(account.contract_end)} />
          <InfoRow label="Original term" value={`${account.term_months} months`} />
          {lease ? (
            <>
              <InfoRow label="Lease-end buyout estimate" value={money(buyout)} accent />
              <InfoRow label="Residual value" value={money(account.residual_value)} />
              <InfoRow label="Buyout fee in data" value="$350" />
              <Text style={styles.footnote}>Buyout excludes remaining lease payments, taxes, registration, financing, and future ownership costs. It is not today's payoff.</Text>
            </>
          ) : (
            <>
              <InfoRow label="Principal balance" value={accountMoney(account.current_balance)} />
              <InfoRow label="Payoff quote in data" value={accountMoney(account.payoff_quote)} accent />
              <InfoRow label="Current APR" value={account.apr === null ? 'Not supplied' : `${account.apr.toFixed(2)}%`} />
              <Text style={styles.footnote}>The snapshot payoff includes accrued interest and differs from principal balance. Request an updated payoff before making a payment.</Text>
            </>
          )}
        </View>
      </View>

      <View style={styles.section}>
        <SectionTitle title="The road ahead" />
        <View style={styles.card}>
          <InfoRow label="Odometer on account" value={`${number(vehicle.odometer_now)} mi`} />
          <InfoRow label="Estimated annual driving" value={`${number(vehicle.annual_miles_est)} mi`} />
          {lease && account.mileage_allowance_total !== null && (
            <InfoRow label="Total lease allowance" value={`${number(account.mileage_allowance_total)} mi`} />
          )}
          <InfoRow label="Estimated market value" value={money(vehicle.est_market_value_now)} />
          <InfoRow label="Basic warranty ends" value={date(vehicle.basic_warranty_ends)} />
          {warrantyExpired && <Text style={styles.statusNote}>The listed basic warranty end date has passed.</Text>}
          <InfoRow label="Toyota Care ends" value={date(vehicle.toyota_care_ends)} />
          <InfoRow label={serviceOverdue ? 'Service was due' : 'Next service due'} value={date(vehicle.next_service_due)} />
          <InfoRow label="Open recall in data" value={vehicle.open_recall === 'Y' ? 'Yes — contact dealer' : 'None listed'} />
          <Text style={styles.footnote}>Market value is an estimate, not an appraisal. Warranty dates do not confirm coverage or mileage eligibility.</Text>
        </View>
      </View>

      <View style={styles.contextCard}>
        <Icon name="chatbubble-ellipses-outline" color={colors.green} size={23} />
        <Text style={styles.label}>WHAT YOU SHARED</Text>
        <Text style={styles.quote}>“{situation.customer_says}”</Text>
        <Text style={styles.small}>Your quiz answers help us understand what's changed.</Text>
      </View>

      <View style={styles.section}>
        <SectionTitle title="On your terms" />
        <View style={styles.card}>
          <InfoRow label="Preferred contact" value={customer.preferred_channel} />
          <InfoRow label="Marketing permission" value={customer.marketing_consent === 'Y' ? 'Allowed in demo' : 'Not allowed'} />
          <InfoRow label="Autopay on account" value={account.autopay === 'Y' ? 'On' : 'Off'} />
          <Text style={styles.footnote}>Read-only account details. Your choices here do not update a Toyota account or change your marketing preferences.</Text>
        </View>
      </View>

      <Button label="Find my next move" icon="sparkles-outline" onPress={onRestart} />
      <View style={styles.dataNote}>
        <Icon name="lock-closed-outline" size={15} color={colors.muted} />
        <Text style={styles.dataNoteText}>Synthetic demo data · November 7, 2026{ '\n' }No live Toyota account is connected.</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  body: { padding: 24, gap: 24, paddingBottom: 38 },
  section: { gap: 14 },
  vehicleCard: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line, borderRadius: 26, padding: 20, overflow: 'hidden' },
  vehicleHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  accountId: { fontSize: 11, fontWeight: '500', color: colors.muted },
  carStage: { alignItems: 'center', justifyContent: 'center', minHeight: 190, marginVertical: 4 },
  illustration: { position: 'absolute', bottom: 0, right: 0, fontSize: 9, color: '#788576' },
  modelYear: { fontSize: 10, fontWeight: '700', letterSpacing: 1.5, color: colors.green, marginTop: 4 },
  vehicleName: { fontSize: 30, lineHeight: 37, fontWeight: '700', color: colors.ink, letterSpacing: -1, marginTop: 5 },
  vehicleTrim: { fontSize: 13, lineHeight: 20, color: colors.muted, marginTop: 4 },
  vehicleFooter: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 10, borderTopWidth: 1, borderColor: '#D6E0D1', marginTop: 20, paddingTop: 15 },
  footerItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  footerText: { fontSize: 11, fontWeight: '600', color: colors.green },
  footerLocation: { fontSize: 11, color: colors.muted },
  card: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line, borderRadius: 21, paddingHorizontal: 19, paddingVertical: 9 },
  paymentHero: { paddingTop: 10, paddingBottom: 18, borderBottomWidth: 1, borderColor: colors.line, gap: 6 },
  label: { color: colors.muted, fontSize: 10, fontWeight: '700', letterSpacing: 1.3, lineHeight: 16 },
  paymentLine: { flexDirection: 'row', alignItems: 'baseline', gap: 7 },
  payment: { color: colors.ink, fontSize: 34, lineHeight: 43, fontWeight: '700', letterSpacing: -1.2 },
  perMonth: { fontSize: 13, color: colors.muted },
  small: { color: colors.muted, fontSize: 12, lineHeight: 18 },
  footnote: { color: colors.muted, fontSize: 11, lineHeight: 17, paddingVertical: 13 },
  statusNote: { color: colors.amber, fontSize: 11, lineHeight: 17, marginTop: 6 },
  recallNotice: { flexDirection: 'row', gap: 13, backgroundColor: colors.redSoft, borderRadius: 18, padding: 18 },
  noticeText: { flex: 1, gap: 6 },
  noticeTitle: { fontSize: 14, fontWeight: '700', lineHeight: 20, color: '#A52A2E' },
  noticeBody: { color: '#755657', fontSize: 12, lineHeight: 19 },
  contextCard: { borderRadius: 21, backgroundColor: colors.greenSoft, padding: 21, gap: 12 },
  quote: { color: colors.ink, fontSize: 17, lineHeight: 27, fontWeight: '500', letterSpacing: -0.2 },
  dataNote: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'center', gap: 8, paddingHorizontal: 10 },
  dataNoteText: { fontSize: 10, lineHeight: 16, color: colors.muted, textAlign: 'center', flexShrink: 1 },
});
