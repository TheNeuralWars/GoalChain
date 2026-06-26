/** Shared types between main thread and Web Worker */

export interface PlayerStats {
  playerId: string;
  name: string;
  speed: number;          // 0-255
  shotPower: number;      // 0-255
  stamina: number;        // 0-255
  nationId: number;
  isEliminated: boolean;
  winStreak: number;
  hasShieldJersey: boolean;
}

export interface Team {
  id: string;
  name: string;
  players: PlayerStats[];
  formation: string; // e.g. "4-4-2"
}

export interface MatchState {
  minute: number;
  second: number;
  half: 1 | 2;
  homeScore: number;
  awayScore: number;
  ballPosition: { x: number; y: number }; // 0-100, 0-100
  ballVelocity: { x: number; y: number };
  possession: 'home' | 'away' | 'neutral';
  homeTeam: Team;
  awayTeam: Team;
  eventLog: MatchEvent[];
  commentary: CommentaryLine[];
}

export type EventType = 
  | 'KICKOFF' 
  | 'PASS' 
  | 'SHOT' 
  | 'GOAL' 
  | 'SAVE' 
  | 'FOUL' 
  | 'OFFSIDE' 
  | 'SUBSTITUTION' 
  | 'INJURY' 
  | 'YELLOW_CARD' 
  | 'RED_CARD'
  | 'HALFTIME' 
  | 'FULLTIME'
  | 'CORNER'
  | 'FREE_KICK'
  | 'PENALTY';

export interface MatchEvent {
  id: number;
  type: EventType;
  minute: number;
  second: number;
  team: 'home' | 'away';
  playerId?: string;
  playerName?: string;
  assisterId?: string;
  assisterName?: string;
  x?: number;
  y?: number;
  description: string;
}

export interface CommentaryLine {
  id: number;
  timestamp: number;
  eventType: EventType;
  text: string;
  emotion: 'neutral' | 'excited' | 'tense' | 'celebration' | 'disappointment' | 'analytical';
  team: 'home' | 'away' | 'neutral';
  playerName?: string;
}

export interface SimConfig {
  matchDuration: number; // minutes per half
  tickRate: number;      // ms per simulation tick
  eventProbability: number; // base event probability per tick
  commentaryInterval: number; // ms between commentary lines
}

export interface WorkerMessageMap {
  'INIT': { config: SimConfig; homeTeam: Team; awayTeam: Team };
  'START': void;
  'PAUSE': void;
  'RESUME': void;
  'STOP': void;
  'SET_SPEED': { multiplier: number };
  'GET_STATE': void;
  'SET_TACTIC': { tactic: 'normal' | 'defense_total' | 'attack_total' };
  'ENERGY_BOOST': { playerId: string };
  'SUBSTITUTE': { playerOutId: string; playerIn: PlayerStats };
}

export interface WorkerResponseMap {
  'STATE': MatchState;
  'EVENT': MatchEvent;
  'COMMENTARY': CommentaryLine;
  'ERROR': { message: string };
  'READY': void;
}

export type WorkerIncomingMessage = 
  | { type: 'INIT'; payload: WorkerMessageMap['INIT'] }
  | { type: 'START'; payload: WorkerMessageMap['START'] }
  | { type: 'PAUSE'; payload: WorkerMessageMap['PAUSE'] }
  | { type: 'RESUME'; payload: WorkerMessageMap['RESUME'] }
  | { type: 'STOP'; payload: WorkerMessageMap['STOP'] }
  | { type: 'SET_SPEED'; payload: WorkerMessageMap['SET_SPEED'] }
  | { type: 'GET_STATE'; payload: WorkerMessageMap['GET_STATE'] }
  | { type: 'SET_TACTIC'; payload: WorkerMessageMap['SET_TACTIC'] }
  | { type: 'ENERGY_BOOST'; payload: WorkerMessageMap['ENERGY_BOOST'] }
  | { type: 'SUBSTITUTE'; payload: WorkerMessageMap['SUBSTITUTE'] };

export type WorkerOutgoingMessage = 
  | { type: 'STATE'; payload: WorkerResponseMap['STATE'] }
  | { type: 'EVENT'; payload: WorkerResponseMap['EVENT'] }
  | { type: 'COMMENTARY'; payload: WorkerResponseMap['COMMENTARY'] }
  | { type: 'ERROR'; payload: WorkerResponseMap['ERROR'] }
  | { type: 'READY'; payload: WorkerResponseMap['READY'] };

// WASM interface
export interface WasmCommentaryInput {
  eventType: number;  // enum index
  homeTeamStrength: number;
  awayTeamStrength: number;
  playerSpeed: number;
  playerShotPower: number;
  playerStamina: number;
  matchMinute: number;
  scoreDiff: number;
  isHomeTeam: number; // 0 or 1
}

export interface WasmCommentaryOutput {
  excitementWeight: number;
  tensionWeight: number;
  celebrationWeight: number;
  analyticalWeight: number;
  templateIndex: number;
}