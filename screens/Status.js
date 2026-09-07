import { StyleSheet, Text, View } from 'react-native';
import { Badge, Card, SectionTitle } from '../src/ui';
import { getGpsLevel } from '../src/gps';
import { BLOCK_THRESHOLD_G } from '../src/telemetry';
import { theme } from '../src/theme';

// Monitor somente-leitura: sem botões de ação.
// Captura de GPS, reset de pico e salvamento vivem na aba Nova (registro).
export function Status({ stability, gps }) {
  const { gCurrent, gMax, available, blocked } = stability;
  const lvl = getGpsLevel(gps?.coords?.accuracy);
  const gPct = Math.min(gCurrent / 3, 1);

  return (
    <View style={styles.wrap}>
      <Card>
        <SectionTitle icon="cpu-line" title="Sensores ao vivo" />
        {!available ? (
          <Text style={styles.muted}>Acelerômetro indisponível neste aparelho — envio liberado com aviso.</Text>
        ) : (
          <View style={styles.gap}>
            <Text style={styles.g}>Atual {gCurrent.toFixed(2)}g • Pico {gMax.toFixed(2)}g</Text>
            <View style={styles.meter}>
              <View style={[styles.fill, { width: `${Math.round(gPct * 100)}%`, backgroundColor: blocked ? theme.colors.danger : theme.colors.primary }]} />
              <View style={[styles.marker, { left: `${(BLOCK_THRESHOLD_G / 3) * 100}%` }]} />
            </View>
            <Badge bg={blocked ? theme.colors.danger : theme.colors.primary} color={blocked ? '#fff' : '#06240F'}>
              {blocked ? 'BLOQUEADO — acima de 2.0g' : 'Estável — abaixo de 2.0g'}
            </Badge>
            <Text style={styles.hint}>Para resetar o pico, use a aba Nova antes de fechar a auditoria.</Text>
          </View>
        )}
      </Card>

      <Card>
        <SectionTitle icon="compass-3-line" title="GPS e precisão" />
        <Badge bg={lvl.bg} color={lvl.color}>Precisão {lvl.label} • {lvl.hint}</Badge>
        {gps ? (
          <Text style={styles.coords}>{gps.coords.latitude.toFixed(6)}, {gps.coords.longitude.toFixed(6)}</Text>
        ) : (
          <Text style={styles.muted}>Nenhuma posição capturada ainda. Capture na aba Nova.</Text>
        )}
        <Text style={styles.hint}>Verde &lt; 10m • Amarelo 10–30m • Vermelho &gt; 30m (RF02)</Text>
      </Card>

      <Card>
        <SectionTitle icon="shield-check-line" title="Saúde do aparelho (RNF01)" />
        <Text style={styles.row}>• Acelerômetro: {available ? 'disponível' : 'indisponível (modo degradado)'}</Text>
        <Text style={styles.row}>• GPS: {gps ? 'posição válida' : 'aguardando captura'}</Text>
        <Text style={styles.row}>• Armazenamento: AsyncStorage local, funciona offline</Text>
        <Text style={styles.hint}>Sem GPS ou sem câmera o app continua — apenas avisa e permite concluir.</Text>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, padding: 16, gap: 4 },
  gap: { gap: 10 },
  g: { fontSize: 18, fontFamily: theme.fonts.bold, color: theme.colors.text, fontVariant: ['tabular-nums'] },
  meter: { height: 12, borderRadius: 6, backgroundColor: theme.colors.surface2, overflow: 'hidden', position: 'relative' },
  fill: { height: '100%', borderRadius: 6 },
  marker: { position: 'absolute', top: 0, bottom: 0, width: 2, backgroundColor: '#fff', opacity: 0.8 },
  coords: { fontFamily: theme.fonts.regular, color: theme.colors.text, fontVariant: ['tabular-nums'] },
  muted: { fontFamily: theme.fonts.regular, color: theme.colors.muted },
  row: { fontFamily: theme.fonts.regular, color: theme.colors.text },
  hint: { fontFamily: theme.fonts.regular, color: theme.colors.muted, fontSize: 12 },
});
