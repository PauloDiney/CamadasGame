/**
 * Sistema de Reset de Progresso - CamadasGame
 * Permite aos usuários resetar completamente seu progresso no jogo
 */

// Função principal para resetar progresso
function resetarProgresso() {
    // Mostra modal de confirmação personalizado
    mostrarModalReset();
}

// Cria e mostra modal de confirmação
function mostrarModalReset() {
    // Remove modal existente se houver
    const modalExistente = document.getElementById('modal-reset');
    if (modalExistente) {
        modalExistente.remove();
    }

    // Cria modal
    const modal = document.createElement('div');
    modal.id = 'modal-reset';
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content" role="dialog" aria-labelledby="reset-titulo" aria-describedby="reset-descricao">
            <div class="modal-header">
                <h2 id="reset-titulo">⚠️ Resetar Progresso</h2>
                <button class="btn-fechar-modal" onclick="fecharModalReset()" aria-label="Fechar modal">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2"/>
                    </svg>
                </button>
            </div>
            
            <div class="modal-body">
                <div id="reset-descricao" class="reset-warning">
                    <p><strong>Esta ação não pode ser desfeita!</strong></p>
                    <p>Resetar o progresso irá:</p>
                    <ul>
                        <li>🔄 Zerar todos os pontos acumulados</li>
                        <li>🔒 Bloquear todas as fases (exceto a primeira)</li>
                        <li>📊 Apagar estatísticas e conquistas</li>
                        <li>⚙️ Manter suas configurações de acessibilidade</li>
                        <li>🎵 Manter suas preferências de áudio</li>
                    </ul>
                    <p>Tem certeza que deseja continuar?</p>
                </div>
                
                <div class="reset-opcoes">
                    <label class="opcao-reset">
                        <input type="checkbox" id="manter-configs" checked>
                        <span>Manter configurações de acessibilidade</span>
                    </label>
                    <label class="opcao-reset">
                        <input type="checkbox" id="manter-audio" checked>
                        <span>Manter preferências de áudio</span>
                    </label>
                </div>
            </div>
            
            <div class="modal-footer">
                <button class="btn-secundario" onclick="fecharModalReset()">
                    Cancelar
                </button>
                <button class="btn-perigo" onclick="confirmarReset()" id="btn-confirmar-reset">
                    Resetar Progresso
                </button>
            </div>
        </div>
    `;

    // Adiciona modal ao body
    document.body.appendChild(modal);

    // Foca no botão de fechar para acessibilidade
    modal.querySelector('.btn-fechar-modal').focus();

    // Configura eventos de teclado
    modal.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            fecharModalReset();
        }
    });

    // Anúncia para leitores de tela
    if (typeof anunciarParaLeitorTela === 'function') {
        anunciarParaLeitorTela('Modal de reset de progresso aberto. Esta ação é irreversível.', true);
    }
}

// Fecha modal de reset
function fecharModalReset() {
    const modal = document.getElementById('modal-reset');
    if (modal) {
        modal.remove();
        
        // Anúncia fechamento
        if (typeof anunciarParaLeitorTela === 'function') {
            anunciarParaLeitorTela('Modal de reset cancelado');
        }
    }
}

// Confirma e executa o reset
function confirmarReset() {
    const manterConfigs = document.getElementById('manter-configs').checked;
    const manterAudio = document.getElementById('manter-audio').checked;

    // Salva configurações que devem ser mantidas
    let configsSalvas = {};
    if (manterConfigs) {
        configsSalvas.altoContraste = localStorage.getItem('altoContraste');
        configsSalvas.tamanhoFonte = localStorage.getItem('tamanhoFonte');
        configsSalvas.animacoesAtivas = localStorage.getItem('animacoesAtivas');
    }
    if (manterAudio) {
        configsSalvas.volumeMusica = localStorage.getItem('volumeMusica');
        configsSalvas.musicaAtiva = localStorage.getItem('musicaAtiva');
    }

    // Executa o reset
    executarReset(configsSalvas);
    
    // Fecha modal
    fecharModalReset();
}

// Executa o reset propriamente dito
function executarReset(configsSalvas = {}) {
    try {
        // Lista de chaves do localStorage relacionadas ao progresso
        const chavesProgresso = [
            'gamePoints',
            'trilhaProgresso',
            'fase1Completa',
            'fase2Completa',
            'fase3Completa',
            'fase4Completa',
            'fase5Completa',
            'estatisticasJogo',
            'conquistasDesbloqueadas',
            'equipamentosComprados',
            'habilidadesAtivas',
            'melhorTempo',
            'totalJogadas',
            'dataUltimaJogada'
        ];

        // Remove dados de progresso
        chavesProgresso.forEach(chave => {
            localStorage.removeItem(chave);
        });

        // Restaura configurações salvas
        Object.keys(configsSalvas).forEach(chave => {
            if (configsSalvas[chave] !== null && configsSalvas[chave] !== undefined) {
                localStorage.setItem(chave, configsSalvas[chave]);
            }
        });

        // Reinicia dados básicos
        localStorage.setItem('gamePoints', '0');
        localStorage.setItem('trilhaProgresso', JSON.stringify({
            1: { concluida: false, desbloqueada: true },
            2: { concluida: false, desbloqueada: false },
            3: { concluida: false, desbloqueada: false },
            4: { concluida: false, desbloqueada: false },
            5: { concluida: false, desbloqueada: false }
        }));

        // Mostra confirmação de sucesso
        mostrarConfirmacaoReset();

        // Atualiza interface atual
        setTimeout(() => {
            atualizarInterfaceAposReset();
        }, 2000);

    } catch (error) {
        console.error('Erro ao resetar progresso:', error);
        mostrarErroReset();
    }
}

// Mostra confirmação de reset bem-sucedido
function mostrarConfirmacaoReset() {
    const confirmacao = document.createElement('div');
    confirmacao.className = 'toast-confirmacao reset-sucesso';
    confirmacao.innerHTML = `
        <div class="toast-content">
            <div class="toast-icone">✅</div>
            <div class="toast-texto">
                <strong>Progresso Resetado!</strong>
                <p>Seu jogo foi reiniciado com sucesso.</p>
            </div>
        </div>
    `;

    document.body.appendChild(confirmacao);

    // Remove após 4 segundos
    setTimeout(() => {
        confirmacao.remove();
    }, 4000);

    // Anúncia sucesso
    if (typeof anunciarParaLeitorTela === 'function') {
        anunciarParaLeitorTela('Progresso resetado com sucesso! Seu jogo foi reiniciado.');
    }
}

// Mostra erro no reset
function mostrarErroReset() {
    const erro = document.createElement('div');
    erro.className = 'toast-confirmacao reset-erro';
    erro.innerHTML = `
        <div class="toast-content">
            <div class="toast-icone">❌</div>
            <div class="toast-texto">
                <strong>Erro no Reset!</strong>
                <p>Ocorreu um problema. Tente novamente.</p>
            </div>
        </div>
    `;

    document.body.appendChild(erro);

    setTimeout(() => {
        erro.remove();
    }, 4000);

    if (typeof anunciarParaLeitorTela === 'function') {
        anunciarParaLeitorTela('Erro ao resetar progresso. Tente novamente.', true);
    }
}

// Atualiza interface após reset
function atualizarInterfaceAposReset() {
    // Atualizar pontos exibidos
    const pontosDisplay = document.getElementById('pontos-display');
    if (pontosDisplay) {
        pontosDisplay.textContent = '0 Pontos';
    }

    const pontosTrilha = document.getElementById('pontos-trilha-display');
    if (pontosTrilha) {
        pontosTrilha.textContent = '0 Pontos';
    }

    // Atualizar estado das fases na trilha
    const fasesNodes = document.querySelectorAll('.fase-node');
    fasesNodes.forEach((node, index) => {
        if (index === 0) {
            // Primeira fase permanece disponível
            node.classList.remove('fase-bloqueada', 'fase-concluida');
            node.classList.add('fase-disponivel');
            const status = node.querySelector('.fase-status span');
            if (status) {
                status.textContent = 'Disponível';
                status.className = 'status-disponivel';
            }
        } else {
            // Outras fases ficam bloqueadas
            node.classList.remove('fase-disponivel', 'fase-concluida');
            node.classList.add('fase-bloqueada');
            const status = node.querySelector('.fase-status span');
            if (status) {
                status.textContent = 'Bloqueada';
                status.className = 'status-bloqueada';
            }
        }
    });

    // Limpar equipamentos ativos
    const equipamentosContainer = document.getElementById('equipamentos-container');
    if (equipamentosContainer) {
        equipamentosContainer.innerHTML = `
            <div class="no-equipment">
                <p>Nenhum equipamento ativo</p>
                <p class="suggestion">Visite a <a href="loja.html" aria-label="Ir para loja de equipamentos">Loja</a> para comprar equipamentos!</p>
            </div>
        `;
    }

    // Recarregar página se necessário
    if (window.location.pathname.includes('trilha.html')) {
        setTimeout(() => {
            window.location.reload();
        }, 1000);
    }
}

// Adiciona atalho de teclado para reset (Ctrl + Shift + R)
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.shiftKey && e.key === 'R') {
        e.preventDefault();
        resetarProgresso();
    }
});

// Função utilitária para confirmar reset por código
function resetarProgressoForcado() {
    if (confirm('ATENÇÃO: Esta ação irá resetar TODO o progresso. Continuar?')) {
        executarReset();
        alert('Progresso resetado! A página será recarregada.');
        window.location.reload();
    }
}

// Exporta funcionalidades para debug
window.debugReset = {
    resetarTudo: () => executarReset(),
    resetarSemConfigs: () => executarReset({}),
    resetarMantendoConfigs: () => executarReset({
        altoContraste: localStorage.getItem('altoContraste'),
        tamanhoFonte: localStorage.getItem('tamanhoFonte'),
        animacoesAtivas: localStorage.getItem('animacoesAtivas'),
        volumeMusica: localStorage.getItem('volumeMusica'),
        musicaAtiva: localStorage.getItem('musicaAtiva')
    })
};