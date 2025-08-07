// Dados e configurações do jogo
const GameData = {
    // Configurações gerais
    config: {
        version: "1.0.0",
        maxPoints: 9999,
        soundEnabled: true
    },

    // Definição das fases
    phases: {
        1: {
            id: 1,
            title: "Modelo em Camadas",
            subtitle: "Organize as camadas do modelo OSI",
            description: "Arraste as camadas do modelo OSI para a ordem correta",
            icon: "📡",
            requiredPoints: 0,
            maxScore: 100,
            type: "drag-drop",
            data: {
                layers: [
                    { id: "aplicacao", name: "Aplicação", order: 1, description: "Interface com aplicativos" },
                    { id: "transporte", name: "Transporte", order: 2, description: "Controle de fluxo e erro" },
                    { id: "rede", name: "Rede", order: 3, description: "Roteamento de dados" },
                    { id: "enlace", name: "Enlace", order: 4, description: "Controle de acesso ao meio" },
                    { id: "fisica", name: "Física", order: 5, description: "Transmissão de bits" }
                ],
                scoring: {
                    correctLayer: 10,
                    wrongLayer: -5,
                    completion: 50
                }
            }
        },

        2: {
            id: 2,
            title: "Paralelismo",
            subtitle: "Identifique tarefas paralelas",
            description: "Marque as tarefas que podem ser executadas simultaneamente",
            icon: "⚡",
            requiredPoints: 10,
            maxScore: 50,
            type: "multiple-choice",
            data: {
                tasks: [
                    { id: "processar-imagem", name: "Processar imagem", parallel: true, description: "CPU intensiva, independente" },
                    { id: "salvar-relatorio", name: "Salvar relatório", parallel: true, description: "Operação de I/O, independente" },
                    { id: "sincronizar-audio", name: "Sincronizar áudio", parallel: true, description: "Processamento independente" },
                    { id: "imprimir-documento", name: "Imprimir documento", parallel: false, description: "Recurso único (impressora)" }
                ],
                scoring: {
                    correct: 50,
                    wrong: 0
                }
            }
        },

        3: {
            id: 3,
            title: "Concorrência",
            subtitle: "Gerencie acesso concorrente",
            description: "Escolha como lidar com dois usuários acessando o mesmo dado",
            icon: "🔄",
            requiredPoints: 25,
            maxScore: 50,
            type: "single-choice",
            data: {
                scenario: "Dois usuários tentam editar o mesmo arquivo simultaneamente",
                options: [
                    { id: "aplicar-trava", name: "Aplicar trava de acesso", correct: true, description: "Impede condição de corrida" },
                    { id: "ignorar", name: "Ignorar e permitir acesso simultâneo", correct: false, description: "Pode causar inconsistência" },
                    { id: "espera", name: "Colocar um usuário em espera", correct: false, description: "Solução não otimizada" }
                ],
                scoring: {
                    correct: 50,
                    wrong: 0
                }
            }
        },

        4: {
            id: 4,
            title: "Armazenamento Distribuído",
            subtitle: "Distribua dados eficientemente",
            description: "Distribua os dados entre servidores considerando balanceamento",
            icon: "🌐",
            requiredPoints: 45,
            maxScore: 50,
            type: "distribution",
            data: {
                servers: [
                    { id: "servidor-a", name: "Servidor A", capacity: 100, current: 0, location: "São Paulo" },
                    { id: "servidor-b", name: "Servidor B", capacity: 100, current: 0, location: "Rio de Janeiro" },
                    { id: "servidor-c", name: "Servidor C", capacity: 100, current: 0, location: "Brasília" }
                ],
                data: [
                    { id: "imagens", name: "Imagens (50GB)", size: 50, type: "media" },
                    { id: "relatorios", name: "Relatórios (30GB)", size: 30, type: "documents" },
                    { id: "audios", name: "Áudios (40GB)", size: 40, type: "media" }
                ],
                scoring: {
                    balanced: 50,
                    unbalanced: 25,
                    overloaded: 0
                }
            }
        }
    },

    // Habilidades disponíveis na loja
    skills: {
        "bonus-points": {
            id: "bonus-points",
            name: "Bônus de Pontos",
            description: "+10% pontos em todas as fases",
            price: 30,
            icon: "💰",
            effect: "pointsMultiplier",
            value: 1.1
        },
        "auto-unlock": {
            id: "auto-unlock",
            name: "Desbloqueio Automático",
            description: "Fases são desbloqueadas automaticamente",
            price: 50,
            icon: "🔓",
            effect: "autoUnlock",
            value: true
        },
        "time-bonus": {
            id: "time-bonus",
            name: "Bônus de Tempo",
            description: "+10 pontos de bônus por velocidade",
            price: 25,
            icon: "⏰",
            effect: "timeBonus",
            value: 10
        },
        "double-reward": {
            id: "double-reward",
            name: "Recompensa Dupla",
            description: "Receba o dobro de pontos ao concluir uma fase pela primeira vez.",
            price: 60,
            icon: "🎲",
            effect: "doubleReward",
            value: true
        },
        "hint-master": {
            id: "hint-master",
            name: "Mestre das Dicas",
            description: "Receba dicas extras em todas as fases.",
            price: 40,
            icon: "💡",
            effect: "extraHints",
            value: true
        },
        "skip-phase": {
            id: "skip-phase",
            name: "Pular Fase",
            description: "Permite pular uma fase por tentativa.",
            price: 80,
            icon: "⏭️",
            effect: "skipPhase",
            value: 1
        },
        "super-vision": {
            id: "super-vision",
            name: "Super Visão",
            description: "Destaca automaticamente os elementos corretos por 2 segundos.",
            price: 55,
            icon: "🦾",
            effect: "highlightCorrect",
            value: true
        },
        "undo-mistake": {
            id: "undo-mistake",
            name: "Desfazer Erro",
            description: "Permite desfazer o último erro cometido em uma fase.",
            price: 35,
            icon: "↩️",
            effect: "undoMistake",
            value: 1
        }
    },

    // Mensagens e textos do jogo
    messages: {
        phaseComplete: "Fase Concluída!",
        phaseBlocked: "Esta fase ainda está bloqueada. Você precisa de {points} pontos.",
        skillPurchased: "Habilidade adquirida com sucesso!",
        insufficientPoints: "Você não tem pontos suficientes.",
        progressReset: "Progresso resetado com sucesso!",
        confirmReset: "Tem certeza que deseja resetar todo o progresso? Esta ação não pode ser desfeita.",
        
        // Mensagens específicas das fases
        phase1: {
            instructions: "Arraste as camadas do modelo OSI para a ordem correta, de cima para baixo:",
            correct: "Camada posicionada corretamente!",
            wrong: "Posição incorreta. Tente novamente!",
            completed: "Excelente! Você organizou as camadas corretamente!"
        },
        
        phase2: {
            instructions: "Selecione as tarefas que podem ser executadas em paralelo:",
            completed: "Perfeito! Você identificou corretamente as tarefas paralelas!"
        },
        
        phase3: {
            instructions: "Como você lidaria com dois usuários acessando o mesmo arquivo?",
            completed: "Correto! A trava de acesso é a melhor solução para evitar conflitos!"
        },
        
        phase4: {
            instructions: "Distribua os dados entre os servidores de forma balanceada:",
            completed: "Excelente distribuição! Os servidores estão bem balanceados!"
        }
    },

    // Configurações de scoring
    scoring: {
        stars: {
            3: 0.9, // 90% da pontuação máxima para 3 estrelas
            2: 0.7, // 70% da pontuação máxima para 2 estrelas
            1: 0.4  // 40% da pontuação máxima para 1 estrela
        }
    },

    // Métodos utilitários
    utils: {
        // Calcula o número de estrelas baseado na pontuação
        calculateStars(score, maxScore) {
            const percentage = score / maxScore;
            if (percentage >= GameData.scoring.stars[3]) return 3;
            if (percentage >= GameData.scoring.stars[2]) return 2;
            if (percentage >= GameData.scoring.stars[1]) return 1;
            return 0;
        },

        // Formata pontuação para exibição
        formatPoints(points) {
            return points.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
        },

        // Verifica se uma fase está desbloqueada
        isPhaseUnlocked(phaseId, playerPoints) {
            const phase = GameData.phases[phaseId];
            if (!phase) return false;
            return playerPoints >= phase.requiredPoints;
        },

        // Aplica efeitos de habilidades na pontuação
        applySkillEffects(basePoints, playerSkills) {
            let finalPoints = basePoints;
            
            // Bônus de pontos
            if (playerSkills.includes('bonus-points')) {
                finalPoints = Math.floor(finalPoints * GameData.skills['bonus-points'].value);
            }
            
            return finalPoints;
        },

        // Gera mensagem de resultado da fase
        getResultMessage(score, maxScore, stars) {
            if (stars === 3) {
                return "Perfeito! Você é um verdadeiro Mensageiro Digital!";
            } else if (stars === 2) {
                return "Muito bem! Você está dominando os conceitos!";
            } else if (stars === 1) {
                return "Bom trabalho! Continue praticando!";
            } else {
                return "Continue tentando! Você vai conseguir!";
            }
        }
    }
};

// Exportar para uso global
window.GameData = GameData;
