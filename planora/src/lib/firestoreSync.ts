import { doc, setDoc, getDoc, collection } from 'firebase/firestore';
import { db } from './firebase';
import { User } from 'firebase/auth';

export const syncToFirestore = async (user: User, data: object): Promise<void> => {
  try {
    await setDoc(
      doc(db, 'users', user.uid, 'app', 'state'),
      { ...data, lastSyncedAt: new Date().toISOString() },
      { merge: true }
    );
  } catch (err) {
    console.error('Failed to sync to firestore:', err);
  }
};

export const loadFromFirestore = async (user: User): Promise<object | null> => {
  try {
    const docSnap = await getDoc(doc(db, 'users', user.uid, 'app', 'state'));
    if (docSnap.exists()) {
      return docSnap.data();
    }
    return null;
  } catch (err) {
    console.error('Failed to load from firestore:', err);
    return null;
  }
};

export const buildSyncPayload = (state: any): object => {
  return {
    tasks: state.tasks,
    timetable: state.timetable,
    goals: state.goals,
    streak: state.streak,
    lastActiveDate: state.lastActiveDate,
    badges: state.badges,
    points: state.points,
    analytics: state.analytics,
    settings: state.settings,
    diaryEntries: state.diaryEntries,
    userProfile: state.userProfile,
    deadlineDNA: state.deadlineDNA,
    habitLogs: state.habitLogs
  };
};
