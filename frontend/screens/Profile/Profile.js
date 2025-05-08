import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  FlatList,
  ActivityIndicator,
  SafeAreaView,
  Alert,
  RefreshControl
} from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useTheme, useNavigation, useRoute } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { baseUrl } from '../../services/api';
import { AuthContext } from '../../context/authContext';
import PostDetail from "../Home/PostDetail";


const Profile = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { userToken, userInfo, logout } = useContext(AuthContext);
  const { colors } = useTheme();
  const isDarkMode = useSelector(state => state.theme.isDarkMode);
  const userId = route.params?.userId || userInfo?.id;
  const isOwnProfile = userInfo?.id === userId;

  // Define dark mode specific colors
  const darkBackground = isDarkMode ? '#121212' : colors.surfaceContainer;
  const cardBackground = isDarkMode ? 'rgba(32, 32, 36, 0.95)' : colors.surfaceContainerLow;
  const borderColor = isDarkMode ? 'rgba(70, 70, 80, 0.7)' : 'rgba(150, 150, 150, 0.3)';

  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [activeTab, setActiveTab] = useState('posts'); // posts, achievements, saved
  const [following, setFollowing] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchProfileData();
    fetchUserPosts();
  }, [userId]);

  // Effect to monitor theme changes
  useEffect(() => {
    console.log('Theme changed - isDarkMode:', isDarkMode);
  }, [isDarkMode]);

  const fetchProfileData = async () => {
    setLoading(true);
    try {
      const config = userToken ? {
        headers: { Authorization: `Bearer ${userToken}` }
      } : {};

      // Use the profile API endpoint as specified in the requirements
      const response = await axios.get(`${baseUrl}/profile/${userId}`, config);
      console.log('Profile data:', response.data);

      // Add cache-busting parameter to image URLs
      // if (response.data.avatar) {
      //   response.data.avatar = `${response.data.avatar}?t=${new Date().getTime()}`;
      // }
      // if (response.data.banner) {
      //   response.data.banner = `${response.data.banner}?t=${new Date().getTime()}`;
      // }

      // console.log('Modified Avatar URL:', response.data.avatar);
      // console.log('Modified Banner URL:', response.data.banner);

      setProfileData(response.data);
      setFollowing(response.data.isFollowing || false);
    } catch (error) {
      console.error('Error fetching profile data:', error);
      Alert.alert('Error', 'Could not load user profile');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserPosts = async () => {
    try {
      const config = userToken ? {
        headers: { Authorization: `Bearer ${userToken}` }
      } : {};

      // Use the profile posts API endpoint as specified in the requirements
      const response = await axios.get(`${baseUrl}/profile/posts/${userId}`, config);
      console.log('User posts:', response.data);
      if (Array.isArray(response.data)) {
        setUserPosts(response.data);
      }
    } catch (error) {
      console.error('Error fetching user posts:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleFollow = async () => {
    if (!userToken) {
      Alert.alert(
        'Sign In Required',
        'You need to sign in to follow users',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Sign In', onPress: () => navigation.navigate('SignIn') }
        ]
      );
      return;
    }

    try {
      const config = {
        headers: { Authorization: `Bearer ${userToken}` }
      };

      if (!following) {
        await axios.post(`${baseUrl}/users/${userId}/follow`, {}, config);
      } else {
        await axios.delete(`${baseUrl}/users/${userId}/follow`, config);
      }

      setFollowing(!following);
      fetchProfileData(); // Refresh profile data
    } catch (error) {
      console.error('Error following/unfollowing user:', error);
      Alert.alert('Error', 'Could not perform this action');
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Log Out', onPress: () => logout() }
      ]
    );
  };

  const handleEditProfile = () => {
    // Sử dụng navigation.getParent() để lấy navigator cha và điều hướng từ đó
    const parentNavigation = navigation.getParent();
    if (parentNavigation) {
      parentNavigation.navigate('EditProfile', { userId: userInfo?.id });
    } else {
      // Fallback nếu không tìm thấy navigator cha
      navigation.navigate('EditProfile', { userId: userInfo?.id });
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long'
    });
  };

  const handlePostPress = (post) => {
    navigation.navigate("PostDetail", { postId: post.id });
  };

  const renderPostItem = ({ item }) => {
    // Format the date to display like in the Activities screen
    const formatPostDate = (dateString) => {
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
                : { uri: `https://ui-avatars.com/api/?name=${item.author?.name?.split(' ').join('+') || 'User'}&background=a0a0a0`} }
              style={styles.userAvatar}
            />
            <View style={styles.userInfo}>
              <Text style={[styles.username, { color: colors.onSurface }]}>{item.author?.name || 'User'}</Text>
              <View style={styles.timeContainer}>
                <Text style={[styles.timeAgo, { color: colors.onSurfaceVarient }]}>
                  {formatPostDate(item.createdAt)}
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

        {item.mainImage && (
          <Image source={{ uri: item.mainImage }} style={styles.postImage} />
        )}

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
              <Feather name="share" size={18} color={colors.onSurface} />
            </TouchableOpacity>
            <Text style={[styles.statText, { color: colors.onSurface }]}>{shareCount}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderAchievements = () => {
    const achievements = [
      { id: '1', title: 'Grammar Master', icon: 'school', date: '2023-05-15', description: 'Completed 20 grammar exercises' },
      { id: '2', title: 'Vocabulary Builder', icon: 'book', date: '2023-06-20', description: 'Learned 500 new words' },
      { id: '3', title: 'Consistent Learner', icon: 'trending-up', date: '2023-07-10', description: 'Studied for 30 consecutive days' },
    ];

    return (
      <View style={styles.achievementsContainer}>
        {achievements.map(achievement => (
          <View
            key={achievement.id}
            style={[styles.achievementCard, { backgroundColor: cardBackground, borderColor: borderColor }]}
          >
            <View style={[styles.achievementIcon, { backgroundColor: colors.primary }]}>
              <Feather name={achievement.icon} size={24} color="#fff" />
            </View>
            <View style={styles.achievementContent}>
              <Text style={[styles.achievementTitle, { color: colors.onSurface }]}>
                {achievement.title}
              </Text>
              <Text style={[styles.achievementDesc, { color: isDarkMode ? 'rgba(220, 220, 225, 0.9)' : colors.onSurfaceVarient }]}>
                {achievement.description}
              </Text>
              <Text style={[styles.achievementDate, { color: isDarkMode ? '#aaa' : '#777' }]}>
                {formatDate(achievement.date)}
              </Text>
            </View>
          </View>
        ))}
      </View>
    );
  };

  const renderSavedPosts = () => {
    if (userPosts.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Feather name="bookmark" size={48} color={isDarkMode ? '#555' : '#ccc'} />
          <Text style={[styles.emptyText, { color: isDarkMode ? '#aaa' : colors.onSurfaceVarient }]}>
            No saved posts yet
          </Text>
        </View>
      );
    }

    // Placeholder - would typically fetch saved posts from a different endpoint
    return (
      <FlatList
        data={userPosts.slice(0, 2)}
        renderItem={renderPostItem}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.savedPostsContainer}
        scrollEnabled={false}
      />
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: darkBackground }]}>
        <View style={[styles.customHeader, { backgroundColor: isDarkMode ? '#121212' : colors.surfaceContainer }]}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={[styles.backButton, { backgroundColor: colors.primary }]}
          >
            <Ionicons name="arrow-back" size={20} color="#fff" />
          </TouchableOpacity>

          <Text style={[styles.headerTitle, { color: colors.onSurface }]}>
            Profile
          </Text>

          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: darkBackground }]}>
      <View style={[styles.customHeader, { backgroundColor: isDarkMode ? '#121212' : colors.surfaceContainer }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={[styles.backButton, { backgroundColor: colors.primary }]}
        >
          <Ionicons name="arrow-back" size={20} color="#fff" />
        </TouchableOpacity>

        <Text style={[styles.headerTitle, { color: colors.onSurface }]}>
          {profileData?.name || 'Profile'}
        </Text>

        <View style={styles.placeholder} />
      </View>
      <ScrollView style={styles.scrollView}>
        {/* Profile Header */}
        <View style={[styles.profileHeader, { backgroundColor: cardBackground, borderColor: borderColor }]}>
          <View style={styles.coverPhoto}>
            {profileData?.banner ? (
              <Image
                key={`banner-${profileData.banner}`}
                source={{ uri: profileData.banner }}
                style={styles.coverImage}
                resizeMode="cover"
                onError={(e) => console.error('Banner image error:', e.nativeEvent.error)}
                onLoad={() => console.log('Banner image loaded successfully')}
              />
            ) : (
              <View style={[styles.defaultCover, { backgroundColor: '#c11e1e' }]} />
            )}
          </View>

          <View style={styles.profileInfo}>
            <View style={styles.avatarContainer}>
              <Image
                key={`avatar-${profileData.avatar}`}
                source={
                  profileData?.avatar
                    ? { uri: profileData.avatar }
                    : { uri: `https://ui-avatars.com/api/?name=${encodeURIComponent(profileData?.name || 'User')}&background=random` }
                }
                style={styles.avatar}
                resizeMode="cover"
                onError={(e) => console.error('Avatar image error:', e.nativeEvent.error)}
                onLoad={() => console.log('Avatar image loaded successfully')}
              />
            </View>

            <View style={styles.userInfo}>
              <Text style={[styles.userBio, { color: isDarkMode ? '#aaa' : '#666' }]}>
                {profileData?.bio || 'English learning enthusiast'}
              </Text>
              <Text style={[styles.joinDate, { color: isDarkMode ? '#888' : '#888' }]}>
                Joined May 2023
              </Text>
            </View>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statBlock}>
              <Text style={[styles.statNumber, { color: colors.onSurface }]}>
                {userPosts?.length || 0}
              </Text>
              <Text style={[styles.statLabel, { color: isDarkMode ? '#aaa' : '#777' }]}>
                Posts
              </Text>
            </View>
            <View style={styles.statBlock}>
              <Text style={[styles.statNumber, { color: colors.onSurface }]}>
                {profileData?.totalFollowers || 0}
              </Text>
              <Text style={[styles.statLabel, { color: isDarkMode ? '#aaa' : '#777' }]}>
                Followers
              </Text>
            </View>
            <View style={styles.statBlock}>
              <Text style={[styles.statNumber, { color: colors.onSurface }]}>
                {profileData?.totalFollowing || 0}
              </Text>
              <Text style={[styles.statLabel, { color: isDarkMode ? '#aaa' : '#777' }]}>
                Following
              </Text>
            </View>
          </View>

          <View style={styles.actionButtons}>
            {isOwnProfile ? (
              <>
                <TouchableOpacity
                  style={[styles.profileButton, { borderColor: colors.primary }]}
                  onPress={handleEditProfile}
                >
                  <Feather name="edit-2" size={16} color={colors.primary} />
                  <Text style={[styles.profileButtonText, { color: colors.primary }]}>
                    Chỉnh sửa hồ sơ
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.profileButton, { borderColor: colors.primary }]}
                  onPress={handleLogout}
                >
                  <Feather name="log-out" size={16} color={colors.primary} />
                  <Text style={[styles.profileButtonText, { color: colors.primary }]}>
                    Đăng xuất
                  </Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <TouchableOpacity
                  style={[
                    styles.profileButton,
                    following ?
                      { backgroundColor: 'transparent', borderColor: colors.primary } :
                      { backgroundColor: colors.primary }
                  ]}
                  onPress={handleFollow}
                >
                  <Feather
                    name={following ? "user-check" : "user-plus"}
                    size={16}
                    color={following ? colors.primary : "#fff"}
                  />
                  <Text
                    style={[
                      styles.profileButtonText,
                      { color: following ? colors.primary : "#fff" }
                    ]}
                  >
                    {following ? "Following" : "Follow"}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.profileButton, { borderColor: colors.primary }]}
                  onPress={() => navigation.navigate('ChatDetail', { userId: userId })}
                >
                  <Feather name="message-circle" size={16} color={colors.primary} />
                  <Text style={[styles.profileButtonText, { color: colors.primary }]}>
                    Message
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>

        {/* Tabs */}
        <View style={[styles.tabsContainer, { borderBottomColor: borderColor }]}>
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
              Tất cả
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === 'achievements' && [styles.activeTabButton, { borderBottomColor: colors.primary }]
            ]}
            onPress={() => setActiveTab('achievements')}
          >
            <Text
              style={[
                styles.tabText,
                { color: activeTab === 'achievements' ? colors.onSurface : colors.onSurfaceVarient }
              ]}
            >
              Thành tích
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === 'saved' && [styles.activeTabButton, { borderBottomColor: colors.primary }]
            ]}
            onPress={() => setActiveTab('saved')}
          >
            <Text
              style={[
                styles.tabText,
                { color: activeTab === 'saved' ? colors.onSurface : colors.onSurfaceVarient }
              ]}
            >
              Bài viết
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tab Content */}
        <View style={styles.tabContent}>
          {activeTab === 'posts' && (
            <ScrollView
              style={styles.postsContainer}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={() => {
                  setRefreshing(true);
                  fetchUserPosts();
                }} />
              }
            >
              {userPosts.length > 0 ? (
                <FlatList
                  data={userPosts}
                  renderItem={renderPostItem}
                  keyExtractor={item => item.id.toString()}
                  scrollEnabled={false}
                  contentContainerStyle={{ paddingBottom: 20 }}
                />
              ) : (
                <View style={styles.emptyContainer}>
                  <Feather name="file-text" size={48} color={isDarkMode ? '#555' : '#ccc'} />
                  <Text style={[styles.emptyText, { color: isDarkMode ? '#aaa' : colors.onSurfaceVarient }]}>
                    No posts yet
                  </Text>
                </View>
              )}
            </ScrollView>
          )}

          {activeTab === 'achievements' && renderAchievements()}

          {activeTab === 'saved' && renderSavedPosts()}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  customHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  backButton: {
    width: 35,
    height: 35,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
  },
  placeholder: {
    width: 35,
  },
  profileHeader: {
    marginHorizontal: 12,
    marginTop: 12,
    marginBottom: 15,
    borderRadius: 15,
    overflow: 'hidden',
    borderWidth: 0.5,
  },
  coverPhoto: {
    height: 120,
    width: '100%',
    backgroundColor: '#f0f0f0',
  },
  coverImage: {
    height: '100%',
    width: '100%',
  },
  defaultCover: {
    height: '100%',
    width: '100%',
    opacity: 0.9,
  },
  profileInfo: {
    flexDirection: 'row',
    padding: 15,
    paddingTop: 0,
  },
  avatarContainer: {
    marginTop: -40,
    marginRight: 15,
    borderRadius: 50,
    padding: 3,
    backgroundColor: '#fff',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    width: 86, // Fixed width to ensure proper framing
    height: 86, // Fixed height to ensure proper framing
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f0f0f0',
  },
  userInfo: {
    flex: 1,
    marginTop: 5,
  },
  userName: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    marginBottom: 4,
  },
  userBio: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    marginBottom: 5,
  },
  joinDate: {
    fontSize: 13,
    fontFamily: 'Inter-Regular',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 15,
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(150, 150, 150, 0.2)',
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(150, 150, 150, 0.2)',
  },
  statBlock: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
  },
  profileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    borderWidth: 1,
    flex: 1,
    marginHorizontal: 5,
  },
  profileButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    marginLeft: 5,
  },
  // Updated tab styles to match Activities screen
  tabsContainer: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(150, 150, 150, 0.2)',
    justifyContent: 'space-between',
    paddingHorizontal: 5,
    marginHorizontal: 12,
    marginBottom: 15,
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
  tabContent: {
    paddingBottom: 20,
  },
  postsContainer: {
    paddingHorizontal: 12,
  },
  savedPostsContainer: {
    paddingHorizontal: 12,
  },
  achievementsContainer: {
    paddingHorizontal: 12,
  },
  // Updated post styles to match Activities screen
  postItem: {
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderBottomWidth: 1,
    marginBottom: 5,
  },
  activityHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 6,
    position: 'relative',
    paddingRight: 30,
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
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeAgo: {
    fontFamily: 'Inter-Regular',
    fontSize: 11,
  },
  moreButton: {
    position: 'absolute',
    right: 0,
  },
  username: {
    fontFamily: 'Inter-Bold',
    fontSize: 13,
    marginBottom: 1,
  },
  postTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    marginBottom: 4,
  },
  postDescription: {
    fontSize: 13,
    fontFamily: 'Inter-Regular',
    lineHeight: 18,
    marginBottom: 8,
  },
  postImage: {
    width: '100%',
    height: 180,
    resizeMode: 'cover',
    borderRadius: 8,
    marginBottom: 10,
  },
  postStats: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginTop: 5,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
  },
  statButton: {
    marginRight: 4,
  },
  statText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
  },
  // Achievement styles
  achievementCard: {
    flexDirection: 'row',
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    borderWidth: 0.5,
  },
  achievementIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  achievementContent: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    marginBottom: 4,
  },
  achievementDesc: {
    fontSize: 13,
    fontFamily: 'Inter-Regular',
    marginBottom: 5,
  },
  achievementDate: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    marginTop: 10,
  },
});

export default Profile;