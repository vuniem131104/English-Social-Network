import React, { useState, useEffect, useContext } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import {
  Text,
  View,
  StyleSheet,
  TextInput,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert
} from "react-native";
import { useSelector } from "react-redux";
import { useTheme, useNavigation } from "@react-navigation/native";
import { Ionicons } from '@expo/vector-icons';
import { baseUrl } from "../services/api";
import { AuthContext } from "../context/authContext";
import axios from "axios";
import CustomToast from "../components/CustomToast";
import ConfirmationModal from "../components/ConfirmationModal";
import Profile from "../screens/Profile/Profile"

// Placeholder data for search results
const searchData = [
  {
    id: 100,
    username: "benbencogivui",
    name: "Bên Bên Có Gì Vui",
    avatar: null,
    totalFollowing: 120,
    totalFollowers: 46200
  },
  {
    id: 101,
    username: "ktln_thread",
    name: "KTLN",
    avatar: null,
    totalFollowing: 85,
    totalFollowers: 10300
  },
  {
    id: 103,
    username: "ieltsfighter",
    name: "IELTS Fighter",
    avatar: null,
    totalFollowing: 45,
    totalFollowers: 20000
  },
  {
    id: 104,
    username: "_daiphatthanh",
    name: "Đài Phát Thanh.",
    avatar: null,
    totalFollowing: 210,
    totalFollowers: 73100
  },
  {
    id: 105,
    username: "nguyenvanphuc",
    name: "NGUYEN VAN PHUC",
    avatar: null,
    totalFollowing: 102,
    totalFollowers: 79
  },
  {
    id: 106,
    username: "vanphuc",
    name: "NGUYEN VAN PHUC",
    avatar: null,
    totalFollowing: 102,
    totalFollowers: 79
  },
  {
    id: 107,
    username: "levu",
    name: "Le Tuan Vu",
    avatar: null,
    totalFollowing: 102,
    totalFollowers: 79
  }
];

