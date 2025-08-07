// Sistema principal de gerenciamento de fases
const GamePhases = {
    currentPhase: null,
    phaseStartTime: null,
    phaseHandlers: {
        1: null, // Será definido em phase1.js
        2: null, // Será definido em phase2.js
        3: null, // Será definido em phase3.js
        4: null  // Será definido em phase4.js
    },

    // Iniciar uma fase específica
    startPhase(phaseId) {
        const phase = GameData.phases[phaseId];
        if (!phase) {
            console.error('Fase não encontrada:', phaseId);
            return false;
        }

        // Verificar se a fase está desbloqueada
        if (!GameStorage.isPhaseUnlocked(phaseId)) {
            const requiredPoints = phase.requiredPoints;
            const message = GameData.messages.phaseBlocked.replace('{points}', requiredPoints);
            GameScreens.showTemporaryMessage(message, 'warning');
            
            // Fazer a fase balançar para indicar que está bloqueada
            const phaseNode = document.querySelector(`.phase-node.phase-${phaseId}`);
            if (phaseNode) {
                phaseNode.classList.add('shake');
                setTimeout(() => {
                    phaseNode.classList.remove('shake');
                }, 500);
            }
            return false;
        }

        this.currentPhase = phaseId;
        this.phaseStartTime = Date.now();

        // Carregar interface da fase
        this.loadPhase(phaseId);
        
        // Mostrar tela da fase
        GameScreens.showScreen('phase-game', { phaseId });

        return true;
    },

    // Carregar interface de uma fase específica
    loadPhase(phaseId) {
        const phase = GameData.phases[phaseId];
        const phaseContainer = document.getElementById('phase-game');
        
        if (!phase || !phaseContainer) return;

        // Gerar HTML base da fase
        const phaseHTML = this.generatePhaseHTML(phase);
        phaseContainer.innerHTML = phaseHTML;

        // Inicializar handler específico da fase
        this.initPhaseHandler(phaseId);
    },

    // Gerar HTML base para qualquer fase
    generatePhaseHTML(phase) {
        return `
            <div class="container">
                <header class="game-header">
                    <button class="back-btn" onclick="GamePhases.exitPhase()">← Sair</button>
                    <div class="phase-title-info">
                        <span class="phase-icon">${phase.icon}</span>
                        <div>
                            <h3>${phase.title}</h3>
                            <p>${phase.subtitle}</p>
                        </div>
                    </div>
                    <div class="points-display">
                        <span class="points-icon">⭐</span>
                        <span id="current-points">${GameStorage.getPlayerData().points}</span>
                    </div>
                </header>

                <div class="phase-content">
                    <div class="phase-instructions">
                        <p>${phase.description}</p>
                    </div>
                    
                    <div class="phase-score">
                        <div class="score-info">
                            <span>Pontuação: <span id="phase-score">0</span></span>
                            <span>Tempo: <span id="phase-time">00:00</span></span>
                        </div>
                    </div>
                    
                    <div id="phase-game-area" class="phase-game-area">
                        <!-- Conteúdo específico da fase será inserido aqui -->
                    </div>
                    
                    <div class="phase-controls">
                        <button id="reset-phase-btn" class="secondary-btn" onclick="GamePhases.resetPhase()">
                            🔄 Reiniciar
                        </button>
                        <button id="complete-phase-btn" class="primary-btn" onclick="GamePhases.completePhase()" disabled>
                            ✅ Finalizar
                        </button>
                    </div>
                </div>
            </div>
        `;
    },

    // Inicializar handler específico da fase
    initPhaseHandler(phaseId) {
        const handler = this.phaseHandlers[phaseId];
        if (handler && typeof handler.init === 'function') {
            handler.init();
        }

        // Iniciar timer da fase
        this.startPhaseTimer();
    },

    // Iniciar timer da fase
    startPhaseTimer() {
        this.phaseTimer = setInterval(() => {
            const elapsed = Date.now() - this.phaseStartTime;
            const minutes = Math.floor(elapsed / 60000);
            const seconds = Math.floor((elapsed % 60000) / 1000);
            
            const timeElement = document.getElementById('phase-time');
            if (timeElement) {
                timeElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            }
        }, 1000);
    },

    // Parar timer da fase
    stopPhaseTimer() {
        if (this.phaseTimer) {
            clearInterval(this.phaseTimer);
            this.phaseTimer = null;
        }
    },

    // Atualizar pontuação da fase
    updatePhaseScore(score) {
        const scoreElement = document.getElementById('phase-score');
        if (scoreElement) {
            scoreElement.textContent = score;
        }

        // Habilitar botão de finalizar se a pontuação for válida
        const completeButton = document.getElementById('complete-phase-btn');
        if (completeButton && score > 0) {
            completeButton.disabled = false;
        }
    },

    // Resetar fase atual
    resetPhase() {
        if (!this.currentPhase) return;

        // Reiniciar timer
        this.phaseStartTime = Date.now();
        
        // Reset do handler específico
        const handler = this.phaseHandlers[this.currentPhase];
        if (handler && typeof handler.reset === 'function') {
            handler.reset();
        }

        // Reset da pontuação
        this.updatePhaseScore(0);
        
        // Desabilitar botão de finalizar
        const completeButton = document.getElementById('complete-phase-btn');
        if (completeButton) {
            completeButton.disabled = true;
        }
    },

    // Completar fase atual
    completePhase() {
        if (!this.currentPhase) return;

        const handler = this.phaseHandlers[this.currentPhase];
        let score = 0;
        
        if (handler && typeof handler.getScore === 'function') {
            score = handler.getScore();
        }

        // Aplicar bônus de habilidades
        const playerData = GameStorage.getPlayerData();
        score = GameData.utils.applySkillEffects(score, playerData.ownedSkills);

        // Calcular bônus de tempo se a habilidade estiver ativa
        if (playerData.ownedSkills.includes('time-bonus')) {
            const elapsed = Date.now() - this.phaseStartTime;
            const minutes = elapsed / 60000;
            if (minutes < 2) { // Bônus para menos de 2 minutos
                score += GameData.skills['time-bonus'].value;
            }
        }

        // Calcular estrelas
        const phase = GameData.phases[this.currentPhase];
        const stars = GameData.utils.calculateStars(score, phase.maxScore);

        // Salvar resultado
        GameStorage.addPoints(score);
        GameStorage.completePhase(this.currentPhase, score, stars);

        // Parar timer
        this.stopPhaseTimer();

        // Animação de celebração
        if (window.Game && typeof Game.celebrateAchievement === 'function') {
            Game.celebrateAchievement('phase');
        }
        
        // Feedback visual no elemento da fase
        if (window.Game && typeof Game.showAnimatedFeedback === 'function') {
            const phaseElement = document.querySelector(`[data-phase="${this.currentPhase}"]`);
            if (phaseElement) {
                Game.showAnimatedFeedback(phaseElement, 'success');
            }
        }

        // Mostrar resultado
        const message = GameData.utils.getResultMessage(score, phase.maxScore, stars);
        GameScreens.showResultModal(
            GameData.messages.phaseComplete,
            message,
            score,
            stars
        );

        // Limpar fase atual
        this.currentPhase = null;
    },

    // Sair da fase atual
    exitPhase() {
        // Confirmar saída se houver progresso
        const handler = this.phaseHandlers[this.currentPhase];
        let hasProgress = false;
        
        if (handler && typeof handler.hasProgress === 'function') {
            hasProgress = handler.hasProgress();
        }

        if (hasProgress) {
            const confirm = window.confirm('Você tem certeza que deseja sair? O progresso da fase será perdido.');
            if (!confirm) {
                return;
            }
        }

        // Parar timer
        this.stopPhaseTimer();

        // Limpar fase atual
        this.currentPhase = null;

        // Voltar ao mapa
        GameScreens.showScreen('game-map');
    },

    // Registrar handler de uma fase
    registerPhaseHandler(phaseId, handler) {
        this.phaseHandlers[phaseId] = handler;
    },

    // Verificar se uma fase está ativa
    isPhaseActive(phaseId) {
        return this.currentPhase === phaseId;
    },

    // Obter dados da fase atual
    getCurrentPhaseData() {
        if (!this.currentPhase) return null;
        
        return {
            id: this.currentPhase,
            data: GameData.phases[this.currentPhase],
            startTime: this.phaseStartTime,
            elapsed: Date.now() - this.phaseStartTime
        };
    },

    // Aplicar efeito visual de sucesso
    showSuccessEffect(element) {
        if (element) {
            element.classList.add('correct-answer');
            setTimeout(() => {
                element.classList.remove('correct-answer');
            }, 1000);
        }
    },

    // Aplicar efeito visual de erro
    showErrorEffect(element) {
        if (element) {
            element.classList.add('wrong-answer');
            setTimeout(() => {
                element.classList.remove('wrong-answer');
            }, 1000);
        }
    },

    // Mostrar dica para o jogador
    showHint(message, duration = 3000) {
        GameScreens.showTemporaryMessage(message, 'info', duration);
    },

    // Validar resposta genérica
    validateAnswer(userAnswer, correctAnswer, partialCredit = false) {
        if (Array.isArray(correctAnswer)) {
            // Para respostas múltiplas
            if (partialCredit) {
                const matches = userAnswer.filter(answer => correctAnswer.includes(answer));
                return matches.length / correctAnswer.length;
            } else {
                return JSON.stringify(userAnswer.sort()) === JSON.stringify(correctAnswer.sort());
            }
        } else {
            // Para respostas simples
            return userAnswer === correctAnswer;
        }
    },

    // Embaralhar array (útil para randomização)
    shuffle(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }
};

// Exportar para uso global
window.GamePhases = GamePhases;
