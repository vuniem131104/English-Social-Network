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
  Alert
} from 'react-native';
import { Ionicons, MaterialIcons, FontAwesome, Feather } from '@expo/vector-icons';
import { useTheme, useNavigation, useRoute } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { baseUrl } from '../../services/api';
import { AuthContext } from '../../context/authContext';
import NavbarTop from '../../components/header/NavbarTop';

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

  const fetchProfileData = async () => {
    setLoading(true);
    try {
      const config = userToken ? {
        headers: { Authorization: `Bearer ${userToken}` }
      } : {};
      
      const response = await axios.get(`${baseUrl}/users/${userId}`, config);
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
      
      const response = await axios.get(`${baseUrl}/users/${userId}/posts`, config);
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
    navigation.navigate('EditProfile');
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long'
    });
  };

  const renderPostItem = ({ item }) => {
    const isGrammarPost = item.steps && item.steps.length > 0;
    
    return (
      <TouchableOpacity 
        style={[styles.postCard, { backgroundColor: cardBackground, borderColor: borderColor }]} 
        onPress={() => navigation.navigate('PostDetail', { postId: item.id })}
      >
        <View style={styles.postContent}>
          <View style={styles.contentHeader}>
            <Text style={[styles.postTitle, { color: colors.onSurface }]} numberOfLines={2}>
              {item.title}
            </Text>
            {isGrammarPost && (
              <View style={[styles.tagBadge, { backgroundColor: colors.primary }]}>
                <Text style={styles.tagText}>Grammar</Text>
              </View>
            )}
          </View>
          
          <Text 
            style={[
              styles.postDescription, 
              { color: isDarkMode ? 'rgba(220, 220, 225, 0.9)' : colors.onSurfaceVarient }
            ]} 
            numberOfLines={2}
          >
            {item.description}
          </Text>
        </View>
        
        {item.mainImage && (
          <Image source={{ uri: item.mainImage }} style={styles.postImage} />
        )}
        
        <View style={[styles.postFooter, { borderTopColor: borderColor }]}>
          <Text style={[styles.postDate, { color: isDarkMode ? '#aaa' : '#777' }]}>
            {formatDate(item.createdAt)}
          </Text>
          <View style={styles.postStats}>
            <View style={styles.statItem}>
              <Ionicons name="heart-outline" size={16} color={isDarkMode ? '#bbb' : colors.onSurfaceVarient} />
              <Text style={[styles.statText, { color: isDarkMode ? '#bbb' : colors.onSurfaceVarient }]}>
                {item.totalLike || 0}
              </Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="chatbubble-outline" size={16} color={isDarkMode ? '#bbb' : colors.onSurfaceVarient} />
              <Text style={[styles.statText, { color: isDarkMode ? '#bbb' : colors.onSurfaceVarient }]}>
                {item.totalComment || 0}
              </Text>
            </View>
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
      />
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: darkBackground }]}>
        <NavbarTop />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: darkBackground }]}>
      <NavbarTop />
      <ScrollView style={styles.scrollView}>
        {/* Profile Header */}
        <View style={[styles.profileHeader, { backgroundColor: cardBackground, borderColor: borderColor }]}>
          <View style={styles.coverPhoto}>
            {profileData?.coverPhoto ? (
              <Image source={{ uri: profileData.coverPhoto }} style={styles.coverImage} />
            ) : (
              <View style={[styles.defaultCover, { backgroundColor: colors.primary }]} />
            )}
          </View>
          
          <View style={styles.profileInfo}>
            <View style={styles.avatarContainer}>
              <Image 
                source={
                  profileData?.avatar 
                    ? { uri: profileData.avatar }
                    : { uri: `https://ui-avatars.com/api/?name=${encodeURIComponent(profileData?.name || 'User')}` }
                } 
                style={styles.avatar}
              />
            </View>
            
            <View style={styles.userInfo}>
              <Text style={[styles.userName, { color: colors.onSurface }]}>
                {profileData?.name || 'User Name'}
              </Text>
              <Text style={[styles.userBio, { color: isDarkMode ? '#aaa' : '#666' }]}>
                {profileData?.bio || 'English learning enthusiast'}
              </Text>
              <Text style={[styles.joinDate, { color: isDarkMode ? '#888' : '#888' }]}>
                Joined {formatDate(profileData?.createdAt || new Date())}
              </Text>
            </View>
          </View>
          
          <View style={styles.statsRow}>
            <View style={styles.statBlock}>
              <Text style={[styles.statNumber, { color: colors.onSurface }]}>
                {profileData?.postCount || 0}
              </Text>
              <Text style={[styles.statLabel, { color: isDarkMode ? '#aaa' : '#777' }]}>
                Posts
              </Text>
            </View>
            <View style={styles.statBlock}>
              <Text style={[styles.statNumber, { color: colors.onSurface }]}>
                {profileData?.followersCount || 0}
              </Text>
              <Text style={[styles.statLabel, { color: isDarkMode ? '#aaa' : '#777' }]}>
                Followers
              </Text>
            </View>
            <View style={styles.statBlock}>
              <Text style={[styles.statNumber, { color: colors.onSurface }]}>
                {profileData?.followingCount || 0}
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
                    Edit Profile
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.profileButton, { borderColor: '#e74c3c' }]} 
                  onPress={handleLogout}
                >
                  <Feather name="log-out" size={16} color="#e74c3c" />
                  <Text style={[styles.profileButtonText, { color: '#e74c3c' }]}>
                    Log Out
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
              styles.tab, 
              activeTab === 'posts' && { 
                borderBottomWidth: 2, 
                borderBottomColor: colors.primary 
              }
            ]}
            onPress={() => setActiveTab('posts')}
          >
            <Feather 
              name="file-text" 
              size={20} 
              color={activeTab === 'posts' ? colors.primary : isDarkMode ? '#aaa' : '#777'} 
            />
            <Text 
              style={[
                styles.tabText, 
                { color: activeTab === 'posts' ? colors.primary : isDarkMode ? '#aaa' : '#777' }
              ]}
            >
              Posts
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.tab, 
              activeTab === 'achievements' && { 
                borderBottomWidth: 2, 
                borderBottomColor: colors.primary 
              }
            ]}
            onPress={() => setActiveTab('achievements')}
          >
            <Feather 
              name="award" 
              size={20} 
              color={activeTab === 'achievements' ? colors.primary : isDarkMode ? '#aaa' : '#777'} 
            />
            <Text 
              style={[
                styles.tabText, 
                { color: activeTab === 'achievements' ? colors.primary : isDarkMode ? '#aaa' : '#777' }
              ]}
            >
              Achievements
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.tab, 
              activeTab === 'saved' && { 
                borderBottomWidth: 2, 
                borderBottomColor: colors.primary 
              }
            ]}
            onPress={() => setActiveTab('saved')}
          >
            <Feather 
              name="bookmark" 
              size={20} 
              color={activeTab === 'saved' ? colors.primary : isDarkMode ? '#aaa' : '#777'} 
            />
            <Text 
              style={[
                styles.tabText, 
                { color: activeTab === 'saved' ? colors.primary : isDarkMode ? '#aaa' : '#777' }
              ]}
            >
              Saved
            </Text>
          </TouchableOpacity>
        </View>
        
        {/* Tab Content */}
        <View style={styles.tabContent}>
          {activeTab === 'posts' && (
            userPosts.length > 0 ? (
              <FlatList
                data={userPosts}
                renderItem={renderPostItem}
                keyExtractor={item => item.id.toString()}
                contentContainerStyle={styles.postsContainer}
                scrollEnabled={false}
              />
            ) : (
              <View style={styles.emptyContainer}>
                <Feather name="file-text" size={48} color={isDarkMode ? '#555' : '#ccc'} />
                <Text style={[styles.emptyText, { color: isDarkMode ? '#aaa' : colors.onSurfaceVarient }]}>
                  No posts yet
                </Text>
              </View>
            )
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
  },
  coverImage: {
    height: '100%',
    width: '100%',
    resizeMode: 'cover',
  },
  defaultCover: {
    height: '100%',
    width: '100%',
    opacity: 0.7,
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
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  userInfo: {
    flex: 1,
    marginTop: 5,
  },
  userName: {
    fontSize: 20,
    fontFamily: 'PlayfairDisplay-Bold',
    marginBottom: 4,
  },
  userBio: {
    fontSize: 14,
    fontFamily: 'PlayfairDisplay-Regular',
    marginBottom: 5,
  },
  joinDate: {
    fontSize: 13,
    fontFamily: 'PlayfairDisplay-Regular',
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
    fontFamily: 'PlayfairDisplay-Bold',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'PlayfairDisplay-Regular',
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
    fontFamily: 'PlayfairDisplay-Medium',
    marginLeft: 5,
  },
  tabsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 5,
    marginHorizontal: 12,
    marginBottom: 15,
    borderBottomWidth: 0.5,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  tabText: {
    fontSize: 14,
    fontFamily: 'PlayfairDisplay-Medium',
    marginLeft: 5,
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
  postCard: {
    borderRadius: 12,
    marginBottom: 15,
    overflow: 'hidden',
    borderWidth: 0.5,
  },
  postContent: {
    padding: 15,
  },
  contentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  postTitle: {
    fontSize: 16,
    fontFamily: 'PlayfairDisplay-Bold',
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
    fontSize: 10,
    fontFamily: 'PlayfairDisplay-Medium',
  },
  postDescription: {
    fontSize: 13,
    fontFamily: 'PlayfairDisplay-Regular',
    lineHeight: 18,
  },
  postImage: {
    width: '100%',
    height: 150,
    resizeMode: 'cover',
  },
  postFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderTopWidth: 0.5,
  },
  postDate: {
    fontSize: 12,
    fontFamily: 'PlayfairDisplay-Regular',
  },
  postStats: {
    flexDirection: 'row',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 15,
  },
  statText: {
    marginLeft: 4,
    fontSize: 12,
    fontFamily: 'PlayfairDisplay-Regular',
  },
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
    fontFamily: 'PlayfairDisplay-Bold',
    marginBottom: 4,
  },
  achievementDesc: {
    fontSize: 13,
    fontFamily: 'PlayfairDisplay-Regular',
    marginBottom: 5,
  },
  achievementDate: {
    fontSize: 12,
    fontFamily: 'PlayfairDisplay-Regular',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: 'PlayfairDisplay-Regular',
    marginTop: 10,
  },
});

export default Profile; 