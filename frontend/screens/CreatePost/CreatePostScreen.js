import React, { useState, useContext } from 'react';
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
  Platform,
  KeyboardAvoidingView
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import { baseUrl } from '../../services/api';
import { AuthContext } from '../../context/authContext';
import NavbarTop from '../../components/header/NavbarTop';

const CreatePostScreen = ({ navigation }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const { userToken } = useContext(AuthContext);

  const pickImage = async () => {
    // Yêu cầu quyền truy cập thư viện ảnh
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Thông báo', 'Cần quyền truy cập thư viện ảnh để tiếp tục!');
      return;
    }

    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert('Lỗi', 'Không thể chọn ảnh. Vui lòng thử lại!');
    }
  };

  const takePicture = async () => {
    // Yêu cầu quyền sử dụng camera
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Thông báo', 'Cần quyền truy cập camera để tiếp tục!');
      return;
    }

    try {
      let result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Error taking picture:", error);
      Alert.alert('Lỗi', 'Không thể chụp ảnh. Vui lòng thử lại!');
    }
  };

  const removeImage = () => {
    setImage(null);
  };

  const uploadImage = async () => {
    if (!image) return null;

    try {
      const formData = new FormData();
      const filename = image.split('/').pop();
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image';

      formData.append('file', {
        uri: Platform.OS === 'android' ? image : image.replace('file://', ''),
        name: filename,
        type
      });

      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${userToken}`
        }
      };

      const response = await axios.post(`${baseUrl}/upload`, formData, config);
      return response.data.url;
    } catch (error) {
      console.error("Error uploading image:", error);
      throw new Error('Không thể tải ảnh lên. Vui lòng thử lại!');
    }
  };

  const createPost = async () => {
    if (!title.trim()) {
      Alert.alert('Thông báo', 'Vui lòng nhập tiêu đề bài viết!');
      return;
    }

    if (!description.trim()) {
      Alert.alert('Thông báo', 'Vui lòng nhập nội dung bài viết!');
      return;
    }

    if (!userToken) {
      Alert.alert('Thông báo', 'Bạn cần đăng nhập để thực hiện chức năng này!');
      navigation.navigate('SignIn');
      return;
    }

    setLoading(true);

    try {
      let imageUrl = null;
      if (image) {
        imageUrl = await uploadImage();
      }

      const config = {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`
        }
      };

      const postData = {
        title,
        description,
        mainImage: imageUrl
      };

      await axios.post(`${baseUrl}/posts`, postData, config);
      
      Alert.alert('Thành công', 'Bài viết đã được tạo thành công!', [
        { text: 'OK', onPress: () => navigation.navigate('Feed') }
      ]);
      
      // Reset form
      setTitle('');
      setDescription('');
      setImage(null);
    } catch (error) {
      console.error("Error creating post:", error);
      Alert.alert('Lỗi', 'Không thể tạo bài viết. Vui lòng thử lại!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <LinearGradient colors={['#BE0303', '#1c1a1a', '#000000']} style={styles.container}>
        <NavbarTop />
        
        <ScrollView style={styles.scrollView}>
          <Text style={styles.headerTitle}>Tạo bài viết mới</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Tiêu đề</Text>
            <TextInput
              style={styles.input}
              placeholder="Nhập tiêu đề bài viết..."
              placeholderTextColor="#999"
              value={title}
              onChangeText={setTitle}
              maxLength={100}
            />
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Nội dung</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Chia sẻ suy nghĩ của bạn..."
              placeholderTextColor="#999"
              value={description}
              onChangeText={setDescription}
              multiline
              textAlignVertical="top"
            />
          </View>
          
          <View style={styles.imageSection}>
            <Text style={styles.label}>Hình ảnh</Text>
            
            {image ? (
              <View style={styles.selectedImageContainer}>
                <Image source={{ uri: image }} style={styles.selectedImage} />
                <TouchableOpacity style={styles.removeImageButton} onPress={removeImage}>
                  <Ionicons name="close-circle" size={24} color="#BE0303" />
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.imageOptions}>
                <TouchableOpacity style={styles.imageButton} onPress={pickImage}>
                  <MaterialIcons name="photo-library" size={24} color="#fff" />
                  <Text style={styles.imageButtonText}>Chọn từ thư viện</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.imageButton} onPress={takePicture}>
                  <MaterialIcons name="camera-alt" size={24} color="#fff" />
                  <Text style={styles.imageButtonText}>Chụp ảnh mới</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
          
          <TouchableOpacity
            style={[styles.submitButton, loading && styles.disabledButton]}
            onPress={createPost}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Ionicons name="send" size={20} color="#fff" />
                <Text style={styles.submitButtonText}>Đăng bài viết</Text>
              </>
            )}
          </TouchableOpacity>
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    padding: 15,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 24,
    fontFamily: 'PlayfairDisplay-Bold',
    marginBottom: 20,
    marginTop: 10,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'PlayfairDisplay-Bold',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
    color: '#fff',
    padding: 12,
    fontFamily: 'PlayfairDisplay-Regular',
    fontSize: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  textArea: {
    height: 150,
    textAlignVertical: 'top',
  },
  imageSection: {
    marginBottom: 20,
  },
  imageOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  imageButton: {
    backgroundColor: 'rgba(190, 3, 3, 0.5)',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    flex: 0.48,
  },
  imageButtonText: {
    color: '#fff',
    marginTop: 8,
    fontFamily: 'PlayfairDisplay-Regular',
    fontSize: 14,
  },
  selectedImageContainer: {
    position: 'relative',
    marginTop: 10,
  },
  selectedImage: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    resizeMode: 'cover',
  },
  removeImageButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitButton: {
    backgroundColor: '#BE0303',
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
    marginBottom: 30,
  },
  disabledButton: {
    backgroundColor: '#666',
    opacity: 0.7,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'PlayfairDisplay-Bold',
    marginLeft: 8,
  },
});

export default CreatePostScreen; 