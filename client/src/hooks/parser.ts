import { useEffect, useState } from 'react';
import { FetchType, useGet } from './fetch';
import { Document as SSMLDocument } from 'ssml-document';

export enum ParseFormat {
  TXT = 'txt',
  HTML = 'html',
  JSON = 'json'
}

function parseTXT(data: string): string {
  const sentences = data.replace(/\t/g, ' ').split('\n');
  const builder = new SSMLDocument();
  for (const s of sentences) {
    builder.s(s);
    builder.up()
  }
  const ssml = builder.render({ pretty: true });
  return ssml;
}

function parseHTML(data: string): string {
  const domParser = new DOMParser();
  const xml = domParser.parseFromString(data, 'text/xml');
  const builder = new SSMLDocument();
  builder.p(xml.getElementById('heading')!.textContent!);
  for (const p of xml.querySelectorAll('#paragraphsContainer > p')) {
    builder.p(p.textContent!);
  }
  const ssml = builder.render();
  return ssml;
}

function parseJSON(data: string): string {
  const json = JSON.parse(data);
  const builder = new SSMLDocument();
  builder.s('From: ' + json.from);
  builder.s('On Channel: ' + json.channel);
  builder.s('At: ' + new Date(json.timeSent).toString());
  builder.p(json.message);
  const ssml = builder.render();
  return ssml;
}

function parse(format: ParseFormat, data: string): string {
  switch (format) {
    case ParseFormat.TXT:
      return parseTXT(data);
    case ParseFormat.HTML:
      return parseHTML(data);
    case ParseFormat.JSON:
      return parseJSON(data);
  }
}

const FormatURL: Record<ParseFormat, string> = {
  [ParseFormat.TXT]: 'http://localhost:8080/getFormat?format=txt',
  [ParseFormat.HTML]: 'http://localhost:8080/getFormat?format=html',
  [ParseFormat.JSON]: 'http://localhost:8080/getFormat?format=json'
}

export function useParser(format?: ParseFormat): [string | undefined, boolean, Error | undefined] {
  const url = format ? FormatURL[format] : undefined;
  const [data, loading, error] = useGet<string>(url, FetchType.TEXT);
  const [parsing, setParsing] = useState<boolean>(false);
  const [ssml, setSSML] = useState<string>();
  const [parserError, setParserError] = useState<Error>();

  useEffect(() => {
    setParserError(error);
  }, [error]);

  useEffect(() => {
    if (!format) {
      setParsing(false);
    }
  }, [format]);

  useEffect(() => {
    setSSML(undefined);
    setParsing(loading);
    if (data && !error) {
      setParsing(true);
      const ssml = parse(format!, data);
      setSSML(ssml);
      setParsing(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  return [ssml, parsing, parserError];
}