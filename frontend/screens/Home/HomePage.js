import React, { useState, useEffect, useContext } from "react";
import { 
  Text, 
  StyleSheet, 
  View, 
  Image, 
  TouchableOpacity, 
  FlatList, 
  ActivityIndicator,
  StatusBar 
} from "react-native";
import { useSelector } from "react-redux";
import { useNavigation, useTheme } from "@react-navigation/native";
import axios from "axios";
import { baseUrl } from "../../services/api";
import { AuthContext } from "../../context/authContext";
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';

const HomePage = () => {
  const navigation = useNavigation();
  const { userInfo, userToken } = useContext(AuthContext);
  const [posts, setPosts] = useState([]);
  const [isLoading, setLoading] = useState(false);
  const isDarkMode = useSelector(state => state.theme.isDarkMode);
  const { colors } = useTheme();

  // Chỉ gọi API một lần khi component mount
  useEffect(() => {
    const fetchSinglePost = async () => {
      setLoading(true);
      try {
        const config = userToken ? {
          headers: { Authorization: `Bearer ${userToken}` }
        } : {};
        
        // Luôn lấy post số 1
        const response = await axios.get(`${baseUrl}/newsfeed/1`, config);
        
        const data = Array.isArray(response.data) ? response.data : [];
        setPosts(data);
      } catch (error) {
        console.error("Error fetching post:", error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSinglePost();
    // Mảng dependency rỗng đảm bảo useEffect chỉ chạy một lần khi mount
  }, [userToken]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffDay > 0) {
      return `${diffDay} ngày`;
    } else if (diffHour > 0) {
      return `${diffHour} giờ`;
    } else if (diffMin > 0) {
      return `${diffMin} phút`;
    } else {
      return 'Vừa xong';
    }
  };

  const renderItem = ({ item }) => {
    return (
      <View style={[styles.postContainer, { borderBottomColor: colors.outline }]}>
        <View style={styles.postHeader}>
          <View style={styles.userInfo}>
            <Image 
              source={item.author.avatar ? { uri: item.author.avatar } : { uri: 'https://ui-avatars.com/api/?name=' + encodeURIComponent(item.author.name) }} 
              style={styles.avatar} 
            />
            <View>
              <Text style={[styles.username, { color: colors.onSurface }]}>{item.author.name}</Text>
              <Text style={styles.timeAgo}>{formatDate(item.createdAt)}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.moreButton}>
            <Feather name="more-horizontal" size={24} color={colors.onSurface} />
          </TouchableOpacity>
        </View>
        
        <Text style={[styles.postTitle, { color: colors.onSurface }]}>{item.title}</Text>
        <Text style={[styles.postDescription, { color: colors.onSurfaceVarient }]}>{item.description}</Text>
        
        {(item.mainImage || true) && (
          <Image 
            source={item.mainImage ? { uri: item.mainImage } : { uri: 'https://placehold.co/600x400?text=No+Image' }} 
            style={styles.postImage} 
            resizeMode="cover"
          />
        )}
        
        <View style={styles.postStats}>
          <TouchableOpacity style={styles.statItem}>
            <Ionicons name="heart-outline" size={22} color={colors.onSurface} />
            <Text style={[styles.statText, { color: colors.onSurface }]}>{item.totalLike || 0}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.statItem}>
            <Ionicons name="chatbubble-outline" size={22} color={colors.onSurface} />
            <Text style={[styles.statText, { color: colors.onSurface }]}>{item.totalComment || 0}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.statItem}>
            <Feather name="repeat" size={22} color={colors.onSurface} />
            <Text style={[styles.statText, { color: colors.onSurface }]}>0</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.statItem}>
            <Feather name="share" size={22} color={colors.onSurface} />
            <Text style={[styles.statText, { color: colors.onSurface }]}>0</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.surfaceContainer }]}>
      <View style={[styles.header, { borderBottomColor: colors.outline, backgroundColor: colors.surfaceContainer }]}>
        <View style={styles.tabContainer}>
          <TouchableOpacity style={[styles.tabButton, styles.activeTab]}>
            <Text style={[styles.activeTabText, { color: colors.primary }]}>Dành cho bạn</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.tabButton}>
            <Text style={[styles.tabText, { color: colors.onSurfaceVarient }]}>Đang theo dõi</Text>
          </TouchableOpacity>
        </View>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={posts}
          renderItem={renderItem}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, { color: colors.onSurfaceVarient }]}>Không có bài viết nào</Text>
            </View>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 0,
    paddingHorizontal: 0,
    borderBottomWidth: 0.5,
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 0,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 15,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#BE0303',
  },
  tabText: {
    fontSize: 16,
    fontFamily: 'PlayfairDisplay-Regular',
  },
  activeTabText: {
    fontSize: 16,
    fontFamily: 'PlayfairDisplay-Bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingBottom: 120,
  },
  postContainer: {
    paddingHorizontal: 15,
    paddingVertical: 15,
    borderBottomWidth: 0.5,
    marginBottom: 3,
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
    fontSize: 15,
    fontFamily: 'PlayfairDisplay-Bold',
  },
  timeAgo: {
    color: '#777',
    fontSize: 13,
    fontFamily: 'PlayfairDisplay-Regular',
  },
  moreButton: {
    padding: 5,
  },
  postTitle: {
    fontSize: 16,
    fontFamily: 'PlayfairDisplay-Bold',
    marginBottom: 5,
  },
  postDescription: {
    fontSize: 14,
    marginBottom: 10,
    fontFamily: 'PlayfairDisplay-Regular',
  },
  postImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 10,
  },
  postStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 10,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    marginLeft: 4,
    fontSize: 14,
    fontFamily: 'PlayfairDisplay-Regular',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    height: 300,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: 'PlayfairDisplay-Regular',
    textAlign: 'center',
  }
});

export default HomePage; 