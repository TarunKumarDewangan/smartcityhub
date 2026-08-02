import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuth } from '../context/AuthContext';
import { ActivityIndicator, View } from 'react-native';
import { Home, HeartPulse, ShoppingBag, Wrench } from 'lucide-react-native';

// Import Screens
import HomeScreen from '../screens/HomeScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import HospitalScreen from '../screens/HospitalScreen';
import ShopScreen from '../screens/ShopScreen';
import ServiceScreen from '../screens/ServiceScreen';
import AssistantScreen from '../screens/AssistantScreen';
import AmbulanceScreen from '../screens/AmbulanceScreen';
import ReportIssueScreen from '../screens/ReportIssueScreen';
import SearchScreen from '../screens/SearchScreen';
import ManageShopsScreen from '../screens/ManageShopsScreen';
import AddShopScreen from '../screens/AddShopScreen';
import AddProductScreen from '../screens/AddProductScreen';
import EditShopScreen from '../screens/EditShopScreen';
import EditProductScreen from '../screens/EditProductScreen';
import ManageAmbulanceScreen from '../screens/ManageAmbulanceScreen';
import AddEditAmbulanceScreen from '../screens/AddEditAmbulanceScreen';
import ShopDetailScreen from '../screens/ShopDetailScreen';
import HeaderMenu from '../components/HeaderMenu';
import EmergencyHub from '../screens/EmergencyServicesScreen';
import ProductDetailScreen from '../screens/ProductDetailScreen';
import ManageServicesScreen from '../screens/ManageServicesScreen';
import AddEditServiceScreen from '../screens/AddEditServiceScreen';
import AdminHomeScreen from '../screens/AdminHomeScreen';
import UserApprovalScreen from '../screens/UserApprovalScreen';
import ResourceApprovalScreen from '../screens/ResourceApprovalScreen';
import ManageBloodBankScreen from '../screens/ManageBloodBankScreen';
import AddBloodBankScreen from '../screens/AddBloodBankScreen';
import ManageHospitalScreen from '../screens/ManageHospitalScreen';
import ManageDoctorsScreen from '../screens/ManageDoctorsScreen';
import AddEditDoctorScreen from '../screens/AddEditDoctorScreen';
import AdminHospitalListScreen from '../screens/AdminHospitalListScreen';
import EditHospitalScreen from '../screens/EditHospitalScreen';
import EditHospitalProfileScreen from '../screens/EditHospitalProfileScreen';
import AddHospitalScreen from '../screens/AddHospitalScreen';
import AdminManageHelplinesScreen from '../screens/AdminManageHelplinesScreen';
import AdminBloodBankListScreen from '../screens/AdminBloodBankListScreen';
import AdminCityIssuesScreen from '../screens/AdminCityIssuesScreen';
import HospitalDetailScreen from '../screens/HospitalDetailScreen';
import ServiceDetailScreen from '../screens/ServiceDetailScreen';
import ManageAllUsersScreen from '../screens/ManageAllUsersScreen';
import AddEditUserScreen from '../screens/AddEditUserScreen';
import AddEditBloodBankScreen from '../screens/AddEditBloodBankScreen';
import ManageAllShopsScreen from '../screens/ManageAllShopsScreen';
import ManageAllServicesScreen from '../screens/ManageAllServicesScreen';

import { useTheme } from '../context/ThemeContext';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const HomeStack = createStackNavigator();
const HealthStack = createStackNavigator();
const MarketStack = createStackNavigator();
const ServicesStack = createStackNavigator();

