import * as React from "react";
import { Image } from "expo-image";
import { StyleSheet, Text, View, Pressable, Switch, SafeAreaView } from "react-native";
import { Padding, Color, FontSize, Border, FontFamily } from "../../GlobalStyles";
import ButtonPrimary from "../button/ButtonPrimary";
import { useNavigation, useTheme } from "@react-navigation/native";
import { useSelector, useDispatch } from "react-redux";
import { toggleTheme } from "../../store";
import { useContext } from "react";
import { AuthContext } from "../../context/authContext";

const SettingsMenu = () => {
  const { colors } = useTheme();
  const { logout, userToken, userInfo } = useContext(AuthContext);
  const isDarkMode = useSelector(state => state.theme.isDarkMode);
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const toggleSwitch = () => {
    dispatch(toggleTheme());
  };

  return (
    <View style={[styles.settingsMenu, {backgroundColor: colors.surfaceContainerHigh, shadowColor: colors.primaryShadow}]}>
      <MenuItem colors={colors} imageSource={isDarkMode ? require("../../assets/Explore2.png") : require("../../assets/explore.png")} text="About" />
      <MenuItem colors={colors} imageSource={isDarkMode ? require("../../assets/item.png") : require("../../assets/navbaritem.png")} text="Setting" />
      <MenuItem colors={colors} imageSource={isDarkMode ? require("../../assets/Frame14.png") : require("../../assets/frame-14.png")} text="Cart" func={() => {
        navigation.navigate("Cart");
      }} />
      <MenuItem colors={colors} isDarkMode={isDarkMode} imageSource={isDarkMode ? require("../../assets/Frame15.png") : require("../../assets/frame-141.png")} text="Feedback" />
      
      {userToken != null && userInfo && (
        <MenuItem 
          colors={colors} 
          isDarkMode={isDarkMode} 
          imageSource={isDarkMode ? require("../../assets/Explore2.png") : require("../../assets/explore.png")} 
          text={userInfo?.username || userInfo?.name || 'Người dùng'} 
        />
      )}
      
      {userToken == null ? (
        <View style={[styles.flexRow, styles.flexRowButton]}>
          <ButtonPrimary text="Sign in"
            textSize={FontSize.labelLargeBold_size}
            textMargin={8}
            buttonPrimaryFlex={1}
            onPressButton={() => { navigation.navigate("SignIn") }}
          />
          <ButtonPrimary text="Sign up"
            textSize={FontSize.labelLargeBold_size}
            buttonPrimaryBackgroundColor={colors.primaryFixed}
            buttonPrimaryMarginLeft={15}
            buttonPrimaryFlex={1}
            onPressButton={() => { navigation.navigate("SignUp") }}
          />
        </View>
      ) : (
        <View style={[styles.flexRow, styles.flexRowButton]}>
          <ButtonPrimary text="Logout"
            textSize={FontSize.labelLargeBold_size}
            textMargin={8}
            buttonPrimaryFlex={1}
            onPressButton={() => { 
              try {
                logout();
              } catch (error) {
                console.error("Logout error:", error);
              }
            }}
          />
        </View>
      )}
      
      <View style={styles.themeToggleContainer}>
        <Text style={[styles.menuItemText, {color: colors.onSurface, marginBottom: 5}]}>
          {isDarkMode ? 'Dark Mode' : 'Light Mode'}
        </Text>
        <Switch
          trackColor={{ false: '#616057', true: '#767577' }}
          thumbColor={isDarkMode ? '#f4f3f4' : '#ebe134'}
          ios_backgroundColor="#3e3e3e"
          onValueChange={toggleSwitch}
          value={isDarkMode}
        />
      </View>
    </View>
  );
};

const MenuItem = ({ colors, imageSource, text, func }) => {
  return (
    <Pressable onPress={func} style={[styles.menuItem, styles.flexRow]}>
      <Image style={styles.menuItemImage} source={imageSource} />
      <Text style={[styles.menuItemText, {color: colors.onSurface}]}>{text}</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  menuItem: {
    padding: 10,
    marginTop: 5,
  },
  menuItemImage: {
    width: 25,
    height: 25,
  },
  menuItemText: {
    marginLeft: 10,
    fontFamily: FontFamily.labelLargeMedium,
    fontSize: FontSize.labelLargeBold_size,
  },
  flexRow: {
    flexDirection: "row",
  },
  flexRowButton: {
    paddingTop: 10,
    justifyContent: "space-between",
  },
  settingsMenu: {
    width: 237,
    padding: Padding.p_3xs,
    justifyContent: "center",
    shadowOffset: {
      width: 1,
      height: 1,
    },
    shadowRadius: 10,
    elevation: 10,
    shadowOpacity: 0.5,
    borderRadius: Border.br_3xs,
  },
  themeToggleContainer: {
    marginTop: 10,
    marginBottom: 5,
    justifyContent: "center",
    alignItems: "center",
  }
});

export default SettingsMenu;
