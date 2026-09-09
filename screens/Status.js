import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Badge, Card, SectionTitle } from '../src/ui';
import { getGpsLevel } from '../src/gps';
import { ESCALA_G_MAX, LIMITE_G } from '../src/constantes';
import { theme } from '../src/theme';

// Tela só de leitura: mostra sensores, GPS e saúde do aparelho.
// Ações (capturar GPS, resetar pico) ficam na aba Nova.
export function Status({ stability, gps }) {
  const { gCurrent, gMax, available, blocked } = stability;
  const nivel = getGpsLevel(gps?.coords?.accuracy);
  const preenchido = Math.min(gCurrent / ESCALA_G_MAX, 1);

  return (
    <ScrollView contentContainerStyle={styles.wrap}>
      <Card>
        <SectionTitle icon="hardware-chip-outline" title="Sensores ao vivo" />
        {!available ? (
          <Text style={styles.apagado}>Acelerômetro indisponível neste aparelho — envio liberado com aviso.</Text>
        ) : (
          <View style={styles.gap}>
            <Text style={styles.g}>Atual {gCurrent.toFixed(2)}g • Pico {gMax.toFixed(2)}g</Text>
            <View style={styles.meter}>
              <View
                style={[
                  styles.fill,
                  {
                    width: `${Math.round(preenchido * 100)}%`,
                    backgroundColor: blocked ? theme.colors.danger : theme.colors.primary,
                  },
                ]}
              />
              <View style={[styles.marker, { left: `${(LIMITE_G / ESCALA_G_MAX) * 100}%` }]} />
            </View>
            <Badge nivel={blocked ? 'ruim' : 'ok'}>
              {blocked ? `BLOQUEADO — acima de ${LIMITE_G.toFixed(1)}g` : `Estável — abaixo de ${LIMITE_G.toFixed(1)}g`}
            </Badge>
            <Text style={styles.dica}>Para resetar o pico, use a aba Nova antes de fechar a auditoria.</Text>
          </View>
        )}
      </Card>

      <Card>
        <SectionTitle icon="compass-outline" title="GPS e precisão" />
        <Badge nivel={nivel.nivel}>Precisão {nivel.titulo} • {nivel.detalhe}</Badge>
        {gps ? (
          <Text style={styles.coords}>{gps.coords.latitude.toFixed(6)}, {gps.coords.longitude.toFixed(6)}</Text>
        ) : (
          <Text style={styles.apagado}>Nenhuma posição capturada ainda. Capture na aba Nova.</Text>
        )}
        <Text style={styles.dica}>Verde &lt; 10m • Amarelo 10–30m • Vermelho &gt; 30m</Text>
      </Card>

      <Card>
        <SectionTitle icon="shield-checkmark-outline" title="Saúde do aparelho" />
        <Text style={styles.linha}>• Acelerômetro: {available ? 'disponível' : 'indisponível (modo degradado)'}</Text>
        <Text style={styles.linha}>• GPS: {gps ? 'posição válida' : 'aguardando captura'}</Text>
        <Text style={styles.linha}>• Armazenamento: AsyncStorage local, funciona offline</Text>
        <Text style={styles.dica}>Sem GPS ou sem câmera o app continua — apenas avisa e permite concluir.</Text>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrap: { padding: 16, gap: 4, paddingBottom: 32 },
  gap: { gap: 10 },
  g: { fontSize: 18, fontFamily: theme.fonts.bold, color: theme.colors.text, fontVariant: ['tabular-nums'] },
  meter: { height: 12, borderRadius: 6, backgroundColor: theme.colors.surface2, overflow: 'hidden', position: 'relative' },
  fill: { height: '100%', borderRadius: 6 },
  marker: { position: 'absolute', top: 0, bottom: 0, width: 2, backgroundColor: '#fff', opacity: 0.8 },
  coords: { fontFamily: theme.fonts.regular, color: theme.colors.text, fontVariant: ['tabular-nums'] },
  apagado: { fontFamily: theme.fonts.regular, color: theme.colors.muted },
  linha: { fontFamily: theme.fonts.regular, color: theme.colors.text },
  dica: { fontFamily: theme.fonts.regular, color: theme.colors.muted, fontSize: 12 },
});
