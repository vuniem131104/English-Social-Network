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
    id: 25,
    author: {
      id: 2,
      username: "username1",
      name: "Bùi Hòa Minzy",
      avatar: "https://picsum.photos/seed/avatar1/400/400"
    },
    title: "Luyện phát âm Eng chuẩn như Tây? K khó như bạn nghĩ! 😉",
    description: "Nói Eng mà giọng đặc sệt VN là mất điểm lắm nha. Muốn chuẩn thì phải học IPA (bảng phiên âm á), nghe Tây nói rồi nhại theo (shadowing). Dùng mấy cái từ điển online có loa bấm nghe thử. Luyện mấy âm khó như /th/, /r/, /l/ với âm cuối (ending sounds). Chăm chỉ là đc à!",
    mainImage: "",
    totalView: 50,
    totalComment: 13,
    totalLike: 26,
    steps: [
      "1. Học IPA.",
      "2. Shadowing (Nhại theo).",
      "3. Check từ điển online (nghe phát âm).",
      "4. Tập trung âm khó + âm cuối.",
      "5. Ghi âm giọng mình nghe lại."
    ],
    createdAt: "2025-05-01T20:00:00.000Z",
    updatedAt: "2025-05-08T09:38:15.000Z"
  },
  {
    id: 156,
    author: {
      id: 2,
      username: "username1",
      name: "Bùi Hòa Minzy",
      avatar: "https://picsum.photos/seed/avatar1/400/400"
    },
    title: "Đi xem concert idol: Cháy hết mình!!! 🔥🎤🎶",
    description: "Hôm qua đi đu concert idol về mà giờ giọng vẫn còn khàn nè mấy má ơi! Quẩy banh nóc, hát khản cổ, la hét muốn tắt thở lun á. Nhưng mà zuiiiii xỉu! Cảm giác được ở gần idol, được nghe hát live nó phê gì đâu á. Worth it!",
    mainImage: "https://picsum.photos/seed/post159/600/400",
    totalView: 22,
    totalComment: 5,
    totalLike: 1,
    steps: [],
    createdAt: "2025-05-02T12:00:00.000Z",
    updatedAt: "2025-05-12T07:05:45.000Z"
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

    const repostCount = 1;
    const shareCount = 1;

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

  const renderPostItem_v2 = ({ item }) => {
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

    const repostCount = 1;
    const shareCount = 1;

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
              <Ionicons name="heart" size={18} color={'#BE0303'} />
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
            Lượt thích
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
          style={styles.sectionContainer}
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
            <FlatList
              data={activityData}
              renderItem={renderPostItem_v2}
              keyExtractor={item => item.id.toString()}
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