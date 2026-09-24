/**
 * cg_pairwise_similarity.mjs -- exposes the NUMBERS behind ContinuityGuard's
 * CG02 consistency pass.
 *
 * The stock CLI only prints a similarity score for shots it FLAGS. For a QC
 * report we also want the scores of the shots that passed, so this reuses the
 * exact same bundled model + preprocessing by importing the package's own
 * modules (no reimplementation, no divergence from CLI semantics) and prints
 * the full pairwise cosine-similarity matrix.
 *
 * Usage:
 *   node cg_pairwise_similarity.mjs <clips-dir> [--fps 1.0] [--threshold 0.88]
 *
 * Zero network: the model ships inside the npm package.
 */
import { dirname, join } from 'node:path';
import { existsSync } from 'node:fs';

const CG_PKG = process.env.CONTINUITYGUARD_PKG
  || '/data/apps/tools/node_modules/continuityguard-cli';

const ffmpegMod = await import(join(CG_PKG, 'dist/ingest/ffmpeg.js'));
const consistencyMod = await import(join(CG_PKG, 'dist/score/consistency.js'));

const { extractFramesFromDirectory, cleanupFrames } = ffmpegMod;
const { getEmbeddingSession, embedShot, cosineSimilarity, parseCharacterName } = consistencyMod;
const THRESHOLD = consistencyMod.CONSISTENCY_SIMILARITY_THRESHOLD;

function parseArgs(argv) {
  const out = { dir: null, fps: 1.0, threshold: THRESHOLD };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--fps') out.fps = Number(argv[++i]);
    else if (a === '--threshold') out.threshold = Number(argv[++i]);
    else if (!a.startsWith('--')) out.dir = a;
  }
  return out;
}

const args = parseArgs(process.argv.slice(2));
if (!args.dir || !existsSync(args.dir)) {
  console.error('usage: node cg_pairwise_similarity.mjs <clips-dir> [--fps N] [--threshold N]');
  process.exit(2);
}

const extracted = await extractFramesFromDirectory(args.dir, { fps: args.fps });
const session = await getEmbeddingSession();

const shots = [];
for (const e of extracted) {
  const embedding = await embedShot(e.framePaths, session);
  shots.push({
    clip: e.clip.name,
    character: parseCharacterName(e.clip.name),
    frames: e.framePaths.length,
    embedding,
  });
}
await cleanupFrames(extracted);

const byCharacter = new Map();
for (const s of shots) {
  if (!s.character) continue;
  if (!byCharacter.has(s.character)) byCharacter.set(s.character, []);
  byCharacter.get(s.character).push(s);
}

const matrix = [];
const perCharacter = {};
for (const [character, bucket] of byCharacter) {
  const pairs = [];
  for (let i = 0; i < bucket.length; i++) {
    for (let j = i + 1; j < bucket.length; j++) {
      const sim = cosineSimilarity(bucket[i].embedding, bucket[j].embedding);
      const row = {
        character,
        clip_a: bucket[i].clip,
        clip_b: bucket[j].clip,
        similarity_score: Number(sim.toFixed(4)),
        threshold: args.threshold,
        flagged: sim < args.threshold,
      };
      pairs.push(row);
      matrix.push(row);
    }
  }
  perCharacter[character] = {
    clips: bucket.map((s) => ({ clip: s.clip, frames: s.frames })),
    pairs,
    min_similarity: pairs.length ? Math.min(...pairs.map((p) => p.similarity_score)) : null,
    mean_similarity: pairs.length
      ? Number((pairs.reduce((a, p) => a + p.similarity_score, 0) / pairs.length).toFixed(4))
      : null,
  };
}

console.log(JSON.stringify({
  directory: args.dir,
  fps: args.fps,
  threshold: args.threshold,
  clips_embedded: shots.map((s) => ({ clip: s.clip, character: s.character, frames: s.frames })),
  unlabeled_clips: shots.filter((s) => !s.character).map((s) => s.clip),
  per_character: perCharacter,
  pairwise: matrix,
}, null, 2));
