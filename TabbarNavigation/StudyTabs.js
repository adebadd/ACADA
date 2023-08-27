import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import StudyStatsPage from '../MainScreens/MainStackScreens/StudyStatsPage';
import StudyTimerPage from '../MainScreens/StudyTimerPage';
const Tab = createMaterialTopTabNavigator();

function StudyTabs() {
  return (
    <Tab.Navigator 
      initialRouteName="StudyTimer"
      screenOptions={{
        tabBarStyle: { display: 'none' }, // Moved here from tabBarOptions
        cardStyleInterpolator: ({ current, layouts }) => {
          return {
            cardStyle: {
              transform: [
                {
                  translateX: current.progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [layouts.screen.width, 0], // transition from right
                  }),
                },
              ],
            },
          };
        },
      }}
    >
      <Tab.Screen name="StudyTimer" component={StudyTimerPage} />
      <Tab.Screen name="StudyStatsPage" component={StudyStatsPage} />
    </Tab.Navigator>
  );
}

export default StudyTabs;