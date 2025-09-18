// Sistema de modo escuro
class DarkModeManager {
    constructor() {
        this.isDarkMode = localStorage.getItem('darkMode') === 'true';
        this.init();
    }
    
    init() {
        // Aplica o modo escuro se estiver ativado
        if (this.isDarkMode) {
            this.enableDarkMode();
        }
        
        // Configura o toggle se estiver na página de configurações
        this.setupDarkModeToggle();
    }
    
    enableDarkMode() {
        document.body.classList.add('dark-mode');
        this.isDarkMode = true;
        localStorage.setItem('darkMode', 'true');
        console.log('Modo escuro ativado');
    }
    
    disableDarkMode() {
        document.body.classList.remove('dark-mode');
        this.isDarkMode = false;
        localStorage.setItem('darkMode', 'false');
        console.log('Modo escuro desativado');
    }
    
    toggleDarkMode() {
        if (this.isDarkMode) {
            this.disableDarkMode();
        } else {
            this.enableDarkMode();
        }
        return this.isDarkMode;
    }
    
    setupDarkModeToggle() {
        const darkModeToggle = document.getElementById('dark-mode-toggle');
        if (darkModeToggle) {
            darkModeToggle.checked = this.isDarkMode;
            darkModeToggle.addEventListener('change', (e) => {
                if (e.target.checked) {
                    this.enableDarkMode();
                } else {
                    this.disableDarkMode();
                }
            });
        }
    }
    
    isDarkModeEnabled() {
        return this.isDarkMode;
    }
}

// Instância global do gerenciador de modo escuro
window.darkModeManager = new DarkModeManager();

// Inicializa quando o DOM estiver pronto
window.addEventListener('DOMContentLoaded', function() {
    // Reaplica o modo escuro após o carregamento da página
    if (window.darkModeManager.isDarkModeEnabled()) {
        window.darkModeManager.enableDarkMode();
    }
    window.darkModeManager.setupDarkModeToggle();
});
