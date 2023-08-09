import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
} from "react-native";
import React, { useState, useEffect, useRef } from "react";
import { firebase } from "../../config";
import moment from "moment";
import { useNavigation } from "@react-navigation/native";
import { SectionList } from "react-native";
import { ScrollView } from "react-native";

const CompletedTask = ({ navigation }) => {
  const [completedTasks, setCompletedTasks] = useState([]);
  const [currentDate, setCurrentDate] = useState("");
  const scrollViewRef = useRef(null);

  const clearAllTasks = async () => {
    try {
      const userId = firebase.auth().currentUser.uid;
      const batch = firebase.firestore().batch();
    
      // Loop through completed tasks and create delete operations for the batch
      completedTasks.forEach((task) => {
        const taskRef = firebase
          .firestore()
          .collection("users")
          .doc(userId)
          .collection("tasks")
          .doc(task.id);
        batch.delete(taskRef);
      });

      // Commit the batch
      await batch.commit();

      // Update the completedTasks state
      setCompletedTasks([]);
    } catch (error) {
      console.error(error);
    }
  };

  const getTodayCompletedTasks = (tasks) => {
    const today = moment().startOf("day");
    return tasks.filter((task) => moment(task.completedAt).isSameOrAfter(today));
  };

  useEffect(() => {
    const fetchCompletedTasks = async () => {
      try {
        const userId = firebase.auth().currentUser.uid;
        const tasksSnapshot = await firebase
          .firestore()
          .collection("users")
          .doc(userId)
          .collection("tasks")
          .where("isCompleted", "==", true)
          .orderBy("completedAt", "desc")
          .get();
    
          const fetchedTasks = tasksSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
            completedAt: moment(doc.data().completedAt.toDate()).startOf("day").toDate(),
          }));
    
        setCompletedTasks(fetchedTasks);
    
        if (fetchedTasks.length > 0) {
          setCurrentDate(moment(fetchedTasks[0].completedAt).format("MMMM Do, YYYY"));
        }
      } catch (error) {
        console.error(error);
      }
    };

    fetchCompletedTasks();
  }, []);

  const groupTasksByDate = (tasks) => {
    const groupedTasks = tasks.reduce((acc, task) => {
      const date = moment(task.completedAt).format("MMMM Do, YYYY"); // Format the date
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(task);
      return acc;
    }, {});

    return Object.entries(groupedTasks).map(([date, tasks]) => ({
      date,
      tasks,
    }));
  };

  const groupedCompletedTasks = groupTasksByDate(completedTasks);

  const getCustomMessage = (task) => {
    const date = moment(task.completedAt).format("MMMM Do, YYYY");
    const time = moment(task.completedAt).format("h:mm a"); // Use the full date and time information
    const { category, topic, subjectTitle } = task;

    switch (category) {
      case "Class":
        return `You attended class on ${"\n"}${date} at ${time}`;
      case "Exam":
        return `You sat exam on ${"\n"}${date} at ${time}`;
      case "Presentation":
        return `You presented presentation on ${"\n"}${date} at ${time}`;
      case "Assignment":
        return `You submitted assignment on ${"\n"}${date} at ${time}`;
      case "Lab":
        return `You attended lab on ${"\n"}${date} at ${time}`;
      case "Study":
        return `You studied for ${subjectTitle} on ${"\n"}${date} at ${time}`;
      case "Reminder":
        return topic
          ? `You were reminded to${"\n"}${topic} on ${date}`
          : `You completed your reminder on ${date}`;
      default:
        return "";
    }
  };
  const formattedTasks = groupedCompletedTasks.map((item) => ({
    date: item.date,
    tasks: item.tasks,
  }));

  return (
    <View style={styles.container}>

      <View styles={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Image
            style={styles.backButton}
            source={require("../../assets/AppIcons/backbutton.png")}
          />
        </TouchableOpacity>
        {completedTasks.length > 0 && (
          <TouchableOpacity onPress={clearAllTasks} style={styles.clearAllButton}>
            <Text style={styles.clearAllButtonText}>Clear All</Text>
          </TouchableOpacity>
        )}
      </View>

      <Text style={styles.header}>Completed {"\n"}Tasks</Text>
      <Text style={styles.header1}>
        {getTodayCompletedTasks(completedTasks).length}{" "}
        {getTodayCompletedTasks(completedTasks).length === 1 ? "task" : "tasks"} completed today
      </Text>
  
      {completedTasks.length === 0 ? (
        <Text style={styles.noCompletedTasksText}>No completed tasks</Text>
      ) : (
        <ScrollView
          ref={scrollViewRef}
          style = {styles.scrollViewHeight}
          onScroll={(event) => {
            const scrollPosition = event.nativeEvent.contentOffset.y;
            const scrollViewHeight = event.nativeEvent.layoutMeasurement.height;
            const dateTextHeight = 40;

            const currentIndex = Math.floor(scrollPosition / scrollViewHeight);
            const currentTask = formattedTasks[currentIndex];
            const nextTask = formattedTasks[currentIndex + 1];

            if (
              currentTask &&
              nextTask &&
              scrollPosition % scrollViewHeight > scrollViewHeight - dateTextHeight
            ) {
              setCurrentDate(nextTask.date);
            } else if (currentTask) {
              setCurrentDate(currentTask.date);
            }
          }}
          scrollEventThrottle={200}
        >
          {formattedTasks.map((item) => (
            <React.Fragment key={item.date}>
              <View style={styles.dateGroup}>
                <Text style={styles.dateText}>{item.date}</Text>
              </View>
              {item.tasks.map((task) => (
                <View
                  style={[
                    styles.taskItem,
                    { backgroundColor: task.color, height: task.category === 'Reminder' && task.topic ? 140 : 130 }
                  ]}
                  key={task.id}
                >
                  <Image
                    source={{ uri: task.icon }}
                    style={[styles.subjectIcon]}
                    resizeMode="contain"
                  />
                  <Text style={styles.taskTitle}>{task.subjectTitle}</Text>
                  <Text style={styles.taskCategory}>{task.category}</Text>
                  <Text style={styles.taskTopic}>{getCustomMessage(task)}</Text>
                </View>
              ))}
            </React.Fragment>
          ))}
        </ScrollView>
      )}
    </View>
  );
};

