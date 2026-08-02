import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, SafeAreaView, Dimensions, StatusBar, Platform, Switch } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Menu, X, Home, HeartPulse, ShoppingBag, Wrench, User, LogOut, LogIn, ChevronRight, Building, Moon, Sun } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

const HeaderMenu = () => {
  const [visible, setVisible] = useState(false);
  const navigation = useNavigation();
  const { user, logout } = useAuth();
  const { theme, isDark, toggleTheme } = useTheme();

  const menuItems = [
    { name: 'Home', icon: <Home size={22} color={theme.primary} />, screen: 'Home', tab: 'Main' },
    { name: 'Health', icon: <HeartPulse size={22} color={theme.error} />, screen: 'Health', tab: 'Main' },
    { name: 'Market', icon: <ShoppingBag size={22} color={isDark ? theme.primary : '#0056b3'} />, screen: 'Market', tab: 'Main' },
    { name: 'Services', icon: <Wrench size={22} color={isDark ? '#fbbf24' : '#f59e0b'} />, screen: 'Services', tab: 'Main' },
  ];

  const handleNavigate = (screen, tab) => {
    setVisible(false);
    navigation.navigate(tab, { screen: screen });
  };

  const handleLogout = async () => {
    setVisible(false);
    await logout();
    navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
  };

  const handleLogin = () => {
    setVisible(false);
    navigation.navigate('Login');
  };

  return (
    <View>
      <TouchableOpacity style={styles.trigger} onPress={() => setVisible(true)}>
        <Menu size={24} color={theme.text} />
      </TouchableOpacity>

      <Modal
        visible={visible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setVisible(false)}
      >
        <TouchableOpacity 
          style={[styles.overlay, { backgroundColor: isDark ? 'rgba(0,0,0,0.85)' : 'rgba(0,0,0,0.6)' }]} 
          activeOpacity={1} 
          onPress={() => setVisible(false)}
        >
          <View style={[styles.menuContainer, { backgroundColor: theme.card, shadowColor: isDark ? '#000' : '#666' }]}>
            <SafeAreaView style={{ flex: 1 }}>
              {/* Header with User Info */}
              <View style={[styles.profileHeader, { borderBottomColor: theme.divider }]}>
                <View style={[styles.avatarCircle, { backgroundColor: user ? theme.primary : (isDark ? '#333' : '#e2e8f0') }]}>
                  <User color={user ? "#fff" : theme.secondaryText} size={30} />
                </View>
                <View style={styles.profileInfo}>
                  <Text style={[styles.userName, { color: theme.text }]} numberOfLines={1}>{user?.name || 'Guest User'}</Text>
                  <Text style={[styles.userRole, { color: theme.secondaryText }]}>{user ? (user.role || 'Citizen') : 'Limited Access'}</Text>
                </View>
                <TouchableOpacity style={styles.closeBtn} onPress={() => setVisible(false)}>
                  <X size={24} color={theme.secondaryText} />
                </TouchableOpacity>
              </View>

              {!user && (
                <TouchableOpacity style={[styles.loginBanner, { backgroundColor: theme.primary }]} onPress={handleLogin}>
                    <View style={styles.loginBannerIcon}>
                        <LogIn size={20} color="#fff" />
                    </View>
                    <View>
                        <Text style={styles.loginBannerTitle}>Unlock Full Access</Text>
                        <Text style={[styles.loginBannerSub, { color: isDark ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.8)' }]}>Log in to rate, report & more</Text>
                    </View>
                </TouchableOpacity>
              )}

              <Text style={[styles.sectionTitle, { color: theme.secondaryText }]}>Main Menu</Text>

              {menuItems.map((item, index) => (
                <TouchableOpacity 
                  key={index} 
                  style={styles.menuItem} 
                  onPress={() => handleNavigate(item.screen, item.tab)}
                >
                  <View style={[styles.iconWrapper, { backgroundColor: item.icon.props.color + '20' }]}>
                    {item.icon}
                  </View>
                  <Text style={[styles.menuText, { color: theme.text }]}>{item.name}</Text>
                  <ChevronRight size={18} color={theme.placeholder} style={{ marginLeft: 'auto' }} />
                </TouchableOpacity>
              ))}

              {user?.role === 'Hospital' && (
                <TouchableOpacity 
                  style={styles.menuItem} 
                  onPress={() => { setVisible(false); navigation.navigate('ManageHospital'); }}
                >
                  <View style={[styles.iconWrapper, { backgroundColor: theme.primary + '20' }]}>
                    <Building size={22} color={theme.primary} />
                  </View>
                  <Text style={[styles.menuText, { color: theme.text }]}>Manage Hospital</Text>
                  <ChevronRight size={18} color={theme.placeholder} style={{ marginLeft: 'auto' }} />
                </TouchableOpacity>
              )}

              <Text style={[styles.sectionTitle, { color: theme.secondaryText, marginTop: 10 }]}>Appearance</Text>
              <View style={[styles.themeRow, { backgroundColor: theme.input }]}>
                <View style={[styles.iconWrapper, { backgroundColor: (isDark ? '#fbbf24' : '#6366f1') + '20' }]}>
                  {isDark ? <Moon size={22} color="#fbbf24" /> : <Sun size={22} color="#6366f1" />}
                </View>
                <Text style={[styles.menuText, { color: theme.text, flex: 1 }]}>Dark Mode</Text>
                <Switch
                  value={isDark}
                  onValueChange={toggleTheme}
                  trackColor={{ false: theme.border, true: theme.primary + '80' }}
                  thumbColor={isDark ? theme.primary : (Platform.OS === 'android' ? '#f4f3f4' : '#fff')}
                />
              </View>

              <View style={[styles.footer, { borderTopColor: theme.divider }]}>
                 <Text style={[styles.versionText, { color: theme.placeholder, marginBottom: 15 }]}>App Version 1.0.3</Text>
                {user ? (
                    <TouchableOpacity style={[styles.logoutBtn, { backgroundColor: theme.error + '15' }]} onPress={handleLogout}>
                      <LogOut size={20} color={theme.error} />
                      <Text style={[styles.logoutText, { color: theme.error }]}>Sign Out</Text>
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity style={[styles.loginBtn, { backgroundColor: theme.primary + '15' }]} onPress={handleLogin}>
                      <LogIn size={20} color={theme.primary} />
                      <Text style={[styles.loginText, { color: theme.primary }]}>Login / Register</Text>
                    </TouchableOpacity>
                )}
              </View>
            </SafeAreaView>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  trigger: { padding: 10, marginRight: 5 },
  overlay: { flex: 1, justifyContent: 'flex-start', alignItems: 'flex-end' },
  menuContainer: { 
    width: width * 0.75, 
    height: height, 
    borderTopLeftRadius: 30, 
    borderBottomLeftRadius: 30,
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 10 : 10, 
    elevation: 25,
    shadowOffset: { width: -5, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 15
  },
  profileHeader: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 20, 
    paddingBottom: 20, 
    borderBottomWidth: 1
  },
  avatarCircle: { 
    width: 60, 
    height: 60, 
    borderRadius: 30, 
    justifyContent: 'center', 
    alignItems: 'center'
  },
  profileInfo: { marginLeft: 15, flex: 1 },
  userName: { fontSize: 18, fontWeight: 'bold' },
  userRole: { fontSize: 13, marginTop: 2 },
  closeBtn: { padding: 5 },
  
  loginBanner: { 
      borderRadius: 16, 
      padding: 15, 
      flexDirection: 'row', 
      alignItems: 'center', 
      marginBottom: 25,
      elevation: 4
  },
  loginBannerIcon: { backgroundColor: 'rgba(255,255,255,0.2)', padding: 8, borderRadius: 12, marginRight: 15 },
  loginBannerTitle: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  loginBannerSub: { fontSize: 11, marginTop: 2 },

  sectionTitle: { fontSize: 11, fontWeight: 'bold', textTransform: 'uppercase', marginBottom: 15, letterSpacing: 1 },
  menuItem: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingVertical: 12, 
    marginBottom: 8 
  },
  iconWrapper: { 
    width: 44, 
    height: 44, 
    borderRadius: 14, 
    justifyContent: 'center', 
    alignItems: 'center',
    marginRight: 15 
  },
  menuText: { fontSize: 16, fontWeight: '600' },
  themeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginBottom: 8
  },
  footer: { marginTop: 'auto', paddingBottom: 40, borderTopWidth: 1, paddingTop: 20 },
  logoutBtn: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingVertical: 14, 
    borderRadius: 16, 
    justifyContent: 'center'
  },
  loginBtn: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingVertical: 14, 
    borderRadius: 16, 
    justifyContent: 'center'
  },
  logoutText: { fontWeight: 'bold', marginLeft: 10, fontSize: 15 },
  loginText: { fontWeight: 'bold', marginLeft: 10, fontSize: 15 },
  versionText: { textAlign: 'center', fontSize: 11 }
});

export default HeaderMenu;
