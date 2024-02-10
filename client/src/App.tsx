import { useState } from 'react';
import { AudioParser } from './components';
import { Audio } from './components/audio';
import { ParseFormat } from './hooks';
import './App.css';

function App() {
  const [source, setSource] = useState<string>();
  const [format, setFormat] = useState<ParseFormat>();

  const handleOnParsed = (format?: ParseFormat, ssml?: string) => {
    setFormat(format);
    setSource(ssml);
  };

  return (
    <main>
      {!!format && <h3>{format}.mp3</h3>}
      <Audio source={source} autoPlay={false} />
      <br />
      <AudioParser onParsed={handleOnParsed} />
    </main>
  )
}

export default App
