import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, Image, ScrollView, Switch } from 'react-native';
import apiClient from '../api/client';
import * as ImagePicker from 'expo-image-picker';
import { Camera } from 'lucide-react-native';

const EditProductScreen = ({ route, navigation }) => {
  const { product, shopId } = route.params;
  const [name, setName] = useState(product.name);
  const [price, setPrice] = useState(product.price.toString());
  const [description, setDescription] = useState(product.description || '');
  const [image1, setImage1] = useState(product.image_url);
  const [image2, setImage2] = useState(product.image_url_2);
  const [newImage1, setNewImage1] = useState(null);
  const [newImage2, setNewImage2] = useState(null);
  const [isFeatured, setIsFeatured] = useState(product.is_featured ?? false);
  const [loading, setLoading] = useState(false);

  const pickImage = (setter, newSetter) => {
    Alert.alert('Update Product Photo', 'Choose an option', [
      { text: 'Take Photo', onPress: () => captureFromCamera(setter, newSetter) },
      { text: 'Choose from Gallery', onPress: () => pickFromGallery(setter, newSetter) },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const pickFromGallery = async (setter, newSetter) => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setter(uri);
      newSetter(uri);
    }
  };

  const captureFromCamera = async (setter, newSetter) => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Camera access is needed to take a photo.');
      return;
    }

    let result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setter(uri);
      newSetter(uri);
    }
  };

  const handleUpdate = async () => {
    if (!name || !price) {
      Alert.alert('Error', 'Please fill in Name and Price.');
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('name', name);
    formData.append('price', parseFloat(price));
    formData.append('description', description);
    formData.append('is_featured', isFeatured ? '1' : '0');
    formData.append('_method', 'PUT');

    if (newImage1) {
      const type1 = newImage1.split('.').pop();
      formData.append('image', {
        uri: newImage1,
        name: `photo1.${type1}`,
        type: `image/${type1}`,
      });
    }

    if (newImage2) {
      const type2 = newImage2.split('.').pop();
      formData.append('image_2', {
        uri: newImage2,
        name: `photo2.${type2}`,
        type: `image/${type2}`,
      });
    }

    try {
      await apiClient.post(`/products/${product.id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      Alert.alert('Success', 'Product updated!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (e) {
      console.error(e);
      const errorMsg = e.response?.data?.errors?.is_featured?.[0]
        || e.response?.data?.message
        || 'Failed to update product.';
      Alert.alert('Error', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.label}>Product Images</Text>
      <View style={styles.imageRow}>
        <TouchableOpacity style={styles.imagePicker} onPress={() => pickImage(setImage1, setNewImage1)}>
          {image1 ? <Image source={{ uri: image1 }} style={styles.previewImage} /> : <Camera size={32} color="#666" />}
        </TouchableOpacity>
        <TouchableOpacity style={styles.imagePicker} onPress={() => pickImage(setImage2, setNewImage2)}>
          {image2 ? <Image source={{ uri: image2 }} style={styles.previewImage} /> : <Camera size={32} color="#666" />}
        </TouchableOpacity>
      </View>

      <Text style={styles.label}>Product Name</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
      />
      <Text style={styles.label}>Price (₹)</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        value={price}
        onChangeText={setPrice}
      />
      <Text style={styles.label}>Description</Text>
      <TextInput
        style={[styles.input, { height: 100 }]}
        multiline
        value={description}
        onChangeText={setDescription}
      />
      <View style={styles.switchRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.label}>Top Selling Product</Text>
          <Text style={styles.switchSub}>Feature this on the shop page (max 3 per shop)</Text>
        </View>
        <Switch
          value={isFeatured}
          onValueChange={setIsFeatured}
          trackColor={{ false: '#ddd', true: '#f59e0b80' }}
          thumbColor={isFeatured ? '#f59e0b' : '#f4f3f4'}
        />
      </View>

      <TouchableOpacity style={styles.button} onPress={handleUpdate} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? 'Updating...' : 'Update Product'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20 },
  label: { fontSize: 16, fontWeight: 'bold', marginBottom: 8, color: '#333' },
  input: { backgroundColor: '#f8f9fa', padding: 15, borderRadius: 10, marginBottom: 20, borderWidth: 1, borderColor: '#ddd' },
  button: { backgroundColor: '#007bff', padding: 18, borderRadius: 10, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  imageRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  switchRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff7ed', padding: 15, borderRadius: 10, marginBottom: 20, borderWidth: 1, borderColor: '#fed7aa' },
  switchSub: { fontSize: 11, color: '#666', marginTop: 2 },
  imagePicker: { width: '48%', height: 150, backgroundColor: '#f8f9fa', borderRadius: 10, borderWidth: 1, borderColor: '#ddd', borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  previewImage: { width: '100%', height: '100%' }
});

export default EditProductScreen;
