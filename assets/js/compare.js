/**
 * GameGel Compare Games System
 * Handles game comparison logic and rendering
 */

class GameComparator {
  constructor() {
    this.gamesData = [];
    this.selectedGames = [];
    this.comparisonResult = null;
    this.stats = ['rating', 'platforms', 'genres', 'price', 'releaseYear', 'playerCount'];
  }

  // ========== DATA LOADING ==========
  async loadGames(jsonUrl = '../assets/js/games.json') {
    try {
      const response = await fetch(jsonUrl);
      if (!response.ok) throw new Error('Failed to load games');
      const data = await response.json();
      this.gamesData = this.normalizeGames(data);
      return this.gamesData;
    } catch (error) {
      console.error('Error loading games:', error);
      this.gamesData = this.getFallbackGames();
      return this.gamesData;
    }
  }

  normalizeGames(games) {
    return games.map(g => ({
      id: this.generateId(),
      title: g.title || 'Unknown Game',
      description: g.description || '',
      developer: g.developer || 'Unknown',
      platforms: g.platforms || 'N/A',
      genres: g.genres || 'N/A',
      price: g.price || 'N/A',
      releaseYear: g.releaseYear || g.year || new Date().getFullYear(),
      playerCount: g.playerCount || g.players || '1',
      size: g.size || 'N/A',
      rating: parseFloat(g.rating) || 7.5,
      image: g.lsimg || g.image || this.getPlaceholderImage(g.title)
    }));
  }

  getFallbackGames() {
    return [
      {
        id: '1',
        title: 'Elden Ring',
        description: 'Rise, Tarnished, and be guided by grace to brandish the power of the Elden Ring.',
        developer: 'FromSoftware',
        platforms: 'PC, PS5, Xbox Series X/S',
        genres: 'Action RPG, Open World, Soulslike',
        price: '$59.99',
        releaseYear: 2022,
        playerCount: '1-2',
        size: '60 GB',
        rating: 9.6,
        image: 'https://placehold.co/280x160/111/08CB00?text=Elden+Ring'
      },
      {
        id: '2',
        title: 'Cyberpunk 2077',
        description: 'An open-world action-adventure RPG set in Night City.',
        developer: 'CD Projekt RED',
        platforms: 'PC, PS5, Xbox Series X/S',
        genres: 'Action RPG, Sci-Fi',
        price: '$39.99',
        releaseYear: 2020,
        playerCount: '1',
        size: '70 GB',
        rating: 8.7,
        image: 'https://placehold.co/280x160/111/08CB00?text=Cyberpunk+2077'
      },
      {
        id: '3',
        title: 'The Witcher 3: Wild Hunt',
        description: 'Geralt must find a child of prophecy in a vast open world.',
        developer: 'CD Projekt RED',
        platforms: 'PC, PS5, Xbox Series X/S, Switch',
        genres: 'Action RPG, Open World, Fantasy',
        price: '$29.99',
        releaseYear: 2015,
        playerCount: '1',
        size: '50 GB',
        rating: 9.5,
        image: 'https://placehold.co/280x160/111/08CB00?text=Witcher+3'
      },
      {
        id: '4',
        title: 'Call of Duty: Modern Warfare III',
        description: 'Engage in intense multiplayer combat and campaigns.',
        developer: 'Sledgehammer Games',
        platforms: 'PC, PS5, PS4, Xbox Series X/S, Xbox One',
        genres: 'FPS, Multiplayer, Action',
        price: '$69.99',
        releaseYear: 2023,
        playerCount: '1-150',
        size: '120 GB',
        rating: 7.0,
        image: 'https://placehold.co/280x160/111/08CB00?text=CoD+MW3'
      }
    ];
  }

  // ========== GAME SELECTION ==========
  selectGame(game, position = 1) {
    if (position < 1 || position > 4) return false;

    // Remove if already selected
    this.selectedGames = this.selectedGames.filter(g => g.id !== game.id);

    // Add to position
    while (this.selectedGames.length < position - 1) {
      this.selectedGames.push(null);
    }

    if (position === 1) {
      this.selectedGames[0] = game;
    } else if (position === 2) {
      this.selectedGames[1] = game;
    } else if (position === 3) {
      this.selectedGames[2] = game;
    } else {
      this.selectedGames[3] = game;
    }

    return true;
  }

  removeGame(position) {
    if (position < 1 || position > this.selectedGames.length) return false;
    this.selectedGames.splice(position - 1, 1);
    return true;
  }

  clearSelection() {
    this.selectedGames = [];
    this.comparisonResult = null;
  }

  // ========== COMPARISON ==========
  compare(games = this.selectedGames) {
    if (games.length < 2) {
      console.error('Need at least 2 games to compare');
      return null;
    }

    games = games.filter(g => g !== null && g !== undefined);

    const comparison = {
      games: games,
      metrics: this.calculateMetrics(games),
      winner: this.determineWinner(games),
      insights: this.generateInsights(games)
    };

    this.comparisonResult = comparison;
    return comparison;
  }

