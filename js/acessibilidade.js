/**
 * Sistema de Acessibilidade - CamadasGame
 * Funcionalidades para tornar o jogo acessível para todos os usuários
 */

class SistemaAcessibilidade {
    constructor() {
        this.altoContraste = localStorage.getItem('altoContraste') === 'true';
        this.tamanhoFonte = localStorage.getItem('tamanhoFonte') || 'normal';
        this.leitorTelaAtivo = this.detectarLeitorTela();
        this.focusVisible = true;
        
        this.init();
    }

    init() {
        this.aplicarConfiguracoes();
        this.configurarNavegacaoTeclado();
        this.configurarAtalhosTeclado();
        this.configurarAnunciosStatus();
        this.adicionarBotaoAcessibilidade();
    }

    // Detecta se um leitor de tela está ativo
    detectarLeitorTela() {
        return window.navigator.userAgent.includes('NVDA') || 
               window.navigator.userAgent.includes('JAWS') || 
               window.speechSynthesis !== undefined;
    }

    // Aplica configurações salvas
    aplicarConfiguracoes() {
        if (this.altoContraste) {
            document.body.classList.add('alto-contraste');
        }
        
        document.body.classList.add(`fonte-${this.tamanhoFonte}`);
        
        // Aplicar focus visible
        if (this.focusVisible) {
            document.body.classList.add('focus-visible');
        }
    }

