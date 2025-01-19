import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ISurveyTemplate, SurveyType } from '@/models/Survey';

// Mock survey template for testing UI
const mockSurveyTemplate: ISurveyTemplate = {
  id: 'daily-survey',
  title: 'Daily Survey',
  type: SurveyType.DAILY,
  questions: [
    {
      id: 'q1',
      text: 'How much time did you spend with your pet today?',
      type: 'multipleChoice',
      options: ['Less than 5 minutes', '5-15 minutes', '15-30 minutes', '30-60 minutes', 'More than 1 hour'],
      required: true,
    },
    {
      id: 'q2',
      text: 'What activities did you enjoy most with your pet?',
      type: 'text',
      required: true,
    },
    {
      id: 'q3',
      text: 'How would you rate your pet\'s mood today?',
      type: 'multipleChoice',
      options: ['Very Sad', 'Sad', 'Neutral', 'Happy', 'Very Happy'],
      required: true,
    },
    {
      id: 'q4',
      text: 'Any additional notes about your pet\'s behavior?',
      type: 'text',
      required: false,
    }
  ],
  version: 1,
  metadata: {
    description: 'Please tell us about your experience with your sheep today.'
  }
};

export function useSurvey() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [template, setTemplate] = useState<ISurveyTemplate | null>(null);
  const [responses, setResponses] = useState<Record<string, string | number>>({});

  useEffect(() => {
    // Simulate API loading delay
    const timer = setTimeout(() => {
      setTemplate(mockSurveyTemplate);
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const submitSurvey = async () => {
    // Mock submission - just log to console for now
    console.log('Survey responses:', responses);
    return Promise.resolve();
  };

  return {
    loading,
    error,
    template,
    responses,
    setResponses,
    submitSurvey
  };
} 