import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Plus, Edit, Trash2, Truck } from 'lucide-react-native';
import apiClient from '../api/client';

const ManageAmbulanceScreen = ({ navigation }) => {
  const [ambulances, setAmbulances] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchAmbulances();
    });
    return unsubscribe;
  }, [navigation]);

  const fetchAmbulances = async () => {
    try {
      const response = await apiClient.get('/ambulances');
      setAmbulances(Array.isArray(response.data) ? response.data : (response.data?.data || []));
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Failed to fetch ambulances');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id) => {
    Alert.alert('Delete', 'Are you sure you want to delete this ambulance?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try {
          await apiClient.delete(`/ambulances/${id}`);
          fetchAmbulances();
        } catch (e) {
          Alert.alert('Error', 'Failed to delete');
        }
      }}
    ]);
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={{ flex: 1 }}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.contact}>{item.contact}</Text>
        <Text style={styles.status}>{item.status} ({item.vehicle_number})</Text>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('AddEditAmbulance', { ambulance: item })}>
          <Edit size={20} color="#007bff" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={() => handleDelete(item.id)}>
          <Trash2 size={20} color="#dc3545" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.addButton} 
        onPress={() => navigation.navigate('AddEditAmbulance')}
      >
        <Plus size={24} color="#fff" />
        <Text style={styles.addButtonText}>Add New Ambulance</Text>
      </TouchableOpacity>

      {loading ? (
        <ActivityIndicator size="large" color="#007bff" style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={ambulances}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          ListEmptyComponent={<Text style={styles.emptyText}>No ambulances found.</Text>}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa', padding: 15 },
  addButton: { 
    flexDirection: 'row', 
    backgroundColor: '#28a745', 
    padding: 15, 
    borderRadius: 10, 
    alignItems: 'center', 
    justifyContent: 'center',
    marginBottom: 20,
    elevation: 2
  },
  addButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginLeft: 10 },
  card: { 
    backgroundColor: '#fff', 
    padding: 15, 
    borderRadius: 10, 
    marginBottom: 10, 
    elevation: 1,
    flexDirection: 'row',
    alignItems: 'center'
  },
  name: { fontSize: 16, fontWeight: 'bold' },
  contact: { color: '#007bff', marginVertical: 2 },
  status: { color: '#666', fontSize: 12 },
  actions: { flexDirection: 'row' },
  actionBtn: { padding: 8, marginLeft: 10 },
  emptyText: { textAlign: 'center', marginTop: 50, color: '#999' }
});

export default ManageAmbulanceScreen;
