// fase3.js - Lógica da Fase 3: Camada de Rede

class Fase3Manager {
    constructor() {
        this.desafioAtual = 0;
        this.progressoTotal = 4; // Introdução + 3 desafios
        this.progressoAtual = 0;
        this.classificacoesIP = {};
        this.rotasConfiguracao = {};
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
        window.abrirClassificacao = (elemento) => this.abrirClassificacao(elemento);
        window.verificarIPs = () => this.verificarIPs();
        window.verificarRoteamento = () => this.verificarRoteamento();
        window.verificarSubnetting = () => this.verificarSubnetting();
        window.voltarTrilha = () => this.voltarTrilha();

        // Eventos para inputs de subnetting
        setTimeout(() => {
            const inputs = document.querySelectorAll('#secao-desafio3 input');
            inputs.forEach(input => {
                input.addEventListener('input', () => {
                    this.verificarInputsCompletos();
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

    // === DESAFIO 1: CLASSIFICAÇÃO DE IPs ===
    abrirClassificacao(elemento) {
        const select = elemento.querySelector('.classe-select');
        select.style.display = 'block';
        
        select.addEventListener('change', () => {
            const ip = elemento.querySelector('.ip-text').textContent;
            this.classificacoesIP[ip] = select.value;
            this.verificarClassificacoesCompletas();
        });
    }

    verificarClassificacoesCompletas() {
        const btnVerificar = document.querySelector('#secao-desafio1 .btn-verificar');
        const totalIPs = document.querySelectorAll('.ip-item').length;
        
        if (btnVerificar) {
            btnVerificar.disabled = Object.keys(this.classificacoesIP).length < totalIPs;
        }
    }

    verificarIPs() {
        const ipItems = document.querySelectorAll('.ip-item');
        let acertos = 0;
        let total = 0;

        // Respostas corretas baseadas na classificação real dos IPs
        const respostasCorretas = {
            '10.0.0.1': 'Privado',           // Privado Classe A
            '172.16.10.5': 'Privado',        // Privado Classe B  
            '192.168.1.100': 'Privado',      // Privado Classe C
            '100.64.0.1': 'A',               // Classe A público
            '256.100.50.25': 'Inválido',     // Inválido (256 > 255)
            '130.50.100.200': 'B'            // Classe B público
        };

        ipItems.forEach(item => {
            const ip = item.querySelector('.ip-text').textContent;
            const classeCorreta = respostasCorretas[ip];
            const classeEscolhida = this.classificacoesIP[ip];
            const select = item.querySelector('.classe-select');
            
            total++;

            if (classeEscolhida === classeCorreta) {
                acertos++;
                select.style.backgroundColor = '#4CAF50';
                select.style.color = '#fff';
            } else {
                select.style.backgroundColor = '#f44336';
                select.style.color = '#fff';
            }
        });

        const feedback = document.getElementById('feedback-desafio1');
        if (acertos === total) {
            feedback.textContent = 'Perfeito! Você classificou todos os endereços IP corretamente!';
            feedback.className = 'desafio-feedback sucesso';
            this.desafiosConcluidos.push(1);
            
            setTimeout(() => {
                this.iniciarDesafio(2);
            }, 2000);
        } else {
            feedback.textContent = `Você acertou ${acertos} de ${total}. Lembre-se: IPs privados (10.x.x.x, 172.16-31.x.x, 192.168.x.x) são diferentes das classes públicas!`;
            feedback.className = 'desafio-feedback erro';
        }
        feedback.style.display = 'block';
    }

    // === DESAFIO 2: ROTEAMENTO ===
    configurarEventosRoteamento() {
        setTimeout(() => {
            const selects = document.querySelectorAll('.rota-select');
            selects.forEach(select => {
                select.addEventListener('change', () => {
                    const destino = select.dataset.destino;
                    this.rotasConfiguracao[destino] = select.value;
                    this.verificarRotasCompletas();
                });
            });
        }, 100);
    }

    verificarRotasCompletas() {
        const btnVerificar = document.querySelector('#secao-desafio2 .btn-verificar');
        const totalRotas = document.querySelectorAll('.rota-select').length;
        
        if (btnVerificar) {
            btnVerificar.disabled = Object.keys(this.rotasConfiguracao).length < totalRotas;
        }
    }

    verificarRoteamento() {
        const rotasCorretas = {
            '192.168.1.0': '0.0.0.0',      // Rede diretamente conectada
            '192.168.2.0': '0.0.0.0',      // Rede diretamente conectada
            '192.168.3.0': '192.168.2.1'   // Via router R2
        };

        const selects = document.querySelectorAll('.rota-select');
        let acertos = 0;
        let total = 0;

        selects.forEach(select => {
            const destino = select.dataset.destino;
            const rotaCorreta = rotasCorretas[destino];
            const rotaEscolhida = select.value;
            
            total++;

            if (rotaEscolhida === rotaCorreta) {
                acertos++;
                select.style.backgroundColor = '#4CAF50';
                select.style.color = '#fff';
            } else {
                select.style.backgroundColor = '#f44336';
                select.style.color = '#fff';
            }
        });

        const feedback = document.getElementById('feedback-desafio2');
        if (acertos === total) {
            feedback.textContent = 'Excelente! Você configurou a tabela de roteamento corretamente!';
            feedback.className = 'desafio-feedback sucesso';
            this.desafiosConcluidos.push(2);
            
            setTimeout(() => {
                this.iniciarDesafio(3);
            }, 2000);
        } else {
            feedback.textContent = `Você acertou ${acertos} de ${total} rotas. Lembre-se: redes diretamente conectadas usam 0.0.0.0 como gateway!`;
            feedback.className = 'desafio-feedback erro';
        }
        feedback.style.display = 'block';
    }

    // === DESAFIO 3: SUBNETTING ===
    verificarInputsCompletos() {
        const inputs = document.querySelectorAll('#secao-desafio3 input');
        let preenchidos = 0;
        
        inputs.forEach(input => {
            if (input.value.trim() !== '') {
                preenchidos++;
            }
        });
        
        const btnVerificar = document.querySelector('#secao-desafio3 .btn-verificar');
        if (btnVerificar) {
            btnVerificar.disabled = preenchidos < inputs.length;
        }
    }

    verificarSubnetting() {
        // Para 192.168.10.150/26:
        // Rede: 192.168.10.128 (150 & 255.255.255.192)
        // Primeiro: 192.168.10.129
        // Último: 192.168.10.190  
        // Broadcast: 192.168.10.191
        // Máscara: 255.255.255.192
        // Hosts: 62 (64 - 2)

        const respostasCorretas = {
            'endereco-rede': '192.168.10.128',
            'primeiro-ip': '192.168.10.129',
            'ultimo-ip': '192.168.10.190',
            'endereco-broadcast': '192.168.10.191',
            'mascara-subnet': '255.255.255.192',
            'quantidade-hosts': '62'
        };

        const inputs = document.querySelectorAll('#secao-desafio3 input');
        let acertos = 0;
        let total = 0;

        inputs.forEach(input => {
            const id = input.id;
            const valorCorreto = respostasCorretas[id];
            const valorDigitado = input.value.trim();
            
            total++;

            if (valorDigitado === valorCorreto) {
                acertos++;
                input.style.backgroundColor = '#4CAF50';
                input.style.color = '#fff';
            } else {
                input.style.backgroundColor = '#f44336';
                input.style.color = '#fff';
                // Mostra a resposta correta como placeholder
                input.placeholder = `Correto: ${valorCorreto}`;
            }
        });

        const feedback = document.getElementById('feedback-desafio3');
        if (acertos === total) {
            feedback.textContent = 'Perfeito! Você calculou o subnetting corretamente!';
            feedback.className = 'desafio-feedback sucesso';
            this.desafiosConcluidos.push(3);
            
            setTimeout(() => {
                this.concluirFase();
            }, 2000);
        } else {
            feedback.textContent = `Você acertou ${acertos} de ${total} cálculos. Para /26: 64 endereços - 2 = 62 hosts válidos.`;
            feedback.className = 'desafio-feedback erro';
        }
        feedback.style.display = 'block';
    }

    concluirFase() {
        // Adiciona pontos
        const pontosAtuais = parseInt(localStorage.getItem('gamePoints') || '2450');
        const novosPontos = pontosAtuais + 250;
        localStorage.setItem('gamePoints', novosPontos.toString());

        // Marca fase como concluída
        const progressoTrilha = JSON.parse(localStorage.getItem('trilhaProgresso') || '{}');
        progressoTrilha[3] = {
            concluida: true,
            desbloqueada: true
        };
        progressoTrilha[4] = {
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

// Adiciona CSS específico para Fase 3
const fase3Styles = `
.rede-animada {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 20px;
    padding: 30px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 15px;
    animation: redeFluxo 3s ease-in-out infinite;
}

@keyframes redeFluxo {
    0%, 100% { box-shadow: 0 0 20px rgba(77, 208, 225, 0.3); }
    50% { box-shadow: 0 0 40px rgba(77, 208, 225, 0.6); }
}

.dispositivo {
    background: linear-gradient(135deg, #4DD0E1, #26A69A);
    color: #000;
    padding: 20px;
    border-radius: 10px;
    text-align: center;
    font-weight: bold;
    min-width: 120px;
    animation: dispositivoPulso 2s ease-in-out infinite;
}

.dispositivo.router {
    background: linear-gradient(135deg, #E1EA2D, #C0C025);
}

@keyframes dispositivoPulso {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
}

.conexao {
    width: 50px;
    height: 3px;
    background: linear-gradient(90deg, #4DD0E1, #E1EA2D);
    animation: dadosFluxo 1.5s linear infinite;
}

@keyframes dadosFluxo {
    0% { background-position: 0% 50%; }
    100% { background-position: 100% 50%; }
}

/* === DESAFIO 1: IPs === */
.ip-addresses {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 20px;
    margin-bottom: 30px;
}

.ip-item {
    background: rgba(255, 255, 255, 0.05);
    border: 2px solid rgba(77, 208, 225, 0.3);
    border-radius: 10px;
    padding: 20px;
    cursor: pointer;
    transition: all 0.3s ease;
}

.ip-item:hover {
    border-color: rgba(77, 208, 225, 0.5);
    transform: translateY(-2px);
}

.ip-text {
    color: #fff;
    font-family: monospace;
    font-size: 18px;
    font-weight: bold;
    display: block;
    margin-bottom: 15px;
}

.ip-classificacao {
    margin-top: 10px;
}

.classe-select {
    width: 100%;
    padding: 8px;
    border: 1px solid rgba(77, 208, 225, 0.3);
    border-radius: 5px;
    background: rgba(0, 0, 0, 0.3);
    color: #fff;
    font-size: 14px;
}

/* === DESAFIO 2: ROTEAMENTO === */
.topologia-rede {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 30px;
    margin-bottom: 30px;
    padding: 30px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 15px;
    flex-wrap: wrap;
}

.rede {
    background: linear-gradient(135deg, #FF6B6B, #FF5722);
    color: #fff;
    padding: 20px;
    border-radius: 10px;
    text-align: center;
    font-weight: bold;
    min-width: 150px;
}

.router {
    background: linear-gradient(135deg, #E1EA2D, #C0C025);
    color: #000;
    padding: 20px;
    border-radius: 10px;
    text-align: center;
    font-weight: bold;
    min-width: 120px;
}

.tabela-roteamento {
    background: rgba(0, 0, 0, 0.2);
    padding: 20px;
    border-radius: 10px;
    margin-bottom: 30px;
}

.tabela-roteamento h3 {
    color: #E1EA2D;
    margin-bottom: 15px;
}

.tabela-roteamento table {
    width: 100%;
    border-collapse: collapse;
    color: #fff;
}

.tabela-roteamento th,
.tabela-roteamento td {
    padding: 12px;
    text-align: left;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.tabela-roteamento th {
    background: rgba(77, 208, 225, 0.2);
    color: #4DD0E1;
    font-weight: bold;
}

.rota-select {
    width: 100%;
    padding: 5px;
    border: 1px solid rgba(77, 208, 225, 0.3);
    border-radius: 3px;
    background: rgba(0, 0, 0, 0.3);
    color: #fff;
}

/* === DESAFIO 3: SUBNETTING === */
.subnet-problema {
    background: rgba(225, 234, 45, 0.1);
    padding: 30px;
    border-radius: 10px;
    text-align: center;
    margin-bottom: 30px;
    border: 2px solid rgba(225, 234, 45, 0.3);
}

.ip-dado h3 {
    color: #E1EA2D;
    font-size: 24px;
    font-family: monospace;
}

.subnet-calculos {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 20px;
    margin-bottom: 30px;
}

.calculo-item {
    background: rgba(255, 255, 255, 0.05);
    padding: 20px;
    border-radius: 10px;
    border: 2px solid rgba(77, 208, 225, 0.3);
}

.calculo-item label {
    display: block;
    color: #4DD0E1;
    font-weight: bold;
    margin-bottom: 10px;
}

.calculo-item input {
    width: 100%;
    padding: 10px;
    border: 1px solid rgba(77, 208, 225, 0.3);
    border-radius: 5px;
    background: rgba(0, 0, 0, 0.3);
    color: #fff;
    font-family: monospace;
    font-size: 16px;
}

.calculo-item input:focus {
    border-color: #4DD0E1;
    outline: none;
    box-shadow: 0 0 10px rgba(77, 208, 225, 0.3);
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
`;

// Adiciona os estilos à página
const styleSheet = document.createElement('style');
styleSheet.textContent = fase3Styles;
document.head.appendChild(styleSheet);

// Inicializa quando a página carrega
document.addEventListener('DOMContentLoaded', function() {
    window.fase3Manager = new Fase3Manager();
    
    // Configura eventos específicos do roteamento
    window.fase3Manager.configurarEventosRoteamento();
    
    // Sincroniza com sistema global
    if (typeof sincronizarGlobais === 'function') {
        sincronizarGlobais();
    }
});
