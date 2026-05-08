import { useEffect, useMemo, useRef, useState } from 'react';
import { findAudioPath } from '../utils/audioUtils.js';

export default function AudioButton({ hanzi, compact = false }) {
  const [audioPath, setAudioPath] = useState(null);
  const [loading, setLoading] = useState(true);
  const audioRef = useRef(null);

  useEffect(() => {
    let cancelled = false;

    setAudioPath(null);
    setLoading(Boolean(hanzi));

    if (!hanzi) {
      return () => {
        cancelled = true;
      };
    }

    findAudioPath(hanzi).then((path) => {
      if (!cancelled) {
        setAudioPath(path);
        setLoading(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [hanzi]);

  const label = useMemo(() => {
    if (loading) return compact ? '...' : 'Checking audio';
    return audioPath ? (compact ? 'Play' : 'Play audio') : (compact ? 'No audio' : 'Audio missing');
  }, [audioPath, compact, loading]);

  function playAudio() {
    if (!audioPath) return;
    audioRef.current?.play().catch(() => {});
  }

  return (
    <>
      <button className="iconButton" type="button" onClick={playAudio} disabled={!audioPath || loading} title={label}>
        {compact ? '音' : label}
      </button>
      {audioPath && <audio ref={audioRef} src={audioPath} preload="none" />}
    </>
  );
}
