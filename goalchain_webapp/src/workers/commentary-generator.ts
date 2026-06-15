/** Commentary generator with WASM integration */

import type { 
  MatchEvent, EventType, CommentaryLine, WasmCommentaryInput, WasmCommentaryOutput 
} from './types';

export interface CommentaryTemplate {
  eventType: EventType;
  templates: string[];
  weights: {
    excitement: number;
    tension: number;
    celebration: number;
    analytical: number;
  };
}

// Extended templates with more variety
const EXTENDED_TEMPLATES: CommentaryTemplate[] = [
  {
    eventType: 'KICKOFF',
    templates: [
      "⚽ {homeTeam} vs {awayTeam} — el balón rueda en el GoalChain Stadium!",
      "🎙️ ¡Arranca el partido! {homeTeam} sale con todo contra {awayTeam}.",
      "⚽ Silbato inicial. La tensión se siente en el aire digital.",
      "🏟️ Bienvenidos al GoalChain World Cup 2026. {homeTeam} recibe a {awayTeam}.",
    ],
    weights: { excitement: 0.7, tension: 0.2, celebration: 0.1, analytical: 0.0 },
  },
  {
    eventType: 'PASS',
    templates: [
      "🔄 {playerName} filtra un pase preciso hacia la zona de ataque.",
      "⚡ Pase rápido de {playerName}, el mediocampo se activa.",
      "🎯 {playerName} toca de primera, buscando profundidad.",
      "🔥 Intercambio veloz en el centro del campo, {playerName} distribuye.",
      "🧠 Visión de juego: {playerName} ve el desmarque y asiste.",
      "⚡ Uno-dos en la frontal, {playerName} rompe líneas.",
    ],
    weights: { excitement: 0.3, tension: 0.4, celebration: 0.0, analytical: 0.3 },
  },
  {
    eventType: 'SHOT',
    templates: [
      "💥 ¡DISPARO! {playerName} prueba fortuna desde fuera del área!",
      "🎯 {playerName} se saca un latigazo... ¡va con mucho peligro!",
      "⚽ ¡TIRO A PUERTA! {playerName} no lo duda y fusila.",
      "🔥 {playerName} arma la pierna y manda un misil hacia la escuadra.",
      "💣 ¡BOOM! {playerName} saca un trallazo que silba al pasar.",
      "🎯 Remate cruzado de {playerName}, el portero se estira...",
    ],
    weights: { excitement: 0.6, tension: 0.8, celebration: 0.1, analytical: 0.1 },
  },
  {
    eventType: 'GOAL',
    templates: [
      "⚽⚽⚽ ¡¡¡GOOOOOOL!!! {playerName} marca el {score} para {team}!",
      "🔥🔥🔥 ¡GOLAZO DE {playerName}! {team} se pone {score} arriba!",
      "🎉 ¡EXPLOTA EL ESTADIO! {playerName} anota y la grada enloquece!",
      "⚡ ¡GOL DE ANTOLOGÍA! {playerName} hace magia y celebra con la afición!",
      "🏆 ¡GOL DE ORO! {playerName} escribe su nombre en la historia.",
      "🎊 ¡QUÉ GOLAZO! {playerName} la clava en la escuadra. Inalcanzable!",
    ],
    weights: { excitement: 1.0, tension: 0.0, celebration: 1.0, analytical: 0.0 },
  },
  {
    eventType: 'SAVE',
    templates: [
      "🧤 ¡PARADÓN! El portero de {team} vuela y evita el gol de {playerName}!",
      "🛡️ ¡QUÉ REFLEJOS! La manopla salvadora del guardameta de {team}.",
      "🧱 ¡MURO INAQUEBRANTABLE! El cancerbero de {team} blinda la portería.",
      "✋ ¡MANO PROVIDENCIAL! El portero de {team} dice NO al remate de {playerName}.",
      "🧤 ¡ATRAPADA SEGURA! El portero de {team} bloca sin problemas.",
      "🛡️ ¡DESPUÉS DE UNA ESTIRADA ESPECTACULAR! El meta de {team} salva a los suyos.",
    ],
    weights: { excitement: 0.5, tension: 0.9, celebration: 0.1, analytical: 0.2 },
  },
  {
    eventType: 'FOUL',
    templates: [
      "🟨 Falta de {playerName} sobre el rival. El árbitro pita.",
      "⚠️ Entrada dura de {playerName}, juego parado.",
      "🛑 Falta táctica de {playerName}, frena el contraataque.",
      "🟨 {playerName} llega tarde. Amarilla al bolsillo.",
      "⚡ Juego sucio: {playerName} corta la progresión rival con falta.",
    ],
    weights: { excitement: 0.2, tension: 0.6, celebration: 0.0, analytical: 0.4 },
  },
  {
    eventType: 'OFFSIDE',
    templates: [
      "🚫 ¡FUERA DE JUEGO! {playerName} se adelantó un paso.",
      "📏 Bandera arriba: posición irregular de {playerName}.",
      "🚫 Milímetros... {playerName} estaba en posición antirreglamentaria.",
    ],
    weights: { excitement: 0.1, tension: 0.3, celebration: 0.0, analytical: 0.6 },
  },
  {
    eventType: 'SUBSTITUTION',
    templates: [
      "🔄 Cambio en {team}: entra {playerName}, sale el dorsal {playerId}.",
      "🔁 Sustitución: {team} refresca el once con {playerName}.",
      "🔄 Movimientos en el banquillo: {team} da entrada a {playerName}.",
    ],
    weights: { excitement: 0.2, tension: 0.1, celebration: 0.0, analytical: 0.7 },
  },
  {
    eventType: 'INJURY',
    templates: [
      "🤕 {playerName} pide la camilla, parece que ha sentido algo.",
      "🩹 Parón médico: {playerName} recibe asistencia en el terreno.",
      "⚠️ {playerName} se duele. El fisio entra al campo.",
    ],
    weights: { excitement: 0.0, tension: 0.5, celebration: 0.0, analytical: 0.3 },
  },
  {
    eventType: 'YELLOW_CARD',
    templates: [
      "🟨 Amarilla para {playerName} por protestar la decisión.",
      "⚠️ Tarjeta amarilla a {playerName}, se calientan los ánimos.",
      "🟨 El árbitro amonesta a {playerName} por entrada tardía.",
    ],
    weights: { excitement: 0.2, tension: 0.5, celebration: 0.0, analytical: 0.3 },
  },
  {
    eventType: 'RED_CARD',
    templates: [
      "🟥 ¡ROJA DIRECTA! {playerName} se va a la caseta antes de tiempo.",
      "🚫 Expulsión: {team} se queda con 10 tras la roja a {playerName}.",
      "🟥 ¡SE VA A LA DUCHA! {playerName} deja a su equipo con uno menos.",
    ],
    weights: { excitement: 0.8, tension: 0.9, celebration: 0.0, analytical: 0.3 },
  },
  {
    eventType: 'HALFTIME',
    templates: [
      "🍊 DESCANSO. {homeTeam} {homeScore} - {awayScore} {awayTeam}. Análisis táctico en 15 minutos.",
      "⏸️ FIN DE LA PRIMERA PARTE. Marcador: {homeScore}-{awayScore}.",
      "📊 Intermedio: {homeTeam} {homeScore}-{awayScore} {awayTeam}. Estadísticas al descanso.",
    ],
    weights: { excitement: 0.1, tension: 0.2, celebration: 0.0, analytical: 0.8 },
  },
  {
    eventType: 'FULLTIME',
    templates: [
      "🏁 ¡FINAL DEL PARTIDO! {homeTeam} {homeScore} - {awayScore} {awayTeam}.",
      "⏹️ Pita el árbitro. Victoria para {winner} en GoalChain World Cup.",
      "🏆 ¡TERMINA EL ENCUENTRO! {winner} se lleva los tres puntos.",
      "⚽ Final. {homeTeam} {homeScore}-{awayScore} {awayTeam}. ¡Qué partidazo!",
    ],
    weights: { excitement: 0.6, tension: 0.0, celebration: 0.7, analytical: 0.4 },
  },
  {
    eventType: 'CORNER',
    templates: [
      "🎯 Córner a favor de {team}. {playerName} prepara el centro.",
      "⚽ Saque de esquina: {team} busca la cabeza de su delantero.",
      "🎯 Córner cerrado: {playerName} la pone al corazón del área.",
    ],
    weights: { excitement: 0.4, tension: 0.5, celebration: 0.0, analytical: 0.2 },
  },
  {
    eventType: 'FREE_KICK',
    templates: [
      "⚖️ Falta al borde del área para {team}. {playerName} se pone delante del balón.",
      "🎯 Tiro libre peligroso: {playerName} mira la portería, mide la distancia.",
      "⚽ Falta frontal: {playerName} buscará la escuadra o el pase.",
    ],
    weights: { excitement: 0.5, tension: 0.7, celebration: 0.0, analytical: 0.2 },
  },
  {
    eventType: 'PENALTY',
    templates: [
      "⚽¡PENALTI! {playerName} coloca el balón en el punto fatídico.",
      "🎯 Máxima pena para {team}. {playerName} asume la responsabilidad.",
      "⚖️ Penalti a favor de {team}. {playerName} vs el portero. Duelo decisivo.",
    ],
    weights: { excitement: 0.9, tension: 1.0, celebration: 0.1, analytical: 0.1 },
  },
];

