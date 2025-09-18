// Sistema de áudio global para o jogo
class AudioManager {
    constructor() {
        this.backgroundMusic = null;
        this.currentTrack = 0;
        this.isPlaying = false;
        this.volume = parseFloat(localStorage.getItem('musicVolume') || '0.5');
        this.musicEnabled = localStorage.getItem('musicEnabled') !== 'false';
        
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
            this.nextTrack();
        });
        
        this.backgroundMusic.addEventListener('error', (e) => {
            console.log('Erro ao carregar música:', e);
            this.nextTrack();
        });
        
        this.backgroundMusic.addEventListener('loadstart', () => {
            console.log('Carregando música:', this.getCurrentTrackName());
        });
        
        this.backgroundMusic.addEventListener('canplay', () => {
            console.log('Música pronta para reproduzir:', this.getCurrentTrackName());
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
        if (this.musicEnabled && this.backgroundMusic.src) {
            this.backgroundMusic.play().then(() => {
                this.isPlaying = true;
                console.log('Música iniciada:', this.getCurrentTrackName());
            }).catch(e => {
                console.log('Erro ao reproduzir música:', e);
                // Tenta novamente após interação do usuário
                this.waitForUserInteraction();
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
        const previousTrack = this.currentTrack;
        this.currentTrack = (this.currentTrack + 1) % this.musicTracks.length;
        console.log(`Mudando da música ${previousTrack + 1} para música ${this.currentTrack + 1}`);
        this.loadTrack(this.currentTrack);
        if (this.musicEnabled) {
            // Pequeno delay para garantir que a música carregou
            setTimeout(() => {
                this.play();
            }, 100);
        }
    }
    
    previousTrack() {
        const previousTrack = this.currentTrack;
        this.currentTrack = this.currentTrack === 0 ? this.musicTracks.length - 1 : this.currentTrack - 1;
        console.log(`Mudando da música ${previousTrack + 1} para música ${this.currentTrack + 1}`);
        this.loadTrack(this.currentTrack);
        if (this.musicEnabled) {
            // Pequeno delay para garantir que a música carregou
            setTimeout(() => {
                this.play();
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
