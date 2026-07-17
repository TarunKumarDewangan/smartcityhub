import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
    View, Text, StyleSheet, FlatList, TouchableOpacity,
    ActivityIndicator, StatusBar, TextInput, Alert
} from 'react-native';
import { Building, ChevronRight, MapPin, Search, X, Siren, Star } from 'lucide-react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import apiClient from '../api/client';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

const HospitalScreen = () => {
    const navigation = useNavigation();
    const { user } = useAuth();
    const [hospitals, setHospitals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const { theme, isDark } = useTheme();

    useFocusEffect(
        useCallback(() => {
            fetchHospitals(1);
        }, [])
    );

    const toggleFavorite = async (hospital) => {
        if (!user) {
            Alert.alert('Join Us', 'Log in to add hospitals to your favorites!', [
                { text: 'Not Now', style: 'cancel' },
                { text: 'Login', onPress: () => navigation.navigate('Login') }
            ]);
            return;
        }

        try {
            await apiClient.post(`/hospitals/${hospital.id}/favorite`);
            fetchHospitals(1);
        } catch (e) {
            console.error(e);
            Alert.alert('Error', 'Failed to update favorite status');
        }
    };

    const fetchHospitals = async (pageNumber = 1) => {
        if (pageNumber === 1) setLoading(true);
        else setLoadingMore(true);
        try {
            const response = await apiClient.get(`/hospitals?paginate=true&page=${pageNumber}`);
            const isPaginated = response.data && typeof response.data === 'object' && 'data' in response.data;
            const list = isPaginated ? response.data.data : response.data;
            if (pageNumber === 1) setHospitals(list || []);
            else setHospitals(prev => [...prev, ...(list || [])]);
            if (isPaginated) setHasMore(response.data.current_page < response.data.last_page);
            else setHasMore(false);
            setPage(pageNumber);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    // Live filter — runs instantly on every keystroke
    const filtered = useMemo(() => {
        const q = searchQuery.trim().toLowerCase();
        if (!q) return hospitals;
        return hospitals.filter(h =>
            h.name?.toLowerCase().includes(q) ||
            h.address?.toLowerCase().includes(q) ||
            (h.has_emergency && h.emergency_services?.toLowerCase().includes(q))
        );
    }, [searchQuery, hospitals]);

    const renderItem = ({ item }) => {
        const crowdColor =
            item.crowd_status === 'High' ? '#ef4444' :
            item.crowd_status === 'Medium' ? '#f59e0b' : '#22c55e';
        const crowdBg =
            item.crowd_status === 'High' ? '#ef444415' :
            item.crowd_status === 'Medium' ? '#f59e0b15' : '#22c55e15';
        const crowdLabel =
            item.crowd_status === 'High' ? 'High (10+)' :
            item.crowd_status === 'Medium' ? 'Mid (5-10)' : 'Low (1-5)';

        return (
            <View style={[styles.card, { backgroundColor: theme.card, shadowColor: isDark ? '#000' : '#aaa' }]}>
                {/* Name + Address */}
                <View style={styles.cardHeader}>
                    <View style={[styles.iconBox, { backgroundColor: theme.primary + '15' }]}>
                        <Building size={22} color={theme.primary} />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={[styles.name, { color: theme.text }]}>{item.name}</Text>
                        <Text style={[styles.idText, { color: theme.placeholder }]}>Hospital #{item.id}</Text>
                        {item.address ? (
                            <View style={styles.addressRow}>
                                <MapPin size={11} color={theme.placeholder} />
                                <Text
                                    style={[styles.addressText, { color: theme.secondaryText }]}
                                    numberOfLines={1}
                                >
                                    {item.address}
                                </Text>
                            </View>
                        ) : null}
                    </View>
                    <TouchableOpacity 
                        style={{ padding: 8, marginTop: -4, marginRight: -4 }} 
                        onPress={() => toggleFavorite(item)}
                    >
                        <Star 
                            size={20} 
                            color={item.is_favorite ? '#eab308' : theme.placeholder} 
                            fill={item.is_favorite ? '#eab308' : 'none'} 
                        />
                    </TouchableOpacity>
                </View>

                {/* Badges Row (Crowd + Emergency) */}
                <View style={styles.badgeRow}>
                    <View style={[styles.crowdBadge, { backgroundColor: crowdBg, borderColor: crowdColor }]}>
                        <View style={[styles.crowdDot, { backgroundColor: crowdColor }]} />
                        <Text style={[styles.crowdText, { color: crowdColor }]}>
                            Crowd: {crowdLabel}
                        </Text>
                    </View>

                    {!!item.has_emergency && (
                        <View style={[styles.emergencyBadge, { backgroundColor: '#ef444410', borderColor: '#ef4444' }]}>
                            <Siren size={12} color="#ef4444" style={{ marginRight: 5 }} />
                            <Text style={[styles.emergencyText, { color: '#ef4444' }]}>
                                Emergency ({item.bed_count ?? 0} Beds)
                            </Text>
                        </View>
                    )}
                </View>

                {/* Footer Row */}
                <View style={[styles.cardFooter, { borderTopColor: theme.divider }]}>
                    <TouchableOpacity
                        style={styles.seeMoreLink}
                        onPress={() => navigation.navigate('HospitalDetail', { hospital: item })}
                    >
                        <Text style={[styles.seeMoreLinkText, { color: theme.primary }]}>See Details</Text>
                        <ChevronRight size={14} color={theme.primary} style={{ marginLeft: 2 }} />
                    </TouchableOpacity>

                    {item.rating != null && (
                        <Text style={[styles.ratingText, { color: isDark ? '#fbbf24' : '#f59e0b' }]}>
                            ⭐ {parseFloat(item.rating).toFixed(1)}
                        </Text>
                    )}
                </View>
            </View>
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

            {/* Header */}
            <View style={styles.headerArea}>
                <Text style={[styles.title, { color: theme.text }]}>Nearby Hospitals</Text>
                <Text style={[styles.subtitle, { color: theme.secondaryText }]}>
                    Find care and check live crowd status
                </Text>
            </View>

            {/* Live Search Bar */}
            <View style={[styles.searchBar, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <Search size={18} color={theme.placeholder} />
                <TextInput
                    style={[styles.searchInput, { color: theme.text }]}
                    placeholder="Search hospital or address…"
                    placeholderTextColor={theme.placeholder}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    autoCorrect={false}
                    clearButtonMode="never"
                />
                {searchQuery.length > 0 && (
                    <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                        <X size={16} color={theme.placeholder} />
                    </TouchableOpacity>
                )}
            </View>

            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={theme.primary} />
                </View>
            ) : (
                <FlatList
                    data={filtered}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderItem}
                    contentContainerStyle={styles.list}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                    ListEmptyComponent={
                        <View style={styles.emptyBox}>
                            <Search size={40} color={theme.placeholder} />
                            <Text style={[styles.emptyText, { color: theme.secondaryText }]}>
                                {searchQuery ? `No results for "${searchQuery}"` : 'No hospitals found.'}
                            </Text>
                        </View>
                    }
                    onEndReached={() => {
                        if (!searchQuery && !loading && !loadingMore && hasMore) {
                            fetchHospitals(page + 1);
                        }
                    }}
                    onEndReachedThreshold={0.5}
                    ListFooterComponent={
                        loadingMore
                            ? <ActivityIndicator size="small" color={theme.primary} style={{ marginVertical: 15 }} />
                            : null
                    }
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    headerArea: { paddingHorizontal: 20, paddingTop: 10, marginBottom: 12 },
    title: { fontSize: 26, fontWeight: 'bold' },
    subtitle: { fontSize: 13, marginTop: 4 },

    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 16,
        marginBottom: 12,
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 14,
        borderWidth: 1.5,
        gap: 10,
        elevation: 2,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
    },
    searchInput: {
        flex: 1,
        fontSize: 14,
        paddingVertical: 0,
    },

    list: { padding: 16, paddingTop: 4 },
    card: {
        borderRadius: 16,
        padding: 16,
        marginBottom: 14,
        elevation: 3,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
    },
    cardHeader: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 14, gap: 12 },
    iconBox: { width: 46, height: 46, borderRadius: 13, justifyContent: 'center', alignItems: 'center' },
    name: { fontSize: 16, fontWeight: '700', marginBottom: 2 },
    idText: { fontSize: 11 },
    addressRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
    addressText: { fontSize: 12, flex: 1 },

    badgeRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 14,
    },
    crowdBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 10,
        borderWidth: 1.5,
    },
    crowdDot: { width: 6, height: 6, borderRadius: 3, marginRight: 6 },
    crowdText: { fontSize: 12, fontWeight: '700' },
    emergencyBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 10,
        borderWidth: 1.5,
    },
    emergencyText: { fontSize: 12, fontWeight: '700' },

    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 4,
        paddingTop: 12,
        borderTopWidth: 1,
    },
    seeMoreLink: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    seeMoreLinkText: {
        fontSize: 14,
        fontWeight: '700',
    },
    ratingText: {
        fontSize: 13,
        fontWeight: '700',
    },

    emptyBox: { alignItems: 'center', marginTop: 60, gap: 12 },
    emptyText: { fontSize: 14 },
});

export default HospitalScreen;
