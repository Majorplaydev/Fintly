import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  type TextInputProps,
  type ViewStyle,
  StyleSheet,
} from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { radius, spacing, fontSize } from '../../theme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  hint?: string;
  prefix?: string;
  suffix?: React.ReactNode;
  containerStyle?: ViewStyle;
}

export function Input({
  label,
  error,
  hint,
  prefix,
  suffix,
  containerStyle,
  style,
  ...props
}: InputProps) {
  const { theme } = useTheme();
  const { colors } = theme;
  const [focused, setFocused] = useState(false);

  return (
    <View style={[{ gap: spacing[1] }, containerStyle]}>
      {label ? (
        <Text style={{ fontSize: fontSize.sm, color: colors.textSecondary, fontWeight: '500', marginBottom: 2 }}>
          {label}
        </Text>
      ) : null}

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          borderRadius: radius.lg,
          borderWidth: 1.5,
          borderColor: error
            ? colors.danger
            : focused
            ? colors.inputFocusBorder
            : colors.inputBorder,
          backgroundColor: colors.inputBackground,
          minHeight: 48,
          paddingHorizontal: spacing[3],
          gap: spacing[2],
        }}
      >
        {prefix ? (
          <Text style={{ fontSize: fontSize.base, color: colors.textSecondary, fontWeight: '500' }}>
            {prefix}
          </Text>
        ) : null}

        <TextInput
          style={[
            {
              flex: 1,
              fontSize: fontSize.base,
              color: colors.textPrimary,
              paddingVertical: spacing[3],
            },
            style,
          ]}
          placeholderTextColor={colors.placeholder}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          {...props}
        />

        {suffix}
      </View>

      {error ? (
        <Text style={{ fontSize: fontSize.xs, color: colors.danger }}>
          {error}
        </Text>
      ) : hint ? (
        <Text style={{ fontSize: fontSize.xs, color: colors.textTertiary }}>
          {hint}
        </Text>
      ) : null}
    </View>
  );
}

// Currency-specific input
interface CurrencyInputProps extends Omit<InputProps, 'prefix'> {
  currency?: string;
}

export function CurrencyInput({ currency = '₦', ...props }: CurrencyInputProps) {
  return (
    <Input
      prefix={currency}
      keyboardType="decimal-pad"
      {...props}
    />
  );
}
