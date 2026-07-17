import React, { useState } from 'react';
import { 
    View, Text, StyleSheet, TouchableOpacity, ScrollView, 
    Alert, ActivityIndicator, StatusBar, KeyboardAvoidingView, 
    Platform, Switch 
} from 'react-native';
import * as Location from 'expo-location';
import apiClient from '../api/client';
import { 
    Building, MapPin, Save, Siren, BedDouble, Zap, 
    Navigation, CheckCircle, Phone 
} from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';
import InputField from '../components/InputField';

const EditHospitalProfileScreen = ({ route, navigation }) => {
    const { hospital: initialHospital } = route.params;
    const [hospitalName, setHospitalName] = useState(initialHospital?.name || '');
    const [address, setAddress] = useState(initialHospital?.address || '');
    const [phone, setPhone] = useState(initialHospital?.phone || initialHospital?.contact || '');
    const [submitting, setSubmitting] = useState(false);

    // Emergency states
    const [hasEmergency, setHasEmergency] = useState(!!initialHospital?.has_emergency);
    const [bedCount, setBedCount] = useState(initialHospital?.bed_count ? initialHospital.bed_count.toString() : '');
    const [emergencyServices, setEmergencyServices] = useState(initialHospital?.emergency_services || '');

    // Location state
    const [location, setLocation] = useState(
        initialHospital?.latitude && initialHospital?.longitude 
            ? { latitude: parseFloat(initialHospital.latitude), longitude: parseFloat(initialHospital.longitude) } 
            : null
    );
    const [locationLoading, setLocationLoading] = useState(false);
    const [locationLabel, setLocationLabel] = useState(
        initialHospital?.latitude && initialHospital?.longitude 
            ? `${parseFloat(initialHospital.latitude).toFixed(5)}, ${parseFloat(initialHospital.longitude).toFixed(5)}` 
            : ''
    );

    const { theme, isDark } = useTheme();

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

    const handleUpdate = async () => {
        if (!hospitalName.trim() || !address.trim()) {
            Alert.alert('Error', 'Please fill in the hospital name and address.');
            return;
        }
        if (hasEmergency && !bedCount.trim()) {
            Alert.alert('Error', 'Please enter the number of beds available.');
            return;
        }

        setSubmitting(true);
        try {
            await apiClient.put(`/hospitals/${initialHospital.id}`, {
                name: hospitalName,
                address: address,
                phone: phone,
                has_emergency: hasEmergency,
                bed_count: hasEmergency ? parseInt(bedCount, 10) : null,
                emergency_services: hasEmergency ? emergencyServices : null,
                latitude: location?.latitude ?? null,
                longitude: location?.longitude ?? null,
            });
            Alert.alert('Success', 'Profile updated successfully!');
            navigation.goBack();
        } catch (e) {
            console.error(e);
            Alert.alert('Error', e.response?.data?.message || 'Failed to update profile');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={[styles.container, { backgroundColor: theme.background }]}
        >
            <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
                <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
                
                <View style={styles.header}>
                    <View style={[styles.iconContainer, { backgroundColor: theme.primary + '20' }]}>
                        <Building size={30} color={theme.primary} />
                    </View>
                    <Text style={[styles.title, { color: theme.text }]}>Edit Profile Details</Text>
                    <Text style={[styles.subtitle, { color: theme.secondaryText }]}>
                        Manage your facility information, contacts, and emergency status.
                    </Text>
                </View>

                <View style={[styles.card, { backgroundColor: theme.card, shadowColor: isDark ? '#000' : '#d1d5db' }]}>
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>Hospital Information</Text>

                    <InputField 
                        label="Hospital Name *" 
                        icon={Building} 
                        value={hospitalName}
                        onChangeText={setHospitalName}
                        placeholder="e.g. City General Hospital"
                        theme={theme}
                    />

                    <InputField 
                        label="Address *" 
                        icon={MapPin} 
                        value={address}
                        onChangeText={setAddress}
                        placeholder="Full address"
                        multiline
                        theme={theme}
                    />

                    <InputField 
                        label="Contact Phone" 
                        icon={Phone} 
                        value={phone}
                        onChangeText={setPhone}
                        placeholder="Hospital Contact Number"
                        keyboardType="phone-pad"
                        theme={theme}
                    />

                    {/* Location Capture */}
                    <View style={styles.locationLabel}>
                        <Text style={[styles.fieldLabel, { color: theme.text }]}>Exact Location</Text>
                        <Text style={[styles.fieldSub, { color: theme.secondaryText }]}>
                            Pin GPS coordinates so users can navigate to your hospital
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
                                Lat: <Text style={{ color: theme.text, fontWeight: '600' }}>{location.latitude.toFixed(6)}</Text>
                            </Text>
                            <Text style={[styles.coordsText, { color: theme.secondaryText }]}>
                                Lng: <Text style={{ color: theme.text, fontWeight: '600' }}>{location.longitude.toFixed(6)}</Text>
                            </Text>
                        </View>
                    )}

                    <View style={[styles.divider, { backgroundColor: theme.divider }]} />

                    {/* Emergency Toggle */}
                    <View style={[
                        styles.toggleRow, 
                        { 
                            backgroundColor: theme.input, 
                            borderColor: hasEmergency ? '#ef4444' : theme.border,
                            borderWidth: 1.5 
                        }
                    ]}>
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

                    <TouchableOpacity 
                        style={[styles.button, { backgroundColor: theme.primary }, submitting && styles.disabledButton]} 
                        onPress={handleUpdate}
                        disabled={submitting}
                    >
                        {submitting ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <>
                                <Save size={20} color="#fff" />
                                <Text style={styles.buttonText}>Save Changes</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>
                
                <View style={{ height: 40 }} />
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    content: { padding: 20 },
    header: { alignItems: 'center', marginBottom: 25 },
    iconContainer: { 
        width: 60, 
        height: 60, 
        borderRadius: 30, 
        justifyContent: 'center', 
        alignItems: 'center',
        marginBottom: 15
    },
    title: { fontSize: 24, fontWeight: 'bold' },
    subtitle: { fontSize: 14, marginTop: 5, textAlign: 'center' },
    card: { borderRadius: 16, padding: 20, elevation: 2, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 10 },
    sectionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 15 },
    divider: { height: 1, marginVertical: 20 },
    button: { 
        flexDirection: 'row', 
        borderRadius: 12, 
        height: 55, 
        justifyContent: 'center', 
        alignItems: 'center',
        marginTop: 15
    },
    disabledButton: { opacity: 0.7 },
    buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginLeft: 10 },

    // Location
    locationLabel: { marginBottom: 8, marginTop: 10 },
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
        padding: 14, borderRadius: 14, marginBottom: 14,
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
});

export default EditHospitalProfileScreen;
