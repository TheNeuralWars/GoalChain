/** Core match simulation engine — runs in Web Worker */
const EVENT_TYPES = [
    'KICKOFF', 'PASS', 'SHOT', 'GOAL', 'SAVE', 'FOUL', 'OFFSIDE',
    'SUBSTITUTION', 'INJURY', 'YELLOW_CARD', 'RED_CARD',
    'HALFTIME', 'FULLTIME', 'CORNER', 'FREE_KICK', 'PENALTY'
];
const EVENT_WEIGHTS = {
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
const COMMENTARY_TEMPLATES = {
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
    config;
    homeTeam;
    awayTeam;
    state;
    eventId = 0;
    commentaryId = 0;
    rngSeed = Date.now();
    lastCommentaryTime = 0;
    homeTactic = 'normal';
    constructor(config, homeTeam, awayTeam) {
        this.config = config;
        this.homeTeam = this.cloneTeam(homeTeam);
        this.awayTeam = this.cloneTeam(awayTeam);
        this.state = this.initialState();
    }
    cloneTeam(team) {
        return {
            ...team,
            players: team.players.map(p => ({ ...p })),
        };
    }
    initialState() {
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
    seededRandom() {
        this.rngSeed = (this.rngSeed * 1664525 + 1013904223) >>> 0;
        return this.rngSeed / 0x100000000;
    }
    weightedRandomEvent() {
        const total = Object.values(EVENT_WEIGHTS).reduce((a, b) => a + b, 0);
        let roll = this.seededRandom() * total;
        for (const [event, weight] of Object.entries(EVENT_WEIGHTS)) {
            roll -= weight;
            if (roll <= 0)
                return event;
        }
        return 'PASS';
    }
    getPlayerEffectiveSpeed(player, teamId) {
        const tirednessFactor = 0.5 + 0.5 * (player.stamina / 255);
        let speed = player.speed * tirednessFactor;
        if (teamId === 'home' && this.homeTactic === 'attack_total') {
            const isAttacker = player.shotPower >= 200 || player.role === 'Delantero' || player.position === 'FWD';
            if (isAttacker) {
                speed *= 1.3;
            }
        }
        return Math.min(255, speed);
    }
    getPlayerEffectiveShotPower(player, teamId) {
        const tirednessFactor = 0.5 + 0.5 * (player.stamina / 255);
        let shot = player.shotPower * tirednessFactor;
        if (teamId === 'home' && this.homeTactic === 'attack_total') {
            const isAttacker = player.shotPower >= 200 || player.role === 'Delantero' || player.position === 'FWD';
            if (isAttacker) {
                shot *= 1.3;
            }
        }
        return Math.min(255, shot);
    }
    getTeamStrength(team) {
        const activePlayers = team.players.filter(p => !p.isEliminated);
        if (activePlayers.length === 0)
            return 10;
        const avgSpeed = activePlayers.reduce((a, p) => a + this.getPlayerEffectiveSpeed(p, team.id), 0) / activePlayers.length;
        const avgShot = activePlayers.reduce((a, p) => a + this.getPlayerEffectiveShotPower(p, team.id), 0) / activePlayers.length;
        const avgStam = activePlayers.reduce((a, p) => a + p.stamina, 0) / activePlayers.length;
        return (avgSpeed + avgShot + avgStam) / 3;
    }
    selectPlayer(team, preferAttacker = false) {
        const active = team.players.filter(p => !p.isEliminated);
        if (active.length === 0)
            return null;
        if (preferAttacker) {
            const sorted = [...active].sort((a, b) => b.shotPower - a.shotPower);
            return sorted[Math.floor(this.seededRandom() * Math.min(3, sorted.length))];
        }
        return active[Math.floor(this.seededRandom() * active.length)];
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
        }
        else if (this.homeTactic === 'defense_total') {
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
        }
        else if (tactic === 'attack_total') {
            text = "🎙️ [IA Commentator]: ¡El manager ordena adelantar líneas! ¡Ataque Total activado! El equipo corre a máxima velocidad pero la fatiga acecha...";
        }
        else {
            text = "🎙️ [IA Commentator]: El manager reestablece el esquema táctico original para equilibrar el juego.";
        }
        return this.injectCommentary(text, 'analytical', 'SUBSTITUTION', 'home');
    }
    applyEnergyBoost(playerId) {
        const player = this.homeTeam.players.find(p => p.playerId === playerId);
        if (!player)
            return null;
        player.stamina = Math.min(255, player.stamina + 0.45 * 255);
        const text = `🎙️ [IA Commentator]: ¡Inyección de energía premium! El manager gasta 15 $GCH para revitalizar la stamina de ${player.name}!`;
        return this.injectCommentary(text, 'excited', 'INJURY', 'home', player.name);
    }
    substitutePlayer(playerOutId, playerIn) {
        const idx = this.homeTeam.players.findIndex(p => p.playerId === playerOutId);
        if (idx === -1)
            return null;
        const playerOut = this.homeTeam.players[idx];
        this.homeTeam.players[idx] = { ...playerIn };
        const text = `🎙️ [IA Commentator]: ¡Cambio de emergencia! Sale ${playerOut.name} exhausto y entra el fresco ${playerIn.name} desde el banquillo NFT.`;
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
    generateEvent(eventType) {
        const isHome = this.isHomeEvent();
        const team = isHome ? 'home' : 'away';
        const teamObj = isHome ? this.homeTeam : this.awayTeam;
        let resolvedType = eventType;
        let desc = '';
        const player = this.selectPlayer(teamObj, resolvedType === 'SHOT' || resolvedType === 'GOAL');
        const assister = resolvedType === 'GOAL' ? this.selectPlayer(teamObj) : undefined;
        // Resolve shots dynamically based on shooter shotPower vs opponent GK defense
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
            }
            else {
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
            description: desc,
        };
    }
    applyEventEffects(event) {
        const isHome = event.team === 'home';
        switch (event.type) {
            case 'GOAL':
                if (isHome)
                    this.state.homeScore++;
                else
                    this.state.awayScore++;
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
    moveBallTowardsGoal(isHome) {
        const dir = isHome ? 1 : -1;
        this.state.ballPosition.x = Math.max(0, Math.min(100, this.state.ballPosition.x + dir * (5 + this.seededRandom() * 10)));
        this.state.ballPosition.y = Math.max(5, Math.min(95, this.state.ballPosition.y + (this.seededRandom() - 0.5) * 20));
        this.state.possession = isHome ? 'home' : 'away';
    }
    generateCommentary(event) {
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
        let emotion = 'neutral';
        if (event.type === 'GOAL')
            emotion = 'celebration';
        else if (event.type === 'SHOT' || event.type === 'PENALTY' || event.type === 'FREE_KICK')
            emotion = 'tense';
        else if (event.type === 'SAVE')
            emotion = 'tense';
        else if (event.type === 'FOUL' || event.type === 'YELLOW_CARD' || event.type === 'RED_CARD')
            emotion = 'tense';
        else if (event.type === 'HALFTIME' || event.type === 'FULLTIME')
            emotion = 'analytical';
        else if (event.type === 'PASS')
            emotion = 'neutral';
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
        // Time progression
        const ticksPerMinute = 60000 / this.config.tickRate;
        if (this.eventId % Math.max(1, Math.floor(ticksPerMinute / 10)) === 0) {
            this.state.second += 10;
            this.decayStamina();
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
    getState() {
        return { ...this.state };
    }
    reset() {
        this.state = this.initialState();
        this.eventId = 0;
        this.commentaryId = 0;
        this.lastCommentaryTime = 0;
    }
}
