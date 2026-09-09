import { useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { CameraView } from 'expo-camera';
import { Badge, Button, Card, Field, SectionTitle } from '../src/ui';
import { getGpsLevel } from '../src/gps';
import { saveVisita } from '../src/storage';
import { LIMITE_G } from '../src/constantes';
import { useCameraFoto, useIsWide } from '../src/hooks';
import { theme } from '../src/theme';

// Tela de registro. Recebe estabilidade (acelerômetro) e gps (hook useGps).
export function NovaVisita({ stability, gps, onSaved }) {
  const larga = useIsWide();
  const camera = useCameraFoto();
  const [talhao, setTalhao] = useState('');
  const [cultura, setCultura] = useState('');
  const [observacoes, setObservacoes] = useState('');

  const nivelGps = getGpsLevel(gps.gps?.coords?.accuracy);
  const { gMax, blocked, resetPeak } = stability;

  async function salvar() {
    if (!talhao.trim() || !cultura.trim()) {
      Alert.alert('Campos obrigatórios', 'Informe ao menos o talhão e a cultura.');
      return;
    }
    if (stability.available && blocked) {
      Alert.alert(
        'Aparelho instável',
        `Pico de ${gMax.toFixed(2)}g acima do limite de ${LIMITE_G.toFixed(1)}g. Estabilize e toque em "Resetar pico".`
      );
      return;
    }
    try {
      await saveVisita({
        talhao: talhao.trim(),
        cultura: cultura.trim(),
        observacoes: observacoes.trim(),
        fotoUri: camera.fotoUri,
        gps: gps.gps
          ? {
              latitude: gps.gps.coords.latitude,
              longitude: gps.gps.coords.longitude,
              accuracy: gps.gps.coords.accuracy,
              timestamp: gps.gps.timestamp,
            }
          : null,
        estabilidade: { gMax: Number(gMax.toFixed(2)), sensorOk: stability.available },
      });
      Alert.alert('Visita salva', 'Registro gravado localmente (funciona offline).');
      setTalhao('');
      setCultura('');
      setObservacoes('');
      camera.limparTudo();
      gps.limpar();
      resetPeak();
      onSaved();
    } catch {
      Alert.alert('Erro', 'Não foi possível salvar. Tente novamente.');
    }
  }

  return (
    <ScrollView contentContainerStyle={[styles.body, larga && styles.bodyLarga]}>
      <Text style={[styles.progresso, larga && styles.linhaCheia]}>
        4 passos • trava {LIMITE_G.toFixed(1)}g ativa
      </Text>

      <Card style={larga && styles.metade}>
        <SectionTitle icon="document-text-outline" order="1" title="Dados da visita" />
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

      <SecaoFoto camera={camera} larga={larga} />
      <SecaoGps gps={gps} nivel={nivelGps} larga={larga} />
      <SecaoEstabilidade stability={stability} larga={larga} />

      <View style={larga && styles.linhaCheia}>
        <Button title="Fechar auditoria e salvar offline" onPress={salvar} />
      </View>
    </ScrollView>
  );
}

// Cada seção abaixo é um Card independente para leitura rápida.

function SecaoFoto({ camera, larga }) {
  return (
    <Card style={larga && styles.metade}>
      <SectionTitle icon="camera-outline" order="2" title="Foto da cultura" />
      {!camera.permissao ? (
        <Text style={styles.apagado}>Carregando permissão da câmera…</Text>
      ) : !camera.permissao.granted ? (
        <View style={styles.gap}>
          <Text style={styles.apagado}>Precisamos da câmera para anexar a foto.</Text>
          <Button title="Permitir câmera" onPress={camera.pedirPermissao} />
        </View>
      ) : camera.aberta ? (
        <CameraAberta camera={camera} />
      ) : (
        <CameraFechada camera={camera} />
      )}
      {camera.erro ? <Text style={styles.erro}>{camera.erro}</Text> : null}
    </Card>
  );
}

function CameraAberta({ camera }) {
  return (
    <View style={styles.gap}>
      <CameraView
        ref={camera.cameraRef}
        style={styles.camera}
        facing="back"
        onMountError={() => camera.avisarErro('Não foi possível iniciar a câmera neste aparelho.')}
      />
      <View style={styles.row}>
        <View style={styles.flex}>
          <Button title="Capturar" onPress={camera.tirarFoto} />
        </View>
        <View style={styles.flex}>
          <Button title="Fechar" variant="ghost" onPress={() => camera.setAberta(false)} />
        </View>
      </View>
    </View>
  );
}

function CameraFechada({ camera }) {
  return (
    <View style={styles.gap}>
      {camera.fotoUri ? <Image source={{ uri: camera.fotoUri }} style={styles.thumb} /> : null}
      <View style={styles.row}>
        <View style={styles.flex}>
          <Button
            title={camera.fotoUri ? 'Trocar foto' : 'Abrir câmera'}
            onPress={() => camera.setAberta(true)}
          />
        </View>
        {camera.fotoUri ? (
          <View style={styles.flex}>
            <Button title="Remover" variant="ghost" onPress={camera.removerFoto} />
          </View>
        ) : null}
      </View>
    </View>
  );
}

function SecaoGps({ gps, nivel, larga }) {
  return (
    <Card style={larga && styles.metade}>
      <SectionTitle icon="location-outline" order="3" title="GPS da visita" />
      <Badge nivel={nivel.nivel}>
        Precisão {nivel.titulo} • {nivel.detalhe}
      </Badge>
      {gps.gps ? (
        <Text style={styles.apagado}>
          {gps.gps.coords.latitude.toFixed(6)}, {gps.gps.coords.longitude.toFixed(6)}
        </Text>
      ) : null}
      {gps.mensagem ? <Text style={styles.erro}>{gps.mensagem}</Text> : null}
      <Button
        title={gps.carregando ? 'Capturando…' : 'Capturar GPS'}
        onPress={gps.capturar}
        disabled={gps.carregando}
      />
    </Card>
  );
}

function SecaoEstabilidade({ stability, larga }) {
  const { gMax, blocked, resetPeak } = stability;
  return (
    <Card style={larga && styles.metade}>
      <SectionTitle icon="speedometer-outline" order="4" title="Estabilidade" />
      <Badge nivel={blocked ? 'ruim' : 'ok'}>
        {blocked ? 'BLOQUEADO — estabilize o aparelho' : 'Estável — envio liberado'}
      </Badge>
      <Text style={styles.apagado}>
        Pico atual: {gMax.toFixed(2)}g • limite {LIMITE_G.toFixed(1)}g
      </Text>
      <Button title="Resetar pico" variant="ghost" onPress={resetPeak} />
    </Card>
  );
}

const styles = StyleSheet.create({
  body: { padding: 16, paddingBottom: 32, gap: 4 },
  bodyLarga: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  metade: { width: '48%', minWidth: 300, flexGrow: 1 },
  linhaCheia: { width: '100%' },
  progresso: { fontFamily: theme.fonts.regular, color: theme.colors.muted, marginBottom: 12 },
  apagado: { fontFamily: theme.fonts.regular, color: theme.colors.muted },
  erro: { fontFamily: theme.fonts.regular, color: '#FCA5A5' },
  gap: { gap: 8 },
  row: { flexDirection: 'row', gap: 8 },
  flex: { flex: 1 },
  camera: { height: 260, borderRadius: 20, overflow: 'hidden' },
  thumb: { width: '100%', aspectRatio: 16 / 9, borderRadius: 16, backgroundColor: theme.colors.surface2 },
  multiline: { minHeight: 70, textAlignVertical: 'top' },
});
