import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator, Alert, StatusBar, Linking, Share, Modal, TextInput } from 'react-native';
import { ShoppingBag, ChevronLeft, Star, Phone, MapPin, Share2, ArrowRight, X, User, Clock } from 'lucide-react-native';
import apiClient from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import HeaderMenu from '../components/HeaderMenu';

const ShopDetailScreen = ({ route, navigation }) => {
  const { shopId } = route.params;
  const { user } = useAuth();
  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [ratings, setRatings] = useState([]);
  const [newRating, setNewRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const { theme, isDark } = useTheme();

  useEffect(() => {
    fetchShopDetails();
    fetchRatings();
  }, []);

  const fetchShopDetails = async () => {
    try {
      const response = await apiClient.get(`/shops/${shopId}`);
      setShop(response.data?.data || response.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchRatings = async () => {
    try {
      const response = await apiClient.get(`/ratings?ratable_id=${shopId}&ratable_type=shop`);
      setRatings(Array.isArray(response.data) ? response.data : (response.data?.data || []));
    } catch (e) {
      console.error(e);
    }
  };

  const handleCall = () => {
    if (shop?.contact_phone) Linking.openURL(`tel:${shop.contact_phone}`);
  };

  const handleDirections = () => {
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(shop.address)}`;
    Linking.openURL(url);
  };

  const handleShare = async () => {
    if (!shop) return;
    try {
      await Share.share({
        title: shop.name,
        message: `🏪 Check out "${shop.name}" on Smart City App!\n\n📍 ${shop.address}\n📞 ${shop.contact_phone}\n\n📲 Download Smart City App:\nhttps://play.google.com/store/apps/details?id=com.smartcity.app`,
      });
    } catch (e) {
      console.error(e);
    }
  };

  const submitRating = async () => {
    if (!user) {
      Alert.alert(
        'Login Required',
        'Please log in or register to share your feedback with the community.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Log In', onPress: () => { setShowRatingModal(false); navigation.navigate('Login'); } }
        ]
      );
      return;
    }
    if (newRating === 0) {
      Alert.alert('Error', 'Please select a star rating');
      return;
    }
    setSubmitting(true);
    try {
      await apiClient.post('/ratings', {
        ratable_id: shopId,
        ratable_type: 'shop',
        rating: newRating,
        comment: comment
      });
      Alert.alert('Success', 'Thank you for your feedback!');
      setNewRating(0);
      setComment('');
      setShowRatingModal(false);
      fetchShopDetails();
      fetchRatings();
    } catch (e) {
        Alert.alert('Error', 'You have already rated this shop.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <View style={[styles.center, { backgroundColor: theme.background }]}><ActivityIndicator size="large" color={theme.primary} /></View>;
  if (!shop) return <View style={[styles.center, { backgroundColor: theme.background }]}><Text style={{ color: theme.text }}>Shop not found</Text></View>;

  const renderProduct = ({ item }) => (
    <View style={[styles.productCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
      <View style={[styles.productImageContainer, { backgroundColor: theme.divider }]}>
        {item.image_url ? (
          <Image source={{ uri: item.image_url }} style={styles.productImage} />
        ) : (
          <View style={styles.noImage}><ShoppingBag size={24} color={theme.iconDefault} /></View>
        )}
        <View style={[styles.priceBadge, { backgroundColor: theme.card }]}>
          <Text style={[styles.priceText, { color: theme.primary }]}>₹{item.price}</Text>
        </View>
        {item.is_featured && (
          <View style={styles.topSellerBadge}>
            <Star size={9} color="#fff" fill="#fff" />
            <Text style={styles.topSellerText}>Top Seller</Text>
          </View>
        )}
      </View>
      <View style={styles.productInfo}>
        <Text style={[styles.productName, { color: theme.text }]} numberOfLines={1}>{item.name}</Text>
        <Text style={[styles.productDesc, { color: theme.secondaryText }]} numberOfLines={1}>{item.description}</Text>
        <TouchableOpacity 
            style={styles.viewBtn} 
            onPress={() => navigation.navigate('ProductDetail', { productId: item.id })}
        >
            <Text style={[styles.viewBtnText, { color: theme.primary }]}>View Details</Text>
            <ArrowRight size={12} color={theme.primary} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle="light-content" transparent backgroundColor="transparent" />
      
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Compact Header Hero */}
        <View style={styles.header}>
          {shop.image_url ? (
            <Image source={{ uri: shop.image_url }} style={styles.headerImage} />
          ) : (
            <View style={[styles.headerImage, { backgroundColor: isDark ? theme.primaryDark : '#1e293b' }]}>
               <ShoppingBag size={60} color="rgba(255,255,255,0.1)" />
            </View>
          )}
          <View style={styles.headerOverlay} />
          
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <ChevronLeft size={24} color="#fff" />
          </TouchableOpacity>

          <View style={styles.topRightMenu}>
            <HeaderMenu />
          </View>

          <View style={styles.headerContent}>
            <View style={[styles.categoryBadge, { backgroundColor: theme.primary }]}>
                <Text style={styles.categoryText}>{shop.category}</Text>
            </View>
            <Text style={styles.shopName} numberOfLines={1}>{shop.name}</Text>
            <View style={styles.ratingRow}>
                <Star size={14} color="#ffc107" fill="#ffc107" />
                <Text style={styles.ratingText}>{shop.average_rating} • {shop.rating_count} Reviews</Text>
            </View>
          </View>
        </View>

        {/* Action Bar */}
        <View style={[styles.actionBar, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <TouchableOpacity style={styles.actionBtn} onPress={handleCall}>
                <View style={[styles.actionIcon, { backgroundColor: isDark ? theme.primary + '20' : '#eff6ff' }]}>
                    <Phone size={18} color={theme.primary} />
                </View>
                <Text style={[styles.actionLabel, { color: theme.secondaryText }]}>Call</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionBtn} onPress={handleDirections}>
                <View style={[styles.actionIcon, { backgroundColor: isDark ? theme.success + '20' : '#f0fdf4' }]}>
                    <MapPin size={18} color={isDark ? theme.success : "#16a34a"} />
                </View>
                <Text style={[styles.actionLabel, { color: theme.secondaryText }]}>Map</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionBtn} onPress={handleShare}>
                <View style={[styles.actionIcon, { backgroundColor: isDark ? theme.warning + '20' : '#fff7ed' }]}>
                    <Share2 size={18} color={isDark ? theme.warning : "#ea580c"} />
                </View>
                <Text style={[styles.actionLabel, { color: theme.secondaryText }]}>Share</Text>
            </TouchableOpacity>
        </View>

        {/* Essential Info Section */}
        <View style={styles.contentSection}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Overview</Text>
            <Text style={[styles.description, { color: theme.secondaryText }]}>{shop.description}</Text>
            
            <View style={styles.locationCard}>
                <MapPin size={16} color={theme.secondaryText} />
                <Text style={[styles.addressText, { color: theme.secondaryText }]} numberOfLines={2}>{shop.address}</Text>
            </View>

            {(shop.opening_days || shop.opening_hours) && (
                <View style={[styles.locationCard, { marginTop: 8 }]}>
                    <Clock size={16} color={theme.secondaryText} />
                    <Text style={[styles.addressText, { color: theme.secondaryText }]} numberOfLines={2}>
                        {[shop.opening_days, shop.opening_hours].filter(Boolean).join(' • ')}
                    </Text>
                </View>
            )}
        </View>

        {/* Compact Feedback Row */}
        <View style={styles.feedbackCompactRow}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Reviews</Text>
            <TouchableOpacity 
                style={[styles.rateBtn, { backgroundColor: isDark ? theme.primary + '20' : '#eff6ff' }]} 
                onPress={() => {
                    if (!user) {
                        Alert.alert('Login Required', 'Please join us to write a review!', [
                            { text: 'Later', style: 'cancel' },
                            { text: 'Join/Login', onPress: () => navigation.navigate('Login') }
                        ]);
                    } else {
                        setShowRatingModal(true);
                    }
                }}
            >
                <Star size={14} color={theme.primary} />
                <Text style={[styles.rateBtnText, { color: theme.primary }]}>Write a Review</Text>
            </TouchableOpacity>
        </View>

        {ratings.length > 0 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.ratingsScroll}>
                {ratings.map(r => (
                    <View key={r.id} style={[styles.ratingChip, { backgroundColor: theme.card, borderColor: theme.border }]}>
                        <View style={styles.chipHeader}>
                            <User size={12} color={theme.secondaryText} />
                            <Text style={[styles.chipUser, { color: theme.text }]} numberOfLines={1}>{r.user?.name}</Text>
                            <View style={styles.chipStars}>
                                <Star size={10} color="#ffc107" fill="#ffc107" />
                                <Text style={styles.chipStarsText}>{r.rating}</Text>
                            </View>
                        </View>
                        {r.comment && <Text style={[styles.chipComment, { color: theme.secondaryText }]} numberOfLines={1}>{r.comment}</Text>}
                    </View>
                ))}
            </ScrollView>
        ) : (
            <Text style={[styles.emptyHint, { color: theme.secondaryText }]}>No reviews yet. Be the first to rate!</Text>
        )}

        {/* High Density Product List */}
        <View style={styles.productSection}>
            <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>Products & Services</Text>
                <View style={[styles.itemBadge, { backgroundColor: theme.divider }]}><Text style={[styles.itemBadgeText, { color: theme.secondaryText }]}>{shop.products?.length || 0}</Text></View>
            </View>

            {shop.products && shop.products.length > 0 ? (
                <View style={styles.productGrid}>
                   {shop.products.map(product => (
                       <View key={product.id} style={styles.gridItem}>
                           {renderProduct({ item: product })}
                       </View>
                   ))}
                </View>
            ) : (
                <View style={styles.emptyContainer}>
                    <ShoppingBag size={30} color={theme.border} />
                    <Text style={[styles.empty, { color: theme.secondaryText }]}>No items listed yet.</Text>
                </View>
            )}
        </View>
        <View style={{ height: 40 }} />
      </ScrollView>

      {/* COMPACT RATING MODAL */}
      <Modal visible={showRatingModal} transparent animationType="slide">
          <View style={styles.modalOverlay}>
              <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
                  <View style={styles.modalHeader}>
                      <Text style={[styles.modalTitle, { color: theme.text }]}>Rate {shop.name}</Text>
                      <TouchableOpacity onPress={() => setShowRatingModal(false)}>
                          <X size={24} color={theme.text} />
                      </TouchableOpacity>
                  </View>
                  
                  <View style={styles.starsRow}>
                      {[1, 2, 3, 4, 5].map((star) => (
                          <TouchableOpacity key={star} onPress={() => setNewRating(star)} style={styles.starTouch}>
                              <Star 
                                  size={40} 
                                  color={star <= newRating ? '#ffc107' : theme.divider} 
                                  fill={star <= newRating ? '#ffc107' : 'transparent'} 
                              />
                          </TouchableOpacity>
                      ))}
                  </View>

                  <TextInput 
                      style={[styles.modalInput, { backgroundColor: theme.input, borderColor: theme.border, color: theme.text }]}
                      placeholder="Share your experience (optional)..."
                      placeholderTextColor={theme.placeholder}
                      value={comment}
                      onChangeText={setComment}
                      multiline
                      numberOfLines={4}
                  />

                  <TouchableOpacity 
                      style={[styles.modalSubmit, { backgroundColor: theme.primary }, submitting && styles.disabledBtn]} 
                      onPress={submitRating}
                      disabled={submitting}
                  >
                      {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.modalSubmitText}>Post Review</Text>}
                  </TouchableOpacity>
              </View>
          </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { height: 260, position: 'relative' },
  headerImage: { width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' },
  headerOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.4)' },
  backButton: { position: 'absolute', top: 50, left: 15, zIndex: 10, backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: 10, padding: 6 },
  topRightMenu: { position: 'absolute', top: 50, right: 15, zIndex: 10 },
  headerContent: { position: 'absolute', bottom: 25, left: 20, right: 20 },
  categoryBadge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 8, marginBottom: 8 },
  categoryText: { color: '#fff', fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase' },
  shopName: { fontSize: 26, fontWeight: 'bold', color: '#fff' },
  ratingRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  ratingText: { marginLeft: 6, color: '#fff', fontSize: 12, fontWeight: '500' },
  
  actionBar: { 
      flexDirection: 'row', 
      justifyContent: 'space-around', 
      marginTop: -25, 
      marginHorizontal: 15, 
      borderRadius: 16, 
      paddingVertical: 12,
      elevation: 4,
      borderWidth: 1
  },
  actionBtn: { alignItems: 'center', width: '30%' },
  actionIcon: { width: 38, height: 38, borderRadius: 19, justifyContent: 'center', alignItems: 'center', marginBottom: 4 },
  actionLabel: { fontSize: 11, fontWeight: 'bold' },

  contentSection: { padding: 20 },
  sectionTitle: { fontSize: 17, fontWeight: 'bold' },
  description: { fontSize: 14, lineHeight: 22, marginTop: 8, marginBottom: 15 },
  locationCard: { flexDirection: 'row', alignItems: 'center' },
  addressText: { fontSize: 13, marginLeft: 8, flex: 1 },

  feedbackCompactRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 10 },
  rateBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  rateBtnText: { fontSize: 12, fontWeight: 'bold', marginLeft: 6 },
  
  ratingsScroll: { paddingHorizontal: 15, paddingBottom: 15 },
  ratingChip: { padding: 12, borderRadius: 12, marginRight: 10, borderWidth: 1, width: 180 },
  chipHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  chipUser: { fontSize: 12, fontWeight: 'bold', flex: 1, marginLeft: 6 },
  chipStars: { flexDirection: 'row', alignItems: 'center' },
  chipStarsText: { fontSize: 11, color: '#ca8a04', fontWeight: 'bold', marginLeft: 3 },
  chipComment: { fontSize: 11, fontStyle: 'italic' },
  emptyHint: { paddingHorizontal: 20, fontSize: 12, fontStyle: 'italic', marginBottom: 15 },

  productSection: { paddingHorizontal: 20, marginTop: 5 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  itemBadge: { marginLeft: 8, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  itemBadgeText: { fontSize: 11, fontWeight: 'bold' },
  productGrid: { width: '100%' },
  gridItem: { marginBottom: 12 },
  
  productCard: { borderRadius: 14, flexDirection: 'row', padding: 10, borderWidth: 1 },
  productImageContainer: { width: 70, height: 70, borderRadius: 10, overflow: 'hidden' },
  productImage: { width: '100%', height: '100%' },
  noImage: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  priceBadge: { position: 'absolute', bottom: 4, right: 4, paddingHorizontal: 4, paddingVertical: 2, borderRadius: 6, elevation: 1 },
  priceText: { fontWeight: 'bold', fontSize: 9 },
  topSellerBadge: { position: 'absolute', top: 4, left: 4, flexDirection: 'row', alignItems: 'center', backgroundColor: '#f59e0b', paddingHorizontal: 5, paddingVertical: 2, borderRadius: 6 },
  topSellerText: { color: '#fff', fontSize: 8, fontWeight: 'bold', marginLeft: 2 },
  
  productInfo: { flex: 1, marginLeft: 12, justifyContent: 'center' },
  productName: { fontSize: 15, fontWeight: 'bold' },
  productDesc: { fontSize: 11, marginTop: 2 },
  viewBtn: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  viewBtnText: { fontSize: 11, fontWeight: 'bold', marginRight: 4 },
  
  emptyContainer: { alignItems: 'center', paddingVertical: 20 },
  empty: { marginTop: 10, fontSize: 13 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: 25, borderTopRightRadius: 25, padding: 25 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 },
  modalTitle: { fontSize: 20, fontWeight: 'bold' },
  starsRow: { flexDirection: 'row', justifyContent: 'center', marginBottom: 25 },
  starTouch: { padding: 5 },
  modalInput: { borderRadius: 12, padding: 15, height: 100, textAlignVertical: 'top', borderWidth: 1, marginBottom: 20 },
  modalSubmit: { padding: 16, borderRadius: 15, alignItems: 'center' },
  modalSubmitText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  disabledBtn: { opacity: 0.6 }
});

export default ShopDetailScreen;
