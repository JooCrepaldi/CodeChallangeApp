import Svg, { Path } from 'react-native-svg';
import { REMIX_PATHS } from './remixPaths';

// Ícones RemixIcon (line) renderizados via SVG — funciona no Expo Go,
// em dev builds e na web, sem depender de fontes nativas extras.
export function RemixIcon({ name, size = 22, color = '#E8EEF6' }) {
  const d = REMIX_PATHS[name];
  if (!d) return null;
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <Path d={d} />
    </Svg>
  );
}
