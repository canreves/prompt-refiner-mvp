import React from 'react';
import PromptTester from './components/PromptTester';
import UserCreator from './components/UserCreator';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>🚀 Prompt Refiner MVP</h1>
        
        {/* Kullanıcı oluşturma bileşeni */}
        <UserCreator />
        
        {/* Prompt test bileşeni */}
        <PromptTester />
      </header>
    </div>
  );
}

export default App;