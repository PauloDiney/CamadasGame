// Sistema de armazenamento do jogo usando localStorage
const GameStorage = {
    // Chaves para o localStorage
    keys: {
        player: 'camadasConexao_player',
        settings: 'camadasConexao_settings',
        scores: 'camadasConexao_scores'
    },

    // Dados padrão do jogador
    defaultPlayer: {
        points: 0,
        completedPhases: [],
        ownedSkills: [],
        currentPhase: 1,
        totalPlaytime: 0,
        achievements: []
    },

    // Configurações padrão
    defaultSettings: {
        soundEnabled: true,
        language: 'pt-BR',
        difficulty: 'normal'
    },

    // Pontuações padrão das fases
    defaultScores: {
        1: { bestScore: 0, attempts: 0, stars: 0, completed: false },
        2: { bestScore: 0, attempts: 0, stars: 0, completed: false },
        3: { bestScore: 0, attempts: 0, stars: 0, completed: false },
        4: { bestScore: 0, attempts: 0, stars: 0, completed: false }
    },

    // Inicializar armazenamento
    init() {
        this.migrateOldData();
        this.validateData();
    },

    // Migrar dados antigos se necessário
    migrateOldData() {
        // Verificar se há dados de versões antigas e migrar se necessário
        const oldData = localStorage.getItem('gameProgress');
        if (oldData && !localStorage.getItem(this.keys.player)) {
            try {
                const parsed = JSON.parse(oldData);
                this.savePlayerData(parsed);
                localStorage.removeItem('gameProgress'); // Remove dados antigos
            } catch (e) {
                console.warn('Falha ao migrar dados antigos:', e);
            }
        }
    },

    // Validar e corrigir dados corrompidos
    validateData() {
        try {
            const player = this.getPlayerData();
            const settings = this.getSettings();
            const scores = this.getScores();

            // Validar dados do jogador
            if (typeof player.points !== 'number' || player.points < 0) {
                player.points = 0;
            }
            if (!Array.isArray(player.completedPhases)) {
                player.completedPhases = [];
            }
            if (!Array.isArray(player.ownedSkills)) {
                player.ownedSkills = [];
            }

            // Validar configurações
            if (typeof settings.soundEnabled !== 'boolean') {
                settings.soundEnabled = true;
            }

            // Salvar dados validados
            this.savePlayerData(player);
            this.saveSettings(settings);
            this.saveScores(scores);

        } catch (e) {
            console.error('Erro ao validar dados:', e);
            this.resetAllData();
        }
    },

    // Carregar dados do jogador
    getPlayerData() {
        try {
            const data = localStorage.getItem(this.keys.player);
            if (data) {
                const parsed = JSON.parse(data);
                return { ...this.defaultPlayer, ...parsed };
            }
        } catch (e) {
            console.error('Erro ao carregar dados do jogador:', e);
        }
        return { ...this.defaultPlayer };
    },

    // Salvar dados do jogador
    savePlayerData(playerData) {
        try {
            const dataToSave = { ...this.defaultPlayer, ...playerData };
            localStorage.setItem(this.keys.player, JSON.stringify(dataToSave));
            return true;
        } catch (e) {
            console.error('Erro ao salvar dados do jogador:', e);
            return false;
        }
    },

    // Carregar configurações
    getSettings() {
        try {
            const data = localStorage.getItem(this.keys.settings);
            if (data) {
                const parsed = JSON.parse(data);
                return { ...this.defaultSettings, ...parsed };
            }
        } catch (e) {
            console.error('Erro ao carregar configurações:', e);
        }
        return { ...this.defaultSettings };
    },

    // Salvar configurações
    saveSettings(settings) {
        try {
            const dataToSave = { ...this.defaultSettings, ...settings };
            localStorage.setItem(this.keys.settings, JSON.stringify(dataToSave));
            return true;
        } catch (e) {
            console.error('Erro ao salvar configurações:', e);
            return false;
        }
    },

    // Carregar pontuações
    getScores() {
        try {
            const data = localStorage.getItem(this.keys.scores);
            if (data) {
                const parsed = JSON.parse(data);
                return { ...this.defaultScores, ...parsed };
            }
        } catch (e) {
            console.error('Erro ao carregar pontuações:', e);
        }
        return { ...this.defaultScores };
    },

    // Salvar pontuações
    saveScores(scores) {
        try {
            const dataToSave = { ...this.defaultScores, ...scores };
            localStorage.setItem(this.keys.scores, JSON.stringify(dataToSave));
            return true;
        } catch (e) {
            console.error('Erro ao salvar pontuações:', e);
            return false;
        }
    },

    // Adicionar pontos ao jogador
    addPoints(points) {
        const playerData = this.getPlayerData();
        playerData.points = Math.max(0, playerData.points + points);
        playerData.points = Math.min(GameData.config.maxPoints, playerData.points);
        this.savePlayerData(playerData);
        return playerData.points;
    },

    // Gastar pontos do jogador
    spendPoints(points) {
        const playerData = this.getPlayerData();
        if (playerData.points >= points) {
            playerData.points -= points;
            this.savePlayerData(playerData);
            return true;
        }
        return false;
    },

    // Marcar fase como completa
    completePhase(phaseId, score, stars) {
        const playerData = this.getPlayerData();
        const scores = this.getScores();

        // Adicionar à lista de fases completas se não estiver
        if (!playerData.completedPhases.includes(phaseId)) {
            playerData.completedPhases.push(phaseId);
        }

        // Atualizar melhor pontuação
        const phaseScore = scores[phaseId] || this.defaultScores[phaseId];
        phaseScore.attempts += 1;
        phaseScore.completed = true;
        
        if (score > phaseScore.bestScore) {
            phaseScore.bestScore = score;
            phaseScore.stars = stars;
        }

        scores[phaseId] = phaseScore;

        this.savePlayerData(playerData);
        this.saveScores(scores);

        return {
            newRecord: score > (phaseScore.bestScore || 0),
            totalScore: score,
            stars: stars
        };
    },

    // Adquirir habilidade
    purchaseSkill(skillId, cost) {
        const playerData = this.getPlayerData();
        
        // Verificar se já possui a habilidade
        if (playerData.ownedSkills.includes(skillId)) {
            return { success: false, reason: 'already_owned' };
        }

        // Verificar se tem pontos suficientes
        if (playerData.points < cost) {
            return { success: false, reason: 'insufficient_points' };
        }

        // Realizar compra
        playerData.points -= cost;
        playerData.ownedSkills.push(skillId);
        this.savePlayerData(playerData);

        return { success: true };
    },

    // Verificar se possui habilidade
    hasSkill(skillId) {
        const playerData = this.getPlayerData();
        return playerData.ownedSkills.includes(skillId);
    },

    // Verificar se fase está desbloqueada
    isPhaseUnlocked(phaseId) {
        const playerData = this.getPlayerData();
        const phase = GameData.phases[phaseId];
        
        if (!phase) return false;
        
        // Verificar desbloqueio automático
        if (this.hasSkill('auto-unlock')) {
            return true;
        }

        return playerData.points >= phase.requiredPoints;
    },

    // Obter estatísticas do jogador
    getPlayerStats() {
        const playerData = this.getPlayerData();
        const scores = this.getScores();
        
        let totalStars = 0;
        let totalAttempts = 0;
        let completedPhases = 0;

        Object.values(scores).forEach(score => {
            totalStars += score.stars;
            totalAttempts += score.attempts;
            if (score.completed) completedPhases++;
        });

        return {
            points: playerData.points,
            completedPhases: completedPhases,
            totalPhases: Object.keys(GameData.phases).length,
            totalStars: totalStars,
            maxStars: Object.keys(GameData.phases).length * 3,
            totalAttempts: totalAttempts,
            ownedSkills: playerData.ownedSkills.length,
            totalSkills: Object.keys(GameData.skills).length
        };
    },

    // Resetar todos os dados
    resetAllData() {
        try {
            localStorage.removeItem(this.keys.player);
            localStorage.removeItem(this.keys.settings);
            localStorage.removeItem(this.keys.scores);
            return true;
        } catch (e) {
            console.error('Erro ao resetar dados:', e);
            return false;
        }
    },

    // Exportar dados para backup
    exportData() {
        try {
            const data = {
                player: this.getPlayerData(),
                settings: this.getSettings(),
                scores: this.getScores(),
                exportDate: new Date().toISOString(),
                version: GameData.config.version
            };
            return JSON.stringify(data, null, 2);
        } catch (e) {
            console.error('Erro ao exportar dados:', e);
            return null;
        }
    },

    // Importar dados de backup
    importData(jsonData) {
        try {
            const data = JSON.parse(jsonData);
            
            if (data.player) this.savePlayerData(data.player);
            if (data.settings) this.saveSettings(data.settings);
            if (data.scores) this.saveScores(data.scores);
            
            this.validateData(); // Validar após importar
            return true;
        } catch (e) {
            console.error('Erro ao importar dados:', e);
            return false;
        }
    },

    // Verificar espaço disponível no localStorage
    checkStorageSpace() {
        try {
            const testKey = 'test_storage_space';
            const testData = 'x'.repeat(1024); // 1KB de teste
            
            localStorage.setItem(testKey, testData);
            localStorage.removeItem(testKey);
            
            return true;
        } catch (e) {
            console.warn('Pouco espaço no localStorage:', e);
            return false;
        }
    }
};

// Inicializar quando o script for carregado
GameStorage.init();

// Exportar para uso global
window.GameStorage = GameStorage;
