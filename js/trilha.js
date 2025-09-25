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
        console.log('Configurando eventos para', faseNodes.length, 'nós de fase'); // Debug
        
        faseNodes.forEach(node => {
            const faseId = node.getAttribute('data-fase');
            console.log('Configurando evento para fase:', faseId); // Debug
            
            node.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Clicou na fase:', faseId); // Debug
                
                if (faseId && this.fasesData[faseId] && this.fasesData[faseId].desbloqueada) {
                    this.abrirModalFase(faseId);
                } else {
                    console.log('Fase bloqueada ou inválida:', faseId, this.fasesData[faseId]);
                }
            });
        });

        // Eventos do modal
        const modal = document.getElementById('modal-fase');
        const btnClose = document.getElementById('modal-close');
        const btnCancelar = document.getElementById('btn-cancelar');
        const btnIniciar = document.getElementById('btn-iniciar-fase');

        console.log('Elementos do modal encontrados:', {modal, btnClose, btnCancelar, btnIniciar}); // Debug

        if (btnClose) {
            btnClose.addEventListener('click', () => {
                console.log('Botão fechar clicado');
                this.fecharModal();
            });
        }
        
        if (btnCancelar) {
            btnCancelar.addEventListener('click', () => {
                console.log('Botão cancelar clicado');
                this.fecharModal();
            });
        }
        
        if (btnIniciar) {
            btnIniciar.addEventListener('click', () => {
                console.log('Botão iniciar clicado');
                this.iniciarFase();
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
            if (e.key === 'Escape' && modal && modal.classList.contains('ativo')) {
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
        console.log('Abrindo modal para fase:', faseId); // Debug
        const fase = this.fasesData[faseId];
        if (!fase || !fase.desbloqueada) {
            console.log('Fase não disponível:', faseId, fase);
            return;
        }

        // Preenche os dados do modal
        const modalTitulo = document.getElementById('modal-titulo');
        const modalNomeFase = document.getElementById('modal-nome-fase');
        const modalDescricao = document.getElementById('modal-descricao');
        const modalPontos = document.getElementById('modal-pontos');

        if (modalTitulo) modalTitulo.textContent = `Iniciar ${fase.nome}`;
        if (modalNomeFase) modalNomeFase.textContent = fase.nome;
        if (modalDescricao) modalDescricao.textContent = fase.descricao;
        if (modalPontos) modalPontos.textContent = `+${fase.pontos}`;

        // Preenche objetivos
        const objetivosList = document.getElementById('modal-objetivos');
        if (objetivosList) {
            objetivosList.innerHTML = fase.objetivos.map(obj => `<li>${obj}</li>`).join('');
        }

        // Configura o ícone
        const modalIcone = document.getElementById('modal-icone');
        const originalIcone = document.querySelector(`[data-fase="${faseId}"] .fase-icone`);
        if (modalIcone && originalIcone) {
            modalIcone.innerHTML = originalIcone.innerHTML;
        }

        // Armazena a fase atual
        this.faseAtual = faseId;
        console.log('Fase atual definida como:', this.faseAtual); // Debug

        // Configura o botão de iniciar
        const btnIniciar = document.getElementById('btn-iniciar-fase');
        if (btnIniciar) {
            if (fase.concluida) {
                btnIniciar.textContent = 'Refazer Fase';
            } else {
                btnIniciar.textContent = 'Iniciar Fase';
            }
        }

        // Abre o modal
        const modal = document.getElementById('modal-fase');
        if (modal) {
            modal.classList.add('ativo');
        }
    }

    fecharModal() {
        const modal = document.getElementById('modal-fase');
        if (modal) {
            modal.classList.remove('ativo');
            console.log('Modal fechado, classe ativo removida');
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
        const url = `fase${faseParaIniciar}.html`;
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
    console.log('DOM carregado, inicializando TrilhaManager'); // Debug
    
    // Força o modal a ficar oculto inicialmente
    const modal = document.getElementById('modal-fase');
    if (modal) {
        modal.classList.remove('ativo');
        console.log('Modal inicializado como oculto');
    }
    
    window.trilhaManager = new TrilhaManager();
    console.log('TrilhaManager inicializado', window.trilhaManager);
    
    // Sincroniza com sistema global
    if (typeof sincronizarGlobais === 'function') {
        sincronizarGlobais();
    }
});
