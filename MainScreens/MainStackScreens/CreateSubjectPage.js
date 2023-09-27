import {
  StyleSheet,
  Text,
  View,
  Image,
  TextInput,
  ScrollView,
} from "react-native";
import React from "react";
import { useState } from "react";
import { useEffect } from "react";
import { useNavigation } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { color } from "react-native-reanimated";
import { TouchableOpacity } from "react-native";
import { KeyboardAvoidingView } from "react-native";
import Icon from "react-native-ionicons";
import { Ionicons } from "@expo/vector-icons";  
import { Alert } from "react-native";
import CustomModal from "../Alerts/CustomAlert";
import CustomModalSmall from "../Alerts/CustomAlertSmall";
import CustomModalUpdate from "../Alerts/CustomAlertUpdate";
import { getAuth } from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  onSnapshot, 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  serverTimestamp 
} from 'firebase/firestore';

const CreateSubjectPage = () => {
  const auth = getAuth();
const firestore = getFirestore();
  const [name, setName] = useState([]);
  useEffect(() => {
    const currentUser = auth.currentUser;
    if (!currentUser) return; // If no user is signed in, just return
    
    const userDocRef = doc(firestore, "users", currentUser.uid);
    const unsubscribe = onSnapshot(userDocRef, (snapshot) => {
      if (snapshot.exists()) {
        setName(snapshot.data());
      } else {
        console.log("User does not exist");
      }
    });
  
    return () => unsubscribe(); // Unsubscribe on cleanup
  }, []);

  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSubjectIcon, setSelectedSubjectIcon] = React.useState(null);
  const [subjectTitle, setSubjectTitle] = useState("");
  const [subjectTeacher, setSubjectTeacher] = useState("");
  const [subjectCode, setSubjectCode] = useState("");

  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalButtonText, setModalButtonText] = useState('');
  const [modalWidth, setModalWidth] = useState(320); // default width
  const [modalHeight, setModalHeight] = useState(150); // default height


  const [modalVisibleSmall, setModalVisibleSmall] = useState(false);
  const [modalTitleSmall, setModalTitleSmall] = useState('');
  const [modalButtonTextSmall, setModalButtonTextSmall] = useState('');
  

  const handleModalButtonActionSmall = () => {
    setModalVisibleSmall(false);
  };
  
  
  const closeModal = () => {
    setModalVisible(false);
  };
  
  const handleModalButtonAction = () => {
    closeModal();
  };


  const handleColorPress = (color) => {
    setSelectedColor(color);
  };

  const handleSaveSubject = async (
    subjectTitle,
    subjectTeacher,
    subjectCode,
    selectedSubjectIcon,
    selectedColor
  ) => {
    if (subjectTitle.length > 13) {
      setModalTitle('Title should not be\n more than 13 characters.');
      setModalButtonText('OK');
      setModalWidth(320);  // reset to default
      setModalHeight(150); // reset to default
      setModalVisible(true);
      return;
    }

    if (!subjectTitle) {
      setModalTitleSmall('Please enter a title');
      setModalButtonTextSmall('OK');
      setModalVisibleSmall(true);
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

if (!subjectTitle || !selectedSubjectIcon || !selectedColor) {
  setModalTitle('Please fill all required fields.');
  setModalButtonText('OK');
  setModalVisible(true);
  return;
}
  
    // Check if the subject title already exists in the Firebase collection
    const subjectRef = collection(firestore, "users", auth.currentUser.uid, "subjects");
  
    const querySnapshot = await getDocs(query(subjectRef, where("title", "==", subjectTitle)));
    
    if (querySnapshot.size > 0) {
      setModalTitle('This subject title is\n already in use.');
      setModalButtonText('OK');
      setModalWidth(320);  // reset to default
      setModalHeight(150); // reset to default
      setModalVisible(true);
      return;
    }
  
    addDoc(subjectRef, {
      title: subjectTitle,
      teacher: subjectTeacher,
      code: subjectCode,
      icon: selectedSubjectIcon,
      subjectcolor: selectedColor,
      createdAt: serverTimestamp(),
    })
    .then(() => {
      console.log("Subject added successfully!");
    })
    .catch((error) => {
      console.error("Error adding subject: ", error);
    });
  
    navigation.goBack();
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

      <Text allowFontScaling={false} style={styles.header}>Create {"\n"}New subject</Text>

      <View style={[styles.textInputView]}>
        <TextInput
          style={[styles.subjectinput, { marginTop: 8 }]}
          placeholder="Subject Title"
          placeholderTextColor="#0089C2"
          autoCorrect={true}
          value={subjectTitle}
          onChangeText={(subjectTitle) => setSubjectTitle(subjectTitle)}
          onSubmitEditing={() => {
            this.secondTextInput.focus();
          }}
          blurOnSubmit={false}
        />

        <TextInput
          style={[styles.subjectinput, {}]}
          placeholder="Teacher (optional)"
          placeholderTextColor="#0089C2"
          autoCorrect={false}
          value={subjectTeacher}
          onChangeText={(subjectTeacher) => setSubjectTeacher(subjectTeacher)}
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
          placeholder="Course Code (optional)"
          placeholderTextColor="#0089C2"
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
            source={{uri:"https://images2.imgbox.com/35/0d/RvL9ohiE_o.png"}}
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
            source={{uri:"https://images2.imgbox.com/8c/ab/kSK8ouDW_o.png"}}
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
            source={{uri:"https://images2.imgbox.com/5c/71/gTPrTGO5_o.png"}}
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
            source={{uri:"https://images2.imgbox.com/e6/f4/uWPR2SIR_o.png"}}
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
            source={{uri:"https://images2.imgbox.com/e2/eb/PCluH6Dw_o.png"}}
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
            source={{uri:"https://images2.imgbox.com/8e/26/5gZ9K6nM_o.png"}}
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
            source={{uri:"https://images2.imgbox.com/bb/af/Uec9blwD_o.png"}}
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
            source={{uri:"https://images2.imgbox.com/b3/76/kTfYttuu_o.png"}}
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
            source={{uri:"https://images2.imgbox.com/72/06/0kTdYS6J_o.png"}}
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
            source={{uri:"https://images2.imgbox.com/42/46/3tljlXPw_o.png"}}
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
            source={{uri:"https://images2.imgbox.com/d0/09/KAApd8uX_o.png"}}
          />
        </TouchableOpacity>
        {selectedSubjectIcon === "https://images2.imgbox.com/d0/09/KAApd8uX_o.png" && (
          <Ionicons
            name="checkmark-circle"
            size={38}
            color="#5AC0EB"
            style={[
              { position: "absolute" },
              { marginLeft: 1119},
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
            source={{uri:"https://images2.imgbox.com/32/39/sbf3t8Ik_o.png"}}
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
            source={{uri:"https://images2.imgbox.com/e5/1d/ePBtoaxa_o.png"}}
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
      { shadowColor: "#8b0000" },
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
      <Ionicons name="checkmark-circle" size={30} color="#8b0000" />
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
      { backgroundColor: "#ff8c00" },
      { shadowColor: "#A45A00" },
      selectedColor === "#0000" && styles.selectedColor,
    ]}
    onPress={() => {
      if (selectedColor === "#ff8c00") {
        setSelectedColor(null);
      } else {
        setSelectedColor("#ff8c00");
      }
    }}
  >
    {selectedColor === "#ff8c00" && (
      <Ionicons name="checkmark-circle" size={30} color="#A45A00" />
    )}
  </TouchableOpacity>

  <TouchableOpacity
    activeOpacity={0.8}
    style={[
      styles.colorContainer,
      { backgroundColor: "#cd853f" },
      { shadowColor: "#8b4513" },
      selectedColor === "#0000" && styles.selectedColor,
    ]}
    onPress={() => {
      if (selectedColor === "#cd853f") {
        setSelectedColor(null);
      } else {
        setSelectedColor("#cd853f");
      }
    }}
  >
    {selectedColor === "#cd853f" && (
      <Ionicons name="checkmark-circle" size={30} color="#8b4513" />
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

      <TouchableOpacity
        activeOpacity={0.76}
        onPress={() => {
          handleSaveSubject(
            subjectTitle,
            subjectTeacher,
            subjectCode,
            selectedSubjectIcon,
            selectedColor
          );
          
        }}
      >
        <Image
          style={styles.createIcon}
          source={require("../../assets/AppIcons/addicon.png")}
        />
      </TouchableOpacity>
    </View>
  );
};

export default CreateSubjectPage;

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFF",
    height: "100%",
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
 /* this works */ 
  colorContainer: {
    marginLeft: 6,
    marginRight: 6,
    height: 70,
    width: 70,
    borderRadius: 50,
  },

  subjectcheck: {
    position: "absolute",
    marginTop: -2,
    marginLeft: 8,
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
    shadowColor: "#0089C2",
    shadowOffset: "5",
    shadowOpacity: 1,
    shadowRadius: 1,
    shadowOffset: { width: 0, height: 3 },
  },
  subjects2: {
    backgroundColor: "#5AC0EB",
    marginTop: 5,
    height: 50,
    width: 145,
    marginLeft: 10,
    borderRadius: 20,
    shadowColor: "#0089C2",
    shadowOffset: "5",
    shadowOpacity: 1,
    shadowRadius: 1,
    shadowOffset: { width: 0, height: 3 },
  },

  subjects3: {
    backgroundColor: "#5AC0EB",
    height: 50,
    width: 165,
    marginLeft: 5,
    marginBottom: 10,
    borderRadius: 20,
    shadowColor: "#0089C2",
    shadowOffset: "5",
    shadowOpacity: 1,
    shadowRadius: 1,
    shadowOffset: { width: 0, height: 3 },
  },

  subjects4: {
    backgroundColor: "#5AC0EB",
    marginTop: 5,
    height: 50,
    width: 165,
    marginLeft: 5,
    marginBottom: 10,
    borderRadius: 20,
    shadowColor: "#0089C2",
    shadowOffset: "6",
    shadowOpacity: 1,
    shadowRadius: 1,
    shadowOffset: { width: 0, height: 3 },
  },

  subjects5: {
    backgroundColor: "#5AC0EB",
    height: 50,
    width: 115,
    marginLeft: 5,
    marginBottom: 5,
    marginTop: 5,
    borderRadius: 20,
    shadowColor: "#0089C2",
    shadowOffset: "5",
    shadowOpacity: 2,
    shadowRadius: 1,
    shadowOffset: { width: 0, height: 3 },
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
  colorPalette:{
    marginTop: "-6%"
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
    fontFamily: "GalanoGrotesque-Medium",
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
    //textDecorationLine: "underline",
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
    width: "91%",
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
    width: 90,
    height: 90,
    alignSelf: "center",
    marginBottom: "20%",
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
