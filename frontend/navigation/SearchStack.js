import React, { useState, useEffect } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { 
  Text, 
  View, 
  StyleSheet, 
  TextInput, 
  FlatList, 
  Image, 
  TouchableOpacity,
  ActivityIndicator 
} from "react-native";
import { useSelector } from "react-redux";
import { useTheme } from "@react-navigation/native";
import { Ionicons } from '@expo/vector-icons';
import { baseUrl } from "../services/api";

// Placeholder data for search results
const searchData = [
  {
    id: 100,
    username: "benbencogivui",
    name: "Bên Bên Có Gì Vui",
    avatar: "https://ui-avatars.com/api/?name=BB",
    totalFollowing: 120,
    totalFollowers: 46200
  },
  {
    id: 101,
    username: "ktln_thread",
    name: "KTLN",
    avatar: "https://ui-avatars.com/api/?name=KT",
    totalFollowing: 85,
    totalFollowers: 10300
  },
  {
    id: 102,
    username: "_vuniem_05",
    name: "LE HOANG VU",
    avatar: "https://ui-avatars.com/api/?name=HV",
    totalFollowing: 102,
    totalFollowers: 79
  },
  {
    id: 103,
    username: "ieltsfighter",
    name: "IELTS Fighter",
    avatar: "https://ui-avatars.com/api/?name=IE",
    totalFollowing: 45,
    totalFollowers: 20000
  },
  {
    id: 104,
    username: "_daiphatthanh",
    name: "Đài Phát Thanh.",
    avatar: "https://ui-avatars.com/api/?name=DPT",
    totalFollowing: 210,
    totalFollowers: 73100
  },
  {
    id: 105,
    username: "nguyenvanphuc",
    name: "NGUYEN VAN PHUC",
    avatar: "https://ui-avatars.com/api/?name=NV",
    totalFollowing: 102,
    totalFollowers: 79
  },
  {
    id: 106,
    username: "vanphuc",
    name: "NGUYEN VAN PHUC",
    avatar: "https://ui-avatars.com/api/?name=NV",
  }
];

// Placeholder component cho search screen
const SearchScreen = () => {
  const isDarkMode = useSelector(state => state.theme.isDarkMode);
  const { colors } = useTheme();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);

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
  }, [searchTerm]);

  const fetchUsers = async (username, page) => {
    if (!username.trim()) return;
    
    setLoading(true);
    try {
      const response = await fetch(`${baseUrl}/search/username/${username}/${page}`);
      const data = await response.json();
      
      if (page === 1) {
        setSearchResults(data.users || []);
      } else {
        setSearchResults(prev => [...prev, ...(data.users || [])]);
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

  const loadMoreUsers = () => {
    if (hasNextPage && !loading) {
      fetchUsers(searchTerm, currentPage + 1);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.userContainer}>
      <Image 
        source={item.avatar ? { uri: item.avatar } : { uri: `https://ui-avatars.com/api/?name=${item.name?.split(' ').join('+')}` }} 
        style={styles.avatar} 
      />
      <View style={styles.userInfo}>
        <Text style={[styles.username, { color: colors.onSurface }]}>{item.username}</Text>
        <Text style={[styles.displayName, { color: colors.onSurfaceVarient }]}>{item.name}</Text>
        <Text style={[styles.followers, { color: colors.onSurfaceVarient }]}>{item.totalFollowers} người theo dõi</Text>
      </View>
      <TouchableOpacity 
        style={[styles.followButton, { borderColor: colors.outline }]}
      >
        <Text style={[styles.followText, { color: colors.onSurface }]}>Theo dõi</Text>
      </TouchableOpacity>
    </View>
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
    <View style={[styles.container, { backgroundColor: colors.surfaceContainer }]}>
      {/* <View style={styles.headerContainer}>
        <Text style={[styles.headerTitle, { color: colors.onSurface }]}>Tìm kiếm</Text>
      </View> */}
      
      <View style={[styles.searchContainer, { backgroundColor: colors.surfaceContainerLow }]}>
        <Ionicons name="search" size={20} color={colors.onSurfaceVarient} />
        <TextInput
          style={[styles.searchInput, { color: colors.onSurface }]}
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
              <Text style={[styles.emptyText, { color: colors.onSurfaceVarient }]}>
                Không tìm thấy người dùng nào
              </Text>
            </View>
          ) : null
        }
      />
    </View>
  );
};

const SearchStack = createNativeStackNavigator();

const SearchStackScreen = () => {
  return (
    <SearchStack.Navigator screenOptions={{ headerShown: false }}>
      <SearchStack.Screen name="SearchScreen" component={SearchScreen} />
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
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
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
    borderWidth: 1,
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