    // Configura navegação por teclado
    configurarNavegacaoTeclado() {
        // Adiciona tabindex para elementos interativos que não têm
        const elementosInterativos = document.querySelectorAll('button, a, input, select, [onclick], .cabo-item, .velocidade-item, .fase-node');
        
        elementosInterativos.forEach((el, index) => {
            if (!el.hasAttribute('tabindex')) {
                el.setAttribute('tabindex', '0');
            }
            
            // Adiciona eventos de teclado para elementos com onclick
            if (el.hasAttribute('onclick') && !el.tagName.match(/^(BUTTON|A|INPUT)$/)) {
                el.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        el.click();
                    }
                });
            }
        });

        // Navegação com setas em grids/listas
        this.configurarNavegacaoSetas();
    }

    // Configura navegação com setas
    configurarNavegacaoSetas() {
        const grids = document.querySelectorAll('.cabos-container, .tipos-container, .velocidades-container, .slots-ordenacao');
        
        grids.forEach(grid => {
            const itens = grid.querySelectorAll('[tabindex]');
            
            grid.addEventListener('keydown', (e) => {
                const atual = document.activeElement;
                const indiceAtual = Array.from(itens).indexOf(atual);
                let novoIndice = -1;

                switch(e.key) {
                    case 'ArrowRight':
                    case 'ArrowDown':
                        novoIndice = (indiceAtual + 1) % itens.length;
                        break;
                    case 'ArrowLeft':
                    case 'ArrowUp':
                        novoIndice = indiceAtual > 0 ? indiceAtual - 1 : itens.length - 1;
                        break;
                    case 'Home':
                        novoIndice = 0;
                        break;
                    case 'End':
                        novoIndice = itens.length - 1;
                        break;
                }

                if (novoIndice !== -1) {
                    e.preventDefault();
                    itens[novoIndice].focus();
                }
            });
        });
    }

    // Configura atalhos de teclado globais
    configurarAtalhosTeclado() {
        document.addEventListener('keydown', (e) => {
            // Alt + C = Toggle alto contraste
            if (e.altKey && e.key === 'c') {
                e.preventDefault();
                this.toggleAltoContraste();
            }
            
            // Alt + + = Aumentar fonte
            if (e.altKey && e.key === '=') {
                e.preventDefault();
                this.aumentarFonte();
            }
            
            // Alt + - = Diminuir fonte
            if (e.altKey && e.key === '-') {
                e.preventDefault();
                this.diminuirFonte();
            }
            
            // Alt + H = Ajuda de acessibilidade
            if (e.altKey && e.key === 'h') {
                e.preventDefault();
                this.mostrarAjudaAcessibilidade();
            }

            // Esc = Fechar modais/overlays
            if (e.key === 'Escape') {
                this.fecharModais();
            }
        });
    }

    // Configura anúncios para leitores de tela
    configurarAnunciosStatus() {
        // Cria região live para anúncios
        if (!document.getElementById('aria-live-region')) {
            const liveRegion = document.createElement('div');
            liveRegion.id = 'aria-live-region';
            liveRegion.setAttribute('aria-live', 'polite');
            liveRegion.setAttribute('aria-atomic', 'true');
            liveRegion.className = 'sr-only';
            document.body.appendChild(liveRegion);
        }
    }

    // Anuncia mensagem para leitores de tela
    anunciar(mensagem, urgente = false) {
        const liveRegion = document.getElementById('aria-live-region');
        if (liveRegion) {
            liveRegion.setAttribute('aria-live', urgente ? 'assertive' : 'polite');
            liveRegion.textContent = mensagem;
            
            // Limpa após anunciar
            setTimeout(() => {
                liveRegion.textContent = '';
            }, 1000);
        }
    }

    // Toggle alto contraste
    toggleAltoContraste() {
        this.altoContraste = !this.altoContraste;
        document.body.classList.toggle('alto-contraste', this.altoContraste);
        localStorage.setItem('altoContraste', this.altoContraste);
        
        this.anunciar(this.altoContraste ? 'Alto contraste ativado' : 'Alto contraste desativado');
    }

    // Aumenta tamanho da fonte
    aumentarFonte() {
        const tamanhos = ['pequena', 'normal', 'grande', 'extra-grande'];
        const indiceAtual = tamanhos.indexOf(this.tamanhoFonte);
        
        if (indiceAtual < tamanhos.length - 1) {
            document.body.classList.remove(`fonte-${this.tamanhoFonte}`);
            this.tamanhoFonte = tamanhos[indiceAtual + 1];
            document.body.classList.add(`fonte-${this.tamanhoFonte}`);
            localStorage.setItem('tamanhoFonte', this.tamanhoFonte);
            
            this.anunciar(`Fonte ${this.tamanhoFonte}`);
        }
    }

    // Diminui tamanho da fonte
    diminuirFonte() {
        const tamanhos = ['pequena', 'normal', 'grande', 'extra-grande'];
        const indiceAtual = tamanhos.indexOf(this.tamanhoFonte);
        
        if (indiceAtual > 0) {
            document.body.classList.remove(`fonte-${this.tamanhoFonte}`);
            this.tamanhoFonte = tamanhos[indiceAtual - 1];
            document.body.classList.add(`fonte-${this.tamanhoFonte}`);
            localStorage.setItem('tamanhoFonte', this.tamanhoFonte);
            
            this.anunciar(`Fonte ${this.tamanhoFonte}`);
        }
    }

    // Mostra ajuda de acessibilidade
    mostrarAjudaAcessibilidade() {
        const ajudaModal = document.createElement('div');
        ajudaModal.className = 'modal-acessibilidade';
        ajudaModal.innerHTML = `
            <div class="modal-content" role="dialog" aria-labelledby="ajuda-titulo" aria-describedby="ajuda-descricao">
                <h2 id="ajuda-titulo">Ajuda de Acessibilidade</h2>
                <div id="ajuda-descricao">
                    <h3>Atalhos de Teclado:</h3>
                    <ul>
                        <li><kbd>Tab</kbd> - Navegar entre elementos</li>
                        <li><kbd>Setas</kbd> - Navegar em listas e grids</li>
                        <li><kbd>Enter/Espaço</kbd> - Ativar botões</li>
                        <li><kbd>Alt + C</kbd> - Toggle alto contraste</li>
                        <li><kbd>Alt + +</kbd> - Aumentar fonte</li>
                        <li><kbd>Alt + -</kbd> - Diminuir fonte</li>
                        <li><kbd>Alt + H</kbd> - Esta ajuda</li>
                        <li><kbd>Esc</kbd> - Fechar modais</li>
                    </ul>
                    
                    <h3>Navegação:</h3>
                    <p>Use Tab para navegar entre botões e links. Use as setas do teclado para navegar entre itens em exercícios.</p>
                </div>
                <button type="button" onclick="this.parentElement.parentElement.remove()">Fechar</button>
            </div>
        `;
        
        document.body.appendChild(ajudaModal);
        ajudaModal.querySelector('button').focus();
    }

    // Fecha modais com Escape
    fecharModais() {
        const modais = document.querySelectorAll('.modal-acessibilidade');
        modais.forEach(modal => modal.remove());
    }

    // Adiciona botão de acessibilidade
    adicionarBotaoAcessibilidade() {
        const botaoAcess = document.createElement('button');
        botaoAcess.className = 'btn-acessibilidade';
        botaoAcess.setAttribute('aria-label', 'Opções de Acessibilidade');
        botaoAcess.innerHTML = `
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 5.5V6L16.5 6.5L15 7.5C14.5 8 14 8.5 13.5 9L11.5 11L10.5 10L11 9C11.5 8.5 12 8 12.5 7.5L14 6.5V5L9 6.5V8.5L12 10L12 22H14L14 16L16 18V22H18V16.5L15.5 14L17 11.5C17.5 11 18 10.5 18.5 10L20 9L21 9Z" stroke="currentColor" stroke-width="1" fill="currentColor"/>
            </svg>
        `;
        
        botaoAcess.onclick = () => this.mostrarMenuAcessibilidade();
        
        document.body.appendChild(botaoAcess);
    }

    // Mostra menu de acessibilidade
    mostrarMenuAcessibilidade() {
        const menuModal = document.createElement('div');
        menuModal.className = 'modal-acessibilidade';
        menuModal.innerHTML = `
            <div class="modal-content" role="dialog" aria-labelledby="menu-titulo">
                <h2 id="menu-titulo">Opções de Acessibilidade</h2>
                
                <div class="opcoes-acess">
                    <label class="opcao-item">
                        <input type="checkbox" ${this.altoContraste ? 'checked' : ''} onchange="sistemaAcessibilidade.toggleAltoContraste()">
                        Alto Contraste
                    </label>
                    
                    <div class="opcao-item">
                        <label>Tamanho da Fonte:</label>
                        <select onchange="sistemaAcessibilidade.alterarTamanhoFonte(this.value)">
                            <option value="pequena" ${this.tamanhoFonte === 'pequena' ? 'selected' : ''}>Pequena</option>
                            <option value="normal" ${this.tamanhoFonte === 'normal' ? 'selected' : ''}>Normal</option>
                            <option value="grande" ${this.tamanhoFonte === 'grande' ? 'selected' : ''}>Grande</option>
                            <option value="extra-grande" ${this.tamanhoFonte === 'extra-grande' ? 'selected' : ''}>Extra Grande</option>
                        </select>
                    </div>
                    
                    <button type="button" onclick="sistemaAcessibilidade.mostrarAjudaAcessibilidade(); this.parentElement.parentElement.parentElement.remove();">
                        Ver Atalhos de Teclado
                    </button>
                </div>
                
                <button type="button" onclick="this.parentElement.parentElement.remove()">Fechar</button>
            </div>
        `;
        
        document.body.appendChild(menuModal);
        menuModal.querySelector('input').focus();
    }

    // Altera tamanho da fonte via select
    alterarTamanhoFonte(novoTamanho) {
        document.body.classList.remove(`fonte-${this.tamanhoFonte}`);
        this.tamanhoFonte = novoTamanho;
        document.body.classList.add(`fonte-${this.tamanhoFonte}`);
        localStorage.setItem('tamanhoFonte', this.tamanhoFonte);
        
        this.anunciar(`Fonte alterada para ${this.tamanhoFonte}`);
    }
}

// Inicializar sistema de acessibilidade
let sistemaAcessibilidade;
document.addEventListener('DOMContentLoaded', () => {
    sistemaAcessibilidade = new SistemaAcessibilidade();
});

// Funções globais para usar nos HTMLs
function anunciarParaLeitorTela(mensagem, urgente = false) {
    if (window.sistemaAcessibilidade) {
        sistemaAcessibilidade.anunciar(mensagem, urgente);
    }
}