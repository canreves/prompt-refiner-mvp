import React from 'react';
import PromptTester from './components/PromptTester';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        {/* Yazdığımız bileşeni buraya çağırıyoruz */}
        <PromptTester />
      </header>
    </div>
  );
}

export default App;