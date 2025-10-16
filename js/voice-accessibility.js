/**
 * SISTEMA DE ACESSIBILIDADE COM VOZ
 * Fornece leitura por voz, ajuste de fonte, alto contraste e mais
 */

// ===== CONFIGURAÇÕES DE VOZ =====
let voiceEnabled = localStorage.getItem('voiceEnabled') === 'true';
let currentFontSize = localStorage.getItem('fontSize') || 'medium';
let highContrast = localStorage.getItem('highContrast') === 'true';
let synthesis = window.speechSynthesis;
let currentUtterance = null;

// ===== INICIALIZAÇÃO =====
document.addEventListener('DOMContentLoaded', function() {
    console.log('🎤 Sistema de Acessibilidade com Voz iniciado');
    
    initializeAccessibility();
    setupVoiceControls();
    setupFontControls();
    setupContrastControls();
    setupVoiceNavigation();
    applyStoredSettings();
});

// ===== APLICAR CONFIGURAÇÕES SALVAS =====
function applyStoredSettings() {
    // Aplicar tamanho de fonte
    document.body.className = document.body.className.replace(/font-\w+/g, '');
    document.body.classList.add(`font-${currentFontSize}`);
    
    // Aplicar alto contraste
    if (highContrast) {
        document.body.classList.add('high-contrast');
        const contrastBtn = document.getElementById('toggle-contrast');
        if (contrastBtn) contrastBtn.classList.add('active');
    }
    
    // Aplicar indicador de voz
    if (voiceEnabled) {
        const voiceBtn = document.getElementById('toggle-voice');
        if (voiceBtn) voiceBtn.classList.add('active');
        announceToUser('Leitura por voz ativada');
    }
}

// ===== INICIALIZAR ACESSIBILIDADE =====
function initializeAccessibility() {
    // Criar região ARIA live se não existir
    if (!document.getElementById('aria-live-region')) {
        const ariaLive = document.createElement('div');
        ariaLive.id = 'aria-live-region';
        ariaLive.setAttribute('aria-live', 'polite');
        ariaLive.setAttribute('aria-atomic', 'true');
        ariaLive.className = 'sr-only';
        document.body.appendChild(ariaLive);
    }
    
    console.log('✅ Acessibilidade inicializada');
}

// ===== CONTROLES DE VOZ =====
function setupVoiceControls() {
    const voiceBtn = document.getElementById('toggle-voice');
    if (!voiceBtn) return;
    
    voiceBtn.addEventListener('click', function() {
        voiceEnabled = !voiceEnabled;
        localStorage.setItem('voiceEnabled', voiceEnabled);
        
        this.classList.toggle('active', voiceEnabled);
        
        if (voiceEnabled) {
            announceToUser('Leitura por voz ativada');
            speak('Leitura por voz ativada. Agora eu vou ler os elementos conforme você navega.');
        } else {
            stopSpeaking();
            announceToUser('Leitura por voz desativada');
        }
    });
}

// ===== CONTROLES DE FONTE =====
function setupFontControls() {
    const increaseBtn = document.getElementById('increase-font');
    const decreaseBtn = document.getElementById('decrease-font');
    
    const fontSizes = ['small', 'medium', 'large', 'xlarge'];
    
    if (increaseBtn) {
        increaseBtn.addEventListener('click', function() {
            const currentIndex = fontSizes.indexOf(currentFontSize);
            if (currentIndex < fontSizes.length - 1) {
                currentFontSize = fontSizes[currentIndex + 1];
                applyFontSize();
                announceToUser(`Fonte aumentada para ${getFontLabel(currentFontSize)}`);
                if (voiceEnabled) speak(`Fonte aumentada para ${getFontLabel(currentFontSize)}`);
            } else {
                announceToUser('Tamanho máximo de fonte atingido');
                if (voiceEnabled) speak('Já está no tamanho máximo');
            }
        });
    }
    
    if (decreaseBtn) {
        decreaseBtn.addEventListener('click', function() {
            const currentIndex = fontSizes.indexOf(currentFontSize);
            if (currentIndex > 0) {
                currentFontSize = fontSizes[currentIndex - 1];
                applyFontSize();
                announceToUser(`Fonte reduzida para ${getFontLabel(currentFontSize)}`);
                if (voiceEnabled) speak(`Fonte reduzida para ${getFontLabel(currentFontSize)}`);
            } else {
                announceToUser('Tamanho mínimo de fonte atingido');
                if (voiceEnabled) speak('Já está no tamanho mínimo');
            }
        });
    }
}

function applyFontSize() {
    document.body.className = document.body.className.replace(/font-\w+/g, '');
    document.body.classList.add(`font-${currentFontSize}`);
    localStorage.setItem('fontSize', currentFontSize);
}

function getFontLabel(size) {
    const labels = {
        'small': 'pequena',
        'medium': 'média',
        'large': 'grande',
        'xlarge': 'muito grande'
    };
    return labels[size] || size;
}

// ===== CONTROLES DE CONTRASTE =====
function setupContrastControls() {
    const contrastBtn = document.getElementById('toggle-contrast');
    if (!contrastBtn) return;
    
    contrastBtn.addEventListener('click', function() {
        highContrast = !highContrast;
        localStorage.setItem('highContrast', highContrast);
        
        document.body.classList.toggle('high-contrast', highContrast);
        this.classList.toggle('active', highContrast);
        
        const message = highContrast ? 'Alto contraste ativado' : 'Alto contraste desativado';
        announceToUser(message);
        if (voiceEnabled) speak(message);
    });
}

