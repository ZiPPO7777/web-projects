  class TypeSpeedGame {
            constructor() {
                this.gameState = {
                    isPlaying: false,
                    isPaused: false,
                    currentLevel: 1,
                    currentWordIndex: 0,
                    startTime: null,
                    endTime: null,
                    totalChars: 0,
                    correctChars: 0,
                    errors: 0,
                    streak: 0,
                    maxStreak: 0,
                    duration: 60,
                    words: []
                };

                this.settings = {
                    theme: 'dark',
                    fontSize: 18,
                    sound: 'classic',
                    music: 'none',
                    difficulty: 'normal',
                    playerName: 'Player',
                    avatar: '🎮'
                };

                this.achievements = [
                    { id: 'first_game', name: 'First Steps', description: 'Complete your first game', unlocked: false, icon: '🎯' },
                    { id: 'speed_demon', name: 'Speed Demon', description: 'Reach 60+ WPM', unlocked: false, icon: '⚡' },
                    { id: 'accuracy_master', name: 'Accuracy Master', description: 'Achieve 95%+ accuracy', unlocked: false, icon: '🎯' },
                    { id: 'streak_king', name: 'Streak King', description: 'Get 50+ word streak', unlocked: false, icon: '🔥' },
                    { id: 'level_master', name: 'Level Master', description: 'Complete all levels', unlocked: false, icon: '👑' }
                ];

                this.wordSets = {
                    1: ['the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had', 'her', 'was', 'one', 'our', 'out', 'day', 'get', 'has', 'him', 'his'],
                    2: ['amazing', 'beautiful', 'challenge', 'development', 'extraordinary', 'fascinating', 'grandmother', 'happiness', 'imagination', 'journey'],
                    3: ['The quick brown fox jumps over the lazy dog.', 'Programming is the art of solving problems.', 'Practice makes perfect in everything you do.'],
                    4: ['function calculateSpeed() {', 'const result = array.map(item => item.value);', 'if (condition === true) { return false; }'],
                    5: ['To be or not to be, that is the question.', 'The only way to do great work is to love what you do.', 'Innovation distinguishes between a leader and a follower.']
                };

                this.leaderboard = JSON.parse(localStorage.getItem('typeSpeedLeaderboard')) || [];
                this.savedStats = JSON.parse(localStorage.getItem('typeSpeedStats')) || this.achievements;

                this.init();
            }

            init() {
                this.setupEventListeners();
                this.loadSettings();
                this.generateWords();
                this.updateDisplay();
                this.renderLeaderboard();
                this.renderAchievements();
            }

            setupEventListeners() {
                // Tab navigation
                document.querySelectorAll('.tab-btn').forEach(btn => {
                    btn.addEventListener('click', (e) => this.switchTab(e.target.dataset.tab));
                });

                // Game controls
                document.getElementById('startBtn').addEventListener('click', () => this.startGame());
                document.getElementById('pauseBtn').addEventListener('click', () => this.pauseGame());
                document.getElementById('resetBtn').addEventListener('click', () => this.resetGame());
                document.getElementById('practiceBtn').addEventListener('click', () => this.startPractice());

                // Typing input
                document.getElementById('typingInput').addEventListener('input', (e) => this.processInput(e));
                document.getElementById('typingInput').addEventListener('keydown', (e) => this.handleKeyDown(e));

                // Level selection
                document.querySelectorAll('.level-card').forEach(card => {
                    card.addEventListener('click', (e) => this.selectLevel(parseInt(e.currentTarget.dataset.level)));
                });

                // Settings
                document.getElementById('themeSelect').addEventListener('change', (e) => this.changeTheme(e.target.value));
                document.getElementById('fontSizeSlider').addEventListener('input', (e) => this.changeFontSize(e.target.value));
                document.getElementById('soundSelect').addEventListener('change', (e) => this.changeSound(e.target.value));
                document.getElementById('musicSelect').addEventListener('change', (e) => this.changeMusic(e.target.value));
                document.getElementById('durationSlider').addEventListener('input', (e) => this.changeDuration(e.target.value));
                document.getElementById('difficultySelect').addEventListener('change', (e) => this.changeDifficulty(e.target.value));
                document.getElementById('playerName').addEventListener('change', (e) => this.changePlayerName(e.target.value));
                document.getElementById('avatarSelect').addEventListener('change', (e) => this.changeAvatar(e.target.value));

                // Modal
                document.getElementById('closeModal').addEventListener('click', () => this.closeModal());
                document.getElementById('playAgainBtn').addEventListener('click', () => this.playAgain());
                document.getElementById('viewStatsBtn').addEventListener('click', () => this.viewStats());
            }

            switchTab(tabName) {
                document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
                document.querySelectorAll('.game-screen').forEach(screen => screen.classList.remove('active'));
                
                document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
                document.getElementById(tabName).classList.add('active');
            }

            generateWords() {
                const wordSet = this.wordSets[this.gameState.currentLevel];
                this.gameState.words = [];
                
                for (let i = 0; i < 50; i++) {
                    this.gameState.words.push(wordSet[Math.floor(Math.random() * wordSet.length)]);
                }
                
                this.displayWords();
            }

            displayWords() {
                const textDisplay = document.getElementById('textDisplay');
                textDisplay.innerHTML = '';
                
                this.gameState.words.forEach((word, index) => {
                    const wordSpan = document.createElement('span');
                    wordSpan.textContent = word;
                    wordSpan.className = 'word';
                    if (index === 0) wordSpan.classList.add('current');
                    textDisplay.appendChild(wordSpan);
                });
            }

            startGame() {
                this.gameState.isPlaying = true;
                this.gameState.isPaused = false;
                this.gameState.startTime = Date.now();
                this.gameState.currentWordIndex = 0;
                this.gameState.totalChars = 0;
                this.gameState.correctChars = 0;
                this.gameState.errors = 0;
                this.gameState.streak = 0;

                document.getElementById('startBtn').disabled = true;
                document.getElementById('pauseBtn').disabled = false;
                document.getElementById('typingInput').disabled = false;
                document.getElementById('typingInput').focus();

                this.generateWords();
                this.startTimer();
                this.createParticles();
            }

            startTimer() {
                let timeLeft = this.gameState.duration;
                document.getElementById('timer').textContent = timeLeft;

                this.timer = setInterval(() => {
                    if (!this.gameState.isPaused && this.gameState.isPlaying) {
                        timeLeft--;
                        document.getElementById('timer').textContent = timeLeft;
                        
                        if (timeLeft <= 0) {
                            this.endGame();
                        }
                    }
                }, 1000);
            }

            processInput(e) {
                if (!this.gameState.isPlaying || this.gameState.isPaused) return;

                const input = e.target.value.trim();
                const currentWord = this.gameState.words[this.gameState.currentWordIndex];
                
                if (input === currentWord) {
                    this.correctWord();
                    e.target.value = '';
                } else if (currentWord.startsWith(input)) {
                    this.updateWordDisplay('correct');
                } else {
                    this.updateWordDisplay('incorrect');
                }
                
                this.updateStats();
            }

            correctWord() {
                const currentWord = this.gameState.words[this.gameState.currentWordIndex];
                this.gameState.correctChars += currentWord.length;
                this.gameState.totalChars += currentWord.length;
                this.gameState.streak++;
                this.gameState.maxStreak = Math.max(this.gameState.maxStreak, this.gameState.streak);

                // Mark word as correct
                const wordElements = document.querySelectorAll('.word');
                wordElements[this.gameState.currentWordIndex].classList.remove('current');
                wordElements[this.gameState.currentWordIndex].classList.add('correct');

                // Move to next word
                this.gameState.currentWordIndex++;
                if (this.gameState.currentWordIndex < wordElements.length) {
                    wordElements[this.gameState.currentWordIndex].classList.add('current');
                }

                // Play sound effect
                this.playSound('correct');
                
                // Show floating text
                this.showFloatingText('+1', 'success');
                
                // Generate more words if needed
                if (this.gameState.currentWordIndex >= this.gameState.words.length - 10) {
                    this.generateMoreWords();
                }
            }

            updateWordDisplay(status) {
                const wordElements = document.querySelectorAll('.word');
                const currentElement = wordElements[this.gameState.currentWordIndex];
                
                if (status === 'incorrect') {
                    currentElement.classList.add('incorrect');
                    this.gameState.errors++;
                    this.gameState.streak = 0;
                    this.playSound('error');
                } else {
                    currentElement.classList.remove('incorrect');
                }
            }

            generateMoreWords() {
                const wordSet = this.wordSets[this.gameState.currentLevel];
                for (let i = 0; i < 20; i++) {
                    this.gameState.words.push(wordSet[Math.floor(Math.random() * wordSet.length)]);
                }
                
                const textDisplay = document.getElementById('textDisplay');
                for (let i = this.gameState.words.length - 20; i < this.gameState.words.length; i++) {
                    const wordSpan = document.createElement('span');
                    wordSpan.textContent = this.gameState.words[i];
                    wordSpan.className = 'word';
                    textDisplay.appendChild(wordSpan);
                }
            }

            updateStats() {
                const timeElapsed = (Date.now() - this.gameState.startTime) / 1000 / 60; // in minutes
                const wpm = timeElapsed > 0 ? Math.round((this.gameState.correctChars / 5) / timeElapsed) : 0;
                const accuracy = this.gameState.totalChars > 0 ? Math.round((this.gameState.correctChars / this.gameState.totalChars) * 100) : 100;
                const progress = (this.gameState.currentWordIndex / this.gameState.words.length) * 100;

                document.getElementById('wpm').textContent = wpm;
                document.getElementById('accuracy').textContent = accuracy;
                document.getElementById('streak').textContent = this.gameState.streak;
                document.getElementById('progressFill').style.width = `${Math.min(progress, 100)}%`;
            }

            pauseGame() {
                this.gameState.isPaused = !this.gameState.isPaused;
                const pauseBtn = document.getElementById('pauseBtn');
                
                if (this.gameState.isPaused) {
                    pauseBtn.textContent = 'Resume';
                    document.getElementById('typingInput').disabled = true;
                } else {
                    pauseBtn.textContent = 'Pause';
                    document.getElementById('typingInput').disabled = false;
                    document.getElementById('typingInput').focus();
                }
            }

            resetGame() {
                this.gameState.isPlaying = false;
                this.gameState.isPaused = false;
                clearInterval(this.timer);
                
                document.getElementById('startBtn').disabled = false;
                document.getElementById('pauseBtn').disabled = true;
                document.getElementById('typingInput').disabled = false;
                document.getElementById('typingInput').value = '';
                document.getElementById('timer').textContent = this.gameState.duration;
                
                this.generateWords();
                this.updateDisplay();
            }

            endGame() {
                this.gameState.isPlaying = false;
                this.gameState.endTime = Date.now();
                clearInterval(this.timer);
                
                document.getElementById('typingInput').disabled = true;
                
                const finalStats = this.calculateFinalStats();
                this.saveScore(finalStats);
                this.checkAchievements(finalStats);
                this.showGameOverModal(finalStats);
            }

            calculateFinalStats() {
                const timeElapsed = (this.gameState.endTime - this.gameState.startTime) / 1000 / 60;
                const wpm = Math.round((this.gameState.correctChars / 5) / timeElapsed);
                const accuracy = Math.round((this.gameState.correctChars / this.gameState.totalChars) * 100);
                
                return {
                    wpm,
                    accuracy,
                    streak: this.gameState.maxStreak,
                    level: this.gameState.currentLevel,
                    duration: this.gameState.duration,
                    errors: this.gameState.errors,
                    wordsTyped: this.gameState.currentWordIndex
                };
            }

            saveScore(stats) {
                const score = {
                    player: this.settings.playerName,
                    avatar: this.settings.avatar,
                    wpm: stats.wpm,
                    accuracy: stats.accuracy,
                    level: stats.level,
                    date: new Date().toLocaleDateString()
                };
                
                this.leaderboard.push(score);
                this.leaderboard.sort((a, b) => b.wpm - a.wpm);
                this.leaderboard = this.leaderboard.slice(0, 10); // Keep top 10
                
                localStorage.setItem('typeSpeedLeaderboard', JSON.stringify(this.leaderboard));
                this.renderLeaderboard();
            }

            checkAchievements(stats) {
                let newAchievements = [];
                
                // First game
                if (!this.achievements.find(a => a.id === 'first_game').unlocked) {
                    this.achievements.find(a => a.id === 'first_game').unlocked = true;
                    newAchievements.push('First Steps');
                }
                
                // Speed demon
                if (stats.wpm >= 60 && !this.achievements.find(a => a.id === 'speed_demon').unlocked) {
                    this.achievements.find(a => a.id === 'speed_demon').unlocked = true;
                    newAchievements.push('Speed Demon');
                }
                
                // Accuracy master
                if (stats.accuracy >= 95 && !this.achievements.find(a => a.id === 'accuracy_master').unlocked) {
                    this.achievements.find(a => a.id === 'accuracy_master').unlocked = true;
                    newAchievements.push('Accuracy Master');
                }
                
                // Streak king
                if (stats.streak >= 50 && !this.achievements.find(a => a.id === 'streak_king').unlocked) {
                    this.achievements.find(a => a.id === 'streak_king').unlocked = true;
                    newAchievements.push('Streak King');
                }
                
                localStorage.setItem('typeSpeedStats', JSON.stringify(this.achievements));
                
                if (newAchievements.length > 0) {
                    this.showAchievementNotification(newAchievements);
                }
                
                this.renderAchievements();
            }

            showGameOverModal(stats) {
                const modal = document.getElementById('gameOverModal');
                const finalStats = document.getElementById('finalStats');
                
                finalStats.innerHTML = `
                    <div class="stats-bar">
                        <div class="stat-item">
                            <span class="stat-value">${stats.wpm}</span>
                            <span class="stat-label">WPM</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-value">${stats.accuracy}%</span>
                            <span class="stat-label">Accuracy</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-value">${stats.streak}</span>
                            <span class="stat-label">Best Streak</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-value">${stats.wordsTyped}</span>
                            <span class="stat-label">Words</span>
                        </div>
                    </div>
                `;
                
                modal.classList.add('active');
                gsap.from('.modal-content', { scale: 0.7, opacity: 0, duration: 0.5, ease: 'back.out(1.7)' });
            }

            closeModal() {
                document.getElementById('gameOverModal').classList.remove('active');
            }

            playAgain() {
                this.closeModal();
                this.resetGame();
                this.startGame();
            }

            viewStats() {
                this.closeModal();
                this.switchTab('leaderboard');
            }

            startPractice() {
                // Similar to start game but without timer
                this.gameState.isPlaying = true;
                this.gameState.isPaused = false;
                this.gameState.startTime = Date.now();
                
                document.getElementById('timer').textContent = '∞';
                document.getElementById('typingInput').disabled = false;
                document.getElementById('typingInput').focus();
                
                this.generateWords();
            }

            selectLevel(level) {
                if (level <= this.getUnlockedLevel()) {
                    this.gameState.currentLevel = level;
                    document.getElementById('level').textContent = level;
                    this.generateWords();
                    this.switchTab('game');
                }
            }

            getUnlockedLevel() {
                // For demo purposes, all levels are unlocked
                return 5;
            }

            // Settings methods
            changeTheme(theme) {
                this.settings.theme = theme;
                document.body.className = theme === 'dark' ? '' : `theme-${theme}`;
                this.saveSettings();
            }

            changeFontSize(size) {
                this.settings.fontSize = size;
                document.getElementById('textDisplay').style.fontSize = `${size}px`;
                this.saveSettings();
            }

            changeSound(sound) {
                this.settings.sound = sound;
                this.saveSettings();
            }

            changeMusic(music) {
                this.settings.music = music;
                this.saveSettings();
            }

            changeDuration(duration) {
                this.gameState.duration = parseInt(duration);
                document.getElementById('timer').textContent = duration;
                this.saveSettings();
            }

            changeDifficulty(difficulty) {
                this.settings.difficulty = difficulty;
                this.saveSettings();
            }

            changePlayerName(name) {
                this.settings.playerName = name || 'Player';
                this.saveSettings();
            }

            changeAvatar(avatar) {
                this.settings.avatar = avatar;
                this.saveSettings();
            }

            saveSettings() {
                localStorage.setItem('typeSpeedSettings', JSON.stringify(this.settings));
            }

            loadSettings() {
                const saved = localStorage.getItem('typeSpeedSettings');
                if (saved) {
                    this.settings = { ...this.settings, ...JSON.parse(saved) };
                }
                
                // Apply loaded settings
                this.changeTheme(this.settings.theme);
                this.changeFontSize(this.settings.fontSize);
                document.getElementById('themeSelect').value = this.settings.theme;
                document.getElementById('fontSizeSlider').value = this.settings.fontSize;
                document.getElementById('soundSelect').value = this.settings.sound;
                document.getElementById('musicSelect').value = this.settings.music;
                document.getElementById('durationSlider').value = this.gameState.duration;
                document.getElementById('difficultySelect').value = this.settings.difficulty;
                document.getElementById('playerName').value = this.settings.playerName;
                document.getElementById('avatarSelect').value = this.settings.avatar;
            }

            renderLeaderboard() {
                const tbody = document.getElementById('leaderboardBody');
                tbody.innerHTML = '';
                
                this.leaderboard.forEach((score, index) => {
                    const row = tbody.insertRow();
                    row.innerHTML = `
                        <td>${index + 1}</td>
                        <td>${score.avatar} ${score.player}</td>
                        <td>${score.wpm}</td>
                        <td>${score.accuracy}%</td>
                        <td>${score.level}</td>
                        <td>${score.date}</td>
                    `;
                });
            }

            renderAchievements() {
                const grid = document.getElementById('achievementsGrid');
                grid.innerHTML = '';
                
                this.achievements.forEach(achievement => {
                    const achievementEl = document.createElement('div');
                    achievementEl.className = `achievement ${achievement.unlocked ? 'unlocked' : ''}`;
                    achievementEl.innerHTML = `
                        <div class="achievement-icon">${achievement.icon}</div>
                        <h4>${achievement.name}</h4>
                        <p>${achievement.description}</p>
                    `;
                    grid.appendChild(achievementEl);
                });
            }

            updateDisplay() {
                document.getElementById('wpm').textContent = '0';
                document.getElementById('accuracy').textContent = '100';
                document.getElementById('streak').textContent = '0';
                document.getElementById('level').textContent = this.gameState.currentLevel;
                document.getElementById('progressFill').style.width = '0%';
            }

            playSound(type) {
                if (this.settings.sound === 'none') return;
                
                // Create audio context for sound effects
                try {
                    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                    const oscillator = audioContext.createOscillator();
                    const gainNode = audioContext.createGain();
                    
                    oscillator.connect(gainNode);
                    gainNode.connect(audioContext.destination);
                    
                    if (type === 'correct') {
                        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
                        oscillator.frequency.exponentialRampToValueAtTime(1200, audioContext.currentTime + 0.1);
                    } else if (type === 'error') {
                        oscillator.frequency.setValueAtTime(300, audioContext.currentTime);
                        oscillator.frequency.exponentialRampToValueAtTime(200, audioContext.currentTime + 0.2);
                    }
                    
                    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
                    
                    oscillator.start(audioContext.currentTime);
                    oscillator.stop(audioContext.currentTime + 0.2);
                } catch (e) {
                    // Audio not supported
                }
            }

            showFloatingText(text, type) {
                const floatingText = document.createElement('div');
                floatingText.className = 'floating-text';
                floatingText.textContent = text;
                floatingText.style.color = type === 'success' ? '#6bcf7f' : '#ff6b6b';
                floatingText.style.left = Math.random() * 200 + 'px';
                floatingText.style.top = '50px';
                
                document.querySelector('.typing-area').appendChild(floatingText);
                
                gsap.to(floatingText, {
                    y: -50,
                    opacity: 0,
                    duration: 1,
                    ease: 'power2.out',
                    onComplete: () => floatingText.remove()
                });
            }

            createParticles() {
                const container = document.querySelector('.typing-area');
                
                for (let i = 0; i < 20; i++) {
                    const particle = document.createElement('div');
                    particle.className = 'particle';
                    particle.style.left = Math.random() * 100 + '%';
                    particle.style.top = Math.random() * 100 + '%';
                    container.appendChild(particle);
                    
                    gsap.to(particle, {
                        x: (Math.random() - 0.5) * 200,
                        y: (Math.random() - 0.5) * 200,
                        opacity: 0,
                        duration: 2 + Math.random() * 2,
                        ease: 'power2.out',
                        repeat: -1,
                        repeatDelay: Math.random() * 3,
                        onComplete: () => {
                            particle.style.left = Math.random() * 100 + '%';
                            particle.style.top = Math.random() * 100 + '%';
                        }
                    });
                }
            }

            showAchievementNotification(achievements) {
                achievements.forEach((achievement, index) => {
                    setTimeout(() => {
                        const notification = document.createElement('div');
                        notification.innerHTML = `
                            <div style="position: fixed; top: 20px; right: 20px; background: var(--success-color); 
                                 color: white; padding: 15px 20px; border-radius: 8px; z-index: 1001;
                                 box-shadow: 0 5px 15px rgba(0,0,0,0.3);">
                                🏆 Achievement Unlocked: ${achievement}
                            </div>
                        `;
                        document.body.appendChild(notification);
                        
                        gsap.from(notification.firstElementChild, {
                            x: 300,
                            duration: 0.5,
                            ease: 'back.out(1.7)'
                        });
                        
                        setTimeout(() => {
                            gsap.to(notification.firstElementChild, {
                                x: 300,
                                duration: 0.3,
                                onComplete: () => notification.remove()
                            });
                        }, 3000);
                    }, index * 500);
                });
            }

            handleKeyDown(e) {
                // Add keyboard shortcuts
                if (e.ctrlKey || e.metaKey) {
                    switch(e.key) {
                        case 'Enter':
                            e.preventDefault();
                            if (!this.gameState.isPlaying) this.startGame();
                            break;
                        case ' ':
                            e.preventDefault();
                            this.pauseGame();
                            break;
                        case 'r':
                            e.preventDefault();
                            this.resetGame();
                            break;
                    }
                }
            }
        }

        // Initialize the game when DOM is loaded
        document.addEventListener('DOMContentLoaded', () => {
            const game = new TypeSpeedGame();
            
            // Add some entrance animations
            gsap.from('.logo', { scale: 0, duration: 1, ease: 'back.out(1.7)' });
            gsap.from('.subtitle', { opacity: 0, y: 20, duration: 0.8, delay: 0.3 });
            gsap.from('.nav-tabs', { opacity: 0, y: 20, duration: 0.8, delay: 0.5 });
            gsap.from('.game-screen.active', { opacity: 0, y: 30, duration: 0.8, delay: 0.7 });
        });