export class CommentaryGenerator {
  private wasmModule: WebAssembly.Module | null = null;
  private wasmInstance: WebAssembly.Instance | null = null;
  private rngSeed = Date.now() + 1;
  private templateIndices: Map<EventType, number[]> = new Map();

  constructor() {
    this.prepareTemplateIndices();
  }

  private prepareTemplateIndices(): void {
    for (const ct of EXTENDED_TEMPLATES) {
      const indices = ct.templates.map((_, i) => i);
      this.templateIndices.set(ct.eventType, indices);
    }
  }

  private seededRandom(): number {
    this.rngSeed = (this.rngSeed * 1664525 + 1013904223) >>> 0;
    return this.rngSeed / 0x100000000;
  }

  /** Initialize WASM module from compiled .wasm bytes */
  async initWasm(wasmBytes: Uint8Array): Promise<boolean> {
    try {
      this.wasmModule = await WebAssembly.compile(wasmBytes);
      this.wasmInstance = await WebAssembly.instantiate(this.wasmModule);
      return true;
    } catch (e) {
      console.warn('[CommentaryGenerator] WASM init failed, using JS fallback:', e);
      return false;
    }
  }

  /** Initialize WASM from .wat text (for development) */
  async initWasmFromWat(wat: string): Promise<boolean> {
    try {
      const wasmBytes = this.watToWasm(wat);
      return await this.initWasm(wasmBytes);
    } catch (e) {
      console.warn('[CommentaryGenerator] WAT parse failed:', e);
      return false;
    }
  }

