import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { RemixIcon } from './RemixIcon';
import { theme } from './theme';

export function Card({ children, style }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function SectionTitle({ icon, title, order }) {
  return (
    <View style={styles.sectionRow}>
      {order != null ? <Text style={styles.order}>{order}</Text> : null}
      <RemixIcon name={icon} size={22} color={theme.colors.primary} />
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );
}

export function Field({ label, style, ...props }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, style]}
        placeholderTextColor={theme.colors.muted}
        {...props}
      />
    </View>
  );
}

export function PrimaryButton({ title, onPress, disabled, danger }) {
  return (
    <TouchableOpacity
      style={[styles.btn, danger ? styles.btnDanger : styles.btnPrimary, disabled && styles.btnDisabled]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.85}
    >
      <Text style={styles.btnText}>{title}</Text>
    </TouchableOpacity>
  );
}

export function GhostButton({ title, onPress }) {
  return (
    <TouchableOpacity style={styles.ghost} onPress={onPress} activeOpacity={0.8}>
      <Text style={styles.ghostText}>{title}</Text>
    </TouchableOpacity>
  );
}

export function Badge({ bg, color, children }) {
  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <Text style={[styles.badgeText, { color: color || '#fff' }]}>{children}</Text>
    </View>
  );
}

export function EmptyState({ title, hint }) {
  return (
    <View style={styles.empty}>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyHint}>{hint}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.card,
    padding: 18,
    gap: 10,
    marginBottom: 14,
  },
  sectionRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  order: { fontFamily: theme.fonts.bold, fontSize: 15, color: theme.colors.primary },
  sectionTitle: { fontSize: 16, fontFamily: theme.fonts.bold, color: theme.colors.text },
  field: { gap: 6, marginTop: 4 },
  label: { fontFamily: theme.fonts.medium, color: theme.colors.text },
  input: {
    borderRadius: theme.radius.input,
    padding: 14,
    backgroundColor: theme.colors.surface2,
    color: theme.colors.text,
    fontFamily: theme.fonts.regular,
  },
  btn: { borderRadius: theme.radius.btn, paddingVertical: 15, paddingHorizontal: 20, alignItems: 'center', minHeight: 56, justifyContent: 'center' },
  btnPrimary: { backgroundColor: theme.colors.primary },
  btnDanger: { backgroundColor: theme.colors.danger },
  btnDisabled: { opacity: 0.5 },
  btnText: { fontFamily: theme.fonts.bold, color: '#06240F', fontSize: 15 },
  ghost: {
    borderRadius: theme.radius.btn,
    paddingVertical: 13,
    paddingHorizontal: 18,
    alignItems: 'center',
    backgroundColor: theme.colors.surface2,
    minHeight: 52,
    justifyContent: 'center',
  },
  ghostText: { fontFamily: theme.fonts.bold, color: theme.colors.text },
  badge: { borderRadius: 12, paddingVertical: 7, paddingHorizontal: 12, alignSelf: 'flex-start' },
  badgeText: { fontFamily: theme.fonts.bold },
  empty: { alignItems: 'center', gap: 6, paddingVertical: 32 },
  emptyTitle: { fontSize: 16, fontFamily: theme.fonts.bold, color: theme.colors.text },
  emptyHint: { fontFamily: theme.fonts.regular, color: theme.colors.muted, textAlign: 'center', paddingHorizontal: 24 },
});
