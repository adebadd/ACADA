import {
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    View,
    Image,
    TouchableOpacity,
    ScrollView,
  } from "react-native";
  import React, { useRef } from "react";
  import { useFonts } from "expo-font";
  import { useEffect } from "react";
  import { LinearGradient } from "expo-linear-gradient";
  import TextGradient from "../Gradient/TextGradient";
  import { useState } from "react";
  import * as Font from "expo-font";
  import { useNavigation } from "@react-navigation/native";
  import { firebase } from "../config";
  import { Alert } from 'react-native';
  import { Video } from "expo-av";
  import videoFile from '../assets/AnimatedGradient.mp4';
import AsyncStorage from "@react-native-async-storage/async-storage";

  const LoginPage = () => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
  
    const navigation = useNavigation()
  
    const [showPassword, setShowPassword] = useState(false);
    const toggleShowPassword = () => {
      setShowPassword(!showPassword);
    };
  
  
    // forget password
    const forgetPassword = () => {
      firebase.auth().sendPasswordResetEmail(email)
        .then(() => {
          Alert.alert("Password Reset E-mail Sent!", "Please check your email inbox to reset your password.");
        })
        .catch((error) => {
          let errorMessage = "";
          if (error.code === "auth/user-not-found") {
            errorMessage = "E-mail address not found";
          }
          if (error.code === "auth/invalid-email") {
            errorMessage = "Invalid e-mail address";
          } if (!email) {
            errorMessage = ("Enter your e-mail to reset your password");
          } else {
            errorMessage = error.message;
          }
          Alert.alert("Forgot Password", errorMessage);
        });
    };
  
    const loginUser = async (email, password) => {
      try {
        const response = await firebase.auth().signInWithEmailAndPassword(email, password);
    
        const userId = response.user.uid;
        const userDoc = await firebase.firestore().collection("users").doc(userId).get();
    
        if (!userDoc.exists) {
          throw new Error("An account with this email was not found");
        }
    
        // Construct the userData object with necessary user information
        const userData = {
          uid: userId,
          email: userDoc.data().email, // Adjust this based on your user data structure
          // Add other necessary user data properties here
        };
    
        // Store user data in AsyncStorage
        await AsyncStorage.setItem('userData', JSON.stringify(userData));
    
      } catch (error) {
        let errorMessage = "";
        switch (error.code) {
          case "auth/invalid-email":
            errorMessage = "Invalid email address.";
            break;
          case "auth/user-disabled":
            errorMessage = "This account has been disabled.";
            break;
          case "auth/user-not-found":
            errorMessage = "An account with this email was not found";
            break;
          case "auth/wrong-password":
            errorMessage = "Incorrect password or email";
            break;
          default:
            errorMessage = error.message;
        }
        Alert.alert("Login", errorMessage);
      }
    };

    return (
      <View style={styles.backgroundVideo}>
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
          <Text style={styles.loginText}>Login</Text>
        </View>
        <KeyboardAvoidingView
          enabled
          behavior={Platform.OS === "ios" ? "padding" : 2}
          style={{ flex: 1 }}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContainer}
            keyboardShouldPersistTaps="handled"
          >
            <Text style={styles.emailText}> E-mail</Text>
            <View style={[styles.loginContainer, { flex: 0.8 }]}>
              <TextInput
                value={email}
                onChangeText={(email) => setEmail(email)}
                style={styles.input}
                onSubmitEditing={() => { this.secondTextInput.focus(); }}
                blurOnSubmit={false}
                autoCapitalize="none"
                autoCorrect={true}
              />
              <Text style={styles.passwordText}>Password</Text>
              <View style={styles.passwordSection}>
                <TextInput
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={password => setPassword(password)}
                  //<Image style = {styles.passwordImages} source={require("../assets/hidepassword.png")}/>
                  //  <TouchableOpacity activeOpacity={1}><Image style = {styles.passwordImages} source={require("../assets/hidepassword.png")} /></TouchableOpacity>
                  style={[styles.input, { width: "100%" }]}
                  ref={(input) => { this.secondTextInput = input; }}
                />
              </View>
              <View style={styles.passwordToggleContainer}>
                <TouchableOpacity activeOpacity={1} onPress={toggleShowPassword}>
                  <Image
                    source={
                      showPassword
                      ? require("../assets/AuthIcons/hidepassword.png")
                        : require("../assets/AuthIcons/showpassword.png")
                    }
                    style={styles.passwordImages}
                  />
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
  
        </KeyboardAvoidingView>
        <TouchableOpacity
          activeOpacity={0.76}
          onPress={() => { forgetPassword() }}
  
        >
          <Text style={[styles.forgotpasswordText]}>Forgot password?</Text>
  
  
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.76}
          style={[styles.loginButton]}
          onPress={() => loginUser(email, password)}
  
        >
          <Text style={styles.loginButtonText}>Login</Text>
  
        </TouchableOpacity>
        <Text style={styles.signupsubText2}>Or login with</Text>
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
  
        <View style={styles.footerText}>
          
          <Text style = {styles.accountText}>Don't have an account?</Text>
          <TouchableOpacity activeOpacity={0.8} onPress={() => navigation.goBack()}>
            <Text style={styles.highlightedText}> Sign up</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };
  
  export default LoginPage;
  
  const styles = StyleSheet.create({
    mainText: {
        fontSize: 75,
        fontFamily: "GalanoGrotesque-Medium",
        textAlign: "center",
        marginTop: 140,
      },
    
      backgroundVideo: {
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
      },
      subText: {
        fontSize: 16,
        fontFamily: "GalanoGrotesque-Medium",
        textAlign: "center",
        color: "white",
      },
    
      loginText: {
        fontSize: 30,
        fontFamily: "GalanoGrotesque-Medium",
        marginTop: 60,
        marginLeft: 24,
        color: "white",
      },
    
      emailText: {
        marginTop: 30,
        marginLeft: 32,
        fontFamily: "GalanoGrotesqueAlt-Bold",
        color: "white",
        fontSize: 18,
      },
      forgotpasswordText: {
    
        fontFamily: "GalanoGrotesque-Light",
        color: "white",
        fontSize: 14,
        height: 15,
        marginBottom: 20,
        marginRight: 36,
        textAlign: "right",
        textDecorationLine: "underline",
    
      },
    
      passwordText: {
        marginTop: 20,
        fontFamily: "GalanoGrotesqueAlt-Bold",
        color: "white",
        fontSize: 18,
      },
      loginContainer: {
        width: "81%",
        alignSelf: "center",
      },
    
      input: {
        marginTop: 0,
        paddingVertical: 10,
        borderBottomColor: "white",
        borderBottomWidth: 0.8,
        color: "black",
        fontFamily: "GalanoGrotesque-Medium",
      },
    
      loginButton: {
        backgroundColor: "#0089C2",
        alignItems: "center",
        alignSelf: "center",
        height: 44,
        width: 230,
        borderRadius: 40,
        shadowColor: "#01668B",
        shadowOffset: { width: 1, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 6,
      },
    
      loginButtonText: {
        fontSize: 16,
        fontFamily: "GalanoGrotesque-Light",
        color: "white",
        marginTop: 14,
      },
      socialImages: {
        flexDirection: "row",
        alignContent: "center",
        alignSelf: "center",
      },
    
    
      signupsubText2: {
        fontSize: 16,
        fontFamily: "GalanoGrotesque-Light",
        marginTop: 18,
        textAlign: "center",
        color: "white",
      },
    loginarea: {
        fontSize: 16,
        marginBottom: 155,
      },
      footerText: {
        flexDirection: "row",
        justifyContent: "center",
        marginBottom: 40
      },
      accountText: {
        flexDirection: "row",
    
      },
      highlightedText: {
        color: "#01668B",
        textDecorationLine: "underline",
        height:15,
      },
      passwordSection: {
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomColor: 'white',
        borderBottomWidth: 1,
      },
      passwordToggleContainer: {
        flex: 0,
        position: "absolute",
        marginLeft: 275,
        marginTop: 85,
      },
      footerImages: {
        height: 50,
        width: 50,
        borderRadius: 12,
        marginTop: 2,
        marginBottom: 115,
        shadowColor: "black",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.48,
        shadowRadius: 3,
      },
      passwordImages: {
        height: 25,
        width: 25,
        position: "absolute",
        marginRight: 90,
        paddingRight: 10,
      },
    });
    
  