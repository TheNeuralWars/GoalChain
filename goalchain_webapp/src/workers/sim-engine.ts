/** Core match simulation engine — runs in Web Worker */

import type { 
  PlayerStats, Team, MatchState, MatchEvent, EventType, SimConfig, CommentaryLine 
} from './types';

const EVENT_TYPES: EventType[] = [
  'KICKOFF', 'PASS', 'SHOT', 'GOAL', 'SAVE', 'FOUL', 'OFFSIDE', 
  'SUBSTITUTION', 'INJURY', 'YELLOW_CARD', 'RED_CARD', 
  'HALFTIME', 'FULLTIME', 'CORNER', 'FREE_KICK', 'PENALTY'
];

const EVENT_WEIGHTS: Record<EventType, number> = {
  KICKOFF: 1,
  PASS: 35,
  SHOT: 8,
  GOAL: 2,
  SAVE: 3,
  FOUL: 12,
  OFFSIDE: 4,
  SUBSTITUTION: 1,
  INJURY: 1,
  YELLOW_CARD: 2,
  RED_CARD: 0.5,
  HALFTIME: 1,
  FULLTIME: 1,
  CORNER: 3,
  FREE_KICK: 5,
  PENALTY: 0.5,
};

const COMMENTARY_TEMPLATES: Record<EventType, string[]> = {
  KICKOFF: [
    "⚽ {homeTeam} vs {awayTeam} — el balón rueda en el GoalChain Stadium!",
    "🎙️ ¡Arranca el partido! {homeTeam} sale con todo contra {awayTeam}.",
    "⚽ Silbato inicial. La tensión se siente en el aire digital.",
  ],
  PASS: [
    "🔄 {playerName} filtra un pase preciso hacia la zona de ataque.",
    "⚡ Pase rápido de {playerName}, el mediocampo se activa.",
    "🎯 {playerName} toca de primera, buscando profundidad.",
    "🔥 Intercambio veloz en el centro del campo, {playerName} distribuye.",
  ],
  SHOT: [
    "💥 ¡DISPARO! {playerName} prueba fortuna desde fuera del área!",
    "🎯 {playerName} se saca un latigazo... ¡va con mucho peligro!",
    "⚽ ¡TIRO A PUERTA! {playerName} no lo duda y fusila.",
    "🔥 {playerName} arma la pierna y manda un misil hacia la escuadra.",
  ],
  GOAL: [
    "⚽⚽⚽ ¡¡¡GOOOOOOL!!! {playerName} marca el {score} para {team}!",
    "🔥🔥🔥 ¡GOLAZO DE {playerName}! {team} se pone {score} arriba!",
    "🎉 ¡EXPLOTA EL ESTADIO! {playerName} anota y la grada enloquece!",
    "⚡ ¡GOL DE ANTOLOGÍA! {playerName} hace magia y celebra con la afición!",
  ],
  SAVE: [
    "🧤 ¡PARADÓN! El portero de {team} vuela y evita el gol de {playerName}!",
    "🛡️ ¡QUÉ REFLEJOS! La manopla salvadora del guardameta de {team}.",
    "🧱 ¡MURO INAQUEBRANTABLE! El cancerbero de {team} blinda la portería.",
    "✋ ¡MANO PROVIDENCIAL! El portero de {team} dice NO al remate de {playerName}.",
  ],
  FOUL: [
    "🟨 Falta de {playerName} sobre el rival. El árbitro pita.",
    "⚠️ Entrada dura de {playerName}, juego parado.",
    "🛑 Falta táctica de {playerName}, frena el contraataque.",
  ],
  OFFSIDE: [
    "🚫 ¡FUERA DE JUEGO! {playerName} se adelantó un paso.",
    "📏 Bandera arriba: posición irregular de {playerName}.",
  ],
  SUBSTITUTION: [
    "🔄 Cambio en {team}: entra {playerName}, sale el dorsal {playerId}.",
    "🔁 Sustitución: {team} refresca el once con {playerName}.",
  ],
  INJURY: [
    "🤕 {playerName} pide la camilla, parece que ha sentido algo.",
    "🩹 Parón médico: {playerName} recibe asistencia en el terreno.",
  ],
  YELLOW_CARD: [
    "🟨 Amarilla para {playerName} por protestar la decisión.",
    "⚠️ Tarjeta amarilla a {playerName}, se calientan los ánimos.",
  ],
  RED_CARD: [
    "🟥 ¡ROJA DIRECTA! {playerName} se va a la caseta antes de tiempo.",
    "🚫 Expulsión: {team} se queda con 10 tras la roja a {playerName}.",
  ],
  HALFTIME: [
    "🍊 DESCANSO. {homeTeam} {homeScore} - {awayScore} {awayTeam}. Análisis táctico en 15 minutos.",
    "⏸️ FIN DE LA PRIMERA PARTE. Marcador: {homeScore}-{awayScore}.",
  ],
  FULLTIME: [
    "🏁 ¡FINAL DEL PARTIDO! {homeTeam} {homeScore} - {awayScore} {awayTeam}.",
    "⏹️ Pita el árbitro. Victoria para {winner} en GoalChain World Cup.",
  ],
  CORNER: [
    "🎯 Córner a favor de {team}. {playerName} prepara el centro.",
    "⚽ Saque de esquina: {team} busca la cabeza de su delantero.",
  ],
  FREE_KICK: [
    "⚖️ Falta al borde del área para {team}. {playerName} se pone delante del balón.",
    "🎯 Tiro libre peligroso: {playerName} mira la portería, mide la distancia.",
  ],
  PENALTY: [
    "⚽¡PENALTI! {playerName} coloca el balón en el punto fatídico.",
    "🎯 Máxima pena para {team}. {playerName} asume la responsabilidad.",
  ],
};

