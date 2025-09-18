// gameSystemDebug.js - Script simples para debug

console.log('=== DEBUG GAMESYSTEM ===');
console.log('Script carregado!');
console.log('Document ready state:', document.readyState);
console.log('URL atual:', window.location.pathname);

// Função que força a criação do HUD
function createForceHUD() {
    console.log('Forçando criação do HUD...');
    
    // Remove qualquer HUD existente
    const existing = document.getElementById('debug-hud');
    if (existing) {
        existing.remove();
    }
    
    // Cria HUD diretamente no HTML
    const hudHTML = `
        <div id="debug-hud" style="
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            background: linear-gradient(135deg, rgba(0, 0, 0, 0.95), rgba(0, 34, 68, 0.95));
            color: white;
            padding: 1rem;
            z-index: 9999;
            font-family: 'Kdam Thmor Pro', cursive;
            border-bottom: 3px solid #0DF;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
        ">
            <div style="
                display: flex;
                justify-content: center;
                align-items: center;
                gap: 3rem;
                margin-bottom: 0.5rem;
            ">
                <div style="text-align: center;">
                    <div style="font-size: 2rem; margin-bottom: 0.25rem;">❤️</div>
                    <div style="font-size: 1.5rem; color: #0DF; font-weight: bold;" id="debug-vidas">3</div>
                    <div style="font-size: 0.8rem; text-transform: uppercase;">Vidas</div>
                </div>
                <div style="text-align: center;">
                    <div style="font-size: 2rem; margin-bottom: 0.25rem;">⏱️</div>
                    <div style="font-size: 1.5rem; color: #E1EA2D; font-weight: bold;" id="debug-tempo">60</div>
                    <div style="font-size: 0.8rem; text-transform: uppercase;">Tempo</div>
                </div>
                <div style="text-align: center;">
                    <div style="font-size: 2rem; margin-bottom: 0.25rem;">🏆</div>
                    <div style="font-size: 1.5rem; color: #0DF; font-weight: bold;" id="debug-pontos">0</div>
                    <div style="font-size: 0.8rem; text-transform: uppercase;">Pontos</div>
                </div>
                <div style="text-align: center;">
                    <div style="font-size: 2rem; margin-bottom: 0.25rem;">🎮</div>
                    <div style="font-size: 1rem; color: #FAFAFA; font-weight: bold;">ATIVO</div>
                    <div style="font-size: 0.8rem; text-transform: uppercase;">Status</div>
                </div>
            </div>
            
            <!-- Barra de progresso do tempo -->
            <div style="
                width: 100%;
                height: 8px;
                background: rgba(0, 0, 0, 0.5);
                border-radius: 4px;
                overflow: hidden;
                margin-top: 0.5rem;
            ">
                <div id="debug-progress" style="
                    height: 100%;
                    background: linear-gradient(90deg, #0DF, #E1EA2D);
                    border-radius: 4px;
                    width: 100%;
                    transition: width 1s ease;
                "></div>
            </div>
        </div>
    `;
    
    // Esperar o body estar disponível e adicionar
    function addHUD() {
        if (document.body) {
            console.log('Adicionando HUD debug ao body...');
            document.body.insertAdjacentHTML('afterbegin', hudHTML);
            
            // Ajustar padding do body
            document.body.style.paddingTop = '120px';
            
            // Verificar se foi criado
            const debugHud = document.getElementById('debug-hud');
            if (debugHud) {
                console.log('✅ HUD debug criado com sucesso!');
                startDebugTimer();
            } else {
                console.log('❌ Falha ao criar HUD debug');
            }
        } else {
            console.log('Body ainda não disponível, tentando novamente...');
            setTimeout(addHUD, 100);
        }
    }
    
    addHUD();
}

// Timer de teste
function startDebugTimer() {
    let tempo = 60;
    let pontos = 0;
    let vidas = 3;
    
    const timerInterval = setInterval(() => {
        tempo--;
        pontos += 10;
        
        // Atualizar elementos
        const tempoEl = document.getElementById('debug-tempo');
        const pontosEl = document.getElementById('debug-pontos');
        const progressEl = document.getElementById('debug-progress');
        
        if (tempoEl) tempoEl.textContent = tempo;
        if (pontosEl) pontosEl.textContent = pontos;
        if (progressEl) {
            const percent = (tempo / 60) * 100;
            progressEl.style.width = percent + '%';
            
            // Mudar cor conforme tempo
            if (tempo <= 5) {
                progressEl.style.background = 'linear-gradient(90deg, #FF6B6B, #FF4444)';
            } else if (tempo <= 10) {
                progressEl.style.background = 'linear-gradient(90deg, #FFA500, #FF8C00)';
            }
        }
        
        if (tempo <= 0) {
            clearInterval(timerInterval);
            console.log('Timer finalizado!');
            
            // Perder vida
            vidas--;
            const vidasEl = document.getElementById('debug-vidas');
            if (vidasEl) {
                vidasEl.textContent = vidas;
                if (vidas <= 0) {
                    vidasEl.style.color = '#FF6B6B';
                    console.log('Game Over!');
                }
            }
        }
    }, 1000);
    
    console.log('Timer debug iniciado!');
}

// Múltiplas tentativas de inicialização
console.log('Configurando inicialização...');

// Tentativa 1: DOMContentLoaded
if (document.readyState === 'loading') {
    console.log('DOM carregando, aguardando DOMContentLoaded...');
    document.addEventListener('DOMContentLoaded', function() {
        console.log('DOMContentLoaded disparado!');
        createForceHUD();
    });
} else {
    console.log('DOM já carregado, criando HUD imediatamente...');
    createForceHUD();
}

// Tentativa 2: Timeout
setTimeout(function() {
    console.log('Timeout 500ms - verificando se HUD existe...');
    if (!document.getElementById('debug-hud')) {
        console.log('HUD não encontrado, tentando criar novamente...');
        createForceHUD();
    }
}, 500);

// Tentativa 3: Timeout mais longo
setTimeout(function() {
    console.log('Timeout 2s - última tentativa...');
    if (!document.getElementById('debug-hud')) {
        console.log('Última tentativa de criar HUD...');
        createForceHUD();
    }
}, 2000);

// Função global para debug manual
window.debugHUD = createForceHUD;

console.log('=== FIM SETUP DEBUG ===');
