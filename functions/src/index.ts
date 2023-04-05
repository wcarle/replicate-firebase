import * as functions from 'firebase-functions';
import { admin } from './firebaseAdmin';

import axios, { AxiosInstance } from 'axios';
import { defineSecret } from 'firebase-functions/params';
import { ModelConfigFactory } from './models';
import * as config from '../../firebase-config.json';

const webhookURL = `https://${config.region}-${config.projectId}.cloudfunctions.net/predictionWebhook`;
const replicateAPIKey = defineSecret('REPLICATE_API_KEY');

let api: AxiosInstance;

const db = admin.firestore();

export const promptQueueProcessor = functions
  .runWith({ secrets: ['REPLICATE_API_KEY'], timeoutSeconds: 540 })
  .firestore.document('/promptQueue/{docId}')
  .onCreate(async (change) => {
    try {
      if (!api) {
        api = axios.create({
          headers: {
            Authorization: `Token ${replicateAPIKey.value()}`,
            'Content-Type': 'application/json',
          },
        });
      }
      const promptData = change.data();
      if (promptData && promptData.status === 'new') {
        if (!promptData || !promptData.input) {
          console.log(`Invalid prompt: ${promptData.id}`, promptData.input);
          return;
        }

        const modelConfig = ModelConfigFactory.getModelConfig(promptData.model);
        const input = await modelConfig.transformInput(promptData.input);
        console.log(
          `Processing: ${change.id} on model: ${modelConfig.id}:`,
          input,
        );
        const res = await api.post('https://api.replicate.com/v1/predictions', {
          version: modelConfig.id,
          webhook: webhookURL,
          webhook_events_filter: ['completed'],
          input,
        });

        await change.ref.update({
          processingId: res.data.id,
          status: 'processing',
          processingStarted: new Date(),
        });
      }
    } catch (e: any) {
      console.error(e);
      await change.ref.update({
        status: 'done',
        error: e.message ?? 'Unknown error.',
      });
    }
  });

export const predictionWebhook = functions.https.onRequest(async (req, res) => {
  try {
    const id = req.body.id;
    const promptRes = await db
      .collection('promptQueue')
      .where('processingId', '==', id)
      .get();
    const prompt = promptRes.docs.at(0);
    const promptData = prompt?.data();
    console.log(`Processing webhook ${id}`, req.body, promptData);
    if (prompt && promptData && promptData.status === 'processing') {
      if (req.body.output && req.body.output.length > 0) {
        const modelConfig = ModelConfigFactory.getModelConfig(promptData.model);
        const output = await modelConfig.transformOutput(req.body);
        await prompt.ref.update({
          status: 'done',
          output,
          processingFinished: new Date(),
          mimeType: modelConfig.output,
        });
      } else {
        await prompt.ref.update({
          status: 'done',
          error: req.body.error,
          processingFinished: new Date(),
        });
      }
      res.status(200).send('OK');
      return;
    }
    res.status(400).send('Bad Request');
  } catch (e) {
    console.error(e);
    res.status(500).send('Internal Server Error');
  }
});
