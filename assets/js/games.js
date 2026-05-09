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

    function generateGameHTML(game) {
        const safeId = `game-${game.title.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}`;
        return `
        <div class="game-box" id="${safeId}">

            <div class="game-content">

                <img src="${game.image}" alt="${game.title}" width="200">
                <div class="game-text">
                    <h1 class="green">${game.title}</h1>
                    <p class="green gbFont">${game.description}</p>
                    <p class="yellow gbFont">Developer : <span class="green">${game.developer}</span></p>
                    <p class="yellow gbFont">Platforms : <span class="green">${game.platforms}</span></p>
                    <p class="yellow gbFont">Genres : <span class="green">${game.genres}</span></p>
                    <p class="yellow gbFont">Price : <span class="green">${game.price}</span></p>
                    <div class="game-actions">
                        <a class="btn-buy-card" target="_blank" href="${game.buyLink}">BUY</a>
                        <a class="btn-details-card" href="./game-details.html?game=${encodeURIComponent(game.title)}">View Details</a>
                    </div>

                </div>
            
            </div>
            
        </div>
        `;
    }

    function applyBackgrounds(games) {
        games.forEach(game => {
            const safeId = `game-${game.title.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}`;
            const el = document.getElementById(safeId);
            if (el && game.image) {
                el.style.backgroundImage = `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url('${game.image}')`;
                el.style.backgroundSize = 'cover';
                el.style.backgroundPosition = 'center';
                el.style.backgroundRepeat = 'no-repeat';
            }
        });
    }

    async function initSearch() {
        const allGames = await getResponse('../assets/js/games.json');

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

    const games = await processData();
    const gamesHTML = games.map(game => generateGameHTML(game)).join('');
    gamesContainer.innerHTML = gamesHTML || '<p class="green text-font">No games available.</p>';

    // Apply backgrounds via DOM after elements are in the DOM
    applyBackgrounds(games);

    await initSearch();
});