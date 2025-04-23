import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    ScrollView
} from 'react-native';
import { useTheme } from '@react-navigation/native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import LottieView from 'lottie-react-native';
import { useSelector } from 'react-redux';

const OrderSuccess = () => {
    const { colors } = useTheme();
    const navigation = useNavigation();
    const route = useRoute();
    const isDarkMode = useSelector(state => state.theme.isDarkMode);
    
    const { orderNumber } = route.params || { orderNumber: 'ORD-123456' };
    
    const handleContinueShopping = () => {
        navigation.reset({
            index: 0,
            routes: [{ name: 'MainTab', params: { screen: 'Shop' } }],
        });
    };
    
    const handleViewOrders = () => {
        navigation.navigate('Orders');
    };
    
    return (
        <View style={[styles.container, { backgroundColor: isDarkMode ? '#121212' : colors.surface }]}>
            <ScrollView 
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.animationContainer}>
                    {/* Lottie Animation */}
                    <LottieView
                        source={require('../../assets/animations/order-success.json')}
                        autoPlay
                        loop={false}
                        style={styles.animation}
                        onError={(error) => {
                            console.log('Lottie animation error:', error);
                        }}
                    />
                    
                    
                </View>
                
                <Text style={[styles.title, { color: colors.onSurface }]}>
                    Đặt hàng thành công!
                </Text>
                
                <Text style={[styles.message, { color: isDarkMode ? '#e0e0e0' : colors.onSurfaceVariant }]}>
                    Đơn hàng của bạn đã được xác nhận và đang được xử lý.
                    Chúng tôi đã gửi email xác nhận đến địa chỉ email của bạn với các chi tiết về đơn hàng. Nếu bạn có bất kỳ câu hỏi nào, đừng ngần ngại liên hệ với chúng tôi.
                </Text>
                
                <View style={[styles.card, { backgroundColor: isDarkMode ? '#1e1e1e' : colors.surfaceContainerLow, borderColor: isDarkMode ? 'rgba(160, 0, 0, 0.3)' : 'rgba(160, 0, 0, 0.2)' }]}>
                    <View style={styles.orderInfoRow}>
                        <Text style={[styles.orderInfoLabel, { color: isDarkMode ? '#c0c0c0' : colors.onSurfaceVariant }]}>
                            Mã đơn hàng:
                        </Text>
                        <Text style={[styles.orderInfoValue, { color: isDarkMode ? '#ffffff' : colors.onSurface }]}>
                            #{orderNumber}
                        </Text>
                    </View>
                    
                    <View style={[styles.divider, { backgroundColor: isDarkMode ? 'rgba(160, 0, 0, 0.3)' : 'rgba(160, 0, 0, 0.2)' }]} />
                    
                    <View style={styles.orderInfoRow}>
                        <Text style={[styles.orderInfoLabel, { color: isDarkMode ? '#c0c0c0' : colors.onSurfaceVariant }]}>
                            Ngày đặt hàng:
                        </Text>
                        <Text style={[styles.orderInfoValue, { color: isDarkMode ? '#ffffff' : colors.onSurface }]}>
                            {new Date().toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}
                        </Text>
                    </View>
                    
                    <View style={[styles.divider, { backgroundColor: isDarkMode ? 'rgba(160, 0, 0, 0.3)' : 'rgba(160, 0, 0, 0.2)' }]} />
                    
                    <View style={styles.orderInfoRow}>
                        <Text style={[styles.orderInfoLabel, { color: isDarkMode ? '#c0c0c0' : colors.onSurfaceVariant }]}>
                            Phương thức thanh toán:
                        </Text>
                        <Text style={[styles.orderInfoValue, { color: isDarkMode ? '#ffffff' : colors.onSurface }]}>
                            Thẻ tín dụng
                        </Text>
                    </View>
                </View>
                
                <View style={styles.deliveryInfoContainer}>
                    <View style={[styles.deliveryInfoHeader, { backgroundColor: isDarkMode ? '#1e1e1e' : colors.surfaceContainerLow }]}>
                        <MaterialIcons name="local-shipping" size={22} color={colors.onSurface} />
                        <Text style={[styles.deliveryInfoTitle, { color: colors.onSurface }]}>
                            Thông tin giao hàng
                        </Text>
                    </View>
                    
                    <View style={[styles.deliveryInfoContent, { backgroundColor: isDarkMode ? '#1e1e1e' : colors.surfaceContainerLow, borderColor: isDarkMode ? 'rgba(160, 0, 0, 0.3)' : 'rgba(160, 0, 0, 0.2)' }]}>
                        <View style={styles.deliveryRow}>
                            <Text style={[styles.deliveryLabel, { color: isDarkMode ? '#c0c0c0' : colors.onSurfaceVariant }]}>
                                Dự kiến giao hàng:
                            </Text>
                            <Text style={[styles.deliveryDate, { color: colors.onSurface }]}>
                                {new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            </Text>
                        </View>
                        
                        <View style={styles.deliveryRow}>
                            <Text style={[styles.deliveryLabel, { color: isDarkMode ? '#c0c0c0' : colors.onSurfaceVariant }]}>
                                Địa chỉ giao hàng:
                            </Text>
                            <Text style={[styles.deliveryAddress, { color: colors.onSurface }]}>
                                123 Đường Nguyễn Văn Linh, Q.7, TP. Hồ Chí Minh
                            </Text>
                        </View>
                    </View>
                </View>
            </ScrollView>
            
            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    style={[styles.primaryButton, { backgroundColor: colors.primary }]}
                    onPress={handleContinueShopping}
                >
                    <Text style={[styles.primaryButtonText, { color: '#ffffff' }]}>
                        Tiếp tục mua sắm
                    </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                    style={[styles.secondaryButton, { 
                        backgroundColor: isDarkMode ? '#2a2a2a' : colors.surfaceContainerHigh,
                        borderColor: colors.primary,
                        borderWidth: 1
                    }]}
                    onPress={handleViewOrders}
                >
                    <Text style={[styles.secondaryButtonText, { color: colors.primary }]}>
                        Xem đơn hàng của tôi
                    </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                    style={[styles.outlineButton, { borderColor: isDarkMode ? 'rgba(120, 120, 130, 0.3)' : '#ddd' }]}
                    onPress={() => navigation.navigate('Home')}
                >
                    <Text style={[styles.outlineButtonText, { color: colors.onSurface }]}>
                        Trở về trang chủ
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default OrderSuccess;

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 130,
    },
    animationContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 20,
        height: 150,
        width: '100%',
        position: 'relative',
    },
    animation: {
        width: 150,
        height: 150,
        zIndex: 2,
    },
    successIconContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        textAlign: 'center',
        marginVertical: 15,
    },
    message: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 25,
        lineHeight: 22,
    },
    card: {
        padding: 20,
        borderRadius: 15,
        marginBottom: 25,
        borderWidth: 1,
    },
    orderInfoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    orderInfoLabel: {
        fontSize: 15,
    },
    orderInfoValue: {
        fontSize: 15,
        fontWeight: '500',
    },
    divider: {
        height: 1,
    },
    deliveryInfoContainer: {
        marginBottom: 20,
    },
    deliveryInfoHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
        marginBottom: 15,
    },
    deliveryInfoTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginLeft: 10,
    },
    deliveryInfoContent: {
        padding: 15,
        borderRadius: 12,
        borderWidth: 1,
    },
    deliveryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    deliveryLabel: {
        fontSize: 15,
    },
    deliveryDate: {
        fontSize: 15,
        fontWeight: '500',
    },
    deliveryAddress: {
        fontSize: 15,
        fontWeight: '500',
    },
    buttonContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingHorizontal: 20,
        paddingVertical: 15,
        paddingBottom: 30,
    },
    primaryButton: {
        borderRadius: 25,
        paddingVertical: 14,
        alignItems: 'center',
        marginBottom: 12,
    },
    primaryButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    secondaryButton: {
        borderRadius: 25,
        paddingVertical: 14,
        alignItems: 'center',
    },
    secondaryButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    outlineButton: {
        borderRadius: 25,
        paddingVertical: 14,
        alignItems: 'center',
    },
    outlineButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
}); 