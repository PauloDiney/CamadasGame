// fase4.js - Lógica da Fase 4: Camada de Transporte

class Fase4Manager {
    constructor() {
        this.desafioAtual = 0;
        this.progressoTotal = 4; // Introdução + 3 desafios
        this.progressoAtual = 0;
        this.protocolosEscolhidos = {};
        this.portasAssociadas = {};
        this.etapasOrdenadas = [];
        this.desafiosConcluidos = [];
        this.inicializar();
    }

    inicializar() {
        this.atualizarPontos();
        this.configurarEventos();
        this.configurarDragAndDrop();
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
        const progressoDisplay = document.getElementById('progresso-atual');
        const progressoFill = document.getElementById('progresso-fill');
        
        if (progressoDisplay) {
            progressoDisplay.textContent = this.progressoAtual;
        }
        
        if (progressoFill) {
            const porcentagem = (this.progressoAtual / this.progressoTotal) * 100;
            progressoFill.style.width = `${porcentagem}%`;
        }
    }

    configurarEventos() {
        // Eventos globais da fase
        window.iniciarDesafio = (numero) => this.iniciarDesafio(numero);
        window.selecionarProtocolo = (elemento) => this.selecionarProtocolo(elemento);
        window.verificarProtocolos = () => this.verificarProtocolos();
        window.verificarPortas = () => this.verificarPortas();
        window.resetarPortas = () => this.resetarPortas();
        window.selecionarEtapa = (elemento) => this.selecionarEtapa(elemento);
        window.simularTCP = () => this.simularTCP();
        window.voltarTrilha = () => this.voltarTrilha();
    }

    iniciarDesafio(numero) {
        this.desafioAtual = numero;
        this.progressoAtual++;
        this.atualizarProgresso();
        
        // Esconde seção atual e mostra nova
        document.querySelectorAll('.fase-secao').forEach(secao => {
            secao.classList.remove('ativa');
        });
        
        document.getElementById(`secao-desafio${numero}`).classList.add('ativa');
    }

