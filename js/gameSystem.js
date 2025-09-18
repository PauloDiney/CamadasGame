// gameSystem.js - Sistema de Tempo, Vida e Habilidades para as Fases

class GameSystem {
    constructor() {
        // Configurações padrão do jogo
        this.gameConfig = {
            // Configurações de tempo (em segundos)
            tempoBase: 60,               // Tempo base por fase
            tempoChallenge: 30,          // Tempo por desafio individual
            tempoWarning: 10,            // Tempo em que aparece warning (amarelo)
            tempoCritical: 5,            // Tempo crítico (vermelho)
            
            // Configurações de vida
            vidaMaxima: 3,               // Vidas máximas
            vidaInicial: 3,              // Vidas ao iniciar
            
            // Multiplicadores de dificuldade por fase
            dificuldadeMultiplicador: {
                1: 1.0,    // Fase 1 - Camada Física (mais fácil)
                2: 1.1,    // Fase 2 - Camada de Enlace
                3: 1.2,    // Fase 3 - Camada de Rede
                4: 1.3,    // Fase 4 - Camada de Transporte
                5: 1.4     // Fase 5 - Camada de Aplicação (mais difícil)
            }
        };

        // Estado atual do jogo
        this.gameState = {
            faseAtual: 1,
            vidasRestantes: this.gameConfig.vidaInicial,
            tempoRestante: this.gameConfig.tempoBase,
            desafioAtual: 1,
            pontuacao: 0,
            habilidadesAtivas: [],
            timerId: null,
            isPaused: false,
            gameStarted: false
        };

        // Definições das habilidades e seus efeitos
        this.habilidades = {
            'cronometro-tempo-extra': {
                id: 'cronometro-tempo-extra',
                name: 'Cronômetro de Tempo Extra',
                description: 'Adiciona +30 segundos extras para responder cada pergunta',
                tipo: 'tempo',
                efeito: {
                    tempoExtra: 30,
                    aplicarEm: 'desafio'
                },
                ativa: false
            },
            'camera-lenta': {
                id: 'camera-lenta',
                name: 'Câmera Lenta',
                description: 'Faz o tempo passar 50% mais devagar durante perguntas difíceis',
                tipo: 'tempo',
                efeito: {
                    multiplicadorTempo: 0.5,
                    aplicarEm: 'dificil'
                },
                ativa: false
            },
            'vida-extra': {
                id: 'vida-extra',
                name: 'Vida Extra',
                description: 'Permite errar uma pergunta sem perder vida',
                tipo: 'protecao',
                efeito: {
                    vidasExtras: 1,
                    aplicarEm: 'erro'
                },
                ativa: false,
                usada: false
            },
            'multiplicador-pontos': {
                id: 'multiplicador-pontos',
                name: 'Multiplicador de Pontos',
                description: 'Dobra os pontos ganhos em todas as perguntas certas',
                tipo: 'bonus',
                efeito: {
                    multiplicadorPontos: 2,
                    aplicarEm: 'acerto'
                },
                ativa: false
            },
            'dica-magica': {
                id: 'dica-magica',
                name: 'Dica Mágica',
                description: 'Remove uma alternativa errada de cada pergunta',
                tipo: 'ajuda',
                efeito: {
                    removeAlternativa: true,
                    aplicarEm: 'pergunta'
                },
                ativa: false,
                usosRestantes: 3
            }
        };

        this.inicializar();
    }

    inicializar() {
        console.log('Inicializando GameSystem...');
        this.carregarHabilidadesEquipadas();
        console.log('Criando interface...');
        this.criarInterfaceGameSystem();
        console.log('Configurando eventos...');
        this.configurarEventos();
        console.log('GameSystem inicializado!');
    }

