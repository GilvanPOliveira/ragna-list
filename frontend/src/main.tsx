import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

const App = () => <h1 className='text-2xl text-blue-600'>RagnaList Frontend</h1>;

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode><App /></React.StrictMode>
);
