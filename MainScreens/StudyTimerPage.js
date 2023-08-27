import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View} from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import { FlatList } from 'react-native';
import { Dimensions } from 'react-native';
import { Image } from 'react-native';
import { TouchableOpacity } from 'react-native';
import { CountdownCircleTimer } from 'react-native-countdown-circle-timer'
import { onSnapshot, addDoc, collection, getDocs, orderBy, query, where, getFirestore, updateDoc, doc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import playIcon from '../assets/studytimericons/play.png';
import pauseIcon from '../assets/studytimericons/pause.png';
import stopIcon from '../assets/studytimericons/stop.png';

const screenHeight = Dimensions.get('window').height;
const StudyTimerPage = ({ navigation }) => {
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
  const [isLongBreak, setIsLongBreak] = useState(false)
  const [gracePeriod, setGracePeriod] = useState(false);
  const screenWidth = Dimensions.get('window').width;



  const menuItems = [
    { title: "Study Timer", selected: true, key: "studyTimer" },
    { title: "Study Stats", selected: false, key: "stats" },
  ];
  const renderMenuItem = ({ item, index }) => {
  const handleItemPress = item.key ? handleMenuItemPress : handlePress;

  return (
    <TouchableOpacity onPress={() => handleItemPress(index)} activeOpacity={0.5}>
      <View style={styles.titleItem}>
        <Text allowFontScaling={false} style={[styles.titleText, item.selected && styles.selectedText]}>{item.title}</Text>
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

    const subjectsQuery = query(
      collection(doc(db, "users", userId), "subjects"),
      orderBy("createdAt", "desc")
    );

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
    title: 'Pomodoro',
    studyMinutes: 25,
    breakMinutes: 10,
    longBreakMinutes: 15,
    cycles: 4,
  });

  const [isPlaying, setIsPlaying] = useState(false);
  const handlePlayButtonPress = () => {
    if (gracePeriod) return;  // Prevent starting during grace period

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

  const [titles, setTitles] = useState([
    {title: "Pomodoro", selected: true},
    {title: "Animedoro", selected: false},
    {title: "Thirty-Five", selected: false},
    {title: "90-Minute", selected: false},
    {title: "Pomodoro+", selected: false},
    {title: "Fifty-Two", selected: false},  
    {title: "Customize", selected: false},  
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
      case 'Thirty-Five':
        setStudyStyle({
          title: 'Thirty-Five',
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

  // After 5 seconds, stop the timer and show the "Stopped" status and stop.png
  const timerId = setTimeout(() => {
      setPlayButtonSource(stopIcon);
      setTimerStatus("Stopped");
      setIsPlaying(false);
      
      // Start the grace period
      setGracePeriod(true);

      setTimeout(() => {
          setPlayButtonSource(playIcon);
          setTimerKey(prevKey => prevKey + 1);
          setRemainingTime(studyStyle.studyMinutes * 60);
          setCurrentCycle(1);
          setIsOnBreak(false);
          setAreComponentsVisible(true);
          setTimerStatus("Press Start");
          setGracePeriod(false);  // End the grace period
      }, 2000);  // 2000 milliseconds = 2 seconds
  }, 5000);  // 5000 milliseconds = 5 seconds

  setLongPressTimer(timerId);
};

const handlePressOut = () => {
  clearTimeout(longPressTimer);
};


const renderItem = ({ item, index }) => {
  return (
    <TouchableOpacity onPress={() => handlePress(index)} activeOpacity={0.5}>
      <View style={styles.titleItem}>
      <Text allowFontScaling={false} style={[styles.titleText, item.selected && styles.selectedText]}>{item.title}</Text>
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
          marginTop: 160,
          width: 380,
          borderBottomColor: "#5AC0EB",
          borderTopColor: "white",
          borderColor: "#0089C2",
          borderWidth: 1.8,
          borderRadius: 10,
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
  size={320}
  strokeWidth={18}
  onComplete={handleComplete}
>
  {({ remainingTime }) => {
    const minutes = Math.floor(remainingTime / 60);
    const seconds = remainingTime % 60;
    return <Text allowFontScaling={false} style={styles.timerText}>{`${minutes}:${seconds < 10 ? '0' : ''}${seconds}`}</Text>
  }}
</CountdownCircleTimer>

</View>
<Text allowFontScaling={false} style={styles.subjectTitle}>{timerStatus}</Text>
<View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: "80%", position: "absolute", alignSelf: "center",  marginTop: screenHeight === 896 ? "80%" : "77.5%", }}>
  <View style={{ height: 10, width: 10, borderRadius: 5, backgroundColor: currentCycle > 1 ? '#5AC0EB' : '#D3D3D3', margin: 5}} />
  <View style={{ height: 10, width: 10, borderRadius: 5, backgroundColor: currentCycle > 2 ? '#5AC0EB' : '#D3D3D3', margin: 5}} />
  <View style={{ height: 10, width: 10, borderRadius: 5, backgroundColor: currentCycle > 3 ? '#5AC0EB' : '#D3D3D3', margin: 5}} />
  <View style={{ height: 10, width: 10, borderRadius: 5, backgroundColor: currentCycle > 4 ? '#5AC0EB' : '#D3D3D3', margin: 5}} />
</View>
<View style={styles.titleContainer}>
  <Text allowFontScaling={false} style={styles.studyTimerTitle}>{studyStyle.title}</Text>
  <Image
    style={styles.infoButton}
    source={require("../assets/studytimericons/info.png")}
  />
</View>

<TouchableOpacity
    onPress={handlePlayButtonPress}
    onPressIn={handlePressIn}
    onPressOut={handlePressOut}
    style={[styles.playButton, gracePeriod ? { opacity: 0.5 } : { opacity: 1 }]}  // Adjust opacity here
>
    <Image source={playButtonSource} style={{height: 45, width: 45, resizeMode: "contain"}} />
</TouchableOpacity>


<View style={styles.studyTimerInfoContainer}>
    <Image
        style={styles.studyTimerInfoIcon}
        source={require("../assets/studytimericons/info.png")}
    />
    <Text allowFontScaling={false} style={styles.studyTimerInfo}>
        Hold the pause button for 5 seconds{"\n"}              to end study session.
    </Text>
</View>

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
    width: 380,
    height: 30,
    alignSelf: "center",
    borderRadius: 10,
    marginTop: 150,

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
    marginTop: '15%',
    position: "absolute",
    height: 60,
    marginRight: -2
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
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: "-43%",
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
    width: "80%",
    height: 2,
    backgroundColor: "#5AC0EB",
  },
  timerContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: '66%',
  },
  timerText: {
    fontSize: 65,
    fontFamily: "GalanoGrotesque-SemiBold",
    color: "#5AC0EB",
    marginTop: -90
  },
  studyTimerTitle:{
    fontSize: 25,
    fontFamily: "GalanoGrotesque-Light",
    color: "#5AC0EB",
    alignSelf: "center",
    marginLeft: 0,
  },
  subjectTitle:{
    fontSize: 20,
    fontFamily: "GalanoGrotesque-Medium",
    color: "#5AC0EB",
    marginTop: screenHeight === 896 ? "106%" : "103%",
    alignSelf: "center",
    position: "absolute"
  },
  infoButton: {
    height: 18,
    width: 18,
    marginLeft: 5,
    marginTop: 2,
    resizeMode: "contain",
  },
  playButton: {
    position: "absolute",
    marginTop: screenHeight === 896 ? "120%" : "117%",
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
    marginTop: 490,
    marginLeft: 225,
    resizeMode: "contain",
  },


  studyTimerInfoContainer: {
    position: 'absolute',
    flexDirection: 'row', // to have icon and text side by side
    alignItems: 'center', // vertically center them
    bottom: "26%", // distance from bottom
    alignSelf: "center",
   
},
studyTimerInfoIcon: {
    height: 18,
    width: 18,
    marginRight: 0, // space between the icon and the text
    alignSelf: "center",
    marginBottom: "5.8%",
},
studyTimerInfo: {
    fontSize: 18,
    fontFamily: "GalanoGrotesque-Light",
    color: "#5AC0EB",
    alignSelf: "center"
},
});