import { StyleSheet, View } from 'react-native';

type BrandMarkProps = {
  color: string;
  compact?: boolean;
};

export function BrandMark({ color, compact = false }: BrandMarkProps) {
  const size = compact ? 30 : 36;
  const loopSize = compact ? 19 : 23;

  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[styles.container, { width: size, height: size }]}
    >
      <View
        style={[
          styles.loop,
          styles.leftLoop,
          { width: loopSize, height: loopSize, borderColor: color },
        ]}
      />
      <View
        style={[
          styles.loop,
          styles.rightLoop,
          { width: loopSize, height: loopSize, borderColor: color },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { position: 'relative', justifyContent: 'center' },
  loop: {
    position: 'absolute',
    borderWidth: 2.5,
    borderRadius: 999,
    transform: [{ rotate: '-18deg' }],
  },
  leftLoop: { left: 1 },
  rightLoop: { right: 1, transform: [{ rotate: '18deg' }] },
});
