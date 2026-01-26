# Firebase Setup Instructions for DayScore

## 1. Firebase Console Setup

### Create Project
1. Go to https://console.firebase.google.com/
2. Click "Create a project"
3. Project name: `dayscore-app`
4. Enable Google Analytics (optional)
5. Create project

### Enable Authentication
1. Go to Authentication → Get started
2. Sign-in method → Email/Password → Enable
3. Save

### Enable Firestore Database
1. Go to Firestore Database → Create database
2. Start in production mode with security rules
3. Choose location (closest to you)
4. Done

### Get Configuration
1. Project Settings (gear icon)
2. Your apps → Web app icon
3. App name: `dayscore-client`
4. Copy the firebaseConfig object

## 2. Firestore Security Rules

Go to Firestore Database → Rules and replace with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Tasks - users can only access their own tasks
    match /tasks/{taskId} {
      allow read, write: if request.auth != null && 
        resource.data.userId == request.auth.uid;
      allow create: if request.auth != null && 
        request.resource.data.userId == request.auth.uid;
    }
    
    // Time logs - users can only access their own logs
    match /timeLogs/{logId} {
      allow read, write: if request.auth != null && 
        resource.data.userId == request.auth.uid;
      allow create: if request.auth != null && 
        request.resource.data.userId == request.auth.uid;
    }
    
    // Health data - users can only access their own data
    match /healthData/{dataId} {
      allow read, write: if request.auth != null && 
        resource.data.userId == request.auth.uid;
      allow create: if request.auth != null && 
        request.resource.data.userId == request.auth.uid;
    }
    
    // Mood data - users can only access their own data
    match /moodLogs/{logId} {
      allow read, write: if request.auth != null && 
        resource.data.userId == request.auth.uid;
      allow create: if request.auth != null && 
        request.resource.data.userId == request.auth.uid;
    }
    
    // Screen time data - users can only access their own data
    match /screenTime/{dataId} {
      allow read, write: if request.auth != null && 
        resource.data.userId == request.auth.uid;
      allow create: if request.auth != null && 
        request.resource.data.userId == request.auth.uid;
    }
    
    // Day scores - users can only access their own scores
    match /dayScores/{scoreId} {
      allow read, write: if request.auth != null && 
        resource.data.userId == request.auth.uid;
      allow create: if request.auth != null && 
        request.resource.data.userId == request.auth.uid;
    }
  }
}
```

## 3. Update Environment Variables

Replace the values in `client/.env` with your actual Firebase config:

```env
REACT_APP_FIREBASE_API_KEY=your-actual-api-key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
REACT_APP_FIREBASE_APP_ID=your-app-id
REACT_APP_FIREBASE_MEASUREMENT_ID=your-measurement-id
```

## 4. Test the Setup

1. Restart your React app: `npm start`
2. Try registering a new account
3. Check Firebase Console → Authentication to see the user
4. Check Firestore Database to see user data

## 5. EmailJS Setup (for email verification)

1. Go to https://www.emailjs.com/
2. Create account and service
3. Create email template with variables: `{{to_email}}`, `{{otp_code}}`, `{{to_name}}`
4. Get your service ID, template ID, and keys
5. Update server/.env with your EmailJS credentials

Your EmailJS template should include:
- Subject: "DayScore - Email Verification Code"
- Body: "Your verification code is: {{otp_code}}"