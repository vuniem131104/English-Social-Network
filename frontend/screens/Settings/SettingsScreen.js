import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Switch,
  TouchableOpacity,
  SafeAreaView,
  Alert
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useTheme, useNavigation } from '@react-navigation/native';
import { Feather, Ionicons, MaterialIcons } from '@expo/vector-icons';
import NavbarTop from '../../components/header/NavbarTop';
import { toggleDarkMode } from '../../redux/slices/themeSlice';

const SettingsScreen = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const { colors } = useTheme();
  const isDarkMode = useSelector(state => state.theme.isDarkMode);
  
  // Local states for settings
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [autoPlayVideos, setAutoPlayVideos] = useState(false);
  const [language, setLanguage] = useState('English');
  const [dataUsage, setDataUsage] = useState('Medium');
  
  // Define dark mode specific colors
  const backgroundColor = isDarkMode ? '#121212' : colors.surfaceContainer;
  const cardBackground = isDarkMode ? 'rgba(32, 32, 36, 0.95)' : colors.surfaceContainerLow;
  const borderColor = isDarkMode ? 'rgba(70, 70, 80, 0.7)' : 'rgba(150, 150, 150, 0.3)';
  const textColor = isDarkMode ? 'rgba(220, 220, 225, 0.9)' : colors.onSurface;
  const secondaryText = isDarkMode ? '#aaa' : '#777';
  
  const handleLogout = () => {
    Alert.alert(
      "Confirm Logout",
      "Are you sure you want to log out?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        { 
          text: "Logout", 
          onPress: () => {
            // Implement logout logic here
            navigation.reset({
              index: 0,
              routes: [{ name: 'Login' }],
            });
          },
          style: "destructive"
        }
      ]
    );
  };
  
  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "Are you sure you want to delete your account? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        { 
          text: "Delete", 
          onPress: () => {
            // Implement account deletion logic here
            Alert.alert("Account Deleted", "Your account has been successfully deleted.");
            navigation.reset({
              index: 0,
              routes: [{ name: 'Login' }],
            });
          },
          style: "destructive"
        }
      ]
    );
  };
  
  const handleLanguageChange = () => {
    // This would be expanded in a real app to show a language picker
    Alert.alert(
      "Select Language",
      "Currently only English is supported.",
      [
        { text: "OK", onPress: () => {} }
      ]
    );
  };
  
  const handleDataUsageChange = () => {
    // This would be expanded in a real app to show data usage options
    Alert.alert(
      "Data Usage",
      "Choose how much data the app can use:",
      [
        { text: "Low", onPress: () => setDataUsage("Low") },
        { text: "Medium", onPress: () => setDataUsage("Medium") },
        { text: "High", onPress: () => setDataUsage("High") }
      ]
    );
  };

  const renderSectionHeader = (icon, title) => (
    <View style={styles.sectionHeader}>
      {icon}
      <Text style={[styles.sectionTitle, { color: textColor }]}>{title}</Text>
    </View>
  );
  
  const renderToggleItem = (icon, title, description, value, onValueChange) => (
    <View style={[styles.settingItem, { borderBottomColor: borderColor }]}>
      <View style={styles.settingInfo}>
        {icon}
        <View style={styles.settingText}>
          <Text style={[styles.settingTitle, { color: textColor }]}>{title}</Text>
          <Text style={[styles.settingDescription, { color: secondaryText }]}>{description}</Text>
        </View>
      </View>
      <Switch
        trackColor={{ false: '#767577', true: colors.primary }}
        thumbColor={value ? '#f5f5f5' : '#f4f3f4'}
        ios_backgroundColor="#3e3e3e"
        onValueChange={onValueChange}
        value={value}
      />
    </View>
  );
  
  const renderSelectItem = (icon, title, description, value, onPress) => (
    <TouchableOpacity
      style={[styles.settingItem, { borderBottomColor: borderColor }]}
      onPress={onPress}
    >
      <View style={styles.settingInfo}>
        {icon}
        <View style={styles.settingText}>
          <Text style={[styles.settingTitle, { color: textColor }]}>{title}</Text>
          <Text style={[styles.settingDescription, { color: secondaryText }]}>{description}</Text>
        </View>
      </View>
      <View style={styles.selectValue}>
        <Text style={[styles.valueText, { color: textColor }]}>{value}</Text>
        <Feather name="chevron-right" size={20} color={secondaryText} />
      </View>
    </TouchableOpacity>
  );
  
  const renderButton = (icon, title, description, type, onPress) => (
    <TouchableOpacity
      style={[styles.settingItem, { borderBottomColor: borderColor }]}
      onPress={onPress}
    >
      <View style={styles.settingInfo}>
        {icon}
        <View style={styles.settingText}>
          <Text 
            style={[
              styles.settingTitle, 
              { color: type === 'danger' ? '#ff3b30' : textColor }
            ]}
          >
            {title}
          </Text>
          <Text style={[styles.settingDescription, { color: secondaryText }]}>{description}</Text>
        </View>
      </View>
      <Feather name="chevron-right" size={20} color={secondaryText} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <NavbarTop title="Settings" />
      <ScrollView style={styles.scrollView}>
        {/* Appearance Settings */}
        <View style={[styles.card, { backgroundColor: cardBackground, borderColor }]}>
          {renderSectionHeader(
            <Ionicons name="color-palette-outline" size={22} color={colors.primary} />,
            "Appearance"
          )}
          
          {renderToggleItem(
            <Ionicons name="moon-outline" size={22} color={isDarkMode ? colors.primary : textColor} style={styles.itemIcon} />,
            "Dark Mode",
            "Switch between light and dark themes",
            isDarkMode,
            () => dispatch(toggleDarkMode())
          )}
          
          {renderSelectItem(
            <Ionicons name="language-outline" size={22} color={textColor} style={styles.itemIcon} />,
            "Language",
            "Set your preferred language",
            language,
            handleLanguageChange
          )}
        </View>
        
        {/* Notification Settings */}
        <View style={[styles.card, { backgroundColor: cardBackground, borderColor }]}>
          {renderSectionHeader(
            <Ionicons name="notifications-outline" size={22} color={colors.primary} />,
            "Notifications"
          )}
          
          {renderToggleItem(
            <Ionicons name="notifications-outline" size={22} color={notificationsEnabled ? colors.primary : textColor} style={styles.itemIcon} />,
            "Push Notifications",
            "Receive updates and notifications",
            notificationsEnabled,
            () => setNotificationsEnabled(prev => !prev)
          )}
          
          {renderToggleItem(
            <Ionicons name="volume-medium-outline" size={22} color={soundEnabled ? colors.primary : textColor} style={styles.itemIcon} />,
            "Sound",
            "Enable notification sounds",
            soundEnabled,
            () => setSoundEnabled(prev => !prev)
          )}
        </View>
        
        {/* Content Settings */}
        <View style={[styles.card, { backgroundColor: cardBackground, borderColor }]}>
          {renderSectionHeader(
            <Ionicons name="settings-outline" size={22} color={colors.primary} />,
            "Content & Data"
          )}
          
          {renderToggleItem(
            <Ionicons name="play-outline" size={22} color={autoPlayVideos ? colors.primary : textColor} style={styles.itemIcon} />,
            "Auto-play Videos",
            "Automatically play videos while scrolling",
            autoPlayVideos,
            () => setAutoPlayVideos(prev => !prev)
          )}
          
          {renderSelectItem(
            <Ionicons name="cellular-outline" size={22} color={textColor} style={styles.itemIcon} />,
            "Data Usage",
            "Manage how much data the app uses",
            dataUsage,
            handleDataUsageChange
          )}
        </View>
        
        {/* Privacy Settings */}
        <View style={[styles.card, { backgroundColor: cardBackground, borderColor }]}>
          {renderSectionHeader(
            <Ionicons name="lock-closed-outline" size={22} color={colors.primary} />,
            "Privacy & Security"
          )}
          
          {renderButton(
            <Ionicons name="shield-checkmark-outline" size={22} color={textColor} style={styles.itemIcon} />,
            "Privacy Settings",
            "Manage your privacy preferences",
            'normal',
            () => Alert.alert("Privacy Settings", "This feature is coming soon.")
          )}
          
          {renderButton(
            <Ionicons name="key-outline" size={22} color={textColor} style={styles.itemIcon} />,
            "Change Password",
            "Update your password",
            'normal',
            () => navigation.navigate('ChangePassword')
          )}
        </View>
        
        {/* Account Settings */}
        <View style={[styles.card, { backgroundColor: cardBackground, borderColor }]}>
          {renderSectionHeader(
            <Ionicons name="person-outline" size={22} color={colors.primary} />,
            "Account"
          )}
          
          {renderButton(
            <Ionicons name="information-circle-outline" size={22} color={textColor} style={styles.itemIcon} />,
            "About",
            "Learn about the app and our team",
            'normal',
            () => navigation.navigate('About')
          )}
          
          {renderButton(
            <Ionicons name="help-circle-outline" size={22} color={textColor} style={styles.itemIcon} />,
            "Help & Support",
            "Get assistance and support",
            'normal',
            () => Alert.alert("Help", "This feature is coming soon.")
          )}
          
          {renderButton(
            <Ionicons name="log-out-outline" size={22} color="#ff3b30" style={styles.itemIcon} />,
            "Logout",
            "Sign out of your account",
            'danger',
            handleLogout
          )}
          
          {renderButton(
            <Ionicons name="trash-outline" size={22} color="#ff3b30" style={styles.itemIcon} />,
            "Delete Account",
            "Permanently delete your account",
            'danger',
            handleDeleteAccount
          )}
        </View>
        
        {/* App Information */}
        <View style={styles.appInfo}>
          <Text style={[styles.appVersion, { color: secondaryText }]}>
            English Social v1.0.0
          </Text>
          <Text style={[styles.copyright, { color: secondaryText }]}>
            © 2023 English Social. All rights reserved.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  card: {
    marginHorizontal: 15,
    marginBottom: 15,
    borderRadius: 15,
    borderWidth: 0.5,
    overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'PlayfairDisplay-Bold',
    marginLeft: 10,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  itemIcon: {
    marginRight: 15,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 15,
    fontFamily: 'PlayfairDisplay-SemiBold',
    marginBottom: 3,
  },
  settingDescription: {
    fontSize: 13,
    fontFamily: 'PlayfairDisplay-Regular',
  },
  selectValue: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  valueText: {
    fontSize: 14,
    fontFamily: 'PlayfairDisplay-Medium',
    marginRight: 5,
  },
  appInfo: {
    alignItems: 'center',
    marginVertical: 20,
    paddingBottom: 20,
  },
  appVersion: {
    fontSize: 14,
    fontFamily: 'PlayfairDisplay-Regular',
    marginBottom: 5,
  },
  copyright: {
    fontSize: 12,
    fontFamily: 'PlayfairDisplay-Regular',
  },
});

export default SettingsScreen; 