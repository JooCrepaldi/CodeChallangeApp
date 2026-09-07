import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = '@visitas_tecnicas_v1';

export async function listVisitas() {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function saveVisita(visita) {
  const atual = await listVisitas();
  const item = {
    id: String(Date.now()),
    createdAt: new Date().toISOString(),
    ...visita,
  };
  const next = [item, ...atual];
  await AsyncStorage.setItem(KEY, JSON.stringify(next));
  return item;
}

export async function clearVisitas() {
  await AsyncStorage.removeItem(KEY);
}
