import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator, StatusBar, KeyboardAvoidingView, Platform, Switch, Modal } from 'react-native';
import apiClient from '../api/client';
import { User, Stethoscope, Clock, Calendar, CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';
import InputField from '../components/InputField';

const parseLocalDate = (dateStr) => {
    if (!dateStr) return null;
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(dateStr)) return null;

    const parts = dateStr.split('-');
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);

    const d = new Date(year, month, day);
    if (isNaN(d.getTime())) return null;
    return d;
};

const CalendarModal = ({ visible, onClose, onSelectDate, value, theme, isDark }) => {
    const [currentDate, setCurrentDate] = useState(new Date());

    useEffect(() => {
        if (visible && value) {
            const parsed = parseLocalDate(value);
            if (parsed && !isNaN(parsed.getTime())) {
                setCurrentDate(parsed);
            }
        } else if (visible) {
            setCurrentDate(new Date());
        }
    }, [visible, value]);

    const selectedDate = value ? parseLocalDate(value) : null;

    const daysInMonth = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    const firstDayIndex = (date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();

    const handlePrevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    const totalDays = daysInMonth(currentDate);
    const startDay = firstDayIndex(currentDate);
    
    const daysArray = [];
    for (let i = 0; i < startDay; i++) {
        daysArray.push(null);
    }
    for (let i = 1; i <= totalDays; i++) {
        daysArray.push(i);
    }

    const handleSelectDay = (day) => {
        if (!day) return;
        const year = currentDate.getFullYear();
        const month = String(currentDate.getMonth() + 1).padStart(2, '0');
        const formattedDay = String(day).padStart(2, '0');
        const selectedStr = `${year}-${month}-${formattedDay}`;
        onSelectDate(selectedStr);
        onClose();
    };

    if (!visible) return null;

    return (
        <Modal transparent animationType="fade" visible={visible} onRequestClose={onClose}>
            <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={onClose}>
                <View style={[styles.modalContainer, { backgroundColor: theme.card }]}>
                    <View style={styles.calendarHeader}>
                        <TouchableOpacity onPress={handlePrevMonth} style={styles.navBtn}>
                            <ChevronLeft size={20} color={theme.text} />
                        </TouchableOpacity>
                        <Text style={[styles.monthText, { color: theme.text }]}>
                            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                        </Text>
                        <TouchableOpacity onPress={handleNextMonth} style={styles.navBtn}>
                            <ChevronRight size={20} color={theme.text} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.weekdaysRow}>
                        {weekDays.map((day, idx) => (
                            <Text key={idx} style={[styles.weekdayText, { color: theme.secondaryText }]}>
                                {day}
                            </Text>
                        ))}
                    </View>

                    <View style={styles.daysGrid}>
                        {daysArray.map((day, idx) => {
                            const isSelected = selectedDate && 
                                selectedDate.getFullYear() === currentDate.getFullYear() &&
                                selectedDate.getMonth() === currentDate.getMonth() &&
                                selectedDate.getDate() === day;

                            const today = new Date();
                            const isToday = day &&
                                today.getFullYear() === currentDate.getFullYear() &&
                                today.getMonth() === currentDate.getMonth() &&
                                today.getDate() === day;

                            return (
                                <TouchableOpacity
                                    key={idx}
                                    style={styles.dayCell}
                                    onPress={() => handleSelectDay(day)}
                                    disabled={!day}
                                >
                                    <View style={[
                                        styles.dayInner,
                                        isToday && !isSelected && { borderWidth: 1, borderColor: theme.primary, borderRadius: 18 },
                                        isSelected && { backgroundColor: theme.primary, borderRadius: 18 }
                                    ]}>
                                        <Text style={[
                                            styles.dayText,
                                            { color: day ? theme.text : 'transparent' },
                                            isSelected && { color: '#fff', fontWeight: 'bold' }
                                        ]}>
                                            {day}
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            );
                        })}
                    </View>

                    <View style={styles.modalFooter}>
                        <TouchableOpacity style={[styles.footerBtn, { backgroundColor: theme.input, marginRight: 8 }]} onPress={() => { onSelectDate(''); onClose(); }}>
                            <Text style={{ color: '#ef4444', fontWeight: '700' }}>Clear</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.footerBtn, { backgroundColor: theme.input }]} onPress={onClose}>
                            <Text style={{ color: theme.text, fontWeight: '700' }}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </TouchableOpacity>
        </Modal>
    );
};

