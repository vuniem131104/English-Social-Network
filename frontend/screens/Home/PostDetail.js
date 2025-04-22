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
  Platform,
  Alert,
  Share
} from "react-native";
import { useNavigation, useRoute, useTheme } from "@react-navigation/native";
import { useSelector } from "react-redux";
import axios from "axios";
import { baseUrl } from "../../services/api";
import { AuthContext } from "../../context/authContext";
import { Ionicons, Feather, MaterialIcons, FontAwesome } from '@expo/vector-icons';
import { LinearGradient } from "expo-linear-gradient";

const PostDetail = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { postId } = route.params;
  const { userInfo, userToken } = useContext(AuthContext);
  const isDarkMode = useSelector(state => state.theme.isDarkMode);
  const { colors } = useTheme();

  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [isLoading, setLoading] = useState(false);
  const [isCommentsLoading, setCommentsLoading] = useState(false);
  const [isSubmitting, setSubmitting] = useState(false);
  const [liked, setLiked] = useState(false);

  const darkBackground = isDarkMode ? '#121212' : colors.surfaceContainer;
  const cardBackground = isDarkMode ? 'rgba(32, 32, 36, 0.95)' : colors.surfaceContainerLow;
  const sectionBackground = isDarkMode ? 'rgba(40, 40, 50, 0.95)' : colors.surfaceContainerHigh;
  const borderColor = isDarkMode ? 'rgba(70, 70, 80, 0.7)' : 'rgba(150, 150, 150, 0.3)';
  const separatorColor = isDarkMode ? 'rgba(70, 70, 80, 0.7)' : 'rgba(150, 150, 150, 0.2)';
  const secondaryText = isDarkMode ? '#aaa' : '#777';
  const commentBg = isDarkMode ? 'rgba(45, 45, 55, 0.8)' : 'rgba(150, 150, 150, 0.1)';

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
      
      if (userToken && response.data.hasOwnProperty('isLiked')) {
        setLiked(response.data.isLiked);
      }
    } catch (error) {
      console.error("Error fetching post details:", error.message);
      Alert.alert("Error", "Could not load post. Please try again later.");
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
      getComments(); 
      
      getPostDetails();
    } catch (error) {
      console.error("Error adding comment:", error.message);
      Alert.alert("Error", "Could not add comment. Please try again later.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleLikePost = async () => {
    if (!userToken) {
      navigation.navigate("SignIn");
      return;
    }

    try {
      const config = {
        headers: { Authorization: `Bearer ${userToken}` }
      };
      
      if (!liked) {
        await axios.post(`${baseUrl}/posts/${postId}/like`, {}, config);
      } else {
        await axios.delete(`${baseUrl}/posts/${postId}/like`, config);
      }
      
      setLiked(!liked);
      
      getPostDetails();
    } catch (error) {
      console.error("Error updating like:", error.message);
      Alert.alert("Error", "Could not update like. Please try again later.");
    }
  };

  const handleSharePost = async () => {
    try {
      const shareContent = {
        message: `${post.title}\n\n${post.description}\n\nCheck out this English learning tip on English Social App!`,
        title: post.title,
      };
      
      const result = await Share.share(shareContent);
      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          console.log("Shared with activity type:", result.activityType);
        } else {
          console.log("Shared");
        }
      } else if (result.action === Share.dismissedAction) {
        console.log("Share dismissed");
      }
    } catch (error) {
      Alert.alert("Error", "Could not share this post. Please try again later.");
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
      return `${diffDay} days ago`;
    } else if (diffHour > 0) {
      return `${diffHour} hours ago`;
    } else if (diffMin > 0) {
      return `${diffMin} minutes ago`;
    } else {
      return 'Just now';
    }
  };

  const renderGrammarPoint = ({ item, index }) => {
    return (
      <View style={[
        styles.grammarItem, 
        { 
          backgroundColor: isDarkMode ? 'rgba(45, 45, 55, 0.8)' : 'rgba(255, 255, 255, 0.1)',
          borderColor: borderColor
        }
      ]}>
        <View style={[styles.grammarNumber, { backgroundColor: colors.primary }]}>
          <Text style={styles.grammarNumberText}>{index + 1}</Text>
        </View>
        <View style={styles.grammarContent}>
          <Text style={[styles.grammarText, { color: colors.onSurface }]}>{item}</Text>
          <TouchableOpacity style={styles.saveButton}>
            <FontAwesome name="bookmark-o" size={18} color={colors.primary} />
            <Text style={[styles.saveButtonText, { color: colors.primary }]}>Save</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderComment = ({ item }) => {
    return (
      <View style={styles.commentItem}>
        <Image 
          source={item.author?.avatar 
            ? { uri: item.author.avatar } 
            : { uri: `https://ui-avatars.com/api/?name=${encodeURIComponent(item.author?.name || 'User')}` }
          } 
          style={[styles.commentAvatar, { borderColor: borderColor }]} 
        />
        <View style={[styles.commentContent, { 
          backgroundColor: commentBg,
          borderColor: borderColor
        }]}>
          <View style={styles.commentHeader}>
            <Text style={[styles.commentAuthor, { color: colors.onSurface }]}>
              {item.author?.username || item.author?.name || 'Anonymous'}
            </Text>
            <Text style={[styles.commentTime, { color: secondaryText }]}>{formatDate(item.createdAt)}</Text>
          </View>
          <Text style={[styles.commentText, { color: colors.onSurface }]}>{item.content}</Text>
        </View>
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: darkBackground }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!post) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: darkBackground }]}>
        <Text style={[styles.errorText, { color: colors.onSurface }]}>Post not found</Text>
      </View>
    );
  }
  
  const isGrammarPost = post.steps && post.steps.length > 0;

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: darkBackground }]}
    >
      <ScrollView style={styles.scrollView}>
        <View style={[styles.postContainer, { 
          backgroundColor: cardBackground,
          borderColor: borderColor 
        }]}>
          <View style={[styles.postHeader, { borderBottomColor: borderColor }]}>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={24} color={colors.onSurface} />
            </TouchableOpacity>
            <View style={styles.userInfo}>
              <Image 
                source={post.author?.avatar 
                  ? { uri: post.author.avatar } 
                  : { uri: `https://ui-avatars.com/api/?name=${encodeURIComponent(post.author?.name || 'User')}` }
                } 
                style={[styles.avatar, { borderColor: borderColor }]} 
              />
              <View>
                <Text style={[styles.username, { color: colors.onSurface }]}>
                  {post.author?.username || post.author?.name || 'Anonymous'}
                </Text>
                <Text style={[styles.timeAgo, { color: secondaryText }]}>{formatDate(post.createdAt)}</Text>
              </View>
            </View>
          </View>
          
          <View style={styles.contentSection}>
            <View style={styles.titleContainer}>
              <Text style={[styles.postTitle, { color: colors.onSurface }]}>{post.title}</Text>
              {isGrammarPost && (
                <View style={[styles.topicBadge, { backgroundColor: colors.primary }]}>
                  <Text style={styles.topicText}>Grammar</Text>
                </View>
              )}
            </View>
            
            <Text style={[
              styles.postDescription, 
              { color: isDarkMode ? 'rgba(220, 220, 225, 0.9)' : colors.onSurface }
            ]}>
              {post.description}
            </Text>
          </View>
          
          {post.mainImage && (
            <View style={[styles.imageContainer, { borderColor: borderColor }]}>
              <Image 
                source={{ uri: post.mainImage }} 
                style={styles.postImage} 
                resizeMode="cover"
              />
            </View>
          )}
          
          {isGrammarPost && (
            <View style={[styles.section, { 
              backgroundColor: sectionBackground,
              borderColor: borderColor
            }]}>
              <View style={styles.sectionHeader}>
                <MaterialIcons name="lightbulb" size={24} color={colors.primary} />
                <Text style={[styles.sectionTitle, { color: colors.onSurface }]}>Grammar Tips</Text>
              </View>
              <FlatList
                data={post.steps}
                renderItem={renderGrammarPoint}
                keyExtractor={(item, index) => `step-${index}`}
                scrollEnabled={false}
                ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
              />
            </View>
          )}
          
          <View style={[styles.postStats, { 
            borderTopColor: separatorColor,
            borderBottomColor: separatorColor
          }]}>
            <TouchableOpacity style={styles.statItem} onPress={handleLikePost}>
              <Ionicons 
                name={liked ? "heart" : "heart-outline"} 
                size={24} 
                color={liked ? "#BE0303" : isDarkMode ? '#bbb' : colors.onSurface} 
              />
              <Text style={[styles.statText, { color: isDarkMode ? '#bbb' : colors.onSurface }]}>
                {post.totalLike || 0}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.statItem}>
              <Ionicons name="chatbubble-outline" size={24} color={isDarkMode ? '#bbb' : colors.onSurface} />
              <Text style={[styles.statText, { color: isDarkMode ? '#bbb' : colors.onSurface }]}>
                {post.totalComment || 0}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.statItem}>
              <Feather name="eye" size={24} color={isDarkMode ? '#bbb' : colors.onSurface} />
              <Text style={[styles.statText, { color: isDarkMode ? '#bbb' : colors.onSurface }]}>
                {post.totalView || 0}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.statItem} onPress={handleSharePost}>
              <Feather name="share" size={24} color={isDarkMode ? '#bbb' : colors.onSurface} />
              <Text style={[styles.statText, { color: isDarkMode ? '#bbb' : colors.onSurface }]}>Share</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={[styles.commentsSection, { 
          backgroundColor: cardBackground,
          borderColor: borderColor
        }]}>
          <Text style={[styles.commentsTitle, { color: colors.onSurface }]}>Comments</Text>
          
          {isCommentsLoading ? (
            <ActivityIndicator size="small" color={colors.primary} style={styles.commentLoader} />
          ) : comments.length > 0 ? (
            <FlatList
              data={comments}
              renderItem={renderComment}
              keyExtractor={(item) => item.id.toString()}
              scrollEnabled={false}
              ItemSeparatorComponent={() => <View style={{ height: 15 }} />}
            />
          ) : (
            <Text style={[styles.noCommentsText, { color: isDarkMode ? '#aaa' : colors.onSurfaceVarient }]}>
              No comments yet. Be the first to comment!
            </Text>
          )}
        </View>
      </ScrollView>
      
      <View style={[styles.commentInputContainer, { 
        backgroundColor: darkBackground, 
        borderTopColor: borderColor 
      }]}>
        <TextInput
          style={[styles.commentInput, { 
            color: colors.onSurface, 
            backgroundColor: isDarkMode ? 'rgba(40, 40, 45, 0.9)' : colors.surfaceContainerLow,
            borderColor: borderColor
          }]}
          placeholder="Add a comment..."
          placeholderTextColor={isDarkMode ? '#888' : colors.onSurfaceVarient}
          value={newComment}
          onChangeText={setNewComment}
          multiline
        />
        <TouchableOpacity 
          style={[
            styles.sendButton, 
            {backgroundColor: (!newComment.trim() || isSubmitting) 
              ? (isDarkMode ? 'rgba(60, 60, 70, 0.9)' : colors.surfaceContainerHigh) 
              : colors.primary}
          ]} 
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
    marginBottom: 60, 
  },
  errorText: {
    fontSize: 16,
    fontFamily: 'PlayfairDisplay-Regular',
  },
  postContainer: {
    marginHorizontal: 12,
    marginTop: 12,
    marginBottom: 20,
    borderRadius: 15,
    overflow: 'hidden',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
    borderWidth: 0.5,
    borderColor: 'rgba(150, 150, 150, 0.3)',
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    padding: 15,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(150, 150, 150, 0.3)',
  },
  backButton: {
    marginRight: 15,
  },
  userInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 10,
    borderWidth: 0.5,
    borderColor: 'rgba(150, 150, 150, 0.3)',
  },
  username: {
    fontSize: 15,
    fontFamily: 'PlayfairDisplay-Bold',
  },
  timeAgo: {
    color: '#777',
    fontSize: 13,
    fontFamily: 'PlayfairDisplay-Regular',
  },
  contentSection: {
    padding: 15,
    paddingTop: 0,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    flexWrap: 'wrap',
  },
  postTitle: {
    fontSize: 20,
    fontFamily: 'PlayfairDisplay-Bold',
    marginRight: 10,
    flex: 1,
  },
  topicBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    alignSelf: 'flex-start',
  },
  topicText: {
    color: '#fff',
    fontSize: 12,
    fontFamily: 'PlayfairDisplay-Medium',
  },
  postDescription: {
    fontSize: 16,
    marginBottom: 15,
    lineHeight: 24,
    fontFamily: 'PlayfairDisplay-Regular',
  },
  imageContainer: {
    marginBottom: 15,
    borderTopWidth: 0.5,
    borderBottomWidth: 0.5,
    borderColor: 'rgba(150, 150, 150, 0.3)',
  },
  postImage: {
    width: '100%',
    height: 250,
  },
  section: {
    margin: 15,
    marginTop: 0,
    borderRadius: 12,
    padding: 15,
    borderWidth: 0.5,
    borderColor: 'rgba(150, 150, 150, 0.3)',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'PlayfairDisplay-Bold',
    marginLeft: 10,
  },
  grammarItem: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: 'rgba(150, 150, 150, 0.3)',
  },
  grammarNumber: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  grammarNumberText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'PlayfairDisplay-Bold',
  },
  grammarContent: {
    flex: 1,
    padding: 12,
    paddingLeft: 5,
    justifyContent: 'space-between',
  },
  grammarText: {
    flex: 1,
    fontSize: 15,
    fontFamily: 'PlayfairDisplay-Regular',
    lineHeight: 22,
    fontStyle: 'italic',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    marginTop: 8,
  },
  saveButtonText: {
    fontSize: 12,
    fontFamily: 'PlayfairDisplay-Medium',
    marginLeft: 5,
  },
  postStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 15,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    paddingHorizontal: 10,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  statText: {
    marginLeft: 5,
    fontSize: 14,
    fontFamily: 'PlayfairDisplay-Regular',
  },
  commentsSection: {
    padding: 15,
    marginHorizontal: 12,
    marginBottom: 20,
    borderRadius: 15,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.18,
    shadowRadius: 1.00,
    elevation: 1,
    borderWidth: 0.5,
    borderColor: 'rgba(150, 150, 150, 0.3)',
  },
  commentsTitle: {
    fontSize: 18,
    fontFamily: 'PlayfairDisplay-Bold',
    marginBottom: 15,
  },
  commentLoader: {
    marginVertical: 20,
  },
  noCommentsText: {
    fontFamily: 'PlayfairDisplay-Regular',
    textAlign: 'center',
    marginVertical: 20,
  },
  commentItem: {
    flexDirection: 'row',
  },
  commentAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 10,
    borderWidth: 0.5,
    borderColor: 'rgba(150, 150, 150, 0.3)',
  },
  commentContent: {
    flex: 1,
    backgroundColor: 'rgba(150, 150, 150, 0.1)',
    padding: 10,
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: 'rgba(150, 150, 150, 0.2)',
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  commentAuthor: {
    fontFamily: 'PlayfairDisplay-Bold',
    fontSize: 14,
  },
  commentTime: {
    color: '#777',
    fontSize: 12,
    fontFamily: 'PlayfairDisplay-Regular',
  },
  commentText: {
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
    padding: 10,
    borderTopWidth: 0.5,
  },
  commentInput: {
    flex: 1,
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontFamily: 'PlayfairDisplay-Regular',
    maxHeight: 80,
    borderWidth: 0.5,
    borderColor: 'rgba(150, 150, 150, 0.3)',
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  }
});

export default PostDetail; 