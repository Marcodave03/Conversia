import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
// import AvTest from './AvTest';
import './App.css'
// import { ChatProvider } from "./hooks/useChat";

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    {/* <ChatProvider> */}
            <App interview_prompt='You are my girlfriend' />
        {/* <AvTest/> */}
    {/* </ChatProvider> */}

  </React.StrictMode>
);

