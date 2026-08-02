import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator, Alert, StatusBar, Modal, TextInput } from 'react-native';
import ImageViewing from 'react-native-image-viewing';
import { ShoppingBag, ChevronLeft, Star, X, User, Expand } from 'lucide-react-native';
import apiClient from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import HeaderMenu from '../components/HeaderMenu';

const ProductDetailScreen = ({ route, navigation }) => {
  const { productId } = route.params;
  const { user } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [ratings, setRatings] = useState([]);
  const [newRating, setNewRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [viewerVisible, setViewerVisible] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);
  const { theme, isDark } = useTheme();

  const images = product ? [product.image_url, product.image_url_2].filter(Boolean) : [];

  const openViewer = (index) => {
    setViewerIndex(index);
    setViewerVisible(true);
  };

  useEffect(() => {
    fetchProduct();
    fetchRatings();
  }, []);

  const fetchProduct = async () => {
    try {
      const response = await apiClient.get(`/products/${productId}`);
      setProduct(response.data?.data || response.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchRatings = async () => {
    try {
      const response = await apiClient.get(`/ratings?ratable_id=${productId}&ratable_type=product`);
      setRatings(Array.isArray(response.data) ? response.data : (response.data?.data || []));
    } catch (e) {
      console.error(e);
    }
  };

  const submitRating = async () => {
    if (!user) {
      Alert.alert(
        'Login Required',
        'Please log in to rate products.',
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
        ratable_id: productId,
        ratable_type: 'product',
        rating: newRating,
        comment: comment
      });
      Alert.alert('Success', 'Rating submitted!');
      setNewRating(0);
      setComment('');
      setShowRatingModal(false);
      fetchProduct();
      fetchRatings();
    } catch (e) {
      Alert.alert('Error', 'You have already rated this product.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <View style={[styles.center, { backgroundColor: theme.background }]}><ActivityIndicator size="large" color={theme.primary} /></View>;
  if (!product) return <View style={[styles.center, { backgroundColor: theme.background }]}><Text style={{ color: theme.text }}>Product not found</Text></View>;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Compact Image Header */}
        <View style={[styles.imageHeader, { backgroundColor: theme.divider }]}>
          {product.image_url ? (
            <TouchableOpacity activeOpacity={0.9} style={styles.mainImage} onPress={() => openViewer(0)}>
              <Image source={{ uri: product.image_url }} style={styles.mainImage} />
              <View style={[styles.expandHint, { backgroundColor: 'rgba(0,0,0,0.45)' }]}>
                <Expand size={14} color="#fff" />
              </View>
            </TouchableOpacity>
          ) : (
            <View style={[styles.placeholderImage, { backgroundColor: theme.divider }]}>
              <ShoppingBag size={60} color={theme.iconDefault} />
            </View>
          )}

          {images.length > 1 && (
            <TouchableOpacity style={[styles.secondThumb, { borderColor: theme.card }]} onPress={() => openViewer(1)}>
              <Image source={{ uri: product.image_url_2 }} style={styles.secondThumbImage} />
              <View style={styles.secondThumbOverlay}>
                <Text style={styles.secondThumbText}>+{images.length - 1}</Text>
              </View>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={[styles.backBtn, { backgroundColor: theme.card }]} onPress={() => navigation.goBack()}>
            <ChevronLeft size={22} color={theme.text} />
          </TouchableOpacity>

          <View style={styles.topRightMenu}>
            <HeaderMenu />
          </View>
        </View>

        <View style={[styles.infoSection, { backgroundColor: theme.card }]}>
          <View style={styles.priceRow}>
            <Text style={[styles.price, { color: theme.primary }]}>₹{product.price}</Text>
            <View style={[styles.ratingBadge, { backgroundColor: isDark ? theme.warning + '20' : '#fffcf0', borderColor: theme.border }]}>
              <Star size={12} color="#ca8a04" fill="#ca8a04" />
              <Text style={[styles.ratingValue, { color: isDark ? theme.warning : '#854d0e' }]}>{product.average_rating}</Text>
              <Text style={[styles.ratingCount, { color: theme.secondaryText }]}>({product.rating_count})</Text>
            </View>
          </View>
          
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={[styles.name, { color: theme.text }]}>{product.name}</Text>
            {product.is_featured && (
              <View style={styles.topSellerBadge}>
                <Star size={10} color="#fff" fill="#fff" />
                <Text style={styles.topSellerText}>Top Seller</Text>
              </View>
            )}
          </View>
          <Text style={[styles.description, { color: theme.secondaryText }]}>{product.description}</Text>
          
          <View style={[styles.divider, { backgroundColor: theme.divider }]} />

          {/* Compact Feedback Row */}
          <View style={styles.feedbackCompactRow}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>User Reviews</Text>
              <TouchableOpacity 
                  style={[styles.rateBtn, { backgroundColor: isDark ? theme.primary + '20' : '#eff6ff' }]} 
                  onPress={() => {
                        if (!user) {
                            Alert.alert('Login Required', 'Log in to share your thoughts!', [
                                { text: 'Cancel', style: 'cancel' },
                                { text: 'Log In', onPress: () => navigation.navigate('Login') }
                            ]);
                        } else {
                            setShowRatingModal(true);
                        }
                  }}
              >
                  <Star size={14} color={theme.primary} />
                  <Text style={[styles.rateBtnText, { color: theme.primary }]}>Rate</Text>
              </TouchableOpacity>
          </View>

          {ratings.length > 0 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.ratingsScroll}>
                {ratings.map(r => (
                    <View key={r.id} style={[styles.ratingChip, { backgroundColor: theme.input, borderColor: theme.border }]}>
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
            <Text style={[styles.emptyHint, { color: theme.secondaryText }]}>No reviews yet.</Text>
          )}
        </View>
        <View style={{ height: 40 }} />
      </ScrollView>

      {/* COMPACT RATING MODAL */}
      <Modal visible={showRatingModal} transparent animationType="slide">
          <View style={styles.modalOverlay}>
              <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
                  <View style={styles.modalHeader}>
                      <Text style={[styles.modalTitle, { color: theme.text }]}>Rate Product</Text>
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
                      placeholder="Comment (optional)..."
                      placeholderTextColor={theme.placeholder}
                      value={comment}
                      onChangeText={setComment}
                      multiline
                  />

                  <TouchableOpacity 
                      style={[styles.modalSubmit, { backgroundColor: theme.primary }, submitting && styles.disabledBtn]} 
                      onPress={submitRating}
                      disabled={submitting}
                  >
                      {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.modalSubmitText}>Submit Review</Text>}
                  </TouchableOpacity>
              </View>
          </View>
      </Modal>

      <ImageViewing
        images={images.map(uri => ({ uri }))}
        imageIndex={viewerIndex}
        visible={viewerVisible}
        onRequestClose={() => setViewerVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  imageHeader: { height: 280, position: 'relative' },
  mainImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  placeholderImage: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  backBtn: { position: 'absolute', top: 50, left: 15, borderRadius: 10, padding: 6, elevation: 3 },
  topRightMenu: { position: 'absolute', top: 50, right: 15, zIndex: 10 },
  expandHint: { position: 'absolute', bottom: 12, right: 12, padding: 6, borderRadius: 8 },
  secondThumb: { position: 'absolute', bottom: 12, left: 12, width: 56, height: 56, borderRadius: 10, overflow: 'hidden', borderWidth: 2 },
  secondThumbImage: { width: '100%', height: '100%' },
  secondThumbOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },
  secondThumbText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  
  infoSection: { padding: 20, marginTop: -25, borderTopLeftRadius: 25, borderTopRightRadius: 25 },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  price: { fontSize: 24, fontWeight: 'bold' },
  ratingBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, borderWidth: 1 },
  ratingValue: { marginLeft: 4, fontSize: 13, fontWeight: 'bold' },
  ratingCount: { marginLeft: 3, fontSize: 11 },
  name: { fontSize: 20, fontWeight: 'bold', marginBottom: 8, flexShrink: 1 },
  topSellerBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f59e0b', paddingHorizontal: 6, paddingVertical: 3, borderRadius: 8, marginLeft: 8, marginBottom: 8 },
  topSellerText: { color: '#fff', fontSize: 10, fontWeight: 'bold', marginLeft: 3 },
  description: { fontSize: 13, lineHeight: 20, marginBottom: 15 },
  divider: { height: 1, marginVertical: 15 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold' },
  
  feedbackCompactRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  rateBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  rateBtnText: { fontSize: 11, fontWeight: 'bold', marginLeft: 4 },
  
  ratingsScroll: { paddingBottom: 10 },
  ratingChip: { padding: 10, borderRadius: 12, marginRight: 8, borderWidth: 1, width: 160 },
  chipHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  chipUser: { fontSize: 11, fontWeight: 'bold', flex: 1, marginLeft: 5 },
  chipStars: { flexDirection: 'row', alignItems: 'center' },
  chipStarsText: { fontSize: 10, color: '#ca8a04', fontWeight: 'bold', marginLeft: 2 },
  chipComment: { fontSize: 10, fontStyle: 'italic' },
  emptyHint: { fontSize: 12, fontStyle: 'italic' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: 25, borderTopRightRadius: 25, padding: 25 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 18, fontWeight: 'bold' },
  starsRow: { flexDirection: 'row', justifyContent: 'center', marginBottom: 20 },
  starTouch: { padding: 5 },
  modalInput: { borderRadius: 10, padding: 12, height: 80, textAlignVertical: 'top', borderWidth: 1, marginBottom: 15 },
  modalSubmit: { padding: 14, borderRadius: 12, alignItems: 'center' },
  modalSubmitText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  disabledBtn: { opacity: 0.6 }
});

export default ProductDetailScreen;