    // === DESAFIO 1: TCP vs UDP ===
    selecionarProtocolo(elemento) {
        const botoes = elemento.querySelectorAll('.btn-protocolo');
        
        botoes.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                
                // Remove seleção anterior
                botoes.forEach(b => b.classList.remove('selecionado'));
                
                // Adiciona nova seleção
                btn.classList.add('selecionado');
                
                // Armazena escolha
                const appInfo = elemento.querySelector('.app-info h3').textContent;
                this.protocolosEscolhidos[appInfo] = btn.dataset.valor;
                
                this.verificarProtocolosCompletos();
            });
        });
    }

    verificarProtocolosCompletos() {
        const btnVerificar = document.querySelector('#secao-desafio1 .btn-verificar');
        const totalApps = document.querySelectorAll('.aplicacao-item').length;
        
        if (btnVerificar) {
            btnVerificar.disabled = Object.keys(this.protocolosEscolhidos).length < totalApps;
        }
    }

    verificarProtocolos() {
        const respostasCorretas = {
            '🌐 Navegação Web (HTTP/HTTPS)': 'TCP',
            '🎮 Jogos Online': 'UDP',
            '📧 Email (SMTP)': 'TCP',
            '📺 Streaming de Vídeo': 'UDP',
            '📁 Transferência de Arquivos (FTP)': 'TCP',
            '🌍 DNS (Resolução de Nomes)': 'UDP'
        };

        const apps = document.querySelectorAll('.aplicacao-item');
        let acertos = 0;
        let total = 0;

        apps.forEach(app => {
            const appNome = app.querySelector('.app-info h3').textContent;
            const protocoloCorreto = respostasCorretas[appNome];
            const protocoloEscolhido = this.protocolosEscolhidos[appNome];
            
            total++;

            const btnSelecionado = app.querySelector('.btn-protocolo.selecionado');
            if (protocoloEscolhido === protocoloCorreto) {
                acertos++;
                btnSelecionado.style.backgroundColor = '#4CAF50';
                btnSelecionado.style.color = '#fff';
            } else {
                btnSelecionado.style.backgroundColor = '#f44336';
                btnSelecionado.style.color = '#fff';
            }
        });

        const feedback = document.getElementById('feedback-desafio1');
        if (acertos === total) {
            feedback.textContent = 'Perfeito! Você escolheu os protocolos corretos para cada aplicação!';
            feedback.className = 'desafio-feedback sucesso';
            this.desafiosConcluidos.push(1);
            
            setTimeout(() => {
                this.iniciarDesafio(2);
            }, 2000);
        } else {
            feedback.textContent = `Você acertou ${acertos} de ${total}. Lembre-se: TCP para confiabilidade, UDP para velocidade!`;
            feedback.className = 'desafio-feedback erro';
        }
        feedback.style.display = 'block';
    }

    // === DESAFIO 2: PORTAS ===
    configurarDragAndDrop() {
        setTimeout(() => {
            const servicos = document.querySelectorAll('.servico-item');
            const slots = document.querySelectorAll('.porta-slot');

            servicos.forEach(servico => {
                servico.addEventListener('dragstart', (e) => {
                    e.dataTransfer.setData('text/plain', servico.dataset.servico);
                    e.dataTransfer.setData('porta', servico.dataset.porta);
                    servico.classList.add('arrastando');
                });

                servico.addEventListener('dragend', () => {
                    servico.classList.remove('arrastando');
                });
            });

            slots.forEach(slot => {
                slot.addEventListener('dragover', (e) => {
                    e.preventDefault();
                    slot.classList.add('hover');
                });

                slot.addEventListener('dragleave', () => {
                    slot.classList.remove('hover');
                });

                slot.addEventListener('drop', (e) => {
                    e.preventDefault();
                    slot.classList.remove('hover');
                    
                    const servico = e.dataTransfer.getData('text/plain');
                    const portaServico = e.dataTransfer.getData('porta');
                    const portaSlot = slot.dataset.porta;
                    
                    // Remove serviço anterior se existir
                    const slotContent = slot.querySelector('.slot-content');
                    if (slotContent.textContent) {
                        const servicoAnterior = slotContent.textContent;
                        const elementoAnterior = document.querySelector(`[data-servico="${servicoAnterior}"]`);
                        if (elementoAnterior) {
                            elementoAnterior.style.display = 'block';
                        }
                    }
                    
                    // Adiciona novo serviço
                    this.portasAssociadas[portaSlot] = servico;
                    slotContent.textContent = servico;
                    
                    // Esconde serviço da lista
                    const elemento = document.querySelector(`[data-servico="${servico}"]`);
                    if (elemento) {
                        elemento.style.display = 'none';
                    }
                    
                    this.verificarPortasCompletas();
                });
            });
        }, 100);
    }

    verificarPortasCompletas() {
        const btnVerificar = document.querySelector('#secao-desafio2 .btn-verificar');
        if (btnVerificar) {
            btnVerificar.disabled = Object.keys(this.portasAssociadas).length < 7;
        }
    }

    verificarPortas() {
        const associacoesCorretas = {
            '21': 'FTP',
            '22': 'SSH',
            '23': 'TELNET',
            '25': 'SMTP',
            '53': 'DNS',
            '80': 'HTTP',
            '443': 'HTTPS'
        };

        const slots = document.querySelectorAll('.porta-slot');
        let acertos = 0;
        let total = 0;

        slots.forEach(slot => {
            const porta = slot.dataset.porta;
            const servicoCorreto = associacoesCorretas[porta];
            const servicoAssociado = this.portasAssociadas[porta];
            
            total++;

            if (servicoAssociado === servicoCorreto) {
                acertos++;
                slot.classList.add('correto');
            } else {
                slot.classList.add('incorreto');
            }
        });

        const feedback = document.getElementById('feedback-desafio2');
        if (acertos === total) {
            feedback.textContent = 'Excelente! Você associou todos os serviços às portas corretas!';
            feedback.className = 'desafio-feedback sucesso';
            this.desafiosConcluidos.push(2);
            
            setTimeout(() => {
                this.iniciarDesafio(3);
            }, 2000);
        } else {
            feedback.textContent = `Você acertou ${acertos} de ${total} associações. Revise as portas padrão!`;
            feedback.className = 'desafio-feedback erro';
        }
        feedback.style.display = 'block';
    }

    resetarPortas() {
        // Limpa slots
        document.querySelectorAll('.porta-slot').forEach(slot => {
            slot.querySelector('.slot-content').textContent = '';
            slot.classList.remove('correto', 'incorreto', 'hover');
        });
        
        // Mostra todos os serviços
        document.querySelectorAll('.servico-item').forEach(servico => {
            servico.style.display = 'block';
        });
        
        // Limpa dados
        this.portasAssociadas = {};
        
        // Desabilita botão
        const btnVerificar = document.querySelector('#secao-desafio2 .btn-verificar');
        if (btnVerificar) {
            btnVerificar.disabled = true;
        }
        
        // Esconde feedback
        const feedback = document.getElementById('feedback-desafio2');
        if (feedback) {
            feedback.style.display = 'none';
        }
    }

    // === DESAFIO 3: TCP HANDSHAKE ===
    selecionarEtapa(elemento) {
        // Remove seleções anteriores
        document.querySelectorAll('.etapa-item').forEach(item => {
            item.classList.remove('selecionado');
        });
        
        // Adiciona nova seleção
        elemento.classList.add('selecionado');
        
        // Adiciona à sequência
        const ordem = parseInt(elemento.dataset.ordem);
        if (!this.etapasOrdenadas.includes(ordem)) {
            this.etapasOrdenadas.push(ordem);
            
            // Adiciona visual na timeline
            const slot = document.querySelector(`.timeline-slot[data-posicao="${this.etapasOrdenadas.length}"]`);
            if (slot) {
                slot.innerHTML = `<span>Etapa ${ordem}</span>`;
                slot.classList.add('preenchido');
            }
        }
        
        // Habilita botão quando todas as etapas estão selecionadas
        const btnSimular = document.querySelector('.btn-simular');
        if (btnSimular) {
            btnSimular.disabled = this.etapasOrdenadas.length < 3;
        }
    }

    simularTCP() {
        const sequenciaCorreta = [1, 2, 3]; // SYN, SYN-ACK, ACK
        const sequenciaUsuario = this.etapasOrdenadas;
        
        // Verifica se a sequência está correta
        const sequenciaCorretaCheck = sequenciaUsuario.length === 3 && 
                                     sequenciaUsuario[0] === 1 && 
                                     sequenciaUsuario[1] === 2 && 
                                     sequenciaUsuario[2] === 3;

        if (sequenciaCorretaCheck) {
            this.animarHandshake();
        } else {
            const feedback = document.getElementById('feedback-desafio3');
            feedback.textContent = 'Sequência incorreta! A ordem correta é: SYN → SYN-ACK → ACK';
            feedback.className = 'desafio-feedback erro';
            feedback.style.display = 'block';
            
            // Reset para tentar novamente
            this.resetarTCP();
        }
    }

    animarHandshake() {
        const estadoCliente = document.getElementById('estado-cliente');
        const estadoServidor = document.getElementById('estado-servidor');
        const feedback = document.getElementById('feedback-desafio3');
        
        // Etapa 1: SYN
        setTimeout(() => {
            estadoCliente.textContent = 'Enviando SYN...';
            estadoCliente.className = 'estado enviando';
        }, 500);
        
        // Etapa 2: SYN-ACK
        setTimeout(() => {
            estadoServidor.textContent = 'Respondendo SYN-ACK...';
            estadoServidor.className = 'estado respondendo';
            estadoCliente.textContent = 'Aguardando ACK...';
            estadoCliente.className = 'estado aguardando';
        }, 1500);
        
        // Etapa 3: ACK
        setTimeout(() => {
            estadoCliente.textContent = 'Enviando ACK...';
            estadoCliente.className = 'estado confirmando';
        }, 2500);
        
        // Conexão estabelecida
        setTimeout(() => {
            estadoCliente.textContent = 'Conectado!';
            estadoCliente.className = 'estado conectado';
            estadoServidor.textContent = 'Conectado!';
            estadoServidor.className = 'estado conectado';
            
            feedback.textContent = 'Perfeito! Handshake TCP realizado com sucesso! Conexão estabelecida.';
            feedback.className = 'desafio-feedback sucesso';
            feedback.style.display = 'block';
            
            this.desafiosConcluidos.push(3);
            
            setTimeout(() => {
                this.concluirFase();
            }, 3000);
        }, 3500);
    }

    resetarTCP() {
        this.etapasOrdenadas = [];
        
        document.querySelectorAll('.etapa-item').forEach(item => {
            item.classList.remove('selecionado');
        });
        
        document.querySelectorAll('.timeline-slot').forEach(slot => {
            slot.innerHTML = `<span>${slot.dataset.posicao}º</span>`;
            slot.classList.remove('preenchido');
        });
        
        const btnSimular = document.querySelector('.btn-simular');
        if (btnSimular) {
            btnSimular.disabled = true;
        }
    }

    concluirFase() {
        // Adiciona pontos
        const pontosAtuais = parseInt(localStorage.getItem('gamePoints') || '2450');
        const novosPontos = pontosAtuais + 300;
        localStorage.setItem('gamePoints', novosPontos.toString());

        // Marca fase como concluída
        const progressoTrilha = JSON.parse(localStorage.getItem('trilhaProgresso') || '{}');
        progressoTrilha[4] = {
            concluida: true,
            desbloqueada: true
        };
        progressoTrilha[5] = {
            concluida: false,
            desbloqueada: true
        };
        localStorage.setItem('trilhaProgresso', JSON.stringify(progressoTrilha));

        // Atualiza progresso final
        this.progressoAtual = this.progressoTotal;
        this.atualizarProgresso();

        // Mostra conclusão
        document.querySelectorAll('.fase-secao').forEach(secao => {
            secao.classList.remove('ativa');
        });
        document.getElementById('secao-conclusao').classList.add('ativa');

        this.atualizarPontos();
    }

    voltarTrilha() {
        window.location.href = '../trilha.html';
    }
}

