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
  Share,
  Modal,
  Pressable
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
  const scrollViewRef = React.useRef(null);

  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMoreComments, setHasMoreComments] = useState(true);
  const [isLoadingMoreComments, setIsLoadingMoreComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [isLoading, setLoading] = useState(false);
  const [isCommentsLoading, setCommentsLoading] = useState(false);
  const [isSubmitting, setSubmitting] = useState(false);
  const [liked, setLiked] = useState(false);
  const [imageModalVisible, setImageModalVisible] = useState(false);

  const darkBackground = isDarkMode ? '#121212' : colors.surfaceContainer;
  const cardBackground = isDarkMode ? 'rgba(32, 32, 36, 0.95)' : colors.surfaceContainerLow;
  const sectionBackground = isDarkMode ? 'rgba(40, 40, 50, 0.95)' : colors.surfaceContainerHigh;
  const borderColor = isDarkMode ? 'rgba(70, 70, 80, 0.7)' : 'rgba(150, 150, 150, 0.3)';
  const separatorColor = isDarkMode ? 'rgba(70, 70, 80, 0.7)' : 'rgba(150, 150, 150, 0.2)';
  const secondaryText = isDarkMode ? '#aaa' : '#777';
  const commentBg = isDarkMode ? 'rgba(45, 45, 55, 0.8)' : 'rgba(150, 150, 150, 0.1)';

  useEffect(() => {
    getPostDetails();
    getComments(1, true);
  }, [postId]);

  // Add a focus effect to update the post details when returning to this screen
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      // Refresh post details when screen comes into focus
      if (postId) {
        getPostDetails();
      }
    });

    return unsubscribe;
  }, [navigation, postId]);

  const getPostDetails = async () => {
    setLoading(true);
    try {
      const config = userToken ? {
        headers: { Authorization: `Bearer ${userToken}` }
      } : {};
      
      // Get post details with all information including like status if possible
      const response = await axios.get(`${baseUrl}/posts/${postId}`, config);
      setPost(response.data);
      
      // Check if the post has isLiked field
      if (userToken) {
        if (response.data.hasOwnProperty('isLiked')) {
          setLiked(response.data.isLiked);
        } else {
          // If API doesn't provide isLiked, default to not liked
          setLiked(false);
        }
      } else {
        setLiked(false);
      }
    } catch (error) {
      console.error("Error fetching post details:", error.message);
      Alert.alert("Error", "Could not load post. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const getComments = async (page = 1, resetComments = false) => {
    if (page === 1) {
      setCommentsLoading(true);
    } else {
      setIsLoadingMoreComments(true);
    }
    
    try {
      const config = userToken ? {
        headers: { Authorization: `Bearer ${userToken}` }
      } : {};
      
      const response = await axios.get(`${baseUrl}/comment/${postId}/${page}`, config);
      
      if (response.data && typeof response.data === 'object') {
        const { nextPage, comments: newComments } = response.data;
        
        // Update comment list based on whether we're resetting or appending
        if (resetComments) {
          setComments(Array.isArray(newComments) ? newComments : []);
        } else {
          setComments(prevComments => [
            ...prevComments, 
            ...(Array.isArray(newComments) ? newComments : [])
          ]);
        }
        
        // Update pagination state
        setHasMoreComments(nextPage);
        setCurrentPage(page);
      } else {
        console.error("Unexpected response format:", response.data);
        if (resetComments) {
          setComments([]);
        }
        setHasMoreComments(false);
      }
    } catch (error) {
      console.error("Error fetching comments:", error.message);
      if (resetComments) {
        setComments([]);
      }
      setHasMoreComments(false);
    } finally {
      setCommentsLoading(false);
      setIsLoadingMoreComments(false);
    }
  };

  const loadMoreComments = () => {
    if (hasMoreComments && !isLoadingMoreComments && !isCommentsLoading) {
      getComments(currentPage + 1);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập nội dung bình luận");
      return;
    }
    if (!userToken) {
      Alert.alert(
        "Đăng nhập", 
        "Bạn cần đăng nhập để bình luận",
        [
          { text: "Hủy", style: "cancel" },
          { text: "Đăng nhập", onPress: () => navigation.navigate("SignIn") }
        ]
      );
      return;
    }

    setSubmitting(true);
    try {
      const config = {
        headers: { Authorization: `Bearer ${userToken}` }
      };
      
      const response = await axios.post(`${baseUrl}/comment/${postId}`, {
        content: newComment.trim()
      }, config);
      
      if (response.data) {
        setNewComment("");
        getComments(1, true); // Reset and fetch first page after adding comment
        getPostDetails();
        
        // Show success message
        Alert.alert("Thành công", "Bình luận của bạn đã được đăng");
        
        // Scroll to bottom after a short delay to allow the new comment to load
        setTimeout(() => {
          if (scrollViewRef.current) {
            scrollViewRef.current.scrollToEnd({ animated: true });
          }
        }, 500);
      } else {
        throw new Error("Không thể đăng bình luận");
      }
    } catch (error) {
      console.error("Error adding comment:", error.message);
      let errorMessage = "Không thể đăng bình luận. Vui lòng thử lại sau.";
      
      if (error.response) {
        switch (error.response.status) {
          case 400:
            errorMessage = "Nội dung bình luận không hợp lệ";
            break;
          case 401:
            errorMessage = "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại";
            break;
          case 403:
            errorMessage = "Bạn không có quyền bình luận";
            break;
          case 404:
            errorMessage = "Bài viết không tồn tại";
            break;
        }
      }
      
      Alert.alert("Lỗi", errorMessage);
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
        try {
          const response = await axios.post(`${baseUrl}/like/${postId}`, {}, config);
          if (response.data && response.data.totalLike !== undefined) {
            // Update the post with new like count
            setPost(prevPost => ({
              ...prevPost,
              totalLike: response.data.totalLike
            }));
            setLiked(true);
          }
        } catch (error) {
          if (error.response && error.response.status === 400) {
            // User already liked the post
            setLiked(true);
          } else {
            throw error; // Rethrow other errors
          }
        }
      } else {
        try {
          const response = await axios.delete(`${baseUrl}/like/${postId}`, config);
          if (response.data && response.data.totalLike !== undefined) {
            // Update the post with new like count
            setPost(prevPost => ({
              ...prevPost,
              totalLike: response.data.totalLike
            }));
            setLiked(false);
          }
        } catch (error) {
          if (error.response && error.response.status === 400) {
            // User hasn't liked the post
            setLiked(false);
          } else {
            throw error; // Rethrow other errors
          }
        }
      }
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
      return `${diffDay} ngày trước`;
    } else if (diffHour > 0) {
      return `${diffHour} giờ trước`;
    } else if (diffMin > 0) {
      return `${diffMin} phút trước`;
    } else {
      return 'Vừa mới';
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
            <Text style={[styles.saveButtonText, { color: colors.primary }]}>Lưu</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderComment = ({ item }) => {
    return (
      <View style={styles.commentItem}>
        <Image 
          source={item.user?.avatar 
            ? { uri: item.user.avatar } 
            : { uri: `https://ui-avatars.com/api/?name=${encodeURIComponent(item.user?.name || 'User')}` }
          } 
          style={[styles.commentAvatar, { borderColor: borderColor }]} 
        />
        <View style={styles.commentRightSection}>
          <Text style={[styles.commentAuthor, { color: colors.onSurface }]}>
            {item.user?.name || 'Anonymous'}
          </Text>
          
          <View style={[styles.commentContent]}>
            <Text style={[styles.commentText, { color: isDarkMode ? '#E0E0E0' : '#303030' }]}>
              {item.content}
            </Text>
          </View>
          
          <View style={styles.commentActions}>
            <TouchableOpacity 
              style={styles.commentActionButton}
              onPress={() => handleLikeComment(item.id, item.isLiked)}
            >
              <Ionicons 
                name={item.isLiked ? "heart" : "heart-outline"} 
                size={20} 
                color={item.isLiked ? "#E53935" : isDarkMode ? '#AAA' : '#666'} 
              />
              <Text style={[styles.actionText, { color: isDarkMode ? '#AAA' : '#666' }]}>
                {item.totalLike || 0}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.commentActionButton}>
              <Ionicons
                name="chatbubble-outline"
                size={18}
                color={isDarkMode ? '#AAA' : '#666'}
              />
              <Text style={[styles.actionText, { color: isDarkMode ? '#AAA' : '#666' }]}>
                0
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.commentActionButton}>
              <Feather
                name="share"
                size={18}
                color={isDarkMode ? '#AAA' : '#666'}
              />
              <Text style={[styles.actionText, { color: isDarkMode ? '#AAA' : '#666' }]}>
                0
              </Text>
            </TouchableOpacity>
            
            <Text style={[styles.commentTime, { color: secondaryText, marginLeft: 'auto' }]}>
              {formatDate(item.createdAt)}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const handleLikeComment = async (commentId, isLiked) => {
    if (!userToken) {
      navigation.navigate("SignIn");
      return;
    }

    try {
      const config = {
        headers: { Authorization: `Bearer ${userToken}` }
      };
      
      if (!isLiked) {
        try {
          const response = await axios.post(`${baseUrl}/comment/${commentId}/like`, {}, config);
          // Refresh comments to update UI
          getComments(currentPage, true);
        } catch (error) {
          if (error.response && error.response.status === 400) {
            // Comment already liked, refresh to update UI
            getComments(currentPage, true);
          } else {
            throw error;
          }
        }
      } else {
        try {
          const response = await axios.delete(`${baseUrl}/comment/${commentId}/like`, config);
          // Refresh comments to update UI
          getComments(currentPage, true);
        } catch (error) {
          if (error.response && error.response.status === 400) {
            // Comment wasn't liked, refresh to update UI
            getComments(currentPage, true);
          } else {
            throw error;
          }
        }
      }
    } catch (error) {
      console.error("Error updating comment like:", error.message);
      Alert.alert("Error", "Could not update like. Please try again later.");
    }
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
      <ScrollView 
        ref={scrollViewRef}
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.postContainer, { 
          backgroundColor: cardBackground,
          borderColor: borderColor 
        }]}>
          <View style={[styles.postHeader, { borderBottomColor: borderColor }]}>
            {/* <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={24} color={colors.onSurface} />
            </TouchableOpacity> */}
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
                  {post.author?.name || 'Anonymous'}
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
                  <Text style={styles.topicText}>Ngữ pháp</Text>
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
              <TouchableOpacity 
                activeOpacity={0.9} 
                onPress={() => setImageModalVisible(true)}
              >
                <Image 
                  source={{ uri: post.mainImage }} 
                  style={styles.postImage} 
                  resizeMode="cover"
                />
                <View style={styles.zoomIconContainer}>
                  <Ionicons name="expand" size={20} color="#FFFFFF" />
                </View>
              </TouchableOpacity>
            </View>
          )}
          
          {isGrammarPost && (
            <View style={[styles.section, { 
              backgroundColor: sectionBackground,
              borderColor: borderColor
            }]}>
              <View style={styles.sectionHeader}>
                <MaterialIcons name="lightbulb" size={24} color={colors.primary} />
                <Text style={[styles.sectionTitle, { color: colors.onSurface }]}>Mẹo ngữ pháp</Text>
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
          <View style={styles.commentsHeader}>
            <Text style={[styles.commentsTitle, { color: colors.onSurface }]}>Bình luận</Text>
            <Text style={[styles.commentsCount, { color: secondaryText }]}>
              {post.totalComment > 0 ? `${post.totalComment} bình luận` : 'Chưa có bình luận nào'}
            </Text>
          </View>
          
          {isCommentsLoading ? (
            <ActivityIndicator size="small" color={colors.primary} style={styles.commentLoader} />
          ) : comments.length > 0 ? (
            <>
              <FlatList
                data={comments}
                renderItem={renderComment}
                keyExtractor={(item, index) => `comment-${item.id || index}`}
                scrollEnabled={false}
                ItemSeparatorComponent={() => <View style={{ height: 15 }} />}
              />
              
              {hasMoreComments && (
                <TouchableOpacity 
                  style={[styles.loadMoreButton, { 
                    borderColor: borderColor,
                    backgroundColor: isDarkMode ? 'rgba(50, 50, 60, 0.5)' : 'rgba(240, 240, 245, 0.5)'
                  }]} 
                  onPress={loadMoreComments}
                  disabled={isLoadingMoreComments}
                >
                  {isLoadingMoreComments ? (
                    <ActivityIndicator size="small" color={colors.primary} />
                  ) : (
                    <>
                      <Text style={[styles.loadMoreButtonText, { color: colors.primary }]}>
                        Xem thêm bình luận
                      </Text>
                      <Ionicons name="chevron-down" size={16} color={colors.primary} />
                    </>
                  )}
                </TouchableOpacity>
              )}
            </>
          ) : (
            <View style={styles.noCommentsContainer}>
              <Ionicons 
                name="chatbubble-ellipses-outline" 
                size={40} 
                color={isDarkMode ? 'rgba(100, 100, 120, 0.5)' : 'rgba(180, 180, 190, 0.5)'} 
              />
              <Text style={[styles.noCommentsText, { color: isDarkMode ? '#aaa' : colors.onSurfaceVarient }]}>
                Chưa có bình luận nào. Hãy là người đầu tiên bình luận!
              </Text>
            </View>
          )}
        </View>

        {/* Comment Input Section */}
        <View style={[styles.commentInputContainer, { 
          backgroundColor: cardBackground,
          borderColor: borderColor
        }]}>
          <TextInput
            style={[styles.commentInput, { 
              color: colors.onSurface, 
              backgroundColor: isDarkMode ? 'rgba(40, 40, 45, 0.9)' : colors.surfaceContainerLow,
              borderColor: borderColor
            }]}
            placeholder="Viết bình luận..."
            placeholderTextColor={isDarkMode ? '#888' : colors.onSurfaceVarient}
            value={newComment}
            onChangeText={setNewComment}
            multiline
          />
          <TouchableOpacity 
            style={[
              styles.sendButton, 
              {backgroundColor: isSubmitting
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
      </ScrollView>
      
      {/* Image Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={imageModalVisible}
        onRequestClose={() => setImageModalVisible(false)}
      >
        <Pressable 
          style={styles.imageModalContainer} 
          onPress={() => setImageModalVisible(false)}
        >
          <Image
            source={{ uri: post?.mainImage }}
            style={styles.fullScreenImage}
            resizeMode="contain"
          />
          
        </Pressable>
      </Modal>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: 20,
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
    fontFamily: 'Inter-Regular',
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
    fontFamily: 'Inter-Bold',
  },
  timeAgo: {
    color: '#777',
    fontSize: 13,
    fontFamily: 'Inter-Regular',
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
    fontFamily: 'Inter-Bold',
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
    fontFamily: 'Inter-Medium',
  },
  postDescription: {
    fontSize: 16,
    marginBottom: 15,
    lineHeight: 24,
    fontFamily: 'Inter-Regular',
  },
  imageContainer: {
    marginBottom: 15,
    borderTopWidth: 0.5,
    borderBottomWidth: 0.5,
    borderColor: 'rgba(150, 150, 150, 0.3)',
    position: 'relative',
  },
  postImage: {
    width: '100%',
    height: 250,
  },
  zoomIconContainer: {
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
  imageModalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenImage: {
    width: '100%',
    height: '80%',
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
    fontFamily: 'Inter-Bold',
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
    fontFamily: 'Inter-Bold',
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
    fontFamily: 'Inter-Regular',
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
    fontFamily: 'Inter-Medium',
    marginLeft: 5,
  },
  postStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
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
    fontFamily: 'Inter-Regular',
  },
  commentsSection: {
    marginHorizontal: 12,
    marginBottom: 20,
    borderRadius: 15,
    padding: 15,
    borderWidth: 0.5,
  },
  commentsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    paddingBottom: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(150, 150, 150, 0.2)',
  },
  commentsTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
  },
  commentsCount: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  commentLoader: {
    marginVertical: 20,
  },
  noCommentsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 30,
  },
  noCommentsText: {
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    marginTop: 10,
    fontSize: 14,
  },
  commentItem: {
    flexDirection: 'row',
  },
  commentAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 0.5,
    borderColor: 'rgba(150, 150, 150, 0.3)',
  },
  commentRightSection: {
    flex: 1,
  },
  commentContent: {
    paddingBottom: 5,
  },
  commentAuthor: {
    fontFamily: 'Inter-Bold',
    fontSize: 14,
    marginBottom: 2,
  },
  commentTime: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
  },
  commentText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    lineHeight: 20,
  },
  commentInputContainer: {
    marginHorizontal: 12,
    marginBottom: 20,
    borderRadius: 15,
    padding: 15,
    borderWidth: 0.5,
    flexDirection: 'row',
    alignItems: 'center',
  },
  commentInput: {
    flex: 1,
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontFamily: 'Inter-Regular',
    maxHeight: 80,
    borderWidth: 0.5,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: 4,
    marginLeft: 10,
  },
  loadMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    marginTop: 15,
    borderTopWidth: 0.5,
    borderRadius: 8,
  },
  loadMoreButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    marginRight: 5,
  },
  commentActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    paddingVertical: 5,
  },
  commentActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
    paddingVertical: 3,
  },
  actionText: {
    marginLeft: 5,
    fontSize: 13,
    fontFamily: 'Inter-Regular',
  },
});

export default PostDetail; 