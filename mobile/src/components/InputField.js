import React from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../context/ThemeContext';

const InputField = ({ 
  label, 
  icon: Icon, 
  value, 
  onChangeText, 
  placeholder, 
  secureTextEntry, 
  keyboardType, 
  multiline, 
  style,
  hint,
  rightIcon: RightIcon,
  onRightIconPress
}) => {
  const { theme } = useTheme();

  return (
    <View style={[styles.inputGroup, style]}>
      {label && <Text style={[styles.label, { color: theme.secondaryText }]}>{label}</Text>}
      <View style={[
        styles.inputWrapper, 
        { backgroundColor: theme.input, borderColor: theme.border }, 
        multiline && styles.multilineWrapper
      ]}>
        {Icon && <Icon size={18} color={theme.iconDefault} style={multiline ? { marginTop: 2 } : {}} />}
        <TextInput 
          style={[
            styles.input, 
            { color: theme.text }, 
            multiline && { height: 60, textAlignVertical: 'top' }
          ]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={theme.placeholder}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          multiline={multiline}
        />
        {RightIcon && (
          <TouchableOpacity onPress={onRightIconPress} style={{ padding: 8, marginRight: -4 }}>
            <RightIcon size={18} color={theme.primary} />
          </TouchableOpacity>
        )}
      </View>
      {hint && <Text style={[styles.hint, { color: theme.placeholder }]}>{hint}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  inputGroup: { marginBottom: 15 },
  label: { fontSize: 13, fontWeight: '600', marginBottom: 8, marginLeft: 4 },
  inputWrapper: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    borderRadius: 12, 
    paddingHorizontal: 15, 
    borderWidth: 1
  },
  multilineWrapper: {
    alignItems: 'flex-start',
    paddingTop: 12
  },
  input: { flex: 1, paddingVertical: 12, marginLeft: 10, fontSize: 15 },
  hint: { fontSize: 11, marginTop: 4, marginLeft: 4 }
});

export default InputField;
