import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  ScrollView
} from 'react-native';
import { useSelector } from 'react-redux';
import { useTheme, useNavigation } from '@react-navigation/native';
import { Feather, Ionicons, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import NavbarTop from '../../components/header/NavbarTop';

const ShoppingCartScreen = () => {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const isDarkMode = useSelector(state => state.theme.isDarkMode);
  
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [discount, setDiscount] = useState(0);
  
  // Define dark mode specific colors
  const backgroundColor = isDarkMode ? '#121212' : colors.surfaceContainer;
  const cardBackground = isDarkMode ? 'rgba(32, 32, 36, 0.95)' : colors.surfaceContainerLow;
  const borderColor = isDarkMode ? 'rgba(70, 70, 80, 0.7)' : 'rgba(150, 150, 150, 0.3)';
  const textColor = isDarkMode ? 'rgba(220, 220, 225, 0.9)' : colors.onSurface;
  const secondaryText = isDarkMode ? '#aaa' : '#777';
  
  // Mock data for cart items
  useEffect(() => {
    // Simulate API call to fetch cart items
    setTimeout(() => {
      setCartItems([
        {
          id: '1',
          title: 'Advanced English Grammar in Use',
          author: 'Martin Hewings',
          price: 29.99,
          image: 'https://m.media-amazon.com/images/I/41mNh-hE0ZL._SY445_SX342_.jpg',
          quantity: 1,
          category: 'Grammar Books'
        },
        {
          id: '2',
          title: 'Oxford English Vocabulary Builder',
          author: 'Oxford Press',
          price: 24.99,
          image: 'https://m.media-amazon.com/images/I/81QRyjf9tML._SY466_.jpg',
          quantity: 2,
          category: 'Vocabulary Books'
        }
      ]);
      setLoading(false);
    }, 1000);
  }, []);
  
  // Calculate subtotal, shipping, and total
  const calculateSubtotal = () => {
    return cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };
  
  const subtotal = calculateSubtotal();
  const shipping = subtotal > 0 ? 5.99 : 0;
  const tax = subtotal * 0.1; // 10% tax
  const discountAmount = couponApplied ? subtotal * (discount / 100) : 0;
  const total = subtotal + shipping + tax - discountAmount;
  
  const handleQuantityChange = (id, change) => {
    setCartItems(prevItems => 
      prevItems.map(item => {
        if (item.id === id) {
          const newQuantity = Math.max(1, item.quantity + change);
          return { ...item, quantity: newQuantity };
        }
        return item;
      })
    );
  };
  
  const handleRemoveItem = (id) => {
    Alert.alert(
      "Remove Item",
      "Are you sure you want to remove this item from your cart?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        { 
          text: "Remove", 
          onPress: () => {
            setCartItems(prevItems => prevItems.filter(item => item.id !== id));
          },
          style: "destructive"
        }
      ]
    );
  };
  
  const handleApplyCoupon = () => {
    // Mock coupon code validation
    if (couponCode.toLowerCase() === 'english20') {
      setCouponApplied(true);
      setDiscount(20);
      Alert.alert("Success", "Coupon applied! 20% discount");
    } else {
      Alert.alert("Invalid Coupon", "The coupon code you entered is invalid or expired.");
    }
    setCouponCode('');
  };
  
  const handleCheckout = () => {
    if (cartItems.length === 0) {
      Alert.alert("Empty Cart", "Please add items to your cart before proceeding to checkout.");
      return;
    }
    
    // Navigate to checkout screen
    navigation.navigate('Checkout', { 
      cartItems, 
      subtotal, 
      shipping, 
      tax,
      discount: discountAmount, 
      total 
    });
  };
  
  const handleContinueShopping = () => {
    navigation.navigate('Shop');
  };
  
  const renderCartItem = ({ item }) => (
    <View style={[styles.cartItem, { backgroundColor: cardBackground, borderColor }]}>
      <Image source={{ uri: item.image }} style={styles.itemImage} />
      
      <View style={styles.itemDetails}>
        <View style={styles.itemHeader}>
          <Text style={[styles.itemTitle, { color: textColor }]}>{item.title}</Text>
          <TouchableOpacity onPress={() => handleRemoveItem(item.id)}>
            <Feather name="trash-2" size={18} color="#ff3b30" />
          </TouchableOpacity>
        </View>
        
        <Text style={[styles.itemAuthor, { color: secondaryText }]}>{item.author}</Text>
        
        <View style={styles.itemMeta}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{item.category}</Text>
          </View>
        </View>
        
        <View style={styles.itemFooter}>
          <Text style={[styles.itemPrice, { color: colors.primary }]}>${(item.price * item.quantity).toFixed(2)}</Text>
          
          <View style={styles.quantityControl}>
            <TouchableOpacity 
              style={[styles.quantityBtn, { borderColor }]} 
              onPress={() => handleQuantityChange(item.id, -1)}
            >
              <Feather name="minus" size={16} color={secondaryText} />
            </TouchableOpacity>
            
            <Text style={[styles.quantityText, { color: textColor }]}>{item.quantity}</Text>
            
            <TouchableOpacity 
              style={[styles.quantityBtn, { borderColor }]} 
              onPress={() => handleQuantityChange(item.id, 1)}
            >
              <Feather name="plus" size={16} color={secondaryText} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
  
  const renderEmptyCart = () => (
    <View style={styles.emptyCart}>
      <MaterialCommunityIcons name="cart-outline" size={80} color={secondaryText} />
      <Text style={[styles.emptyCartTitle, { color: textColor }]}>Your cart is empty</Text>
      <Text style={[styles.emptyCartText, { color: secondaryText }]}>
        Looks like you haven't added any books or courses to your cart yet.
      </Text>
      <TouchableOpacity 
        style={[styles.continueShoppingBtn, { backgroundColor: colors.primary }]}
        onPress={handleContinueShopping}
      >
        <Text style={styles.btnText}>Browse Books</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <NavbarTop title="Shopping Cart" />
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: secondaryText }]}>Loading your cart...</Text>
        </View>
      ) : (
        <>
          <FlatList
            data={cartItems}
            renderItem={renderCartItem}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.cartList}
            ListEmptyComponent={renderEmptyCart}
            ListFooterComponent={cartItems.length > 0 ? (
              <View style={styles.cartFooter}>
                {/* Coupon Code Section */}
                <View style={[styles.couponSection, { backgroundColor: cardBackground, borderColor }]}>
                  <View style={styles.couponHeader}>
                    <Feather name="tag" size={18} color={colors.primary} />
                    <Text style={[styles.couponTitle, { color: textColor }]}>Promotional Code</Text>
                  </View>
                  
                  <View style={styles.couponInputContainer}>
                    <TextInput
                      style={[styles.couponInput, { 
                        color: textColor,
                        borderColor,
                        backgroundColor: isDarkMode ? 'rgba(45, 45, 50, 0.7)' : '#f5f5f5'
                      }]}
                      placeholder="Enter code"
                      placeholderTextColor={secondaryText}
                      value={couponCode}
                      onChangeText={setCouponCode}
                    />
                    <TouchableOpacity 
                      style={[styles.couponButton, { backgroundColor: colors.primary }]}
                      onPress={handleApplyCoupon}
                    >
                      <Text style={styles.couponButtonText}>Apply</Text>
                    </TouchableOpacity>
                  </View>
                  
                  {couponApplied && (
                    <View style={styles.appliedCoupon}>
                      <Feather name="check-circle" size={14} color="#4CAF50" />
                      <Text style={[styles.appliedCouponText, { color: "#4CAF50" }]}>
                        {discount}% discount applied
                      </Text>
                    </View>
                  )}
                </View>
                
                {/* Order Summary */}
                <View style={[styles.orderSummary, { backgroundColor: cardBackground, borderColor }]}>
                  <Text style={[styles.summaryTitle, { color: textColor }]}>Order Summary</Text>
                  
                  <View style={styles.summaryRow}>
                    <Text style={[styles.summaryLabel, { color: secondaryText }]}>Subtotal</Text>
                    <Text style={[styles.summaryValue, { color: textColor }]}>${subtotal.toFixed(2)}</Text>
                  </View>
                  
                  <View style={styles.summaryRow}>
                    <Text style={[styles.summaryLabel, { color: secondaryText }]}>Shipping</Text>
                    <Text style={[styles.summaryValue, { color: textColor }]}>${shipping.toFixed(2)}</Text>
                  </View>
                  
                  <View style={styles.summaryRow}>
                    <Text style={[styles.summaryLabel, { color: secondaryText }]}>Tax</Text>
                    <Text style={[styles.summaryValue, { color: textColor }]}>${tax.toFixed(2)}</Text>
                  </View>
                  
                  {couponApplied && (
                    <View style={styles.summaryRow}>
                      <Text style={[styles.summaryLabel, { color: secondaryText }]}>Discount</Text>
                      <Text style={[styles.summaryValue, { color: "#4CAF50" }]}>-${discountAmount.toFixed(2)}</Text>
                    </View>
                  )}
                  
                  <View style={[styles.totalRow, { borderTopColor: borderColor }]}>
                    <Text style={[styles.totalLabel, { color: textColor }]}>Total</Text>
                    <Text style={[styles.totalValue, { color: colors.primary }]}>${total.toFixed(2)}</Text>
                  </View>
                </View>
                
                {/* Action Buttons */}
                <View style={styles.actionButtons}>
                  <TouchableOpacity 
                    style={[styles.continueButton, { borderColor: colors.primary }]}
                    onPress={handleContinueShopping}
                  >
                    <Text style={[styles.continueButtonText, { color: colors.primary }]}>Continue Shopping</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.checkoutButton, { backgroundColor: colors.primary }]}
                    onPress={handleCheckout}
                  >
                    <Text style={styles.checkoutButtonText}>Checkout</Text>
                    <Feather name="arrow-right" size={18} color="white" />
                  </TouchableOpacity>
                </View>
              </View>
            ) : null}
          />
        </>
      )}
    </SafeAreaView>
  );
};

