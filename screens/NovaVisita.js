import { useRef, useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Badge, Card, Field, GhostButton, PrimaryButton, SectionTitle } from '../src/ui';
import { getGpsLevel } from '../src/gps';
import { saveVisita } from '../src/storage';
import { BLOCK_THRESHOLD_G } from '../src/telemetry';
import { theme } from '../src/theme';

export function NovaVisita({ stability, gps, gpsMsg, gpsLoading, onCaptureGps, onClearGps, onSaved }) {
  const { width } = useWindowDimensions();
  const isWide = width > 600;

  const [talhao, setTalhao] = useState('');
  const [cultura, setCultura] = useState('');
  const [observacoes, setObservacoes] = useState('');

  const [camPerm, requestCamPerm] = useCameraPermissions();
  const [camOpen, setCamOpen] = useState(false);
  const [camError, setCamError] = useState(null);
  const [fotoUri, setFotoUri] = useState(null);
  const cameraRef = useRef(null);

  const gpsLevel = getGpsLevel(gps?.coords?.accuracy);
  const { gMax, blocked, resetPeak } = stability;

  async function tirarFoto() {
    try {
      setCamError(null);
      if (!cameraRef.current) {
        setCamError('Câmera ainda não está pronta. Aguarde um instante.');
        return;
      }
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.5 });
      if (photo?.uri) {
        setFotoUri(photo.uri);
        setCamOpen(false);
      } else {
        setCamError('Não foi possível capturar a foto neste dispositivo.');
      }
    } catch {
      setCamError('Câmera indisponível neste aparelho. Você pode concluir sem foto.');
    }
  }

  async function onFechar() {
    if (!talhao.trim() || !cultura.trim()) {
      Alert.alert('Campos obrigatórios', 'Informe ao menos o talhão e a cultura.');
      return;
    }
    if (stability.available && blocked) {
      Alert.alert(
        'Instabilidade Física Detectada',
        `Pico de ${gMax.toFixed(2)}g acima do limite de ${BLOCK_THRESHOLD_G.toFixed(1)}g. Estabilize o aparelho e toque em "Resetar pico" antes de enviar.`
      );
      return;
    }
    try {
      await saveVisita({
        talhao: talhao.trim(),
        cultura: cultura.trim(),
        observacoes: observacoes.trim(),
        fotoUri,
        gps: gps
          ? {
              latitude: gps.coords.latitude,
              longitude: gps.coords.longitude,
              accuracy: gps.coords.accuracy,
              timestamp: gps.timestamp,
            }
          : null,
        estabilidade: { gMax: Number(gMax.toFixed(2)), sensorOk: stability.available },
      });
      Alert.alert('Visita salva', 'Registro gravado localmente (funciona offline).');
      setTalhao('');
      setCultura('');
      setObservacoes('');
      setFotoUri(null);
      onClearGps();
      resetPeak();
      onSaved();
    } catch {
      Alert.alert('Erro', 'Não foi possível salvar. Tente novamente.');
    }
  }

  return (
    <ScrollView contentContainerStyle={[styles.body, isWide && styles.bodyWide]}>
      <View style={[styles.progress, isWide && styles.fullRow]}>
        <Text style={styles.progressText}>4 passos • trava 2.0g ativa</Text>
      </View>

      <Card style={isWide && styles.half}>
        <SectionTitle icon="file-text-line" order="1" title="Dados da visita" />
        <Field label="Talhão *" value={talhao} onChangeText={setTalhao} placeholder="Ex: Talhão 12 - Norte" />
        <Field label="Cultura *" value={cultura} onChangeText={setCultura} placeholder="Ex: Milho safrinha" />
        <Field
          label="Observações"
          value={observacoes}
          onChangeText={setObservacoes}
          placeholder="Ex: sinais de lagarta, solo úmido..."
          multiline
          style={styles.multiline}
        />
      </Card>

      <Card style={isWide && styles.half}>
        <SectionTitle icon="camera-line" order="2" title="Foto da cultura" />
        {!camPerm ? (
          <Text style={styles.muted}>Carregando permissão da câmera…</Text>
        ) : !camPerm.granted ? (
          <View style={styles.gap}>
            <Text style={styles.muted}>Precisamos da câmera para anexar a foto.</Text>
            <PrimaryButton title="Permitir câmera" onPress={requestCamPerm} />
          </View>
        ) : camOpen ? (
          <View style={styles.gap}>
            <CameraView
              ref={cameraRef}
              style={styles.camera}
              facing="back"
              onMountError={() => setCamError('Não foi possível iniciar a câmera neste aparelho.')}
            />
            <View style={styles.row}>
              <View style={styles.flex}><PrimaryButton title="Capturar" onPress={tirarFoto} /></View>
              <View style={styles.flex}><GhostButton title="Fechar" onPress={() => setCamOpen(false)} /></View>
            </View>
          </View>
        ) : (
          <View style={styles.gap}>
            {fotoUri ? <Image source={{ uri: fotoUri }} style={styles.thumb} /> : null}
            <View style={styles.row}>
              <View style={styles.flex}>
                <PrimaryButton title={fotoUri ? 'Trocar foto' : 'Abrir câmera'} onPress={() => setCamOpen(true)} />
              </View>
              {fotoUri ? (
                <View style={styles.flex}><GhostButton title="Remover" onPress={() => setFotoUri(null)} /></View>
              ) : null}
            </View>
          </View>
        )}
        {camError ? <Text style={styles.error}>{camError}</Text> : null}
      </Card>

      <Card style={isWide && styles.half}>
        <SectionTitle icon="map-pin-line" order="3" title="GPS da visita" />
        <Badge bg={gpsLevel.bg} color={gpsLevel.color}>
          Precisão {gpsLevel.label} • {gpsLevel.hint}
        </Badge>
        {gps ? (
          <Text style={styles.muted}>
            {gps.coords.latitude.toFixed(6)}, {gps.coords.longitude.toFixed(6)}
          </Text>
        ) : null}
        {gpsMsg ? <Text style={styles.error}>{gpsMsg}</Text> : null}
        <PrimaryButton title={gpsLoading ? 'Capturando…' : 'Capturar GPS'} onPress={onCaptureGps} disabled={gpsLoading} />
      </Card>

      <Card style={isWide && styles.half}>
        <SectionTitle icon="speed-up-line" order="4" title="Estabilidade" />
        <Badge bg={blocked ? theme.colors.danger : theme.colors.primary} color={blocked ? '#fff' : '#06240F'}>
          {blocked ? 'BLOQUEADO — estabilize o aparelho' : 'Estável — envio liberado'}
        </Badge>
        <Text style={styles.muted}>Pico atual: {gMax.toFixed(2)}g • limite {BLOCK_THRESHOLD_G.toFixed(1)}g</Text>
        <GhostButton title="Resetar pico" onPress={resetPeak} />
      </Card>

      <View style={isWide && styles.fullRow}>
        <PrimaryButton title="Fechar auditoria e salvar offline" onPress={onFechar} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  body: { padding: 16, paddingBottom: 32, gap: 4 },
  bodyWide: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  half: { width: '48%', minWidth: 300, flexGrow: 1 },
  fullRow: { width: '100%' },
  progress: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  progressText: { fontFamily: theme.fonts.regular, color: theme.colors.muted, marginLeft: 6 },
  muted: { fontFamily: theme.fonts.regular, color: theme.colors.muted },
  error: { fontFamily: theme.fonts.regular, color: '#FCA5A5' },
  gap: { gap: 8 },
  row: { flexDirection: 'row', gap: 8 },
  flex: { flex: 1 },
  camera: { height: 260, borderRadius: 20, overflow: 'hidden' },
  thumb: { width: '100%', aspectRatio: 16 / 9, borderRadius: 16, backgroundColor: theme.colors.surface2 },
  multiline: { minHeight: 70, textAlignVertical: 'top' },
});
