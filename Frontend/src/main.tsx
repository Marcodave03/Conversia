import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import Apps from './Apps';
import './App.css'
// import { ChatProvider } from "./hooks/useChat";

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    {/* <ChatProvider> */}
            <App interview_prompt='You are my girlfriend' />
        {/* <Apps/> */}
    {/* </ChatProvider> */}

  </React.StrictMode>
);