// Placeholder component cho search screen
const SearchScreen = () => {
  const isDarkMode = useSelector(state => state.theme.isDarkMode);
  const { colors } = useTheme();
  const navigation = useNavigation();
  const [ searchTerm, setSearchTerm ] = useState('');
  const [ searchResults, setSearchResults ] = useState([]);
  const [ loading, setLoading ] = useState(false);
  const [ currentPage, setCurrentPage ] = useState(1);
  const [ hasNextPage, setHasNextPage ] = useState(false);
  const [ initialLoad, setInitialLoad ] = useState(true);
  const { userToken, userInfo } = useContext(AuthContext);
  const [ following, setFollowing ] = useState([]);
  const [ loadingFollowers, setLoadingFollowers ] = useState(false);
  const [ toastVisible, setToastVisible ] = useState(false);
  const [ toastMessage, setToastMessage ] = useState('');
  const [ toastType, setToastType ] = useState('success');
  const [ modalVisible, setModalVisible ] = useState(false);
  const [ selectedUserId, setSelectedUserId ] = useState(null);
  const [ selectedUsername, setSelectedUsername ] = useState("");
  useEffect(() => {
    fetchFollowing();
  }, []);
  useEffect(() => {
    if (initialLoad) {
      setInitialLoad(false);
      return;
    }

    const delaySearch = setTimeout(() => {
      if (searchTerm.trim()) {
        fetchUsers(searchTerm, 1);
      } else {
        setSearchResults([]);
        setHasNextPage(false);
      }
    }, 500);

    return () => clearTimeout(delaySearch);
  }, [ searchTerm ]);
  const getAllIds = (array) => {
    if (!Array.isArray(array)) {
      console.error("Input is not an array");
      return [];
    }
    return array.map((item) => item.id);
  };

  const fetchUsers = async (username, page) => {
    if (!username.trim()) return;

    setLoading(true);
    try {
      const response = await fetch(`${baseUrl}/search/username/${username}/${page}`);
      const data = await response.json();

      if (page === 1) {
        setSearchResults(data.users || []);
      } else {
        setSearchResults(prev => [ ...prev, ...(data.users || []) ]);
      }

      setHasNextPage(data.nextPage || false);
      setCurrentPage(page);
    } catch (error) {
      console.error('Error fetching users:', error);
      setSearchResults([]);
      setHasNextPage(false);
    } finally {
      setLoading(false);
    }
  };

  const handleUserPress = (userId) => {
    navigation.navigate('Profile', { 
      userId: userId
    });
  };

  // Hàm theo dõi người dùng
  const followUser = async (userId) => {
    try {
      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
      };

      const response = await axios.post(`${baseUrl}/follows/${userId}`, {}, config);
      console.log("Follow response:", response.data);

      setToastMessage("Theo dõi thành công!");
      setToastType("success");
      setToastVisible(true);
      setFollowing(prev => [ ...prev, userId ]);
      setSearchResults((prevResults) =>
        prevResults.map((user) =>
          user.id === userId
            ? { ...user, isFollowed: true, totalFollowers: user.totalFollowers + 1 }
            : user
        )
      );
    } catch (error) {
      console.error("Error following user:", error.response?.data || error.message);
      setToastMessage("Không thể theo dõi. Vui lòng thử lại.");
      setToastType("error");
      setToastVisible(true);
    }
  };

  // Hàm bỏ theo dõi người dùng
  const unfollowUser = async (userId) => {
    try {
      if (!userToken) {
        setToastMessage("Bạn cần đăng nhập để thực hiện hành động này.");
        setToastType("error");
        setToastVisible(true);
        return;
      }

      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
      };
      const response = await axios.delete(`${baseUrl}/follows/${userId}`, config);
      setToastMessage("Bỏ theo dõi thành công!");
      setToastType("success");
      setToastVisible(true);
      setFollowing((prev) => prev.filter((id) => id !== userId));
      setSearchResults((prevResults) =>
        prevResults.map((user) =>
          user.id === userId
            ? { ...user, isFollowed: false, totalFollowers: user.totalFollowers - 1 }
            : user
        )
      );
    } catch (error) {
      console.error("Error unfollowing user:", error.response?.data || error.message);
      setToastMessage("Không thể bỏ theo dõi. Vui lòng thử lại sau.");
      setToastType("error");
      setToastVisible(true);
    }
  };

  // Hàm lấy danh sách người dùng đang theo dõi
  const fetchFollowing = async () => {
    try {
      setLoadingFollowers(true);
      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
      };

      const response = await axios.get(`${baseUrl}/follows/following/${userInfo.id}`, config);
      setFollowing(getAllIds(response.data.following) || []);
    } catch (error) {
      console.error("Error fetching followers:", error.response?.data || error.message);
      Alert.alert("Lỗi", "Không thể lấy danh sách followers. Vui lòng thử lại sau.");
    } finally {
      setLoadingFollowers(false);
    }
  };

  // Hàm xử lý theo dõi hoặc bỏ theo dõi người dùng
  const handleFollow = (userId, username) => {
    if (following.includes(userId)) {
      setSelectedUserId(userId);
      setSelectedUsername(username);
      setModalVisible(true);
    } else {
      followUser(userId);
    }
  };

  const handleConfirmUnfollow = () => {
    if (selectedUserId) {
      unfollowUser(selectedUserId);
      setModalVisible(false);
    }
  };

  const loadMoreUsers = () => {
    if (hasNextPage && !loading) {
      fetchUsers(searchTerm, currentPage + 1);
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.userContainer}
      onPress={() => handleUserPress(item.id)}
      activeOpacity={0.7}
    >
      <Image
        source={item?.avatar
            ? { uri: item.avatar }
            : { uri: `https://ui-avatars.com/api/?name=${item.name?.split(' ').join('+')}&background=a0a0a0`} }
        style={styles.avatar}
      />
      <View style={styles.userInfo}>
        <Text style={[ styles.username, { color: colors.onSurface } ]}>{item.username}</Text>
        <Text style={[ styles.displayName, { color: colors.onSurfaceVarient } ]}>{item.name}</Text>
        <Text style={[ styles.followers, { color: colors.onSurfaceVarient } ]}>{item.totalFollowers} người theo dõi</Text>
      </View>
      {userInfo.id === item.id ? null : (<TouchableOpacity
        style={[
          styles.followButton,
          {
            borderWidth: following.includes(item.id) ? 1 : 0,
          },
          {
            backgroundColor: following.includes(item.id) ? 'transparent' : colors.primary,
          }
        ]}
        onPress={(e) => {
          e.stopPropagation(); // Prevent triggering the parent TouchableOpacity
          handleFollow(item.id, item.username);
        }}
      >
        <Text
          style={[
            styles.followText,
            {
              color: following.includes(item.id) ? colors.onSurface : '#FFFFFF'
            }
          ]}
        >
          {following.includes(item.id) ? 'Đang theo dõi' : 'Theo dõi'}
        </Text>
      </TouchableOpacity>)}
    </TouchableOpacity>
  );

  const renderFooter = () => {
    if (!loading) return null;
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="small" color={colors.primary} />
      </View>
    );
  };

  return (
    <View style={[ styles.container, { backgroundColor: colors.surfaceContainer } ]}>
      {/* <View style={styles.headerContainer}>
        <Text style={[styles.headerTitle, { color: colors.onSurface }]}>Tìm kiếm</Text>
      </View> */}

      <View style={[ styles.searchContainer, { backgroundColor: colors.surfaceContainerLow } ]}>
        <Ionicons name="search" size={20} color={colors.onSurfaceVarient} />
        <TextInput
          style={[ styles.searchInput, { color: colors.onSurface } ]}
          placeholder="Tìm kiếm"
          placeholderTextColor={colors.onSurfaceVarient}
          value={searchTerm}
          onChangeText={setSearchTerm}
        />
        {searchTerm !== '' && (
          <TouchableOpacity onPress={() => setSearchTerm('')}>
            <Ionicons name="close-circle" size={20} color={colors.onSurfaceVarient} />
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={searchTerm ? searchResults : searchData}
        renderItem={renderItem}
        keyExtractor={item => item.id.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        ListFooterComponent={renderFooter}
        onEndReached={loadMoreUsers}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={
          searchTerm && !loading ? (
            <View style={styles.emptyContainer}>
              <Text style={[ styles.emptyText, { color: colors.onSurfaceVarient } ]}>
                Không tìm thấy người dùng nào
              </Text>
            </View>
          ) : null
        }
      />
      <CustomToast
        visible={toastVisible}
        message={toastMessage}
        type={toastType}
        onHide={() => setToastVisible(false)}
      />
      <ConfirmationModal
        visible={modalVisible}
        title="Bỏ theo dõi"
        message={`Bạn có chắc chắn muốn bỏ theo dõi ${selectedUsername} không?`}
        onConfirm={handleConfirmUnfollow}
        onCancel={() => setModalVisible(false)}
      />
    </View>
  );
};

const SearchStack = createNativeStackNavigator();

const SearchStackScreen = () => {
  return (
    <SearchStack.Navigator>
      <SearchStack.Screen 
        name="SearchScreen" 
        component={SearchScreen} 
        options={{ headerShown: false }}
      />
      <SearchStack.Screen 
        name="Profile" 
        component={Profile} 
        options={{ headerShown: false }}
      />
    </SearchStack.Navigator>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: 80,
  },
  headerContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  headerTitle: {
    fontSize: 32,
    fontFamily: 'Inter-Bold',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 15,
    paddingHorizontal: 15,
    height: 46,
    borderRadius: 25,
  },
  searchInput: {
    flex: 1,
    paddingLeft: 10,
    fontFamily: 'Inter-Regular',
    fontSize: 16,
  },
  listContainer: {
    paddingHorizontal: 20,
  },
  userContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#a0a0a0',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  userInfo: {
    flex: 1,
    marginLeft: 15,
  },
  username: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    marginBottom: 2,
  },
  displayName: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    marginBottom: 2,
  },
  followers: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
  },
  followButton: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  followText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
  },
  loaderContainer: {
    marginTop: 20,
    alignItems: 'center',
    paddingBottom: 20,
  },
  emptyContainer: {
    paddingTop: 50,
    alignItems: 'center',
  },
  emptyText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
  }
});

export default SearchStackScreen; 