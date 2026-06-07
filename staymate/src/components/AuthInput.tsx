import React, { useState, forwardRef } from 'react';
import { View, Text, TextInput, TextInputProps, StyleSheet } from 'react-native';
import { COLORS, RADII } from '../utils/constants';

interface AuthInputProps extends TextInputProps {
  label: string;
  accessoryRight?: React.ReactNode;
  hasError?: boolean;
}

const AuthInput = forwardRef<TextInput, AuthInputProps>(
  ({ label, accessoryRight, hasError, style, onFocus, onBlur, editable, ...props }, ref) => {
    const [focused, setFocused] = useState(false);
    const disabled = editable === false;

    return (
      <View style={[s.wrap, disabled && s.wrapDisabled]}>
        <Text style={s.label}>{label}</Text>
        <View style={[
          s.row,
          focused && s.rowFocused,
          hasError && s.rowError,
          disabled && s.rowDisabled,
        ]}>
          <TextInput
            ref={ref}
            style={[s.input, style]}
            placeholderTextColor={COLORS.muted}
            editable={editable}
            onFocus={(e) => { setFocused(true); onFocus?.(e); }}
            onBlur={(e)  => { setFocused(false); onBlur?.(e);  }}
            {...props}
          />
          {accessoryRight}
        </View>
      </View>
    );
  },
);

AuthInput.displayName = 'AuthInput';
export default AuthInput;

const s = StyleSheet.create({
  wrap:        { marginBottom: 16 },
  wrapDisabled:{ opacity: 0.5 },
  label:       { fontSize: 14, fontWeight: '600', color: COLORS.ink, marginBottom: 8 },
  row:         {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1.5, borderColor: '#E5E7EB',
    borderRadius: RADII.md, backgroundColor: '#FAFAFA',
  },
  rowFocused:  { borderColor: COLORS.primary, backgroundColor: '#fff' },
  rowError:    { borderColor: COLORS.error },
  rowDisabled: { backgroundColor: '#F3F4F6' },
  input:       { flex: 1, paddingHorizontal: 14, paddingVertical: 13, fontSize: 15, color: COLORS.ink },
});
