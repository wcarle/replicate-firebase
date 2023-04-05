import getConverter from '@/helpers/firestoreConverter';
import { HasRef } from '@/types';
import { DocumentData, Query } from 'firebase/firestore';

export function useTypedQuery<T extends HasRef>(
  queryRef: Query<DocumentData>,
): Query<T> {
  const userConverter = getConverter<T>();
  const queryRefWithConverter = queryRef.withConverter(userConverter);
  return queryRefWithConverter;
}
