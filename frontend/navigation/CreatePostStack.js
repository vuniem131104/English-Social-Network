import React, { useState } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { 
  Text, 
  View, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  Image,
  KeyboardAvoidingView,
  Platform
} from "react-native";
import { useSelector } from "react-redux";
import { useTheme } from "@react-navigation/native";
import { Ionicons, AntDesign, Feather, MaterialIcons } from '@expo/vector-icons';

const CreatePostScreen = () => {
  const isDarkMode = useSelector(state => state.theme.isDarkMode);
  const { colors } = useTheme();
  const [postText, setPostText] = useState('');
  
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: colors.surfaceContainer }]}
    >
      <View style={styles.header}>
        <TouchableOpacity style={styles.closeButton}>
          <AntDesign name="close" size={24} color={colors.onSurface} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.onSurface }]}>Thread mới</Text>
        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.headerIcon}>
            <Ionicons name="chatbubble-outline" size={24} color={colors.onSurface} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerIcon}>
            <Feather name="more-horizontal" size={24} color={colors.onSurface} />
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.threadContainer}>
        <View style={styles.userSection}>
          <Image 
            source={{ uri: 'https://ui-avatars.com/api/?name=HV&background=222&color=fff' }} 
            style={styles.userAvatar} 
          />
          <View style={styles.threadLine} />
        </View>
        
        <View style={styles.contentSection}>
          <View style={styles.userInfo}>
            <Text style={[styles.username, { color: colors.onSurface }]}>hoangvu___13</Text>
            <TouchableOpacity>
              <Text style={[styles.topicHint, { color: colors.onSurfaceVarient }]}>Thêm chủ đề</Text>
            </TouchableOpacity>
          </View>
          
          <TextInput
            style={[styles.postInput, { color: colors.onSurface }]}
            placeholder="Có gì mới?"
            placeholderTextColor={colors.onSurfaceVarient}
            value={postText}
            onChangeText={setPostText}
            multiline
            autoFocus
          />
          
          <View style={styles.mediaOptions}>
            <TouchableOpacity style={styles.mediaButton}>
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
      
      <View style={styles.addThreadSection}>
        <Image 
          source={{ uri: 'https://ui-avatars.com/api/?name=+&background=222&color=fff' }} 
          style={styles.smallAvatar} 
        />
        <Text style={[styles.addThreadText, { color: colors.onSurfaceVarient }]}>Thêm vào thread</Text>
      </View>
      
      <View style={styles.footer}>
        <Text style={[styles.footerText, { color: colors.onSurfaceVarient }]}>
          Bất kỳ ai cũng có thể trả lời và trích dẫn
        </Text>
        <TouchableOpacity 
          style={[
            styles.postButton, 
            {backgroundColor: postText.trim().length > 0 ? colors.primary : colors.surfaceContainerHigh}
          ]}
          disabled={postText.trim().length === 0}
        >
          <Text 
            style={[
              styles.postButtonText, 
              {color: postText.trim().length > 0 ? '#fff' : colors.onSurfaceVarient}
            ]}
          >
            Đăng
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const CreatePostStack = createNativeStackNavigator();

const CreatePostStackScreen = () => {
  return (
    <CreatePostStack.Navigator screenOptions={{ headerShown: false }}>
      <CreatePostStack.Screen name="CreatePostScreen" component={CreatePostScreen} />
    </CreatePostStack.Navigator>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(150, 150, 150, 0.2)',
  },
  closeButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'PlayfairDisplay-Bold',
  },
  headerIcons: {
    flexDirection: 'row',
  },
  headerIcon: {
    marginLeft: 20,
  },
  threadContainer: {
    flex: 1,
    flexDirection: 'row',
    paddingTop: 20,
    paddingHorizontal: 15,
  },
  userSection: {
    alignItems: 'center',
    marginRight: 12,
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
  username: {
    fontFamily: 'PlayfairDisplay-Bold',
    fontSize: 14,
  },
  topicHint: {
    fontFamily: 'PlayfairDisplay-Regular',
    fontSize: 14,
  },
  postInput: {
    fontFamily: 'PlayfairDisplay-Regular',
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
    fontFamily: 'PlayfairDisplay-Regular',
    fontSize: 14,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(150, 150, 150, 0.2)',
  },
  footerText: {
    fontFamily: 'PlayfairDisplay-Regular',
    fontSize: 12,
  },
  postButton: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  postButtonText: {
    fontFamily: 'PlayfairDisplay-Bold',
    fontSize: 14,
  }
});

export default CreatePostStackScreen; 