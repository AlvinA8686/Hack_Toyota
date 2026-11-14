import React from 'react';
import { Image, type ImageSourcePropType, StyleSheet } from 'react-native';
import type { Profile } from '../domain';

// Explicit requires keep every demo model photo available offline in Metro/iOS.
const photos: Record<string, ImageSourcePropType> = {
  '2022:Avalon': require('../../assets/vehicles/2022-avalon.png'),
  '2022:Camry': require('../../assets/vehicles/2022-camry.png'),
  '2022:Corolla': require('../../assets/vehicles/2022-corolla.png'),
  '2022:Highlander': require('../../assets/vehicles/2022-highlander.png'),
  '2023:Prius': require('../../assets/vehicles/2023-prius.png'),
  '2023:Tacoma': require('../../assets/vehicles/2023-tacoma.png'),
  '2024:Camry Hybrid': require('../../assets/vehicles/2024-camry-hybrid.png'),
  '2024:Corolla Cross': require('../../assets/vehicles/2024-corolla-cross.png'),
  '2024:Corolla': require('../../assets/vehicles/2024-corolla.png'),
  '2024:RAV4': require('../../assets/vehicles/2024-rav4.png'),
  '2024:RAV4 Hybrid': require('../../assets/vehicles/2024-rav4-hybrid.png'),
  '2024:Sequoia': require('../../assets/vehicles/2024-sequoia.png'),
  '2024:Tundra': require('../../assets/vehicles/2024-tundra.png'),
  '2024:bZ4X': require('../../assets/vehicles/2024-bz4x.png'),
  '2025:Camry': require('../../assets/vehicles/2025-camry.png'),
  '2025:Tacoma': require('../../assets/vehicles/2025-tacoma.png'),
  '2025:Grand Highlander': require('../../assets/vehicles/2025-grand-highlander.png'),
  '2024:Highlander': require('../../assets/vehicles/2024-highlander.png'),
};

export function VehiclePhoto({ vehicle, height = 155 }: { vehicle: Profile['vehicle']; height?: number }) {
  const source = photos[`${vehicle.model_year}:${vehicle.model}`];
  if (!source) return null;
  return <Image source={source} style={[styles.photo, { height }]} resizeMode="contain" fadeDuration={0} accessibilityLabel={`${vehicle.model_year} Toyota ${vehicle.model} model photo`} />;
}

const styles = StyleSheet.create({ photo: { width: '100%' } });
