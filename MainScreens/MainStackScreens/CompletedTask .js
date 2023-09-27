import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
} from "react-native";
import React, { useState, useEffect, useRef } from "react";
import moment from "moment";
import { useNavigation } from "@react-navigation/native";
import { SectionList } from "react-native";
import { ScrollView } from "react-native";
import { getFirestore, doc, getDocs, collection, query, where, orderBy, deleteDoc, writeBatch } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

const CompletedTask = ({ navigation }) => {
  const [completedTasks, setCompletedTasks] = useState([]);
  const [currentDate, setCurrentDate] = useState("");
  const scrollViewRef = useRef(null);
  const db = getFirestore();
  const auth = getAuth();
 

  const viewabilityConfig = {
    itemVisiblePercentThreshold: 50
  };

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems && viewableItems[0]) {
      setCurrentDate(viewableItems[0].item.date);
    }
  }).current;


  
  const clearAllTasks = async () => {
    try {
      const userId = auth.currentUser.uid;
      const batch = writeBatch(db);
    
      // Loop through completed tasks and create delete operations for the batch
      completedTasks.forEach((task) => {
        const taskRef = doc(db, "users", userId, "tasks", task.id);
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
        const userId = auth.currentUser.uid;
        const q = query(
          collection(db, "users", userId, "tasks"),
          where("isCompleted", "==", true),
          orderBy("completedAt", "desc")
        );

        const tasksSnapshot = await getDocs(q);

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
        return `You sat an exam on ${"\n"}${date} at ${time}`;
      case "Presentation":
        return `You presented on ${"\n"}${date} at ${time}`;
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
    <TouchableOpacity onPress={() => navigation.goBack()}>
          <Image
            style={styles.backButton}
            source={require("../../assets/AppIcons/backbutton.png")}
          />
        </TouchableOpacity>
      <View style={[styles.flexDirection= "row", ]}>
      <Text allowFontScaling={false} style={styles.header}>Completed {"\n"}Tasks</Text>
      
        {completedTasks.length > 0 && (
          <TouchableOpacity onPress={clearAllTasks} style={styles.clearAllButton}>
            <Text allowFontScaling={false} style={styles.clearAllButtonText}>Clear All</Text>
          </TouchableOpacity>
        )}
      </View>
  
     
      <Text allowFontScaling={false} style={styles.header1}>
        {getTodayCompletedTasks(completedTasks).length}{" "}
        {getTodayCompletedTasks(completedTasks).length === 1 ? "task" : "tasks"} completed today
      </Text>
  
      <Text allowFontScaling={false} style={styles.header2}>
        {currentDate}
      </Text>
  
      {completedTasks.length === 0 ? (
        <Text allowFontScaling={false} style={styles.noCompletedTasksText}>No completed tasks</Text>
      ) : (
        <ScrollView
        ref={scrollViewRef}
        style={styles.scrollViewHeight}
        onScroll={(event) => {
          const scrollPosition = event.nativeEvent.contentOffset.y;
          for (let i = 0; i < formattedTasks.length; i++) {
            const taskGroupHeight = (formattedTasks[i].tasks.length * 130) + 40; // estimated height for each task group (130px per task + 40px for date header)
            if (scrollPosition <= taskGroupHeight * (i + 1)) {
              setCurrentDate(formattedTasks[i].date);
              break;
            }
          }
        }}
        scrollEventThrottle={16}
      >
        {formattedTasks.map((item, index) => {
          if (index === 0) { // Skip rendering the most recent completed task's date
            return item.tasks.map((task) => (
              <View
                style={[
                  styles.taskItem,
                  { backgroundColor: task.color, height: task.category === 'Reminder' && task.topic ? 140 : 130 }
                ]}
                key={task.id}
              >
                <Image
                  source={{ uri: task.icon }}
                  style={styles.subjectIcon}
                  resizeMode="contain"
                />
                <Text allowFontScaling={false} style={styles.taskTitle}>{task.subjectTitle}</Text>
                <Text allowFontScaling={false} style={styles.taskCategory}>{task.category}</Text>
                <Text allowFontScaling={false} style={styles.taskTopic}>{getCustomMessage(task)}</Text>
              </View>
            ));
          }
      
          return (
            <React.Fragment key={item.date}>
              <View style={styles.dateGroup}>
                <Text allowFontScaling={false} style={styles.dateText}>{item.date}</Text>
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
                    style={styles.subjectIcon}
                    resizeMode="contain"
                  />
                  <Text allowFontScaling={false} style={styles.taskTitle}>{task.subjectTitle}</Text>
                  <Text allowFontScaling={false} style={styles.taskCategory}>{task.category}</Text>
                  <Text allowFontScaling={false} style={styles.taskTopic}>{getCustomMessage(task)}</Text>
                </View>
              ))}
            </React.Fragment>
          );
        })}
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
      marginBottom: 42,
    },
    
    noCompletedTasksText: {
      fontSize: 24,
      fontFamily: "GalanoGrotesque-Medium",
      color: "#0089C2",
      textAlign: "center",
      alignSelf: "center",
      marginTop: hp("50%"), // Position the text in the center of the page
      alignContent: "center",
      position: "absolute"
    },
  
    clearAllButton: {
      position: "relative",
      marginLeft: 285,
      backgroundColor: "#5AC0EB",
      width: 120,
      height: 35,
      borderRadius: 10,
    },
  
    clearAllButtonText: {
      fontSize: 18,
      fontFamily: "GalanoGrotesque-Medium",
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
    },
  
    header1: {
      fontSize: 22,
      fontFamily: "GalanoGrotesque-Medium",
      textAlign: "left",
      color: "#5AC0EB",
      marginLeft: 20,
      marginTop: 5,
  
    },
  
    header2: {
      fontSize: 22,
      fontFamily: "GalanoGrotesque-Medium",
      textAlign: "left",
      color: "#0089C2",
      marginLeft: 20,
      marginTop: 10,
      marginBottom: -35
    },
  
    dateText: {
      fontSize: 18,
      fontFamily: "GalanoGrotesque-Medium",
      textAlign: "left",
      color: "#0089C2",
      marginLeft: 20,
      marginTop: 15,
      marginBottom: -13
    },
  
    taskTitle: {
      fontSize: 25,
      fontFamily: "GalanoGrotesque-Medium",
      color: "white",
      marginLeft: 25,
      marginTop: 25,
    },
    taskCategory: {
      fontSize: 20,
      fontFamily: "GalanoGrotesque-Light",
      color: "white",
      marginLeft: 25,
      marginBottom: 2,
    },
  
    subjectIcon: {
      width: 70,
      height: 70,
      resizeMode: "contain",
      marginLeft: 265,
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
      marginBottom: 15,
    },
  
    taskItem: {
      backgroundColor: "#f0f0f0",
      borderRadius: 20,
      width: 370,
      height: 150,
      alignSelf: "center",
      marginBottom: 10,
      marginTop: 10,
    },
})