    // Carrega as habilidades equipadas do localStorage
    carregarHabilidadesEquipadas() {
        const equippedItems = JSON.parse(localStorage.getItem('equippedItems') || '[]');
        
        // Reset todas as habilidades
        Object.keys(this.habilidades).forEach(id => {
            this.habilidades[id].ativa = false;
        });

        // Ativa as habilidades equipadas
        equippedItems.forEach(item => {
            if (this.habilidades[item.id]) {
                this.habilidades[item.id].ativa = true;
                this.gameState.habilidadesAtivas.push(item.id);
            }
        });

        console.log('Habilidades ativas:', this.gameState.habilidadesAtivas);
    }

    // Cria a interface visual do sistema de jogo
    criarInterfaceGameSystem() {
        console.log('Criando interface do GameSystem...');
        
        const existingInterface = document.getElementById('game-system-interface');
        if (existingInterface) {
            console.log('Interface já existe, removendo...');
            existingInterface.remove();
        }

        const interfaceHTML = `
            <div id="game-system-interface" style="
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                background: linear-gradient(135deg, rgba(0, 0, 0, 0.9), rgba(0, 34, 68, 0.9));
                backdrop-filter: blur(10px);
                border-bottom: 2px solid #0DF;
                padding: 1rem;
                z-index: 1000;
                font-family: 'Kdam Thmor Pro', cursive;
            ">
                <div style="
                    display: flex;
                    justify-content: center;
                    gap: 2rem;
                    margin-bottom: 1rem;
                ">
                    <div style="
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        background: rgba(0, 221, 255, 0.1);
                        border: 2px solid rgba(0, 221, 255, 0.3);
                        border-radius: 10px;
                        padding: 0.75rem 1rem;
                        min-width: 80px;
                    " class="vida-display">
                        <div style="font-size: 1.5rem; margin-bottom: 0.25rem;">❤️</div>
                        <div style="
                            font-size: 1.25rem;
                            font-weight: bold;
                            color: #0DF;
                            margin-bottom: 0.25rem;
                        ">
                            <span id="vidas-count">${this.gameState.vidasRestantes}</span>
                            <span style="color: rgba(0, 221, 255, 0.7); font-size: 0.9rem;">/${this.gameConfig.vidaMaxima}</span>
                        </div>
                        <div style="font-size: 0.75rem; color: #FAFAFA; text-transform: uppercase;">Vidas</div>
                    </div>
                    
                    <div style="
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        background: rgba(0, 221, 255, 0.1);
                        border: 2px solid rgba(0, 221, 255, 0.3);
                        border-radius: 10px;
                        padding: 0.75rem 1rem;
                        min-width: 80px;
                    " class="tempo-display">
                        <div style="font-size: 1.5rem; margin-bottom: 0.25rem;">⏱️</div>
                        <div style="
                            font-size: 1.25rem;
                            font-weight: bold;
                            color: #0DF;
                            margin-bottom: 0.25rem;
                        ">
                            <span id="tempo-count">${this.gameState.tempoRestante}</span>
                            <span style="color: rgba(0, 221, 255, 0.7); font-size: 0.9rem;">s</span>
                        </div>
                        <div style="font-size: 0.75rem; color: #FAFAFA; text-transform: uppercase;">Tempo</div>
                    </div>
                    
                    <div style="
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        background: rgba(0, 221, 255, 0.1);
                        border: 2px solid rgba(0, 221, 255, 0.3);
                        border-radius: 10px;
                        padding: 0.75rem 1rem;
                        min-width: 80px;
                    " class="pontos-display">
                        <div style="font-size: 1.5rem; margin-bottom: 0.25rem;">🏆</div>
                        <div style="
                            font-size: 1.25rem;
                            font-weight: bold;
                            color: #0DF;
                            margin-bottom: 0.25rem;
                        ">
                            <span id="pontos-count">${this.gameState.pontuacao}</span>
                        </div>
                        <div style="font-size: 0.75rem; color: #FAFAFA; text-transform: uppercase;">Pontos</div>
                    </div>
                </div>
                
                <div id="habilidades-ativas" style="
                    display: flex;
                    justify-content: center;
                    gap: 0.5rem;
                    margin-bottom: 0.5rem;
                    flex-wrap: wrap;
                ">
                    <!-- Habilidades serão adicionadas aqui -->
                </div>
                
                <div style="
                    width: 100%;
                    height: 6px;
                    background: rgba(0, 0, 0, 0.3);
                    border-radius: 3px;
                    overflow: hidden;
                    margin-top: 0.5rem;
                ">
                    <div id="tempo-progress" style="
                        height: 100%;
                        background: linear-gradient(90deg, #0DF, #E1EA2D);
                        border-radius: 3px;
                        transition: width 1s linear;
                        width: 100%;
                    "></div>
                </div>
            </div>
        `;

        // Aguardar o body estar disponível
        const addInterface = () => {
            const body = document.body;
            if (body) {
                console.log('Adicionando interface ao body...');
                body.insertAdjacentHTML('afterbegin', interfaceHTML);
                body.style.paddingTop = '140px';
                
                // Verificar se foi adicionado
                const newInterface = document.getElementById('game-system-interface');
                if (newInterface) {
                    console.log('Interface criada com sucesso!');
                    this.atualizarInterfaceHabilidades();
                } else {
                    console.error('Falha ao criar interface');
                }
            } else {
                console.log('Body não disponível ainda, tentando novamente...');
                setTimeout(addInterface, 100);
            }
        };

        addInterface();
    }

