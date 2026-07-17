import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, KeyboardAvoidingView, Platform, Switch } from 'react-native';
import { User, Mail, Lock, CheckCircle2 } from 'lucide-react-native';
import apiClient from '../api/client';
import PhoneInput from '../components/PhoneInput';
import InputField from '../components/InputField';
import { useTheme } from '../context/ThemeContext';

const ROLES = ['User', 'Admin', 'ShopOwner', 'ServiceProvider', 'Hospital', 'BloodBank', 'AmbulanceDriver'];

const AddEditUserScreen = ({ route, navigation }) => {
  const editUser = route.params?.user;
  const isEditing = !!editUser;
  const { theme, isDark } = useTheme();

  const initialPhone = editUser?.phone?.startsWith('+91') ? editUser.phone.slice(3) : (editUser?.phone || '');

  const [name, setName] = useState(editUser?.name || '');
  const [email, setEmail] = useState(editUser?.email || '');
  const [phone, setPhone] = useState(initialPhone);
  const [password, setPassword] = useState('');
  const [role, setRole] = useState(editUser?.role || 'User');
  const [isApproved, setIsApproved] = useState(editUser?.is_approved ?? true);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!name || (!email && !phone)) {
      Alert.alert('Error', 'Please provide a name and at least one of email or phone.');
      return;
    }
    if (phone && phone.length !== 10) {
      Alert.alert('Error', 'Please enter a valid 10-digit phone number.');
      return;
    }
    if (!isEditing && !password) {
      Alert.alert('Error', 'Please set a password for the new account.');
      return;
    }

    const payload = { name, role, is_approved: isApproved };
    if (email) payload.email = email;
    if (phone) payload.phone = '+91' + phone;
    if (password) payload.password = password;

    setLoading(true);
    try {
      if (isEditing) {
        await apiClient.put(`/admin/users/${editUser.id}`, payload);
        Alert.alert('Success', 'User updated successfully!', [{ text: 'OK', onPress: () => navigation.goBack() }]);
      } else {
        await apiClient.post('/admin/users', payload);
        Alert.alert('Success', 'User created successfully!', [{ text: 'OK', onPress: () => navigation.goBack() }]);
      }
    } catch (e) {
      console.error(e);
      const errorMsg = e.response?.data?.errors
        ? Object.values(e.response.data.errors).flat().join('\n')
        : (e.response?.data?.message || `Failed to ${isEditing ? 'update' : 'create'} user.`);
      Alert.alert('Error', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: theme.background }}
    >
      <ScrollView contentContainerStyle={[styles.container, { backgroundColor: theme.background }]} keyboardShouldPersistTaps="handled">
        <Text style={[styles.title, { color: theme.text }]}>{isEditing ? 'Edit User' : 'Add New User'}</Text>
        <Text style={[styles.subtitle, { color: theme.secondaryText }]}>
          {isEditing ? 'Update account details, role & approval status' : 'Create an account directly on behalf of a user'}
        </Text>

        <InputField
          label="Full Name *"
          icon={User}
          placeholder="Full Name"
          value={name}
          onChangeText={setName}
        />
        <InputField
          label="Email"
          icon={Mail}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />

        <PhoneInput
          value={phone}
          onChangeText={setPhone}
          label="Phone Number"
        />

        <InputField
          label={isEditing ? 'Password' : 'Password *'}
          icon={Lock}
          placeholder={isEditing ? 'Leave blank to keep current password' : 'Password'}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          hint={isEditing ? 'Only fill this in if you want to reset their password.' : undefined}
        />

        <Text style={[styles.label, { color: theme.text }]}>Role *</Text>
        <View style={styles.roleContainer}>
          {ROLES.map((r) => (
            <TouchableOpacity
              key={r}
              style={[
                styles.roleButton,
                { borderColor: theme.primary },
                role === r && { backgroundColor: theme.primary }
              ]}
              onPress={() => setRole(r)}
            >
              <Text style={[
                styles.roleText,
                { color: theme.primary },
                role === r && { color: '#fff' }
              ]}>{r}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={[styles.switchRow, { backgroundColor: isDark ? theme.primary + '15' : '#f0f9ff', borderColor: theme.border, borderWidth: isDark ? 1 : 0 }]}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.label, { color: theme.text, marginBottom: 0 }]}>Approved</Text>
            <Text style={[styles.subLabel, { color: theme.primary }]}>Approved accounts can access role-specific features</Text>
          </View>
          <Switch
            value={isApproved}
            onValueChange={setIsApproved}
            trackColor={{ false: theme.border, true: theme.primary + '80' }}
            thumbColor={isApproved ? theme.primary : (isDark ? '#444' : '#f4f3f4')}
          />
        </View>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: theme.primary }, loading && { opacity: 0.7 }]}
          onPress={handleSubmit}
          disabled={loading}
        >
          <CheckCircle2 size={20} color="#fff" />
          <Text style={styles.buttonText}>{loading ? 'Saving...' : (isEditing ? 'Update User' : 'Create User')}</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20 },
  title: { fontSize: 26, fontWeight: 'bold' },
  subtitle: { fontSize: 13, marginTop: 4, marginBottom: 25 },
  label: { fontSize: 15, fontWeight: 'bold', marginBottom: 8 },
  subLabel: { fontSize: 12 },
  roleContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  roleButton: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10, borderWidth: 1 },
  roleText: { fontSize: 12, fontWeight: '600' },
  switchRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 30, padding: 15, borderRadius: 12 },
  button: { padding: 18, borderRadius: 12, alignItems: 'center', flexDirection: 'row', justifyContent: 'center' },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginLeft: 10 },
});

export default AddEditUserScreen;
