import React from 'react';
import './App.css';
import '@aws-amplify/ui-react/styles.css';
import { Amplify } from 'aws-amplify';
import KYCContainer from './components/KYCContainer'
import awsexports from './aws-exports';
import LivenessTest from './components/LivenessTest';
Amplify.configure(awsexports);

function App() {
  return (
    <div>
        <KYCContainer />
    </div>
  );
}

export default App;