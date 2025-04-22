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
  ScrollView,
} from "react-native";
import { useNavigation, useTheme } from "@react-navigation/native";
import { useSelector } from "react-redux";
import axios from "axios";
import { baseUrl } from "../../services/api";
import { AuthContext } from "../../context/authContext";
import { Ionicons, Feather } from '@expo/vector-icons';
import MainLayout from "../../components/layout/MainLayout";

const Notifications = () => {
  const navigation = useNavigation();
  const { userToken } = useContext(AuthContext);
  const { colors } = useTheme();
  const isDarkMode = useSelector(state => state.theme.isDarkMode);

  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    fetchNotifications();
  }, [userToken, activeTab]);

  const fetchNotifications = async () => {
    if (!userToken) return;
    
    setIsLoading(true);
    try {
      const config = {
        headers: { Authorization: `Bearer ${userToken}` }
      };
      
      // In a real app, there would be an endpoint for notifications
      // This is a placeholder for demonstration purposes
      const response = await axios.get(`${baseUrl}/user/notifications?type=${activeTab}`, config);
      
      if (Array.isArray(response.data)) {
        setNotifications(response.data);
      } else {
        // If API isn't ready, use mock data
        setNotifications(getMockNotifications());
      }
    } catch (error) {
      console.error("Error fetching notifications:", error.message);
      // Use mock data for development
      setNotifications(getMockNotifications());
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const getMockNotifications = () => {
    return [
      {
        id: 1,
        type: 'like',
        message: 'Nguyen Van A đã thích bài viết của bạn',
        user: {
          id: 101,
          name: 'Nguyen Van A',
          avatar: null
        },
        postId: 201,
        createdAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
        read: false
      },
      {
        id: 2,
        type: 'comment',
        message: 'Tran Thi B đã bình luận về bài viết của bạn',
        user: {
          id: 102,
          name: 'Tran Thi B',
          avatar: null
        },
        postId: 201,
        createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
        read: false
      },
      {
        id: 3,
        type: 'follow',
        message: 'Le Van C đã bắt đầu theo dõi bạn',
        user: {
          id: 103,
          name: 'Le Van C',
          avatar: null
        },
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        read: true
      },
      {
        id: 4,
        type: 'system',
        message: 'Chào mừng bạn đến với ứng dụng nấu ăn English Social!',
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        read: true
      },
    ];
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchNotifications();
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

  const handleNotificationPress = (notification) => {
    if (notification.postId) {
      navigation.navigate("PostDetail", { postId: notification.postId });
    } else if (notification.type === 'follow' && notification.user) {
      navigation.navigate("UserProfile", { userId: notification.user.id });
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'like':
        return <Ionicons name="heart" size={24} color="#FF375F" />;
      case 'comment':
        return <Ionicons name="chatbubble" size={24} color="#007AFF" />;
      case 'follow':
        return <Ionicons name="person-add" size={24} color="#34C759" />;
      case 'system':
        return <Ionicons name="notifications" size={24} color={colors.primary} />;
      default:
        return <Ionicons name="notifications-outline" size={24} color={colors.onSurfaceVarient} />;
    }
  };

  const renderNotificationItem = ({ item }) => {
    return (
      <TouchableOpacity 
        style={[
          styles.notificationItem, 
          { 
            backgroundColor: item.read ? colors.surfaceContainer : colors.surfaceContainerHigh,
            borderLeftColor: !item.read ? colors.primary : 'transparent',
            borderLeftWidth: !item.read ? 4 : 0
          }
        ]} 
        onPress={() => handleNotificationPress(item)}
      >
        <View style={styles.iconContainer}>
          {getNotificationIcon(item.type)}
        </View>
        <View style={styles.notificationContent}>
          <View style={styles.userInfo}>
            {item.user && (
              <Image 
                source={item.user.avatar 
                  ? { uri: item.user.avatar } 
                  : { uri: `https://ui-avatars.com/api/?name=${encodeURIComponent(item.user.name)}` }
                } 
                style={styles.avatar} 
              />
            )}
            <View style={styles.messageContainer}>
              <Text style={[styles.message, { color: colors.onSurface }]}>
                {item.message}
              </Text>
              <Text style={styles.timeAgo}>{formatDate(item.createdAt)}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <MainLayout>
      <View style={[styles.container, { backgroundColor: colors.surfaceContainer }]}>
        <View style={[styles.header, { borderBottomColor: colors.outline }]}>
          <Text style={[styles.headerTitle, { color: colors.onSurface }]}>
            Thông báo
          </Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            style={styles.tabsContainer}
          >
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
                activeTab === 'likes' && [styles.activeTabButton, { borderBottomColor: colors.primary }]
              ]}
              onPress={() => setActiveTab('likes')}
            >
              <Text 
                style={[
                  styles.tabText, 
                  { color: activeTab === 'likes' ? colors.onSurface : colors.onSurfaceVarient }
                ]}
              >
                Lượt thích
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.tabButton, 
                activeTab === 'comments' && [styles.activeTabButton, { borderBottomColor: colors.primary }]
              ]}
              onPress={() => setActiveTab('comments')}
            >
              <Text 
                style={[
                  styles.tabText, 
                  { color: activeTab === 'comments' ? colors.onSurface : colors.onSurfaceVarient }
                ]}
              >
                Bình luận
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
                Người theo dõi
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        <FlatList
          data={notifications}
          renderItem={renderNotificationItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
          ListEmptyComponent={
            isLoading ? (
              <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
              </View>
            ) : (
              <View style={styles.emptyContainer}>
                <Ionicons name="notifications-outline" size={60} color={colors.onSurfaceVarient} />
                <Text style={[styles.emptyText, { color: colors.onSurfaceVarient }]}>
                  Không có thông báo nào
                </Text>
              </View>
            )
          }
        />
      </View>
    </MainLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 10,
    paddingHorizontal: 15,
    borderBottomWidth: 0.5,
    marginBottom: 5,
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: 'PlayfairDisplay-Bold',
    marginBottom: 10,
  },
  tabsContainer: {
    flexDirection: 'row',
  },
  tabButton: {
    paddingHorizontal: 15,
    paddingVertical: 12,
  },
  activeTabButton: {
    borderBottomWidth: 2,
  },
  tabText: {
    fontSize: 14,
    fontFamily: 'PlayfairDisplay-Regular',
  },
  listContainer: {
    paddingHorizontal: 0,
    paddingVertical: 10,
    paddingBottom: 20,
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
    fontFamily: 'PlayfairDisplay-Regular',
    marginTop: 15,
  },
  notificationItem: {
    flexDirection: 'row',
    padding: 15,
    borderBottomWidth: 0.5,
    borderBottomColor: '#e0e0e0',
  },
  iconContainer: {
    marginRight: 15,
    justifyContent: 'center',
  },
  notificationContent: {
    flex: 1,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  messageContainer: {
    flex: 1,
  },
  message: {
    fontSize: 14,
    fontFamily: 'PlayfairDisplay-Regular',
    lineHeight: 20,
  },
  timeAgo: {
    color: '#777',
    fontSize: 12,
    fontFamily: 'PlayfairDisplay-Regular',
    marginTop: 3,
  },
});

export default Notifications; 