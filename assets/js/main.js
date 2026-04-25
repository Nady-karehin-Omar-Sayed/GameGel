        document.addEventListener('DOMContentLoaded', async () => {
            const response = await fetch('./assets/js/games.json');
            const allGames = await response.json();
            Search.init('#searchInput', allGames, null, { showDropdown: true });
            Search.fullGamesList = allGames;
        });
