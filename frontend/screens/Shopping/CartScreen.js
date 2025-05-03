import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  ScrollView
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigation, useTheme } from '@react-navigation/native';
import { Ionicons, AntDesign, MaterialIcons } from '@expo/vector-icons';
import { removeFromCart, updateQuantity, clearCart } from '../../redux/actions/cartActions';

const CartScreen = () => {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const cartItems = useSelector(state => state.cart.items);
  const cartTotal = useSelector(state => state.cart.total);
  const isDarkMode = useSelector(state => state.theme.isDarkMode);
  
  const [isProcessing, setIsProcessing] = useState(false);

  // Define theme-consistent colors
  const backgroundColor = isDarkMode ? '#121212' : colors.surface;
  const cardBackground = isDarkMode ? '#1e1e1e' : colors.surfaceContainerLow;
  const borderColor = isDarkMode ? 'rgba(160, 0, 0, 0.3)' : 'rgba(160, 0, 0, 0.2)';
  const textColor = isDarkMode ? '#ffffff' : colors.text;
  const secondaryText = isDarkMode ? '#c0c0c0' : '#777';

  const handleRemoveItem = (id) => {
    Alert.alert(
      'Xóa sản phẩm',
      'Bạn có chắc chắn muốn xóa sản phẩm này khỏi giỏ hàng?',
      [
        { text: 'Hủy', style: 'cancel' },
        { 
          text: 'Xóa', 
          onPress: () => dispatch(removeFromCart(id)),
          style: 'destructive'
        }
      ]
    );
  };

  const handleUpdateQuantity = (id, quantity, currentQuantity) => {
    const newQuantity = currentQuantity + quantity;
    
    if (newQuantity < 1) {
      handleRemoveItem(id);
      return;
    }
    
    dispatch(updateQuantity(id, newQuantity));
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      Alert.alert('Giỏ hàng trống', 'Vui lòng thêm sản phẩm vào giỏ hàng trước khi thanh toán.');
      return;
    }
    
    setIsProcessing(true);
    
    // Simulate processing delay
    setTimeout(() => {
      setIsProcessing(false);
      navigation.navigate('OrderConfirmation', { 
        orderTotal: cartTotal, 
        items: cartItems 
      });
      dispatch(clearCart());
    }, 1500);
  };

  const renderItem = ({ item }) => (
    <View style={[
      styles.cartItem, 
      { 
        backgroundColor: cardBackground,
        borderColor: borderColor,
        borderWidth: 1
      }
    ]}>
      <View style={styles.itemImage}>
        {item.image ? (
          <Image 
            source={{ uri: item.image }} 
            style={[styles.actualImage]}
            onError={() => console.log('Image loading error')}
          />
        ) : (
          <View style={styles.noImageContainer}>
            <Text style={styles.noImageText}>No Image</Text>
          </View>
        )}
      </View>
      
      <View style={styles.itemDetails}>
        <Text style={[styles.itemTitle, { color: textColor }]}>
          {item.title}
        </Text>
        <Text style={[styles.itemAuthor, { color: secondaryText }]}>
          by {item.author}
        </Text>
        <Text style={[styles.itemPrice, { color: colors.primary }]}>
          ${item.price.toFixed(2)}
        </Text>
        
        <View style={styles.quantityContainer}>
          <TouchableOpacity 
            onPress={() => handleUpdateQuantity(item.id, -1, item.quantity)}
            style={[styles.quantityButton, { backgroundColor: isDarkMode ? 'rgba(160, 0, 0, 0.1)' : 'rgba(208, 0, 0, 0.05)' }]}
          >
            <AntDesign name="minuscircleo" size={20} color={colors.primary} />
          </TouchableOpacity>
          
          <Text style={[styles.quantityText, { color: textColor }]}>
            {item.quantity}
          </Text>
          
          <TouchableOpacity 
            onPress={() => handleUpdateQuantity(item.id, 1, item.quantity)}
            style={[styles.quantityButton, { backgroundColor: isDarkMode ? 'rgba(160, 0, 0, 0.1)' : 'rgba(208, 0, 0, 0.05)' }]}
          >
            <AntDesign name="pluscircleo" size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </View>
      
      <TouchableOpacity 
        style={styles.removeButton}
        onPress={() => handleRemoveItem(item.id)}
      >
        <MaterialIcons name="delete-outline" size={24} color={colors.primary} />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={[
      styles.container, 
      { backgroundColor: backgroundColor }
    ]}>
      <View style={[styles.header, { 
        backgroundColor: cardBackground,
        borderBottomColor: borderColor
      }]}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={textColor} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: textColor }]}>Giỏ hàng</Text>
        <View style={styles.placeholder} />
      </View>
      
      {cartItems.length > 0 ? (
        <>
          <FlatList
            data={cartItems}
            renderItem={renderItem}
            keyExtractor={item => item.id.toString()}
            contentContainerStyle={styles.listContainer}
          />
          
          <View style={[
            styles.summaryContainer, 
            { 
              backgroundColor: cardBackground,
              borderTopColor: borderColor,
              borderLeftColor: borderColor,
              borderRightColor: borderColor,
              borderLeftWidth: 1,
              borderRightWidth: 1
            }
          ]}>
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: secondaryText }]}>
                Tạm tính ({cartItems.reduce((acc, item) => acc + item.quantity, 0)} sản phẩm)
              </Text>
              <Text style={[styles.summaryValue, { color: textColor }]}>
                ${cartTotal.toFixed(2)}
              </Text>
            </View>
            
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: secondaryText }]}>
                Phí vận chuyển
              </Text>
              <Text style={[styles.summaryValue, { color: textColor }]}>
                $5.99
              </Text>
            </View>
            
            <View style={[styles.divider, { backgroundColor: borderColor }]} />
            
            <View style={styles.summaryRow}>
              <Text style={[styles.totalLabel, { color: textColor }]}>
                Tổng cộng
              </Text>
              <Text style={[styles.totalValue, { color: colors.primary }]}>
                ${(cartTotal + 5.99).toFixed(2)}
              </Text>
            </View>
            
            <TouchableOpacity 
              style={[
                styles.checkoutButton, 
                { backgroundColor: colors.primary },
                isProcessing && { opacity: 0.7 }
              ]}
              onPress={handleCheckout}
              disabled={isProcessing || cartItems.length === 0}
            >
              {isProcessing ? (
                <Text style={styles.checkoutButtonText}>Đang xử lý...</Text>
              ) : (
                <Text style={styles.checkoutButtonText}>Tiến hành thanh toán</Text>
              )}
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <View style={styles.emptyCartContainer}>
          <Ionicons name="cart-outline" size={80} color={colors.primary} />
          <Text style={[styles.emptyCartText, { color: textColor }]}>
            Giỏ hàng của bạn đang trống
          </Text>
          <TouchableOpacity 
            style={[styles.continueShopping, { 
              backgroundColor: isDarkMode ? 'rgba(160, 0, 0, 0.1)' : 'rgba(208, 0, 0, 0.05)',
              borderColor: colors.primary,
              borderWidth: 1,
              borderRadius: 8,
              paddingHorizontal: 16
            }]}
            onPress={() => navigation.navigate('Shop')}
          >
            <Text style={[
              styles.continueShoppingText, 
              { color: colors.primary }
            ]}>
              Tiếp tục mua sắm
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: 80,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  placeholder: {
    width: 40,
  },
  listContainer: {
    padding: 16,
  },
  cartItem: {
    flexDirection: 'row',
    padding: 12,
    marginBottom: 12,
    borderRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  itemImage: {
    width: 80,
    height: 120,
    borderRadius: 4,
    marginRight: 12,
    backgroundColor: '#f0f0f0',
    overflow: 'hidden',
  },
  actualImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  noImageContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e0e0e0',
  },
  noImageText: {
    color: '#666',
    fontSize: 12,
    fontWeight: 'bold',
  },
  itemDetails: {
    flex: 1,
    justifyContent: 'space-between',
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  itemAuthor: {
    fontSize: 14,
    marginBottom: 4,
    opacity: 0.8,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    padding: 6,
  },
  quantityText: {
    paddingHorizontal: 12,
    fontSize: 16,
    fontWeight: 'bold',
  },
  removeButton: {
    padding: 8,
    alignSelf: 'flex-start',
  },
  summaryContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.1)',
    marginVertical: 8,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  checkoutButton: {
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  checkoutButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  emptyCartContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  emptyCartText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  continueShopping: {
    marginTop: 16,
    padding: 8,
  },
  continueShoppingText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default CartScreen; 