  calculateMetrics(games) {
    const metrics = {};

    // Rating comparison
    metrics.rating = {
      label: 'Overall Rating',
      values: games.map(g => ({ value: g.rating, formatted: g.rating.toFixed(1) + '/10' })),
      winner: this.findHighest(games, 'rating'),
      higher_is_better: true
    };

    // Platform count
    metrics.platformCount = {
      label: 'Platform Availability',
      values: games.map(g => {
        const count = g.platforms.split(',').length;
        return { value: count, formatted: count + ' platforms', raw: g.platforms };
      }),
      winner: this.findHighest(games, g => g.platforms.split(',').length),
      higher_is_better: true
    };

    // Genre count
    metrics.genreCount = {
      label: 'Genre Variety',
      values: games.map(g => {
        const count = g.genres.split(',').length;
        return { value: count, formatted: count + ' genres', raw: g.genres };
      }),
      winner: null,
      higher_is_better: false
    };

    // Price
    metrics.price = {
      label: 'Price',
      values: games.map(g => {
        const price = this.extractPrice(g.price);
        return { value: price, formatted: g.price, raw: price };
      }),
      winner: this.findLowest(games, 'price'),
      higher_is_better: false
    };

    // Release year (newer is better)
    metrics.releaseYear = {
      label: 'Release Year',
      values: games.map(g => ({ value: g.releaseYear, formatted: g.releaseYear })),
      winner: this.findHighest(games, 'releaseYear'),
      higher_is_better: true
    };

    // Player count
    metrics.playerCount = {
      label: 'Player Capacity',
      values: games.map(g => ({ value: g.playerCount, formatted: g.playerCount })),
      winner: null,
      higher_is_better: false
    };

    // Size
    metrics.size = {
      label: 'Install Size',
      values: games.map(g => ({ value: g.size, formatted: g.size })),
      winner: null,
      higher_is_better: false
    };

    return metrics;
  }

  findHighest(games, property) {
    let max = -Infinity;
    let winner = null;

    games.forEach(game => {
      const value = typeof property === 'function' ? property(game) : game[property];
      if (value > max) {
        max = value;
        winner = game.id;
      }
    });

    return max !== -Infinity ? winner : null;
  }

  findLowest(games, property) {
    let min = Infinity;
    let winner = null;

    games.forEach(game => {
      const value = typeof property === 'function' ? property(game) : game[property];
      if (value < min && value > 0) {
        min = value;
        winner = game.id;
      }
    });

    return min !== Infinity ? winner : null;
  }

  determineWinner(games) {
    if (games.length < 2) return null;

    // Winner is the game with highest rating
    const ratings = games.map(g => g.rating);
    const maxRating = Math.max(...ratings);
    const winnerGame = games.find(g => g.rating === maxRating);

    return {
      game: winnerGame,
      score: maxRating,
      reason: `${winnerGame.title} has the highest community rating at ${maxRating.toFixed(1)}/10`
    };
  }

  generateInsights(games) {
    const insights = [];

    // Price insight
    const prices = games.map(g => ({ title: g.title, price: this.extractPrice(g.price) }));
    const cheapest = prices.reduce((min, p) => p.price < min.price ? p : min);
    const most_expensive = prices.reduce((max, p) => p.price > max.price ? p : max);

    if (cheapest.price !== most_expensive.price) {
      insights.push({
        type: 'value',
        text: `${cheapest.title} is ${Math.round((most_expensive.price - cheapest.price) / most_expensive.price * 100)}% cheaper than ${most_expensive.title}.`
      });
    }

    // Platform insight
    const platforms = games.map(g => ({ title: g.title, count: g.platforms.split(',').length }));
    const multiPlatform = platforms.filter(p => p.count >= 3);
    if (multiPlatform.length > 0) {
      insights.push({
        type: 'platform',
        text: `${multiPlatform.map(p => p.title).join(' and ')} available on ${multiPlatform[0].count}+ platforms.`
      });
    }

    // Year insight
    const years = games.map(g => g.releaseYear);
    const newest = Math.max(...years);
    const oldest = Math.min(...years);
    if (newest - oldest > 2) {
      insights.push({
        type: 'age',
        text: `${games.find(g => g.releaseYear === newest).title} is newer by ${newest - oldest} years.`
      });
    }

    return insights;
  }

  // ========== UTILITIES ==========
  extractPrice(priceStr) {
    if (!priceStr || priceStr === 'N/A') return 999;
    const matches = priceStr.match(/\d+\.?\d*/);
    return matches ? parseFloat(matches[0]) : 999;
  }

  getPlaceholderImage(title) {
    return `https://placehold.co/280x160/111/08CB00?text=${encodeURIComponent(title)}`;
  }

  generateId() {
    return Math.random().toString(36).substring(2, 11);
  }

  // ========== RENDERING DATA ==========
  getComparisonHTML(includeImages = true) {
    if (!this.comparisonResult) return '';

    const games = this.comparisonResult.games;
    let html = '<div class="comparison-container">';

    // Game headers
    html += '<div class="comparison-headers">';
    games.forEach(game => {
      html += `
        <div class="game-header">
          ${includeImages ? `<img src="${game.image}" alt="${game.title}" />` : ''}
          <h3>${game.title}</h3>
          <span class="developer">${game.developer}</span>
        </div>
      `;
    });
    html += '</div>';

    // Metrics table
    html += '<div class="comparison-metrics">';
    Object.entries(this.comparisonResult.metrics).forEach(([key, metric]) => {
      html += `<div class="metric-row">
        <div class="metric-label">${metric.label}</div>`;
      
      metric.values.forEach((val, idx) => {
        const isWinner = metric.winner === games[idx].id;
        const classes = isWinner ? 'metric-value winner' : 'metric-value';
        html += `<div class="${classes}">${val.formatted}${isWinner ? ' 🏆' : ''}</div>`;
      });

      html += '</div>';
    });
    html += '</div>';

    // Insights
    if (this.comparisonResult.insights.length > 0) {
      html += '<div class="comparison-insights">';
      this.comparisonResult.insights.forEach(insight => {
        html += `<div class="insight ${insight.type}">${insight.text}</div>`;
      });
      html += '</div>';
    }

    html += '</div>';
    return html;
  }

  toJSON() {
    return {
      selectedGames: this.selectedGames,
      comparisonResult: this.comparisonResult,
      gamesCount: this.gamesData.length
    };
  }
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = GameComparator;
}
