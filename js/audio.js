// Sistema de áudio global para o jogo
class AudioManager {
    constructor() {
        this.backgroundMusic = null;
        this.currentTrack = 0;
        this.isPlaying = false;
        this.volume = parseFloat(localStorage.getItem('musicVolume') || '0.5');
        this.musicEnabled = localStorage.getItem('musicEnabled') !== 'false';
        this.sfxEnabled = localStorage.getItem('sfxEnabled') !== 'false';
        this.sfxVolume = parseFloat(localStorage.getItem('sfxVolume') || '0.3');
        
        // Controle de tentativas para evitar loop infinito
        this.loadAttempts = 0;
        this.maxLoadAttempts = 3;
        this.errorTimeout = null;
        this.isLoading = false;
        
        // Lista de músicas disponíveis
        this.musicTracks = [
            'musicas/musica 1.mp3',
            'musicas/musica 2.mp3'
        ];
        
        this.init();
    }
    
    init() {
        // Cria o elemento de áudio
        this.backgroundMusic = new Audio();
        this.backgroundMusic.volume = this.volume;
        this.backgroundMusic.loop = false; // Não loop individual, vamos controlar manualmente
        
        // Event listeners
        this.backgroundMusic.addEventListener('ended', () => {
            console.log('Música terminada, passando para próxima...');
            this.isLoading = false;
            this.loadAttempts = 0; // Reset contador
            this.nextTrack();
        });
        
        this.backgroundMusic.addEventListener('error', (e) => {
            console.error('Erro ao carregar música:', e);
            this.isLoading = false;
            
            // Prevenir loop infinito - só tenta novamente se não excedeu o limite
            if (this.loadAttempts < this.maxLoadAttempts) {
                // Aguarda 2 segundos antes de tentar próxima música
                if (this.errorTimeout) clearTimeout(this.errorTimeout);
                this.errorTimeout = setTimeout(() => {
                    this.loadAttempts++;
                    console.log(`Tentativa ${this.loadAttempts}/${this.maxLoadAttempts} de carregar música`);
                    this.nextTrack();
                }, 2000);
            } else {
                console.warn('Máximo de tentativas de carregamento atingido. Parando reprodução automática.');
                this.isPlaying = false;
                this.loadAttempts = 0;
            }
        });
        
        this.backgroundMusic.addEventListener('loadstart', () => {
            console.log('Carregando música:', this.getCurrentTrackName());
            this.isLoading = true;
        });
        
        this.backgroundMusic.addEventListener('canplay', () => {
            console.log('Música pronta para reproduzir:', this.getCurrentTrackName());
            this.isLoading = false;
            this.loadAttempts = 0; // Reset contador em sucesso
        });
        
        // Inicia a música se estiver habilitada
        if (this.musicEnabled) {
            this.loadTrack(this.currentTrack);
            // Aguarda interação do usuário para começar a tocar
            this.waitForUserInteraction();
        }
    }
    
    waitForUserInteraction() {
        const startMusic = () => {
            if (this.musicEnabled && !this.isPlaying) {
                this.play();
            }
            document.removeEventListener('click', startMusic);
            document.removeEventListener('keydown', startMusic);
        };
        
        document.addEventListener('click', startMusic);
        document.addEventListener('keydown', startMusic);
    }
    
    loadTrack(trackIndex) {
        // Prevenir múltiplas chamadas simultâneas
        if (this.isLoading) {
            console.log('Já está carregando uma música, ignorando...');
            return;
        }
        
        if (trackIndex >= 0 && trackIndex < this.musicTracks.length) {
            const newSrc = this.musicTracks[trackIndex];
            console.log(`Carregando música: ${newSrc}`);
            this.backgroundMusic.src = newSrc;
            this.currentTrack = trackIndex;
            
            // Força o carregamento da música
            this.backgroundMusic.load();
        } else {
            console.error(`Índice de música inválido: ${trackIndex}`);
        }
    }
    
