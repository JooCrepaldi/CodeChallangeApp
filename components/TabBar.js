import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTecladoAberto } from '../src/hooks';
import { theme } from '../src/theme';

const TABS = [
  { id: 'nova', label: 'Nova', icon: 'add-circle-outline' },
  { id: 'historico', label: 'Histórico', icon: 'time-outline' },
  { id: 'status', label: 'Status', icon: 'grid-outline' },
];

export function TabBar({ active, onChange, historicoCount }) {
  const insets = useSafeAreaInsets();
  const tecladoAberto = useTecladoAberto();

  // Esconde a barra enquanto digita para o teclado não cobrir o conteúdo.
  if (tecladoAberto) return null;

  return (
    <View style={[styles.bar, { paddingBottom: insets.bottom + 10 }]}>
      {TABS.map((tab) => (
        <Aba
          key={tab.id}
          tab={tab}
          ativa={active === tab.id}
          contador={tab.id === 'historico' ? historicoCount : 0}
          onPress={() => onChange(tab.id)}
        />
      ))}
    </View>
  );
}

function Aba({ tab, ativa, contador, onPress }) {
  return (
    <TouchableOpacity
      accessibilityRole="tab"
      accessibilityState={{ selected: ativa }}
      style={[styles.item, ativa && styles.itemActive]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <View style={styles.iconRow}>
        <Ionicons
          name={tab.icon}
          size={24}
          color={ativa ? theme.colors.primary : theme.colors.muted}
        />
        {contador > 0 ? (
          <View style={styles.count}>
            <Text style={styles.countText}>{contador > 99 ? '99+' : contador}</Text>
          </View>
        ) : null}
      </View>
      <Text style={[styles.label, ativa && styles.labelActive]}>{tab.label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    gap: 4,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 12,
    paddingTop: 10,
  },
  item: {
    flex: 1,
    minHeight: 64,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    paddingVertical: 8,
  },
  itemActive: { backgroundColor: 'rgba(34, 197, 94, 0.14)' },
  iconRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  label: { fontSize: 12, fontFamily: theme.fonts.medium, color: theme.colors.muted },
  labelActive: { color: theme.colors.text },
  count: {
    backgroundColor: theme.colors.primary,
    borderRadius: 999,
    paddingHorizontal: 7,
    paddingVertical: 1,
  },
  countText: { fontSize: 11, fontFamily: theme.fonts.bold, color: '#06240F' },
});
