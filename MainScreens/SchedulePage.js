import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { firebase } from "../config";
import React, { useState, useEffect, useRef } from "react";
import * as Font from "expo-font";
import { useFonts } from "expo-font";
import CurrentDate from "./MainAssetCode/CurrentDate";
import { Image } from "react-native-animatable";
import { FlatList } from "react-native";
import { Dimensions } from "react-native";
import { PureComponent } from "react";
import moment from "moment";
import { useNavigation } from "@react-navigation/native";
import GenerateDates from "./MainAssetCode/GenerateDates";
import { memo } from "react";
import Swiper from "react-native-deck-swiper";
import Modal from "react-native-modal";
import {
  getFirestore,
  doc,
  getDocs,
  collection,
  query,
  where,
  orderBy,
  Timestamp,
  onSnapshot,
  updateDoc
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
const db = getFirestore();
  const auth = getAuth();
const itemWidth = Dimensions.get("window").width / 5;
const screenWidth = Dimensions.get('window').width;

const getAddTaskWidth = () => {
  if (screenWidth === 414 ) return 270;
  if (screenWidth === 375) return 230;
  if (screenWidth === 430 || 428) return 270;
  return 410;  // default value
}

const SchedulePage = ({ route }) => {
  const [tasks, setTasks] = useState([]);
  const navigation = useNavigation();
  const [selectedDate, setSelectedDate] = useState(moment().format("YYYY-MM-DD"));
  const [daysAgo, setDaysAgo] = useState("Today");
  const [currentMonth, setCurrentMonth] = useState(moment().format("MMMM YYYY"));
  const flatListRef = useRef(null);
  const [initialScrollDone, setInitialScrollDone] = useState(false);


  useEffect(() => {
    
    if (!initialScrollDone) {
      flatListRef.current.scrollToIndex({
        index: selectedIndex,
        animated: true,
      });
      setInitialScrollDone(true);
    }
  }, []);

  useEffect(() => {
    if (route.params?.selectedTaskDate) {
      const dateString = moment(route.params.selectedTaskDate).format("YYYY-MM-DD");
      handleDatePress(dateString); // Scroll to the selected date
    }
  }, [route.params?.selectedTaskDate]);

  const { selectedTaskDate } = route.params || {};
  const [currentViewedDate, setCurrentViewedDate] = useState(selectedTaskDate || new Date());


  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);


  const selectedIndex = GenerateDates().findIndex(
    (item) => item && item.dateString === moment(currentViewedDate).format("YYYY-MM-DD")
  );


  useEffect(() => {
    flatListRef.current.scrollToIndex({
      index: selectedIndex,
      animated: false,
    });
  }, [currentViewedDate]);

  const handleTaskPress = (task) => {
    setSelectedTask(task);
    setModalVisible(true);
  };



  const handleDatePress = (dateString) => {
    setSelectedDate(dateString);
    setCurrentMonth(moment(dateString).format("MMMM YYYY"));

    const diff = moment(dateString).startOf('day').diff(moment().startOf('day'), "days");
    let title;
    if (diff === 0) {
      title = "Today";
    } else if (diff === -1) {
      title = "Yesterday";
    } else if (diff === 1) {
      title = "Tomorrow";
    } else if (diff < -1) {
      title = `${Math.abs(diff)} days ago`;
    } else {
      title = `In ${Math.abs(diff)} days`;
    }
    setDaysAgo(title);

    // Find the index of the selected date and scroll to it
    const selectedIndex = GenerateDates().findIndex(
      (item) => item.dateString === dateString
    );
    flatListRef.current.scrollToIndex({
      index: selectedIndex,
      animated: true,
    });
  };

  const splitText = (text, maxCharPerLine) => {
    if (!text) return [];

    const lines = [];
    let lineStart = 0;

    for (let i = 0; i < text.length; i++) {
      if (i - lineStart >= maxCharPerLine && text[i] === ' ') {
        lines.push(text.substring(lineStart, i));
        lineStart = i + 1;
      } else if (i === text.length - 1) {
        lines.push(text.substring(lineStart, i + 1));
      }
    }

    return lines;
  };

  const DateItem = React.memo(({ item, isSelected, handleDatePress }) => {
    return (

      <TouchableOpacity onPress={() => handleDatePress(item.dateString)} activeOpacity={0.5}>
        <View style={styles.dateItem}>
          <Text allowFontScaling={false} style={[styles.day, isSelected && styles.selectedText]}>{item.day}</Text>
          <Text allowFontScaling={false} style={[styles.dateNumber, isSelected && styles.selectedText]}>{item.date}</Text>
          {isSelected && <View style={styles.selectedIndicator} />}

        </View>
      </TouchableOpacity>
    );
  });

  const renderItem = ({ item }) => {
    if (item && item.dateString) {
      const isSelected = item.dateString === selectedDate;
      return <DateItem item={item} isSelected={isSelected} handleDatePress={handleDatePress} />;
    }
    return null; // or some default component
  };

  useEffect(() => {
    flatListRef.current.scrollToIndex({
      index: currentDateIndex,
      animated: false,
    });
  }, []);

  const fetchTasks = (date) => {
    try {
      const userId = auth.currentUser.uid;
      const selectedDate = moment(date).toDate();
      const startOfDay = new Date(selectedDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(selectedDate);
      endOfDay.setHours(23, 59, 59, 999);
      const selectedDayOfWeek = moment(date).isoWeekday();
  
      const q = query(
        collection(db, "users", userId, "tasks"),
        where("isCompleted", "==", false),
        orderBy("icon"),
        orderBy("date"),
        orderBy("time")
        // ... other conditions if needed
      );
  
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const fetchedTasks = querySnapshot.docs
          .map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
          .filter((task) => {
            const taskDate = task.date.toDate();
            return (
              (taskDate >= startOfDay && taskDate <= endOfDay && !task.repeat) ||
              (task.repeat && moment(taskDate).isoWeekday() === selectedDayOfWeek) &&
              task.icon !== null &&  // Moved these checks to the client side
              task.color !== null
            );
          });
  
        setTasks(fetchedTasks);
      });
  
      return () => {
        unsubscribe();  // Ensure we're calling it as a function
      };
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    // Call fetchTasks and store the unsubscribe function
    const unsubscribe = fetchTasks(selectedDate);

    // Clean up the listener when the component is unmounted or the selectedDate changes
    return () => {
      unsubscribe();
    };
  }, [selectedDate]);

  const TaskItem = React.memo(({ item }) => {
    const isLongSubjectTitle = item.subjectTitle.length < 9;
    const isLongSubjectTopic = !item.topic || item.topic.length < 18; // Check if the subject topic is shorter than 18 characters or null
    const isSubjectTopic = !item.topic || item.topic.length === 0;
    if (!item.icon || !item.color) {
      return null; // Don't render if there is no icon or color
    }
    return (
      <TouchableOpacity
        key={item.id}
        style={[styles.taskItem, { backgroundColor: item.color }]}
        activeOpacity={0.9}
        onPress={() => handleTaskPress(item)} // Add this line
      >
        <TouchableOpacity
          onPress={() => navigation.navigate("Edit Task Page", { task: item })}
        >
          <Image
            style={styles.editicon}
            source={require("../assets/AppIcons/edit.png")}
          />
        </TouchableOpacity>
        <Image
          source={{ uri: item.icon }}
          style={[
            styles.subjectIcon,
            isLongSubjectTitle && styles.subjectIconMarginLeft, // Apply the marginRight style conditionally
          ]}
          resizeMode="contain"
        />
        <View style={styles.taskitemtext}>
          <Text allowFontScaling={false} style={styles.taskSubject}>{item.subjectTitle}</Text>
          <Text allowFontScaling={false} style={styles.taskCategory}>{item.category}</Text>
          <View style={[styles.taskTopic, { flexShrink: 1 }, { width: 210 }]}>
            {item.topic && splitText(item.topic, 30).map((line, index) => (
              <Text allowFontScaling={false} key={index} style={styles.taskTopicLine}>
                {line}
              </Text>
            ))}
          </View>
          <Text allowFontScaling={false}
            style={[
              styles.taskTime,
              isLongSubjectTopic && styles.taskTimeMarginTop, // Apply the marginTop style conditionally
              isSubjectTopic && styles.taskTimeMarginTop2, // Apply the marginTop style conditionally
            ]}
          >
       {moment(item.time, "HH:mm").format("HH:mm A")}
          </Text>
        </View>
      </TouchableOpacity>
    );
  });

  const markTaskAsComplete = async () => {
    if (selectedTask) {
      try {
        const userId = auth.currentUser.uid;
        await updateDoc(doc(db, "users", userId, "tasks", selectedTask.id), {
          isCompleted: true,
          completedAt: Timestamp.now()
        });

        setModalVisible(false);
      } catch (error) {
        console.error(error);
      }
    }
  };


  useEffect(() => {
    if (route.params?.selectedTaskDate) {
      const dateString = moment(route.params.selectedTaskDate).format("YYYY-MM-DD");
      handleDatePress(dateString); // Scroll to the selected date
    }
  }, [route.params?.selectedTaskDate]);


  const MemoizedTaskItem = React.memo(TaskItem);
  const renderTaskItem = ({ item }) => <MemoizedTaskItem item={item} />;

  const currentDateIndex = GenerateDates().findIndex(
    (item) => item.dateString === selectedDate
  );
  const getItemLayout = (data, index) => ({
    length: itemWidth,
    offset: itemWidth * index,
    index,
  });

  const taskItemHeight = 180 + 25; // height of taskItem + marginBottom

  const getTaskItemLayout = (data, index) => ({
    length: taskItemHeight,
    offset: taskItemHeight * index,
    index,
  });


  const handleScrollEnd = (event) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / itemWidth);
    const newDate = GenerateDates()[index];
    if (newDate && newDate.dateString) {
      setSelectedDate(newDate.dateString); // Add this line to update the selectedDate
      // Instead of setting the selected date here, simply update the current month and day title.
      setCurrentMonth(moment(newDate.dateString).format("MMMM YYYY"));
      const diff = moment(newDate.dateString).startOf('day').diff(moment().startOf('day'), "days");
      let title;
      if (diff === 0) {
        title = "Today";
      } else if (diff === -1) {
        title = "Yesterday";
      } else if (diff === 1) {
        title = "Tomorrow";
      } else if (diff < -1) {
        title = `${Math.abs(diff)} days ago`;
      } else {
        title = `In ${Math.abs(diff)} days`;
      }
      setDaysAgo(title);
    }
  };
  return (
    <View style={styles.maincontainer}>
      <View style={styles.topbar}>
        <Text allowFontScaling={false} style={styles.date}>
          <CurrentDate />
        </Text>
        <Text allowFontScaling={false} style={styles.h1}>{daysAgo}</Text>
      </View>
      <Text allowFontScaling={false} style={styles.monthText}>{currentMonth}</Text>
      <FlatList
        style={styles.flatList}
        maxToRenderPerBatch={10} // Maximum number of items to render per batch
        extraData={selectedDate}
        ref={flatListRef}
        horizontal
        data={GenerateDates()}
        renderItem={renderItem}
        keyExtractor={(item) => item.dateString}
        snapToInterval={itemWidth}
        snapToAlignment="center"
        decelerationRate="fast"
        removeClippedSubviews
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.dateList}
        onMomentumScrollEnd={handleScrollEnd}
        getItemLayout={getItemLayout}
        initialScrollIndex={currentDateIndex}
        initialNumToRender={5}
        windowSize={3} // Add this prop to limit the number of items rendered off-screen
      />
      <TouchableOpacity
        activeOpacity={0.75}
        style={styles.task}
        onPress={() => navigation.navigate("Create Task")}
      >
        <Text allowFontScaling={false} style={styles.addtask}>+ Add Task</Text>


      </TouchableOpacity>
      <FlatList
        maxToRenderPerBatch={10} // Maximum number of items to render per batch
        style={styles.tasksview}
        data={tasks}
        renderItem={renderTaskItem}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <Text allowFontScaling={false} style={styles.noTasksText}>You have no tasks</Text>
        }
        snapToInterval={180 + 25} // height of taskItem + marginBottom
        snapToAlignment="start"
        decelerationRate="fast"
        showsVerticalScrollIndicator={false}
      />

      <Modal
        isVisible={modalVisible}
        onBackdropPress={() => setModalVisible(false)}
        animationIn="fadeIn"
        animationOut="fadeOut"

        useNativeDriver={true}
      >
        <View style={styles.modalWrapper}>
          <View style={styles.modalContainer}>
            <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)} activeOpacity={0.9}>
            </TouchableOpacity>
            <Text allowFontScaling={false} style={styles.modalTitle}>Would you like to mark this{"\n"} task as complete?</Text>
            <TouchableOpacity style={styles.modalButton} onPress={markTaskAsComplete} activeOpacity={0.9}>
              <Text allowFontScaling={false} style={styles.modalButtonText}>Complete Task</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
              activeOpacity={0.9}
            >
              <Image
                source={require('../assets/AppIcons/exiticon.png')}
                style={styles.closeImage}
              />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default SchedulePage;

