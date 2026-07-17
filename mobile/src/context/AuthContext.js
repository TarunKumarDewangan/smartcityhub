import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient, { setAuthToken, registerUnauthorizedCallback } from '../api/client';
import { saveSecurely, getSecurely, deleteSecurely } from '../utils/secureStore';

const AuthContext = createContext();

// Registration always stores phone numbers as '+91' followed by the 10-digit
// number (see RegisterScreen/PhoneInput), so login must normalize to the same
// format regardless of how the user typed it (with/without +91, spaces, etc.).
const normalizePhone = (input) => {
  const digits = input.replace(/[^0-9]/g, '');
  return '+91' + digits.slice(-10);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    registerUnauthorizedCallback(async () => {
      await deleteSecurely('auth_token');
      await AsyncStorage.removeItem('user_data');
      setAuthToken(null);
      setUser(null);
    });
    loadStorageData();
  }, []);

  const loadStorageData = async () => {
    try {
      const token = await getSecurely('auth_token');
      const userData = await AsyncStorage.getItem('user_data');

      if (token && userData) {
        setAuthToken(token);
        setUser(JSON.parse(userData));
      }
    } catch (e) {
      console.error('Failed to load auth data', e);
    } finally {
      setLoading(false);
    }
  };

  const login = async (emailOrPhone, password) => {
    try {
      const isEmail = emailOrPhone.includes('@');
      const identifierPayload = isEmail
        ? { email: emailOrPhone }
        : { phone: normalizePhone(emailOrPhone) };

      const response = await apiClient.post('/login', {
        ...identifierPayload,
        password,
      });

      const { access_token, user: userData } = response.data;
      
      await saveSecurely('auth_token', access_token);
      await AsyncStorage.setItem('user_data', JSON.stringify(userData));
      
      setAuthToken(access_token);
      setUser(userData);
      return { success: true };
    } catch (e) {
      return { success: false, error: e.response?.data?.message || 'Login failed' };
    }
  };

  const logout = async () => {
    try {
      await apiClient.post('/logout');
    } catch (e) {
      console.error('Logout failed on server', e);
    } finally {
      await deleteSecurely('auth_token');
      await AsyncStorage.removeItem('user_data');
      setAuthToken(null);
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
