// trilha.js - Funcionalidade da Trilha das Camadas

class TrilhaManager {
    constructor() {
        this.fasesData = {
            1: {
                nome: "Camada Física",
                descricao: "Cabos, sinais e conexões",
                pontos: 100,
                objetivos: [
                    "Identificar tipos de cabos de rede",
                    "Compreender velocidades de transmissão",
                    "Simular transmissão de dados"
                ],
                desbloqueada: true,
                concluida: false
            },
            2: {
                nome: "Camada de Enlace",
                descricao: "Quadros e endereçamento MAC",
                pontos: 200,
                objetivos: [
                    "Validar endereços MAC",
                    "Montar quadros Ethernet",
                    "Detectar erros com CRC"
                ],
                desbloqueada: false,
                concluida: false
            },
            3: {
                nome: "Camada de Rede",
                descricao: "Roteamento e endereçamento IP",
                pontos: 250,
                objetivos: [
                    "Classificar endereços IP",
                    "Configurar tabelas de roteamento",
                    "Calcular subnetting"
                ],
                desbloqueada: false,
                concluida: false
            },
            4: {
                nome: "Camada de Transporte",
                descricao: "TCP, UDP e controle de fluxo",
                pontos: 300,
                objetivos: [
                    "Comparar TCP vs UDP",
                    "Associar serviços às portas",
                    "Simular Three-Way Handshake"
                ],
                desbloqueada: false,
                concluida: false
            },
            5: {
                nome: "Camada de Aplicação",
                descricao: "Protocolos e serviços de rede",
                pontos: 350,
                objetivos: [
                    "Analisar requisições HTTP",
                    "Ordenar resolução DNS",
                    "Configurar fluxo de email"
                ],
                desbloqueada: false,
                concluida: false
            }
        };
        
        this.carregarProgresso();
        this.inicializar();
    }

    inicializar() {
        this.atualizarPontos();
        this.configurarEventos();
        this.atualizarEstadoFases();
        this.atualizarProgresso();
        
        // Verifica se há uma fase para abrir automaticamente
        const faseInicial = localStorage.getItem('faseInicial');
        if (faseInicial) {
            console.log('Abrindo fase inicial automaticamente:', faseInicial);
            localStorage.removeItem('faseInicial'); // Remove após uso
            
            // Pequeno delay para garantir que tudo foi carregado
            setTimeout(() => {
                this.abrirModalFase(faseInicial);
            }, 300);
        }
    }

    carregarProgresso() {
        const progressoSalvo = localStorage.getItem('trilhaProgresso');
        if (progressoSalvo) {
            const progresso = JSON.parse(progressoSalvo);
            Object.keys(progresso).forEach(faseId => {
                if (this.fasesData[faseId]) {
                    this.fasesData[faseId] = { ...this.fasesData[faseId], ...progresso[faseId] };
                }
            });
        }
        this.verificarDesbloqueios();
    }

    salvarProgresso() {
        localStorage.setItem('trilhaProgresso', JSON.stringify(this.fasesData));
    }

    verificarDesbloqueios() {
        let faseAnteriorConcluida = true;
        
        Object.keys(this.fasesData).forEach(faseId => {
            if (faseAnteriorConcluida) {
                this.fasesData[faseId].desbloqueada = true;
            }
            
            if (!this.fasesData[faseId].concluida) {
                faseAnteriorConcluida = false;
            }
        });
    }

