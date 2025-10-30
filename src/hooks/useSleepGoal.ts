import { useState } from 'react';

export const useSleepGoal = (initialGoal: number = 8) => {
  const [sleepGoal, setSleepGoal] = useState(initialGoal);

  const increaseGoal = () => setSleepGoal(prev => Math.min(12, prev + 0.5));
  const decreaseGoal = () => setSleepGoal(prev => Math.max(4, prev - 0.5));

  return {
    sleepGoal,
    increaseGoal,
    decreaseGoal,
  };
};