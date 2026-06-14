export function hashSeed(parts: (string | number)[]): number {
  let hash = 2166136261;

  for (const part of parts) {
    const text = String(part);
    for (let i = 0; i < text.length; i++) {
      hash ^= text.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }
  }

  return hash >>> 0;
}

export function seededUnitFloat(seed: number, ...parts: (string | number)[]): number {
  const hash = hashSeed([seed, ...parts]);
  return (hash % 10_000) / 10_000;
}

export function createSeededRng(seed: number) {
  let state = seed >>> 0;

  return () => {
    state = Math.imul(state ^ (state >>> 15), state | 1);
    state ^= state + Math.imul(state ^ (state >>> 7), state | 61);
    return ((state ^ (state >>> 14)) >>> 0) / 4294967296;
  };
}
