function normalizeForAudio(hanzi) {
  return String(hanzi)
    .replace(/[～~]/g, '')
    .replace(/[.。·,，、；;：:？！?!（）()《》<>“”"']/g, '')
    .replace(/\s+/g, '')
    .replace(/…+/g, '_')
    .replace(/_+/g, '_');
}

export function getAudioCandidates(hanzi) {
  const encoded = encodeURIComponent(hanzi);
  const normalized = normalizeForAudio(hanzi);
  const paths = [
    `/audio/cmn-${encoded}.mp3`,
    `/audio/cmn-${encoded}_.mp3`
  ];

  if (normalized && normalized !== hanzi) {
    paths.push(`/audio/cmn-${encodeURIComponent(normalized)}.mp3`);
    paths.push(`/audio/cmn-${encodeURIComponent(normalized)}_.mp3`);
  }

  return [...new Set(paths)];
}

export async function findAudioPath(hanzi) {
  for (const path of getAudioCandidates(hanzi)) {
    try {
      const response = await fetch(path, { method: 'HEAD' });
      if (response.ok) return path;
    } catch {
      return null;
    }
  }

  return null;
}
