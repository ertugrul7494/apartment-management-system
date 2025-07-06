import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import Core from './Core'; // Yeni Core bileşenini import et
import './index.css';

const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <Core />
    </StrictMode>
  );
} else {
  console.error("Root element with id 'root' not found in the document.");
}
