import {
  StyleSheet,
  Text,
  View,
  Image,
  TextInput,
  ScrollView,
  Keyboard,
  Platform,
  Modal,
  Button
} from "react-native";
import React from "react";
import { useState } from "react";
import { firebase } from "../../config";
import { useEffect } from "react";
import { TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import DropDownPicker from 'react-native-dropdown-picker';
import CurrentDate from "../MainAssetCode/CurrentDate";
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { Alert } from "react-native";
import CustomModal from "../Alerts/CustomAlert";
import CustomModalDelete from "../Alerts/CustomAlertDelete";
import CustomModalSmall from "../Alerts/CustomAlertSmall";
import CustomModalUpdate from "../Alerts/CustomAlertUpdate";
import { useCurrentTime } from "../MainAssetCode/CurrentTime";

const EditTaskPage = ({ navigation, route }) => {
  const { task } = route.params;
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);
  const [isTimePickerVisible, setTimePickerVisible] = useState(false);

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(null);
  const [Topic, setTopic] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubjectIcon, setSelectedSubjectIcon] = useState(null);
  const [selectedSubjectColor, setSelectedSubjectColor] = useState(null);


  const [modalVisibleSmall, setModalVisibleSmall] = useState(false);
  const [modalTitleSmall, setModalTitleSmall] = useState('');
  const [modalButtonTextSmall, setModalButtonTextSmall] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalButtonText, setModalButtonText] = useState('');
  const [modalWidth, setModalWidth] = useState(320); // default width
  const [modalHeight, setModalHeight] = useState(150); // default height

  const [isUpdateModalVisible, setUpdateModalVisible] = useState(false);

  const handleModalButtonActionSmall = () => {
    setModalVisibleSmall(false);
  };

  const closeModal = () => {
    setUpdateModalVisible(false);
  };  

  const handleModalButtonAction = () => {
    setModalVisible(false);
  };
  


  const [updateAction, setUpdateAction] = useState(null);


  const handleColorPress = (color) => {
      setSelectedColor(color);
  };


  
  const [alertVisible, setAlertVisible] = useState(false);
    const handleOk = () => {
      // Handle OK button press
      setAlertVisible(false);
    };
    const handleCancel = () => {
      // Handle Cancel button press
      setAlertVisible(false);
    };


  const [isDeleteModalVisible, setDeleteModalVisible] = useState(false);
    const [deleteAction, setDeleteAction] = useState(null);
    

  const handleSubjectChange = (subject) => {
    setSelectedSubject(subject.value);
  };

  const minDate = new Date();
  minDate.setFullYear(minDate.getFullYear() - 1); // one year ago

  const maxDate = new Date();
  maxDate.setFullYear(maxDate.getFullYear() + 1); // one year from now

  const formatDate = (date) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(date).toLocaleDateString('en-US', options);
  };

  const formatTime = (time) => {
    const options = { hour: '2-digit', minute: '2-digit' };
    return new Date(time).toLocaleTimeString('en-US', options);
  };

  const showTimePicker = () => {
    setTimePickerVisible(true);
  };

  const hideTimePicker = () => {
    setTimePickerVisible(false);
  };

  const subjectItems = subjects.map((subject) => ({
    label: subject.title,
    value: subject.title,
  }));

  const handleTimeChange = (time) => {
    // Save the time to Firebase and display it as the new due time
    setSelectedDate((prevDate) => {
      const newDate = new Date(prevDate);
      newDate.setHours(time.getHours());
      newDate.setMinutes(time.getMinutes());
      return newDate;
    });
    hideTimePicker();
  };

  const handleCategoryPress = (category) => {
    setSelectedCategory(category);
  };

  const showDatePicker = () => {
    setDatePickerVisible(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisible(false);
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
    // Save the date to Firebase and display it as the new due date
    hideDatePicker();
  };

  const deleteTask = (taskId) => {
    setDeleteModalVisible(true);
    setDeleteAction(() => async () => {
      try {
        console.log("Deleting task...");
        const userId = firebase.auth().currentUser.uid;
        await firebase.firestore()
          .collection('users')
          .doc(userId)
          .collection('tasks')
          .doc(taskId)
          .delete();
        console.log("Task deleted!");
  
        // Navigate back
        navigation.goBack();
  
      } catch (error) {
        console.error("Error deleting task: ", error);
      }
      setDeleteModalVisible(false);
    });
  };

  useEffect(() => {
    const userId = firebase.auth().currentUser.uid;
    const unsubscribe = firebase
      .firestore()
      .collection("users")
      .doc(userId)
      .collection("subjects")
      .orderBy("createdAt", "desc")
      .onSnapshot((querySnapshot) => {
        const subjects = [];
        querySnapshot.docChanges().forEach((change) => {
          if (change.type === "modified") {
            const subject = change.doc.data();
            updateTaskSubjectDetails(
              change.doc.id,
              subject.icon,
              subject.subjectcolor
            );
          }
        });
        querySnapshot.forEach((doc) => {
          const subject = doc.data();
          subject.id = doc.id;
          subjects.push(subject);
        });
        setSubjects(subjects);
        setSelectedSubject(task.subjectTitle); // Set the selected subject
        setSelectedCategory(task.category); // Set the selected category
        setTopic(task.topic); // Set the task topic
        setSelectedDate(task.date.toDate()); // Set the selected date
      });
    return unsubscribe;
  }, []);
  
  const updateTask = async (
    taskId,
    selectedSubject,
    selectedCategory,
    Topic,
    selectedDate,
    selectedTime
  ) => {
    // Add your new check here
    if (Topic && Topic.length > 30) {
      setModalTitle('Please enter a task topic with no more than 30 characters.');
      setModalButtonText('OK');
      setModalVisible(true);
      return;
      
  }

   
    const selectedSubjectData = subjects.find(
      (item) => item.title === selectedSubject
    );

    const selectedSubjectIcon = selectedSubjectData.icon;
    const selectedSubjectColor = selectedSubjectData.subjectcolor;
    const userId = firebase.auth().currentUser.uid;

    Alert.alert(
      "Update task",
      "Are you sure you want to update this task?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Update",
          onPress: async () => {
            await firebase
              .firestore()
              .collection("users")
              .doc(userId)
              .collection("tasks")
              .doc(taskId)
              .update({
                subjectId: selectedSubjectData.id,
                subjectTitle: selectedSubject,
                category: selectedCategory,
                topic: Topic,
                date: selectedDate,
                time: selectedTime,
                icon: selectedSubjectIcon,
                color: selectedSubjectColor,
                repeat: selectedCategory === "Lab" || selectedCategory === "Class",
              })
              .then(() => {
                console.log("Task updated successfully!");
              })
              .catch((error) => {
                console.error("Error updating task: ", error);
              });
            navigation.goBack();
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>




      <View styles={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Image
            style={styles.backButton}
            source={require("../../assets/AppIcons/backbutton.png")}
          />
        </TouchableOpacity>
      </View>

      <Text style={styles.header}>Edit {task.subjectTitle} {"\n"}Task Details</Text>
      <Text style={styles.header2}>Category</Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.horizontalScrollView}
      >


        <TouchableOpacity
          style={styles.task}
          activeOpacity={0.7}
          onPress={() => {
            if (selectedCategory === "Class") {
              setSelectedCategory("");
            } else {
              setSelectedCategory("Class");
            }
          }}
        >
          <Text style={styles.tasklabel}>Class</Text>
        </TouchableOpacity>
        {selectedCategory === "Class" && (
          <Ionicons name="checkmark-circle" size={25} color="#0089C2" style={[styles.buttonstyle, { marginLeft: 85, marginTop: -2, position: "absolute" }]} />
        )}


        <TouchableOpacity
          style={styles.task2}
          activeOpacity={0.7}
          onPress={() => {
            if (selectedCategory === "Exam") {
              setSelectedCategory("");
            } else {
              setSelectedCategory("Exam");
            }
          }}
        >
          <Text style={styles.tasklabel}>Exam</Text>
        </TouchableOpacity>

        {selectedCategory === "Exam" && (
          <Ionicons name="checkmark-circle" size={25} color="#0089C2" style={[styles.buttonstyle, { marginLeft: 202, marginTop: -2, position: "absolute" }]} />
        )}

        <TouchableOpacity
          style={styles.task3}
          activeOpacity={0.7}
          onPress={() => {
            if (selectedCategory === "Lab") {
              setSelectedCategory("");
            } else {
              setSelectedCategory("Lab");
            }
          }}
        >
          <Text style={styles.tasklabel}>Lab</Text>
        </TouchableOpacity>
        {selectedCategory === "Lab" && (
          <Ionicons name="checkmark-circle" size={25} color="#0089C2" style={[styles.buttonstyle, { marginLeft: 317, marginTop: -2, position: "absolute" }]} />
        )}

        <TouchableOpacity
          style={[styles.task3, { marginRight: 20 }]}
          activeOpacity={0.7}
          onPress={() => {
            if (selectedCategory === "Study") {
              setSelectedCategory("");
            } else {
              setSelectedCategory("Study");
            }
          }}
        >
          <Text style={styles.tasklabel}>Study</Text>
        </TouchableOpacity>
        {selectedCategory === "Study" && (
          <Ionicons name="checkmark-circle" size={25} color="#0089C2" style={[styles.buttonstyle, { marginLeft: 432, marginTop: -2, position: "absolute" }]} />
        )}

      </ScrollView>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.horizontalScrollView2}
      >


        <TouchableOpacity
          style={styles.task4}
          activeOpacity={0.7}
          onPress={() => {
            if (selectedCategory === "Assignment") {
              setSelectedCategory("");
            } else {
              setSelectedCategory("Assignment");
            }


          }}


        >

          <Text style={styles.tasklabel}>Assignment</Text>

        </TouchableOpacity>

        <TouchableOpacity
          style={styles.task5}
          activeOpacity={0.7}
          onPress={() => {
            if (selectedCategory === "Presentation") {
              setSelectedCategory("");
            } else {
              setSelectedCategory("Presentation");
            }
          }}
        >
          <Text style={styles.tasklabel}>Presentation</Text>
        </TouchableOpacity>
        {selectedCategory === "Presentation" && (
          <Ionicons name="checkmark-circle" size={25} color="#0089C2" style={[styles.buttonstyle, { marginLeft: 300, marginTop: -3, position: "absolute" }]} />
        )}

        {selectedCategory === "Assignment" && (
          <Ionicons name="checkmark-circle" size={25} color="#0089C2" style={[styles.buttonstyle, { marginLeft: 140, marginTop: -3, position: "absolute" }]} />
        )}
        <TouchableOpacity
          style={styles.task5}
          activeOpacity={0.7}
          onPress={() => {
            if (selectedCategory === "Reminder") {
              setSelectedCategory("");
            } else {
              setSelectedCategory("Reminder");
            }
          }}
        >
          <Text style={styles.tasklabel}>Reminder</Text>

        </TouchableOpacity>
        {selectedCategory === "Reminder" && (
          <Ionicons name="checkmark-circle" size={25} color="#0089C2" style={[styles.buttonstyle, { marginLeft: 462, marginTop: -3, position: "absolute" }]} />
        )}
      </ScrollView>

      <View style={styles.maincontainer}>

        <View style={[styles.textInputView]}>
          <View style={{ height: 50, width: 350 }}>

          </View>
          <View style={{ zIndex: 3, position: "absolute", marginTop: 18, marginLeft: 1 }}>
            <Image
              style={styles.subjectInputIcon1}
              source={require("../../assets/AppIcons/subjecticon.png")}
            />
          </View>
          <DropDownPicker
            items={subjectItems}

            open={open}
            dropDownContainerStyle={{
              opacity: 1,
              marginLeft: 18.5,
              marginTop: 50,
              width: 339,
              borderBottomColor: "#5AC0EB",
              borderColor: "#0089C2",
              borderWidth: 1.8,
              borderRadius: 0,
              zIndex: 10,
            }}
       
            selectedItemLabelStyle={{
              fontFamily: "GalanoGrotesque-SemiBold",
              fontSize: 18,
              color: "#5AC0EB",
            }}
            scrollViewProps={{
              decelerationRate: "fast",
            }}
            value={selectedSubject} // Use selectedSubject instead of value
            setOpen={setOpen}
            setValue={setSelectedSubject} // Use setSelectedSubject instead of setValue
            placeholder="Select a subject"
            containerStyle={{
              height: 62,
              zIndex: 2,
              width: 340,
              marginTop: -20,
              marginBottom: 35,
              position: "absolute",
            }}
            listItemLabelStyle={{
              fontFamily: "GalanoGrotesque-SemiBold",
              fontSize: 18,
              color: "#0089C2",
              marginLeft: 20,
            }}
            style={[styles.selectsubjectinput, styles.subjectinputmargin]}
            itemStyle={{
              justifyContent: "flex-start",
              paddingLeft: 10,
            }}
            dropDownStyle={{ backgroundColor: "#fafafa", zIndex: 2 }}

            onChangeItem={(subject) => handleSubjectChange(subject)}

            textStyle={{
              fontFamily: "GalanoGrotesque-SemiBold",
              fontSize: 18,
              color: "#0089C2",
            }}
            placeholderStyle={{
              fontFamily: "GalanoGrotesque-SemiBold",
              fontSize: 18,
              color: "#0089C2",
            }}
            tickIconStyle={{
              width: 20,
              height: 20,

            }}

            closeIconStyle={{
              width: 30,
              height: 30,
              backgroundColor: "#5AC0EB",
            }}
            iconContainerStyle={{
              marginRight: 10,
              backgroundColor: "#FF0000",

            }}

          />

          <View style={styles.adddelview}>
            <TouchableOpacity
              activeOpacity={0.76}
              onPress={() => {
                updateTask(
                  task.id,
                  selectedSubject,
                  selectedCategory,
                  Topic,
                  selectedDate,
                  formatTime(selectedDate),
                  selectedSubjectIcon,
                  selectedSubjectColor
                );
              }}
            >
              <Image
                style={styles.createIcon}
                source={require("../../assets/AppIcons/checkicon.png")}
              />
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.76}
              onPress={() => {
                deleteTask(task.id);
              }}
            >
              <Image
                style={styles.deleteIcon}
                source={require("../../assets/AppIcons/deleteicon.png")}
              />
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={[styles.calender]} activeOpacity={0.7} onPress={showDatePicker}>
            <Image
              style={styles.dateicon}
              source={require("../../assets/AppIcons/date.png")}
            />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.time]} activeOpacity={0.7} onPress={showTimePicker}>
            <Image
              style={styles.timericon}
              source={require("../../assets/AppIcons/time.png")}
            />
          </TouchableOpacity>


          <TextInput
            style={[
              styles.subjectinput,
              styles.subjectinputmargin,
              selectedCategory === "Reminder"
            ]}
            placeholder={
              selectedCategory === "Reminder"
                ? "Reminder details"
                : "Topic/note (optional)" // default placeholder text when the "Reminder" button is not pressed
            }
            placeholderTextColor="#0089C2"
            autoCorrect={false}
            value={Topic}
            onChangeText={(Topic) => setTopic(Topic)}
            autoCapitalize="characters"
            ref={(input) => {
              this.secondTextInput = input;
            }}
            onSubmitEditing={() => {
              Keyboard.dismiss();
            }}
            blurOnSubmit={false}
          />

          <DateTimePickerModal
            isVisible={isDatePickerVisible}
            mode="date"
            minimumDate={minDate}
            maximumDate={maxDate}
            locale="en_GB" // Use "en_GB" here
            date={new Date()}
            textColor="black"
            onConfirm={handleDateChange}
            onCancel={hideDatePicker}
          />

          <DateTimePickerModal
            isVisible={isTimePickerVisible}
            mode="time"
            locale="en_GB" // Use "en_GB" here
            textColor="black"
            date={new Date()} // Set the current time as the initial value
            onConfirm={handleTimeChange}
            onCancel={hideTimePicker}
          />

          <Image
            style={styles.subjectInputIcon2}
            source={require("../../assets/AppIcons/subjecttopic.png")}
          />

          <TouchableOpacity activeOpacity={0.7} onPress={showDatePicker}>
            <Text style={styles.currentDate}>
              {(selectedCategory === "Class" ? " Class Date" : selectedCategory === "Exam" ? " Exam Date" : selectedCategory === "Lab" ? " Lab Date" : selectedCategory === "Study" ? " Study Date" : selectedCategory === "Reminder" ? " Reminder Date" : " Due Date") + ": " + formatDate(selectedDate)}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity activeOpacity={0.7} onPress={showTimePicker}>
            <Text style={styles.currentTime}>
              {(selectedCategory === "Class" ? "Class Time" : selectedCategory === "Exam" ? "Exam Time" : selectedCategory === "Lab" ? "Lab Time" : selectedCategory === "Study" ? "Study Time" : selectedCategory === "Reminder" ? "Reminder Time" : "Due Time") + ": " + formatTime(selectedDate)}
            </Text>
          </TouchableOpacity>
        </View>

        <CustomModalDelete 
  isVisible={isDeleteModalVisible}
  closeModal={() => setDeleteModalVisible(false)}
  title={'Are you sure you want\n to delete this task?'}
  buttonText={'Delete'}
  buttonAction={deleteAction} // delete action is assigned here
  buttonText2={'Cancel'}
  buttonAction2={() => setDeleteModalVisible(false)} // closeModal action is assigned here