export class SimEngine {
  private config: SimConfig;
  private homeTeam: Team;
  private awayTeam: Team;
  private state: MatchState;
  private eventId = 0;
  private commentaryId = 0;
  private rngSeed = Date.now();
  private lastCommentaryTime = 0;

  constructor(config: SimConfig, homeTeam: Team, awayTeam: Team) {
    this.config = config;
    this.homeTeam = this.cloneTeam(homeTeam);
    this.awayTeam = this.cloneTeam(awayTeam);
    this.state = this.initialState();
  }

  private cloneTeam(team: Team): Team {
    return {
      ...team,
      players: team.players.map(p => ({ ...p })),
    };
  }

  private initialState(): MatchState {
    return {
      minute: 0,
      second: 0,
      half: 1,
      homeScore: 0,
      awayScore: 0,
      ballPosition: { x: 50, y: 50 },
      ballVelocity: { x: 0, y: 0 },
      possession: 'neutral',
      homeTeam: this.homeTeam,
      awayTeam: this.awayTeam,
      eventLog: [],
      commentary: [],
    };
  }

  private seededRandom(): number {
    this.rngSeed = (this.rngSeed * 1664525 + 1013904223) >>> 0;
    return this.rngSeed / 0x100000000;
  }

  private weightedRandomEvent(): EventType {
    const total = Object.values(EVENT_WEIGHTS).reduce((a, b) => a + b, 0);
    let roll = this.seededRandom() * total;
    for (const [event, weight] of Object.entries(EVENT_WEIGHTS)) {
      roll -= weight;
      if (roll <= 0) return event as EventType;
    }
    return 'PASS';
  }

  private getTeamStrength(team: Team): number {
    const activePlayers = team.players.filter(p => !p.isEliminated);
    if (activePlayers.length === 0) return 10;
    const avgSpeed = activePlayers.reduce((a, p) => a + p.speed, 0) / activePlayers.length;
    const avgShot = activePlayers.reduce((a, p) => a + p.shotPower, 0) / activePlayers.length;
    const avgStam = activePlayers.reduce((a, p) => a + p.stamina, 0) / activePlayers.length;
    return (avgSpeed + avgShot + avgStam) / 3;
  }