    configurarEventos() {
        // Eventos dos nós das fases
        const faseNodes = document.querySelectorAll('.fase-node');
        console.log('Configurando eventos para', faseNodes.length, 'nós de fase');
        
        faseNodes.forEach(node => {
            const faseId = node.getAttribute('data-fase');
            console.log('Configurando evento para fase:', faseId);
            
            node.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Clicou na fase:', faseId);
                
                if (faseId && this.fasesData[faseId] && this.fasesData[faseId].desbloqueada) {
                    this.abrirModalFase(faseId);
                } else {
                    console.log('Fase bloqueada ou inválida:', faseId, this.fasesData[faseId]);
                    if (window.audioManager && typeof window.audioManager.playErrorSound === 'function') {
                        window.audioManager.playErrorSound();
                    }
                }
            });
            
            // Adiciona suporte para Enter/Space quando focado
            node.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    node.click();
                }
            });
        });

        // Eventos do modal - USANDO OS IDs CORRETOS DO HTML
        const modal = document.getElementById('modalFase');
        const btnClose = document.querySelector('.modal-close');
        const btnCancelar = document.getElementById('btnFechar');
        const btnIniciar = document.getElementById('btnIniciar');

        console.log('Elementos do modal encontrados:', {modal, btnClose, btnCancelar, btnIniciar});

        if (btnClose) {
            btnClose.addEventListener('click', () => {
                console.log('Botão fechar clicado');
                this.fecharModal();
                if (window.audioManager && typeof window.audioManager.playClickSound === 'function') {
                    window.audioManager.playClickSound();
                }
            });
        }
        
        if (btnCancelar) {
            btnCancelar.addEventListener('click', () => {
                console.log('Botão cancelar clicado');
                this.fecharModal();
                if (window.audioManager && typeof window.audioManager.playClickSound === 'function') {
                    window.audioManager.playClickSound();
                }
            });
        }
        
        if (btnIniciar) {
            btnIniciar.addEventListener('click', () => {
                console.log('Botão iniciar clicado');
                this.iniciarFase();
                if (window.audioManager && typeof window.audioManager.playClickSound === 'function') {
                    window.audioManager.playClickSound();
                }
            });
        }

        // Fechar modal clicando fora
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    console.log('Clicou fora do modal');
                    this.fecharModal();
                }
            });
        }

        // Tecla ESC para fechar modal
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal && modal.classList.contains('active')) {
                console.log('ESC pressionado, fechando modal');
                this.fecharModal();
            }
        });
    }

    atualizarPontos() {
        const pontos = parseInt(localStorage.getItem('gamePoints') || '2450');
        const pontosDisplay = document.getElementById('pontos-trilha-display');
        if (pontosDisplay) {
            pontosDisplay.textContent = `${pontos} Pontos`;
        }
    }

    atualizarEstadoFases() {
        Object.keys(this.fasesData).forEach(faseId => {
            const node = document.querySelector(`[data-fase="${faseId}"]`);
            if (!node) return;

            const fase = this.fasesData[faseId];
            
            // Remove todas as classes de estado
            node.classList.remove('fase-disponivel', 'fase-bloqueada', 'fase-concluida');
            
            // Adiciona a classe apropriada
            if (fase.concluida) {
                node.classList.add('fase-concluida');
                node.querySelector('.fase-status span').textContent = '✓ Concluída';
                node.querySelector('.fase-status span').className = 'status-concluida';
            } else if (fase.desbloqueada) {
                node.classList.add('fase-disponivel');
                node.querySelector('.fase-status span').textContent = 'Disponível';
                node.querySelector('.fase-status span').className = 'status-disponivel';
            } else {
                node.classList.add('fase-bloqueada');
                node.querySelector('.fase-status span').textContent = '🔒 Bloqueada';
                node.querySelector('.fase-status span').className = 'status-bloqueada';
            }
        });
    }

    atualizarProgresso() {
        const totalFases = Object.keys(this.fasesData).length;
        const fasesConcluidas = Object.values(this.fasesData).filter(fase => fase.concluida).length;
        const percentual = (fasesConcluidas / totalFases) * 100;

        const progressoFill = document.querySelector('.progresso-fill');
        const progressoTexto = document.querySelector('.progresso-geral span');

        if (progressoFill) {
            progressoFill.style.width = `${percentual}%`;
        }

        if (progressoTexto) {
            progressoTexto.textContent = `${fasesConcluidas} de ${totalFases} fases concluídas`;
        }
    }

    abrirModalFase(faseId) {
        console.log('Abrindo modal para fase:', faseId);
        const fase = this.fasesData[faseId];
        if (!fase || !fase.desbloqueada) {
            console.log('Fase não disponível:', faseId, fase);
            return;
        }

        // Preenche os dados do modal - USANDO OS IDs CORRETOS DO HTML
        const modalTitulo = document.getElementById('modalTitulo');
        const modalNumero = document.getElementById('modalNumero');
        const modalDescricao = document.getElementById('modalDescricao');
        const modalRecompensa = document.getElementById('modalRecompensa');
        const modalDificuldade = document.getElementById('modalDificuldade');
        const modalObjetivos = document.getElementById('modalObjetivos');
        const modalIcone = document.getElementById('modalIcone');

        if (modalTitulo) modalTitulo.textContent = fase.nome;
        if (modalNumero) modalNumero.textContent = faseId;
        if (modalDescricao) modalDescricao.textContent = fase.descricao;
        if (modalRecompensa) modalRecompensa.textContent = `⭐ +${fase.pontos} pontos`;
        
        // Define dificuldade baseada na fase
        const dificuldades = {
            '1': '⚡ Iniciante',
            '2': '⚡⚡ Fácil',
            '3': '⚡⚡⚡ Médio',
            '4': '⚡⚡⚡⚡ Difícil',
            '5': '⚡⚡⚡⚡⚡ Avançado'
        };
        if (modalDificuldade) modalDificuldade.textContent = dificuldades[faseId] || '⚡ Normal';

        // Preenche objetivos
        if (modalObjetivos) {
            modalObjetivos.innerHTML = fase.objetivos.map(obj => `<li>${obj}</li>`).join('');
        }

        // Copia o ícone da fase para o modal
        const originalIcone = document.querySelector(`[data-fase="${faseId}"] .fase-icone svg`);
        if (modalIcone && originalIcone) {
            modalIcone.innerHTML = originalIcone.outerHTML;
        }

        // Armazena a fase atual
        this.faseAtual = faseId;
        console.log('Fase atual definida como:', this.faseAtual);

        // Configura o botão de iniciar
        const btnIniciar = document.getElementById('btnIniciar');
        if (btnIniciar) {
            const btnText = btnIniciar.querySelector('span');
            if (btnText) {
                btnText.textContent = fase.concluida ? 'Refazer Fase' : 'Iniciar Fase';
            }
        }

        // Abre o modal - USA A CLASSE 'active' CONFORME O CSS
        const modal = document.getElementById('modalFase');
        if (modal) {
            modal.classList.add('active');
            console.log('Modal aberto com classe active');
        }
        
        // Som de sucesso
        if (window.audioManager && typeof window.audioManager.playSuccessSound === 'function') {
            window.audioManager.playSuccessSound();
        }
    }

    fecharModal() {
        const modal = document.getElementById('modalFase');
        if (modal) {
            modal.classList.remove('active');
            console.log('Modal fechado, classe active removida');
        }
        this.faseAtual = null;
    }

    iniciarFase() {
        console.log('Iniciando fase:', this.faseAtual); // Debug
        
        if (!this.faseAtual) {
            console.error('Nenhuma fase selecionada!');
            return;
        }

        const fase = this.fasesData[this.faseAtual];
        if (!fase) {
            console.error('Dados da fase não encontrados:', this.faseAtual);
            return;
        }
        
        // Armazena a fase atual antes de fechar o modal
        const faseParaIniciar = this.faseAtual;
        
        // Fecha o modal
        this.fecharModal();
        
        // Redireciona para a fase correspondente
        const url = `fases/fase${faseParaIniciar}.html`;
        console.log('Redirecionando para:', url);
        window.location.href = url;
    }

    concluirFase(faseId) {
        const fase = this.fasesData[faseId];
        if (!fase || fase.concluida) return;

        // Marca a fase como concluída
        fase.concluida = true;

        // Adiciona pontos
        const pontosAtuais = parseInt(localStorage.getItem('gamePoints') || '2450');
        const novosPontos = pontosAtuais + fase.pontos;
        localStorage.setItem('gamePoints', novosPontos.toString());

        // Verifica desbloqueios
        this.verificarDesbloqueios();

        // Salva progresso
        this.salvarProgresso();

        // Atualiza interface
        this.atualizarPontos();
        this.atualizarEstadoFases();
        this.atualizarProgresso();

        // Mostra mensagem de sucesso
        this.mostrarMensagem(`${fase.nome} concluída! +${fase.pontos} pontos`, 'sucesso');

        // Sincroniza com o sistema global
        if (typeof sincronizarGlobais === 'function') {
            sincronizarGlobais();
        }
    }

    mostrarMensagem(texto, tipo = 'info') {
        // Cria ou reutiliza container de mensagens
        let container = document.getElementById('trilha-messages');
        if (!container) {
            container = document.createElement('div');
            container.id = 'trilha-messages';
            container.style.cssText = `
                position: fixed;
                top: 20px;
                left: 50%;
                transform: translateX(-50%);
                z-index: 2000;
                pointer-events: none;
            `;
            document.body.appendChild(container);
        }

        // Cria mensagem
        const mensagem = document.createElement('div');
        mensagem.className = `trilha-message trilha-message-${tipo}`;
        mensagem.textContent = texto;
        mensagem.style.cssText = `
            background: ${tipo === 'sucesso' ? 'rgba(77, 208, 225, 0.9)' : 'rgba(225, 234, 45, 0.9)'};
            color: ${tipo === 'sucesso' ? '#fff' : '#000'};
            padding: 15px 25px;
            border-radius: 25px;
            margin-bottom: 10px;
            font-weight: bold;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
            backdrop-filter: blur(10px);
            border: 1px solid ${tipo === 'sucesso' ? 'rgba(77, 208, 225, 0.3)' : 'rgba(225, 234, 45, 0.3)'};
            animation: trilhaMensagemSlide 0.5s ease;
        `;

        // Adiciona animação CSS se não existir
        if (!document.getElementById('trilha-animations')) {
            const style = document.createElement('style');
            style.id = 'trilha-animations';
            style.textContent = `
                @keyframes trilhaMensagemSlide {
                    from {
                        opacity: 0;
                        transform: translateY(-20px) scale(0.8);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0) scale(1);
                    }
                }
            `;
            document.head.appendChild(style);
        }

        container.appendChild(mensagem);

        // Remove após 3 segundos
        setTimeout(() => {
            mensagem.style.animation = 'trilhaMensagemSlide 0.3s ease reverse';
            setTimeout(() => mensagem.remove(), 300);
        }, 3000);
    }

    // Método para resetar progresso (útil para desenvolvimento)
    resetarProgresso() {
        localStorage.removeItem('trilhaProgresso');
        Object.keys(this.fasesData).forEach(faseId => {
            this.fasesData[faseId].concluida = false;
            this.fasesData[faseId].desbloqueada = faseId === '1';
        });
        this.atualizarEstadoFases();
        this.atualizarProgresso();
    }
}

// Inicializa quando a página carrega
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM carregado, inicializando TrilhaManager');
    
    // Força o modal a ficar oculto inicialmente
    const modal = document.getElementById('modalFase');
    if (modal) {
        modal.classList.remove('active');
        console.log('Modal inicializado como oculto');
    }
    
    window.trilhaManager = new TrilhaManager();
    console.log('TrilhaManager inicializado', window.trilhaManager);
    
    // Sincroniza com sistema global
    if (typeof sincronizarGlobais === 'function') {
        sincronizarGlobais();
    }
});