/>
       
<CustomModal
  isVisible={modalVisible}
  closeModal={handleModalButtonAction} // Call the function to close the modal
  title={modalTitle}
  buttonText={modalButtonText}
  buttonAction={handleModalButtonAction}
  hasCloseButton={true}
  width={modalWidth}
  height={modalHeight}
/>

<CustomModalSmall
        isVisibleSmall={modalVisibleSmall}
        closeModalSmall={handleModalButtonActionSmall}
        titleSmall={modalTitleSmall}
        buttonTextSmall={modalButtonTextSmall}
        buttonActionSmall={handleModalButtonActionSmall}
        hasCloseButtonSmall={true}
      />
      
      <CustomModalUpdate
                  isVisible={isUpdateModalVisible}
                  closeModal={closeModal}
                  title={`Are you sure you want to\n update this task?`}
                  buttonText={'Update'}
                  buttonText2={'Cancel'}
                  buttonAction={() => setUpdateModalVisible(false)} // closeModal action is assigned here
                  buttonAction2={updateTask} // delete action is assigned here
              />


      </View>

    </View>
  );
};

export default EditTaskPage;

const styles = StyleSheet.create({

  maincontainer: {
    marginBottom: 170,
  },
  adddelview: {
    flexDirection: "row",
    justifyContent: "center"
  },
  container: {
    backgroundColor: "#FFFF",
    height: "100%",
  },
  horizontalScrollView: {
    flexDirection: "row",
    marginLeft: 10,
    marginRight: 10,
  },
  horizontalScrollView2: {
    flexDirection: "row",
  },
  taskView: {
    flexDirection: "row",
  },
  taskView2: {
    flexDirection: "row",
  },
  task: {
    backgroundColor: "#5AC0EB",
    height: 44,
    width: 105,
    borderRadius: 15,
    marginRight: 10,
  },

  task2: {
    backgroundColor: "#5AC0EB",
    height: 44,
    width: 105,
    borderRadius: 15,
    marginRight: 10,
  },
  task3: {
    backgroundColor: "#5AC0EB",
    height: 44,
    width: 105,
    borderRadius: 15,
    marginRight: 10,
  },



  task4: {
    backgroundColor: "#5AC0EB",
    height: 44,
    width: 150,
    borderRadius: 15,
    marginRight: 10,
    marginLeft: 10
  },

  task5: {
    backgroundColor: "#5AC0EB",
    height: 44,
    width: 150,
    borderRadius: 15,
    marginRight: 10,
  },

  tasklabel: {
    fontFamily: "GalanoGrotesque-Medium",
    fontSize: 18,
    color: "white",
    marginTop: 14,
    alignSelf: "center",
  },

  currentDate: {
    fontFamily: "GalanoGrotesque-Medium",
    fontSize: 18,
    color: "#5AC0EB",
    left: 80,
    height: 19,
    marginTop: 54,
    textDecorationLine: "underline"
  },

  currentTime: {
    fontFamily: "GalanoGrotesque-Medium",
    fontSize: 18,
    left: 84,
    height: 19,
    color: "#5AC0EB",
    marginTop: 62,
    textDecorationLine: "underline"
  },

  timericon: {
    height: 25,
    width: 25,
    alignSelf: "center",
    marginTop: 12,
    resizeMode: "contain",
  },
  dateicon: {
    height: 25,
    width: 25,
    alignSelf: "center",
    marginTop: 12,
    resizeMode: "contain",
  },

  calender: {
    marginTop: 195,
    backgroundColor: "#5AC0EB",
    marginLeft: 20,
    height: 50,
    width: 50,
    borderRadius: 15,
    position: "absolute",
    //shadowColor: "#0089C2",
    //shadowOffset: "5",
    // shadowOpacity: 2,
    // shadowRadius: 1,
    //shadowOffset: { width: 0, height: 3 },
  },

  time: {
    marginTop: 275,
    backgroundColor: "#5AC0EB",
    marginLeft: 20,
    height: 50,
    width: 50,
    borderRadius: 15,
    position: "absolute",
    //shadowColor: "#0089C2",
    // shadowOffset: "5",
    // shadowOpacity: 2,
    // shadowRadius: 1,
    // shadowOffset: { width: 0, height: 3 },
  },

  topBarText: {
    flexDirection: "row",
    position: "absolute",
    marginTop: 42,
    marginLeft: 35,
    color: "#5AC0EB",
    fontSize: 18,
    fontFamily: "GalanoGrotesque-Medium",
  },

  backButton: {
    marginTop: 50,
    height: 25,
    marginLeft: 18,
    width: 25,
    resizeMode: "contain",
    marginBottom: 15,
  },

  header: {
    fontSize: 35,
    fontFamily: "GalanoGrotesque-Bold",
    textAlign: "left",
    color: "#5AC0EB",
    marginLeft: 18,
    marginBottom: 10,
  },

  header2: {
    fontSize: 22,
    fontFamily: "GalanoGrotesque-Bold",
    textAlign: "left",
    color: "#0089C2",
    marginLeft: 18,
    marginTop: 15,
    marginBottom: 20,
  },

  subjectinput: {
    fontFamily: "GalanoGrotesque-Medium",
    fontSize: 18,
    paddingLeft: 60,
    borderBottomColor: "#5AC0EB",
    borderColor: "#0089C2",
    borderWidth: 1.8,
    width: 340,
    padding: 10,
    height: 62,
    marginLeft: 18,
    borderRadius: 20,
    marginTop: 46,
  },

  selectsubjectinput: {
    fontFamily: "GalanoGrotesque-SemiBold",
    paddingLeft: 60,
    borderBottomColor: "#0089C2",
    borderColor: "#5AC0EB",
    borderWidth: 1.8,
    width: 340,
    padding: 10,
    height: 62,
    marginLeft: 18,
    borderRadius: 20,
    marginTop: 35,

  },

  subjectInputIcon1: {
    position: "absolute",
    height: 25,
    width: 25,
    resizeMode: "contain",
    marginTop: 15,
    marginLeft: 44,
  },
  subjectInputIcon2: {
    position: "absolute",
    height: 22,
    width: 25,
    marginTop: 115,
    marginLeft: 44,
    resizeMode: "contain",
  },

  addButton: {
    marginTop: 22,
    backgroundColor: "#01668B",
    alignItems: "center",
    alignSelf: "center",
    height: 44,
    width: 266,
    borderRadius: 40,
    shadowColor: "black",
    shadowOffset: { width: 1, height: 9 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },



  selectedSubjectContainer: {
    backgroundColor: "#00000", // Change this to your desired dark blue color
  },

  deleteIcon: {
    width: 80,
    height: 80,
    position: "absolute",
    marginTop: 300,
    alignSelf: "center",
    right: 15,
    resizeMode: "contain"

  },

  createIcon: {
    width: 80,
    height: 80,
    position: "absolute",
    marginTop: 300,
    left: 15,
    alignSelf: "center",
    resizeMode: "contain"
  },
});
