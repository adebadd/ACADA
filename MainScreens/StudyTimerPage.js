import React, { useState, useEffect, useRef } from "react";
import { StyleSheet, Text, View } from "react-native";
import { FlatList } from "react-native";
import { Dimensions } from "react-native";
import { Image } from "react-native";
import { TouchableOpacity } from "react-native";
import CustomModalBig from "./Alerts/CustomModalBig";
import { CountdownCircleTimer } from "react-native-countdown-circle-timer";
import {
  onSnapshot,
  addDoc,
  collection,
  orderBy,
  query,
  where,
  getFirestore,
  updateDoc,
  doc,
} from "firebase/firestore";
import { getDocs } from "firebase/firestore";
import { setDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import playIcon from "../assets/studytimericons/play.png";
import pauseIcon from "../assets/studytimericons/pause.png";
import stopIcon from "../assets/studytimericons/stop.png";
import CustomModalInfo from "./Alerts/CustomAlertInfo";
import PagerView from "react-native-pager-view";
import { getDoc } from "firebase/firestore";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { Pressable } from "react-native";
import leftArrowIcon from "../assets/AppIcons/prev.png"; // Replace with your asset path
import rightArrowIcon from "../assets/AppIcons/next.png"; // Replace with your asset path

const screenHeight = Dimensions.get("window").height;
const StudyTimerPage = ({ navigation, goToNextPage }) => {
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [open, setOpen] = useState(false);
  const flatListRef = useRef(null);
  const [playButtonSource, setPlayButtonSource] = useState(playIcon);
  const [remainingTime, setRemainingTime] = useState(50 * 60);
  const [longPressRemainingTime, setLongPressRemainingTime] = useState(null);
  const [timerKey, setTimerKey] = useState(0);
  const [longPressTimer, setLongPressTimer] = useState(null);
  const [timerStatus, setTimerStatus] = useState("Press Start");
  const [areComponentsVisible, setAreComponentsVisible] = useState(true);
  const [currentCycle, setCurrentCycle] = useState(1);
  const [isOnBreak, setIsOnBreak] = useState(false);
  const [isOnLongBreak, setIsOnLongBreak] = useState(false);
  const [isLongBreak, setIsLongBreak] = useState(false);
  const [gracePeriod, setGracePeriod] = useState(false);
  const screenWidth = Dimensions.get("window").width;
  const [showStudyTimerInfo, setShowStudyTimerInfo] = useState(true);
  const [currentSubjectIndex, setCurrentSubjectIndex] = useState(-1); // -1 indicates no subject selected
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showModalInfo, setShowModalInfo] = useState(false);
  const [showModalBig, setShowModalBig] = useState(false);


  const handleNextSubject = () => {
    if (currentSubjectIndex < subjects.length - 1) {
      setCurrentSubjectIndex(currentSubjectIndex + 1);
      setSelectedSubject(subjects[currentSubjectIndex + 1].title);
    } else {
      setCurrentSubjectIndex(0); // Reset to the first subject
      setSelectedSubject(subjects[0].title);
    }
  };

  const handlePrevSubject = () => {
    if (currentSubjectIndex > 0) {
      setCurrentSubjectIndex(currentSubjectIndex - 1);
      setSelectedSubject(subjects[currentSubjectIndex - 1].title);
    } else {
      setCurrentSubjectIndex(subjects.length - 1); // Set to the last subject
      setSelectedSubject(subjects[subjects.length - 1].title);
    }
  };

  const closeModalInfo = () => {
    setShowModalInfo(false);
  };

  const handleInfoPress = () => {
    setCurrentIndex(
      titles.findIndex((item) => item.title === studyStyle.title)
    );
    setShowModalInfo(true);
  };

  const nextInfo = () => {
    if (currentIndex < titles.length - 1) {
      setCurrentIndex((prevIndex) => prevIndex + 1);
    }
  };

  const prevInfo = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prevIndex) => prevIndex - 1);
    }
  };

  const [startTime, setStartTime] = useState(null);
  const getDescriptionForStudyStyle = (title) => {
    switch (title) {
      case "Pomodoro":
        return "This technique involves studying for 25 minutes, followed by a 5-minute break.\n\n After completing four Pomodoro cycles, take a longer break of around 15 minutes. \n\nThis method helps maintain focus and prevents burnout.";
      case "90-Minute":
        return "The 90-Minute technique advises continuous studying for 90 minutes. No interruptions or diversions are allowed.\n\n After the session, take a 30 minute break. This aligns with the natural rhythm of concentration, ensuring effective learning.";
      case "Animedoro":
        return "The Animedoro technique involves focused studying for 60 minutes. \n\nAfter this, reward yourself with a 25-minute anime episode or show.\n\n This method intertwines relaxation with study, making learning more enjoyable and effective.";
      case "Thirty-Five":
        return "The Thirty-Five technique promotes studying for 30 minutes, followed by a 5-minute break. Continue with another 30 minutes of study before taking a 10-minute break.\n\n This cycle offers a balanced approach, ensuring sustained attention throughout your study session.";
      case "Fifty-Two":
        return "This method involves 52 minutes of concentrated studying. After this, take a 17-minute break to relax and rejuvenate.\n\n Research supports this method, stating that it optimizes brain function and enhances productivity.";
      case "Pomodoro+":
        return "Pomodoro+ combines the original Pomodoro technique with longer intervals. Study for 50 minutes and then rest for 10 minutes. After two cycles, indulge in a 30-minute break.\n\n This method is designed for those who prefer extended study sessions.";
      default:
        return "";
    }
  };

  const renderMenuItem = ({ item, index }) => {
    const handleItemPress = item.key ? handleMenuItemPress : handlePress;

    return (
      <TouchableOpacity
        onPress={() => handleItemPress(index)}
        activeOpacity={0.5}
      >
        <View style={styles.titleItem}>
          <Text
            allowFontScaling={false}
            style={[styles.titleText, item.selected && styles.selectedText]}
          >
            {item.title}
          </Text>
          {item.selected && <View style={styles.selectedIndicator} />}
        </View>
      </TouchableOpacity>
    );
  };

  const handleMenuItemPress = (index) => {
    if (index === 0) {
      flatListRef.current.scrollTo({ x: 0, y: 0, animated: true });
    } else if (index === 1) {
      flatListRef.current.scrollTo({ x: screenWidth, y: 0, animated: true });
    }
    menuItems.forEach((item, idx) => {
      item.selected = idx === index;
    });
  };

  useEffect(() => {
    const auth = getAuth();
    const userId = auth.currentUser.uid;

    const db = getFirestore();

    const subjectsRef = collection(db, "users", userId, "subjects");
    const subjectsQuery = query(subjectsRef, orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(subjectsQuery, (querySnapshot) => {
      const subjects = querySnapshot.docs.map((doc) => {
        const subject = doc.data();
        subject.id = doc.id;
        return subject;
      });
      setSubjects(subjects);
    });

    return unsubscribe;
  }, []);

  const [studyStyle, setStudyStyle] = useState({
    title: "Pomodoro",
    studyMinutes: 25,
    breakMinutes: 10,
    longBreakMinutes: 15,
    cycles: 4,
  });
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlayButtonPress = () => {
    if (currentSubjectIndex === -1) {
      setShowModalBig(true); // Show the CustomModalBig if no subject is selected
      return;
    }
    if (!selectedSubject) {
      setShowModalBig(true); // Show the CustomModalBig
      return;
    }
    if (gracePeriod) return; // Prevent starting during grace period

    if (!isPlaying) {
      setStartTime(new Date().getTime());
      if (isOnLongBreak) {
        setTimerStatus("Long Break");
      } else {
        setTimerStatus(isOnBreak ? "Break" : "Focus");
      }
    } else {
      setTimerStatus("Paused");
    }

    setIsPlaying(!isPlaying);
    setPlayButtonSource(isPlaying ? playIcon : pauseIcon);
  };

  useEffect(() => {
    if (longPressRemainingTime !== null) {
      const timerId = setTimeout(() => {
        if (longPressRemainingTime !== null) {
          setIsPlaying(false);
          setRemainingTime(50 * 60);
          setPlayButtonSource(stopIcon);
        }
      }, 2000);
      return () => clearTimeout(timerId);
    }
  }, [longPressRemainingTime]);

  const handleSubjectChange = (subject) => {
    setSelectedSubject(subject.value);
  };
  const subjectItems = subjects.map((subject) => ({
    label: subject.title,
    value: subject.title,
  }));

  const handleComplete = () => {
    let studyDuration;
    if (isOnBreak) {
      if (currentCycle === 4) {
        studyDuration = studyStyle.longBreakMinutes * 60;
      } else {
        studyDuration = studyStyle.breakMinutes * 60;
      }
    } else {
      studyDuration = studyStyle.studyMinutes * 60;
    }

    // Save the study time to Firebase
    saveStudyTimeToFirebase(studyDuration);

    if (isOnBreak) {
      if (currentCycle === 4) {
        setIsOnLongBreak(true);
        setTimerStatus("Long Break");
        setRemainingTime(studyStyle.longBreakMinutes);
        setIsOnBreak(false);
        setCurrentCycle(1);
      } else {
        setCurrentCycle((prevCycle) => prevCycle + 1);
        setTimerStatus("Start Study");
        setRemainingTime(studyStyle.studyMinutes * 60);
        setIsOnBreak(false);
      }
    } else {
      if (currentCycle === 4) {
        setIsOnLongBreak(true);
        setTimerStatus("Start Long Break");
        setRemainingTime(studyStyle.longBreakMinutes * 60);
        setIsOnBreak(true);
      } else {
        setTimerStatus("Start Break");
        setRemainingTime(studyStyle.breakMinutes * 60);
        setIsOnBreak(true);
      }
    }
    setIsPlaying(false);
    setPlayButtonSource(isPlaying ? playIcon : pauseIcon);

    // Check if it's the last cycle and on long break
    if (currentCycle === 4 && isOnLongBreak) {
      setTimerStatus("Session Ended");
      setTimeout(() => {
        setTimerStatus("Press Start");
      }, 2000); // 2000 milliseconds = 2 seconds

      // Reset everything to default
      setRemainingTime(studyStyle.studyMinutes * 60);
      setCurrentCycle(1);
      setIsOnBreak(false);
      setIsOnLongBreak(false);
      setIsPlaying(false);
      setPlayButtonSource(playIcon);
      setAreComponentsVisible(true);
    }
  };

  const saveStudyTimeToFirebase = async (duration) => {
    const durationInMinutes = duration / 60; // Convert seconds to minutes
    const auth = getAuth();
    const userId = auth.currentUser.uid;
    const db = getFirestore();

    const subjectId = await getSubjectIdByTitle(selectedSubject); // Get the document ID of the subject
    if (subjectId) {
      const studyTimeRef = doc(
        db,
        "users",
        userId,
        "subjects",
        subjectId,
        "StudyTime",
        new Date().toDateString()
      ); // Use current date as the document ID
      const studyTimeDoc = await getDoc(studyTimeRef);

      let studyData = studyTimeDoc.data();

      const prevSessions = studyData ? (studyData.numberOfSessions || 0) : 0;

      let updateData = {};
      if (studyTimeDoc.exists()) {
        // Compare with the previous longest duration
        if (durationInMinutes > studyTimeDoc.data().longestDuration || !studyTimeDoc.data().longestDuration) {
          updateData = {
            Daily: studyTimeDoc.data().Daily + durationInMinutes,
            longestStudyTechnique: studyStyle.title,
            longestDuration: durationInMinutes,
          };
        } else {
          updateData = {
            Daily: durationInMinutes,
            longestStudyTechnique: studyStyle.title,
            longestDuration: durationInMinutes,
          };
        }
      } else {
        updateData = {
          Daily: durationInMinutes,
          longestStudyTechnique: studyStyle.title,
          longestDuration: durationInMinutes,
        };
      }

      await setDoc(studyTimeRef, updateData);
    } else {
      console.error("Failed to find the subject in Firebase");
    }
  };
  const [titles, setTitles] = useState([
    { title: "Pomodoro", selected: true },
    { title: "Animedoro", selected: false },
    { title: "Thirty-Five", selected: false },
    { title: "90-Minute", selected: false },
    { title: "Pomodoro+", selected: false },
    { title: "Fifty-Two", selected: false }, // Removed the right arrow from "Fifty-Two"'
    { title: "Customize", selected: false }, // Removed the right arrow from "Fifty-Two"
  ]);

  const handleScroll = (event) => {
    const scrollX = event.nativeEvent.contentOffset.x;
    const currentIndex = Math.round(scrollX / itemWidth);
    if (
      titles[currentIndex] &&
      titles[currentIndex].title !== studyStyle.title
    ) {
      handlePress(currentIndex); // This will change the selected study style
    }
  };

  const handlePress = (index) => {
    setTitles(titles.map((item, i) => ({ ...item, selected: i === index })));
    switch (titles[index].title) {
      case "Pomodoro":
        setStudyStyle({
          title: "Pomodoro",
          studyMinutes: 25,
          breakMinutes: 5,
          longBreakMinutes: 15, // Adjusted long break duration
          cycles: 4,
        });
        break;
      case "90-Minute":
        setStudyStyle({
          title: "90-Minute",
          studyMinutes: 90,
          breakMinutes: 20,
          longBreakMinutes: 30, // Adjusted long break duration
          cycles: 1, // Only one cycle for this method
        });
        break;
      case "Fifty-Two":
        setStudyStyle({
          title: "Fifty-Two",
          studyMinutes: 52,
          breakMinutes: 17,
          cycles: 1, // Only one cycle for this method
        });
        break;
      case "Thirty-Five":
        setStudyStyle({
          title: "Thirty-Five",
          studyMinutes: 30,
          breakMinutes: 5,
          longBreakMinutes: 10,
          cycles: 2, // Two cycles before long break
        });
        break;
      case "Pomodoro+":
        setStudyStyle({
          title: "Pomodoro+",
          studyMinutes: 50,
          breakMinutes: 10,
          longBreakMinutes: 30,
          cycles: 2, // Two cycles before long break
        });
        break;
      case "Animedoro":
        setStudyStyle({
          title: "Animedoro",
          studyMinutes: 60,
          breakMinutes: 20,
          longBreakMinutes: 30,
          cycles: 4,
        });
        break;
      // Add more cases for other study styles
      default:
        break;
    }
    if (flatListRef.current) {
      const desiredPosition =
        index * itemWidth - screenWidth / 2 + itemWidth / 2;
      flatListRef.current.scrollToOffset({
        offset: desiredPosition,
        animated: true,
      });
    }
  };

  const getSubjectIdByTitle = async (subjectTitle) => {
    const auth = getAuth();
    const userId = auth.currentUser.uid;
    const db = getFirestore();

    const subjectsRef = collection(db, "users", userId, "subjects");
    const subjectQuery = query(subjectsRef, where("title", "==", subjectTitle));
    const querySnapshot = await getDocs(subjectQuery);

    if (!querySnapshot.empty) {
      return querySnapshot.docs[0].id; // Return the document ID of the first match
    }
    return null; // Return null if no matching document is found
  };

  const handlePressIn = () => {
    if (!selectedSubject) {
      setShowModalBig(true); // Show the CustomModalBig
      return;
    }
    setAreComponentsVisible(false);

    // After 5 seconds, stop the timer and show the "Stopped" status and stop.png
    const timerId = setTimeout(() => {
      setPlayButtonSource(stopIcon);
      setTimerStatus("Stopped");
      setIsPlaying(false);
      setShowStudyTimerInfo(true); // Show the info when timer is stopped

      // Start the grace period
      setGracePeriod(true);

      setTimeout(() => {
        setPlayButtonSource(playIcon);
        const endTime = new Date().getTime();
        const studyDuration = (endTime - startTime) / 6000; // in seconds
        saveStudyTimeToFirebase(studyDuration);
        setTimerKey((prevKey) => prevKey + 1);
        setRemainingTime(studyStyle.studyMinutes * 60);
        setCurrentCycle(1);
        setIsOnBreak(false);
        setAreComponentsVisible(true);
        setTimerStatus("Press Start");
        setShowStudyTimerInfo(true); // Show the info when timer is stopped entirely
        setGracePeriod(false); // End the grace period
      }, 2000); // 2000 milliseconds = 2 seconds
    }, 5000); // 5000 milliseconds = 5 seconds

    setLongPressTimer(timerId);
  };

  const handlePressOut = () => {
    clearTimeout(longPressTimer);
  };

  const renderItem = ({ item, index }) => {
    return (
      <TouchableOpacity onPress={() => handlePress(index)} activeOpacity={0.5}>
        <View style={styles.titleItem}>
          <Text
            allowFontScaling={false}
            style={[styles.titleText, item.selected && styles.selectedText]}
          >
            {item.title}
          </Text>
          {item.selected && <View style={styles.selectedIndicator} />}
        </View>
      </TouchableOpacity>
    );
  };

  const itemWidth = Dimensions.get("window").width / 3; // changed from 5 to 3
  const visibleItemsCount = 3; // changed from 5 to 3
  return (

    <View style={styles.container}>


      {areComponentsVisible && (
        <FlatList
          ref={flatListRef}
          scrollEventThrottle={32}
          data={titles}
          pagingEnabled={true}
          renderItem={renderItem}
          keyExtractor={(item, index) => index.toString()}
          getItemLayout={(data, index) => ({
            length: itemWidth,
            offset: itemWidth * index,
            index,
          })}
          horizontal
          snapToInterval={itemWidth}
          snapToAlignment="center"
          style={styles.flatList}
          decelerationRate="normal"
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.titleList}
        />
      )}
      <View style={styles.playTouchable}>
        <TouchableOpacity
          onPress={handlePlayButtonPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          style={[gracePeriod ? { opacity: 0.5 } : { opacity: 1 }]} // Adjust opacity here
        >
          <Image source={playButtonSource} style={styles.playButton} />
        </TouchableOpacity>
      </View>

      {areComponentsVisible && !isOnLongBreak && (
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            marginTop: hp("14%"),
          }}
        >
          <TouchableOpacity onPress={handlePrevSubject}>
            <Image
              source={leftArrowIcon}
              style={{
                width: 15,
                height: 15,
                marginRight: wp("0%"),
                resizeMode: "contain",
              }}
            />
          </TouchableOpacity>
          <Text
            style={{
              fontSize: 20,
              color: "#0089C2",
              width: wp("70%"),
              textAlign: "center",
              fontFamily: "GalanoGrotesque-Light",
              fontSize: 23,
            }}
          >
            {currentSubjectIndex > -1
              ? subjects[currentSubjectIndex].title
              : "Select a Subject"}
          </Text>
          <TouchableOpacity onPress={handleNextSubject}>
            <Image
              source={rightArrowIcon}
              style={{
                width: 15,
                height: 15,
                marginLeft: -wp("2%"),
                resizeMode: "contain",
              }}
            />
          </TouchableOpacity>
        </View>
      )}
      <View style={styles.timerContainer}>
        <CountdownCircleTimer
          key={isOnBreak ? "breakTimer" + timerKey : "studyTimer" + timerKey}
          isPlaying={isPlaying}
          duration={
            isOnBreak
              ? currentCycle === 4
                ? studyStyle.longBreakMinutes * 60
                : studyStyle.breakMinutes * 60
              : studyStyle.studyMinutes * 60
          }
          colors={["#5AC0EB", "#2A99C8", "#0089C2", "#01668B"]}
          colorsTime={[300, 200, 100, 50]}
          size={320}
          strokeWidth={15}
          onComplete={handleComplete}
        >
          {({ remainingTime }) => {
            const minutes = Math.floor(remainingTime / 60);
            const seconds = remainingTime % 60;
            return (
              <Text
                allowFontScaling={false}
                style={styles.timerText}
              >{`${minutes}:${seconds < 10 ? "0" : ""}${seconds}`}</Text>
            );
          }}
        </CountdownCircleTimer>
        <View style={styles.titleContainer}>
          <Text allowFontScaling={false} style={styles.studyTimerTitle}>
            {studyStyle.title}
          </Text>
          <TouchableOpacity onPress={handleInfoPress}>
            <Image
              style={styles.infoButton}
              source={require("../assets/studytimericons/info.png")}
            />
          </TouchableOpacity>


        </View>


      </View>


      <Text allowFontScaling={false} style={styles.subjectTitle}>
        {timerStatus}
      </Text>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
          marginTop: 50,
          alignSelf: "center",
        }}
      >
        {Array.from({ length: studyStyle.cycles }).map((_, index) => (
          <View
            key={index}
            style={{
              marginTop: -hp("8%"),
              height: 10,
              width: 10,
              borderRadius: 5,
              backgroundColor: currentCycle > index + 1 ? "#5AC0EB" : "#D3D3D3",
              margin: 5,
            }}
          />
        ))}
      </View>

      {!isPlaying &&
        (timerStatus === "Paused" || timerStatus === "Press Start") && (
          <View style={styles.studyTimerInfoContainer}>
            <Image
              style={styles.infoButtonContainer}
              source={require("../assets/studytimericons/info.png")}
            />
            <Text allowFontScaling={false} style={[styles.studyTimerInfo]}>
              Hold the pause or play button for 5{"\n"} seconds to end study
              session.
            </Text>
          </View>
        )}
      <View>
        {areComponentsVisible && (
          <TouchableOpacity style={styles.inviteTouchable}>
            <Text style={styles.inviteTouchableText}>Invite friends</Text>
          </TouchableOpacity>
        )}
      </View>

      <CustomModalInfo
        isVisible={showModalInfo}
        closeModal={closeModalInfo}
        title={titles[currentIndex].title} // Ensure this is using currentIndex
        description={getDescriptionForStudyStyle(titles[currentIndex].title)} // Ensure this is using currentIndex
        nextHandler={nextInfo}
        prevHandler={prevInfo}
        currentIndex={currentIndex}
      />
      <CustomModalBig
        isVisibleBig={showModalBig}
        closeModalBig={() => setShowModalBig(false)}
        titleBig={`Please select a subject to\nbegin a study session`}
        buttonTextBig="Okay"
        buttonActionBig={() => setShowModalBig(false)}
      />
    </View>
  );
};

