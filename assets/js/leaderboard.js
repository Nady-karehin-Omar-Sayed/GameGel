// ── Player data ──────────────────────────────────────────────────
// arcadeGames / triviaGames / skillBadges are out of 15 / 10 / 5
const PLAYERS = [
    { id: 1,  name: "Ali Ehab",  initials: "AE", color: "#F8DE22", arcadeGames: 15, triviaGames: 10, skillBadges: 5 },
    { id: 2,  name: "Omar Sayed",  initials: "OS", color: "#08CB00", arcadeGames: 12, triviaGames: 8,  skillBadges: 4 },
    { id: 3,  name: "Omar Ahmed",   initials: "OA", color: "#cd7f32", arcadeGames: 10, triviaGames: 7,  skillBadges: 3 },
    { id: 4,  name: "Omar Hamdy",  initials: "OH", color: "#a855f7", arcadeGames: 8,  triviaGames: 6,  skillBadges: 2 },
    { id: 5,  name: "Abdelrahman Hesham",    initials: "AH", color: "#3b82f6", arcadeGames: 9,  triviaGames: 5,  skillBadges: 1 },
    { id: 6,  name: "Fathy Hafez", initials: "FH", color: "#ec4899", arcadeGames: 7,  triviaGames: 4,  skillBadges: 3 },
    { id: 7,  name: "Adam Mohamed",  initials: "AM", color: "#f97316", arcadeGames: 6,  triviaGames: 3,  skillBadges: 1 },
    { id: 8,  name: "Safwat Walid",  initials: "SW", color: "#06b6d4", arcadeGames: 5,  triviaGames: 2,  skillBadges: 1 },
];

const MAX = { arcade: 15, trivia: 10, skill: 5 };

// ── State ─────────────────────────────────────────────────────────
let sortKey   = "total";
let searchVal = "";

// ── Helpers ───────────────────────────────────────────────────────
function total(p) {
    return p.arcadeGames + p.triviaGames + p.skillBadges;
}

function getLoggedInName() {
    try {
        const raw = sessionStorage.getItem("currentUser") || localStorage.getItem("currentUser");
        if (raw) return JSON.parse(raw).name || "";
    } catch (_) {}
    return "";
}

function sorted(players) {
    const key = { total: p => total(p), arcade: p => p.arcadeGames, trivia: p => p.triviaGames, skill: p => p.skillBadges };
    return [...players].sort((a, b) => key[sortKey](b) - key[sortKey](a));
}

function filtered(players) {
    if (!searchVal) return players;
    return players.filter(p => p.name.toLowerCase().includes(searchVal.toLowerCase()));
}

// ── Render podium ─────────────────────────────────────────────────
function renderPodium(top3, loggedInName) {
    const medals  = ["gold", "silver", "bronze"];
    const labels  = ["1st Place", "2nd Place", "3rd Place"];
    const trophies = ["🥇", "🥈", "🥉"];

    document.getElementById("lb-podium").innerHTML = top3.map((p, i) => `
        <div class="lb-podium-card ${medals[i]}">
            <div class="lb-podium-medal">${trophies[i]}</div>
            <div class="lb-podium-avatar" style="background:${p.color}; border-color:${p.color};">${p.initials}</div>
            <div class="lb-podium-name text-font">
                ${p.name}${p.name === loggedInName ? ' <span class="lb-you-badge">YOU</span>' : ""}
            </div>
            <div class="lb-podium-score">${total(p)}</div>
            <div class="lb-podium-label text-font">${labels[i]} &bull; ${total(p)} badges</div>
        </div>
    `).join("");
}

// ── Render table rows ─────────────────────────────────────────────
function rankClass(rank) {
    return rank === 1 ? "rank-1" : rank === 2 ? "rank-2" : rank === 3 ? "rank-3" : "";
}

function rankBadge(rank) {
    if (rank === 1) return `<span class="lb-rank-badge gold">🥇 1st Place</span>`;
    if (rank === 2) return `<span class="lb-rank-badge silver">🥈 2nd Place</span>`;
    if (rank === 3) return `<span class="lb-rank-badge bronze">🥉 3rd Place</span>`;
    return `<span class="lb-rank-badge normal">#${rank}</span>`;
}

function statCell(value, max, pillColor, barColor) {
    const pct = Math.round((value / max) * 100);
    return `
        <div class="lb-stat-cell">
            <div class="lb-stat-top">
                <span class="lb-stat-count">${value}</span>
                <span class="lb-stat-pill" style="background:${pillColor};">${value}</span>
            </div>
            <div class="lb-bar-track">
                <div class="lb-bar-fill" style="width:${pct}%; background:${barColor};"></div>
            </div>
        </div>`;
}

function renderRows(players, loggedInName) {
    const base = sorted(PLAYERS);
    const list = filtered(players);

    const rowsEl = document.getElementById("lb-rows");
    const emptyEl = document.getElementById("lb-empty");

    if (list.length === 0) {
        rowsEl.innerHTML = "";
        emptyEl.style.display = "block";
        return;
    }
    emptyEl.style.display = "none";

    rowsEl.innerHTML = list.map(p => {
        const rank = base.indexOf(p) + 1;
        const isYou = p.name === loggedInName;

        return `
        <div class="lb-row ${rankClass(rank)}">
            <div class="lb-rank-cell">${rankBadge(rank)}</div>
            <div class="lb-name-cell">
                <div class="lb-avatar" style="background:${p.color}; border-color:${p.color};">${p.initials}</div>
                <div class="lb-player-info">
                    <span class="lb-player-name text-font">
                        ${p.name}
                        ${isYou ? '<span class="lb-you-badge">YOU</span>' : ""}
                    </span>
                </div>
            </div>
            ${statCell(p.arcadeGames, MAX.arcade, "#F8DE22", "#F8DE22")}
            ${statCell(p.triviaGames, MAX.trivia, "#08CB00", "#08CB00")}
            ${statCell(p.skillBadges, MAX.skill,  "#a855f7", "#a855f7")}
            <div class="lb-total-cell">
                <span class="lb-total-count">${total(p)}</span>
                <span class="lb-total-label text-font">badges</span>
            </div>
        </div>`;
    }).join("");
}

// ── Main render ───────────────────────────────────────────────────
function render() {
    const loggedInName = getLoggedInName();
    const base = sorted(PLAYERS);
    renderPodium(base.slice(0, 3), loggedInName);
    renderRows(filtered(sorted(PLAYERS)), loggedInName);
}

// ── Events ────────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
    render();

    document.getElementById("lb-search").addEventListener("input", e => {
        searchVal = e.target.value;
        renderRows(filtered(sorted(PLAYERS)), getLoggedInName());
    });

    document.querySelectorAll(".lb-sort-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            document.querySelectorAll(".lb-sort-btn").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            sortKey = btn.dataset.sort;
            render();
        });
    });
});