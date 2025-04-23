import React from "react";
import { useSelector } from "react-redux";
import { StyleSheet, View, TouchableOpacity, Text, Animated } from "react-native";
import { Padding, Border } from "../../GlobalStyles";
import { useTheme } from "@react-navigation/native";
import { Ionicons, MaterialIcons, FontAwesome, Feather, AntDesign } from '@expo/vector-icons';

const NavbarBottom = ({ state, descriptors, navigation }) => {
  const isDarkMode = useSelector(state => state.theme.isDarkMode);
  const { colors } = useTheme();
  
  return (
    <View style={[
      styles.navbarbottom, 
      { 
        backgroundColor: isDarkMode 
          ? 'rgba(30, 30, 30, 0.95)' 
          : 'rgba(245, 242, 236, 0.95)',
        borderColor: isDarkMode ? '#333333' : '#e0e0e0',
        shadowColor: isDarkMode ? 'rgba(0, 0, 0, 0.5)' : colors.primaryShadow
      }
    ]}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label =
          options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
              ? options.title
              : route.name;

        const isFocused = state.index === index;

        const activeIconColor = colors.primary;
        const inactiveIconColor = isDarkMode ? 'rgba(245, 242, 236, 0.7)' : 'rgba(35, 25, 25, 0.7)';

        let iconName;
        let IconComponent = Ionicons;
        if (route.name === "Feed" || route.name === "Home") {
          iconName = "home";
        }
        else if (route.name === "Search") {
          iconName = "search";
        }
        else if (route.name === "CreatePost") {
          IconComponent = AntDesign;
          iconName = "pluscircle";
        }
        else if (route.name === "Favorites") {
          iconName = "heart";
        }
        else if (route.name === "Shopping") {
          IconComponent = FontAwesome;
          iconName = "shopping-cart";
        }

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: 'tabLongPress',
            target: route.key,
          });
        };

        if (route.name === "CreatePost") {
          return (
            <TouchableOpacity
              key={label}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={options.tabBarTestID}
              onPress={onPress}
              onLongPress={onLongPress}
              style={[styles.createPostButton, { backgroundColor: activeIconColor }]}
            >
              <IconComponent name={iconName} size={28} color="#FFFFFF" />
            </TouchableOpacity>
          );
        }

        return (
          <TouchableOpacity
            key={label}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={options.tabBarTestID}
            onPress={onPress}
            onLongPress={onLongPress}
            style={[
              styles.navbarItem, 
              isFocused && [
                styles.navbarItemActive, 
                { 
                  backgroundColor: isDarkMode 
                    ? 'rgba(208, 0, 0, 0.15)' 
                    : 'rgba(160, 0, 0, 0.1)' 
                }
              ]
            ]}
          >
            <View style={styles.tabButtonContent}>
              <IconComponent 
                name={iconName} 
                size={24} 
                color={isFocused ? activeIconColor : inactiveIconColor} 
              />
              {isFocused && (
                <Text 
                  style={[
                    styles.tabLabel, 
                    { color: activeIconColor }
                  ]}
                >
                  {label}
                </Text>
              )}
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  navbarItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    marginHorizontal: 4,
    height: 50,
  },
  navbarItemActive: {
    paddingVertical: 8,
  },
  tabButtonContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabel: {
    fontSize: 10,
    marginTop: 2,
    fontFamily: 'Inter-Regular',
  },
  navbarbottom: {
    position: "absolute",
    bottom: 10,
    width: "92%",
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "space-between",
    flexDirection: "row",
    borderRadius: 16,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowRadius: 8,
    elevation: 8,
    shadowOpacity: 0.25,
    padding: 8,
    borderWidth: 0.5,
  },
  createPostButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});

export default NavbarBottom;
