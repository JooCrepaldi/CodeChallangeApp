import { Alert, FlatList, Image, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { Badge, Card, EmptyState, GhostButton, PrimaryButton } from '../src/ui';
import { getGpsLevel } from '../src/gps';
import { theme } from '../src/theme';

export function Historico({ data, onReload, onClear, onNew }) {
  const { width } = useWindowDimensions();
  const numColumns = width > 600 ? 2 : 1;

  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        <View style={styles.flex}><GhostButton title="Recarregar" onPress={onReload} /></View>
        <View style={styles.flex}>
          <GhostButton
            title="Limpar"
            onPress={() =>
              Alert.alert('Limpar?', 'Apagar todos os registros locais?', [
                { text: 'Cancelar', style: 'cancel' },
                { text: 'Apagar', style: 'destructive', onPress: onClear },
              ])
            }
          />
        </View>
      </View>
      <FlatList
        key={numColumns}
        data={data}
        numColumns={numColumns}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        columnWrapperStyle={numColumns > 1 ? styles.columns : null}
        ListEmptyComponent={
          <EmptyState title="Nenhuma visita salva" hint="Conclua uma auditoria na aba Nova. O histórico funciona offline." />
        }
        renderItem={({ item }) => {
          const lvl = getGpsLevel(item.gps?.accuracy);
          return (
            <Card style={numColumns > 1 ? styles.half : null}>
              <Text style={styles.title}>{item.cultura} • {item.talhao}</Text>
              <Text style={styles.muted}>{new Date(item.createdAt).toLocaleString('pt-BR')}</Text>
              {item.observacoes ? <Text style={styles.obs}>{item.observacoes}</Text> : null}
              <Badge bg={lvl.bg} color={lvl.color}>
                GPS {lvl.label} • {lvl.hint}{item.gps ? ` • ${item.gps.latitude.toFixed(4)}, ${item.gps.longitude.toFixed(4)}` : ' • sem GPS'}
              </Badge>
              {item.fotoUri ? <Image source={{ uri: item.fotoUri }} style={styles.thumb} /> : null}
              <Text style={styles.muted}>Pico estabilidade: {item.estabilidade?.gMax ?? '-'}g</Text>
            </Card>
          );
        }}
      />
      <View style={styles.footer}>
        <PrimaryButton title="+ Nova visita" onPress={onNew} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, padding: 16, gap: 12 },
  row: { flexDirection: 'row', gap: 8 },
  flex: { flex: 1 },
  list: { gap: 12, paddingBottom: 24, paddingTop: 4 },
  columns: { gap: 12 },
  half: { flex: 1 },
  title: { fontSize: 16, fontFamily: theme.fonts.bold, color: theme.colors.text },
  muted: { fontFamily: theme.fonts.regular, color: theme.colors.muted },
  obs: { fontFamily: theme.fonts.regular, color: theme.colors.text },
  thumb: { width: '100%', aspectRatio: 16 / 9, borderRadius: 16, backgroundColor: theme.colors.surface2 },
  footer: { paddingBottom: 8 },
});
