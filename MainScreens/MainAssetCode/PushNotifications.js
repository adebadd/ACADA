import * as Notifications from 'expo-notifications';
import { firebase } from "../../config";

const PushNotifications = (notificationsEnabled) => {
    if (!notificationsEnabled) {
      Notifications.cancelAllScheduledNotificationsAsync(); // Cancel all notifications if they are disabled
      return;
    }
    
  let tasks = [];
  const userId = firebase.auth().currentUser.uid;

  firebase.firestore()
    .collection("users")
    .doc(userId)
    .collection("tasks")
    .get()
    .then(querySnapshot => {
      querySnapshot.forEach(doc => {
        tasks.push(doc.data());
      });

      tasks.forEach(task => {
        const now = new Date();
        const timeBeforeTask = task.dueDate.toDate() - now;

        if (shouldScheduleNotification(task.selectedCategory, timeBeforeTask)) {
          let date = new Date(task.dueDate.toDate());
          date.setTime(date.getTime() - timeBeforeTask);

          Notifications.scheduleNotificationAsync({
            content: {
              title: "Task Reminder",
              body: `Don't forget about your ${task.selectedCategory} '${task.Topic}'`,
            },
            trigger: {
              date: date,
            },
          });
        }
      });
    })
    .catch(error => {
      console.log("Error getting documents: ", error);
    });
}

function shouldScheduleNotification(category, timeBeforeTask) {
  if (category === 'Class' && timeBeforeTask <= 604800000) { // 1 week before
    return true;
  } else if ((category === 'Presentation' || category === 'Reminder' || category === 'Assignment' || category === 'Exam' || category === 'Lab') && timeBeforeTask <= 86400000) { // 1 day before
    return true;
  } else if ((category === 'Presentation' || category === 'Reminder' || category === 'Assignment') && timeBeforeTask <= 1800000) { // 30 minutes before
    return true;
  } else if ((category === 'Study' || category === 'Assignment' || category === 'Presentation') && timeBeforeTask <= 0) { // When the task is due
    return true;
  }
  return false;
}

export default PushNotifications;