import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Alert, ActivityIndicator, TextInput, Modal, KeyboardAvoidingView, Platform
} from 'react-native';
import { Phone, Plus, Edit2, Trash2, Shield, X, Check } from 'lucide-react-native';
import { useFocusEffect } from '@react-navigation/native';
import apiClient from '../api/client';
import { useTheme } from '../context/ThemeContext';

const AdminManageHelplinesScreen = () => {
  const { theme, isDark } = useTheme();
  const [helplines, setHelplines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editing, setEditing] = useState(null); // null = add, object = edit
  const [form, setForm] = useState({ name: '', number: '' });
  const [saving, setSaving] = useState(false);

  useFocusEffect(useCallback(() => { fetchHelplines(); }, []));

  const fetchHelplines = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/helplines');
      const data = Array.isArray(res.data) ? res.data : (res.data?.data || []);
      setHelplines(data);
    } catch (e) {
      Alert.alert('Error', 'Failed to load helplines');
    } finally {
      setLoading(false);
    }
  };

  const openAdd = () => {
    setEditing(null);
    setForm({ name: '', number: '' });
    setModalVisible(true);
  };

  const openEdit = (item) => {
    setEditing(item);
    setForm({ name: item.name, number: item.number });
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.number.trim()) {
      Alert.alert('Validation', 'Both name and number are required.');
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        await apiClient.put(`/helplines/${editing.id}`, form);
      } else {
        await apiClient.post('/helplines', form);
      }
      setModalVisible(false);
      fetchHelplines();
    } catch (e) {
      Alert.alert('Error', 'Failed to save helpline.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (item) => {
    Alert.alert('Delete Helpline', `Remove "${item.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          try {
            await apiClient.delete(`/helplines/${item.id}`);
            fetchHelplines();
          } catch (e) {
            Alert.alert('Error', 'Failed to delete helpline.');
          }
        }
      }
    ]);
  };

  const renderItem = ({ item }) => (
    <View style={[styles.card, { backgroundColor: theme.card }]}>
      <View style={[styles.iconBox, { backgroundColor: theme.primary + '15' }]}>
        <Shield size={20} color={theme.primary} />
      </View>
      <View style={styles.cardInfo}>
        <Text style={[styles.name, { color: theme.text }]}>{item.name}</Text>
        <View style={styles.numRow}>
          <Phone size={12} color={theme.success} />
          <Text style={[styles.number, { color: theme.success }]}> {item.number}</Text>
        </View>
      </View>
      <TouchableOpacity style={styles.actionBtn} onPress={() => openEdit(item)}>
        <Edit2 size={18} color={theme.primary} />
      </TouchableOpacity>
      <TouchableOpacity style={styles.actionBtn} onPress={() => handleDelete(item)}>
        <Trash2 size={18} color={theme.error} />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <TouchableOpacity
        style={[styles.addBtn, { backgroundColor: theme.primary }]}
        onPress={openAdd}
      >
        <Plus size={18} color="#fff" />
        <Text style={styles.addBtnText}>Add Helpline</Text>
      </TouchableOpacity>

      {loading ? (
        <ActivityIndicator size="large" color={theme.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={helplines}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 20, paddingTop: 10 }}
          ListEmptyComponent={
            <Text style={[styles.empty, { color: theme.secondaryText }]}>No helplines yet. Add one!</Text>
          }
        />
      )}

      {/* Add / Edit Modal */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalOverlay}>
          <View style={[styles.modal, { backgroundColor: theme.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>
                {editing ? 'Edit Helpline' : 'Add Helpline'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <X size={22} color={theme.secondaryText} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.label, { color: theme.secondaryText }]}>Service Name</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.background, color: theme.text, borderColor: theme.divider }]}
              placeholder="e.g. Police Emergency"
              placeholderTextColor={theme.placeholder}
              value={form.name}
              onChangeText={(v) => setForm(f => ({ ...f, name: v }))}
            />

            <Text style={[styles.label, { color: theme.secondaryText }]}>Phone Number</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.background, color: theme.text, borderColor: theme.divider }]}
              placeholder="e.g. 100"
              placeholderTextColor={theme.placeholder}
              keyboardType="phone-pad"
              value={form.number}
              onChangeText={(v) => setForm(f => ({ ...f, number: v }))}
            />

            <TouchableOpacity
              style={[styles.saveBtn, { backgroundColor: theme.primary, opacity: saving ? 0.7 : 1 }]}
              onPress={handleSave}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Check size={18} color="#fff" />
                  <Text style={styles.saveBtnText}>{editing ? 'Update' : 'Create'}</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  addBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    margin: 20, padding: 14, borderRadius: 12, elevation: 3,
  },
  addBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 15, marginLeft: 8 },
  card: {
    flexDirection: 'row', alignItems: 'center', padding: 14,
    borderRadius: 14, marginBottom: 12, elevation: 2,
  },
  iconBox: { width: 42, height: 42, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  cardInfo: { flex: 1 },
  name: { fontSize: 15, fontWeight: 'bold', marginBottom: 3 },
  numRow: { flexDirection: 'row', alignItems: 'center' },
  number: { fontSize: 13, fontWeight: '600' },
  actionBtn: { padding: 8 },
  empty: { textAlign: 'center', marginTop: 60, fontSize: 15 },
  modalOverlay: { flex: 1, backgroundColor: '#00000066', justifyContent: 'center', alignItems: 'center' },
  modal: { width: '88%', borderRadius: 20, padding: 24, elevation: 10 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 18, fontWeight: 'bold' },
  label: { fontSize: 12, fontWeight: '600', textTransform: 'uppercase', marginBottom: 6, marginTop: 12 },
  input: {
    borderWidth: 1, borderRadius: 10, padding: 12,
    fontSize: 15,
  },
  saveBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    padding: 14, borderRadius: 12, marginTop: 24,
  },
  saveBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16, marginLeft: 8 },
});

export default AdminManageHelplinesScreen;
