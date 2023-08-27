import React, { useState, useEffect } from 'react';
import {
  TouchableOpacity,
  StyleSheet,
  Text,
  View,
  Image,
  ScrollView,
  Modal
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';
import * as Application from 'expo-application';
import { Switch } from 'react-native';
import { Permission } from 'react-native';
import { CommonActions } from '@react-navigation/native';
import PushNotifications from '../MainAssetCode/PushNotifications';
import { getAuth, signOut, onAuthStateChanged, updateProfile } from 'firebase/auth';
import { getFirestore, doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

const UserProfile = ({ navigation}) => {
  const [name, setName] = useState([]);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [socialNotificationsEnabled, setSocialNotificationsEnabled] = useState(true);
  const [confirmLogoutModalVisible, setConfirmLogoutModalVisible] = useState(false);

  const auth = getAuth();
  const firestore = getFirestore();
  const storage = getStorage();
  
  const toggleNotifications = (value) => {
    setNotificationsEnabled(value);
    const currentUser = auth.currentUser;
    if (currentUser) {
      updateDoc(doc(firestore, "users", currentUser.uid), {
        notificationsEnabled: value,
      });
      PushNotifications(value); // again to reschedule the notifications
    }
  };

  useEffect(() => {
    const currentUser = auth.currentUser;
    if (!currentUser) return; // If no user is signed in, just return
    onSnapshot(doc(firestore, "users", currentUser.uid), (doc) => {
      if (doc.exists()) {
        setNotificationsEnabled(doc.data().notificationsEnabled);
      } else {
        console.log("No such document!");
      }
    });
  }, []);

  const handleSignOut = async () => {
    try {
      const currentUser = auth.currentUser;
  
      if (!currentUser) {
        console.error("No user is currently signed in");
        return;
      }
  
      await signOut(auth);
      console.log("User signed out successfully");
  
      // Add this line to navigate to the Signup screen
      navigation.navigate('LandingPage');
    } catch (error) {
      console.error("Sign out error", error);
    }
  };

  useEffect(() => {
    const fetchProfileImage = async () => {
      const currentUser = auth.currentUser;
      if (!currentUser) return;  // If no user is signed in, just return
      const storagePath = `users/${auth.currentUser.uid}/profileImage`;
      const storageRef = ref(storage, storagePath);
      try {
        const url = await getDownloadURL(storageRef);
        setProfileImage(url);
      } catch (error) {
        console.error("Error fetching profile image:", error);
      }
    };
    fetchProfileImage();
  }, []);
  

  const [profileImage, setProfileImage] = useState(null);

  useEffect(() => {
    const requestCameraRollPermission = async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        alert('Sorry, we need camera roll permissions to make this work!');
      }
    };

    requestCameraRollPermission();
  }, []);



  const handleProfilePress = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
  
    if (!result.canceled) {
      const selectedAsset = result.assets[0];
      
      // Replace the URL below with your Firebase storage path
      const storagePath = `users/${auth.currentUser.uid}/profileImage`; // Updated this line
  
      // Upload the image to Firebase Storage and update the state
      console.log("Uploading image with URI:", selectedAsset.uri);
      uploadImage(selectedAsset.uri, storagePath)
        .then((url) => {
          setProfileImage(url);
          // Call the callback function to update the profile image in the Dashboard component
          route.params?.onProfileImageChanged?.(url);
        })
        .catch((error) => {
          console.log(error);
        });
    }
  };

  useEffect(() => {
    const currentUser = auth.currentUser;  // Using the auth instance from getAuth()
    if (!currentUser) return; // If no user is signed in, just return
    
    const userDocRef = doc(firestore, "users", currentUser.uid);
    const unsubscribe = onSnapshot(userDocRef, (snapshot) => {
      if (snapshot.exists()) {
        setName(snapshot.data().firstName);
      } else {
        console.log("User does not exist");
      }
    });
  
    return () => unsubscribe(); // Unsubscribe on cleanup
  }, []);




  const uploadImage = async (uri, storagePath) => {
    try {
      console.log("Uploading image with URI:", uri);
      const response = await fetch(uri);
      const blob = await response.blob();
      const storageRef = ref(storage, storagePath);
  
      console.log("Uploading blob to Firebase Storage:", storagePath);
      await uploadBytesResumable(storageRef, blob);
      const url = await getDownloadURL(storageRef);
  
      const currentUser = auth.currentUser;
      if (!currentUser) return; // If no user is signed in, just return
      // Update the profile image in the Firestore database
      await updateDoc(doc(firestore, "users", currentUser.uid), { profileImageUrl: url });
  
      return url;
    } catch (error) {
      console.error("Error in uploadImage function:", error);
      throw error;
    }
  };

  return (
    <View>

      <View style={styles.container}>
        <View styles={styles.topBar}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Image
              style={styles.backButton}
              source={require("../../assets/AppIcons/profileback.png")}
            />
          </TouchableOpacity>
        </View>
        <View style={styles.profileBorder}>
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.profileContainer}
            onPress={() => {
              handleProfilePress();
            }}
          >
            <View
              style={[
                styles.profileWrapper,
                profileImage ? styles.profileWrapperWithImage : {},
              ]}
            >
              {!profileImage ? (
                <Image
                  style={styles.profile}
                  source={require('../../assets/AppIcons/profilebig.png')}
                />
              ) : (
                <Image
                  style={styles.profile}
                  source={{ uri: profileImage }}
                />
              )}
            </View>
          </TouchableOpacity>
        </View>

        <Text allowFontScaling={false} style={styles.greetingsText}>Hello, {name}</Text>
      </View>
      <ScrollView style={styles.scrollViewContent}>
      <Text allowFontScaling={false} style={[styles.Title, { marginTop: 280 }]}>Account</Text>
        <View style={styles.separator} />
        <TouchableOpacity style={[styles.longtouchable, { marginTop: 25 }]}>
        <Text allowFontScaling={false} style={styles.touchabletext}>Edit Profile</Text>
          <Image
            style={styles.openIcon}
            source={require("../../assets/AppIcons/openicon.png")}
          />
        </TouchableOpacity>


        <TouchableOpacity style={[styles.longtouchable]}><Text allowFontScaling={false} style={styles.touchabletext}>Change Password</Text>
          <Image
            style={styles.openIcon}
            source={require("../../assets/AppIcons/openicon.png")}
          /></TouchableOpacity>
        <TouchableOpacity style={[styles.longtouchable]}><Text allowFontScaling={false} style={styles.touchabletext}>Delete Account</Text>
          <Image
            style={styles.openIcon}
            source={require("../../assets/AppIcons/openicon.png")}
          /></TouchableOpacity>