    play() {
        if (this.musicEnabled && this.backgroundMusic.src && !this.isLoading) {
            this.backgroundMusic.play().then(() => {
                this.isPlaying = true;
                this.loadAttempts = 0; // Reset em sucesso
                console.log('Música iniciada:', this.getCurrentTrackName());
            }).catch(e => {
                console.error('Erro ao reproduzir música:', e);
                this.isPlaying = false;
                
                // Só tenta novamente se não excedeu o limite
                if (this.loadAttempts < this.maxLoadAttempts) {
                    // Tenta novamente após interação do usuário
                    this.waitForUserInteraction();
                } else {
                    console.warn('Máximo de tentativas de reprodução atingido.');
                }
            });
        }
    }
    
    pause() {
        this.backgroundMusic.pause();
        this.isPlaying = false;
    }
    
    stop() {
        this.backgroundMusic.pause();
        this.backgroundMusic.currentTime = 0;
        this.isPlaying = false;
    }
    
    nextTrack() {
        // Prevenir múltiplas chamadas
        if (this.isLoading) {
            console.log('Carregamento em andamento, ignorando nextTrack');
            return;
        }
        
        const previousTrack = this.currentTrack;
        this.currentTrack = (this.currentTrack + 1) % this.musicTracks.length;
        console.log(`Mudando da música ${previousTrack + 1} para música ${this.currentTrack + 1}`);
        this.loadTrack(this.currentTrack);
        if (this.musicEnabled && !this.isLoading) {
            // Pequeno delay para garantir que a música carregou
            setTimeout(() => {
                if (!this.isLoading) {
                    this.play();
                }
            }, 100);
        }
    }
    
    previousTrack() {
        // Prevenir múltiplas chamadas
        if (this.isLoading) {
            console.log('Carregamento em andamento, ignorando previousTrack');
            return;
        }
        
        const previousTrack = this.currentTrack;
        this.currentTrack = this.currentTrack === 0 ? this.musicTracks.length - 1 : this.currentTrack - 1;
        console.log(`Mudando da música ${previousTrack + 1} para música ${this.currentTrack + 1}`);
        this.loadTrack(this.currentTrack);
        if (this.musicEnabled && !this.isLoading) {
            // Pequeno delay para garantir que a música carregou
            setTimeout(() => {
                if (!this.isLoading) {
                    this.play();
                }
            }, 100);
        }
    }
    
    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
        this.backgroundMusic.volume = this.volume;
        localStorage.setItem('musicVolume', this.volume.toString());
    }
    
    toggleMusic() {
        this.musicEnabled = !this.musicEnabled;
        localStorage.setItem('musicEnabled', this.musicEnabled.toString());
        
        if (this.musicEnabled) {
            this.play();
        } else {
            this.pause();
        }
        
        return this.musicEnabled;
    }
    
    setMusicEnabled(enabled) {
        this.musicEnabled = enabled;
        localStorage.setItem('musicEnabled', this.musicEnabled.toString());
        
        if (this.musicEnabled) {
            if (!this.isPlaying) {
                this.play();
            }
        } else {
            this.pause();
        }
    }
    
    getCurrentTrackName() {
        const trackPath = this.musicTracks[this.currentTrack];
        return trackPath.split('/').pop().replace('.mp3', '');
    }
    
    getVolume() {
        return this.volume;
    }
    
    isMusicEnabled() {
        return this.musicEnabled;
    }
    
    isCurrentlyPlaying() {
        return this.isPlaying && !this.backgroundMusic.paused;
    }
    
    // Função para debug - listar todas as músicas
    listTracks() {
        console.log('Músicas disponíveis:');
        this.musicTracks.forEach((track, index) => {
            const current = index === this.currentTrack ? ' (ATUAL)' : '';
            console.log(`${index + 1}. ${track}${current}`);
        });
    }
    
    // Função para debug - informações do estado atual
    getStatus() {
        return {
            currentTrack: this.currentTrack + 1,
            totalTracks: this.musicTracks.length,
            isPlaying: this.isCurrentlyPlaying(),
            musicEnabled: this.musicEnabled,
            volume: this.volume,
            currentSrc: this.backgroundMusic.src
        };
    }
    
    // Efeitos sonoros simples usando Web Audio API ou síntese
    playClickSound() {
        if (!this.sfxEnabled) return;
        
        try {
            // Cria um contexto de áudio se não existir
            if (!this.audioContext) {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            }
            
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            // Som de clique: frequência alta, curta duração
            oscillator.frequency.value = 800;
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(this.sfxVolume, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);
            
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + 0.1);
        } catch (e) {
            console.log('Erro ao tocar som de clique:', e);
        }
    }
    
    playSuccessSound() {
        if (!this.sfxEnabled) return;
        
        try {
            if (!this.audioContext) {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            }
            
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            // Som de sucesso: duas notas agradáveis
            oscillator.frequency.setValueAtTime(523, this.audioContext.currentTime); // C5
            oscillator.frequency.setValueAtTime(659, this.audioContext.currentTime + 0.1); // E5
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(this.sfxVolume * 0.5, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);
            
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + 0.3);
        } catch (e) {
            console.log('Erro ao tocar som de sucesso:', e);
        }
    }
    
    playErrorSound() {
        if (!this.sfxEnabled) return;
        
        try {
            if (!this.audioContext) {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            }
            
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            // Som de erro: frequência baixa
            oscillator.frequency.value = 200;
            oscillator.type = 'sawtooth';
            
            gainNode.gain.setValueAtTime(this.sfxVolume * 0.3, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2);
            
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + 0.2);
        } catch (e) {
            console.log('Erro ao tocar som de erro:', e);
        }
    }
}

