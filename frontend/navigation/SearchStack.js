import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { 
  Text, 
  View, 
  StyleSheet, 
  TextInput, 
  FlatList, 
  Image, 
  TouchableOpacity 
} from "react-native";
import { useSelector } from "react-redux";
import { useTheme } from "@react-navigation/native";
import { Ionicons } from '@expo/vector-icons';

// Placeholder data for search results
const searchData = [
  {
    id: '1',
    username: 'benbencogivui',
    displayName: 'Bên Bên Có Gì Vui',
    followers: '46,2K người theo dõi',
    avatar: 'https://ui-avatars.com/api/?name=BB'
  },
  {
    id: '2',
    username: 'ktln_thread',
    displayName: 'KTLN',
    followers: '10,3K người theo dõi',
    avatar: 'https://ui-avatars.com/api/?name=KT'
  },
  {
    id: '3',
    username: '_blongg_05',
    displayName: 'TRUONG BAO LONG',
    followers: '79 người theo dõi',
    avatar: 'https://ui-avatars.com/api/?name=BL'
  },
  {
    id: '4',
    username: 'ieltsfighter',
    displayName: 'IELTS Fighter',
    followers: '20K người theo dõi',
    avatar: 'https://ui-avatars.com/api/?name=IF'
  },
  {
    id: '5',
    username: '_daiphatthanh',
    displayName: 'Đài Phát Thanh.',
    followers: '73,1K người theo dõi',
    avatar: 'https://ui-avatars.com/api/?name=DPT'
  },
  {
    id: '6',
    username: 'hoinguoingangnganguocvietnam',
    displayName: 'Hội Người Ngang Ngược Việt Nam',
    followers: '29,9K người theo dõi',
    avatar: 'https://ui-avatars.com/api/?name=HN'
  },
  {
    id: '7',
    username: 'soholacapmanhinh',
    displayName: 'Sợ Hở Là Cập Màn Hình',
    followers: '26,2K người theo dõi',
    avatar: 'https://ui-avatars.com/api/?name=SH'
  }
];

// Placeholder component cho search screen
const SearchScreen = () => {
  const isDarkMode = useSelector(state => state.theme.isDarkMode);
  const { colors } = useTheme();
  
  const renderItem = ({ item }) => (
    <View style={styles.userContainer}>
      <Image 
        source={{ uri: item.avatar }} 
        style={styles.avatar} 
      />
      <View style={styles.userInfo}>
        <Text style={[styles.username, { color: colors.onSurface }]}>{item.username}</Text>
        <Text style={[styles.displayName, { color: colors.onSurfaceVarient }]}>{item.displayName}</Text>
        <Text style={[styles.followers, { color: colors.onSurfaceVarient }]}>{item.followers}</Text>
      </View>
      <TouchableOpacity 
        style={[styles.followButton, { borderColor: colors.outline }]}
      >
        <Text style={[styles.followText, { color: colors.onSurface }]}>Theo dõi</Text>
      </TouchableOpacity>
    </View>
  );
  
  return (
    <View style={[styles.container, { backgroundColor: colors.surfaceContainer }]}>
      <View style={styles.headerContainer}>
        <Text style={[styles.headerTitle, { color: colors.onSurface }]}>Tìm kiếm</Text>
      </View>
      
      <View style={[styles.searchContainer, { backgroundColor: colors.surfaceContainerLow }]}>
        <Ionicons name="search" size={20} color={colors.onSurfaceVarient} />
        <TextInput
          style={[styles.searchInput, { color: colors.onSurface }]}
          placeholder="Tìm kiếm"
          placeholderTextColor={colors.onSurfaceVarient}
        />
      </View>
      
      <FlatList
        data={searchData}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
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
  },
  headerContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  headerTitle: {
    fontSize: 32,
    fontFamily: 'PlayfairDisplay-Bold',
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
    fontFamily: 'PlayfairDisplay-Regular',
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
    fontFamily: 'PlayfairDisplay-Bold',
    fontSize: 16,
    marginBottom: 2,
  },
  displayName: {
    fontFamily: 'PlayfairDisplay-Regular',
    fontSize: 14,
    marginBottom: 2,
  },
  followers: {
    fontFamily: 'PlayfairDisplay-Regular',
    fontSize: 12,
  },
  followButton: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    borderWidth: 1,
  },
  followText: {
    fontFamily: 'PlayfairDisplay-Medium',
    fontSize: 14,
  }
});

export default SearchStackScreen; 