// Import TextInput component at the top of your file
import { TextInput } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    fontFamily: 'PlayfairDisplay-Regular',
  },
  cartList: {
    padding: 15,
  },
  cartItem: {
    flexDirection: 'row',
    borderRadius: 12,
    marginBottom: 15,
    padding: 10,
    borderWidth: 0.5,
  },
  itemImage: {
    width: 80,
    height: 110,
    borderRadius: 8,
    marginRight: 12,
  },
  itemDetails: {
    flex: 1,
    justifyContent: 'space-between',
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  itemTitle: {
    fontSize: 16,
    fontFamily: 'PlayfairDisplay-Bold',
    flex: 1,
    marginRight: 10,
  },
  itemAuthor: {
    fontSize: 14,
    fontFamily: 'PlayfairDisplay-Regular',
    marginVertical: 4,
  },
  itemMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
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
    fontFamily: 'PlayfairDisplay-Medium',
  },
  itemFormat: {
    fontSize: 12,
    fontFamily: 'PlayfairDisplay-Regular',
  },
  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  itemPrice: {
    fontSize: 18,
    fontFamily: 'PlayfairDisplay-Bold',
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    fontSize: 14,
    fontFamily: 'PlayfairDisplay-Bold',
    marginHorizontal: 10,
  },
  emptyCart: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    marginTop: 50,
  },
  emptyCartTitle: {
    fontSize: 22,
    fontFamily: 'PlayfairDisplay-Bold',
    marginTop: 20,
    marginBottom: 10,
  },
  emptyCartText: {
    fontSize: 14,
    fontFamily: 'PlayfairDisplay-Regular',
    textAlign: 'center',
    marginBottom: 30,
  },
  continueShoppingBtn: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
  },
  btnText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'PlayfairDisplay-SemiBold',
  },
  cartFooter: {
    marginTop: 10,
  },
  couponSection: {
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    borderWidth: 0.5,
  },
  couponHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  couponTitle: {
    fontSize: 16,
    fontFamily: 'PlayfairDisplay-SemiBold',
    marginLeft: 8,
  },
  couponInputContainer: {
    flexDirection: 'row',
  },
  couponInput: {
    flex: 1,
    height: 44,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginRight: 10,
    fontFamily: 'PlayfairDisplay-Regular',
  },
  couponButton: {
    height: 44,
    paddingHorizontal: 15,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  couponButtonText: {
    color: 'white',
    fontFamily: 'PlayfairDisplay-SemiBold',
    fontSize: 14,
  },
  appliedCoupon: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  appliedCouponText: {
    fontFamily: 'PlayfairDisplay-Regular',
    fontSize: 13,
    marginLeft: 6,
  },
  orderSummary: {
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    borderWidth: 0.5,
  },
  summaryTitle: {
    fontSize: 18,
    fontFamily: 'PlayfairDisplay-Bold',
    marginBottom: 15,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  summaryLabel: {
    fontSize: 14,
    fontFamily: 'PlayfairDisplay-Regular',
  },
  summaryValue: {
    fontSize: 14,
    fontFamily: 'PlayfairDisplay-SemiBold',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
    marginTop: 5,
    borderTopWidth: 1,
  },
  totalLabel: {
    fontSize: 16,
    fontFamily: 'PlayfairDisplay-Bold',
  },
  totalValue: {
    fontSize: 20,
    fontFamily: 'PlayfairDisplay-Bold',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  continueButton: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  continueButtonText: {
    fontFamily: 'PlayfairDisplay-SemiBold',
    fontSize: 14,
  },
  checkoutButton: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkoutButtonText: {
    color: 'white',
    fontFamily: 'PlayfairDisplay-SemiBold',
    fontSize: 14,
    marginRight: 8,
  },
});

export default ShoppingCartScreen; 