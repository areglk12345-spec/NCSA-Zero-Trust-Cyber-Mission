const os = require('os');
const path = require('path');
const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const { createRoom, getRoom, deleteRoom, publicMission } = require('./gameManager');
const { MISSIONS } = require('./gameContent');

const PORT = process.env.PORT || 3000;
const UI_DIR = path.join(__dirname, '..', 'UI mockups scope questions');

const app = express();
app.use(express.static(UI_DIR));
app.get('/host', (_req, res) => res.sendFile(path.join(UI_DIR, 'NCSA Admin Console.dc.html')));
app.get('/play', (_req, res) => res.sendFile(path.join(UI_DIR, 'NCSA Zero Trust Cyber Mission.dc.html')));

const httpServer = createServer(app);
const io = new Server(httpServer);

function hostRoom(pin) {
  return `host:${pin}`;
}
function playersRoom(pin) {
  return `players:${pin}`;
}

const roundTimers = new Map();

function clearRoundTimer(pin) {
  const t = roundTimers.get(pin);
  if (t) {
    clearTimeout(t);
    roundTimers.delete(pin);
  }
}

function performReveal(pin) {
  clearRoundTimer(pin);
  const room = getRoom(pin);
  if (!room || room.phase !== 'question') return null;
  const summary = room.revealRound();
  const fullSummary = { ...summary, leaderboard: room.leaderboardView() };
  io.to(hostRoom(pin)).emit('host:roundRevealed', fullSummary);
  for (const [socketId, player] of room.players) {
    const sub = room.submissions.get(socketId);
    io.to(socketId).emit('player:roundResult', {
      points: sub ? sub.result.points : 0,
      rawPoints: sub ? sub.result.rawPoints : 0,
      speedFactor: sub ? sub.result.speedFactor : 0,
      choiceText: sub ? sub.result.choiceText : 'ไม่ได้ตอบ',
      correct: sub ? sub.result.correct : false,
      recommended: summary.recommended,
      explanation: summary.explanation,
      yourScore: player.score,
      leaderboard: room.leaderboardView(),
      isLastRound: room.isLastRound()
    });
  }
  return { ...summary, leaderboard: room.leaderboardView() };
}