  /** Minimal WAT to WASM binary converter (subset for our use case) */
  private watToWasm(wat: string): Uint8Array {
    // Simple parser for our specific WAT format
    // In production, use `wabt` or compile at build time
    // This is a placeholder that returns a minimal valid WASM module
    // with our commentary parser function exported
    
    // For now, return empty - WASM will be loaded from compiled .wasm file
    console.warn('[CommentaryGenerator] watToWasm not implemented - load .wasm directly');
    return new Uint8Array();
  }

  /** Generate commentary for an event using WASM weights or JS fallback */
  generate(
    event: MatchEvent,
    context: {
      homeTeam: string;
      awayTeam: string;
      homeScore: number;
      awayScore: number;
      minute: number;
      half: number;
    }
  ): CommentaryLine {
    const templateData = EXTENDED_TEMPLATES.find(t => t.eventType === event.type);
    if (!templateData) {
      return this.fallbackCommentary(event, context);
    }

    // Get WASM weights if available
    let weights = templateData.weights;
    let templateIndex = 0;

    if (this.wasmInstance) {
      try {
        const wasmWeights = this.callWasmParser(event, context);
        weights = {
          excitement: wasmWeights.excitementWeight,
          tension: wasmWeights.tensionWeight,
          celebration: wasmWeights.celebrationWeight,
          analytical: wasmWeights.analyticalWeight,
        };
        templateIndex = wasmWeights.templateIndex % templateData.templates.length;
      } catch (e) {
        console.warn('[CommentaryGenerator] WASM call failed, using JS:', e);
        templateIndex = Math.floor(this.seededRandom() * templateData.templates.length);
      }
    } else {
      templateIndex = Math.floor(this.seededRandom() * templateData.templates.length);
    }

    // Select template based on weights (weighted random)
    const template = this.selectWeightedTemplate(templateData, weights, templateIndex);
    
    return this.renderCommentary(template, event, context, weights);
  }

  private selectWeightedTemplate(
    data: CommentaryTemplate,
    weights: CommentaryTemplate['weights'],
    preferredIndex: number
  ): string {
    // If WASM gave a strong preference, use it
    if (weights.excitement > 0.8 && preferredIndex < data.templates.length) {
      return data.templates[preferredIndex];
    }
    // Otherwise weighted random
    const totalTemplates = data.templates.length;
    const roll = this.seededRandom();
    const selectedIndex = Math.floor(roll * totalTemplates);
    return data.templates[Math.min(selectedIndex, totalTemplates - 1)];
  }

