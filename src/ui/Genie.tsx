import React from 'react';
import { Image, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

// Keep explicit requires: Metro bundles every original supplied pose offline.
export const geniePoses = {
  1: require('../../assets/genie/pose-1.png'),
  2: require('../../assets/genie/pose-2.png'),
  3: require('../../assets/genie/pose-3.png'),
  4: require('../../assets/genie/pose-4.png'),
  5: require('../../assets/genie/pose-5.png'),
  6: require('../../assets/genie/pose-6.png'),
  7: require('../../assets/genie/pose-7.png'),
  8: require('../../assets/genie/pose-8.png'),
  9: require('../../assets/genie/pose-9.png'),
  10: require('../../assets/genie/pose-10.png'),
  11: require('../../assets/genie/pose-11.png'),
  12: require('../../assets/genie/pose-12.png'),
};

export function Genie({ pose = 5, size = 180, style }: {
  pose?: number;
  size?: number;
  style?: StyleProp<ViewStyle>;
}) {
  const source = geniePoses[pose as keyof typeof geniePoses] ?? geniePoses[5];
  return (
    <View style={[styles.frame, { width: size, height: size }, style]}>
      <Image source={source} resizeMode="contain" style={styles.image} accessible={false} />
    </View>
  );
}

const styles = StyleSheet.create({
  frame: { backgroundColor: '#FFFFFF', borderRadius: 26, overflow: 'hidden' },
  image: { width: '100%', height: '100%' },
});
