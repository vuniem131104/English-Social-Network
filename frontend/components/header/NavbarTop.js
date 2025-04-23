import React from "react";
import { useState, useContext, useEffect } from "react";
import { StyleSheet, Image, Pressable, Modal, SafeAreaView, Dimensions, StatusBar, TouchableOpacity, View, Alert, Text, FlatList } from "react-native";
import { Border, Padding } from "../../GlobalStyles";
import { useNavigation, useTheme, useRoute, CommonActions } from "@react-navigation/native";
import SettingsMenu from "./SettingsMenu";
import { AuthContext } from "../../context/authContext";
import { useSelector } from "react-redux";
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
// import ChatbotModal from "../chatbot/ChatbotModal"; // Import the ChatbotModal component

// Mock data cho thông báo
const SAMPLE_NOTIFICATIONS = [
  {
    id: '1',
    type: 'like',
    message: 'Nguyễn Văn A đã thích bài viết của bạn',
    time: '5 phút trước',
    read: false,
    data: { postId: 123 }
  },
  {
    id: '2',
    type: 'comment',
    message: 'Mai Thị B đã bình luận về bài viết của bạn',
    time: '30 phút trước',
    read: false,
    data: { postId: 123, commentId: 456 }
  },
  {
    id: '3',
    type: 'follow',
    message: 'Trần Văn C đã bắt đầu theo dõi bạn',
    time: '2 giờ trước',
    read: true,
    data: { userId: 789 }
  },
  {
    id: '4',
    type: 'system',
    message: 'Bài viết của bạn đã được duyệt',
    time: '1 ngày trước',
    read: true,
    data: { postId: 321 }
  },
];

