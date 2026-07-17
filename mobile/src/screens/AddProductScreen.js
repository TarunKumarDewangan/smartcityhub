import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, FlatList, ActivityIndicator, Image, ScrollView, StatusBar } from 'react-native';
import apiClient from '../api/client';
import * as ImagePicker from 'expo-image-picker';
import { Plus, Package, Trash2, Edit, Camera, Star } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';

const AddProductScreen = ({ route, navigation }) => {
  const { shopId, shopName } = route.params;
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [image1, setImage1] = useState(null);
  const [image2, setImage2] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await apiClient.get(`/shops/${shopId}/products`);
      setProducts(Array.isArray(response.data) ? response.data : (response.data?.data || []));
    } catch (e) {
      console.error(e);
    } finally {
      setFetching(false);
    }
  };

  const pickImage = async (setter) => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled) {
      setter(result.assets[0].uri);
    }
  };

  const handleAddProduct = async () => {
    if (!name || !price) {
      Alert.alert('Error', 'Please fill in Name and Price.');
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('shop_id', shopId);
    formData.append('name', name);
    formData.append('price', parseFloat(price));
    formData.append('description', description);

    if (image1) {
      const type1 = image1.split('.').pop();
      formData.append('image', {
        uri: image1,
        name: `photo1.${type1}`,
        type: `image/${type1}`,
      });
    }

    if (image2) {
      const type2 = image2.split('.').pop();
      formData.append('image_2', {
        uri: image2,
        name: `photo2.${type2}`,
        type: `image/${type2}`,
      });
    }

    try {
      await apiClient.post('/products', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      Alert.alert('Success', 'Product added!');
      setName('');
      setPrice('');
      setDescription('');
      setImage1(null);
      setImage2(null);
      fetchProducts();
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Failed to add product.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFeatured = async (product) => {
    try {
      await apiClient.put(`/products/${product.id}`, { is_featured: !product.is_featured });
      fetchProducts();
    } catch (e) {
      const errorMsg = e.response?.data?.errors?.is_featured?.[0]
        || e.response?.data?.message
        || 'Failed to update top-selling status.';
      Alert.alert('Error', errorMsg);
    }
  };

  const handleDeleteProduct = (productId) => {
    Alert.alert('Delete Product', 'Are you sure you want to delete this product?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try {
          await apiClient.delete(`/products/${productId}`);
          fetchProducts();
        } catch (e) {
          Alert.alert('Error', 'Failed to delete product.');
        }
      }}
    ]);
  };

  const renderItem = ({ item }) => (
    <View style={styles.productItem}>
      <Package size={20} color="#666" style={{ marginRight: 10 }} />
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={styles.productName}>{item.name}</Text>
          {item.is_featured && (
            <View style={styles.featuredBadge}>
              <Star size={9} color="#fff" fill="#fff" />
              <Text style={styles.featuredBadgeText}>Top Selling</Text>
            </View>
          )}
        </View>
        <Text style={styles.productPrice}>₹{item.price}</Text>
      </View>
      <TouchableOpacity onPress={() => handleToggleFeatured(item)}>
        <Star
          size={20}
          color={item.is_featured ? '#f59e0b' : '#ccc'}
          fill={item.is_featured ? '#f59e0b' : 'transparent'}
          style={{ marginRight: 15 }}
        />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('EditProduct', { product: item, shopId })}>
        <Edit size={20} color="#007bff" style={{ marginRight: 15 }} />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => handleDeleteProduct(item.id)}>
        <Trash2 size={20} color="#dc3545" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        ListHeaderComponent={
          <>
            <Text style={styles.shopSub}>Managing Products for:</Text>
            <Text style={styles.shopTitle}>{shopName}</Text>

            <View style={styles.form}>
              <View style={styles.imageRow}>
                <TouchableOpacity style={styles.imagePickerSmall} onPress={() => pickImage(setImage1)}>
                  {image1 ? <Image source={{ uri: image1 }} style={styles.previewImage} /> : <Camera size={20} color="#666" />}
                </TouchableOpacity>
                <TouchableOpacity style={styles.imagePickerSmall} onPress={() => pickImage(setImage2)}>
                  {image2 ? <Image source={{ uri: image2 }} style={styles.previewImage} /> : <Camera size={20} color="#666" />}
                </TouchableOpacity>
                <Text style={styles.imageLabel}>Add Product Images</Text>
              </View>

              <TextInput
                style={styles.input}
                placeholder="Product Name"
                value={name}
                onChangeText={setName}
              />
              <TextInput
                style={styles.input}
                placeholder="Price"
                keyboardType="numeric"
                value={price}
                onChangeText={setPrice}
              />
              <TextInput
                style={[styles.input, { height: 60 }]}
                placeholder="Brief Description"
                multiline
                value={description}
                onChangeText={setDescription}
              />
              <TouchableOpacity style={styles.addButton} onPress={handleAddProduct} disabled={loading}>
                <Text style={styles.addButtonText}>{loading ? 'Adding...' : 'Add Product'}</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.listHeader}>Current Inventory</Text>
          </>
        }
        data={products}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        ListEmptyComponent={fetching ? null : <Text style={styles.empty}>No products found.</Text>}
        contentContainerStyle={{ paddingBottom: 40 }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20 },
  shopSub: { color: '#666', fontSize: 14 },
  shopTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
  form: { backgroundColor: '#f8f9fa', padding: 15, borderRadius: 10, marginBottom: 30 },
  input: { backgroundColor: '#fff', padding: 10, borderRadius: 5, marginBottom: 10, borderBottomWidth: 1, borderBottomColor: '#ddd' },
  addButton: { backgroundColor: '#007bff', padding: 12, borderRadius: 5, alignItems: 'center' },
  addButtonText: { color: '#fff', fontWeight: 'bold' },
  listHeader: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  productItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#eee' },
  productName: { fontSize: 16, fontWeight: '600' },
  productPrice: { color: '#28a745', fontWeight: 'bold' },
  featuredBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f59e0b', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8, marginLeft: 8 },
  featuredBadgeText: { color: '#fff', fontSize: 9, fontWeight: 'bold', marginLeft: 3 },
  empty: { textAlign: 'center', color: '#999', marginTop: 20 },
  imageRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  imagePickerSmall: { width: 50, height: 50, backgroundColor: '#fff', borderRadius: 5, borderWidth: 1, borderColor: '#ddd', borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center', marginRight: 10, overflow: 'hidden' },
  previewImage: { width: '100%', height: '100%' },
  imageLabel: { color: '#666', fontSize: 14 }
});

export default AddProductScreen;