    // Aplica estilos CSS para a interface
    aplicarEstilosInterface() {
        const styles = `
            <style id="game-system-styles">
                .game-system-interface {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    background: linear-gradient(135deg, rgba(0, 0, 0, 0.9), rgba(0, 34, 68, 0.9));
                    backdrop-filter: blur(10px);
                    border-bottom: 2px solid #0DF;
                    padding: 1rem;
                    z-index: 1000;
                    font-family: "Kdam Thmor Pro", cursive;
                }

                .game-stats {
                    display: flex;
                    justify-content: center;
                    gap: 2rem;
                    margin-bottom: 1rem;
                }

                .stat-item {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    background: rgba(0, 221, 255, 0.1);
                    border: 2px solid rgba(0, 221, 255, 0.3);
                    border-radius: 10px;
                    padding: 0.75rem 1rem;
                    min-width: 80px;
                }

                .stat-icon {
                    font-size: 1.5rem;
                    margin-bottom: 0.25rem;
                }

                .stat-value {
                    font-size: 1.25rem;
                    font-weight: bold;
                    color: #0DF;
                    margin-bottom: 0.25rem;
                }

                .stat-max {
                    color: rgba(0, 221, 255, 0.7);
                    font-size: 0.9rem;
                }

                .stat-label {
                    font-size: 0.75rem;
                    color: #FAFAFA;
                    text-transform: uppercase;
                }

                .vida-display.low-health {
                    border-color: #FF6B6B;
                    background: rgba(255, 107, 107, 0.1);
                }

                .vida-display.low-health .stat-value {
                    color: #FF6B6B;
                    animation: pulse-red 1s infinite;
                }

                .tempo-display.warning {
                    border-color: #FFA500;
                    background: rgba(255, 165, 0, 0.1);
                }

                .tempo-display.warning .stat-value {
                    color: #FFA500;
                }

                .tempo-display.critical {
                    border-color: #FF6B6B;
                    background: rgba(255, 107, 107, 0.1);
                }

                .tempo-display.critical .stat-value {
                    color: #FF6B6B;
                    animation: pulse-red 0.5s infinite;
                }

                .habilidades-ativas {
                    display: flex;
                    justify-content: center;
                    gap: 0.5rem;
                    margin-bottom: 0.5rem;
                    flex-wrap: wrap;
                }

                .habilidade-icon {
                    background: linear-gradient(135deg, #E1EA2D, #0DF);
                    border-radius: 8px;
                    padding: 0.5rem;
                    font-size: 0.75rem;
                    color: #000;
                    font-weight: bold;
                    min-width: 60px;
                    text-align: center;
                    position: relative;
                    border: 2px solid rgba(225, 234, 45, 0.5);
                }

                .habilidade-icon.tempo { background: linear-gradient(135deg, #00BFFF, #1E90FF); }
                .habilidade-icon.protecao { background: linear-gradient(135deg, #32CD32, #228B22); }
                .habilidade-icon.bonus { background: linear-gradient(135deg, #FFD700, #FFA500); }
                .habilidade-icon.ajuda { background: linear-gradient(135deg, #FF69B4, #FF1493); }

                .habilidade-icon.used {
                    opacity: 0.5;
                    filter: grayscale(100%);
                }

                .habilidade-usos {
                    position: absolute;
                    top: -5px;
                    right: -5px;
                    background: #FF6B6B;
                    color: white;
                    border-radius: 50%;
                    width: 18px;
                    height: 18px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 10px;
                    font-weight: bold;
                }

                .tempo-progress-bar {
                    width: 100%;
                    height: 6px;
                    background: rgba(0, 0, 0, 0.3);
                    border-radius: 3px;
                    overflow: hidden;
                    margin-top: 0.5rem;
                }

                .progress-fill {
                    height: 100%;
                    background: linear-gradient(90deg, #0DF, #E1EA2D);
                    border-radius: 3px;
                    transition: width 1s linear;
                    width: 100%;
                }

                .progress-fill.warning {
                    background: linear-gradient(90deg, #FFA500, #FF8C00);
                }

                .progress-fill.critical {
                    background: linear-gradient(90deg, #FF6B6B, #FF4444);
                    animation: pulse-bar 0.5s infinite;
                }

                @keyframes pulse-red {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.6; }
                }

                @keyframes pulse-bar {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.7; }
                }

                /* Responsividade */
                @media (max-width: 768px) {
                    .game-stats {
                        gap: 1rem;
                    }
                    
                    .stat-item {
                        padding: 0.5rem;
                        min-width: 60px;
                    }
                    
                    .stat-icon {
                        font-size: 1.25rem;
                    }
                    
                    .stat-value {
                        font-size: 1rem;
                    }
                }

                /* Ajuste para não sobrepor conteúdo */
                body.game-system-active {
                    padding-top: 140px;
                }

                @media (max-width: 768px) {
                    body.game-system-active {
                        padding-top: 120px;
                    }
                }
            </style>
        `;

        // Remove estilos antigos e adiciona novos
        const oldStyles = document.getElementById('game-system-styles');
        if (oldStyles) oldStyles.remove();
        
        document.head.insertAdjacentHTML('beforeend', styles);
        document.body.classList.add('game-system-active');
    }

