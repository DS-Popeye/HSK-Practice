import { useEffect, useRef, useState } from 'react';
import { getAudioCandidates } from '../utils/audioUtils.js';

export default function AudioButton({ hanzi, compact = false }) {
  const [status, setStatus] = useState('idle');
  const audioRef = useRef(null);

  useEffect(() => {
    audioRef.current?.pause();
    audioRef.current = null;
    setStatus('idle');
  }, [hanzi]);

  async function tryPlay(src) {
    return new Promise((resolve, reject) => {
      const audio = new Audio();
      audio.preload = 'none';
      audioRef.current = audio;

      const cleanup = () => {
        audio.oncanplaythrough = null;
        audio.onerror = null;
      };

      audio.oncanplaythrough = () => {
        cleanup();
        resolve(audio);
      };
      audio.onerror = () => {
        cleanup();
        reject(new Error('Audio not found'));
      };
      audio.onended = () => {
        setStatus('idle');
        if (audioRef.current === audio) audioRef.current = null;
      };

      audio.src = src;
      audio.play().then(() => {
        cleanup();
        resolve(audio);
      }).catch((error) => {
        cleanup();
        reject(error);
      });
    });
  }

  async function playAudio(event) {
    event.stopPropagation();
    if (!hanzi || status === 'loading') return;

    audioRef.current?.pause();
    setStatus('loading');

    for (const src of getAudioCandidates(hanzi)) {
      try {
        await tryPlay(src);
        setStatus('playing');
        return;
      } catch {
        // Try the next filename candidate.
      }
    }

    audioRef.current = null;
    setStatus('missing');
  }

  const label = {
    idle: compact ? '音' : 'Play audio',
    loading: compact ? '...' : 'Loading...',
    playing: compact ? 'Playing' : 'Playing...',
    missing: compact ? 'No audio' : 'No audio'
  }[status];

  return (
    <button
      className="iconButton"
      type="button"
      onClick={playAudio}
      disabled={!hanzi || status === 'loading' || status === 'missing'}
      title={label}
    >
      {label}
    </button>
  );
}