const AddEditDoctorScreen = ({ route, navigation }) => {
    const { doctor } = route.params || {};
    const isEdit = !!doctor;
    const { theme, isDark } = useTheme();
    const [loading, setLoading] = useState(false);
    const [isNotPermanent, setIsNotPermanent] = useState(!!(doctor?.visiting_days || doctor?.visiting_hours));
    const [showCalendar, setShowCalendar] = useState(false);

    const [formData, setFormData] = useState({
        name: doctor?.name || '',
        specialty: doctor?.specialty || '',
        type: doctor?.type || 'Staff',
        is_available: doctor?.is_available ?? true,
        crowd_status: doctor?.crowd_status || 'Low',
        visiting_days: doctor?.visiting_days || '',
        visiting_hours: doctor?.visiting_hours || '',
        unavailable_date: doctor?.unavailable_date || ''
    });

    const getDayOfWeekAndFormat = (dateStr) => {
        if (!dateStr) return null;
        const regex = /^\d{4}-\d{2}-\d{2}$/;
        if (!regex.test(dateStr)) return null;

        const parts = dateStr.split('-');
        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const day = parseInt(parts[2], 10);

        const d = new Date(year, month, day);
        if (isNaN(d.getTime())) return null;
        if (d.getFullYear() !== year || d.getMonth() !== month || d.getDate() !== day) return null;

        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

        return `${days[d.getDay()]}, ${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
    };

    const handleSave = async () => {
        if (!formData.name || !formData.specialty || !formData.type) {
            Alert.alert('Error', 'Please fill all required fields');
            return;
        }

        setLoading(true);
        try {
            const dateStr = formData.unavailable_date?.trim();
            const isValidDate = dateStr && /^\d{4}-\d{2}-\d{2}$/.test(dateStr) && !isNaN(new Date(dateStr).getTime());

            const dataToSave = {
                ...formData,
                visiting_days: (isNotPermanent && formData.visiting_days.trim()) ? formData.visiting_days.trim() : null,
                visiting_hours: (isNotPermanent && formData.visiting_hours.trim()) ? formData.visiting_hours.trim() : null,
                unavailable_date: isValidDate ? dateStr : null
            };

            if (isEdit) {
                await apiClient.put(`/hospital-doctors/${doctor.id}`, dataToSave);
                Alert.alert('Success', 'Doctor updated successfully');
            } else {
                await apiClient.post('/hospital-doctors', dataToSave);
                Alert.alert('Success', 'Doctor added successfully');
            }
            navigation.goBack();
        } catch (e) {
            console.error(e);
            const errorMsg = e.response?.data?.errors 
                ? Object.values(e.response.data.errors).flat().join('\n')
                : (e.response?.data?.message || 'Failed to save doctor details');
            Alert.alert('Error', errorMsg);
        } finally {
            setLoading(false);
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
                    <Text style={[styles.title, { color: theme.text }]}>{isEdit ? 'Edit Doctor' : 'Add New Doctor'}</Text>
                    <Text style={[styles.subtitle, { color: theme.secondaryText }]}>
                        {isEdit ? 'Update profile and schedule' : 'Register a new doctor to your facility'}
                    </Text>
                </View>

                <View style={[styles.card, { backgroundColor: theme.card, shadowColor: isDark ? '#000' : '#d1d5db' }]}>
                    <InputField 
                        label="Doctor Name *" 
                        icon={User} 
                        value={formData.name}
                        onChangeText={(text) => setFormData({...formData, name: text})}
                        placeholder="Dr. Full Name"
                        theme={theme}
                    />

                    <InputField 
                        label="Specialty *" 
                        icon={Stethoscope} 
                        value={formData.specialty}
                        onChangeText={(text) => setFormData({...formData, specialty: text})}
                        placeholder="e.g. Cardiologist, General Physician"
                        theme={theme}
                    />

                    <Text style={[styles.label, { color: theme.secondaryText, marginTop: 10 }]}>Doctor Type *</Text>
                    <View style={styles.typeSelector}>
                        {['Staff', 'Consultant', 'Outside', 'Resident'].map((type) => (
                            <TouchableOpacity 
                                key={type}
                                style={[
                                    styles.typeBtn, 
                                    { backgroundColor: theme.input, borderColor: theme.border },
                                    formData.type === type && { backgroundColor: theme.primary, borderColor: theme.primary }
                                ]}
                                onPress={() => setFormData({...formData, type})}
                            >
                                <Text style={[
                                    styles.typeText, 
                                    { color: theme.secondaryText },
                                    formData.type === type && { color: '#fff', fontWeight: 'bold' }
                                ]}>{type}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <View style={[styles.switchRow, { backgroundColor: theme.input }]}>
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.switchLabel, { color: theme.text }]}>Currently Available</Text>
                            <Text style={[styles.switchSub, { color: theme.secondaryText }]}>Toggle if doctor is on duty now</Text>
                        </View>
                        <Switch 
                            value={formData.is_available}
                            onValueChange={(val) => setFormData({...formData, is_available: val})}
                            trackColor={{ false: theme.border, true: theme.primary + '80' }}
                            thumbColor={formData.is_available ? theme.primary : theme.placeholder}
                        />
                    </View>

                    <Text style={[styles.label, { color: theme.secondaryText, marginTop: 10 }]}>Patient Queue (Crowd Status) *</Text>
                    <View style={styles.typeSelector}>
                        {[
                            { key: 'Low', label: 'Low (1-5)' },
                            { key: 'Medium', label: 'Mid (5-10)' },
                            { key: 'High', label: 'High (10+)' }
                        ].map((opt) => (
                            <TouchableOpacity 
                                key={opt.key}
                                style={[
                                    styles.typeBtn, 
                                    { backgroundColor: theme.input, borderColor: theme.border },
                                    formData.crowd_status === opt.key && { 
                                        backgroundColor: opt.key === 'Low' ? '#22c55e' : opt.key === 'Medium' ? '#f59e0b' : '#ef4444', 
                                        borderColor: opt.key === 'Low' ? '#22c55e' : opt.key === 'Medium' ? '#f59e0b' : '#ef4444' 
                                    }
                                ]}
                                onPress={() => setFormData({...formData, crowd_status: opt.key})}
                            >
                                <Text style={[
                                    styles.typeText, 
                                    { color: theme.secondaryText },
                                    formData.crowd_status === opt.key && { color: '#fff', fontWeight: 'bold' }
                                ]}>{opt.label}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <View style={[styles.divider, { backgroundColor: theme.divider }]} />

                    <View style={[styles.switchRow, { backgroundColor: theme.input, marginBottom: isNotPermanent ? 15 : 20 }]}>
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.switchLabel, { color: theme.text }]}>Not Permanent</Text>
                            <Text style={[styles.switchSub, { color: theme.secondaryText }]}>Toggle to set specific visiting days/hours</Text>
                        </View>
                        <Switch 
                            value={isNotPermanent}
                            onValueChange={(val) => {
                                setIsNotPermanent(val);
                                if (!val) {
                                    setFormData(prev => ({
                                        ...prev,
                                        visiting_days: '',
                                        visiting_hours: ''
                                    }));
                                }
                            }}
                            trackColor={{ false: theme.border, true: theme.primary + '80' }}
                            thumbColor={isNotPermanent ? theme.primary : theme.placeholder}
                        />
                    </View>

                    {isNotPermanent && (
                        <>
                            <InputField 
                                label="Visiting Days" 
                                icon={Calendar} 
                                value={formData.visiting_days}
                                onChangeText={(text) => setFormData({...formData, visiting_days: text})}
                                placeholder="e.g. Mon, Wed, Fri"
                                theme={theme}
                            />

                            <InputField 
                                label="Visiting Hours" 
                                icon={Clock} 
                                value={formData.visiting_hours}
                                onChangeText={(text) => setFormData({...formData, visiting_hours: text})}
                                placeholder="e.g. 10:00 AM - 02:00 PM"
                                theme={theme}
                            />
                        </>
                    )}

                    <View style={[styles.divider, { backgroundColor: theme.divider }]} />
                    
                    <Text style={{ color: theme.text, fontSize: 14, fontWeight: 'bold', marginBottom: 10, marginLeft: 4 }}>
                        Temporary Future Absence
                    </Text>
                    
                    <InputField 
                        label="Mark Doctor Unavailable Date" 
                        icon={Calendar} 
                        value={formData.unavailable_date}
                        onChangeText={(text) => setFormData({...formData, unavailable_date: text})}
                        placeholder="YYYY-MM-DD (e.g. 2026-06-03)"
                        theme={theme}
                        rightIcon={Calendar}
                        onRightIconPress={() => setShowCalendar(true)}
                    />

                    {formData.unavailable_date?.trim().length > 0 && (
                        <View style={{ marginTop: -10, marginBottom: 15, marginLeft: 4 }}>
                            {getDayOfWeekAndFormat(formData.unavailable_date) ? (
                                <Text style={{ color: '#22c55e', fontSize: 13, fontWeight: '600' }}>
                                    📅 {getDayOfWeekAndFormat(formData.unavailable_date)}
                                </Text>
                            ) : (
                                <Text style={{ color: '#ef4444', fontSize: 12 }}>
                                    Format must be YYYY-MM-DD (e.g., 2026-06-03)
                                </Text>
                            )}
                        </View>
                    )}

                    <CalendarModal
                        visible={showCalendar}
                        onClose={() => setShowCalendar(false)}
                        onSelectDate={(dateStr) => setFormData({ ...formData, unavailable_date: dateStr })}
                        value={formData.unavailable_date}
                        theme={theme}
                        isDark={isDark}
                    />

                    <TouchableOpacity 
                        style={[styles.button, { backgroundColor: theme.primary }, loading && styles.disabledButton]} 
                        onPress={handleSave}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <>
                                <CheckCircle2 size={20} color="#fff" />
                                <Text style={styles.buttonText}>{isEdit ? 'Update Doctor' : 'Save Doctor'}</Text>
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
    header: { marginBottom: 25 },
    title: { fontSize: 24, fontWeight: 'bold' },
    subtitle: { fontSize: 14, marginTop: 5 },
    card: { borderRadius: 16, padding: 20, elevation: 2, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 10 },
    inputGroup: { marginBottom: 15 },
    label: { fontSize: 13, fontWeight: '600', marginBottom: 8, marginLeft: 4 },
    inputWrapper: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        borderRadius: 12, 
        paddingHorizontal: 15, 
        borderWidth: 1
    },
    input: { flex: 1, paddingVertical: 12, marginLeft: 10, fontSize: 15 },
    hint: { fontSize: 11, marginTop: 4, marginLeft: 4 },
    typeSelector: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20, marginTop: 8 },
    typeBtn: { minWidth: '22%', paddingVertical: 10, borderRadius: 10, alignItems: 'center', borderWidth: 1, flexGrow: 1 },
    typeText: { fontSize: 13 },
    switchRow: { flexDirection: 'row', alignItems: 'center', padding: 15, borderRadius: 12, marginBottom: 20 },
    switchLabel: { fontSize: 15, fontWeight: 'bold' },
    switchSub: { fontSize: 11, marginTop: 2 },
    divider: { height: 1, marginVertical: 10, marginBottom: 20 },
    button: { 
        flexDirection: 'row', 
        borderRadius: 12, 
        height: 55, 
        justifyContent: 'center', 
        alignItems: 'center',
        marginTop: 10
    },
    disabledButton: { opacity: 0.7 },
    buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginLeft: 10 },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20
    },
    modalContainer: {
        width: '100%',
        maxWidth: 320,
        borderRadius: 20,
        padding: 16,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 10
    },
    calendarHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15
    },
    navBtn: {
        padding: 8,
        borderRadius: 8
    },
    monthText: {
        fontSize: 16,
        fontWeight: 'bold'
    },
    weekdaysRow: {
        flexDirection: 'row',
        marginBottom: 10
    },
    weekdayText: {
        width: '14.28%',
        textAlign: 'center',
        fontSize: 12,
        fontWeight: '600'
    },
    daysGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap'
    },
    dayCell: {
        width: '14.28%',
        height: 40,
        justifyContent: 'center',
        alignItems: 'center'
    },
    dayInner: {
        width: 36,
        height: 36,
        justifyContent: 'center',
        alignItems: 'center'
    },
    dayText: {
        fontSize: 14,
        fontWeight: '500'
    },
    modalFooter: {
        flexDirection: 'row',
        marginTop: 15
    },
    footerBtn: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: 'center'
    }
});

export default AddEditDoctorScreen;
