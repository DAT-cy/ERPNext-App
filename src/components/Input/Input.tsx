import React, { useMemo, useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TextInputProps,
  ViewStyle,
  TouchableOpacity,
} from 'react-native';
import { globalStyles, colors } from '../../styles';
import { typography, spacing, borderRadius, touchTargets } from '../../utils/dimensions';
import { getResponsiveValue } from '../../utils/responsive';

export interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
  secureToggle?: boolean;
  /** Enable auto-growing height for long text */
  autoGrow?: boolean;
  /** Minimum height when autoGrow/multiline */
  minHeight?: number;
  /** Maximum height when autoGrow/multiline */
  maxHeight?: number;
}

export default function Input({
  label,
  error,
  containerStyle,
  secureToggle = false,
  secureTextEntry,
  autoGrow = false,
  minHeight,
  maxHeight,
  ...props
}: InputProps) {
  const isMultiline = props.multiline || autoGrow;
  const [isSecure, setIsSecure] = useState(secureTextEntry && !isMultiline);
  const [inputHeight, setInputHeight] = useState<number | undefined>(undefined);

  const toggleSecure = () => {
    setIsSecure(!isSecure);
  };

  const computedInputStyle = useMemo(() => {
    const heightStyles: any = {};
    if (isMultiline) {
      if (typeof inputHeight === 'number') heightStyles.height = inputHeight;
      if (typeof minHeight === 'number') heightStyles.minHeight = minHeight;
      if (typeof maxHeight === 'number') heightStyles.maxHeight = maxHeight;
    }
    return [styles.input, error && styles.inputError, heightStyles];
  }, [error, inputHeight, isMultiline, minHeight, maxHeight]);

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={styles.inputContainer}>
        <TextInput
          style={computedInputStyle}
          secureTextEntry={isMultiline ? false : isSecure}
          multiline={isMultiline}
          onContentSizeChange={
            autoGrow
              ? (e) => {
                  const contentHeight = e.nativeEvent.contentSize.height;
                  // Add small padding to avoid clipping last line
                  setInputHeight(Math.ceil(contentHeight + 4));
                }
              : props.onContentSizeChange
          }
          textAlignVertical={isMultiline ? 'top' : 'auto'}
          {...props}
        />
        {secureToggle && !isMultiline && (
          <TouchableOpacity onPress={toggleSecure} style={styles.secureToggle}>
            <Text style={styles.secureToggleText}>
              {isSecure ? '👁️' : '🙈'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: getResponsiveValue({
      xs: spacing.xs,
      sm: spacing.sm,
      md: spacing.md,
      lg: spacing.lg,
    }),
  },
  label: {
    fontSize: getResponsiveValue({
      xs: typography.xs,
      sm: typography.sm,
      md: typography.base,
      lg: typography.md,
    }),
    fontWeight: '500',
    color: colors.textPrimary,
    marginBottom: getResponsiveValue({
      xs: spacing.xs,
      sm: spacing.xs,
      md: spacing.sm,
      lg: spacing.md,
    }),
  },
  inputContainer: {
    position: 'relative',
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: getResponsiveValue({
      xs: borderRadius.xs,
      sm: borderRadius.sm,
      md: borderRadius.md,
      lg: borderRadius.lg,
    }),
    paddingHorizontal: getResponsiveValue({
      xs: spacing.sm,
      sm: spacing.md,
      md: spacing.lg,
      lg: spacing.xl,
    }),
    paddingVertical: getResponsiveValue({
      xs: spacing.xs,
      sm: spacing.sm,
      md: spacing.md,
      lg: spacing.lg,
    }),
    fontSize: getResponsiveValue({
      xs: typography.xs,
      sm: typography.sm,
      md: typography.base,
      lg: typography.md,
    }),
    backgroundColor: colors.white,
    color: colors.textPrimary,
    minHeight: getResponsiveValue({
      xs: 32,
      sm: 36,
      md: 40,
      lg: 44,
    }),
  },
  inputError: {
    borderColor: colors.error,
  },
  secureToggle: {
    position: 'absolute',
    right: getResponsiveValue({
      xs: spacing.xs,
      sm: spacing.sm,
      md: spacing.md,
      lg: spacing.lg,
    }),
    top: getResponsiveValue({
      xs: spacing.xs,
      sm: spacing.sm,
      md: spacing.md,
      lg: spacing.lg,
    }),
    padding: getResponsiveValue({
      xs: 2,
      sm: 4,
      md: 6,
      lg: 8,
    }),
  },
  secureToggleText: {
    fontSize: getResponsiveValue({
      xs: typography.xs,
      sm: typography.sm,
      md: typography.base,
      lg: typography.md,
    }),
  },
  errorText: {
    color: colors.error,
    fontSize: getResponsiveValue({
      xs: typography.xs,
      sm: typography.sm,
      md: typography.base,
      lg: typography.md,
    }),
    marginTop: getResponsiveValue({
      xs: spacing.xs,
      sm: spacing.sm,
      md: spacing.md,
      lg: spacing.lg,
    }),
  },
});
