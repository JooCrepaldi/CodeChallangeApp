import { useEffect, useState } from 'react';
import { Accelerometer } from 'expo-sensors';
import { LIMITE_G } from './constantes';

// Força total sentida pelo aparelho, em "g" (1g = gravidade da Terra).
export function computeG(x, y, z) {
  return Math.sqrt(x * x + y * y + z * z);
}

// Ouve o acelerômetro e guarda o valor atual e o pico.
// blocked fica true quando o pico passa do limite e a tela Nova bloqueia o envio.
export function useStability() {
  const [gCurrent, setGCurrent] = useState(0);
  const [gMax, setGMax] = useState(0);
  const [available, setAvailable] = useState(true);

  useEffect(() => {
    let ativo = true;
    let inscricao = null;

    async function iniciar() {
      try {
        const ok = await Accelerometer.isAvailableAsync();
        if (!ok) {
          if (ativo) setAvailable(false);
          return;
        }
        Accelerometer.setUpdateInterval(100);
        inscricao = Accelerometer.addListener(({ x, y, z }) => {
          const g = computeG(x, y, z);
          setGCurrent(g);
          setGMax((pico) => (g > pico ? g : pico));
        });
      } catch {
        if (ativo) setAvailable(false);
      }
    }

    iniciar();
    return () => {
      ativo = false;
      inscricao?.remove();
    };
  }, []);

  function resetPeak() {
    setGMax(0);
  }

  return { gCurrent, gMax, available, blocked: gMax > LIMITE_G, resetPeak };
}