const renderSharedScreens = (StackInstance) => [
  <StackInstance.Screen key="Login" name="Login" component={LoginScreen} options={{ headerShown: true, title: 'Login' }} />,
  <StackInstance.Screen key="Register" name="Register" component={RegisterScreen} options={{ headerShown: true, title: 'Join Smart City' }} />,
  <StackInstance.Screen key="Ambulance" name="Ambulance" component={AmbulanceScreen} options={{ headerShown: true, title: 'Ambulances' }} />,
  <StackInstance.Screen key="ReportIssue" name="ReportIssue" component={ReportIssueScreen} options={{ headerShown: true, title: 'Report Issue' }} />,
  <StackInstance.Screen key="Search" name="Search" component={SearchScreen} options={{ headerShown: true, title: 'Global Search' }} />,
  <StackInstance.Screen key="ManageShops" name="ManageShops" component={ManageShopsScreen} options={{ headerShown: true, title: 'Manage Shops' }} />,
  <StackInstance.Screen key="AddShop" name="AddShop" component={AddShopScreen} options={{ headerShown: true, title: 'Add New Shop' }} />,
  <StackInstance.Screen key="AddProduct" name="AddProduct" component={AddProductScreen} options={{ headerShown: true, title: 'Manage Products' }} />,
  <StackInstance.Screen key="EditShop" name="EditShop" component={EditShopScreen} options={{ headerShown: true, title: 'Edit Shop' }} />,
  <StackInstance.Screen key="EditProduct" name="EditProduct" component={EditProductScreen} options={{ headerShown: true, title: 'Edit Product' }} />,
  <StackInstance.Screen key="ManageAmbulances" name="ManageAmbulances" component={ManageAmbulanceScreen} options={{ headerShown: true, title: 'Manage Ambulances' }} />,
  <StackInstance.Screen key="AddEditAmbulance" name="AddEditAmbulance" component={AddEditAmbulanceScreen} options={{ headerShown: true, title: 'Ambulance Details' }} />,
  <StackInstance.Screen key="ShopDetail" name="ShopDetail" component={ShopDetailScreen} options={{ headerShown: false }} />,
  <StackInstance.Screen key="EmergencyServices" name="EmergencyServices" component={EmergencyHub} options={{ headerShown: true, title: 'Emergency Services' }} />,
  <StackInstance.Screen key="ProductDetail" name="ProductDetail" component={ProductDetailScreen} options={{ headerShown: false }} />,
  <StackInstance.Screen key="ManageServices" name="ManageServices" component={ManageServicesScreen} options={{ headerShown: true, title: 'Service Management' }} />,
  <StackInstance.Screen key="AddEditService" name="AddEditService" component={AddEditServiceScreen} options={{ headerShown: true, title: 'Service Details' }} />,
  <StackInstance.Screen key="AdminHome" name="AdminHome" component={AdminHomeScreen} options={{ headerShown: true, title: 'Admin Panel' }} />,
  <StackInstance.Screen key="UserApproval" name="UserApproval" component={UserApprovalScreen} options={{ headerShown: true, title: 'User Approvals' }} />,
  <StackInstance.Screen key="ResourceApproval" name="ResourceApproval" component={ResourceApprovalScreen} options={{ headerShown: true, title: 'Approvals' }} />,
  <StackInstance.Screen key="ManageBloodBank" name="ManageBloodBank" component={ManageBloodBankScreen} options={{ headerShown: true, title: 'Manage Blood Bank' }} />,
  <StackInstance.Screen key="AddBloodBank" name="AddBloodBank" component={AddBloodBankScreen} options={{ headerShown: true, title: 'Add Blood Bank' }} />,
  <StackInstance.Screen key="ManageHospital" name="ManageHospital" component={ManageHospitalScreen} options={{ headerShown: true, title: 'Manage Hospital' }} />,
  <StackInstance.Screen key="ManageDoctors" name="ManageDoctors" component={ManageDoctorsScreen} options={{ headerShown: true, title: 'Manage Doctors' }} />,
  <StackInstance.Screen key="AddEditDoctor" name="AddEditDoctor" component={AddEditDoctorScreen} options={{ headerShown: true, title: 'Doctor Details' }} />,
  <StackInstance.Screen key="AdminHospitalList" name="AdminHospitalList" component={AdminHospitalListScreen} options={{ headerShown: true, title: 'Manage Hospitals' }} />,
  <StackInstance.Screen key="EditHospital" name="EditHospital" component={EditHospitalScreen} options={{ headerShown: true, title: 'Edit Hospital' }} />,
  <StackInstance.Screen key="EditHospitalProfile" name="EditHospitalProfile" component={EditHospitalProfileScreen} options={{ headerShown: true, title: 'Edit Hospital Profile' }} />,
  <StackInstance.Screen key="AddHospital" name="AddHospital" component={AddHospitalScreen} options={{ headerShown: true, title: 'Add Hospital Specialist' }} />,
  <StackInstance.Screen key="AdminManageHelplines" name="AdminManageHelplines" component={AdminManageHelplinesScreen} options={{ headerShown: true, title: 'Manage Helplines' }} />,
  <StackInstance.Screen key="AdminBloodBankList" name="AdminBloodBankList" component={AdminBloodBankListScreen} options={{ headerShown: true, title: 'Blood Banks' }} />,
  <StackInstance.Screen key="AdminCityIssues" name="AdminCityIssues" component={AdminCityIssuesScreen} options={{ headerShown: true, title: 'City Issues' }} />,
  <StackInstance.Screen key="HospitalDetail" name="HospitalDetail" component={HospitalDetailScreen} options={{ headerShown: false }} />,
  <StackInstance.Screen key="ServiceDetail" name="ServiceDetail" component={ServiceDetailScreen} options={{ headerShown: false }} />,
  <StackInstance.Screen key="ManageAllUsers" name="ManageAllUsers" component={ManageAllUsersScreen} options={{ headerShown: true, title: 'Manage Users' }} />,
  <StackInstance.Screen key="AddEditUser" name="AddEditUser" component={AddEditUserScreen} options={{ headerShown: true, title: 'User Details' }} />,
  <StackInstance.Screen key="AddEditBloodBank" name="AddEditBloodBank" component={AddEditBloodBankScreen} options={{ headerShown: true, title: 'Edit Blood Bank' }} />,
  <StackInstance.Screen key="ManageAllShops" name="ManageAllShops" component={ManageAllShopsScreen} options={{ headerShown: true, title: 'Manage Shops' }} />,
  <StackInstance.Screen key="ManageAllServices" name="ManageAllServices" component={ManageAllServicesScreen} options={{ headerShown: true, title: 'Manage Services' }} />,
];

