const { buildRoundPool, publicMission, scoreAnswer, recommendedSummary } = require('./gameContent');

// In-memory demo store: pin -> Room. Fine for a prototype; a restart wipes all games.
const rooms = new Map();

function generatePin() {
  let pin;
  do {
    pin = String(Math.floor(100000 + Math.random() * 900000));
  } while (rooms.has(pin));
  return pin;
}

class Room {
  constructor(pin, hostSocketId, missionIds, overrideTime) {
    this.pin = pin;
    this.hostSocketId = hostSocketId;
    this.missions = buildRoundPool(missionIds);
    if (overrideTime) {
      this.missions = this.missions.map((m) => ({ ...m, recTime: overrideTime }));
    }
    this.phase = 'lobby'; // lobby | loading | question | reveal
    this.currentIndex = -1;
    this.players = new Map(); // socketId -> { id, name, score }
    this.submissions = new Map(); // socketId -> answer (current round)
  }

  get totalRounds() {
    return this.missions.length;
  }

  get currentMission() {
    return this.currentIndex >= 0 && this.currentIndex < this.missions.length
      ? this.missions[this.currentIndex]
      : null;
  }

  playersView() {
    return [...this.players.values()].map((p) => ({ id: p.id, name: p.name }));
  }

  leaderboardView() {
    return [...this.players.values()]
      .sort((a, b) => b.score - a.score)
      .map((p, idx) => ({ rank: idx + 1, id: p.id, name: p.name, score: p.score }));
  }

  addPlayer(socketId, name) {
    this.players.set(socketId, { id: socketId, name, score: 0 });
  }

  removePlayer(socketId) {
    this.players.delete(socketId);
    this.submissions.delete(socketId);
  }

  startNextRound() {
    this.currentIndex += 1;
    this.submissions.clear();
    this.phase = 'question';
    this.roundStartedAt = Date.now();
    return this.currentMission;
  }

  submitAnswer(socketId, answer) {
    if (this.phase !== 'question') return null;
    if (this.submissions.has(socketId)) return null;
    const mission = this.currentMission;
    if (!mission) return null;
    const base = scoreAnswer(mission, answer);
    const timeLimitMs = (mission.recTime || 30) * 1000;
    const elapsedMs = Math.min(Math.max(Date.now() - (this.roundStartedAt || Date.now()), 0), timeLimitMs);
    const speedFactor = 1 - 0.5 * (elapsedMs / timeLimitMs); // 1.0 (instant) down to 0.5 (right at the deadline)
    const finalPoints = Math.round(base.points * speedFactor);
    const result = { ...base, points: finalPoints, rawPoints: base.points, speedFactor: Math.round(speedFactor * 100) / 100 };
    this.submissions.set(socketId, { answer, result });
    const player = this.players.get(socketId);
    if (player) player.score += finalPoints;
    return result;
  }

  allSubmitted() {
    return this.players.size > 0 && this.submissions.size >= this.players.size;
  }

  revealRound() {
    this.phase = 'reveal';
    const mission = this.currentMission;
    const counts = new Map();
    for (const { answer } of this.submissions.values()) {
      const key = answerKey(mission, answer);
      counts.set(key, (counts.get(key) || 0) + 1);
    }
    const total = this.submissions.size || 1;
    const actionBars = [...counts.entries()]
      .map(([label, n]) => ({ label, pct: Math.round((n / total) * 100) }))
      .sort((a, b) => b.pct - a.pct);
    const correctCount = [...this.submissions.values()].filter((s) => s.result.correct).length;
    const correctPct = Math.round((correctCount / total) * 100);
    let layerStats = null;
    if (mission.interaction === 'defense') {
      layerStats = (mission.layers || []).map((l) => {
        const n = [...this.submissions.values()].filter((s) => (s.result.deployedIds || []).includes(l.id)).length;
        return { id: l.id, label: l.label, icon: l.icon, pct: Math.round((n / total) * 100) };
      });
    }
    return {
      recommended: recommendedSummary(mission),
      explanation: mission.explanation,
      actionBars,
      correctPct,
      riskyPct: 100 - correctPct,
      layerStats,
      submittedCount: this.submissions.size,
      totalPlayers: this.players.size
    };
  }

  isLastRound() {
    return this.currentIndex + 1 >= this.totalRounds;
  }
}

function answerKey(mission, answer) {
  switch (mission.interaction) {
    case 'single': {
      const opt = (mission.options || []).find((o) => o.id === answer?.optionId);
      return opt ? opt.title : 'ไม่ตอบ';
    }
    case 'multi': {
      const titles = (mission.options || []).filter((o) => (answer?.selectedIds || []).includes(o.id)).map((o) => o.title);
      return titles.length ? titles.join(' + ') : 'ไม่ตอบ';
    }
    case 'sequence': {
      const order = answer?.order || [];
      const ideal = mission.idealOrder;
      const matches = order.filter((id, idx) => id === ideal[idx]).length;
      return `เรียงถูก ${matches}/${ideal.length}`;
    }
    case 'risk': {
      const riskLabel = (mission.riskLevels.find((r) => r.id === answer?.riskId) || {}).label || 'ไม่ตอบ';
      return riskLabel;
    }
    case 'defense': {
      const answers = (answer && answer.layers) || {};
      let n = 0;
      for (const layer of mission.layers || []) {
        const a = answers[layer.id] || {};
        const qOk = (layer.options || []).some((o) => o.id === a.qId && o.correct);
        const setupOk = (layer.setupOptions || []).some((o) => o.id === a.setupQId && o.correct);
        if (qOk && setupOk) n++;
      }
      return `ปลดล็อก ${n}/${(mission.layers || []).length}`;
    }
    default:
      return 'ไม่ตอบ';
  }
}

function createRoom(hostSocketId, missionIds, overrideTime) {
  const pin = generatePin();
  const room = new Room(pin, hostSocketId, missionIds, overrideTime);
  rooms.set(pin, room);
  return room;
}

function getRoom(pin) {
  return rooms.get(pin);
}

function deleteRoom(pin) {
  rooms.delete(pin);
}

module.exports = { rooms, createRoom, getRoom, deleteRoom, publicMission };
