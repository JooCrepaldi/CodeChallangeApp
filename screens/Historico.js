import { Alert, FlatList, Image, StyleSheet, Text, View } from 'react-native';
import { Badge, Button, Card, EmptyState } from '../src/ui';
import { getGpsLevel } from '../src/gps';
import { useIsWide } from '../src/hooks';
import { theme } from '../src/theme';

// Lista das visitas salvas. Só mostra, não edita.
export function Historico({ data, onReload, onClear, onNew }) {
  const larga = useIsWide();
  const colunas = larga ? 2 : 1;

  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        <View style={styles.flex}>
          <Button title="Recarregar" variant="ghost" onPress={onReload} />
        </View>
        <View style={styles.flex}>
          <Button title="Limpar" variant="ghost" onPress={() => confirmarLimpeza(onClear)} />
        </View>
      </View>

      <FlatList
        key={colunas}
        data={data}
        numColumns={colunas}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        columnWrapperStyle={colunas > 1 ? styles.columns : null}
        ListEmptyComponent={
          <EmptyState title="Nenhuma visita salva" hint="Conclua uma auditoria na aba Nova. O histórico funciona offline." />
        }
        renderItem={({ item }) => <VisitaCard item={item} duasColunas={colunas > 1} />}
      />

      <View style={styles.footer}>
        <Button title="+ Nova visita" onPress={onNew} />
      </View>
    </View>
  );
}

function confirmarLimpeza(onClear) {
  Alert.alert('Limpar?', 'Apagar todos os registros locais?', [
    { text: 'Cancelar', style: 'cancel' },
    { text: 'Apagar', style: 'destructive', onPress: onClear },
  ]);
}

function formatarData(iso) {
  return new Date(iso).toLocaleString('pt-BR');
}

function VisitaCard({ item, duasColunas }) {
  const nivel = getGpsLevel(item.gps?.accuracy);
  const coordenadas = item.gps
    ? ` • ${item.gps.latitude.toFixed(4)}, ${item.gps.longitude.toFixed(4)}`
    : ' • sem GPS';

  return (
    <Card style={duasColunas ? styles.metade : null}>
      <Text style={styles.title}>{item.cultura} • {item.talhao}</Text>
      <Text style={styles.apagado}>{formatarData(item.createdAt)}</Text>
      {item.observacoes ? <Text style={styles.obs}>{item.observacoes}</Text> : null}
      <Badge nivel={nivel.nivel}>
        GPS {nivel.titulo} • {nivel.detalhe}{coordenadas}
      </Badge>
      {item.fotoUri ? <Image source={{ uri: item.fotoUri }} style={styles.thumb} /> : null}
      <Text style={styles.apagado}>Pico estabilidade: {item.estabilidade?.gMax ?? '-'}g</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, padding: 16, gap: 12 },
  row: { flexDirection: 'row', gap: 8 },
  flex: { flex: 1 },
  list: { gap: 12, paddingBottom: 24, paddingTop: 4 },
  columns: { gap: 12 },
  metade: { flex: 1 },
  title: { fontSize: 16, fontFamily: theme.fonts.bold, color: theme.colors.text },
  apagado: { fontFamily: theme.fonts.regular, color: theme.colors.muted },
  obs: { fontFamily: theme.fonts.regular, color: theme.colors.text },
  thumb: { width: '100%', aspectRatio: 16 / 9, borderRadius: 16, backgroundColor: theme.colors.surface2 },
  footer: { paddingBottom: 8 },
});