  private selectPlayer(team: Team, preferAttacker = false): PlayerStats | null {
    const active = team.players.filter(p => !p.isEliminated);
    if (active.length === 0) return null;
    if (preferAttacker) {
      // Bias toward higher shot power
      const sorted = [...active].sort((a, b) => b.shotPower - a.shotPower);
      return sorted[Math.floor(this.seededRandom() * Math.min(3, sorted.length))];
    }
    return active[Math.floor(this.seededRandom() * active.length)];
  }

  private generateEvent(eventType: EventType): MatchEvent {
    const isHomeEvent = this.seededRandom() > 0.5 || this.state.possession === 'home';
    const team = isHomeEvent ? 'home' : 'away';
    const teamObj = isHomeEvent ? this.homeTeam : this.awayTeam;
    const player = this.selectPlayer(teamObj, eventType === 'SHOT' || eventType === 'GOAL');
    const assister = eventType === 'GOAL' ? this.selectPlayer(teamObj) : undefined;

    this.eventId++;
    return {
      id: this.eventId,
      type: eventType,
      minute: this.state.minute,
      second: this.state.second,
      team,
      playerId: player?.playerId,
      playerName: player?.name,
      assisterId: assister?.playerId,
      assisterName: assister?.name,
      x: this.state.ballPosition.x,
      y: this.state.ballPosition.y,
      description: '',
    };
  }

  private applyEventEffects(event: MatchEvent): void {
    const isHome = event.team === 'home';
    
    switch (event.type) {
      case 'GOAL':
        if (isHome) this.state.homeScore++;
        else this.state.awayScore++;
        this.state.possession = 'neutral';
        this.state.ballPosition = { x: 50, y: 50 };
        break;
      case 'SHOT':
      case 'SAVE':
        this.state.possession = isHome ? 'away' : 'home';
        break;
      case 'PASS':
        this.moveBallTowardsGoal(isHome);
        break;
      case 'FOUL':
      case 'OFFSIDE':
        this.state.possession = isHome ? 'away' : 'home';
        break;
      case 'CORNER':
        this.state.ballPosition = isHome ? { x: 5, y: this.seededRandom() < 0.5 ? 10 : 90 } : { x: 95, y: this.seededRandom() < 0.5 ? 10 : 90 };
        break;
      case 'FREE_KICK':
      case 'PENALTY':
        this.state.ballPosition = isHome ? { x: 80, y: 50 } : { x: 20, y: 50 };
        break;
      case 'KICKOFF':
        this.state.possession = 'home';
        this.state.ballPosition = { x: 50, y: 50 };
        break;
      case 'HALFTIME':
        this.state.half = 2;
        this.state.minute = 45;
        this.state.second = 0;
        this.state.possession = 'away';
        this.state.ballPosition = { x: 50, y: 50 };
        break;
      case 'FULLTIME':
        // Match ends
        break;
    }
  }

  private moveBallTowardsGoal(isHome: boolean): void {
    const dir = isHome ? 1 : -1;
    this.state.ballPosition.x = Math.max(0, Math.min(100, this.state.ballPosition.x + dir * (5 + this.seededRandom() * 10)));
    this.state.ballPosition.y = Math.max(5, Math.min(95, this.state.ballPosition.y + (this.seededRandom() - 0.5) * 20));
    this.state.possession = isHome ? 'home' : 'away';
  }

