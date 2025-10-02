// gameSystemSimple.js - Versão simplificada que funciona

console.log('🎮 GameSystem Simples carregado!');

class SimpleGameSystem {
    constructor() {
        // Limpar qualquer timer anterior se existir
        if (window.simpleGameSystem && window.simpleGameSystem.gameState.timerId) {
            console.log('🧹 Limpando timer anterior...');
            clearInterval(window.simpleGameSystem.gameState.timerId);
        }
        
        this.gameState = {
            vidas: 3,
            tempo: 60,
            pontos: 0,
            ativo: false,
            timerId: null
        };
        
        // Carregar habilidades da loja
        this.habilidades = this.carregarHabilidades();
        
        console.log('Inicializando SimpleGameSystem...');
        console.log('Habilidades carregadas:', this.habilidades);
        this.criarInterface();
    }
    
    carregarHabilidades() {
        try {
            const equipped = JSON.parse(localStorage.getItem('equippedItems') || '[]');
            console.log('Itens equipados encontrados:', equipped);
            
            // Mapear itens para habilidades do jogo usando os IDs corretos
            const habilidadesMap = {
                'cronometro-tempo-extra': { nome: 'Tempo+', bonus: 30, icone: '⏰', tipo: 'tempo' },
                'camera-lenta': { nome: 'Câmera Lenta', bonus: 0.5, icone: '🐌', tipo: 'velocidade' },
                'multiplicador-pontos': { nome: 'Pontos 2x', bonus: 2, icone: '🏆', tipo: 'pontos' },
                'dica-magica': { nome: 'Dica Mágica', bonus: 1, icone: '💡', tipo: 'dica' },
                'vida-extra': { nome: 'Vida Extra', bonus: 1, icone: '❤️', tipo: 'vida' }
            };
            
            const habilidadesAtivas = [];
            equipped.forEach(item => {
                // Verificar se é um objeto com id ou apenas string
                const itemId = typeof item === 'object' ? item.id : item;
                if (habilidadesMap[itemId]) {
                    habilidadesAtivas.push(habilidadesMap[itemId]);
                }
            });
            
            console.log('Habilidades ativas mapeadas:', habilidadesAtivas);
            
            // Aplicar bônus de habilidades
            this.aplicarBonusHabilidades(habilidadesAtivas);
            
            return habilidadesAtivas;
        } catch (error) {
            console.log('Erro ao carregar habilidades:', error);
            return [];
        }
    }
    
    aplicarBonusHabilidades(habilidades) {
        habilidades.forEach(hab => {
            switch(hab.tipo) {
                case 'vida':
                    this.gameState.vidas += hab.bonus;
                    console.log('✅ Vida extra aplicada! Vidas:', this.gameState.vidas);
                    break;
                case 'tempo':
                    this.gameState.tempo += hab.bonus;
                    console.log('✅ Tempo extra aplicado! Tempo:', this.gameState.tempo);
                    break;
                case 'pontos':
                    this.multiplicadorPontos = hab.bonus;
                    console.log('✅ Multiplicador de pontos aplicado:', hab.bonus + 'x');
                    break;
                case 'velocidade':
                    this.modificadorVelocidade = hab.bonus;
                    console.log('✅ Modificador de velocidade aplicado:', hab.bonus);
                    break;
                case 'dica':
                    this.temDicaMagica = true;
                    console.log('✅ Dica mágica ativada!');
                    break;
            }
        });
    }
    
    gerarHabilidadesHTML() {
        if (this.habilidades.length === 0) {
            return '<div style="color: #888; font-size: 0.6rem;">Nenhuma habilidade equipada</div>';
        }
        
        return this.habilidades.map(hab => `
            <div style="
                background: linear-gradient(135deg, #FFD700, #FFA500);
                color: #000;
                padding: 0.15rem 0.3rem;
                border-radius: 3px;
                font-size: 0.6rem;
                font-weight: bold;
                display: flex;
                align-items: center;
                gap: 0.15rem;
            ">
                ${hab.icone} ${hab.nome}
            </div>
        `).join('');
    }
    
