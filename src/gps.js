import * as Location from 'expo-location';

// RF02: Verde < 10m | Amarelo 10-30m | Vermelho > 30m (ou sem dados)
export function getGpsLevel(accuracy) {
  if (accuracy == null || Number.isNaN(accuracy)) {
    return { label: 'Baixa', color: '#fff', bg: '#dc2626', hint: 'sem dados de precisão' };
  }
  if (accuracy < 10) {
    return { label: 'Alta', color: '#fff', bg: '#16a34a', hint: `± ${accuracy.toFixed(1)} m` };
  }
  if (accuracy <= 30) {
    return { label: 'Média', color: '#422006', bg: '#facc15', hint: `± ${accuracy.toFixed(1)} m` };
  }
  return { label: 'Baixa', color: '#fff', bg: '#dc2626', hint: `± ${accuracy.toFixed(1)} m` };
}

// RNF01: nunca estoura — retorna { ok, location?, error? }
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
  } catch (e) {
    return { ok: false, error: 'Não foi possível obter o GPS agora. Tente novamente.' };
  }
}
