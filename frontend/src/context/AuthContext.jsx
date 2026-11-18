/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/authApi';
import { setAccessToken } from '../api/client';

const AuthContext = createContext(null);
const profilePhotoKey = (userId) => `travel-agency:profile-photo:${userId}`;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [profilePhotoError, setProfilePhotoError] = useState('');

  const checkAuth = async () => {
    try {
      const res = await authApi.getMe();
      if (res.data?.user) {
        setUser(res.data.user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
      setAccessToken(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // If we have an existing token or cookie session, check user
    checkAuth();

    const handleSessionLogout = () => {
      setUser(null);
    };

    window.addEventListener('auth:logout', handleSessionLogout);
    return () => window.removeEventListener('auth:logout', handleSessionLogout);
  }, []);

  useEffect(() => {
    if (!user?.id) {
      setProfilePhoto(null);
      setProfilePhotoError('');
      return;
    }

    try {
      setProfilePhoto(window.localStorage.getItem(profilePhotoKey(user.id)));
      setProfilePhotoError('');
    } catch (error) {
      console.error('Could not read the locally saved profile photo', error);
      setProfilePhoto(null);
      setProfilePhotoError('This browser could not access local photo storage.');
    }
  }, [user?.id]);

  const login = async (credentials) => {
    const res = await authApi.login(credentials);
    const userData = res.data?.user;
    setUser(userData);
    return res;
  };

  const register = async (userData) => {
    const res = await authApi.register(userData);
    const registeredUser = res.data?.user;
    setUser(registeredUser);
    return res;
  };

  const updateProfile = async (profile) => {
    const res = await authApi.updateProfile(profile);
    if (res.data?.user) setUser(res.data.user);
    return res;
  };

  const updateProfilePhoto = (photoData) => {
    if (!user?.id) {
      throw new Error('You must be signed in to update your profile photo.');
    }

    const key = profilePhotoKey(user.id);
    try {
      if (photoData) window.localStorage.setItem(key, photoData);
      else window.localStorage.removeItem(key);
    } catch (error) {
      console.error('Could not save the profile photo in local browser storage', error);
      throw new Error('Photo could not be saved. Check that browser storage is enabled and has space.');
    }

    setProfilePhoto(photoData || null);
    setProfilePhotoError('');
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profilePhoto,
        profilePhotoError,
        loading,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        login,
        register,
        updateProfile,
        updateProfilePhoto,
        logout,
        checkAuth,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
