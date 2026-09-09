import * as Location from 'expo-location';

// Classifica a precisão do GPS: verde < 10m, amarelo 10-30m, vermelho > 30m.
// Retorna nivel ("ok" | "medio" | "ruim") que o Badge sabe pintar.
export function getGpsLevel(accuracy) {
  if (accuracy == null || Number.isNaN(accuracy)) {
    return { nivel: 'ruim', titulo: 'Baixa', detalhe: 'sem dados de precisão' };
  }
  if (accuracy < 10) {
    return { nivel: 'ok', titulo: 'Alta', detalhe: `± ${accuracy.toFixed(1)} m` };
  }
  if (accuracy <= 30) {
    return { nivel: 'medio', titulo: 'Média', detalhe: `± ${accuracy.toFixed(1)} m` };
  }
  return { nivel: 'ruim', titulo: 'Baixa', detalhe: `± ${accuracy.toFixed(1)} m` };
}

// Captura a posição atual. Nunca joga erro na tela: devolve { ok, location?, error? }.
export async function captureLocation() {
  try {
    const servicesOn = await Location.hasServicesEnabledAsync();
    if (!servicesOn) {
      return { ok: false, error: 'GPS desativado. Ative a Localização nas configurações do sistema.' };
    }
    const perm = await Location.requestForegroundPermissionsAsync();
    if (!perm.granted) {
      return { ok: false, error: 'Permissão de localização negada. Libere o acesso para registrar o GPS.' };
    }
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });
    return { ok: true, location };
  } catch {
    return { ok: false, error: 'Não foi possível obter o GPS agora. Tente novamente.' };
  }
}
