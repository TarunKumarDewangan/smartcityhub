import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert, TextInput, ScrollView, StatusBar, Switch } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Search as SearchIcon, Wrench, Edit, Trash2 } from 'lucide-react-native';
import apiClient from '../api/client';
import { useTheme } from '../context/ThemeContext';

const STATUS_FILTERS = ['All', 'Approved', 'Pending'];

const ManageAllServicesScreen = ({ navigation }) => {
  const { theme, isDark } = useTheme();

  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const isFirstRun = useRef(true);

  const fetchServices = async (pageNumber = 1, search = searchQuery, status = selectedStatus) => {
    if (pageNumber === 1) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }
    try {
      const params = new URLSearchParams({ paginate: 'true', page: String(pageNumber) });
      if (search.trim()) params.append('search', search.trim());
      if (status === 'Approved') params.append('approved', '1');
      if (status === 'Pending') params.append('approved', '0');

      const response = await apiClient.get(`/admin/services?${params.toString()}`);
      const list = response.data.data;
      if (pageNumber === 1) {
        setServices(list);
      } else {
        setServices(prev => [...prev, ...list]);
      }
      setHasMore(response.data.current_page < response.data.last_page);
      setPage(pageNumber);
    } catch (e) {
      console.error('ServicesFetchError:', e.response?.data || e.message);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchServices(1);
    }, [])
  );

  // Debounced re-fetch when search/filter actually change — skip on the
  // initial mount since useFocusEffect above already handles that load,
  // otherwise both fire together and the list visibly reloads twice.
  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }
    const handle = setTimeout(() => {
      fetchServices(1, searchQuery, selectedStatus);
    }, 350);
    return () => clearTimeout(handle);
  }, [searchQuery, selectedStatus]);

  const loadMore = () => {
    if (!loading && !loadingMore && hasMore) {
      fetchServices(page + 1, searchQuery, selectedStatus);
    }
  };

  const handleToggleApproved = async (service) => {
    try {
      await apiClient.put(`/services/${service.id}`, { is_approved: !service.is_approved });
      setServices(prev => prev.map(s => s.id === service.id ? { ...s, is_approved: !s.is_approved } : s));
    } catch (e) {
      Alert.alert('Error', e.response?.data?.message || 'Failed to update approval status.');
    }
  };

  const handleDelete = (service) => {
    Alert.alert(
      'Delete Service',
      `Delete "${service.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiClient.delete(`/services/${service.id}`);
              setServices(prev => prev.filter(s => s.id !== service.id));
            } catch (e) {
              Alert.alert('Error', e.response?.data?.message || 'Failed to delete service.');
            }
          }
        }
      ]
    );
  };

  const renderItem = ({ item }) => (
    <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
      <View style={[styles.iconCircle, { backgroundColor: isDark ? '#333' : '#f1f5f9' }]}>
        <Wrench color={theme.secondaryText} size={22} />
      </View>
      <View style={styles.cardContent}>
        <View style={styles.nameRow}>
          <Text style={[styles.name, { color: theme.text }]} numberOfLines={1}>{item.name}</Text>
          <View style={[styles.statusDot, { backgroundColor: item.is_approved ? '#22c55e' : '#f59e0b' }]} />
        </View>
        <Text style={[styles.role, { color: theme.primary }]}>{item.category} • {item.area}</Text>
        <Text style={[styles.info, { color: theme.secondaryText }]} numberOfLines={1}>
          Provider: {item.provider?.name || 'N/A'}
        </Text>
      </View>
      <Switch
        value={item.is_approved}
        onValueChange={() => handleToggleApproved(item)}
        trackColor={{ false: theme.border, true: theme.primary + '80' }}
        thumbColor={item.is_approved ? theme.primary : (isDark ? '#444' : '#f4f3f4')}
        style={{ marginRight: 10 }}
      />
      <TouchableOpacity onPress={() => navigation.navigate('AddEditService', { service: item })}>
        <Edit size={19} color={theme.primary} style={{ marginRight: 16 }} />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => handleDelete(item)}>
        <Trash2 size={19} color="#dc3545" />
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={theme.background} />
      <View style={styles.screenHeader}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Manage Services</Text>

        <View style={[styles.searchContainer, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <SearchIcon size={18} color={theme.placeholder} />
          <TextInput
            style={[styles.searchInput, { color: theme.text }]}
            placeholder="Search by name or category..."
            placeholderTextColor={theme.placeholder}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Text style={[styles.clearText, { color: theme.primary }]}>Clear</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.filterSection}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterBar}>
          {STATUS_FILTERS.map((s, i) => (
            <TouchableOpacity
              key={i}
              style={[
                styles.filterChip,
                { backgroundColor: theme.card, borderColor: theme.border },
                selectedStatus === s && { backgroundColor: theme.primary, borderColor: theme.primary }
              ]}
              onPress={() => setSelectedStatus(s)}
            >
              <Text style={[
                styles.chipText,
                { color: theme.secondaryText },
                selectedStatus === s && { color: '#fff', fontWeight: 'bold' }
              ]}>{s}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={services}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={loadingMore ? <ActivityIndicator size="small" color={theme.primary} style={{ marginVertical: 15 }} /> : null}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Wrench size={50} color={theme.border} />
            <Text style={[styles.empty, { color: theme.secondaryText }]}>No services match your search.</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  screenHeader: { paddingHorizontal: 20, paddingTop: 20, marginBottom: 10 },
  headerTitle: { fontSize: 26, fontWeight: 'bold', marginBottom: 15 },

  searchContainer: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, borderRadius: 12, borderWidth: 1, height: 45 },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 14 },
  clearText: { fontSize: 12, fontWeight: 'bold' },

  filterSection: { marginBottom: 5 },
  filterBar: { paddingHorizontal: 15, paddingBottom: 10 },
  filterChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginRight: 8, borderWidth: 1 },
  chipText: { fontSize: 13, fontWeight: '500' },

  listContainer: { paddingHorizontal: 15, paddingBottom: 20 },
  card: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 16, marginBottom: 12, borderWidth: 1 },
  iconCircle: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  cardContent: { flex: 1, marginRight: 8 },
  nameRow: { flexDirection: 'row', alignItems: 'center' },
  name: { fontSize: 15, fontWeight: 'bold', flexShrink: 1 },
  statusDot: { width: 8, height: 8, borderRadius: 4, marginLeft: 6 },
  role: { fontSize: 12, fontWeight: '600', marginTop: 2 },
  info: { fontSize: 11, marginTop: 2 },

  emptyContainer: { alignItems: 'center', marginTop: 100 },
  empty: { textAlign: 'center', marginTop: 15, fontSize: 15 }
});

export default ManageAllServicesScreen;
