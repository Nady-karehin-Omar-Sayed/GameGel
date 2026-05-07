/**
 * GameGel Multiplayer Lobby System
 * Handles lobby management, player matchmaking, and real-time updates
 */

class LobbyManager {
  constructor() {
    this.myNickname = this.loadNickname();
    this.myAvatar = this.loadAvatar();
    this.currentLobby = null;
    this.myReady = false;
    this.chatMessages = [];
    this.lobbies = [];
    this.avatars = ['🎮','🕹️','👾','🦊','🐉','⚔️','🛡️','🔥','💀','🤖','🎯','⚡','🌙','🔮','🎨'];
    this.fakeNames = ['ShadowBlade','NeonViper','CryptoGhost','BlitzKing','ArcaneWolf','SilentRogue','DarkMatter','PhoenixFire','QuantumX','CyberPunk','ThunderBolt','GhostRider','IronFist','DragonSlayer','NightOwl','SilentAssassin','VoidWalker','EchoKnight','FrostByte','NeonNinja'];
    this.games = ['Elden Ring','Call of Duty: MW3','FIFA 24','Cyberpunk 2077','Fortnite','Valorant','CS2','The Witcher 3','Apex Legends','Minecraft','Diablo IV','Starfield','Baldur\'s Gate 3','Dragon Age: Veilguard'];
    this.modes = ['Casual','Ranked','Tournament','Practice','Deathmatch','Capture Flag'];
    this.icons = ['⚔️','🔫','⚽','🤖','🌊','🦊','💣','🐺','🎯','⛏️','🎪','🏆','🎸','🌟'];
  }

  // ========== STORAGE ==========
  loadNickname() {
    let saved = localStorage.getItem('gamegel_nickname');
    if (!saved) {
      saved = 'Player' + Math.floor(Math.random()*9000+1000);
      localStorage.setItem('gamegel_nickname', saved);
    }
    return saved;
  }

  loadAvatar() {
    let saved = localStorage.getItem('gamegel_avatar');
    if (!saved) {
      saved = this.avatars[Math.floor(Math.random()*this.avatars.length)];
      localStorage.setItem('gamegel_avatar', saved);
    }
    return saved;
  }

  setNickname(name) {
    if (!name || name.trim().length === 0) return false;
    this.myNickname = name.trim();
    localStorage.setItem('gamegel_nickname', this.myNickname);
    return true;
  }

  setAvatar(avatar) {
    if (!this.avatars.includes(avatar)) return false;
    this.myAvatar = avatar;
    localStorage.setItem('gamegel_avatar', avatar);
    return true;
  }

  // ========== LOBBY MANAGEMENT ==========
  createLobby(name, game, maxPlayers, mode) {
    if (this.currentLobby) return null;

    const gameIndex = this.games.indexOf(game);
    const icon = this.icons[gameIndex >= 0 ? gameIndex % this.icons.length : 0];
    
    const mePlayer = {
      id: this.generateId(),
      name: this.myNickname,
      avatar: this.myAvatar,
      ready: false,
      me: true,
      joinedAt: Date.now()
    };

    const slots = [mePlayer];
    for (let i = 1; i < maxPlayers; i++) {
      slots.push({ id: `empty-${i}`, empty: true });
    }

    this.currentLobby = {
      id: 'lobby-' + this.generateId(),
      name: name || `${this.myNickname}'s Lobby`,
      game: game || this.games[0],
      icon: icon,
      mode: mode || this.modes[0],
      host: this.myNickname,
      hostId: mePlayer.id,
      maxPlayers: maxPlayers || 4,
      players: slots,
      isHost: true,
      createdAt: Date.now(),
      locked: false
    };

    this.chatMessages = [
      { sys: true, text: `Lobby "${this.currentLobby.name}" created. Waiting for players…` }
    ];

    this.lobbies.unshift(this.currentLobby);
    return this.currentLobby;
  }

