import React, { useState, useContext } from "react";
import {
  Text,
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { useSelector } from "react-redux";
import { MaterialIcons, Ionicons, FontAwesome5, AntDesign } from "@expo/vector-icons";
import { AuthContext } from "../context/authContext";
import * as ImagePicker from "expo-image-picker";
import axios from "axios";
import { baseUrl } from "../services/api";

const CreatePostScreen = ({ navigation }) => {
  const [topic, setTopic] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [steps, setSteps] = useState(['']);
  const [loading, setLoading] = useState(false);
  const { userToken } = useContext(AuthContext);
  const isDarkMode = useSelector((state) => state.theme.isDarkMode);

  // Theme colors
  const theme = {
    background: isDarkMode ? '#000' : '#efe8dc',
    surface: isDarkMode ? '#1A1A1A' : '#F2ECE4',
    text: isDarkMode ? '#fff' : '#2B2B2B',
    textSecondary: isDarkMode ? '#666' : '#757575',
    accent: '#BE0303',
    border: isDarkMode ? '#333' : '#E0E0E0',
    iconPrimary: isDarkMode ? '#fff' : '#2B2B2B',
    iconSecondary: isDarkMode ? '#666' : '#757575',
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Notice", "Photo library permission is required to continue!");
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
      Alert.alert("Error", "Could not select image. Please try again!");
    }
  };

  const takePicture = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Notice", "Camera permission is required to continue!");
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
      Alert.alert("Error", "Could not take picture. Please try again!");
    }
  };

  const addStep = () => {
    setSteps([...steps, '']);
  };

  const updateStep = (text, index) => {
    const newSteps = [...steps];
    newSteps[index] = text;
    setSteps(newSteps);
  };

  const removeStep = (index) => {
    if (steps.length === 1) {
      setSteps(['']);
    } else {
      const newSteps = steps.filter((_, i) => i !== index);
      setSteps(newSteps);
    }
  };

  const createPost = async () => {
    if (!topic.trim()) {
      Alert.alert("Notice", "Please enter a topic!");
      return;
    }

    if (!description.trim()) {
      Alert.alert("Notice", "Please enter post content!");
      return;
    }

    if (!userToken) {
      Alert.alert("Notice", "You need to log in to use this feature!");
      return;
    }

    setLoading(true);

    try {
      let imageUrl = null;
      if (image) {
        const formData = new FormData();
        const filename = image.split('/').pop();
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : 'image';

        formData.append('image', {
          uri: Platform.OS === 'android' ? image : image.replace('file://', ''),
          name: filename,
          type,
        });
        const config = {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${userToken}`
          },
        };

        const response = await axios.post(`${baseUrl}/uploadImage`, formData, config);
        imageUrl = response.data.imageURL;
      }

      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userToken}`,
        },
      };

      const postData = {
        title: topic,
        description: description,
        steps: steps.filter(step => step.trim() !== ''),
        mainImage: imageUrl,
      };

      await axios.post(`${baseUrl}/posts`, postData, config);
      Alert.alert('Success', 'Your post has been created successfully!');
      setTopic('');
      setDescription('');
      setImage(null);
      setSteps(['']);

    } catch (error) {
      console.error('Error creating post:', error);
      Alert.alert('Error', 'Could not create post. Please try again!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <ScrollView style={styles.content}>
        {/* <View style={styles.header}>
          <AntDesign name="book" size={24} color={theme.iconPrimary} />
          <Text style={[styles.headerText, { color: theme.text }]}>Create New Post</Text>
        </View> */}

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <FontAwesome5 name="heading" size={18} color={theme.iconPrimary} />
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Chủ đề</Text>
          </View>
          <View style={[styles.inputContainer, { 
            backgroundColor: theme.surface,
            borderColor: theme.border,
            borderWidth: 1,
          }]}>
            <TextInput
              style={[styles.input, { color: theme.text }]}
              placeholder="Nhập chủ đề..."
              placeholderTextColor={theme.textSecondary}
              value={topic}
              onChangeText={setTopic}
            />
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="description" size={20} color={theme.iconPrimary} />
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Nội dung</Text>
          </View>
          <View style={[styles.inputContainer, { 
            backgroundColor: theme.surface,
            borderColor: theme.border,
            borderWidth: 1,
          }]}>
            <TextInput
              style={[styles.input, { color: theme.text }]}
              placeholder="Chia sẻ kiến thức học tiếng Anh hoặc giải thích quy tắc ngữ pháp..."
              placeholderTextColor={theme.textSecondary}
              value={description}
              onChangeText={setDescription}
              multiline
            />
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="bulb-outline" size={20} color={theme.iconPrimary} />
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Các bước</Text>
          </View>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            Thêm các quy tắc ngữ pháp hoặc biểu thức tiếng Anh
          </Text>

          {steps.map((step, index) => (
            <View key={index} style={styles.stepContainer}>
              <View style={styles.stepNumberContainer}>
                <Text style={styles.stepNumber}>{index + 1}</Text>
              </View>
              <View style={[styles.stepInputContainer, { 
                backgroundColor: theme.surface,
                borderColor: theme.border,
                borderWidth: 1,
              }]}>
                <TextInput
                  style={[styles.stepInput, { color: theme.text }]}
                  placeholder="Nhập quy tắc ngữ pháp tiếng Anh hoặc mẹo..."
                  placeholderTextColor={theme.textSecondary}
                  value={step}
                  onChangeText={(text) => updateStep(text, index)}
                  multiline
                />
                <TouchableOpacity onPress={() => removeStep(index)} style={styles.removeButton}>
                  <MaterialIcons name="close" size={20} color={theme.accent} />
                </TouchableOpacity>
              </View>
            </View>
          ))}

          <TouchableOpacity onPress={addStep} style={styles.addButton}>
            <AntDesign name="plus" size={16} color={theme.accent} />
            <Text style={[styles.addButtonText, { color: theme.accent }]}>Thêm bước</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="image" size={20} color={theme.iconPrimary} />
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Hình ảnh</Text>
          </View>
          <View style={styles.imageContainer}>
            {image ? (
              <View style={styles.selectedImageContainer}>
                <Image source={{ uri: image }} style={styles.selectedImage} />
                <TouchableOpacity
                  style={styles.removeImageButton}
                  onPress={() => setImage(null)}
                >
                  <MaterialIcons name="close" size={24} color="#fff" />
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.imageButtons}>
                <TouchableOpacity
                  style={[styles.imageButton, { 
                    backgroundColor: theme.surface,
                    borderColor: theme.border,
                    borderWidth: 1,
                  }]}
                  onPress={pickImage}
                >
                  <MaterialIcons name="photo-library" size={24} color={theme.iconPrimary} />
                    <Text style={[styles.imageButtonText, { color: theme.text }]}>Chọn từ thư viện</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.imageButton, { 
                    backgroundColor: theme.surface,
                    borderColor: theme.border,
                    borderWidth: 1,
                  }]}
                  onPress={takePicture}
                >
                  <MaterialIcons name="camera-alt" size={24} color={theme.iconPrimary} />
                  <Text style={[styles.imageButtonText, { color: theme.text }]}>Chụp ảnh</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        <TouchableOpacity
          style={[styles.postButton, { opacity: loading ? 0.7 : 1 }]}
          onPress={createPost}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="send" size={20} color="#fff" style={styles.postIcon} />
              <Text style={styles.postButtonText}>Đăng bài viết</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: 80,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginLeft: 12,
  },
  section: {
    marginBottom: 24,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#8a8783',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  inputContainer: {
    borderRadius: 12,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  input: {
    fontSize: 16,
    minHeight: 40,
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 16,
    fontStyle: 'italic',
  },
  stepContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  stepNumberContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#BE0303',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    marginTop: 8,
  },
  stepNumber: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  stepInputContainer: {
    flex: 1,
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  stepInput: {
    flex: 1,
    fontSize: 16,
    paddingRight: 30,
  },
  removeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  imageContainer: {
    marginTop: 8,
  },
  imageButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  imageButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 4,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  imageButtonText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
  },
  selectedImageContainer: {
    position: 'relative',
  },
  selectedImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
  },
  removeImageButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 12,
    padding: 4,
  },
  postButton: {
    backgroundColor: '#BE0303',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 32,
    flexDirection: 'row',
    justifyContent: 'center',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 5.46,
    elevation: 9,
  },
  postIcon: {
    marginRight: 8,
  },
  postButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default CreatePostScreen;