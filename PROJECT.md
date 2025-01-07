# Virtual Pet App Project Documentation

## Project Overview
A virtual pet application with integrated survey system for user feedback and research data collection.

## Current Architecture

### Frontend
- Next.js 15.0.3 with TypeScript
- React 18.2.0
- Context-based state management (AuthContext, GameContext)
- Tailwind CSS for styling

### Backend Architecture
- MongoDB Atlas for primary data storage
- Mongoose ODM for data modeling
- Firebase Authentication
- Server actions for database operations
- Next.js API routes for metrics endpoints

## Survey System Implementation

### Overview
The survey system will support two types of surveys:
1. Recurring Surveys (Current Focus)
   - Daily release at 12 PM
   - Simple Likert-scale questions
   - Basic email notifications
   - 8:15 PM cutoff time

2. Initial Surveys (Future Enhancement)
   - Triggered on account creation
   - First user interaction post-signup
   - One-time completion requirement
   - Account setup integration

### Core Components

1. User Interface
   - Simple survey page
   - Menu page integration
   - Basic Likert-scale questions
   - Optional open-ended questions
   - Design patterns supporting both survey types

2. Data Storage
   - MongoDB storage for completed responses only
   - Basic survey templates
   - "N/A" for missed surveys
   - Sequential day tracking
   - Schema design supporting both survey types

3. Release & Notification System
   - Basic email notifications (Resend/SendGrid)
   - Daily release at 12 PM
   - 8:15 PM final cutoff time
   - 5-minute intervals for testing
   - Extensible timing system for future survey types

### Technical Requirements

1. Current Implementation
   - Focus on recurring survey functionality
   - Basic email integration
   - Simple MongoDB structure
   - Test-friendly timing system

2. Future-Proofing
   - Survey type identification system
   - Flexible trigger mechanisms
   - Extensible notification system
   - Account creation hooks
   - Survey flow management

### Development Phases

1. Phase 1 (Current)
   - Set up MongoDB structure
   - Create basic API routes
   - Implement survey UI
   - Set up test cron job (5-minute intervals)

2. Phase 2
   - Integrate email service
   - Add production cron schedule
   - Implement survey window logic
   - Add "N/A" handling for missed surveys

3. Phase 3
   - Testing and validation
   - Production deployment
   - Email service configuration
   - Final timing adjustments

## Technical Stack
- Vercel Cron for scheduling
- Basic email service integration
- MongoDB for response storage
- Simple API routes
- Authentication system hooks (for future initial surveys)

## Key Considerations
- User survey responses must be completed in one session
- 15-minute grace period after 8 PM cutoff
- No partial response tracking needed
- Missed surveys marked as "N/A"
- Simple email notifications without delivery tracking
- Test environment uses 5-minute intervals
- Production environment uses daily 12 PM release