  joinLobby(lobbyId) {
    if (this.currentLobby) return false;
    
    const lobby = this.lobbies.find(l => l.id === lobbyId);
    if (!lobby || lobby.locked || this.getFilledSlots(lobby) >= lobby.maxPlayers) {
      return false;
    }

    this.currentLobby = lobby;
    this.myReady = false;

    const emptyIdx = lobby.players.findIndex(p => p.empty);
    if (emptyIdx >= 0) {
      lobby.players[emptyIdx] = {
        id: this.generateId(),
        name: this.myNickname,
        avatar: this.myAvatar,
        ready: false,
        me: true,
        joinedAt: Date.now()
      };
    }

    this.chatMessages = [
      { sys: true, text: `You joined "${lobby.name}".` },
      { sys: true, text: `Welcome! Say hello to your teammates.` }
    ];

    return true;
  }

  leaveLobby() {
    if (!this.currentLobby) return false;

    const mePlayer = this.currentLobby.players.find(p => p.me);
    if (mePlayer) {
      const idx = this.currentLobby.players.indexOf(mePlayer);
      this.currentLobby.players[idx] = { id: `empty-${idx}`, empty: true };
    }

    // If you're the host, dissolve the lobby
    if (this.currentLobby.isHost) {
      this.lobbies = this.lobbies.filter(l => l.id !== this.currentLobby.id);
    }

    this.currentLobby = null;
    this.myReady = false;
    this.chatMessages = [];

    return true;
  }

  // ========== LOBBY UTILITIES ==========
  getFilledSlots(lobby) {
    return lobby.players.filter(p => !p.empty).length;
  }

  isLobbyFull(lobby) {
    return this.getFilledSlots(lobby) >= lobby.maxPlayers;
  }

  getAllReady(lobby) {
    const filled = lobby.players.filter(p => !p.empty);
    const ready = filled.filter(p => p.ready);
    return filled.length >= 2 && ready.length === filled.length;
  }

  // ========== PLAYER ACTIONS ==========
  toggleReady() {
    if (!this.currentLobby) return false;

    this.myReady = !this.myReady;
    const me = this.currentLobby.players.find(p => p.me);
    if (me) me.ready = this.myReady;

    this.chatMessages.push({
      sys: true,
      text: `You are ${this.myReady ? 'READY ✔' : 'no longer ready'}.`
    });

    return this.myReady;
  }

  sendChatMessage(message) {
    if (!message || message.trim().length === 0 || !this.currentLobby) return false;

    this.chatMessages.push({
      name: this.myNickname,
      avatar: this.myAvatar,
      msg: message.trim(),
      me: true,
      timestamp: Date.now()
    });

    return true;
  }

  // ========== AI SIMULATION ==========
  simulateFakePlayerJoin() {
    if (!this.currentLobby || this.isLobbyFull(this.currentLobby)) return false;

    const emptyIdx = this.currentLobby.players.findIndex(p => p.empty);
    if (emptyIdx < 0) return false;

    const name = this.fakeNames[Math.floor(Math.random() * this.fakeNames.length)];
    const avatar = this.avatars[Math.floor(Math.random() * this.avatars.length)];

    this.currentLobby.players[emptyIdx] = {
      id: this.generateId(),
      name: name,
      avatar: avatar,
      ready: false,
      me: false,
      joinedAt: Date.now()
    };

    this.chatMessages.push({
      sys: true,
      text: `${name} joined the lobby.`
    });

    return true;
  }

  simulateFakePlayerReady() {
    if (!this.currentLobby) return false;

    const others = this.currentLobby.players.filter(p => !p.empty && !p.me && !p.ready);
    if (others.length === 0) return false;

    const player = others[Math.floor(Math.random() * others.length)];
    player.ready = true;

    this.chatMessages.push({
      sys: true,
      text: `${player.name} is READY ✔`
    });

    return true;
  }

  simulateFakeChatMessage() {
    if (!this.currentLobby) return false;

    const others = this.currentLobby.players.filter(p => !p.empty && !p.me);
    if (others.length === 0) return false;

    const player = others[Math.floor(Math.random() * others.length)];
    const responses = [
      'gg', 'Let\'s go!', 'Ready when you are 🔥', 'nice', 'lol', 'GG WP',
      'Let\'s win this!', 'Good luck! 💪', 'Here we go!', 'Ohhh yeah!'
    ];

    this.chatMessages.push({
      name: player.name,
      avatar: player.avatar,
      msg: responses[Math.floor(Math.random() * responses.length)],
      me: false,
      timestamp: Date.now()
    });

    return true;
  }

