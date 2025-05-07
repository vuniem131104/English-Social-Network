import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import NavbarBottom from "../components/footer/NavbarBottom";
import ShoppingStackScreen, { getShoppingTabBarVisibility } from "./ShoppingStack";
import HomeStackScreen from "./HomeStack";
import SearchStackScreen from "./SearchStack";
import CreatePostStackScreen from "./CreatePostStack";
import FavoritesStackScreen from "./FavoritesStack";

const Tab = createBottomTabNavigator();
export default function HomeTabs() {
    return (
        <Tab.Navigator tabBar={props => <NavbarBottom  {...props} />} screenOptions={{ headerShown: false }}>
            <Tab.Screen
                name="Feed"
                component={HomeStackScreen}
                options={{ title: "Home" }}
            />
            <Tab.Screen
                name="Search"
                component={SearchStackScreen}
            />
            <Tab.Screen
                name="CreatePost"
                component={CreatePostStackScreen}
                options={{ title: "New Post" }}
            />
            <Tab.Screen
                name="Favorites"
                component={FavoritesStackScreen}
                options={{ title: "Activities" }}
            />
            <Tab.Screen
                name="Shopping"
                component={ShoppingStackScreen}
                options={({ route }) => ({
                    tabBarStyle: {
                        display: getShoppingTabBarVisibility(route) ? 'flex' : 'none'
                    }
                })}
            />
        </Tab.Navigator>
    );
}