    // Atualiza a interface das habilidades ativas
    atualizarInterfaceHabilidades() {
        const container = document.getElementById('habilidades-ativas');
        if (!container) return;

        container.innerHTML = '';

        this.gameState.habilidadesAtivas.forEach(habilidadeId => {
            const habilidade = this.habilidades[habilidadeId];
            if (!habilidade || !habilidade.ativa) return;

            const habilidadeElement = document.createElement('div');
            habilidadeElement.className = `habilidade-icon ${habilidade.tipo}`;
            
            if (habilidade.usada) {
                habilidadeElement.classList.add('used');
            }

            let conteudo = habilidade.name.split(' ').map(palavra => palavra.charAt(0)).join('');
            
            // Adiciona contador de usos se aplicável
            if (habilidade.usosRestantes !== undefined) {
                conteudo += `<div class="habilidade-usos">${habilidade.usosRestantes}</div>`;
            }

            habilidadeElement.innerHTML = conteudo;
            habilidadeElement.title = habilidade.description;
            
            container.appendChild(habilidadeElement);
        });
    }

    // Configurar eventos do sistema
    configurarEventos() {
        // Listener para mudanças no localStorage
        window.addEventListener('storage', (e) => {
            if (e.key === 'equippedItems') {
                this.carregarHabilidadesEquipadas();
                this.atualizarInterfaceHabilidades();
            }
        });

        // Event listeners para pausar/continuar quando a aba perde foco
        document.addEventListener('visibilitychange', () => {
            if (document.hidden && this.gameState.gameStarted) {
                this.pausarTimer();
            } else if (!document.hidden && this.gameState.gameStarted && this.gameState.isPaused) {
                this.continuarTimer();
            }
        });
    }

