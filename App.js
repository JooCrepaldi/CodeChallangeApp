import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import { TabBar } from './components/TabBar';
import { NovaVisita } from './screens/NovaVisita';
import { Historico } from './screens/Historico';
import { Status } from './screens/Status';
import { useStability } from './src/telemetry';
import { useFontesProntas, useGps, useHistorico } from './src/hooks';
import { theme } from './src/theme';

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function App() {
  const pronto = useFontesProntas();
  const [tab, setTab] = useState('nova');
  const { visitas, recarregar, limpar } = useHistorico();
  const gps = useGps();
  const stability = useStability();

  // Atualiza a lista sempre que abrir a aba Histórico.
  useEffect(() => {
    if (tab === 'historico') recarregar();
  }, [tab]);

  async function aoSalvar() {
    await recarregar();
    setTab('historico');
  }

  if (!pronto) return null;

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.root} edges={['top']}>
        <StatusBar style="light" />
        <Cabecalho />

        <View style={styles.content}>
          {tab === 'nova' && (
            <NovaVisita stability={stability} gps={gps} onSaved={aoSalvar} />
          )}
          {tab === 'historico' && (
            <Historico
              data={visitas}
              onReload={recarregar}
              onClear={limpar}
              onNew={() => setTab('nova')}
            />
          )}
          {tab === 'status' && <Status stability={stability} gps={gps.gps} />}
        </View>

        <TabBar active={tab} onChange={setTab} historicoCount={visitas.length} />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

function Cabecalho() {
  return (
    <View style={styles.header}>
      <Text style={styles.title}>🌱 Visitas Técnicas</Text>
      <Text style={styles.subtitle}>Registro agrícola offline</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.colors.bg },
  header: { paddingHorizontal: 16, paddingVertical: 12 },
  title: { fontSize: 22, fontFamily: theme.fonts.bold, color: theme.colors.text },
  subtitle: { fontFamily: theme.fonts.regular, color: theme.colors.muted, marginTop: 2 },
  content: { flex: 1 },
});
