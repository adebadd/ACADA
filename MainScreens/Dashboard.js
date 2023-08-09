import {
    SafeAreaView,
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    ScrollView,
  } from "react-native";
  import React from "react";
  import { firebase } from "../config";
  import { useEffect } from "react";
  import { useState } from "react";
  import { Image } from "react-native";
  import { createNativeStackNavigator } from "@react-navigation/native-stack";
  import { Timestamp } from 'firebase/firestore';
  import moment from "moment";
  import Greetings from "./MainAssetCode/Greetings";
  import Swiper from "react-native-swiper";
  import { useCallback } from "react";
  import { useFonts } from "expo-font";
  


  const fetchTasks = (date, setTasks) => {
    
    const currentUser = firebase.auth().currentUser;
    if (!currentUser) {
      console.log("No user is currently logged in.");
      return;
    }
  
    const userId = currentUser.uid;
    const selectedDate = moment(date).toDate();
    const startOfDay = new Date(selectedDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(selectedDate);
    endOfDay.setHours(23, 59, 59, 999);
    const selectedDayOfWeek = moment(date).isoWeekday();
    const now = new Date();
  
    const unsubscribe = firebase
      .firestore()
      .collection("users")
      .doc(userId)
      .collection("tasks")
      .orderBy("date")
      .orderBy("time")
      .onSnapshot((querySnapshot) => {
        const fetchedTasks = querySnapshot.docs
          .map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
          .filter(
            (task) =>
              ((task.date.toDate() >= now && !task.repeat) ||
                (task.repeat &&
                  moment(task.date.toDate()).isoWeekday() ===
                  selectedDayOfWeek)) &&
              task.date.toDate() >= now &&
              task.isCompleted === false
          );
  
        setTasks(fetchedTasks);
      });
  
    // Return the unsubscribe function to clean up the listener when the component is unmounted
    return unsubscribe;
  };
  
  
  
  
  const Dashboard = ({ navigation}) => {
    const currentUser = firebase.auth().currentUser;
  if (!currentUser) {
    // Redirect to login page
    navigation.navigate('LandingPage');
    return null;
  }
    const [name, setName] = useState("");
    const [tasks, setTasks] = useState([]);
    const [profileImage, setProfileImage] = useState(null);
    const [isProfileImageFetched, setIsProfileImageFetched] = useState(false);
    const [defaultProfileImage, setDefaultProfileImage] = useState(null);
  
    useEffect(() => {
      const fetchProfileImage = async () => {
        const currentUser = firebase.auth().currentUser;
        if (!currentUser) return; // If no user is signed in, just return
        const storagePath = `users/${currentUser.uid}/profileImage`;
        const ref = firebase.storage().ref().child(storagePath);
        try {
          const url = await ref.getDownloadURL();
          setProfileImage(url);
        } catch (error) {
          setProfileImage(defaultProfileImage);
        }
      };
    
      // Create a Firestore reference
      const docRef = firebase.firestore().collection("users").doc(firebase.auth().currentUser.uid);
    
      // Listen to real-time changes
      const unsubscribe = docRef.onSnapshot((doc) => {
        if (doc.exists) {
          fetchProfileImage();
        } else {
          console.log("No such document!");
        }
      });
    
      // Clean up the listener on unmount
      return () => unsubscribe();
    
    }, [defaultProfileImage]); // Add defaultProfileImage to the dependency array
  
    const getTodayCompletedTasks = (tasks) => {
      const today = moment().startOf("day");
      return tasks.filter((task) => moment(task.completedAt).isSameOrAfter(today));
    };
  
  
  
    const CustomPagination = ({ currentIndex, itemsCount, visibleDots }) => {
      const dots = [];
  
      for (let i = 0; i < itemsCount; i++) {
        const isActive = i >= currentIndex && i < currentIndex + visibleDots;
        dots.push(
          <View
            key={i}
            style={{
              backgroundColor: isActive ? "white" : "rgba(255, 255, 255, 0.3)",
              width: 8,
              height: 8,
              borderRadius: 4,
              marginLeft: 3,
              marginRight: 3,
            }}
          />
        );
      }
  
      return (
        <View
          style={{
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            marginRight: 290,
            marginBottom: 70,
          }}
        >
          {dots}
        </View>
      );
    };
    
  
    const tasksWithAddTaskButton = tasks.slice(0, 2);
    tasksWithAddTaskButton.push({ isAddTaskButton: true });
  
    const renderAddTaskButton = () => {
      return (
        <TouchableOpacity
          activeOpacity={0.90}
          style={styles.addTaskButton}
          onPress={() => navigation.navigate("Schedule Page")}
        >
          <Image
            style={styles.addIcon2}
            source={require("../assets/AppIcons/addicon2.png")}
          />
        </TouchableOpacity>
      );
    };
  
  
    useEffect(() => {
      setDefaultProfileImage(Image.resolveAssetSource(require("../assets/AppIcons/profileicon1.png")).uri);
  }, []);
  
  
    const renderSwiperItem = (item) => {
      if (item.isAddTaskButton) {
        return renderAddTaskButton();
      } else {
        return renderTaskItem(item);
      }
    };
  
  
    useEffect(() => {
      const currentDate = new Date();
      const unsubscribe = fetchTasks(currentDate, setTasks);
      return () => {
        unsubscribe();
      };
    }, []);
  
  
    const Stack = createNativeStackNavigator();
    useEffect(() => {
      firebase
        .firestore()
        .collection("users")
        .doc(firebase.auth().currentUser.uid)
        .onSnapshot((snapshot) => {
          if (snapshot.exists) {
            setName(snapshot.data().firstName);
          } else {
            console.log("User does not exist");
          }
        });
    }, []);
    const handleTabChange = (index) => {
      setActiveTab(index);
    };
    const [subjects, setSubjects] = useState([]);
  
    useEffect(() => {
      const unsubscribe = firebase
        .firestore()
        .collection("users")
        .doc(firebase.auth().currentUser.uid)
        .collection("subjects")
        .orderBy("createdAt", "desc")
        .onSnapshot((querySnapshot) => {
          const subjects = [];
          querySnapshot.forEach((doc) => {
            const subject = doc.data();
            subject.id = doc.id; // Add this line to include the document id
            subjects.push(subject);
          });
          setSubjects(subjects);
        });
      return unsubscribe;
    }, []);
  
  
    {
      tasksWithAddTaskButton.length < 3 && (
        <TouchableOpacity
          style={styles.addTaskButton}
          onPress={() => navigation.navigate("Schedule Page")}
        >
          <Image
            style={styles.addIcon2}
            source={require("../assets/AppIcons/addicon2.png")}
          />
        </TouchableOpacity>
      )
    }
  
    const renderTaskItem = (task) => {
      const taskIcon = task.icon ? { uri: task.icon } : null;
      const backgroundColor = task.color;
      const formattedDate = task.date
        ? moment(task.date.toDate()).format("MMMM Do")
        : "";
      const formattedTime = task.date
        ? moment(task.date.toDate()).format("h:mm A")
        : "";
      const isLongTopic = (topic) => {
        return topic && topic.length > 15;
      };
  
      return (
        <TouchableOpacity
          key={task.id}
          activeOpacity={0.80}
          style={[styles.taskItem, { backgroundColor }]}
          onPress={() => {
            // Handle task item press event
          }}
        >
          {taskIcon && (
            <Image style={styles.subjectsicon2} source={taskIcon} />
          )}
          <Text style={[styles.taskTitle, isLongTopic(task.topic) && styles.Long]}>
            {task.subjectTitle}
          </Text>
          <Text style={[styles.taskCategory, isLongTopic(task.topic) && styles.Long]}>
            {task.category}
          </Text>
          <Text style={[styles.taskTopic, isLongTopic(task.topic) && styles.Long , {width: 150}, {flexShrink: 1}]}>
            {task.topic}
          </Text>
          <Text style={[styles.taskDueDate, isLongTopic(task.topic) && styles.Long]}>
            {formattedDate}
            {"\n"}
            {formattedTime}
          </Text>
        </TouchableOpacity>
      );
    };

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
      <SafeAreaView style={styles.container}>
        <View>
          <View style={styles.greetingsContainer}>
            <Text style={styles.greetingsText}>
              <Greetings />
            </Text>
            <Text style={styles.greetingsTextName}>{name}</Text>
          </View>
  
          <View style={styles.headerIconContainer}>
          <TouchableOpacity
      activeOpacity={0.8}
      style={styles.profileIcon1}
      onPress={() => navigation.navigate("User Profile")}
  >
      <Image
          style={styles.profileIcon}
          source={{ uri: profileImage }}
      />
  </TouchableOpacity>
  
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => navigation.navigate("Completed Task")}
              style = {styles.completedTask}
            >
              <Image
                style={styles.completedtaskIcon}
                source={require("../assets/AppIcons/completedtaskicon.png")}
              />
            </TouchableOpacity>
          </View>
  
          <Text style={[styles.header, styles.spacing [{}]]}>Subjects</Text>
          <Text style={styles.header1}>Your current subjects</Text>
  
          <View style={styles.subjectContainer}>
            <ScrollView
              horizontal={true}
              showsHorizontalScrollIndicator={false}
              vertical={true}
            >
              {subjects.map((subject, index) => (
                <TouchableOpacity
                  activeOpacity={0.76}
                  key={index}
                  style={[
                    styles.subjects,
                    { backgroundColor: subject.subjectcolor },
                  ]}
                  onPress={() =>
                    navigation.navigate("Create Subject Page")
                  }
                >
                  <TouchableOpacity
                    onPress={() => navigation.navigate("Edit Subject Page", { subject })}
                  >
                    <Image
                      style={styles.editicon}
                      source={require("../assets/AppIcons/edit.png")}
                    />
                  </TouchableOpacity>
  
                  <Image
                    style={styles.subjectsicon}
                    source={{ uri: subject.icon }}
                  />
                  <Text style={styles.subjectstext}>{subject.title}</Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                activeOpacity={1}
                style={styles.subjects}
                onPress={() => navigation.navigate("Create Subject Page")}
              >
                <TouchableOpacity
                  activeOpacity={0.76}
                  onPress={() => navigation.navigate("Create Subject Page")}
                >
                  <Image
                    style={styles.addIcon}
                    source={require("../assets/AppIcons/addicon2.png")}
                  />
                </TouchableOpacity>
              </TouchableOpacity>
            </ScrollView>
          </View>
  
          <View style={styles.scheduleContainer}>
            <Text style={styles.header}>Schedule</Text>
            <Text style={styles.header1}>Upcoming assignments and tasks</Text>
            <View style={styles.schedule}>
              {tasks.length > 0 ? (
                <Swiper
                  showsPagination
                  horizontal={false}
                  dotColor="rgba(255, 255, 255, 0.3)"
                  activeDotColor="white"
                  style={styles.swiper}
                  paginationStyle={{
                    position: "absolute",
                    marginRight: 10,
                    marginBottom: 100,
                  }}
                  dotStyle={{ transform: [{ rotate: "90deg" }] }}
                  activeDotStyle={{ transform: [{ rotate: "90deg" }] }}
                  autoplay={false}
                  autoplayTimeout={2.5}
                  autoplayDirection={true}
                  removeClippedSubviews={false}
                  onIndexChanged={(index) => {
  
                  }}
                >
                  {tasksWithAddTaskButton.map((item, index) => (
                    <React.Fragment key={index}>{renderSwiperItem(item)}</React.Fragment>
                  ))}
                </Swiper>
              ) : (
                renderAddTaskButton()
              )}
            </View>
          </View>
  
  
  
        </View>
      </SafeAreaView>
    );
  };
  
  export default Dashboard;
  
  
const styles = StyleSheet.create({
    headerIconContainer: {
      flexDirection: "row",
    },
    profileIcon1:{
      width: 50,
      height: 50,
    },
    completedTask:{
      width: 50,
      height: 50,
      marginLeft: 245
    },
    container: {
      backgroundColor: "white",
    },
  
    swiper: {
      backgroundColor: "white",
    },
  
    spacing: {
      marginTop: 32,
    },
  
    profileIcon: {
      width: 50,
      height: 50,
      marginLeft: 250,
      marginTop: 13,
      shadowColor: "black",
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.7,
      borderRadius: 50,
      shadowColor: "black",
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 7,
      shadowRadius: 5,
      
    },
  
    profileImage: {
      borderRadius: 20,
    },
  
    profileIcon: {
      width: 50,
      height: 50,
      marginLeft: 240,
      marginTop: 13,
      borderRadius: 100,
    },
  
    addTaskButton: {
      height: 180,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 40,
      backgroundColor: '#5AC0EB',
    },
  
    addTaskButtonText: {
      fontSize: 24,
      fontFamily: "GalanoGrotesque-SemiBold",
      color: 'white',
    },
  
    completedtaskIcon: {
      marginTop: 13,
      marginLeft: 10,
      width: 50,
      height: 50,
      borderRadius: 50,
      shadowColor: "black",
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 7,
      shadowRadius: 5,
  
    },
  
    subjectsicon: {
      width: 65,
      height: 65,
      alignSelf: "center",
      marginTop: 40,
      marginBottom: 15,
    },
  
    addIcon: {
      width: 65,
      height: 65,
      alignSelf: "center",
      marginTop: 58,
    },
  
    addIcon2: {
      width: 65,
      height: 65,
      alignSelf: "center",
    },
  
    greetingsContainer: {},
  
    greetingsText: {
      fontSize: 26,
      fontFamily: "GalanoGrotesque-SemiBold",
      textAlign: "left",
      marginLeft: 18,
      marginTop: 20,
      color: "#5AC0EB",
      marginBottom: -38,
    },
  
    greetingsTextName: {
      fontSize: 26,
      fontFamily: "GalanoGrotesque-SemiBold",
      textAlign: "left",
      color: "#5AC0EB",
      marginLeft: 18,
      marginTop: 45,
      marginBottom: 80,
      position: "absolute",
    },
    tasks: {
      fontSize: 25,
      fontFamily: "GalanoGrotesque-SemiBold",
      textAlign: "left",
      marginLeft: 18,
      marginTop: 10,
    },
    tasksHighlighted: {
      fontSize: 30,
      fontFamily: "GalanoGrotesque-SemiBold",
      textAlign: "left",
      marginLeft: 18,
      marginTop: 5,
      color: "#5AC0EB",
    },
  
    header: {
      fontSize: 32,
      fontFamily: "GalanoGrotesque-SemiBold",
      textAlign: "left",
      color: "#0089C2",
      marginLeft: 18,
      marginTop: 45,
    },
    header1: {
      fontSize: 18,
      fontFamily: "GalanoGrotesque-Medium",
      textAlign: "left",
      marginLeft: 18,
      marginTop: 2,
      color: "#5AC0EB",
    },
    subjectstext: {
      fontSize: 24,
      fontFamily: "GalanoGrotesque-Medium",
      textAlign: "center",
      color: "white",
      marginTop: 10,
    },
    editicon: {
      height: 20,
      width: 20,
      marginLeft: 165,
      marginTop: 30,
      position: "absolute",
      resizeMode: "contain",
    },
    subjects1: {
      marginTop: 10,
      backgroundColor: "#ffc0cb",
      marginLeft: 12,
      height: 180,
      width: 200,
      borderRadius: 40,
    },
    subjects: {
      marginTop: 10,
      backgroundColor: "#5AC0EB",
      marginLeft: 12,
      height: 180,
      width: 200,
      borderRadius: 40,
    },
    taskItem: {
      height: 180,
      borderRadius: 40,
    },
    taskTitle: {
      fontSize: 26,
      marginLeft: 20,
      fontFamily: "GalanoGrotesque-Bold",
      color: "white",
      marginTop: 36,
  
    },
    taskCategory: {
      fontSize: 25,
      marginLeft: 20,
      fontFamily: "GalanoGrotesque-Medium",
      color: "white",
      marginBottom: 2,
    },
  
    taskTopic: {
      fontSize: 18,
      marginLeft: 20,
      fontFamily: "GalanoGrotesque-Light",
      color: "white",
      width: 180,
      marginBottom: 5,
    },
    subjectsicon2: {
      height: 90,
      width: 90,
      marginLeft: 220,
      marginTop: 50,
      position: "absolute"
    },
  
    taskDueDate: {
      marginTop: 8,
      fontSize: 20,
      marginLeft: 20,
      fontFamily: "GalanoGrotesque-Light",
      color: "white",
    },
  
    Long: {
      top:  -8,
    },
    schedule: {
      marginTop: 10,
      backgroundColor: "#5AC0EB",
      marginLeft: 10,
      height: 180,
      width: 352,
      borderRadius: 40,
      marginBottom: 200,
    },
  
    tabbariconhome: {
      height: 26,
      width: 26,
      resizeMode: "contain",
    },
  
    tabbariconclock: {
      height: 26,
      width: 26,
      resizeMode: "contain",
    },
  
    tabbariconsch: {
      height: 26,
      width: 26,
      resizeMode: "contain",
    },
  
    tabbariconcommunity: {
      height: 26,
      width: 26,
      resizeMode: "contain",
    },
  });