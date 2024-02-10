import { useEffect, useRef, useReducer, useState } from 'react';
import { Button } from '../common';

type AudioProgressBarProps = {
  progress: number;
  stopped?: boolean;
}

function AudioProgressBar({ progress, stopped }: AudioProgressBarProps) {
  return (
    <div className="audio-progress-bar">
      <div className={`audio-progress-bar-inner ${stopped ? 'stopped' : ''}`} style={{ translate: `${progress}% 0%` }}></div>
    </div>
  );
}

enum AudioActionType {
  PLAYING,
  LOADING,
  PAUSED,
  STOPPED,
  ERROR
}

type AudioAction = {
  type: AudioActionType
}

type AudioState = {
  playing?: boolean;
  paused?: boolean;
  stopped?: boolean;
  disabled?: boolean;
}

function audioReducer(_: AudioState, action: AudioAction): AudioState {
  switch (action.type) {
    case AudioActionType.ERROR:
    case AudioActionType.LOADING:
      return { disabled: true };
    case AudioActionType.PLAYING:
      return { disabled: false, playing: true, paused: false, stopped: false };
    case AudioActionType.PAUSED:
      return { disabled: false, playing: false, paused: true, stopped: false };
    case AudioActionType.STOPPED:
      return { disabled: false, playing: false, paused: true, stopped: true };
  }
}

type AudioProps = {
  source?: string;
  autoPlay?: boolean;
  onProgress?: (time: number, duration: number) => void;
  onEnd?: () => void;
};

export function Audio({ source, autoPlay, onProgress, onEnd }: AudioProps) {
  const [audioState, dispatch] = useReducer(audioReducer, { disabled: true });
  const [progress, setProgress] = useState<number>(0);
  const audioElement = useRef<HTMLAudioElement>(null);

  const reset = (resetProgress: boolean = true) => {
    audioElement.current?.load();
    if (resetProgress) {
      setProgress(0);
    }
  }

  const stop = (resetProgress: boolean = true) => {
    audioElement.current?.pause();
    reset(resetProgress);
    dispatch({ type: AudioActionType.STOPPED });
  };

  const handleOnCanPlay = () => {
    console.log('can play');
    dispatch({ type: AudioActionType.STOPPED });
  };

  const handleOnTimeUpdate = () => {
    const currentTime = audioElement.current!.currentTime;
    const duration = audioElement.current!.duration;
    const newProgress = (currentTime / duration) * 100;
    setProgress(newProgress);
    onProgress?.(currentTime, duration);
  };

  const handleOnEnded = () => {
    stop(false);
    onEnd?.();
  };

  const handleOnError = () => {
    console.error('error while loading source');
    dispatch({ type: AudioActionType.ERROR });
  }

  const handlePlay = () => {
    audioElement.current?.play();
    if (audioState.stopped) {
      setProgress(0);
    }
    dispatch({ type: AudioActionType.PLAYING });
  }

  const handlePause = () => {
    audioElement.current?.pause();
    dispatch({ type: AudioActionType.PAUSED });
  }

  const handleStop = () => {
    stop();
  }

  useEffect(() => {
    reset();
    dispatch({ type: AudioActionType.LOADING });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [source]);

  useEffect(() => {
    audioElement.current?.addEventListener('canplay', handleOnCanPlay);
    audioElement.current?.addEventListener('timeupdate', handleOnTimeUpdate);
    audioElement.current?.addEventListener('ended', handleOnEnded);
    audioElement.current?.addEventListener('error', handleOnError);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="audio">
      <audio ref={audioElement} src={source} autoPlay={autoPlay} hidden></audio>
      <AudioProgressBar progress={progress} />
      <div className="audio-controls">
        <Button className="audio-controls-button" onClick={handlePlay} disabled={audioState.disabled || audioState.playing}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" />
          </svg>
        </Button>
        <Button className="audio-controls-button" onClick={handlePause} disabled={audioState.disabled || audioState.paused}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25v13.5m-7.5-13.5v13.5" />
          </svg>
        </Button>
        <Button className="audio-controls-button" onClick={handleStop} disabled={audioState.disabled || audioState.stopped}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 7.5A2.25 2.25 0 0 1 7.5 5.25h9a2.25 2.25 0 0 1 2.25 2.25v9a2.25 2.25 0 0 1-2.25 2.25h-9a2.25 2.25 0 0 1-2.25-2.25v-9Z" />
          </svg>
        </Button>
      </div>
    </div>
  );
}