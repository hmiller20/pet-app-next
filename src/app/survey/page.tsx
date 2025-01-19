'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSurvey } from '@/hooks/useSurvey';
import { SurveyType, ISurveyQuestion } from '@/models/Survey';

export default function SurveyPage() {
  const router = useRouter();
  const {
    loading,
    error,
    template,
    responses,
    setResponses,
    submitSurvey
  } = useSurvey();

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  // Calculate survey progress
  useEffect(() => {
    if (template) {
      const requiredQuestions = template.questions.filter((q: ISurveyQuestion) => q.required).length;
      const answeredRequired = template.questions
        .filter((q: ISurveyQuestion) => q.required)
        .filter((q: ISurveyQuestion) => responses[q.id])
        .length;
      setProgress((answeredRequired / requiredQuestions) * 100);
    }
  }, [template, responses]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    try {
      setSubmitting(true);
      setSubmitError(null);
      await submitSurvey();

      // Different redirects based on survey type
      if (template?.type === SurveyType.INITIAL) {
        router.push('/game'); // Go directly to game for initial surveys
      } else {
        router.push('/menu'); // Return to menu for other survey types
      }
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Failed to submit survey');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100 p-8 flex items-center justify-center">
        <div className="text-purple-600 text-xl">Loading survey...</div>
      </div>
    );
  }

  if (error || !template) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100 p-8 flex items-center justify-center">
        <div className="text-red-600 text-xl">
          {error || 'No survey available'}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100 p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-8">
        {/* Header section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-purple-800 mb-2">
            {template.title}
          </h1>
          {template.metadata?.description && (
            <p className="text-gray-600">
              {template.metadata.description}
            </p>
          )}
        </div>

        {/* Progress bar */}
        <div className="mb-8">
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-purple-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="text-sm text-gray-500 mt-1">
            Progress: {Math.round(progress)}%
          </div>
        </div>
        
        {submitError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
            {submitError}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-8">
          {template.questions.map((question: ISurveyQuestion) => (
            <div key={question.id} className="space-y-4">
              <label className="block text-lg font-medium text-gray-700">
                {question.text}
                {question.required && <span className="text-red-500">*</span>}
                {question.metadata?.category && (
                  <span className="ml-2 text-sm text-gray-500">
                    ({question.metadata.category})
                  </span>
                )}
              </label>

              {question.type === 'likert' && (
                <div className="flex justify-between gap-4">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setResponses({ ...responses, [question.id]: value })}
                      className={`p-4 rounded-lg flex-1 transition-all duration-200 ${
                        responses[question.id] === value
                          ? 'bg-purple-500 text-white scale-105'
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
                  onChange={(e) => setResponses({ ...responses, [question.id]: e.target.value })}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-black"
                  rows={3}
                  placeholder={`Enter your response${question.required ? ' (required)' : ''}`}
                />
              )}

              {question.type === 'multipleChoice' && question.options && (
                <div className="space-y-2">
                  {question.options?.map((option: string) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setResponses({ ...responses, [question.id]: option })}
                      className={`w-full p-3 text-left rounded-lg transition-all duration-200 ${
                        responses[question.id] === option
                          ? 'bg-purple-500 text-white'
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}

          <button
            type="submit"
            disabled={submitting || progress < 100}
            className="w-full py-4 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-200"
          >
            {submitting ? 'Submitting...' : progress < 100 ? 'Please complete all requiredquestions' : 'Submit Survey'}
          </button>
        </form>
      </div>
    </div>
  );
} 