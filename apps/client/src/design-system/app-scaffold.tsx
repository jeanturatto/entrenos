import { router, type Href } from 'expo-router';
import type { PropsWithChildren } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BrandMark } from '@/components/brand-mark';
import { layout, radii, spacing, typography } from '@/constants/theme';
import { useAppTheme } from '@/design-system/theme-provider';

export type AppSection = 'dashboard' | 'calendar' | 'add' | 'organize' | 'space';

type AppScaffoldProps = PropsWithChildren<{
  active: AppSection;
  contentContainerStyle?: StyleProp<ViewStyle>;
  fullWidth?: boolean;
  scroll?: boolean;
}>;

const navItems: {
  key: AppSection;
  label: string;
  compactLabel: string;
  icon: string;
  href: Href;
}[] = [
  { key: 'dashboard', label: 'Início', compactLabel: 'Início', icon: '⌂', href: '/dashboard' },
  { key: 'calendar', label: 'Calendário', compactLabel: 'Agenda', icon: '□', href: '/calendar' },
  { key: 'add', label: 'Criar', compactLabel: 'Criar', icon: '+', href: '/event-new' },
  { key: 'organize', label: 'Organização', compactLabel: 'Listas', icon: '✓', href: '/organize' },
  { key: 'space', label: 'Nós', compactLabel: 'Nós', icon: '♡', href: '/space' },
];

function NavItem({
  item,
  active,
  compact,
}: {
  item: (typeof navItems)[number];
  active: boolean;
  compact?: boolean;
}) {
  const { colors } = useAppTheme();
  const isCreate = item.key === 'add';

  return (
    <Pressable
      accessibilityRole="link"
      accessibilityLabel={item.label}
      accessibilityState={{ selected: active }}
      onPress={() => router.replace(item.href)}
      style={({ pressed }) => [
        compact ? styles.compactNavItem : styles.navItem,
        !compact && active ? { backgroundColor: `${colors.brand}14` } : null,
        pressed ? { opacity: 0.68 } : null,
      ]}
    >
      <View
        style={[
          compact ? styles.compactIcon : styles.navIcon,
          {
            backgroundColor: isCreate
              ? colors.brandStrong
              : active
                ? `${colors.brand}1c`
                : 'transparent',
            borderColor: isCreate ? colors.brandStrong : 'transparent',
          },
        ]}
      >
        <Text
          style={[
            styles.navGlyph,
            { color: isCreate ? colors.onBrand : active ? colors.brand : colors.textMuted },
          ]}
        >
          {item.icon}
        </Text>
      </View>
      <Text
        numberOfLines={1}
        style={[
          compact ? styles.compactNavLabel : styles.navLabel,
          { color: active ? colors.brand : colors.textMuted },
        ]}
      >
        {compact ? item.compactLabel : item.label}
      </Text>
    </Pressable>
  );
}

