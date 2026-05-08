function normalizeForAudio(hanzi) {
  return String(hanzi || '')
    .replace(/[～~]/g, '')
    .replace(/[.。·,，、；;：:？！?!（）()《》<>“”"']/g, '')
    .replace(/\s+/g, '')
    .replace(/…+/g, '_')
    .replace(/_+/g, '_');
}

export function getAudioCandidates(hanzi) {
  const normalized = normalizeForAudio(hanzi);
  if (!normalized) return [];

  return [
    `/audio/cmn-${encodeURIComponent(normalized)}.mp3`,
    `/audio/cmn-${encodeURIComponent(normalized)}_.mp3`
  ];
}
