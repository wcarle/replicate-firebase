import * as admin from 'firebase-admin';

let app;

if (!app) {
  app = admin.initializeApp();
}

export { admin, app };
