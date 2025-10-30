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
            <div class="modal-content modal-ajuda" role="dialog" aria-labelledby="ajuda-titulo" aria-describedby="ajuda-descricao">
                <button class="btn-fechar" onclick="this.parentElement.parentElement.remove()" aria-label="Fechar ajuda">×</button>
                <div class="ajuda-header">
                    <div class="ajuda-icon">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                            <path d="M20 5H4C2.9 5 2 5.9 2 7V17C2 18.1 2.9 19 4 19H20C21.1 19 22 18.1 22 17V7C22 5.9 21.1 5 20 5ZM20 17H4V7H20V17Z" fill="currentColor"/>
                            <rect x="6" y="9" width="2" height="6" fill="currentColor"/>
                            <rect x="11" y="9" width="2" height="6" fill="currentColor"/>
                            <rect x="16" y="9" width="2" height="6" fill="currentColor"/>
                        </svg>
                    </div>
                    <div>
                        <h2 id="ajuda-titulo">Atalhos de Teclado</h2>
                        <p class="ajuda-subtitulo">Navegue mais rápido com estes comandos</p>
                    </div>
                </div>
                
                <div id="ajuda-descricao" class="ajuda-content">
                    <div class="atalhos-grid">
                        <div class="atalho-card">
                            <div class="atalho-icon">⌨️</div>
                            <div class="atalho-info">
                                <div class="atalho-keys">
                                    <kbd>Tab</kbd>
                                </div>
                                <p class="atalho-desc">Navegar entre elementos interativos</p>
                            </div>
                        </div>
                        
                        <div class="atalho-card">
                            <div class="atalho-icon">⬆️</div>
                            <div class="atalho-info">
                                <div class="atalho-keys">
                                    <kbd>↑</kbd> <kbd>↓</kbd> <kbd>←</kbd> <kbd>→</kbd>
                                </div>
                                <p class="atalho-desc">Navegar em listas e grids</p>
                            </div>
                        </div>
                        
                        <div class="atalho-card">
                            <div class="atalho-icon">✅</div>
                            <div class="atalho-info">
                                <div class="atalho-keys">
                                    <kbd>Enter</kbd> <span class="ou">ou</span> <kbd>Espaço</kbd>
                                </div>
                                <p class="atalho-desc">Ativar botões e confirmar ações</p>
                            </div>
                        </div>
                        
                        <div class="atalho-card">
                            <div class="atalho-icon">🎨</div>
                            <div class="atalho-info">
                                <div class="atalho-keys">
                                    <kbd>Alt</kbd> + <kbd>C</kbd>
                                </div>
                                <p class="atalho-desc">Alternar modo alto contraste</p>
                            </div>
                        </div>
                        
                        <div class="atalho-card">
                            <div class="atalho-icon">🔍</div>
                            <div class="atalho-info">
                                <div class="atalho-keys">
                                    <kbd>Alt</kbd> + <kbd>+</kbd>
                                </div>
                                <p class="atalho-desc">Aumentar tamanho da fonte</p>
                            </div>
                        </div>
                        
                        <div class="atalho-card">
                            <div class="atalho-icon">🔎</div>
                            <div class="atalho-info">
                                <div class="atalho-keys">
                                    <kbd>Alt</kbd> + <kbd>-</kbd>
                                </div>
                                <p class="atalho-desc">Diminuir tamanho da fonte</p>
                            </div>
                        </div>
                        
                        <div class="atalho-card">
                            <div class="atalho-icon">❓</div>
                            <div class="atalho-info">
                                <div class="atalho-keys">
                                    <kbd>Alt</kbd> + <kbd>H</kbd>
                                </div>
                                <p class="atalho-desc">Abrir esta ajuda</p>
                            </div>
                        </div>
                        
                        <div class="atalho-card">
                            <div class="atalho-icon">❌</div>
                            <div class="atalho-info">
                                <div class="atalho-keys">
                                    <kbd>Esc</kbd>
                                </div>
                                <p class="atalho-desc">Fechar modais e diálogos</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="ajuda-dica">
                        <div class="dica-icon">💡</div>
                        <div class="dica-texto">
                            <strong>Dica:</strong> Use <kbd>Tab</kbd> para navegar e as setas do teclado para mover-se entre itens em exercícios de arrastar e soltar.
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(ajudaModal);
        ajudaModal.querySelector('.btn-fechar').focus();
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
                <button class="btn-fechar" onclick="this.parentElement.parentElement.remove()" aria-label="Fechar menu de acessibilidade">×</button>
                <h2 id="menu-titulo">Opções de Acessibilidade</h2>
                
                <div class="opcoes-acess">
                    <button type="button" class="btn-ver-atalhos" onclick="sistemaAcessibilidade.mostrarAjudaAcessibilidade(); this.parentElement.parentElement.parentElement.remove();">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                            <path d="M20 5H4C2.9 5 2 5.9 2 7V17C2 18.1 2.9 19 4 19H20C21.1 19 22 18.1 22 17V7C22 5.9 21.1 5 20 5ZM20 17H4V7H20V17ZM7 9H9V15H7V9ZM11 9H13V15H11V9ZM15 9H17V15H15V9Z" fill="currentColor"/>
                        </svg>
                        <div class="btn-texto">
                            <span class="btn-titulo">Ver Atalhos de Teclado</span>
                            <span class="btn-descricao">Aprenda todos os comandos disponíveis</span>
                        </div>
                        <svg class="btn-seta" width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                            <path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(menuModal);
        menuModal.querySelector('.btn-ver-atalhos').focus();
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