// Instância global do gerenciador de áudio
window.audioManager = new AudioManager();

// Funções para debug no console (use no Developer Tools)
window.musicDebug = {
    status: () => window.audioManager.getStatus(),
    list: () => window.audioManager.listTracks(),
    next: () => window.audioManager.nextTrack(),
    prev: () => window.audioManager.previousTrack(),
    play: () => window.audioManager.play(),
    pause: () => window.audioManager.pause()
};

console.log('🎵 Sistema de música inicializado!');
console.log('Use "musicDebug.status()" para ver o status atual');
console.log('Use "musicDebug.list()" para ver todas as músicas');

// Funções auxiliares para controles de configuração
function updateVolumeSlider() {
    const musicVolumeSlider = document.getElementById('music-volume-slider');
    if (musicVolumeSlider) {
        musicVolumeSlider.value = window.audioManager.getVolume() * 100;
        musicVolumeSlider.addEventListener('input', function(e) {
            const volume = e.target.value / 100;
            window.audioManager.setVolume(volume);
        });
    }
}

function updateMusicToggle() {
    const musicToggle = document.getElementById('music-toggle');
    if (musicToggle) {
        musicToggle.checked = window.audioManager.isMusicEnabled();
        musicToggle.addEventListener('change', function(e) {
            window.audioManager.setMusicEnabled(e.target.checked);
            updateCurrentTrackDisplay();
        });
    }
}

function updateCurrentTrackDisplay() {
    const currentTrackElement = document.getElementById('current-track');
    if (currentTrackElement) {
        if (window.audioManager.isMusicEnabled()) {
            const trackName = window.audioManager.getCurrentTrackName();
            const isPlaying = window.audioManager.isCurrentlyPlaying();
            currentTrackElement.textContent = `Música: ${trackName} ${isPlaying ? '▶' : '⏸'}`;
        } else {
            currentTrackElement.textContent = 'Música: Desabilitada';
        }
    }
}

function setupMusicControls() {
    const prevBtn = document.getElementById('prev-track');
    const playPauseBtn = document.getElementById('play-pause');
    const nextBtn = document.getElementById('next-track');
    
    if (prevBtn) {
        prevBtn.addEventListener('click', function() {
            window.audioManager.previousTrack();
            updateCurrentTrackDisplay();
        });
    }
    
    if (playPauseBtn) {
        playPauseBtn.addEventListener('click', function() {
            if (window.audioManager.isCurrentlyPlaying()) {
                window.audioManager.pause();
            } else {
                window.audioManager.play();
            }
            updateCurrentTrackDisplay();
        });
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', function() {
            window.audioManager.nextTrack();
            updateCurrentTrackDisplay();
        });
    }
}

// Inicializa controles quando a página carregar
window.addEventListener('DOMContentLoaded', function() {
    // Aguarda um pouco para garantir que o DOM está pronto
    setTimeout(() => {
        updateVolumeSlider();
        updateMusicToggle();
        setupMusicControls();
        updateCurrentTrackDisplay();
        
        // Atualiza o display da música atual a cada segundo
        setInterval(updateCurrentTrackDisplay, 1000);
    }, 100);
});
