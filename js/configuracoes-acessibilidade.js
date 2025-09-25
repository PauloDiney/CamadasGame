/**
 * Configurações de Acessibilidade - CamadasGame
 * Gerencia as configurações específicas de acessibilidade
 */

class ConfiguracoesAcessibilidade {
    constructor() {
        this.init();
    }

    init() {
        this.carregarConfiguracoes();
        this.configurarEventos();
        this.sincronizarComSistemaAcessibilidade();
    }

    // Carrega configurações salvas
    carregarConfiguracoes() {
        // Alto contraste
        const altoContraste = localStorage.getItem('altoContraste') === 'true';
        const toggleAltoContraste = document.getElementById('alto-contraste-toggle');
        if (toggleAltoContraste) {
            toggleAltoContraste.checked = altoContraste;
        }

        // Tamanho da fonte
        const tamanhoFonte = localStorage.getItem('tamanhoFonte') || 'normal';
        const selectTamanhoFonte = document.getElementById('tamanho-fonte-select');
        if (selectTamanhoFonte) {
            selectTamanhoFonte.value = tamanhoFonte;
        }

        // Animações
        const animacoes = localStorage.getItem('animacoesAtivas') !== 'false';
        const toggleAnimacoes = document.getElementById('animacoes-toggle');
        if (toggleAnimacoes) {
            toggleAnimacoes.checked = animacoes;
        }

        // Volume da música
        const volumeMusica = localStorage.getItem('volumeMusica') || '50';
        const sliderVolume = document.getElementById('music-volume-slider');
        if (sliderVolume) {
            sliderVolume.value = volumeMusica;
            sliderVolume.setAttribute('aria-valuetext', `${volumeMusica}%`);
        }

        // Música de fundo
        const musicaAtiva = localStorage.getItem('musicaAtiva') !== 'false';
        const toggleMusica = document.getElementById('music-toggle');
        if (toggleMusica) {
            toggleMusica.checked = musicaAtiva;
        }
    }

    // Configura eventos dos controles
    configurarEventos() {
        // Alto contraste
        const toggleAltoContraste = document.getElementById('alto-contraste-toggle');
        if (toggleAltoContraste) {
            toggleAltoContraste.addEventListener('change', (e) => {
                this.alterarAltoContraste(e.target.checked);
            });
        }

        // Tamanho da fonte
        const selectTamanhoFonte = document.getElementById('tamanho-fonte-select');
        if (selectTamanhoFonte) {
            selectTamanhoFonte.addEventListener('change', (e) => {
                this.alterarTamanhoFonte(e.target.value);
            });
        }

        // Animações
        const toggleAnimacoes = document.getElementById('animacoes-toggle');
        if (toggleAnimacoes) {
            toggleAnimacoes.addEventListener('change', (e) => {
                this.alterarAnimacoes(e.target.checked);
            });
        }

        // Volume da música
        const sliderVolume = document.getElementById('music-volume-slider');
        if (sliderVolume) {
            sliderVolume.addEventListener('input', (e) => {
                this.alterarVolumeMusica(e.target.value);
                e.target.setAttribute('aria-valuetext', `${e.target.value}%`);
            });
        }

        // Música de fundo
        const toggleMusica = document.getElementById('music-toggle');
        if (toggleMusica) {
            toggleMusica.addEventListener('change', (e) => {
                this.alterarMusicaFundo(e.target.checked);
            });
        }

        // Atalhos de teclado específicos das configurações
        document.addEventListener('keydown', (e) => {
            // Ctrl + R = Restaurar padrões
            if (e.ctrlKey && e.key === 'r') {
                e.preventDefault();
                this.resetarConfiguracoes();
            }
        });
    }

    // Sincroniza com o sistema de acessibilidade principal
    sincronizarComSistemaAcessibilidade() {
        // Aguarda o sistema de acessibilidade estar carregado
        const verificarSistema = () => {
            if (window.sistemaAcessibilidade) {
                // Aplicar configurações já salvas
                this.aplicarConfiguracoesAtuais();
            } else {
                setTimeout(verificarSistema, 100);
            }
        };
        verificarSistema();
    }

    // Aplica as configurações atuais
    aplicarConfiguracoesAtuais() {
        const altoContraste = localStorage.getItem('altoContraste') === 'true';
        const tamanhoFonte = localStorage.getItem('tamanhoFonte') || 'normal';
        const animacoes = localStorage.getItem('animacoesAtivas') !== 'false';

        if (altoContraste) {
            document.body.classList.add('alto-contraste');
        }

        document.body.classList.remove('fonte-pequena', 'fonte-normal', 'fonte-grande', 'fonte-extra-grande');
        document.body.classList.add(`fonte-${tamanhoFonte}`);

        if (!animacoes) {
            document.body.classList.add('reducir-animacoes');
        }
    }

    // Altera configuração de alto contraste
    alterarAltoContraste(ativo) {
        localStorage.setItem('altoContraste', ativo.toString());
        document.body.classList.toggle('alto-contraste', ativo);
        
        if (window.sistemaAcessibilidade) {
            sistemaAcessibilidade.altoContraste = ativo;
            sistemaAcessibilidade.anunciar(ativo ? 'Alto contraste ativado' : 'Alto contraste desativado');
        }
    }