  // ========== LOBBY BROWSER ==========
  generateRandomLobbies(count = 7) {
    this.lobbies = [];

    for (let i = 0; i < count; i++) {
      const maxPlayers = [2, 4, 4, 6, 8][Math.floor(Math.random() * 5)];
      const filledCount = Math.floor(Math.random() * maxPlayers) + 1;
      const gameIdx = Math.floor(Math.random() * this.games.length);
      
      const players = [];
      for (let j = 0; j < filledCount; j++) {
        players.push({
          id: this.generateId(),
          name: this.fakeNames[Math.floor(Math.random() * this.fakeNames.length)],
          avatar: this.avatars[Math.floor(Math.random() * this.avatars.length)],
          ready: Math.random() > 0.4,
          me: false,
          joinedAt: Date.now() - Math.random() * 300000
        });
      }

      for (let j = filledCount; j < maxPlayers; j++) {
        players.push({ id: `empty-${j}`, empty: true });
      }

      const lobby = {
        id: 'lobby-' + this.generateId(),
        name: this.generateFakeLobbyName(),
        game: this.games[gameIdx],
        icon: this.icons[gameIdx],
        mode: this.modes[Math.floor(Math.random() * this.modes.length)],
        host: this.fakeNames[Math.floor(Math.random() * this.fakeNames.length)],
        maxPlayers: maxPlayers,
        players: players,
        isHost: false,
        createdAt: Date.now() - Math.random() * 600000,
        locked: Math.random() < 0.15,
        password: Math.random() < 0.1 ? this.generateId().substring(0, 4) : null
      };

      this.lobbies.push(lobby);
    }

    return this.lobbies;
  }

  generateFakeLobbyName() {
    const adj = ['Epic', 'Quick', 'Pro', 'Night', 'Chill', 'Ultimate', 'Savage', 'Friendly', 'Hardcore', 'Casual', 'Speedrun', 'Challenge'];
    const noun = ['Squad', 'Team', 'Gang', 'Crew', 'Party', 'Lobby', 'Posse', 'Alliance', 'Battalion', 'Brigade'];
    return adj[Math.floor(Math.random() * adj.length)] + ' ' + noun[Math.floor(Math.random() * noun.length)];
  }

  // ========== MATCH START ==========
  startMatch() {
    if (!this.currentLobby || !this.currentLobby.isHost) return false;

    const filled = this.getFilledSlots(this.currentLobby);
    const ready = this.currentLobby.players.filter(p => !p.empty && p.ready).length;

    if (ready < filled || filled < 2) return false;

    this.chatMessages.push({
      sys: true,
      text: '🚀 HOST started the match! Counting down…'
    });

    return true;
  }

  resetPlayerStates() {
    if (!this.currentLobby) return;

    this.currentLobby.players.forEach(p => {
      if (!p.empty) p.ready = false;
    });
    this.myReady = false;
  }

  // ========== UTILITIES ==========
  generateId() {
    return Math.random().toString(36).substring(2, 11);
  }

  getOnlineCount() {
    return Math.floor(Math.random() * 600 + 200);
  }

  getAvatarIndex(avatar) {
    return this.avatars.indexOf(avatar);
  }

  getNextAvatar() {
    const currentIdx = this.getAvatarIndex(this.myAvatar);
    return this.avatars[(currentIdx + 1) % this.avatars.length];
  }

  getLobbyStats() {
    return {
      totalLobbies: this.lobbies.length,
      activePlayers: this.lobbies.reduce((sum, l) => sum + this.getFilledSlots(l), 0),
      gamesRepresented: new Set(this.lobbies.map(l => l.game)).size,
      averagePlayersPerLobby: this.lobbies.length > 0 
        ? (this.lobbies.reduce((sum, l) => sum + this.getFilledSlots(l), 0) / this.lobbies.length).toFixed(1)
        : 0
    };
  }

  // ========== EXPORT DATA ==========
  toJSON() {
    return {
      nickname: this.myNickname,
      avatar: this.myAvatar,
      currentLobby: this.currentLobby,
      lobbies: this.lobbies,
      chatMessages: this.chatMessages,
      stats: this.getLobbyStats()
    };
  }
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = LobbyManager;
}
