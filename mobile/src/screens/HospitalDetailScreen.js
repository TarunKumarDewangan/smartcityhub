import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity,
    ActivityIndicator, StatusBar, Linking, Alert
} from 'react-native';
import {
    MapPin, Phone, Building, Stethoscope, Calendar,
    Clock, ChevronLeft, Users, Activity, Siren, BedDouble, Zap, Navigation2, Star
} from 'lucide-react-native';
import apiClient from '../api/client';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

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

const HospitalDetailScreen = ({ route, navigation }) => {
    const { hospital: initialHospital } = route.params;
    const [hospital, setHospital] = useState(initialHospital);
    const [loading, setLoading] = useState(false);
    const { theme, isDark } = useTheme();
    const { user } = useAuth();

    const toggleFavorite = async () => {
        if (!user) {
            Alert.alert('Join Us', 'Log in to add hospitals to your favorites!', [
                { text: 'Not Now', style: 'cancel' },
                { text: 'Login', onPress: () => navigation.navigate('Login') }
            ]);
            return;
        }

        try {
            const response = await apiClient.post(`/hospitals/${hospital.id}/favorite`);
            const isFav = response.data?.is_favorite;
            setHospital(prev => ({ ...prev, is_favorite: isFav }));
        } catch (e) {
            console.error(e);
            Alert.alert('Error', 'Failed to update favorite status');
        }
    };

    useEffect(() => {
        // Fetch fresh details including doctors
        const fetchDetails = async () => {
            setLoading(true);
            try {
                const res = await apiClient.get(`/hospitals/${initialHospital.id}`);
                setHospital(res.data.data ?? res.data);
            } catch (e) {
                // Fall back to passed data
            } finally {
                setLoading(false);
            }
        };
        fetchDetails();
    }, [initialHospital.id]);

    const crowdColor =
        hospital.crowd_status === 'High' ? '#ef4444' :
        hospital.crowd_status === 'Medium' ? '#f59e0b' : '#22c55e';

    const crowdBg =
        hospital.crowd_status === 'High' ? '#ef444415' :
        hospital.crowd_status === 'Medium' ? '#f59e0b15' : '#22c55e15';

    const crowdLabel =
        hospital.crowd_status === 'High' ? 'High (10+)' :
        hospital.crowd_status === 'Medium' ? 'Mid (5-10)' : 'Low (1-5)';

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

            {/* Header */}
            <View style={[styles.header, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <ChevronLeft size={24} color={theme.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.text }]} numberOfLines={1}>
                    Hospital Profile
                </Text>
                <TouchableOpacity onPress={toggleFavorite} style={styles.favBtn}>
                    <Star 
                        size={22} 
                        color={hospital.is_favorite ? '#eab308' : theme.text} 
                        fill={hospital.is_favorite ? '#eab308' : 'none'} 
                    />
                </TouchableOpacity>
            </View>

            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={theme.primary} />
                </View>
            ) : (
                <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

                    {/* Hero Card */}
                    <View style={[styles.heroCard, { backgroundColor: theme.card }]}>
                        <View style={[styles.iconBox, { backgroundColor: theme.primary + '20' }]}>
                            <Building size={32} color={theme.primary} />
                        </View>
                        <Text style={[styles.hospitalName, { color: theme.text }]}>{hospital.name}</Text>
                        <Text style={[styles.hospitalId, { color: theme.placeholder }]}>Hospital #{hospital.id}</Text>

                        {/* Crowd Badge */}
                        <View style={[styles.crowdBadge, { backgroundColor: crowdBg, borderColor: crowdColor }]}>
                            <View style={[styles.crowdDot, { backgroundColor: crowdColor }]} />
                            <Text style={[styles.crowdLabel, { color: crowdColor }]}>
                                Overall Crowd: {crowdLabel}
                            </Text>
                        </View>

                        {/* Rating */}
                        {hospital.rating != null && (
                            <Text style={[styles.rating, { color: isDark ? '#fbbf24' : '#f59e0b' }]}>
                                ⭐ {parseFloat(hospital.rating).toFixed(1)} Rating
                            </Text>
                        )}
                    </View>

                    {/* Info Section */}
                    <View style={[styles.section, { backgroundColor: theme.card }]}>
                        <Text style={[styles.sectionTitle, { color: theme.text }]}>Contact & Location</Text>

                        {hospital.address && (
                            <View style={styles.infoRow}>
                                <View style={[styles.infoIconBox, { backgroundColor: theme.primary + '15' }]}>
                                    <MapPin size={16} color={theme.primary} />
                                </View>
                                <Text style={[styles.infoText, { color: theme.secondaryText }]}>{hospital.address}</Text>
                            </View>
                        )}

                        {hospital.contact && (
                            <TouchableOpacity
                                style={styles.infoRow}
                                onPress={() => Linking.openURL(`tel:${hospital.contact}`)}
                            >
                                <View style={[styles.infoIconBox, { backgroundColor: '#22c55e15' }]}>
                                    <Phone size={16} color="#22c55e" />
                                </View>
                                <Text style={[styles.infoText, { color: '#22c55e', fontWeight: '600' }]}>
                                    {hospital.contact}
                                </Text>
                            </TouchableOpacity>
                        )}

                        {hospital.representative_name && (
                            <View style={styles.infoRow}>
                                <View style={[styles.infoIconBox, { backgroundColor: theme.primary + '15' }]}>
                                    <Users size={16} color={theme.primary} />
                                </View>
                                <Text style={[styles.infoText, { color: theme.secondaryText }]}>
                                    Rep: {hospital.representative_name}
                                </Text>
                            </View>
                        )}

                        {/* Open in Maps button */}
                        {hospital.latitude && hospital.longitude && (
                            <TouchableOpacity
                                style={[styles.mapsBtn, { backgroundColor: theme.primary }]}
                                onPress={() => {
                                    const url = `https://www.google.com/maps/dir/?api=1&destination=${hospital.latitude},${hospital.longitude}`;
                                    Linking.openURL(url);
                                }}
                            >
                                <Navigation2 size={16} color="#fff" />
                                <Text style={styles.mapsBtnText}>Get Directions</Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* Emergency Section */}
                    {!!hospital.has_emergency && (
                        <View style={[styles.section, { backgroundColor: '#ef444408', borderWidth: 1.5, borderColor: '#ef444430' }]}>
                            <View style={styles.sectionHeader}>
                                <Siren size={18} color="#ef4444" />
                                <Text style={[styles.sectionTitle, { color: '#ef4444' }]}>Emergency Services</Text>
                            </View>

                            {hospital.bed_count != null && (
                                <View style={styles.infoRow}>
                                    <View style={[styles.infoIconBox, { backgroundColor: '#ef444420' }]}>
                                        <BedDouble size={16} color="#ef4444" />
                                    </View>
                                    <Text style={[styles.infoText, { color: theme.secondaryText }]}>
                                        <Text style={{ fontWeight: '700', color: '#ef4444' }}>{hospital.bed_count}</Text>
                                        {' '}Beds Available
                                    </Text>
                                </View>
                            )}

                            {hospital.emergency_services ? (
                                <View style={styles.infoRow}>
                                    <View style={[styles.infoIconBox, { backgroundColor: '#ef444420' }]}>
                                        <Zap size={16} color="#ef4444" />
                                    </View>
                                    <Text style={[styles.infoText, { color: theme.secondaryText }]}>
                                        {hospital.emergency_services}
                                    </Text>
                                </View>
                            ) : null}
                        </View>
                    )}

                    {/* Doctors Section */}
                    {hospital.doctors && hospital.doctors.length > 0 && (
                        <View style={[styles.section, { backgroundColor: theme.card }]}>
                            <View style={styles.sectionHeader}>
                                <Stethoscope size={18} color={theme.primary} />
                                <Text style={[styles.sectionTitle, { color: theme.text }]}>
                                    Doctors ({hospital.doctors.length})
                                </Text>
                            </View>

                            {hospital.doctors.map(doc => {
                                const docCrowdColor =
                                    doc.crowd_status === 'High' ? '#ef4444' :
                                    doc.crowd_status === 'Medium' ? '#f59e0b' : '#22c55e';

                                return (
                                    <View
                                        key={doc.id}
                                        style={[styles.doctorCard, { backgroundColor: theme.background, borderColor: theme.border }]}
                                    >
                                        {/* Doctor Header */}
                                        <View style={styles.doctorHeader}>
                                            <View style={{ flex: 1 }}>
                                                <Text style={[styles.docName, { color: theme.text }]}>{doc.name}</Text>
                                                <Text style={[styles.docSpecialty, { color: theme.primary }]}>{doc.specialty}</Text>
                                            </View>
                                            <View style={[styles.availBadge, {
                                                backgroundColor: doc.is_available ? '#22c55e15' : '#ef444415',
                                                borderColor: doc.is_available ? '#22c55e' : '#ef4444'
                                            }]}>
                                                <View style={[styles.availDot, {
                                                    backgroundColor: doc.is_available ? '#22c55e' : '#ef4444'
                                                }]} />
                                                <Text style={[styles.availText, {
                                                    color: doc.is_available ? '#22c55e' : '#ef4444'
                                                }]}>
                                                    {doc.is_available ? 'Available' : 'Unavailable'}
                                                </Text>
                                            </View>
                                        </View>

                                        {/* Doctor Meta */}
                                        <View style={styles.doctorMeta}>
                                            <View style={[styles.typeTag, { backgroundColor: theme.input }]}>
                                                <Text style={[styles.typeTagText, { color: theme.secondaryText }]}>
                                                    {doc.type}
                                                </Text>
                                            </View>

                                            {doc.is_available && (
                                                <View style={[styles.crowdTag, {
                                                    backgroundColor: docCrowdColor + '15',
                                                    borderColor: docCrowdColor
                                                }]}>
                                                    <Activity size={10} color={docCrowdColor} />
                                                    <Text style={[styles.crowdTagText, { color: docCrowdColor }]}>
                                                        {doc.crowd_status === 'High' ? 'High (10+)' :
                                                         doc.crowd_status === 'Medium' ? 'Mid (5-10)' : 'Low (1-5)'}
                                                    </Text>
                                                </View>
                                            )}
                                        </View>

                                        {/* Visiting Schedule */}
                                        {(doc.visiting_days || doc.visiting_hours) ? (
                                            <View style={[styles.scheduleBox, { backgroundColor: theme.input }]}>
                                                {doc.visiting_days && (
                                                    <View style={styles.scheduleRow}>
                                                        <Calendar size={13} color={theme.placeholder} />
                                                        <Text style={[styles.scheduleText, { color: theme.secondaryText }]}>
                                                            {doc.visiting_days}
                                                        </Text>
                                                    </View>
                                                )}
                                                {doc.visiting_hours && (
                                                    <View style={styles.scheduleRow}>
                                                        <Clock size={13} color={theme.placeholder} />
                                                        <Text style={[styles.scheduleText, { color: theme.secondaryText }]}>
                                                            {doc.visiting_hours}
                                                        </Text>
                                                    </View>
                                                )}
                                            </View>
                                        ) : (
                                            <View style={[styles.scheduleBox, { backgroundColor: theme.input }]}>
                                                <View style={styles.scheduleRow}>
                                                    <Calendar size={13} color={theme.placeholder} />
                                                    <Text style={[styles.scheduleText, { color: theme.secondaryText }]}>
                                                        Available Every Day
                                                    </Text>
                                                </View>
                                            </View>
                                        )}

                                        {doc.unavailable_date && (
                                            <View style={[styles.scheduleBox, { backgroundColor: '#ef444408', borderColor: '#ef444430', borderWidth: 1, marginTop: 8, gap: 4 }]}>
                                                <View style={styles.scheduleRow}>
                                                    <Clock size={13} color="#ef4444" />
                                                    <Text style={[styles.scheduleText, { color: '#ef4444', fontWeight: '700' }]}>
                                                        Off Duty: {formatUnavailableDate(doc.unavailable_date)}
                                                    </Text>
                                                </View>
                                            </View>
                                        )}
                                    </View>
                                );
                            })}
                        </View>
                    )}

                    <View style={{ height: 30 }} />
                </ScrollView>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderBottomWidth: 1,
    },
    backBtn: { width: 40, height: 40, justifyContent: 'center' },
    favBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
    headerTitle: { fontSize: 17, fontWeight: '700', flex: 1, textAlign: 'center' },
    content: { padding: 16, gap: 14 },

    heroCard: {
        borderRadius: 20,
        padding: 24,
        alignItems: 'center',
        elevation: 2,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
    },
    iconBox: {
        width: 72, height: 72, borderRadius: 20,
        justifyContent: 'center', alignItems: 'center', marginBottom: 14,
    },
    hospitalName: { fontSize: 22, fontWeight: 'bold', textAlign: 'center' },
    hospitalId: { fontSize: 13, marginTop: 4, marginBottom: 14 },
    crowdBadge: {
        flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: 16, paddingVertical: 8,
        borderRadius: 20, borderWidth: 1.5, marginBottom: 10,
    },
    crowdDot: { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
    crowdLabel: { fontSize: 13, fontWeight: '700' },
    rating: { fontSize: 15, fontWeight: 'bold', marginTop: 4 },

    section: {
        borderRadius: 16, padding: 16,
        elevation: 2, shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06, shadowRadius: 6,
    },
    sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 },
    sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 12 },

    infoRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
    infoIconBox: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
    infoText: { fontSize: 14, flex: 1 },

    doctorCard: {
        borderRadius: 12, padding: 12, marginBottom: 12,
        borderWidth: 1,
    },
    doctorHeader: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10 },
    docName: { fontSize: 15, fontWeight: '700' },
    docSpecialty: { fontSize: 12, marginTop: 2, fontWeight: '600' },
    availBadge: {
        flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: 8, paddingVertical: 4,
        borderRadius: 10, borderWidth: 1, gap: 4,
    },
    availDot: { width: 6, height: 6, borderRadius: 3 },
    availText: { fontSize: 10, fontWeight: '700' },

    doctorMeta: { flexDirection: 'row', gap: 8, marginBottom: 10 },
    typeTag: {
        paddingHorizontal: 10, paddingVertical: 4,
        borderRadius: 8,
    },
    typeTagText: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
    crowdTag: {
        flexDirection: 'row', alignItems: 'center', gap: 4,
        paddingHorizontal: 8, paddingVertical: 4,
        borderRadius: 8, borderWidth: 1,
    },
    crowdTagText: { fontSize: 11, fontWeight: '700' },

    scheduleBox: { borderRadius: 10, padding: 10, gap: 6 },
    scheduleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    scheduleText: { fontSize: 12 },

    mapsBtn: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        gap: 8, paddingVertical: 12, borderRadius: 12, marginTop: 14,
    },
    mapsBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
});

export default HospitalDetailScreen;
