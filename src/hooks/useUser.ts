import { useEffect } from 'react';
import {
  updateDoc,
  doc,
  serverTimestamp,
  setDoc,
  DocumentReference,
  deleteDoc,
} from 'firebase/firestore';
import { useDocumentData } from 'react-firebase-hooks/firestore';
import { db } from '@/helpers/firebase';
import { UserOptions, User } from '@/types';
import { useTypedDocument } from '@/hooks';

interface UsersOptions extends UserOptions {}

interface UsersState {
  user?: User;
  refs: {
    user: DocumentReference<User>;
  };
  update: (name: Partial<User>) => Promise<void>;
  leave: () => Promise<void>;
}

export function useUser(options: UsersOptions): UsersState {
  const { userId } = options;

  const userRef = useTypedDocument<User>(doc(db, 'users', userId));
  const [user] = useDocumentData(userRef);

  useEffect(() => {
    setDoc(
      userRef,
      {
        ping: serverTimestamp(),
      },
      { merge: true },
    );
  }, []);

  const update = async (user: Partial<User>) => {
    await updateDoc(userRef, user);
  };

  const leave = async () => {
    await deleteDoc(userRef);
  };

  return {
    user,
    update,
    leave,
    refs: {
      user: userRef,
    },
  };
}
