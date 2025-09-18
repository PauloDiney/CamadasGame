// teste-rapido.js - Verificação rápida de funcionalidades

console.log('🧪 Iniciando testes automáticos...');

// Teste 1: Verificar se gameSystemActions existe
setTimeout(() => {
    console.log('📋 Teste 1: gameSystemActions');
    if (window.gameSystemActions) {
        console.log('✅ gameSystemActions encontrado');
        
        // Testar status
        window.gameSystemActions.status();
        
        // Testar pontos
        console.log('🎯 Testando sistema de pontos...');
        window.gameSystemActions.ganharPontos(50);
        
        // Testar acerto
        console.log('🎯 Testando acerto...');
        window.gameSystemActions.acertou(100);
        
    } else {
        console.log('❌ gameSystemActions não encontrado');
    }
}, 1000);

// Teste 2: Verificar se simpleGameSystem existe
setTimeout(() => {
    console.log('📋 Teste 2: simpleGameSystem');
    if (window.simpleGameSystem) {
        console.log('✅ simpleGameSystem encontrado');
        console.log('Estado atual:', window.simpleGameSystem.estado);
        console.log('Habilidades:', window.simpleGameSystem.habilidades);
    } else {
        console.log('❌ simpleGameSystem não encontrado');
    }
}, 1500);

// Teste 3: Testar vida (só uma vez)
setTimeout(() => {
    console.log('📋 Teste 3: Sistema de vidas (testando erro)');
    if (window.gameSystemActions) {
        console.log('Vidas antes:', window.simpleGameSystem?.estado?.vidas);
        window.gameSystemActions.errou('Teste de erro');
        setTimeout(() => {
            console.log('Vidas depois:', window.simpleGameSystem?.estado?.vidas);
        }, 1000);
    }
}, 2000);

// Teste 4: Verificar localStorage
setTimeout(() => {
    console.log('📋 Teste 4: localStorage');
    console.log('Itens equipados:', localStorage.getItem('equippedItems'));
    console.log('Pontos do jogo:', localStorage.getItem('gamePoints'));
}, 2500);

console.log('🧪 Testes agendados. Aguarde os resultados...');
