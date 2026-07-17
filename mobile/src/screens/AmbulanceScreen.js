import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert, Linking } from 'react-native';
import { Truck, Phone, Settings } from 'lucide-react-native';
import apiClient from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const AmbulanceScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [ambulances, setAmbulances] = useState([]);
  const [loading, setLoading] = useState(true);
  const { theme, isDark } = useTheme();

  useEffect(() => {
    fetchAmbulances();
  }, []);

  const fetchAmbulances = async () => {
    try {
      const response = await apiClient.get('/ambulances');
      setAmbulances(Array.isArray(response.data) ? response.data : (response.data?.data || []));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCall = (number) => {
    if (!user) {
        Alert.alert('Login Required', 'Please log in to access verified emergency contact details.', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Log In', onPress: () => navigation.navigate('Login') }
        ]);
        return;
    }
    Linking.openURL(`tel:${number}`);
  };

  const renderItem = ({ item }) => (
    <View style={[styles.card, { backgroundColor: theme.card }]}>
      <View style={styles.iconContainer}>
        <Truck size={32} color={item.status === 'Available' ? theme.success : theme.error} />
      </View>
      <View style={styles.details}>
        <Text style={[styles.vehicleNumber, { color: theme.text }]}>{item.name}</Text>
        <Text style={[styles.contactText, { color: theme.primary }]}>
          {item.contact}
        </Text>
        <Text style={[styles.status, { color: item.status === 'Available' ? theme.success : theme.error }]}>
          • {item.status} ({item.vehicle_number})
        </Text>
      </View>
      <TouchableOpacity style={[styles.callButton, { backgroundColor: theme.primary }]} onPress={() => handleCall(item.contact)}>
        <Phone size={20} color="#fff" />
      </TouchableOpacity>
    </View>
  );

  if (loading) return <View style={{ flex: 1, backgroundColor: theme.background, justifyContent: 'center' }}><ActivityIndicator size="large" color={theme.primary} /></View>;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.headerRow}>
        <Text style={[styles.header, { color: theme.text }]}>Emergency Ambulances</Text>
        {user?.role === 'Admin' && (
          <TouchableOpacity 
            style={styles.manageBtn} 
            onPress={() => navigation.navigate('ManageAmbulances')}
          >
            <Settings size={20} color={theme.primary} />
            <Text style={[styles.manageBtnText, { color: theme.primary }]}>Manage</Text>
          </TouchableOpacity>
        )}
      </View>
      <View style={[styles.noteContainer, { backgroundColor: isDark ? theme.warning + '20' : '#fff3cd', borderColor: isDark ? theme.warning + '40' : '#ffeeba' }]}>
        <Text style={[styles.noteTitle, { color: isDark ? theme.warning : '#856404' }]}>⚠️ Note:</Text>
        <Text style={[styles.noteText, { color: isDark ? theme.warning : '#856404' }]}>
          The data is collected from hospitals and firms and may be incorrect. Some ambulances may not be operating currently. If you are unable to connect to one, please try another.
        </Text>
      </View>
      <FlatList
        data={ambulances}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        ListEmptyComponent={<Text style={[styles.empty, { color: theme.secondaryText }]}>No ambulances available.</Text>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 },
  header: { fontSize: 24, fontWeight: 'bold' },
  manageBtn: { flexDirection: 'row', alignItems: 'center', padding: 5 },
  manageBtnText: { fontWeight: 'bold', marginLeft: 5 },
  noteContainer: { padding: 12, borderRadius: 8, marginBottom: 15, borderWidth: 1 },
  noteTitle: { fontWeight: 'bold', marginBottom: 2 },
  noteText: { fontSize: 13, lineHeight: 18 },
  card: { padding: 15, borderRadius: 10, marginBottom: 15, elevation: 2, flexDirection: 'row', alignItems: 'center' },
  iconContainer: { marginRight: 15 },
  details: { flex: 1 },
  vehicleNumber: { fontSize: 18, fontWeight: 'bold' },
  contactText: { fontSize: 14, fontWeight: 'bold', marginTop: 2 },
  status: { fontSize: 12, fontWeight: '600', marginTop: 2 },
  callButton: { padding: 12, borderRadius: 25 },
  empty: { textAlign: 'center', marginTop: 50 }
});

export default AmbulanceScreen;
