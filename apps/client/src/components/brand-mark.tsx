import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';

const brandEmblem = require('../../assets/images/brand-emblem.png');

type BrandMarkProps = {
  compact?: boolean;
};

export function BrandMark({ compact = false }: BrandMarkProps) {
  const size = compact ? 34 : 42;

  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={{ width: size, height: size }}
    >
      <Image contentFit="contain" source={brandEmblem} style={styles.image} />
    </View>
  );
}

const styles = StyleSheet.create({
  image: { width: '100%', height: '100%' },
});
