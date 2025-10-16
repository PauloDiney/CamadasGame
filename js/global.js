// Inicialização robusta do localStorage para evitar bugs de estado
function inicializarLocalStorageLoja() {
    if (!localStorage.getItem('gamePoints')) localStorage.setItem('gamePoints', '2450');
    if (!localStorage.getItem('purchasedItems')) localStorage.setItem('purchasedItems', '[]');
    if (!localStorage.getItem('equippedItems')) localStorage.setItem('equippedItems', '[]');
}

// Função para desequipar item (definida no topo para evitar erros de escopo)
function desequiparItem(itemId) {
    let equippedItems = JSON.parse(localStorage.getItem('equippedItems') || '[]');
    equippedItems = equippedItems.filter(item => item.id !== itemId);
    localStorage.setItem('equippedItems', JSON.stringify(equippedItems));
    mostrarMensagemLoja('Equipamento removido!', 'info');
    sincronizarGlobais();
    if (typeof atualizarBotoesLoja === 'function') atualizarBotoesLoja();
}

function mostrarMensagemLoja(texto, tipo = 'info') {
    let container = document.getElementById('message-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'message-container';
        document.body.appendChild(container);
    }
    const mensagem = document.createElement('div');
    mensagem.className = `message ${tipo}`;
    mensagem.textContent = texto;
    container.appendChild(mensagem);
    setTimeout(() => mensagem.remove(), 2500);
}

// global.js - Centraliza exibição de pontos e equipamentos em todas as telas

function atualizarPontos() {
    const pontos = parseInt(localStorage.getItem('gamePoints') || '2450');
    const pontosDisplay = document.getElementById('pontos-display');
    if (pontosDisplay) {
        pontosDisplay.textContent = `${pontos} Pontos`;
    }
}

function getCategoryDisplayName(category) {
    const categories = {
        'velocidade': 'Velocidade',
        'precisao': 'Precisão',
        'bonus': 'Bônus',
        'especiais': 'Especiais'
    };
    return categories[category] || 'Geral';
}

function atualizarEquipamentos() {
    // Só mostra equipamentos no menu inicial e loja
    const path = window.location.pathname;
    if (!path.endsWith('index.html') && !path.endsWith('loja.html')) return;
    const container = document.getElementById('equipamentos-container');
    if (!container) return;
    const items = JSON.parse(localStorage.getItem('equippedItems') || '[]');
    if (items.length === 0) {
        container.innerHTML = `
            <div class="no-equipment">
                <p>Nenhum equipamento ativo</p>
                <p class="suggestion">Visite a <a href="loja.html">Loja</a> para comprar equipamentos!</p>
            </div>
        `;
    } else {
        // Se for na loja, mostra botão de desequipar
        if (path.endsWith('loja.html')) {
            container.innerHTML = items.map(item => `
                <article class="equipamento active-equipment">
                    <div class="equipment-header">
                        <h4>${item.name}</h4>
                        <span class="equipment-category">${getCategoryDisplayName(item.category)}</span>
                    </div>
                    <p>${item.description}</p>
                    <div class="equipment-footer">
                        <span class="equipment-price">${item.price} Pontos</span>
                        <span class="equipment-status">✓ Ativo</span>
                        <button class="desequipar-btn" data-item-id="${item.id}" title="Desequipar">✖</button>
                    </div>
                </article>
            `).join('');
            // Adiciona evento aos botões de desequipar
            container.querySelectorAll('.desequipar-btn').forEach(btn => {
                btn.addEventListener('click', function() {
                    const itemId = btn.getAttribute('data-item-id');
                    desequiparItem(itemId);
                });
            });
        } else {
            // Menu inicial: só mostra
            container.innerHTML = items.map(item => `
                <article class="equipamento active-equipment">
                    <div class="equipment-header">
                        <h4>${item.name}</h4>
                        <span class="equipment-category">${getCategoryDisplayName(item.category)}</span>
                    </div>
                    <p>${item.description}</p>
                    <div class="equipment-footer">
                        <span class="equipment-price">${item.price} Pontos</span>
                        <span class="equipment-status">✓ Ativo</span>
                    </div>
                </article>
            `).join('');
        }
    }
}

function sincronizarGlobais() {
    atualizarPontos();
    atualizarEquipamentos();
}

// Atualiza ao carregar a página
window.addEventListener('DOMContentLoaded', function() {
    inicializarLocalStorageLoja();
    sincronizarGlobais();
});
// Atualiza ao voltar para a aba
window.addEventListener('focus', sincronizarGlobais);
// Atualiza ao mudar localStorage
window.addEventListener('storage', function(e) {
    if ([
        'gamePoints',
        'equippedItems'
    ].includes(e.key)) {
        sincronizarGlobais();
    }
});


