// gameSystemTest.js - Versão simplificada para teste

console.log('GameSystem carregado!');

// Teste simples de criação da interface
function createSimpleHUD() {
    console.log('Criando HUD simples...');
    
    // Remove interface existente
    const existing = document.getElementById('simple-game-hud');
    if (existing) existing.remove();
    
    // Cria nova interface
    const hudHTML = `
        <div id="simple-game-hud" style="
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            background: linear-gradient(135deg, rgba(0, 0, 0, 0.9), rgba(0, 34, 68, 0.9));
            color: white;
            padding: 1rem;
            z-index: 1000;
            font-family: 'Kdam Thmor Pro', cursive;
            border-bottom: 2px solid #0DF;
            display: flex;
            justify-content: center;
            gap: 2rem;
        ">
            <div style="text-align: center;">
                <div style="font-size: 1.5rem;">❤️</div>
                <div style="font-size: 1.2rem; color: #0DF; font-weight: bold;">3</div>
                <div style="font-size: 0.8rem;">Vidas</div>
            </div>
            <div style="text-align: center;">
                <div style="font-size: 1.5rem;">⏱️</div>
                <div style="font-size: 1.2rem; color: #0DF; font-weight: bold;" id="timer-display">60</div>
                <div style="font-size: 0.8rem;">Tempo</div>
            </div>
            <div style="text-align: center;">
                <div style="font-size: 1.5rem;">🏆</div>
                <div style="font-size: 1.2rem; color: #0DF; font-weight: bold;">0</div>
                <div style="font-size: 0.8rem;">Pontos</div>
            </div>
        </div>
    `;
    
    // Adiciona ao body
    if (document.body) {
        document.body.insertAdjacentHTML('afterbegin', hudHTML);
        document.body.style.paddingTop = '100px';
        console.log('HUD criado com sucesso!');
        
        // Teste de timer
        let tempo = 60;
        const timerElement = document.getElementById('timer-display');
        const interval = setInterval(() => {
            tempo--;
            if (timerElement) timerElement.textContent = tempo;
            if (tempo <= 0) clearInterval(interval);
        }, 1000);
        
    } else {
        console.error('Body não encontrado!');
    }
}

// Inicializar quando possível
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createSimpleHUD);
} else {
    createSimpleHUD();
}

// Função global para teste manual
window.testHUD = createSimpleHUD;