export function AppScaffold({
  active,
  children,
  contentContainerStyle,
  fullWidth = false,
  scroll = true,
}: AppScaffoldProps) {
  const { colors } = useAppTheme();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const desktop = width >= layout.wideBreakpoint;
  const contentStyle = [
    styles.content,
    {
      maxWidth: fullWidth ? layout.maxContentWidth : 1240,
      paddingTop: desktop ? spacing.xl : spacing.lg,
      paddingBottom: desktop ? spacing.xxl : Math.max(insets.bottom + 88, 112),
    },
    contentContainerStyle,
  ];

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {desktop ? (
        <View
          style={[styles.sidebar, { backgroundColor: colors.surface, borderColor: colors.border }]}
        >
          <View style={styles.brandRow}>
            <BrandMark compact />
            <Text style={[styles.wordmark, { color: colors.text }]}>EntreNós</Text>
          </View>
          <Pressable
            onPress={() => router.push('/event-new')}
            style={({ pressed }) => [
              styles.createButton,
              { backgroundColor: colors.brandStrong, opacity: pressed ? 0.78 : 1 },
            ]}
          >
            <Text style={[styles.createPlus, { color: colors.onBrand }]}>+</Text>
            <Text style={[styles.createLabel, { color: colors.onBrand }]}>Criar</Text>
          </Pressable>
          <View style={styles.navList}>
            {navItems
              .filter((item) => item.key !== 'add')
              .map((item) => (
                <NavItem key={item.key} item={item} active={active === item.key} />
              ))}
          </View>
          <View style={[styles.sidebarFooter, { borderColor: colors.border }]}>
            <View style={[styles.avatar, { backgroundColor: `${colors.accent}18` }]}>
              <Text style={[styles.avatarText, { color: colors.accent }]}>♡</Text>
            </View>
            <View style={styles.footerCopy}>
              <Text numberOfLines={1} style={[styles.footerTitle, { color: colors.text }]}>
                Nosso espaço
              </Text>
              <Text numberOfLines={1} style={[styles.footerMeta, { color: colors.textMuted }]}>
                Vida a dois organizada
              </Text>
            </View>
          </View>
        </View>
      ) : null}

      <View style={styles.main}>
        {!desktop ? (
          <View
            style={[
              styles.mobileHeader,
              {
                paddingTop: Math.max(insets.top, spacing.sm),
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
          >
            <View style={styles.brandRow}>
              <BrandMark compact />
              <Text style={[styles.mobileWordmark, { color: colors.text }]}>EntreNós</Text>
            </View>
            <Pressable
              accessibilityLabel="Abrir espaço do casal"
              onPress={() => router.push('/space')}
              style={[styles.mobileAvatar, { backgroundColor: `${colors.brand}15` }]}
            >
              <Text style={{ color: colors.brand, fontWeight: '900' }}>♡</Text>
            </Pressable>
          </View>
        ) : null}

        {scroll ? (
          <ScrollView
            style={styles.scroller}
            contentInsetAdjustmentBehavior="automatic"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={contentStyle}
          >
            {children}
          </ScrollView>
        ) : (
          <View style={[styles.nonScrollingContent, contentStyle]}>{children}</View>
        )}

        {!desktop ? (
          <View
            style={[
              styles.bottomNav,
              {
                paddingBottom: Math.max(insets.bottom, spacing.sm),
                backgroundColor: colors.surface,
                borderColor: colors.border,
                boxShadow: '0 -4px 18px rgba(16, 24, 40, 0.08)',
              },
            ]}
          >
            {navItems.map((item) => (
              <NavItem key={item.key} item={item} active={active === item.key} compact />
            ))}
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, minHeight: '100%', flexDirection: 'row' },
  sidebar: {
    width: 236,
    padding: spacing.lg,
    borderRightWidth: StyleSheet.hairlineWidth,
    gap: spacing.lg,
  },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  wordmark: {
    fontFamily: typography.display,
    fontSize: 21,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  mobileWordmark: {
    fontFamily: typography.display,
    fontSize: 19,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  createButton: {
    minHeight: 50,
    borderRadius: radii.md,
    borderCurve: 'continuous',
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  createPlus: { fontSize: 25, lineHeight: 25, fontWeight: '500' },
  createLabel: { fontSize: 15, fontWeight: '800' },
  navList: { gap: spacing.xs },
  navItem: {
    minHeight: 48,
    borderRadius: radii.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.md,
  },
  navIcon: {
    width: 30,
    height: 30,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navGlyph: { fontSize: 19, fontWeight: '800', lineHeight: 22 },
  navLabel: { fontSize: 15, fontWeight: '700' },
  sidebarFooter: {
    marginTop: 'auto',
    paddingTop: spacing.lg,
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 18, fontWeight: '900' },
  footerCopy: { flex: 1, minWidth: 0 },
  footerTitle: { fontSize: 13, fontWeight: '800' },
  footerMeta: { fontSize: 11, marginTop: 2 },
  main: { flex: 1, minWidth: 0 },
  scroller: { flex: 1 },
  content: {
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: spacing.lg,
    gap: spacing.xl,
  },
  nonScrollingContent: { flex: 1, width: '100%', alignSelf: 'center' },
  mobileHeader: {
    minHeight: 58,
    paddingBottom: spacing.sm,
    paddingHorizontal: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  mobileAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomNav: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    minHeight: 70,
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-around',
    paddingTop: spacing.xs,
    paddingHorizontal: spacing.xs,
  },
  compactNavItem: { flex: 1, minWidth: 0, alignItems: 'center', gap: 2, paddingHorizontal: 2 },
  compactIcon: {
    width: 35,
    height: 32,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  compactNavLabel: { fontSize: 10, fontWeight: '700' },
});
