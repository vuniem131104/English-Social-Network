import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Alert,
    KeyboardAvoidingView,
    Platform
} from 'react-native';
import { useTheme } from '@react-navigation/native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons, MaterialIcons, FontAwesome } from '@expo/vector-icons';
import { useSelector, useDispatch } from 'react-redux';
import { clearCart } from '../../redux/actions/cartActions';

const Checkout = () => {
    const { colors } = useTheme();
    const navigation = useNavigation();
    const route = useRoute();
    const dispatch = useDispatch();
    const isDarkMode = useSelector(state => state.theme.isDarkMode);
    
    // Define theme-consistent colors
    const backgroundColor = isDarkMode ? '#121212' : colors.surface;
    const cardBackground = isDarkMode ? '#1e1e1e' : colors.surfaceContainerLow;
    const borderColor = isDarkMode ? 'rgba(160, 0, 0, 0.3)' : 'rgba(160, 0, 0, 0.2)';
    const textColor = isDarkMode ? '#ffffff' : colors.onSurface;
    const secondaryText = isDarkMode ? '#c0c0c0' : '#777';
    const inputBackground = isDarkMode ? '#2a2a2a' : '#f5f5f5';
    
    const { total } = route.params || { total: "0.00" };
    
    // Form state
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        zipCode: '',
        country: 'Việt Nam',
        cardNumber: '',
        cardHolder: '',
        expiryDate: '',
        cvv: ''
    });
    
    const [formErrors, setFormErrors] = useState({});
    const [paymentMethod, setPaymentMethod] = useState('creditCard'); // 'creditCard', 'paypal'
    
    const updateFormField = (field, value) => {
        setFormData({
            ...formData,
            [field]: value
        });
        
        // Clear error when typing
        if (formErrors[field]) {
            setFormErrors({
                ...formErrors,
                [field]: ''
            });
        }
    };
    
    const validateForm = () => {
        const errors = {};
        
        // Basic validation
        if (!formData.fullName.trim()) errors.fullName = 'Tên không được để trống';
        if (!formData.email.trim()) errors.email = 'Email không được để trống';
        else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = 'Email không hợp lệ';
        if (!formData.phone.trim()) errors.phone = 'Số điện thoại không được để trống';
        if (!formData.address.trim()) errors.address = 'Địa chỉ không được để trống';
        if (!formData.city.trim()) errors.city = 'Thành phố không được để trống';
        if (!formData.zipCode.trim()) errors.zipCode = 'Mã bưu điện không được để trống';
        
        // Payment validation
        if (paymentMethod === 'creditCard') {
            if (!formData.cardNumber.trim()) errors.cardNumber = 'Số thẻ không được để trống';
            else if (!/^\d{16}$/.test(formData.cardNumber.replace(/\s/g, ''))) 
                errors.cardNumber = 'Số thẻ phải có 16 chữ số';
                
            if (!formData.cardHolder.trim()) errors.cardHolder = 'Tên chủ thẻ không được để trống';
            
            if (!formData.expiryDate.trim()) errors.expiryDate = 'Ngày hết hạn không được để trống';
            else if (!/^\d{2}\/\d{2}$/.test(formData.expiryDate)) 
                errors.expiryDate = 'Sử dụng định dạng MM/YY';
                
            if (!formData.cvv.trim()) errors.cvv = 'Mã CVV không được để trống';
            else if (!/^\d{3,4}$/.test(formData.cvv)) errors.cvv = 'CVV phải có 3 hoặc 4 chữ số';
        }
        
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };
    
    const handleSubmit = () => {
        if (validateForm()) {
            // Simulate order processing
            Alert.alert(
                'Đang xử lý đơn hàng',
                'Vui lòng đợi trong khi chúng tôi xử lý đơn hàng của bạn...'
            );
            
            // Simulate a delay for processing
            setTimeout(() => {
                Alert.alert(
                    'Đã xác nhận đơn hàng',
                    'Đơn hàng của bạn đã được đặt thành công! Bạn sẽ nhận được email xác nhận trong thời gian ngắn.',
                    [
                        { 
                            text: 'OK', 
                            onPress: () => {
                                dispatch(clearCart());
                                navigation.reset({
                                    index: 0,
                                    routes: [{ name: 'OrderSuccess', params: { orderNumber: generateOrderNumber() } }],
                                });
                            } 
                        }
                    ]
                );
            }, 2000);
        } else {
            Alert.alert('Lỗi xác thực', 'Vui lòng kiểm tra lại biểu mẫu.');
        }
    };
    
    const generateOrderNumber = () => {
        return 'ORD-' + Math.floor(100000 + Math.random() * 900000);
    };
    
    const formatCardNumber = (text) => {
        const cleaned = text.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
        const chunks = [];
        
        for (let i = 0; i < cleaned.length; i += 4) {
            chunks.push(cleaned.substr(i, 4));
        }
        
        return chunks.join(' ');
    };
    
    const formatExpiryDate = (text) => {
        const cleaned = text.replace(/[^0-9]/g, '');
        if (cleaned.length > 2) {
            return `${cleaned.substring(0, 2)}/${cleaned.substring(2, 4)}`;
        }
        return cleaned;
    };
    
    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1 }}
        >
            <View style={[styles.container, { backgroundColor: backgroundColor }]}>
                {/* Header */}
                <View style={[styles.header, { backgroundColor: cardBackground, borderBottomColor: borderColor }]}>
                    <TouchableOpacity 
                        style={[styles.backButton, { backgroundColor: isDarkMode ? 'rgba(50, 50, 55, 0.8)' : 'rgba(240, 240, 240, 0.8)' }]} 
                        onPress={() => navigation.goBack()}
                    >
                        <Ionicons name="arrow-back" size={22} color={textColor} />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, { color: textColor }]}>Thanh toán</Text>
                    <View style={{ width: 40 }} />
                </View>
                
                <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
                    {/* Shipping Information */}
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: textColor }]}>
                            Thông tin giao hàng
                        </Text>
                        
                        <View style={styles.formGroup}>
                            <Text style={[styles.label, { color: textColor }]}>Họ và tên</Text>
                            <TextInput
                                style={[
                                    styles.input, 
                                    { 
                                        backgroundColor: inputBackground,
                                        borderColor: formErrors.fullName ? colors.error : borderColor,
                                        color: textColor
                                    }
                                ]}
                                placeholder="Nhập họ và tên của bạn"
                                placeholderTextColor={secondaryText}
                                value={formData.fullName}
                                onChangeText={(text) => updateFormField('fullName', text)}
                            />
                            {formErrors.fullName && <Text style={[styles.errorText, { color: colors.error }]}>{formErrors.fullName}</Text>}
                        </View>
                        
                        <View style={styles.formRow}>
                            <View style={[styles.formGroup, { flex: 1, marginRight: 10 }]}>
                                <Text style={[styles.label, { color: textColor }]}>Email</Text>
                                <TextInput
                                    style={[
                                        styles.input, 
                                        { 
                                            backgroundColor: inputBackground,
                                            borderColor: formErrors.email ? colors.error : borderColor,
                                            color: textColor
                                        }
                                    ]}
                                    placeholder="email@example.com"
                                    placeholderTextColor={secondaryText}
                                    keyboardType="email-address"
                                    value={formData.email}
                                    onChangeText={(text) => updateFormField('email', text)}
                                />
                                {formErrors.email && <Text style={[styles.errorText, { color: colors.error }]}>{formErrors.email}</Text>}
                            </View>
                            
                            <View style={[styles.formGroup, { flex: 1 }]}>
                                <Text style={[styles.label, { color: textColor }]}>Điện thoại</Text>
                                <TextInput
                                    style={[
                                        styles.input, 
                                        { 
                                            backgroundColor: inputBackground,
                                            borderColor: formErrors.phone ? colors.error : borderColor,
                                            color: textColor
                                        }
                                    ]}
                                    placeholder="0912345678"
                                    placeholderTextColor={secondaryText}
                                    keyboardType="phone-pad"
                                    value={formData.phone}
                                    onChangeText={(text) => updateFormField('phone', text)}
                                />
                                {formErrors.phone && <Text style={[styles.errorText, { color: colors.error }]}>{formErrors.phone}</Text>}
                            </View>
                        </View>
                        
                        <View style={styles.formGroup}>
                            <Text style={[styles.label, { color: textColor }]}>Địa chỉ</Text>
                            <TextInput
                                style={[
                                    styles.input, 
                                    { 
                                        backgroundColor: inputBackground,
                                        borderColor: formErrors.address ? colors.error : borderColor,
                                        color: textColor
                                    }
                                ]}
                                placeholder="Địa chỉ"
                                placeholderTextColor={secondaryText}
                                value={formData.address}
                                onChangeText={(text) => updateFormField('address', text)}
                            />
                            {formErrors.address && <Text style={[styles.errorText, { color: colors.error }]}>{formErrors.address}</Text>}
                        </View>
                        
                        <View style={styles.formRow}>
                            <View style={[styles.formGroup, { flex: 1, marginRight: 10 }]}>
                                <Text style={[styles.label, { color: textColor }]}>Thành phố</Text>
                                <TextInput
                                    style={[
                                        styles.input, 
                                        { 
                                            backgroundColor: inputBackground,
                                            borderColor: formErrors.city ? colors.error : borderColor,
                                            color: textColor
                                        }
                                    ]}
                                    placeholder="Thành phố"
                                    placeholderTextColor={secondaryText}
                                    value={formData.city}
                                    onChangeText={(text) => updateFormField('city', text)}
                                />
                                {formErrors.city && <Text style={[styles.errorText, { color: colors.error }]}>{formErrors.city}</Text>}
                            </View>
                            
                            <View style={[styles.formGroup, { flex: 1 }]}>
                                <Text style={[styles.label, { color: textColor }]}>Mã bưu điện</Text>
                                <TextInput
                                    style={[
                                        styles.input, 
                                        { 
                                            backgroundColor: inputBackground,
                                            borderColor: formErrors.zipCode ? colors.error : borderColor,
                                            color: textColor
                                        }
                                    ]}
                                    placeholder="Mã bưu điện"
                                    placeholderTextColor={secondaryText}
                                    keyboardType="numeric"
                                    value={formData.zipCode}
                                    onChangeText={(text) => updateFormField('zipCode', text)}
                                />
                                {formErrors.zipCode && <Text style={[styles.errorText, { color: colors.error }]}>{formErrors.zipCode}</Text>}
                            </View>
                        </View>
                    </View>
                    
                    {/* Payment Method */}
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: textColor }]}>
                            Phương thức thanh toán
                        </Text>
                        
                        <View style={styles.paymentOptions}>
                            <View style={styles.formRow}>
                                <TouchableOpacity 
                                    style={[
                                        styles.paymentMethodButton, 
                                        paymentMethod === 'creditCard' && [
                                            styles.selectedPaymentMethod, 
                                            { borderColor: colors.primary, backgroundColor: isDarkMode ? 'rgba(160, 0, 0, 0.1)' : 'rgba(208, 0, 0, 0.05)' }
                                        ],
                                        { backgroundColor: isDarkMode ? '#2a2a2a' : '#f8f8f8' }
                                    ]}
                                    onPress={() => setPaymentMethod('creditCard')}
                                >
                                    <FontAwesome 
                                        name="credit-card" 
                                        size={20} 
                                        color={paymentMethod === 'creditCard' ? colors.primary : secondaryText} 
                                    />
                                    <Text 
                                        style={[
                                            styles.paymentMethodText, 
                                            { color: paymentMethod === 'creditCard' ? colors.primary : secondaryText }
                                        ]}
                                    >
                                        Thẻ tín dụng
                                    </Text>
                                </TouchableOpacity>
                                
                                <TouchableOpacity 
                                    style={[
                                        styles.paymentMethodButton, 
                                        paymentMethod === 'paypal' && [
                                            styles.selectedPaymentMethod, 
                                            { borderColor: colors.primary, backgroundColor: isDarkMode ? 'rgba(160, 0, 0, 0.1)' : 'rgba(208, 0, 0, 0.05)' }
                                        ],
                                        { backgroundColor: isDarkMode ? '#2a2a2a' : '#f8f8f8' }
                                    ]}
                                    onPress={() => setPaymentMethod('paypal')}
                                >
                                    <FontAwesome 
                                        name="paypal" 
                                        size={20} 
                                        color={paymentMethod === 'paypal' ? colors.primary : secondaryText} 
                                    />
                                    <Text 
                                        style={[
                                            styles.paymentMethodText, 
                                            { color: paymentMethod === 'paypal' ? colors.primary : secondaryText }
                                        ]}
                                    >
                                        PayPal
                                    </Text>
                                </TouchableOpacity>
                            </View>
                            
                            {paymentMethod === 'creditCard' && (
                                <View>
                                    <View style={styles.formGroup}>
                                        <Text style={[styles.label, { color: textColor }]}>Số thẻ</Text>
                                        <TextInput
                                            style={[
                                                styles.input, 
                                                { 
                                                    backgroundColor: inputBackground,
                                                    borderColor: formErrors.cardNumber ? colors.error : borderColor,
                                                    color: textColor
                                                }
                                            ]}
                                            placeholder="1234 5678 9012 3456"
                                            placeholderTextColor={secondaryText}
                                            keyboardType="numeric"
                                            maxLength={19}
                                            value={formData.cardNumber}
                                            onChangeText={(text) => updateFormField('cardNumber', formatCardNumber(text))}
                                        />
                                        {formErrors.cardNumber && <Text style={[styles.errorText, { color: colors.error }]}>{formErrors.cardNumber}</Text>}
                                    </View>
                                    
                                    <View style={styles.formGroup}>
                                        <Text style={[styles.label, { color: textColor }]}>Tên chủ thẻ</Text>
                                        <TextInput
                                            style={[
                                                styles.input, 
                                                { 
                                                    backgroundColor: inputBackground,
                                                    borderColor: formErrors.cardHolder ? colors.error : borderColor,
                                                    color: textColor
                                                }
                                            ]}
                                            placeholder="Tên trên thẻ"
                                            placeholderTextColor={secondaryText}
                                            value={formData.cardHolder}
                                            onChangeText={(text) => updateFormField('cardHolder', text)}
                                        />
                                        {formErrors.cardHolder && <Text style={[styles.errorText, { color: colors.error }]}>{formErrors.cardHolder}</Text>}
                                    </View>
                                    
                                    <View style={styles.formRow}>
                                        <View style={[styles.formGroup, { flex: 1, marginRight: 10 }]}>
                                            <Text style={[styles.label, { color: textColor }]}>Ngày hết hạn</Text>
                                            <TextInput
                                                style={[
                                                    styles.input, 
                                                    { 
                                                        backgroundColor: inputBackground,
                                                        borderColor: formErrors.expiryDate ? colors.error : borderColor,
                                                        color: textColor
                                                    }
                                                ]}
                                                placeholder="MM/YY"
                                                placeholderTextColor={secondaryText}
                                                keyboardType="numeric"
                                                maxLength={5}
                                                value={formData.expiryDate}
                                                onChangeText={(text) => updateFormField('expiryDate', formatExpiryDate(text))}
                                            />
                                            {formErrors.expiryDate && <Text style={[styles.errorText, { color: colors.error }]}>{formErrors.expiryDate}</Text>}
                                        </View>
                                        
                                        <View style={[styles.formGroup, { flex: 1 }]}>
                                            <Text style={[styles.label, { color: textColor }]}>CVV</Text>
                                            <TextInput
                                                style={[
                                                    styles.input, 
                                                    { 
                                                        backgroundColor: inputBackground,
                                                        borderColor: formErrors.cvv ? colors.error : borderColor,
                                                        color: textColor
                                                    }
                                                ]}
                                                placeholder="123"
                                                placeholderTextColor={secondaryText}
                                                keyboardType="numeric"
                                                maxLength={4}
                                                secureTextEntry
                                                value={formData.cvv}
                                                onChangeText={(text) => updateFormField('cvv', text)}
                                            />
                                            {formErrors.cvv && <Text style={[styles.errorText, { color: colors.error }]}>{formErrors.cvv}</Text>}
                                        </View>
                                    </View>
                                </View>
                            )}
                            
                            {paymentMethod === 'paypal' && (
                                <View style={[styles.paypalMessage, { 
                                    backgroundColor: isDarkMode ? 'rgba(160, 0, 0, 0.1)' : 'rgba(208, 0, 0, 0.05)', 
                                    borderColor: borderColor,
                                    borderWidth: 1
                                }]}>
                                    <Text style={[styles.paypalText, { color: textColor }]}>
                                        Bạn sẽ được chuyển hướng đến PayPal để hoàn tất thanh toán an toàn.
                                    </Text>
                                </View>
                            )}
                        </View>
                    </View>
                    
                    {/* Order Summary */}
                    <View style={[styles.orderSummary, { backgroundColor: cardBackground, borderColor: borderColor }]}>
                        <Text style={[styles.sectionTitle, { color: textColor }]}>
                            Tổng quan đơn hàng
                        </Text>
                        
                        <View style={styles.summaryRow}>
                            <Text style={[styles.summaryLabel, { color: secondaryText }]}>Tổng cộng</Text>
                            <Text style={[styles.summaryValue, { color: textColor }]}>${Number(total).toFixed(2)}</Text>
                        </View>
                        
                        <View style={styles.summaryRow}>
                            <Text style={[styles.summaryLabel, { color: secondaryText }]}>Vận chuyển</Text>
                            <Text style={[styles.summaryValue, { color: textColor }]}>$0.00</Text>
                        </View>
                        
                        <View style={styles.summaryRow}>
                            <Text style={[styles.summaryLabel, { color: secondaryText }]}>Thuế</Text>
                            <Text style={[styles.summaryValue, { color: textColor }]}>
                                ${(Number(total) * 0.1).toFixed(2)}
                            </Text>
                        </View>
                        
                        <View style={[styles.totalRow, { borderTopColor: borderColor }]}>
                            <Text style={[styles.totalLabel, { color: textColor }]}>Tổng cộng</Text>
                            <Text style={[styles.totalValue, { color: colors.primary }]}>
                                ${(Number(total) * 1.1).toFixed(2)}
                            </Text>
                        </View>
                    </View>
                    
                    {/* Place Order Button */}
                    <TouchableOpacity 
                        style={[styles.placeOrderButton, { 
                            backgroundColor: colors.primary,
                            shadowColor: isDarkMode ? 'rgba(0, 0, 0, 0.5)' : 'rgba(160, 0, 0, 0.3)',
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.3,
                            shadowRadius: 4,
                            elevation: 4
                        }]}
                        onPress={handleSubmit}
                    >
                        <Text style={styles.placeOrderButtonText}>Đặt hàng</Text>
                    </TouchableOpacity>
                </ScrollView>
            </View>
        </KeyboardAvoidingView>
    );
};

