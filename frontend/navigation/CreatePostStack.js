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
} from "react-native";
import { Modal } from "react-native";
import { useSelector } from "react-redux";
import { useTheme } from "@react-navigation/native";
import { Ionicons, AntDesign, Feather, MaterialIcons } from "@expo/vector-icons";
import { AuthContext } from "../context/authContext";
import * as ImagePicker from "expo-image-picker";
import axios from "axios";
import { baseUrl } from "../services/api";

const CreatePostScreen = () => {
  const isDarkMode = useSelector((state) => state.theme.isDarkMode);
  const { colors } = useTheme();
  const [postText, setPostText] = useState("");
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showTopicInput, setShowTopicInput] = useState(false);
  const [topicText, setTopicText] = useState(""); 
  const { userToken, userInfo } = useContext(AuthContext);

  //test thêm
  const [isModalVisible, setIsModalVisible] = useState(false); 
  const [modalType, setModalType] = useState(""); 
  const [stepsText, setStepsText] = useState("");

  //lấy steps
  const stringToSteps = (inputString) => {
    if (!inputString || typeof inputString !== "string") {
      return []; // Trả về mảng rỗng nếu input không hợp lệ
    }
    return inputString.split("\n"); // Tách chuỗi bằng ký tự xuống dòng
  };
  // lấy ảnh của người dùng
  const getInitials = (str) => {
    if (!str) return '';
    const words = str.trim().split(' ');
    const initials = words.slice(0, 2).map(word => word[0].toUpperCase()).join('');
    return initials;
  };
  //set ảnh
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

  // đẩy post

  const createPost = async () => {
    if (!postText.trim()) {
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

        console.log('Uploading image with URI:', image);
        const response = await axios.post(`${baseUrl}/uploadImage`, formData, config);

        imageUrl = response.data.imageURL;
      } else {
        throw new Error('No image provided');
      }

      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userToken}`,
        },
      };

      const postData = {
        title: topicText,
        description: postText,
        steps: stringToSteps(stepsText),
        mainImage: imageUrl,
      };
      const response = await axios.post(`${baseUrl}/posts`, postData, config);

      const responseBody = response.data;
      console.log('Response from backend:', responseBody);
      Alert.alert('Tạo bài viết thành công');
      setTopicText("");
      setPostText('');
      setImage(null);

    } catch (error) {
      console.error('Error creating post:', error.response?.data || error.message);
      Alert.alert('Error', 'Could not create post. Please try again!');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={[styles.container, { backgroundColor: colors.surfaceContainer }]}
    >
      <View style={styles.header}>
        <TouchableOpacity style={styles.closeButton}>
          <AntDesign name="close" size={24} color={colors.onSurface} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.onSurface }]}>Tạo post mới</Text>
      </View>

      <View style={styles.threadContainer}>
        <View style={styles.userSection}>
          <Image
            source={userInfo.avatar ? { url: userInfo.avatar } : { uri: `https://ui-avatars.com/api/?name=${getInitials(userInfo.name)}&background=222&color=fff` }}
            style={styles.userAvatar}
          />
          <View style={styles.threadLine} />
        </View>
        <View style={styles.contentSection}>
          <View style={styles.userInfo}>
            <Text style={[styles.username, { color: colors.onSurface }]}>{userInfo.username}</Text>
            <TouchableOpacity
              onPress={() => {
                setModalType("topic");
                setIsModalVisible(true);
              }}
            >
              <Text style={[styles.topicHint, { color: colors.onSurfaceVarient }]}>
                Topic
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setModalType("steps");
                setIsModalVisible(true);
              }}
            >
              <Text style={[styles.topicHint, { color: colors.onSurfaceVarient }]}>
                Cấu trúc
              </Text>
            </TouchableOpacity>
          </View>

          {showTopicInput && (
            <TextInput
              style={[styles.topicInput, { color: colors.onSurface }]}
              placeholder="Nhập title..."
              placeholderTextColor={colors.onSurfaceVarient}
              value={topicText}
              onChangeText={setTopicText}
            />
          )}

          <TextInput
            style={[styles.postInput, { color: colors.onSurface }]}
            placeholder="Bạn muốn viết gì?"
            placeholderTextColor={colors.onSurfaceVarient}
            value={postText}
            onChangeText={setPostText}
            multiline
            autoFocus
          />

          {image && (
            <View style={styles.imagePreview}>
              <Image source={{ uri: image }} style={styles.image} />
              <TouchableOpacity onPress={() => setImage(null)}>
                <Ionicons name="close-circle" size={24} color={colors.primary} />
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.mediaOptions}>
            <TouchableOpacity style={styles.mediaButton} onPress={pickImage}>
              <Ionicons name="image-outline" size={24} color={colors.onSurfaceVarient} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.mediaButton}>
              <Ionicons name="camera-outline" size={24} color={colors.onSurfaceVarient} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.mediaButton}>
              <Feather name="smile" size={24} color={colors.onSurfaceVarient} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.mediaButton}>
              <Ionicons name="mic-outline" size={24} color={colors.onSurfaceVarient} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.mediaButton}>
              <MaterialIcons name="format-list-bulleted" size={24} color={colors.onSurfaceVarient} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.mediaButton}>
              <Ionicons name="location-outline" size={24} color={colors.onSurfaceVarient} />
            </TouchableOpacity>
          </View>
        </View>
      </View>


      <View style={styles.footer}>
        <Text style={[styles.footerText, { color: colors.onSurfaceVarient }]}>
          Bất kỳ ai cũng có thể trả lời và trích dẫn
        </Text>
        <TouchableOpacity
          style={[
            styles.postButton,
            { backgroundColor: postText.trim().length > 0 ? colors.primary : colors.surfaceContainerHigh }
          ]}
          disabled={postText.trim().length === 0}
          onPress={createPost}
        >
          <Text
            style={[
              styles.postButtonText,
              { color: postText.trim().length > 0 ? '#fff' : colors.onSurfaceVarient }
            ]}
          >
            Đăng
          </Text>
        </TouchableOpacity>
      </View>

      {/* Thêm thử */}
      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {modalType === "topic" ? "Nhập topic" : "Cấu trúc chia sẻ"}
            </Text>
            <TextInput
              style={styles.modalInput}
              placeholder={modalType === "topic" ? "Topic" : "Cấu trúc ngữ pháp"}
              placeholderTextColor="#999"
              value={modalType === "topic" ? topicText : stepsText}
              onChangeText={(text) =>
                modalType === "topic" ? setTopicText(text) : setStepsText(text)
              }
              multiline
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => {
                  setIsModalVisible(false);
                }}
              >
                <Text style={styles.modalButtonText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => {
                  setIsModalVisible(false);
                  if (modalType === "topic") {
                    console.log("Topic:", topicText);
                  } else {
                    console.log("Steps:", stepsText);
                  }
                }}
              >
                <Text style={styles.modalButtonText}>Lưu</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginBottom: 100,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  closeButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: "Inter-Bold",
    textAlign: "center",
    flex: 1,
  },
  threadContainer: {
    flex: 3,
    flexDirection: 'row',
    paddingTop: 20,
    paddingHorizontal: 15,
  },
  userSection: {
    alignItems: 'center',
    marginRight: 12,
  },
  topicInput: {
    fontFamily: "Inter-Regular",
    fontSize: 20,
    padding: 10,
    marginTop: 10,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  threadLine: {
    width: 2,
    flex: 1,
    backgroundColor: 'rgba(150, 150, 150, 0.2)',
    marginTop: 10,
  },
  contentSection: {
    flex: 1,
  },
  userInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "90%",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: "Inter-Bold",
    marginBottom: 10,
    textAlign: "center",
  },
  modalInput: {
    fontFamily: "Inter-Regular",
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 20,
    minHeight: 100,
    textAlignVertical: "top",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  modalButton: {
    flex: 1,
    padding: 10,
    marginHorizontal: 5,
    backgroundColor: "#007BFF",
    borderRadius: 8,
    alignItems: "center",
  },
  modalButtonText: {
    fontFamily: "Inter-Bold",
    fontSize: 14,
    color: "#fff",
  },
  username: {
    fontFamily: 'Inter-Bold',
    fontSize: 14,
  },
  topicHint: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
  },
  postInput: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    minHeight: 100,
  },
  mediaOptions: {
    flexDirection: 'row',
    marginTop: 15,
  },
  mediaButton: {
    marginRight: 20,
  },
  addThreadSection: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(150, 150, 150, 0.2)',
  },
  smallAvatar: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    marginRight: 15,
  },
  addThreadText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
  },
  contentSection: {
    flex: 1,
    padding: 15,
  },
  postInput: {
    fontFamily: "Inter-Regular",
    fontSize: 16,
    minHeight: 100,
  },
  mediaOptions: {
    flexDirection: "row",
    marginTop: 15,
  },
  mediaButton: {
    marginRight: 20,
  },
  imagePreview: {
    marginTop: 15,
    alignItems: "center",
  },
  image: {
    width: "100%",
    height: 200,
    borderRadius: 8,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: 15,
  },
  postButton: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  postButtonText: {
    fontFamily: "Inter-Bold",
    fontSize: 14,
  },
});

export default CreatePostScreen;