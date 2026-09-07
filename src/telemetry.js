import { useEffect, useRef, useState } from 'react';
import { Accelerometer } from 'expo-sensors';

export const BLOCK_THRESHOLD_G = 2.0;

export function computeG(x, y, z) {
  return Math.sqrt(x * x + y * y + z * z);
}

// Nível Pleno: monitora a aceleração vetorial agregada.
// Se gMax > 2.0g, o fechamento da auditoria deve ser bloqueado.
export function useStability() {
  const [gCurrent, setGCurrent] = useState(0);
  const [gMax, setGMax] = useState(0);
  const [available, setAvailable] = useState(true);
  const subRef = useRef(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const ok = await Accelerometer.isAvailableAsync();
        if (!mounted) return;
        if (!ok) {
          setAvailable(false);
          return;
        }
        Accelerometer.setUpdateInterval(100);
        subRef.current = Accelerometer.addListener(({ x, y, z }) => {
          const g = computeG(x, y, z);
          setGCurrent(g);
          setGMax((prev) => (g > prev ? g : prev));
        });
      } catch {
        if (mounted) setAvailable(false);
      }
    })();
    return () => {
      subRef.current?.remove();
      subRef.current = null;
    };
  }, []);

  function resetPeak() {
    setGMax(0);
  }

  return { gCurrent, gMax, available, blocked: gMax > BLOCK_THRESHOLD_G, resetPeak };
}
