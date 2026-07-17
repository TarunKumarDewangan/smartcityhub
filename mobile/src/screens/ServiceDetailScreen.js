import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, StatusBar, Linking, Share } from 'react-native';
import { Briefcase, ChevronLeft, Star, Phone, MapPin, Share2, User, Clock } from 'lucide-react-native';
import apiClient from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import HeaderMenu from '../components/HeaderMenu';

const ServiceDetailScreen = ({ route, navigation }) => {
  const { serviceId } = route.params;
  const { user } = useAuth();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [requesting, setRequesting] = useState(false);
  const { theme, isDark } = useTheme();

  useEffect(() => {
    fetchServiceDetails();
  }, []);

  const fetchServiceDetails = async () => {
    try {
      const response = await apiClient.get(`/services/${serviceId}`);
      setService(response.data?.data || response.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCall = () => {
    if (service?.contact_phone) Linking.openURL(`tel:${service.contact_phone}`);
  };

  const handleShare = async () => {
    if (!service) return;
    try {
      await Share.share({
        title: service.name,
        message: `🔧 Check out "${service.name}" (${service.category}) on Smart City App!\n\n📍 ${service.area}\n📞 ${service.contact_phone}`,
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleRequest = async () => {
    if (!user) {
      Alert.alert('Session Required', 'Please log in to book city services and track your requests.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Log In', onPress: () => navigation.navigate('Login') }
      ]);
      return;
    }
    setRequesting(true);
    try {
      await apiClient.post('/service-requests', { service_id: serviceId });
      Alert.alert('Success', 'Service request sent! The provider will contact you.');
    } catch (e) {
      Alert.alert('Error', 'Failed to send request.');
    } finally {
      setRequesting(false);
    }
  };

  if (loading) return <View style={[styles.center, { backgroundColor: theme.background }]}><ActivityIndicator size="large" color={theme.primary} /></View>;
  if (!service) return <View style={[styles.center, { backgroundColor: theme.background }]}><Text style={{ color: theme.text }}>Service not found</Text></View>;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle="light-content" transparent backgroundColor="transparent" />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Header Hero */}
        <View style={[styles.header, { backgroundColor: isDark ? theme.primaryDark : '#1e293b' }]}>
          <Briefcase size={60} color="rgba(255,255,255,0.1)" style={styles.headerIcon} />
          <View style={styles.headerOverlay} />

          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <ChevronLeft size={24} color="#fff" />
          </TouchableOpacity>

          <View style={styles.topRightMenu}>
            <HeaderMenu />
          </View>

          <View style={styles.headerContent}>
            <View style={[styles.categoryBadge, { backgroundColor: theme.primary }]}>
              <Text style={styles.categoryText}>{service.category}</Text>
            </View>
            <Text style={styles.serviceName} numberOfLines={2}>{service.name}</Text>
            <View style={styles.ratingRow}>
              <Star size={14} color="#ffc107" fill="#ffc107" />
              <Text style={styles.ratingText}>{service.rating || 'N/A'}</Text>
              <Text style={styles.ratingText}> • {service.area}</Text>
            </View>
          </View>
        </View>

        {/* Action Bar */}
        <View style={[styles.actionBar, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <TouchableOpacity style={styles.actionBtn} onPress={handleCall}>
            <View style={[styles.actionIcon, { backgroundColor: isDark ? theme.primary + '20' : '#eff6ff' }]}>
              <Phone size={18} color={theme.primary} />
            </View>
            <Text style={[styles.actionLabel, { color: theme.secondaryText }]}>Call</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionBtn} onPress={handleShare}>
            <View style={[styles.actionIcon, { backgroundColor: isDark ? theme.warning + '20' : '#fff7ed' }]}>
              <Share2 size={18} color={isDark ? theme.warning : "#ea580c"} />
            </View>
            <Text style={[styles.actionLabel, { color: theme.secondaryText }]}>Share</Text>
          </TouchableOpacity>

          <View style={styles.actionBtn}>
            <View style={[styles.actionIcon, { backgroundColor: service.is_available ? (isDark ? theme.success + '20' : '#f0fdf4') : (isDark ? theme.error + '20' : '#fef2f2') }]}>
              <View style={[styles.statusDot, { backgroundColor: service.is_available ? theme.success : theme.error }]} />
            </View>
            <Text style={[styles.actionLabel, { color: theme.secondaryText }]}>{service.is_available ? 'Available' : 'Busy'}</Text>
          </View>
        </View>

        {/* Overview */}
        <View style={styles.contentSection}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Overview</Text>
          <Text style={[styles.description, { color: theme.secondaryText }]}>
            {service.description || 'No description provided.'}
          </Text>

          <View style={styles.locationCard}>
            <MapPin size={16} color={theme.secondaryText} />
            <Text style={[styles.addressText, { color: theme.secondaryText }]}>{service.area}</Text>
          </View>

          {(service.working_days || service.working_hours) && (
            <View style={[styles.locationCard, { marginTop: 8 }]}>
              <Clock size={16} color={theme.secondaryText} />
              <Text style={[styles.addressText, { color: theme.secondaryText }]}>
                {[service.working_days, service.working_hours].filter(Boolean).join(' • ')}
              </Text>
            </View>
          )}
        </View>

        {/* Provider Info */}
        <View style={styles.contentSection}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Service Provider</Text>
          <View style={[styles.providerCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={[styles.providerAvatar, { backgroundColor: theme.primary + '15' }]}>
              <User size={22} color={theme.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.providerName, { color: theme.text }]} numberOfLines={1}>
                {service.provider?.name || 'Verified Provider'}
              </Text>
              <Text style={[styles.providerMeta, { color: theme.secondaryText }]}>
                {service.contact_phone}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Sticky Book Button */}
      <View style={[styles.bookBar, { backgroundColor: theme.card, borderTopColor: theme.border }]}>
        <TouchableOpacity
          style={[styles.bookBtn, { backgroundColor: theme.primary }, requesting && styles.disabledBtn]}
          onPress={handleRequest}
          disabled={requesting}
        >
          {requesting ? <ActivityIndicator color="#fff" /> : <Text style={styles.bookBtnText}>Book This Service</Text>}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { height: 220, position: 'relative', justifyContent: 'center', alignItems: 'center' },
  headerIcon: { position: 'absolute', alignSelf: 'center' },
  headerOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.35)' },
  backButton: { position: 'absolute', top: 50, left: 15, zIndex: 10, backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: 10, padding: 6 },
  topRightMenu: { position: 'absolute', top: 50, right: 15, zIndex: 10 },
  headerContent: { position: 'absolute', bottom: 25, left: 20, right: 20 },
  categoryBadge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 8, marginBottom: 8 },
  categoryText: { color: '#fff', fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase' },
  serviceName: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  ratingRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  ratingText: { marginLeft: 4, color: '#fff', fontSize: 12, fontWeight: '500' },

  actionBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: -25,
    marginHorizontal: 15,
    borderRadius: 16,
    paddingVertical: 12,
    elevation: 4,
    borderWidth: 1
  },
  actionBtn: { alignItems: 'center', width: '30%' },
  actionIcon: { width: 38, height: 38, borderRadius: 19, justifyContent: 'center', alignItems: 'center', marginBottom: 4 },
  actionLabel: { fontSize: 11, fontWeight: 'bold' },
  statusDot: { width: 12, height: 12, borderRadius: 6 },

  contentSection: { paddingHorizontal: 20, marginTop: 15 },
  sectionTitle: { fontSize: 17, fontWeight: 'bold', marginBottom: 8 },
  description: { fontSize: 14, lineHeight: 22, marginBottom: 15 },
  locationCard: { flexDirection: 'row', alignItems: 'center' },
  addressText: { fontSize: 13, marginLeft: 8, flex: 1 },

  providerCard: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 14, borderWidth: 1 },
  providerAvatar: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  providerName: { fontSize: 15, fontWeight: 'bold' },
  providerMeta: { fontSize: 12, marginTop: 2 },

  bookBar: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 16, borderTopWidth: 1 },
  bookBtn: { paddingVertical: 15, borderRadius: 14, alignItems: 'center' },
  bookBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  disabledBtn: { opacity: 0.6 }
});

export default ServiceDetailScreen;
