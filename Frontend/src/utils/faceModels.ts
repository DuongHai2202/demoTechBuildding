import * as faceapi from 'face-api.js';

// Keep the model files inside the application so face verification does not
// depend on a third-party CDN being available at the construction site.
const MODEL_URL = '/models/face-api';

let loadPromise: Promise<void> | null = null;

export function loadFaceModels(): Promise<void> {
  if (!loadPromise) {
    loadPromise = Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
      faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
      faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
    ])
      .then(() => undefined)
      .catch((error) => {
        // Allow the user to retry after a transient asset/network failure.
        loadPromise = null;
        throw error;
      });
  }

  return loadPromise;
}
