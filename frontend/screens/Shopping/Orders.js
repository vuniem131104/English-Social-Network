import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    Image
} from 'react-native';
import { useTheme } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';

const Orders = () => {
    const { colors } = useTheme();
    const navigation = useNavigation();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const isDarkMode = useSelector(state => state.theme.isDarkMode);

    useEffect(() => {
        // Simulating API fetch with setTimeout
        setTimeout(() => {
            setOrders(generateMockOrders());
            setLoading(false);
        }, 1500);
    }, []);

    const generateMockOrders = () => {
        return [
            {
                id: 'ORD-123456',
                date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
                status: 'Delivered',
                total: 89.97,
                items: [
                    {
                        id: 1,
                        title: 'Advanced English Grammar in Use',
                        price: 29.99,
                        quantity: 1,
                        image: 'https://m.media-amazon.com/images/I/41vWr4aYzGL._SY445_SX342_.jpg'
                    },
                    {
                        id: 2,
                        title: 'English Vocabulary in Use: Advanced',
                        price: 29.99,
                        quantity: 2,
                        image: 'https://m.media-amazon.com/images/I/41KFBJwg-rL._SY445_SX342_.jpg'
                    }
                ]
            },
            {
                id: 'ORD-123457',
                date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
                status: 'Delivered',
                total: 55.98,
                items: [
                    {
                        id: 3,
                        title: 'IELTS Preparation Course',
                        price: 55.98,
                        quantity: 1,
                        image: 'https://m.media-amazon.com/images/I/51jq1M-vYvL._SY445_SX342_.jpg'
                    }
                ]
            },
            {
                id: 'ORD-123458',
                date: new Date().toISOString(),
                status: 'Processing',
                total: 127.97,
                items: [
                    {
                        id: 4,
                        title: 'Complete English Pronunciation Course',
                        price: 49.99,
                        quantity: 1,
                        image: 'https://m.media-amazon.com/images/I/41XvK8ZdxWL._SY445_SX342_.jpg'
                    },
                    {
                        id: 5,
                        title: 'Oxford Advanced Learner\'s Dictionary',
                        price: 38.99,
                        quantity: 2,
                        image: 'https://m.media-amazon.com/images/I/51C9KjaJ+ZL._SY445_SX342_.jpg'
                    }
                ]
            }
        ];
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

    const renderOrderItem = ({ item }) => {
        return (
            <TouchableOpacity
                style={[
                    styles.orderCard,
                    { backgroundColor: colors.surfaceContainerLow }
                ]}
                onPress={() => navigation.navigate('OrderDetail', { order: item })}
            >
                <View style={styles.orderHeader}>
                    <View>
                        <Text style={[styles.orderNumber, { color: colors.onSurface }]}>
                            {item.id}
                        </Text>
                        <Text style={[styles.orderDate, { color: colors.onSurfaceVariant }]}>
                            {formatDate(item.date)}
                        </Text>
                    </View>
                    <View style={styles.statusContainer}>
                        <View
                            style={[
                                styles.statusBadge,
                                { backgroundColor: getStatusColor(item.status) + '20' }
                            ]}
                        >
                            <Text
                                style={[
                                    styles.statusText,
                                    { color: getStatusColor(item.status) }
                                ]}
                            >
                                {item.status}
                            </Text>
                        </View>
                    </View>
                </View>

                <View style={styles.itemsPreviewContainer}>
                    {item.items.slice(0, 2).map((product) => (
                        <View key={product.id} style={styles.itemPreview}>
                            <Image
                                source={{ uri: product.image }}
                                style={styles.itemImage}
                            />
                            <View style={styles.itemInfo}>
                                <Text
                                    style={[styles.itemTitle, { color: colors.onSurface }]}
                                    numberOfLines={1}
                                >
                                    {product.title}
                                </Text>
                                <Text style={[styles.itemMeta, { color: colors.onSurfaceVariant }]}>
                                    Qty: {product.quantity} × ${product.price.toFixed(2)}
                                </Text>
                            </View>
                        </View>
                    ))}
                    {item.items.length > 2 && (
                        <Text style={[styles.moreItems, { color: colors.onSurfaceVariant }]}>
                            +{item.items.length - 2} more items
                        </Text>
                    )}
                </View>

                <View style={styles.orderFooter}>
                    <Text style={[styles.orderTotalLabel, { color: colors.onSurfaceVariant }]}>
                        Total:
                    </Text>
                    <Text style={[styles.orderTotal, { color: colors.onSurface }]}>
                        ${item.total.toFixed(2)}
                    </Text>
                </View>

                <MaterialIcons
                    name="chevron-right"
                    size={24}
                    color={colors.onSurfaceVariant}
                    style={styles.chevronIcon}
                />
            </TouchableOpacity>
        );
    };

    if (loading) {
        return (
            <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={[styles.loadingText, { color: colors.onSurfaceVariant }]}>
                    Loading your orders...
                </Text>
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <Text style={[styles.headerTitle, { color: colors.onSurface }]}>
                    My Orders
                </Text>
            </View>

            {orders.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <MaterialIcons
                        name="shopping-bag"
                        size={80}
                        color={colors.onSurfaceVariant}
                    />
                    <Text style={[styles.emptyTitle, { color: colors.onSurface }]}>
                        No orders yet
                    </Text>
                    <Text style={[styles.emptyMessage, { color: colors.onSurfaceVariant }]}>
                        When you place an order, it will appear here
                    </Text>
                    <TouchableOpacity
                        style={[styles.shopButton, { backgroundColor: colors.primary }]}
                        onPress={() => navigation.navigate('MainTab', { screen: 'Shop' })}
                    >
                        <Text style={[styles.shopButtonText, { color: colors.onPrimary }]}>
                            Browse Products
                        </Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <FlatList
                    data={orders}
                    renderItem={renderOrderItem}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                />
            )}
        </View>
    );
};

export default Orders;

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 10,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    listContent: {
        padding: 16,
    },
    orderCard: {
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        position: 'relative',
    },
    orderHeader: {
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
    statusContainer: {
        flexDirection: 'row',
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
    itemsPreviewContainer: {
        marginBottom: 16,
    },
    itemPreview: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    itemImage: {
        width: 50,
        height: 50,
        borderRadius: 6,
        marginRight: 12,
    },
    itemInfo: {
        flex: 1,
    },
    itemTitle: {
        fontSize: 14,
        fontWeight: '500',
    },
    itemMeta: {
        fontSize: 13,
        marginTop: 4,
    },
    moreItems: {
        fontSize: 13,
        marginTop: 4,
        fontStyle: 'italic',
    },
    orderFooter: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.05)',
        paddingTop: 12,
    },
    orderTotalLabel: {
        fontSize: 14,
        marginRight: 8,
    },
    orderTotal: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    chevronIcon: {
        position: 'absolute',
        right: 16,
        top: '50%',
        marginTop: -12,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 24,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginTop: 16,
    },
    emptyMessage: {
        fontSize: 16,
        textAlign: 'center',
        marginTop: 8,
        marginBottom: 24,
    },
    shopButton: {
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 24,
    },
    shopButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
}); 