// Adiciona CSS específico para Fase 4
const fase4Styles = `
.transporte-animado {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 30px;
    padding: 40px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 15px;
    animation: transporteFluxo 3s ease-in-out infinite;
}

@keyframes transporteFluxo {
    0%, 100% { box-shadow: 0 0 30px rgba(225, 234, 45, 0.3); }
    50% { box-shadow: 0 0 50px rgba(225, 234, 45, 0.6); }
}

.protocolo {
    background: linear-gradient(135deg, #4DD0E1, #26A69A);
    color: #000;
    padding: 30px;
    border-radius: 15px;
    text-align: center;
    font-weight: bold;
    min-width: 150px;
    animation: protocoloPulso 2s ease-in-out infinite;
}

.protocolo.tcp {
    background: linear-gradient(135deg, #4CAF50, #2E7D32);
    color: #fff;
}

.protocolo.udp {
    background: linear-gradient(135deg, #FF9800, #F57C00);
    color: #fff;
}

.vs {
    font-size: 24px;
    font-weight: bold;
    color: #E1EA2D;
}

@keyframes protocoloPulso {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
}

/* === DESAFIO 1: PROTOCOLOS === */
.aplicacoes-lista {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
    gap: 20px;
    margin-bottom: 30px;
}

.aplicacao-item {
    background: rgba(255, 255, 255, 0.05);
    border: 2px solid rgba(225, 234, 45, 0.3);
    border-radius: 10px;
    padding: 20px;
    transition: all 0.3s ease;
}

.aplicacao-item:hover {
    border-color: rgba(225, 234, 45, 0.5);
    transform: translateY(-2px);
}

.app-info h3 {
    color: #E1EA2D;
    margin-bottom: 8px;
    font-size: 18px;
}

.app-info p {
    color: rgba(255, 255, 255, 0.8);
    font-size: 14px;
    margin-bottom: 15px;
}

.protocolo-escolha {
    display: flex;
    gap: 10px;
}

.btn-protocolo {
    flex: 1;
    padding: 10px;
    border: 2px solid rgba(255, 255, 255, 0.2);
    border-radius: 5px;
    background: transparent;
    color: #fff;
    cursor: pointer;
    transition: all 0.3s ease;
    font-weight: bold;
}

.btn-protocolo.tcp {
    border-color: rgba(76, 175, 80, 0.5);
}

.btn-protocolo.tcp:hover {
    background: rgba(76, 175, 80, 0.2);
    border-color: #4CAF50;
}

.btn-protocolo.udp {
    border-color: rgba(255, 152, 0, 0.5);
}

.btn-protocolo.udp:hover {
    background: rgba(255, 152, 0, 0.2);
    border-color: #FF9800;
}

.btn-protocolo.selecionado {
    background: rgba(77, 208, 225, 0.3);
    border-color: #4DD0E1;
}

/* === DESAFIO 2: PORTAS === */
.portas-jogo {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 40px;
    margin-bottom: 30px;
}

.servicos-coluna,
.portas-coluna {
    background: rgba(255, 255, 255, 0.05);
    padding: 20px;
    border-radius: 10px;
}

.servicos-coluna h3,
.portas-coluna h3 {
    color: #E1EA2D;
    text-align: center;
    margin-bottom: 20px;
}

.servico-item {
    background: linear-gradient(135deg, #4DD0E1, #26A69A);
    color: #000;
    padding: 15px;
    margin-bottom: 10px;
    border-radius: 8px;
    cursor: grab;
    text-align: center;
    font-weight: bold;
    transition: all 0.3s ease;
}

.servico-item:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(77, 208, 225, 0.3);
}

.servico-item.arrastando {
    opacity: 0.5;
    cursor: grabbing;
}

.porta-slot {
    display: flex;
    align-items: center;
    gap: 15px;
    padding: 15px;
    margin-bottom: 10px;
    border: 2px dashed rgba(225, 234, 45, 0.3);
    border-radius: 8px;
    transition: all 0.3s ease;
}

.porta-slot.hover {
    border-color: #4DD0E1;
    background: rgba(77, 208, 225, 0.1);
}

.porta-slot.correto {
    border-color: #4CAF50;
    background: rgba(76, 175, 80, 0.1);
}

.porta-slot.incorreto {
    border-color: #f44336;
    background: rgba(244, 67, 54, 0.1);
}

.porta-numero {
    background: #E1EA2D;
    color: #000;
    padding: 8px 12px;
    border-radius: 5px;
    font-weight: bold;
    min-width: 50px;
    text-align: center;
}

.slot-content {
    color: #fff;
    font-weight: bold;
}

/* === DESAFIO 3: TCP === */
.tcp-simulacao {
    text-align: center;
}

.hosts {
    display: flex;
    justify-content: space-around;
    margin-bottom: 30px;
    padding: 20px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 10px;
}

.host {
    text-align: center;
}

.host h3 {
    color: #E1EA2D;
    margin-bottom: 10px;
}

.estado {
    padding: 10px 20px;
    border-radius: 5px;
    background: rgba(128, 128, 128, 0.3);
    color: #fff;
    font-weight: bold;
}

.estado.enviando {
    background: rgba(255, 152, 0, 0.8);
    animation: estadoPiscando 1s infinite;
}

.estado.respondendo {
    background: rgba(77, 208, 225, 0.8);
    animation: estadoPiscando 1s infinite;
}

.estado.aguardando {
    background: rgba(255, 193, 7, 0.8);
}

.estado.confirmando {
    background: rgba(156, 39, 176, 0.8);
    animation: estadoPiscando 1s infinite;
}

.estado.conectado {
    background: rgba(76, 175, 80, 0.8);
    animation: estadoSucesso 2s infinite;
}

@keyframes estadoPiscando {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
}

@keyframes estadoSucesso {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.1); }
}

.etapas-tcp {
    display: flex;
    justify-content: center;
    gap: 20px;
    margin-bottom: 30px;
}

.etapa-item {
    background: rgba(255, 255, 255, 0.05);
    border: 2px solid rgba(225, 234, 45, 0.3);
    border-radius: 10px;
    padding: 20px;
    cursor: pointer;
    transition: all 0.3s ease;
    text-align: center;
    min-width: 150px;
}

.etapa-item:hover {
    border-color: rgba(225, 234, 45, 0.5);
    transform: translateY(-2px);
}

.etapa-item.selecionado {
    border-color: #4DD0E1;
    background: rgba(77, 208, 225, 0.2);
}

.etapa-numero {
    display: block;
    background: #E1EA2D;
    color: #000;
    border-radius: 50%;
    width: 30px;
    height: 30px;
    line-height: 30px;
    margin: 0 auto 10px;
    font-weight: bold;
}

.etapa-info h4 {
    color: #4DD0E1;
    margin-bottom: 5px;
}

.etapa-info p {
    color: rgba(255, 255, 255, 0.8);
    font-size: 14px;
}

.timeline-tcp {
    display: flex;
    justify-content: center;
    gap: 20px;
    margin-bottom: 30px;
}

.timeline-slot {
    background: rgba(128, 128, 128, 0.2);
    border: 2px dashed rgba(128, 128, 128, 0.5);
    border-radius: 8px;
    padding: 15px;
    min-width: 100px;
    text-align: center;
    color: rgba(255, 255, 255, 0.6);
}

.timeline-slot.preenchido {
    background: rgba(77, 208, 225, 0.2);
    border-color: #4DD0E1;
    color: #fff;
    font-weight: bold;
}

.btn-simular {
    padding: 15px 30px;
    background: linear-gradient(135deg, #E1EA2D, #C0C025);
    color: #000;
    border: none;
    border-radius: 25px;
    font-size: 16px;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.3s ease;
}

.btn-simular:disabled {
    background: rgba(128, 128, 128, 0.3);
    cursor: not-allowed;
    opacity: 0.5;
}

.btn-simular:not(:disabled):hover {
    background: linear-gradient(135deg, #C0C025, #E1EA2D);
    transform: translateY(-2px);
}

.btn-verificar {
    display: block;
    margin: 20px auto;
    padding: 15px 30px;
    background: linear-gradient(135deg, #4DD0E1, #26A69A);
    color: #000;
    border: none;
    border-radius: 25px;
    font-size: 16px;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.3s ease;
}

.btn-verificar:disabled {
    background: rgba(128, 128, 128, 0.3);
    cursor: not-allowed;
    opacity: 0.5;
}

.btn-verificar:not(:disabled):hover {
    background: linear-gradient(135deg, #26A69A, #4DD0E1);
    transform: translateY(-2px);
}

.btn-resetar {
    margin-left: 10px;
    padding: 10px 20px;
    background: rgba(255, 107, 107, 0.8);
    color: #fff;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    transition: all 0.3s ease;
}

.btn-resetar:hover {
    background: rgba(255, 107, 107, 1);
}
`;

// Adiciona os estilos à página
const styleSheet = document.createElement('style');
styleSheet.textContent = fase4Styles;
document.head.appendChild(styleSheet);

// Inicializa quando a página carrega
document.addEventListener('DOMContentLoaded', function() {
    window.fase4Manager = new Fase4Manager();
    
    // Sincroniza com sistema global
    if (typeof sincronizarGlobais === 'function') {
        sincronizarGlobais();
    }
});
