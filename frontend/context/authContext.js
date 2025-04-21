import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { baseUrl } from '../services/api';
import { Alert } from 'react-native';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [userToken, setUserToken] = useState(null);
  const [isLoading, setLoading] = useState(false);
  const [userInfo, setUserInfo] = useState(null);

  const signup = async (username, email, password, name) => {
    setLoading(true);
    try {
      const res = await axios.post(`${baseUrl}/auth/register`, { username, email, password, name });
      console.log('Signup response:', res.data);
      
      // Sau khi đăng ký, thông báo thành công nhưng không tự động đăng nhập
      // vì API đăng ký chỉ trả về message, không có token
      Alert.alert(
        "Đăng ký thành công", 
        res.data.message || "Vui lòng kiểm tra email để xác thực tài khoản"
      );
      
      return true;
    } catch (e) {
      console.log(`sign up error: ${e}`);
      Alert.alert(
        "Đăng ký thất bại", 
        e.response?.data?.message || "Có lỗi xảy ra khi đăng ký. Vui lòng thử lại."
      );
      return false;
    } finally {
      setLoading(false);
    }
  };

  const signin = async (username, password) => {
    setLoading(true);
    try {
      console.log('Đang đăng nhập với:', { username, password });
      const res = await axios.post(`${baseUrl}/auth/login`, { username, password, tokenFCM: "string" });
      
      console.log('Signin response:', res.data);
      const data = res.data;
      
      // Set user info
      setUserInfo(data.user);
      await AsyncStorage.setItem('userInfo', JSON.stringify(data.user));
      
      // Set token
      const token = data.access_token;
      setUserToken(token);
      await AsyncStorage.setItem('userToken', token);
      
      return true;
    } catch (e) {
      console.log(`sign in error: ${e}`);
      Alert.alert(
        "Đăng nhập thất bại", 
        e.response?.data?.message || "Thông tin đăng nhập không chính xác."
      );
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    setUserToken(null);
    await AsyncStorage.removeItem('userInfo');
    await AsyncStorage.removeItem('userToken');
    setLoading(false);
  };

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        const userInfoStr = await AsyncStorage.getItem('userInfo');
        
        if (token) {
          setUserToken(token);
        }
        
        if (userInfoStr) {
          const userInfoData = JSON.parse(userInfoStr);
          setUserInfo(userInfoData);
        }
      } catch (e) {
        console.log(`load user data error: ${e}`);
      }
    };
    loadUserData();
  }, []);


  return (
    <AuthContext.Provider value={{ signin, signup, logout, isLoading, userInfo, userToken, setUserInfo, setUserToken }}>
      {children}
    </AuthContext.Provider>
  );
};
