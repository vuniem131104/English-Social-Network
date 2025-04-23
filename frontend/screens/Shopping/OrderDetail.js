import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Image,
    TouchableOpacity,
    Linking
} from 'react-native';
import { useTheme } from '@react-navigation/native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { MaterialIcons, FontAwesome } from '@expo/vector-icons';
import { useSelector } from 'react-redux';

const OrderDetail = () => {
    const { colors } = useTheme();
    const navigation = useNavigation();
    const route = useRoute();
    const isDarkMode = useSelector(state => state.theme.isDarkMode);
    
    // Get order from route params
    const { order } = route.params || { 
        order: {
            id: 'ORD-123456',
            date: new Date().toISOString(),
            status: 'Processing',
            total: 127.97,
            items: [],
            shippingAddress: {
                name: 'John Doe',
                street: '123 Main Street',
                city: 'New York',
                state: 'NY',
                zip: '10001',
                country: 'United States'
            },
            paymentMethod: {
                type: 'Credit Card',
                lastFour: '4242'
            },
            shippingMethod: 'Standard Shipping',
            shippingCost: 4.99,
            subtotal: 122.98,
            estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Delivered':
                return colors.success || '#4CAF50';
            case 'Processing':
                return colors.primary;
            case 'Shipped':
                return colors.info || '#2196F3';
            case 'Cancelled':
                return colors.error || '#F44336';
            default:
                return colors.onSurfaceVariant;
        }
    };

    const handleTrackOrder = () => {
        // In a real app, this would open a tracking page or link
        Linking.openURL('https://trackinginfo.shipping.com');
    };

    const handleContactSupport = () => {
        // In a real app, this would open email or chat
        Linking.openURL('mailto:support@englishsocial.com');
    };

    const handleCancelOrder = () => {
        // In a real app, this would show a confirmation dialog and call an API
        alert('This feature would allow you to cancel your order. Not implemented in this demo.');
    };

    const canCancel = order.status === 'Processing';

    return (
        <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <MaterialIcons name="arrow-back" size={24} color={colors.onSurface} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.onSurface }]}>
                    Order Details
                </Text>
                <View style={styles.placeholder} />
            </View>

            {/* Order Summary */}
            <View style={[styles.card, { backgroundColor: colors.surfaceContainerLow }]}>
                <View style={styles.orderSummaryHeader}>
                    <View>
                        <Text style={[styles.orderNumber, { color: colors.onSurface }]}>
                            {order.id}
                        </Text>
                        <Text style={[styles.orderDate, { color: colors.onSurfaceVariant }]}>
                            Placed on {formatDate(order.date)}
                        </Text>
                    </View>
                    <View
                        style={[
                            styles.statusBadge,
                            { backgroundColor: getStatusColor(order.status) + '20' }
                        ]}
                    >
                        <Text
                            style={[
                                styles.statusText,
                                { color: getStatusColor(order.status) }
                            ]}
                        >
                            {order.status}
                        </Text>
                    </View>
                </View>

                {order.estimatedDelivery && (
                    <View style={styles.deliveryInfo}>
                        <Text style={[styles.deliveryTitle, { color: colors.onSurfaceVariant }]}>
                            Estimated Delivery
                        </Text>
                        <Text style={[styles.deliveryDate, { color: colors.onSurface }]}>
                            {formatDate(order.estimatedDelivery)}
                        </Text>
                    </View>
                )}

                {/* Action Buttons */}
                <View style={styles.actionButtons}>
                    {order.status === 'Shipped' && (
                        <TouchableOpacity
                            style={[styles.actionButton, { backgroundColor: colors.primary + '10' }]}
                            onPress={handleTrackOrder}
                        >
                            <MaterialIcons name="local-shipping" size={18} color={colors.primary} />
                            <Text style={[styles.actionButtonText, { color: colors.primary }]}>
                                Track Order
                            </Text>
                        </TouchableOpacity>
                    )}
                    
                    <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: colors.secondary + '10' }]}
                        onPress={handleContactSupport}
                    >
                        <MaterialIcons name="headset-mic" size={18} color={colors.secondary} />
                        <Text style={[styles.actionButtonText, { color: colors.secondary }]}>
                            Support
                        </Text>
                    </TouchableOpacity>
                    
                    {canCancel && (
                        <TouchableOpacity
                            style={[styles.actionButton, { backgroundColor: colors.error + '10' }]}
                            onPress={handleCancelOrder}
                        >
                            <MaterialIcons name="cancel" size={18} color={colors.error} />
                            <Text style={[styles.actionButtonText, { color: colors.error }]}>
                                Cancel
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {/* Order Items */}
            <View style={[styles.card, { backgroundColor: colors.surfaceContainerLow }]}>
                <Text style={[styles.sectionTitle, { color: colors.onSurface }]}>
                    Items in Your Order
                </Text>
                
                {order.items.map((item, index) => (
                    <View 
                        key={item.id || index}
                        style={[
                            styles.orderItem,
                            index < order.items.length - 1 && styles.itemWithBorder,
                            index < order.items.length - 1 && { borderBottomColor: colors.outline + '30' }
                        ]}
                    >
                        <Image
                            source={{ uri: item.image }}
                            style={styles.itemImage}
                        />
                        <View style={styles.itemDetails}>
                            <Text style={[styles.itemTitle, { color: colors.onSurface }]}>
                                {item.title}
                            </Text>
                            <View style={styles.itemMeta}>
                                <Text style={[styles.itemPrice, { color: colors.onSurfaceVariant }]}>
                                    ${item.price.toFixed(2)}
                                </Text>
                                <Text style={[styles.itemQuantity, { color: colors.onSurfaceVariant }]}>
                                    Qty: {item.quantity}
                                </Text>
                            </View>
                            <Text style={[styles.itemSubtotal, { color: colors.onSurface }]}>
                                ${(item.price * item.quantity).toFixed(2)}
                            </Text>
                        </View>
                    </View>
                ))}
            </View>

            {/* Shipping Address */}
            {order.shippingAddress && (
                <View style={[styles.card, { backgroundColor: colors.surfaceContainerLow }]}>
                    <Text style={[styles.sectionTitle, { color: colors.onSurface }]}>
                        Shipping Address
                    </Text>
                    <Text style={[styles.addressName, { color: colors.onSurface }]}>
                        {order.shippingAddress.name}
                    </Text>
                    <Text style={[styles.addressLine, { color: colors.onSurfaceVariant }]}>
                        {order.shippingAddress.street}
                    </Text>
                    <Text style={[styles.addressLine, { color: colors.onSurfaceVariant }]}>
                        {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}
                    </Text>
                    <Text style={[styles.addressLine, { color: colors.onSurfaceVariant }]}>
                        {order.shippingAddress.country}
                    </Text>
                </View>
            )}

            {/* Payment Information */}
            {order.paymentMethod && (
                <View style={[styles.card, { backgroundColor: colors.surfaceContainerLow }]}>
                    <Text style={[styles.sectionTitle, { color: colors.onSurface }]}>
                        Payment Information
                    </Text>
                    <View style={styles.paymentRow}>
                        <View style={styles.paymentInfo}>
                            <FontAwesome 
                                name={order.paymentMethod.type === 'Credit Card' ? 'credit-card' : 'paypal'} 
                                size={18} 
                                color={colors.onSurfaceVariant} 
                                style={styles.paymentIcon}
                            />
                            <View>
                                <Text style={[styles.paymentMethod, { color: colors.onSurface }]}>
                                    {order.paymentMethod.type}
                                </Text>
                                {order.paymentMethod.lastFour && (
                                    <Text style={[styles.paymentDetail, { color: colors.onSurfaceVariant }]}>
                                        •••• {order.paymentMethod.lastFour}
                                    </Text>
                                )}
                            </View>
                        </View>
                    </View>
                </View>
            )}

            {/* Order Summary */}
            <View style={[styles.card, { backgroundColor: colors.surfaceContainerLow }]}>
                <Text style={[styles.sectionTitle, { color: colors.onSurface }]}>
                    Order Summary
                </Text>
                
                <View style={styles.summaryRow}>
                    <Text style={[styles.summaryLabel, { color: colors.onSurfaceVariant }]}>
                        Subtotal
                    </Text>
                    <Text style={[styles.summaryValue, { color: colors.onSurface }]}>
                        ${order.subtotal?.toFixed(2) || (order.total - (order.shippingCost || 0)).toFixed(2)}
                    </Text>
                </View>
                
                {order.shippingMethod && (
                    <View style={styles.summaryRow}>
                        <Text style={[styles.summaryLabel, { color: colors.onSurfaceVariant }]}>
                            {order.shippingMethod}
                        </Text>
                        <Text style={[styles.summaryValue, { color: colors.onSurface }]}>
                            ${order.shippingCost?.toFixed(2) || "0.00"}
                        </Text>
                    </View>
                )}
                
                <View style={[styles.totalRow, { borderTopColor: colors.outline + '30' }]}>
                    <Text style={[styles.totalLabel, { color: colors.onSurface }]}>
                        Total
                    </Text>
                    <Text style={[styles.totalValue, { color: colors.primary }]}>
                        ${order.total.toFixed(2)}
                    </Text>
                </View>
            </View>

            {/* Need Help */}
            <View style={[styles.helpCard, { backgroundColor: colors.surfaceContainerLow }]}>
                <Text style={[styles.helpTitle, { color: colors.onSurface }]}>
                    Need Help?
                </Text>
                <Text style={[styles.helpText, { color: colors.onSurfaceVariant }]}>
                    If you have any questions about your order, please contact our customer support.
                </Text>
                <TouchableOpacity
                    style={[styles.helpButton, { backgroundColor: colors.secondaryContainer }]}
                    onPress={handleContactSupport}
                >
                    <Text style={[styles.helpButtonText, { color: colors.onSecondaryContainer }]}>
                        Contact Support
                    </Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
};

export default OrderDetail;

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
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
    card: {
        borderRadius: 12,
        padding: 16,
        marginHorizontal: 16,
        marginBottom: 16,
    },
    orderSummaryHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    orderNumber: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    orderDate: {
        fontSize: 14,
        marginTop: 4,
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
    },
    deliveryInfo: {
        marginBottom: 16,
    },
    deliveryTitle: {
        fontSize: 14,
    },
    deliveryDate: {
        fontSize: 16,
        fontWeight: 'bold',
        marginTop: 4,
    },
    actionButtons: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        flexWrap: 'wrap',
        marginTop: 8,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        marginRight: 8,
        marginBottom: 8,
    },
    actionButtonText: {
        fontSize: 14,
        fontWeight: '500',
        marginLeft: 4,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    orderItem: {
        flexDirection: 'row',
        paddingVertical: 12,
    },
    itemWithBorder: {
        borderBottomWidth: 1,
        marginBottom: 12,
    },
    itemImage: {
        width: 70,
        height: 70,
        borderRadius: 8,
        marginRight: 16,
    },
    itemDetails: {
        flex: 1,
    },
    itemTitle: {
        fontSize: 15,
        fontWeight: '500',
        marginBottom: 4,
    },
    itemMeta: {
        flexDirection: 'row',
        marginBottom: 4,
    },
    itemPrice: {
        fontSize: 14,
        marginRight: 12,
    },
    itemQuantity: {
        fontSize: 14,
    },
    itemSubtotal: {
        fontSize: 15,
        fontWeight: 'bold',
    },
    addressName: {
        fontSize: 15,
        fontWeight: '500',
        marginBottom: 4,
    },
    addressLine: {
        fontSize: 14,
        lineHeight: 20,
    },
    paymentRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    paymentInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    paymentIcon: {
        marginRight: 12,
    },
    paymentMethod: {
        fontSize: 15,
        fontWeight: '500',
    },
    paymentDetail: {
        fontSize: 14,
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
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingTop: 12,
        marginTop: 4,
        borderTopWidth: 1,
    },
    totalLabel: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    totalValue: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    helpCard: {
        borderRadius: 12,
        padding: 16,
        marginHorizontal: 16,
        marginBottom: 24,
    },
    helpTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    helpText: {
        fontSize: 14,
        lineHeight: 20,
        marginBottom: 16,
    },
    helpButton: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 24,
        alignItems: 'center',
    },
    helpButtonText: {
        fontSize: 14,
        fontWeight: '600',
    },
}); 