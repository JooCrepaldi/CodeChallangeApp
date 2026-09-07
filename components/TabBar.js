import { useEffect, useState } from 'react';
import { Keyboard, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { RemixIcon } from '../src/RemixIcon';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '../src/theme';

const TABS = [
  { id: 'nova', label: 'Nova', icon: 'add-circle-line' },
  { id: 'historico', label: 'Histórico', icon: 'history-line' },
  { id: 'status', label: 'Status', icon: 'dashboard-line' },
];

export function TabBar({ active, onChange, historicoCount }) {
  const insets = useSafeAreaInsets();
  const [kbVisible, setKbVisible] = useState(false);

  useEffect(() => {
    const show = Keyboard.addListener('keyboardDidShow', () => setKbVisible(true));
    const hide = Keyboard.addListener('keyboardDidHide', () => setKbVisible(false));
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  if (kbVisible) return null;

  return (
    <View style={[styles.bar, { paddingBottom: insets.bottom + 10 }]}>
      {TABS.map((t) => {
          const isActive = active === t.id;
          return (
            <TouchableOpacity
              key={t.id}
              accessibilityRole="tab"
              accessibilityState={{ selected: isActive }}
              style={[styles.item, isActive && styles.itemActive]}
              onPress={() => onChange(t.id)}
              activeOpacity={0.85}
            >
              <View style={styles.iconRow}>
                <RemixIcon
                  name={t.icon}
                  size={24}
                  color={isActive ? theme.colors.primary : theme.colors.muted}
                />
                {t.id === 'historico' && historicoCount > 0 ? (
                  <View style={styles.count}>
                    <Text style={styles.countText}>{historicoCount > 99 ? '99+' : historicoCount}</Text>
                  </View>
                ) : null}
              </View>
              <Text style={[styles.label, isActive && styles.labelActive]}>{t.label}</Text>
            </TouchableOpacity>
          );
        })}
    </View>
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
