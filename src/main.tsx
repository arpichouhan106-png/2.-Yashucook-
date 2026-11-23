import { createRoot } from 'react-dom/client';
import './supabaseBridge.ts';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(<App />);