    // Iniciar uma nova fase
    iniciarFase(numeroFase, tempoCustomizado = null) {
        // Evitar reinicializar se já estamos na mesma fase e o jogo já começou
        if (this.gameState.faseAtual === numeroFase && this.gameState.gameStarted) {
            console.log(`Fase ${numeroFase} já está em andamento, não reiniciando`);
            return;
        }
        
        console.log(`Iniciando fase ${numeroFase}...`);
        
        this.gameState.faseAtual = numeroFase;
        this.gameState.desafioAtual = 1;
        this.gameState.gameStarted = true;
        this.gameState.isPaused = false;

        // Só resetar vidas e pontos se for uma nova fase (não reinício de desafio)
        if (!this.gameState.gameStarted || this.gameState.faseAtual !== numeroFase) {
            this.gameState.vidasRestantes = this.gameConfig.vidaInicial;
            this.gameState.pontuacao = 0;
        }

        // Aplicar tempo base ou customizado
        if (tempoCustomizado) {
            this.gameState.tempoRestante = tempoCustomizado;
        } else {
            const multiplicador = this.gameConfig.dificuldadeMultiplicador[numeroFase] || 1.0;
            this.gameState.tempoRestante = Math.floor(this.gameConfig.tempoBase / multiplicador);
        }

        // Aplicar efeitos de habilidades de tempo
        this.aplicarHabilidadeTempo();

        this.atualizarInterface();
        this.iniciarTimer();

        console.log(`Fase ${numeroFase} iniciada com ${this.gameState.tempoRestante}s`);
    }

    // Aplicar efeitos de habilidades de tempo
    aplicarHabilidadeTempo() {
        // Cronômetro de Tempo Extra
        if (this.habilidades['cronometro-tempo-extra'].ativa) {
            this.gameState.tempoRestante += this.habilidades['cronometro-tempo-extra'].efeito.tempoExtra;
        }
    }

    // Avançar para o próximo desafio (sem resetar tudo)
    proximoDesafio(tempoExtra = 0) {
        console.log('Avançando para próximo desafio...');
        
        this.gameState.desafioAtual++;
        
        // Adicionar tempo extra se fornecido (bonus por completar desafio)
        if (tempoExtra > 0) {
            this.gameState.tempoRestante += tempoExtra;
        }
        
        // Não resetar timer - continua contando
        this.atualizarInterface();
        
        console.log(`Desafio ${this.gameState.desafioAtual} iniciado`);
    }

    // Iniciar timer do jogo
    iniciarTimer() {
        this.pararTimer();
        
        this.gameState.timerId = setInterval(() => {
            if (!this.gameState.isPaused && this.gameState.tempoRestante > 0) {
                this.gameState.tempoRestante--;
                this.atualizarInterface();
                
                if (this.gameState.tempoRestante <= 0) {
                    this.tempoEsgotado();
                }
            }
        }, 1000);
    }

    // Pausar timer
    pausarTimer() {
        this.gameState.isPaused = true;
    }

    // Continuar timer
    continuarTimer() {
        this.gameState.isPaused = false;
    }

    // Parar timer
    pararTimer() {
        if (this.gameState.timerId) {
            clearInterval(this.gameState.timerId);
            this.gameState.timerId = null;
        }
    }

    // Quando o tempo se esgota
    tempoEsgotado() {
        this.pararTimer();
        this.perderVida();
        
        // Disparar evento customizado
        window.dispatchEvent(new CustomEvent('gameTimeUp', {
            detail: { fase: this.gameState.faseAtual }
        }));
    }

