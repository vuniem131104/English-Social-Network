import React, { useState, useEffect, useContext } from "react";
import {
  Text,
  StyleSheet,
  View,
  Image,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import axios from "axios";
import { baseUrl } from "../../services/api";
import { AuthContext } from "../../context/authContext";
import { Ionicons, Feather } from '@expo/vector-icons';
import { LinearGradient } from "expo-linear-gradient";
import NavbarTop from "../../components/header/NavbarTop";

const PostDetail = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { postId } = route.params;
  const { userInfo, userToken } = useContext(AuthContext);

  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [isLoading, setLoading] = useState(false);
  const [isCommentsLoading, setCommentsLoading] = useState(false);
  const [isSubmitting, setSubmitting] = useState(false);

  useEffect(() => {
    getPostDetails();
    getComments();
  }, [postId]);

  const getPostDetails = async () => {
    setLoading(true);
    try {
      const config = userToken ? {
        headers: { Authorization: `Bearer ${userToken}` }
      } : {};
      
      const response = await axios.get(`${baseUrl}/posts/${postId}`, config);
      setPost(response.data);
    } catch (error) {
      console.error("Error fetching post details:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const getComments = async () => {
    setCommentsLoading(true);
    try {
      const config = userToken ? {
        headers: { Authorization: `Bearer ${userToken}` }
      } : {};
      
      const response = await axios.get(`${baseUrl}/posts/${postId}/comments`, config);
      setComments(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Error fetching comments:", error.message);
    } finally {
      setCommentsLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    if (!userToken) {
      navigation.navigate("SignIn");
      return;
    }

    setSubmitting(true);
    try {
      const config = {
        headers: { Authorization: `Bearer ${userToken}` }
      };
      
      await axios.post(`${baseUrl}/posts/${postId}/comments`, {
        content: newComment
      }, config);
      
      setNewComment("");
      getComments(); // Refresh comments after adding
    } catch (error) {
      console.error("Error adding comment:", error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffDay > 0) {
      return `${diffDay} ngày trước`;
    } else if (diffHour > 0) {
      return `${diffHour} giờ trước`;
    } else if (diffMin > 0) {
      return `${diffMin} phút trước`;
    } else {
      return 'Vừa xong';
    }
  };

  const renderComment = ({ item }) => {
    return (
      <View style={styles.commentItem}>
        <Image 
          source={item.author?.avatar 
            ? { uri: item.author.avatar } 
            : { uri: `https://ui-avatars.com/api/?name=${encodeURIComponent(item.author?.name || 'User')}` }
          } 
          style={styles.commentAvatar} 
        />
        <View style={styles.commentContent}>
          <View style={styles.commentHeader}>
            <Text style={styles.commentAuthor}>{item.author?.username || item.author?.name || 'Anonymous'}</Text>
            <Text style={styles.commentTime}>{formatDate(item.createdAt)}</Text>
          </View>
          <Text style={styles.commentText}>{item.content}</Text>
        </View>
      </View>
    );
  };

  if (isLoading) {
    return (
      <LinearGradient colors={['#BE0303', '#1c1a1a', '#000000']} style={styles.loadingContainer}>
        <NavbarTop />
        <ActivityIndicator size="large" color="#BE0303" />
      </LinearGradient>
    );
  }

  if (!post) {
    return (
      <LinearGradient colors={['#BE0303', '#1c1a1a', '#000000']} style={styles.loadingContainer}>
        <NavbarTop />
        <Text style={styles.errorText}>Không tìm thấy bài viết</Text>
      </LinearGradient>
    );
  }

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <LinearGradient colors={['#BE0303', '#1c1a1a', '#000000']} style={styles.container}>
        <NavbarTop />
        
        <ScrollView style={styles.scrollView}>
          <View style={styles.postContainer}>
            <View style={styles.postHeader}>
              <View style={styles.userInfo}>
                <Image 
                  source={post.author?.avatar 
                    ? { uri: post.author.avatar } 
                    : { uri: `https://ui-avatars.com/api/?name=${encodeURIComponent(post.author?.name || 'User')}` }
                  } 
                  style={styles.avatar} 
                />
                <View>
                  <Text style={styles.username}>{post.author?.username || post.author?.name || 'Anonymous'}</Text>
                  <Text style={styles.timeAgo}>{formatDate(post.createdAt)}</Text>
                </View>
              </View>
            </View>
            
            <Text style={styles.postTitle}>{post.title}</Text>
            <Text style={styles.postDescription}>{post.description}</Text>
            
            {post.mainImage && (
              <Image 
                source={{ uri: post.mainImage }} 
                style={styles.postImage} 
                resizeMode="cover"
              />
            )}
            
            <View style={styles.postStats}>
              <TouchableOpacity style={styles.statItem}>
                <Ionicons name="heart-outline" size={22} color="#fff" />
                <Text style={styles.statText}>{post.totalLike || 0}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.statItem}>
                <Ionicons name="chatbubble-outline" size={22} color="#fff" />
                <Text style={styles.statText}>{post.totalComment || 0}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.statItem}>
                <Feather name="repeat" size={22} color="#fff" />
                <Text style={styles.statText}>0</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.statItem}>
                <Feather name="share" size={22} color="#fff" />
                <Text style={styles.statText}>0</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={styles.commentsSection}>
            <Text style={styles.commentsTitle}>Bình luận</Text>
            
            {isCommentsLoading ? (
              <ActivityIndicator size="small" color="#BE0303" style={styles.commentLoader} />
            ) : comments.length > 0 ? (
              comments.map((comment, index) => renderComment({ item: comment, index }))
            ) : (
              <Text style={styles.noCommentsText}>Chưa có bình luận nào</Text>
            )}
          </View>
        </ScrollView>
        
        <View style={styles.commentInputContainer}>
          <TextInput
            style={styles.commentInput}
            placeholder="Thêm bình luận..."
            placeholderTextColor="#999"
            value={newComment}
            onChangeText={setNewComment}
            multiline
          />
          <TouchableOpacity 
            style={[styles.sendButton, (!newComment.trim() || isSubmitting) && styles.disabledButton]} 
            onPress={handleAddComment}
            disabled={!newComment.trim() || isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Ionicons name="send" size={24} color="#fff" />
            )}
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
    marginBottom: 60, // Để không che phần comment input
  },
  errorText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'PlayfairDisplay-Regular',
  },
  postContainer: {
    padding: 15,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 10,
  },
  username: {
    color: '#fff',
    fontSize: 15,
    fontFamily: 'PlayfairDisplay-Bold',
  },
  timeAgo: {
    color: '#777',
    fontSize: 13,
    fontFamily: 'PlayfairDisplay-Regular',
  },
  postTitle: {
    color: '#fff',
    fontSize: 20,
    fontFamily: 'PlayfairDisplay-Bold',
    marginBottom: 10,
  },
  postDescription: {
    color: '#eee',
    fontSize: 16,
    marginBottom: 15,
    lineHeight: 24,
    fontFamily: 'PlayfairDisplay-Regular',
  },
  postImage: {
    width: '100%',
    height: 300,
    borderRadius: 12,
    marginBottom: 15,
  },
  postStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderTopWidth: 0.5,
    borderTopColor: '#444',
    borderBottomWidth: 0.5,
    borderBottomColor: '#444',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    color: '#eee',
    marginLeft: 5,
    fontSize: 14,
    fontFamily: 'PlayfairDisplay-Regular',
  },
  commentsSection: {
    padding: 15,
  },
  commentsTitle: {
    color: '#fff',
    fontSize: 18,
    fontFamily: 'PlayfairDisplay-Bold',
    marginBottom: 15,
  },
  commentLoader: {
    marginVertical: 20,
  },
  noCommentsText: {
    color: '#999',
    fontFamily: 'PlayfairDisplay-Regular',
    textAlign: 'center',
    marginVertical: 20,
  },
  commentItem: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  commentAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 10,
  },
  commentContent: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 10,
    borderRadius: 12,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  commentAuthor: {
    color: '#fff',
    fontFamily: 'PlayfairDisplay-Bold',
    fontSize: 14,
  },
  commentTime: {
    color: '#777',
    fontSize: 12,
    fontFamily: 'PlayfairDisplay-Regular',
  },
  commentText: {
    color: '#eee',
    fontFamily: 'PlayfairDisplay-Regular',
    fontSize: 14,
    lineHeight: 20,
  },
  commentInputContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: '#1c1a1a',
    padding: 10,
    borderTopWidth: 0.5,
    borderTopColor: '#444',
  },
  commentInput: {
    flex: 1,
    backgroundColor: '#333',
    borderRadius: 20,
    color: '#fff',
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontFamily: 'PlayfairDisplay-Regular',
    maxHeight: 80,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#BE0303',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  disabledButton: {
    backgroundColor: '#666',
    opacity: 0.7,
  },
});

export default PostDetail; 