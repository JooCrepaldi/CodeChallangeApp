import { useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { TabBar } from './components/TabBar';
import { NovaVisita } from './screens/NovaVisita';
import { Historico } from './screens/Historico';
import { Status } from './screens/Status';
import { captureLocation } from './src/gps';
import { clearVisitas, listVisitas } from './src/storage';
import { useStability } from './src/telemetry';
import { theme } from './src/theme';

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function App() {
  const [fontsLoaded] = useFonts({
    DMSans_400Regular: require('@expo-google-fonts/dm-sans/400Regular/DMSans_400Regular.ttf'),
    DMSans_500Medium: require('@expo-google-fonts/dm-sans/500Medium/DMSans_500Medium.ttf'),
    DMSans_700Bold: require('@expo-google-fonts/dm-sans/700Bold/DMSans_700Bold.ttf'),
  });

  const hideSplash = useCallback(async () => {
    if (fontsLoaded) await SplashScreen.hideAsync().catch(() => {});
  }, [fontsLoaded]);

  useEffect(() => {
    hideSplash();
  }, [hideSplash]);

  const [tab, setTab] = useState('nova');
  const [historico, setHistorico] = useState([]);

  // Nível Pleno: hook único no topo — evita 2 listeners do Accelerometer
  const stability = useStability();

  // GPS compartilhado entre Nova e Status (RF02)
  const [gps, setGps] = useState(null);
  const [gpsMsg, setGpsMsg] = useState(null);
  const [gpsLoading, setGpsLoading] = useState(false);

  async function reloadHistorico() {
    setHistorico(await listVisitas());
  }

  useEffect(() => {
    reloadHistorico();
  }, []);

  useEffect(() => {
    if (tab === 'historico') reloadHistorico();
  }, [tab]);

  async function onCaptureGps() {
    setGpsLoading(true);
    setGpsMsg(null);
    const res = await captureLocation();
    setGpsLoading(false);
    if (res.ok) {
      setGps(res.location);
    } else {
      setGpsMsg(res.error);
    }
  }

  function onClearGps() {
    setGps(null);
    setGpsMsg(null);
  }

  async function onSaved() {
    await reloadHistorico();
    setTab('historico');
  }

  async function onClearHistorico() {
    await clearVisitas();
    await reloadHistorico();
  }

  if (!fontsLoaded) return null;

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.root} edges={['top']}>
        <StatusBar style="light" />
        <View style={styles.header}>
          <Text style={styles.title}>🌱 Visitas Técnicas</Text>
          <Text style={styles.subtitle}>Registro agrícola • Nível Pleno + RF/RNF</Text>
        </View>

        <View style={styles.content}>
          {tab === 'nova' ? (
            <NovaVisita
              stability={stability}
              gps={gps}
              gpsMsg={gpsMsg}
              gpsLoading={gpsLoading}
              onCaptureGps={onCaptureGps}
              onClearGps={onClearGps}
              onSaved={onSaved}
            />
          ) : tab === 'historico' ? (
            <Historico data={historico} onReload={reloadHistorico} onClear={onClearHistorico} onNew={() => setTab('nova')} />
          ) : (
            <ScrollView>
              <Status stability={stability} gps={gps} />
            </ScrollView>
          )}
        </View>

        <TabBar active={tab} onChange={setTab} historicoCount={historico.length} />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.colors.bg },
  header: { paddingHorizontal: 16, paddingVertical: 12 },
  title: { fontSize: 22, fontFamily: theme.fonts.bold, color: theme.colors.text },
  subtitle: { fontFamily: theme.fonts.regular, color: theme.colors.muted, marginTop: 2 },
  content: { flex: 1 },
});
