import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useTheme, useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { baseUrl } from '../../services/api';
import { AuthContext } from '../../context/authContext';
import * as ImagePicker from 'expo-image-picker';

const EditProfile = () => {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const isDarkMode = useSelector(state => state.theme.isDarkMode);
  const { userToken, userInfo } = useContext(AuthContext);

  // Define dark mode specific colors
  const darkBackground = isDarkMode ? '#121212' : colors.surfaceContainer;
  const cardBackground = isDarkMode ? 'rgba(32, 32, 36, 0.95)' : colors.surfaceContainerLow;
  const borderColor = isDarkMode ? 'rgba(70, 70, 80, 0.7)' : 'rgba(150, 150, 150, 0.3)';
  const textColor = isDarkMode ? '#FFFFFF' : '#000000';
  const placeholderColor = isDarkMode ? '#888888' : '#AAAAAA';

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profileData, setProfileData] = useState({
    name: '',
    bio: '',
    avatar: '',
    banner: ''
  });

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    setLoading(true);
    try {
      const config = {
        headers: { Authorization: `Bearer ${userToken}` }
      };

      const response = await axios.get(`${baseUrl}/profile/${userInfo.id}`, config);
      console.log('Profile data:', response.data);

      setProfileData({
        name: response.data.name || '',
        bio: response.data.bio || '',
        avatar: response.data.avatar || '',
        banner: response.data.banner || ''
      });
    } catch (error) {
      console.error('Error fetching profile data:', error);
      Alert.alert('Error', 'Could not load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!profileData.name.trim()) {
      Alert.alert('Error', 'Name cannot be empty');
      return;
    }

    setSaving(true);
    try {
      const config = {
        headers: { Authorization: `Bearer ${userToken}` }
      };

      const response = await axios.put(
        `${baseUrl}/profile/edit`,
        {
          name: profileData.name,
          bio: profileData.bio,
          avatar: profileData.avatar,
          banner: profileData.banner
        },
        config
      );

      console.log('Profile update response:', response.data);
      Alert.alert('Success', 'Profile updated successfully');
      navigation.goBack();
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Could not update profile');
    } finally {
      setSaving(false);
    }
  };

  const pickImage = async (type) => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: type === 'avatar' ? [1, 1] : [16, 9],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        // In a real app, you would upload the image to your server here
        // and get back a URL to use. For this example, we'll just use the local URI
        // as if it were already uploaded.
        
        // Simulating an image upload by using the local URI
        const imageUri = result.assets[0].uri;
        
        // In a real implementation, you would upload the image and get a URL back
        // For now, we'll just update the state with the local URI
        setProfileData({
          ...profileData,
          [type]: imageUri
        });
        
        Alert.alert('Success', `${type.charAt(0).toUpperCase() + type.slice(1)} updated. Save to apply changes.`);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Could not select image');
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: darkBackground }]}>
        <View style={[styles.customHeader, { backgroundColor: isDarkMode ? '#121212' : colors.surfaceContainer }]}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={[styles.backButton, { backgroundColor: colors.primary }]}
          >
            <Ionicons name="arrow-back" size={20} color="#fff" />
          </TouchableOpacity>

          <Text style={[styles.headerTitle, { color: colors.onSurface }]}>
            Edit Profile
          </Text>

          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: darkBackground }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View style={[styles.customHeader, { backgroundColor: isDarkMode ? '#121212' : colors.surfaceContainer }]}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={[styles.backButton, { backgroundColor: colors.primary }]}
          >
            <Ionicons name="arrow-back" size={20} color="#fff" />
          </TouchableOpacity>

          <Text style={[styles.headerTitle, { color: colors.onSurface }]}>
            Edit Profile
          </Text>

          <TouchableOpacity
            onPress={handleSaveProfile}
            disabled={saving}
            style={[styles.saveButton, { backgroundColor: colors.primary }]}
          >
            {saving ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Feather name="check" size={20} color="#fff" />
            )}
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollView}>
          <View style={styles.formContainer}>
            {/* Banner Image */}
            <View style={styles.bannerContainer}>
              {profileData.banner ? (
                <Image
                  source={{ uri: profileData.banner }}
                  style={styles.bannerImage}
                  resizeMode="cover"
                />
              ) : (
                <View style={[styles.defaultBanner, { backgroundColor: colors.primary }]} />
              )}
              <TouchableOpacity
                style={[styles.editImageButton, { backgroundColor: colors.primary }]}
                onPress={() => pickImage('banner')}
              >
                <Feather name="edit-2" size={16} color="#fff" />
              </TouchableOpacity>
            </View>

            {/* Avatar Image */}
            <View style={styles.avatarSection}>
              <View style={styles.avatarContainer}>
                <Image
                  source={
                    profileData.avatar
                      ? { uri: profileData.avatar }
                      : { uri: `https://ui-avatars.com/api/?name=${encodeURIComponent(profileData.name || 'User')}&background=random` }
                  }
                  style={styles.avatar}
                  resizeMode="cover"
                />
                <TouchableOpacity
                  style={[styles.editAvatarButton, { backgroundColor: colors.primary }]}
                  onPress={() => pickImage('avatar')}
                >
                  <Feather name="camera" size={16} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Form Fields */}
            <View style={styles.formFields}>
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: textColor }]}>Name</Text>
                <TextInput
                  style={[styles.input, { 
                    backgroundColor: cardBackground, 
                    borderColor: borderColor,
                    color: textColor
                  }]}
                  placeholder="Your name"
                  placeholderTextColor={placeholderColor}
                  value={profileData.name}
                  onChangeText={(text) => setProfileData({ ...profileData, name: text })}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: textColor }]}>Bio</Text>
                <TextInput
                  style={[styles.textArea, { 
                    backgroundColor: cardBackground, 
                    borderColor: borderColor,
                    color: textColor
                  }]}
                  placeholder="Tell us about yourself"
                  placeholderTextColor={placeholderColor}
                  value={profileData.bio}
                  onChangeText={(text) => setProfileData({ ...profileData, bio: text })}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  customHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  backButton: {
    width: 35,
    height: 35,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
  },
  placeholder: {
    width: 35,
  },
  saveButton: {
    width: 35,
    height: 35,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  formContainer: {
    padding: 15,
  },
  bannerContainer: {
    height: 150,
    borderRadius: 10,
    overflow: 'hidden',
    position: 'relative',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  defaultBanner: {
    width: '100%',
    height: '100%',
    opacity: 0.8,
  },
  editImageButton: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarSection: {
    alignItems: 'center',
    marginTop: -40,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: '#fff',
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 25,
    height: 25,
    borderRadius: 12.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  formFields: {
    marginTop: 20,
  },
  inputGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    marginBottom: 5,
    fontFamily: 'Inter-Medium',
  },
  input: {
    height: 45,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
  },
  textArea: {
    height: 100,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingTop: 10,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
  },
});

export default EditProfile;
