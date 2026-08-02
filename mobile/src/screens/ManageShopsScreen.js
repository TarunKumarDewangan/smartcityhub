import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert, StatusBar } from 'react-native';
import apiClient from '../api/client';
import { Store, Plus, ChevronRight, Trash2, Edit, Clock, Info } from 'lucide-react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';

const ManageShopsScreen = ({ navigation }) => {
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    React.useCallback(() => {
      fetchMyShops();
    }, [])
  );

  const fetchMyShops = async () => {
    try {
      const response = await apiClient.get('/my-shops');
      setShops(Array.isArray(response.data) ? response.data : (response.data?.data || []));
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Failed to fetch your shops.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteShop = (shopId) => {
    Alert.alert('Delete Shop', 'Are you sure? This will delete the shop and all its products.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try {
          await apiClient.delete(`/shops/${shopId}`);
          fetchMyShops();
        } catch (e) {
          Alert.alert('Error', 'Failed to delete shop.');
        }
      }}
    ]);
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.card} 
      onPress={() => navigation.navigate('AddProduct', { shopId: item.id, shopName: item.name })}
    >
      <View style={styles.iconContainer}>
        <Store size={24} color="#007bff" />
      </View>
      <View style={styles.details}>
        <Text style={styles.name}>{item.name}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={styles.category}>{item.category}</Text>
            {!item.is_approved && (
                <View style={styles.pendingBadge}>
                    <Clock size={10} color="#ea580c" />
                    <Text style={styles.pendingText}>Pending Approval</Text>
                </View>
            )}
        </View>
      </View>
      <TouchableOpacity onPress={() => navigation.navigate('EditShop', { shop: item })}>
        <Edit size={20} color="#007bff" style={{ marginRight: 15 }} />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => handleDeleteShop(item.id)}>
        <Trash2 size={20} color="#dc3545" style={{ marginRight: 15 }} />
      </TouchableOpacity>
      <ChevronRight size={20} color="#ccc" />
    </TouchableOpacity>
  );

  if (loading) return <ActivityIndicator size="large" style={{ flex: 1 }} />;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Shops</Text>
        <TouchableOpacity 
          style={styles.addButton} 
          onPress={() => navigation.navigate('AddShop')}
        >
          <Plus size={20} color="#fff" />
          <Text style={styles.addButtonText}>New Shop</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.infoBanner}>
          <Info size={16} color="#0369a1" />
          <Text style={styles.infoText}>
              Note: New shops need admin approval before they appear in the public Market listing.
          </Text>
      </View>

      <FlatList
        data={shops}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>You haven't added any shops yet.</Text>
            <TouchableOpacity style={styles.emptyButton} onPress={() => navigation.navigate('AddShop')}>
              <Text style={styles.emptyButtonText}>Create Your First Shop</Text>
            </TouchableOpacity>
          </View>
        }
        contentContainerStyle={{ padding: 15 }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, backgroundColor: '#fff', elevation: 2 },
  title: { fontSize: 24, fontWeight: 'bold' },
  addButton: { backgroundColor: '#28a745', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20 },
  addButtonText: { color: '#fff', fontWeight: 'bold', marginLeft: 5 },
  card: { backgroundColor: '#fff', padding: 15, borderRadius: 10, marginBottom: 15, elevation: 1, flexDirection: 'row', alignItems: 'center' },
  iconContainer: { width: 45, height: 45, borderRadius: 22.5, backgroundColor: '#e7f1ff', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  details: { flex: 1 },
  name: { fontSize: 18, fontWeight: 'bold' },
  category: { color: '#666', fontSize: 14 },
  empty: { alignItems: 'center', marginTop: 100 },
  emptyText: { fontSize: 16, color: '#666', marginBottom: 20 },
  emptyButton: { backgroundColor: '#007bff', padding: 15, borderRadius: 10 },
  emptyButtonText: { color: '#fff', fontWeight: 'bold' },
  pendingBadge: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#fff7ed', 
    paddingHorizontal: 8, 
    paddingVertical: 2, 
    borderRadius: 10, 
    marginLeft: 10,
    borderWidth: 1,
    borderColor: '#fed7aa'
  },
  pendingText: { fontSize: 10, color: '#ea580c', fontWeight: 'bold', marginLeft: 4 },
  infoBanner: { 
    flexDirection: 'row', 
    backgroundColor: '#f0f9ff', 
    padding: 12, 
    margin: 15, 
    borderRadius: 8, 
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#bae6fd'
  },
  infoText: { flex: 1, fontSize: 12, color: '#0369a1', marginLeft: 10, lineHeight: 16 }
});

export default ManageShopsScreen;
