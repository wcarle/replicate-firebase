import getConverter from '@/helpers/firestoreConverter';
import { HasRef } from '@/types';
import { DocumentData, CollectionReference } from 'firebase/firestore';

export function useTypedCollection<T extends HasRef>(
  collectionRef: CollectionReference<DocumentData>,
): CollectionReference<T> {
  const userConverter = getConverter<T>();
  const collectionRefWithConverter = collectionRef.withConverter(userConverter);
  return collectionRefWithConverter;
}