const HomeStackScreen = () => {
  const { theme } = useTheme();
  return (
    <HomeStack.Navigator
      screenOptions={{
        headerShown: false,
        headerRight: () => <HeaderMenu />,
        headerStyle: { backgroundColor: theme.card },
        headerTintColor: theme.text,
      }}
    >
      <HomeStack.Screen name="HomeScreen" component={HomeScreen} />
      {renderSharedScreens(HomeStack)}
    </HomeStack.Navigator>
  );
};

const HealthStackScreen = () => {
  const { theme } = useTheme();
  return (
    <HealthStack.Navigator
      screenOptions={{
        headerShown: false,
        headerRight: () => <HeaderMenu />,
        headerStyle: { backgroundColor: theme.card },
        headerTintColor: theme.text,
      }}
    >
      <HealthStack.Screen 
        name="HospitalList" 
        component={HospitalScreen} 
        options={{ headerShown: true, title: 'Health' }} 
      />
      {renderSharedScreens(HealthStack)}
    </HealthStack.Navigator>
  );
};

const MarketStackScreen = () => {
  const { theme } = useTheme();
  return (
    <MarketStack.Navigator
      screenOptions={{
        headerShown: false,
        headerRight: () => <HeaderMenu />,
        headerStyle: { backgroundColor: theme.card },
        headerTintColor: theme.text,
      }}
    >
      <MarketStack.Screen 
        name="ShopList" 
        component={ShopScreen} 
        options={{ headerShown: true, title: 'Market' }} 
      />
      {renderSharedScreens(MarketStack)}
    </MarketStack.Navigator>
  );
};

