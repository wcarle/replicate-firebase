import { HasRef } from '@/types';
import {
  FirestoreDataConverter,
  WithFieldValue,
  DocumentData,
  QueryDocumentSnapshot,
  SnapshotOptions,
} from 'firebase/firestore';

const converter: FirestoreDataConverter<HasRef> = {
  toFirestore(item: WithFieldValue<HasRef>): DocumentData {
    const toSave = item as any;
    delete toSave.id;
    delete toSave.ref;
    return toSave;
  },
  fromFirestore(
    snapshot: QueryDocumentSnapshot,
    options: SnapshotOptions,
  ): HasRef {
    const data = snapshot.data(options);
    return {
      ...data,
      ref: snapshot.ref,
      id: snapshot.id,
    } as HasRef;
  },
};

export default function getConverter<
  T extends HasRef,
>(): FirestoreDataConverter<T> {
  return converter as FirestoreDataConverter<T>;
}