<Text allowFontScaling={false} style={[styles.Title, { marginTop: -5, }]}>Notifications</Text>


        <TouchableOpacity></TouchableOpacity>
        <View style={styles.separator} />
        <TouchableOpacity activeOpacity={1} style={[styles.longtouchable, { marginTop: 25 }]}><Text style={styles.touchabletext}>Notifications</Text>
          <Switch
            trackColor={{ false: "#0089C2", true: "#5AC0EB" }}
            thumbColor={notificationsEnabled ? "#FFFFFF" : "#f4f3f4"}
            ios_backgroundColor="#0089C2"
            onValueChange={toggleNotifications}
            value={notificationsEnabled}
            style={{
              position: "absolute",
              alignSelf: "flex-end",
              marginTop: -8,
              transform: [{ scaleX: .8 }, { scaleY: .8 }]  // Use this line to adjust size
            }}
          />
        </TouchableOpacity>

        <TouchableOpacity activeOpacity={1} style={[styles.longtouchable,]}><Text allowFontScaling={false} style={styles.touchabletext}>Social Notifications</Text>
          <Switch
            trackColor={{ false: "#0089C2", true: "#5AC0EB" }}
            thumbColor={socialNotificationsEnabled ? "#FFFFFF" : "#f4f3f4"}
            ios_backgroundColor="#0089C2"
            onValueChange={() => setSocialNotificationsEnabled(!socialNotificationsEnabled)}
            value={socialNotificationsEnabled}

            style={{
              position: "absolute",
              alignSelf: "flex-end",
              marginTop: -8,
              transform: [{ scaleX: .8 }, { scaleY: .8 }]  // Use this line to adjust size
            }}
          />
        </TouchableOpacity>



        <Text allowFontScaling={false} style={[styles.Title, { marginTop: -5, }]}>Theme</Text>
        <View style={styles.separator} />

        <View style={styles.themeview}>
          <TouchableOpacity style={[styles.themeselect, { marginLeft: 0 }]} />
          <TouchableOpacity style={[styles.themeselect, { backgroundColor: "#ffc0cb" }]} />
          <TouchableOpacity style={[styles.themeselect, { backgroundColor: "#D50000" }]} />
          <TouchableOpacity style={[styles.themeselect, { backgroundColor: "#444444" }]} />


        </View>


        <Image
          style={styles.profileCheck}
          source={require("../../assets/AppIcons/profilecheck.png")}
        />

        <Image
          style={styles.notiIcon}
          source={require("../../assets/AppIcons/notiicon.png")}
        />
        <Image
          style={styles.moreIcon}
          source={require("../../assets/AppIcons/moreicon.png")}
        />

        <TouchableOpacity
          activeOpacity={0.76}
          style={[styles.logoutButton]}
          onPress={() => setConfirmLogoutModalVisible(true)}
        >
          <Image
            style={styles.signoutIcon}
            source={require("../../assets/AppIcons/signout.png")}
          />
          <Text allowFontScaling={false} style={styles.logoutButtonText}>Sign out</Text>
        </TouchableOpacity>

      </ScrollView>
      <Modal
        visible={confirmLogoutModalVisible}
        animationType="fade"
        transparent={true}
      >
        <View style={styles.overlay}>
          <View style={styles.modalWrapper}>
            <View style={styles.modalContainer}>
            <Text allowFontScaling={false} style={styles.modalTitle}>Are you sure you{'\n'} want to sign out?</Text>

              <TouchableOpacity
                style={styles.modalButton}
                onPress={handleSignOut}
                activeOpacity={0.9}
              >

