import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, KeyboardAvoidingView, Platform, StatusBar, ActivityIndicator, TextInput } from 'react-native';
import * as Location from 'expo-location';
import { Droplet, Phone, MapPin, Info, Save } from 'lucide-react-native';
import apiClient from '../api/client';
import { useTheme } from '../context/ThemeContext';
import InputField from '../components/InputField';

const AddEditBloodBankScreen = ({ route, navigation }) => {
    const { bloodBank: initial } = route.params;
    const { theme, isDark } = useTheme();
    const [submitting, setSubmitting] = useState(false);
    const [locating, setLocating] = useState(false);
    const [bloodBank, setBloodBank] = useState({
        name: initial.name || '',
        address: initial.address || '',
        contact: initial.contact || '',
        blood_groups_available: initial.blood_groups_available || '',
        latitude: initial.latitude != null ? initial.latitude.toString() : '',
        longitude: initial.longitude != null ? initial.longitude.toString() : '',
    });

    const getCurrentLocation = async () => {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission Denied', 'Permission to access location was denied');
            return;
        }

        setLocating(true);
        try {
            let location = await Location.getCurrentPositionAsync({});
            setBloodBank({
                ...bloodBank,
                latitude: location.coords.latitude.toString(),
                longitude: location.coords.longitude.toString()
            });
            Alert.alert('Success', 'Location captured!');
        } catch (e) {
            console.error(e);
            Alert.alert('Error', 'Failed to get current location');
        } finally {
            setLocating(false);
        }
    };

    const handleUpdate = async () => {
        if (!bloodBank.name || !bloodBank.address || !bloodBank.contact) {
            Alert.alert('Error', 'Please fill all required fields');
            return;
        }

        setSubmitting(true);
        try {
            await apiClient.put(`/blood-banks/${initial.id}`, bloodBank);
            Alert.alert('Success', 'Blood bank updated successfully!', [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
        } catch (e) {
            console.error(e);
            Alert.alert('Error', e.response?.data?.message || 'Failed to update blood bank');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={[styles.container, { backgroundColor: theme.background }]}
        >
            <ScrollView contentContainerStyle={styles.content}>
                <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

                <View style={styles.header}>
                    <Text style={[styles.title, { color: theme.text }]}>Edit Blood Bank</Text>
                    <Text style={[styles.subtitle, { color: theme.secondaryText }]}>Update details, stock & location</Text>
                </View>

                <View style={[styles.card, { backgroundColor: theme.card, shadowColor: isDark ? '#000' : '#d1d5db' }]}>
                    <InputField
                        label="Bank Name *"
                        icon={Info}
                        value={bloodBank.name}
                        onChangeText={(text) => setBloodBank({...bloodBank, name: text})}
                        placeholder="e.g. City Central Blood Bank"
                        theme={theme}
                    />

                    <InputField
                        label="Address *"
                        icon={MapPin}
                        value={bloodBank.address}
                        onChangeText={(text) => setBloodBank({...bloodBank, address: text})}
                        placeholder="Full address"
                        multiline
                        theme={theme}
                    />

                    <InputField
                        label="Contact Phone *"
                        icon={Phone}
                        value={bloodBank.contact}
                        onChangeText={(text) => setBloodBank({...bloodBank, contact: text})}
                        placeholder="Phone number"
                        keyboardType="phone-pad"
                        theme={theme}
                    />

                    <InputField
                        label="Blood Groups Available"
                        icon={Droplet}
                        value={bloodBank.blood_groups_available}
                        onChangeText={(text) => setBloodBank({...bloodBank, blood_groups_available: text})}
                        placeholder="e.g. A+, B+, AB-, O+ (Separate with commas)"
                        multiline
                        theme={theme}
                    />

                    <Text style={[styles.label, { color: theme.text }]}>Location Coordinates (Optional)</Text>
                    <TouchableOpacity
                        style={[styles.locationButton, { borderColor: theme.error }]}
                        onPress={getCurrentLocation}
                        disabled={locating}
                    >
                        {locating ? (
                            <ActivityIndicator color={theme.error} size="small" />
                        ) : (
                            <>
                                <MapPin size={20} color={theme.error} />
                                <Text style={[styles.locationButtonText, { color: theme.error }]}>Capture Current Location</Text>
                            </>
                        )}
                    </TouchableOpacity>

                    <View style={styles.row}>
                        <View style={{ flex: 1, marginRight: 10 }}>
                            <Text style={[styles.subLabel, { color: theme.secondaryText }]}>Latitude</Text>
                            <TextInput
                                style={[styles.coordInput, { backgroundColor: theme.input, borderColor: theme.border, color: theme.text }]}
                                placeholder="e.g. 21.1234"
                                placeholderTextColor={theme.placeholder}
                                value={bloodBank.latitude}
                                onChangeText={(text) => setBloodBank({...bloodBank, latitude: text})}
                                keyboardType="numeric"
                            />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.subLabel, { color: theme.secondaryText }]}>Longitude</Text>
                            <TextInput
                                style={[styles.coordInput, { backgroundColor: theme.input, borderColor: theme.border, color: theme.text }]}
                                placeholder="e.g. 81.5678"
                                placeholderTextColor={theme.placeholder}
                                value={bloodBank.longitude}
                                onChangeText={(text) => setBloodBank({...bloodBank, longitude: text})}
                                keyboardType="numeric"
                            />
                        </View>
                    </View>

                    <TouchableOpacity
                        style={[styles.button, { backgroundColor: theme.error }, submitting && styles.disabledButton]}
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
    card: { borderRadius: 16, padding: 20, elevation: 2, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 10 },
    label: { fontSize: 13, fontWeight: '600', marginBottom: 8, marginLeft: 4 },
    locationButton: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 10, borderWidth: 1, marginBottom: 15, justifyContent: 'center' },
    locationButtonText: { fontWeight: 'bold', marginLeft: 10 },
    row: { flexDirection: 'row', justifyContent: 'space-between' },
    subLabel: { fontSize: 12, marginBottom: 5 },
    coordInput: { padding: 12, borderRadius: 10, borderWidth: 1, marginBottom: 15 },
    button: {
        flexDirection: 'row',
        borderRadius: 12,
        height: 55,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10
    },
    disabledButton: { opacity: 0.7 },
    buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginLeft: 10 }
});

export default AddEditBloodBankScreen;
