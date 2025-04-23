import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  Linking,
  SafeAreaView
} from 'react-native';
import { useTheme } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { Feather, FontAwesome, MaterialIcons } from '@expo/vector-icons';
import NavbarTop from '../../components/header/NavbarTop';

const AboutScreen = () => {
  const { colors } = useTheme();
  const isDarkMode = useSelector(state => state.theme.isDarkMode);
  
  // Define dark mode specific colors
  const darkBackground = isDarkMode ? '#121212' : colors.surfaceContainer;
  const cardBackground = isDarkMode ? 'rgba(32, 32, 36, 0.95)' : colors.surfaceContainerLow;
  const borderColor = isDarkMode ? 'rgba(70, 70, 80, 0.7)' : 'rgba(150, 150, 150, 0.3)';
  const textColor = isDarkMode ? 'rgba(220, 220, 225, 0.9)' : colors.onSurface;
  const secondaryText = isDarkMode ? '#aaa' : '#777';
  
  const teamMembers = [
    {
      id: '1',
      name: 'Sarah Johnson',
      role: 'Founder & English Teacher',
      avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
      bio: 'English language expert with 10+ years teaching experience. Masters in TESOL from Oxford University.'
    },
    {
      id: '2',
      name: 'Michael Chen',
      role: 'App Developer',
      avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
      bio: 'Full-stack developer specialized in educational technology. Passionate about creating tools that make learning accessible.'
    },
    {
      id: '3',
      name: 'Emily Rodriguez',
      role: 'Content Curator',
      avatar: 'https://randomuser.me/api/portraits/women/68.jpg',
      bio: 'Linguistics graduate with experience in curriculum development. Creates engaging English learning materials.'
    }
  ];
  
  const handleLinkPress = (url) => {
    Linking.openURL(url);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: darkBackground }]}>
      <NavbarTop />
      <ScrollView style={styles.scrollView}>
        {/* App Banner */}
        <View style={[styles.bannerContainer, { backgroundColor: colors.primary }]}>
          <Image 
            source={{ uri: 'https://cdn-icons-png.flaticon.com/512/3898/3898082.png' }} 
            style={styles.appLogo} 
          />
          <Text style={styles.appName}>English Social</Text>
          <Text style={styles.appTagline}>Learn English Together</Text>
          <Text style={styles.appVersion}>Version 1.0.0</Text>
        </View>
        
        {/* Mission Statement */}
        <View style={[styles.card, { backgroundColor: cardBackground, borderColor: borderColor }]}>
          <View style={styles.cardHeader}>
            <MaterialIcons name="lightbulb" size={24} color={colors.primary} />
            <Text style={[styles.cardTitle, { color: colors.onSurface }]}>Our Mission</Text>
          </View>
          <Text style={[styles.cardText, { color: textColor }]}>
            Our mission is to make English learning engaging, social, and accessible to everyone. 
            We believe that language learning should be a collaborative experience, and our platform 
            brings together learners from around the world to share knowledge, tips, and support one another.
          </Text>
        </View>
        
        {/* App Features */}
        <View style={[styles.card, { backgroundColor: cardBackground, borderColor: borderColor }]}>
          <View style={styles.cardHeader}>
            <Feather name="star" size={24} color={colors.primary} />
            <Text style={[styles.cardTitle, { color: colors.onSurface }]}>Key Features</Text>
          </View>
          
          <View style={styles.featureItem}>
            <View style={[styles.featureIcon, { backgroundColor: colors.primary }]}>
              <Feather name="users" size={20} color="#FFF" />
            </View>
            <View style={styles.featureText}>
              <Text style={[styles.featureTitle, { color: colors.onSurface }]}>Community Learning</Text>
              <Text style={[styles.featureDesc, { color: textColor }]}>
                Connect with fellow English learners, share tips, and learn together.
              </Text>
            </View>
          </View>
          
          <View style={styles.featureItem}>
            <View style={[styles.featureIcon, { backgroundColor: colors.primary }]}>
              <Feather name="book-open" size={20} color="#FFF" />
            </View>
            <View style={styles.featureText}>
              <Text style={[styles.featureTitle, { color: colors.onSurface }]}>Grammar Resources</Text>
              <Text style={[styles.featureDesc, { color: textColor }]}>
                Access comprehensive grammar lessons and practical examples.
              </Text>
            </View>
          </View>
          
          <View style={styles.featureItem}>
            <View style={[styles.featureIcon, { backgroundColor: colors.primary }]}>
              <Feather name="award" size={20} color="#FFF" />
            </View>
            <View style={styles.featureText}>
              <Text style={[styles.featureTitle, { color: colors.onSurface }]}>Achievement System</Text>
              <Text style={[styles.featureDesc, { color: textColor }]}>
                Track your progress and earn badges for your English learning milestones.
              </Text>
            </View>
          </View>
          
          <View style={styles.featureItem}>
            <View style={[styles.featureIcon, { backgroundColor: colors.primary }]}>
              <Feather name="shopping-bag" size={20} color="#FFF" />
            </View>
            <View style={styles.featureText}>
              <Text style={[styles.featureTitle, { color: colors.onSurface }]}>Learning Materials</Text>
              <Text style={[styles.featureDesc, { color: textColor }]}>
                Shop for premium books and resources to accelerate your learning.
              </Text>
            </View>
          </View>
        </View>
        
        {/* Our Team */}
        <View style={[styles.card, { backgroundColor: cardBackground, borderColor: borderColor }]}>
          <View style={styles.cardHeader}>
            <Feather name="users" size={24} color={colors.primary} />
            <Text style={[styles.cardTitle, { color: colors.onSurface }]}>Our Team</Text>
          </View>
          
          {teamMembers.map(member => (
            <View key={member.id} style={[styles.teamMember, { borderBottomColor: borderColor }]}>
              <Image source={{ uri: member.avatar }} style={styles.memberAvatar} />
              <View style={styles.memberInfo}>
                <Text style={[styles.memberName, { color: colors.onSurface }]}>{member.name}</Text>
                <Text style={[styles.memberRole, { color: colors.primary }]}>{member.role}</Text>
                <Text style={[styles.memberBio, { color: textColor }]}>{member.bio}</Text>
              </View>
            </View>
          ))}
        </View>
        
        {/* Contact Information */}
        <View style={[styles.card, { backgroundColor: cardBackground, borderColor: borderColor }]}>
          <View style={styles.cardHeader}>
            <Feather name="mail" size={24} color={colors.primary} />
            <Text style={[styles.cardTitle, { color: colors.onSurface }]}>Contact Us</Text>
          </View>
          
          <TouchableOpacity 
            style={styles.contactItem} 
            onPress={() => handleLinkPress('mailto:support@englishsocial.com')}
          >
            <Feather name="mail" size={20} color={colors.primary} />
            <Text style={[styles.contactText, { color: textColor }]}>support@englishsocial.com</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.contactItem} 
            onPress={() => handleLinkPress('https://englishsocial.com')}
          >
            <Feather name="globe" size={20} color={colors.primary} />
            <Text style={[styles.contactText, { color: textColor }]}>www.englishsocial.com</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.contactItem} 
            onPress={() => handleLinkPress('tel:+12345678901')}
          >
            <Feather name="phone" size={20} color={colors.primary} />
            <Text style={[styles.contactText, { color: textColor }]}>+1 (234) 567-8901</Text>
          </TouchableOpacity>
        </View>
        
        {/* Social Media */}
        <View style={[styles.card, { backgroundColor: cardBackground, borderColor: borderColor }]}>
          <View style={styles.cardHeader}>
            <Feather name="share-2" size={24} color={colors.primary} />
            <Text style={[styles.cardTitle, { color: colors.onSurface }]}>Follow Us</Text>
          </View>
          
          <View style={styles.socialLinks}>
            <TouchableOpacity 
              style={[styles.socialButton, { backgroundColor: '#3b5998' }]}
              onPress={() => handleLinkPress('https://facebook.com/englishsocial')}
            >
              <FontAwesome name="facebook" size={20} color="white" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.socialButton, { backgroundColor: '#1DA1F2' }]}
              onPress={() => handleLinkPress('https://twitter.com/englishsocial')}
            >
              <FontAwesome name="twitter" size={20} color="white" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.socialButton, { backgroundColor: '#833AB4' }]}
              onPress={() => handleLinkPress('https://instagram.com/englishsocial')}
            >
              <FontAwesome name="instagram" size={20} color="white" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.socialButton, { backgroundColor: '#FF0000' }]}
              onPress={() => handleLinkPress('https://youtube.com/englishsocial')}
            >
              <FontAwesome name="youtube-play" size={20} color="white" />
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Footer */}
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: secondaryText }]}>
            © 2023 English Social. All rights reserved.
          </Text>
          <Text style={[styles.footerText, { color: secondaryText }]}>
            Made with ❤️ for English learners everywhere
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    paddingBottom: 20,
  },
  bannerContainer: {
    alignItems: 'center',
    paddingVertical: 30,
    marginBottom: 20,
  },
  appLogo: {
    width: 80,
    height: 80,
    marginBottom: 10,
  },
  appName: {
    fontSize: 24,
    fontFamily: 'PlayfairDisplay-Bold',
    color: 'white',
    marginBottom: 5,
  },
  appTagline: {
    fontSize: 16,
    fontFamily: 'PlayfairDisplay-Regular',
    color: 'white',
    marginBottom: 5,
  },
  appVersion: {
    fontSize: 12,
    fontFamily: 'PlayfairDisplay-Regular',
    color: 'rgba(255, 255, 255, 0.7)',
  },
  card: {
    marginHorizontal: 15,
    marginBottom: 20,
    borderRadius: 15,
    padding: 15,
    borderWidth: 0.5,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  cardTitle: {
    fontSize: 18,
    fontFamily: 'PlayfairDisplay-Bold',
    marginLeft: 10,
  },
  cardText: {
    fontSize: 14,
    fontFamily: 'PlayfairDisplay-Regular',
    lineHeight: 22,
  },
  featureItem: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontFamily: 'PlayfairDisplay-Bold',
    marginBottom: 5,
  },
  featureDesc: {
    fontSize: 14,
    fontFamily: 'PlayfairDisplay-Regular',
    lineHeight: 20,
  },
  teamMember: {
    flexDirection: 'row',
    padding: 10,
    borderBottomWidth: 1,
    marginBottom: 15,
  },
  memberAvatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginRight: 15,
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontFamily: 'PlayfairDisplay-Bold',
    marginBottom: 4,
  },
  memberRole: {
    fontSize: 14,
    fontFamily: 'PlayfairDisplay-Medium',
    marginBottom: 4,
  },
  memberBio: {
    fontSize: 13,
    fontFamily: 'PlayfairDisplay-Regular',
    lineHeight: 18,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  contactText: {
    fontSize: 14,
    fontFamily: 'PlayfairDisplay-Regular',
    marginLeft: 15,
  },
  socialLinks: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  socialButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer: {
    marginTop: 10,
    marginBottom: 20,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  footerText: {
    fontSize: 12,
    fontFamily: 'PlayfairDisplay-Regular',
    textAlign: 'center',
    marginBottom: 5,
  }
});

export default AboutScreen; 