    criarInterface() {
        console.log('Criando interface simples...');
        
        // Remove interface existente
        const existing = document.getElementById('simple-game-hud');
        if (existing) existing.remove();
        
        const hudHTML = `
            <div id="simple-game-hud" style="
                position: sticky;
                top: 0;
                left: 0;
                right: 0;
                width: 100%;
                background: linear-gradient(135deg, rgba(0, 0, 0, 0.9), rgba(0, 34, 68, 0.9));
                color: white;
                padding: 0.5rem;
                z-index: 9999;
                font-family: 'Kdam Thmor Pro', cursive;
                border-bottom: 2px solid #0DF;
                box-shadow: 0 1px 5px rgba(0, 0, 0, 0.3);
                transition: border-color 0.5s ease;
            ">
                <div style="
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    gap: 2rem;
                    margin-bottom: 0.3rem;
                ">
                    <div style="text-align: center;">
                        <div style="font-size: 1.2rem; margin-bottom: 0.1rem;">❤️</div>
                        <div style="font-size: 1.2rem; color: #0DF; font-weight: bold; transition: all 0.3s ease;" id="hud-vidas">${this.gameState.vidas}</div>
                        <div style="font-size: 0.6rem; text-transform: uppercase; color: #FAFAFA;">Vidas</div>
                    </div>
                    <div style="text-align: center;">
                        <div style="font-size: 1.2rem; margin-bottom: 0.1rem;">⏱️</div>
                        <div style="font-size: 1.2rem; color: #E1EA2D; font-weight: bold; transition: all 0.3s ease;" id="hud-tempo">${this.gameState.tempo}</div>
                        <div style="font-size: 0.6rem; text-transform: uppercase; color: #FAFAFA;">Tempo</div>
                    </div>
                    <div style="text-align: center;">
                        <div style="font-size: 1.2rem; margin-bottom: 0.1rem;">🏆</div>
                        <div style="font-size: 1.2rem; color: #0DF; font-weight: bold; transition: all 0.3s ease;" id="hud-pontos">${this.gameState.pontos}</div>
                        <div style="font-size: 0.6rem; text-transform: uppercase; color: #FAFAFA;">Pontos</div>
                    </div>
                    <div style="text-align: center;">
                        <div style="font-size: 1.2rem; margin-bottom: 0.1rem;">🎮</div>
                        <div style="font-size: 0.8rem; color: #4CAF50; font-weight: bold;">ATIVO</div>
                        <div style="font-size: 0.6rem; text-transform: uppercase; color: #FAFAFA;">Sistema</div>
                    </div>
                </div>
                
                <!-- Habilidades -->
                <div id="hud-habilidades" style="
                    display: flex;
                    justify-content: center;
                    gap: 0.3rem;
                    margin-bottom: 0.3rem;
                ">
                    ${this.gerarHabilidadesHTML()}
                </div>
                
                <!-- Barra de progresso -->
                <div style="
                    width: 100%;
                    height: 4px;
                    background: rgba(0, 0, 0, 0.5);
                    border-radius: 2px;
                    overflow: hidden;
                ">
                    <div id="hud-progress" style="
                        height: 100%;
                        background: linear-gradient(90deg, #0DF, #E1EA2D);
                        border-radius: 2px;
                        width: 100%;
                        transition: width 1s ease;
                    "></div>
                </div>
            </div>
        `;
        
        // Aguardar body e adicionar
        const addInterface = () => {
            if (document.body) {
                console.log('✅ Adicionando interface ao body...');
                
                // Inserir no início do body para ficar fixo no topo
                document.body.insertAdjacentHTML('afterbegin', hudHTML);
                
                // Adicionar padding ao body para compensar o HUD fixo
                document.body.style.paddingTop = '80px';
                
                const hudCreated = document.getElementById('simple-game-hud');
                if (hudCreated) {
                    console.log('✅ Interface criada com sucesso!');
                    this.iniciarTimer();
                } else {
                    console.log('❌ Falha ao criar interface');
                }
            } else {
                console.log('Body não disponível, tentando novamente...');
                setTimeout(addInterface, 50);
            }
        };
        
        addInterface();
    }
    