export default Checkout;

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 15,
        paddingVertical: 12,
        borderBottomWidth: 1,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
    },
    scrollContainer: {
        flex: 1,
        padding: 15,
    },
    section: {
        marginBottom: 25,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
    },
    formGroup: {
        marginBottom: 15,
    },
    formRow: {
        flexDirection: 'row',
    },
    label: {
        fontSize: 14,
        marginBottom: 6,
    },
    input: {
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 16,
    },
    errorText: {
        fontSize: 12,
        marginTop: 4,
        color: '#ff3333'
    },
    paymentOptions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    paymentMethodButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 15,
        paddingHorizontal: 10,
        borderWidth: 1,
        borderColor: isDarkMode ? '#444' : '#ddd',
        borderRadius: 10,
        marginHorizontal: 5,
    },
    selectedPaymentMethod: {
        borderWidth: 2,
    },
    paymentMethodText: {
        marginLeft: 10,
        fontSize: 14,
        fontWeight: '500',
    },
    paypalMessage: {
        padding: 15,
        borderRadius: 8,
        marginTop: 10,
    },
    paypalText: {
        fontSize: 14,
        textAlign: 'center',
    },
    orderSummary: {
        padding: 20,
        borderRadius: 15,
        marginTop: 20,
        marginBottom: 20,
        borderWidth: 1,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    summaryLabel: {
        fontSize: 15,
    },
    summaryValue: {
        fontSize: 15,
        fontWeight: '500',
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderTopWidth: 1,
        marginTop: 12,
        paddingTop: 12,
    },
    totalLabel: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    totalValue: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    placeOrderButton: {
        paddingVertical: 16,
        borderRadius: 15,
        alignItems: 'center',
        marginBottom: 30,
    },
    placeOrderButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
}); 