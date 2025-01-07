import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { Response } from 'express';

admin.initializeApp();

// Function to log detailed information about survey updates
const logSurveyUpdate = async (userId: string, surveyStatus: any) => {
  const logRef = admin.database().ref('logs/surveyUpdates');
  await logRef.push({
    userId,
    surveyStatus,
    timestamp: Date.now(),
    type: 'survey_availability_update'
  });
};

// Function to check if enough time has passed since the last survey
const shouldMakeSurveyAvailable = (lastSurveyDate: number, nextSurveyAvailable: number): boolean => {
  const now = Date.now();
  const timeSinceLastSurvey = now - lastSurveyDate;
  const twoMinutesInMs = 2 * 60 * 1000;
  
  // Check both the next available time and ensure at least 2 minutes have passed
  return now >= nextSurveyAvailable && (lastSurveyDate === 0 || timeSinceLastSurvey >= twoMinutesInMs);
};

export const updateSurveyAvailability = functions.pubsub
  .schedule('every 2 minutes')
  .timeZone('America/New_York')
  .onRun(async (context) => {
    try {
      const db = admin.database();
      const usersRef = db.ref('users');
      
      console.log('Starting survey availability update:', new Date().toISOString());
      
      // Get all users
      const snapshot = await usersRef.once('value');
      const updates: { [key: string]: any } = {};
      
      snapshot.forEach((userSnapshot) => {
        const userId = userSnapshot.key;
        if (!userId) return;

        const surveyStatus = userSnapshot.child('surveyStatus').val();
        const petIsDead = userSnapshot.child('isDead').val();
        const now = Date.now();

        // Skip updates for users with dead pets
        if (petIsDead) {
          console.log(`Skipping survey update for user ${userId} - pet is deceased`);
          return;
        }

        // If no survey status exists, create initial status
        if (!surveyStatus) {
          updates[`${userId}/surveyStatus`] = {
            userId,
            lastSurveyDate: 0,
            nextSurveyAvailable: now,
            hasAvailableSurvey: true,
            timestamp: now,
            updateSource: 'initial_setup'
          };
          console.log(`Creating initial survey status for user ${userId}`);
          return;
        }

        const lastSurveyDate = Number(surveyStatus.lastSurveyDate) || 0;
        const nextSurveyAvailable = Number(surveyStatus.nextSurveyAvailable) || 0;
        const currentHasAvailable = Boolean(surveyStatus.hasAvailableSurvey);
        
        // Only make survey available if enough time has passed AND it's not already available
        if (!currentHasAvailable && shouldMakeSurveyAvailable(lastSurveyDate, nextSurveyAvailable)) {
          const newStatus = {
            userId,
            lastSurveyDate,
            nextSurveyAvailable: now + (2 * 60 * 1000), // Next survey in 2 minutes
            hasAvailableSurvey: true,
            timestamp: now,
            updateSource: 'scheduled_function'
          };

          // Only update if we're actually changing the availability
          if (!currentHasAvailable) {
            updates[`${userId}/surveyStatus`] = newStatus;
            logSurveyUpdate(userId, newStatus).catch(console.error);
            console.log(`Making survey available for user ${userId}, last survey was at ${new Date(lastSurveyDate).toISOString()}`);
          }
        } else {
          console.log(`Skipping user ${userId}, ${currentHasAvailable ? 'survey already available' : 'not enough time passed'}`);
        }
      });

      // Only perform updates if we actually have changes
      if (Object.keys(updates).length > 0) {
        await usersRef.update(updates);
        console.log(`Successfully updated survey availability for ${Object.keys(updates).length} users at ${new Date().toISOString()}`);
      } else {
        console.log('No users need survey updates at this time');
      }

      return null;
    } catch (error) {
      console.error('Error updating survey availability:', error);
      await admin.database().ref('logs/errors').push({
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: Date.now(),
        type: 'survey_availability_error'
      });
      throw error;
    }
  });

// Track survey responses
export const onSurveyResponse = functions.database
  .ref('/users/{userId}/surveyResponses/{responseId}')
  .onCreate(async (snapshot, context) => {
    if (!snapshot.exists()) return null;
    
    const response = snapshot.val();
    const { userId, responseId } = context.params;

    console.log(`New survey response received from user ${userId} at ${new Date().toISOString()}`);

    try {
      // Store the response in a separate collection for easier querying
      await admin.database().ref('allSurveyResponses').push({
        userId,
        responseId,
        response,
        timestamp: Date.now()
      });

      // Update the user's survey status
      const now = Date.now();
      const nextAvailable = now + (2 * 60 * 1000); // Next survey in 2 minutes
      await admin.database().ref(`users/${userId}/surveyStatus`).update({
        lastSurveyDate: now,
        nextSurveyAvailable: nextAvailable,
        hasAvailableSurvey: false
      });

      console.log(`Survey response successfully archived for user ${userId}`);
      return null;
    } catch (error) {
      console.error('Error archiving survey response:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Unknown error occurred while archiving survey response');
    }
  });

// For testing: HTTP endpoint to manually trigger the function
export const triggerSurveyUpdate = functions.https.onRequest(async (req, res: Response) => {
  try {
    const db = admin.database();
    const usersRef = db.ref('users');
    
    console.log('Manual survey update triggered:', new Date().toISOString());
    
    const snapshot = await usersRef.once('value');
    const updates: { [key: string]: any } = {};
    
    snapshot.forEach((userSnapshot) => {
      const userId = userSnapshot.key;
      if (!userId) return;

      const lastSurveyDate = userSnapshot.child('surveyStatus/lastSurveyDate').val() || 0;
      const nextSurveyAvailable = userSnapshot.child('surveyStatus/nextSurveyAvailable').val() || 0;
      
      // Only make survey available if enough time has passed
      if (shouldMakeSurveyAvailable(lastSurveyDate, nextSurveyAvailable)) {
        const now = Date.now();
        const surveyStatus = {
          userId,
          lastSurveyDate,
          nextSurveyAvailable: now + (2 * 60 * 1000), // Next survey in 2 minutes
          hasAvailableSurvey: true,
          timestamp: now,
          updateSource: 'manual_trigger'
        };

        updates[`${userId}/surveyStatus`] = surveyStatus;
        
        // Log the manual update
        logSurveyUpdate(userId, surveyStatus).catch(console.error);
        
        console.log(`Making survey available for user ${userId}, last survey was at ${new Date(lastSurveyDate).toISOString()}`);
      } else {
        console.log(`Skipping user ${userId}, not enough time passed since last survey at ${new Date(lastSurveyDate).toISOString()}`);
      }
    });

    if (Object.keys(updates).length > 0) {
      await usersRef.update(updates);
      console.log(`Manual update: Successfully updated ${Object.keys(updates).length} users`);
    }

    res.json({ 
      success: true, 
      message: `Updated survey availability for ${Object.keys(updates).length} users`,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in manual trigger:', error);
    // Log error details
    await admin.database().ref('logs/errors').push({
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: Date.now(),
      type: 'manual_trigger_error'
    });
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
}); 