io.on('connection', (socket) => {
  // ---- HOST ----
  socket.on('host:create', ({ missionIds, overrideTime }, ack) => {
    try {
      const ids = Array.isArray(missionIds) && missionIds.length ? missionIds : MISSIONS.map((m) => m.id);
      const clampedTime = Number.isFinite(overrideTime) ? Math.min(300, Math.max(5, Math.round(overrideTime))) : null;
      const room = createRoom(socket.id, ids, clampedTime);
      socket.join(hostRoom(room.pin));
      socket.data.hostPin = room.pin;
      ack && ack({ ok: true, pin: room.pin, totalMissions: room.totalRounds });
    } catch (err) {
      ack && ack({ ok: false, error: 'สร้างห้องไม่สำเร็จ' });
    }
  });

  socket.on('host:startGame', ({ pin }, ack) => {
    const room = getRoom(pin);
    if (!room || room.hostSocketId !== socket.id) return ack && ack({ ok: false, error: 'ไม่พบห้อง' });
    room.phase = 'loading';
    io.to(playersRoom(pin)).emit('player:gameStarting');
    ack && ack({ ok: true });
  });

  socket.on('host:beginRound', ({ pin }, ack) => {
    const room = getRoom(pin);
    if (!room || room.hostSocketId !== socket.id) return ack && ack({ ok: false, error: 'ไม่พบห้อง' });
    clearRoundTimer(pin);
    const mission = room.startNextRound();
    if (!mission) return ack && ack({ ok: false, error: 'ไม่มีภารกิจเหลือ' });
    const payload = {
      mission: publicMission(mission),
      roundIndex: room.currentIndex,
      totalRounds: room.totalRounds,
      isLastRound: room.isLastRound()
    };
    io.to(playersRoom(pin)).emit('player:round', payload);
    if (mission.recTime) {
      const timer = setTimeout(() => performReveal(pin), mission.recTime * 1000);
      roundTimers.set(pin, timer);
    }
    ack && ack({ ok: true, ...payload });
  });

  socket.on('host:reveal', ({ pin }, ack) => {
    const room = getRoom(pin);
    if (!room || room.hostSocketId !== socket.id) return ack && ack({ ok: false, error: 'ไม่พบห้อง' });
    const result = performReveal(pin);
    if (!result) return ack && ack({ ok: false, error: 'เปิดเผยคำตอบไม่สำเร็จ' });
    ack && ack({ ok: true, ...result });
  });

  socket.on('host:endGame', ({ pin }, ack) => {
    const room = getRoom(pin);
    if (!room || room.hostSocketId !== socket.id) return ack && ack({ ok: false, error: 'ไม่พบห้อง' });
    clearRoundTimer(pin);
    const leaderboard = room.leaderboardView();
    io.to(playersRoom(pin)).emit('player:gameOver', { leaderboard });
    ack && ack({ ok: true, leaderboard });
  });

  // ---- PLAYERS ----
  socket.on('player:join', ({ pin, name }, ack) => {
    const cleanPin = String(pin || '').replace(/\D/g, '');
    const room = getRoom(cleanPin);
    if (!room) return ack && ack({ ok: false, error: 'ไม่พบ Game PIN นี้' });
    if (room.phase !== 'lobby') return ack && ack({ ok: false, error: 'เกมเริ่มไปแล้ว ไม่สามารถเข้าร่วมได้' });
    const cleanName = String(name || '').trim().slice(0, 24) || `player${Math.floor(Math.random() * 1000)}`;
    room.addPlayer(socket.id, cleanName);
    socket.join(playersRoom(cleanPin));
    socket.data.playerPin = cleanPin;
    io.to(hostRoom(cleanPin)).emit('host:playersUpdate', { players: room.playersView(), count: room.players.size });
    io.to(playersRoom(cleanPin)).emit('player:lobbyUpdate', { count: room.players.size });
    ack && ack({ ok: true, name: cleanName, pin: cleanPin });
  });

  socket.on('player:submitAnswer', ({ pin, answer }, ack) => {
    const room = getRoom(pin);
    if (!room) return ack && ack({ ok: false, error: 'ไม่พบห้อง' });
    const result = room.submitAnswer(socket.id, answer);
    if (!result) return ack && ack({ ok: false, error: 'ส่งคำตอบไม่สำเร็จ' });
    io.to(hostRoom(pin)).emit('host:answersUpdate', {
      submittedCount: room.submissions.size,
      totalPlayers: room.players.size
    });
    ack && ack({ ok: true });
    if (room.allSubmitted()) performReveal(pin);
  });

  socket.on('disconnect', () => {
    const hostPin = socket.data.hostPin;
    if (hostPin) {
      clearRoundTimer(hostPin);
      deleteRoom(hostPin);
      io.to(playersRoom(hostPin)).emit('player:hostLeft');
    }
    const playerPin = socket.data.playerPin;
    if (playerPin) {
      const room = getRoom(playerPin);
      if (room) {
        room.removePlayer(socket.id);
        io.to(hostRoom(playerPin)).emit('host:playersUpdate', { players: room.playersView(), count: room.players.size });
        io.to(playersRoom(playerPin)).emit('player:lobbyUpdate', { count: room.players.size });
      }
    }
  });
});

httpServer.listen(PORT, () => {
  console.log(`NCSA Zero Trust Cyber Mission backend listening on http://localhost:${PORT}`);
  console.log(`  Host console : http://localhost:${PORT}/host`);
  console.log(`  Player app   : http://localhost:${PORT}/play`);
  const lanIps = Object.values(os.networkInterfaces())
    .flat()
    .filter((n) => n && n.family === 'IPv4' && !n.internal)
    .map((n) => n.address);
  if (lanIps.length) {
    console.log('\nFor other devices on the same Wi-Fi/network, open the HOST console using your LAN IP (not localhost) so the QR code and PIN link work for them:');
    lanIps.forEach((ip) => console.log(`  http://${ip}:${PORT}/host`));
  } else {
    console.log('\nNo LAN IP detected — QR/PIN links will only work on this machine. Connect to a network to let other devices join.');
  }
});
