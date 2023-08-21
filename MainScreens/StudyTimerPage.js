import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, Animated, } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import { firebase } from "../config";
import { FlatList } from 'react-native';
import { Dimensions } from 'react-native';
import { Image } from 'react-native';
import { TouchableOpacity } from 'react-native';
import { CountdownCircleTimer } from 'react-native-countdown-circle-timer';

const StudyTimerPage = ({ navigation }) => {
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [open, setOpen] = useState(false);
  const flatListRef = useRef(null);
  const [playButtonSource, setPlayButtonSource] = useState(require("../assets/studytimericons/play.png"));
  const [remainingTime, setRemainingTime] = useState(50 * 60);
  const [longPressRemainingTime, setLongPressRemainingTime] = useState(null);
  const [timerKey, setTimerKey] = useState(0);
  const [longPressTimer, setLongPressTimer] = useState(null);
  const [timerStatus, setTimerStatus] = useState("Press Start");
  const [areComponentsVisible, setAreComponentsVisible] = useState(true);
  const [currentCycle, setCurrentCycle] = useState(1);
  const [isOnBreak, setIsOnBreak] = useState(false);
  const [isOnLongBreak, setIsOnLongBreak] = useState(false);
  const [isLongBreak, setIsLongBreak] = useState(false)
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
     
        querySnapshot.forEach((doc) => {
          const subject = doc.data();
          subject.id = doc.id;
          subjects.push(subject);
        });
        setSubjects(subjects);
      });
    return unsubscribe;
  }, []);


  const [studyStyle, setStudyStyle] = useState({
    title: 'Pomodoro',
    studyMinutes: 25,
    breakMinutes: 10,
    longBreakMinutes: 15,
    cycles: 4,
  });

  const [isPlaying, setIsPlaying] = useState(false);
  const handlePlayButtonPress = () => {
    setIsPlaying(!isPlaying);
    if (!isPlaying) {
      if (isOnLongBreak) {
        setTimerStatus("Long Break");
      } else {
        setTimerStatus(isOnBreak ? "Break" : "Focus");
      }
    } else {
      setTimerStatus("Paused");
    }
    setPlayButtonSource(isPlaying ? require("../assets/studytimericons/play.png") : require("../assets/studytimericons/pause.png"));
  };

  useEffect(() => {
    if (longPressRemainingTime !== null) {
      const timerId = setTimeout(() => {
        if (longPressRemainingTime !== null) {
          setIsPlaying(false);
          setRemainingTime(50 * 60);
          setPlayButtonSource(require("../assets/studytimericons/stop.png"));
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
    if (isOnBreak) {
      if (currentCycle === 4) {
        setIsOnLongBreak(true);
        setTimerStatus('Long Break');
        setRemainingTime(studyStyle.longBreakMinutes);
        setIsOnBreak(false);
        setCurrentCycle(1);
      } else {
        setCurrentCycle((prevCycle) => prevCycle + 1);
        setTimerStatus('Start Study');
        setRemainingTime(studyStyle.studyMinutes * 60);
        setIsOnBreak(false);
      }
    } else {
      if (currentCycle === 4) {
        setIsOnLongBreak(true);
        setTimerStatus('Start Long Break');
        setRemainingTime(studyStyle.longBreakMinutes * 60);
        setIsOnBreak(true);
      } else {
        setTimerStatus('Start Break');
        setRemainingTime(studyStyle.breakMinutes * 60);
        setIsOnBreak(true);
      }
    }
    setIsPlaying(false);
    setPlayButtonSource(require("../assets/studytimericons/play.png"));
  
    
 
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
      setPlayButtonSource(require("../assets/studytimericons/play.png"));
      setAreComponentsVisible(true);
    }
  };

  const [titles, setTitles] = useState([
    {title: "Pomodoro", selected: true},
    {title: "Animedoro", selected: false},
    {title: "30/5/30/10", selected: false},
    {title: "90-Minute", selected: false},
    {title: "Pomodoro+", selected: false},
    {title: "Fifty-Two", selected: false},  
    {title: "Custom Pro", selected: false},  
]);


const handlePress = (index) => {
  setTitles(titles.map((item, i) => ({...item, selected: i === index})));
  switch (titles[index].title) {
    case 'Pomodoro':
      setStudyStyle({
        title: 'Pomodoro',
        studyMinutes: 25,
        breakMinutes: 5,
        longBreakMinutes: 15,
        cycles: 4,
      });
      break;
    case '90-Minute':
      setStudyStyle({
        title: '90-Minute',
        studyMinutes: 90,
        breakMinutes: 20,
        longBreakMinutes: 30,
        cycles: 4,
      });
      break;
      case 'Animedoro':
        setStudyStyle({
          title: 'Animedoro',
          studyMinutes: 60,
          breakMinutes: 20,
          longBreakMinutes: 30,
          cycles: 4,
        });
      break;
      case '30/5/30/10':
        setStudyStyle({
          title: '30/5/30/10',
          studyMinutes: 30,
          breakMinutes: 5,
          longBreakMinutes: 10,
          cycles: 4,
        });
      break;
      case 'Fifty-Two':
        setStudyStyle({
          title: 'Fifty-Two',
          studyMinutes: 52,
          breakMinutes: 17,
          cycles: 4,
        });
        break;
        case 'Pomodoro+':
          setStudyStyle({
            title: 'Pomodoro+',
            studyMinutes: 50,
            breakMinutes: 10,
            longBreakMinutes: 30,
            cycles: 4,
          });
      break;
    // Add more cases for other study styles
    default:
      break;
  }
  if (flatListRef.current) {
    flatListRef.current.scrollToIndex({index, animated: true});
  }
};

const handlePressIn = () => {
  setAreComponentsVisible(false);
  const timerId = setTimeout(() => {
    setPlayButtonSource(require("../assets/studytimericons/stop.png"));
    setTimerStatus("Stopped");
    setTimeout(() => {
      setIsPlaying(false);
      setPlayButtonSource(require("../assets/studytimericons/play.png"));
      setTimerKey(prevKey => prevKey + 1); // Increment timerKey to reset the timer
      setRemainingTime(studyStyle.studyMinutes * 60); // Reset remainingTime to the study time
      setCurrentCycle(1); // Reset currentCycle to 1
      setIsOnBreak(false); // Reset isOnBreak to false
      setAreComponentsVisible(true);
      setTimerStatus("Press Start");
    }, 2000);
  }, 3000);
  setLongPressTimer(timerId);
};

const handlePressOut = () => {
  clearTimeout(longPressTimer);
};


const renderItem = ({ item, index }) => {
  return (
    <TouchableOpacity onPress={() => handlePress(index)} activeOpacity={0.5}>
      <View style={styles.titleItem}>
        <Text style={[styles.titleText, item.selected && styles.selectedText]}>{item.title}</Text>
        {item.selected && <View style={styles.selectedIndicator} />}
      </View>
    </TouchableOpacity>
  );
};

const itemWidth = Dimensions.get("window").width / 3; // changed from 5 to 3
const visibleItemsCount = 3; // changed from 5 to 3
  return (


    <View style={styles.container}>
  {areComponentsVisible && !isOnLongBreak && (
      <DropDownPicker
     
        items={subjectItems}
        activeOpacity={0}
        open={open}
        dropDownContainerStyle={{
          opacity: 1,
          marginTop: 139,
          width: 350,
          borderBottomColor: "#5AC0EB",
          borderTopColor: "white",
          borderColor: "#0089C2",
          borderWidth: 1.8,
          borderRadius: 0,
          zIndex: 10,
          alignSelf: "center",
        }}
        selectedItemLabelStyle={{
          fontFamily: "GalanoGrotesque-SemiBold",
          fontSize: 20,
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
          alignSelf: "center",
          marginTop: -20,
          marginBottom: 35,
          position: "absolute",
          
        }}
        listItemLabelStyle={{
          fontFamily: "GalanoGrotesque-SemiBold",
          fontSize: 18,
          color: "#0089C2",
        }}
        style={[styles.selectsubjectinput, styles.subjectinputmargin]}
        itemStyle={{
        
                
        }}
        dropDownStyle={{ backgroundColor: "#fafafa", zIndex: 2 }}

        onChangeItem={(subject) => handleSubjectChange(subject)}

        textStyle={{
          fontFamily: "GalanoGrotesque-Medium",
          fontSize: 20,
          color: "#0089C2",
        }}
        placeholderStyle={{
          fontFamily: "GalanoGrotesque-Medium",
          fontSize: 18,
          color: "#0089C2",
          textAlign: "center",
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
          backgroundColor: "#5AC0EB",

        }}

      />
      )}

{areComponentsVisible && (
<FlatList
  ref={flatListRef}
  data={titles}
  renderItem={renderItem}
  keyExtractor={(item, index) => index.toString()}
  getItemLayout={(data, index) => (
    {length: itemWidth, offset: itemWidth * index, index}
  )}
  horizontal
  snapToInterval={itemWidth}
  snapToAlignment="center"
  style = {styles.flatList}
  decelerationRate="fast"
  showsHorizontalScrollIndicator={false}
  contentContainerStyle={styles.titleList}
/>

)}
<View style={styles.timerContainer}>
<CountdownCircleTimer
  key={isOnBreak ? 'breakTimer' + timerKey : 'studyTimer' + timerKey}
  isPlaying={isPlaying}
  duration={isOnBreak ? (currentCycle === 4 ? studyStyle.longBreakMinutes * 60 : studyStyle.breakMinutes * 60) : studyStyle.studyMinutes * 60}
  colors={['#5AC0EB', '#2A99C8', '#0089C2', '#01668B']}
  colorsTime={[300, 200, 100, 50]}
  size={300}
  strokeWidth={18}
  onComplete={handleComplete}
>
  {({ remainingTime }) => {
    const minutes = Math.floor(remainingTime / 60);
    const seconds = remainingTime % 60;
    return <Text style={styles.timerText}>{`${minutes}:${seconds < 10 ? '0' : ''}${seconds}`}</Text>
  }}
</CountdownCircleTimer>

</View>
<Text style={styles.studyTimerTitle}>{studyStyle.title}</Text>
<Text style={styles.subjectTitle}>{timerStatus}</Text>
<View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 392, position: "absolute", alignSelf: "center" }}>
  <View style={{ height: 10, width: 10, borderRadius: 5, backgroundColor: currentCycle > 1 ? '#5AC0EB' : '#D3D3D3', margin: 5}} />
  <View style={{ height: 10, width: 10, borderRadius: 5, backgroundColor: currentCycle > 2 ? '#5AC0EB' : '#D3D3D3', margin: 5}} />
  <View style={{ height: 10, width: 10, borderRadius: 5, backgroundColor: currentCycle > 3 ? '#5AC0EB' : '#D3D3D3', margin: 5}} />
  <View style={{ height: 10, width: 10, borderRadius: 5, backgroundColor: currentCycle > 4 ? '#5AC0EB' : '#D3D3D3', margin: 5}} />
</View>
<Image
          style={styles.infoButton}
          source={require("../assets/studytimericons/info.png")}
        />

<TouchableOpacity
  onPress={handlePlayButtonPress}
  onPressIn={handlePressIn}
  onPressOut={handlePressOut}
  style={styles.playButton}
>
  <Image source={playButtonSource} style={{height: 45, width: 45, resizeMode: "contain"}} />
</TouchableOpacity>


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
    width: 350,
    height: 30,
    alignSelf: "center",
    borderRadius: 1,
    marginTop: 140,

  },

  container: {
    backgroundColor: "white",
    height: "100%",
  },

  maincontainer: {
    backgroundColor: "white",
    flex: 1,
  },
  flatList: {
    marginTop: 50,
    position: "absolute",
    height: 60,
  },
  titleList: {
    paddingTop: 20,
  },

  playTouchable: {
    alignSelf: "center"
  },
  titleItem: {
    width: Dimensions.get("window").width / 3,
    alignItems: "center",
    borderBottomWidth: 0,
  },
  titleText: {
    fontSize: 22,
    fontFamily: "GalanoGrotesque-SemiBold",
    color: "#0089C2",
  },
  selectedText: {
    color: "#5AC0EB",
  },
  selectedIndicator: {
    position: "absolute",
    marginTop: 25,
    width: "75%",
    height: 2,
    backgroundColor: "#5AC0EB",
  },
  timerContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 220,
  },
  timerText: {
    fontSize: 65,
    fontFamily: "GalanoGrotesque-Medium",
    color: "#5AC0EB",
    marginTop: -90
  },
  studyTimerTitle:{
    fontSize: 25,
    fontFamily: "GalanoGrotesque-Medium",
    color: "#5AC0EB",
    marginTop: 350,
    marginLeft: 120,
    position: "absolute"
  },
  subjectTitle:{
    fontSize: 20,
    fontFamily: "GalanoGrotesque-Light",
    color: "#5AC0EB",
    marginTop: 372,
    alignSelf: "center",
    position: "absolute"
  },
  infoButton: {
    position: "absolute",
    height: 18,
    width: 18,
    marginTop: 352.8,
    marginLeft: 235,
    resizeMode: "contain",
  },
  playButton: {
    position: "absolute",
    marginTop: 435,
    alignSelf: "center",
    resizeMode: "contain",
  },
  resetButton: {
    position: "absolute",
    height: 40,
    width: 40,
    marginTop: 445,
    marginLeft: 108,
    resizeMode: "contain",
  },
  stopButton: {
    position: "absolute",
    height:  40, 
    width: 40,
    marginTop: 445,
    marginLeft: 225,
    resizeMode: "contain",
  },
});