import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from './theme';

// Peças visuais usadas nas 3 telas. Uma sola Button e uma sola Badge.

// Caixa padrão das seções.
export function Card({ children, style }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

// Título de seção com ícone e número do passo (1, 2, 3...).
export function SectionTitle({ icon, title, order }) {
  return (
    <View style={styles.sectionRow}>
      {order != null ? <Text style={styles.order}>{order}</Text> : null}
      <Ionicons name={icon} size={22} color={theme.colors.primary} />
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );
}

// Campo de texto com rótulo. Props explícitas para facilitar a leitura.
export function Field({ label, value, onChangeText, placeholder, multiline, style }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, style]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.muted}
        multiline={multiline}
      />
    </View>
  );
}

// Único botão do app. variant: "primary" (verde) ou "ghost" (cinza).
export function Button({ title, onPress, variant = 'primary', disabled }) {
  const isGhost = variant === 'ghost';
  return (
    <TouchableOpacity
      style={[styles.btn, isGhost ? styles.btnGhost : styles.btnPrimary, disabled && styles.btnDisabled]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.85}
    >
      <Text style={[styles.btnText, isGhost && styles.btnTextGhost]}>{title}</Text>
    </TouchableOpacity>
  );
}

const BADGE_COLORS = {
  ok: { bg: '#22C55E', text: '#06240F' },
  medio: { bg: '#FACC15', text: '#422006' },
  ruim: { bg: '#EF4444', text: '#fff' },
};

// Etiqueta colorida. nivel: "ok" | "medio" | "ruim".
export function Badge({ nivel = 'ok', children }) {
  const cores = BADGE_COLORS[nivel] || BADGE_COLORS.ok;
  return (
    <View style={[styles.badge, { backgroundColor: cores.bg }]}>
      <Text style={[styles.badgeText, { color: cores.text }]}>{children}</Text>
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
  btnGhost: { backgroundColor: theme.colors.surface2 },
  btnDisabled: { opacity: 0.5 },
  btnText: { fontFamily: theme.fonts.bold, color: '#06240F', fontSize: 15 },
  btnTextGhost: { color: theme.colors.text },
  badge: { borderRadius: 12, paddingVertical: 7, paddingHorizontal: 12, alignSelf: 'flex-start' },
  badgeText: { fontFamily: theme.fonts.bold },
  empty: { alignItems: 'center', gap: 6, paddingVertical: 32 },
  emptyTitle: { fontSize: 16, fontFamily: theme.fonts.bold, color: theme.colors.text },
  emptyHint: { fontFamily: theme.fonts.regular, color: theme.colors.muted, textAlign: 'center', paddingHorizontal: 24 },
});
