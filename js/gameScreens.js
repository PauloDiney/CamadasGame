// Sistema de navegação entre telas do jogo
const GameScreens = {
    currentScreen: 'main-menu',
    screens: ['main-menu', 'game-map', 'phases', 'shop', 'settings', 'phase-game'],
    
    // Inicializar sistema de telas
    init() {
        this.updatePointsDisplay();
        this.updateUI();
        
        // Adicionar listeners para teclas de atalho
        document.addEventListener('keydown', this.handleKeyPress.bind(this));
        
        // Atualizar interface a cada 1 segundo para pontos dinâmicos
        setInterval(() => {
            this.updatePointsDisplay();
        }, 1000);
    },

    // Mostrar uma tela específica
    showScreen(screenId, data = null) {
        // Validar se a tela existe
        if (!this.screens.includes(screenId)) {
            console.error('Tela não encontrada:', screenId);
            return false;
        }

        // Ocultar tela atual
        const currentScreenElement = document.getElementById(this.currentScreen);
        if (currentScreenElement) {
            currentScreenElement.classList.remove('active');
            currentScreenElement.classList.add('screen-transition');
        }

        // Mostrar nova tela
        const newScreenElement = document.getElementById(screenId);
        if (newScreenElement) {
            setTimeout(() => {
                newScreenElement.classList.add('active');
                newScreenElement.classList.add('screen-transition');
                
                // Remover classe de transição após animação
                setTimeout(() => {
                    newScreenElement.classList.remove('screen-transition');
                }, 500);
            }, 100);
        }

        // Atualizar tela atual
        this.currentScreen = screenId;

        // Atualizar interface específica da tela
        this.updateScreenContent(screenId, data);
        this.updatePointsDisplay();

        // Tocar som de transição (se habilitado)
        this.playTransitionSound();

        return true;
    },

    // Atualizar conteúdo específico da tela
    updateScreenContent(screenId, data) {
        switch (screenId) {
            case 'game-map':
                this.updateGameMap();
                break;
            case 'phases':
                this.updatePhasesList();
                break;
            case 'shop':
                this.updateShop();
                break;
            case 'settings':
                this.updateSettings();
                break;
            case 'phase-game':
                if (data && data.phaseId) {
                    GamePhases.loadPhase(data.phaseId);
                }
                break;
        }
    },

    // Atualizar exibição de pontos em todas as telas
    updatePointsDisplay() {
        const playerData = GameStorage.getPlayerData();
        const pointsElements = [
            'player-points',
            'map-points',
            'phases-points',
            'shop-points'
        ];

        pointsElements.forEach(elementId => {
            const element = document.getElementById(elementId);
            if (element) {
                element.textContent = GameData.utils.formatPoints(playerData.points);
            }
        });
    },

    // Atualizar mapa do jogo
    updateGameMap() {
        const playerData = GameStorage.getPlayerData();
        
        Object.keys(GameData.phases).forEach(phaseId => {
            const phaseNode = document.querySelector(`.phase-node.phase-${phaseId}`);
            if (phaseNode) {
                const isUnlocked = GameStorage.isPhaseUnlocked(parseInt(phaseId));
                const isCompleted = playerData.completedPhases.includes(parseInt(phaseId));
                
                // Remover classes anteriores
                phaseNode.classList.remove('locked', 'available', 'completed');
                
                // Adicionar classe apropriada
                if (isCompleted) {
                    phaseNode.classList.add('completed');
                } else if (isUnlocked) {
                    phaseNode.classList.add('available');
                } else {
                    phaseNode.classList.add('locked');
                }
            }
        });
    },

    // Atualizar lista de fases
    updatePhasesList() {
        const playerData = GameStorage.getPlayerData();
        const scores = GameStorage.getScores();
        
        Object.keys(GameData.phases).forEach(phaseId => {
            const phaseCard = document.querySelector(`.phase-card[data-phase="${phaseId}"]`);
            if (phaseCard) {
                const isUnlocked = GameStorage.isPhaseUnlocked(parseInt(phaseId));
                const isCompleted = playerData.completedPhases.includes(parseInt(phaseId));
                const phaseScore = scores[phaseId];
                
                // Atualizar estado visual
                phaseCard.classList.toggle('locked', !isUnlocked);
                
                // Atualizar status
                const statusElement = phaseCard.querySelector('.phase-status');
                if (statusElement) {
                    if (isCompleted) {
                        statusElement.textContent = '✓';
                        statusElement.className = 'phase-status completed';
                    } else {
                        statusElement.textContent = '🔒';
                        statusElement.className = 'phase-status';
                    }
                }

                // Atualizar melhor pontuação
                const bestScoreElement = document.getElementById(`best-score-${phaseId}`);
                if (bestScoreElement && phaseScore) {
                    bestScoreElement.textContent = phaseScore.bestScore;
                }

                // Atualizar botão
                const playButton = phaseCard.querySelector('.play-phase-btn');
                if (playButton) {
                    playButton.disabled = !isUnlocked;
                    playButton.textContent = isUnlocked ? 'Jogar' : 'Bloqueada';
                }
            }
        });
    },

    // Atualizar loja
    updateShop() {
        const playerData = GameStorage.getPlayerData();
        
        Object.keys(GameData.skills).forEach(skillId => {
            const skillElement = document.querySelector(`.shop-item[data-skill="${skillId}"]`);
            if (skillElement) {
                const hasSkill = playerData.ownedSkills.includes(skillId);
                const skill = GameData.skills[skillId];
                
                skillElement.classList.toggle('owned', hasSkill);
                
                const buyButton = skillElement.querySelector('.buy-btn');
                if (buyButton) {
                    if (hasSkill) {
                        buyButton.textContent = 'Adquirida';
                        buyButton.disabled = true;
                    } else {
                        buyButton.textContent = 'Comprar';
                        buyButton.disabled = playerData.points < skill.price;
                    }
                }
            }
        });

        // Atualizar habilidades adquiridas
        this.updateOwnedSkills();
    },

    // Atualizar lista de habilidades adquiridas
    updateOwnedSkills() {
        const playerData = GameStorage.getPlayerData();
        const ownedSkillsList = document.getElementById('owned-skills-list');
        
        if (ownedSkillsList) {
            if (playerData.ownedSkills.length === 0) {
                ownedSkillsList.innerHTML = '<p class="no-skills">Nenhuma habilidade adquirida ainda.</p>';
            } else {
                const skillsHtml = playerData.ownedSkills.map(skillId => {
                    const skill = GameData.skills[skillId];
                    return `
                        <div class="owned-skill">
                            <span class="skill-icon">${skill.icon}</span>
                            <div class="skill-info">
                                <strong>${skill.name}</strong>
                                <p>${skill.description}</p>
                            </div>
                        </div>
                    `;
                }).join('');
                
                ownedSkillsList.innerHTML = skillsHtml;
            }
        }
    },

    // Atualizar configurações
    updateSettings() {
        const settings = GameStorage.getSettings();
        
        // Atualizar toggle de som
        const soundToggle = document.getElementById('sound-toggle');
        if (soundToggle) {
            soundToggle.checked = settings.soundEnabled;
        }
    },

    // Atualizar interface geral
    updateUI() {
        this.updateGameMap();
        this.updatePhasesList();
        this.updateShop();
        this.updateSettings();
    },

    // Mostrar modal de resultado
    showResultModal(title, message, points, stars) {
        const modal = document.getElementById('result-modal');
        const titleElement = document.getElementById('result-title');
        const messageElement = document.getElementById('result-message');
        const pointsElement = document.getElementById('points-earned');
        const starsElement = document.getElementById('result-stars');
        
        if (modal && titleElement && messageElement && pointsElement && starsElement) {
            titleElement.textContent = title;
            messageElement.textContent = message;
            pointsElement.textContent = `+${points}`;
            
            // Gerar estrelas
            const starsHtml = '⭐'.repeat(stars) + '☆'.repeat(3 - stars);
            starsElement.innerHTML = starsHtml;
            
            modal.classList.add('active');
            
            // Tocar som de resultado
            this.playResultSound(stars);
        }
    },

    // Fechar modal
    closeModal() {
        const modal = document.getElementById('result-modal');
        if (modal) {
            modal.classList.remove('active');
        }
        
        // Retornar ao mapa após fechar modal
        this.showScreen('game-map');
    },

    // Lidar com teclas de atalho
    handleKeyPress(event) {
        // ESC - voltar/fechar
        if (event.key === 'Escape') {
            if (this.currentScreen === 'phase-game') {
                this.showScreen('game-map');
            } else if (this.currentScreen !== 'main-menu') {
                this.showScreen('main-menu');
            }
        }
        
        // M - menu principal
        if (event.key === 'm' || event.key === 'M') {
            if (this.currentScreen !== 'main-menu') {
                this.showScreen('main-menu');
            }
        }
        
        // G - mapa do jogo
        if (event.key === 'g' || event.key === 'G') {
            if (this.currentScreen !== 'game-map') {
                this.showScreen('game-map');
            }
        }
        
        // F - fases
        if (event.key === 'f' || event.key === 'F') {
            if (this.currentScreen !== 'phases') {
                this.showScreen('phases');
            }
        }
        
        // L - loja (L de Loja)
        if (event.key === 'l' || event.key === 'L') {
            if (this.currentScreen !== 'shop') {
                this.showScreen('shop');
            }
        }
        
        // S - configurações (S de Settings)
        if (event.key === 's' || event.key === 'S') {
            if (this.currentScreen !== 'settings') {
                this.showScreen('settings');
            }
        }
    },

    // Tocar som de transição (fictício)
    playTransitionSound() {
        const settings = GameStorage.getSettings();
        if (settings.soundEnabled) {
            // Aqui seria reproduzido um som de transição
            console.log('🔊 Som de transição');
        }
    },

    // Tocar som de resultado (fictício)
    playResultSound(stars) {
        const settings = GameStorage.getSettings();
        if (settings.soundEnabled) {
            if (stars === 3) {
                console.log('🔊 Som de vitória perfeita');
            } else if (stars >= 1) {
                console.log('🔊 Som de vitória');
            } else {
                console.log('🔊 Som de tentativa');
            }
        }
    },

    // Mostrar mensagem temporária
    showTemporaryMessage(message, type = 'info', duration = 3000) {
        // Criar elemento de mensagem se não existir
        let messageElement = document.getElementById('temp-message');
        if (!messageElement) {
            messageElement = document.createElement('div');
            messageElement.id = 'temp-message';
            messageElement.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 15px 25px;
                border-radius: 25px;
                color: white;
                font-weight: bold;
                z-index: 9999;
                opacity: 0;
                transition: all 0.3s ease;
                pointer-events: none;
            `;
            document.body.appendChild(messageElement);
        }

        // Definir cor baseada no tipo
        const colors = {
            info: 'linear-gradient(135deg, #667eea, #764ba2)',
            success: 'linear-gradient(135deg, #4caf50, #45a049)',
            error: 'linear-gradient(135deg, #ff6b6b, #ff5252)',
            warning: 'linear-gradient(135deg, #ffd93d, #ff9800)'
        };

        messageElement.style.background = colors[type] || colors.info;
        messageElement.textContent = message;
        messageElement.style.opacity = '1';
        messageElement.style.transform = 'translateY(0)';

        // Remover após duração especificada
        setTimeout(() => {
            messageElement.style.opacity = '0';
            messageElement.style.transform = 'translateY(-20px)';
        }, duration);
    }
};

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    GameScreens.init();
});

// Exportar para uso global
window.GameScreens = GameScreens;