<Text allowFontScaling={false} style={styles.modalButtonText}>Sign Out</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setConfirmLogoutModalVisible(false)}
                activeOpacity={0.9}
              >
                <Image
                  source={require('../../assets/AppIcons/exiticon.png')}
                  style={styles.closeImage}
                />
              </TouchableOpacity>

            </View>
          </View>
        </View>
      </Modal>


    </View>
  );
};

export default UserProfile;


const styles = StyleSheet.create({

  container: {
    backgroundColor: "#5AC0EB",
    height: 250,
    width: '100%',
    position: 'absolute',
    alignSelf: 'center',
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    zIndex: 10,  // added this lines1
    elevation: 10,  // added this line for Android
  },

  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  separator: {
    borderBottomColor: '#5AC0EB',  // Change color as per your requirement
    borderBottomWidth: 0.5,
    width: 330,
    alignSelf: "center",
    marginTop: 5, // Space it out from the text above and below
  },

  longtouchable: {
    width: 330,
    alignSelf: "center",
    height: 48,
  },

  modalWrapper: {
    backgroundColor: 'white',
    borderRadius: 28,
    width: 320,
    height: 160,
    position: 'absolute', // Position it absolutely
    top: '50%', // Center it vertically
    left: '50%', // Center it horizontally
    transform: [ // Use these two lines to actually center the modal
      { translateX: -160 }, // This moves it half of its width to the left
      { translateY: -75 }, // This moves it half of its height to the top
    ],

  },

  closeButton: {
    position: 'absolute',
    top: -6,
    right: -8,
    zIndex: 1,
  },
  closeImage: {
    width: 40,
    height: 40,
  },

  modalTitle: {
    fontSize: 20,
    fontFamily: "GalanoGrotesque-Medium",
    textAlign: "center",
    color: "#0089C2",
    marginTop: 36,
  },
  modalButton: {
    backgroundColor: "#5AC0EB",
    borderRadius: 16,
    alignSelf: "center",
    width: 168,
    height: 40,
    marginTop: 12,
  },
  modalButtonText: {
    fontSize: 18,
    fontFamily: "GalanoGrotesque-Light",
    textAlign: "center",
    marginTop: 12,
    color: "white",
  },


  scrollViewContent: {
    zIndex: 1,  // added this line
    elevation: 1,  // added this line for Android
    height: 900,
  },

  openIcon: {
    height: 18,
    width: 18,
    resizeMode: "contain",
    position: "absolute",
    alignSelf: "flex-end"
  },

  touchabletext: {
    fontSize: 18,
    fontFamily: "GalanoGrotesque-Medium",
    color: "#0089C2",
  },
  profileCheck: {
    height: 18,
    width: 20,
    resizeMode: "contain",
    position: "absolute",
    marginTop: 278,
    marginLeft: 20,

  },

  logoutButton: {
    backgroundColor: 'transparent',  // This will make the button background transparent
    borderWidth: 1,  // This will create a border
    borderColor: "#5AC0EB",  // This is the color of the border
    marginTop: 20,
    height: 44,
    alignSelf: "center",
    width: 180,
    borderWidth: 2,
    borderRadius: 40,
  },

  logoutButtonText: {
    fontSize: 20,
    fontFamily: "GalanoGrotesque-SemiBold",
    color: "#0089C2",
    marginTop: 11,
    alignSelf: "center",
    marginLeft: 20,
  },

  themeview: {
    flexDirection: "row",
    alignSelf: "center"
  },
  themeselect: {
    height: 50,
    width: 50,
    backgroundColor: "#5AC0EB",
    marginTop: 20,
    marginLeft: 20,
    borderRadius: 40,

  },

  profileContainer: {
    width: 100,
    alignSelf: "center"
  },

  notiIcon: {
    height: 18,
    width: 20,
    resizeMode: "contain",
    position: "absolute",
    marginTop: 466,
    marginLeft: 20,
  },

  signoutIcon: {
    height: 24,
    width: 24,
    resizeMode: "contain",
    position: "absolute",
    marginLeft: 26,
    marginTop: 7.5,
  },

  moreIcon: {
    height: 18,
    width: 20,
    resizeMode: "contain",
    position: "absolute",
    marginTop: 606,
    marginLeft: 20,

  },

  greetingsText: {
    fontSize: 30,
    fontFamily: "GalanoGrotesque-SemiBold",
    textAlign: "center",
    color: 'white',
    marginTop: 15
  },

  Title: {
    fontSize: 20,
    fontFamily: "GalanoGrotesque-SemiBold",
    textAlign: "left",
    marginLeft: 50,
    color: "#0089C2",
    marginTop: 330,
  },

  profile: {
    height: 100,
    width: 100,
    borderRadius: 75,
    overflow: 'hidden',
    marginTop: -8,
    resizeMode: 'cover',
    alignSelf: "center",

  },

  backButton: {
    marginTop: 48,
    height: 25,
    width: 25,
    marginLeft: 18,
    resizeMode: "contain",
    marginBottom: 15,
    position: "relative"
  },


});