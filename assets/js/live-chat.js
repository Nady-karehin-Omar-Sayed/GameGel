// Live Chat JavaScript with Multi-User Support

class LiveChat {
    constructor() {
        this.currentRoom = 'general';
        this.currentUser = null;
        this.messages = this.loadMessages();
        this.users = {
            general: 12,
            gaming: 8,
            trading: 5,
            support: 3,
            competitions: 6
        };
        this.teamMembers = [
            { name: "Ali Ehab", initials: "AE", color: "#F8DE22", rank: "Elite", score: 450 },
            { name: "Omar Sayed", initials: "OS", color: "#fefffe", rank: "Pro", score: 385 },
            { name: "Omar Ahmed", initials: "OA", color: "#cd7f32", rank: "Expert", score: 320 },
            { name: "Fathy Hafez", initials: "FH", color: "#ec4899", rank: "legendary", score: 500 },
            { name: "Omar Hamdy", initials: "OH", color: "#234af5", rank: "Pro", score: 295 },
            { name: "Abdelrahman Hisham", initials: "AH", color: "#930606", rank: "Nope", score: 10 }
        ];
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadMessages();
        this.renderTeamMembers();
        this.setupUserSwitcher();
        // Set default user
        this.setCurrentUser(this.teamMembers[0]);
    }

    /**
     * Setup User Switcher UI
     */
    setupUserSwitcher() {
        const userSwitcherContainer = document.getElementById('userSwitcher');
        if (!userSwitcherContainer) return;

        const switcherHTML = `
            <div class="user-switcher-header">
                <h3>Current User</h3>
            </div>
            <div class="user-switcher-list">
                ${this.teamMembers.map((user, index) => `
                    <div class="user-switch-item" data-user-index="${index}">
                        <div class="user-switch-avatar" style="background: ${user.color};">
                            ${user.initials}
                        </div>
                        <div class="user-switch-info">
                            <div class="user-switch-name">${user.name}</div>
                            <div class="user-switch-rank">${user.rank}</div>
                        </div>
                        <div class="user-switch-indicator"></div>
                    </div>
                `).join('')}
            </div>
        `;

        userSwitcherContainer.innerHTML = switcherHTML;

        // Add click listeners
        document.querySelectorAll('.user-switch-item').forEach((item, index) => {
            item.addEventListener('click', () => {
                this.setCurrentUser(this.teamMembers[index]);
            });
        });
    }

    /**
     * Set Current User
     */
    setCurrentUser(user) {
        this.currentUser = user;

        // Update UI
        document.querySelectorAll('.user-switch-item').forEach((item, index) => {
            if (index === this.teamMembers.indexOf(user)) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });

        // Update current user display in chat area
        const currentUserDisplay = document.getElementById('currentUserDisplay');
        if (currentUserDisplay) {
            currentUserDisplay.innerHTML = `
                <div style="display: flex; align-items: center; gap: 10px;">
                    <div style="width: 30px; height: 30px; border-radius: 50%; background: ${user.color}; display: flex; align-items: center; justify-content: center; font-weight: bold; color: #000;">
                        ${user.initials}
                    </div>
                    <div>
                        <div style="font-size: 0.9rem; font-weight: bold;">${user.name}</div>
                        <div style="font-size: 0.75rem; color: #999;">${user.rank}</div>
                    </div>
                </div>
            `;
        }
    }

    renderTeamMembers() {
        const teamList = document.getElementById('teamList');
        if (!teamList) return;

        teamList.innerHTML = this.teamMembers.map(member => `
            <div class="team-member">
                <div class="team-avatar" style="background: ${member.color}; border-color: ${member.color};">
                    ${member.initials}
                </div>
                <div class="team-member-info">
                    <div class="team-member-name">${member.name}</div>
                    <div class="team-member-rank">${member.rank}</div>
                </div>
                <div class="team-member-score">⭐ ${member.score}</div>
            </div>
        `).join('');
    }