const styles = StyleSheet.create({
  maincontainer: {
    backgroundColor: "white",
    flex: 1,
  },

  modalWrapper: {
    backgroundColor: 'white',
    borderRadius: 28,
    width: 330,
    height: 160,
    alignSelf: "center",
    borderColor: "#5AC0EB",
    borderWidth: 0.5,
  },

  closeButton: {
    position: 'absolute',
    top: -3,
    right: -10,
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
    marginTop: 35,
  },
  modalButton: {
    backgroundColor: "#5AC0EB",
    alignSelf: "center",
    borderRadius: 16,
    width: 200,
    height: 40,
    marginTop: 16
  },
  modalButtonText: {
    fontSize: 18,
    fontFamily: "GalanoGrotesque-Medium",
    textAlign: "center",
    marginTop: 11,
    color: "white",
  },
  tasksview: {
    marginLeft: 'auto', // Center the tasks list horizontally
    marginRight: 'auto',
    height: "54%",
    marginBottom: 88,
    marginTop: 2, // Add this line to set a fixed margin
  },

  topbar: {
    marginBottom: 200,
  },
  taskitemtext: {
    position: "absolute"
  },
  date: {
    fontSize: 20,
    fontFamily: "GalanoGrotesque-Medium",
    textAlign: "left",
    color: "#5AC0EB",
    marginLeft: 18,
    marginTop: 65,
    marginBottom: 80,
    position: "absolute",
  },

  monthText: {
    fontSize: 20,
    marginLeft: 18,
    fontFamily: "GalanoGrotesque-SemiBold",
    textAlign: "left",
    color: "#5AC0EB",
    marginTop: -55,
    marginBottom: -5,
  },


  h1: {
    fontSize: 35,
    fontFamily: "GalanoGrotesque-Bold",
    textAlign: "left",
    color: "#0089C2",
    marginLeft: 18,
    marginTop: 95,
    marginBottom: 80,
    position: "absolute",
  },
  addtask: {
    fontSize: 18,
    fontFamily: "GalanoGrotesque-Medium",
    textAlign: "center",
    color: "white",
    marginTop: 9,
  },
  task: {
    marginTop: 91,
    backgroundColor: "#5AC0EB",
    left: getAddTaskWidth(),
    width: 120,
    height: 35,
    borderRadius: 10,
    marginBottom: 200,
    borderRadius: 10,
    position: "absolute",
  },

  flatList: {
    marginTop: -0,
    marginBottom: -15,
  },
  dateList: {
    paddingHorizontal: Dimensions.get("window").width / 10,
    paddingTop: 20,
  },

  day: {
    fontSize: 16,
    fontFamily: "GalanoGrotesque-SemiBold",
    color: "#5AC0EB",
  },
  dateNumber: {
    fontSize: 24,
    fontFamily: "GalanoGrotesque-SemiBold",
    color: "#0089C2",
  },
  editicon: {
    height: 18,
    width: 18,
    marginLeft: 300,
    marginTop: 34,
    resizeMode: "contain",
    position: "absolute",
    padding: 10,
  },



  dateList: {
    paddingHorizontal: Dimensions.get("window").width / 2 - itemWidth / 2,
    paddingTop: 20,
  },

  dateItem: {
    width: Dimensions.get("window").width / 5,
    alignItems: "center",
    borderBottomWidth: 0,
  },

  selectedText: {
    color: "#5AC0EB",
  },

  selectedIndicator: {
    position: "absolute",
    bottom: -8,
    width: "60%",
    height: 2,
    backgroundColor: "#5AC0EB",
  },


  taskItem: {

    borderRadius: 35,
    alignSelf: "center",
    height: 180,
    width: 350,
    marginBottom: 25,
    paddingLeft: 10,
  },

  subjectIcon: {
    width: 80,
    height: 80,
    resizeMode: "contain",
    marginLeft: 220,
    marginTop: 52,
    position: "absolute",
  },

  taskSubject: {

    fontSize: 26,
    fontFamily: "GalanoGrotesque-Medium",
    color: "white",
    marginTop: 33,
    marginLeft: 25,
    marginBottom: 5,
  },
  taskCategory: {
    fontSize: 24,
    fontFamily: "GalanoGrotesque-Light",
    color: "white",
    marginLeft: 25,
    marginTop: -5,
  },
  taskTopic: {
    fontSize: 18,
    fontFamily: "GalanoGrotesque-Medium",
    color: "white",
    marginLeft: 25,
    marginBottom: 5,
    marginTop: 2,
    flexWrap: 'wrap', // Add this line to enable text wrapping
    width: '90%', // Add to set the width of the text container
  },

  taskTopicLine: {
    fontSize: 18,
    fontFamily: "GalanoGrotesque-Medium",
    color: "white",
    flexWrap: 'wrap',
    width: '70%',
  },

  taskTime: {
    fontSize: 35,
    fontFamily: "GalanoGrotesque-Medium",
    color: "white",
    marginTop: 8,
    marginLeft: 24,
  },

  taskTimeMarginTop: {
    marginTop: 10, // Or the desired amount you want to push the time down
  },

  taskTimeMarginTop2: {
    marginTop: 40, // Or the desired amount you want to push the time down
  },


  noTasksText: {
    fontSize: 24,
    fontFamily: "GalanoGrotesque-SemiBold",
    color: "#0089C2",
    textAlign: "center",
    marginTop: 200,
    alignSelf: "center",
  },

  subjectIconMarginLeft: {
    marginLeft: 210, // Or the desired amount you want to push the icon to the right
  },
});