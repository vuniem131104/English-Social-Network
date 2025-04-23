import { createNativeStackNavigator } from "@react-navigation/native-stack";
import ShopScreen from "../screens/Shopping/ShopScreen";
import CartScreen from "../screens/Shopping/CartScreen";
import OrderConfirmationScreen from "../screens/Shopping/OrderConfirmationScreen";
import ProductDetailScreen from "../screens/Shopping/ProductDetailScreen";
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';

const ShoppingStack = createNativeStackNavigator();

// Hàm này sẽ quyết định liệu có hiển thị tab bar hay không dựa vào route hiện tại
export const getShoppingTabBarVisibility = (route) => {
    // Lấy tên route hiện tại (màn hình đang active)
    const routeName = getFocusedRouteNameFromRoute(route) ?? 'Shop';
    
    // Ẩn thanh TabBar trong những màn hình cụ thể
    if (routeName === 'ProductDetail' || routeName === 'Cart' || routeName === 'OrderConfirmation') {
        return false;
    }
    
    // Hiển thị tab bar cho các màn hình còn lại
    return true;
};

export default function ShoppingStackScreen() {
    return (
        <ShoppingStack.Navigator 
            screenOptions={{ 
                headerShown: false,
                contentStyle: { backgroundColor: 'white' },
                animation: 'slide_from_right'
            }}
        >
            <ShoppingStack.Screen
                name="Shop"
                component={ShopScreen}
            />
            <ShoppingStack.Screen 
                name="ProductDetail" 
                component={ProductDetailScreen}
            />
            <ShoppingStack.Screen 
                name="Cart" 
                component={CartScreen}
            />
            <ShoppingStack.Screen 
                name="OrderConfirmation" 
                component={OrderConfirmationScreen}
            />
        </ShoppingStack.Navigator>
    );
}
