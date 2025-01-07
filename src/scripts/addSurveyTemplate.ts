import { database } from '@/lib/firebase';
import { ref, set } from 'firebase/database';

const surveyTemplate = {
  id: 'daily-survey',
  title: 'Daily Pet Care Experience',
  version: 1,
  questions: [
    {
      id: 'q1',
      text: 'How enjoyable was your interaction with your pet today?',
      type: 'likert',
      required: true
    },
    {
      id: 'q2',
      text: 'What activities did you do with your pet today?',
      type: 'text',
      required: false
    },
    {
      id: 'q3',
      text: 'How stressed did you feel while caring for your pet?',
      type: 'likert',
      required: true
    },
    {
      id: 'q4',
      text: 'How difficult was it to maintain your pet\'s needs today?',
      type: 'likert',
      required: true
    }
  ]
};

// Add this to your database
const addTemplate = async () => {
  try {
    await set(ref(database, 'surveyTemplates/daily-survey'), surveyTemplate);
    console.log('Survey template added successfully');
  } catch (error) {
    console.error('Error adding survey template:', error);
  }
};

addTemplate(); 