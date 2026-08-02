import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, StatusBar } from 'react-native';
import { Users, UserCog, ShoppingBag, Wrench, Truck, ChevronRight, Droplet, Building, Phone, AlertTriangle } from 'lucide-react-native';
import { useFocusEffect } from '@react-navigation/native';
import apiClient from '../api/client';
import { useTheme } from '../context/ThemeContext';

const AdminCard = ({ title, subtitle, count, icon: Icon, onPress, color, theme, isDark }) => (
  <TouchableOpacity style={[styles.card, { backgroundColor: theme.card, shadowColor: isDark ? '#000' : '#d1d5db' }]} onPress={onPress}>
    <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
      <Icon color={color} size={26} />
    </View>
    <View style={styles.cardContent}>
      <Text style={[styles.cardTitle, { color: theme.text }]}>{title}</Text>
      {subtitle && <Text style={[styles.cardSub, { color: theme.secondaryText }]}>{subtitle}</Text>}
      {count > 0 && (
        <View style={[styles.badge, { backgroundColor: theme.error }]}>
          <Text style={styles.badgeText}>{count} Pending</Text>
        </View>
      )}
    </View>
    <ChevronRight color={theme.placeholder} size={20} />
  </TouchableOpacity>
);

const StatBox = ({ value, label, color, theme, isDark }) => (
  <View style={[styles.statBox, { backgroundColor: theme.card, shadowColor: isDark ? '#000' : '#d1d5db' }]}>
    <Text style={[styles.statNumber, { color: color || theme.primary }]}>{value}</Text>
    <Text style={[styles.statLabel, { color: theme.secondaryText }]}>{label}</Text>
  </View>
);

