import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { getAuth } from "@firebase/auth";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { Animated } from "react-native";
import { onSnapshot } from "firebase/firestore";
import { Image } from "react-native";
import { ImageBackground } from "react-native";
import { Modal, TouchableOpacity } from "react-native";
const StudyStatsPage = ({ goToPrevPage, isActive }) => {
  const [chartData, setChartData] = useState(null);
  const [maxStudyTime, setMaxStudyTime] = useState(0);
  const [segments, setSegments] = useState(1); // Default to 1
  const [isModalVisible, setModalVisible] = useState(false); // State to control modal visibility
  const [selectedSubject, setSelectedSubject] = useState(null); // State to store selected subject details
  const currentDate = new Date().toISOString().split("T")[0];
  const [showAllSubjects, setShowAllSubjects] = useState(false);

  useEffect(() => {
    const auth = getAuth();
    const userId = auth.currentUser.uid;
    const db = getFirestore();
    const subjectsRef = collection(db, "users", userId, "subjects");

    // Set up real-time listener
    const unsubscribe = onSnapshot(subjectsRef, async (querySnapshot) => {
      const subjectsData = [];

      for (const doc of querySnapshot.docs) {
        const subject = doc.data();

        const StudyTimeRef = collection(db, "users", userId, "subjects", doc.id, "StudyTime");
        const StudyTimeSnapshot = await getDocs(StudyTimeRef);

        let dailyHours = 0;
        let longestDuration = 0;
        let longestStudyTechnique = "";
        let lastStudiedAt = new Date();

        if (StudyTimeSnapshot.docs.length > 0) {
          const studyData = StudyTimeSnapshot.docs[0].data();

          dailyHours = studyData.Daily || 0;
          longestDuration = studyData.longestDuration || 0;
          longestStudyTechnique = studyData.longestStudyTechnique || "";
          lastStudiedAt = studyData.lastStudiedAt || new Date();
        }

        subjectsData.push({
          title: subject.title,
          color: subject.subjectcolor,
          icon: subject.icon,
          dailyHours: dailyHours,
          longestDuration: longestDuration,
          longestStudyTechnique: longestStudyTechnique,
          lastStudiedAt: lastStudiedAt,
        });
      }

      const maxTime = Math.max(...subjectsData.map(s => s.dailyHours));
      setMaxStudyTime(maxTime);
      setSegments(maxTime > 1 ? Math.ceil(maxTime) : 1);
      setChartData({
        subjects: subjectsData,
      });
    });

    // Clean up the listener when the component is unmounted
    return () => unsubscribe();
  }, []);


  const BarComponent = ({ percentage, label, subjectColor, hours, icon }) => {
    const ICON_WIDTH = 20; // Width of the icon
    const MIN_BAR_WIDTH = wp("0.1%");
    const animatedWidth = new Animated.Value(0);

    let displayHours;
    if (hours < 1 / 60) {
      displayHours = `${Math.round(hours * 3600)} secs`;
    } else if (hours < 1) {
      displayHours = `${Math.round(hours * 60)} mins`;
    } else {
      displayHours = `${Math.round(hours)} hrs`;
    }

    useEffect(() => {
      if (isActive) {
        Animated.timing(animatedWidth, {
          toValue: percentage,
          duration: 1000,
          useNativeDriver: false,
        }).start();
      }
    }, [isActive]);

    const barWidth = animatedWidth.interpolate({
      inputRange: [0, 1],
      outputRange: [MIN_BAR_WIDTH, wp("45%") * percentage],
      extrapolate: "clamp",
    });

    return (
      <TouchableOpacity
        onPress={() => {
          setSelectedSubject({ label, hours, icon });
          setModalVisible(true);
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 20 }}>
          <Text style={{ width: wp("30%"), fontSize: 18, color: "#0089C2", fontFamily: "GalanoGrotesque-SemiBold" }}>
            {label}
          </Text>
          <Animated.View
            style={{
              height: hp("4%"),
              width: barWidth,
              backgroundColor: "#5AC0EB",
              borderRadius: 5,
              marginRight: 10,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            {percentage >= ICON_WIDTH / wp("45%") && (
              <Image source={{ uri: icon }} style={{ width: ICON_WIDTH, height: ICON_WIDTH, marginLeft: 5 }} />
            )}
          </Animated.View>
          <Text
            style={{
              fontSize: 14,
              color: "#5AC0EB",
              marginLeft: 0,
              fontFamily: "GalanoGrotesque-Medium",
              marginTop: 2,
            }}
          >
            {displayHours}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const BarChartComponent = ({ data }) => {
    const subjectsToShow = showAllSubjects ? data.subjects.length : 4;

    return (
      <View style={{ paddingHorizontal: 20, marginTop: 30 }}>
        <View style={{ flexDirection: "row", alignItems: "flex-end" }}>
          <View
            style={{ width: 2, backgroundColor: "grey", marginRight: wp("0%") }}
          />
          <View style={{ flex: 1 }}>
            {data.subjects.slice(0, subjectsToShow).map((subjectData, index) => (
              <BarComponent
                key={subjectData.title}
                percentage={subjectData.dailyHours / segments}
                hours={subjectData.dailyHours}
                label={subjectData.title}
                subjectColor={subjectData.color}
                icon={subjectData.icon}
                longestDuration={subjectData.longestDuration}
                longestStudyTechnique={subjectData.longestStudyTechnique}
                lastStudiedAt={subjectData.lastStudiedAt}
              />
            ))}
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.maincontainer}>
      <Text style={styles.header}>Daily Study Stats</Text>

      {chartData && <BarChartComponent data={chartData} />}

      {!showAllSubjects ? (
        <TouchableOpacity
          onPress={() => setShowAllSubjects(true)}
          style={{ alignItems: "center", margin: 20, top: -hp("2%") }}
        >
          <Image
            source={require("../assets/AppIcons/down.png")}
            style={{ width: 20, height: 20, resizeMode: "contain" }}
          />
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          onPress={() => setShowAllSubjects(false)}
          style={{ alignItems: "center", margin: 20, top: -hp("2%") }}
        >
          <Image
            source={require("../assets/AppIcons/up.png")}
            style={{ width: 20, height: 20, resizeMode: "contain" }}
          />
        </TouchableOpacity>
      )}

      {selectedSubject && (
        <Modal
          animationType="fade"
          transparent={true}
          visible={isModalVisible}
        >
          {(() => {
            let displayHours;
            const hours = selectedSubject.hours;
            if (hours < 1 / 60) {
              displayHours = `${Math.round(hours * 3600)} sec`;
            } else if (hours < 1) {
              displayHours = `${Math.round(hours * 60)} mins`;
            } else {
              displayHours = `${Math.round(hours)} hrs`;
            }
            return (
              <View
                style={{
                  flex: 1,
                  top: "20%",
                  alignItems: "center",
                }}
              >
                <View
                  style={{
                    width: 330,
                    height: 180,
                    backgroundColor: "l;",
                    borderRadius: 10,
                  }}
                >
                  <TouchableOpacity
                    onPress={() => {
                      setModalVisible(false);
                      setShowAllSubjects(false);
                    }}
                  >
                    <Image
                      source={require("../assets/AppIcons/modalexit.png")}
                      style={{
                        width: 30,
                        height: 30,
                        margin: 10,
                        alignSelf: "flex-end",
                      }}
                      resizeMode="contain"
                    />
                  </TouchableOpacity>
                  <Text
                    style={{
                      top: -hp("2.5%"),
                      fontSize: 20,
                      marginBottom: 10,
                      marginLeft: wp("3%"),
                      color: "white",
                      fontFamily: "GalanoGrotesque-SemiBold",
                    }}
                  >
                    {selectedSubject.label}
                  </Text>
                  <Text
                    style={{
                      top: -hp("2%"),
                      fontSize: 18,
                      marginLeft: wp("4%"),
                      color: "white",
                      fontFamily: "GalanoGrotesque-Light",
                    }}
                  >
                    Total study time today: {displayHours}
                  </Text>
                  <Text
                    style={{
                      top: -hp("2%"),
                      fontSize: 18,
                      marginLeft: wp("4%"),
                      color: "white",
                      fontFamily: "GalanoGrotesque-Light",
                    }}
                  >
                    {"\n"}Most successful study{"\n"}technique: {selectedSubject.longestStudyTechnique}
                  </Text>
                  <Text
                    style={{
                      top: -hp("2%"),
                      fontSize: 18,
                      marginLeft: wp("4%"),
                      color: "white",
                      fontFamily: "GalanoGrotesque-Light",
                    }}
                  >
                    {"\n"}Last studied at: {selectedSubject.lastStudiedAt.toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </Text>
                  <Text
                    style={{
                      top: -hp("2%"),
                      fontSize: 18,
                      marginLeft: wp("4%"),
                      color: "white",
                      fontFamily: "GalanoGrotesque-Light",
                    }}
                  >
                    {"\n"}Best study time: {new Date(
                      selectedSubject.lastStudiedAt - selectedSubject.longestDuration * 3600 * 1000
                    ).toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </Text>
                  <Image
                    source={{ uri: selectedSubject.icon }}
                    style={{
                      width: 80,
                      height: 80,
                      marginBottom: 0,
                      alignSelf: "flex-end",
                      top: -hp("13%"),
                      marginRight: wp("8%"),
                    }}
                  />
                </View>
              </View>
            );
          })()}
        </Modal>
      )}
    </View>
  );
};
export default StudyStatsPage;

const styles = StyleSheet.create({
  header: {
    fontSize: 24,
    fontFamily: "GalanoGrotesque-Medium",
    textAlign: "left",
    color: "#5AC0EB",
    marginLeft: 18,
    marginTop: hp("8%"),
  },
  maincontainer: {
    backgroundColor: "white",
    height: "100%",
  },
});
