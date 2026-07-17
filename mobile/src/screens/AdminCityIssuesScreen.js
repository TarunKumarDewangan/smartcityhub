import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Alert, ActivityIndicator
} from 'react-native';
import { AlertTriangle, Trash2, CheckCircle, MapPin, User } from 'lucide-react-native';
import { useFocusEffect } from '@react-navigation/native';
import apiClient from '../api/client';
import { useTheme } from '../context/ThemeContext';

const STATUS_COLORS = {
  'Open':        { bg: '#fee2e2', text: '#ef4444' },
  'In Progress': { bg: '#fef3c7', text: '#f59e0b' },
  'Resolved':    { bg: '#dcfce7', text: '#22c55e' },
};

const STATUS_FLOW = ['Open', 'In Progress', 'Resolved'];

const AdminCityIssuesScreen = () => {
  const { theme, isDark } = useTheme();
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(useCallback(() => { fetchIssues(); }, []));

  const fetchIssues = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/admin/city-issues');
      setIssues(Array.isArray(res.data) ? res.data : (res.data?.data || []));
    } catch (e) {
      Alert.alert('Error', 'Failed to load city issues');
    } finally {
      setLoading(false);
    }
  };

  const cycleStatus = (item) => {
    const next = STATUS_FLOW[(STATUS_FLOW.indexOf(item.status) + 1) % STATUS_FLOW.length];
    Alert.alert('Update Status', `Mark as "${next}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Update', onPress: async () => {
          try {
            await apiClient.put(`/admin/city-issues/${item.id}/status`, { status: next });
            fetchIssues();
          } catch (e) {
            Alert.alert('Error', 'Failed to update status.');
          }
        }
      }
    ]);
  };

  const handleDelete = (item) => {
    Alert.alert('Delete Issue', 'Remove this reported issue permanently?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          try {
            await apiClient.delete(`/admin/city-issues/${item.id}`);
            fetchIssues();
          } catch (e) {
            Alert.alert('Error', 'Failed to delete issue.');
          }
        }
      }
    ]);
  };

  const renderItem = ({ item }) => {
    const colors = STATUS_COLORS[item.status] || STATUS_COLORS['Open'];
    return (
      <View style={[styles.card, { backgroundColor: theme.card }]}>
        <View style={styles.cardTop}>
          <View style={[styles.typeBadge, { backgroundColor: theme.primary + '15' }]}>
            <AlertTriangle size={13} color={theme.primary} />
            <Text style={[styles.typeText, { color: theme.primary }]}>{item.type}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: colors.bg }]}>
            <Text style={[styles.statusText, { color: colors.text }]}>{item.status}</Text>
          </View>
        </View>

        <Text style={[styles.description, { color: theme.text }]} numberOfLines={3}>
          {item.description}
        </Text>

        {/* Location */}
        {item.location_address || (item.latitude && item.longitude) ? (
          <View style={[styles.infoRow, { backgroundColor: isDark ? '#14532d20' : '#f0fdf4' }]}>
            <MapPin size={12} color="#16a34a" />
            <Text style={[styles.infoText, { color: '#16a34a' }]} numberOfLines={1}>
              {item.location_address || `${parseFloat(item.latitude).toFixed(5)}, ${parseFloat(item.longitude).toFixed(5)}`}
            </Text>
          </View>
        ) : null}

        {/* Reporter */}
        {(item.reporter_name || item.reporter_phone) ? (
          <View style={[styles.infoRow, { backgroundColor: isDark ? '#1e3a5f20' : '#eff6ff' }]}>
            <User size={12} color="#3b82f6" />
            <Text style={[styles.infoText, { color: '#3b82f6' }]}>
              {[item.reporter_name, item.reporter_phone].filter(Boolean).join(' · ')}
            </Text>
          </View>
        ) : null}

        <View style={styles.meta}>
          <Text style={[styles.reporter, { color: theme.secondaryText }]}>By: {item.reporter}</Text>
          <Text style={[styles.date, { color: theme.placeholder }]}>
            {new Date(item.created_at).toLocaleDateString()}
          </Text>
        </View>

        <View style={[styles.actions, { borderTopColor: theme.divider }]}>
          <TouchableOpacity style={styles.actionBtn} onPress={() => cycleStatus(item)}>
            <CheckCircle size={16} color={theme.primary} />
            <Text style={[styles.actionText, { color: theme.primary }]}>Update Status</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={() => handleDelete(item)}>
            <Trash2 size={16} color={theme.error} />
            <Text style={[styles.actionText, { color: theme.error }]}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const openCount = issues.filter(i => i.status === 'Open').length;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Summary Bar */}
      <View style={[styles.summaryBar, { backgroundColor: theme.card }]}>
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryNum, { color: theme.error }]}>
            {openCount}
          </Text>
          <Text style={[styles.summaryLabel, { color: theme.secondaryText }]}>Open</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryNum, { color: '#f59e0b' }]}>
            {issues.filter(i => i.status === 'In Progress').length}
          </Text>
          <Text style={[styles.summaryLabel, { color: theme.secondaryText }]}>In Progress</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryNum, { color: '#22c55e' }]}>
            {issues.filter(i => i.status === 'Resolved').length}
          </Text>
          <Text style={[styles.summaryLabel, { color: theme.secondaryText }]}>Resolved</Text>
        </View>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={theme.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={issues}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 20, paddingTop: 10 }}
          ListEmptyComponent={
            <Text style={[styles.empty, { color: theme.secondaryText }]}>
              No city issues reported yet.
            </Text>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  summaryBar: {
    flexDirection: 'row', justifyContent: 'space-around',
    padding: 16, marginHorizontal: 20, marginTop: 16,
    borderRadius: 14, elevation: 2,
  },
  summaryItem: { alignItems: 'center' },
  summaryNum: { fontSize: 22, fontWeight: 'bold' },
  summaryLabel: { fontSize: 11, fontWeight: '600', marginTop: 2, textTransform: 'uppercase' },
  card: {
    borderRadius: 14, marginBottom: 14, elevation: 2, overflow: 'hidden',
  },
  cardTop: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', padding: 14, paddingBottom: 8,
  },
  typeBadge: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8,
  },
  typeText: { fontSize: 12, fontWeight: 'bold', marginLeft: 5 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 11, fontWeight: 'bold' },
  description: { fontSize: 14, lineHeight: 20, paddingHorizontal: 14, paddingBottom: 10 },
  meta: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingHorizontal: 14, paddingBottom: 12,
  },
  reporter: { fontSize: 12, fontWeight: '600' },
  date: { fontSize: 11 },
  actions: {
    flexDirection: 'row', borderTopWidth: 1,
  },
  actionBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', padding: 12, gap: 6,
  },
  actionText: { fontSize: 13, fontWeight: '600' },
  infoRow: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 14, paddingVertical: 5,
    marginHorizontal: 14, marginBottom: 6, borderRadius: 6,
  },
  infoText: { fontSize: 11, fontWeight: '600', flex: 1 },
  empty: { textAlign: 'center', marginTop: 60, fontSize: 15 },
});

export default AdminCityIssuesScreen;
