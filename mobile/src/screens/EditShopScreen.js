import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ScrollView, Image } from 'react-native';
import apiClient from '../api/client';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import PhoneInput from '../components/PhoneInput';
import { Camera, MapPin, Calendar, Clock } from 'lucide-react-native';

const EditShopScreen = ({ route, navigation }) => {
  const { shop } = route.params;
  
  // Extract 10 digits from existing phone if it has +91
  const initialPhone = shop.contact_phone.startsWith('+91') ? shop.contact_phone.slice(3) : shop.contact_phone;

  const [form, setForm] = useState({
    name: shop.name,
    category: shop.category,
    description: shop.description,
    address: shop.address,
    contact_phone: initialPhone,
    latitude: shop.latitude ? shop.latitude.toString() : '',
    longitude: shop.longitude ? shop.longitude.toString() : '',
    opening_days: shop.opening_days || '',
    opening_hours: shop.opening_hours || ''
  });
  const [image, setImage] = useState(shop.image_url);
  const [newImage, setNewImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.7,
    });

    if (!result.canceled) {
      setNewImage(result.assets[0].uri);
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
    formData.append('_method', 'PUT'); // Laravel requirement for multipart PUT

    if (newImage) {
      const uriParts = newImage.split('.');
      const fileType = uriParts[uriParts.length - 1];
      formData.append('image', {
        uri: newImage,
        name: `photo.${fileType}`,
        type: `image/${fileType}`,
      });
    }

    try {
      await apiClient.post(`/shops/${shop.id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      Alert.alert('Success', 'Shop updated successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Failed to update shop.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.form}>
        <Text style={styles.label}>Shop Photo</Text>
        <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
          {image ? (
            <Image source={{ uri: image }} style={styles.previewImage} />
          ) : (
            <View style={styles.placeholder}>
              <Camera size={32} color="#666" />
              <Text style={styles.placeholderText}>Select Image</Text>
            </View>
          )}
        </TouchableOpacity>

        <Text style={styles.label}>Shop Name *</Text>
        <TextInput
          style={styles.input}
          value={form.name}
          onChangeText={(v) => setForm({...form, name: v})}
        />
        <Text style={styles.label}>Category *</Text>
        <TextInput
          style={styles.input}
          value={form.category}
          onChangeText={(v) => setForm({...form, category: v})}
        />
        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          multiline
          value={form.description}
          onChangeText={(v) => setForm({...form, description: v})}
        />
        <Text style={styles.label}>Address *</Text>
        <TextInput
          style={styles.input}
          value={form.address}
          onChangeText={(v) => setForm({...form, address: v})}
        />
        
        <PhoneInput 
          value={form.contact_phone}
          onChangeText={(v) => setForm({...form, contact_phone: v})}
          label="Contact Number *"
        />

        <Text style={styles.label}>Location Coordinates (Optional)</Text>
        <TouchableOpacity style={styles.locationButton} onPress={getCurrentLocation}>
          <MapPin size={20} color="#007bff" />
          <Text style={styles.locationButtonText}>Capture Current Location</Text>
        </TouchableOpacity>

        <Text style={styles.label}>Opening Days</Text>
        <View style={styles.iconInputRow}>
          <Calendar size={18} color="#666" />
          <TextInput
            style={styles.iconInput}
            placeholder="e.g. Mon - Sat or Daily"
            value={form.opening_days}
            onChangeText={(v) => setForm({...form, opening_days: v})}
          />
        </View>

        <Text style={styles.label}>Opening Hours</Text>
        <View style={styles.iconInputRow}>
          <Clock size={18} color="#666" />
          <TextInput
            style={styles.iconInput}
            placeholder="e.g. 10:00 AM - 08:00 PM"
            value={form.opening_hours}
            onChangeText={(v) => setForm({...form, opening_hours: v})}
          />
        </View>

        <View style={styles.row}>
          <View style={{ flex: 1, marginRight: 10 }}>
            <Text style={styles.subLabel}>Latitude</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 21.1234"
              value={form.latitude}
              onChangeText={(v) => setForm({...form, latitude: v})}
              keyboardType="numeric"
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.subLabel}>Longitude</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 81.5678"
              value={form.longitude}
              onChangeText={(v) => setForm({...form, longitude: v})}
              keyboardType="numeric"
            />
          </View>
        </View>

        <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={loading}>
          <Text style={styles.buttonText}>{loading ? 'Updating...' : 'Update Shop'}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  form: { padding: 20 },
  label: { fontSize: 16, fontWeight: 'bold', marginBottom: 8, color: '#333' },
  input: { backgroundColor: '#f8f9fa', padding: 15, borderRadius: 10, marginBottom: 20, borderWidth: 1, borderColor: '#ddd' },
  textArea: { height: 80, textAlignVertical: 'top' },
  button: { backgroundColor: '#007bff', padding: 18, borderRadius: 10, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  imagePicker: { height: 180, backgroundColor: '#f8f9fa', borderRadius: 10, borderWidth: 1, borderColor: '#ddd', borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center', marginBottom: 20, overflow: 'hidden' },
  previewImage: { width: '100%', height: '100%' },
  placeholder: { alignItems: 'center' },
  placeholderText: { color: '#666', marginTop: 5 },
  locationButton: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 10, borderWidth: 1, borderColor: '#007bff', marginBottom: 15, justifyContent: 'center' },
  locationButtonText: { color: '#007bff', fontWeight: 'bold', marginLeft: 10 },
  iconInputRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8f9fa', padding: 15, borderRadius: 10, marginBottom: 20, borderWidth: 1, borderColor: '#ddd' },
  iconInput: { flex: 1, marginLeft: 10, fontSize: 15, color: '#333' },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  subLabel: { fontSize: 12, color: '#666', marginBottom: 5 }
});

export default EditShopScreen;
