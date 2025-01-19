import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ISurveyTemplate, SurveyType } from '@/models/Survey';
import { submitSurveyResponse } from '@/lib/surveyService';

export function useSurvey() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [template, setTemplate] = useState<ISurveyTemplate | null>(null);
  const [responses, setResponses] = useState<Record<string, string | number>>({});

  useEffect(() => {
    const fetchTemplate = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/surveys');
        if (!response.ok) {
          throw new Error('Failed to fetch survey template');
        }
        const data = await response.json();
        setTemplate(data.template);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load survey');
      } finally {
        setLoading(false);
      }
    };

    fetchTemplate();
  }, []);

  const submitSurvey = async () => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    try {
      const startTime = new Date();
      const response = await fetch('/api/surveys/response', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.uid,
          surveyId: 'daily-survey',
          responses,
          completionTime: {
            startTime,
            deviceInfo: navigator.userAgent
          }
        })
      });

      if (!response.ok) {
        throw new Error('Failed to submit survey');
      }
    } catch (error) {
      console.error('Failed to submit survey:', error);
      throw error;
    }
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