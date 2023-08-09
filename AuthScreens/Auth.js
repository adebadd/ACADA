// auth.js

import AsyncStorage from '@react-native-async-storage/async-storage';

// Function to log in the user
export const login = async (user) => {
  // Save user session data in AsyncStorage
  try {
    await AsyncStorage.setItem('userToken', user.token);
  } catch (error) {
    console.log('Error saving user token:', error);
  }
};

// Function to log out the user
export const logout = async () => {
  // Clear user session data from AsyncStorage
  try {
    await AsyncStorage.removeItem('userToken');
  } catch (error) {
    console.log('Error removing user token:', error);
  }
};