    setupEventListeners() {
        // Room selection
        document.querySelectorAll('.room-item').forEach(room => {
            room.addEventListener('click', () => this.switchRoom(room.dataset.room));
        });

        // Message sending
        const sendBtn = document.getElementById('sendBtn');
        const messageInput = document.getElementById('messageInput');

        sendBtn.addEventListener('click', () => this.sendMessage());
        messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // Emoji picker
        const emojiBtn = document.getElementById('emojiBtn');
        const emojiModal = document.getElementById('emojiModal');

        emojiBtn.addEventListener('click', () => {
            emojiModal.classList.toggle('show');
        });

        document.querySelectorAll('.emoji-item').forEach(emoji => {
            emoji.addEventListener('click', () => {
                messageInput.value += emoji.textContent;
                emojiModal.classList.remove('show');
                messageInput.focus();
            });
        });

        // Close emoji modal when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.emoji-modal') && !e.target.closest('.emoji-btn')) {
                emojiModal.classList.remove('show');
            }
        });

        // Add room button
        document.getElementById('addRoomBtn').addEventListener('click', () => this.createNewRoom());

        // Message input typing indicator
        messageInput.addEventListener('input', () => {
            this.showTypingIndicator();
        });
    }

    switchRoom(roomName) {
        // Remove active class from all rooms
        document.querySelectorAll('.room-item').forEach(room => {
            room.classList.remove('active');
        });

        // Add active class to selected room
        event.target.closest('.room-item').classList.add('active');

        this.currentRoom = roomName;

        // Update chat header
        const roomNames = {
            general: 'General Chat',
            gaming: 'Gaming Discussion',
            trading: 'Trading Items',
            support: 'Support',
            competitions: 'Competitions'
        };

        document.getElementById('currentRoomTitle').textContent = roomNames[roomName];

        // Load messages for this room
        this.loadMessages();

        // Clear input
        document.getElementById('messageInput').value = '';
    }

    sendMessage() {
        const messageInput = document.getElementById('messageInput');
        const messageText = messageInput.value.trim();

        if (!messageText || !this.currentUser) return;

        const chatMessages = document.getElementById('chatMessages');
        const messageTime = new Date().toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });

        // Create message element
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message user-message';
        messageDiv.innerHTML = `
            <div class="message-sender">
                <div class="message-avatar" style="background: ${this.currentUser.color};">
                    ${this.currentUser.initials}
                </div>
                <div class="message-sender-info">
                    <span class="message-sender-name">${this.currentUser.name}</span>
                    <span class="message-sender-rank">${this.currentUser.rank}</span>
                </div>
            </div>
            <div class="message-content">
                <p class="message-text">${this.escapeHtml(messageText)}</p>
                <span class="message-time">${messageTime}</span>
            </div>
        `;

        chatMessages.appendChild(messageDiv);

        // Store message
        if (!this.messages[this.currentRoom]) {
            this.messages[this.currentRoom] = [];
        }
        this.messages[this.currentRoom].push({
            text: messageText,
            time: messageTime,
            sender: 'user',
            user: this.currentUser
        });

        // Save to local storage
        localStorage.setItem('chatMessages', JSON.stringify(this.messages));

        // Scroll to bottom
        setTimeout(() => {
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }, 0);

        // Clear input
        messageInput.value = '';

        // Simulate bot/other user response after 2 seconds
        setTimeout(() => this.addBotResponse(), 2000);
    }

    addBotResponse() {
        const responses = [
            'That\'s awesome! 🎮',
            'I totally agree with you!',
            'Great point!',
            'Thanks for sharing!',
            'Haha, that\'s funny! 😂',
            'Let\'s discuss this more!',
            'Nice! Keep it going!'
        ];

        // Select random team member for response
        const randomMember = this.teamMembers[Math.floor(Math.random() * this.teamMembers.length)];

        const chatMessages = document.getElementById('chatMessages');
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        const messageTime = new Date().toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });

        const messageDiv = document.createElement('div');
        messageDiv.className = 'message bot-message';
        messageDiv.innerHTML = `
            <div class="message-sender">
                <div class="message-avatar" style="background: ${randomMember.color};">
                    ${randomMember.initials}
                </div>
                <div class="message-sender-info">
                    <span class="message-sender-name">${randomMember.name}</span>
                    <span class="message-sender-rank">${randomMember.rank}</span>
                </div>
            </div>
            <div class="message-content">
                <p class="message-text">${randomResponse}</p>
                <span class="message-time">${messageTime}</span>
            </div>
        `;

        chatMessages.appendChild(messageDiv);

        // Store message
        if (!this.messages[this.currentRoom]) {
            this.messages[this.currentRoom] = [];
        }
        this.messages[this.currentRoom].push({
            text: randomResponse,
            time: messageTime,
            sender: 'bot',
            user: randomMember
        });

        localStorage.setItem('chatMessages', JSON.stringify(this.messages));

        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    loadMessages() {
        const chatMessages = document.getElementById('chatMessages');
        chatMessages.innerHTML = `
            <div class="message bot-message">
                <div class="message-sender">
                    <div class="message-avatar" style="background: #3aa0ff;">
                        GG
                    </div>
                    <div class="message-sender-info">
                        <span class="message-sender-name">GameGel Bot</span>
                        <span class="message-sender-rank">System</span>
                    </div>
                </div>
                <div class="message-content">
                    <p class="message-text">Welcome to GameGel Live Chat! 🎮</p>
                    <span class="message-time">10:30 AM</span>
                </div>
            </div>
            <div class="message bot-message">
                <div class="message-sender">
                    <div class="message-avatar" style="background: #3aa0ff;">
                        GG
                    </div>
                    <div class="message-sender-info">
                        <span class="message-sender-name">GameGel Bot</span>
                        <span class="message-sender-rank">System</span>
                    </div>
                </div>
                <div class="message-content">
                    <p class="message-text">Have fun chatting with other gamers! Remember to follow the community guidelines.</p>
                    <span class="message-time">10:31 AM</span>
                </div>
            </div>
        `;

        // Load saved messages from localStorage
        const saved = localStorage.getItem('chatMessages');
        if (saved) {
            this.messages = JSON.parse(saved);
            if (this.messages[this.currentRoom]) {
                this.messages[this.currentRoom].forEach(msg => {
                    const messageDiv = document.createElement('div');
                    messageDiv.className = `message ${msg.sender}-message`;
                    
                    const senderUser = msg.user || this.teamMembers[0];
                    
                    messageDiv.innerHTML = `
                        <div class="message-sender">
                            <div class="message-avatar" style="background: ${senderUser.color};">
                                ${senderUser.initials}
                            </div>
                            <div class="message-sender-info">
                                <span class="message-sender-name">${senderUser.name}</span>
                                <span class="message-sender-rank">${senderUser.rank}</span>
                            </div>
                        </div>
                        <div class="message-content">
                            <p class="message-text">${msg.text}</p>
                            <span class="message-time">${msg.time}</span>
                        </div>
                    `;
                    chatMessages.appendChild(messageDiv);
                });
            }
        }

        // Scroll to bottom
        setTimeout(() => {
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }, 0);
    }

    createNewRoom() {
        const roomName = prompt('Enter room name:');
        if (!roomName) return;

        const roomsContainer = document.querySelector('.rooms-list');
        const newRoom = document.createElement('div');
        newRoom.className = 'room-item';
        newRoom.dataset.room = roomName.toLowerCase();
        newRoom.innerHTML = `
            <span class="room-icon">💬</span>
            <span class="room-name">${roomName}</span>
            <span class="room-count">1</span>
        `;

        newRoom.addEventListener('click', () => {
            roomsContainer.querySelectorAll('.room-item').forEach(r => r.classList.remove('active'));
            newRoom.classList.add('active');
            this.switchRoom(roomName.toLowerCase());
        });

        roomsContainer.appendChild(newRoom);
        this.messages[roomName.toLowerCase()] = [];
    }

    showTypingIndicator() {
        const indicator = document.getElementById('typingIndicator');
        indicator.classList.add('show');

        clearTimeout(this.typingTimeout);
        this.typingTimeout = setTimeout(() => {
            indicator.classList.remove('show');
        }, 3000);
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize chat when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new LiveChat();
});