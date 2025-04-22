import React from 'react';
import { View, StyleSheet, StatusBar } from 'react-native';
import { useSelector } from 'react-redux';
import { useTheme } from '@react-navigation/native';
import NavbarTop from '../header/NavbarTop';

const MainLayout = ({ children, hideNavbar = false }) => {
  const isDarkMode = useSelector(state => state.theme.isDarkMode);
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.surfaceContainer }]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} backgroundColor={colors.surfaceContainer} />
      
      {!hideNavbar && (
        <View style={styles.navbarTopContainer}>
          <NavbarTop />
        </View>
      )}
      
      <View style={styles.contentContainer}>
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  navbarTopContainer: {
    width: '100%',
    position: 'sticky',
    top: 0,
    zIndex: 10,
  },
  contentContainer: {
    flex: 1,
  }
});

export default MainLayout; 