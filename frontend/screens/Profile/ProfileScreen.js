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
  RefreshControl,
  Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialIcons, Feather } from '@expo/vector-icons';
import axios from 'axios';
import { baseUrl } from '../../services/api';
import { AuthContext } from '../../context/authContext';
import NavbarTop from '../../components/header/NavbarTop';
import PostCard from '../../components/post/PostCard';
import EmptyState from '../../components/common/EmptyState';

const ProfileScreen = ({ navigation, route }) => {
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('posts');
  const { userToken, userId, logout } = useContext(AuthContext);
  
  // Cho phép xem profile của người dùng khác nếu có userId từ route
  const profileId = route.params?.userId || userId;
  const isOwnProfile = profileId === userId;

  const fetchProfile = async () => {
    try {
      const config = {
        headers: {
          'Authorization': `Bearer ${userToken}`
        }
      };
      
      const response = await axios.get(`${baseUrl}/users/${profileId}`, config);
      setProfile(response.data);
    } catch (error) {
      console.error('Error fetching profile:', error);
      Alert.alert('Lỗi', 'Không thể tải thông tin người dùng');
    }
  };

  const fetchUserPosts = async () => {
    try {
      const config = {
        headers: {
          'Authorization': `Bearer ${userToken}`
        }
      };
      
      const response = await axios.get(`${baseUrl}/posts/user/${profileId}`, config);
      setPosts(response.data);
    } catch (error) {
      console.error('Error fetching user posts:', error);
      Alert.alert('Lỗi', 'Không thể tải bài viết');
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await Promise.all([fetchProfile(), fetchUserPosts()]);
      setLoading(false);
    };
    
    if (userToken) {
      fetchData();
    } else {
      navigation.navigate('SignIn');
    }
  }, [profileId, userToken]);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchProfile(), fetchUserPosts()]);
    setRefreshing(false);
  };

  const handleEditProfile = () => {
    navigation.navigate('EditProfile');
  };

  const handleCreatePost = () => {
    navigation.navigate('CreatePost');
  };

  const handleLogout = () => {
    Alert.alert(
      'Đăng xuất',
      'Bạn có chắc chắn muốn đăng xuất?',
      [
        { text: 'Hủy', style: 'cancel' },
        { text: 'Đăng xuất', onPress: () => logout() }
      ]
    );
  };

  if (loading) {
    return (
      <LinearGradient colors={['#BE0303', '#1c1a1a', '#000000']} style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ffffff" />
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#BE0303', '#1c1a1a', '#000000']} style={styles.container}>
      <NavbarTop />
      
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#fff"
          />
        }
      >
        <View style={styles.profileHeader}>
          <View style={styles.profileImageContainer}>
            <Image
              source={
                profile?.avatar
                  ? { uri: profile.avatar }
                  : require('../../assets/images/default-avatar.png')
              }
              style={styles.profileImage}
            />
          </View>
          
          <View style={styles.profileInfo}>
            <Text style={styles.userName}>{profile?.fullName || 'Người dùng'}</Text>
            <Text style={styles.userHandle}>@{profile?.username || 'username'}</Text>
            
            <View style={styles.statsContainer}>
              <View style={styles.stat}>
                <Text style={styles.statNumber}>{posts.length}</Text>
                <Text style={styles.statLabel}>Bài viết</Text>
              </View>
              <View style={styles.stat}>
                <Text style={styles.statNumber}>{profile?.followersCount || 0}</Text>
                <Text style={styles.statLabel}>Người theo dõi</Text>
              </View>
              <View style={styles.stat}>
                <Text style={styles.statNumber}>{profile?.followingCount || 0}</Text>
                <Text style={styles.statLabel}>Đang theo dõi</Text>
              </View>
            </View>
          </View>
        </View>
        
        {profile?.bio && (
          <View style={styles.bioContainer}>
            <Text style={styles.bioText}>{profile.bio}</Text>
          </View>
        )}
        
        <View style={styles.actionButtonsContainer}>
          {isOwnProfile ? (
            <>
              <TouchableOpacity style={styles.actionButton} onPress={handleEditProfile}>
                <Feather name="edit-2" size={16} color="#fff" />
                <Text style={styles.actionButtonText}>Chỉnh sửa hồ sơ</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.actionButton} onPress={handleCreatePost}>
                <Ionicons name="add-circle-outline" size={16} color="#fff" />
                <Text style={styles.actionButtonText}>Tạo bài viết</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={[styles.actionButton, styles.logoutButton]} onPress={handleLogout}>
                <MaterialIcons name="logout" size={16} color="#fff" />
                <Text style={styles.actionButtonText}>Đăng xuất</Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity 
              style={[styles.actionButton, styles.followButton]}
              onPress={() => Alert.alert('Thông báo', 'Tính năng theo dõi đang được phát triển')}
            >
              <Ionicons name="person-add" size={16} color="#fff" />
              <Text style={styles.actionButtonText}>Theo dõi</Text>
            </TouchableOpacity>
          )}
        </View>
        
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'posts' && styles.activeTab]}
            onPress={() => setActiveTab('posts')}
          >
            <Ionicons 
              name="grid-outline" 
              size={24} 
              color={activeTab === 'posts' ? '#BE0303' : '#fff'} 
            />
            <Text style={[styles.tabText, activeTab === 'posts' && styles.activeTabText]}>
              Bài viết
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.tab, activeTab === 'saved' && styles.activeTab]}
            onPress={() => setActiveTab('saved')}
          >
            <Ionicons 
              name="bookmark-outline" 
              size={24} 
              color={activeTab === 'saved' ? '#BE0303' : '#fff'} 
            />
            <Text style={[styles.tabText, activeTab === 'saved' && styles.activeTabText]}>
              Đã lưu
            </Text>
          </TouchableOpacity>
        </View>
        
        {activeTab === 'posts' ? (
          posts.length > 0 ? (
            <View style={styles.postsContainer}>
              {posts.map(post => (
                <PostCard 
                  key={post._id} 
                  post={post} 
                  navigation={navigation} 
                  onRefresh={onRefresh}
                />
              ))}
            </View>
          ) : (
            <EmptyState
              icon="document-text-outline"
              title="Chưa có bài viết nào"
              message={
                isOwnProfile 
                  ? "Bạn chưa đăng bài viết nào. Hãy bắt đầu chia sẻ!"
                  : "Người dùng này chưa đăng bài viết nào."
              }
              actionText={isOwnProfile ? "Tạo bài viết mới" : null}
              onAction={isOwnProfile ? handleCreatePost : null}
            />
          )
        ) : (
          <EmptyState
            icon="bookmark-outline"
            title="Chưa có bài viết đã lưu"
            message="Bạn chưa lưu bài viết nào. Lưu các bài viết yêu thích để xem lại sau!"
          />
        )}
      </ScrollView>
    </LinearGradient>
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
  },
  profileHeader: {
    flexDirection: 'row',
    padding: 15,
    alignItems: 'center',
  },
  profileImageContainer: {
    marginRight: 15,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: '#BE0303',
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    color: '#fff',
    fontSize: 22,
    fontFamily: 'PlayfairDisplay-Bold',
  },
  userHandle: {
    color: '#aaa',
    fontSize: 14,
    marginBottom: 10,
    fontFamily: 'PlayfairDisplay-Regular',
  },
  statsContainer: {
    flexDirection: 'row',
  },
  stat: {
    marginRight: 20,
  },
  statNumber: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'PlayfairDisplay-Bold',
    textAlign: 'center',
  },
  statLabel: {
    color: '#ccc',
    fontSize: 12,
    fontFamily: 'PlayfairDisplay-Regular',
  },
  bioContainer: {
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  bioText: {
    color: '#ddd',
    fontSize: 14,
    fontFamily: 'PlayfairDisplay-Regular',
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    marginBottom: 20,
    flexWrap: 'wrap',
  },
  actionButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 5,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: 10,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  followButton: {
    backgroundColor: '#BE0303',
  },
  logoutButton: {
    backgroundColor: 'rgba(190, 3, 3, 0.5)',
  },
  actionButtonText: {
    color: '#fff',
    marginLeft: 5,
    fontSize: 14,
    fontFamily: 'PlayfairDisplay-Regular',
  },
  tabsContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 10,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#BE0303',
  },
  tabText: {
    color: '#fff',
    marginLeft: 5,
    fontSize: 14,
    fontFamily: 'PlayfairDisplay-Regular',
  },
  activeTabText: {
    color: '#BE0303',
    fontFamily: 'PlayfairDisplay-Bold',
  },
  postsContainer: {
    paddingHorizontal: 10,
    paddingBottom: 20,
  },
});

export default ProfileScreen; 