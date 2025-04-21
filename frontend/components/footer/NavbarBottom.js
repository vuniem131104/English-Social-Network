import React from "react";
import { useSelector } from "react-redux";
import { StyleSheet, View, TouchableOpacity } from "react-native";
import { Padding, Border } from "../../GlobalStyles";
import { useTheme } from "@react-navigation/native";
import { Ionicons, MaterialIcons, FontAwesome, Feather, AntDesign } from '@expo/vector-icons';

const NavbarBottom = ({ state, descriptors, navigation }) => {
  const isDarkMode = useSelector(state => state.theme.isDarkMode);
  const { colors } = useTheme();
  return (
    <View style={[styles.navbarbottom, { backgroundColor: colors.surfaceContainer, shadowColor: colors.primaryShadow }]}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label =
          options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
              ? options.title
              : route.name;

        const isFocused = state.index === index;

        let iconElement;
        if (route.name === "Feed" || route.name === "Home") {
          iconElement = <Ionicons name="home" size={24} color={isFocused ? colors.primary : colors.onSurface} />;
        }
        else if (route.name === "Search") {
          iconElement = <Ionicons name="search" size={24} color={isFocused ? colors.primary : colors.onSurface} />;
        }
        else if (route.name === "CreatePost") {
          iconElement = <AntDesign name="pluscircle" size={24} color={isFocused ? colors.primary : colors.onSurface} />;
        }
        else if (route.name === "Favorites") {
          iconElement = <Ionicons name="heart" size={24} color={isFocused ? colors.primary : colors.onSurface} />;
        }
        else if (route.name === "Shopping") {
          iconElement = <FontAwesome name="shopping-cart" size={24} color={isFocused ? colors.primary : colors.onSurface} />;
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

        return (
          <TouchableOpacity key={label}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={options.tabBarTestID}
            onPress={onPress}
            onLongPress={onLongPress}
            style={[styles.navbarItem, isFocused && styles.navbarItemActive]}
          >
            {iconElement}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  navbarItem: {
    padding: 10,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 50,
    width: 50,
    height: 50,
  },
  navbarItemActive: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  navbarbottom: {
    position: "absolute",
    bottom: 5,
    width: "95%",
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "space-between",
    flexDirection: "row",
    borderRadius: Border.br_81xl,
    shadowOffset: {
      width: 1,
      height: 1,
    },
    shadowRadius: 10,
    elevation: 10,
    shadowOpacity: 0.5,
    padding: 8,
  },
});


export default NavbarBottom;
