import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Alert,
  FlatList,
  StatusBar,
  Modal
} from 'react-native';
import { useNavigation, useTheme } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import { Ionicons, AntDesign, MaterialIcons, FontAwesome, Feather, Entypo } from '@expo/vector-icons';
import { addToCart } from '../../redux/actions/cartActions';

const { width } = Dimensions.get('window');
const ITEM_WIDTH = width - 40;

const ProductDetailScreen = ({ route }) => {
  const { colors } = useTheme();
  const isDarkMode = useSelector(state => state.theme.isDarkMode);
  const dispatch = useDispatch();
  const navigation = useNavigation();
  
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  
  // Define theme-consistent colors
  const backgroundColor = isDarkMode ? '#121212' : colors.surfaceContainer;
  const cardBackground = isDarkMode ? 'rgba(32, 32, 36, 0.95)' : colors.surfaceContainerLow;
  const borderColor = isDarkMode ? 'rgba(70, 70, 80, 0.7)' : 'rgba(150, 150, 150, 0.3)';
  const textColor = isDarkMode ? 'rgba(220, 220, 225, 0.9)' : colors.onSurface;
  const secondaryText = isDarkMode ? '#aaa' : '#777';
  const inputBackground = isDarkMode ? 'rgba(45, 45, 50, 0.7)' : '#f5f5f5';
  
  // Ensure we have product data with defaults for missing fields
  const productData = route.params?.product || {};
  const product = {
    id: productData.id || '1',
    title: productData.title || 'Tài liệu học tiếng Anh',
    author: productData.author || 'Không rõ tác giả',
    publisher: productData.publisher || 'Không rõ nhà xuất bản',
    price: productData.price || 0,
    rating: productData.rating || 4.5,
    reviews: productData.reviews || 0,
    category: productData.category || 'Tài liệu học tập',
    inStock: productData.inStock !== false, // Default to true if not specified
    description: productData.description || 'Không có mô tả cho sản phẩm này.',
    // Ensure images is always an array
    images: Array.isArray(productData.images) ? productData.images : 
            (productData.image ? [productData.image] : ['https://via.placeholder.com/300x400?text=No+Image']),
    // Ensure details is always an array
    details: Array.isArray(productData.details) ? productData.details : 
             ['ID sản phẩm: ' + (productData.id || '1')]
  };

  const handleAddToCart = () => {
    // Cập nhật sản phẩm với image đã xác thực trước khi thêm vào giỏ hàng
    const productToAdd = {
      ...product,
      // Đảm bảo có thuộc tính image từ mảng images để tương thích với CartScreen
      image: product.images && product.images.length > 0 ? product.images[0] : 'https://via.placeholder.com/300x400?text=No+Image',
      quantity: quantity // Thêm số lượng sản phẩm đã chọn
    };
    
    dispatch(addToCart(productToAdd));
    Alert.alert('Thành công', `${product.title} đã được thêm vào giỏ hàng`);
  };
  
  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };
  
  const increaseQuantity = () => {
    setQuantity(quantity + 1);
  };

  
  const renderImageIndicator = () => (
    <View style={styles.imageIndicatorContainer}>
      {product.images.map((_, index) => (
        <View 
          key={index} 
          style={[
            styles.imageIndicator, 
            { 
              backgroundColor: index === activeImageIndex 
                ? colors.primary 
                : isDarkMode ? '#555' : '#ddd' 
            }
          ]}
        />
      ))}
    </View>
  );
  
  const renderRatingStars = () => (
    <View style={styles.ratingContainer}>
      {[1, 2, 3, 4, 5].map(star => (
        <AntDesign
          key={star}
          name={star <= Math.floor(product.rating) ? "star" : star <= product.rating ? "starhalf" : "staro"}
          size={18}
          color="#FFD700"
          style={{ marginRight: 2 }}
        />
      ))}
      <Text style={[styles.ratingText, { color: secondaryText }]}>
        {product.rating} ({product.reviews} đánh giá)
      </Text>
    </View>
  );
  
  return (
    <View style={[styles.container, { backgroundColor }]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      
      <View style={[styles.header, { backgroundColor: cardBackground, borderBottomColor: borderColor }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={textColor} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: textColor }]}>Chi tiết sản phẩm</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={styles.cartButton}
            onPress={() => navigation.navigate('Cart')}
          >
            <Ionicons name="cart-outline" size={24} color={textColor} />
          </TouchableOpacity>
        </View>
      </View>
      
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Image Gallery */}
        <View style={styles.imageGalleryContainer}>
          <FlatList
            data={product.images}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            keyExtractor={(_, index) => index.toString()}
            onMomentumScrollEnd={(event) => {
              const newIndex = Math.round(
                event.nativeEvent.contentOffset.x / ITEM_WIDTH
              );
              setActiveImageIndex(newIndex);
            }}
            renderItem={({ item }) => (
              <View style={styles.imageContainer}>
                <Image
                  source={{ uri: item }}
                  style={styles.productImage}
                  resizeMode="contain"
                />
              </View>
            )}
          />
          {renderImageIndicator()}
        </View>
        
        {/* Product Info */}
        <View style={[styles.infoContainer, { backgroundColor: cardBackground }]}>
          <View style={[styles.categoryBadge, { backgroundColor: isDarkMode ? 'rgba(60, 60, 70, 0.7)' : 'rgba(208, 0, 0, 0.1)' }]}>
            <Text style={[styles.categoryText, { color: colors.primary }]}>{product.category}</Text>
          </View>
          
          <Text style={[styles.productTitle, { color: textColor }]}>
            {product.title}
          </Text>
          
          <Text style={[styles.authorText, { color: secondaryText }]}>
            by {product.author}
          </Text>
          
          <Text style={[styles.publisherText, { color: secondaryText }]}>
            {product.publisher}
          </Text>
          
          {renderRatingStars()}
          
          <View style={styles.priceContainer}>
            <Text style={[styles.priceText, { color: colors.primary }]}>
              ${product.price.toFixed(2)}
            </Text>
            {product.inStock ? (
              <Text style={[styles.inStockText, { color: '#4CAF50' }]}>
                <MaterialIcons name="check-circle" size={16} /> Còn hàng
              </Text>
            ) : (
              <Text style={[styles.outOfStockText, { color: '#F44336' }]}>
                <MaterialIcons name="cancel" size={16} /> Hết hàng
              </Text>
            )}
          </View>

          {/* Quantity Selector */}
          <View style={[styles.quantityWrapper, { borderColor }]}>
            <View style={styles.quantitySectionLeft}>
              <Text style={[styles.quantityLabel, { color: textColor }]}>Số lượng:</Text>
              <View style={styles.quantityContainer}>
                <TouchableOpacity
                  style={[styles.quantityButton, { backgroundColor: isDarkMode ? 'rgba(50, 50, 55, 0.8)' : 'rgba(240, 240, 240, 0.8)' }]}
                  onPress={decreaseQuantity}
                >
                  <AntDesign name="minus" size={16} color={textColor} />
                </TouchableOpacity>
                
                <Text style={[styles.quantityText, { color: textColor }]}>
                  {quantity}
                </Text>
                
                <TouchableOpacity
                  style={[styles.quantityButton, { backgroundColor: isDarkMode ? 'rgba(50, 50, 55, 0.8)' : 'rgba(240, 240, 240, 0.8)' }]}
                  onPress={increaseQuantity}
                >
                  <AntDesign name="plus" size={16} color={textColor} />
                </TouchableOpacity>
              </View>
            </View>
            
            <TouchableOpacity
              style={[
                styles.addToCartButton,
                { backgroundColor: product.inStock ? colors.primary : '#ccc' }
              ]}
              onPress={handleAddToCart}
              disabled={!product.inStock}
            >
              <Feather name="shopping-cart" size={18} color={colors.onPrimary} style={styles.buttonIcon} />
              <Text style={[styles.buttonText, { color: colors.onPrimary }]}>
                {product.inStock ? 'Thêm vào giỏ hàng' : 'Hết hàng'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Description */}
        <View style={[styles.sectionContainer, { backgroundColor: cardBackground }]}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>
            Mô tả
          </Text>
          <Text style={[styles.descriptionText, { color: secondaryText }]}>
            {product.description}
          </Text>
        </View>
        
        {/* Details */}
        <View style={[styles.sectionContainer, { backgroundColor: cardBackground }]}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>
            Chi tiết sản phẩm
          </Text>
          
          {product.details.map((detail, index) => (
            <View key={index} style={styles.detailItem}>
              <MaterialIcons name="check-circle" size={16} color={colors.primary} style={styles.checkIcon} />
              <Text style={[styles.detailText, { color: secondaryText }]}>
                {detail}
              </Text>
            </View>
          ))}
        </View>

        {/* Extra space for the floating button */}
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cartButton: {
    padding: 5,
    marginRight: 5,
  },
  imageGalleryContainer: {
    height: 300,
    width: '100%',
  },
  imageContainer: {
    width: ITEM_WIDTH,
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
  },
  productImage: {
    width: '80%',
    height: '80%',
  },
  imageIndicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    position: 'absolute',
    bottom: 20,
    width: '100%',
  },
  imageIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  infoContainer: {
    padding: 15,
    marginTop: 10,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#e0f7fa',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 15,
    marginBottom: 10,
  },
  categoryText: {
    color: '#00838f',
    fontSize: 12,
    fontWeight: '600',
  },
  productTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  authorText: {
    fontSize: 16,
    marginBottom: 3,
  },
  publisherText: {
    fontSize: 14,
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  ratingText: {
    marginLeft: 5,
    fontSize: 14,
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  priceText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  inStockText: {
    fontSize: 14,
    fontWeight: '500',
    flexDirection: 'row',
    alignItems: 'center',
  },
  outOfStockText: {
    fontSize: 14,
    fontWeight: '500',
  },
  quantityWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    borderTopWidth: 0.5,
  },
  quantitySectionLeft: {
    flexDirection: 'column',
  },
  quantityLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    fontSize: 16,
    fontWeight: '600',
    marginHorizontal: 12,
  },
  addToCartButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    elevation: 2,
  },
  sectionContainer: {
    padding: 15,
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
  },
  descriptionText: {
    fontSize: 14,
    lineHeight: 22,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  checkIcon: {
    marginRight: 8,
    marginTop: 3,
  },
  detailText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  floatingButton: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 15,
    borderRadius: 10,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
});

export default ProductDetailScreen; 