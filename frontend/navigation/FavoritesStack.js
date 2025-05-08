import React, { useState, useEffect, useContext } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import {
  Text,
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList,
  ActivityIndicator,
  Alert,
  RefreshControl
} from "react-native";
import { useTheme, useNavigation } from "@react-navigation/native";
import { Ionicons, Feather } from '@expo/vector-icons';
import axios from "axios";
import { baseUrl } from "../services/api";
import { AuthContext } from "../context/authContext";
import PostDetail from "../screens/Home/PostDetail";

// Placeholder data for activity feed
const activityData = [
  {
    id: '1',
    type: 'new',
    username: 'nguyenhanh02',
    userAvatar: 'https://ui-avatars.com/api/?name=NH',
    timeAgo: '2 giờ',
    content: 'Sao t bắt chuyện nghiệp rồi mà vẫn không xem được phần này các mom ơi cíuuuuuuu',
    likes: 224,
    comments: 12,
    isForYou: true
  },
  {
    id: '2',
    type: 'previous',
    username: 'nguoiyeutoicuckycute',
    userAvatar: 'https://ui-avatars.com/api/?name=NY',
    timeAgo: '1 ngày',
    content: 'Anh tắm với con nào...',
    likes: 6100,
    comments: 72,
    shares: 299,
    views: 488,
    isForYou: true
  },
  {
    id: '3',
    type: 'previous',
    username: 'kqunhy.lt',
    userAvatar: 'https://ui-avatars.com/api/?name=KQ',
    timeAgo: '2 ngày',
    content: 'vô phúc làm môi có ny cỡ này',
    likes: 2900,
    comments: 215,
    shares: 164,
    views: 322,
    isForYou: true
  },
  {
    id: '4',
    type: 'previous',
    username: 'ameliee_official',
    userAvatar: 'https://ui-avatars.com/api/?name=AM',
    timeAgo: '3 ngày',
    content: 'New post',
    likes: 3400,
    comments: 98,
    shares: 120,
    views: 510,
    isForYou: true
  }
];

