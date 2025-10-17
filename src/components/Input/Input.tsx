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
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333333',
    marginBottom: 8,
  },
  inputContainer: {
    position: 'relative',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
  },
  inputError: {
    borderColor: '#FF3B30',
  },
  secureToggle: {
    position: 'absolute',
    right: 12,
    top: 12,
    padding: 4,
  },
  secureToggleText: {
    fontSize: 16,
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 14,
    marginTop: 4,
  },
});
