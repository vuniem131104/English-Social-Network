import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  SafeAreaView,
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Dimensions,
  Alert
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useTheme, useNavigation } from '@react-navigation/native';
import { Feather, Ionicons, MaterialCommunityIcons, FontAwesome } from '@expo/vector-icons';
import { addToCart } from '../../redux/actions/cartActions';
import { LinearGradient } from 'expo-linear-gradient';

const ShopScreen = () => {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const dispatch = useDispatch();
  const isDarkMode = useSelector(state => state.theme.isDarkMode);
  const cartItems = useSelector(state => state.cart.items);

  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('Tất cả');
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  
  // Define dark mode specific colors
  const backgroundColor = isDarkMode ? '#121212' : colors.surface;
  const cardBackground = isDarkMode ? '#1e1e1e' : colors.surfaceContainerLow;
  const borderColor = isDarkMode ? 'rgba(160, 0, 0, 0.3)' : 'rgba(160, 0, 0, 0.2)';
  const textColor = isDarkMode ? '#ffffff' : colors.onSurface;
  const secondaryText = isDarkMode ? '#c0c0c0' : '#777';
  const inputBackground = isDarkMode ? '#2a2a2a' : '#f5f5f5';
  
  // Mock data for products
  useEffect(() => {
    // Simulate API call to fetch products
    setTimeout(() => {
      const mockProducts = [
        // Grammar Books
        {
          id: '1',
          title: 'Ngữ pháp tiếng Anh nâng cao',
          author: 'Cambridge University Press',
          image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQlZx4-kqelmQgO6Uk75-L9YCStFuweIutm3g&s',
          price: 39.99,
          category: 'Ngữ pháp',
          featured: true,
          rating: 4.8,
          format: 'Bìa cứng',
          description: 'Hướng dẫn toàn diện về các quy tắc ngữ pháp tiếng Anh nâng cao, ngoại lệ và ví dụ sử dụng thực tế.',
          reviews: 1248,
          publisher: 'Cambridge University Press',
          details: [
            'Hoàn hảo cho tự học',
            'Bao gồm 145 đơn vị giảng dạy ngữ pháp',
            'Chứa các ví dụ thực tế của tiếng Anh hiện đại',
            'Đi kèm phiên bản sách điện tử tương tác'
          ]
        },
        {
          id: '2',
          title: 'Sử dụng ngữ pháp tiếng Anh',
          author: 'Cambridge University Press',
          image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRVtDgu7EuH99KOnoa_eFIppGBYMJc6HyDS7A&s',
          price: 32.50,
          category: 'Ngữ pháp',
          featured: false,
          rating: 4.9,
          format: 'Bìa mềm',
          description: 'Tài liệu tham khảo ngữ pháp phổ biến nhất cho người học tiếng Anh trung cấp, với giải thích rõ ràng và nhiều bài tập thực hành.',
          reviews: 1248,
          publisher: 'Cambridge University Press',
          details: [
            'Hoàn hảo cho tự học',
            'Bao gồm 145 đơn vị giảng dạy ngữ pháp',
            'Chứa các ví dụ thực tế của tiếng Anh hiện đại',
            'Đi kèm phiên bản sách điện tử tương tác'
          ]
        },
        
        // Vocabulary Books
        {
          id: '3',
          title: 'Xây dựng vốn từ tiếng Anh',
          author: 'Oxford Learning',
          image: 'https://images.booksense.com/images/791/229/9798571229791.jpg',
          price: 24.95,
          category: 'Từ vựng',
          featured: true,
          rating: 4.7,
          format: 'Bìa mềm',
          description: 'Mở rộng vốn từ vựng của bạn với hơn 2000 từ thiết yếu được sắp xếp theo chủ đề và tần suất sử dụng.',
          reviews: 962,
          publisher: 'Oxford University Press',
          details: [
            'Chứa hơn 185.000 từ, cụm từ và nghĩa',
            'Bao gồm hơn 700 từ và nghĩa mới',
            'Tính năng phát âm bằng giọng thật',
            'Cung cấp ví dụ chi tiết về cách sử dụng từ'
          ]
        },
        {
          id: '4',
          title: 'Cách dùng kết hợp từ tiếng Anh',
          author: 'Cambridge University Press',
          image: 'https://st.ielts-fighter.com/src/ielts-fighter/2019/01/09/English-Collocation-in-use-advance.jpg',
          price: 29.99,
          category: 'Từ vựng',
          featured: false,
          rating: 4.6,
          format: 'Bìa mềm',
          description: 'Học cách kết hợp từ tự nhiên để làm cho tiếng Anh của bạn nghe trôi chảy và giống người bản xứ hơn.',
          reviews: 962,
          publisher: 'Cambridge University Press',
          details: [
            'Chứa hơn 185.000 từ, cụm từ và nghĩa',
            'Bao gồm hơn 700 từ và nghĩa mới',
            'Tính năng phát âm bằng giọng thật',
            'Cung cấp ví dụ chi tiết về cách sử dụng từ'
          ]
        },
        
        // Exam Preparation Books
        {
          id: '5',
          title: 'Tài liệu luyện thi IELTS chính thức',
          author: 'Cambridge ESOL',
          image: 'https://ieltsmb.com/wp-content/uploads/2017/05/ieltspreparationbooks.png',
          price: 45.00,
          category: 'Luyện thi',
          featured: true,
          rating: 4.9,
          format: 'Sách + CD',
          description: 'Tài liệu luyện thi chính thức cho kỳ thi IELTS, với các bài kiểm tra xác thực và hướng dẫn từ chuyên gia.',
          reviews: 782,
          publisher: 'Cambridge University Press',
          details: [
            'Chứa 8 bài kiểm tra luyện tập đầy đủ',
            'Bao gồm hướng dẫn chi tiết cho từng phần thi',
            'Cung cấp mẫu câu trả lời với nhận xét của giám khảo',
            'Đi kèm âm thanh tải về cho các bài kiểm tra nghe'
          ]
        },
        {
          id: '6',
          title: 'TOEFL iBT Prep Plus',
          author: 'Kaplan Test Prep',
          image: 'https://m.media-amazon.com/images/I/71RmMOnY3hL._AC_UF1000,1000_QL80_.jpg',
          price: 37.99,
          category: 'Luyện thi',
          featured: false,
          rating: 4.7,
          format: 'Bìa mềm',
          description: 'Chuẩn bị toàn diện cho bài kiểm tra TOEFL iBT với 5 bài kiểm tra thực hành và tài nguyên trực tuyến.',
          reviews: 653,
          publisher: 'ETS',
          details: [
            'Chứa 5 bài kiểm tra TOEFL iBT đầy đủ và chính thức',
            'Bao gồm thông tin chấm điểm chi tiết',
            'Tính năng mẹo và chiến lược từ người tạo bài kiểm tra',
            'Cung cấp mẫu câu trả lời với giải thích điểm số'
          ]
        },
        
        // Online Courses
        {
          id: '7',
          title: 'Giao tiếp tiếng Anh thương mại',
          author: 'Professional Language Institute',
          image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSxu8UUjSvLBWXWoDjVKNVPJUSNOxFCMglDFg&s',
          price: 49.99,
          category: 'Khóa học',
          featured: true,
          rating: 4.8,
          format: 'Truy cập trực tuyến',
          description: 'Thông thạo tiếng Anh chuyên nghiệp cho bối cảnh kinh doanh với các bài học video, bài tập và tình huống thực tế.',
          reviews: 328,
          publisher: 'Macmillan Education',
          details: [
            'Truy cập trọn đời vào hơn 60 bài học video',
            'Bao gồm từ vựng và cụm từ kinh doanh',
            'Tính năng viết email và báo cáo',
            'Cung cấp kỹ năng thuyết trình và đàm phán'
          ]
        },
        {
          id: '8',
          title: 'Khóa học phát âm tiếng Anh',
          author: 'Accent Academy',
          image: 'https://i.ytimg.com/vi/y_AaivpYxHw/maxresdefault.jpg',
          price: 34.99,
          category: 'Khóa học',
          featured: false,
          rating: 4.7,
          format: 'Truy cập trực tuyến',
          description: 'Cải thiện phát âm tiếng Anh và giảm giọng địa phương với các kỹ thuật đào tạo giọng nói chuyên nghiệp.',
          reviews: 276,
          publisher: 'Rachel\'s English Academy',
          details: [
            'Hơn 50 giờ hướng dẫn video',
            'Bao gồm tất cả các âm nguyên âm và phụ âm tiếng Anh',
            'Bao gồm đào tạo về nhịp điệu, trọng âm và ngữ điệu',
            'Tính năng phân tích ghi âm trước/sau'
          ]
        }
      ];
      
      setProducts(mockProducts);
      setFilteredProducts(mockProducts);
      setFeaturedProducts(mockProducts.filter(product => product.featured));
      setLoading(false);
    }, 1000);
  }, []);
  
  // Categories
  const categories = [
    { id: 'all', name: 'Tất cả' },
    { id: 'grammar', name: 'Ngữ pháp' },
    { id: 'vocabulary', name: 'Từ vựng' },
    { id: 'exam', name: 'Luyện thi' },
    { id: 'courses', name: 'Khóa học' }
  ];
  
  // Filter products based on category and search query
  useEffect(() => {
    let filtered = [...products];
    
    // Filter by category
    if (activeCategory !== 'Tất cả') {
      filtered = filtered.filter(product => product.category === activeCategory);
    }
    
    // Filter by search query
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        product => 
          product.title.toLowerCase().includes(query) || 
          product.author.toLowerCase().includes(query) ||
          product.description.toLowerCase().includes(query)
      );
    }
    
    setFilteredProducts(filtered);
  }, [activeCategory, searchQuery, products]);
  
  const getFeaturedProducts = () => {
    return products.filter(product => product.featured);
  };
  
  const handleAddToCart = (product) => {
    dispatch(addToCart(product));
    Alert.alert(
      "Đã thêm vào giỏ hàng",
      `${product.title} đã được thêm vào giỏ hàng của bạn.`,
      [{ text: "OK" }]
    );
  };
  
  const handleProductPress = (product) => {
    navigation.navigate('ProductDetail', { 
      product: {
        ...product,
        // Ensure required fields are present
        images: product.images || [product.image],
        details: product.details || [
          `Category: ${product.category}`,
          `Author: ${product.author}`,
          `Publisher: ${product.publisher || 'Unknown'}`
        ]
      } 
    });
  };
  
  const renderCategoryItem = ({ item }) => (
    <TouchableOpacity 
      style={[
        styles.categoryItem, 
        activeCategory === item.name ? { 
          backgroundColor: colors.primary,
          borderColor: colors.primary
        } : {
          backgroundColor: isDarkMode ? 'rgba(50, 50, 55, 0.8)' : 'rgba(240, 240, 240, 0.8)',
          borderColor: isDarkMode ? 'rgba(80, 80, 90, 0.8)' : '#ddd'
        }
      ]}
      onPress={() => setActiveCategory(item.name)}
    >
      <Text 
        style={[
          styles.categoryText, 
          { color: activeCategory === item.name ? 'white' : textColor }
        ]}
      >
        {item.name}
      </Text>
    </TouchableOpacity>
  );
  
  const renderFeaturedProduct = ({ item }) => (
    <TouchableOpacity 
      style={[styles.featuredItem, { backgroundColor: cardBackground, borderColor }]}
      onPress={() => navigation.navigate('ProductDetail', { product: item })}
    >
      <View style={styles.featuredImageContainer}>
        <Image source={{ uri: item.image }} style={styles.featuredImage} />
        <View style={styles.featuredBadge}>
          <Text style={styles.featuredBadgeText}>Nổi bật</Text>
        </View>
      </View>
      
      <View style={styles.featuredContent}>
        <Text style={[styles.featuredTitle, { color: textColor }]} numberOfLines={2}>{item.title}</Text>
        <Text style={[styles.featuredAuthor, { color: secondaryText }]}>{item.author}</Text>
        
        <View style={styles.featuredFooter}>
          <Text style={[styles.featuredPrice, { color: colors.primary }]}>${item.price.toFixed(2)}</Text>
          
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={14} color="#FFD700" />
            <Text style={[styles.ratingText, { color: secondaryText }]}>{item.rating}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
  
  const renderProductItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.productItem,
        { backgroundColor: isDarkMode ? '#1e1e1e' : '#fff' }
      ]}
      onPress={() => handleProductPress(item)}
    >
      <Image source={{ uri: item.image }} style={styles.productImage} />
      
      <View style={styles.productContent}>
        <Text style={[styles.productTitle, { color: textColor }]} numberOfLines={2}>{item.title}</Text>
        <Text style={[styles.productAuthor, { color: secondaryText }]} numberOfLines={1}>{item.author}</Text>
        
        <View style={styles.productMeta}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{item.category}</Text>
          </View>
          <Text style={[styles.productFormat, { color: secondaryText }]}>{item.format}</Text>
        </View>
        
        <View style={styles.productFooter}>
          <Text style={[styles.productPrice, { color: colors.primary }]}>${item.price.toFixed(2)}</Text>
          
          <TouchableOpacity 
            style={[styles.addToCartBtn, { backgroundColor: colors.primary }]}
            onPress={() => handleAddToCart(item)}
          >
            <Feather name="shopping-cart" size={16} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      {/* Custom header for the shop screen */}
      <View style={[styles.header, { backgroundColor: cardBackground, borderBottomColor: borderColor }]}>
        <Text style={[styles.headerTitle, { color: textColor }]}>Cửa hàng học tiếng Anh</Text>
      </View>
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: secondaryText }]}>Đang tải sản phẩm...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredProducts}
          renderItem={renderProductItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.productList}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
          ListHeaderComponent={
            <>
              {/* Search Bar */}
              <View style={[styles.searchContainer, { 
                backgroundColor: cardBackground,
                borderColor: isDarkMode ? 'rgba(80, 80, 90, 0.2)' : 'rgba(0, 0, 0, 0.05)',
                shadowColor: isDarkMode ? '#000' : 'rgba(0, 0, 0, 0.1)'
              }]}>
                <View style={[styles.searchInputWrapper, { 
                  backgroundColor: inputBackground,
                  borderColor: isDarkMode ? 'rgba(160, 0, 0, 0.2)' : 'rgba(0, 0, 0, 0.05)',
                  borderWidth: 1
                }]}>
                  <Feather name="search" size={18} color={colors.primary} style={styles.searchIcon} />
                  <TextInput
                    style={[styles.searchInput, { color: textColor }]}
                    placeholder="Tìm sách, khóa học..."
                    placeholderTextColor={secondaryText}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                  />
                  {searchQuery !== '' && (
                    <TouchableOpacity 
                      style={styles.clearButton}
                      onPress={() => setSearchQuery('')}
                    >
                      <Feather name="x" size={16} color={colors.primary} />
                    </TouchableOpacity>
                  )}
                </View>
                
                <TouchableOpacity
                  style={[styles.cartButtonInSearch, {
                    backgroundColor: colors.primary,
                    shadowColor: isDarkMode ? 'rgba(0, 0, 0, 0.3)' : 'rgba(160, 0, 0, 0.3)',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.3,
                    shadowRadius: 2,
                    elevation: 3
                  }]}
                  onPress={() => navigation.navigate('Cart')}
                >
                  <Feather name="shopping-cart" size={18} color="#fff" />
                  {cartItems.length > 0 && (
                    <View style={styles.miniCartBadge}>
                      <Text style={styles.miniCartBadgeText}>
                        {cartItems.reduce((sum, item) => sum + item.quantity, 0)}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>
              
              {/* Categories */}
              <FlatList
                data={categories}
                renderItem={renderCategoryItem}
                keyExtractor={item => item.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.categoryList}
              />
              
              {/* Featured Section */}
              {activeCategory === 'Tất cả' && (
                <View style={styles.sectionContainer}>
                  <View style={styles.sectionHeader}>
                    <Text style={[styles.sectionTitle, { color: textColor }]}>Tài liệu nổi bật</Text>
                    <TouchableOpacity>
                      <Text style={[styles.seeAllText, { color: colors.primary }]}>Xem tất cả</Text>
                    </TouchableOpacity>
                  </View>
                  
                  <FlatList
                    data={featuredProducts}
                    renderItem={renderFeaturedProduct}
                    keyExtractor={item => `featured-${item.id}`}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.featuredList}
                  />
                </View>
              )}
              
              {/* All Products Section */}
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: textColor }]}>
                  {activeCategory === 'Tất cả' ? 'Tất cả tài liệu' : activeCategory}
                </Text>
                <Text style={[styles.resultCount, { color: secondaryText }]}>
                  {filteredProducts.length} {filteredProducts.length === 1 ? 'kết quả' : 'kết quả'}
                </Text>
              </View>
            </>
          }
          ListEmptyComponent={
            <View style={styles.emptyResults}>
              <FontAwesome name="search" size={60} color={secondaryText} />
              <Text style={[styles.emptyTitle, { color: textColor }]}>Không tìm thấy kết quả</Text>
              <Text style={[styles.emptyText, { color: secondaryText }]}>
                Chúng tôi không tìm thấy sản phẩm nào phù hợp với tìm kiếm của bạn.
              </Text>
              <TouchableOpacity onPress={() => {
                setSearchQuery('');
                setActiveCategory('Tất cả');
              }}>
                <Text style={[styles.resetText, { color: colors.primary }]}>Đặt lại bộ lọc</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}
      
      {/* Shopping Cart Button */}
      {/* <TouchableOpacity 
        style={[styles.cartButton, { backgroundColor: colors.primary }]}
        onPress={() => navigation.navigate('Cart')}
      >
        <Feather name="shopping-cart" size={22} color="white" />
        {cartItems.length > 0 && (
          <View style={styles.cartBadge}>
            <Text style={styles.cartBadgeText}>
              {cartItems.reduce((sum, item) => sum + item.quantity, 0)}
            </Text>
          </View>
        )}
      </TouchableOpacity> */}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: 70,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 15,
    borderRadius: 16,
    padding: 12,
    borderWidth: 0.5,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  searchInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    height: 45,
    paddingHorizontal: 12,
    marginRight: 12,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontFamily: 'Inter-Regular',
    fontSize: 15,
    paddingVertical: 8,
  },
  clearButton: {
    padding: 6,
    borderRadius: 15,
    backgroundColor: 'rgba(150, 150, 150, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartButtonInSearch: {
    width: 45,
    height: 45,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  miniCartBadge: {
    position: 'absolute',
    top: 8,
    right: 5,
    minWidth: 13,
    height: 13,
    borderRadius: 8,
    backgroundColor: '#ffc107',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  miniCartBadgeText: {
    color: '#000',
    fontSize: 10,
    fontWeight: 'bold',
  },
  categoryList: {
    paddingHorizontal: 10,
    marginBottom: 15,
  },
  categoryItem: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 5,
    borderRadius: 20,
    borderWidth: 1,
  },
  categoryText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
  },
  sectionContainer: {
    marginVertical: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    marginVertical: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
  },
  seeAllText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  resultCount: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  featuredList: {
    paddingHorizontal: 15,
  },
  featuredItem: {
    width: 220,
    borderRadius: 12,
    marginRight: 15,
    borderWidth: 0.5,
    overflow: 'hidden',
  },
  featuredImageContainer: {
    position: 'relative',
  },
  featuredImage: {
    width: '100%',
    height: 160,
    resizeMode: 'cover',
  },
  featuredBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  featuredBadgeText: {
    color: 'white',
    fontSize: 10,
    fontFamily: 'Inter-Medium',
  },
  featuredContent: {
    padding: 12,
  },
  featuredTitle: {
    fontSize: 15,
    fontFamily: 'Inter-Bold',
    marginBottom: 4,
    height: 40,
  },
  featuredAuthor: {
    fontSize: 13,
    fontFamily: 'Inter-Regular',
    marginBottom: 8,
  },
  featuredFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  featuredPrice: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    marginLeft: 4,
  },
  productList: {
    padding: 15,
  },
  columnWrapper: {
    justifyContent: 'space-between',
  },
  productItem: {
    width: '48%',
    borderRadius: 12,
    marginBottom: 15,
    borderWidth: 0.5,
    overflow: 'hidden',
  },
  productImage: {
    width: '100%',
    height: 140,
    resizeMode: 'cover',
  },
  productContent: {
    padding: 10,
  },
  productTitle: {
    fontSize: 14,
    fontFamily: 'Inter-Bold',
    height: 40,
    marginBottom: 4,
  },
  productAuthor: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    marginBottom: 6,
  },
  productMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  badge: {
    backgroundColor: '#007bff',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    marginRight: 8,
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontFamily: 'Inter-Medium',
  },
  productFormat: {
    fontSize: 11,
    textAlign: 'right',
    fontFamily: 'Inter-Regular',
  },
  productFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productPrice: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
  },
  addToCartBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyResults: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
    marginTop: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    marginTop: 15,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    marginBottom: 20,
  },
  resetText: {
    fontSize: 15,
    fontFamily: 'Inter-SemiBold',
  },
  cartButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  cartBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: 'red',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  cartBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  header: {
    padding: 15,
    borderBottomWidth: 0.5,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    textAlign: 'center',
  },
});

export default ShopScreen; 