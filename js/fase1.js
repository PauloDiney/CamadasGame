// fase1.js - Lógica da Fase 1: Camada Física

class Fase1Manager {
    constructor() {
        this.desafioAtual = 0;
        this.progressoDesafios = {
            1: false,
            2: false,
            3: false
        };
        
        // Integração com GameSystem
        this.gameSystem = null;
        this.waitForGameSystem();
        
        this.inicializar();
    }

    // Aguarda o GameSystem ser carregado
    waitForGameSystem() {
        const checkGameSystem = () => {
            if (window.simpleGameSystem) {
                this.gameSystem = window.simpleGameSystem;
                this.configurarEventosGameSystem();
                console.log('SimpleGameSystem conectado à Fase 1');
            } else {
                setTimeout(checkGameSystem, 100);
            }
        };
        checkGameSystem();
    }

    // Configurar eventos do GameSystem
    configurarEventosGameSystem() {
        if (!this.gameSystem) return;
        
        console.log('GameSystem configurado para Fase 1');
        // O simpleGameSystem não usa eventos, mas podemos acessar diretamente
        // os métodos quando necessário
    }

    inicializar() {
        this.atualizarPontos();
        this.configurarDragAndDrop();
        this.configurarEventos();
        this.atualizarProgresso();
    }

    atualizarPontos() {
        const pontos = parseInt(localStorage.getItem('gamePoints') || '2450');
        const pontosDisplay = document.getElementById('pontos-fase');
        if (pontosDisplay) {
            pontosDisplay.textContent = `${pontos} Pontos`;
        }
    }

    atualizarProgresso() {
        const concluidos = Object.values(this.progressoDesafios).filter(Boolean).length;
        const total = Object.keys(this.progressoDesafios).length;
        const percentual = (concluidos / total) * 100;

        // Atualiza barra de progresso no header
        const progressoFill = document.getElementById('progresso-fill');
        const progressoAtual = document.getElementById('progresso-atual');
        
        if (progressoFill) progressoFill.style.width = `${percentual}%`;
        if (progressoAtual) progressoAtual.textContent = concluidos;

        // Atualiza HUD
        const desafioAtual = document.getElementById('desafio-atual');
        if (desafioAtual) desafioAtual.textContent = this.desafioAtual || 1;
    }

    configurarEventos() {
        // Eventos globais da fase
        window.iniciarDesafio = (numero) => this.iniciarDesafio(numero);
        window.iniciarSimulacao = () => this.iniciarSimulacao();
        window.voltarTrilha = () => this.voltarTrilha();
        window.proximaFase = () => this.proximaFase();
    }

    iniciarDesafio(numero) {
        this.desafioAtual = numero;
        
        // Esconde seção atual e mostra nova
        document.querySelectorAll('.fase-secao').forEach(secao => {
            secao.classList.remove('ativa');
        });
        
        document.getElementById(`secao-desafio${numero}`).classList.add('ativa');
        this.atualizarProgresso();
    }

    configurarDragAndDrop() {
        // Desafio 1: Drag and Drop dos cabos
        this.configurarDesafio1();
        
        // Desafio 2: Ordenação de velocidades
        this.configurarDesafio2();
    }

