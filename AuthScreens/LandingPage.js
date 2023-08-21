import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { useEffect } from "react";
import { LinearGradient } from "expo-linear-gradient";
import TextGradient from "../Gradient/TextGradient";
import { TouchableOpacity } from "react-native";
import { useState } from "react";
import { firebase } from "../config";
import { Image } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Video } from "expo-av";
import videoFile from '../assets/AnimatedGradient.mp4';
import SignupPage from "./SignupPage";
import LoginPage from "./LoginPage";
import { useCallback } from 'react';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';

SplashScreen.hideAsync();

const LandingPage = ({ navigation }) => {
  const [fontsLoaded] = useFonts({
    "GalanoGrotesque-Medium": require("../assets/Fonts/GalanoGrotesque-Medium.ttf"),
    "GalanoGrotesque-Light": require("../assets/Fonts/GalanoGrotesque-Light.ttf"),
    "GalanoGrotesqueAlt-Bold": require("../assets/Fonts/GalanoGrotesqueAlt-Bold.ttf"),
    "GalanoGrotesque-Bold": require("../assets/Fonts/GalanoGrotesque-Bold.ttf"),
    "GalanoGrotesque-SemiBold": require("../assets/Fonts/GalanoGrotesque-SemiBold.ttf"),
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
    <View style={styles.backgroundVideo} onLayout={onLayoutRootView}>
      <Video
        source={videoFile}
        shouldPlay
        isLooping
        resizeMode={Video.RESIZE_MODE_COVER}
        style={StyleSheet.absoluteFill}
      />
      <View>
        <TextGradient style={styles.mainText}>ACADA</TextGradient>
        <Text style={styles.subText}>Study Better With Friends</Text>
        <Text style={styles.signupText}>Sign Up</Text>
        <Text style={styles.signupsubText}>Sign up using email</Text>

        <TouchableOpacity activeOpacity={0.76} style={styles.signupButton} onPress={() => navigation.navigate(SignupPage)}>
          <Text style={styles.signupButtonText}>Sign Up</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.signupsubText2}>Or signup with</Text>
      <View style={styles.footerText}>
        <Text>Already have an account?</Text>
        <TouchableOpacity activeOpacity={0.8} onPress={() => navigation.navigate(LoginPage)}>
          <Text style={styles.highlightedText} > Login</Text>
        </TouchableOpacity>

      </View>

      <View style={styles.socialImages}>

        <TouchableOpacity activeOpacity={0.76}>
          <Image
            style={styles.footerImages}
            source={require("../assets/SocialIcons/googleLogo.png")}
          />
        </TouchableOpacity>
        <TouchableOpacity activeOpacity={0.76}>
          <Image
            style={styles.footerImages}
            source={require("../assets/SocialIcons/twitterLogo.png")}
          />
        </TouchableOpacity>
        <TouchableOpacity activeOpacity={0.76}>
          <Image
            style={styles.footerImages}
            source={require("../assets/SocialIcons/linkedInLogo.png")}
          />
        </TouchableOpacity>

      </View>
    </View>
  );
};

export default LandingPage;

const styles = StyleSheet.create({

  backgroundVideo: {
    position: 'absolute',
    zIndex: 0,
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
  },
  mainText: {
    fontSize: 75,
    fontFamily: "GalanoGrotesque-Medium",
    textAlign: "center",
    marginTop: 140,
  },
  subText: {
    fontSize: 16,
    fontFamily: "GalanoGrotesque-Medium",
    textAlign: "center",
    color: "white",
  },

  signupText: {
    fontSize: 35,
    fontFamily: "GalanoGrotesque-Medium",
    marginTop: 120,
    textAlign: "center",
    color: "white",
  },

  signupsubText: {
    fontSize: 18,
    fontFamily: "GalanoGrotesque-Medium",
    marginTop: 12,
    textAlign: "center",
    color: "white",
  },
  signupsubText2: {
    marginTop: 15,
    fontSize: 15,
    fontFamily: "GalanoGrotesque-Light",
    textAlign: "center",
    color: "white",
  },

  signupButton: {
    marginTop: 22,
    backgroundColor: '#0089C2',
    alignItems: "center",
    alignSelf: "center",
    height: 44,
    width: 230,
    borderRadius: 40,
    shadowColor: "#01668B",
    shadowOffset: { width: 1, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
  },

  signupButtonText: {
    fontSize: 16,
    fontFamily: "GalanoGrotesque-Light",
    color: "white",
    marginTop: 14,

  },
  footerText: {
    fontSize: 16,
    fontFamily: "GalanoGrotesque-Light",
    justifyContent: 'center',
    flexDirection: 'row',
    position: "absolute",
    position: 'absolute',
    bottom: 0,
    marginBottom: 70, // Add margin to ensure text isn't too close to the edge
    alignSelf: "center"
  },
  highlightedText: {
    color: "#01668B",
    textDecorationLine: 'underline',

  },

  socialImages: {
    marginTop: 5,
    flexDirection: 'row',
    alignContent: "center",
    alignSelf: "center",

  },

  footerImages: {
    height: 50,
    width: 50,
    borderRadius: 12,
    marginHorizontal: 0,
    shadowColor: "black",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.48,
    shadowRadius: 3,
  },
});