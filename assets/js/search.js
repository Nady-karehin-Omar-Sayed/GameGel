// MADE SEARCH LOGIC
const Search = {
  activeIndex: -1,

  init(inputSelector, games, containerSelector, options = {}) {
    this.input = document.querySelector(inputSelector);
    this.container = document.querySelector(containerSelector);
    this.games = games || [];
    this.fullGamesList = games || [];
    this.currentResults = [];
    this.options = {
      showDropdown: false,
      ...options
    };
    this.filters = {
      genre: [],
      developer: [],
      platform: []
    };
    this.selectedFilters = {
      genre: [],
      developer: [],
      platform: []
    };
    this.activeFilter = null;
    this.extractFilters();
    this.createResultsContainer();
    if (this.options.showDropdown) {
      this.filterContainer = this.input.parentNode.querySelector('.filter-container');
      if (!this.filterContainer) {
        this.filterContainer = document.createElement('div');
        this.filterContainer.className = 'filter-container';
        this.filterContainer.innerHTML = `<button class="filter-icon" id="filterToggle" title="Filter" style="display:none;">☰</button>`;
        this.input.parentNode.appendChild(this.filterContainer);
      }
    }
    this.bindEvents();
  },

  extractFilters() {
    const gamesForFilters = this.fullGamesList || this.games;
    const genres = new Set();
    const developers = new Set();
    const platforms = new Set();

    gamesForFilters.forEach(game => {
      if (game.genres) {
        game.genres.split(',').map(g => g.trim()).forEach(g => genres.add(g));
      }
      if (game.developer) {
        game.developer.split(',').map(d => d.trim()).forEach(d => developers.add(d));
      }
      if (game.platforms) {
        game.platforms.split(',').map(p => p.trim()).forEach(p => platforms.add(p));
      }
    });

    this.filters.genre = Array.from(genres).sort();
    this.filters.developer = Array.from(developers).sort();
    this.filters.platform = Array.from(platforms).sort();
  },

  createFilterContainer() {
    this.filterContainer = document.createElement('div');
    this.filterContainer.className = 'filter-container';
    this.filterContainer.innerHTML = `
      <button class="filter-icon" id="filterToggle" title="Filter">☰</button>
      <div class="filter-dropdown" id="filterDropdown">
        <div class="filter-section">
          <div class="filter-category" data-category="genre">
            <div class="filter-header">Genre</div>
            <div class="filter-options">
              ${this.filters.genre.map(g => `
                <label><input type="checkbox" value="${g}" data-filter="genre"> ${g}</label>
              `).join('')}
            </div>
          </div>
          <div class="filter-category" data-category="developer">
            <div class="filter-header">Developer</div>
            <div class="filter-options">
              ${this.filters.developer.map(d => `
                <label><input type="checkbox" value="${d}" data-filter="developer"> ${d}</label>
              `).join('')}
            </div>
          </div>
          <div class="filter-category" data-category="platform">
            <div class="filter-header">Platform</div>
            <div class="filter-options">
              ${this.filters.platform.map(p => `
                <label><input type="checkbox" value="${p}" data-filter="platform"> ${p}</label>
              `).join('')}
            </div>
          </div>
        </div>
        <button class="apply-btn" id="applyFilter">Apply</button>
      </div>
    `;
    this.input.parentNode.appendChild(this.filterContainer);
  },

  createResultsContainer() {
    this.resultsContainer = document.createElement('div');
    this.resultsContainer.className = 'search-results';
    this.input.parentNode.appendChild(this.resultsContainer);
  },

  bindEvents() {
    if (!this.input) return;
    this.input.addEventListener('input', () => this.handleSearch());
    this.input.addEventListener('keydown', (e) => this.handleKeydown(e));
    this.input.addEventListener('focus', () => {
      if (this.resultsContainer.innerHTML.trim() !== '') {
        this.resultsContainer.classList.add('active');
      }
    });

    const filterToggle = document.getElementById('filterToggle');
    const filterDropdown = document.getElementById('filterDropdown');
    const applyBtn = document.getElementById('applyFilter');
    
    if (filterToggle && filterDropdown) {
      filterToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        filterDropdown.classList.toggle('active');
        filterToggle.classList.toggle('active');
      });
    }

    if (applyBtn) {
      applyBtn.addEventListener('click', () => this.applyFilters());
    }

    document.addEventListener('click', (e) => {
      if (!this.input.contains(e.target) && !this.resultsContainer.contains(e.target)) {
        this.resultsContainer.classList.remove('active');
      }
      if (filterDropdown && !filterDropdown.contains(e.target) && e.target !== filterToggle) {
        filterDropdown.classList.remove('active');
      }
    });
  },

  applyFilters() {
    this.selectedFilters = {
      genre: [],
      developer: [],
      platform: []
    };

    document.querySelectorAll('.filter-options input:checked').forEach(input => {
      const filterType = input.dataset.filter;
      this.selectedFilters[filterType].push(input.value);
    });

    const filteredGames = this.games.filter(game => this.matchesFilters(game));
    this.renderGames(filteredGames);
    
    document.getElementById('filterDropdown').classList.remove('active');
  },

  matchesFilters(game) {
    const { genre, developer, platform } = this.selectedFilters;

    if (genre.length > 0) {
      const gameGenres = game.genres ? game.genres.split(',').map(g => g.trim()) : [];
      if (!genre.some(g => gameGenres.includes(g))) return false;
    }

    if (developer.length > 0) {
      const gameDevelopers = game.developer ? game.developer.split(',').map(d => d.trim()) : [];
      if (!developer.some(d => gameDevelopers.includes(d))) return false;
    }

    if (platform.length > 0) {
      const gamePlatforms = game.platforms ? game.platforms.split(',').map(p => p.trim()) : [];
      if (!platform.some(p => gamePlatforms.includes(p))) return false;
    }

    return true;
  },

  renderGames(games) {
    if (!this.container) return;
    
    if (games.length === 0) {
      this.container.innerHTML = '<p class="green text-font">No games found</p>';
      return;
    }
// Cards
    this.container.innerHTML = games.map(game => `
      <div class="game-box">
        <div class="game-content">
          <img src="${game.image}" alt="${game.title}" width="200">
          <div class="game-text">
            <h1 class="green">${game.title}</h1>
            <p class="green text-font">${game.description}</p>
            <p class="green text-font">Developer : <span class="yellow">${game.developer}</span></p>
            <p class="green text-font">Platforms : <span class="yellow">${game.platforms}</span></p>
            <p class="green text-font">Genres : <span class="yellow">${game.genres}</span></p>
            <p class="green text-font">Price : <span class="yellow">${game.price}</span></p>
          </div>
        </div>
        <div class="price head-font"><a target="_blank" href="${game.buyLink}">BUY</a></div>
      </div>
    `).join('');
  },

  handleKeydown(e) {
    const items = this.resultsContainer.querySelectorAll('.search-result-item');
    if (items.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      this.activeIndex = Math.min(this.activeIndex + 1, items.length - 1);
      this.updateActiveItem(items);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      this.activeIndex = Math.max(this.activeIndex - 1, 0);
      this.updateActiveItem(items);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (this.activeIndex >= 0 && this.activeIndex < this.currentResults.length) {
        this.selectGame(this.currentResults[this.activeIndex]);
      }
    } else if (e.key === 'Escape') {
      this.resultsContainer.classList.remove('active');
      this.input.blur();
    }
  },

  updateActiveItem(items) {
    items.forEach((item, index) => {
      item.classList.toggle('active', index === this.activeIndex);
    });
    const activeItem = items[this.activeIndex];
    if (activeItem) {
      activeItem.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  },

  handleSearch() {
    const query = this.input.value.toLowerCase().trim();
    if (!query) {
      this.resultsContainer.classList.remove('active');
      this.resultsContainer.innerHTML = '';
      this.currentResults = [];
      this.activeIndex = -1;
      return;
    }

    const gamesToSearch = this.fullGamesList || this.games;
    this.currentResults = gamesToSearch.filter(game => 
      game.title.toLowerCase().includes(query) ||
      game.genres.toLowerCase().includes(query) ||
      game.developer.toLowerCase().includes(query)
    );

    this.activeIndex = this.currentResults.length > 0 ? 0 : -1;
    this.renderResults(this.currentResults);
  },

  selectGame(game) {
    // Determine correct path based on current page location
    const isGamesPage = window.location.pathname.includes('/pages/');
    const basePath = isGamesPage ? './' : './pages/';
    window.location.href = `${basePath}games.html?game=${encodeURIComponent(game.title)}`;
  },

  renderResults(games) {
    if (games.length === 0) {
      this.resultsContainer.innerHTML = '<p class="green" style="padding: 10px 15px;">No games found</p>';
    } else {
      this.resultsContainer.innerHTML = games.map((game, index) => `
        <div class="search-result-item${index === this.activeIndex ? ' active' : ''}" data-title="${game.title}">
          <img src="${game.image}" alt="${game.title}" onerror="this.src='${game.lsimg}'">
          <div class="result-info">
            <div class="title">${game.title}</div>
            <div class="genre">${game.genres}</div>
            <div class="price">${game.price}</div>
          </div>
        </div>
      `).join('');
      
      this.resultsContainer.querySelectorAll('.search-result-item').forEach(item => {
        item.addEventListener('click', () => {
          const title = item.dataset.title;
          const game = this.games.find(g => g.title === title);
          if (game) {
            this.selectGame(game);
          }
        });
        item.addEventListener('mouseenter', () => {
          const items = [...this.resultsContainer.querySelectorAll('.search-result-item')];
          this.activeIndex = items.indexOf(item);
          this.updateActiveItem(items);
        });
      });
    }
    this.resultsContainer.classList.add('active');
  }
};
