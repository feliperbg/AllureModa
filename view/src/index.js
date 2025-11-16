import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css'; // <-- ADICIONE ESTA LINHA
import App from './App';
import { AuthProvider } from './context/AuthContext';

// 1. Pegue o container da DOM
const container = document.getElementById('root');

// 2. Crie a "raiz" (root)
const root = createRoot(container);

// 3. Renderize o App dentro da raiz
root.render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);