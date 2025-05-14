import React, { useState, useEffect, useContext } from "react";
import {
  Text,
  StyleSheet,
  View,
  Image,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Share,
  Alert
} from "react-native";
import { useNavigation, useTheme } from "@react-navigation/native";
import { useSelector } from "react-redux";
import axios from "axios";
import { baseUrl } from "../../services/api";
import { AuthContext } from "../../context/authContext";
import { Ionicons, Feather, MaterialIcons } from '@expo/vector-icons';

const HomePage = () => {
  const navigation = useNavigation();
  const { userToken, userInfo } = useContext(AuthContext);
  const { colors } = useTheme();
  const isDarkMode = useSelector(state => state.theme.isDarkMode);

  const [activeTab, setActiveTab] = useState('forYou'); // 'forYou' or 'following'
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Thêm test lấy post người theo dõi
  const [isFollowingLoading, setIsFollowingLoading] = useState(false);
  const [followingId, setFollowingId] = useState([]);


  useEffect(() => {
    fetchPosts();
  }, [userToken, activeTab]);

  const fetchPosts = async () => {
    setIsLoading(true);
    const apiCall = activeTab === 'forYou' ? `${baseUrl}/newsfeed/20` : `${baseUrl}/newsfeedf/20`;

    try {
      const config = userToken
        ? { headers: { Authorization: `Bearer ${userToken}` } }
        : {};
      const response = await axios.get(apiCall, config);
      if (Array.isArray(response.data)) {
        // sort posts by createdAt in descending order with createdAt attribute
        response.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setPosts(response.data);
      } else {
        console.error("Expected array but got:", typeof response.data);
        setPosts([]);
      }

    } catch (error) {
      console.error("Error fetching posts:", error.message);
      setPosts([]);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }

  const onRefresh = () => {
    setRefreshing(true);
    fetchPosts();
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

  const handlePostPress = (post) => {
    navigation.navigate("PostDetail", { postId: post.id });
  };

  const handleSharePost = async (post) => {
    try {
      const shareContent = {
        message: `${post.title}\n\n${post.description}\n\nCheck out this English tip on English Social App!`,
        title: post.title,
      };

      const result = await Share.share(shareContent);
    } catch (error) {
      Alert.alert("Error", "Unable to share this post. Please try again later.");
    }
  };

  // Add a new function to handle post likes
  const handleLikePost = async (post, index) => {
    if (!userToken) {
      Alert.alert(
        "Đăng nhập",
        "Bạn cần đăng nhập để thích bài viết",
        [
          { text: "Hủy", style: "cancel" },
          { text: "Đăng nhập", onPress: () => navigation.navigate("SignIn") }
        ]
      );
      return;
    }

    try {
      const config = {
        headers: { Authorization: `Bearer ${userToken}` }
      };

      // Create a copy of posts for updating
      const updatedPosts = [...posts];
      const currentPost = { ...updatedPosts[index] };

      if (!currentPost.isLiked) {
        try {
          const response = await axios.post(`${baseUrl}/like/${currentPost.id}`, {}, config);
          if (response.data && response.data.totalLike !== undefined) {
            // Update post with new like count
            currentPost.totalLike = response.data.totalLike;
            currentPost.isLiked = true;
          }
        } catch (error) {
          if (error.response && error.response.status === 400) {
            // Already liked
            currentPost.isLiked = true;
          } else {
            throw error;
          }
        }
      } else {
        try {
          const response = await axios.delete(`${baseUrl}/like/${currentPost.id}`, config);
          if (response.data && response.data.totalLike !== undefined) {
            // Update post with new like count
            currentPost.totalLike = response.data.totalLike;
            currentPost.isLiked = false;
          }
        } catch (error) {
          if (error.response && error.response.status === 400) {
            // Not liked
            currentPost.isLiked = false;
          } else {
            throw error;
          }
        }
      }

      // Update the post in the array
      updatedPosts[index] = currentPost;
      setPosts(updatedPosts);

    } catch (error) {
      console.error("Error updating like:", error.message);
      Alert.alert("Error", "Could not update like. Please try again later.");
    }
  };

  // Generate random counts that don't exceed view count
  const generateRandomCounts = (viewCount) => {
    if (!viewCount) return { repost: 0, share: 0 };

    // Generate random numbers between 0 and viewCount
    // const repost = Math.floor(Math.random() * viewCount);
    // const share = Math.floor(Math.random() * viewCount);
    const repost = 1;
    const share = 1;

    return { repost, share };
  };

  const renderItem = ({ item, index }) => {
    // Determine if the post contains English grammar tips
    const isGrammarPost = item.steps && item.steps.length > 0;

    // Customize colors for dark mode
    const cardBackground = isDarkMode ? 'rgba(32, 32, 36, 0.9)' : colors.surfaceContainerLow;
    const cardBorder = isDarkMode ? 'rgba(70, 70, 80, 0.7)' : colors.outlineVariant;
    const separatorColor = isDarkMode ? 'rgba(70, 70, 80, 0.7)' : 'rgba(150, 150, 150, 0.2)';
    const tipBackground = isDarkMode ? 'rgba(40, 40, 45, 0.9)' : 'rgba(245, 245, 245, 0.1)';

    // Generate random repost and share counts that don't exceed view count
    const viewCount = item.totalView || 0;
    const { repost, share } = generateRandomCounts(viewCount);

    return (
      <TouchableOpacity
        style={[styles.postCard, {
          backgroundColor: cardBackground,
          borderColor: cardBorder,
        }]}
        onPress={() => handlePostPress(item)}
      >
        <View style={styles.postContent}>
          <View style={styles.userInfo}>
            <Image
              source={item.author?.avatar
            ? { uri: item.author.avatar }
            : { uri: `https://ui-avatars.com/api/?name=${item.author.name?.split(' ').join('+')}&background=a0a0a0`} }
              style={styles.avatar}
            />
            <View>
              <Text style={[styles.username, { color: colors.onSurface }]}>
                {item.author?.name || 'Anonymous'}
              </Text>
              <Text style={[styles.timeAgo, { color: isDarkMode ? '#aaa' : '#777' }]}>
                {formatDate(item.createdAt)}
              </Text>
            </View>
          </View>

          <View style={styles.contentHeader}>
            <Text style={[styles.postTitle, { color: colors.onSurface }]} numberOfLines={2}>
              {item.title}
            </Text>
            {isGrammarPost && (
              <View style={[styles.tagBadge, { backgroundColor: colors.primary }]}>
                <Text style={styles.tagText}>Ngữ pháp</Text>
              </View>
            )}
          </View>

          <Text
            style={[
              styles.postDescription,
              { color: isDarkMode ? 'rgba(220, 220, 225, 0.9)' : colors.onSurfaceVarient }
            ]}
            numberOfLines={3}
          >
            {item.description}
          </Text>
        </View>

        {item.mainImage && (
          <View style={[styles.imageContainer, { borderColor: separatorColor }]}>
            <Image
              source={{ uri: item.mainImage }}
              style={styles.postImage}
              resizeMode="cover"
            />
          </View>
        )}

        {/* {isGrammarPost && (
          <View style={[
            styles.tipPreview,
            {
              borderTopColor: separatorColor,
              borderBottomColor: separatorColor,
              backgroundColor: tipBackground
            }
          ]}>
            <Text style={[styles.tipPreviewTitle, { color: colors.primary }]}>
              <MaterialIcons name="lightbulb" size={18} color={colors.primary} />
              English Tip Preview:
            </Text>
            <Text style={[styles.tipPreviewContent, { color: colors.onSurface }]} numberOfLines={1}>
              {item.steps[0]}
            </Text>
            {item.steps.length > 1 && (
              <Text style={[styles.tipPreviewMore, { color: isDarkMode ? '#aaa' : colors.onSurfaceVarient }]}>
                +{item.steps.length - 1} more...
              </Text>
            )}
          </View>
        )} */}

        <View style={[styles.postStats, { borderTopColor: separatorColor }]}>
          <TouchableOpacity
            style={styles.statItem}
            onPress={(e) => {
              e.stopPropagation();
              handleLikePost(item, index);
            }}
          >
            <Ionicons
              name={item.isLiked ? "heart" : "heart-outline"}
              size={20}
              color={item.isLiked ? "#BE0303" : isDarkMode ? '#bbb' : colors.onSurfaceVarient}
            />
            <Text style={[styles.statText, { color: isDarkMode ? '#bbb' : colors.onSurfaceVarient }]}>
              {item.totalLike || 0}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.statItem}>
            <Ionicons name="chatbubble-outline" size={20} color={isDarkMode ? '#bbb' : colors.onSurfaceVarient} />
            <Text style={[styles.statText, { color: isDarkMode ? '#bbb' : colors.onSurfaceVarient }]}>
              {item.totalComment || 0}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.statItem}>
            <Feather name="eye" size={20} color={isDarkMode ? '#bbb' : colors.onSurfaceVarient} />
            <Text style={[styles.statText, { color: isDarkMode ? '#bbb' : colors.onSurfaceVarient }]}>
              {item.totalView || 0}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.statItem}
            onPress={(e) => {
              e.stopPropagation();
              Alert.alert("Repost", "Repost functionality would be implemented here");
            }}
          >
            <Feather name="repeat" size={20} color={isDarkMode ? '#bbb' : colors.onSurfaceVarient} />
            <Text style={[styles.statText, { color: isDarkMode ? '#bbb' : colors.onSurfaceVarient }]}>
              {repost}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.statItem}
            onPress={(e) => {
              e.stopPropagation();
              handleSharePost(item);
            }}
          >
            <Feather name="share" size={20} color={isDarkMode ? '#bbb' : colors.onSurfaceVarient} />
            <Text style={[styles.statText, { color: isDarkMode ? '#bbb' : colors.onSurfaceVarient }]}>
              {share}
            </Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, {
      backgroundColor: isDarkMode ? '#121212' : colors.surfaceContainer
    }]}>
      <FlatList
        data={posts}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        ListHeaderComponent={
          <View>

            {/* Tabs for For You and Following */}
            <View style={[styles.tabContainer, { borderBottomColor: colors.outlineVariant }]}>
              <TouchableOpacity
                style={[
                  styles.tab,
                  activeTab === 'forYou' ? [styles.activeTab, { borderBottomColor: colors.primary }] : {}
                ]}
                onPress={() => {
                  setActiveTab('forYou');
                  setPosts([]); // Clear posts when switching tabs
                }}
              >
                <Text
                  style={[
                    styles.tabText,
                    { color: activeTab === 'forYou' ? colors.primary : colors.onSurfaceVarient }
                  ]}
                >
                  Dành cho bạn
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.tab,
                  activeTab === 'following' ? [styles.activeTab, { borderBottomColor: colors.primary }] : {}
                ]}
                onPress={() => {
                  if (!userToken) {
                    Alert.alert(
                      "Đăng nhập",
                      "Bạn cần đăng nhập để xem bài viết từ người dùng bạn đang theo dõi",
                      [
                        { text: "Hủy", style: "cancel" },
                        { text: "Đăng nhập", onPress: () => navigation.navigate("SignIn") }
                      ]
                    );
                  } else {
                    {
                      setActiveTab('following');
                      setPosts([]); // Clear posts when switching tabs
                    };
                  }
                }}
              >
                <Text
                  style={[
                    styles.tabText,
                    { color: activeTab === 'following' ? colors.primary : colors.onSurfaceVarient }
                  ]}
                >
                  Đang theo dõi
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        }
        ListEmptyComponent={
          isLoading ? (
            <View style={styles.loaderContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={[
                styles.emptyText,
                { color: isDarkMode ? '#bbb' : colors.onSurfaceVarient }
              ]}>
                {activeTab === 'following' ? 'Bạn chưa theo dõi ai hoặc họ chưa đăng bài' : 'Không có bài viết nào'}
              </Text>
            </View>
          )
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: 70,
  },
  listContainer: {
    padding: 15,
    paddingBottom: 20,
  },
  header: {
    marginBottom: 15,
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
  },
  tabContainer: {
    display: "flex",
    flexDirection: 'row',
    justifyContent: "space-between",
    marginBottom: 20,
    borderBottomWidth: 0.5,
    width: '100%',
  },
  tab: {
    paddingVertical: 12,
    width: '50%',
    alignItems: 'center',
    paddingBottom: 15,
  },
  activeTab: {
    borderBottomWidth: 2,
    marginBottom: -0.5,
  },
  tabText: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
  },
  loaderContainer: {
    paddingVertical: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    paddingVertical: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
  },
  separator: {
    height: 18,
  },
  postCard: {
    borderRadius: 15,
    marginBottom: 10,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    borderWidth: 0.5,
  },
  imageContainer: {
    borderTopWidth: 0.5,
    borderBottomWidth: 0.5,
    borderColor: 'rgba(150, 150, 150, 0.2)',
  },
  postImage: {
    width: '100%',
    height: 200,
  },
  postContent: {
    padding: 15,
    paddingBottom: 10,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 0.5,
    borderColor: 'rgba(150, 150, 150, 0.3)',
  },
  username: {
    fontSize: 14,
    fontFamily: 'Inter-Bold',
  },
  timeAgo: {
    color: '#777',
    fontSize: 12,
    fontFamily: 'Inter-Regular',
  },
  contentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  postTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    flex: 1,
  },
  tagBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 10,
  },
  tagText: {
    color: 'white',
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
  postDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    lineHeight: 20,
    marginBottom: 10,
  },
  tipPreview: {
    padding: 15,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderTopColor: 'rgba(150, 150, 150, 0.2)',
    borderBottomColor: 'rgba(150, 150, 150, 0.2)',
    backgroundColor: 'rgba(245, 245, 245, 0.1)',
  },
  tipPreviewTitle: {
    fontSize: 14,
    fontFamily: 'Inter-Bold',
    marginBottom: 5,
  },
  tipPreviewContent: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    fontStyle: 'italic',
  },
  tipPreviewMore: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    marginTop: 4,
  },
  postStats: {
    flexDirection: 'row',
    padding: 15,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(150, 150, 150, 0.2)',
    gap: 10,
    justifyContent: 'space-between',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 2,
  },
  statText: {
    marginLeft: 4,
    fontSize: 13,
    fontFamily: 'Inter-Regular',
  },
});

export default HomePage;