    iniciarTimer() {
        console.log('🚀 Iniciando timer...');
        
        // Limpeza robusta de timers anteriores
        if (this.gameState.timerId) {
            console.log('🧹 Limpando timer anterior ID:', this.gameState.timerId);
            clearInterval(this.gameState.timerId);
            this.gameState.timerId = null;
        }
        
        // Verificar se há outros timers globais rodando
        if (window.gameSystemTimer) {
            console.log('🧹 Limpando timer global anterior...');
            clearInterval(window.gameSystemTimer);
            window.gameSystemTimer = null;
        }
        
        this.gameState.ativo = true;
        
        this.gameState.timerId = setInterval(() => {
            this.gameState.tempo--;
            // Removido ganho automático de pontos - pontos apenas por acertos
            
            this.atualizarInterface();
            
            if (this.gameState.tempo <= 0) {
                this.tempoEsgotado();
            }
        }, 1000);
        
        // Armazenar referência global para controle adicional
        window.gameSystemTimer = this.gameState.timerId;
        console.log('⏲️ Timer iniciado com ID:', this.gameState.timerId);
    }
    
    atualizarInterface() {
        const tempoEl = document.getElementById('hud-tempo');
        const pontosEl = document.getElementById('hud-pontos');
        const vidasEl = document.getElementById('hud-vidas');
        const progressEl = document.getElementById('hud-progress');
        
        if (tempoEl) tempoEl.textContent = this.gameState.tempo;
        if (pontosEl) pontosEl.textContent = this.gameState.pontos;
        if (vidasEl) vidasEl.textContent = this.gameState.vidas;
        
        if (progressEl) {
            const percent = (this.gameState.tempo / 60) * 100;
            progressEl.style.width = Math.max(0, percent) + '%';
            
            // Mudar cor conforme urgência
            if (this.gameState.tempo <= 5) {
                progressEl.style.background = 'linear-gradient(90deg, #FF6B6B, #FF4444)';
                tempoEl.style.color = '#FF6B6B';
            } else if (this.gameState.tempo <= 10) {
                progressEl.style.background = 'linear-gradient(90deg, #FFA500, #FF8C00)';
                tempoEl.style.color = '#FFA500';
            } else {
                progressEl.style.background = 'linear-gradient(90deg, #0DF, #E1EA2D)';
                tempoEl.style.color = '#E1EA2D';
            }
        }
    }
    
    tempoEsgotado() {
        console.log('⏰ Tempo esgotado! Game Over!');
        this.gameOver();
    }
    
    perderVida() {
        this.gameState.vidas--;
        console.log('💔 Vida perdida! Restam:', this.gameState.vidas);
        
        // Animação visual quando perde vida
        const vidasEl = document.getElementById('hud-vidas');
        if (vidasEl) {
            vidasEl.style.color = '#FF6B6B';
            vidasEl.style.transform = 'scale(1.3)';
            vidasEl.style.textShadow = '0 0 10px #FF6B6B';
            
            setTimeout(() => {
                vidasEl.style.color = this.gameState.vidas > 0 ? '#0DF' : '#FF6B6B';
                vidasEl.style.transform = 'scale(1)';
                vidasEl.style.textShadow = 'none';
            }, 500);
        }
        
        this.atualizarInterface();
        
        if (this.gameState.vidas <= 0) {
            this.gameOver();
        } else {
            // Reiniciar timer com valor base
            this.gameState.tempo = 60;
            
            // Reaplicar bônus de tempo das habilidades
            const tempoExtra = this.habilidades.find(h => h.tipo === 'tempo');
            if (tempoExtra) {
                this.gameState.tempo += tempoExtra.bonus;
            }
            
            this.atualizarInterface();
        }
    }
    
