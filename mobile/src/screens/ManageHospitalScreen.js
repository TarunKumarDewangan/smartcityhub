import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator, StatusBar, Switch } from 'react-native';
import apiClient from '../api/client';
import { Building, Users, Plus, Edit2, Trash2, User } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';
import { useFocusEffect } from '@react-navigation/native';

const ManageHospitalScreen = ({ navigation }) => {
    const [loading, setLoading] = useState(true);
    const { theme, isDark } = useTheme();
    const [hospital, setHospital] = useState(null);

    useFocusEffect(
        useCallback(() => {
            fetchMyHospital();
        }, [])
    );

    const fetchMyHospital = async () => {
        try {
            const response = await apiClient.get('/my-hospital');
            setHospital(response.data?.data || response.data);
        } catch (e) {
            console.error(e);
            Alert.alert('Error', 'Failed to load hospital details');
        } finally {
            setLoading(false);
        }
    };

    const toggleAvailability = async (doctor) => {
        try {
            const newStatus = !doctor.is_available;
            await apiClient.put(`/hospital-doctors/${doctor.id}`, { is_available: newStatus });
            await fetchMyHospital();
        } catch (e) {
            Alert.alert('Error', 'Failed to update availability');
        }
    };

    const updateDoctorCrowd = async (doctor, status) => {
        try {
            await apiClient.put(`/hospital-doctors/${doctor.id}`, { crowd_status: status });
            await fetchMyHospital();
        } catch (e) {
            Alert.alert('Error', 'Failed to update crowd status');
        }
    };

    const handleDelete = (id) => {
        Alert.alert('Delete Doctor', 'Are you sure you want to remove this doctor?', [
            { text: 'Cancel', style: 'cancel' },
            { 
                text: 'Delete', 
                style: 'destructive',
                onPress: async () => {
                    try {
                        await apiClient.delete(`/hospital-doctors/${id}`);
                        await fetchMyHospital();
                    } catch (e) {
                        Alert.alert('Error', 'Failed to delete doctor');
                    }
                }
            }
        ]);
    };

    if (loading) return (
        <View style={[styles.center, { backgroundColor: theme.background }]}>
            <ActivityIndicator size="large" color={theme.primary} />
        </View>
    );

    return (
        <ScrollView style={[styles.container, { backgroundColor: theme.background }]} contentContainerStyle={styles.content}>
            <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
            
            <View style={styles.header}>
                <View style={[styles.iconContainer, { backgroundColor: theme.primary + '20' }]}>
                    <Building size={30} color={theme.primary} />
                </View>
                <Text style={[styles.title, { color: theme.text }]}>Manage Hospital</Text>
                {hospital?.id && (
                    <Text style={{ color: theme.placeholder, fontSize: 13, marginTop: 4, fontWeight: '600' }}>
                        Hospital ID: {hospital.id}
                    </Text>
                )}
                <Text style={[styles.subtitle, { color: theme.secondaryText }]}>Monitor overall crowd status and manage doctors</Text>
                {hospital && (
                    <TouchableOpacity 
                        style={[
                            { 
                                flexDirection: 'row', 
                                alignItems: 'center', 
                                borderWidth: 1.5, 
                                borderRadius: 10, 
                                paddingVertical: 8, 
                                paddingHorizontal: 16, 
                                marginTop: 12, 
                                gap: 6,
                                borderColor: theme.primary, 
                                backgroundColor: theme.primary + '08'
                            }
                        ]}
                        onPress={() => navigation.navigate('EditHospitalProfile', { hospital })}
                    >
                        <Edit2 size={13} color={theme.primary} />
                        <Text style={{ color: theme.primary, fontWeight: 'bold', fontSize: 13 }}>Edit Profile Details</Text>
                    </TouchableOpacity>
                )}
            </View>

            {/* Calculated Crowd Status Display */}
            <View style={[styles.section, { marginBottom: 25 }]}>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>Overall Crowd Status (Calculated)</Text>
                <View style={[
                    styles.avgCrowdDisplay, 
                    { 
                        backgroundColor: hospital?.crowd_status === 'High' ? '#ef444410' : hospital?.crowd_status === 'Medium' ? '#f59e0b10' : '#22c55e10',
                        borderColor: hospital?.crowd_status === 'High' ? '#ef4444' : hospital?.crowd_status === 'Medium' ? '#f59e0b' : '#22c55e',
                        borderWidth: 1.5,
                        borderRadius: 14,
                        padding: 16,
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 12
                    }
                ]}>
                    <View style={[
                        styles.statusDot, 
                        { 
                            width: 12,
                            height: 12,
                            borderRadius: 6,
                            backgroundColor: hospital?.crowd_status === 'High' ? '#ef4444' : hospital?.crowd_status === 'Medium' ? '#f59e0b' : '#22c55e' 
                        }
                    ]} />
                    <View style={{ flex: 1 }}>
                        <Text style={{ 
                            fontSize: 16, 
                            fontWeight: 'bold', 
                            color: hospital?.crowd_status === 'High' ? '#991b1b' : hospital?.crowd_status === 'Medium' ? '#92400e' : '#166534' 
                        }}>
                            {hospital?.crowd_status === 'High' ? 'High (10+ Patients)' : hospital?.crowd_status === 'Medium' ? 'Medium (5-10 Patients)' : 'Low (1-5 Patients)'}
                        </Text>
                        <Text style={{ fontSize: 11, color: theme.secondaryText, marginTop: 2 }}>
                            Automatically computed from the live crowd status of your doctors.
                        </Text>
                    </View>
                </View>
            </View>

            {/* Doctors List Header */}
            <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>Doctors List</Text>
                <TouchableOpacity 
                    style={[styles.addBtn, { backgroundColor: theme.primary }]}
                    onPress={() => navigation.navigate('AddEditDoctor')}
                >
                    <Plus size={16} color="#fff" />
                    <Text style={styles.addBtnText}>Add Doctor</Text>
                </TouchableOpacity>
            </View>

            {/* Doctors List */}
            {hospital?.doctors && hospital.doctors.length > 0 ? (
                hospital.doctors.map((item) => (
                    <View key={item.id} style={[styles.card, { backgroundColor: theme.card, shadowColor: isDark ? '#000' : '#000', marginBottom: 15 }]}>
                        <View style={styles.cardHeader}>
                            <View style={[styles.avatar, { backgroundColor: theme.primary + '15' }]}>
                                <User color={theme.primary} size={22} />
                            </View>
                            <View style={styles.headerInfo}>
                                <Text style={[styles.name, { color: theme.text }]}>{item.name}</Text>
                                <Text style={[styles.specialty, { color: theme.primary }]}>
                                    {item.specialty} • <Text style={{ fontSize: 11, fontWeight: 'bold', color: theme.secondaryText }}>{item.type.toUpperCase()}</Text>
                                </Text>
                            </View>
                            <Switch 
                                value={!!item.is_available} 
                                onValueChange={() => toggleAvailability(item)}
                                trackColor={{ false: theme.border, true: theme.primary + '80' }}
                                thumbColor={item.is_available ? theme.primary : theme.placeholder}
                            />
                        </View>

                        <View style={[styles.divider, { backgroundColor: theme.divider }]} />

                        <View style={styles.crowdSection}>
                            <Text style={[styles.crowdLabel, { color: theme.text }]}>Patient Queue (Crowd Status)</Text>
                            <View style={styles.crowdPicker}>
                                {[
                                    { key: 'Low', label: 'Low (1-5)', color: '#22c55e' },
                                    { key: 'Medium', label: 'Mid (5-10)', color: '#f59e0b' },
                                    { key: 'High', label: 'High (10+)', color: '#ef4444' }
                                ].map((opt) => (
                                    <TouchableOpacity
                                        key={opt.key}
                                        style={[
                                            styles.crowdBtn,
                                            { borderColor: theme.border },
                                            item.crowd_status === opt.key && {
                                                backgroundColor: opt.key === 'Low' ? '#22c55e15' : opt.key === 'Medium' ? '#f59e0b15' : '#ef444415',
                                                borderColor: opt.color
                                            }
                                        ]}
                                        onPress={() => updateDoctorCrowd(item, opt.key)}
                                    >
                                        <View style={[styles.crowdDot, { backgroundColor: opt.color }]} />
                                        <Text style={[
                                            styles.crowdText,
                                            { color: theme.secondaryText },
                                            (item.crowd_status || 'Low') === opt.key && { color: opt.color, fontWeight: 'bold' }
                                        ]}>{opt.label}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        <View style={styles.actions}>
                            <TouchableOpacity 
                                style={[styles.actionBtn, { backgroundColor: theme.input }]}
                                onPress={() => navigation.navigate('AddEditDoctor', { doctor: item })}
                            >
                                <Edit2 size={14} color={theme.secondaryText} />
                                <Text style={[styles.actionText, { color: theme.secondaryText }]}>Edit</Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                style={[styles.actionBtn, { backgroundColor: theme.error + '15' }]}
                                onPress={() => handleDelete(item.id)}
                            >
                                <Trash2 size={14} color={theme.error} />
                                <Text style={[styles.actionText, { color: theme.error }]}>Remove</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                ))
            ) : (
                <View style={styles.empty}>
                    <Users size={40} color={theme.placeholder} />
                    <Text style={[styles.emptyText, { color: theme.secondaryText }]}>No doctors added yet</Text>
                </View>
            )}
            
            <View style={{ height: 40 }} />
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    content: { padding: 20 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
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
    section: { marginTop: 10 },
    sectionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 10 },
    statusDot: { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
    card: { 
        borderRadius: 16, 
        padding: 15, 
        marginBottom: 15,
        elevation: 2,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4
    },
    cardHeader: { flexDirection: 'row', alignItems: 'center' },
    avatar: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    headerInfo: { flex: 1 },
    name: { fontSize: 16, fontWeight: 'bold' },
    specialty: { fontSize: 13, marginTop: 2, fontWeight: '600' },
    divider: { height: 1, marginVertical: 12 },
    crowdSection: { marginBottom: 15 },
    crowdLabel: { fontSize: 13, fontWeight: '700', marginBottom: 8 },
    crowdPicker: { flexDirection: 'row', gap: 8 },
    crowdBtn: { 
        flex: 1, 
        flexDirection: 'row', 
        alignItems: 'center', 
        justifyContent: 'center', 
        paddingVertical: 8, 
        borderRadius: 10, 
        borderWidth: 1.5,
        gap: 6
    },
    crowdDot: { width: 6, height: 6, borderRadius: 3 },
    crowdText: { fontSize: 11, fontWeight: '500' },
    actions: { flexDirection: 'row', gap: 10 },
    actionBtn: { flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 8, borderRadius: 8, gap: 6 },
    actionText: { fontSize: 12, fontWeight: '600' },
    sectionHeader: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: 15,
        marginTop: 10 
    },
    addBtn: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        paddingHorizontal: 12, 
        paddingVertical: 6, 
        borderRadius: 8 
    },
    addBtnText: { color: '#fff', fontWeight: 'bold', marginLeft: 4, fontSize: 12 },
    empty: { alignItems: 'center', marginTop: 30, padding: 20 },
    emptyText: { fontSize: 14, marginTop: 10 }
});

export default ManageHospitalScreen;

