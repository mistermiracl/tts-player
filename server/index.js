const bodyParser = require('body-parser');
const cors = require('cors');
const express = require('express');
const tts = require('@google-cloud/text-to-speech');
const fs = require('fs/promises');
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.text());
app.use(cors());

const ttsClient = new tts.TextToSpeechClient({
  projectId: 'steam-hour-322322',
  keyFile: './credentials.json'
});

const formats = {
  txt: {
    type: 'text/plain',
    payload: 'AMZN\t3232.58\tUSD\nFB\t272.14\tUSD\nAAPL\t142.06\tUSD\nNFLX\t523.28\tUSD'
  },
  html: {
    type: 'text/html',
    payload: `<html>
    <body>
      <div id="heading">
        <h1>Hi</h1>
      </div>
      <div id="paragraphsContainer">
        <p>Listen to any mp3 file by using this service.</p>
        <p>It can handle many different formats.</p>
      </div>
    </body>
    </html>`
  },
  json: {
    type: 'application/json',
    payload: JSON.stringify({
      from: "@somebody",
      channel: "#actual-devs",
      message: "Can you please check the latest PR? I just updated the API",
      timeSent: new Date().getTime(),
    })
  },
}

app.get('/getFormat', (req, res) => {
  const format = req.query.format;
  const responseFormat = formats[format];
  res.header('Content-Type', responseFormat.type);
  res.send(responseFormat.payload);
});

app.post('/tts', async (req, res) => {
  const format = req.query.format;
  const filename = `./${format}.mp3`;
  try {
    await fs.access(filename);
    console.log(`file ${filename} found, sending`);
    return res.sendFile(filename, { root: __dirname });
  } catch (err) {
    console.log(`file ${filename} not found, synthesizing`);
  }
  const ssml = req.body;
  const [speechResponse] = await ttsClient.synthesizeSpeech({
    input: {
      ssml
    },
    voice: {
      languageCode: 'en-US',
      ssmlGender: 'FEMALE'
    },
    audioConfig: {
      audioEncoding: 'MP3'
    }
  });
  const audio = speechResponse.audioContent;
  await fs.writeFile(filename, audio, 'binary');
  res.header('Content-Type', 'audio/mpeg');
  res.send(audio);
});

const port = 8080;
app.listen(port, () => {
  console.log(`Server started on ${port}`);
});
