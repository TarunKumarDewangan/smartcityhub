import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ActivityIndicator, Alert, StatusBar, TextInput, ScrollView } from 'react-native';
import { MapPin, Phone, Store, Search as SearchIcon, ChevronRight, ShoppingBag } from 'lucide-react-native';
import apiClient from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const ShopScreen = ({ navigation }) => {
  const [shops, setShops] = useState([]);
  const { user } = useAuth();
  const [filteredShops, setFilteredShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [categories, setCategories] = useState(['All']);
  const [searchQuery, setSearchQuery] = useState('');
  const { theme, isDark } = useTheme();

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    fetchShops(1);
  }, []);

  const fetchShops = async (pageNumber = 1) => {
    if (pageNumber === 1) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }
    try {
      const response = await apiClient.get(`/shops?paginate=true&page=${pageNumber}`);
      const list = response.data.data;
      if (pageNumber === 1) {
        setShops(list);
        setFilteredShops(list);
        const uniqueCats = ['All', ...new Set(list.map(shop => shop.category))];
        setCategories(uniqueCats);
      } else {
        setShops(prev => [...prev, ...list]);
      }
      setHasMore(response.data.current_page < response.data.last_page);
      setPage(pageNumber);
    } catch (e) {
      console.error('ShopFetchError:', e.response?.data || e.message);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadMore = () => {
    if (!loading && !loadingMore && hasMore) {
      fetchShops(page + 1);
    }
  };

  useEffect(() => {
    applyFilters();
  }, [selectedCategory, searchQuery, shops]);

  const applyFilters = () => {
    let result = shops;
    
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
        s.description.toLowerCase().includes(query) ||
        (s.products && s.products.some(p => p.name.toLowerCase().includes(query)))
      );
    }
    
    setFilteredShops(result);
  };

  const renderShop = ({ item }) => (
    <TouchableOpacity 
      style={[styles.compactCard, { backgroundColor: theme.card, borderColor: theme.border }]} 
      onPress={() => {
          if (!user) {
              Alert.alert(
                  'Login Required',
                  'Join our Smart City community to see full shop details, products, and reviews!',
                  [
                      { text: 'Maybe Later', style: 'cancel' },
                      { text: 'Login / Register', onPress: () => navigation.navigate('Login') }
                  ]
              );
          } else {
              navigation.navigate('ShopDetail', { shopId: item.id });
          }
      }}
      activeOpacity={0.7}
    >
      <View style={[styles.imageWrapper, { backgroundColor: theme.divider }]}>
        {item.image_url ? (
          <Image source={{ uri: item.image_url }} style={styles.compactImage} />
        ) : (
          <View style={[styles.compactImage, styles.placeholderBg]}>
            <Store size={24} color={theme.primary} opacity={0.3} />
          </View>
        )}
      </View>
      
      <View style={styles.compactContent}>
        <View style={styles.compactHeader}>
            <Text style={[styles.compactName, { color: theme.text }]} numberOfLines={1}>{item.name}</Text>
            <View style={[styles.miniCategory, { backgroundColor: isDark ? theme.primary + '20' : '#eff6ff' }]}>
                <Text style={[styles.miniCategoryText, { color: theme.primary }]}>{item.category}</Text>
            </View>
        </View>
        
        <Text style={[styles.compactDesc, { color: theme.secondaryText }]} numberOfLines={1}>{item.description}</Text>
        
        <View style={styles.compactFooter}>
          <View style={styles.footerItem}>
            <MapPin size={12} color={theme.secondaryText} />
            <Text style={[styles.footerText, { color: theme.secondaryText }]} numberOfLines={1}>{item.address}</Text>
          </View>
          <View style={styles.footerItem}>
            <Phone size={12} color={theme.primary} />
            <Text style={[styles.footerPhone, { color: theme.primary }]}>{item.contact_phone}</Text>
          </View>
        </View>
      </View>
      <ChevronRight size={18} color={theme.border} style={{ marginLeft: 5 }} />
    </TouchableOpacity>
  );

  if (loading) return (
    <View style={[styles.center, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={[styles.loadingText, { color: theme.secondaryText }]}>Loading Markets...</Text>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={theme.background} />
      <View style={styles.screenHeader}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Local Markets</Text>
        
        {/* Type to Search Input */}
        <View style={[styles.searchContainer, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <SearchIcon size={18} color={theme.placeholder} />
            <TextInput 
                style={[styles.searchInput, { color: theme.text }]}
                placeholder="Type to search shops..."
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


      {/* Modern Filter Scroll */}
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
        data={filteredShops}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderShop}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={loadingMore ? <ActivityIndicator size="small" color={theme.primary} style={{ marginVertical: 15 }} /> : null}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <ShoppingBag size={50} color={theme.border} />
            <Text style={[styles.empty, { color: theme.secondaryText }]}>No shops match your search.</Text>
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
  imageWrapper: { width: 65, height: 65, borderRadius: 12, overflow: 'hidden' },
  compactImage: { width: '100%', height: '100%' },
  placeholderBg: { justifyContent: 'center', alignItems: 'center' },
  
  compactContent: { flex: 1, marginLeft: 15 },
  compactHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  compactName: { fontSize: 16, fontWeight: 'bold', flex: 1 },
  miniCategory: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  miniCategoryText: { fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase' },
  
  compactDesc: { fontSize: 12, marginBottom: 8 },
  compactFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  footerItem: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  footerText: { fontSize: 11, marginLeft: 4 },
  footerPhone: { fontSize: 11, fontWeight: 'bold', marginLeft: 4 },
  
  emptyContainer: { alignItems: 'center', marginTop: 100 },
  empty: { textAlign: 'center', marginTop: 15, fontSize: 15 }
});

export default ShopScreen;