// Placeholder component cho favorites screen
const FavoritesScreen = () => {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const { userToken, userInfo } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('posts');
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Default user ID if not logged in
  const defaultUserId = 6; // Using vugiau user ID from the example

  useEffect(() => {
    fetchUserPosts();
  }, [userToken]);

  const fetchUserPosts = async () => {
    setLoading(true);
    try {
      // Determine which user ID to use
      const userId = userInfo?.id || defaultUserId;

      // Set up headers with token if available
      const config = userToken ? {
        headers: { Authorization: `Bearer ${userToken}` }
      } : {};

      // Fetch posts from the API
      const response = await axios.get(`${baseUrl}/profile/posts/${userId}`, config);

      if (Array.isArray(response.data)) {
        setPosts(response.data);
      } else {
        console.error("Expected array but got:", typeof response.data);
        setPosts([]);
      }
    } catch (error) {
      console.error("Error fetching user posts:", error.message);
      Alert.alert("Error", "Could not load posts. Please try again later.");
      setPosts([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchUserPosts();
  };

  const handlePostPress = (post) => {
    navigation.navigate("PostDetail", { postId: post.id });
  };

  const renderActivityItem = ({ item }) => {
    // Generate random values for repost and share counts that don't exceed view count
    const viewCount = item.views || 0;
    const generateRandomCount = (max) => {
      if (max === 0) return 0;
      return Math.floor(Math.random() * max);
    };

    // Use existing shares value if present, otherwise generate random
    const repostCount = item.shares || generateRandomCount(viewCount);
    // Generate random share count
    const shareCount = generateRandomCount(viewCount);

    return (
      <View style={[styles.activityItem, { borderBottomColor: 'rgba(150, 150, 150, 0.1)' }]}>
        <View style={styles.activityHeader}>
          <View style={styles.userContainer}>
            <Image
              source={item.avatar
            ? { uri: item.avatar }
            : { uri: `https://ui-avatars.com/api/?name=${item.name?.split(' ').join('+')}&background=a0a0a0`} }
              style={styles.userAvatar}
            />
            <View style={styles.userInfo}>
              <Text style={[styles.username, { color: colors.onSurface }]}>{item.username}</Text>
              <Text style={[styles.timeAgo, { color: colors.onSurfaceVarient }]}>{item.timeAgo}</Text>
              {item.isForYou && (
                <Text style={[styles.forYouTag, { color: colors.onSurfaceVarient }]}>Được chọn cho bạn</Text>
              )}
            </View>
          </View>
          <TouchableOpacity>
            <Feather name="more-horizontal" size={20} color={colors.onSurfaceVarient} />
          </TouchableOpacity>
        </View>

        <Text style={[styles.postTitle, { color: colors.onSurface }]}>{item.content}</Text>

        <View style={styles.postStats}>
          <View style={styles.statItem}>
            <TouchableOpacity style={styles.statButton}>
              <Ionicons name="heart-outline" size={22} color={colors.onSurface} />
            </TouchableOpacity>
            <Text style={[styles.statText, { color: colors.onSurface }]}>{item.likes}</Text>
          </View>

          <View style={styles.statItem}>
            <TouchableOpacity style={styles.statButton}>
              <Ionicons name="chatbubble-outline" size={22} color={colors.onSurface} />
            </TouchableOpacity>
            <Text style={[styles.statText, { color: colors.onSurface }]}>{item.comments}</Text>
          </View>

          {item.views && (
            <View style={styles.statItem}>
              <TouchableOpacity style={styles.statButton}>
                <Feather name="eye" size={22} color={colors.onSurface} />
              </TouchableOpacity>
              <Text style={[styles.statText, { color: colors.onSurface }]}>{item.views}</Text>
            </View>
          )}

          <View style={styles.statItem}>
            <TouchableOpacity style={styles.statButton}>
              <Feather name="repeat" size={22} color={colors.onSurface} />
            </TouchableOpacity>
            <Text style={[styles.statText, { color: colors.onSurface }]}>{repostCount}</Text>
          </View>

          <View style={styles.statItem}>
            <TouchableOpacity style={styles.statButton}>
              <Feather name="share" size={22} color={colors.onSurface} />
            </TouchableOpacity>
            <Text style={[styles.statText, { color: colors.onSurface }]}>{shareCount}</Text>
          </View>
          
        </View>

        {item.type === 'previous' && item.id === '2' && (
          <View style={[styles.viewMoreContainer, { backgroundColor: colors.surfaceContainerLow }]}>
            <Text style={[styles.viewMoreText, { color: colors.onSurface }]}>
              Bạn muốn xem thêm hay ẩn bớt thông báo tương tự?
            </Text>
            <View style={styles.viewMoreButtons}>
              <TouchableOpacity style={[styles.viewMoreButton, { borderColor: colors.outline }]}>
                <Text style={[styles.viewMoreButtonText, { color: colors.onSurface }]}>Xem thêm</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.viewMoreButton, { borderColor: colors.outline }]}>
                <Text style={[styles.viewMoreButtonText, { color: colors.onSurface }]}>Ẩn bớt</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    );
  };

  const renderPostItem = ({ item }) => {
    // Format the date to display like in the image
    const formatDate = (dateString) => {
      const date = new Date(dateString);
      const now = new Date();
      const diffTime = Math.abs(now - date);
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 0) {
        const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
        if (diffHours === 0) {
          const diffMinutes = Math.floor(diffTime / (1000 * 60));
          return `${diffMinutes} phút`;
        }
        return `${diffHours} giờ`;
      } else if (diffDays === 1) {
        return '1 ngày';
      } else {
        return `${diffDays} ngày`;
      }
    };

    // Generate random values for repost and share counts that don't exceed view count
    const viewCount = item.totalView || 0;
    const generateRandomCount = (max) => {
      if (max === 0) return 0;
      return Math.floor(Math.random() * max);
    };

    const repostCount = generateRandomCount(viewCount);
    const shareCount = generateRandomCount(viewCount);

    return (
      <TouchableOpacity
        style={[styles.postItem, { borderBottomColor: 'rgba(150, 150, 150, 0.1)' }]}
        onPress={() => handlePostPress(item)}
      >
        <View style={styles.activityHeader}>
          <View style={styles.userContainer}>
            <Image
              source={item.author?.avatar
            ? { uri: item.author.avatar }
            : { uri: `https://ui-avatars.com/api/?name=${item.author.name?.split(' ').join('+')}&background=a0a0a0`} }
              style={styles.userAvatar}
            />
            <View style={styles.userInfo}>
              <Text style={[styles.username, { color: colors.onSurface }]}>{item.author.name}</Text>
              <View style={styles.timeContainer}>
                <Text style={[styles.timeAgo, { color: colors.onSurfaceVarient }]}>
                  {formatDate(item.createdAt)}
                </Text>
              </View>
            </View>
          </View>
          <TouchableOpacity style={styles.moreButton}>
            <Feather name="more-horizontal" size={18} color={colors.onSurfaceVarient} />
          </TouchableOpacity>
        </View>

        <Text style={[styles.postTitle, { color: colors.onSurface }]}>{item.title}</Text>
        <Text style={[styles.postDescription, { color: colors.onSurfaceVarient }]}>{item.description}</Text>

        <View style={styles.postStats}>
          <View style={styles.statItem}>
            <TouchableOpacity style={styles.statButton}>
              <Ionicons name="heart-outline" size={18} color={colors.onSurface} />
            </TouchableOpacity>
            <Text style={[styles.statText, { color: colors.onSurface }]}>{item.totalLike || 0}</Text>
          </View>

          <View style={styles.statItem}>
            <TouchableOpacity style={styles.statButton}>
              <Ionicons name="chatbubble-outline" size={18} color={colors.onSurface} />
            </TouchableOpacity>
            <Text style={[styles.statText, { color: colors.onSurface }]}>{item.totalComment || 0}</Text>
          </View>

          <View style={styles.statItem}>
            <TouchableOpacity style={styles.statButton}>
              <Feather name="eye" size={18} color={colors.onSurface} />
            </TouchableOpacity>
            <Text style={[styles.statText, { color: colors.onSurface }]}>{item.totalView || 0}</Text>
          </View>

          <View style={styles.statItem}>
            <TouchableOpacity style={styles.statButton}>
              <Feather name="repeat" size={18} color={colors.onSurface} />
            </TouchableOpacity>
            <Text style={[styles.statText, { color: colors.onSurface }]}>{repostCount}</Text>
          </View>

          <View style={styles.statItem}>
            <TouchableOpacity style={styles.statButton}>
              <Feather name="upload" size={18} color={colors.onSurface} />
            </TouchableOpacity>
            <Text style={[styles.statText, { color: colors.onSurface }]}>{shareCount}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.surfaceContainer }]}>
      <View style={styles.headerContainer}>
        <Text style={[styles.headerTitle, { color: colors.onSurface }]}>Hoạt động</Text>
      </View>

      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === 'all' && [styles.activeTabButton, { borderBottomColor: colors.primary }]
          ]}
          onPress={() => setActiveTab('all')}
        >
          <Text
            style={[
              styles.tabText,
              { color: activeTab === 'all' ? colors.onSurface : colors.onSurfaceVarient }
            ]}
          >
            Tất cả
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === 'follows' && [styles.activeTabButton, { borderBottomColor: colors.primary }]
          ]}
          onPress={() => setActiveTab('follows')}
        >
          <Text
            style={[
              styles.tabText,
              { color: activeTab === 'follows' ? colors.onSurface : colors.onSurfaceVarient }
            ]}
          >
            Lượt theo dõi
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === 'posts' && [styles.activeTabButton, { borderBottomColor: colors.primary }]
          ]}
          onPress={() => setActiveTab('posts')}
        >
          <Text
            style={[
              styles.tabText,
              { color: activeTab === 'posts' ? colors.onSurface : colors.onSurfaceVarient }
            ]}
          >
            Bài viết
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === 'mentions' && [styles.activeTabButton, { borderBottomColor: colors.primary }]
          ]}
          onPress={() => setActiveTab('mentions')}
        >
          <Text
            style={[
              styles.tabText,
              { color: activeTab === 'mentions' ? colors.onSurface : colors.onSurfaceVarient }
            ]}
          >
            Lượt nhắc
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'posts' ? (
        <ScrollView
          style={styles.postsContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {loading && posts.length === 0 ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={[styles.loadingText, { color: colors.onSurface }]}>Đang tải bài viết...</Text>
            </View>
          ) : posts.length > 0 ? (
            <FlatList
              data={posts}
              renderItem={renderPostItem}
              keyExtractor={item => item.id.toString()}
              scrollEnabled={false}
              contentContainerStyle={{ paddingBottom: 100 }}
            />
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, { color: colors.onSurface }]}>
                Không có bài viết nào
              </Text>
            </View>
          )}
        </ScrollView>
      ) : (
        <>
          <View style={styles.sectionContainer}>
            <Text style={[styles.sectionTitle, { color: colors.onSurface }]}>Mới</Text>
            <FlatList
              data={activityData.filter(item => item.type === 'new')}
              renderItem={renderActivityItem}
              keyExtractor={item => item.id}
              scrollEnabled={false}
            />
          </View>

          <View style={styles.sectionContainer}>
            <Text style={[styles.sectionTitle, { color: colors.onSurface }]}>Trước</Text>
            <FlatList
              data={activityData.filter(item => item.type === 'previous')}
              renderItem={renderActivityItem}
              keyExtractor={item => item.id}
              scrollEnabled={false}
            />
          </View>
        </>
      )}
    </View>
  );
};

