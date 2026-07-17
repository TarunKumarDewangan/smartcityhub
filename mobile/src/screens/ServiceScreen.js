import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert, TextInput, ScrollView, StatusBar } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Search as SearchIcon, Wrench, Shield, Check, Phone, MapPin, ChevronRight, Briefcase } from 'lucide-react-native';
import apiClient from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const ServiceScreen = () => {
  const { user } = useAuth();
  const navigation = useNavigation();
  const { theme, isDark } = useTheme();

  const [services, setServices] = useState([]);
  const [filteredServices, setFilteredServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [categories, setCategories] = useState(['All']);
  const [searchQuery, setSearchQuery] = useState('');

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    fetchServices(1);
  }, []);

  const fetchServices = async (pageNumber = 1) => {
    if (pageNumber === 1) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }
    try {
      const response = await apiClient.get(`/services?paginate=true&page=${pageNumber}`);
      const isPaginated = response.data && typeof response.data === 'object' && 'data' in response.data;
      const list = isPaginated ? response.data.data : response.data;

      if (pageNumber === 1) {
        setServices(list || []);
        setFilteredServices(list || []);
        if (list) {
          const uniqueCats = ['All', ...new Set(list.map(s => s.category))];
          setCategories(uniqueCats);
        }
      } else {
        setServices(prev => {
          const updated = [...prev, ...(list || [])];
          return updated;
        });
      }

      if (isPaginated) {
        setHasMore(response.data.current_page < response.data.last_page);
      } else {
        setHasMore(false);
      }
      setPage(pageNumber);
    } catch (e) {
      console.error('ServiceFetchError:', e.response?.data || e.message);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadMore = () => {
    if (!loading && !loadingMore && hasMore) {
      fetchServices(page + 1);
    }
  };

  useEffect(() => {
    applyFilters();
  }, [selectedCategory, searchQuery, services]);

  const applyFilters = () => {
    let result = services;

    // Category Filter
    if (selectedCategory !== 'All') {
      result = result.filter(s => s.category === selectedCategory);
    }

    // Search Filter
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      result = result.filter(s =>
        s.name.toLowerCase().includes(query) ||
        s.category.toLowerCase().includes(query) ||
        (s.description && s.description.toLowerCase().includes(query)) ||
        s.area.toLowerCase().includes(query)
      );
    }

    setFilteredServices(result);
  };

  const handleRequest = async (serviceId) => {
    if (!user) {
        Alert.alert('Session Required', 'Please log in to book city services and track your requests.', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Log In', onPress: () => navigation.navigate('Login') }
        ]);
        return;
    }
    try {
      await apiClient.post('/service-requests', { service_id: serviceId });
      Alert.alert('Success', 'Service request sent! The provider will contact you.');
    } catch (e) {
      Alert.alert('Error', 'Failed to send request.');
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.compactCard, { backgroundColor: theme.card, borderColor: theme.border }]}
      onPress={() => navigation.navigate('ServiceDetail', { serviceId: item.id })}
      activeOpacity={0.7}
    >
      <View style={[styles.imageWrapper, { backgroundColor: theme.primary + '15' }]}>
        <Briefcase size={26} color={theme.primary} />
      </View>

      <View style={styles.compactContent}>
        <View style={styles.compactHeader}>
            <Text style={[styles.compactName, { color: theme.text }]} numberOfLines={1}>{item.name}</Text>
            <View style={[styles.miniCategory, { backgroundColor: isDark ? theme.primary + '20' : '#eff6ff' }]}>
                <Text style={[styles.miniCategoryText, { color: theme.primary }]}>{item.category}</Text>
            </View>
        </View>

        <Text style={[styles.compactDesc, { color: theme.secondaryText }]} numberOfLines={2}>
          {item.description || 'No description provided.'}
        </Text>

        <View style={styles.compactFooter}>
          <View style={styles.footerItem}>
            <MapPin size={12} color={theme.secondaryText} />
            <Text style={[styles.footerText, { color: theme.secondaryText }]} numberOfLines={1}>{item.area}</Text>
          </View>
          <View style={styles.footerItem}>
            <Text style={[styles.ratingText, { color: isDark ? '#fbbf24' : '#f59e0b' }]}>⭐ {item.rating || 'N/A'}</Text>
          </View>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.requestBtn, { backgroundColor: theme.primary }]}
        onPress={() => handleRequest(item.id)}
        activeOpacity={0.8}
      >
        <Text style={styles.requestBtnText}>Book</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={[styles.loadingText, { color: theme.secondaryText }]}>Loading City Services...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={theme.background} />
      <View style={styles.screenHeader}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>City Services</Text>

        {/* Search Bar */}
        <View style={[styles.searchContainer, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <SearchIcon size={18} color={theme.placeholder} />
            <TextInput
                style={[styles.searchInput, { color: theme.text }]}
                placeholder="Search services (plumbing, cleaning...)"
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

      {/* Category Chips Scroll */}
      <View style={styles.filterSection}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterBar}
        >
          {categories.map((cat, i) => (
            <TouchableOpacity
              key={i}
              style={[
                styles.filterChip,
                { backgroundColor: theme.card, borderColor: theme.border },
                selectedCategory === cat && { backgroundColor: theme.primary, borderColor: theme.primary }
              ]}
              onPress={() => setSelectedCategory(cat)}
            >
              <Text style={[
                styles.chipText,
                { color: theme.secondaryText },
                selectedCategory === cat && { color: '#fff', fontWeight: 'bold' }
              ]}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={filteredServices}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={loadingMore ? <ActivityIndicator size="small" color={theme.primary} style={{ marginVertical: 15 }} /> : null}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Shield size={50} color={theme.border} />
            <Text style={[styles.empty, { color: theme.secondaryText }]}>No services match your criteria.</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 15, fontSize: 14 },
  screenHeader: { paddingHorizontal: 20, paddingTop: 20, marginBottom: 10 },
  headerTitle: { fontSize: 26, fontWeight: 'bold', marginBottom: 15 },

  searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 15,
      borderRadius: 12,
      borderWidth: 1,
      height: 45
  },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 14 },
  clearText: { fontSize: 12, fontWeight: 'bold' },

  filterSection: { marginBottom: 5 },
  filterBar: { paddingHorizontal: 15, paddingBottom: 10 },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1
  },
  chipText: { fontSize: 13, fontWeight: '500' },

  listContainer: { paddingHorizontal: 15, paddingBottom: 20 },
  compactCard: {
      flexDirection: 'row',
      borderRadius: 16,
      padding: 12,
      marginBottom: 12,
      alignItems: 'center',
      borderWidth: 1,
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 4
  },
  imageWrapper: { width: 50, height: 50, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },

  compactContent: { flex: 1, marginLeft: 15, marginRight: 10 },
  compactHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  compactName: { fontSize: 16, fontWeight: 'bold', flex: 1 },
  miniCategory: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  miniCategoryText: { fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase' },

  compactDesc: { fontSize: 12, marginBottom: 8, lineHeight: 16 },
  compactFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  footerItem: { flexDirection: 'row', alignItems: 'center' },
  footerText: { fontSize: 11, marginLeft: 4 },
  ratingText: { fontSize: 11, fontWeight: 'bold' },

  requestBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  requestBtnText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },

  emptyContainer: { alignItems: 'center', marginTop: 100 },
  empty: { textAlign: 'center', marginTop: 15, fontSize: 15 }
});

export default ServiceScreen;
