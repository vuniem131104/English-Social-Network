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
  KeyboardAvoidingView,
  FlatList
} from 'react-native';
import { Ionicons, MaterialIcons, Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import { baseUrl } from '../../services/api';
import { AuthContext } from '../../context/authContext';
import NavbarTop from '../../components/header/NavbarTop';
import { useTheme } from '@react-navigation/native';
import { useSelector } from 'react-redux';

const CreatePostScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState(null);
  const [steps, setSteps] = useState(['']);
  const [loading, setLoading] = useState(false);
  const { userToken } = useContext(AuthContext);
  const isDarkMode = useSelector(state => state.theme.isDarkMode);

  const backgroundColors = isDarkMode 
    ? ['#1c1a1a', '#171717', '#0F0F0F'] 
    : ['#F5F2EC', '#EFEAE0', '#E5E0D5'];

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Notice', 'Photo library permission is required to continue!');
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
      Alert.alert('Error', 'Could not select image. Please try again!');
    }
  };

  const takePicture = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Notice', 'Camera permission is required to continue!');
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
      Alert.alert('Error', 'Could not take picture. Please try again!');
    }
  };

  const removeImage = () => {
    setImage(null);
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
      throw new Error('Could not upload image. Please try again!');
    }
  };

  const createPost = async () => {
    if (!title.trim()) {
      Alert.alert('Notice', 'Please enter a post title!');
      return;
    }

    if (!description.trim()) {
      Alert.alert('Notice', 'Please enter post content!');
      return;
    }

    // Filter out empty steps
    const filteredSteps = steps.filter(step => step.trim() !== '');
    
    if (!userToken) {
      Alert.alert('Notice', 'You need to log in to use this feature!');
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
        mainImage: imageUrl,
        steps: filteredSteps.length > 0 ? filteredSteps : undefined
      };

      await axios.post(`${baseUrl}/posts`, postData, config);
      
      Alert.alert('Success', 'Your post has been created successfully!', [
        { text: 'OK', onPress: () => navigation.navigate('Feed') }
      ]);
      
      setTitle('');
      setDescription('');
      setImage(null);
      setSteps(['']);
    } catch (error) {
      console.error("Error creating post:", error);
      Alert.alert('Error', 'Could not create post. Please try again!');
    } finally {
      setLoading(false);
    }
  };

  const renderStepInput = ({ item, index }) => (
    <View style={styles.stepInputContainer}>
      <View style={styles.stepNumberContainer}>
        <Text style={styles.stepNumber}>{index + 1}</Text>
      </View>
      <TextInput
        style={styles.stepInput}
        placeholder="Enter English grammar rule or tip..."
        placeholderTextColor={colors.onSurfaceVarient}
        value={item}
        onChangeText={(text) => updateStep(text, index)}
        multiline
      />
      <TouchableOpacity style={styles.removeStepButton} onPress={() => removeStep(index)}>
        <Ionicons name="close-circle" size={24} color={colors.primary} />
      </TouchableOpacity>
    </View>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <LinearGradient colors={backgroundColors} style={styles.container}>
        <NavbarTop />
        
        <ScrollView style={styles.scrollView}>
          <Text style={[styles.headerTitle, { color: colors.onSurface }]}>Create New Post</Text>
          
          <View style={styles.categoryContainer}>
            <View style={[styles.categoryBadge, { backgroundColor: colors.primary }]}>
              <MaterialIcons name="menu-book" size={16} color="#fff" />
              <Text style={styles.categoryText}>English Learning</Text>
            </View>
          </View>
          
          <View style={[styles.inputContainer, { borderColor: colors.outline }]}>
            <Text style={[styles.label, { color: colors.onSurface }]}>Title</Text>
            <TextInput
              style={[styles.input, { color: colors.onSurface, backgroundColor: colors.surfaceContainerLow }]}
              placeholder="Enter post title..."
              placeholderTextColor={colors.onSurfaceVarient}
              value={title}
              onChangeText={setTitle}
              maxLength={100}
            />
          </View>
          
          <View style={[styles.inputContainer, { borderColor: colors.outline }]}>
            <Text style={[styles.label, { color: colors.onSurface }]}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea, { color: colors.onSurface, backgroundColor: colors.surfaceContainerLow }]}
              placeholder="Share your English learning tip or grammar rule explanation..."
              placeholderTextColor={colors.onSurfaceVarient}
              value={description}
              onChangeText={setDescription}
              multiline
              textAlignVertical="top"
            />
          </View>
          
          <View style={[styles.inputContainer, { borderColor: colors.outline }]}>
            <View style={styles.sectionHeaderContainer}>
              <MaterialIcons name="lightbulb" size={20} color={colors.primary} />
              <Text style={[styles.label, { color: colors.onSurface }]}>Grammar Tips</Text>
            </View>
            <Text style={[styles.helperText, { color: colors.onSurfaceVarient }]}>
              Add step-by-step grammar rules or English expressions
            </Text>
            
            <FlatList
              data={steps}
              renderItem={renderStepInput}
              keyExtractor={(_, index) => `step-${index}`}
              scrollEnabled={false}
              style={styles.stepsList}
            />
            
            <TouchableOpacity style={[styles.addButton, { borderColor: colors.primary }]} onPress={addStep}>
              <Ionicons name="add" size={20} color={colors.primary} />
              <Text style={[styles.addButtonText, { color: colors.primary }]}>Add another tip</Text>
            </TouchableOpacity>
          </View>
          
          <View style={[styles.imageSection, { borderColor: colors.outline }]}>
            <Text style={[styles.label, { color: colors.onSurface }]}>Image</Text>
            
            {image ? (
              <View style={styles.selectedImageContainer}>
                <Image source={{ uri: image }} style={styles.selectedImage} />
                <TouchableOpacity style={styles.removeImageButton} onPress={removeImage}>
                  <Ionicons name="close-circle" size={24} color={colors.primary} />
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.imageOptions}>
                <TouchableOpacity 
                  style={[styles.imageButton, { backgroundColor: colors.surfaceContainerHigh }]} 
                  onPress={pickImage}
                >
                  <MaterialIcons name="photo-library" size={24} color={colors.onSurface} />
                  <Text style={[styles.imageButtonText, { color: colors.onSurface }]}>Choose from library</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.imageButton, { backgroundColor: colors.surfaceContainerHigh }]} 
                  onPress={takePicture}
                >
                  <MaterialIcons name="camera-alt" size={24} color={colors.onSurface} />
                  <Text style={[styles.imageButtonText, { color: colors.onSurface }]}>Take a picture</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
          
          <TouchableOpacity
            style={[
              styles.submitButton, 
              { backgroundColor: colors.primary },
              loading && styles.disabledButton
            ]}
            onPress={createPost}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Ionicons name="send" size={20} color="#fff" />
                <Text style={styles.submitButtonText}>Post</Text>
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
    fontSize: 24,
    fontFamily: 'PlayfairDisplay-Bold',
    marginBottom: 15,
  },
  categoryContainer: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  categoryText: {
    color: '#fff',
    marginLeft: 5,
    fontFamily: 'PlayfairDisplay-Medium',
    fontSize: 14,
  },
  inputContainer: {
    marginBottom: 20,
    borderWidth: 0.5,
    borderRadius: 12,
    padding: 15,
  },
  sectionHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  label: {
    fontSize: 18,
    fontFamily: 'PlayfairDisplay-Bold',
    marginBottom: 10,
    marginLeft: 5,
  },
  helperText: {
    fontSize: 14,
    fontFamily: 'PlayfairDisplay-Regular',
    marginBottom: 15,
    fontStyle: 'italic',
  },
  input: {
    padding: 10,
    borderRadius: 8,
    fontSize: 16,
    fontFamily: 'PlayfairDisplay-Regular',
  },
  textArea: {
    minHeight: 100,
    paddingTop: 12,
  },
  stepsList: {
    marginBottom: 10,
  },
  stepInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  stepNumberContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#BE0303',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  stepNumber: {
    color: '#fff',
    fontFamily: 'PlayfairDisplay-Bold',
    fontSize: 14,
  },
  stepInput: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    fontFamily: 'PlayfairDisplay-Regular',
    fontSize: 14,
    color: '#fff',
  },
  removeStepButton: {
    marginLeft: 10,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    borderWidth: 1,
  },
  addButtonText: {
    marginLeft: 5,
    fontFamily: 'PlayfairDisplay-Medium',
    fontSize: 14,
  },
  imageSection: {
    marginBottom: 20,
    borderWidth: 0.5,
    borderRadius: 12,
    padding: 15,
  },
  imageOptions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
  },
  imageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    width: '45%',
    justifyContent: 'center',
  },
  imageButtonText: {
    marginLeft: 8,
    fontFamily: 'PlayfairDisplay-Medium',
    fontSize: 14,
  },
  selectedImageContainer: {
    position: 'relative',
    alignItems: 'center',
    marginTop: 10,
  },
  selectedImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
  },
  removeImageButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 15,
  },
  submitButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 15,
    borderRadius: 8,
    marginTop: 20,
    marginBottom: 80,
    width: '100%',
    height: 56,
  },
  disabledButton: {
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