import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert, Linking } from 'react-native';
import { Shield, Phone, Droplet, Truck } from 'lucide-react-native';
import apiClient from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const EmergencyHub = ({ navigation }) => {
  const { user } = useAuth();
  const [helplines, setHelplines] = useState([]);
  const [bloodBanks, setBloodBanks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Helplines'); // Helplines, Blood Banks
  const { theme, isDark } = useTheme();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [hRes, bRes] = await Promise.all([
        apiClient.get('/helplines'),
        apiClient.get('/blood-banks')
      ]);
      setHelplines(Array.isArray(hRes.data) ? hRes.data : (hRes.data?.data || []));
      setBloodBanks(Array.isArray(bRes.data) ? bRes.data : (bRes.data?.data || []));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const renderHelpline = ({ item }) => (
    <TouchableOpacity 
      key={item.id} 
      style={[styles.listCard, { backgroundColor: theme.card }]} 
      onPress={() => {
          if (!user) {
              Alert.alert('Login Required', 'Please log in to dial verified emergency helplines.', [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Log In', onPress: () => navigation.navigate('Login') }
              ]);
          } else {
              Linking.openURL(`tel:${item.number}`);
          }
      }}
    >
      <View style={[styles.iconBox, { backgroundColor: isDark ? theme.primary + '20' : '#f0f0f0' }]}>
        <Shield color={isDark ? theme.primary : "#666"} size={20} />
      </View>
      <View style={styles.cardContent}>
        <Text style={[styles.cardName, { color: theme.text }]}>{item.name}</Text>
        <Text style={[styles.cardNumber, { color: theme.success }]}>{item.number}</Text>
      </View>
      <Phone color={theme.success} size={20} />
    </TouchableOpacity>
  );

  const renderBloodBank = ({ item }) => (
    <View key={item.id} style={[styles.listCard, { backgroundColor: theme.card }]}>
      <View style={[styles.iconBox, { backgroundColor: isDark ? theme.error + '20' : '#fff0f0' }]}>
        <Droplet color={theme.error} size={20} />
      </View>
      <View style={styles.cardContent}>
        <Text style={[styles.cardName, { color: theme.text }]}>{item.name}</Text>
        <Text style={[styles.cardSub, { color: theme.secondaryText }]}>{item.address}</Text>
        <Text style={[styles.bloodGroups, { color: theme.error }]}>Available: {item.blood_groups_available}</Text>
      </View>
      <TouchableOpacity 
          onPress={() => {
              if (!user) {
                  Alert.alert('Login Required', 'Log in to contact blood banks and check supply availability.', [
                      { text: 'Cancel', style: 'cancel' },
                      { text: 'Log In', onPress: () => navigation.navigate('Login') }
                  ]);
              } else {
                  Linking.openURL(`tel:${item.contact}`);
              }
          }}
      >
        <Phone color={theme.error} size={20} />
      </TouchableOpacity>
    </View>
  );

  if (loading) return <View style={{ flex: 1, backgroundColor: theme.background, justifyContent: 'center' }}><ActivityIndicator size="large" color={theme.primary} /></View>;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={[styles.header, { color: theme.text }]}>Emergency Services</Text>

        {/* Quick Access Grid */}
        <View style={styles.quickGrid}>
          <TouchableOpacity 
            style={[styles.quickCard, { backgroundColor: isDark ? theme.error + '20' : '#fff0f0' }]} 
            onPress={() => navigation.navigate('Ambulance')}
          >
            <Truck color={theme.error} size={32} />
            <Text style={[styles.quickText, { color: theme.text }]}>Ambulances</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.quickCard, { backgroundColor: isDark ? theme.primary + '20' : '#e7f3ff' }]} 
            onPress={() => setActiveTab('Blood Banks')}
          >
            <Droplet color={theme.primary} size={32} />
            <Text style={[styles.quickText, { color: theme.text }]}>Blood Banks</Text>
          </TouchableOpacity>
        </View>

        {/* Tab Selection */}
        <View style={[styles.tabs, { backgroundColor: theme.divider }]}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'Helplines' && [styles.activeTab, { backgroundColor: theme.card }]]} 
            onPress={() => setActiveTab('Helplines')}
          >
            <Text style={[styles.tabText, { color: theme.secondaryText }, activeTab === 'Helplines' && [styles.activeTabText, { color: theme.primary }]]}>Govt Helplines</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'Blood Banks' && [styles.activeTab, { backgroundColor: theme.card }]]} 
            onPress={() => setActiveTab('Blood Banks')}
          >
            <Text style={[styles.tabText, { color: theme.secondaryText }, activeTab === 'Blood Banks' && [styles.activeTabText, { color: theme.primary }]]}>Blood Banks</Text>
          </TouchableOpacity>
        </View>

        {/* Dynamic Content Area */}
        <View style={styles.contentArea}>
          {activeTab === 'Helplines' ? (
            Array.isArray(helplines) && helplines.length > 0
              ? helplines.map((item) => renderHelpline({ item }))
              : <Text style={{ color: theme.secondaryText, textAlign: 'center', marginTop: 20 }}>No helplines found.</Text>
          ) : (
            Array.isArray(bloodBanks) && bloodBanks.length > 0
              ? bloodBanks.map((item) => renderBloodBank({ item }))
              : <Text style={{ color: theme.secondaryText, textAlign: 'center', marginTop: 20 }}>No blood banks found.</Text>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20 },
  header: { fontSize: 28, fontWeight: 'bold', marginTop: 20, marginBottom: 20 },
  quickGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30 },
  quickCard: { width: '48%', padding: 20, borderRadius: 15, alignItems: 'center', elevation: 3 },
  quickText: { marginTop: 10, fontWeight: 'bold' },
  tabs: { flexDirection: 'row', borderRadius: 10, padding: 4, marginBottom: 20 },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 8 },
  activeTab: { elevation: 2 },
  tabText: { fontWeight: '600' },
  activeTabText: { fontWeight: 'bold' },
  contentArea: { paddingBottom: 30 },
  listCard: { padding: 15, borderRadius: 12, marginBottom: 12, flexDirection: 'row', alignItems: 'center', elevation: 1 },
  iconBox: { width: 40, height: 40, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  cardContent: { flex: 1, marginLeft: 15 },
  cardName: { fontSize: 16, fontWeight: 'bold' },
  cardNumber: { fontSize: 16, fontWeight: 'bold', marginTop: 2 },
  cardSub: { fontSize: 12, marginTop: 2 },
  bloodGroups: { fontSize: 11, fontWeight: 'bold', marginTop: 4 }
});

export default EmergencyHub;
