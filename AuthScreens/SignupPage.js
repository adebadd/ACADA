import {
    KeyboardAvoidingView,
    Platform,
    Alert,
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
import { firebase } from "../config";
import { Video } from 'expo-av';
import videoFile from '../assets/AnimatedGradient.mp4';
import { Dimensions } from 'react-native';
import app from "../config";
import { getAuth, createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { getFirestore, collection, doc, setDoc } from "firebase/firestore";



const SignupPage = ({ navigation }) => {


    const auth = getAuth(app);
  const firestore = getFirestore(app);


    const windowHeight = Dimensions.get('window').height;
    const windowWidth = Dimensions.get('window').width; // Get the window width
    const getSignupButtonMargin = () => {
        if (windowHeight >= 926) return 260;
        if (windowHeight == 812) return 120;
        return 190;  // default value
    }
    
    const getPasswordToggleMarginLeft = () => {
        if (windowWidth >= 428) return 316;
        if (windowWidth == 375) return 270;
        return 305;  // default value
    }

    
    
    const [password, setPassword] = useState("");
    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [firstName, setFirstName] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const toggleShowPassword = () => {
        setShowPassword(!showPassword);
    };


    const signupUser = async (email, password, username) => {
        try {
          const userCredential = await createUserWithEmailAndPassword(auth, email, password);
          const user = userCredential.user;
    
          sendEmailVerification(user, {
            handleCodeInApp: true,
            url: 'https://acada-6ed2e.firebaseapp.com',
          });
    
          await setDoc(doc(firestore, "users", user.uid), {
            username,
            email,
            firstName,
          });
        } catch (error) {
            switch (error.code) {
                case 'auth/email-already-in-use':
                    Alert.alert('Signup Error', 'This email is already in use. Please choose another email address.');
                    break;
                case 'auth/invalid-email':
                    Alert.alert('Signup Error', 'Please enter a valid email address.');
                    break;
                case 'auth/weak-password':
                    Alert.alert('Signup Error', 'Password should be at least 6 characters long.');
                    break;
                case 'auth/network-request-failed':
                    Alert.alert('Network Error', 'Please check your internet connection and try again.');
                    break;
                default:
                    Alert.alert('Signup Error', 'An error occurred during sign-up. Please try again later.');
                    break;
            }
        }
    }

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
                <Text style={styles.signupText}>Sign Up</Text>
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
                    <View style={[styles.loginContainer, { flex: 1 }]}>
                        <TextInput
                            value={email}
                            onChangeText={(email) => setEmail(email)}
                            style={styles.input}
                            onSubmitEditing={() => {
                                this.secondTextInput.focus();
                            }}
                            blurOnSubmit={false}
                        />

                        <Text style={styles.usernameText}>Username</Text>
                        <TextInput
                            value={username}
                            onChangeText={(username) => setUsername(username)}
                            style={styles.input}
                            autoCorrect={true}
                            ref={(input) => {
                                this.secondTextInput = input;
                            }}
                            onSubmitEditing={() => {
                                this.thirdTextInput.focus();
                            }}
                            blurOnSubmit={false}
                        />

                        <Text style={styles.usernameText}>First Name</Text>
                        <TextInput
                            value={firstName}
                            onChangeText={(text) => setFirstName(text)}
                            style={styles.input}
                            autoCorrect={true}
                            ref={(input) => {
                                this.thirdTextInput = input;
                            }}
                            onSubmitEditing={() => {
                                this.fourthTextInput.focus();
                            }}
                            blurOnSubmit={false}
                        />

                        <Text style={styles.passwordText}>Password</Text>
                        <View style={styles.passwordSection}>
                            <TextInput
                                secureTextEntry={!showPassword}
                                value={password}
                                onChangeText={(password) => setPassword(password)}
                                ref={(input) => {
                                    this.fourthTextInput = input;
                                }}
                                //<Image style = {styles.passwordImages} source={require("./assets/hidepassword.png")}/>
                                //  <TouchableOpacity activeOpacity={1}><Image style = {styles.passwordImages} source={require("./assets/hidepassword.png")} /></TouchableOpacity>
                                style={[styles.input2, { width: "100%" }]}
                            />
                        </View>

                        <View style={[styles.passwordToggleContainer, { marginLeft: getPasswordToggleMarginLeft() }]}>
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
                onPress={() => signupUser(email, password, username)}
                activeOpacity={0.76}
                style={[styles.loginButton, { marginBottom: getSignupButtonMargin() }]}
            >
                <Text style={styles.loginButtonText}>Sign up</Text>
            </TouchableOpacity>


            <View style={styles.footerText}>
                <Text>Already have an account?</Text>
                <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => navigation.goBack()}
                >
                    <Text style={styles.highlightedText}> Login</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default SignupPage;

const styles = StyleSheet.create({
    backgroundVideo: {
        position: 'absolute',
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
      usernameText: {
        marginTop: 30,
        fontFamily: "GalanoGrotesqueAlt-Bold",
        color: "white",
        fontSize: 18,
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
        paddingVertical: 5,
        borderBottomColor: "white",
        borderBottomWidth: 0.8,
        color: "black",
        fontFamily: "GalanoGrotesque-Medium",
      },
    
      input2: {
        marginTop: 0,
        paddingVertical: 5,
        borderBottomColor: "white",
        borderBottomWidth: 0.6,
        color: "black",
        fontFamily: "GalanoGrotesque-Medium",
      },
    
      loginButton: {
        backgroundColor: "#0089C2",
        alignItems: "center",
        alignSelf: "center",
        height: 44,
        width: 266,
        borderRadius: 40,
        top: 0,
        bottom: 0, // Adjust this value to move the button higher or lower
        marginBottom: 200, // Add margin to ensure the button isn't too close to the edge
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
    
      footerImages: {
        height: 50,
        width: 50,
        borderRadius: 12,
        marginTop: 0,
        shadowColor: "black",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.48,
        shadowRadius: 5,
      },
      signupsubText2: {
        fontSize: 15,
        fontFamily: "GalanoGrotesque-Light",
        textAlign: "center",
        color: "white",
      },
      footerText: {
        fontSize: 16,
        fontFamily: "GalanoGrotesque-Light",
        justifyContent: 'center',
        flexDirection: 'row',
        position: "absolute",
        bottom: 0,
        marginBottom: 70,
        alignSelf: "center"
      },
      highlightedText: {
        color: "#0089C2",
        textDecorationLine: "underline",
      },
      passwordSection: {
        flexDirection: "row",
        alignItems: "center",
        borderBottomColor: "white",
        borderBottomWidth: 0.6,
      },
      passwordToggleContainer: {
        flex: 0,
        position: "absolute",
        bottom: 0,
        marginBottom: 30,
        marginLeft: 310,
    
      },
      passwordImages: {
        height: 25,
        width: 25,
        position: "absolute",
        marginRight: 90,
        paddingRight: 10,
      },
    
      
    
      video: {
        height: 920,
        position: "absolute",
        top: 0,
        left: 0,
        alignItems: "stretch",
        bottom: 0,
        right: 0
      }
    
});