    // Perder uma vida
    perderVida() {
        // Verificar se a habilidade vida extra pode ser usada
        if (this.habilidades['vida-extra'].ativa && !this.habilidades['vida-extra'].usada) {
            this.habilidades['vida-extra'].usada = true;
            this.atualizarInterfaceHabilidades();
            
            // Disparar evento de vida salva
            window.dispatchEvent(new CustomEvent('gameLifeSaved', {
                detail: { habilidade: 'vida-extra' }
            }));
            return;
        }

        this.gameState.vidasRestantes--;
        
        if (this.gameState.vidasRestantes <= 0) {
            this.gameOver();
        } else {
            this.atualizarInterface();
            
            // Disparar evento de vida perdida
            window.dispatchEvent(new CustomEvent('gameLifeLost', {
                detail: { vidasRestantes: this.gameState.vidasRestantes }
            }));
        }
    }

    // Game Over
    gameOver() {
        this.pararTimer();
        this.gameState.gameStarted = false;
        
        // Disparar evento de game over
        window.dispatchEvent(new CustomEvent('gameOver', {
            detail: { 
                fase: this.gameState.faseAtual,
                pontuacao: this.gameState.pontuacao
            }
        }));
    }

    // Ganhar pontos
    ganharPontos(pontos) {
        let pontosFinais = pontos;
        
        // Aplicar multiplicador de pontos se ativo
        if (this.habilidades['multiplicador-pontos'].ativa) {
            pontosFinais *= this.habilidades['multiplicador-pontos'].efeito.multiplicadorPontos;
        }
        
        this.gameState.pontuacao += pontosFinais;
        this.atualizarInterface();
        
        return pontosFinais;
    }

    // Adicionar tempo extra
    adicionarTempo(segundos) {
        this.gameState.tempoRestante += segundos;
        this.atualizarInterface();
    }

    // Usar habilidade
    usarHabilidade(habilidadeId, contexto = null) {
        const habilidade = this.habilidades[habilidadeId];
        if (!habilidade || !habilidade.ativa) return false;

        switch (habilidadeId) {
            case 'camera-lenta':
                if (contexto === 'dificil') {
                    // Implementar lógica de câmera lenta
                    return true;
                }
                break;
                
            case 'dica-magica':
                if (habilidade.usosRestantes > 0) {
                    habilidade.usosRestantes--;
                    this.atualizarInterfaceHabilidades();
                    return true;
                }
                break;
        }

        return false;
    }

    // Atualizar interface
    atualizarInterface() {
        // Atualizar contadores
        const vidasElement = document.getElementById('vidas-count');
        const tempoElement = document.getElementById('tempo-count');
        const pontosElement = document.getElementById('pontos-count');
        const progressElement = document.getElementById('tempo-progress');

        if (vidasElement) vidasElement.textContent = this.gameState.vidasRestantes;
        if (tempoElement) tempoElement.textContent = this.gameState.tempoRestante;
        if (pontosElement) pontosElement.textContent = this.gameState.pontuacao;

        // Atualizar classes de warning
        const vidaDisplay = document.querySelector('.vida-display');
        const tempoDisplay = document.querySelector('.tempo-display');

        if (vidaDisplay) {
            vidaDisplay.classList.toggle('low-health', this.gameState.vidasRestantes <= 1);
        }

        if (tempoDisplay) {
            tempoDisplay.classList.remove('warning', 'critical');
            if (this.gameState.tempoRestante <= this.gameConfig.tempoCritical) {
                tempoDisplay.classList.add('critical');
            } else if (this.gameState.tempoRestante <= this.gameConfig.tempoWarning) {
                tempoDisplay.classList.add('warning');
            }
        }

        // Atualizar barra de progresso
        if (progressElement) {
            const tempoTotal = this.gameConfig.tempoBase;
            const porcentagem = (this.gameState.tempoRestante / tempoTotal) * 100;
            progressElement.style.width = `${Math.max(0, porcentagem)}%`;
            
            progressElement.classList.remove('warning', 'critical');
            if (this.gameState.tempoRestante <= this.gameConfig.tempoCritical) {
                progressElement.classList.add('critical');
            } else if (this.gameState.tempoRestante <= this.gameConfig.tempoWarning) {
                progressElement.classList.add('warning');
            }
        }
    }