    gameOver() {
        console.log('💀 Game Over!');
        clearInterval(this.gameState.timerId);
        this.gameState.ativo = false;
        
        const vidasEl = document.getElementById('hud-vidas');
        if (vidasEl) vidasEl.style.color = '#FF6B6B';
        
        // Mostrar mensagem de game over e redirecionar
        alert('Game Over! Pontuação: ' + this.gameState.pontos);
        
        // Redirecionar para trilha após 1 segundo
        setTimeout(() => {
            // Verificar se está na pasta fases para ajustar o caminho
            const isInFasesFolder = window.location.pathname.includes('/fases/');
            const trilhaPath = isInFasesFolder ? '../trilha.html' : 'trilha.html';
            window.location.href = trilhaPath;
        }, 1000);
    }
    
    ganharPontos(pontos) {
        let pontosFinais = pontos;
        
        // Aplicar multiplicador de pontos se houver habilidade
        if (this.multiplicadorPontos) {
            pontosFinais = Math.floor(pontos * this.multiplicadorPontos);
        }
        
        this.gameState.pontos += pontosFinais;
        this.atualizarInterface();
        console.log('🏆 Pontos ganhos:', pontosFinais, '(base:', pontos, ') | Total:', this.gameState.pontos);
        
        return pontosFinais; // Retorna os pontos finais ganhos
    }
    
    // Métodos públicos para controle
    pausar() {
        if (this.gameState.timerId) {
            clearInterval(this.gameState.timerId);
            this.gameState.ativo = false;
            console.log('⏸️ Timer pausado');
        }
    }
    
    continuar() {
        if (!this.gameState.ativo) {
            this.iniciarTimer();
            console.log('▶️ Timer continuado');
        }
    }
    
    reiniciar() {
        // Resetar valores base
        this.gameState.vidas = 3;
        this.gameState.tempo = 60;
        this.gameState.pontos = 0;
        
        // Resetar multiplicadores
        this.multiplicadorPontos = null;
        this.modificadorVelocidade = null;
        this.temDicaMagica = false;
        
        // Recarregar e reaplicar habilidades
        this.habilidades = this.carregarHabilidades();
        
        this.atualizarInterface();
        this.iniciarTimer();
        console.log('🔄 Jogo reiniciado');
    }
    
    // Método para desafios das fases
    desafioCompleto(pontosBonusDesafio = 100) {
        console.log('🎯 Desafio completado!');
        this.ganharPontos(pontosBonusDesafio);
        
        // Bonus de tempo por completar desafio
        this.gameState.tempo = Math.min(this.gameState.tempo + 10, 60);
        this.atualizarInterface();
        
        // Animação de sucesso
        const pontosEl = document.getElementById('hud-pontos');
        if (pontosEl) {
            pontosEl.style.color = '#4CAF50';
            pontosEl.style.transform = 'scale(1.2)';
            setTimeout(() => {
                pontosEl.style.color = '#0DF';
                pontosEl.style.transform = 'scale(1)';
            }, 300);
        }
    }
    
    desafioFalhou() {
        console.log('❌ Desafio falhou!');
        this.perderVida();
    }
    
    // Método para ser chamado quando jogador erra
    jogadorErrou(mensagem = 'Resposta incorreta!') {
        console.log('❌', mensagem);
        this.perderVida();
        
        // Feedback visual adicional
        const hud = document.getElementById('simple-game-hud');
        if (hud) {
            hud.style.borderColor = '#FF6B6B';
            setTimeout(() => {
                hud.style.borderColor = '#0DF';
            }, 1000);
        }
    }
    
    // Getter para outros scripts
    get estado() {
        return this.gameState;
    }
    
