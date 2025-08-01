
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import * as pdfjs from 'pdfjs-dist';
import { initializeFirebase } from './services/firebaseService';

// Initialize Firebase
initializeFirebase();

// Set the worker source for pdf.js. Using a CDN link for stability in this environment.
// @ts-ignore
pdfjs.GlobalWorkerOptions.workerSrc = `https://esm.sh/pdfjs-dist@4.4.168/build/pdf.worker.min.mjs`;

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Could not find root element to mount to');
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
