import {
  StyleSheet,
  Text,
  View,
  Image,
  TextInput,
  ScrollView,
  Alert
} from "react-native";
import React from "react";
import { useState } from "react";
import { useEffect } from "react";
import { useNavigation } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import * as Font from "expo-font";
import { useFonts } from "expo-font";
import { color } from "react-native-reanimated";
import { TouchableOpacity } from "react-native";
import { KeyboardAvoidingView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Icon from "react-native-ionicons";
import CustomModal from "../Alerts/CustomAlert";
import CustomModalSmall from "../Alerts/CustomAlertSmall";
import CustomModalUpdate from "../Alerts/CustomAlertUpdate";
import CustomModalDelete from "../Alerts/CustomAlertDelete";
import { getAuth } from "firebase/auth";
import { getFirestore, doc, collection, getDocs, query, where, writeBatch } from "firebase/firestore";

const EditSubjectPage = ({ route }) => {
  const { subject } = route.params;


  const [name, setName] = useState([]);
  const auth = getAuth();
  if (!auth.currentUser) {
      console.error("No user is authenticated");
      return;
  }
  const userId = auth.currentUser.uid;
  const firestore = getFirestore();
  const db = getFirestore();

  const [modalVisibleSmall, setModalVisibleSmall] = useState(false);
  const [modalTitleSmall, setModalTitleSmall] = useState('');
  const [modalButtonTextSmall, setModalButtonTextSmall] = useState('');

  const [selectedColor, setSelectedColor] = useState(subject?.subjectcolor);
  const [selectedSubjectIcon, setSelectedSubjectIcon] = useState(subject?.icon);
  const [subjectTitle, setSubjectTitle] = useState("");
  const [subjectTeacher, setSubjectTeacher] = useState("");
  const [subjectCode, setSubjectCode] = useState("");

  const [isUpdateModalVisible, setUpdateModalVisible] = useState(false);
  const [updateAction, setUpdateAction] = useState(null);


  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalButtonText, setModalButtonText] = useState('');
  const [modalWidth, setModalWidth] = useState(320); // default width
  const [modalHeight, setModalHeight] = useState(150); // default height


  const handleModalButtonActionSmall = () => {
      setModalVisibleSmall(false);
  };

  const closeModal = () => {
      setUpdateModalVisible(false);
  };



  const handleModalButtonAction = () => {
      closeModal();
  };

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

  const updateSubject = async () => {
      if (subjectTitle.length > 13) {
          setModalTitle('Title should not be\n more than 13 characters.');
          setModalButtonText('OK');
          setModalVisible(true);
          return;
      }

      if (!selectedSubjectIcon) {
          setModalTitleSmall('Please select an icon');
          setModalButtonTextSmall('OK');
          setModalVisibleSmall(true);
          return;
      }

      if (!selectedColor) {
          setModalTitleSmall('Please select a color');
          setModalButtonTextSmall('OK');
          setModalVisibleSmall(true);
          return;
      }

      // Show the update modal
      setUpdateModalVisible(true);
  };

  const handleUpdate = async () => {
      // Check if the subject title already exists in the Firebase collection
     const userDocRef = doc(firestore, "users", currentUser.uid, "subjects", subject.id);
  const querySnapshot = await getDocs(query(collection(firestore, "users", currentUser.uid, "subjects"), where("title", "==", subjectTitle)));
  
  if (!querySnapshot.empty) {
      const existingSubject = querySnapshot.docs[0];
      if (existingSubject.id !== subject.id) {
          setUpdateModalVisible(false); // Hide the update modal
          setModalTitle('This subject title is already \nin use. Choose a different title.');
          setModalButtonText('OK');
          setModalVisible(true);
          return;
      }
  }

  const updatedData = {
      title: subjectTitle.trim() === "" ? subject?.title ?? "" : subjectTitle,
      teacher: subjectTeacher.trim() === "" ? subject?.teacher ?? "" : subjectTeacher,
      code: subjectCode.trim() === "" ? subject?.code ?? "" : subjectCode,
      icon: selectedSubjectIcon ?? subject?.icon,
      subjectcolor: selectedColor ?? subject?.subjectcolor,
      createdAt: serverTimestamp(),
  };

  await updateDoc(userDocRef, updatedData);
  setUpdateModalVisible(false); // Hide the update modal
  navigation.goBack(); // Navigate back to the dashboard
};

  const deleteSubject = () => {
      setDeleteAction(() => () => handleDeleteSubject());  // Store a function that calls handleDeleteSubject
      setDeleteModalVisible(true);  // Show the modal
  };

  const handleDeleteSubject = async () => {
    try {
        const userId = getAuth().currentUser.uid;// Ensure you've imported and initialized `getAuth`

        const userDocRef = doc(db, "users", userId);
        const tasksRef = collection(userDocRef, "tasks");
        const tasksSnapshot = await getDocs(query(tasksRef, where("subjectTitle", "==", subject.title)));

        const batch = writeBatch(db);

        tasksSnapshot.forEach((docSnapshot) => {
            batch.delete(docSnapshot.ref);
        });

        const subjectDocRef = doc(userDocRef, "subjects", subject.id);
        batch.delete(subjectDocRef);

        await batch.commit();
        navigation.goBack();
    } catch (error) {
        console.error("Error deleting subject:", error);
    }
};

  const Stack = createNativeStackNavigator();
  const navigation = useNavigation();

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

          <Text allowFontScaling={false} style={styles.header}>Edit {"\n"}{subject.title} Details</Text>

          <View style={[styles.textInputView]}>
          <TextInput
                  style={[styles.subjectinput, { marginTop: 8 }]}
                  placeholder={subject.title}
                  placeholderTextColor="#0089C2"
                  autoCorrect={true}
                  value={subjectTitle}
                  onChangeText={(subjectTitle) => setSubjectTitle(subjectTitle)}
                  autoCapitalize="characters"
                  onSubmitEditing={() => {
                      this.secondTextInput.focus();
                  }}
                  blurOnSubmit={false}
              />

<TextInput
                  style={[styles.subjectinput, {}]}
                  placeholder={subject.teacher === "" ? "Subject Teacher" : subject.teacher}
                  placeholderTextColor="#0089C2"
                  autoCorrect={false}
                  value={subjectTeacher}
                  onChangeText={(subjectTeacher) => setSubjectTeacher(subjectTeacher)}
                  autoCapitalize="characters"
                  ref={(input) => {
                      this.secondTextInput = input;
                  }}
                  onSubmitEditing={() => {
                      this.thirdTextInput.focus();
                  }}
                  blurOnSubmit={false}
              />

<TextInput
                  style={[styles.subjectinput, { marginBottom: 100 }]}
                  placeholder={subject.code === "" ? "Course Code" : subject.code}
                  placeholderTextColor="#0089C2"
                  autoCapitalize="characters"
                  autoCorrect={false}
                  value={subjectCode}
                  onChangeText={(subjectCode) => setSubjectCode(subjectCode)}
                  ref={(input) => {
                      this.thirdTextInput = input;
                  }}
              />

              <Image
                  style={styles.subjectInputIcon1}
                  source={require("../../assets/AppIcons/subjecticon.png")}
              />
              <Image
                  style={styles.subjectInputIcon2}
                  source={require("../../assets/AppIcons/teachericon.png")}
              />
              <Image
                  style={styles.subjectInputIcon3}
                  source={require("../../assets/AppIcons/courseicon.png")}
              />
          </View>

          <Text allowFontScaling={false} style={styles.header2}>Select subject icon:</Text>

          <ScrollView
              horizontal={true}
              showsHorizontalScrollIndicator={false}
              style={styles.subjectscrollview}
          ><TouchableOpacity
              activeOpacity={1}
              style={[
                  styles.subjectsContainer,
                  selectedSubjectIcon === "https://images2.imgbox.com/35/0d/RvL9ohiE_o.png" && [
                      { backgroundColor: "#0089C2", shadowColor: "#004D6D" },
                  ],
              ]}
              onPress={() => {
                  if (selectedSubjectIcon === "https://images2.imgbox.com/35/0d/RvL9ohiE_o.png") {
                      setSelectedSubjectIcon("");
                  } else {
                      setSelectedSubjectIcon("https://images2.imgbox.com/35/0d/RvL9ohiE_o.png");
                  }
              }}
          >
                  <Image
                      style={styles.subjectIcon}
                      source={{ uri: "https://images2.imgbox.com/35/0d/RvL9ohiE_o.png" }}
                  />
              </TouchableOpacity>
              {selectedSubjectIcon === "https://images2.imgbox.com/35/0d/RvL9ohiE_o.png" && (
                  <Ionicons
                      name="checkmark-circle"
                      size={38}
                      color="#5AC0EB"
                      style={[
                          { position: "absolute" },
                          { marginLeft: 1 },
                          { marginTop: -4.5 },
                      ]}
                  />
              )}

              <TouchableOpacity
                  activeOpacity={1}
                  style={[
                      styles.subjectsContainer,
                      selectedSubjectIcon === "https://images2.imgbox.com/8c/ab/kSK8ouDW_o.png" && [
                          { backgroundColor: "#0089C2", shadowColor: "#004D6D" },
                      ],
                  ]}
                  onPress={() => {
                      if (selectedSubjectIcon === "https://images2.imgbox.com/8c/ab/kSK8ouDW_o.png") {
                          setSelectedSubjectIcon("");
                      } else {
                          setSelectedSubjectIcon("https://images2.imgbox.com/8c/ab/kSK8ouDW_o.png");
                      }
                  }}
              >
                  <Image
                      style={styles.subjectIcon}
                      source={{ uri: "https://images2.imgbox.com/8c/ab/kSK8ouDW_o.png" }}
                  />
              </TouchableOpacity>
              {selectedSubjectIcon === "https://images2.imgbox.com/8c/ab/kSK8ouDW_o.png" && (
                  <Ionicons
                      name="checkmark-circle"
                      size={38}
                      color="#5AC0EB"
                      style={[
                          { position: "absolute" },
                          { marginLeft: 111 },
                          { marginTop: -4.5 },
                      ]}
                  />
              )}

              <TouchableOpacity
                  activeOpacity={1}
                  style={[
                      styles.subjectsContainer,
                      selectedSubjectIcon === "https://images2.imgbox.com/5c/71/gTPrTGO5_o.png" && [
                          { backgroundColor: "#0089C2", shadowColor: "#004D6D" },
                      ],
                  ]}
                  onPress={() => {
                      if (selectedSubjectIcon === "https://images2.imgbox.com/5c/71/gTPrTGO5_o.png") {
                          setSelectedSubjectIcon("");
                      } else {
                          setSelectedSubjectIcon("https://images2.imgbox.com/5c/71/gTPrTGO5_o.png");
                      }
                  }}
              >
                  <Image
                      style={styles.subjectIcon}
                      source={{ uri: "https://images2.imgbox.com/5c/71/gTPrTGO5_o.png" }}
                  />
              </TouchableOpacity>
              {selectedSubjectIcon === "https://images2.imgbox.com/5c/71/gTPrTGO5_o.png" && (
                  <Ionicons
                      name="checkmark-circle"
                      size={38}
                      color="#5AC0EB"
                      style={[
                          { position: "absolute" },
                          { marginLeft: 223 },
                          { marginTop: -4.5 },
                      ]}
                  />
              )}

              <TouchableOpacity
                  activeOpacity={1}
                  style={[
                      styles.subjectsContainer,
                      selectedSubjectIcon === "https://images2.imgbox.com/e6/f4/uWPR2SIR_o.png" && [
                          { backgroundColor: "#0089C2", shadowColor: "#004D6D" },
                      ],
                  ]}
                  onPress={() => {
                      if (selectedSubjectIcon === "https://images2.imgbox.com/e6/f4/uWPR2SIR_o.png") {
                          setSelectedSubjectIcon("");
                      } else {
                          setSelectedSubjectIcon("https://images2.imgbox.com/e6/f4/uWPR2SIR_o.png");
                      }
                  }}
              >
                  <Image
                      style={styles.subjectIcon}
                      source={{ uri: "https://images2.imgbox.com/e6/f4/uWPR2SIR_o.png" }}
                  />
              </TouchableOpacity>
              {selectedSubjectIcon === "https://images2.imgbox.com/e6/f4/uWPR2SIR_o.png" && (
                  <Ionicons
                      name="checkmark-circle"
                      size={38}
                      color="#5AC0EB"
                      style={[
                          { position: "absolute" },
                          { marginLeft: 335 },
                          { marginTop: -4.5 },
                      ]}
                  />
              )}
              <TouchableOpacity
                  activeOpacity={1}
                  style={[
                      styles.subjectsContainer,
                      selectedSubjectIcon === "https://images2.imgbox.com/e2/eb/PCluH6Dw_o.png" && [
                          { backgroundColor: "#0089C2", shadowColor: "#004D6D" },
                      ],
                  ]}
                  onPress={() => {
                      if (selectedSubjectIcon === "https://images2.imgbox.com/e2/eb/PCluH6Dw_o.png") {
                          setSelectedSubjectIcon("");
                      } else {
                          setSelectedSubjectIcon("https://images2.imgbox.com/e2/eb/PCluH6Dw_o.png");
                      }
                  }}
              >
                  <Image
                      style={styles.subjectIcon}
                      source={{ uri: "https://images2.imgbox.com/e2/eb/PCluH6Dw_o.png" }}
                  />
              </TouchableOpacity>
              {selectedSubjectIcon === "https://images2.imgbox.com/e2/eb/PCluH6Dw_o.png" && (
                  <Ionicons
                      name="checkmark-circle"
                      size={38}
                      color="#5AC0EB"
                      style={[
                          { position: "absolute" },
                          { marginLeft: 447 },
                          { marginTop: -4.5 },
                      ]}
                  />
              )}

              <TouchableOpacity
                  activeOpacity={1}
                  style={[
                      styles.subjectsContainer,
                      selectedSubjectIcon === "https://images2.imgbox.com/8e/26/5gZ9K6nM_o.png" && [
                          { backgroundColor: "#0089C2", shadowColor: "#004D6D" },
                      ],
                  ]}
                  onPress={() => {
                      if (selectedSubjectIcon === "https://images2.imgbox.com/8e/26/5gZ9K6nM_o.png") {
                          setSelectedSubjectIcon("");
                      } else {
                          setSelectedSubjectIcon("https://images2.imgbox.com/8e/26/5gZ9K6nM_o.png");
                      }
                  }}
              >
                  <Image
                      style={styles.subjectIcon}
                      source={{ uri: "https://images2.imgbox.com/8e/26/5gZ9K6nM_o.png" }}
                  />
              </TouchableOpacity>
              {selectedSubjectIcon === "https://images2.imgbox.com/8e/26/5gZ9K6nM_o.png" && (
                  <Ionicons
                      name="checkmark-circle"
                      size={38}
                      color="#5AC0EB"
                      style={[
                          { position: "absolute" },
                          { marginLeft: 559 },
                          { marginTop: -4.5 },
                      ]}
                  />
              )}

              <TouchableOpacity
                  activeOpacity={1}
                  style={[
                      styles.subjectsContainer,
                      selectedSubjectIcon === "https://images2.imgbox.com/bb/af/Uec9blwD_o.png" && [
                          { backgroundColor: "#0089C2", shadowColor: "#004D6D" },
                      ],
                  ]}
                  onPress={() => {
                      if (selectedSubjectIcon === "https://images2.imgbox.com/bb/af/Uec9blwD_o.png") {
                          setSelectedSubjectIcon("");
                      } else {
                          setSelectedSubjectIcon("https://images2.imgbox.com/bb/af/Uec9blwD_o.png");
                      }
                  }}
              >
                  <Image
                      style={styles.subjectIcon}
                      source={{ uri: "https://images2.imgbox.com/bb/af/Uec9blwD_o.png" }}
                  />
              </TouchableOpacity>
              {selectedSubjectIcon === "https://images2.imgbox.com/bb/af/Uec9blwD_o.png" && (
                  <Ionicons
                      name="checkmark-circle"
                      size={38}
                      color="#5AC0EB"
                      style={[
                          { position: "absolute" },
                          { marginLeft: 671 },
                          { marginTop: -4.5 },
                      ]}
                  />
              )}
              <TouchableOpacity
                  activeOpacity={1}
                  style={[
                      styles.subjectsContainer,
                      selectedSubjectIcon === "https://images2.imgbox.com/b3/76/kTfYttuu_o.png" && [
                          { backgroundColor: "#0089C2", shadowColor: "#004D6D" },
                      ],
                  ]}
                  onPress={() => {
                      if (selectedSubjectIcon === "https://images2.imgbox.com/b3/76/kTfYttuu_o.png") {
                          setSelectedSubjectIcon("");
                      } else {
                          setSelectedSubjectIcon("https://images2.imgbox.com/b3/76/kTfYttuu_o.png");
                      }
                  }}
              >
                  <Image
                      style={styles.subjectIcon}
                      source={{ uri: "https://images2.imgbox.com/b3/76/kTfYttuu_o.png" }}
                  />
              </TouchableOpacity>
              {selectedSubjectIcon === "https://images2.imgbox.com/b3/76/kTfYttuu_o.png" && (
                  <Ionicons
                      name="checkmark-circle"
                      size={38}
                      color="#5AC0EB"
                      style={[
                          { position: "absolute" },
                          { marginLeft: 783 },
                          { marginTop: -4.5 },
                      ]}
                  />
              )}

              <TouchableOpacity
                  activeOpacity={1}
                  style={[
                      styles.subjectsContainer,
                      selectedSubjectIcon === "https://images2.imgbox.com/72/06/0kTdYS6J_o.png" && [
                          { backgroundColor: "#0089C2", shadowColor: "#004D6D" },
                      ],
                  ]}
                  onPress={() => {
                      if (selectedSubjectIcon === "https://images2.imgbox.com/72/06/0kTdYS6J_o.png") {
                          setSelectedSubjectIcon("");
                      } else {
                          setSelectedSubjectIcon("https://images2.imgbox.com/72/06/0kTdYS6J_o.png");
                      }
                  }}
              >
                  <Image
                      style={styles.subjectIcon}
                      source={{ uri: "https://images2.imgbox.com/72/06/0kTdYS6J_o.png" }}
                  />
              </TouchableOpacity>
              {selectedSubjectIcon === "https://images2.imgbox.com/72/06/0kTdYS6J_o.png" && (
                  <Ionicons
                      name="checkmark-circle"
                      size={38}
                      color="#5AC0EB"
                      style={[
                          { position: "absolute" },
                          { marginLeft: 895 },
                          { marginTop: -4.5 },
                      ]}
                  />
              )}

              <TouchableOpacity
                  activeOpacity={1}
                  style={[
                      styles.subjectsContainer,
                      selectedSubjectIcon === "https://images2.imgbox.com/42/46/3tljlXPw_o.png" && [
                          { backgroundColor: "#0089C2", shadowColor: "#004D6D" },
                      ],
                  ]}
                  onPress={() => {
                      if (selectedSubjectIcon === "https://images2.imgbox.com/42/46/3tljlXPw_o.png") {
                          setSelectedSubjectIcon("");
                      } else {
                          setSelectedSubjectIcon("https://images2.imgbox.com/42/46/3tljlXPw_o.png");
                      }
                  }}
              >
                  <Image
                      style={styles.subjectIcon}
                      source={{ uri: "https://images2.imgbox.com/42/46/3tljlXPw_o.png" }}
                  />
              </TouchableOpacity>
              {selectedSubjectIcon === "https://images2.imgbox.com/42/46/3tljlXPw_o.png" && (
                  <Ionicons
                      name="checkmark-circle"
                      size={38}
                      color="#5AC0EB"
                      style={[
                          { position: "absolute" },
                          { marginLeft: 1007 },
                          { marginTop: -4.5 },
                      ]}
                  />
              )}

              <TouchableOpacity
                  activeOpacity={1}
                  style={[
                      styles.subjectsContainer,
                      selectedSubjectIcon === "https://images2.imgbox.com/d0/09/KAApd8uX_o.png" && [
                          { backgroundColor: "#0089C2", shadowColor: "#004D6D" },
                      ],
                  ]}
                  onPress={() => {
                      if (selectedSubjectIcon === "https://images2.imgbox.com/d0/09/KAApd8uX_o.png") {
                          setSelectedSubjectIcon("");
                      } else {
                          setSelectedSubjectIcon("https://images2.imgbox.com/d0/09/KAApd8uX_o.png");
                      }
                  }}
              >
                  <Image
                      style={styles.subjectIcon}
                      source={{ uri: "https://images2.imgbox.com/d0/09/KAApd8uX_o.png" }}
                  />
              </TouchableOpacity>
              {selectedSubjectIcon === "https://images2.imgbox.com/d0/09/KAApd8uX_o.png" && (
                  <Ionicons
                      name="checkmark-circle"
                      size={38}
                      color="#5AC0EB"
                      style={[
                          { position: "absolute" },
                          { marginLeft: 1119 },
                          { marginTop: -4.5 },
                      ]}
                  />
              )}

              <TouchableOpacity
                  activeOpacity={1}
                  style={[
                      styles.subjectsContainer,
                      selectedSubjectIcon === "https://images2.imgbox.com/32/39/sbf3t8Ik_o.png" && [
                          { backgroundColor: "#0089C2", shadowColor: "#004D6D" },
                      ],
                  ]}
                  onPress={() => {
                      if (selectedSubjectIcon === "https://images2.imgbox.com/32/39/sbf3t8Ik_o.png") {
                          setSelectedSubjectIcon("");
                      } else {
                          setSelectedSubjectIcon("https://images2.imgbox.com/32/39/sbf3t8Ik_o.png");
                      }
                  }}
              >
                  <Image
                      style={styles.subjectIcon}
                      source={{ uri: "https://images2.imgbox.com/32/39/sbf3t8Ik_o.png" }}
                  />
              </TouchableOpacity>
              {selectedSubjectIcon === "https://images2.imgbox.com/32/39/sbf3t8Ik_o.png" && (
                  <Ionicons
                      name="checkmark-circle"
                      size={38}
                      color="#5AC0EB"
                      style={[
                          { position: "absolute" },
                          { marginLeft: 1231 },
                          { marginTop: -4.5 },
                      ]}
                  />
              )}

              <TouchableOpacity
                  activeOpacity={1}
                  style={[
                      styles.subjectsContainer,
                      selectedSubjectIcon === "https://images2.imgbox.com/e5/1d/ePBtoaxa_o.png" && [
                          { backgroundColor: "#0089C2", shadowColor: "#004D6D" },
                      ],
                  ]}
                  onPress={() => {
                      if (selectedSubjectIcon === "https://images2.imgbox.com/e5/1d/ePBtoaxa_o.png") {
                          setSelectedSubjectIcon("");
                      } else {
                          setSelectedSubjectIcon("https://images2.imgbox.com/e5/1d/ePBtoaxa_o.png");
                      }
                  }}
              >
                  <Image
                      style={styles.subjectIcon}
                      source={{ uri: "https://images2.imgbox.com/e5/1d/ePBtoaxa_o.png" }}
                  />
              </TouchableOpacity>
              {selectedSubjectIcon === "https://images2.imgbox.com/e5/1d/ePBtoaxa_o.png" && (
                  <Ionicons
                      name="checkmark-circle"
                      size={38}
                      color="#5AC0EB"
                      style={[
                          { position: "absolute" },
                          { marginLeft: 1343 },
                          { marginTop: -4.5 },
                      ]}
                  />
              )}

          </ScrollView>

          <View style={styles.colorPalette}></View>

          <Text allowFontScaling={false} style={[styles.header3]}>Select subject color:</Text>

          <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>

              <TouchableOpacity
                  activeOpacity={0.8}
                  style={[
                      styles.colorContainer,
                      { backgroundColor: "#D50000" },
                      { shadowColor: "#7E0404" },
                      selectedColor === "#000000" && styles.selectedColor,
                  ]}
                  onPress={() => {
                      if (selectedColor === "#D50000") {
                          setSelectedColor(null);
                      } else {
                          setSelectedColor("#D50000");
                      }
                  }}
              >
                  {selectedColor === "#D50000" && (
                      <Ionicons name="checkmark-circle" size={30} color="#7E0404" />
                  )}
              </TouchableOpacity>

              <TouchableOpacity
                  activeOpacity={0.8}
                  style={[
                      styles.colorContainer,
                      { backgroundColor: "#7b1fa2" },
                      { shadowColor: "#4a148c" },
                  ]}
                  onPress={() => {
                      if (selectedColor === "#7b1fa2") {
                          setSelectedColor(null);
                      } else {
                          setSelectedColor("#7b1fa2");
                      }
                  }}
              >
                  {selectedColor === "#7b1fa2" && (
                      <Ionicons name="checkmark-circle" size={30} color="#4a148c" />
                  )}
              </TouchableOpacity>

              <TouchableOpacity
                  activeOpacity={0.8}
                  style={[
                      styles.colorContainer,
                      { backgroundColor: "#87ceeb" },
                      { shadowColor: "#4682b4" },
                  ]}
                  onPress={() => {
                      if (selectedColor === "#87ceeb") {
                          setSelectedColor(null);
                      } else {
                          setSelectedColor("#87ceeb");
                      }
                  }}
              >
                  {selectedColor === "#87ceeb" && (
                      <Ionicons name="checkmark-circle" size={30} color="#4682b4" />
                  )}
              </TouchableOpacity>

              <TouchableOpacity
                  activeOpacity={0.8}
                  style={[
                      styles.colorContainer,
                      { backgroundColor: "#2e8b57" },
                      { shadowColor: "#1f5637" },
                  ]}
                  onPress={() => {
                      if (selectedColor === "#2e8b57") {
                          setSelectedColor(null);
                      } else {
                          setSelectedColor("#2e8b57");
                      }
                  }}
              >
                  {selectedColor === "#2e8b57" && (
                      <Ionicons name="checkmark-circle" size={30} color="#1f5637" />
                  )}
              </TouchableOpacity>

              <TouchableOpacity
                  activeOpacity={0.8}
                  style={[
                      styles.colorContainer,
                      { backgroundColor: "#444444" },
                      { shadowColor: "#191919" },
                  ]}
                  onPress={() => {
                      if (selectedColor === "#444444") {
                          setSelectedColor(null);
                      } else {
                          setSelectedColor("#444444");
                      }
                  }}
              >
                  {selectedColor === "#444444" && (
                      <Ionicons name="checkmark-circle" size={30} color="#191919" />
                  )}
              </TouchableOpacity>

              <TouchableOpacity
                  activeOpacity={0.8}
                  style={[
                      styles.colorContainer,
                      { backgroundColor: "#ffa000" },
                      { shadowColor: "#e26200" },
                      selectedColor === "#0000" && styles.selectedColor,
                  ]}
                  onPress={() => {
                      if (selectedColor === "#ffa000") {
                          setSelectedColor(null);
                      } else {
                          setSelectedColor("#ffa000");
                      }
                  }}
              >
                  {selectedColor === "#ffa000" && (
                      <Ionicons name="checkmark-circle" size={30} color="#e26200" />
                  )}
              </TouchableOpacity>

              <TouchableOpacity
                  activeOpacity={0.8}
                  style={[
                      styles.colorContainer,
                      { backgroundColor: "#004eff" },
                      { shadowColor: "#002982" },
                      selectedColor === "#0000" && styles.selectedColor,
                  ]}
                  onPress={() => {
                      if (selectedColor === "#004eff") {
                          setSelectedColor(null);
                      } else {
                          setSelectedColor("#004eff");
                      }
                  }}
              >
                  {selectedColor === "#004eff" && (
                      <Ionicons name="checkmark-circle" size={30} color="#002982r" />
                  )}
              </TouchableOpacity>

              <TouchableOpacity
                  activeOpacity={0.8}
                  style={[
                      styles.colorContainer,
                      { backgroundColor: "#ffc0cb" },
                      { shadowColor: "#db7093" },
                      selectedColor === "#000000" && styles.selectedColor,
                  ]}
                  onPress={() => {
                      if (selectedColor === "#ffc0cb") {
                          setSelectedColor(null);
                      } else {
                          setSelectedColor("#ffc0cb");
                      }
                  }}
              >
                  {selectedColor === "#ffc0cb" && (
                      <Ionicons name="checkmark-circle" size={30} color="#db7093" />
                  )}
              </TouchableOpacity>

              <TouchableOpacity
                  activeOpacity={0.8}
                  style={[
                      styles.colorContainer,
                      { backgroundColor: "#c0c0c0" },
                      { shadowColor: "#708090" },
                      selectedColor === "#000000" && styles.selectedColor,
                  ]}
                  onPress={() => {
                      if (selectedColor === "#c0c0c0") {
                          setSelectedColor(null);
                      } else {
                          setSelectedColor("#c0c0c0");
                      }
                  }}
              >
                  {selectedColor === "#c0c0c0" && (
                      <Ionicons name="checkmark-circle" size={30} color="#708090" />
                  )}
              </TouchableOpacity>

              <TouchableOpacity
                  activeOpacity={0.8}
                  style={[
                      styles.colorContainer,
                      { backgroundColor: "#ee82ee" },
                      { shadowColor: "#800080" },
                      selectedColor === "#000000" && styles.selectedColor,
                  ]}
                  onPress={() => {
                      if (selectedColor === "#ee82ee") {
                          setSelectedColor(null);
                      } else {
                          setSelectedColor("#ee82ee");
                      }
                  }}
              >
                  {selectedColor === "#ee82ee" && (
                      <Ionicons name="checkmark-circle" size={30} color="#800080" />
                  )}
              </TouchableOpacity>
          </ScrollView>
          <View style={styles.buttonView}>
              <TouchableOpacity
                  activeOpacity={0.76}
                  onPress={deleteSubject}
              >
                  <Image
                      style={styles.createIcon}
                      source={require("../../assets/AppIcons/deleteicon.png")}
                  />
              </TouchableOpacity>

              <TouchableOpacity
                  activeOpacity={0.76}
                  onPress={updateSubject}
              >
                  <Image
                      style={styles.createIcon}
                      source={require("../../assets/AppIcons/checkicon.png")}
                  />
              </TouchableOpacity>



              <CustomModal
                  isVisible={modalVisible}
                  closeModal={closeModal}
                  title={modalTitle}
                  buttonText={modalButtonText}
                  buttonAction={handleModalButtonAction}
                  hasCloseButton={true}
                  width={modalWidth} // custom width
                  height={modalHeight} // custom height
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
                  title={`Are you sure you want to\n update ${subject.title}'s details?`}
                  buttonText={'Update'}
                  buttonText2={'Cancel'}
                  buttonAction={() => setUpdateModalVisible(false)} // closeModal action is assigned here
                  buttonAction2={handleUpdate} // delete action is assigned here
              />

              <CustomModalDelete
                  isVisible={isDeleteModalVisible}
                  closeModal={() => setDeleteModalVisible(false)}
                  title={`Are you sure you want\n to delete ${subject.title}?`}
                  buttonText={'Delete'}
                  buttonAction={deleteAction} // delete action is assigned here
                  buttonText2={'Cancel'}
                  buttonAction2={() => setDeleteModalVisible(false)} // closeModal action is assigned here
              />
          </View>

      </View>
  );
};

