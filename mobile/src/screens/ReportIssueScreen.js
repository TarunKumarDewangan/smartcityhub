import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Alert,
  ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform
} from 'react-native';
import * as Location from 'expo-location';
import apiClient from '../api/client';
import { AlertTriangle, Tag, FileText, MapPin, User, Phone, Shield, CheckCircle, XCircle } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';
import InputField from '../components/InputField';

const ReportIssueScreen = ({ navigation }) => {
  const [type, setType] = useState('');
  const [description, setDescription] = useState('');
  const [reporterName, setReporterName] = useState('');
  const [reporterPhone, setReporterPhone] = useState('');
  const [location, setLocation] = useState(null); // { latitude, longitude, address }
  const [locationLoading, setLocationLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const { theme, isDark } = useTheme();

  /* ── Location Capture ─────────────────────────────────── */
  const captureLocation = async () => {
    setLocationLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Denied',
          'Location access is needed to pin the exact spot of the issue. You can still submit without it.',
        );
        return;
      }

      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      const { latitude, longitude } = pos.coords;

      // Reverse geocode to get a readable address
      const [place] = await Location.reverseGeocodeAsync({ latitude, longitude });
      const address = [place?.name, place?.street, place?.district, place?.city]
        .filter(Boolean)
        .join(', ');

      setLocation({ latitude, longitude, address });
    } catch (e) {
      Alert.alert('Error', 'Could not fetch location. Please try again.');
    } finally {
      setLocationLoading(false);
    }
  };

  const clearLocation = () => setLocation(null);

  /* ── Submit ───────────────────────────────────────────── */
  const handleSubmit = async () => {
    if (!type.trim() || !description.trim()) {
      Alert.alert('Required Fields', 'Please fill in Issue Type and Description.');
      return;
    }

    setLoading(true);
    try {
      await apiClient.post('/city-issues', {
        type,
        description,
        reporter_name:    reporterName.trim() || undefined,
        reporter_phone:   reporterPhone.trim() || undefined,
        latitude:         location?.latitude,
        longitude:        location?.longitude,
        location_address: location?.address,
      });

      Alert.alert(
        '✅ Report Submitted!',
        'Thank you! City officials will review your report shortly.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (e) {
      Alert.alert('Error', 'Failed to report issue. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: theme.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero Header */}
        <View style={[styles.header, { backgroundColor: isDark ? theme.card : '#fdf2e9' }]}>
          <View style={[styles.iconCircle, { backgroundColor: isDark ? '#7c2d1220' : '#fddccc' }]}>
            <AlertTriangle color={isDark ? '#fb923c' : '#e76f51'} size={36} />
          </View>
          <Text style={[styles.title, { color: theme.text }]}>Report a City Issue</Text>
          <Text style={[styles.subtitle, { color: theme.secondaryText }]}>
            Help us make the city better by reporting infrastructure or safety concerns.
          </Text>
        </View>

        <View style={styles.form}>

          {/* ── Issue Details ──────────────────────────────────── */}
          <Text style={[styles.sectionLabel, { color: theme.secondaryText }]}>Issue Details</Text>

          <InputField
            label="Issue Type *"
            icon={Tag}
            placeholder="e.g., Pothole, Street Light, Sanitation"
            value={type}
            onChangeText={setType}
          />

          <InputField
            label="Description *"
            icon={FileText}
            placeholder="Describe the issue in detail..."
            multiline
            numberOfLines={4}
            value={description}
            onChangeText={setDescription}
          />

          {/* ── Location ──────────────────────────────────────── */}
          <Text style={[styles.sectionLabel, { color: theme.secondaryText }]}>📍 Location</Text>

          {location ? (
            <View style={[styles.locationCard, { backgroundColor: isDark ? '#14532d20' : '#f0fdf4', borderColor: '#86efac' }]}>
              <CheckCircle size={18} color="#22c55e" style={{ flexShrink: 0 }} />
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={[styles.locationTitle, { color: '#16a34a' }]}>Location Captured</Text>
                <Text style={[styles.locationAddr, { color: theme.secondaryText }]} numberOfLines={2}>
                  {location.address || `${location.latitude.toFixed(5)}, ${location.longitude.toFixed(5)}`}
                </Text>
                <Text style={[styles.locationCoords, { color: theme.placeholder }]}>
                  {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                </Text>
              </View>
              <TouchableOpacity onPress={clearLocation} style={styles.clearBtn}>
                <XCircle size={20} color={theme.error} />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={[styles.locationBtn, { borderColor: theme.primary, backgroundColor: theme.primary + '10' }]}
              onPress={captureLocation}
              disabled={locationLoading}
            >
              {locationLoading ? (
                <ActivityIndicator size="small" color={theme.primary} />
              ) : (
                <MapPin size={18} color={theme.primary} />
              )}
              <Text style={[styles.locationBtnText, { color: theme.primary }]}>
                {locationLoading ? 'Fetching Location...' : 'Capture My Location'}
              </Text>
            </TouchableOpacity>
          )}

          <Text style={[styles.locationHint, { color: theme.placeholder }]}>
            📌 Pinning the exact location helps city officials respond faster.
          </Text>

          {/* ── Optional Contact Info ─────────────────────────── */}
          <Text style={[styles.sectionLabel, { color: theme.secondaryText }]}>
            Contact Info{' '}
            <Text style={[styles.optional, { color: theme.placeholder }]}>(optional)</Text>
          </Text>

          {/* Privacy assurance banner */}
          <View style={[styles.privacyBanner, { backgroundColor: isDark ? '#1e3a5f' : '#eff6ff', borderColor: '#93c5fd' }]}>
            <Shield size={16} color="#3b82f6" style={{ flexShrink: 0, marginTop: 1 }} />
            <Text style={[styles.privacyText, { color: isDark ? '#93c5fd' : '#1d4ed8' }]}>
              Your contact details are{' '}
              <Text style={{ fontWeight: 'bold' }}>private & secure</Text>. They are never shared publicly
              and you will{' '}
              <Text style={{ fontWeight: 'bold' }}>not receive any promotional calls</Text>. Providing them
              helps officials follow up on your report if needed.
            </Text>
          </View>

          <InputField
            label="Your Name"
            icon={User}
            placeholder="e.g., Priya Sharma"
            value={reporterName}
            onChangeText={setReporterName}
            autoCapitalize="words"
          />

          <InputField
            label="Mobile Number"
            icon={Phone}
            placeholder="e.g., 9876543210"
            value={reporterPhone}
            onChangeText={setReporterPhone}
            keyboardType="phone-pad"
          />

          {/* ── Submit ────────────────────────────────────────── */}
          <TouchableOpacity
            style={[styles.button, { backgroundColor: theme.primary, opacity: loading ? 0.7 : 1 }]}
            onPress={handleSubmit}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Submit Report</Text>
            )}
          </TouchableOpacity>

          <Text style={[styles.footerNote, { color: theme.placeholder }]}>
            * Required fields
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    paddingVertical: 36,
    paddingHorizontal: 24,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  title: { fontSize: 22, fontWeight: 'bold', textAlign: 'center' },
  subtitle: { textAlign: 'center', marginTop: 8, fontSize: 13, lineHeight: 19 },

  form: { padding: 20 },

  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 10,
    marginTop: 20,
  },
  optional: { fontSize: 11, fontWeight: '400', textTransform: 'none' },

  /* Location button */
  locationBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 14,
    marginBottom: 6,
  },
  locationBtnText: { fontSize: 14, fontWeight: '600' },

  /* Location captured card */
  locationCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 6,
  },
  locationTitle: { fontSize: 13, fontWeight: 'bold' },
  locationAddr: { fontSize: 12, marginTop: 2, lineHeight: 17 },
  locationCoords: { fontSize: 10, marginTop: 3 },
  clearBtn: { padding: 2, marginLeft: 6 },
  locationHint: { fontSize: 11, marginBottom: 4, lineHeight: 16 },

  /* Privacy banner */
  privacyBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginBottom: 14,
    gap: 10,
  },
  privacyText: { fontSize: 12, lineHeight: 18, flex: 1 },

  /* Submit */
  button: {
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 24,
    elevation: 3,
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  footerNote: { textAlign: 'center', fontSize: 11, marginTop: 10, marginBottom: 20 },
});

export default ReportIssueScreen;
