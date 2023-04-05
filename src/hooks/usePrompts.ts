import { useCollectionData } from 'react-firebase-hooks/firestore';
import { db } from '@/helpers/firebase';
import { Prompt } from '@/types';
import { useTypedCollection, useTypedQuery } from '@/hooks';
import {
  CollectionReference,
  collection,
  query,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore';

type PromptInput = Pick<Prompt, 'model' | 'input' | 'user'>;

interface PromptsState {
  prompts?: Prompt[];
  refs: {
    prompts: CollectionReference<Prompt>;
  };
  addPrompt: (prompt: PromptInput) => Promise<void>;
}

export function usePrompts(): PromptsState {
  const allPromptsRef = useTypedCollection<Prompt>(
    collection(db, 'promptQueue'),
  );

  const promptsRef = useTypedQuery<Prompt>(
    query(collection(db, 'promptQueue')),
  );

  const [prompts] = useCollectionData(promptsRef);

  const addPrompt = async (prompt: PromptInput) => {
    await addDoc(allPromptsRef, {
      createdAt: serverTimestamp(),
      status: 'new',
      ...prompt,
    });
  };

  return {
    prompts,
    refs: {
      prompts: allPromptsRef,
    },
    addPrompt,
  };
}