export default StudyTimerPage;

const styles = StyleSheet.create({
  selectsubjectinput: {
    fontFamily: "GalanoGrotesque-Light",
    borderBottomColor: "#0089C2",
    borderColor: "#5AC0EB",
    borderWidth: 1.8,
    width: wp("95%"),
    height: 30,
    alignSelf: "center",
    borderRadius: 10,
    marginTop: hp("12.8%"),
    marginBottom: hp("21%"),
  },
  container: {
    backgroundColor: "white",
    height: hp("100%"),
  },
  maincontainer: {
    backgroundColor: "white",
    flex: 1,
  },
  flatList: {
    marginTop: hp("6%"),
    position: "absolute",
    height: hp("6%"),
    zIndex: 10,
  },
  titleList: {
    paddingTop: 20,
  },
  playTouchable: {
    position: "absolute",
    top: hp(54),
    zIndex: 20,
    alignSelf: "center",
  },
  playButton: {
    height: hp(5),
    width: hp(5),
    zIndex: 20,
    resizeMode: "contain",
  },
  titleItem: {
    width: wp("33.33%"),
    alignItems: "center",
    borderBottomWidth: 0,
  },
  titleContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: -hp("44.2%"),
  },
  titleText: {
    fontSize: hp("2%"),
    fontFamily: "GalanoGrotesque-Medium",
    color: "#0089C2",
  },
  selectedText: {
    color: "#5AC0EB",
  },
  selectedIndicator: {
    position: "absolute",
    marginTop: 25,
    width: wp("26%"),
    height: 2,
    backgroundColor: "#5AC0EB",
  },
  timerContainer: {
    justifyContent: "center",
    alignItems: "center",
    justifyContent: "center",
    marginTop: hp("14%"),

  },
  timerText: {
    fontSize: hp("7.2%"),
    fontFamily: "GalanoGrotesque-Medium",
    color: "#5AC0EB",
    marginTop: -hp("12%"),
  },
  studyTimerTitle: {
    fontSize: hp("3%"),
    fontFamily: "GalanoGrotesque-Light",
    color: "#5AC0EB",
    marginTop: hp("23.5%"),
    alignSelf: "center",
  },
  subjectTitle: {
    fontSize: hp("2.4%"),
    fontFamily: "GalanoGrotesque-Medium",
    color: "#5AC0EB",
    marginTop: hp("0%"),
    alignSelf: "center",
  },
  infoButton: {
    height: 18,
    width: 18,
    marginLeft: 5,
    marginTop: hp("23.8%"),
    resizeMode: "contain",
  },

  infoButtonContainer: {
    height: 18,
    width: 18,
    top: hp("16%"),
    position: "absolute",
    alignSelf: "center",
    left: -wp("5%"),
  },
  studyTimerInfoContainer: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "center",
  },

  studyTimerInfo: {
    marginTop: hp("16%"),
    fontSize: hp("2%"),
    fontFamily: "GalanoGrotesque-Light",
    color: "#5AC0EB",
    alignSelf: "center",
    textAlign: "center",
  },
  inviteTouchable: {
    height: hp("5%"),
    width: wp("50%"),
    alignSelf: "center",
    borderBottomColor: "#5AC0EB",
    borderTopColor: "#5AC0EB",
    borderColor: "#0089C2",
    borderWidth: 1.8,
    borderRadius: 10,
    marginTop: hp("3%"),
  },
  inviteTouchableText: {
    fontSize: hp("2.2%"),
    fontFamily: "GalanoGrotesque-Medium",
    color: "#5AC0EB",
    alignSelf: "center",
    marginTop: hp("1.2%"),
  },
});
