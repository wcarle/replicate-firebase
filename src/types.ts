import { DocumentReference, Timestamp } from 'firebase/firestore';

export interface UserContextData {
  userId: string;
}

export interface UserOptions {
  userId: string;
}

export interface HasRef {
  createdAt?: Timestamp;
  ref?: DocumentReference;
  id?: string;
}

export interface Prompt extends HasRef {
  output?: string[];
  model: string;
  input: Record<string, string | number | null>;
  status: 'new' | 'processing' | 'done' | 'error';
  mimeType?: string;
  user: DocumentReference;
  error?: string;
}

export interface User extends HasRef {
  id: string;
  ping: Timestamp;
  name?: string;
  image?: string;
  votes?: number;
}

/**
 * Model config json
 */
export type ModelConfigJson = {
  id: string;
  key: string;
  name: string;
  defaults: any;
  output: string;
  ext: string;
  inputTransformers: Array<string>;
  outputTransformers: Array<string>;
};