    configurarDesafio1() {
        const cabos = document.querySelectorAll('.cabo-item');
        const targets = document.querySelectorAll('.tipo-target');

        cabos.forEach(cabo => {
            cabo.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/plain', cabo.dataset.tipo);
                cabo.classList.add('dragging');
            });

            cabo.addEventListener('dragend', () => {
                cabo.classList.remove('dragging');
            });
        });

        targets.forEach(target => {
            target.addEventListener('dragover', (e) => {
                e.preventDefault();
                target.classList.add('drag-over');
            });

            target.addEventListener('dragleave', () => {
                target.classList.remove('drag-over');
            });

            target.addEventListener('drop', (e) => {
                e.preventDefault();
                const tipoArrastado = e.dataTransfer.getData('text/plain');
                const tipoEsperado = target.dataset.aceita;
                
                target.classList.remove('drag-over');

                if (tipoArrastado === tipoEsperado) {
                    target.classList.add('correto');
                    target.innerHTML += '<div class="cabo-conectado">✓ Conectado!</div>';
                    this.verificarDesafio1();
                } else {
                    target.classList.add('incorreto');
                    setTimeout(() => {
                        target.classList.remove('incorreto');
                    }, 1000);
                    this.mostrarFeedback('feedback-desafio1', 'Cabo incorreto! Tente novamente.', 'erro');
                }
            });
        });
    }

    verificarDesafio1() {
        const corretos = document.querySelectorAll('.tipo-target.correto').length;
        
        if (corretos === 3) {
            this.progressoDesafios[1] = true;
            this.mostrarFeedback('feedback-desafio1', 'Parabéns! Você identificou todos os cabos corretamente!', 'sucesso');
            
            // Integração com gameSystemActions
            if (window.gameSystemActions) {
                window.gameSystemActions.acertou(150); // Bonus por completar desafio
            }
            
            setTimeout(() => {
                this.iniciarDesafio(2);
            }, 2000);
        } else {
            // Se não acertou tudo, pode penalizar
            if (window.gameSystemActions && corretos < 2) {
                window.gameSystemActions.errou('Nem todos os cabos foram identificados corretamente!');
            }
        }
    }

    configurarDesafio2() {
        const velocidades = document.querySelectorAll('.velocidade-item');
        const slots = document.querySelectorAll('.slot-ordenacao');

        velocidades.forEach(item => {
            item.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/plain', JSON.stringify({
                    ordem: item.dataset.ordem,
                    html: item.outerHTML
                }));
                item.classList.add('dragging');
            });

            item.addEventListener('dragend', () => {
                item.classList.remove('dragging');
            });
        });

        slots.forEach(slot => {
            slot.addEventListener('dragover', (e) => {
                e.preventDefault();
                if (!slot.classList.contains('ocupado')) {
                    slot.classList.add('drag-over');
                }
            });

            slot.addEventListener('dragleave', () => {
                slot.classList.remove('drag-over');
            });

            slot.addEventListener('drop', (e) => {
                e.preventDefault();
                
                if (slot.classList.contains('ocupado')) return;

                const data = JSON.parse(e.dataTransfer.getData('text/plain'));
                const posicaoSlot = slot.dataset.posicao;
                
                slot.classList.remove('drag-over');
                slot.classList.add('ocupado');
                slot.innerHTML = data.html;
                slot.dataset.ordemCorreta = data.ordem;

                // Remove o item original
                const itemOriginal = document.querySelector(`.velocidades-container .velocidade-item[data-ordem="${data.ordem}"]`);
                if (itemOriginal) {
                    itemOriginal.style.opacity = '0.3';
                    itemOriginal.style.pointerEvents = 'none';
                }

                this.verificarDesafio2();
            });
        });
    }

    verificarDesafio2() {
        const slotsOcupados = document.querySelectorAll('.slot-ordenacao.ocupado');
        
        if (slotsOcupados.length === 5) {
            let correto = true;
            
            slotsOcupados.forEach(slot => {
                const posicaoSlot = parseInt(slot.dataset.posicao);
                const ordemCorreta = parseInt(slot.dataset.ordemCorreta);
                
                if (posicaoSlot !== ordemCorreta) {
                    correto = false;
                }
            });

            if (correto) {
                this.progressoDesafios[2] = true;
                this.mostrarFeedback('feedback-desafio2', 'Excelente! Você ordenou as velocidades corretamente!', 'sucesso');
                
                // Integração com gameSystemActions
                if (window.gameSystemActions) {
                    window.gameSystemActions.acertou(200); // Bonus maior para desafio mais difícil
                }
                
                setTimeout(() => {
                    this.iniciarDesafio(3);
                }, 2000);
            } else {
                this.mostrarFeedback('feedback-desafio2', 'Algumas velocidades estão fora de ordem. Tente novamente!', 'erro');
                
                // Integração com gameSystemActions para erro
                if (window.gameSystemActions) {
                    window.gameSystemActions.errou('Ordem incorreta das velocidades!');
                }
                
                this.resetarDesafio2();
            }
        }
    }

    resetarDesafio2() {
        setTimeout(() => {
            // Reset dos slots
            document.querySelectorAll('.slot-ordenacao').forEach(slot => {
                slot.classList.remove('ocupado', 'drag-over');
                slot.innerHTML = slot.dataset.posicao === '1' ? '1º mais lento' :
                                slot.dataset.posicao === '2' ? '2º' :
                                slot.dataset.posicao === '3' ? '3º' :
                                slot.dataset.posicao === '4' ? '4º' : '5º mais rápido';
                delete slot.dataset.ordemCorreta;
            });

            // Reset dos itens
            document.querySelectorAll('.velocidades-container .velocidade-item').forEach(item => {
                item.style.opacity = '1';
                item.style.pointerEvents = 'all';
            });
        }, 2000);
    }

    iniciarSimulacao() {
        const tipoCabo = document.getElementById('tipo-cabo-sim').value;
        const tamanhoArquivo = parseInt(document.getElementById('tamanho-arquivo').value);
        
        // Velocidades em Mbps
        const velocidades = {
            ethernet: 100,
            fibra: 1000,
            wifi: 300
        };

        const velocidade = velocidades[tipoCabo];
        const tempoSegundos = (tamanhoArquivo * 8) / velocidade; // Conversão MB para Mb
        
        // Atualiza interface
        document.getElementById('velocidade-info').textContent = `${velocidade} Mbps`;
        document.getElementById('tempo-estimado').textContent = `${tempoSegundos.toFixed(2)}s`;
        
        // Inicia animação
        const dadosViajando = document.getElementById('dados-viajando');
        const progressoTransmissao = document.getElementById('progresso-transmissao');
        const dadosEnviados = document.getElementById('dados-enviados');
        
        dadosViajando.classList.add('transmitindo');
        
        // Simula progresso
        let progresso = 0;
        const intervaloDados = setInterval(() => {
            progresso += 100 / (tempoSegundos * 10); // 10 updates por segundo
            
            if (progresso >= 100) {
                progresso = 100;
                clearInterval(intervaloDados);
                this.finalizarSimulacao();
            }
            
            progressoTransmissao.style.width = `${progresso}%`;
            dadosEnviados.textContent = `${(tamanhoArquivo * progresso / 100).toFixed(1)} MB`;
        }, 100);
    }

    finalizarSimulacao() {
        this.progressoDesafios[3] = true;
        this.mostrarFeedback('feedback-desafio3', 'Simulação concluída! Você entendeu como a velocidade afeta a transmissão!', 'sucesso');
        
        // Integração com gameSystemActions
        if (window.gameSystemActions) {
            window.gameSystemActions.acertou(250); // Bonus maior para último desafio
        }
        
        setTimeout(() => {
            this.concluirFase();
        }, 2000);
    }

    concluirFase() {
        // Notifica o GameSystem que a fase foi concluída
        if (this.gameSystem) {
            this.gameSystem.finalizarFase();
        }

        // Adiciona pontos
        const pontosAtuais = parseInt(localStorage.getItem('gamePoints') || '2450');
        const pontosGanhos = this.gameSystem ? this.gameSystem.ganharPontos(100) : 100;
        const novosPontos = pontosAtuais + pontosGanhos;
        localStorage.setItem('gamePoints', novosPontos.toString());

        // Marca fase como concluída
        const progressoTrilha = JSON.parse(localStorage.getItem('trilhaProgresso') || '{}');
        progressoTrilha[1] = {
            concluida: true,
            desbloqueada: true
        };
        progressoTrilha[2] = {
            concluida: false,
            desbloqueada: true
        };
        localStorage.setItem('trilhaProgresso', JSON.stringify(progressoTrilha));

        // Mostra conclusão
        document.querySelectorAll('.fase-secao').forEach(secao => {
            secao.classList.remove('ativa');
        });
        document.getElementById('secao-conclusao').classList.add('ativa');

        this.atualizarPontos();
        this.atualizarProgresso();
    }

    // === MÉTODOS DE INTEGRAÇÃO COM GAMESYSTEM ===

    tempoEsgotado() {
        this.mostrarFeedback('feedback-tempo-esgotado', 'Tempo esgotado! Você perdeu uma vida.', 'erro');
        
        // Se ainda há vidas, permite continuar do desafio atual
        setTimeout(() => {
            if (this.gameSystem && this.gameSystem.gameState.vidasRestantes > 0) {
                this.reiniciarDesafioAtual();
            }
        }, 2000);
    }

    vidaPerdida(vidasRestantes) {
        this.mostrarFeedback('feedback-vida-perdida', 
            `Vida perdida! Restam ${vidasRestantes} vida(s).`, 'erro');
        
        if (vidasRestantes > 0) {
            setTimeout(() => {
                this.reiniciarDesafioAtual();
            }, 2000);
        }
    }

    vidaSalva(habilidade) {
        this.mostrarFeedback('feedback-vida-salva', 
            'Sua habilidade "Vida Extra" te salvou!', 'sucesso');
        
        setTimeout(() => {
            this.reiniciarDesafioAtual();
        }, 2000);
    }

    gameOver() {
        // Mostra tela de game over
        this.mostrarFeedback('feedback-game-over', 
            'Game Over! Você ficou sem vidas.', 'erro');
        
        // Volta para a trilha após 3 segundos
        setTimeout(() => {
            this.voltarTrilha();
        }, 3000);
    }

    faseCompleta(detalhes) {
        console.log('Fase 1 concluída com sucesso:', detalhes);
        
        // Mostra feedback de conclusão
        this.mostrarFeedback('feedback-fase-completa', 
            `Parabéns! Fase concluída com ${detalhes.pontuacao} pontos!`, 'sucesso');
    }

    reiniciarDesafioAtual() {
        // Reinicia o desafio atual em caso de erro/tempo esgotado
        if (this.desafioAtual > 0) {
            this.progressoDesafios[this.desafioAtual] = false;
            this.iniciarDesafio(this.desafioAtual);
        }
    }

    // Método para iniciar um desafio com integração do GameSystem
    iniciarDesafioComTimer(numero) {
        this.desafioAtual = numero;
        
        // Configurar tempo específico para o desafio se necessário
        let tempoDesafio = 45; // 45 segundos por desafio
        
        // Verificar se há habilidades que afetam o tempo
        if (this.gameSystem) {
            const habilidades = this.gameSystem.getHabilidadesAtivas();
            habilidades.forEach(hab => {
                if (hab.tipo === 'tempo' && hab.efeito.aplicarEm === 'desafio') {
                    tempoDesafio += hab.efeito.tempoExtra || 0;
                }
            });
            
            // Reiniciar o timer do GameSystem com o novo tempo
            this.gameSystem.gameState.tempoRestante = tempoDesafio;
            this.gameSystem.iniciarTimer();
        }
        
        this.iniciarDesafio(numero);
    }

    mostrarFeedback(elementId, mensagem, tipo) {
        const feedback = document.getElementById(elementId);
        feedback.textContent = mensagem;
        feedback.className = `desafio-feedback ${tipo}`;
        feedback.style.display = 'block';

        if (tipo === 'erro') {
            setTimeout(() => {
                feedback.style.display = 'none';
            }, 3000);
        }
    }

    voltarTrilha() {
        window.location.href = 'trilha.html';
    }

    proximaFase() {
        window.location.href = 'fase2.html';
    }
}

// Inicializa quando a página carrega
document.addEventListener('DOMContentLoaded', function() {
    window.fase1Manager = new Fase1Manager();
    
    // Sincroniza com sistema global
    if (typeof sincronizarGlobais === 'function') {
        sincronizarGlobais();
    }
});
