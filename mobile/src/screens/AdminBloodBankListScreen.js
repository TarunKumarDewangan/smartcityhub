import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Alert, ActivityIndicator
} from 'react-native';
import { Droplet, Phone, Trash2, Plus } from 'lucide-react-native';
import { useFocusEffect } from '@react-navigation/native';
import apiClient from '../api/client';
import { useTheme } from '../context/ThemeContext';

const AdminBloodBankListScreen = ({ navigation }) => {
  const { theme, isDark } = useTheme();
  const [banks, setBanks] = useState([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(useCallback(() => { fetchBanks(); }, []));

  const fetchBanks = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/blood-banks');
      setBanks(Array.isArray(res.data) ? res.data : (res.data?.data || []));
    } catch (e) {
      Alert.alert('Error', 'Failed to load blood banks');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (item) => {
    Alert.alert('Delete Blood Bank', `Remove "${item.name}"? This cannot be undone.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          try {
            await apiClient.delete(`/blood-banks/${item.id}`);
            fetchBanks();
          } catch (e) {
            Alert.alert('Error', 'Failed to delete blood bank.');
          }
        }
      }
    ]);
  };

  const renderItem = ({ item }) => (
    <View style={[styles.card, { backgroundColor: theme.card }]}>
      <View style={[styles.iconBox, { backgroundColor: '#fee2e2' }]}>
        <Droplet size={22} color={theme.error} />
      </View>
      <View style={styles.info}>
        <Text style={[styles.name, { color: theme.text }]}>{item.name}</Text>
        <Text style={[styles.address, { color: theme.secondaryText }]} numberOfLines={1}>
          {item.address}
        </Text>
        <Text style={[styles.blood, { color: theme.error }]}>
          {item.blood_groups_available || 'No groups listed'}
        </Text>
        <View style={styles.contactRow}>
          <Phone size={12} color={theme.primary} />
          <Text style={[styles.contact, { color: theme.primary }]}> {item.contact}</Text>
        </View>
      </View>
      <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item)}>
        <Trash2 size={20} color={theme.error} />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <TouchableOpacity
        style={[styles.addBtn, { backgroundColor: theme.error }]}
        onPress={() => navigation.navigate('AddBloodBank')}
      >
        <Plus size={18} color="#fff" />
        <Text style={styles.addBtnText}>Add Blood Bank Provider</Text>
      </TouchableOpacity>

      {loading ? (
        <ActivityIndicator size="large" color={theme.error} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={banks}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 20, paddingTop: 10 }}
          ListEmptyComponent={
            <Text style={[styles.empty, { color: theme.secondaryText }]}>
              No blood banks registered yet.
            </Text>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  addBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    margin: 20, padding: 14, borderRadius: 12, elevation: 3,
  },
  addBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 15, marginLeft: 8 },
  card: {
    flexDirection: 'row', alignItems: 'center', padding: 14,
    borderRadius: 14, marginBottom: 12, elevation: 2,
  },
  iconBox: { width: 48, height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  info: { flex: 1 },
  name: { fontSize: 15, fontWeight: 'bold', marginBottom: 2 },
  address: { fontSize: 12, marginBottom: 2 },
  blood: { fontSize: 11, fontWeight: 'bold', marginBottom: 3 },
  contactRow: { flexDirection: 'row', alignItems: 'center' },
  contact: { fontSize: 13, fontWeight: '600' },
  deleteBtn: { padding: 10 },
  empty: { textAlign: 'center', marginTop: 60, fontSize: 15 },
});

export default AdminBloodBankListScreen;