const NavbarTop = () => {

  const navigation = useNavigation();
  const route = useRoute();
  const { userToken, userInfo } = useContext(AuthContext);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isNotificationsVisible, setIsNotificationsVisible] = useState(false);
  const [notifications, setNotifications] = useState(SAMPLE_NOTIFICATIONS);
  const [unreadCount, setUnreadCount] = useState(0);
  const isDarkMode = useSelector(state => state.theme.isDarkMode);

  const { colors } = useTheme();

  useEffect(() => {
    const count = notifications.filter(item => !item.read).length;
    setUnreadCount(0);
  }, [notifications]);

  const handleProfilePress = () => {
    if (userToken) {
      navigation.navigate('UserProfile', { userId: userInfo?.id });
    } else {
      Alert.alert(
        "Đăng nhập", 
        "Bạn cần đăng nhập để xem trang cá nhân",
        [
          { text: "Hủy", style: "cancel" },
          { text: "Đăng nhập", onPress: () => navigation.navigate("SignIn") }
        ]
      );
    }
  };

  const handleNotificationsPress = () => {
    if (userToken) {
      setIsNotificationsVisible(true);
    } else {
      Alert.alert(
        "Đăng nhập", 
        "Bạn cần đăng nhập để xem thông báo",
        [
          { text: "Hủy", style: "cancel" },
          { text: "Đăng nhập", onPress: () => navigation.navigate("SignIn") }
        ]
      );
    }
  };

  const markAllAsRead = () => {
    const updatedNotifications = notifications.map(item => ({
      ...item,
      read: true
    }));
    setNotifications(updatedNotifications);
  };

  const handleNotificationPress = (notification) => {
    const updatedNotifications = notifications.map(item => 
      item.id === notification.id ? { ...item, read: true } : item
    );
    setNotifications(updatedNotifications);

    switch (notification.type) {
      case 'like':
      case 'comment':
        navigation.navigate('PostDetail', { postId: notification.data.postId });
        setIsNotificationsVisible(false);
        break;
      case 'follow':
        navigation.navigate('UserProfile', { userId: notification.data.userId });
        setIsNotificationsVisible(false);
        break;
      case 'system':
        if (notification.data.postId) {
          navigation.navigate('PostDetail', { postId: notification.data.postId });
          setIsNotificationsVisible(false);
        }
        break;
      default:
        break;
    }
  };

  const renderNotificationItem = ({ item }) => {
    let icon;
    let iconColor = colors.primary;

    switch (item.type) {
      case 'like':
        icon = <Ionicons name="heart" size={24} color="#e74c3c" />;
        break;
      case 'comment':
        icon = <Ionicons name="chatbubble" size={24} color="#3498db" />;
        break;  
      case 'follow':
        icon = <Ionicons name="person-add" size={24} color="#2ecc71" />;
        break;
      case 'system':
        icon = <MaterialIcons name="notifications" size={24} color="#f39c12" />;
        break;
      default:
        icon = <Ionicons name="notifications" size={24} color={colors.primary} />;
    }

    return (
      <TouchableOpacity 
        style={[
          styles.notificationItem, 
          !item.read && styles.unreadItem,
          { backgroundColor: !item.read ? colors.surfaceContainerHigh : 'transparent' }
        ]}
        onPress={() => handleNotificationPress(item)}
      >
        <View style={styles.notificationIcon}>
          {icon}
        </View>
        <View style={styles.notificationContent}>
          <Text style={[styles.notificationMessage, { color: colors.onSurface }]}>
            {item.message}
          </Text>
          <Text style={[styles.notificationTime, { color: colors.onSurfaceVarient }]}>
            {item.time}
          </Text>
        </View>
        {!item.read && <View style={[styles.unreadDot, { backgroundColor: colors.primary }]} />}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.navbartop}>
  
      
      <TouchableOpacity 
        onPress={handleNotificationsPress} 
        style={[styles.iconContainer, { backgroundColor: colors.primary }]}
      >
        <Ionicons name="notifications" size={20} color="#fff" />
        {unreadCount > 0 && (
          <View style={styles.badgeContainer}>
            <Text style={styles.badgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
          </View>
        )}
      </TouchableOpacity>

      <Image
        contentFit="cover"
        source={isDarkMode 
          ? require("../../assets/logo.png") 
          : require("../../assets/black_logo.png")
        }
        style={styles.logoImage}
      />
      
      <Pressable 
        onPress={() => { setIsModalVisible(true) }} 
        style={[styles.iconContainer, { backgroundColor: colors.primary }]}
      >
        <Image
          contentFit="cover"
          source={require("../../assets/frame-45.png")}
        />
      </Pressable>
      
      {/* Settings Modal */}
      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <TouchableOpacity 
          activeOpacity={1}
          onPress={() => setIsModalVisible(false)}
          style={styles.modalOverlay}
        >
          <View style={styles.menuContainer}>
            <SettingsMenu />
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Notifications Modal */}
      <Modal
        visible={isNotificationsVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsNotificationsVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.notificationsContainer, { backgroundColor: colors.surfaceContainerLow }]}>
            <View style={styles.notificationsHeader}>
              <Text style={[styles.notificationsTitle, { color: colors.onSurface }]}>Thông báo</Text>
              <View style={styles.notificationsActions}>
                {unreadCount > 0 && (
                  <TouchableOpacity 
                    style={styles.markAllReadButton} 
                    onPress={markAllAsRead}
                  >
                    <Text style={[styles.markAllReadText, { color: colors.primary }]}>
                      Đánh dấu đã đọc
                    </Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity onPress={() => setIsNotificationsVisible(false)}>
                  <Ionicons name="close" size={24} color={colors.onSurface} />
                </TouchableOpacity>
              </View>
            </View>
            
            <View style={styles.notificationsContent}>
              {notifications.length > 0 ? (
                <FlatList
                  data={notifications}
                  renderItem={renderNotificationItem}
                  keyExtractor={item => item.id}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={styles.notificationsList}
                />
              ) : (
                <Text style={[styles.noNotificationsText, { color: colors.onSurfaceVarient }]}>
                  Bạn chưa có thông báo nào.
                </Text>
              )}
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};


const styles = StyleSheet.create({
  iconContainer: {
    flexDirection: "row",
    borderRadius: Border.br_81xl,
    padding: Padding.p_8xs,
    height: 35,
    width: 35,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  logoImage: {
    width: 120,
    height: 40,
    resizeMode: 'contain',
  },
  badgeContainer: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#e74c3c',
    height: 18,
    width: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#fff',
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  navbartop: {
    // width: "100%",
    alignSelf: "stretch",
    justifyContent: "space-between",
    flexDirection: "row",
    margin: 10,
    alignItems: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
  },
  menuContainer: {
    marginTop: 40, 
    marginRight: 10, 
  },
  notificationsContainer: {
    width: '90%',
    maxHeight: '80%',
    marginTop: 60,
    marginHorizontal: '5%',
    borderRadius: 15,
    overflow: 'hidden',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  notificationsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(150, 150, 150, 0.3)',
  },
  notificationsTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
  },
  notificationsActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  markAllReadButton: {
    marginRight: 15,
  },
  markAllReadText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  notificationsContent: {
    maxHeight: 500,
  },
  notificationsList: {
    paddingVertical: 10,
  },
  notificationItem: {
    flexDirection: 'row',
    padding: 15,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(150, 150, 150, 0.2)',
    position: 'relative',
  },
  unreadItem: {
    borderLeftWidth: 3,
  },
  notificationIcon: {
    marginRight: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationContent: {
    flex: 1,
  },
  notificationMessage: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    marginBottom: 5,
  },
  notificationTime: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
  },
  unreadDot: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    right: 15,
    top: 15,
  },
  noNotificationsText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    textAlign: 'center',
    padding: 30,
  }
});

export default NavbarTop;