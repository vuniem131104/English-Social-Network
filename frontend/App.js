import React, { useContext } from "react";
import { registerRootComponent } from 'expo';
import { AppRegistry, View } from 'react-native';
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Provider, useSelector } from "react-redux";
import store from "./store";
import { useFonts } from "expo-font";

import SignIn from "./screens/auth/SignIn";
import SignUp from "./screens/auth/SignUp";
import CartScreen from "./screens/Shopping/CartScreen";
import OrderConfirmationScreen from "./screens/Shopping/OrderConfirmationScreen";
import Profile from "./screens/Profile/Profile";
import EditProfile from "./screens/Profile/EditProfile";
import PostDetail from "./screens/Home/PostDetail";
import { StatusBar } from "react-native";
import { AuthContext, AuthProvider } from "./context/authContext";
import HomeTabs from "./navigation/HomeTabs";
import RequireAuthentication from "./navigation/RequireAuth";
import { MyDarkTheme, MyLightTheme } from "./GlobalStyles";
import MainLayout from "./components/layout/MainLayout";

const Stack = createNativeStackNavigator();

const AuthScreenWrapper = ({children}) => {
  return <MainLayout hideNavbar>{children}</MainLayout>;
};

const NormalScreenWrapper = ({children}) => {
  return <MainLayout>{children}</MainLayout>;
};

const AppContent = () => {
  const isDarkMode = useSelector(state => state.theme.isDarkMode);
  const userToken = useContext(AuthContext).userToken;
  return (
    <NavigationContainer theme={isDarkMode ? MyDarkTheme : MyLightTheme}>
      <StatusBar />
      <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName={userToken != null ? "Home" : "SignIn"}>
        <Stack.Screen name="Home">
          {props => (
            <NormalScreenWrapper>
              <HomeTabs {...props} />
            </NormalScreenWrapper>
          )}
        </Stack.Screen>
        <Stack.Screen name="SignIn">
          {props => (
            <AuthScreenWrapper>
              <SignIn {...props} />
            </AuthScreenWrapper>
          )}
        </Stack.Screen>
        <Stack.Screen name="SignUp">
          {props => (
            <AuthScreenWrapper>
              <SignUp {...props} />
            </AuthScreenWrapper>
          )}
        </Stack.Screen>
        <Stack.Screen name="Cart">
          {props => (
            <NormalScreenWrapper>
              <RequireAuthentication Component={CartScreen} userToken={userToken} {...props} />
            </NormalScreenWrapper>
          )}
        </Stack.Screen>
        <Stack.Screen name="OrderConfirmation">
          {props => (
            <NormalScreenWrapper>
              <RequireAuthentication Component={OrderConfirmationScreen} userToken={userToken} {...props} />
            </NormalScreenWrapper>
          )}
        </Stack.Screen>
        <Stack.Screen name="Profile">
          {props => (
            <NormalScreenWrapper>
              <RequireAuthentication Component={Profile} userToken={userToken} {...props} />
            </NormalScreenWrapper>
          )}
        </Stack.Screen>
        <Stack.Screen name="EditProfile">
          {props => (
            <NormalScreenWrapper>
              <RequireAuthentication Component={EditProfile} userToken={userToken} {...props} />
            </NormalScreenWrapper>
          )}
        </Stack.Screen>
        <Stack.Screen name="PostDetail">
          {props => (
            <NormalScreenWrapper>
              <PostDetail {...props} />
            </NormalScreenWrapper>
          )}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const App = () => {

  const [fontsLoaded, error] = useFonts({
    "Roboto-Medium": require("./assets/fonts/Roboto-Medium.ttf"),
    "Inter-Medium": require("./assets/fonts/Inter-Medium.ttf"),
    "Inter-Regular": require("./assets/fonts/Inter-Regular.ttf"),
    "Inter-Bold": require("./assets/fonts/Inter-Bold.ttf"),
    "Inter-SemiBold": require("./assets/fonts/Inter-SemiBold.ttf"),
    "PlayfairDisplay-Medium": require("./assets/fonts/PlayfairDisplay-Medium.ttf"),
    "PlayfairDisplay-Regular": require("./assets/fonts/PlayfairDisplay-Regular.ttf"),
    "PlayfairDisplay-Bold": require("./assets/fonts/PlayfairDisplay-Bold.ttf"),
  });

  if (!fontsLoaded && !error) {
    return null;
  } else console.log("Fonts loaded");

  return (
    <Provider store={store}>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Provider>
  );

};
export default App;
AppRegistry.registerComponent('main', () => App);
registerRootComponent(App);
