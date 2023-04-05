# Replicate Firebase Implementation

This is a quick start project for building AI powered web apps using Replicate and Firebase

This is a NextJS/Typescript web app built to run on Firebase. It handles all interaction with Replicate APIs to process AI predictions.

After following these setup steps you will have a fully working web app that can run virtually any AI model running on Replicate.

## Setup

### Create a Firebase project

1. Create a Firebase project here: https://console.firebase.google.com/
2. Go to Firebase project settings
3. Under your apps click the add web app button
4. Check the "Also set up Firebase Hosting for this app" checkbox
5. Click Next
6. Copy all values from the `firebaseConfig` object and paste them in the firebase-config.json file. Also set the `region` key to whatever reason your are running your app in (eg `us-central1`) It should look like this:

```json
{
  "apiKey": "YOUR_API_KEY",
  "authDomain": "YOUR_AUTH_DOMAIN",
  "projectId": "YOUR_PROJECT_ID",
  "storageBucket": "YOUR_STORAGE_BUCKET",
  "messagingSenderId": "YOUR_MESSAGE_SENDER_ID",
  "appId": "YOUR_APP_ID",
  "measurementId": "YOUR_MEASUREMENT_ID",
  "region": "YOUR_REGION"
}
```

Also paste the prject ID in the `.firebaserc` file and `deploy.yml files`

```json
{
  "projects": {
    "default": "YOUR_PROJECT_ID"
  }
}
```

```yaml
- name: Deploy website
  uses: FirebaseExtended/action-hosting-deploy@v0
  with:
    repoToken: '${{ secrets.GITHUB_TOKEN }}'
    firebaseServiceAccount: '${{ secrets.FIREBASE_SERVICE_ACCOUNT_DEPLOY }}'
    channelId: live
    projectId: YOUR_PROJECT_ID
```

### Configure the Firebase project

1. Enable Authentication
2. Enable Anonymous auth
3. Create a Firestore Database
4. Enable Firebase Storage
5. Enable Functions
6. Enable Secret Manager: https://console.cloud.google.com/apis/library/secretmanager.googleapis.com

Downlload the Firebase CLI:

```bash
npm install -g firebase-tools
```

Login

```bash
firebase login
```

Deploy hosting

```bash
yarn deploy-hosting
```

Deploy Cloud Functions
_NOTE:_ The first time you deploy hosting it will ask you to paste the `REPLICATE_API_KEY` secret
You can get the secret from here: https://replicate.com/users/YOUR_USERNAME/settings

```bash
yarn deploy-functions
```

### Optional, setup github action deploy

This will deploy to firebase hosting any time the main branch is updated
Create a service account following these instructions: https://github.com/FirebaseExtended/action-hosting-deploy/blob/main/docs/service-account.md
Use the name `FIREBASE_SERVICE_ACCOUNT_DEPLOY` for the secret or update `.github/workflows/deploy.yml` with your service account secret name

## Run Locally

### Install packages

```sh
yarn
```

### Run

```sh
yarn dev
```

### Run Cloud Functions

This is only required if you want to debug the Stable Diffusion integration locally

```sh
yarn serve
```

## Add a new model

### Add model configuration to models.json

To run any model on replicate simply add it to the `models.json` file
For example here is the config for stable diffusion:

```json
{
  "id": "db21e45d3f7023abc2a46ee38a23973f6dce16bb082a930b0c49861f96d1e5bf",
  "key": "stability-ai/stable-diffusion",
  "name": "Stable Diffusion",
  "defaults": {
    "image_dimensions": "768x768",
    "negative_prompt": "",
    "num_outputs": 1,
    "num_inference_steps": 30,
    "guidance_scale": 7.5,
    "scheduler": "K_EULER"
  },
  "output": "image/png",
  "ext": "png",
  "inputTransformers": [],
  "outputTransformers": []
}
```

### Transforming model input and outputs

What can you do with transformers?

- Transform input data to fit the format of the Replicate model
- Make some calculations before running the prediction
- Take the outputs from the webhook response and upload them to your own storage

To do that simply create a new Transformer in the `Transformers.ts` file and add the classname to the `inputTransformers` or `outputTransformers` array in the model config

```ts
/**
 * MaxFramesTransformer
 * Calculate the total frames of the output video based on the passed in duration and fps
 */
export class MaxFramesTransformer extends Transformer {
  /**
   * Apply the transformer to the input props
   * @param {ModelProps} props Input props
   * @return {Promise<ModelProps>} Transformed props
   */
  public async transform(props: ModelProps): Promise<ModelProps> {
    if (props.fps && props.duration) {
      const fps = props.fps as number;
      const duration = props.duration as number;
      props.max_frames = fps * duration;
    }
    return props;
  }
}
```
