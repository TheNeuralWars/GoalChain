#!/usr/bin/env node

/**
 * Hermes Intake Script v2
 * Convierte mensajes de OpenClaw/WhatsApp en briefs estructurados
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const REPO_ROOT = path.resolve(__dirname, '../..');
const INTAKE_DIR = path.join(REPO_ROOT, 'docs/intake');

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 60);
}

function getToday() {
  return new Date().toISOString().split('T')[0];
}

function createBrief(message, priority = 'P2', owner = 'cursor') {
  const date = getToday();
  const slug = slugify(message);
  const filename = `${date}-${slug}.md`;
  const filepath = path.join(INTAKE_DIR, filename);

  if (fs.existsSync(filepath)) {
    console.log(`⚠️  Brief ya existe: ${filename}`);
    return { filepath, created: false };
  }

  const content = `# ${filename.replace('.md', '')}

- **Status:** draft
- **Priority:** ${priority}
- **Owner:** ${owner}
- **Created:** ${date}

## Objective
${message}

## Context
Mensaje recibido vía WhatsApp / OpenClaw. Completar contexto si es necesario.

## Allowed files
- (definir archivos o carpetas permitidas)

## Out of scope
- (definir qué NO se debe hacer)

## Acceptance criteria
- (definir criterios medibles)

## Test commands
\`\`\`bash
# Agregar comandos de verificación aquí
\`\`\`
`;

  fs.writeFileSync(filepath, content);
  console.log(`✅ Brief creado: docs/intake/${filename}`);
  return { filepath, created: true };
}

const message = process.argv[2];
const priority = process.argv[3] || 'P2';
const owner = process.argv[4] || 'cursor';

if (!message) {
  console.error('Uso: node create-brief.js "mensaje" [P0|P1|P2] [owner]');
  process.exit(1);
}

createBrief(message, priority, owner);