  private generateCommentary(event: MatchEvent): CommentaryLine {
    const templates = COMMENTARY_TEMPLATES[event.type] || ['{description}'];
    const template = templates[Math.floor(this.seededRandom() * templates.length)];
    
    const teamName = event.team === 'home' ? this.homeTeam.name : this.awayTeam.name;
    const oppName = event.team === 'home' ? this.awayTeam.name : this.homeTeam.name;
    const score = event.team === 'home' ? `${this.state.homeScore}-${this.state.awayScore}` : `${this.state.awayScore}-${this.state.homeScore}`;
    const winner = this.state.homeScore > this.state.awayScore ? this.homeTeam.name : this.awayTeam.name;

    let text = template
      .replace('{homeTeam}', this.homeTeam.name)
      .replace('{awayTeam}', this.awayTeam.name)
      .replace('{team}', teamName)
      .replace('{oppTeam}', oppName)
      .replace('{playerName}', event.playerName || 'un jugador')
      .replace('{playerId}', event.playerId || 'XX')
      .replace('{score}', score)
      .replace('{homeScore}', this.state.homeScore.toString())
      .replace('{awayScore}', this.state.awayScore.toString())
      .replace('{winner}', winner)
      .replace('{description}', event.description);

    // Emotion mapping
    let emotion: CommentaryLine['emotion'] = 'neutral';
    if (event.type === 'GOAL') emotion = 'celebration';
    else if (event.type === 'SHOT' || event.type === 'PENALTY' || event.type === 'FREE_KICK') emotion = 'tense';
    else if (event.type === 'SAVE') emotion = 'tense';
    else if (event.type === 'FOUL' || event.type === 'YELLOW_CARD' || event.type === 'RED_CARD') emotion = 'tense';
    else if (event.type === 'HALFTIME' || event.type === 'FULLTIME') emotion = 'analytical';
    else if (event.type === 'PASS') emotion = 'neutral';

    this.commentaryId++;
    return {
      id: this.commentaryId,
      timestamp: Date.now(),
      eventType: event.type,
      text,
      emotion,
      team: event.team,
      playerName: event.playerName,
    };
  }

  public step(): { event?: MatchEvent; commentary?: CommentaryLine; state: MatchState } {
    const elapsedMinutes = (this.state.half - 1) * 45 + this.state.minute;
    const maxMinutes = this.config.matchDuration * 2;

    if (elapsedMinutes >= maxMinutes) {
      if (this.state.eventLog.length === 0 || this.state.eventLog[this.state.eventLog.length - 1].type !== 'FULLTIME') {
        const event = this.generateEvent('FULLTIME');
        this.state.eventLog.push(event);
        const commentary = this.generateCommentary(event);
        this.state.commentary.push(commentary);
        return { event, commentary, state: { ...this.state } };
      }
      return { state: { ...this.state } };
    }

    // Time progression
    const ticksPerMinute = 60000 / this.config.tickRate;
    if (this.eventId % Math.max(1, Math.floor(ticksPerMinute / 10)) === 0) {
      this.state.second += 10;
      if (this.state.second >= 60) {
        this.state.second = 0;
        this.state.minute++;
        if (this.state.minute >= 45 && this.state.half === 1) {
          // Halftime event
          const event = this.generateEvent('HALFTIME');
          this.state.eventLog.push(event);
          const commentary = this.generateCommentary(event);
          this.state.commentary.push(commentary);
          return { event, commentary, state: { ...this.state } };
        }
      }
    }

    // Random event
    if (this.seededRandom() < this.config.eventProbability / 100) {
      const eventType = this.weightedRandomEvent();
      const event = this.generateEvent(eventType);
      this.applyEventEffects(event);
      this.state.eventLog.push(event);

      // Generate commentary at intervals
      const now = Date.now();
      if (now - this.lastCommentaryTime >= this.config.commentaryInterval) {
        const commentary = this.generateCommentary(event);
        this.state.commentary.push(commentary);
        this.lastCommentaryTime = now;
        return { event, commentary, state: { ...this.state } };
      }

      return { event, state: { ...this.state } };
    }

    // Ball physics (simple drift)
    this.state.ballPosition.x += this.state.ballVelocity.x * 0.1;
    this.state.ballPosition.y += this.state.ballVelocity.y * 0.1;
    this.state.ballPosition.x = Math.max(0, Math.min(100, this.state.ballPosition.x));
    this.state.ballPosition.y = Math.max(0, Math.min(100, this.state.ballPosition.y));
    this.state.ballVelocity.x *= 0.98;
    this.state.ballVelocity.y *= 0.98;

    return { state: { ...this.state } };
  }

  public getState(): MatchState {
    return { ...this.state };
  }

  public reset(): void {
    this.state = this.initialState();
    this.eventId = 0;
    this.commentaryId = 0;
    this.lastCommentaryTime = 0;
  }
}