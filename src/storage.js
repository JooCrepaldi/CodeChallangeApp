import AsyncStorage from '@react-native-async-storage/async-storage';

// Chave única do app no AsyncStorage. Funciona offline.
const CHAVE = '@visitas_tecnicas_v1';

// Lista as visitas salvas (mais novas primeiro). Se der erro, devolve [].
export async function listVisitas() {
  try {
    const raw = await AsyncStorage.getItem(CHAVE);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

// Salva uma visita no topo da lista e devolve o item criado.
export async function saveVisita(visita) {
  const atual = await listVisitas();
  const item = {
    id: String(Date.now()),
    createdAt: new Date().toISOString(),
    ...visita,
  };
  await AsyncStorage.setItem(CHAVE, JSON.stringify([item, ...atual]));
  return item;
}

// Apaga todos os registros locais.
export async function clearVisitas() {
  await AsyncStorage.removeItem(CHAVE);
}