    // Método para finalizar fase
    finalizarFase() {
        console.log('🏁 Fase finalizada!');
        this.pausar();
        this.ganharPontos(200); // Bônus por completar fase
        
        // Feedback visual
        const hud = document.getElementById('simple-game-hud');
        if (hud) {
            hud.style.borderColor = '#4CAF50';
            setTimeout(() => {
                hud.style.borderColor = '#0DF';
            }, 2000);
        }
    }
}

// Auto-inicialização
function initSimpleGameSystem() {
    // Verificar se já existe uma instância
    if (window.simpleGameSystem) {
        console.log('⚠️ SimpleGameSystem já existe, não criando duplicado');
        return window.simpleGameSystem;
    }
    
    const currentPage = window.location.pathname;
    console.log('📍 Página atual:', currentPage);
    
    if (currentPage.includes('fase') && currentPage.includes('.html')) {
        console.log('🎯 Página de fase detectada!');
        
        try {
            window.simpleGameSystem = new SimpleGameSystem();
            console.log('✅ SimpleGameSystem criado:', window.simpleGameSystem);
        } catch (error) {
            console.error('❌ Erro ao criar SimpleGameSystem:', error);
        }
    } else {
        console.log('ℹ️ Não é uma página de fase');
    }
    
    return window.simpleGameSystem;
}

// Controle de inicialização única
let gameSystemInitialized = false;

function initializeOnce() {
    if (!gameSystemInitialized && !window.simpleGameSystem) {
        gameSystemInitialized = true;
        console.log('🚀 Inicializando SimpleGameSystem pela primeira vez...');
        return initSimpleGameSystem();
    } else {
        console.log('⏭️ SimpleGameSystem já inicializado, pulando...');
        return window.simpleGameSystem;
    }
}

// Tentativa de inicialização única
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeOnce);
} else {
    initializeOnce();
}

// Fallback apenas se ainda não foi inicializado
setTimeout(() => {
    if (!window.simpleGameSystem && !gameSystemInitialized) {
        console.log('🔄 Fallback: tentando inicializar após timeout...');
        initializeOnce();
    }
}, 500);

// Função global para debug
window.createSimpleGameSystem = function() {
    if (window.simpleGameSystem) {
        console.log('🔧 SimpleGameSystem já existe:', window.simpleGameSystem);
        return window.simpleGameSystem;
    }
    
    console.log('🔧 Criando SimpleGameSystem manualmente...');
    window.simpleGameSystem = new SimpleGameSystem();
    gameSystemInitialized = true;
    return window.simpleGameSystem;
};

