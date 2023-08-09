import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import React, { useEffect, useRef } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import * as Animatable from "react-native-animatable";
import Dashboard from "../MainScreens/Dashboard";
import StudyTimerPage from "../MainScreens/StudyTimerPage";
import Colors from "./constants/Colors";
import { Image } from "react-native-animatable";
import SchedulePage from "../MainScreens/SchedulePage";
import SocialPage from "../MainScreens/SocialPage";


const Tab = createBottomTabNavigator();

const animate1 = {
  0: { scale: 0.5, translateY: 7 },
  0.92: { translateY: -34 },
  1: { scale: 1.2, translateY: -24 },
};
const animate2 = {
  0: { scale: 1.2, translateY: -24 },
  1: { scale: 1, translateY: 7 },
};

const circle1 = {
  0: { scale: 0 },
  0.3: { scale: 0.9 },
  0.4: { scale: 0.2 },
  0.8: { scale: 0.6 },
  1: { scale: 1 },
};
const circle2 = { 0: { scale: 1 }, 1: { scale: 0 } };

const TabButton = (props) => {
  const { item, onPress, accessibilityState } = props;
  const focused = accessibilityState.selected;
  const viewRef = useRef(null);
  const circleRef = useRef(null);
  const textRef = useRef(null);

  useEffect(() => {
    if (focused) {
      viewRef.current.animate(animate1);
      circleRef.current.animate(circle1);
      textRef.current.transitionTo({ scale: 1 });
    } else {
      viewRef.current.animate(animate2);
      circleRef.current.animate(circle2);
      textRef.current.transitionTo({ scale: 0 });
    }
  }, [focused]);

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={1}
      style={styles.container}
    >
      <Animatable.View ref={viewRef} duration={1000} style={styles.container}>
        <View style={styles.btn}>
          <Animatable.View ref={circleRef} style={styles.circle} />
          {/* Replace Icon component with Image component */}
          <Image
            source={focused ? item.activeIcon : item.inActiveIcon}
            resizeMode="contain"
            style={{ height: 20, width: 20 }}
          />
        </View>
        <Animatable.Text ref={textRef} style={styles.text}>
          {item.label}
        </Animatable.Text>
      </Animatable.View>
    </TouchableOpacity>
  );
};

const TabArr = [
  {
    route: "Dashboard Page",

    activeIcon: require("../assets/tabbaricons/homeicon.png"),
    inActiveIcon: require("../assets/tabbaricons/homedark.png"),
    component: Dashboard,
  },
  {
    route: "Study Timer",
    activeIcon: require("../assets/tabbaricons/timericon.png"),
    inActiveIcon: require("../assets/tabbaricons/clockdark.png"),
    component: StudyTimerPage,
  },

  {
    route: "Schedule Page",
    activeIcon: require("../assets/tabbaricons/scheduleicon.png"),
    inActiveIcon: require("../assets/tabbaricons/scheduledark.png"),
    component: SchedulePage,
  },

  {
    route: "Social Page",
    activeIcon: require("../assets/tabbaricons/communityicon.png"),
    inActiveIcon: require("../assets/tabbaricons/commdark.png"),
    component: SocialPage,
  },
];

export default function BottomTabbar() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
      }}
    >
      {TabArr.map((item, index) => {
        return (
          <Tab.Screen
            key={index}
            name={item.route}
            component={item.component}
            options={{
              tabBarShowLabel: false,
              tabBarButton: (props) => <TabButton {...props} item={item} />,
            }}
          />
        );
      })}
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  tabBar: {
    height: 70,
    position: "absolute",
    bottom: 16,
    right: 16,
    left: 16,
    borderRadius: 16,
    
  },
  btn: {
    width: 50,
    height: 50,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: "white",
    overflow: "hidden",
    backgroundColor:"white",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    marginBottom: -27
  },
  circle: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor:"#5AC0EB",
    borderRadius: 25,
    overflow: "hidden",
    borderWidth: 0.5, // Add a small border width
    borderColor: "white", // Use the same border color as the button
  },
  text: {
    fontSize: 10,
    textAlign: "center",
    color: Colors.primary,
  },

  tabBar: {
    height: 70,
    position: "absolute",
    bottom: 16,
    right: 16,
    left: 16,
    borderRadius: 20,
    backgroundColor: '#5AC0EB', // Add this line to set the background color
  },
});
