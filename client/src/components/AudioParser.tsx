import { useEffect, useRef, useState } from 'react';
import { ParseFormat, useParser } from '../hooks/parser';
import { useTTS } from '../hooks/tts';
import { Button, Select } from './common';

type AudioParserProps = {
  onParsed: (format?: ParseFormat, ssml?: string) => void;
}

export function AudioParser({ onParsed }: AudioParserProps) {
  const [selectedFormat, setSelectedFormat] = useState<ParseFormat>();
  const [ssml, parsing] = useParser(selectedFormat);
  const [speechUrl, ttsLoading] = useTTS(ssml);
  const formatSelect = useRef<HTMLSelectElement>(null);

  const handleParse = () => {
    setSelectedFormat(formatSelect.current?.value as ParseFormat);
  }

  useEffect(() => {
    onParsed(selectedFormat, speechUrl);
  }, [onParsed, selectedFormat, speechUrl]);

  return (
    <>
      <div className="audio-parser">
        <Select className="audio-parser-select" defaultValue="" ref={formatSelect}>
          <option value="" disabled>Pick a format</option>
          <option value={ParseFormat.TXT}>TXT</option>
          <option value={ParseFormat.HTML}>HTML</option>
          <option value={ParseFormat.JSON}>JSON</option>
        </Select>
        <Button className="audio-parser-button" onClick={handleParse}>Fetch, Parse & Play</Button>
      </div>
      {parsing && <div className="audio-parser-message">Parsing...</div>}
      {ttsLoading && <div className="audio-parser-message">TTS Loading...</div>}
    </>
  );
}
