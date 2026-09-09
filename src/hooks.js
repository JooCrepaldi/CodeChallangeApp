import { useEffect, useRef, useState } from 'react';
import { Keyboard, useWindowDimensions } from 'react-native';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useCameraPermissions } from 'expo-camera';
import { LARGURA_TABLET, QUALIDADE_FOTO } from './constantes';
import { captureLocation } from './gps';
import { clearVisitas, listVisitas } from './storage';

// Cada hook abaixo resolve um pedaço do App para as telas ficarem simples.

// true quando a tela é larga (tablet/web). Usado para 2 colunas.
export function useIsWide() {
  const { width } = useWindowDimensions();
  return width > LARGURA_TABLET;
}

// Carrega as fontes e esconde a splash quando termina (com erro ou não).
// Segue a doc Expo v57: useFonts + SplashScreen.hideAsync.
export function useFontesProntas() {
  const [carregou, erro] = useFonts({
    DMSans_400Regular: require('@expo-google-fonts/dm-sans/400Regular/DMSans_400Regular.ttf'),
    DMSans_500Medium: require('@expo-google-fonts/dm-sans/500Medium/DMSans_500Medium.ttf'),
    DMSans_700Bold: require('@expo-google-fonts/dm-sans/700Bold/DMSans_700Bold.ttf'),
  });

  useEffect(() => {
    if (carregou || erro) SplashScreen.hideAsync().catch(() => {});
  }, [carregou, erro]);

  return carregou || !!erro;
}

// Lista de visitas salvas no AsyncStorage.
export function useHistorico() {
  const [visitas, setVisitas] = useState([]);

  async function recarregar() {
    setVisitas(await listVisitas());
  }

  async function limpar() {
    await clearVisitas();
    await recarregar();
  }

  useEffect(() => {
    recarregar();
  }, []);

  return { visitas, recarregar, limpar };
}

// GPS compartilhado entre Nova e Status. Nunca estoura erro na tela.
export function useGps() {
  const [gps, setGps] = useState(null);
  const [mensagem, setMensagem] = useState(null);
  const [carregando, setCarregando] = useState(false);

  async function capturar() {
    setCarregando(true);
    setMensagem(null);
    const res = await captureLocation();
    setCarregando(false);
    if (res.ok) setGps(res.location);
    else setMensagem(res.error);
  }

  function limpar() {
    setGps(null);
    setMensagem(null);
  }

  return { gps, mensagem, carregando, capturar, limpar };
}

// Foto da cultura. Guarda permissão, preview e arquivo em um lugar só.
export function useCameraFoto() {
  const [permissao, pedirPermissao] = useCameraPermissions();
  const [aberta, setAberta] = useState(false);
  const [erro, setErro] = useState(null);
  const [fotoUri, setFotoUri] = useState(null);
  const cameraRef = useRef(null);

  async function tirarFoto() {
    setErro(null);
    if (!cameraRef.current) {
      setErro('Câmera ainda não está pronta. Aguarde um instante.');
      return;
    }
    try {
      const foto = await cameraRef.current.takePictureAsync({ quality: QUALIDADE_FOTO });
      if (foto?.uri) {
        setFotoUri(foto.uri);
        setAberta(false);
      } else {
        setErro('Não foi possível capturar a foto neste dispositivo.');
      }
    } catch {
      setErro('Câmera indisponível neste aparelho. Você pode concluir sem foto.');
    }
  }

  function removerFoto() {
    setFotoUri(null);
  }

  function limparTudo() {
    setFotoUri(null);
    setErro(null);
    setAberta(false);
  }

  function avisarErro(msg) {
    setErro(msg);
  }

  return { permissao, pedirPermissao, aberta, setAberta, erro, avisarErro, fotoUri, cameraRef, tirarFoto, removerFoto, limparTudo };
}

// true enquanto o teclado está aberto. A TabBar usa para se esconder.
export function useTecladoAberto() {
  const [aberto, setAberto] = useState(false);

  useEffect(() => {
    const mostrou = Keyboard.addListener('keyboardDidShow', () => setAberto(true));
    const escondeu = Keyboard.addListener('keyboardDidHide', () => setAberto(false));
    return () => {
      mostrou.remove();
      escondeu.remove();
    };
  }, []);

  return aberto;
}
