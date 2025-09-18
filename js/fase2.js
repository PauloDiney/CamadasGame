// fase2.js - Lógica da Fase 2: Camada de Enlace

class Fase2Manager {
    constructor() {
        this.desafioAtual = 0;
        this.progressoTotal = 4; // Introdução + 3 desafios
        this.progressoAtual = 0;
        this.selecoesMAC = new Set();
        this.quadroMontado = {};
        this.selecaoCRC = null;
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
        window.selecionarMAC = (elemento) => this.selecionarMAC(elemento);
        window.verificarMACs = () => this.verificarMACs();
        window.verificarQuadro = () => this.verificarQuadro();
        window.resetarQuadro = () => this.resetarQuadro();
        window.selecionarQuadroCRC = (elemento) => this.selecionarQuadroCRC(elemento);
        window.verificarCRC = () => this.verificarCRC();
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

    // === DESAFIO 1: ENDEREÇOS MAC ===
    selecionarMAC(elemento) {
        const macText = elemento.querySelector('.mac-text').textContent;
        
        if (elemento.classList.contains('selecionado')) {
            elemento.classList.remove('selecionado');
            this.selecoesMAC.delete(macText);
        } else {
            elemento.classList.add('selecionado');
            this.selecoesMAC.add(macText);
        }

        // Habilita botão se pelo menos um MAC foi selecionado
        const btnVerificar = document.querySelector('#secao-desafio1 .btn-verificar');
        if (btnVerificar) {
            btnVerificar.disabled = this.selecoesMAC.size === 0;
        }
    }

    verificarMACs() {
        const macItems = document.querySelectorAll('.mac-item');
        let acertos = 0;
        let total = 0;

        macItems.forEach(item => {
            const macText = item.querySelector('.mac-text').textContent;
            const isValido = item.dataset.valido === 'true';
            const foiSelecionado = this.selecoesMAC.has(macText);
            const status = item.querySelector('.mac-status');
            
            total++;

            if ((isValido && foiSelecionado) || (!isValido && !foiSelecionado)) {
                acertos++;
                status.textContent = '✓';
                status.className = 'mac-status correto';
            } else {
                status.textContent = '✗';
                status.className = 'mac-status incorreto';
            }
        });

        const feedback = document.getElementById('feedback-desafio1');
        if (acertos === total) {
            feedback.textContent = 'Perfeito! Você identificou todos os endereços MAC corretamente!';
            feedback.className = 'desafio-feedback sucesso';
            this.desafiosConcluidos.push(1);
            
            setTimeout(() => {
                this.iniciarDesafio(2);
            }, 2000);
        } else {
            feedback.textContent = `Você acertou ${acertos} de ${total}. Tente novamente!`;
            feedback.className = 'desafio-feedback erro';
        }
        feedback.style.display = 'block';
    }

    // === DESAFIO 2: MONTAGEM DE QUADROS ===
    configurarDragAndDrop() {
        setTimeout(() => {
            const componentes = document.querySelectorAll('.componente');
            const slots = document.querySelectorAll('.slot-quadro');

            componentes.forEach(comp => {
                comp.addEventListener('dragstart', (e) => {
                    e.dataTransfer.setData('text/plain', comp.dataset.tipo);
                    e.dataTransfer.setData('ordem', comp.dataset.ordem);
                    comp.classList.add('arrastando');
                });

                comp.addEventListener('dragend', () => {
                    comp.classList.remove('arrastando');
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
                    
                    const tipo = e.dataTransfer.getData('text/plain');
                    const ordem = e.dataTransfer.getData('ordem');
                    const posicao = slot.dataset.posicao;
                    
                    // Remove componente anterior se existir
                    if (this.quadroMontado[posicao]) {
                        const compAnterior = document.querySelector(`[data-tipo="${this.quadroMontado[posicao]}"]`);
                        if (compAnterior) {
                            compAnterior.style.display = 'block';
                        }
                    }
                    
                    // Adiciona novo componente
                    this.quadroMontado[posicao] = tipo;
                    slot.innerHTML = `<span class="slot-conteudo">${document.querySelector(`[data-tipo="${tipo}"] span`).textContent}</span>`;
                    
                    // Esconde componente da lista
                    const componente = document.querySelector(`[data-tipo="${tipo}"]`);
                    if (componente) {
                        componente.style.display = 'none';
                    }
                    
                    // Verifica se pode habilitar botão
                    this.verificarQuadroCompleto();
                });
            });
        }, 100);
    }

    verificarQuadroCompleto() {
        const btnVerificar = document.querySelector('#secao-desafio2 .btn-verificar');
        if (btnVerificar) {
            btnVerificar.disabled = Object.keys(this.quadroMontado).length < 6;
        }
    }

    verificarQuadro() {
        const ordemCorreta = ['1', '2', '3', '4', '5', '6'];
        const tiposCorretos = ['preambulo', 'destino', 'origem', 'tipo', 'dados', 'fcs'];
        
        let acertos = 0;
        const slots = document.querySelectorAll('.slot-quadro');
        
        slots.forEach((slot, index) => {
            const posicao = slot.dataset.posicao;
            const tipoEsperado = tiposCorretos[index];
            const tipoAtual = this.quadroMontado[posicao];
            
            if (tipoAtual === tipoEsperado) {
                acertos++;
                slot.classList.add('correto');
            } else {
                slot.classList.add('incorreto');
            }
        });
        
        const feedback = document.getElementById('feedback-desafio2');
        if (acertos === 6) {
            feedback.textContent = 'Excelente! Você montou o quadro Ethernet na ordem correta!';
            feedback.className = 'desafio-feedback sucesso';
            this.desafiosConcluidos.push(2);
            
            setTimeout(() => {
                this.iniciarDesafio(3);
            }, 2000);
        } else {
            feedback.textContent = `Ordem incorreta! Você acertou ${acertos} de 6 posições. Tente novamente!`;
            feedback.className = 'desafio-feedback erro';
        }
        feedback.style.display = 'block';
    }

    resetarQuadro() {
        // Limpa slots
        document.querySelectorAll('.slot-quadro').forEach(slot => {
            slot.innerHTML = `<span class="slot-label">${slot.dataset.posicao}º</span>`;
            slot.classList.remove('correto', 'incorreto');
        });
        
        // Mostra todos os componentes
        document.querySelectorAll('.componente').forEach(comp => {
            comp.style.display = 'block';
        });
        
        // Limpa dados
        this.quadroMontado = {};
        
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

    // === DESAFIO 3: DETECÇÃO DE ERRO CRC ===
    selecionarQuadroCRC(elemento) {
        // Remove seleção anterior
        document.querySelectorAll('.quadro-crc').forEach(q => {
            q.classList.remove('selecionado');
        });
        
        // Adiciona nova seleção
        elemento.classList.add('selecionado');
        this.selecaoCRC = elemento.dataset.correto === 'false' ? 'incorreto' : 'correto';
        
        // Habilita botão
        const btnVerificar = document.querySelector('#secao-desafio3 .btn-verificar');
        if (btnVerificar) {
            btnVerificar.disabled = false;
        }
    }

    verificarCRC() {
        const feedback = document.getElementById('feedback-desafio3');
        const quadrosSelecionados = document.querySelectorAll('.quadro-crc.selecionado');
        
        // Marca todos os quadros com erro
        document.querySelectorAll('.quadro-crc').forEach(quadro => {
            const temErro = quadro.dataset.correto === 'false';
            const status = quadro.querySelector('.quadro-status-crc');
            
            if (temErro) {
                status.textContent = '❌ ERRO';
                status.className = 'quadro-status-crc erro';
                quadro.classList.add('com-erro');
            } else {
                status.textContent = '✅ OK';
                status.className = 'quadro-status-crc ok';
                quadro.classList.add('sem-erro');
            }
        });
        
        // Verifica se selecionou o quadro com erro (Quadro B)
        const quadroB = document.querySelector('.quadro-crc[data-correto="false"]');
        if (quadroB && quadroB.classList.contains('selecionado')) {
            feedback.textContent = 'Correto! Você identificou o quadro com erro. O Quadro B tem FCS diferente do calculado, indicando erro na transmissão.';
            feedback.className = 'desafio-feedback sucesso';
            this.desafiosConcluidos.push(3);
            
            setTimeout(() => {
                this.concluirFase();
            }, 3000);
        } else {
            feedback.textContent = 'Revise! O quadro com erro é aquele onde o FCS recebido difere do FCS calculado.';
            feedback.className = 'desafio-feedback erro';
        }
        feedback.style.display = 'block';
    }

    concluirFase() {
        // Adiciona pontos (mais pontos por completar todos os desafios)
        const pontosAtuais = parseInt(localStorage.getItem('gamePoints') || '2450');
        const novosPontos = pontosAtuais + 200;
        localStorage.setItem('gamePoints', novosPontos.toString());

        // Marca fase como concluída
        const progressoTrilha = JSON.parse(localStorage.getItem('trilhaProgresso') || '{}');
        progressoTrilha[2] = {
            concluida: true,
            desbloqueada: true
        };
        progressoTrilha[3] = {
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
        window.location.href = 'trilha.html';
    }
}

// Adiciona CSS específico para Fase 2
const fase2Styles = `
.quadro-animado {
    display: flex;
    background: rgba(255, 255, 255, 0.1);
    border: 2px solid #E1EA2D;
    border-radius: 10px;
    overflow: hidden;
    animation: quadroPulsando 2s ease-in-out infinite;
}

@keyframes quadroPulsando {
    0%, 100% { box-shadow: 0 0 20px rgba(225, 234, 45, 0.3); }
    50% { box-shadow: 0 0 30px rgba(225, 234, 45, 0.6); }
}

.quadro-header, .quadro-dados, .quadro-trailer {
    padding: 15px 20px;
    color: #fff;
    font-weight: bold;
    text-align: center;
}

.quadro-header {
    background: #4DD0E1;
    color: #000;
}

.quadro-dados {
    background: #E1EA2D;
    color: #000;
    flex: 1;
}

.quadro-trailer {
    background: #FF6B6B;
    color: #000;
}

.mac-addresses {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 20px;
    margin-bottom: 30px;
}

.mac-item {
    background: rgba(255, 255, 255, 0.05);
    border: 2px solid rgba(225, 234, 45, 0.3);
    border-radius: 10px;
    padding: 20px;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.mac-item:hover {
    background: rgba(225, 234, 45, 0.1);
    border-color: rgba(225, 234, 45, 0.5);
    transform: translateY(-2px);
}

.mac-item.selecionado {
    background: rgba(77, 208, 225, 0.2);
    border-color: #4DD0E1;
}

.mac-text {
    color: #fff;
    font-family: monospace;
    font-size: 16px;
    font-weight: bold;
}

.mac-status {
    font-size: 20px;
    font-weight: bold;
}

.mac-status.correto {
    color: #4CAF50;
}

.mac-status.incorreto {
    color: #f44336;
}

/* === DESAFIO 2: MONTAGEM DE QUADROS === */
.componentes-disponiveis {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 15px;
    margin-bottom: 30px;
    padding: 20px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 10px;
}

.componente {
    background: linear-gradient(135deg, #4DD0E1, #26A69A);
    color: #000;
    padding: 15px;
    border-radius: 8px;
    cursor: grab;
    transition: all 0.3s ease;
    text-align: center;
}

.componente:hover {
    transform: translateY(-3px);
    box-shadow: 0 5px 15px rgba(77, 208, 225, 0.3);
}

.componente.arrastando {
    opacity: 0.5;
    cursor: grabbing;
}

.componente span {
    display: block;
    font-weight: bold;
    margin-bottom: 5px;
}

.componente small {
    font-size: 12px;
    opacity: 0.8;
}

.quadro-montagem {
    display: flex;
    gap: 10px;
    justify-content: center;
    margin-bottom: 30px;
    padding: 20px;
    background: rgba(0, 0, 0, 0.2);
    border-radius: 10px;
    overflow-x: auto;
}

.slot-quadro {
    min-width: 120px;
    height: 80px;
    border: 2px dashed rgba(225, 234, 45, 0.3);
    border-radius: 8px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
    position: relative;
}

.slot-quadro.hover {
    border-color: #4DD0E1;
    background: rgba(77, 208, 225, 0.1);
}

.slot-quadro.correto {
    border-color: #4CAF50;
    background: rgba(76, 175, 80, 0.1);
}

.slot-quadro.incorreto {
    border-color: #f44336;
    background: rgba(244, 67, 54, 0.1);
}

.slot-label {
    color: rgba(255, 255, 255, 0.6);
    font-size: 12px;
    margin-bottom: 5px;
}

.slot-conteudo {
    color: #fff;
    font-size: 11px;
    font-weight: bold;
    text-align: center;
    line-height: 1.2;
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

/* === DESAFIO 3: CRC === */
.crc-explicacao {
    background: rgba(255, 255, 255, 0.05);
    padding: 20px;
    border-radius: 10px;
    margin-bottom: 30px;
    border-left: 4px solid #E1EA2D;
}

.crc-explicacao h3 {
    color: #E1EA2D;
    margin-bottom: 10px;
}

.quadros-crc {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 20px;
    margin-bottom: 30px;
}

.quadro-crc {
    background: rgba(255, 255, 255, 0.05);
    border: 2px solid rgba(225, 234, 45, 0.3);
    border-radius: 10px;
    padding: 20px;
    cursor: pointer;
    transition: all 0.3s ease;
}

.quadro-crc:hover {
    border-color: rgba(225, 234, 45, 0.5);
    transform: translateY(-2px);
}

.quadro-crc.selecionado {
    border-color: #4DD0E1;
    background: rgba(77, 208, 225, 0.1);
}

.quadro-crc.com-erro {
    border-color: #f44336;
    background: rgba(244, 67, 54, 0.1);
}

.quadro-crc.sem-erro {
    border-color: #4CAF50;
    background: rgba(76, 175, 80, 0.1);
}

.quadro-header-crc {
    color: #E1EA2D;
    font-weight: bold;
    font-size: 18px;
    margin-bottom: 15px;
    text-align: center;
}

.quadro-dados-crc {
    font-family: monospace;
    font-size: 14px;
    line-height: 1.6;
}

.quadro-dados-crc div {
    margin-bottom: 8px;
    color: #fff;
}

.quadro-status-crc {
    text-align: center;
    font-weight: bold;
    margin-top: 15px;
    padding: 10px;
    border-radius: 5px;
}

.quadro-status-crc.erro {
    background: rgba(244, 67, 54, 0.2);
    color: #f44336;
}

.quadro-status-crc.ok {
    background: rgba(76, 175, 80, 0.2);
    color: #4CAF50;
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

.conhecimentos-adquiridos {
    background: rgba(225, 234, 45, 0.1);
    padding: 20px;
    border-radius: 10px;
    margin-bottom: 30px;
}

.conhecimentos-adquiridos h3 {
    color: #E1EA2D;
    margin-bottom: 15px;
}

.conhecimentos-adquiridos ul {
    list-style: none;
    padding: 0;
}

.conhecimentos-adquiridos li {
    color: #fff;
    margin-bottom: 8px;
    padding-left: 20px;
    position: relative;
}

.conhecimentos-adquiridos li::before {
    content: '✓';
    position: absolute;
    left: 0;
    color: #4CAF50;
    font-weight: bold;
}
`;

// Adiciona os estilos à página
const styleSheet = document.createElement('style');
styleSheet.textContent = fase2Styles;
document.head.appendChild(styleSheet);

// Inicializa quando a página carrega
document.addEventListener('DOMContentLoaded', function() {
    window.fase2Manager = new Fase2Manager();
    
    // Sincroniza com sistema global
    if (typeof sincronizarGlobais === 'function') {
        sincronizarGlobais();
    }
});
