'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getSurveyTemplate, submitSurveyResponse } from '@/lib/firebase';
import type { SurveyTemplate, SurveyResponse } from '@/types/survey';

export default function SurveyPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [template, setTemplate] = useState<SurveyTemplate | null>(null);
  const [responses, setResponses] = useState<Record<string, string | number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const loadTemplate = async () => {
      if (!user) return;
      const template = await getSurveyTemplate('daily-survey');
      setTemplate(template);
    };

    loadTemplate();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !template) return;

    setIsSubmitting(true);
    try {
      const surveyResponse: Omit<SurveyResponse, 'userId' | 'timestamp'> = {
        surveyId: template.id,
        responses: Object.entries(responses).map(([questionId, answer]) => ({
          questionId,
          answer
        })),
        completionTime: Date.now()
      };

      await submitSurveyResponse(user.uid, surveyResponse);
      router.push('/menu');
    } catch (error) {
      console.error('Error submitting survey:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!template) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100 p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-8">
        <h1 className="text-3xl font-bold text-purple-800 mb-8">{template.title}</h1>
        
        <form onSubmit={handleSubmit} className="space-y-8">
          {template.questions.map((question) => (
            <div key={question.id} className="space-y-4">
              <label className="block text-lg font-medium text-gray-700">
                {question.text}
                {question.required && <span className="text-red-500">*</span>}
              </label>

              {question.type === 'likert' && (
                <div className="flex justify-between gap-4">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setResponses(prev => ({
                        ...prev,
                        [question.id]: value
                      }))}
                      className={`p-4 rounded-lg flex-1 ${
                        responses[question.id] === value
                          ? 'bg-purple-500 text-white'
                          : 'bg-gray-100 hover:bg-gray-200'
                      }`}
                    >
                      {value}
                    </button>
                  ))}
                </div>
              )}

              {question.type === 'text' && (
                <textarea
                  required={question.required}
                  value={responses[question.id] || ''}
                  onChange={(e) => setResponses(prev => ({
                    ...prev,
                    [question.id]: e.target.value
                  }))}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  rows={3}
                />
              )}
            </div>
          ))}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 disabled:bg-gray-400"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Survey'}
          </button>
        </form>
      </div>
    </div>
  );
} 