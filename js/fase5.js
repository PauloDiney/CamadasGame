// fase5.js - Lógica da Fase 5: Camada de Aplicação

class Fase5Manager {
    constructor() {
        this.desafioAtual = 0;
        this.progressoTotal = 4; // Introdução + 3 desafios
        this.progressoAtual = 0;
        this.sequenciaDNS = [];
        this.protocolosEmail = {};
        this.desafiosConcluidos = [];
        this.inicializar();
    }

    inicializar() {
        this.atualizarPontos();
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
        window.verificarHTTP = () => this.verificarHTTP();
        window.selecionarEtapaDNS = (elemento) => this.selecionarEtapaDNS(elemento);
        window.verificarDNS = () => this.verificarDNS();
        window.resetarDNS = () => this.resetarDNS();
        window.verificarEmail = () => this.verificarEmail();
        window.voltarTrilha = () => this.voltarTrilha();

        // Configurar eventos de email
        setTimeout(() => {
            const selects = document.querySelectorAll('.protocolo-select');
            selects.forEach(select => {
                select.addEventListener('change', () => {
                    const tipo = select.dataset.tipo;
                    this.protocolosEmail[tipo] = select.value;
                    this.verificarEmailCompleto();
                });
            });
        }, 100);
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

    // === DESAFIO 1: HTTP ===
    verificarHTTP() {
        const respostasCorretas = {
            'metodo-http': 'GET',
            'recurso-http': '/produtos/lista',
            'versao-http': 'HTTP/1.1',
            'host-http': 'loja.exemplo.com'
        };

        const inputs = ['metodo-http', 'recurso-http', 'versao-http', 'host-http'];
        let acertos = 0;
        let total = inputs.length;

        inputs.forEach(inputId => {
            const elemento = document.getElementById(inputId);
            const valorCorreto = respostasCorretas[inputId];
            const valorDigitado = elemento.value.trim();
            
            if (valorDigitado === valorCorreto) {
                acertos++;
                elemento.style.backgroundColor = '#4CAF50';
                elemento.style.color = '#fff';
            } else {
                elemento.style.backgroundColor = '#f44336';
                elemento.style.color = '#fff';
                if (elemento.tagName === 'INPUT') {
                    elemento.placeholder = `Correto: ${valorCorreto}`;
                }
            }
        });

        const feedback = document.getElementById('feedback-desafio1');
        if (acertos === total) {
            feedback.textContent = 'Perfeito! Você analisou corretamente todos os componentes da requisição HTTP!';
            feedback.className = 'desafio-feedback sucesso';
            this.desafiosConcluidos.push(1);
            
            setTimeout(() => {
                this.iniciarDesafio(2);
            }, 2000);
        } else {
            feedback.textContent = `Você acertou ${acertos} de ${total} componentes. Revise a estrutura da requisição HTTP!`;
            feedback.className = 'desafio-feedback erro';
        }
        feedback.style.display = 'block';
    }

    // === DESAFIO 2: DNS ===
    selecionarEtapaDNS(elemento) {
        const ordem = parseInt(elemento.dataset.ordem);
        
        // Verifica se já está selecionado
        if (this.sequenciaDNS.includes(ordem)) {
            return;
        }
        
        // Adiciona à sequência
        this.sequenciaDNS.push(ordem);
        elemento.classList.add('selecionado');
        
        // Atualiza slot correspondente
        const posicao = this.sequenciaDNS.length;
        const slot = document.querySelector(`.slot-dns[data-posicao="${posicao}"]`);
        if (slot) {
            slot.textContent = `Etapa ${ordem}`;
            slot.classList.add('preenchido');
        }
        
        // Habilita botão quando todas as etapas estão ordenadas
        const btnVerificar = document.querySelector('#secao-desafio2 .btn-verificar');
        if (btnVerificar) {
            btnVerificar.disabled = this.sequenciaDNS.length < 6;
        }
    }

    verificarDNS() {
        const sequenciaCorreta = [1, 2, 3, 4, 5, 6];
        let sequenciaEstaCorreta = true;
        
        // Verifica se a sequência está correta
        for (let i = 0; i < this.sequenciaDNS.length; i++) {
            if (this.sequenciaDNS[i] !== sequenciaCorreta[i]) {
                sequenciaEstaCorreta = false;
                break;
            }
        }
        
        // Adiciona feedback visual
        const slots = document.querySelectorAll('.slot-dns');
        slots.forEach((slot, index) => {
            if (index < this.sequenciaDNS.length) {
                if (this.sequenciaDNS[index] === sequenciaCorreta[index]) {
                    slot.classList.add('correto');
                    slot.classList.remove('incorreto');
                } else {
                    slot.classList.add('incorreto');
                    slot.classList.remove('correto');
                }
            }
        });

        const feedback = document.getElementById('feedback-desafio2');
        if (sequenciaEstaCorreta && this.sequenciaDNS.length === 6) {
            feedback.textContent = 'Excelente! Você ordenou corretamente o processo de resolução DNS!';
            feedback.className = 'desafio-feedback sucesso';
            this.desafiosConcluidos.push(2);
            
            setTimeout(() => {
                this.iniciarDesafio(3);
            }, 2000);
        } else {
            feedback.textContent = 'Sequência incorreta! A resolução DNS segue: Cache Local → DNS Recursivo → Raiz → TLD → Autoritativo → Retorno IP';
            feedback.className = 'desafio-feedback erro';
        }
        feedback.style.display = 'block';
    }

    resetarDNS() {
        // Limpa sequência
        this.sequenciaDNS = [];
        
        // Remove seleções das etapas
        document.querySelectorAll('.etapa-dns').forEach(etapa => {
            etapa.classList.remove('selecionado');
        });
        
        // Limpa slots
        document.querySelectorAll('.slot-dns').forEach(slot => {
            slot.textContent = slot.dataset.posicao + 'º';
            slot.classList.remove('preenchido', 'correto', 'incorreto');
        });
        
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

    // === DESAFIO 3: EMAIL ===
    verificarEmailCompleto() {
        const btnVerificar = document.querySelector('#secao-desafio3 .btn-verificar');
        const totalProtocolos = 4; // envio, transfer, receive, client
        
        if (btnVerificar) {
            btnVerificar.disabled = Object.keys(this.protocolosEmail).length < totalProtocolos;
        }
    }

    verificarEmail() {
        const respostasCorretas = {
            'envio': 'SMTP',      // Ana envia via SMTP
            'transfer': 'SMTP',   // Transferência entre servidores via SMTP
            'receive': 'SMTP',    // Servidor recebe via SMTP
            'client': 'POP3'      // Bob baixa via POP3 ou IMAP (aceitar ambos)
        };

        const selects = document.querySelectorAll('.protocolo-select');
        let acertos = 0;
        let total = 0;

        selects.forEach(select => {
            const tipo = select.dataset.tipo;
            const protocoloCorreto = respostasCorretas[tipo];
            const protocoloEscolhido = select.value;
            
            total++;

            // Para cliente, aceita POP3 ou IMAP
            const estaCorreto = (tipo === 'client') ? 
                (protocoloEscolhido === 'POP3' || protocoloEscolhido === 'IMAP') :
                (protocoloEscolhido === protocoloCorreto);

            if (estaCorreto) {
                acertos++;
                select.style.backgroundColor = '#4CAF50';
                select.style.color = '#fff';
            } else {
                select.style.backgroundColor = '#f44336';
                select.style.color = '#fff';
            }
        });

        const feedback = document.getElementById('feedback-desafio3');
        if (acertos === total) {
            feedback.textContent = 'Perfeito! Você configurou corretamente o fluxo de protocolos de email!';
            feedback.className = 'desafio-feedback sucesso';
            this.desafiosConcluidos.push(3);
            
            setTimeout(() => {
                this.concluirFase();
            }, 2000);
        } else {
            feedback.textContent = `Você acertou ${acertos} de ${total} protocolos. Lembre-se: SMTP para envio/transferência, POP3/IMAP para cliente!`;
            feedback.className = 'desafio-feedback erro';
        }
        feedback.style.display = 'block';
    }

    concluirFase() {
        // Adiciona pontos (mais pontos por ser a fase final)
        const pontosAtuais = parseInt(localStorage.getItem('gamePoints') || '2450');
        const novosPontos = pontosAtuais + 350;
        localStorage.setItem('gamePoints', novosPontos.toString());

        // Marca fase como concluída
        const progressoTrilha = JSON.parse(localStorage.getItem('trilhaProgresso') || '{}');
        progressoTrilha[5] = {
            concluida: true,
            desbloqueada: true
        };
        localStorage.setItem('trilhaProgresso', JSON.stringify(progressoTrilha));

        // Marca conquista final
        localStorage.setItem('jogoCompleto', 'true');

        // Atualiza progresso final
        this.progressoAtual = this.progressoTotal;
        this.atualizarProgresso();

        // Atualiza pontuação total final
        const pontosFinal = document.getElementById('pontos-total-final');
        if (pontosFinal) {
            pontosFinal.textContent = `${novosPontos} Pontos`;
        }

        // Mostra conclusão
        document.querySelectorAll('.fase-secao').forEach(secao => {
            secao.classList.remove('ativa');
        });
        document.getElementById('secao-conclusao').classList.add('ativa');

        this.atualizarPontos();
        this.celebrarVitoria();
    }

    celebrarVitoria() {
        // Adiciona efeitos de celebração
        const conclusaoIcon = document.querySelector('.sucesso-icon');
        if (conclusaoIcon) {
            conclusaoIcon.style.animation = 'celebracao 2s ease-in-out infinite';
        }

        // Adiciona confetes (se quiser implementar)
        console.log('🎉 PARABÉNS! Todas as fases concluídas! 🎉');
    }

    voltarTrilha() {
        window.location.href = 'trilha.html';
    }
}

// Adiciona CSS específico para Fase 5
const fase5Styles = `
.aplicacao-animada {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 30px;
    padding: 40px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 15px;
    animation: aplicacaoFluxo 4s ease-in-out infinite;
}

@keyframes aplicacaoFluxo {
    0%, 100% { box-shadow: 0 0 30px rgba(233, 30, 99, 0.3); }
    50% { box-shadow: 0 0 50px rgba(233, 30, 99, 0.6); }
}

.servico {
    background: linear-gradient(135deg, #E91E63, #AD1457);
    color: #fff;
    padding: 30px;
    border-radius: 15px;
    text-align: center;
    font-weight: bold;
    animation: servicoPulso 3s ease-in-out infinite;
}

.servico span {
    display: block;
    font-size: 32px;
    margin-bottom: 10px;
}

.servico.web { animation-delay: 0s; }
.servico.email { animation-delay: 0.5s; }
.servico.ftp { animation-delay: 1s; }
.servico.dns { animation-delay: 1.5s; }

@keyframes servicoPulso {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
}

/* === DESAFIO 1: HTTP === */
.requisicao-http {
    background: rgba(0, 0, 0, 0.3);
    padding: 20px;
    border-radius: 10px;
    margin-bottom: 30px;
    border-left: 4px solid #E91E63;
}

.codigo-http pre {
    color: #fff;
    font-family: monospace;
    font-size: 14px;
    line-height: 1.6;
    margin: 0;
}

.analise-componentes {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 20px;
    margin-bottom: 30px;
}

.componente-item {
    background: rgba(255, 255, 255, 0.05);
    padding: 20px;
    border-radius: 10px;
    border: 2px solid rgba(233, 30, 99, 0.3);
}

.componente-item label {
    display: block;
    color: #E91E63;
    font-weight: bold;
    margin-bottom: 10px;
}

.componente-item input,
.componente-item select {
    width: 100%;
    padding: 10px;
    border: 1px solid rgba(233, 30, 99, 0.3);
    border-radius: 5px;
    background: rgba(0, 0, 0, 0.3);
    color: #fff;
    font-family: monospace;
}

.componente-item input:focus,
.componente-item select:focus {
    border-color: #E91E63;
    outline: none;
    box-shadow: 0 0 10px rgba(233, 30, 99, 0.3);
}

/* === DESAFIO 2: DNS === */
.dns-cenario {
    background: rgba(233, 30, 99, 0.1);
    padding: 20px;
    border-radius: 10px;
    text-align: center;
    margin-bottom: 30px;
    border: 2px solid rgba(233, 30, 99, 0.3);
}

.dns-cenario h3 {
    color: #E91E63;
    margin-bottom: 10px;
}

.etapas-dns {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 15px;
    margin-bottom: 30px;
}

.etapa-dns {
    background: rgba(255, 255, 255, 0.05);
    border: 2px solid rgba(233, 30, 99, 0.3);
    border-radius: 10px;
    padding: 15px;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    gap: 15px;
}

.etapa-dns:hover {
    border-color: rgba(233, 30, 99, 0.5);
    transform: translateY(-2px);
}

.etapa-dns.selecionado {
    border-color: #4DD0E1;
    background: rgba(77, 208, 225, 0.2);
}

.numero-etapa {
    background: #E91E63;
    color: #fff;
    border-radius: 50%;
    width: 30px;
    height: 30px;
    line-height: 30px;
    text-align: center;
    font-weight: bold;
    flex-shrink: 0;
}

.etapa-conteudo h4 {
    color: #4DD0E1;
    margin-bottom: 5px;
    font-size: 16px;
}

.etapa-conteudo p {
    color: rgba(255, 255, 255, 0.8);
    font-size: 14px;
    margin: 0;
}

.sequencia-dns h4 {
    color: #E91E63;
    text-align: center;
    margin-bottom: 15px;
}

.sequencia-slots {
    display: flex;
    justify-content: center;
    gap: 15px;
    margin-bottom: 30px;
}

.slot-dns {
    background: rgba(128, 128, 128, 0.2);
    border: 2px dashed rgba(128, 128, 128, 0.5);
    border-radius: 8px;
    padding: 15px;
    min-width: 80px;
    text-align: center;
    color: rgba(255, 255, 255, 0.6);
    font-weight: bold;
}

.slot-dns.preenchido {
    background: rgba(77, 208, 225, 0.2);
    border-color: #4DD0E1;
    color: #fff;
}

.slot-dns.correto {
    background: rgba(76, 175, 80, 0.2);
    border-color: #4CAF50;
    color: #4CAF50;
}

.slot-dns.incorreto {
    background: rgba(244, 67, 54, 0.2);
    border-color: #f44336;
    color: #f44336;
}

/* === DESAFIO 3: EMAIL === */
.email-cenario {
    background: rgba(233, 30, 99, 0.1);
    padding: 20px;
    border-radius: 10px;
    text-align: center;
    margin-bottom: 30px;
    border: 2px solid rgba(233, 30, 99, 0.3);
}

.email-cenario h3 {
    color: #E91E63;
    font-size: 18px;
}

.email-fluxo {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 20px;
    margin-bottom: 30px;
}

.participante,
.servidor {
    background: rgba(255, 255, 255, 0.05);
    border: 2px solid rgba(233, 30, 99, 0.3);
    border-radius: 10px;
    padding: 20px;
    text-align: center;
}

.participante.remetente {
    border-color: rgba(76, 175, 80, 0.5);
}

.participante.destinatario {
    border-color: rgba(33, 150, 243, 0.5);
}

.servidor.intermediario {
    border-color: rgba(255, 152, 0, 0.5);
}

.participante h4,
.servidor h4 {
    color: #E91E63;
    margin-bottom: 8px;
}

.participante p,
.servidor p {
    color: rgba(255, 255, 255, 0.8);
    font-family: monospace;
    margin-bottom: 15px;
}

.protocolo-usado {
    margin-top: 15px;
}

.protocolo-select {
    width: 100%;
    padding: 8px;
    border: 1px solid rgba(233, 30, 99, 0.3);
    border-radius: 5px;
    background: rgba(0, 0, 0, 0.3);
    color: #fff;
    font-size: 14px;
}

.email-info {
    background: rgba(255, 152, 0, 0.1);
    padding: 20px;
    border-radius: 10px;
    margin-bottom: 30px;
    border-left: 4px solid #FF9800;
}

.email-info h4 {
    color: #FF9800;
    margin-bottom: 10px;
}

.email-info ul {
    color: rgba(255, 255, 255, 0.9);
    line-height: 1.6;
}

.email-info li {
    margin-bottom: 5px;
}

/* === CONCLUSÃO FINAL === */
.conquista-final {
    background: linear-gradient(135deg, #E91E63, #AD1457);
    padding: 30px;
    border-radius: 15px;
    text-align: center;
    margin-bottom: 30px;
    animation: conquistaBrilho 2s ease-in-out infinite;
}

@keyframes conquistaBrilho {
    0%, 100% { box-shadow: 0 0 30px rgba(233, 30, 99, 0.5); }
    50% { box-shadow: 0 0 50px rgba(233, 30, 99, 0.8); }
}

.conquista-final h3 {
    color: #fff;
    font-size: 24px;
    margin-bottom: 20px;
}

.camadas-dominadas {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 10px;
}

.camada-item {
    background: rgba(255, 255, 255, 0.2);
    padding: 10px;
    border-radius: 8px;
    color: #fff;
    font-weight: bold;
}

@keyframes celebracao {
    0%, 100% { transform: scale(1) rotate(0deg); }
    25% { transform: scale(1.2) rotate(-5deg); }
    50% { transform: scale(1.3) rotate(0deg); }
    75% { transform: scale(1.2) rotate(5deg); }
}

.btn-verificar {
    display: block;
    margin: 20px auto;
    padding: 15px 30px;
    background: linear-gradient(135deg, #E91E63, #AD1457);
    color: #fff;
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
    background: linear-gradient(135deg, #AD1457, #E91E63);
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
styleSheet.textContent = fase5Styles;
document.head.appendChild(styleSheet);

// Inicializa quando a página carrega
document.addEventListener('DOMContentLoaded', function() {
    window.fase5Manager = new Fase5Manager();
    
    // Sincroniza com sistema global
    if (typeof sincronizarGlobais === 'function') {
        sincronizarGlobais();
    }
});
