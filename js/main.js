// Arquivo principal do jogo - Inicialização e controle geral
const Game = {
    version: '1.0.0',
    initialized: false,
    
    // Inicializar o jogo
    init() {
        if (this.initialized) return;
        
        console.log(`🎮 Iniciando Camadas da Conexão v${this.version}`);
        
        // Verificar dependências
        if (!this.checkDependencies()) {
            console.error('❌ Dependências não encontradas');
            return;
        }
        
        // Inicializar sistemas
        this.initializeSystems();
        
        // Configurar eventos globais
        this.setupGlobalEvents();
        
        // Verificar integridade dos dados
        this.validateGameData();
        
        // Aplicar configurações salvas
        this.applySettings();
        
        // Atualizar interface inicial
        this.updateInitialInterface();
        
        // Marcar como inicializado
        this.initialized = true;
        
        console.log('✅ Jogo inicializado com sucesso');
        
        // Log de estatísticas iniciais
        this.logInitialStats();
    },

    // Verificar se todas as dependências estão carregadas
    checkDependencies() {
        const requiredObjects = [
            'GameData',
            'GameStorage', 
            'GameScreens',
            'GamePhases',
            'GameShop',
            'GameSettings'
        ];
        
        const missing = requiredObjects.filter(obj => !window[obj]);
        
        if (missing.length > 0) {
            console.error('❌ Objetos não encontrados:', missing);
            return false;
        }
        
        return true;
    },

    // Inicializar todos os sistemas
    initializeSystems() {
        try {
            // Inicializar armazenamento (já inicializado automaticamente)
            console.log('💾 Sistema de armazenamento: OK');
            
            // Inicializar telas
            GameScreens.init();
            console.log('🖥️ Sistema de telas: OK');
            
            // Inicializar loja
            GameShop.init();
            console.log('🛒 Sistema da loja: OK');
            
            // Inicializar configurações
            GameSettings.init();
            console.log('⚙️ Sistema de configurações: OK');
            
            // Verificar handlers das fases
            this.verifyPhaseHandlers();
            
        } catch (error) {
            console.error('❌ Erro ao inicializar sistemas:', error);
        }
    },

    // Verificar se handlers das fases estão registrados
    verifyPhaseHandlers() {
        const phases = Object.keys(GameData.phases);
        let handlersOK = 0;
        
        phases.forEach(phaseId => {
            const handler = GamePhases.phaseHandlers[phaseId];
            if (handler && typeof handler.init === 'function') {
                handlersOK++;
            } else {
                console.warn(`⚠️ Handler da fase ${phaseId} não encontrado`);
            }
        });
        
        console.log(`🎯 Handlers de fases: ${handlersOK}/${phases.length} OK`);
    },

    // Configurar eventos globais
    setupGlobalEvents() {
        // Evento de erro global
        window.addEventListener('error', (event) => {
            console.error('❌ Erro global:', event.error);
            this.handleGlobalError(event.error);
        });
        
        // Evento de warning global para promises rejeitadas
        window.addEventListener('unhandledrejection', (event) => {
            console.warn('⚠️ Promise rejeitada:', event.reason);
        });
        
        // Evento de mudança de visibilidade da página
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.onPageHidden();
            } else {
                this.onPageVisible();
            }
        });
        
        // Evento antes de sair da página
        window.addEventListener('beforeunload', (event) => {
            this.onBeforeUnload(event);
        });
        
        // Eventos de teclado globais para acessibilidade
        document.addEventListener('keydown', (event) => {
            this.handleGlobalKeyDown(event);
        });
    },

    // Validar dados do jogo
    validateGameData() {
        try {
            // Verificar estrutura das fases
            Object.keys(GameData.phases).forEach(phaseId => {
                const phase = GameData.phases[phaseId];
                if (!phase.title || !phase.data || !phase.requiredPoints) {
                    console.warn(`⚠️ Fase ${phaseId} com dados incompletos`);
                }
            });
            
            // Verificar habilidades
            Object.keys(GameData.skills).forEach(skillId => {
                const skill = GameData.skills[skillId];
                if (!skill.name || !skill.price || !skill.effect) {
                    console.warn(`⚠️ Habilidade ${skillId} com dados incompletos`);
                }
            });
            
            console.log('✅ Validação de dados: OK');
            
        } catch (error) {
            console.error('❌ Erro na validação de dados:', error);
        }
    },

    // Aplicar configurações salvas
    applySettings() {
        const settings = GameStorage.getSettings();
        
        // Aplicar configurações visuais
        if (settings.darkMode) {
            document.body.classList.add('dark-mode');
        }
        
        // Aplicar configurações de acessibilidade
        if (settings.reducedMotion) {
            document.body.classList.add('reduced-motion');
        }
        
        console.log('⚙️ Configurações aplicadas');
    },

    // Atualizar interface inicial
    updateInitialInterface() {
        // Atualizar pontos em todos os elementos
        GameScreens.updatePointsDisplay();
        
        // Atualizar estado das fases
        GameScreens.updateGameMap();
        
        // Verificar ofertas especiais da loja
        GameShop.checkSpecialOffers();
        
        // Verificar performance
        GameSettings.checkPerformance();
    },

    // Log de estatísticas iniciais
    logInitialStats() {
        const stats = GameStorage.getPlayerStats();
        
        console.log('📊 Estatísticas do jogador:');
        console.log(`   💰 Pontos: ${stats.points}`);
        console.log(`   🎯 Fases concluídas: ${stats.completedPhases}/${stats.totalPhases}`);
        console.log(`   ⭐ Estrelas: ${stats.totalStars}/${stats.maxStars}`);
        console.log(`   🛒 Habilidades: ${stats.ownedSkills}/${stats.totalSkills}`);
    },

    // Lidar com erros globais
    handleGlobalError(error) {
        // Em produção, poderia enviar erro para servidor de logging
        console.error('🚨 Erro capturado:', error);
        
        // Tentar recuperar o estado do jogo
        try {
            GameStorage.validateData();
            GameScreens.updateUI();
        } catch (recoveryError) {
            console.error('❌ Falha na recuperação:', recoveryError);
        }
    },

    // Página ficou oculta
    onPageHidden() {
        console.log('👁️ Página oculta - pausando timers');
        
        // Pausar timer da fase se ativa
        if (GamePhases.currentPhase) {
            GamePhases.stopPhaseTimer();
        }
    },

    // Página ficou visível
    onPageVisible() {
        console.log('👁️ Página visível - retomando');
        
        // Retomar timer da fase se ativa
        if (GamePhases.currentPhase) {
            GamePhases.startPhaseTimer();
        }
        
        // Atualizar interface
        GameScreens.updatePointsDisplay();
    },

    // Antes de sair da página
    onBeforeUnload(event) {
        // Verificar se há progresso não salvo
        if (GamePhases.currentPhase) {
            const handler = GamePhases.phaseHandlers[GamePhases.currentPhase];
            if (handler && handler.hasProgress && handler.hasProgress()) {
                event.preventDefault();
                event.returnValue = 'Você tem progresso não salvo na fase atual. Deseja sair mesmo assim?';
                return event.returnValue;
            }
        }
    },

    // Lidar com teclas globais
    handleGlobalKeyDown(event) {
        // Alt + D para modo debug
        if (event.altKey && event.key === 'd') {
            this.toggleDebugMode();
        }
        
        // Alt + S para estatísticas
        if (event.altKey && event.key === 's') {
            GameSettings.showDetailedStats();
        }
        
        // Alt + E para exportar dados
        if (event.altKey && event.key === 'e') {
            GameSettings.exportGameData();
        }
        
        // Alt + R para resetar (com confirmação)
        if (event.altKey && event.key === 'r') {
            if (confirm('Resetar todo o progresso?')) {
                GameSettings.resetProgress();
            }
        }
    },

    // Alternar modo debug
    toggleDebugMode() {
        const isDebug = document.body.classList.toggle('debug-mode');
        
        if (isDebug) {
            console.log('🔧 Modo debug ATIVADO');
            this.showDebugPanel();
        } else {
            console.log('🔧 Modo debug DESATIVADO');
            this.hideDebugPanel();
        }
    },

    // Mostrar painel de debug
    showDebugPanel() {
        let debugPanel = document.getElementById('debug-panel');
        
        if (!debugPanel) {
            debugPanel = document.createElement('div');
            debugPanel.id = 'debug-panel';
            debugPanel.innerHTML = `
                <div class="debug-header">
                    <h3>🔧 Painel Debug</h3>
                    <button onclick="Game.hideDebugPanel()">✕</button>
                </div>
                <div class="debug-content">
                    <button onclick="Game.addDebugPoints(100)">+100 Pontos</button>
                    <button onclick="Game.unlockAllPhases()">Desbloquear Fases</button>
                    <button onclick="Game.resetPhaseProgress()">Reset Fases</button>
                    <button onclick="Game.showGameData()">Ver Dados</button>
                    <button onclick="Game.testAnimations()">Testar Animações</button>
                </div>
            `;
            
            debugPanel.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                width: 250px;
                background: rgba(0, 0, 0, 0.9);
                color: white;
                border-radius: 10px;
                padding: 15px;
                z-index: 10000;
                font-size: 12px;
            `;
            
            document.body.appendChild(debugPanel);
        } else {
            debugPanel.style.display = 'block';
        }
    },

    // Ocultar painel de debug
    hideDebugPanel() {
        const debugPanel = document.getElementById('debug-panel');
        if (debugPanel) {
            debugPanel.style.display = 'none';
        }
        document.body.classList.remove('debug-mode');
    },

    // Funções de debug
    addDebugPoints(amount) {
        GameStorage.addPoints(amount);
        GameScreens.updatePointsDisplay();
        GameScreens.showTemporaryMessage(`Debug: +${amount} pontos`, 'info');
    },

    unlockAllPhases() {
        const playerData = GameStorage.getPlayerData();
        Object.keys(GameData.phases).forEach(phaseId => {
            if (!playerData.completedPhases.includes(parseInt(phaseId))) {
                playerData.completedPhases.push(parseInt(phaseId));
            }
        });
        GameStorage.savePlayerData(playerData);
        GameScreens.updateUI();
        GameScreens.showTemporaryMessage('Debug: Todas as fases desbloqueadas', 'success');
    },

    resetPhaseProgress() {
        const playerData = GameStorage.getPlayerData();
        playerData.completedPhases = [];
        GameStorage.savePlayerData(playerData);
        
        const scores = {};
        Object.keys(GameData.phases).forEach(phaseId => {
            scores[phaseId] = { bestScore: 0, attempts: 0, stars: 0, completed: false };
        });
        GameStorage.saveScores(scores);
        
        GameScreens.updateUI();
        GameScreens.showTemporaryMessage('Debug: Progresso das fases resetado', 'warning');
    },

    showGameData() {
        console.log('🎮 Dados do jogo:', GameData);
        console.log('💾 Dados do jogador:', GameStorage.getPlayerData());
        console.log('📊 Pontuações:', GameStorage.getScores());
        GameScreens.showTemporaryMessage('Debug: Dados logados no console', 'info');
    },

    testAnimations() {
        // Função removida - interferência com hover
        GameScreens.showTemporaryMessage('Debug: Testando animações', 'info');
    },

    // Obter informações do sistema
    getSystemInfo() {
        return {
            version: this.version,
            userAgent: navigator.userAgent,
            screen: `${screen.width}x${screen.height}`,
            viewport: `${window.innerWidth}x${window.innerHeight}`,
            localStorage: !!window.localStorage,
            performance: !!window.performance,
            gameInitialized: this.initialized,
            currentScreen: GameScreens.currentScreen,
            currentPhase: GamePhases.currentPhase
        };
    }
};

// Event listeners para inicialização
document.addEventListener('DOMContentLoaded', () => {
    console.log('📄 DOM carregado');
    Game.init();
    
    // Inicializar animações avançadas após carregamento
    setTimeout(() => {
        Game.setupAdvancedAnimations();
    }, 500);
});

window.addEventListener('load', () => {
    console.log('🌐 Página totalmente carregada');
    
    // Verificar se há atualizações dos service workers (PWA futuro)
    if ('serviceWorker' in navigator) {
        console.log('🔧 Service Worker suportado');
    }
    
    // Log final de inicialização
    setTimeout(() => {
        console.log('🎉 Jogo pronto para uso!');
        console.log('💡 Dica: Use Alt+D para ativar modo debug');
    }, 1000);
});

// Sistema de animações avançadas
Game.setupAdvancedAnimations = function() {
    this.addRippleEffect();
    this.addHoverAnimations();
    this.addClickAnimations();
    this.addScrollAnimations();
    this.startBackgroundAnimations();
    this.addDynamicCSS();
    console.log('✨ Animações avançadas ativadas!');
};

Game.addRippleEffect = function() {
    const style = document.createElement('style');
    style.textContent = `
        .btn-ripple {
            position: relative;
            overflow: hidden;
        }
        .ripple {
            position: absolute;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.6);
            transform: scale(0);
            animation: rippleEffect 0.6s linear;
            pointer-events: none;
        }
        @keyframes rippleEffect {
            to {
                transform: scale(4);
                opacity: 0;
            }
        }
        @keyframes confettiFall {
            to {
                transform: translateY(100vh) rotate(360deg);
                opacity: 0;
            }
        }
        @keyframes particleMove {
            to {
                transform: translate(var(--vx), var(--vy));
                opacity: 0;
            }
        }
        @keyframes slideInFromRight {
            from { right: -400px; }
            to { right: 20px; }
        }
        @keyframes slideOutToRight {
            from { right: 20px; }
            to { right: -400px; }
        }
    `;
    document.head.appendChild(style);

    // Adiciona efeito ripple aos botões
    const buttons = document.querySelectorAll('.btn, .menu-btn, .primary-btn, .secondary-btn');
    buttons.forEach(button => {
        button.classList.add('btn-ripple');
        
        button.addEventListener('click', (e) => {
            const ripple = document.createElement('span');
            const rect = button.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            ripple.classList.add('ripple');
            
            button.appendChild(ripple);
            
            setTimeout(() => {
                if (ripple.parentNode) {
                    ripple.remove();
                }
            }, 600);
        });
    });
};

Game.addHoverAnimations = function() {
    // Hover universal aplicado via CSS - sem JavaScript necessário
    console.log('Hover universal ativo via CSS');
};

Game.addSparkleEffect = function(element) {
    // Quantidade reduzida para botões do menu
    const isMenuButton = element.classList.contains('menu-btn');
    const sparkleCount = isMenuButton ? 2 : 3;
    const sparkleSize = isMenuButton ? '8px' : '12px';
    
    for (let i = 0; i < sparkleCount; i++) {
        const sparkle = document.createElement('div');
        sparkle.className = 'dynamic-sparkle';
        sparkle.innerHTML = ['✨', '⭐', '💫', '🌟'][Math.floor(Math.random() * 4)];
        sparkle.style.position = 'absolute';
        sparkle.style.pointerEvents = 'none';
        sparkle.style.fontSize = sparkleSize;
        sparkle.style.animation = `sparkle ${1 + Math.random()}s ease-out forwards`;
        sparkle.style.left = Math.random() * 80 + 10 + '%';
        sparkle.style.top = Math.random() * 80 + 10 + '%';
        sparkle.style.zIndex = '1000';
        
        element.style.position = 'relative';
        element.appendChild(sparkle);
        
        setTimeout(() => {
            if (sparkle.parentNode) {
                sparkle.remove();
            }
        }, 1500); // Tempo reduzido para menu buttons
    }
};

Game.addClickAnimations = function() {
    // Animações apenas para elementos específicos, sem os botões do menu e fases
    const clickableElements = document.querySelectorAll('.phase-card, .shop-item, .primary-btn, .secondary-btn');
    
    clickableElements.forEach(element => {
        element.addEventListener('click', () => {
            element.style.animation = 'rubberBand 0.6s ease';
            
            setTimeout(() => {
                element.style.animation = '';
            }, 600);
        });
    });
};

Game.addScrollAnimations = function() {
    if (!window.IntersectionObserver) return;
    
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animation = 'fadeInUp 0.8s ease forwards';
                entry.target.style.opacity = '1';
            }
        });
    }, observerOptions);
    
    const elementsToAnimate = document.querySelectorAll('.phase-content, .shop-content, .settings-content');
    elementsToAnimate.forEach(el => {
        el.style.opacity = '0';
        observer.observe(el);
    });
};

Game.startBackgroundAnimations = function() {
    const gameContainer = document.querySelector('.game-container');
    if (gameContainer) {
        setInterval(() => {
            const shouldAnimate = Math.random() < 0.2; // 20% chance
            if (shouldAnimate) {
                gameContainer.style.animation = 'morphing 4s ease-in-out';
                setTimeout(() => {
                    gameContainer.style.animation = '';
                }, 4000);
            }
        }, 15000); // A cada 15 segundos
    }
};

Game.addDynamicCSS = function() {
    const dynamicStyle = document.createElement('style');
    dynamicStyle.textContent = `
        /* Correções para estabilidade das animações */
        .menu-btn {
            transform: translateY(0) scale(1) !important;
        }
        
        .menu-btn:hover {
            transform: translateY(-3px) scale(1.02) !important;
        }
        
        .animate-success {
            animation: celebrate 2s ease, glowSuccess 1s ease !important;
        }
        .animate-error {
            animation: wobble 1s ease, glowError 1s ease !important;
        }
        .animate-warning {
            animation: pulse 1s ease, glow 1s ease !important;
        }
        .phase-node.completed {
            animation: celebrate 2s ease, glowRainbow 3s infinite !important;
        }
        .phase-node.available:hover {
            animation: heartbeat 1.5s infinite, glowSuccess 2s infinite !important;
        }
        .phase-node.locked:hover {
            animation: shake 0.5s ease, glowError 1s ease !important;
        }
        .shop-item.purchased {
            animation: success 1s ease, glowSuccess 2s infinite !important;
        }
        .shop-item.insufficient-points {
            animation: error 0.8s ease !important;
        }
        .correct-answer {
            animation: celebrate 1.5s ease, glowSuccess 2s infinite !important;
            background: linear-gradient(135deg, #4caf50, #45a049) !important;
            color: white !important;
        }
        .wrong-answer {
            animation: wobble 1s ease, glowError 2s ease !important;
            background: linear-gradient(135deg, #ff6b6b, #ff5252) !important;
            color: white !important;
        }
        .drag-item.dragging, .layer-card.dragging, .data-item.dragging {
            animation: float 0.5s ease infinite, rotate 2s linear infinite !important;
            transform: scale(1.1) rotate(5deg) !important;
            z-index: 1000 !important;
        }
        .drop-zone.drag-over {
            animation: pulse 1s ease infinite, glow 1s ease !important;
            transform: scale(1.02) !important;
            background: rgba(102, 126, 234, 0.15) !important;
        }
        .neon-text {
            animation: neonFlicker 4s infinite !important;
            text-shadow: 0 0 10px #667eea !important;
        }
        
        /* Sparkles para menu buttons */
        .menu-btn .dynamic-sparkle {
            position: absolute;
            pointer-events: none;
            z-index: 10;
            font-size: 10px;
        }
    `;
    document.head.appendChild(dynamicStyle);
};

Game.showAnimatedFeedback = function(element, type = 'success') {
    if (!element) return;
    
    element.classList.remove('animate-success', 'animate-error', 'animate-warning');
    
    const animationClass = `animate-${type}`;
    element.classList.add(animationClass);
    
    switch(type) {
        case 'success':
            this.addSuccessParticles(element);
            break;
        case 'error':
            this.addErrorShake(element);
            break;
    }
    
    setTimeout(() => {
        element.classList.remove(animationClass);
    }, 2000);
};

Game.addSuccessParticles = function(element) {
    if (!element) return;
    
    const particles = ['🎉', '🎊', '✨', '🌟', '💫', '⭐'];
    const rect = element.getBoundingClientRect();
    
    for (let i = 0; i < 8; i++) {
        const particle = document.createElement('div');
        particle.innerHTML = particles[Math.floor(Math.random() * particles.length)];
        particle.style.position = 'fixed';
        particle.style.left = rect.left + rect.width/2 + 'px';
        particle.style.top = rect.top + rect.height/2 + 'px';
        particle.style.fontSize = '20px';
        particle.style.pointerEvents = 'none';
        particle.style.zIndex = '10000';
        
        const angle = (i / 8) * Math.PI * 2;
        const velocity = 100 + Math.random() * 50;
        const vx = Math.cos(angle) * velocity;
        const vy = Math.sin(angle) * velocity;
        
        particle.style.setProperty('--vx', vx + 'px');
        particle.style.setProperty('--vy', vy + 'px');
        particle.style.animation = 'particleMove 2s ease-out forwards';
        
        document.body.appendChild(particle);
        
        setTimeout(() => {
            if (particle.parentNode) {
                particle.remove();
            }
        }, 2000);
    }
};

Game.addErrorShake = function(element) {
    if (!element) return;
    
    const originalTransform = element.style.transform;
    let shakeCount = 0;
    const maxShakes = 6;
    
    const shake = () => {
        if (shakeCount < maxShakes) {
            const intensity = (maxShakes - shakeCount) * 3;
            const randomX = (Math.random() - 0.5) * intensity;
            const randomY = (Math.random() - 0.5) * intensity;
            
            element.style.transform = `translate(${randomX}px, ${randomY}px) rotate(${randomX * 0.1}deg)`;
            shakeCount++;
            
            setTimeout(shake, 50);
        } else {
            element.style.transform = originalTransform;
        }
    };
    
    shake();
};

Game.celebrateAchievement = function(type = 'phase') {
    this.createConfetti();
    this.playAchievementSound(type);
    this.showAchievementBanner(type);
};

Game.createConfetti = function() {
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#f0932b', '#eb4d4b', '#6c5ce7'];
    const confettiCount = 50;
    
    for (let i = 0; i < confettiCount; i++) {
        const confetti = document.createElement('div');
        confetti.style.position = 'fixed';
        confetti.style.width = '10px';
        confetti.style.height = '10px';
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.left = Math.random() * 100 + 'vw';
        confetti.style.top = '-10px';
        confetti.style.zIndex = '10000';
        confetti.style.borderRadius = '50%';
        confetti.style.animation = `confettiFall ${2 + Math.random() * 2}s linear forwards`;
        
        document.body.appendChild(confetti);
        
        setTimeout(() => {
            if (confetti.parentNode) {
                confetti.remove();
            }
        }, 4000);
    }
};

Game.showAchievementBanner = function(type) {
    const banner = document.createElement('div');
    banner.className = 'achievement-banner';
    banner.innerHTML = `
        <div style="font-size: 2rem;">🏆</div>
        <div>
            <h3 style="margin: 0; color: white;">${type === 'phase' ? 'Fase Concluída!' : 'Conquista Desbloqueada!'}</h3>
            <p style="margin: 5px 0 0 0; color: rgba(255,255,255,0.9);">Parabéns pelo seu progresso!</p>
        </div>
    `;
    
    banner.style.cssText = `
        position: fixed;
        top: 20px;
        right: -400px;
        background: linear-gradient(135deg, #667eea, #764ba2);
        color: white;
        padding: 20px;
        border-radius: 15px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        z-index: 10000;
        display: flex;
        align-items: center;
        gap: 15px;
        min-width: 300px;
        animation: slideInFromRight 0.8s ease forwards, slideOutToRight 0.8s ease 3s forwards;
    `;
    
    document.body.appendChild(banner);
    
    setTimeout(() => {
        if (banner.parentNode) {
            banner.remove();
        }
    }, 4000);
};

Game.playAchievementSound = function(type) {
    const soundEnabled = GameStorage.getSetting('sound') !== false;
    if (soundEnabled) {
        console.log(`🔊 Playing ${type} achievement sound!`);
    }
};

// Exportar para uso global e debug
window.Game = Game;
