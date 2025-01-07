"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.triggerSurveyUpdate = exports.onSurveyResponse = exports.updateSurveyAvailability = void 0;
const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();
// Function to log detailed information about survey updates
const logSurveyUpdate = async (userId, surveyStatus) => {
    const logRef = admin.database().ref('logs/surveyUpdates');
    await logRef.push({
        userId,
        surveyStatus,
        timestamp: Date.now(),
        type: 'survey_availability_update'
    });
};
// Function to check if enough time has passed since the last survey
const shouldMakeSurveyAvailable = (lastSurveyDate, nextSurveyAvailable) => {
    const now = Date.now();
    return now >= nextSurveyAvailable; // Only check if we've reached the next available time
};
exports.updateSurveyAvailability = functions.pubsub
    .schedule('every 2 minutes')
    .timeZone('America/New_York')
    .onRun(async (context) => {
    try {
        const db = admin.database();
        const usersRef = db.ref('users');
        console.log('Starting survey availability update:', new Date().toISOString());
        // Get all users
        const snapshot = await usersRef.once('value');
        const updates = {};
        snapshot.forEach((userSnapshot) => {
            const userId = userSnapshot.key;
            if (!userId)
                return;
            const surveyStatus = userSnapshot.child('surveyStatus').val();
            const now = Date.now();
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
            const lastSurveyDate = surveyStatus.lastSurveyDate || 0;
            const nextSurveyAvailable = surveyStatus.nextSurveyAvailable || 0;
            // Only make survey available if enough time has passed
            if (shouldMakeSurveyAvailable(lastSurveyDate, nextSurveyAvailable)) {
                const surveyStatus = {
                    userId,
                    lastSurveyDate,
                    nextSurveyAvailable: now + (2 * 60 * 1000),
                    hasAvailableSurvey: true,
                    timestamp: now,
                    updateSource: 'scheduled_function'
                };
                // Set survey as available for each user
                updates[`${userId}/surveyStatus`] = surveyStatus;
                // Log the update for each user
                logSurveyUpdate(userId, surveyStatus).catch(console.error);
                console.log(`Making survey available for user ${userId}, last survey was at ${new Date(lastSurveyDate).toISOString()}`);
            }
            else {
                console.log(`Skipping user ${userId}, not enough time passed since last survey at ${new Date(lastSurveyDate).toISOString()}`);
            }
        });
        // Batch update all users
        if (Object.keys(updates).length > 0) {
            await usersRef.update(updates);
            console.log(`Successfully updated survey availability for ${Object.keys(updates).length} users at ${new Date().toISOString()}`);
        }
        else {
            console.log('No users need survey updates at this time');
        }
        return null;
    }
    catch (error) {
        console.error('Error updating survey availability:', error);
        // Log error details
        await admin.database().ref('logs/errors').push({
            error: error instanceof Error ? error.message : 'Unknown error',
            timestamp: Date.now(),
            type: 'survey_availability_error'
        });
        throw error;
    }
});
// Track survey responses
exports.onSurveyResponse = functions.database
    .ref('/users/{userId}/surveyResponses/{responseId}')
    .onCreate(async (snapshot, context) => {
    if (!snapshot.exists())
        return null;
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
    }
    catch (error) {
        console.error('Error archiving survey response:', error);
        if (error instanceof Error) {
            throw error;
        }
        throw new Error('Unknown error occurred while archiving survey response');
    }
});
// For testing: HTTP endpoint to manually trigger the function
exports.triggerSurveyUpdate = functions.https.onRequest(async (req, res) => {
    try {
        const db = admin.database();
        const usersRef = db.ref('users');
        console.log('Manual survey update triggered:', new Date().toISOString());
        const snapshot = await usersRef.once('value');
        const updates = {};
        snapshot.forEach((userSnapshot) => {
            const userId = userSnapshot.key;
            if (!userId)
                return;
            const lastSurveyDate = userSnapshot.child('surveyStatus/lastSurveyDate').val() || 0;
            const nextSurveyAvailable = userSnapshot.child('surveyStatus/nextSurveyAvailable').val() || 0;
            // Only make survey available if enough time has passed
            if (shouldMakeSurveyAvailable(lastSurveyDate, nextSurveyAvailable)) {
                const now = Date.now();
                const surveyStatus = {
                    userId,
                    lastSurveyDate,
                    nextSurveyAvailable: now + (2 * 60 * 1000),
                    hasAvailableSurvey: true,
                    timestamp: now,
                    updateSource: 'manual_trigger'
                };
                updates[`${userId}/surveyStatus`] = surveyStatus;
                // Log the manual update
                logSurveyUpdate(userId, surveyStatus).catch(console.error);
                console.log(`Making survey available for user ${userId}, last survey was at ${new Date(lastSurveyDate).toISOString()}`);
            }
            else {
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
    }
    catch (error) {
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
//# sourceMappingURL=index.js.map