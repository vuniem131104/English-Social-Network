import * as React from "react";
import { Image } from "expo-image";
import { StyleSheet, Text, View, Pressable, Switch, SafeAreaView, Alert } from "react-native";
import { Padding, Color, FontSize, Border, FontFamily } from "../../GlobalStyles";
import ButtonPrimary from "../button/ButtonPrimary";
import { useNavigation, useTheme } from "@react-navigation/native";
import { useSelector, useDispatch } from "react-redux";
import { toggleTheme } from "../../store";
import { useContext } from "react";
import { AuthContext } from "../../context/authContext";

const SettingsMenu = ({ closeMenu }) => {
  const { colors } = useTheme();
  const { logout, userToken, userInfo } = useContext(AuthContext);
  const isDarkMode = useSelector(state => state.theme.isDarkMode);
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const toggleSwitch = () => {
    dispatch(toggleTheme());
  };

  const handleNavigation = (route, params = {}) => {
    closeMenu && closeMenu();
    navigation.navigate(route, params);
  };

  const handleAboutUs = () => {
    closeMenu && closeMenu();
    Alert.alert(
      "Về chúng tôi",
      "English Social là nền tảng học tiếng Anh xã hội hóa. Chúng tôi cung cấp không gian để người dùng chia sẻ kiến thức, mẹo học tiếng Anh và các tài nguyên học tập chất lượng.",
      [{ text: "Đóng" }]
    );
  };

  const handleFeedback = () => {
    closeMenu && closeMenu();
    Alert.alert(
      "Phản hồi",
      "Chúng tôi rất mong nhận được phản hồi từ bạn! Vui lòng gửi phản hồi của bạn đến email: feedback@englishsocial.com",
      [{ text: "Đóng" }]
    );
  };

  const handleProfilePress = () => {
    if (userToken) {
      handleNavigation('UserProfile', { userId: userInfo?.id });
    } else {
      Alert.alert(
        "Đăng nhập", 
        "Bạn cần đăng nhập để xem trang cá nhân",
        [
          { text: "Hủy", style: "cancel" },
          { text: "Đăng nhập", onPress: () => handleNavigation("SignIn") }
        ]
      );
    }
  };

  return (
    <View style={[styles.settingsMenu, {backgroundColor: colors.surfaceContainerHigh, shadowColor: colors.primaryShadow}]}>
      <MenuItem 
        colors={colors} 
        imageSource={isDarkMode ? require("../../assets/Explore2.png") : require("../../assets/explore.png")} 
        text="Về chúng tôi" 
        func={handleAboutUs} 
      />
      
      <MenuItem 
        colors={colors} 
        imageSource={isDarkMode ? require("../../assets/item.png") : require("../../assets/navbaritem.png")} 
        text="Cài đặt" 
        func={() => handleNavigation("Settings")} 
      />
      
      {/* <MenuItem 
        colors={colors} 
        imageSource={isDarkMode ? require("../../assets/Frame14.png") : require("../../assets/frame-14.png")} 
        text="Giỏ hàng" 
        func={() => handleNavigation("Cart")} 
      /> */}
      
      <MenuItem 
        colors={colors} 
        isDarkMode={isDarkMode} 
        imageSource={isDarkMode ? require("../../assets/Frame15.png") : require("../../assets/frame-141.png")} 
        text="Phản hồi" 
        func={handleFeedback} 
      />
      
      {userToken != null && userInfo && (
        <MenuItem 
          colors={colors} 
          isDarkMode={isDarkMode} 
          imageSource={isDarkMode ? require("../../assets/Explore2.png") : require("../../assets/explore.png")} 
          text={userInfo?.username || userInfo?.name || 'Người dùng'} 
          func={handleProfilePress}
        />
      )}
      
      {userToken == null ? (
        <View style={[styles.flexRow, styles.flexRowButton]}>
          <ButtonPrimary text="Sign in"
            textSize={FontSize.labelLargeBold_size}
            textMargin={8}
            buttonPrimaryFlex={1}
            onPressButton={() => { handleNavigation("SignIn") }}
          />
          <ButtonPrimary text="Sign up"
            textSize={FontSize.labelLargeBold_size}
            buttonPrimaryBackgroundColor={colors.primaryFixed}
            buttonPrimaryMarginLeft={15}
            buttonPrimaryFlex={1}
            onPressButton={() => { handleNavigation("SignUp") }}
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
                closeMenu && closeMenu();
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
    marginTop: 13,
  },
  themeToggleContainer: {
    marginTop: 10,
    marginBottom: 5,
    justifyContent: "center",
    alignItems: "center",
  }
});

export default SettingsMenu;