const ServicesStackScreen = () => {
  const { theme } = useTheme();
  return (
    <ServicesStack.Navigator
      screenOptions={{
        headerShown: false,
        headerRight: () => <HeaderMenu />,
        headerStyle: { backgroundColor: theme.card },
        headerTintColor: theme.text,
      }}
    >
      <ServicesStack.Screen 
        name="ServiceList" 
        component={ServiceScreen} 
        options={{ headerShown: true, title: 'Services' }} 
      />
      {renderSharedScreens(ServicesStack)}
    </ServicesStack.Navigator>
  );
};

const MainTabNavigator = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,
      unmountOnBlur: true,
      tabBarIcon: ({ color, size }) => {
        if (route.name === 'Home') return <Home color={color} size={size} />;
        if (route.name === 'Health') return <HeartPulse color={color} size={size} />;
        if (route.name === 'Market') return <ShoppingBag color={color} size={size} />;
        if (route.name === 'Services') return <Wrench color={color} size={size} />;
        return null;
      },
    })}
  >
    <Tab.Screen name="Home" component={HomeStackScreen} />
    <Tab.Screen 
      name="Health" 
      component={HealthStackScreen} 
      listeners={({ navigation }) => ({
        tabPress: (e) => {
          navigation.navigate('Health', { screen: 'HospitalList' });
        },
      })}
    />
    <Tab.Screen 
      name="Market" 
      component={MarketStackScreen} 
      listeners={({ navigation }) => ({
        tabPress: (e) => {
          navigation.navigate('Market', { screen: 'ShopList' });
        },
      })}
    />
    <Tab.Screen 
      name="Services" 
      component={ServicesStackScreen} 
      listeners={({ navigation }) => ({
        tabPress: (e) => {
          navigation.navigate('Services', { screen: 'ServiceList' });
        },
      })}
    />
  </Tab.Navigator>
);

