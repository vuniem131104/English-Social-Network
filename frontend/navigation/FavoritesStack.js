import React, { useState } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { 
  Text, 
  View, 
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList
} from "react-native";
import { useSelector } from "react-redux";
import { useTheme } from "@react-navigation/native";
import { Ionicons, Feather } from '@expo/vector-icons';

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
  const isDarkMode = useSelector(state => state.theme.isDarkMode);
  const { colors } = useTheme();
  const [activeTab, setActiveTab] = useState('all');
  
  const renderActivityItem = ({ item }) => (
    <View style={[styles.activityItem, { borderBottomColor: 'rgba(150, 150, 150, 0.1)' }]}>
      <View style={styles.activityHeader}>
        <View style={styles.userContainer}>
          <Image 
            source={{ uri: item.userAvatar }} 
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
      
      <Text style={[styles.postContent, { color: colors.onSurface }]}>{item.content}</Text>
      
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
        
        {item.shares && (
          <View style={styles.statItem}>
            <TouchableOpacity style={styles.statButton}>
              <Feather name="repeat" size={22} color={colors.onSurface} />
            </TouchableOpacity>
            <Text style={[styles.statText, { color: colors.onSurface }]}>{item.shares}</Text>
          </View>
        )}
        
        {item.views && (
          <View style={styles.statItem}>
            <TouchableOpacity style={styles.statButton}>
              <Feather name="share" size={22} color={colors.onSurface} />
            </TouchableOpacity>
            <Text style={[styles.statText, { color: colors.onSurface }]}>{item.views}</Text>
          </View>
        )}
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
  
  return (
    <View style={[styles.container, { backgroundColor: colors.surfaceContainer }]}>
      <View style={styles.headerContainer}>
        <Text style={[styles.headerTitle, { color: colors.onSurface }]}>Hoạt động</Text>
      </View>
      
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsContainer}>
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
            activeTab === 'replies' && [styles.activeTabButton, { borderBottomColor: colors.primary }]
          ]}
          onPress={() => setActiveTab('replies')}
        >
          <Text 
            style={[
              styles.tabText, 
              { color: activeTab === 'replies' ? colors.onSurface : colors.onSurfaceVarient }
            ]}
          >
            Thread trả lời
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
            Lượt nhắc đến
          </Text>
        </TouchableOpacity>
      </ScrollView>
      
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
    </View>
  );
};

const FavoritesStack = createNativeStackNavigator();

const FavoritesStackScreen = () => {
  return (
    <FavoritesStack.Navigator screenOptions={{ headerShown: false }}>
      <FavoritesStack.Screen name="FavoritesScreen" component={FavoritesScreen} />
    </FavoritesStack.Navigator>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  headerTitle: {
    fontSize: 32,
    fontFamily: 'PlayfairDisplay-Bold',
  },
  tabsContainer: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(150, 150, 150, 0.2)',
  },
  tabButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  activeTabButton: {
    borderBottomWidth: 2,
  },
  tabText: {
    fontFamily: 'PlayfairDisplay-Medium',
    fontSize: 15,
  },
  sectionContainer: {
    marginTop: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'PlayfairDisplay-Bold',
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
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  userContainer: {
    flexDirection: 'row',
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  userInfo: {
    flex: 1,
  },
  username: {
    fontFamily: 'PlayfairDisplay-Bold',
    fontSize: 14,
    marginBottom: 2,
  },
  timeAgo: {
    fontFamily: 'PlayfairDisplay-Regular',
    fontSize: 12,
  },
  forYouTag: {
    fontFamily: 'PlayfairDisplay-Regular',
    fontSize: 12,
    marginTop: 2,
  },
  postContent: {
    fontFamily: 'PlayfairDisplay-Regular',
    fontSize: 15,
    lineHeight: 20,
    marginBottom: 15,
  },
  postStats: {
    flexDirection: 'row',
  },
  statItem: {
    flexDirection: 'row',
    marginRight: 20,
    alignItems: 'center',
  },
  statButton: {
    marginRight: 4,
  },
  statText: {
    fontFamily: 'PlayfairDisplay-Regular',
    fontSize: 14,
  },
  viewMoreContainer: {
    marginTop: 15,
    padding: 15,
    borderRadius: 10,
  },
  viewMoreText: {
    fontFamily: 'PlayfairDisplay-Medium',
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
    fontFamily: 'PlayfairDisplay-Medium',
    fontSize: 14,
  }
});

export default FavoritesStackScreen; 