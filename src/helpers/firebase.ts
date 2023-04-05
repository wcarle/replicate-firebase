// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { getFirestore } from 'firebase/firestore';
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import * as config from '@/../firebase-config.json';

const app = initializeApp(config);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };
