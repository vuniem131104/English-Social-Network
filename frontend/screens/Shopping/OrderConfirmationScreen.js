import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Image,
  Animated
} from 'react-native';
import { useSelector } from 'react-redux';
import { useNavigation, useRoute, useTheme } from '@react-navigation/native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import LottieView from 'lottie-react-native';

const OrderConfirmationScreen = () => {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const route = useRoute();
  const isDarkMode = useSelector(state => state.theme.isDarkMode);
  
  // Define theme-consistent colors
  const backgroundColor = isDarkMode ? '#121212' : colors.surface;
  const cardBackground = isDarkMode ? '#1e1e1e' : '#f5f5f5';
  const borderColor = isDarkMode ? 'rgba(160, 0, 0, 0.3)' : 'rgba(160, 0, 0, 0.2)';
  const textColor = isDarkMode ? '#ffffff' : colors.text;
  const secondaryText = isDarkMode ? '#c0c0c0' : '#777';
  const dividerColor = isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
  
  const { orderTotal, items } = route.params;
  const opacityAnim = new Animated.Value(0);
  const successAnim = React.useRef(null);
  
  // Generate a random order ID
  const orderId = Math.floor(100000000 + Math.random() * 900000000).toString();
  
  // Get the current date and estimate delivery date (5 days from now)
  const currentDate = new Date();
  const deliveryDate = new Date();
  deliveryDate.setDate(currentDate.getDate() + 5);
  
  const formatDate = (date) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };
  
  useEffect(() => {
    if (successAnim.current) {
      setTimeout(() => {
        successAnim.current.play();
      }, 100);
    }
    
    Animated.timing(opacityAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);
  
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  
  const handleBackToShop = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'Shop' }],
    });
  };
  
  return (
    <SafeAreaView style={[
      styles.container, 
      { backgroundColor: backgroundColor }
    ]}>
      <View style={[styles.header, { 
        backgroundColor: cardBackground,
        borderBottomColor: borderColor
      }]}>
        <Text style={[styles.headerTitle, { color: textColor }]}>
          Xác nhận đơn hàng
        </Text>
      </View>
      
      <ScrollView 
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.animationContainer}>
          <LottieView
            ref={successAnim}
            source={require('../../assets/animations/order-success.json')}
            style={styles.successAnimation}
            autoPlay={false}
            loop={false}
          />
        </View>
        
        <Animated.View style={[
          styles.orderInfoContainer, 
          { 
            backgroundColor: cardBackground,
            opacity: opacityAnim,
            borderColor: borderColor,
            borderWidth: 1
          }
        ]}>
          <Text style={[styles.thankYouText, { color: textColor }]}>
            Cảm ơn bạn đã đặt hàng!
          </Text>
          
          <Text style={[styles.orderMessage, { color: secondaryText }]}>
            Đơn hàng của bạn đã được tiếp nhận và đang được xử lý. Bạn sẽ nhận được email xác nhận chi tiết đơn hàng trong thời gian ngắn.
          </Text>
          
          <View style={[styles.divider, { backgroundColor: dividerColor }]} />
          
          <View style={styles.orderDetailRow}>
            <Text style={[styles.orderDetailLabel, { color: secondaryText }]}>
              Mã đơn hàng:
            </Text>
            <Text style={[styles.orderDetailValue, { color: textColor }]}>
              #{orderId}
            </Text>
          </View>
          
          <View style={styles.orderDetailRow}>
            <Text style={[styles.orderDetailLabel, { color: secondaryText }]}>
              Ngày đặt:
            </Text>
            <Text style={[styles.orderDetailValue, { color: textColor }]}>
              {formatDate(currentDate)}
            </Text>
          </View>
          
          <View style={styles.orderDetailRow}>
            <Text style={[styles.orderDetailLabel, { color: secondaryText }]}>
              Dự kiến giao hàng:
            </Text>
            <Text style={[styles.orderDetailValue, { color: textColor }]}>
              {formatDate(deliveryDate)}
            </Text>
          </View>
          
          <View style={styles.orderDetailRow}>
            <Text style={[styles.orderDetailLabel, { color: secondaryText }]}>
              Tổng tiền:
            </Text>
            <Text style={[styles.orderDetailValue, { color: colors.primary, fontWeight: 'bold' }]}>
              ${(orderTotal + 5.99).toFixed(2)}
            </Text>
          </View>
        </Animated.View>
        
        <Animated.Text 
          style={[
            styles.orderSummaryTitle, 
            { color: textColor, opacity: opacityAnim }
          ]}
        >
          Tóm tắt đơn hàng ({totalItems} {totalItems === 1 ? 'sản phẩm' : 'sản phẩm'})
        </Animated.Text>
        
        <Animated.View style={{ opacity: opacityAnim }}>
          {items.map((item) => (
            <View 
              key={item.id} 
              style={[
                styles.orderItem, 
                { 
                  backgroundColor: cardBackground,
                  borderColor: borderColor,
                  borderWidth: 1
                }
              ]}
            >
              <View style={styles.itemImage}>
                {item.image ? (
                  <Image 
                    source={{ uri: item.image }} 
                    style={styles.actualImage}
                    onError={() => console.log('Image loading error')}
                  />
                ) : (
                  <View style={styles.noImageContainer}>
                    <Text style={styles.noImageText}>Không có ảnh</Text>
                  </View>
                )}
              </View>
              
              <View style={styles.itemDetails}>
                <Text style={[styles.itemTitle, { color: textColor }]} numberOfLines={2}>
                  {item.title}
                </Text>
                
                <Text style={[styles.itemAuthor, { color: secondaryText }]}>
                  by {item.author}
                </Text>
                
                <View style={styles.itemPriceRow}>
                  <Text style={[styles.itemPrice, { color: colors.primary }]}>
                    ${item.price.toFixed(2)}
                  </Text>
                  
                  <Text style={[styles.itemQuantity, { color: secondaryText }]}>
                    SL: {item.quantity}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </Animated.View>
        
        <TouchableOpacity 
          style={[
            styles.continueButton,
            { 
              backgroundColor: colors.primary,
              opacity: opacityAnim,
              shadowColor: isDarkMode ? 'rgba(0, 0, 0, 0.5)' : 'rgba(160, 0, 0, 0.3)',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.3,
              shadowRadius: 4,
              elevation: 4
            }
          ]} 
          onPress={handleBackToShop}
        >
          <Text style={styles.continueButtonText}>
            Tiếp tục mua sắm
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: 50,
  },
  header: {
    padding: 16,
    alignItems: 'center',
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  contentContainer: {
    padding: 16,
  },
  animationContainer: {
    height: 150,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    position: 'relative',
  },
  successAnimation: {
    width: 150,
    height: 150,
    zIndex: 2,
  },
  orderInfoContainer: {
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
  },
  thankYouText: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  orderMessage: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 15,
  },
  divider: {
    height: 1,
    marginVertical: 15,
  },
  orderDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  orderDetailLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  orderDetailValue: {
    fontSize: 14,
  },
  orderSummaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  orderItem: {
    flexDirection: 'row',
    padding: 12,
    marginBottom: 12,
    borderRadius: 8,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  itemImage: {
    width: 60,
    height: 90,
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
    fontSize: 10,
    fontWeight: 'bold',
  },
  itemDetails: {
    flex: 1,
    justifyContent: 'space-between',
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  itemAuthor: {
    fontSize: 12,
    marginBottom: 4,
  },
  itemPriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  itemQuantity: {
    fontSize: 12,
  },
  continueButton: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  continueButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default OrderConfirmationScreen; 