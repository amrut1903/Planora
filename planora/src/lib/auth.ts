import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, User } from 'firebase/auth';
import { app } from './firebase';
import { useAppStore } from '../store/app';
import { loadFromFirestore, syncToFirestore, buildSyncPayload } from './firestoreSync';
import { toast } from 'sonner';

const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// Request Workspace scopes
provider.addScope('https://www.googleapis.com/auth/calendar');
provider.addScope('https://www.googleapis.com/auth/contacts.readonly');
provider.addScope('https://www.googleapis.com/auth/userinfo.profile');
provider.addScope('https://www.googleapis.com/auth/gmail.readonly');

let isSigningIn = false;
let cachedAccessToken: string | null = null;

export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    useAppStore.getState().setUser(user);
    if (user) {
      const storedToken = sessionStorage.getItem('gAccessToken');
      const storedTime = sessionStorage.getItem('gAccessTokenTime');
      const tokenAge = storedTime ? Date.now() - parseInt(storedTime) : Infinity;
      if (storedToken && !cachedAccessToken && tokenAge < 3300 * 1000) {
        cachedAccessToken = storedToken;
      } else if (tokenAge >= 3300 * 1000) {
        sessionStorage.removeItem('gAccessToken');
        sessionStorage.removeItem('gAccessTokenTime');
      }
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        cachedAccessToken = null;
        if (onAuthFailure) onAuthFailure();
      }
      
      const data: any = await loadFromFirestore(user);
      if (data) {
        useAppStore.setState({
          tasks: data.tasks ?? [],
          timetable: data.timetable ?? [],
          goals: data.goals ?? [],
          streak: data.streak ?? 0,
          lastActiveDate: data.lastActiveDate ?? null,
          badges: data.badges ?? [],
          points: data.points ?? 0,
          analytics: data.analytics ?? { totalCompleted: 0, mostProductiveHour: "10:00", onTimeRate: 100 },
          diaryEntries: data.diaryEntries ?? [],
          deadlineDNA: data.deadlineDNA ?? null,
          habitLogs: data.habitLogs ?? [],
        });
        if (data.settings) useAppStore.getState().updateSettings(data.settings);
        if (data.userProfile) useAppStore.getState().setUserProfile(data.userProfile);
        
        toast.success("Data synced from cloud ☁️");
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Failed to get access token from Firebase Auth');
    }

    cachedAccessToken = credential.accessToken;
    sessionStorage.setItem('gAccessToken', cachedAccessToken);
    sessionStorage.setItem('gAccessTokenTime', Date.now().toString());
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Sign in error:', error);
    if (error.code === 'auth/popup-closed-by-user' || error.code === 'auth/popup-blocked') {
      toast.error("Sign-in popup was closed or blocked. If you are in the preview, please try opening the app in a new tab (top right icon) to sign in.");
    } else {
      toast.error(`Sign in failed: ${error.message || error}`);
    }
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const logout = async () => {
  await auth.signOut();
  cachedAccessToken = null;
  sessionStorage.removeItem('gAccessToken');
  sessionStorage.removeItem('gAccessTokenTime');
};

