import type { PropsWithChildren } from 'react';
import { ScrollView, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { layout, spacing } from '@/constants/theme';
import { useAppTheme } from '@/design-system/theme-provider';

type ScreenShellProps = PropsWithChildren<{
  width?: 'reading' | 'wide';
  contentContainerStyle?: StyleProp<ViewStyle>;
  keyboardShouldPersistTaps?: 'always' | 'never' | 'handled';
}>;

export function ScreenShell({
  children,
  width = 'wide',
  contentContainerStyle,
  keyboardShouldPersistTaps,
}: ScreenShellProps) {
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentInsetAdjustmentBehavior="automatic"
      keyboardShouldPersistTaps={keyboardShouldPersistTaps}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={[
        styles.content,
        {
          maxWidth: width === 'wide' ? layout.maxContentWidth : layout.maxReadingWidth,
          paddingTop: Math.max(insets.top, spacing.lg),
          paddingBottom: Math.max(insets.bottom, spacing.xl),
        },
        contentContainerStyle,
      ]}
    >
      {children}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    alignSelf: 'center',
    width: '100%',
    minHeight: '100%',
    paddingHorizontal: spacing.lg,
    gap: spacing.xl,
  },
});
