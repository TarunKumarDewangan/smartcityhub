import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator, StatusBar, Switch } from 'react-native';
import apiClient from '../api/client';
import { User, Plus, Search, Edit2, Trash2, Calendar, Clock } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';
import { useFocusEffect } from '@react-navigation/native';

const formatUnavailableDate = (dateStr) => {
    if (!dateStr) return null;
    const parts = dateStr.split('-');
    if (parts.length !== 3) return null;
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);

    const d = new Date(year, month, day);
    if (isNaN(d.getTime())) return null;

    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    return `${days[d.getDay()]}, ${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
};

const ManageDoctorsScreen = ({ navigation }) => {
    const [loading, setLoading] = useState(true);
    const [doctors, setDoctors] = useState([]);
    const { theme, isDark } = useTheme();

    useFocusEffect(
        useCallback(() => {
            fetchDoctors();
        }, [])
    );

    const fetchDoctors = async () => {
        try {
            const response = await apiClient.get('/hospital-doctors');
            setDoctors(response.data);
        } catch (e) {
            console.error(e);
            Alert.alert('Error', 'Failed to load doctors');
        } finally {
            setLoading(false);
        }
    };

    const toggleAvailability = async (doctor) => {
        try {
            const newStatus = !doctor.is_available;
            await apiClient.put(`/hospital-doctors/${doctor.id}`, { is_available: newStatus });
            setDoctors(doctors.map(d => d.id === doctor.id ? { ...d, is_available: newStatus } : d));
        } catch (e) {
            Alert.alert('Error', 'Failed to update availability');
        }
    };

    const updateDoctorCrowd = async (doctor, status) => {
        try {
            await apiClient.put(`/hospital-doctors/${doctor.id}`, { crowd_status: status });
            setDoctors(doctors.map(d => d.id === doctor.id ? { ...d, crowd_status: status } : d));
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
                        setDoctors(doctors.filter(d => d.id !== id));
                    } catch (e) {
                        Alert.alert('Error', 'Failed to delete doctor');
                    }
                }
            }
        ]);
    };

    const renderDoctor = ({ item }) => (
        <View style={[styles.card, { backgroundColor: theme.card, shadowColor: isDark ? '#000' : '#000' }]}>
            <View style={styles.cardHeader}>
                <View style={[styles.avatar, { backgroundColor: theme.primary + '15' }]}>
                    <User color={theme.primary} size={24} />
                </View>
                <View style={styles.headerInfo}>
                    <Text style={[styles.name, { color: theme.text }]}>{item.name}</Text>
                    <Text style={[styles.specialty, { color: theme.primary }]}>{item.specialty}</Text>
                </View>
                <Switch 
                    value={!!item.is_available} 
                    onValueChange={() => toggleAvailability(item)}
                    trackColor={{ false: theme.border, true: theme.primary + '80' }}
                    thumbColor={item.is_available ? theme.primary : theme.placeholder}
                />
            </View>

            <View style={[styles.divider, { backgroundColor: theme.divider }]} />

            <View style={styles.details}>
                <View style={styles.detailRow}>
                    <View style={styles.tag}>
                        <Text style={[styles.tagText, { color: theme.secondaryText, backgroundColor: theme.input }]}>{item.type}</Text>
                    </View>
                </View>
                {(item.visiting_days || item.visiting_hours) ? (
                    <>
                        {item.visiting_days && (
                            <View style={[styles.infoBox, { marginTop: 8 }]}>
                                <Calendar size={14} color={theme.placeholder} />
                                <Text style={[styles.infoText, { color: theme.secondaryText }]}>{item.visiting_days}</Text>
                            </View>
                        )}
                        {item.visiting_hours && (
                            <View style={[styles.infoBox, { marginTop: 8 }]}>
                                <Clock size={14} color={theme.placeholder} />
                                <Text style={[styles.infoText, { color: theme.secondaryText }]}>{item.visiting_hours}</Text>
                            </View>
                        )}
                    </>
                ) : (
                    <View style={[styles.infoBox, { marginTop: 8 }]}>
                        <Calendar size={14} color={theme.placeholder} />
                        <Text style={[styles.infoText, { color: theme.secondaryText }]}>Available Every Day</Text>
                    </View>
                )}

                {item.unavailable_date && (
                    <View style={[styles.infoBox, { marginTop: 8, backgroundColor: '#ef444408', borderColor: '#ef444430', borderWidth: 1, padding: 8, borderRadius: 8 }]}>
                        <Clock size={14} color="#ef4444" />
                        <Text style={[styles.infoText, { color: '#ef4444', fontWeight: '700' }]}>
                            Off Duty: {formatUnavailableDate(item.unavailable_date)}
                        </Text>
                    </View>
                )}
            </View>

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
                    <Edit2 size={16} color={theme.secondaryText} />
                    <Text style={[styles.actionText, { color: theme.secondaryText }]}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    style={[styles.actionBtn, { backgroundColor: theme.error + '15' }]}
                    onPress={() => handleDelete(item.id)}
                >
                    <Trash2 size={16} color={theme.error} />
                    <Text style={[styles.actionText, { color: theme.error }]}>Remove</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
            
            <View style={styles.headerArea}>
                <Text style={[styles.title, { color: theme.text }]}>Doctors ({doctors.length})</Text>
                <TouchableOpacity 
                    style={[styles.addBtn, { backgroundColor: theme.primary }]}
                    onPress={() => navigation.navigate('AddEditDoctor')}
                >
                    <Plus size={20} color="#fff" />
                    <Text style={styles.addBtnText}>Add New</Text>
                </TouchableOpacity>
            </View>

            {loading ? (
                <View style={styles.center}><ActivityIndicator color={theme.primary} /></View>
            ) : (
                <FlatList 
                    data={doctors}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderDoctor}
                    contentContainerStyle={styles.list}
                    ListEmptyComponent={
                        <View style={styles.empty}>
                            <User size={60} color={theme.placeholder} />
                            <Text style={[styles.emptyText, { color: theme.secondaryText }]}>No doctors added yet</Text>
                        </View>
                    }
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    headerArea: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        paddingHorizontal: 20, 
        paddingVertical: 15 
    },
    title: { fontSize: 20, fontWeight: 'bold' },
    addBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 10 },
    addBtnText: { color: '#fff', fontWeight: 'bold', marginLeft: 5, fontSize: 13 },
    list: { padding: 20 },
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
    avatar: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
    headerInfo: { flex: 1 },
    name: { fontSize: 16, fontWeight: 'bold' },
    specialty: { fontSize: 13, marginTop: 2, fontWeight: '600' },
    divider: { height: 1, marginVertical: 15 },
    details: { marginBottom: 15 },
    detailRow: { flexDirection: 'row', alignItems: 'center' },
    tag: { marginRight: 10 },
    tagText: { fontSize: 10, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, fontWeight: 'bold', textTransform: 'uppercase' },
    infoBox: { flexDirection: 'row', alignItems: 'center', flex: 1 },
    infoText: { fontSize: 12, marginLeft: 6 },
    actions: { flexDirection: 'row', gap: 10 },
    actionBtn: { flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 8, borderRadius: 8, gap: 6 },
    actionText: { fontSize: 12, fontWeight: '600' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    empty: { alignItems: 'center', marginTop: 100 },
    emptyText: { fontSize: 16, marginTop: 15 },
    crowdSection: { marginTop: 5, marginBottom: 15 },
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
    crowdText: { fontSize: 11, fontWeight: '500' }
});

export default ManageDoctorsScreen;
