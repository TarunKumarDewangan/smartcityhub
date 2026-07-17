import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator, StatusBar } from 'react-native';
import { Plus, Edit, Trash2, Building, MapPin, Star, ChevronRight } from 'lucide-react-native';
import { useFocusEffect } from '@react-navigation/native';
import apiClient from '../api/client';
import { useTheme } from '../context/ThemeContext';

const AdminHospitalListScreen = ({ navigation }) => {
    const [hospitals, setHospitals] = useState([]);
    const [loading, setLoading] = useState(true);
    const { theme, isDark } = useTheme();

    useFocusEffect(
        useCallback(() => {
            fetchHospitals();
        }, [])
    );

    const fetchHospitals = async () => {
        try {
            const response = await apiClient.get('/hospitals');
            setHospitals(Array.isArray(response.data) ? response.data : (response.data?.data || []));
        } catch (e) {
            console.error(e);
            Alert.alert('Error', 'Failed to fetch hospitals');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = (id, name) => {
        Alert.alert(
            'Delete Hospital',
            `Are you sure you want to delete ${name}? This action cannot be undone.`,
            [
                { text: 'Cancel', style: 'cancel' },
                { 
                    text: 'Delete', 
                    style: 'destructive', 
                    onPress: async () => {
                        try {
                            await apiClient.delete(`/hospitals/${id}`);
                            setHospitals(hospitals.filter(h => h.id !== id));
                            Alert.alert('Success', 'Hospital deleted successfully');
                        } catch (e) {
                            Alert.alert('Error', 'Failed to delete hospital');
                        }
                    } 
                }
            ]
        );
    };

    const renderItem = ({ item }) => (
        <View style={[styles.card, { backgroundColor: theme.card, shadowColor: isDark ? '#000' : '#000' }]}>
            <View style={styles.cardInfo}>
                <View style={[styles.iconBox, { backgroundColor: theme.primary + '15' }]}>
                    <Building size={24} color={theme.primary} />
                </View>
                <View style={{ flex: 1 }}>
                    <Text style={[styles.name, { color: theme.text }]}>{item.name}</Text>
                    <View style={styles.locationRow}>
                        <MapPin size={12} color={theme.placeholder} />
                        <Text style={[styles.location, { color: theme.secondaryText }]} numberOfLines={1}>{item.address}</Text>
                    </View>
                    <View style={styles.detailsRow}>
                        <View style={styles.detailItem}>
                            <Star size={12} color="#f59e0b" />
                            <Text style={[styles.detailText, { color: theme.secondaryText }]}>{item.rating || '0.0'}</Text>
                        </View>
                        <View style={[styles.statusBadge, { backgroundColor: item.crowd_status === 'High' ? '#ef444420' : item.crowd_status === 'Medium' ? '#f59e0b20' : '#22c55e20' }]}>
                            <Text style={[styles.statusText, { color: item.crowd_status === 'High' ? '#ef4444' : item.crowd_status === 'Medium' ? '#f59e0b' : '#22c55e' }]}>{item.crowd_status}</Text>
                        </View>
                    </View>
                </View>
            </View>
            <View style={[styles.actions, { borderTopColor: theme.divider }]}>
                <TouchableOpacity 
                    style={styles.actionBtn} 
                    onPress={() => navigation.navigate('EditHospital', { hospital: item })}
                >
                    <Edit size={18} color={theme.primary} />
                    <Text style={[styles.actionText, { color: theme.primary }]}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    style={styles.actionBtn} 
                    onPress={() => handleDelete(item.id, item.name)}
                >
                    <Trash2 size={18} color="#ef4444" />
                    <Text style={[styles.actionText, { color: '#ef4444' }]}>Delete</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
            
            <TouchableOpacity 
                style={[styles.addButton, { backgroundColor: theme.primary }]} 
                onPress={() => navigation.navigate('AddHospital')}
            >
                <Plus size={20} color="#fff" />
                <Text style={styles.addButtonText}>Onboard New Provider</Text>
            </TouchableOpacity>

            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={theme.primary} />
                </View>
            ) : (
                <FlatList
                    data={hospitals}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderItem}
                    contentContainerStyle={styles.list}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Building size={50} color={theme.placeholder} />
                            <Text style={[styles.emptyText, { color: theme.secondaryText }]}>No hospitals found.</Text>
                        </View>
                    }
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    addButton: { 
        flexDirection: 'row', 
        margin: 20, 
        padding: 15, 
        borderRadius: 12, 
        alignItems: 'center', 
        justifyContent: 'center',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4
    },
    addButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginLeft: 10 },
    list: { padding: 20, paddingTop: 0 },
    card: { 
        borderRadius: 16, 
        marginBottom: 15, 
        elevation: 2,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        overflow: 'hidden'
    },
    cardInfo: { flexDirection: 'row', padding: 15, alignItems: 'center' },
    iconBox: { width: 50, height: 50, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
    name: { fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
    locationRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
    location: { fontSize: 13, marginLeft: 4, flex: 1 },
    detailsRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    detailItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    detailText: { fontSize: 12, fontWeight: '600' },
    statusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
    statusText: { fontSize: 10, fontWeight: 'bold' },
    actions: { flexDirection: 'row', borderTopWidth: 1 },
    actionBtn: { flex: 1, flexDirection: 'row', padding: 12, justifyContent: 'center', alignItems: 'center', gap: 8 },
    actionText: { fontSize: 14, fontWeight: '600' },
    emptyContainer: { alignItems: 'center', marginTop: 100 },
    emptyText: { marginTop: 15, fontSize: 16 }
});

export default AdminHospitalListScreen;
