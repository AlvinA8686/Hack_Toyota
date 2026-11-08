import React from 'react';
import { Pressable, StyleProp, StyleSheet, Text, TextStyle, View, ViewStyle } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors } from './theme';

export type IconName = React.ComponentProps<typeof Ionicons>['name'];

export function Icon({ name, size = 22, color = colors.ink, style }: {
  name: IconName;
  size?: number;
  color?: string;
  style?: StyleProp<TextStyle>;
}) {
  return <Ionicons name={name} size={size} color={color} style={style} />;
}

export function Button({ label, onPress, variant = 'primary', icon, disabled = false, style }: {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  icon?: IconName;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const foreground = variant === 'primary' ? colors.white : colors.ink;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        variant === 'primary' ? styles.primary : variant === 'secondary' ? styles.secondary : styles.ghost,
        disabled && { opacity: 0.4 },
        pressed && !disabled && { opacity: 0.8, transform: [{ scale: 0.99 }] },
        style,
      ]}
    >
      <Text style={[styles.buttonText, { color: foreground }]}>{label}</Text>
      {icon && <Icon name={icon} color={foreground} size={19} />}
    </Pressable>
  );
}

export function Pill({ label, tone = 'neutral' }: { label: string; tone?: 'red' | 'green' | 'neutral' }) {
  const backgroundColor = tone === 'red' ? colors.redSoft : tone === 'green' ? colors.greenSoft : '#F1F3EF';
  const color = tone === 'red' ? '#C61D2B' : tone === 'green' ? colors.green : colors.muted;
  return <View style={[styles.pill, { backgroundColor }]}><Text style={[styles.pillText, { color }]}>{label}</Text></View>;
}

export function SectionTitle({ eyebrow, title, action, onAction }: {
  eyebrow?: string;
  title: string;
  action?: string;
  onAction?: () => void;
}) {
  return (
    <View style={styles.section}>
      <View style={{ flex: 1, gap: 5 }}>
        {eyebrow && <Text style={styles.eyebrow}>{eyebrow.toUpperCase()}</Text>}
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      {action && onAction && <Pressable accessibilityRole="button" onPress={onAction} style={styles.sectionAction}><Text style={styles.actionText}>{action}</Text><Icon name="arrow-forward" size={15} color={colors.green} /></Pressable>}
    </View>
  );
}

export function InfoRow({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) {
  return <View style={styles.infoRow}><Text style={styles.infoLabel}>{label}</Text><Text style={[styles.infoValue, accent && { color: colors.green }]}>{value}</Text></View>;
}

const styles = StyleSheet.create({
  button: { minHeight: 56, borderRadius: 17, paddingVertical: 16, paddingHorizontal: 22, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  primary: { backgroundColor: colors.red },
  secondary: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line },
  ghost: { backgroundColor: 'transparent' },
  buttonText: { fontSize: 15, lineHeight: 21, fontWeight: '700', letterSpacing: 0.1, flexShrink: 1 },
  pill: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8, alignSelf: 'flex-start' },
  pillText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.6, lineHeight: 14 },
  section: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  eyebrow: { fontSize: 10, fontWeight: '700', letterSpacing: 1.7, color: colors.muted, lineHeight: 15 },
  sectionTitle: { fontSize: 21, lineHeight: 28, fontWeight: '700', letterSpacing: -0.6, color: colors.ink },
  sectionAction: { flexDirection: 'row', alignItems: 'center', gap: 5, minHeight: 44, paddingLeft: 10 },
  actionText: { fontSize: 12, fontWeight: '600', color: colors.green },
  infoRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 20, paddingVertical: 13, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.line },
  infoLabel: { fontSize: 13, lineHeight: 20, color: colors.muted, flex: 1 },
  infoValue: { fontSize: 13, lineHeight: 20, fontWeight: '600', color: colors.ink, textAlign: 'right', flexShrink: 1 },
});
