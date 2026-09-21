import React from 'react';
import {
  TouchableOpacity,
  View,
  ActivityIndicator,
  type TouchableOpacityProps,
  type ViewStyle,
  Text,
  StyleSheet,
} from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { radius, spacing, fontSize, fontFamily } from '../../theme';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends TouchableOpacityProps {
  label: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  fullWidth?: boolean;
}

export function Button({
  label,
  variant = 'primary',
  size = 'md',
  loading = false,
  iconLeft,
  iconRight,
  fullWidth = false,
  style,
  disabled,
  ...props
}: ButtonProps) {
  const { theme } = useTheme();
  const { colors } = theme;

  const isDisabled = disabled || loading;

  // Size config
  const sizeConfig = {
    sm: { height: 36, paddingH: spacing[3], fontSize: fontSize.sm, radius: radius.md },
    md: { height: 48, paddingH: spacing[5], fontSize: fontSize.base, radius: radius.lg },
    lg: { height: 56, paddingH: spacing[6], fontSize: fontSize.md, radius: radius.xl },
  }[size];

  // Variant config
  type VariantConfig = { bg: string; text: string; border?: string };
  const variantConfig: Record<ButtonVariant, VariantConfig> = {
    primary:   { bg: colors.primary,          text: colors.textOnPrimary },
    secondary: { bg: colors.primaryLight,      text: colors.primary },
    ghost:     { bg: 'transparent',            text: colors.primary },
    danger:    { bg: colors.danger,            text: '#fff' },
    outline:   { bg: 'transparent',            text: colors.primary, border: colors.primary },
  };

  const vc = variantConfig[variant];

  const containerStyle: ViewStyle = {
    height: sizeConfig.height,
    paddingHorizontal: sizeConfig.paddingH,
    borderRadius: sizeConfig.radius,
    backgroundColor: vc.bg,
    borderWidth: vc.border ? 1.5 : 0,
    borderColor: vc.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
    opacity: isDisabled ? 0.5 : 1,
    alignSelf: fullWidth ? undefined : 'flex-start',
    ...(fullWidth ? { width: '100%' } : {}),
  };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      disabled={isDisabled}
      style={[containerStyle, style as ViewStyle]}
      {...props}
    >
      {loading ? (
        <ActivityIndicator size="small" color={vc.text} />
      ) : (
        <>
          {iconLeft}
          <Text style={{ color: vc.text, fontSize: sizeConfig.fontSize, fontWeight: '600', letterSpacing: 0.3 }}>
            {label}
          </Text>
          {iconRight}
        </>
      )}
    </TouchableOpacity>
  );
}
