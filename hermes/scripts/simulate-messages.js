#!/usr/bin/env node

/**
 * Hermes Message Listener (simulación)
 * Este script simula cómo OpenClaw pasaría mensajes a Hermes
 * 
 * En producción, OpenClaw escribiría el mensaje en un archivo temporal
 * o llamaría directamente a create-brief.js
 */

import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const messages = [
  "Quiero que el webapp muestre transacciones en devnet",
  "Necesito un agente que monitoree el yield del vault",
  "Agregar un dashboard de agentes tokenizados en la página"
];

console.log("📨 Simulando mensajes recibidos desde OpenClaw...\n");

messages.forEach((msg, index) => {
  console.log(`Mensaje ${index + 1}: "${msg}"`);
  try {
    const output = execSync(
      `node ${__dirname}/create-brief.js "${msg}" P2`,
      { encoding: 'utf-8' }
    );
    console.log(output.trim());
  } catch (err) {
    console.error("Error:", err.message);
  }
  console.log("---");
});

console.log("\n✅ Simulación completada.");
