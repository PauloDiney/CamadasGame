// Sistema de configurações do jogo
const GameSettings = {
    
    // Inicializar sistema de configurações
    init() {
        this.loadSettings();
        this.applySettings();
    },

    // Carregar configurações salvas
    loadSettings() {
        const settings = GameStorage.getSettings();
        
        // Aplicar configurações na interface
        const soundToggle = document.getElementById('sound-toggle');
        if (soundToggle) {
            soundToggle.checked = settings.soundEnabled;
        }
    },

    // Aplicar configurações ao jogo
    applySettings() {
        const settings = GameStorage.getSettings();
        
        // Configurar som
        this.applySoundSettings(settings.soundEnabled);
        
        // Outras configurações podem ser aplicadas aqui
    },

    // Alternar configuração de som
    toggleSound(enabled) {
        const settings = GameStorage.getSettings();
        settings.soundEnabled = enabled;
        GameStorage.saveSettings(settings);
        
        // Aplicar configuração
        this.applySoundSettings(enabled);
        
        // Feedback para o usuário
        const message = enabled ? 'Som ativado' : 'Som desativado';
        GameScreens.showTemporaryMessage(message, 'info');
        
        // Tocar som de teste se ativado
        if (enabled) {
            this.playTestSound();
        }
    },

    // Aplicar configurações de som
    applySoundSettings(enabled) {
        // Aqui seria configurado o sistema de áudio real
        console.log('🔊 Som do jogo:', enabled ? 'Ativado' : 'Desativado');
        
        // Armazenar estado global para outros módulos
        window.gameSoundEnabled = enabled;
    },

    // Resetar progresso do jogo
    resetProgress() {
        // Confirmar ação com o usuário
        const confirmed = this.showResetConfirmation();
        
        if (confirmed) {
            // Realizar reset
            const success = GameStorage.resetAllData();
            
            if (success) {
                // Mostrar mensagem de sucesso
                GameScreens.showTemporaryMessage(
                    'Progresso resetado com sucesso!', 
                    'success'
                );
                
                // Recarregar interface
                setTimeout(() => {
                    this.reloadGame();
                }, 1500);
            } else {
                // Mostrar mensagem de erro
                GameScreens.showTemporaryMessage(
                    'Erro ao resetar progresso. Tente novamente.', 
                    'error'
                );
            }
        }
    },

    // Mostrar confirmação de reset
    showResetConfirmation() {
        const playerStats = GameStorage.getPlayerStats();
        const message = `
Tem certeza que deseja resetar todo o progresso?

Dados que serão perdidos:
• ${playerStats.points} pontos
• ${playerStats.completedPhases}/${playerStats.totalPhases} fases concluídas
• ${playerStats.totalStars}/${playerStats.maxStars} estrelas
• ${playerStats.ownedSkills}/${playerStats.totalSkills} habilidades

Esta ação não pode ser desfeita!
        `;
        
        return confirm(message.trim());
    },

    // Recarregar jogo após reset
    reloadGame() {
        // Atualizar todas as interfaces
        GameScreens.updateUI();
        GameScreens.updatePointsDisplay();
        
        // Voltar ao menu principal
        GameScreens.showScreen('main-menu');
        
        // Tocar som de reset
        this.playResetSound();
    },

    // Exportar dados do jogo
    exportGameData() {
        const data = GameStorage.exportData();
        
        if (data) {
            // Criar arquivo para download
            this.downloadData(data, 'camadas-conexao-backup.json');
            
            GameScreens.showTemporaryMessage(
                'Dados exportados com sucesso!', 
                'success'
            );
        } else {
            GameScreens.showTemporaryMessage(
                'Erro ao exportar dados.', 
                'error'
            );
        }
    },

    // Importar dados do jogo
    importGameData() {
        // Criar input de arquivo
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = '.json';
        
        fileInput.onchange = (event) => {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const data = e.target.result;
                        const success = GameStorage.importData(data);
                        
                        if (success) {
                            GameScreens.showTemporaryMessage(
                                'Dados importados com sucesso!', 
                                'success'
                            );
                            
                            // Recarregar interface
                            setTimeout(() => {
                                this.reloadGame();
                            }, 1500);
                        } else {
                            GameScreens.showTemporaryMessage(
                                'Erro ao importar dados. Arquivo inválido.', 
                                'error'
                            );
                        }
                    } catch (error) {
                        GameScreens.showTemporaryMessage(
                            'Erro ao ler arquivo.', 
                            'error'
                        );
                    }
                };
                reader.readAsText(file);
            }
        };
        
        fileInput.click();
    },

    // Download de dados como arquivo
    downloadData(data, filename) {
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        URL.revokeObjectURL(url);
    },

    // Mostrar estatísticas detalhadas
    showDetailedStats() {
        const stats = GameStorage.getPlayerStats();
        const shopStats = GameShop.getShopStats();
        
        // Criar modal de estatísticas se não existir
        let statsModal = document.getElementById('stats-modal');
        if (!statsModal) {
            statsModal = this.createStatsModal();
        }
        
        // Preencher estatísticas
        const statsContent = statsModal.querySelector('.stats-content');
        statsContent.innerHTML = `
            <h3>📊 Estatísticas do Jogador</h3>
            
            <div class="stats-section">
                <h4>🎮 Progresso Geral</h4>
                <div class="stat-item">
                    <span>Pontos totais:</span>
                    <span>${GameData.utils.formatPoints(stats.points)}</span>
                </div>
                <div class="stat-item">
                    <span>Fases concluídas:</span>
                    <span>${stats.completedPhases}/${stats.totalPhases}</span>
                </div>
                <div class="stat-item">
                    <span>Estrelas coletadas:</span>
                    <span>${stats.totalStars}/${stats.maxStars}</span>
                </div>
                <div class="stat-item">
                    <span>Tentativas totais:</span>
                    <span>${stats.totalAttempts}</span>
                </div>
            </div>
            
            <div class="stats-section">
                <h4>🛒 Loja</h4>
                <div class="stat-item">
                    <span>Habilidades adquiridas:</span>
                    <span>${shopStats.skillsOwned}/${shopStats.totalSkills}</span>
                </div>
                <div class="stat-item">
                    <span>Pontos gastos:</span>
                    <span>${GameData.utils.formatPoints(shopStats.totalSpent)}</span>
                </div>
                <div class="stat-item">
                    <span>Progresso da loja:</span>
                    <span>${shopStats.completion}%</span>
                </div>
            </div>
            
            <div class="stats-section">
                <h4>🏆 Conquistas</h4>
                ${this.generateAchievementsList(stats, shopStats)}
            </div>
            
            <button class="modal-btn primary" onclick="GameSettings.closeStatsModal()">
                Fechar
            </button>
        `;
        
        statsModal.classList.add('active');
    },

    // Gerar lista de conquistas
    generateAchievementsList(stats, shopStats) {
        const achievements = [
            {
                id: 'first-phase',
                name: 'Primeiro Passo',
                description: 'Complete a primeira fase',
                achieved: stats.completedPhases >= 1,
                icon: '🎯'
            },
            {
                id: 'all-phases',
                name: 'Mestre das Camadas',
                description: 'Complete todas as fases',
                achieved: stats.completedPhases === stats.totalPhases,
                icon: '👑'
            },
            {
                id: 'perfect-score',
                name: 'Perfecionista',
                description: 'Obtenha 3 estrelas em todas as fases',
                achieved: stats.totalStars === stats.maxStars,
                icon: '⭐'
            },
            {
                id: 'big-spender',
                name: 'Colecionador',
                description: 'Adquira todas as habilidades',
                achieved: shopStats.skillsOwned === shopStats.totalSkills,
                icon: '💰'
            },
            {
                id: 'point-master',
                name: 'Milionário Digital',
                description: 'Acumule 1000+ pontos',
                achieved: stats.points >= 1000,
                icon: '💎'
            }
        ];
        
        return achievements.map(achievement => `
            <div class="achievement-item ${achievement.achieved ? 'achieved' : 'locked'}">
                <span class="achievement-icon">${achievement.achieved ? achievement.icon : '🔒'}</span>
                <div class="achievement-info">
                    <strong>${achievement.name}</strong>
                    <p>${achievement.description}</p>
                </div>
                <span class="achievement-status">
                    ${achievement.achieved ? '✓' : '❌'}
                </span>
            </div>
        `).join('');
    },

    // Criar modal de estatísticas
    createStatsModal() {
        const modal = document.createElement('div');
        modal.id = 'stats-modal';
        modal.className = 'modal stats-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="stats-content">
                    <!-- Conteúdo será inserido dinamicamente -->
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        return modal;
    },

    // Fechar modal de estatísticas
    closeStatsModal() {
        const statsModal = document.getElementById('stats-modal');
        if (statsModal) {
            statsModal.classList.remove('active');
        }
    },

    // Verificar problemas de performance
    checkPerformance() {
        const storageOk = GameStorage.checkStorageSpace();
        const memoryUsage = this.estimateMemoryUsage();
        
        let warnings = [];
        
        if (!storageOk) {
            warnings.push('Pouco espaço no localStorage');
        }
        
        if (memoryUsage > 10) { // MB
            warnings.push('Alto uso de memória');
        }
        
        if (warnings.length > 0) {
            GameScreens.showTemporaryMessage(
                `⚠️ Avisos: ${warnings.join(', ')}`, 
                'warning', 
                5000
            );
        }
        
        return warnings.length === 0;
    },

    // Estimar uso de memória (aproximado)
    estimateMemoryUsage() {
        try {
            const data = GameStorage.exportData();
            return data ? (data.length / 1024 / 1024) : 0; // MB
        } catch (e) {
            return 0;
        }
    },

    // Tocar sons de teste
    playTestSound() {
        if (GameStorage.getSettings().soundEnabled) {
            console.log('🔊 Som de teste');
        }
    },

    playResetSound() {
        if (GameStorage.getSettings().soundEnabled) {
            console.log('🔊 Som de reset');
        }
    },

    // Configurar modo escuro (futura implementação)
    toggleDarkMode(enabled) {
        const settings = GameStorage.getSettings();
        settings.darkMode = enabled;
        GameStorage.saveSettings(settings);
        
        // Aplicar tema
        document.body.classList.toggle('dark-mode', enabled);
        
        GameScreens.showTemporaryMessage(
            enabled ? 'Modo escuro ativado' : 'Modo claro ativado', 
            'info'
        );
    },

    // Configurar idioma (futura implementação)
    setLanguage(language) {
        const settings = GameStorage.getSettings();
        settings.language = language;
        GameStorage.saveSettings(settings);
        
        // Recarregar textos do jogo
        GameScreens.showTemporaryMessage(
            `Idioma alterado para: ${language}`, 
            'info'
        );
    }
};

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    GameSettings.init();
});

// Exportar para uso global
window.GameSettings = GameSettings;
