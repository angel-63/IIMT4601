import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
  StatusBar,
} from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useNavigation, useRouter } from 'expo-router';
import { useAuth } from '../../../context/auth';

// You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/
function MenuItemIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return <FontAwesome size={16} style={{ alignItems: 'center' }} {...props} />;
}

const MenuItem: React.FC<{
  icon: string;
  title: string;
  onPress: () => void;
}> = ({ icon, title, onPress }) => (
  <TouchableOpacity style={styles.menuItem} onPress={onPress}>
    <View style={styles.iconContainer}>
      <MenuItemIcon name={icon as any} color="black" />
    </View>
    <Text style={styles.menuText}>{title}</Text>
  </TouchableOpacity>
);

const ProfileScreen: React.FC = () => {
  const router = useRouter();
  const { user, signOut } = useAuth();

  const handleMenuPress = (item: string) => {
    switch(item) {
      case 'Edit Profile':
        router.push('/profile/editprofile');
        break;
      case 'Settings':
        router.push('/profile/settings');
        break;
      case 'My Trips':
        router.push('/profile/mytrips');
        break;
      case 'Help & Support':
        router.push('/profile/help');
        break;
      case 'Payment':
        router.push('/profile/payment');
        break;
      case 'Log out':
        signOut();
        break;
      default:
        console.log(`${item} pressed`);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Profile Header */}
      <View style={styles.profileHeader}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar} />
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{user?.name || 'User name'}</Text>
          <Text style={styles.userEmail}>{user?.email || 'example@gmail.com'}</Text>
        </View>
      </View>

      {/* Account Section */}
      <Text style={styles.sectionTitle}>Account</Text>
      <View style={styles.section}>
        <MenuItem icon="id-card" title="Edit Profile" onPress={() => handleMenuPress('Edit Profile')} />
        <MenuItem icon="suitcase" title="My Trips" onPress={() => handleMenuPress('My Trips')} />
        <MenuItem icon="credit-card" title="Payment" onPress={() => handleMenuPress('Payment')} />
        <MenuItem icon="gear" title="Settings" onPress={() => handleMenuPress('Settings')} />
      </View>

      {/* Support Section */}
      <Text style={styles.sectionTitle}>Support</Text>
      <View style={styles.section}>
        <MenuItem icon="info" title="Help & Support" onPress={() => handleMenuPress('Help & Support')} />
      </View>

      {/* Logout Section */}
      <View style={styles.section}>
        <MenuItem icon="sign-out" title="Log out" onPress={() => handleMenuPress('Log out')} />
      </View>

      {/* Version Number */}
      <Text style={styles.version}>v2.004.100000</Text>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  profileHeader: {
    flexDirection: 'row',
    padding: 20,
    alignItems: 'center',
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: '#FF4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#E0E0E0',
  },
  userInfo: {
    marginLeft: 15,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  userEmail: {
    fontSize: 16,
    color: '#666',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    padding: 20,
    paddingBottom: 10,
  },
  section: {
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    marginHorizontal: 20,
    marginBottom: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  iconContainer: {
    width: 20, 
    marginRight: 15,
    alignItems: 'center'
  },
  menuText: {
    fontSize: 16,
  },
  version: {
    textAlign: 'center',
    color: '#999',
    marginBottom: 20,
  },
  bottomNav: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    backgroundColor: '#CC3333',
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    padding: 10,
  },
  activeNavItem: {
    backgroundColor: '#AA2222',
  },
  navIcon: {
    fontSize: 24,
  },
  navText: {
    color: '#FFF',
    marginTop: 5,
  },
});

export default ProfileScreen;