const AppNavigator = () => {
  const { loading } = useAuth();
  const { theme, isDark } = useTheme();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.background }}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer theme={{
      dark: isDark,
      colors: {
        primary: theme.primary,
        background: theme.background,
        card: theme.card,
        text: theme.text,
        border: theme.border,
        notification: theme.error,
      },
      fonts: {
        regular: { fontFamily: 'System', fontWeight: '400' },
        medium: { fontFamily: 'System', fontWeight: '500' },
        bold: { fontFamily: 'System', fontWeight: '700' },
        heavy: { fontFamily: 'System', fontWeight: '900' },
      }
    }}>
      <Stack.Navigator 
        initialRouteName="Main"
        screenOptions={{ 
          headerShown: false,
          headerRight: () => <HeaderMenu />,
          headerStyle: { backgroundColor: theme.card },
          headerTintColor: theme.text,
        }}
      >
        <Stack.Screen name="Main" component={MainTabNavigator} />
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: true, title: 'Login' }} />
        <Stack.Screen name="Register" component={RegisterScreen} options={{ headerShown: true, title: 'Join Smart City' }} />
        <Stack.Screen name="Ambulance" component={AmbulanceScreen} options={{ headerShown: true, title: 'Ambulances' }} />
        <Stack.Screen name="ReportIssue" component={ReportIssueScreen} options={{ headerShown: true, title: 'Report Issue' }} />
        <Stack.Screen name="Search" component={SearchScreen} options={{ headerShown: true, title: 'Global Search' }} />
        <Stack.Screen name="ManageShops" component={ManageShopsScreen} options={{ headerShown: true, title: 'Manage Shops' }} />
        <Stack.Screen name="AddShop" component={AddShopScreen} options={{ headerShown: true, title: 'Add New Shop' }} />
        <Stack.Screen name="AddProduct" component={AddProductScreen} options={{ headerShown: true, title: 'Manage Products' }} />
        <Stack.Screen name="EditShop" component={EditShopScreen} options={{ headerShown: true, title: 'Edit Shop' }} />
        <Stack.Screen name="EditProduct" component={EditProductScreen} options={{ headerShown: true, title: 'Edit Product' }} />
        <Stack.Screen name="ManageAmbulances" component={ManageAmbulanceScreen} options={{ headerShown: true, title: 'Manage Ambulances' }} />
        <Stack.Screen name="AddEditAmbulance" component={AddEditAmbulanceScreen} options={{ headerShown: true, title: 'Ambulance Details' }} />
        <Stack.Screen name="ShopDetail" component={ShopDetailScreen} options={{ headerShown: false }} />
        <Stack.Screen name="EmergencyServices" component={EmergencyHub} options={{ headerShown: true, title: 'Emergency Services' }} />
        <Stack.Screen name="ProductDetail" component={ProductDetailScreen} options={{ headerShown: false }} />
        <Stack.Screen name="ManageServices" component={ManageServicesScreen} options={{ headerShown: true, title: 'Service Management' }} />
        <Stack.Screen name="AddEditService" component={AddEditServiceScreen} options={{ headerShown: true, title: 'Service Details' }} />
        <Stack.Screen name="AdminHome" component={AdminHomeScreen} options={{ headerShown: true, title: 'Admin Panel' }} />
        <Stack.Screen name="UserApproval" component={UserApprovalScreen} options={{ headerShown: true, title: 'User Approvals' }} />
        <Stack.Screen name="ResourceApproval" component={ResourceApprovalScreen} options={{ headerShown: true, title: 'Approvals' }} />
        <Stack.Screen name="ManageBloodBank" component={ManageBloodBankScreen} options={{ headerShown: true, title: 'Manage Blood Bank' }} />
        <Stack.Screen name="AddBloodBank" component={AddBloodBankScreen} options={{ headerShown: true, title: 'Add Blood Bank' }} />
        <Stack.Screen name="ManageHospital" component={ManageHospitalScreen} options={{ headerShown: true, title: 'Manage Hospital' }} />
        <Stack.Screen name="ManageDoctors" component={ManageDoctorsScreen} options={{ headerShown: true, title: 'Manage Doctors' }} />
        <Stack.Screen name="AddEditDoctor" component={AddEditDoctorScreen} options={{ headerShown: true, title: 'Doctor Details' }} />
        <Stack.Screen name="AdminHospitalList" component={AdminHospitalListScreen} options={{ headerShown: true, title: 'Manage Hospitals' }} />
        <Stack.Screen name="EditHospital" component={EditHospitalScreen} options={{ headerShown: true, title: 'Edit Hospital' }} />
        <Stack.Screen name="EditHospitalProfile" component={EditHospitalProfileScreen} options={{ headerShown: true, title: 'Edit Hospital Profile' }} />
        <Stack.Screen name="AddHospital" component={AddHospitalScreen} options={{ headerShown: true, title: 'Add Hospital Specialist' }} />
        <Stack.Screen name="AdminManageHelplines" component={AdminManageHelplinesScreen} options={{ headerShown: true, title: 'Manage Helplines' }} />
        <Stack.Screen name="AdminBloodBankList" component={AdminBloodBankListScreen} options={{ headerShown: true, title: 'Blood Banks' }} />
        <Stack.Screen name="AdminCityIssues" component={AdminCityIssuesScreen} options={{ headerShown: true, title: 'City Issues' }} />
        <Stack.Screen name="HospitalDetail" component={HospitalDetailScreen} options={{ headerShown: false }} />
        <Stack.Screen name="ServiceDetail" component={ServiceDetailScreen} options={{ headerShown: false }} />
        <Stack.Screen name="ManageAllUsers" component={ManageAllUsersScreen} options={{ headerShown: true, title: 'Manage Users' }} />
        <Stack.Screen name="AddEditUser" component={AddEditUserScreen} options={{ headerShown: true, title: 'User Details' }} />
        <Stack.Screen name="AddEditBloodBank" component={AddEditBloodBankScreen} options={{ headerShown: true, title: 'Edit Blood Bank' }} />
        <Stack.Screen name="ManageAllShops" component={ManageAllShopsScreen} options={{ headerShown: true, title: 'Manage Shops' }} />
        <Stack.Screen name="ManageAllServices" component={ManageAllServicesScreen} options={{ headerShown: true, title: 'Manage Services' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
