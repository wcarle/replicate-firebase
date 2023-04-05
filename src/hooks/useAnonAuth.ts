import { auth } from '@/helpers/firebase';
import { onAuthStateChanged, signInAnonymously, User } from 'firebase/auth';
import { useEffect, useState } from 'react';

interface AnonAuthState {
  user: User | null;
  errorMessage: string;
}

export function useAnonAuth(): AnonAuthState {
  const [user, setUser] = useState<User | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
    });
    signInAnonymously(auth)
      .then(() => {
        setErrorMessage('');
      })
      .catch((error) => {
        setErrorMessage(error.message);
      });
    return unsubscribe;
  }, []);

  return {
    user,
    errorMessage,
  };
}
