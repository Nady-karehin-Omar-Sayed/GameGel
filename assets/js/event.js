// Events & Tournaments JavaScript

class EventsManager {
    constructor() {
        this.events = this.loadEvents();
        this.registeredEvents = this.loadRegisteredEvents();
        this.currentFilter = 'all';
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.renderEvents();
        this.renderYourEvents();
        this.renderTeamRankings();
    }

    setupEventListeners() {
        // Filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentFilter = btn.dataset.filter;
                this.renderEvents();
            });
        });

        // Create event button
        document.getElementById('createEventBtn').addEventListener('click', () => {
            document.getElementById('createEventModal').classList.add('show');
        });

        // Create event form
        document.getElementById('createEventForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.createNewEvent();
        });

        // Close modals
        document.querySelectorAll('.close-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.target.closest('.event-modal, .create-event-modal').classList.remove('show');
            });
        });

        // Close modal on outside click
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('event-modal') || e.target.classList.contains('create-event-modal')) {
                e.target.classList.remove('show');
            }
        });
    }

    loadEvents() {
        return [
            {
                id: 1,
                title: 'League of Legends Pro Series',
                game: 'League of Legends',
                icon: '⚔️',
                date: '2026-05-15',
                status: 'upcoming',
                prize: '$20,000',
                participants: 128,
                description: 'Join the most competitive LoL tournament of the season!'
            },
            {
                id: 2,
                title: 'Counter-Strike World Championship',
                game: 'Counter-Strike 2',
                icon: '🔫',
                date: '2026-05-20',
                status: 'upcoming',
                prize: '$15,000',
                participants: 64,
                description: 'The ultimate CS:GO/CS2 tournament with top teams from around the world.'
            },
            {
                id: 3,
                title: 'Valorant Champions',
                game: 'Valorant',
                icon: '🎯',
                date: '2026-05-10',
                status: 'live',
                prize: '$25,000',
                participants: 96,
                description: 'Compete in the fastest-growing tactical shooter esports scene!'
            },
            {
                id: 4,
                title: 'Dota 2 International Qualifier',
                game: 'Dota 2',
                icon: '⚡',
                date: '2026-05-18',
                status: 'upcoming',
                prize: '$30,000',
                participants: 80,
                description: 'Battle your way to become a Dota legend!'
            },
            {
                id: 5,
                title: 'Rocket League Championship',
                game: 'Rocket League',
                icon: '⚽',
                date: '2026-05-25',
                status: 'upcoming',
                prize: '$10,000',
                participants: 32,
                description: 'Drive, boost, and score your way to victory!'
            },
            {
                id: 6,
                title: 'Apex Legends Invitational',
                game: 'Apex Legends',
                icon: '🎪',
                date: '2026-05-09',
                status: 'completed',
                prize: '$12,000',
                participants: 48,
                description: 'A battle royale tournament like no other!'
            }
        ];
    }

    loadRegisteredEvents() {
        const saved = localStorage.getItem('registeredEvents');
        return saved ? JSON.parse(saved) : [];
    }

    saveRegisteredEvents() {
        localStorage.setItem('registeredEvents', JSON.stringify(this.registeredEvents));
    }

    renderEvents() {
        const grid = document.getElementById('eventsGrid');
        grid.innerHTML = '';

        const filtered = this.filterEvents();

        filtered.forEach((event, index) => {
            const eventCard = document.createElement('div');
            eventCard.className = 'event-card';
            eventCard.style.animationDelay = `${index * 0.1}s`;

            const statusBadge = event.status === 'live' 
                ? '<span class="event-status-badge live">🔴 LIVE</span>'
                : event.status === 'upcoming'
                ? '<span class="event-status-badge upcoming">📅 UPCOMING</span>'
                : '<span class="event-status-badge">✅ COMPLETED</span>';

            eventCard.innerHTML = `
                <div class="event-image">
                    ${event.icon}
                    ${statusBadge}
                </div>
                <div class="event-content">
                    <h3 class="event-title">${event.title}</h3>
                    <p class="event-game">${event.game}</p>
                    <div class="event-meta">
                        <div class="event-meta-item">
                            <span>📅</span>
                            <span>${this.formatDate(event.date)}</span>
                        </div>
                        <div class="event-meta-item">
                            <span>👥</span>
                            <span>${event.participants} Players</span>
                        </div>
                    </div>
                    <div class="event-prize">💰 ${event.prize}</div>
                    <div class="event-footer">
                        <span class="event-count">${this.registeredEvents.includes(event.id) ? '✓ Registered' : 'Not registered'}</span>
                        <button class="event-btn" onclick="eventsManager.toggleEventRegistration(${event.id})">
                            ${this.registeredEvents.includes(event.id) ? 'Leave' : 'Join'}
                        </button>
                    </div>
                </div>
            `;

            grid.appendChild(eventCard);
        });
    }

    filterEvents() {
        if (this.currentFilter === 'all') return this.events;
        return this.events.filter(e => e.status === this.currentFilter);
    }

    renderYourEvents() {
        const container = document.getElementById('yourEventsList');
        
        if (this.registeredEvents.length === 0) {
            container.innerHTML = `
                <p class="text-font green">You haven't registered for any events yet. 
                <a href="#" style="color: #F8DE22;">Browse events</a> to get started!</p>
            `;
            return;
        }

        container.innerHTML = '';
        this.registeredEvents.forEach(eventId => {
            const event = this.events.find(e => e.id === eventId);
            if (event) {
                const eventEl = document.createElement('div');
                eventEl.className = 'registered-event';
                eventEl.innerHTML = `
                    <h3>${event.icon} ${event.title}</h3>
                    <p>${event.game}</p>
                    <p style="color: #F8DE22; font-weight: bold;">${event.prize}</p>
                    <button class="join-btn" onclick="eventsManager.toggleEventRegistration(${event.id})" style="width: 100%;">
                        Leave Event
                    </button>
                `;
                container.appendChild(eventEl);
            }
        });
    }

    renderTeamRankings() {
        const container = document.getElementById('teamRankings');
        if (!container) return;

        const teamMembers = [
            { position: 1, medal: '🥇', name: 'Ali Ehab', wins: 24, tournaments: 12, points: 4850 },
            { position: 2, medal: '🥈', name: 'Omar Sayed', wins: 18, tournaments: 10, points: 3920 },
            { position: 3, medal: '🥉', name: 'Omar Ahmed', wins: 15, tournaments: 9, points: 3240 },
            { position: 4, medal: '⭐', name: 'Fathy Hafez', wins: 12, tournaments: 8, points: 2850 }
        ];

        container.innerHTML = teamMembers.map(member => `
            <div class="team-rank-card">
                <div class="team-rank-medal">${member.medal}</div>
                <div class="team-rank-position">#${member.position}</div>
                <div class="team-rank-name">${member.name}</div>
                <div class="team-rank-stats">
                    <div class="team-rank-stat-item">
                        <span>Wins</span>
                        <span class="team-rank-stat-value">${member.wins}</span>
                    </div>
                    <div class="team-rank-stat-item">
                        <span>Tournaments</span>
                        <span class="team-rank-stat-value">${member.tournaments}</span>
                    </div>
                    <div class="team-rank-stat-item">
                        <span>Points</span>
                        <span class="team-rank-stat-value">${member.points}</span>
                    </div>
                </div>
            </div>
        `).join('');
    }

    toggleEventRegistration(eventId) {
        const index = this.registeredEvents.indexOf(eventId);
        if (index > -1) {
            this.registeredEvents.splice(index, 1);
            this.showNotification('Event left successfully!');
        } else {
            this.registeredEvents.push(eventId);
            this.showNotification('Successfully registered for event!');
        }
        this.saveRegisteredEvents();
        this.renderEvents();
        this.renderYourEvents();
    }

    createNewEvent() {
        const name = document.getElementById('eventName').value;
        const game = document.getElementById('eventGame').value;
        const date = document.getElementById('eventDate').value;
        const prize = document.getElementById('eventPrize').value;
        const description = document.getElementById('eventDescription').value;

        const newEvent = {
            id: Math.max(...this.events.map(e => e.id)) + 1,
            title: name,
            game: game,
            icon: '🎮',
            date: date,
            status: 'upcoming',
            prize: prize,
            participants: Math.floor(Math.random() * 50) + 10,
            description: description
        };

        this.events.unshift(newEvent);
        this.saveEvents();
        document.getElementById('createEventModal').classList.remove('show');
        document.getElementById('createEventForm').reset();
        this.renderEvents();
        this.showNotification('Event created successfully!');
    }

    saveEvents() {
        localStorage.setItem('events', JSON.stringify(this.events));
    }

    formatDate(dateString) {
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('en-US', options);
    }

    showNotification(message) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: #08CB00;
            color: black;
            padding: 15px 25px;
            border-radius: 8px;
            font-weight: bold;
            z-index: 2000;
            animation: slideIn 0.3s ease;
        `;
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

// Initialize when DOM is ready
let eventsManager;
document.addEventListener('DOMContentLoaded', () => {
    eventsManager = new EventsManager();
});