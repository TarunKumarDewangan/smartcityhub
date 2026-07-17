import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, Switch } from 'react-native';
import { Save, Calendar, Clock } from 'lucide-react-native';
import apiClient from '../api/client';
import PhoneInput from '../components/PhoneInput';
import { useTheme } from '../context/ThemeContext';

const AddEditServiceScreen = ({ navigation, route }) => {
  const editService = route.params?.service;
  const isEditing = !!editService;
  const { theme, isDark } = useTheme();

  const [form, setForm] = useState({
    name: editService?.name || '',
    category: editService?.category || '',
    area: editService?.area || '',
    contact_phone: editService?.contact_phone?.replace('+91', '') || '',
    description: editService?.description || '',
    is_available: editService?.is_available ?? true,
    working_days: editService?.working_days || '',
    working_hours: editService?.working_hours || '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!form.name || !form.category || !form.area || form.contact_phone.length !== 10) {
      Alert.alert('Error', 'Please fill in all required fields and enter a valid 10-digit phone number.');
      return;
    }

    setLoading(true);
    const payload = {
      ...form,
      contact_phone: '+91' + form.contact_phone
    };

    try {
      if (isEditing) {
        await apiClient.put(`/services/${editService.id}`, payload);
        Alert.alert('Success', 'Service updated successfully!', [{ text: 'OK', onPress: () => navigation.goBack() }]);
      } else {
        await apiClient.post('/services', payload);
        Alert.alert('Success', 'Service added! It will be visible once Admin approves your profile.', [{ text: 'OK', onPress: () => navigation.navigate('ManageServices') }]);
      }
    } catch (e) {
      console.error(e);
      Alert.alert('Error', `Failed to ${isEditing ? 'update' : 'add'} service.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.form}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>{isEditing ? 'Edit Service' : 'Add New Service'}</Text>
        <Text style={[styles.subtitle, { color: theme.secondaryText }]}>List your expertise for the city to see.</Text>

        <Text style={[styles.label, { color: theme.text }]}>Service Name / Title *</Text>
        <TextInput
          style={[styles.input, { backgroundColor: theme.input, borderColor: theme.border, color: theme.text }]}
          placeholder="e.g. Professional AC Repair"
          placeholderTextColor={theme.placeholder}
          value={form.name}
          onChangeText={(v) => setForm({...form, name: v})}
        />

        <Text style={[styles.label, { color: theme.text }]}>Category *</Text>
        <TextInput
          style={[styles.input, { backgroundColor: theme.input, borderColor: theme.border, color: theme.text }]}
          placeholder="e.g. AC Repair, Electrician, Plumber"
          placeholderTextColor={theme.placeholder}
          value={form.category}
          onChangeText={(v) => setForm({...form, category: v})}
        />

        <Text style={[styles.label, { color: theme.text }]}>Service Area *</Text>
        <TextInput
          style={[styles.input, { backgroundColor: theme.input, borderColor: theme.border, color: theme.text }]}
          placeholder="e.g. Civil Lines, Shankar Nagar"
          placeholderTextColor={theme.placeholder}
          value={form.area}
          onChangeText={(v) => setForm({...form, area: v})}
        />

        <PhoneInput 
          value={form.contact_phone}
          onChangeText={(v) => setForm({...form, contact_phone: v})}
          label="Direct Contact Number *"
        />

        <Text style={[styles.label, { color: theme.text }]}>Description</Text>
        <TextInput
          style={[styles.input, styles.textArea, { backgroundColor: theme.input, borderColor: theme.border, color: theme.text }]}
          placeholder="Tell customers about your experience, pricing, etc."
          placeholderTextColor={theme.placeholder}
          multiline
          numberOfLines={4}
          value={form.description}
          onChangeText={(v) => setForm({...form, description: v})}
        />

        <View style={[styles.switchRow, { backgroundColor: isDark ? theme.primary + '15' : '#f0f9ff', borderColor: theme.border, borderWidth: isDark ? 1 : 0 }]}>
            <View style={{ flex: 1 }}>
                <Text style={[styles.label, { color: theme.text, marginBottom: 0 }]}>Availability Status</Text>
                <Text style={[styles.subLabel, { color: theme.primary }]}>Show this service to the public</Text>
            </View>
            <Switch
                value={form.is_available}
                onValueChange={(v) => setForm({...form, is_available: v})}
                trackColor={{ false: theme.border, true: theme.primary + '80' }}
                thumbColor={form.is_available ? theme.primary : (isDark ? '#444' : '#f4f3f4')}
            />
        </View>

        <Text style={[styles.label, { color: theme.text }]}>Working Days</Text>
        <View style={[styles.iconInputRow, { backgroundColor: theme.input, borderColor: theme.border }]}>
          <Calendar size={18} color={theme.secondaryText} />
          <TextInput
            style={[styles.iconInput, { color: theme.text }]}
            placeholder="e.g. Mon, Wed, Fri or Daily"
            placeholderTextColor={theme.placeholder}
            value={form.working_days}
            onChangeText={(v) => setForm({...form, working_days: v})}
          />
        </View>

        <Text style={[styles.label, { color: theme.text }]}>Working Hours</Text>
        <View style={[styles.iconInputRow, { backgroundColor: theme.input, borderColor: theme.border, marginBottom: 20 }]}>
          <Clock size={18} color={theme.secondaryText} />
          <TextInput
            style={[styles.iconInput, { color: theme.text }]}
            placeholder="e.g. 09:00 AM - 06:00 PM"
            placeholderTextColor={theme.placeholder}
            value={form.working_hours}
            onChangeText={(v) => setForm({...form, working_hours: v})}
          />
        </View>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: theme.primary }, loading && { opacity: 0.7 }]} 
          onPress={handleSubmit}
          disabled={loading}
        >
          <Save size={20} color="#fff" />
          <Text style={styles.buttonText}>{loading ? 'Saving...' : (isEditing ? 'Update Service' : 'List Service')}</Text>
        </TouchableOpacity>
        
        <View style={{ height: 40 }} />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  form: { padding: 20 },
  headerTitle: { fontSize: 28, fontWeight: 'bold' },
  subtitle: { fontSize: 14, marginBottom: 25 },
  label: { fontSize: 15, fontWeight: 'bold', marginBottom: 8 },
  input: { padding: 15, borderRadius: 12, marginBottom: 20, borderWidth: 1 },
  textArea: { height: 100, textAlignVertical: 'top' },
  switchRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 30, padding: 15, borderRadius: 12 },
  subLabel: { fontSize: 12 },
  iconInputRow: { flexDirection: 'row', alignItems: 'center', padding: 15, borderRadius: 12, marginBottom: 20, borderWidth: 1 },
  iconInput: { flex: 1, marginLeft: 10, fontSize: 15 },
  button: { padding: 18, borderRadius: 12, alignItems: 'center', marginTop: 10, flexDirection: 'row', justifyContent: 'center' },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginLeft: 10 },
});

export default AddEditServiceScreen;
