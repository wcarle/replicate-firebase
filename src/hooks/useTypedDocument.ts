import getConverter from '@/helpers/firestoreConverter';
import { HasRef } from '@/types';
import { DocumentData, DocumentReference } from 'firebase/firestore';

export function useTypedDocument<T extends HasRef>(
  documentRef: DocumentReference<DocumentData>,
): DocumentReference<T> {
  const userConverter = getConverter<T>();
  const documentRefWithConverter = documentRef.withConverter(userConverter);
  return documentRefWithConverter;
}