  private renderCommentary(
    template: string,
    event: MatchEvent,
    context: any,
    weights: CommentaryTemplate['weights']
  ): CommentaryLine {
    const teamName = event.team === 'home' ? context.homeTeam : context.awayTeam;
    const oppName = event.team === 'home' ? context.awayTeam : context.homeTeam;
    const score = event.team === 'home' 
      ? `${context.homeScore}-${context.awayScore}` 
      : `${context.awayScore}-${context.homeScore}`;
    const winner = context.homeScore > context.awayScore ? context.homeTeam : context.awayTeam;

    const text = template
      .replace('{homeTeam}', context.homeTeam)
      .replace('{awayTeam}', context.awayTeam)
      .replace('{team}', teamName)
      .replace('{oppTeam}', oppName)
      .replace('{playerName}', event.playerName || 'un jugador')
      .replace('{playerId}', event.playerId || 'XX')
      .replace('{score}', score)
      .replace('{homeScore}', context.homeScore.toString())
      .replace('{awayScore}', context.awayScore.toString())
      .replace('{winner}', winner)
      .replace('{minute}', context.minute.toString())
      .replace('{half}', context.half.toString());

    // Determine emotion from weights
    let emotion: CommentaryLine['emotion'] = 'neutral';
    const maxWeight = Math.max(weights.excitement, weights.tension, weights.celebration, weights.analytical);
    if (weights.celebration === maxWeight && weights.celebration > 0.5) emotion = 'celebration';
    else if (weights.excitement === maxWeight && weights.excitement > 0.6) emotion = 'excited';
    else if (weights.tension === maxWeight && weights.tension > 0.6) emotion = 'tense';
    else if (weights.analytical === maxWeight && weights.analytical > 0.5) emotion = 'analytical';
    else if (event.type === 'GOAL') emotion = 'celebration';
    else if (event.type === 'SHOT' || event.type === 'PENALTY') emotion = 'tense';

    return {
      id: Date.now() + Math.floor(this.seededRandom() * 1000),
      timestamp: Date.now(),
      eventType: event.type,
      text,
      emotion,
      team: event.team,
      playerName: event.playerName,
    };
  }

  private callWasmParser(event: MatchEvent, context: any): WasmCommentaryOutput {
    if (!this.wasmInstance) throw new Error('WASM not initialized');

    const memory = this.wasmInstance.exports.memory as WebAssembly.Memory;
    const parseFn = this.wasmInstance.exports.parse_commentary as (
      eventType: number,
      homeStrength: number,
      awayStrength: number,
      playerSpeed: number,
      playerShotPower: number,
      playerStamina: number,
      matchMinute: number,
      scoreDiff: number,
      isHomeTeam: number,
      outputPtr: number
    ) => void;

    // Allocate output buffer in WASM memory
    const outputPtr = (this.wasmInstance.exports.alloc as (size: number) => number)(64);
    
    const isHome = event.team === 'home' ? 1 : 0;
    const homeStrength = 100; // Would compute from team stats
    const awayStrength = 100;
    const playerSpeed = 128; // Would come from player data
    const playerShotPower = 128;
    const playerStamina = 128;
    const scoreDiff = context.homeScore - context.awayScore;

    parseFn(
      this.eventTypeToIndex(event.type),
      homeStrength,
      awayStrength,
      playerSpeed,
      playerShotPower,
      playerStamina,
      context.minute,
      scoreDiff,
      isHome,
      outputPtr
    );

    // Read results from memory
    const view = new Float64Array(memory.buffer, outputPtr, 5);
    const result: WasmCommentaryOutput = {
      excitementWeight: view[0],
      tensionWeight: view[1],
      celebrationWeight: view[2],
      analyticalWeight: view[3],
      templateIndex: Math.floor(view[4]),
    };

    // Free allocated memory
    (this.wasmInstance.exports.free as (ptr: number) => void)(outputPtr);
    return result;
  }

  private eventTypeToIndex(type: EventType): number {
    const types: EventType[] = [
      'KICKOFF', 'PASS', 'SHOT', 'GOAL', 'SAVE', 'FOUL', 'OFFSIDE',
      'SUBSTITUTION', 'INJURY', 'YELLOW_CARD', 'RED_CARD',
      'HALFTIME', 'FULLTIME', 'CORNER', 'FREE_KICK', 'PENALTY'
    ];
    return types.indexOf(type);
  }

  private fallbackCommentary(event: MatchEvent, context: any): CommentaryLine {
    const templates = {
      'GOAL': [`⚽ ¡GOOOL! ${event.playerName} marca para ${context.homeTeam}!`],
      'SHOT': [`💥 ¡Disparo de ${event.playerName}!`],
      'SAVE': [`🧤 ¡Parada del portero!`],
      'PASS': [`🔄 Pase de ${event.playerName}`],
    } as Record<string, string[]>;

    const template = (templates[event.type] || [`${event.type} event`])[0];
    return {
      id: Date.now(),
      timestamp: Date.now(),
      eventType: event.type,
      text: template,
      emotion: 'neutral',
      team: event.team,
      playerName: event.playerName,
    };
  }
}

// Export singleton for worker use
export const commentaryGenerator = new CommentaryGenerator();