    // Altera tamanho da fonte
    alterarTamanhoFonte(tamanho) {
        localStorage.setItem('tamanhoFonte', tamanho);
        
        // Remove classes anteriores
        document.body.classList.remove('fonte-pequena', 'fonte-normal', 'fonte-grande', 'fonte-extra-grande');
        
        // Adiciona nova classe
        document.body.classList.add(`fonte-${tamanho}`);
        
        if (window.sistemaAcessibilidade) {
            sistemaAcessibilidade.tamanhoFonte = tamanho;
            sistemaAcessibilidade.anunciar(`Tamanho da fonte alterado para ${tamanho}`);
        }
    }

    // Altera configuração de animações
    alterarAnimacoes(ativo) {
        localStorage.setItem('animacoesAtivas', ativo.toString());
        document.body.classList.toggle('reducir-animacoes', !ativo);
        
        if (window.sistemaAcessibilidade) {
            sistemaAcessibilidade.anunciar(ativo ? 'Animações ativadas' : 'Animações reduzidas para melhor acessibilidade');
        }
    }

    // Altera volume da música
    alterarVolumeMusica(volume) {
        localStorage.setItem('volumeMusica', volume);
        
        // Aplicar volume se houver sistema de áudio
        if (window.audioSystem) {
            audioSystem.setVolume(volume / 100);
        }
        
        if (window.sistemaAcessibilidade) {
            sistemaAcessibilidade.anunciar(`Volume da música ajustado para ${volume}%`);
        }
    }

    // Altera música de fundo
    alterarMusicaFundo(ativo) {
        localStorage.setItem('musicaAtiva', ativo.toString());
        
        // Controlar música se houver sistema de áudio
        if (window.audioSystem) {
            if (ativo) {
                audioSystem.playBackgroundMusic();
            } else {
                audioSystem.stopBackgroundMusic();
            }
        }
        
        if (window.sistemaAcessibilidade) {
            sistemaAcessibilidade.anunciar(ativo ? 'Música de fundo ativada' : 'Música de fundo desativada');
        }
    }

    // Restaura configurações padrão
    resetarConfiguracoes() {
        // Confirmar ação
        const confirmReset = confirm('Deseja restaurar todas as configurações para os valores padrão?');
        if (!confirmReset) return;

        // Restaurar valores padrão
        const configsPadrao = {
            altoContraste: false,
            tamanhoFonte: 'normal',
            animacoesAtivas: true,
            volumeMusica: '50',
            musicaAtiva: true
        };

        // Salvar no localStorage
        Object.keys(configsPadrao).forEach(config => {
            localStorage.setItem(config, configsPadrao[config].toString());
        });

        // Recarregar configurações na interface
        this.carregarConfiguracoes();
        this.aplicarConfiguracoesAtuais();

        if (window.sistemaAcessibilidade) {
            sistemaAcessibilidade.anunciar('Configurações restauradas para os valores padrão');
        }
    }

    // Exporta configurações (para backup)
    exportarConfiguracoes() {
        const configs = {
            altoContraste: localStorage.getItem('altoContraste') === 'true',
            tamanhoFonte: localStorage.getItem('tamanhoFonte') || 'normal',
            animacoesAtivas: localStorage.getItem('animacoesAtivas') !== 'false',
            volumeMusica: localStorage.getItem('volumeMusica') || '50',
            musicaAtiva: localStorage.getItem('musicaAtiva') !== 'false'
        };

        const blob = new Blob([JSON.stringify(configs, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = 'configuracoes-camadas-game.json';
        link.click();
        
        URL.revokeObjectURL(url);
        
        if (window.sistemaAcessibilidade) {
            sistemaAcessibilidade.anunciar('Configurações exportadas com sucesso');
        }
    }

    // Importa configurações (de backup)
    importarConfiguracoes(arquivo) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const configs = JSON.parse(e.target.result);
                
                // Validar e aplicar configurações
                Object.keys(configs).forEach(config => {
                    if (configs[config] !== undefined) {
                        localStorage.setItem(config, configs[config].toString());
                    }
                });

                // Recarregar interface
                this.carregarConfiguracoes();
                this.aplicarConfiguracoesAtuais();

                if (window.sistemaAcessibilidade) {
                    sistemaAcessibilidade.anunciar('Configurações importadas com sucesso');
                }
            } catch (error) {
                alert('Erro ao importar configurações. Verifique se o arquivo é válido.');
                if (window.sistemaAcessibilidade) {
                    sistemaAcessibilidade.anunciar('Erro ao importar configurações', true);
                }
            }
        };
        reader.readAsText(arquivo);
    }
}

// Função global para resetar configurações
function resetarConfiguracoes() {
    if (window.configuracoesAcessibilidade) {
        configuracoesAcessibilidade.resetarConfiguracoes();
    }
}

// Inicializar quando o DOM estiver carregado
let configuracoesAcessibilidade;
document.addEventListener('DOMContentLoaded', () => {
    configuracoesAcessibilidade = new ConfiguracoesAcessibilidade();
});

// Adicionar classe CSS para animações reduzidas
const style = document.createElement('style');
style.textContent = `
    .reducir-animacoes *,
    .reducir-animacoes *::before,
    .reducir-animacoes *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
        scroll-behavior: auto !important;
    }
`;
document.head.appendChild(style);