export default CompletedTask

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "#fff",
      paddingTop: 20,
    },
    flatListContainer: {
      height: 580,
      marginTop: 45,
  
    },
    
  
    scrollViewHeight: {
      marginTop: 40,
    },
    noCompletedTasksText: {
      fontSize: 24,
      fontFamily: "GalanoGrotesque-SemiBold",
      color: "#0089C2",
      textAlign: "center",
      marginTop: "94%", // Position the text in the center of the page
      alignContent: "center",
    },
  
    clearAllButton: {
      position: "relative",
      marginLeft: 240,
      marginTop: 45,
      backgroundColor: "#5AC0EB",
      width: 120,
      height: 35,
      borderRadius: 10,
    },
  
    clearAllButtonText: {
      fontSize: 18,
      fontFamily: "GalanoGrotesque-SemiBold",
      color: "white",
      alignSelf: "center",
      marginTop: 10,
  
    },
  
    header: {
      fontSize: 32,
      fontFamily: "GalanoGrotesque-Bold",
      textAlign: "left",
      color: "#5AC0EB",
      marginLeft: 15,
      marginTop: 110,
      position: "absolute"
    },
  
    header1: {
      fontSize: 22,
      fontFamily: "GalanoGrotesque-SemiBold",
      textAlign: "left",
      color: "#5AC0EB",
      marginLeft: 20,
      marginTop: 180,
      position: "absolute"
  
    },
  
    header2: {
      fontSize: 22,
      fontFamily: "GalanoGrotesque-Light",
      textAlign: "left",
      color: "#0089C2",
      marginLeft: 20,
      marginTop: 40,
    },
  
    dateText: {
      fontSize: 22,
      fontFamily: "GalanoGrotesque-SemiBold",
      textAlign: "left",
      color: "#0089C2",
      marginLeft: 20,
      marginTop: 4,
      marginBottom: -2
    },
  
    taskTitle: {
      fontSize: 25,
      fontFamily: "GalanoGrotesque-Light",
      color: "white",
      marginLeft: 25,
      marginTop: 25,
    },
    taskCategory: {
      fontSize: 20,
      fontFamily: "GalanoGrotesque-Medium",
      color: "white",
      marginLeft: 25,
      marginBottom: 2,
    },
  
    subjectIcon: {
      width: 70,
      height: 70,
      resizeMode: "contain",
      marginLeft: 240,
      top: "50%",
      marginTop: -35, // Half of the icon's height to vertically center it
      position: "absolute",
    },
  
    taskTopic: {
      fontSize: 16,
      fontFamily: "GalanoGrotesque-Medium",
      color: "white",
      marginLeft: 25,
      marginBottom: 5,
      marginTop: 12,
      flexWrap: 'wrap', // Add this line to enable text wrapping
      width: '70%', // Add to set the width of the text container
    },
  
    dateGroup: {
      marginBottom: 20,
    },
  
    backButton: {
      marginTop: 40,
      height: 25,
      marginLeft: 18,
      width: 25,
      resizeMode: "contain",
  
    },
  
    taskItem: {
      backgroundColor: "#f0f0f0",
      borderRadius: 20,
      width: 340,
      height: 130,
      alignSelf: "center",
      marginBottom: 10,
    },
})