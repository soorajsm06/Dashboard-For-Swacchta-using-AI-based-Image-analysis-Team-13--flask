import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom'; // Import BrowserRouter
import App from './App.tsx';
import './styles/index.css';
import ErrorBoundary from './components/types/ErrorBoundary.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <ErrorBoundary> 
      <App />
      </ErrorBoundary>
    </BrowserRouter>
  </StrictMode>
);
