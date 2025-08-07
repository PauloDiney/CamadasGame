// Fase 1: Modelo em Camadas (Drag & Drop)
const Phase1Handler = {
    score: 0,
    draggedElement: null,
    correctOrder: ['aplicacao', 'transporte', 'rede', 'enlace', 'fisica'],
    currentOrder: [],
    attempts: 0,
    layerScores: {},

    // Inicializar fase
    init() {
        this.score = 0;
        this.currentOrder = [];
        this.attempts = 0;
        this.layerScores = {};
        this.createPhaseInterface();
        this.setupDragAndDrop();
        GamePhases.updatePhaseScore(this.score);
    },

    // Criar interface da fase
    createPhaseInterface() {
        const gameArea = document.getElementById('phase-game-area');
        if (!gameArea) return;

        const phaseData = GameData.phases[1].data;
        
        gameArea.innerHTML = `
            <div class="phase1-container">
                <div class="instructions-panel">
                    <h3>📡 Organize as Camadas do Modelo OSI</h3>
                    <p>${GameData.messages.phase1.instructions}</p>
                    <div class="score-breakdown">
                        <div class="scoring-info">
                            <span>+${phaseData.scoring.correctLayer} pontos por camada correta</span>
                            <span>${phaseData.scoring.wrongLayer} pontos por erro</span>
                            <span>+${phaseData.scoring.completion} pontos ao completar</span>
                        </div>
                    </div>
                </div>

                <div class="game-layout">
                    <div class="layers-source">
                        <h4>Camadas Disponíveis</h4>
                        <div id="layers-container" class="layers-container">
                            ${this.generateLayerCards(phaseData.layers)}
                        </div>
                    </div>

                    <div class="drop-zones">
                        <h4>Ordem Correta (de cima para baixo)</h4>
                        <div id="drop-zones-container" class="drop-zones-container">
                            ${this.generateDropZones()}
                        </div>
                    </div>
                </div>

                <div class="feedback-area">
                    <div id="feedback-message" class="feedback-message"></div>
                    <div class="progress-indicator">
                        <span>Progresso: <span id="progress-count">0</span>/5 camadas</span>
                    </div>
                </div>
            </div>
        `;
    },

    // Gerar cards das camadas
    generateLayerCards(layers) {
        const shuffledLayers = GamePhases.shuffle(layers);
        
        return shuffledLayers.map(layer => `
            <div class="layer-card draggable" 
                 draggable="true" 
                 data-layer-id="${layer.id}"
                 data-order="${layer.order}">
                <div class="layer-header">
                    <h4>${layer.name}</h4>
                    <span class="layer-number">${layer.order}</span>
                </div>
                <p class="layer-description">${layer.description}</p>
                <div class="drag-handle">⋮⋮</div>
            </div>
        `).join('');
    },

    // Gerar zonas de drop
    generateDropZones() {
        return Array.from({ length: 5 }, (_, i) => `
            <div class="drop-zone" 
                 data-position="${i + 1}"
                 ondrop="Phase1Handler.handleDrop(event)" 
                 ondragover="Phase1Handler.handleDragOver(event)"
                 ondragenter="Phase1Handler.handleDragEnter(event)"
                 ondragleave="Phase1Handler.handleDragLeave(event)">
                <div class="drop-zone-label">Posição ${i + 1}</div>
                <div class="drop-zone-content">
                    <span class="drop-hint">Solte a camada aqui</span>
                </div>
            </div>
        `).join('');
    },

    // Configurar drag and drop
    setupDragAndDrop() {
        const layerCards = document.querySelectorAll('.layer-card');
        
        layerCards.forEach(card => {
            card.addEventListener('dragstart', this.handleDragStart.bind(this));
            card.addEventListener('dragend', this.handleDragEnd.bind(this));
        });
    },

    // Iniciar arraste
    handleDragStart(event) {
        this.draggedElement = event.target;
        event.target.classList.add('dragging');
        
        // Destacar zonas de drop válidas
        const dropZones = document.querySelectorAll('.drop-zone:not(.filled)');
        dropZones.forEach(zone => {
            zone.classList.add('drop-available');
        });
    },

    // Finalizar arraste
    handleDragEnd(event) {
        event.target.classList.remove('dragging');
        
        // Remover destaque das zonas
        const dropZones = document.querySelectorAll('.drop-zone');
        dropZones.forEach(zone => {
            zone.classList.remove('drop-available', 'drag-over');
        });
        
        this.draggedElement = null;
    },

    // Permitir drop
    handleDragOver(event) {
        event.preventDefault();
    },

    // Entrar na zona de drop
    handleDragEnter(event) {
        event.preventDefault();
        const dropZone = event.currentTarget;
        
        if (!dropZone.classList.contains('filled')) {
            dropZone.classList.add('drag-over');
        }
    },

    // Sair da zona de drop
    handleDragLeave(event) {
        event.currentTarget.classList.remove('drag-over');
    },

    // Processar drop
    handleDrop(event) {
        event.preventDefault();
        
        if (!this.draggedElement) return;
        
        const dropZone = event.currentTarget;
        
        // Verificar se a zona está vazia
        if (dropZone.classList.contains('filled')) {
            this.showFeedback('Esta posição já está ocupada!', 'warning');
            return;
        }
        
        // Obter dados
        const layerId = this.draggedElement.dataset.layerId;
        const layerOrder = parseInt(this.draggedElement.dataset.layerOrder);
        const position = parseInt(dropZone.dataset.position);
        
        // Colocar camada na posição
        this.placeLayers(layerId, position, dropZone);
        
        // Remover da área de origem
        this.draggedElement.remove();
        
        // Verificar resposta
        this.checkAnswer(layerId, position);
        
        // Atualizar progresso
        this.updateProgress();
        
        // Verificar se completou
        if (this.currentOrder.length === 5) {
            setTimeout(() => {
                this.checkCompletion();
            }, 500);
        }
    },

    // Colocar camada na posição
    placeLayers(layerId, position, dropZone) {
        const phaseData = GameData.phases[1].data;
        const layer = phaseData.layers.find(l => l.id === layerId);
        
        if (!layer) return;
        
        // Atualizar zona de drop
        dropZone.classList.add('filled');
        dropZone.querySelector('.drop-zone-content').innerHTML = `
            <div class="placed-layer" data-layer-id="${layerId}">
                <h4>${layer.name}</h4>
                <p>${layer.description}</p>
                <button class="remove-layer-btn" onclick="Phase1Handler.removeLayer(${position})">
                    ✕
                </button>
            </div>
        `;
        
        // Registrar na ordem atual
        this.currentOrder[position - 1] = layerId;
    },

    // Remover camada da posição
    removeLayer(position) {
        const dropZone = document.querySelector(`.drop-zone[data-position="${position}"]`);
        if (!dropZone) return;
        
        const layerId = this.currentOrder[position - 1];
        const phaseData = GameData.phases[1].data;
        const layer = phaseData.layers.find(l => l.id === layerId);
        
        if (!layer) return;
        
        // Restaurar zona de drop
        dropZone.classList.remove('filled');
        dropZone.querySelector('.drop-zone-content').innerHTML = `
            <span class="drop-hint">Solte a camada aqui</span>
        `;
        
        // Recriar card na área de origem
        const layersContainer = document.getElementById('layers-container');
        const layerCard = document.createElement('div');
        layerCard.className = 'layer-card draggable';
        layerCard.draggable = true;
        layerCard.dataset.layerId = layer.id;
        layerCard.dataset.layerOrder = layer.order;
        layerCard.innerHTML = `
            <div class="layer-header">
                <h4>${layer.name}</h4>
                <span class="layer-number">${layer.order}</span>
            </div>
            <p class="layer-description">${layer.description}</p>
            <div class="drag-handle">⋮⋮</div>
        `;
        
        // Adicionar eventos
        layerCard.addEventListener('dragstart', this.handleDragStart.bind(this));
        layerCard.addEventListener('dragend', this.handleDragEnd.bind(this));
        
        layersContainer.appendChild(layerCard);
        
        // Remover da ordem atual
        this.currentOrder[position - 1] = null;
        
        // Remover pontuação se havia
        if (this.layerScores[layerId]) {
            this.score -= this.layerScores[layerId];
            delete this.layerScores[layerId];
            GamePhases.updatePhaseScore(this.score);
        }
        
        this.updateProgress();
    },

    // Verificar resposta
    checkAnswer(layerId, position) {
        const phaseData = GameData.phases[1].data;
        const layer = phaseData.layers.find(l => l.id === layerId);
        const correctPosition = layer.order;
        const isCorrect = correctPosition === position;
        
        this.attempts++;
        
        if (isCorrect) {
            // Resposta correta
            const points = phaseData.scoring.correctLayer;
            this.score += points;
            this.layerScores[layerId] = points;
            
            this.showFeedback(GameData.messages.phase1.correct, 'success');
            
            // Efeito visual na zona
            const dropZone = document.querySelector(`.drop-zone[data-position="${position}"]`);
            GamePhases.showSuccessEffect(dropZone);
            
        } else {
            // Resposta incorreta
            const points = phaseData.scoring.wrongLayer;
            this.score = Math.max(0, this.score + points); // Não deixar negativo
            this.layerScores[layerId] = points;
            
            this.showFeedback(GameData.messages.phase1.wrong, 'error');
            
            // Efeito visual na zona
            const dropZone = document.querySelector(`.drop-zone[data-position="${position}"]`);
            GamePhases.showErrorEffect(dropZone);
        }
        
        GamePhases.updatePhaseScore(this.score);
    },

    // Verificar conclusão
    checkCompletion() {
        const allCorrect = this.correctOrder.every((layerId, index) => {
            return this.currentOrder[index] === layerId;
        });
        
        if (allCorrect) {
            // Bônus de conclusão
            const phaseData = GameData.phases[1].data;
            this.score += phaseData.scoring.completion;
            GamePhases.updatePhaseScore(this.score);
            
            this.showFeedback(GameData.messages.phase1.completed, 'success');
            
            // Efeito visual de vitória
            const dropZones = document.querySelectorAll('.drop-zone.filled');
            dropZones.forEach((zone, index) => {
                setTimeout(() => {
                    zone.classList.add('sparkle-effect');
                }, index * 200);
            });
            
            // Habilitar botão de finalizar
            const completeButton = document.getElementById('complete-phase-btn');
            if (completeButton) {
                completeButton.disabled = false;
                completeButton.classList.add('pulse');
            }
        }
    },

    // Atualizar progresso
    updateProgress() {
        const filledCount = this.currentOrder.filter(layer => layer !== null).length;
        const progressElement = document.getElementById('progress-count');
        if (progressElement) {
            progressElement.textContent = filledCount;
        }
        
        // Atualizar barra de progresso visual
        const progressBar = document.querySelector('.progress-bar');
        if (progressBar) {
            const percentage = (filledCount / 5) * 100;
            progressBar.style.width = `${percentage}%`;
        }
    },

    // Mostrar feedback
    showFeedback(message, type) {
        const feedbackElement = document.getElementById('feedback-message');
        if (feedbackElement) {
            feedbackElement.textContent = message;
            feedbackElement.className = `feedback-message ${type}`;
            
            // Remover após 3 segundos
            setTimeout(() => {
                feedbackElement.textContent = '';
                feedbackElement.className = 'feedback-message';
            }, 3000);
        }
    },

    // Resetar fase
    reset() {
        this.init();
    },

    // Verificar se há progresso
    hasProgress() {
        return this.currentOrder.some(layer => layer !== null);
    },

    // Obter pontuação atual
    getScore() {
        return this.score;
    },

    // Dar dica ao jogador
    showHint() {
        const hints = [
            "A camada de Aplicação é onde os usuários interagem com a rede",
            "A camada Física é responsável pela transmissão dos bits",
            "A camada de Transporte garante a entrega confiável dos dados",
            "A camada de Rede faz o roteamento dos pacotes",
            "A camada de Enlace controla o acesso ao meio físico"
        ];
        
        const randomHint = hints[Math.floor(Math.random() * hints.length)];
        GamePhases.showHint(randomHint, 4000);
    }
};

// Registrar handler da fase
GamePhases.registerPhaseHandler(1, Phase1Handler);

// Exportar para uso global
window.Phase1Handler = Phase1Handler;
