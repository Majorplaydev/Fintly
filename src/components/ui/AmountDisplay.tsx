import React from 'react';
import { View, Text, type TextStyle } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { getCurrencySymbol } from '../../utils/currency';
import { fontSize } from '../../theme';

interface AmountDisplayProps {
  amount: number;
  currency?: string;
  size?: 'hero' | 'large' | 'medium' | 'small';
  colorize?: boolean;    // green for positive, red for negative
  showSign?: boolean;
  style?: TextStyle;
}

export function AmountDisplay({
  amount,
  currency = 'NGN',
  size = 'medium',
  colorize = false,
  showSign = false,
  style,
}: AmountDisplayProps) {
  const { theme } = useTheme();
  const { colors } = theme;

  const symbol = getCurrencySymbol(currency);

  const sizeConfig = {
    hero:   { intSize: fontSize['4xl'], decSize: fontSize.xl,   symbolSize: fontSize['2xl'] },
    large:  { intSize: fontSize['3xl'], decSize: fontSize.lg,   symbolSize: fontSize.xl },
    medium: { intSize: fontSize.xl,     decSize: fontSize.md,   symbolSize: fontSize.lg },
    small:  { intSize: fontSize.md,     decSize: fontSize.sm,   symbolSize: fontSize.base },
  }[size];

  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);
  const [intPart, decPart] = absAmount.toFixed(2).split('.');

  const formattedInt = parseInt(intPart, 10).toLocaleString('en-US');

  let color: string = colors.textPrimary;
  if (colorize) {
    color = amount >= 0 ? (colors.income as string) : (colors.expense as string);
  }

  const sign = showSign ? (isNegative ? '-' : '+') : isNegative ? '-' : '';

  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 2 }}>
      <Text style={[{ fontSize: sizeConfig.symbolSize, color, fontWeight: '600', lineHeight: sizeConfig.intSize * 1.1, paddingBottom: 2 }, style]}>
        {sign}{symbol}
      </Text>
      <Text style={[{ fontSize: sizeConfig.intSize, color, fontWeight: '700', letterSpacing: -1, lineHeight: sizeConfig.intSize * 1.1 }, style]}>
        {formattedInt}
      </Text>
      <Text style={[{ fontSize: sizeConfig.decSize, color, fontWeight: '500', lineHeight: sizeConfig.intSize * 1.1, paddingBottom: 2, opacity: 0.7 }, style]}>
        .{decPart}
      </Text>
    </View>
  );
}
