import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { Camera, MapPin, Calendar, Clock } from 'lucide-react-native';
import apiClient from '../api/client';
import PhoneInput from '../components/PhoneInput';
import { useTheme } from '../context/ThemeContext';

const AddShopScreen = ({ navigation }) => {
  const [form, setForm] = useState({
    name: '',
    category: '',
    description: '',
    address: '',
    contact_phone: '',
    latitude: '',
    longitude: '',
    opening_days: '',
    opening_hours: ''
  });
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const { theme, isDark } = useTheme();

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.7,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const getCurrentLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Permission to access location was denied');
      return;
    }

    setLoading(true);
    try {
      let location = await Location.getCurrentPositionAsync({});
      setForm({
        ...form,
        latitude: location.coords.latitude.toString(),
        longitude: location.coords.longitude.toString()
      });
      Alert.alert('Success', 'Location captured!');
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Failed to get current location');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!form.name || !form.category || !form.address || form.contact_phone.length !== 10) {
      Alert.alert('Error', 'Please fill in all required fields and a valid 10-digit phone number.');
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('name', form.name);
    formData.append('category', form.category);
    formData.append('description', form.description);
    formData.append('address', form.address);
    formData.append('contact_phone', '+91' + form.contact_phone);
    if (form.latitude) formData.append('latitude', form.latitude);
    if (form.longitude) formData.append('longitude', form.longitude);
    if (form.opening_days) formData.append('opening_days', form.opening_days);
    if (form.opening_hours) formData.append('opening_hours', form.opening_hours);

    if (image) {
      const uriParts = image.split('.');
      const fileType = uriParts[uriParts.length - 1];
      formData.append('image', {
        uri: image,
        name: `photo.${fileType}`,
        type: `image/${fileType}`,
      });
    }

    try {
      await apiClient.post('/shops', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      Alert.alert('Success', 'Shop created successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Failed to create shop.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.form}>
        <Text style={[styles.label, { color: theme.text }]}>Shop Photo</Text>
        <TouchableOpacity style={[styles.imagePicker, { backgroundColor: theme.input, borderColor: theme.border }]} onPress={pickImage}>
          {image ? (
            <Image source={{ uri: image }} style={styles.previewImage} />
          ) : (
            <View style={styles.placeholder}>
              <Camera size={32} color={theme.iconDefault} />
              <Text style={[styles.placeholderText, { color: theme.secondaryText }]}>Select Image</Text>
            </View>
          )}
        </TouchableOpacity>

        <Text style={[styles.label, { color: theme.text }]}>Shop Name *</Text>
        <TextInput
          style={[styles.input, { backgroundColor: theme.input, borderColor: theme.border, color: theme.text }]}
          placeholder="e.g., Downtown Electronics"
          placeholderTextColor={theme.placeholder}
          value={form.name}
          onChangeText={(v) => setForm({...form, name: v})}
        />

        <Text style={[styles.label, { color: theme.text }]}>Category *</Text>
        <TextInput
          style={[styles.input, { backgroundColor: theme.input, borderColor: theme.border, color: theme.text }]}
          placeholder="e.g., Electronics, Grocery, Fashion"
          placeholderTextColor={theme.placeholder}
          value={form.category}
          onChangeText={(v) => setForm({...form, category: v})}
        />

        <Text style={[styles.label, { color: theme.text }]}>Description</Text>
        <TextInput
          style={[styles.input, styles.textArea, { backgroundColor: theme.input, borderColor: theme.border, color: theme.text }]}
          placeholder="What do you sell?"
          placeholderTextColor={theme.placeholder}
          multiline
          numberOfLines={3}
          value={form.description}
          onChangeText={(v) => setForm({...form, description: v})}
        />

        <Text style={[styles.label, { color: theme.text }]}>Address *</Text>
        <TextInput
          style={[styles.input, { backgroundColor: theme.input, borderColor: theme.border, color: theme.text }]}
          placeholder="Full address"
          placeholderTextColor={theme.placeholder}
          value={form.address}
          onChangeText={(v) => setForm({...form, address: v})}
        />

        <PhoneInput 
          value={form.contact_phone}
          onChangeText={(v) => setForm({...form, contact_phone: v})}
          label="Contact Number *"
        />

        <Text style={[styles.label, { color: theme.text }]}>Location Coordinates (Optional)</Text>
        <TouchableOpacity style={[styles.locationButton, { borderColor: theme.primary }]} onPress={getCurrentLocation}>
          <MapPin size={20} color={theme.primary} />
          <Text style={[styles.locationButtonText, { color: theme.primary }]}>Capture Current Location</Text>
        </TouchableOpacity>

        <Text style={[styles.label, { color: theme.text }]}>Opening Days</Text>
        <View style={[styles.iconInputRow, { backgroundColor: theme.input, borderColor: theme.border }]}>
          <Calendar size={18} color={theme.iconDefault} />
          <TextInput
            style={[styles.iconInput, { color: theme.text }]}
            placeholder="e.g. Mon - Sat or Daily"
            placeholderTextColor={theme.placeholder}
            value={form.opening_days}
            onChangeText={(v) => setForm({...form, opening_days: v})}
          />
        </View>

        <Text style={[styles.label, { color: theme.text }]}>Opening Hours</Text>
        <View style={[styles.iconInputRow, { backgroundColor: theme.input, borderColor: theme.border }]}>
          <Clock size={18} color={theme.iconDefault} />
          <TextInput
            style={[styles.iconInput, { color: theme.text }]}
            placeholder="e.g. 10:00 AM - 08:00 PM"
            placeholderTextColor={theme.placeholder}
            value={form.opening_hours}
            onChangeText={(v) => setForm({...form, opening_hours: v})}
          />
        </View>

        <View style={styles.row}>
          <View style={{ flex: 1, marginRight: 10 }}>
            <Text style={[styles.subLabel, { color: theme.secondaryText }]}>Latitude</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.input, borderColor: theme.border, color: theme.text }]}
              placeholder="e.g. 21.1234"
              placeholderTextColor={theme.placeholder}
              value={form.latitude}
              onChangeText={(v) => setForm({...form, latitude: v})}
              keyboardType="numeric"
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.subLabel, { color: theme.secondaryText }]}>Longitude</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.input, borderColor: theme.border, color: theme.text }]}
              placeholder="e.g. 81.5678"
              placeholderTextColor={theme.placeholder}
              value={form.longitude}
              onChangeText={(v) => setForm({...form, longitude: v})}
              keyboardType="numeric"
            />
          </View>
        </View>

        <TouchableOpacity 
          style={[styles.button, { backgroundColor: theme.primary }, loading && { opacity: 0.7 }]} 
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={styles.buttonText}>{loading ? 'Creating...' : 'Create Shop'}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  form: { padding: 20 },
  label: { fontSize: 16, fontWeight: 'bold', marginBottom: 8 },
  input: { padding: 15, borderRadius: 10, marginBottom: 20, borderWidth: 1 },
  textArea: { height: 80, textAlignVertical: 'top' },
  button: { padding: 18, borderRadius: 10, alignItems: 'center', marginTop: 10 },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  imagePicker: { height: 180, borderRadius: 10, borderWidth: 1, borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center', marginBottom: 20, overflow: 'hidden' },
  previewImage: { width: '100%', height: '100%' },
  placeholder: { alignItems: 'center' },
  placeholderText: { marginTop: 5 },
  locationButton: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 10, borderWidth: 1, marginBottom: 15, justifyContent: 'center' },
  locationButtonText: { fontWeight: 'bold', marginLeft: 10 },
  iconInputRow: { flexDirection: 'row', alignItems: 'center', padding: 15, borderRadius: 10, marginBottom: 20, borderWidth: 1 },
  iconInput: { flex: 1, marginLeft: 10, fontSize: 15 },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  subLabel: { fontSize: 12, marginBottom: 5 }
});

export default AddShopScreen;
