import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert, TextInput, ScrollView, StatusBar } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Search as SearchIcon, User, Edit, Trash2, Plus, UserCog } from 'lucide-react-native';
import apiClient from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const ROLE_FILTERS = ['All', 'User', 'Admin', 'ShopOwner', 'ServiceProvider', 'Hospital', 'BloodBank', 'AmbulanceDriver'];

const ManageAllUsersScreen = ({ navigation }) => {
  const { theme, isDark } = useTheme();
  const { user: currentUser } = useAuth();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchUsers = async (pageNumber = 1, search = searchQuery, role = selectedRole) => {
    if (pageNumber === 1) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }
    try {
      const params = new URLSearchParams({ paginate: 'true', page: String(pageNumber) });
      if (search.trim()) params.append('search', search.trim());
      if (role !== 'All') params.append('role', role);

      const response = await apiClient.get(`/admin/users?${params.toString()}`);
      const list = response.data.data;
      if (pageNumber === 1) {
        setUsers(list);
      } else {
        setUsers(prev => [...prev, ...list]);
      }
      setHasMore(response.data.current_page < response.data.last_page);
      setPage(pageNumber);
    } catch (e) {
      console.error('UsersFetchError:', e.response?.data || e.message);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Refetch from the server whenever the screen regains focus (e.g. after
  // adding/editing/deleting a user), keeping the current search/role filter.
  useFocusEffect(
    React.useCallback(() => {
      fetchUsers(1);
    }, [])
  );

  // Debounce search input and re-run the filter server-side, since the
  // backend already supports `search`/`role` and local pages are incomplete.
  useEffect(() => {
    const handle = setTimeout(() => {
      fetchUsers(1, searchQuery, selectedRole);
    }, 350);
    return () => clearTimeout(handle);
  }, [searchQuery, selectedRole]);

  const loadMore = () => {
    if (!loading && !loadingMore && hasMore) {
      fetchUsers(page + 1, searchQuery, selectedRole);
    }
  };

  const handleDelete = (targetUser) => {
    if (currentUser?.id === targetUser.id) {
      Alert.alert('Not Allowed', "You can't delete your own account.");
      return;
    }

    Alert.alert(
      'Delete User',
      `Delete "${targetUser.name}"? This will also permanently delete everything they own (shops, products, services, blood bank, reported issues). Hospitals they manage will be kept but unlinked from their account.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiClient.delete(`/admin/users/${targetUser.id}`);
              setUsers(prev => prev.filter(u => u.id !== targetUser.id));
            } catch (e) {
              Alert.alert('Error', e.response?.data?.message || 'Failed to delete user.');
            }
          }
        }
      ]
    );
  };

  const renderItem = ({ item }) => (
    <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
      <View style={[styles.iconCircle, { backgroundColor: isDark ? '#333' : '#f1f5f9' }]}>
        <User color={theme.secondaryText} size={22} />
      </View>
      <View style={styles.cardContent}>
        <View style={styles.nameRow}>
          <Text style={[styles.name, { color: theme.text }]} numberOfLines={1}>{item.name}</Text>
          <View style={[styles.statusDot, { backgroundColor: item.is_approved ? '#22c55e' : '#f59e0b' }]} />
        </View>
        <Text style={[styles.role, { color: theme.primary }]}>{item.role}</Text>
        <Text style={[styles.info, { color: theme.secondaryText }]} numberOfLines={1}>
          {item.email || 'No email'}{item.phone ? ` | ${item.phone}` : ''}
        </Text>
      </View>
      <TouchableOpacity onPress={() => navigation.navigate('AddEditUser', { user: item })}>
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
        <View style={styles.headerRow}>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Manage Users</Text>
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: theme.primary }]}
            onPress={() => navigation.navigate('AddEditUser')}
          >
            <Plus size={18} color="#fff" />
            <Text style={styles.addButtonText}>Add User</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.searchContainer, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <SearchIcon size={18} color={theme.placeholder} />
          <TextInput
            style={[styles.searchInput, { color: theme.text }]}
            placeholder="Search by name, email or phone..."
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
          {ROLE_FILTERS.map((r, i) => (
            <TouchableOpacity
              key={i}
              style={[
                styles.filterChip,
                { backgroundColor: theme.card, borderColor: theme.border },
                selectedRole === r && { backgroundColor: theme.primary, borderColor: theme.primary }
              ]}
              onPress={() => setSelectedRole(r)}
            >
              <Text style={[
                styles.chipText,
                { color: theme.secondaryText },
                selectedRole === r && { color: '#fff', fontWeight: 'bold' }
              ]}>{r}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={users}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={loadingMore ? <ActivityIndicator size="small" color={theme.primary} style={{ marginVertical: 15 }} /> : null}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <UserCog size={50} color={theme.border} />
            <Text style={[styles.empty, { color: theme.secondaryText }]}>No users match your search.</Text>
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
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  headerTitle: { fontSize: 26, fontWeight: 'bold' },
  addButton: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20 },
  addButtonText: { color: '#fff', fontWeight: 'bold', marginLeft: 5, fontSize: 13 },

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

export default ManageAllUsersScreen;