// ===== NAVEGAÇÃO COM VOZ =====
function setupVoiceNavigation() {
    // Adicionar leitura aos cards do menu
    const menuCards = document.querySelectorAll('.menu-card');
    menuCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            if (voiceEnabled) {
                const voiceText = this.getAttribute('data-voice');
                if (voiceText) {
                    speak(voiceText);
                }
            }
        });
        
        card.addEventListener('focus', function() {
            if (voiceEnabled) {
                const voiceText = this.getAttribute('data-voice');
                if (voiceText) {
                    speak(voiceText);
                }
            }
        });
        
        card.addEventListener('mouseleave', stopSpeaking);
    });
    
    // Leitura de pontos
    const pontosDisplay = document.getElementById('pontos-display');
    if (pontosDisplay) {
        pontosDisplay.addEventListener('mouseenter', function() {
            if (voiceEnabled) {
                const pontos = this.textContent || this.innerText;
                speak(`Você tem ${pontos} pontos`);
            }
        });
        
        pontosDisplay.addEventListener('mouseleave', stopSpeaking);
    }
    
    // Leitura de equipamentos
    const equipamentos = document.querySelectorAll('.equipamento');
    equipamentos.forEach(eq => {
        eq.addEventListener('mouseenter', function() {
            if (voiceEnabled) {
                const nome = this.querySelector('h4')?.textContent;
                const desc = this.querySelector('p')?.textContent;
                if (nome && desc) {
                    speak(`Equipamento: ${nome}. ${desc}`);
                }
            }
        });
        
        eq.addEventListener('mouseleave', stopSpeaking);
    });
}

// ===== FUNÇÕES DE FALA =====
function speak(text, options = {}) {
    if (!synthesis) {
        console.warn('⚠️ Síntese de voz não suportada neste navegador');
        return;
    }
    
    // Parar fala anterior
    stopSpeaking();
    
    // Criar nova fala
    currentUtterance = new SpeechSynthesisUtterance(text);
    currentUtterance.lang = 'pt-BR';
    currentUtterance.rate = options.rate || 1.0;
    currentUtterance.pitch = options.pitch || 1.0;
    currentUtterance.volume = options.volume || 1.0;
    
    // Mostrar indicador visual
    showVoiceIndicator();
    
    // Callbacks
    currentUtterance.onend = function() {
        hideVoiceIndicator();
        currentUtterance = null;
    };
    
    currentUtterance.onerror = function(event) {
        console.error('❌ Erro na síntese de voz:', event);
        hideVoiceIndicator();
        currentUtterance = null;
    };
    
    // Falar
    synthesis.speak(currentUtterance);
}

function stopSpeaking() {
    if (synthesis && synthesis.speaking) {
        synthesis.cancel();
    }
    hideVoiceIndicator();
    currentUtterance = null;
}

// ===== INDICADOR VISUAL DE VOZ =====
function showVoiceIndicator() {
    let indicator = document.getElementById('voice-indicator');
    if (indicator) {
        indicator.classList.add('active');
    }
}

function hideVoiceIndicator() {
    let indicator = document.getElementById('voice-indicator');
    if (indicator) {
        indicator.classList.remove('active');
    }
}

// ===== ANÚNCIOS PARA LEITORES DE TELA =====
function announceToUser(message) {
    const ariaLive = document.getElementById('aria-live-region');
    if (ariaLive) {
        ariaLive.textContent = message;
        
        // Limpar após 3 segundos
        setTimeout(() => {
            ariaLive.textContent = '';
        }, 3000);
    }
}

// ===== ATALHOS DE TECLADO =====
document.addEventListener('keydown', function(e) {
    // Alt + V = Toggle Voz
    if (e.altKey && e.key === 'v') {
        e.preventDefault();
        document.getElementById('toggle-voice')?.click();
    }
    
    // Alt + + = Aumentar fonte
    if (e.altKey && e.key === '+') {
        e.preventDefault();
        document.getElementById('increase-font')?.click();
    }
    
    // Alt + - = Diminuir fonte
    if (e.altKey && e.key === '-') {
        e.preventDefault();
        document.getElementById('decrease-font')?.click();
    }
    
    // Alt + C = Toggle Contraste
    if (e.altKey && e.key === 'c') {
        e.preventDefault();
        document.getElementById('toggle-contrast')?.click();
    }
    
    // Esc = Parar fala
    if (e.key === 'Escape') {
        stopSpeaking();
    }
});

// ===== EXPORTAR FUNÇÕES ÚTEIS =====
window.accessibilityVoice = {
    speak,
    stopSpeaking,
    announceToUser,
    isVoiceEnabled: () => voiceEnabled
};

console.log('✅ Sistema de Acessibilidade com Voz carregado');
console.log('📋 Atalhos disponíveis:');
console.log('   Alt + V: Ativar/Desativar Voz');
console.log('   Alt + +: Aumentar Fonte');
console.log('   Alt + -: Diminuir Fonte');
console.log('   Alt + C: Alternar Contraste');
console.log('   Esc: Parar Leitura');
