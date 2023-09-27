
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { getAuth } from "@firebase/auth";
import { getFirestore, collection, getDocs } from "firebase/firestore";

const StudyStatsPage = ({ goToPrevPage }) => {
  const [chartData, setChartData] = useState(null);
  const [maxStudyTime, setMaxStudyTime] = useState(0);
  const [segments, setSegments] = useState(1); // Default to 1

  useEffect(() => {
    const fetchData = async () => {
      const auth = getAuth();
      const userId = auth.currentUser.uid;
      const db = getFirestore();
    
      const subjectsRef = collection(db, "users", userId, "subjects");
      const querySnapshot = await getDocs(subjectsRef);
      const labels = [];
      const data = [];
    
      for (const doc of querySnapshot.docs) {
        const subject = doc.data();
        labels.push(subject.title);
    
        // Get the Daily value from the studyTime sub-collection
        const StudyTimeRef = collection(db, "users", userId, "subjects", doc.id, "StudyTime");
        const StudyTimeSnapshot = await getDocs(StudyTimeRef);
    
        // Check if there's a document in StudyTime sub-collection
        if (StudyTimeSnapshot.docs.length > 0) {
          const dailyHours = StudyTimeSnapshot.docs[0].data().Daily || 0;
          data.push(dailyHours);
        } else {
          console.warn(`No StudyTime data for subject: ${subject.title}`);
          data.push(0);  // default to 0 hours if no data is available
        }
      }
    
      const maxTime = Math.max(...data);
      setMaxStudyTime(maxTime);
      setSegments(Math.ceil(maxTime));
      setChartData({
          labels: labels,
          datasets: [{
              data: data,
          }],
      });
      console.log("ChartData: ", chartData);  // Log the chart data
    };

    fetchData();
  }, []);

  return (
    <View style={styles.maincontainer}>
      <Text style={styles.header}>Daily Study Stats</Text>
   
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