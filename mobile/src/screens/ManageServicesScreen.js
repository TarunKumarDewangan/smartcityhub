import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert, StatusBar } from 'react-native';
import apiClient from '../api/client';
import { Wrench, Plus, ChevronRight, Trash2, Edit, AlertCircle } from 'lucide-react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const ManageServicesScreen = ({ navigation }) => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useFocusEffect(
    React.useCallback(() => {
      fetchMyServices();
    }, [])
  );

  const fetchMyServices = async () => {
    try {
      const response = await apiClient.get('/my-services');
      setServices(Array.isArray(response.data) ? response.data : (response.data?.data || []));
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Failed to fetch your services.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteService = (serviceId) => {
    Alert.alert('Delete Service', 'Are you sure you want to remove this service entry?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try {
          await apiClient.delete(`/services/${serviceId}`);
          fetchMyServices();
        } catch (e) {
          Alert.alert('Error', 'Failed to delete service.');
        }
      }}
    ]);
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.iconContainer}>
        <Wrench size={24} color="#007bff" />
      </View>
      <View style={styles.details}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.category}>{item.category} • {item.area}</Text>
        <Text style={[styles.status, { color: item.is_available ? '#28a745' : '#dc3545' }]}>
            {item.is_available ? '● Active' : '○ Hidden'}
        </Text>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity onPress={() => navigation.navigate('AddEditService', { service: item })}>
            <Edit size={20} color="#007bff" style={{ marginRight: 15 }} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleDeleteService(item.id)}>
            <Trash2 size={20} color="#dc3545" />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) return <ActivityIndicator size="large" style={{ flex: 1 }} />;

  return (
    <View style={styles.container}>
      {!user?.is_approved && (
          <View style={styles.approvalWarning}>
              <AlertCircle size={20} color="#856404" />
              <Text style={styles.approvalWarningText}>
                  Your profile is pending Admin approval. Your services will not be visible to the public until approved.
              </Text>
          </View>
      )}

      <View style={styles.header}>
        <Text style={styles.title}>My Services</Text>
        <TouchableOpacity 
          style={styles.addButton} 
          onPress={() => navigation.navigate('AddEditService')}
        >
          <Plus size={20} color="#fff" />
          <Text style={styles.addButtonText}>Add Work</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={services}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>You haven't added any services yet.</Text>
            <TouchableOpacity style={styles.emptyButton} onPress={() => navigation.navigate('AddEditService')}>
              <Text style={styles.emptyButtonText}>Add Your First Service</Text>
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
  approvalWarning: { backgroundColor: '#fff3cd', padding: 15, flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#ffeeba' },
  approvalWarningText: { color: '#856404', fontSize: 13, marginLeft: 10, flex: 1, fontWeight: '500' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, backgroundColor: '#fff', elevation: 2 },
  title: { fontSize: 24, fontWeight: 'bold' },
  addButton: { backgroundColor: '#007bff', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, paddingVertical: 10, borderRadius: 25 },
  addButtonText: { color: '#fff', fontWeight: 'bold', marginLeft: 5 },
  card: { backgroundColor: '#fff', padding: 15, borderRadius: 12, marginBottom: 15, elevation: 1, flexDirection: 'row', alignItems: 'center', borderLeftWidth: 4, borderLeftColor: '#007bff' },
  iconContainer: { width: 45, height: 45, borderRadius: 22.5, backgroundColor: '#e7f1ff', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  details: { flex: 1 },
  name: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  category: { color: '#666', fontSize: 13, marginTop: 2 },
  status: { fontSize: 11, fontWeight: 'bold', marginTop: 4 },
  actions: { flexDirection: 'row', alignItems: 'center' },
  empty: { alignItems: 'center', marginTop: 100 },
  emptyText: { fontSize: 16, color: '#666', marginBottom: 20 },
  emptyButton: { backgroundColor: '#007bff', padding: 15, borderRadius: 10 },
  emptyButtonText: { color: '#fff', fontWeight: 'bold' }
});

export default ManageServicesScreen;
