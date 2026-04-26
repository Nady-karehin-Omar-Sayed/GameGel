
document.addEventListener("DOMContentLoaded", async () => {
    const gamesContainer = document.querySelector('.games');

    async function getResponse(url) {
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error('Network response was not ok');
            return response.json();
        } catch (error) {
            console.error("Fetch error:", error);
            return [];
        }
    }

    async function processData() {
        const data = await getResponse('../assets/js/games.json');
        return Array.isArray(data) ? data : [];
    }

    const games = await processData();

    function generateGameHTML(game) {
        return `
  <div class="game-box" id="${game.title}">
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
        `;
    }

    let gamesHTML = '';
    games.forEach(game => {
        gamesHTML += generateGameHTML(game);
    });

    gamesContainer.innerHTML = gamesHTML || '<p class="green text-font">No games available.</p>';
});
  async function initSearch() {
    const response = await fetch('../assets/js/games.json');
    const allGames = await response.json();
    
    const params = new URLSearchParams(window.location.search);
    const gameTitle = params.get('game');
    
    let games = allGames;
    if (gameTitle) {
      games = allGames.filter(game => game.title.toLowerCase() === gameTitle.toLowerCase());
      document.getElementById('searchInput').value = gameTitle;
    }
    
    Search.init('#searchInput', games, '#gameDiv');
    Search.fullGamesList = allGames;
    Search.renderGames(games);
  }
  initSearch();
