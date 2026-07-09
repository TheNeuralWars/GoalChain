/** React hook for Match Simulator Web Worker communication */
import { useEffect, useRef, useState, useCallback } from 'react';
const DEFAULT_CONFIG = {
    matchDuration: 45,
    tickRate: 100,
    eventProbability: 3,
    commentaryInterval: 2000,
};
export function useMatchSim() {
    const workerRef = useRef(null);
    const [state, setState] = useState(null);
    const [events, setEvents] = useState([]);
    const [commentary, setCommentary] = useState([]);
    const [isRunning, setIsRunning] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);
    const [speed, setSpeed] = useState(1);
    const eventIdRef = useRef(0);
    const commentaryIdRef = useRef(0);
    // Initialize worker
    useEffect(() => {
        // Create worker from the match-sim.worker.ts
        // Using inline blob to avoid separate file issues in dev
        const workerCode = `
      // Match Sim Worker - Inline version for development
      const SimEngine = (function() {
        const EVENT_TYPES = ['KICKOFF','PASS','SHOT','GOAL','SAVE','FOUL','OFFSIDE','SUBSTITUTION','INJURY','YELLOW_CARD','RED_CARD','HALFTIME','FULLTIME','CORNER','FREE_KICK','PENALTY'];
        const EVENT_WEIGHTS = { KICKOFF: 1, PASS: 35, SHOT: 8, GOAL: 2, SAVE: 3, FOUL: 12, OFFSIDE: 4, SUBSTITUTION: 1, INJURY: 1, YELLOW_CARD: 2, RED_CARD: 0.5, HALFTIME: 1, FULLTIME: 1, CORNER: 3, FREE_KICK: 5, PENALTY: 0.5 };
        
        class Engine {
          constructor(config, homeTeam, awayTeam) {
            this.config = config;
            this.homeTeam = JSON.parse(JSON.stringify(homeTeam));
            this.awayTeam = JSON.parse(JSON.stringify(awayTeam));
            this.state = this.initialState();
            this.eventId = 0;
            this.commentaryId = 0;
            this.rngSeed = Date.now();
            this.lastCommentaryTime = 0;
            this.homeTactic = 'normal';
          }
          
          initialState() {
            return {
              minute: 0, second: 0, half: 1,
              homeScore: 0, awayScore: 0,
              ballPosition: { x: 50, y: 50 },
              ballVelocity: { x: 0, y: 0 },
              possession: 'neutral',
              homeTeam: this.homeTeam,
              awayTeam: this.awayTeam,
              eventLog: [],
              commentary: []
            };
          }
          
          seededRandom() {
            this.rngSeed = (this.rngSeed * 1664525 + 1013904223) >>> 0;
            return this.rngSeed / 0x100000000;
          }
          
          getPlayerEffectiveSpeed(player, teamId) {
            const tirednessFactor = 0.5 + 0.5 * (player.stamina / 255);
            let speed = player.speed * tirednessFactor;
            if (teamId === 'home' && this.homeTactic === 'attack_total') {
              const isAttacker = player.shotPower >= 200 || player.role === 'Delantero' || player.position === 'FWD';
              if (isAttacker) speed *= 1.3;
            }
            return Math.min(255, speed);
          }
          
          getPlayerEffectiveShotPower(player, teamId) {
            const tirednessFactor = 0.5 + 0.5 * (player.stamina / 255);
            let shot = player.shotPower * tirednessFactor;
            if (teamId === 'home' && this.homeTactic === 'attack_total') {
              const isAttacker = player.shotPower >= 200 || player.role === 'Delantero' || player.position === 'FWD';
              if (isAttacker) shot *= 1.3;
            }
            return Math.min(255, shot);
          }
          
          getTeamStrength(team) {
            const active = team.players.filter(p => !p.isEliminated);
            if (active.length === 0) return 10;
            const avgSpeed = active.reduce((a, p) => a + this.getPlayerEffectiveSpeed(p, team.id), 0) / active.length;
            const avgShot = active.reduce((a, p) => a + this.getPlayerEffectiveShotPower(p, team.id), 0) / active.length;
            const avgStam = active.reduce((a, p) => a + p.stamina, 0) / active.length;
            return (avgSpeed + avgShot + avgStam) / 3;
          }
          
          selectPlayer(team, preferAttacker) {
            const active = team.players.filter(p => !p.isEliminated);
            if (active.length === 0) return null;
            if (preferAttacker) {
              const sorted = [...active].sort((a, b) => b.shotPower - a.shotPower);
              return sorted[Math.floor(this.seededRandom() * Math.min(3, sorted.length))];
            }
            return active[Math.floor(this.seededRandom() * active.length)];
          }
          
          weightedRandomEvent() {
            const total = Object.values(EVENT_WEIGHTS).reduce((a, b) => a + b, 0);
            let roll = this.seededRandom() * total;
            for (const [event, weight] of Object.entries(EVENT_WEIGHTS)) {
              roll -= weight;
              if (roll <= 0) return event;
            }
            return 'PASS';
          }
          
          isHomeEvent() {
            const activeHome = this.homeTeam.players.filter(p => !p.isEliminated);
            const activeAway = this.awayTeam.players.filter(p => !p.isEliminated);

            const homeSpeedAvg = activeHome.length > 0
              ? activeHome.reduce((sum, p) => sum + this.getPlayerEffectiveSpeed(p, 'home'), 0) / activeHome.length
              : 100;
            const awaySpeedAvg = activeAway.length > 0
              ? activeAway.reduce((sum, p) => sum + this.getPlayerEffectiveSpeed(p, 'away'), 0) / activeAway.length
              : 100;

            let homeTacticFactor = 1.0;
            if (this.homeTactic === 'attack_total') {
              homeTacticFactor = 1.3;
            } else if (this.homeTactic === 'defense_total') {
              homeTacticFactor = 0.6;
            }

            const homePower = homeSpeedAvg * homeTacticFactor;
            const awayPower = awaySpeedAvg;
            const total = homePower + awayPower;

            return this.seededRandom() < (homePower / total);
          }
          
          decayStamina() {
            const baseDecay = 0.4;
            const homeDecay = this.homeTactic === 'attack_total' ? baseDecay * 2 : baseDecay;
            const awayDecay = baseDecay;

            this.homeTeam.players.forEach(p => {
              if (!p.isEliminated) {
                const resistance = 1.5 - (p.stamina / 255);
                p.stamina = Math.max(0, p.stamina - homeDecay * resistance);
              }
            });

            this.awayTeam.players.forEach(p => {
              if (!p.isEliminated) {
                const resistance = 1.5 - (p.stamina / 255);
                p.stamina = Math.max(0, p.stamina - awayDecay * resistance);
              }
            });
          }
          
          setTactic(tactic) {
            this.homeTactic = tactic;
            let text = '';
            if (tactic === 'defense_total') {
              text = "🎙️ [IA Commentator]: ¡Defensa Total activada! El manager ordena colgarse del travesaño para proteger el marcador.";
            } else if (tactic === 'attack_total') {
              text = "🎙️ [IA Commentator]: ¡El manager ordena adelantar líneas! ¡Ataque Total activado! El equipo corre a máxima velocidad pero la fatiga acecha...";
            } else {
              text = "🎙️ [IA Commentator]: El manager reestablece el esquema táctico original para equilibrar el juego.";
            }
            return this.injectCommentary(text, 'analytical', 'SUBSTITUTION', 'home');
          }
          
          applyEnergyBoost(playerId) {
            const player = this.homeTeam.players.find(p => p.playerId === playerId);
            if (!player) return null;
            player.stamina = Math.min(255, player.stamina + 0.45 * 255);
            const text = "🎙️ [IA Commentator]: ¡Inyección de energía premium! El manager gasta 15 $GCH para revitalizar la stamina de " + player.name + "!";
            return this.injectCommentary(text, 'excited', 'INJURY', 'home', player.name);
          }
          
          substitutePlayer(playerOutId, playerIn) {
            const idx = this.homeTeam.players.findIndex(p => p.playerId === playerOutId);
            if (idx === -1) return null;
            const playerOut = this.homeTeam.players[idx];
            this.homeTeam.players[idx] = JSON.parse(JSON.stringify(playerIn));
            const text = "🎙️ [IA Commentator]: ¡Cambio de emergencia! Sale " + playerOut.name + " exhausto y entra el fresco " + playerIn.name + " desde el banquillo NFT.";
            return this.injectCommentary(text, 'analytical', 'SUBSTITUTION', 'home', playerIn.name);
          }
          
          injectCommentary(text, emotion, eventType, team, playerName) {
            this.commentaryId++;
            const line = {
              id: this.commentaryId,
              timestamp: Date.now(),
              eventType,
              text,
              emotion,
              team,
              playerName
            };
            this.state.commentary.push(line);
            return line;
          }
          
          generateEvent(type) {
            const isHome = this.isHomeEvent();
            const team = isHome ? 'home' : 'away';
            const teamObj = isHome ? this.homeTeam : this.awayTeam;
            
            let resolvedType = type;
            let desc = '';
            
            const player = this.selectPlayer(teamObj, resolvedType === 'SHOT' || resolvedType === 'GOAL');
            const assister = resolvedType === 'GOAL' ? this.selectPlayer(teamObj) : undefined;
            
            if (resolvedType === 'SHOT' || resolvedType === 'GOAL' || resolvedType === 'SAVE') {
              const defenderTeam = isHome ? this.awayTeam : this.homeTeam;
              const goalkeeper = defenderTeam.players.find(p => p.role === 'Portero' || p.position === 'GK') || defenderTeam.players[defenderTeam.players.length - 1];
              
              let shotPowerVal = player ? this.getPlayerEffectiveShotPower(player, isHome ? 'home' : 'away') : 150;
              let gkDefVal = goalkeeper ? (goalkeeper.stamina * 0.4 + 100) : 150;
              
              if (!isHome && this.homeTactic === 'defense_total') {
                gkDefVal *= 1.4;
              }
              
              const goalProb = shotPowerVal / (shotPowerVal + gkDefVal);
              if (this.seededRandom() < goalProb) {
                resolvedType = 'GOAL';
              } else {
                resolvedType = 'SAVE';
              }
            }
            
            this.eventId++;
            return {
              id: this.eventId,
              type: resolvedType,
              minute: this.state.minute,
              second: this.state.second,
              team,
              playerId: player?.playerId,
              playerName: player?.name,
              assisterId: assister?.playerId,
              assisterName: assister?.name,
              x: this.state.ballPosition.x,
              y: this.state.ballPosition.y,
              description: desc
            };
          }
          
          applyEventEffects(event) {
            const isHome = event.team === 'home';
            switch (event.type) {
              case 'GOAL':
                if (isHome) this.state.homeScore++; else this.state.awayScore++;
                this.state.possession = 'neutral';
                this.state.ballPosition = { x: 50, y: 50 };
                break;
              case 'SHOT': case 'SAVE':
                this.state.possession = isHome ? 'away' : 'home';
                break;
              case 'PASS':
                this.moveBallTowardsGoal(isHome);
                break;
              case 'FOUL': case 'OFFSIDE':
                this.state.possession = isHome ? 'away' : 'home';
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
            }
          }
          
          moveBallTowardsGoal(isHome) {
            const dir = isHome ? 1 : -1;
            this.state.ballPosition.x = Math.max(0, Math.min(100, this.state.ballPosition.x + dir * (5 + this.seededRandom() * 10)));
            this.state.ballPosition.y = Math.max(5, Math.min(95, this.state.ballPosition.y + (this.seededRandom() - 0.5) * 20));
            this.state.possession = isHome ? 'home' : 'away';
          }
          
          generateCommentary(event) {
            const templates = {
              KICKOFF: [
                "⚽ {homeTeam} vs {awayTeam} — el balón rueda en el GoalChain Stadium!",
                "🎙️ ¡Arranca el partido! {homeTeam} sale con todo contra {awayTeam}."
              ],
              PASS: [
                "🔄 {playerName} filtra un pase preciso hacia la zona de ataque.",
                "⚡ Pase rápido de {playerName}, el mediocampo se activa."
              ],
              SHOT: [
                "💥 ¡DISPARO! {playerName} prueba fortuna desde fuera del área!",
                "🎯 {playerName} se saca un latigazo... ¡va con mucho peligro!"
              ],
              GOAL: [
                "⚽⚽⚽ ¡¡¡GOOOOOOL!!! {playerName} marca el {score} para {team}!",
                "🔥🔥🔥 ¡GOLAZO DE {playerName}! {team} se pone {score} arriba!"
              ],
              SAVE: [
                "🧤 ¡PARADÓN! El portero de {team} vuela y evita el gol de {playerName}!",
                "🛡️ ¡QUÉ REFLEJOS! La manopla salvadora del guardameta de {team}."
              ],
              FOUL: ["🟨 Falta de {playerName} sobre el rival."],
              OFFSIDE: ["🚫 ¡FUERA DE JUEGO! {playerName} se adelantó."],
              SUBSTITUTION: ["🔄 Cambio en {team}: entra {playerName}."],
              INJURY: ["🤕 {playerName} pide la camilla."],
              YELLOW_CARD: ["🟨 Amarilla para {playerName}."],
              RED_CARD: ["🟥 ¡ROJA DIRECTA! {playerName} se va a la caseta."],
              HALFTIME: ["🍊 DESCANSO. {homeTeam} {homeScore} - {awayScore} {awayTeam}."],
              FULLTIME: ["🏁 ¡FINAL! {homeTeam} {homeScore} - {awayScore} {awayTeam}."],
              CORNER: ["🎯 Córner a favor de {team}."],
              FREE_KICK: ["⚖️ Falta al borde del área para {team}."],
              PENALTY: ["⚽¡PENALTI! {playerName} coloca el balón."]
            };
            
            const teamName = event.team === 'home' ? this.homeTeam.name : this.awayTeam.name;
            const oppName = event.team === 'home' ? this.awayTeam.name : this.homeTeam.name;
            const score = event.team === 'home' ? \`\${this.state.homeScore}-\${this.state.awayScore}\` : \`\${this.state.awayScore}-\${this.state.homeScore}\`;
            
            const ts = templates[event.type] || ['Evento: {type}'];
            let text = ts[Math.floor(this.seededRandom() * ts.length)];
            
            text = text
              .replace('{homeTeam}', this.homeTeam.name)
              .replace('{awayTeam}', this.awayTeam.name)
              .replace('{team}', teamName)
              .replace('{oppTeam}', oppName)
              .replace('{playerName}', event.playerName || 'un jugador')
              .replace('{score}', score)
              .replace('{homeScore}', this.state.homeScore.toString())
              .replace('{awayScore}', this.state.awayScore.toString());
            
            let emotion = 'neutral';
            if (event.type === 'GOAL') emotion = 'celebration';
            else if (event.type === 'SHOT' || event.type === 'PENALTY') emotion = 'tense';
            else if (event.type === 'SAVE') emotion = 'tense';
            else if (event.type === 'HALFTIME' || event.type === 'FULLTIME') emotion = 'analytical';
            
            this.commentaryId++;
            return {
              id: this.commentaryId,
              timestamp: Date.now(),
              eventType: event.type,
              text,
              emotion,
              team: event.team,
              playerName: event.playerName
            };
          }
          
          step() {
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
            
            const ticksPerMinute = 60000 / this.config.tickRate;
            if (this.eventId % Math.max(1, Math.floor(ticksPerMinute / 10)) === 0) {
              this.state.second += 10;
              this.decayStamina();
              if (this.state.second >= 60) {
                this.state.second = 0;
                this.state.minute++;
                if (this.state.minute >= 45 && this.state.half === 1) {
                  const event = this.generateEvent('HALFTIME');
                  this.state.eventLog.push(event);
                  const commentary = this.generateCommentary(event);
                  this.state.commentary.push(commentary);
                  return { event, commentary, state: { ...this.state } };
                }
              }
            }
            
            if (this.seededRandom() < this.config.eventProbability / 100) {
              const eventType = this.weightedRandomEvent();
              const event = this.generateEvent(eventType);
              this.applyEventEffects(event);
              this.state.eventLog.push(event);
              
              const now = Date.now();
              if (now - this.lastCommentaryTime >= this.config.commentaryInterval) {
                const commentary = this.generateCommentary(event);
                this.state.commentary.push(commentary);
                this.lastCommentaryTime = now;
                return { event, commentary, state: { ...this.state } };
              }
              return { event, state: { ...this.state } };
            }
            
            return { state: { ...this.state } };
          }
          
          getState() { return { ...this.state }; }
          reset() { this.state = this.initialState(); this.eventId = 0; this.commentaryId = 0; this.lastCommentaryTime = 0; }
        }
        return Engine;
      })();
      
      let engine = null;
      let isRunning = false;
      let speedMultiplier = 1;
      let pendingInit = null;
      let lastTick = 0;
      const TICK_INTERVAL = 100;
      
      function send(type, payload) {
        postMessage({ type, payload });
      }
      
      function runLoop() {
        if (!isRunning || !engine) return;
        const now = performance.now();
        const adjustedInterval = TICK_INTERVAL / speedMultiplier;
        if (now - lastTick >= adjustedInterval) {
          lastTick = now;
          const result = engine.step();
          if (result.event) send('EVENT', result.event);
          if (result.commentary) send('COMMENTARY', result.commentary);
          if (Math.random() < 0.05) send('STATE', result.state);
        }
        if (isRunning) requestAnimationFrame(runLoop);
      }
      
      self.onmessage = function(e) {
        const msg = e.data;
        switch (msg.type) {
          case 'INIT':
            pendingInit = msg.payload;
            send('READY', null);
            break;
          case 'START':
            if (pendingInit && !engine) {
              engine = new SimEngine(pendingInit.config, pendingInit.homeTeam, pendingInit.awayTeam);
              pendingInit = null;
            }
            if (engine && !isRunning) { isRunning = true; runLoop(); }
            break;
          case 'PAUSE': isRunning = false; break;
          case 'RESUME': if (engine && !isRunning) { isRunning = true; runLoop(); } break;
          case 'STOP': isRunning = false; if (engine) engine.reset(); break;
          case 'SET_SPEED': speedMultiplier = Math.max(0.1, Math.min(10, msg.payload.multiplier)); break;
          case 'GET_STATE': if (engine) send('STATE', engine.getState()); break;
          case 'SET_TACTIC':
            if (engine) {
              const comm = engine.setTactic(msg.payload.tactic);
              send('COMMENTARY', comm);
              send('STATE', engine.getState());
            }
            break;
          case 'ENERGY_BOOST':
            if (engine) {
              const comm = engine.applyEnergyBoost(msg.payload.playerId);
              if (comm) {
                send('COMMENTARY', comm);
                send('STATE', engine.getState());
              }
            }
            break;
          case 'SUBSTITUTE':
            if (engine) {
              const comm = engine.substitutePlayer(msg.payload.playerOutId, msg.payload.playerIn);
              if (comm) {
                send('COMMENTARY', comm);
                send('STATE', engine.getState());
              }
            }
            break;
        }
      };
    `;
        const blob = new Blob([workerCode], { type: 'application/javascript' });
        const workerUrl = URL.createObjectURL(blob);
        const worker = new Worker(workerUrl);
        workerRef.current = worker;
        worker.onmessage = (e) => {
            const { type, payload } = e.data;
            switch (type) {
                case 'STATE':
                    setState(payload);
                    if (payload?.eventLog)
                        setEvents(payload.eventLog);
                    if (payload?.commentary)
                        setCommentary(payload.commentary);
                    break;
                case 'EVENT':
                    setEvents(prev => [...prev, payload]);
                    break;
                case 'COMMENTARY':
                    setCommentary(prev => [...prev, payload].slice(-50));
                    break;
                case 'READY':
                    setIsInitialized(true);
                    break;
                case 'ERROR':
                    console.error('[MatchSim] Worker error:', payload);
                    break;
            }
        };
        worker.onerror = (err) => {
            console.error('[MatchSim] Worker error:', err);
        };
        return () => {
            worker.terminate();
            URL.revokeObjectURL(workerUrl);
        };
    }, []);
    const init = useCallback((homeTeam, awayTeam, config) => {
        if (workerRef.current) {
            const fullConfig = { ...DEFAULT_CONFIG, ...config };
            workerRef.current.postMessage({
                type: 'INIT',
                payload: { config: fullConfig, homeTeam, awayTeam }
            });
        }
    }, []);
    const start = useCallback(() => {
        if (workerRef.current) {
            workerRef.current.postMessage({ type: 'START', payload: undefined });
            setIsRunning(true);
        }
    }, []);
    const pause = useCallback(() => {
        if (workerRef.current) {
            workerRef.current.postMessage({ type: 'PAUSE', payload: undefined });
            setIsRunning(false);
        }
    }, []);
    const resume = useCallback(() => {
        if (workerRef.current) {
            workerRef.current.postMessage({ type: 'RESUME', payload: undefined });
            setIsRunning(true);
        }
    }, []);
    const stop = useCallback(() => {
        if (workerRef.current) {
            workerRef.current.postMessage({ type: 'STOP', payload: undefined });
            setIsRunning(false);
            setState(null);
            setEvents([]);
            setCommentary([]);
        }
    }, []);
    const setSpeedMultiplier = useCallback((multiplier) => {
        if (workerRef.current) {
            workerRef.current.postMessage({ type: 'SET_SPEED', payload: { multiplier } });
            setSpeed(multiplier);
        }
    }, []);
    const getState = useCallback(() => {
        if (workerRef.current) {
            workerRef.current.postMessage({ type: 'GET_STATE', payload: undefined });
        }
    }, []);
    const setTactic = useCallback((tactic) => {
        if (workerRef.current) {
            workerRef.current.postMessage({ type: 'SET_TACTIC', payload: { tactic } });
        }
    }, []);
    const energyBoost = useCallback((playerId) => {
        if (workerRef.current) {
            workerRef.current.postMessage({ type: 'ENERGY_BOOST', payload: { playerId } });
        }
    }, []);
    const substitute = useCallback((playerOutId, playerIn) => {
        if (workerRef.current) {
            workerRef.current.postMessage({ type: 'SUBSTITUTE', payload: { playerOutId, playerIn } });
        }
    }, []);
    return {
        state,
        events,
        commentary,
        isRunning,
        isInitialized,
        speed,
        init,
        start,
        pause,
        resume,
        stop,
        setSpeed: setSpeedMultiplier,
        getState,
        setTactic,
        energyBoost,
        substitute,
    };
}
// Helper to create demo teams from player data
export function createDemoTeams(players) {
    const shuffled = [...players].sort(() => Math.random() - 0.5);
    const mid = Math.floor(shuffled.length / 2);
    return [
        {
            id: 'home',
            name: 'GoalChain FC',
            players: shuffled.slice(0, mid).slice(0, 11),
            formation: '4-4-2',
        },
        {
            id: 'away',
            name: 'Solana United',
            players: shuffled.slice(mid).slice(0, 11),
            formation: '4-3-3',
        },
    ];
}
