import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, StatusBar } from 'react-native';
import { HeartPulse, ShoppingBag, Wrench, Search, AlertTriangle, Shield, Store, Settings, Droplet, AlertCircle, ChevronRight, Building } from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import HeaderMenu from '../components/HeaderMenu';

const HomeScreen = ({ navigation }) => {
  const { user } = useAuth();
  const { theme, isDark } = useTheme();

  const features = [
    { name: 'Health', icon: <HeartPulse color={isDark ? '#fca5a5' : '#e63946'} size={30} />, screen: 'Health', initialScreen: 'HospitalList', color: isDark ? '#450a0a' : '#fff5f5' },
    { name: 'Market', icon: <ShoppingBag color={isDark ? '#60a5fa' : '#007bff'} size={30} />, screen: 'Market', initialScreen: 'ShopList', color: isDark ? '#172554' : '#f0f7ff' },
    { name: 'Services', icon: <Wrench color={isDark ? '#fbbf24' : '#f4a261'} size={30} />, screen: 'Services', initialScreen: 'ServiceList', color: isDark ? '#451a03' : '#fffaf0' },
  ];

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]} showsVerticalScrollIndicator={false}>
      <StatusBar barStyle="light-content" />
      
      {/* Premium Header */}
      <View style={[styles.header, { backgroundColor: isDark ? theme.primaryDark : theme.primary }]}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.greeting}>Good Day,</Text>
            <Text style={styles.welcome}>{user?.name || 'Regular Citizen'}</Text>
          </View>
          <HeaderMenu />
        </View>
        <Text style={styles.subtitle}>Bringing the city closer to you.</Text>
      </View>
 
      {/* Modern Search Bar */}
      <TouchableOpacity 
        style={[styles.searchBar, { backgroundColor: theme.card, shadowColor: isDark ? '#000' : '#d1d5db' }]} 
        onPress={() => navigation.navigate('Search')}
      >
        <Search color={theme.placeholder} size={20} />
        <Text style={[styles.searchText, { color: theme.placeholder }]}>Search services, help...</Text>
      </TouchableOpacity>
 
      {/* Main Feature Grid */}
      <View style={styles.grid}>
        {features.map((f, i) => (
          <TouchableOpacity 
            key={i} 
            style={[styles.card, { backgroundColor: f.color }]} 
            onPress={() => navigation.navigate(f.screen, { screen: f.initialScreen })}
          >
            <View style={[styles.iconCircle, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#fff' }]}>{f.icon}</View>
            <Text style={[styles.cardText, { color: isDark ? '#cbd5e1' : '#1e293b' }]}>{f.name}</Text>
          </TouchableOpacity>
        ))}

        {/* Specialized Modules */}
        <TouchableOpacity 
          style={[styles.card, { backgroundColor: isDark ? '#431407' : '#fdf2e9' }]} 
          onPress={() => {
              if (!user) {
                  Alert.alert('Join Us', 'Log in to report city issues and help improve our community!', [
                      { text: 'Not Now', style: 'cancel' },
                      { text: 'Login', onPress: () => navigation.navigate('Login') }
                  ]);
              } else {
                  navigation.navigate('ReportIssue');
              }
          }}
        >
          <View style={[styles.iconCircle, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#fff' }]}><AlertTriangle color={isDark ? '#fb923c' : '#e67e22'} size={30} /></View>
          <Text style={[styles.cardText, { color: isDark ? '#cbd5e1' : '#1e293b' }]}>Report Issue</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.card, { backgroundColor: isDark ? '#064e3b' : '#e8f5e9' }]} 
          onPress={() => navigation.navigate('EmergencyServices')}
        >
          <View style={[styles.iconCircle, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#fff' }]}><Shield color={isDark ? '#4ade80' : '#2e7d32'} size={30} /></View>
          <Text style={[styles.cardText, { color: isDark ? '#cbd5e1' : '#1e293b' }]}>Emergency Services</Text>
        </TouchableOpacity>

        {user?.role === 'Hospital' && (
          <TouchableOpacity 
            style={[styles.card, { backgroundColor: isDark ? '#0c4a6e' : '#e0f2fe' }]} 
            onPress={() => navigation.navigate('ManageHospital')}
          >
            <View style={[styles.iconCircle, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#fff' }]}><Building color={isDark ? '#38bdf8' : '#0284c7'} size={30} /></View>
            <Text style={[styles.cardText, { color: isDark ? '#cbd5e1' : '#1e293b' }]}>Manage Hospital</Text>
          </TouchableOpacity>
        )}

        {user?.role === 'ShopOwner' && (
          <TouchableOpacity 
            style={[styles.card, { backgroundColor: isDark ? '#1e1b4b' : '#eef2ff' }]} 
            onPress={() => navigation.navigate('ManageShops')}
          >
            <View style={[styles.iconCircle, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#fff' }]}><Store color={isDark ? '#818cf8' : '#4f46e5'} size={30} /></View>
            <Text style={[styles.cardText, { color: isDark ? '#cbd5e1' : '#1e293b' }]}>Manage Shops</Text>
          </TouchableOpacity>
        )}

        {user?.role === 'Admin' && (
          <TouchableOpacity 
            style={[styles.card, { backgroundColor: isDark ? '#4c0519' : '#fff1f2' }]} 
            onPress={() => navigation.navigate('AdminHome')}
          >
            <View style={[styles.iconCircle, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#fff' }]}><Settings color={isDark ? '#fb7185' : '#e11d48'} size={30} /></View>
            <Text style={[styles.cardText, { color: isDark ? '#cbd5e1' : '#1e293b' }]}>Admin Panel</Text>
          </TouchableOpacity>
        )}

        {user?.role === 'ServiceProvider' && (
          <TouchableOpacity 
            style={[styles.card, { backgroundColor: isDark ? '#134e4a' : '#f0faf9' }]} 
            onPress={() => navigation.navigate('ManageServices')}
          >
            <View style={[styles.iconCircle, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#fff' }]}><Wrench color={isDark ? '#2dd4bf' : '#2a9d8f'} size={30} /></View>
            <Text style={[styles.cardText, { color: isDark ? '#cbd5e1' : '#1e293b' }]}>Manage Services</Text>
          </TouchableOpacity>
        )}

        {user?.role === 'BloodBank' && (
          <TouchableOpacity 
            style={[styles.card, { backgroundColor: isDark ? '#4c0519' : '#fff1f2' }]} 
            onPress={() => navigation.navigate('ManageBloodBank')}
          >
            <View style={[styles.iconCircle, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#fff' }]}><Droplet color={isDark ? '#fb7185' : '#e11d48'} size={30} /></View>
            <Text style={[styles.cardText, { color: isDark ? '#cbd5e1' : '#1e293b' }]}>Manage Blood Bank</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Emergency Quick Bar */}
      <TouchableOpacity 
        style={[styles.alertBox, { backgroundColor: isDark ? '#450a0a' : '#ffe5e5', borderColor: isDark ? '#7f1d1d' : '#ffccd2' }]} 
        onPress={() => navigation.navigate('Ambulance')}
      >
        <View style={[styles.alertIconBg, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : '#fff' }]}>
           <AlertCircle color={theme.error} size={20} />
        </View>
        <Text style={[styles.alertText, { color: isDark ? '#fca5a5' : '#e63946' }]}>Emergency? Find an Ambulance nearby.</Text>
        <ChevronRight color={isDark ? '#fca5a5' : '#e63946'} size={18} />
      </TouchableOpacity>

      {/* Activities Section */}
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Recent Activities</Text>
        <TouchableOpacity><Text style={[styles.seeAll, { color: theme.primary }]}>See All</Text></TouchableOpacity>
      </View>
      <View style={[styles.activityCard, { backgroundColor: theme.card }]}>
        <Text style={[styles.activityEmpty, { color: theme.secondaryText }]}>No recent activities found.</Text>
      </View>



      <View style={{ height: 40 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { 
    paddingTop: 60, 
    paddingBottom: 40, 
    paddingHorizontal: 25, 
    borderBottomLeftRadius: 30, 
    borderBottomRightRadius: 30,
    elevation: 5
  },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  greeting: { color: 'rgba(255,255,255,0.7)', fontSize: 14, fontWeight: '500' },
  welcome: { fontSize: 24, fontWeight: 'bold', color: '#fff', marginTop: 5 },
  subtitle: { color: 'rgba(255,255,255,0.8)', fontSize: 13, marginTop: 15 },
  searchBar: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginHorizontal: 25, 
    marginTop: -25, 
    paddingHorizontal: 15, 
    paddingVertical: 12, 
    borderRadius: 15, 
    elevation: 8,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10
  },
  searchText: { marginLeft: 10, fontSize: 14 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', padding: 15, justifyContent: 'space-between' },
  card: { 
    width: '47%', 
    paddingVertical: 25, 
    paddingHorizontal: 15,
    borderRadius: 20, 
    marginVertical: 8, 
    alignItems: 'center', 
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5
  },
  iconCircle: { 
    width: 60, 
    height: 60, 
    borderRadius: 30, 
    justifyContent: 'center', 
    alignItems: 'center',
    marginBottom: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3
  },
  cardText: { fontWeight: 'bold', fontSize: 15, textAlign: 'center' },
  alertBox: { 
    marginHorizontal: 25, 
    marginVertical: 15, 
    padding: 15, 
    borderRadius: 15, 
    flexDirection: 'row', 
    alignItems: 'center',
    borderWidth: 1
  },
  alertIconBg: { padding: 5, borderRadius: 8, marginRight: 12 },
  alertText: { fontSize: 13, fontWeight: 'bold', flex: 1 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginHorizontal: 25, marginTop: 15 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold' },
  seeAll: { fontSize: 12, fontWeight: 'bold' },
  activityCard: { marginHorizontal: 25, marginTop: 15, padding: 25, borderRadius: 20, alignItems: 'center' },
  activityEmpty: { fontSize: 14 }
});

export default HomeScreen;
