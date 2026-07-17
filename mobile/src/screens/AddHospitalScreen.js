import React, { useState } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, ScrollView,
    Alert, KeyboardAvoidingView, Platform, StatusBar,
    ActivityIndicator, Switch
} from 'react-native';
import * as Location from 'expo-location';
import apiClient from '../api/client';
import {
    User, Mail, Lock, PlusCircle, MapPin, Building,
    Siren, BedDouble, Zap, Navigation, CheckCircle, Loader
} from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';
import InputField from '../components/InputField';

const AddHospitalScreen = ({ navigation }) => {
    const [loading, setLoading] = useState(false);
    const { theme, isDark } = useTheme();

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        hospital_name: '',
        address: '',
    });

    const [hasEmergency, setHasEmergency] = useState(false);
    const [bedCount, setBedCount] = useState('');
    const [emergencyServices, setEmergencyServices] = useState('');

    // Location state
    const [location, setLocation] = useState(null);      // { latitude, longitude }
    const [locationLoading, setLocationLoading] = useState(false);
    const [locationLabel, setLocationLabel] = useState('');

    const captureLocation = async () => {
        setLocationLoading(true);
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert(
                    'Permission Denied',
                    'Location permission is required to capture the hospital\'s exact position.'
                );
                return;
            }

            const pos = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.High,
            });
            const { latitude, longitude } = pos.coords;
            setLocation({ latitude, longitude });

            // Reverse geocode for a human-readable label
            const [place] = await Location.reverseGeocodeAsync({ latitude, longitude });
            if (place) {
                const parts = [place.name, place.street, place.city, place.region].filter(Boolean);
                setLocationLabel(parts.join(', '));
            } else {
                setLocationLabel(`${latitude.toFixed(5)}, ${longitude.toFixed(5)}`);
            }
        } catch (e) {
            Alert.alert('Error', 'Failed to get location. Please try again.');
            console.error(e);
        } finally {
            setLocationLoading(false);
        }
    };

    const handleCreate = async () => {
        const { name, email, password, hospital_name, address } = formData;
        if (!name || !email || !password || !hospital_name || !address) {
            Alert.alert('Error', 'Please fill all required fields');
            return;
        }
        if (hasEmergency && !bedCount) {
            Alert.alert('Error', 'Please enter the number of beds');
            return;
        }

        setLoading(true);
        try {
            const payload = {
                ...formData,
                has_emergency: hasEmergency,
                bed_count: hasEmergency ? parseInt(bedCount, 10) : null,
                emergency_services: hasEmergency ? emergencyServices : null,
                latitude: location?.latitude ?? null,
                longitude: location?.longitude ?? null,
            };
            await apiClient.post('/admin/create-hospital', payload);
            Alert.alert('Success', 'Hospital provider created successfully!');
            navigation.goBack();
        } catch (e) {
            console.error(e);
            Alert.alert('Error', e.response?.data?.message || 'Failed to create provider');
        } finally {
            setLoading(false);
        }
    };

    const update = (key, value) => setFormData(prev => ({ ...prev, [key]: value }));

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={[styles.container, { backgroundColor: theme.background }]}
        >
            <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
                <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

                <View style={styles.header}>
                    <Text style={[styles.title, { color: theme.text }]}>New Hospital</Text>
                    <Text style={[styles.subtitle, { color: theme.secondaryText }]}>
                        Create a new provider account and hospital record
                    </Text>
                </View>

                <View style={[styles.card, { backgroundColor: theme.card, shadowColor: isDark ? '#000' : '#d1d5db' }]}>

                    {/* ── Staff Account ── */}
                    <Text style={[styles.sectionHeader, { color: theme.text }]}>Staff Account Details</Text>

                    <InputField
                        label="Representative Name"
                        icon={User}
                        value={formData.name}
                        onChangeText={text => update('name', text)}
                        placeholder="Full Name"
                        theme={theme}
                    />
                    <InputField
                        label="Email Address"
                        icon={Mail}
                        value={formData.email}
                        onChangeText={text => update('email', text)}
                        placeholder="Email for login"
                        keyboardType="email-address"
                        theme={theme}
                    />
                    <InputField
                        label="Login Password"
                        icon={Lock}
                        value={formData.password}
                        onChangeText={text => update('password', text)}
                        placeholder="Minimum 6 characters"
                        secureTextEntry
                        theme={theme}
                    />

                    <View style={[styles.divider, { backgroundColor: theme.divider }]} />

                    {/* ── Hospital Info ── */}
                    <Text style={[styles.sectionHeader, { color: theme.text }]}>Hospital Information</Text>

                    <InputField
                        label="Hospital Name"
                        icon={Building}
                        value={formData.hospital_name}
                        onChangeText={text => update('hospital_name', text)}
                        placeholder="Official Hospital Name"
                        theme={theme}
                    />
                    <InputField
                        label="Physical Address"
                        icon={MapPin}
                        value={formData.address}
                        onChangeText={text => update('address', text)}
                        placeholder="Full address"
                        multiline
                        theme={theme}
                    />

                    {/* ── Location Capture ── */}
                    <View style={styles.locationLabel}>
                        <Text style={[styles.fieldLabel, { color: theme.text }]}>Exact Location</Text>
                        <Text style={[styles.fieldSub, { color: theme.secondaryText }]}>
                            Pin GPS coordinates so users can navigate directly
                        </Text>
                    </View>

                    <TouchableOpacity
                        style={[
                            styles.locationBtn,
                            {
                                backgroundColor: location
                                    ? '#22c55e12'
                                    : theme.primary + '12',
                                borderColor: location ? '#22c55e' : theme.primary,
                            }
                        ]}
                        onPress={captureLocation}
                        disabled={locationLoading}
                    >
                        {locationLoading ? (
                            <ActivityIndicator size="small" color={theme.primary} />
                        ) : location ? (
                            <CheckCircle size={20} color="#22c55e" />
                        ) : (
                            <Navigation size={20} color={theme.primary} />
                        )}

                        <View style={{ flex: 1 }}>
                            <Text style={[
                                styles.locationBtnText,
                                { color: location ? '#22c55e' : theme.primary }
                            ]}>
                                {locationLoading
                                    ? 'Getting location…'
                                    : location
                                        ? 'Location Captured!'
                                        : 'Capture Current Location'}
                            </Text>

                            {location && (
                                <Text style={styles.locationCoords} numberOfLines={1}>
                                    {locationLabel || `${location.latitude.toFixed(5)}, ${location.longitude.toFixed(5)}`}
                                </Text>
                            )}
                        </View>

                        {location && (
                            <TouchableOpacity
                                onPress={() => { setLocation(null); setLocationLabel(''); }}
                                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                            >
                                <Text style={styles.recaptureText}>Recapture</Text>
                            </TouchableOpacity>
                        )}
                    </TouchableOpacity>

                    {location && (
                        <View style={[styles.coordsBox, { backgroundColor: theme.input }]}>
                            <Text style={[styles.coordsText, { color: theme.secondaryText }]}>
                                📍 Lat: <Text style={{ color: theme.text, fontWeight: '600' }}>{location.latitude.toFixed(6)}</Text>
                            </Text>
                            <Text style={[styles.coordsText, { color: theme.secondaryText }]}>
                                📍 Lng: <Text style={{ color: theme.text, fontWeight: '600' }}>{location.longitude.toFixed(6)}</Text>
                            </Text>
                        </View>
                    )}

                    <View style={[styles.divider, { backgroundColor: theme.divider }]} />

                    {/* ── Emergency Toggle ── */}
                    <View style={[styles.toggleRow, { backgroundColor: theme.input, borderColor: hasEmergency ? '#ef4444' : theme.border }]}>
                        <View style={[styles.toggleIconBox, { backgroundColor: hasEmergency ? '#ef444420' : theme.background }]}>
                            <Siren size={20} color={hasEmergency ? '#ef4444' : theme.placeholder} />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.toggleLabel, { color: theme.text }]}>Emergency Service & Beds</Text>
                            <Text style={[styles.toggleSub, { color: theme.secondaryText }]}>
                                {hasEmergency ? 'Emergency services available' : 'Tap to enable emergency info'}
                            </Text>
                        </View>
                        <Switch
                            value={hasEmergency}
                            onValueChange={setHasEmergency}
                            trackColor={{ false: theme.border, true: '#ef444460' }}
                            thumbColor={hasEmergency ? '#ef4444' : theme.placeholder}
                        />
                    </View>

                    {hasEmergency && (
                        <View style={[styles.emergencyBox, { backgroundColor: '#ef444408', borderColor: '#ef444430' }]}>
                            <View style={styles.emergencyHeader}>
                                <Siren size={14} color="#ef4444" />
                                <Text style={styles.emergencyHeaderText}>Emergency Details</Text>
                            </View>
                            <InputField
                                label="Number of Beds"
                                icon={BedDouble}
                                value={bedCount}
                                onChangeText={setBedCount}
                                placeholder="e.g. 50"
                                keyboardType="numeric"
                                theme={theme}
                            />
                            <InputField
                                label="Key Emergency Services"
                                icon={Zap}
                                value={emergencyServices}
                                onChangeText={setEmergencyServices}
                                placeholder="e.g. ICU, Trauma, Cardiac Care"
                                multiline
                                theme={theme}
                            />
                        </View>
                    )}

                    {/* ── Submit ── */}
                    <TouchableOpacity
                        style={[styles.button, { backgroundColor: theme.primary }, loading && styles.disabledButton]}
                        onPress={handleCreate}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <>
                                <PlusCircle size={20} color="#fff" />
                                <Text style={styles.buttonText}>Create Hospital</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    content: { padding: 20 },
    header: { marginBottom: 25 },
    title: { fontSize: 24, fontWeight: 'bold' },
    subtitle: { fontSize: 14, marginTop: 5 },

    card: {
        borderRadius: 16, padding: 20,
        elevation: 2, shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05, shadowRadius: 10,
    },
    sectionHeader: { fontSize: 16, fontWeight: 'bold', marginBottom: 15, marginTop: 5 },
    divider: { height: 1, marginVertical: 14 },

    // Location
    locationLabel: { marginBottom: 8 },
    fieldLabel: { fontSize: 13, fontWeight: '700' },
    fieldSub: { fontSize: 11, marginTop: 2 },

    locationBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        padding: 14,
        borderRadius: 14,
        borderWidth: 1.5,
        marginBottom: 10,
    },
    locationBtnText: { fontSize: 14, fontWeight: '700' },
    locationCoords: { fontSize: 11, color: '#22c55e', marginTop: 2 },
    recaptureText: { fontSize: 11, color: '#6b7280', fontWeight: '600' },

    coordsBox: {
        borderRadius: 10, padding: 10,
        flexDirection: 'row', justifyContent: 'space-around',
        marginBottom: 4,
    },
    coordsText: { fontSize: 12 },

    // Toggle
    toggleRow: {
        flexDirection: 'row', alignItems: 'center', gap: 12,
        padding: 14, borderRadius: 14, borderWidth: 1.5, marginBottom: 14,
    },
    toggleIconBox: {
        width: 40, height: 40, borderRadius: 12,
        justifyContent: 'center', alignItems: 'center',
    },
    toggleLabel: { fontSize: 14, fontWeight: '700' },
    toggleSub: { fontSize: 12, marginTop: 2 },

    // Emergency expanded
    emergencyBox: { borderRadius: 14, borderWidth: 1.5, padding: 14, marginBottom: 14 },
    emergencyHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 },
    emergencyHeaderText: {
        color: '#ef4444', fontSize: 13, fontWeight: '700',
        textTransform: 'uppercase', letterSpacing: 0.5,
    },

    // Submit
    button: {
        flexDirection: 'row', borderRadius: 12,
        height: 55, justifyContent: 'center', alignItems: 'center',
        marginTop: 6, gap: 10,
    },
    disabledButton: { opacity: 0.7 },
    buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});

export default AddHospitalScreen;
