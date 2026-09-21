import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAppStore, selectTotalAssets } from '../../store/useAppStore';
import { ScreenLayout, Card, ProgressBar, EmptyState, Badge } from '../../components/ui';
import { useTheme } from '../../theme/ThemeContext';
import { spacing, fontSize, radius } from '../../theme';
import { formatCurrency } from '../../utils/currency';
import { daysUntil, formatDate } from '../../utils/date';

const PRIORITY_COLORS = { high: '#ef4444', medium: '#f59e0b', low: '#94a3b8' };

export default function WishlistScreen() {
  const navigation = useNavigation<any>();
  const { theme } = useTheme();
  const { colors } = theme;
  const wishlist = useAppStore((s) => s.wishlist);
  const totalAssets = useAppStore(selectTotalAssets);

  const pending = wishlist.filter((w) => w.status !== 'purchased');
  const purchased = wishlist.filter((w) => w.status === 'purchased');

  return (
    <ScreenLayout
      title="Wish List"
      showBack
      rightAction={
        <TouchableOpacity
          onPress={() => navigation.navigate('AddWishlistItem', {})}
          style={{ backgroundColor: colors.primary, borderRadius: radius.lg, paddingHorizontal: spacing[3], paddingVertical: spacing[2] }}
        >
          <Text style={{ color: '#fff', fontWeight: '600', fontSize: fontSize.sm }}>+ Add</Text>
        </TouchableOpacity>
      }
    >
      {pending.length === 0 && purchased.length === 0 ? (
        <EmptyState emoji="✨" title="Your wish list is empty" description="Add things you want to buy. Fintly will tell you when you can afford them." actionLabel="Add Item" onAction={() => navigation.navigate('AddWishlistItem', {})} />
      ) : (
        <View style={{ gap: spacing[3] }}>
          {pending.map((item) => {
            const canAfford = totalAssets >= item.estimatedCost;
            const savingsProgress = Math.min(totalAssets / item.estimatedCost, 1);
            const days = item.targetDate ? daysUntil(item.targetDate) : null;

            return (
              <TouchableOpacity key={item.id} onPress={() => navigation.navigate('AddWishlistItem', { itemId: item.id })} activeOpacity={0.7}>
                <Card variant="outlined">
                  <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: spacing[3], marginBottom: spacing[3] }}>
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing[2], marginBottom: spacing[1] }}>
                        <Text style={{ fontSize: fontSize.base, fontWeight: '600', color: colors.textPrimary }}>{item.name}</Text>
                        <Badge label={item.priority} color={PRIORITY_COLORS[item.priority] + '20'} textColor={PRIORITY_COLORS[item.priority]} size="sm" />
                      </View>
                      {item.note && <Text style={{ fontSize: fontSize.sm, color: colors.textSecondary }} numberOfLines={1}>{item.note}</Text>}
                      {days !== null && (
                        <Text style={{ fontSize: fontSize.xs, color: days < 0 ? colors.danger : colors.textTertiary, marginTop: 2 }}>
                          {days < 0 ? 'Past target date' : `Target: ${days} days`}
                        </Text>
                      )}
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={{ fontSize: fontSize.base, fontWeight: '700', color: colors.textPrimary }}>{formatCurrency(item.estimatedCost)}</Text>
                      {canAfford ? (
                        <Text style={{ fontSize: fontSize.xs, color: colors.success, fontWeight: '600', marginTop: 2 }}>✓ Can afford</Text>
                      ) : (
                        <Text style={{ fontSize: fontSize.xs, color: colors.textTertiary, marginTop: 2 }}>
                          {formatCurrency(item.estimatedCost - totalAssets)} short
                        </Text>
                      )}
                    </View>
                  </View>
                  <ProgressBar progress={savingsProgress} color={canAfford ? colors.success : colors.primary} />
                  <Text style={{ fontSize: fontSize.xs, color: colors.textTertiary, marginTop: spacing[1] }}>
                    {formatCurrency(Math.min(totalAssets, item.estimatedCost))} saved of {formatCurrency(item.estimatedCost)}
                  </Text>
                </Card>
              </TouchableOpacity>
            );
          })}

          {purchased.length > 0 && (
            <Text style={{ fontSize: fontSize.sm, color: colors.textTertiary, marginTop: spacing[2] }}>
              ✓ {purchased.length} purchased
            </Text>
          )}
        </View>
      )}
    </ScreenLayout>
  );
}