// --- Lógica da Loja ---
const ITENS_DISPONIVEIS = {
    'cronometro-tempo-extra': {
        id: 'cronometro-tempo-extra',
        name: 'Cronômetro de Tempo Extra',
        description: 'Adiciona +30 segundos extras para responder cada pergunta do quiz',
        price: 1200,
        category: 'tempo',
    },
    'camera-lenta': {
        id: 'camera-lenta',
        name: 'Câmera Lenta',
        description: 'Faz o tempo passar 50% mais devagar durante as perguntas mais difíceis',
        price: 1800,
        category: 'tempo',
    },
    'multiplicador-pontos': {
        id: 'multiplicador-pontos',
        name: 'Multiplicador de Pontos',
        description: 'Dobra os pontos ganhos em todas as perguntas certas do quiz',
        price: 2000,
        category: 'bonus',
    },
    'dica-magica': {
        id: 'dica-magica',
        name: 'Dica Mágica',
        description: 'Remove uma alternativa errada de cada pergunta, facilitando a escolha',
        price: 1500,
        category: 'ajuda',
    },
    'vida-extra': {
        id: 'vida-extra',
        name: 'Vida Extra',
        description: 'Permite errar uma pergunta sem perder pontos ou ser eliminado do quiz',
        price: 1000,
        category: 'protecao',
    }
};

function mostrarMensagemLoja(texto, tipo = 'info') {
    let container = document.getElementById('message-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'message-container';
        document.body.appendChild(container);
    }
    const mensagem = document.createElement('div');
    mensagem.className = `message ${tipo}`;
    mensagem.textContent = texto;
    container.appendChild(mensagem);
    setTimeout(() => mensagem.remove(), 2500);
}

function atualizarBotoesLoja() {
    const equippedItems = JSON.parse(localStorage.getItem('equippedItems') || '[]');
    const purchasedItems = JSON.parse(localStorage.getItem('purchasedItems') || '[]');
    document.querySelectorAll('.shop-item').forEach(article => {
        const itemId = article.getAttribute('data-item-id');
        const btn = article.querySelector('.buy-btn');
        if (!btn) return;
        btn.disabled = false;
        if (equippedItems.some(item => item.id === itemId)) {
            btn.textContent = 'Desequipar';
            btn.classList.add('desequipar-btn-shop');
        } else if (purchasedItems.includes(itemId)) {
            btn.textContent = 'Equipar';
            btn.classList.remove('desequipar-btn-shop');
        } else {
            btn.textContent = 'Comprar';
            btn.classList.remove('desequipar-btn-shop');
        }
    });
}

function comprarOuEquiparItem(itemId) {
    const item = ITENS_DISPONIVEIS[itemId];
    if (!item) return;
    let pontos = parseInt(localStorage.getItem('gamePoints') || '2450');
    let purchasedItems = JSON.parse(localStorage.getItem('purchasedItems') || '[]');
    let equippedItems = JSON.parse(localStorage.getItem('equippedItems') || '[]');
    // Se já comprado
    if (purchasedItems.includes(itemId)) {
        // Se já está equipado, desequipa
        if (equippedItems.some(e => e.id === itemId)) {
            desequiparItem(itemId);
            return;
        }
        // Limite de 2 equipamentos
        if (equippedItems.length >= 2) {
            mostrarMensagemLoja('Máximo de 2 equipamentos ativos!', 'warning');
            return;
        }
        equippedItems.push(item);
        localStorage.setItem('equippedItems', JSON.stringify(equippedItems));
        mostrarMensagemLoja('Equipamento ativado!', 'success');
        sincronizarGlobais();
        atualizarBotoesLoja();
        return;
    }
    // Comprar
    if (pontos < item.price) {
        mostrarMensagemLoja('Pontos insuficientes!', 'error');
        return;
    }
    pontos -= item.price;
    purchasedItems.push(itemId);
    localStorage.setItem('gamePoints', pontos.toString());
    localStorage.setItem('purchasedItems', JSON.stringify(purchasedItems));
    mostrarMensagemLoja('Item comprado! Agora equipe para usar.', 'success');
    sincronizarGlobais();
    atualizarBotoesLoja();
}

// Filtros da loja
function filtrarItensLoja(categoria) {
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    const btnAtivo = document.querySelector(`.filter-btn[data-filter="${categoria}"]`);
    if (btnAtivo) btnAtivo.classList.add('active');
    document.querySelectorAll('.shop-item').forEach(item => {
        if (categoria === 'todos' || item.getAttribute('data-category') === categoria) {
            item.style.display = 'block';
        } else {
            item.style.display = 'none';
        }
    });
}

if (window.location.pathname.endsWith('loja.html')){
    window.addEventListener('DOMContentLoaded', function() {
        inicializarLocalStorageLoja();
        document.querySelectorAll('.buy-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                console.log('Botão de comprar clicado!');
                const article = btn.closest('.shop-item');
                if (!article) return;
                const itemId = article.getAttribute('data-item-id');
                console.log('Item ID:', itemId);
                comprarOuEquiparItem(itemId);
                atualizarBotoesLoja();
                atualizarEquipamentos();
            });
        });
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                filtrarItensLoja(btn.getAttribute('data-filter'));
                atualizarBotoesLoja();
            });
        });
        atualizarBotoesLoja();
        atualizarEquipamentos();
        // Atualiza equipamentos ao mudar localStorage
        window.addEventListener('storage', function() {
            atualizarEquipamentos();
            atualizarBotoesLoja();
        });
    });
} else {
    window.atualizarEquipamentos = atualizarEquipamentos;
}