    // Finalizar fase com sucesso
    finalizarFase() {
        this.pararTimer();
        this.gameState.gameStarted = false;
        
        // Bonus por tempo restante
        const bonusTempo = Math.floor(this.gameState.tempoRestante * 2);
        this.ganharPontos(bonusTempo);
        
        // Disparar evento de fase completa
        window.dispatchEvent(new CustomEvent('gamePhaseComplete', {
            detail: { 
                fase: this.gameState.faseAtual,
                pontuacao: this.gameState.pontuacao,
                tempoRestante: this.gameState.tempoRestante,
                bonusTempo: bonusTempo
            }
        }));
    }

    // Métodos de utilidade
    getEstadoJogo() {
        return { ...this.gameState };
    }

    getHabilidadesAtivas() {
        return this.gameState.habilidadesAtivas.map(id => this.habilidades[id]);
    }

    // Destruir sistema (cleanup)
    destruir() {
        this.pararTimer();
        const interface = document.getElementById('game-system-interface');
        const styles = document.getElementById('game-system-styles');
        
        if (interface) interface.remove();
        if (styles) styles.remove();
        
        document.body.classList.remove('game-system-active');
    }
}


// Exportar para uso global
window.GameSystem = GameSystem;

// Auto-inicializar se estivermos em uma página de fase
function initializeGameSystem() {
    // Verificar se já existe um GameSystem ativo
    if (window.gameSystem) {
        console.log('GameSystem já existe, não criando duplicado');
        return;
    }
    
    // Verificar se estamos em uma página de fase
    const currentPage = window.location.pathname;
    console.log('Tentando inicializar GameSystem para:', currentPage);
    
    if (currentPage.includes('fase') && currentPage.includes('.html')) {
        console.log('Página de fase detectada, inicializando GameSystem');
        
        // Criar o GameSystem sem auto-iniciar fase
        try {
            window.gameSystem = new GameSystem();
            console.log('GameSystem criado com sucesso!');
            
            // NÃO auto-iniciar fase - deixar para a fase controlar quando iniciar
            console.log('GameSystem pronto. A fase deve chamar iniciarFase() quando necessário.');
        } catch (error) {
            console.error('Erro ao criar GameSystem:', error);
        }
    }
}

// Tentar múltiplas formas de inicialização (mas apenas uma vez)
let gameSystemInitialized = false;

function initializeOnce() {
    if (!gameSystemInitialized) {
        gameSystemInitialized = true;
        initializeGameSystem();
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeOnce);
} else {
    // DOM já carregado
    initializeOnce();
}

// Remover fallback que causa múltiplas inicializações
// setTimeout(initializeGameSystem, 1000);

// Função global para criar GameSystem manualmente (para debug)
window.createGameSystem = function() {
    if (window.gameSystem) {
        console.log('GameSystem já existe:', window.gameSystem);
        return window.gameSystem;
    }
    
    console.log('Criando GameSystem manualmente...');
    try {
        window.gameSystem = new GameSystem();
        console.log('GameSystem criado!', window.gameSystem);
        return window.gameSystem;
    } catch (error) {
        console.error('Erro:', error);
        return null;
    }
};

// Funções globais compatíveis com gameSystemActions (para compatibilidade)
if (!window.gameSystemActions) {
    window.gameSystemActions = {
        acertou: function(pontos = 50) {
            if (window.gameSystem) {
                window.gameSystem.ganharPontos(pontos);
                console.log('✅ Acertou! +' + pontos + ' pontos');
            }
        },
        
        errou: function(mensagem = 'Resposta incorreta!') {
            if (window.gameSystem) {
                window.gameSystem.perderVida();
                console.log('❌ Errou:', mensagem);
            }
        },
        
        ganharPontos: function(pontos) {
            if (window.gameSystem) {
                window.gameSystem.ganharPontos(pontos);
            }
        },
        
        proximoDesafio: function(tempoExtra = 10) {
            if (window.gameSystem) {
                window.gameSystem.proximoDesafio(tempoExtra);
            }
        },
        
        status: function() {
            if (window.gameSystem) {
                console.log('📊 Status GameSystem:', window.gameSystem.getEstadoJogo());
            }
        }
    };
}