const AdminHomeScreen = ({ navigation }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { theme, isDark } = useTheme();

  useFocusEffect(
    useCallback(() => {
      fetchStats();
    }, [])
  );

  const fetchStats = async () => {
    try {
      const response = await apiClient.get('/admin/stats');
      setStats(response.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]} showsVerticalScrollIndicator={false}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <Text style={[styles.header, { color: theme.text }]}>Admin Dashboard</Text>

      {/* Stats Row 1 */}
      <View style={styles.statsRow}>
        <StatBox value={stats?.total_users || 0}    label="Users"      theme={theme} isDark={isDark} />
        <StatBox value={stats?.total_shops || 0}    label="Shops"      theme={theme} isDark={isDark} />
        <StatBox value={stats?.total_services || 0} label="Services"   theme={theme} isDark={isDark} />
      </View>
      {/* Stats Row 2 */}
      <View style={styles.statsRow}>
        <StatBox value={stats?.total_hospitals || 0}   label="Hospitals"   color="#0ea5e9" theme={theme} isDark={isDark} />
        <StatBox value={stats?.total_helplines || 0}   label="Helplines"   color="#8b5cf6" theme={theme} isDark={isDark} />
        <StatBox value={stats?.total_blood_banks || 0} label="Blood Banks" color="#e11d48" theme={theme} isDark={isDark} />
      </View>

      {/* Open Issues alert */}
      {(stats?.open_issues || 0) > 0 && (
        <TouchableOpacity
          style={[styles.issueAlert, { backgroundColor: isDark ? '#7c2d12' : '#fef2f2', borderColor: '#fca5a5' }]}
          onPress={() => navigation.navigate('AdminCityIssues')}
        >
          <AlertTriangle size={18} color="#ef4444" />
          <Text style={styles.issueAlertText}>{stats.open_issues} open city issue{stats.open_issues > 1 ? 's' : ''} need attention</Text>
          <ChevronRight size={16} color="#ef4444" />
        </TouchableOpacity>
      )}

      {/* Approvals Section */}
      <Text style={[styles.sectionTitle, { color: theme.secondaryText }]}>Approvals</Text>
      <AdminCard title="User Approvals"    count={stats?.users_pending}    icon={Users}       color="#3b82f6" theme={theme} isDark={isDark} onPress={() => navigation.navigate('UserApproval')} />
      <AdminCard title="Shop Approvals"    count={stats?.shops_pending}    icon={ShoppingBag} color="#22c55e" theme={theme} isDark={isDark} onPress={() => navigation.navigate('ManageAllShops')} />
      <AdminCard title="Service Approvals" count={stats?.services_pending} icon={Wrench}      color="#f59e0b" theme={theme} isDark={isDark} onPress={() => navigation.navigate('ManageAllServices')} />

      {/* User Management Section */}
      <Text style={[styles.sectionTitle, { color: theme.secondaryText }]}>User Management</Text>
      <AdminCard
        title="Manage All Users"
        subtitle="View, edit & remove any account"
        icon={UserCog}
        color="#6366f1"
        theme={theme}
        isDark={isDark}
        onPress={() => navigation.navigate('ManageAllUsers')}
      />

      {/* Health & Emergency Section */}
      <Text style={[styles.sectionTitle, { color: theme.secondaryText }]}>Health & Emergency</Text>
      <AdminCard title="Manage Hospitals"   subtitle="Add, edit & delete hospitals"   icon={Building} color="#0ea5e9" theme={theme} isDark={isDark} onPress={() => navigation.navigate('AdminHospitalList')} />
      <AdminCard title="Manage Ambulances"  subtitle="Add, edit & delete ambulances"  icon={Truck}    color="#ef4444" theme={theme} isDark={isDark} onPress={() => navigation.navigate('ManageAmbulances')} />
      <AdminCard title="Manage Blood Banks" subtitle="List, add & remove blood banks" icon={Droplet}  color="#e11d48" theme={theme} isDark={isDark} onPress={() => navigation.navigate('AdminBloodBankList')} />

      {/* City Management Section */}
      <Text style={[styles.sectionTitle, { color: theme.secondaryText }]}>City Management</Text>
      <AdminCard
        title="Manage Helplines"
        subtitle="Add & update emergency numbers"
        icon={Phone}
        color="#8b5cf6"
        theme={theme}
        isDark={isDark}
        onPress={() => navigation.navigate('AdminManageHelplines')}
      />
      <AdminCard
        title="City Issues"
        subtitle="View & resolve reported problems"
        count={stats?.open_issues}
        icon={AlertTriangle}
        color="#f97316"
        theme={theme}
        isDark={isDark}
        onPress={() => navigation.navigate('AdminCityIssues')}
      />

      <View style={{ height: 40 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  header: { fontSize: 28, fontWeight: 'bold', marginBottom: 20, marginTop: 4 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  statBox: {
    padding: 14, borderRadius: 14, flex: 1, marginHorizontal: 4,
    alignItems: 'center', elevation: 2,
    shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8,
  },
  statNumber: { fontSize: 20, fontWeight: 'bold' },
  statLabel: { fontSize: 10, fontWeight: '600', marginTop: 4, textTransform: 'uppercase' },
  issueAlert: {
    flexDirection: 'row', alignItems: 'center', padding: 12,
    borderRadius: 12, borderWidth: 1, marginBottom: 20, gap: 8,
  },
  issueAlertText: { flex: 1, color: '#ef4444', fontWeight: '600', fontSize: 13 },
  sectionTitle: {
    fontSize: 11, fontWeight: 'bold', marginBottom: 12, marginTop: 8,
    textTransform: 'uppercase', letterSpacing: 1,
  },
  card: {
    flexDirection: 'row', alignItems: 'center', padding: 16,
    borderRadius: 16, marginBottom: 12, elevation: 2,
    shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8,
  },
  iconContainer: { padding: 10, borderRadius: 14, marginRight: 14 },
  cardContent: { flex: 1 },
  cardTitle: { fontSize: 15, fontWeight: 'bold' },
  cardSub: { fontSize: 11, marginTop: 2 },
  badge: {
    alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2,
    borderRadius: 10, marginTop: 4,
  },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
});

export default AdminHomeScreen;