// Funções globais para uso nas fases
window.gameSystemActions = {
    acertou: function(pontos = 50) {
        if (window.simpleGameSystem) {
            window.simpleGameSystem.desafioCompleto(pontos);
        }
    },
    
    errou: function(mensagem = 'Resposta incorreta!') {
        if (window.simpleGameSystem) {
            window.simpleGameSystem.jogadorErrou(mensagem);
        }
    },
    
    ganharPontos: function(pontos) {
        if (window.simpleGameSystem) {
            return window.simpleGameSystem.ganharPontos(pontos);
        }
        return pontos; // Fallback
    },
    
    pausar: function() {
        if (window.simpleGameSystem) {
            window.simpleGameSystem.pausar();
        }
    },
    
    continuar: function() {
        if (window.simpleGameSystem) {
            window.simpleGameSystem.continuar();
        }
    },
    
    reiniciar: function() {
        if (window.simpleGameSystem) {
            window.simpleGameSystem.reiniciar();
        }
    },
    
    // Função para testar perda de vida (para debug)
    testarVida: function() {
        console.log('🧪 Testando perda de vida...');
        if (window.simpleGameSystem) {
            window.simpleGameSystem.jogadorErrou('Teste de vida');
        } else {
            console.log('❌ GameSystem não encontrado!');
        }
    },
    
    // Função para testar game over por tempo (para debug)
    testarTempoEsgotado: function() {
        console.log('🧪 Testando tempo esgotado (Game Over direto)...');
        if (window.simpleGameSystem) {
            window.simpleGameSystem.tempoEsgotado();
        } else {
            console.log('❌ GameSystem não encontrado!');
        }
    },
    
    // Função para definir tempo baixo para teste
    definirTempoBaixo: function(segundos = 3) {
        console.log('🧪 Definindo tempo para', segundos, 'segundos...');
        if (window.simpleGameSystem) {
            window.simpleGameSystem.gameState.tempo = segundos;
            window.simpleGameSystem.atualizarInterface();
        } else {
            console.log('❌ GameSystem não encontrado!');
        }
    },
    
    // Função para testar pontos
    testarPontos: function() {
        console.log('🧪 Testando sistema de pontos...');
        
        // Verificar localStorage
        const pontosAtual = localStorage.getItem('gamePoints');
        console.log('📊 Pontos no localStorage:', pontosAtual);
        
        // Testar ganhar pontos
        if (window.simpleGameSystem) {
            const pontosGanhos = window.simpleGameSystem.ganharPontos(50);
            console.log('✅ Pontos ganhos:', pontosGanhos);
        }
        
        // Verificar se há NaN
        if (pontosAtual === 'NaN' || pontosAtual === null) {
            console.warn('⚠️ Pontos inválidos detectados, resetando para 0');
            localStorage.setItem('gamePoints', '0');
        }
    },
    
    // Função para mostrar status atual
    status: function() {
        if (window.simpleGameSystem) {
            const estado = window.simpleGameSystem.estado;
            console.log('📊 Status atual:', {
                vidas: estado.vidas,
                tempo: estado.tempo,
                pontos: estado.pontos,
                ativo: estado.ativo,
                habilidades: window.simpleGameSystem.habilidades
            });
        }
    },
    
    // Função para equipar item para teste
    equiparTeste: function(itemId) {
        console.log('🧪 Equipando item para teste:', itemId);
        let equipped = JSON.parse(localStorage.getItem('equippedItems') || '[]');
        
        // Verificar se já está equipado
        if (!equipped.some(item => (typeof item === 'object' ? item.id : item) === itemId)) {
            equipped.push({ id: itemId });
            localStorage.setItem('equippedItems', JSON.stringify(equipped));
            console.log('✅ Item equipado! Reinicie o jogo para aplicar.');
            
            // Recriar o sistema para aplicar mudanças
            if (window.simpleGameSystem) {
                window.simpleGameSystem = new SimpleGameSystem();
            }
        } else {
            console.log('ℹ️ Item já equipado');
        }
    }
};

// Função global de limpeza emergencial
window.cleanupGameSystem = function() {
    console.log('🧹 Limpeza emergencial do GameSystem...');
    
    // Limpar timer global
    if (window.gameSystemTimer) {
        clearInterval(window.gameSystemTimer);
        window.gameSystemTimer = null;
    }
    
    // Limpar timer da instância se existir
    if (window.simpleGameSystem && window.simpleGameSystem.gameState.timerId) {
        clearInterval(window.simpleGameSystem.gameState.timerId);
        window.simpleGameSystem.gameState.timerId = null;
    }
    
    // Remover interface se existir
    const interface = document.getElementById('simple-game-hud');
    if (interface) {
        interface.remove();
    }
    
    // Reset da instância
    window.simpleGameSystem = null;
    window.gameSystemInitialized = false;
    
    console.log('✅ Limpeza concluída!');
};

// Função para reiniciar completamente o sistema
window.restartGameSystem = function() {
    console.log('🔄 Reiniciando GameSystem completamente...');
    window.cleanupGameSystem();
    
    setTimeout(() => {
        initializeOnce();
    }, 100);
};

console.log('🎮 SimpleGameSystem script carregado completamente!');
