import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';

// Collections
const COLLECTIONS = {
  USERS: 'users',
  TASKS: 'tasks',
  TIME_LOGS: 'timeLogs',
  HEALTH_DATA: 'healthData',
  MOOD_LOGS: 'moodLogs',
  SCREEN_TIME: 'screenTime',
  DAY_SCORES: 'dayScores'
};

// Generic CRUD operations
export const createDocument = async (collectionName, data, userId = null) => {
  try {
    const docData = {
      ...data,
      ...(userId && { userId }),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    const docRef = await addDoc(collection(db, collectionName), docData);
    return { success: true, id: docRef.id };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const getDocument = async (collectionName, docId) => {
  try {
    const docRef = doc(db, collectionName, docId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { success: true, data: { id: docSnap.id, ...docSnap.data() } };
    } else {
      return { success: false, error: 'Document not found' };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const updateDocument = async (collectionName, docId, data) => {
  try {
    const docRef = doc(db, collectionName, docId);
    await updateDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp()
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const deleteDocument = async (collectionName, docId) => {
  try {
    const docRef = doc(db, collectionName, docId);
    await deleteDoc(docRef);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// User-specific queries
export const getUserDocuments = async (collectionName, userId, orderByField = 'createdAt', limitCount = null) => {
  try {
    let q = query(
      collection(db, collectionName),
      where('userId', '==', userId),
      orderBy(orderByField, 'desc')
    );
    
    if (limitCount) {
      q = query(q, limit(limitCount));
    }
    
    const querySnapshot = await getDocs(q);
    const documents = [];
    
    querySnapshot.forEach((doc) => {
      documents.push({ id: doc.id, ...doc.data() });
    });
    
    return { success: true, data: documents };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Real-time listeners
export const subscribeToUserDocuments = (collectionName, userId, callback, orderByField = 'createdAt') => {
  const q = query(
    collection(db, collectionName),
    where('userId', '==', userId),
    orderBy(orderByField, 'desc')
  );
  
  return onSnapshot(q, (querySnapshot) => {
    const documents = [];
    querySnapshot.forEach((doc) => {
      documents.push({ id: doc.id, ...doc.data() });
    });
    callback(documents);
  });
};

// Specific service functions for DayScore app

// Tasks
export const createTask = (taskData, userId) => 
  createDocument(COLLECTIONS.TASKS, taskData, userId);

export const getUserTasks = (userId) => 
  getUserDocuments(COLLECTIONS.TASKS, userId);

export const updateTask = (taskId, taskData) => 
  updateDocument(COLLECTIONS.TASKS, taskId, taskData);

export const deleteTask = (taskId) => 
  deleteDocument(COLLECTIONS.TASKS, taskId);

// Time Logs
export const createTimeLog = (timeLogData, userId) => 
  createDocument(COLLECTIONS.TIME_LOGS, timeLogData, userId);

export const getUserTimeLogs = (userId) => 
  getUserDocuments(COLLECTIONS.TIME_LOGS, userId);

// Health Data
export const createHealthData = (healthData, userId) => 
  createDocument(COLLECTIONS.HEALTH_DATA, healthData, userId);

export const getUserHealthData = (userId) => 
  getUserDocuments(COLLECTIONS.HEALTH_DATA, userId);

// Mood Logs
export const createMoodLog = (moodData, userId) => 
  createDocument(COLLECTIONS.MOOD_LOGS, moodData, userId);

export const getUserMoodLogs = (userId) => 
  getUserDocuments(COLLECTIONS.MOOD_LOGS, userId);

// Screen Time
export const createScreenTime = (screenTimeData, userId) => 
  createDocument(COLLECTIONS.SCREEN_TIME, screenTimeData, userId);

export const getUserScreenTime = (userId) => 
  getUserDocuments(COLLECTIONS.SCREEN_TIME, userId);

// Day Scores
export const createDayScore = (dayScoreData, userId) => 
  createDocument(COLLECTIONS.DAY_SCORES, dayScoreData, userId);

export const getUserDayScores = (userId) => 
  getUserDocuments(COLLECTIONS.DAY_SCORES, userId);

export { COLLECTIONS };