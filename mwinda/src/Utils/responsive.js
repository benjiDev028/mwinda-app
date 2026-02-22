// src/utils/responsive.js
import { useWindowDimensions, Platform } from 'react-native';
import { useMemo } from 'react';
import * as Device from 'expo-device';

// Guides iPhone (référence pour le scaling)
const GUIDELINE_WIDTH = 375;
const GUIDELINE_HEIGHT = 812;

export function useResponsive() {
  const { width, height } = useWindowDimensions();

  // expo-device: Device.isTablet peut être null au tout premier render
  // Fallback simple: largeur minimale >= 768
  const isTablet =
    (typeof Device.isTablet === 'boolean' && Device.isTablet) ||
    Math.min(width, height) >= 768;

  const isIOS = Platform.OS === 'ios';

  const hScale = width / GUIDELINE_WIDTH;
  const vScale = height / GUIDELINE_HEIGHT;

  // scale strict; ms = "moderate scale" (plus doux)
  const scale = (size) => Math.round(size * hScale);
  const vscale = (size) => Math.round(size * vScale);
  const ms = (size, factor = 0.5) =>
    Math.round(size + (scale(size) - size) * factor);

  // Espacements & typo (sémantique)
  const space = useMemo(
    () => ({
      xs: ms(4),
      sm: ms(8),
      md: ms(16),
      lg: ms(24),
      xl: ms(32),
    }),
    [width, height, isTablet]
  );

  const font = useMemo(
    () => ({
      xs: ms(12),
      sm: ms(14),
      md: ms(16),
      lg: ms(20),
      xl: ms(24),
      xxl: ms(28),
    }),
    [width, height, isTablet]
  );

  // Grille auto: 2 colonnes sur tablette
  const columns = isTablet ? 2 : 1;
  const containerPadding = isTablet ? ms(24) : ms(16);
  const gutter = isTablet ? ms(16) : ms(12);

  return {
    width,
    height,
    isTablet,
    isIOS,
    scale,
    vscale,
    ms,
    space,
    font,
    columns,
    containerPadding,
    gutter,
  };
}
