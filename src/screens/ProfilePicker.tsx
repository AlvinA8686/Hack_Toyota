import React, { useMemo, useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Profile, profiles } from '../domain';
import { Icon, Pill } from '../ui/components';
import { colors } from '../ui/theme';

type Filter = 'All' | 'Lease' | 'Loan';

export function ProfilePicker({ visible, currentId, onSelect, onClose }: {
  visible: boolean;
  currentId: string;
  onSelect: (profile: Profile) => void;
  onClose: () => void;
}) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('All');
  const filtered = useMemo(() => profiles.filter(profile => {
    const matchesType = filter === 'All' || profile.account.contract_type === filter.toLowerCase();
    const text = `${profile.customer.first_name} ${profile.customer.customer_id} ${profile.vehicle.model} ${profile.vehicle.model_year}`.toLowerCase();
    return matchesType && text.includes(query.trim().toLowerCase());
  }).sort((a, b) => {
    if (a.customer.customer_id === currentId) return -1;
    if (b.customer.customer_id === currentId) return 1;
    if (a.customer.customer_id === 'C017') return -1;
    if (b.customer.customer_id === 'C017') return 1;
    return a.customer.customer_id.localeCompare(b.customer.customer_id);
  }), [query, filter, currentId]);

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.container}>
          <View style={styles.handle} />
          <View style={styles.header}>
            <View style={styles.headingText}>
              <Text style={styles.eyebrow}>20 STORIES. ONE NEXT MOVE.</Text>
              <Text style={styles.title}>Meet your demo driver</Text>
            </View>
            <Pressable accessibilityRole="button" accessibilityLabel="Close customer picker" onPress={onClose} style={({ pressed }) => [styles.close, pressed && styles.pressed]}>
              <Icon name="close" size={21} />
            </Pressable>
          </View>
          <Text style={styles.subtitle}>Explore a different Toyota story. Switching drivers starts a fresh quiz.</Text>

          <View style={styles.search}>
            <Icon name="search-outline" size={19} color={colors.muted} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Search name, Toyota, or customer ID"
              placeholderTextColor={colors.muted}
              accessibilityLabel="Search demo drivers"
              style={styles.searchInput}
              autoCorrect={false}
              autoCapitalize="none"
              returnKeyType="search"
            />
            {query.length > 0 && <Pressable accessibilityRole="button" accessibilityLabel="Clear search" onPress={() => setQuery('')} style={styles.clear}><Icon name="close-circle" size={19} color={colors.muted} /></Pressable>}
          </View>

          <View style={styles.filterBar}>
            {(['All', 'Lease', 'Loan'] as Filter[]).map(value => (
              <Pressable
                key={value}
                accessibilityRole="button"
                accessibilityLabel={`${value} customers`}
                accessibilityState={{ selected: filter === value }}
                onPress={() => setFilter(value)}
                style={({ pressed }) => [styles.filter, filter === value && styles.filterActive, pressed && styles.pressed]}
              >
                <Text style={[styles.filterText, filter === value && styles.filterTextActive]}>{value}</Text>
              </Pressable>
            ))}
          </View>
          <View style={styles.listHeading}>
            <Text style={styles.listCount}>{filtered.length} {filtered.length === 1 ? 'driver' : 'drivers'}</Text>
            <Text style={styles.listNote}>Synthetic profiles</Text>
          </View>

          <FlatList
            data={filtered}
            keyExtractor={profile => profile.customer.customer_id}
            style={styles.list}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            renderItem={({ item: profile }) => {
              const { customer, account, vehicle } = profile;
              const selected = customer.customer_id === currentId;
              const lease = account.contract_type === 'lease';
              return (
                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  accessibilityLabel={`${customer.first_name}, ${customer.customer_id}, ${vehicle.model_year} ${vehicle.model}, ${account.contract_type}${selected ? ', selected' : ''}`}
                  onPress={() => onSelect(profile)}
                  style={({ pressed }) => [styles.profile, selected && styles.profileSelected, pressed && styles.pressed]}
                >
                  <View style={[styles.avatar, selected && styles.avatarSelected]}>
                    <Text style={[styles.initial, selected && styles.initialSelected]}>{customer.first_name[0]}</Text>
                  </View>
                  <View style={styles.profileText}>
                    <View style={styles.nameLine}>
                      <Text style={styles.name}>{customer.first_name}</Text>
                      <Text style={styles.id}>{customer.customer_id}</Text>
                    </View>
                    <Text style={styles.model}>{vehicle.model_year} {vehicle.model} · {lease ? 'Lease' : 'Loan'}</Text>
                    <View style={styles.tags}>
                      {selected && <Pill label="SELECTED" tone="green" />}
                      {!selected && customer.customer_id === 'C017' && <Pill label="FEATURED STORY" tone="green" />}
                      {vehicle.open_recall === 'Y' && <Pill label="OPEN RECALL" tone="red" />}
                      {account.missed_payments_12m > 0 && <Pill label="PAYMENT SUPPORT" />}
                      {lease && account.months_remaining <= 6 && <Pill label={`${account.months_remaining} MONTHS TO LEASE END`} />}
                    </View>
                  </View>
                  <Icon name={selected ? 'checkmark-circle' : 'chevron-forward'} size={selected ? 22 : 17} color={selected ? colors.green : '#A0A8A0'} />
                </Pressable>
              );
            }}
            ListEmptyComponent={(
              <View style={styles.empty}>
                <Icon name="search-outline" size={32} color={colors.muted} />
                <Text style={styles.emptyTitle}>No drivers found</Text>
                <Text style={styles.emptyText}>Try another name, model, or customer ID.</Text>
              </View>
            )}
            ListFooterComponent={(
              <View style={styles.footer}>
                <Icon name="shield-checkmark-outline" size={16} color={colors.muted} />
                <Text style={styles.footerText}>Made-up people. Real decisions to explore.{ '\n' }Dataset snapshot · November 7, 2026</Text>
              </View>
            )}
          />
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1, width: '100%', maxWidth: 560, alignSelf: 'center', paddingHorizontal: 24 },
  handle: { width: 36, height: 4, borderRadius: 10, backgroundColor: '#D8DED4', alignSelf: 'center', marginTop: 10, marginBottom: 24 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  headingText: { flex: 1, gap: 8 },
  eyebrow: { color: colors.green, fontSize: 9, fontWeight: '700', letterSpacing: 1.7, lineHeight: 14 },
  title: { color: colors.ink, fontSize: 27, lineHeight: 33, fontWeight: '700', letterSpacing: -0.9 },
  close: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#EBEEE7', alignItems: 'center', justifyContent: 'center' },
  subtitle: { color: colors.muted, fontSize: 13, lineHeight: 21, marginTop: 12, marginBottom: 22 },
  search: { flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 52, borderRadius: 15, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line, paddingHorizontal: 15 },
  searchInput: { flex: 1, fontSize: 13, lineHeight: 20, color: colors.ink, minHeight: 50, paddingVertical: 12 },
  clear: { minWidth: 32, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  filterBar: { flexDirection: 'row', padding: 4, borderRadius: 13, backgroundColor: '#EBEEE7', gap: 4, marginTop: 16 },
  filter: { flex: 1, minHeight: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  filterActive: { backgroundColor: colors.white },
  filterText: { color: colors.muted, fontSize: 13, fontWeight: '600' },
  filterTextActive: { color: colors.ink },
  listHeading: { flexDirection: 'row', justifyContent: 'space-between', paddingTop: 22, paddingBottom: 12 },
  listCount: { color: colors.ink, fontSize: 11, fontWeight: '600' },
  listNote: { color: colors.muted, fontSize: 11 },
  list: { flex: 1 },
  listContent: { gap: 10, paddingBottom: 14 },
  profile: { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 18, borderWidth: 1, borderColor: colors.line, paddingVertical: 16, paddingHorizontal: 14, backgroundColor: colors.white },
  profileSelected: { borderColor: '#9FB49C', backgroundColor: '#F1F6EE' },
  avatar: { width: 42, height: 42, borderRadius: 15, backgroundColor: '#F0F2EB', alignItems: 'center', justifyContent: 'center' },
  avatarSelected: { backgroundColor: colors.green },
  initial: { fontSize: 18, fontWeight: '600', color: '#7B8C76' },
  initialSelected: { color: colors.white },
  profileText: { flex: 1, gap: 5 },
  nameLine: { flexDirection: 'row', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' },
  name: { color: colors.ink, fontSize: 15, lineHeight: 20, fontWeight: '700' },
  id: { fontSize: 10, color: colors.muted },
  model: { fontSize: 11, color: colors.muted, lineHeight: 17 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 5, marginTop: 3 },
  pressed: { opacity: 0.75 },
  empty: { paddingVertical: 52, alignItems: 'center', gap: 12 },
  emptyTitle: { color: colors.ink, fontSize: 17, fontWeight: '600' },
  emptyText: { fontSize: 12, color: colors.muted, textAlign: 'center' },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingTop: 22, paddingBottom: 10 },
  footerText: { color: colors.muted, fontSize: 10, lineHeight: 16, textAlign: 'center' },
});
