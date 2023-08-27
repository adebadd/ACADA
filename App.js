import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import LandingPage from './AuthScreens/LandingPage';
import LoginPage from './AuthScreens/LoginPage';
import SignupPage from './AuthScreens/SignupPage';
import { ActivityIndicator } from 'react-native';
import { firebase } from "./config";
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import AppLoading from 'expo-app-loading';
import Dashboard from './MainScreens/Dashboard';
import UserProfile from './MainScreens/MainStackScreens/UserProfile';
import CompletedTask from './MainScreens/MainStackScreens/CompletedTask ';
import EditSubjectPage from './MainScreens/MainStackScreens/EditSubjectPage';
import CreateSubjectPage from './MainScreens/MainStackScreens/CreateSubjectPage';
import EditTaskPage from './MainScreens/MainStackScreens/EditTaskPage';
import CreateTaskPage from './MainScreens/MainStackScreens/CreateTaskPage';
import BottomTabbar from './TabbarNavigation/BottomTabbar';
import StudyTimerPage from './MainScreens/StudyTimerPage';
import SchedulePage from './MainScreens/SchedulePage';
import PushNotifications from './MainScreens/MainAssetCode/PushNotifications';
import SocialPage from './MainScreens/SocialPage';
import StudyStatsPage from './MainScreens/MainStackScreens/StudyStatsPage';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
// Firebase new modular imports
import { getFirestore } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import app from './config';  // Assuming this is where you initialized your Firebase app
import StudyTabs from './TabbarNavigation/StudyTabs';


import { useCallback } from 'react';

const Stack = createNativeStackNavigator();



function AuthStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="LandingPage"
        component={LandingPage}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="LoginPage"
        component={LoginPage}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="SignupPage"
        component={SignupPage}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}

function MainStack() {
  const [fontsLoaded] = useFonts({
    "GalanoGrotesque-Medium": require("./assets/Fonts/GalanoGrotesque-Medium.ttf"),
    "GalanoGrotesque-Light": require("./assets/Fonts/GalanoGrotesque-Light.ttf"),
    "GalanoGrotesqueAlt-Bold": require("./assets/Fonts/GalanoGrotesqueAlt-Bold.ttf"),
    "GalanoGrotesque-Bold": require("./assets/Fonts/GalanoGrotesque-Bold.ttf"),
    "GalanoGrotesque-SemiBold": require("./assets/Fonts/GalanoGrotesque-SemiBold.ttf"),
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }
  return (
    <Stack.Navigator>
    <Stack.Screen
        options={{ headerShown: false }}
        name="Bottom Tabbar"
        component={BottomTabbar}
      />
       <Stack.Screen
        name="User Profile"
        component={UserProfile}
        options={{
          animationEnabled: false,
          headerShown: false,
        }}
      />
      <Stack.Screen name="Completed Task" component={CompletedTask} options={{
        animationEnabled: false, headerShown: false
      }} />
    <Stack.Screen name="Create Subject Page" component={CreateSubjectPage} options={{
        animationEnabled: false, headerShown: false
      }} />
      <Stack.Screen name="Edit Subject Page" component={EditSubjectPage}
        options={({ }) => ({ animationEnabled: false, headerShown: false })}
      />
      <Stack.Screen name="Schedule Page" component={SchedulePage} options={{
        animationEnabled: false,
      }} />
       <Stack.Screen name="Edit Task Page" component={EditTaskPage}
        options={({ }) => ({ animationEnabled: false, headerShown: false })}
      />

      <Stack.Screen name="Social Page" component={SocialPage} options={{
        animationEnabled: false, headerShown: false
      }} />

      <Stack.Screen name="Create Task" component={CreateTaskPage} options={{
        animationEnabled: false, headerShown: false
      }} />
    </Stack.Navigator>
  );
}

function AppContent() {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const auth = getAuth(app);
    const subscriber = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
      } else {
        setUser(null);
      }
      if (initializing) setInitializing(false);
    });
    return subscriber; // unsubscribe on unmount
  }, [initializing]);

  if (initializing) return null;

  return user ? <MainStack /> : <AuthStack />;
}

export default function App() {
  return (
    <NavigationContainer>
      <AppContent />
    </NavigationContainer>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});