const FavoritesStack = createNativeStackNavigator();

const FavoritesStackScreen = () => {
  return (
    <FavoritesStack.Navigator screenOptions={{ headerShown: false }}>
      <FavoritesStack.Screen name="FavoritesScreen" component={FavoritesScreen} />
      <FavoritesStack.Screen name="PostDetail" component={PostDetail} />
    </FavoritesStack.Navigator>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
  },
  tabsContainer: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(150, 150, 150, 0.2)',
    justifyContent: 'space-between',
    paddingHorizontal: 5,
  },
  tabButton: {
    paddingVertical: 10,
    paddingHorizontal: 8,
    flex: 1,
    alignItems: 'center',
  },
  activeTabButton: {
    borderBottomWidth: 2,
  },
  tabText: {
    fontFamily: 'Inter-Medium',
    fontSize: 13,
    textAlign: 'center',
  },
  sectionContainer: {
    marginTop: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  activityItem: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
  },
  activityHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 6,
    position: 'relative',
    paddingRight: 30,
  },
  moreButton: {
    marginRight: 20,
    position: 'absolute',
    right: 0,
  },
  userContainer: {
    flexDirection: 'row',
  },
  userAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 8,
  },
  userInfo: {
    flex: 1,
  },
  username: {
    fontFamily: 'Inter-Bold',
    fontSize: 13,
    marginBottom: 1,
  },
  timeAgo: {
    fontFamily: 'Inter-Regular',
    fontSize: 11,
  },
  forYouTag: {
    fontFamily: 'Inter-Regular',
    fontSize: 11,
    marginTop: 1,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  postTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 17,
    marginBottom: 4,
  },
  postDescription: {
    fontFamily: 'Inter-Regular',
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 10,
    color: '#666',
  },
  postStats: {
    flexDirection: 'row',
  },
  statItem: {
    flexDirection: 'row',
    marginRight: 12,
    alignItems: 'center',
  },
  statButton: {
    marginRight: 3,
  },
  statText: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
  },
  viewMoreContainer: {
    marginTop: 15,
    padding: 15,
    borderRadius: 10,
  },
  viewMoreText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    marginBottom: 15,
  },
  viewMoreButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  viewMoreButton: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    borderWidth: 1,
    width: '48%',
    alignItems: 'center',
  },
  viewMoreButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
  },
  // New styles for posts
  postsContainer: {
    flex: 1,
  },
  postItem: {
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  // This style is already defined above
  postImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginVertical: 10,
  },
  stepsContainer: {
    marginVertical: 10,
    paddingLeft: 5,
  },
  stepText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 30,
  },
  loadingText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    marginTop: 10,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
  }
});

export default FavoritesStackScreen;