export default EditSubjectPage;

const styles = StyleSheet.create({
  container: {
      backgroundColor: "#FFFF",
      height: "100%",
  },

  buttonView: {
      flexDirection: "row",
      alignSelf: "center",
      marginBottom: 30,
  },

  subjectsContainer: {
      backgroundColor: "#5AC0EB",
      marginLeft: 6,
      marginRight: 6,
      height: 100,
      width: 100,
      borderRadius: 30,
      marginBottom: -10,
  },

  colorContainer: {
      marginLeft: 12,
      height: 70,
      width: 70,
      borderRadius: 50,
  },

  subjectcheck: {
      position: "absolute",
      marginTop: -2,
      marginLeft: 8,
  },

  subjectIcon: {
      width: 55,
      height: 55,
      alignSelf: "center",
      marginTop: 17.5,
      position: "relative",
  },

  topBar: {
      flexDirection: "row",
  },

  subjects: {
      backgroundColor: "#5AC0EB",
      height: 50,
      width: 115,
      marginLeft: 5,
      marginBottom: 5,
      borderRadius: 20,
      //shadowColor: "#0089C2",
      //shadowOffset: "5",
      //shadowOpacity: 2,
      //shadowRadius: 1,
      //shadowOffset: { width: 0, height: 3 },
  },
  subjects2: {
      backgroundColor: "#5AC0EB",
      marginTop: 5,
      height: 50,
      width: 145,
      marginLeft: 10,
      borderRadius: 20,
      //shadowColor: "#0089C2",
      //shadowOffset: "5",
      //shadowOpacity: 2,
      //shadowRadius: 1,
      //shadowOffset: { width: 0, height: 3 },
  },

  subjects3: {
      backgroundColor: "#5AC0EB",
      height: 50,
      width: 165,
      marginLeft: 5,
      marginBottom: 10,
      borderRadius: 20,
      //shadowColor: "#0089C2",
      //shadowOffset: "5",
      //shadowOpacity: 2,
      //shadowRadius: 1,
      //shadowOffset: { width: 0, height: 3 },
  },

  subjects4: {
      backgroundColor: "#5AC0EB",
      marginTop: 5,
      height: 50,
      width: 165,
      marginLeft: 5,
      marginBottom: 10,
      borderRadius: 20,
      //shadowColor: "#0089C2",
      //shadowOffset: "5",
      //shadowOpacity: 2,
      //shadowRadius: 1,
      //shadowOffset: { width: 0, height: 3 },
  },

  subjects5: {
      backgroundColor: "#5AC0EB",
      height: 50,
      width: 115,
      marginLeft: 5,
      marginBottom: 5,
      marginTop: 5,
      borderRadius: 20,
      //shadowColor: "#0089C2",
      //shadowOffset: "5",
      //shadowOpacity: 2,
      //shadowRadius: 1,
      //shadowOffset: { width: 0, height: 3 },
  },
  subjecttext: {
      textAlign: "center",
      marginTop: 16,
      color: "white",
      fontSize: 18,
      fontFamily: "GalanoGrotesque-Medium",
  },

  subjecttext2: {
      marginLeft: 11,
  },

  subjecttext3: {
      marginLeft: 20,
  },

  subjectbutton: {
      flexDirection: "row",
  },
  subjectbutton2: {
      flexDirection: "row",
  },

  subjectbutton1: {
      flexDirection: "row",
      marginLeft: 5,
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
  helloText: {
      fontSize: 22,
      fontFamily: "GalanoGrotesque-SemiBold",
      textAlign: "left",
      color: "#5AC0EB",
      marginLeft: 18,
  },

  header: {
      fontSize: 32,
      fontFamily: "GalanoGrotesque-Bold",
      textAlign: "left",
      color: "#5AC0EB",
      marginLeft: 18,
      marginBottom: 10,
  },

  colorPalette: {
    marginTop: "-10%",
  },

  header2: {
      fontSize: 19,
      fontFamily: "GalanoGrotesque-Medium",
      color: "#0089C2",
      marginLeft: 18,
      marginBottom: 15,
      marginTop: -80,
      height: 20,
      //textDecorationLine: "underline",
  },

  header3: {
      fontSize: 19,
      fontFamily: "GalanoGrotesque-Medium",
      color: "#0089C2",
      height: 20,
      // textDecorationLine: "underline",
      marginLeft: 18,
      marginBottom: 15,
  },

  subjectinput: {
      fontFamily: "GalanoGrotesque-Medium",
      fontSize: 18,
      paddingLeft: 60,
      borderBottomColor: "#5AC0EB",
      borderColor: "#0089C2",
      borderWidth: 1.8,
      width:"91%",
      padding: 10,
      height: 62,
      marginLeft: 18,
      borderRadius: 20,
      marginTop: 14,
  },

  subjectInputIcon1: {
      position: "absolute",
      height: 25,
      width: 25,
      resizeMode: "contain",
      marginTop: 26,
      marginLeft: 44,
  },
  subjectInputIcon2: {
      position: "absolute",
      height: 22,
      width: 22,
      resizeMode: "contain",
      marginTop: 103,
      marginLeft: 44,
  },
  subjectInputIcon3: {
      position: "absolute",
      height: 29,
      width: 29,
      resizeMode: "contain",
      marginTop: 175,
      marginLeft: 39,
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

  selectedColor: {
      backgroundColor: "rgba(0, 0, 0, 0.3)",
  },

  selectedSubjectContainer: {
      backgroundColor: "#00000", // Change this to your desired dark blue color
  },

  createIcon: {
      width: 85,
      height: 85,
      alignSelf: "center",
      marginBottom: 35,
      marginHorizontal: 15,
  },

  subjectIcon: {
      width: 70,
      height: 70,
      alignSelf: "center",
      marginTop: 14,
  },

  createSubjectButton: {
      backgroundColor: "#5AC0EB",
      alignItems: "center",
      alignSelf: "center",
      height: 44,
      width: 160,
      marginTop: -70,
      marginBottom: 60,
      borderRadius: 40,
      shadowColor: "#0089C2",
      shadowOffset: "5",
      shadowOpacity: 1,
      shadowRadius: 1,
      shadowOffset: { width: 0, height: 3 },
  },
  createSubjectText: {
      fontSize: 18,
      fontFamily: "GalanoGrotesque-Medium",
      color: "white",
      marginTop: 14,
  },
});
