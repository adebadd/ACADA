import React from 'react';
import { Text } from 'react-native';

const CurrentDate = () => {
  const getDate = () => {
    const now = new Date();
    const day = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(now);
    const month = new Intl.DateTimeFormat('en-US', { month: 'long' }).format(now);
    const date = new Intl.DateTimeFormat('en-US', { day: '2-digit' }).format(now);
    const suffix = ['th', 'st', 'nd', 'rd'][date % 10] || 'th';

    return `${day}, ${month} ${date}${suffix}`;
  };

  return <Text>{getDate()}</Text>;
};

export default CurrentDate;