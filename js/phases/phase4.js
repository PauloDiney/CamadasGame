// Fase 4: Armazenamento Distribuído (Distribution)
const Phase4Handler = {
    score: 0,
    serverLoads: { 'servidor-a': 0, 'servidor-b': 0, 'servidor-c': 0 },
    dataAssignments: {},
    draggedData: null,
    attempts: 0,
    completed: false,

    // Inicializar fase
    init() {
        this.score = 0;
        this.serverLoads = { 'servidor-a': 0, 'servidor-b': 0, 'servidor-c': 0 };
        this.dataAssignments = {};
        this.draggedData = null;
        this.attempts = 0;
        this.completed = false;
        this.createPhaseInterface();
        GamePhases.updatePhaseScore(this.score);
    },

    // Criar interface da fase
    createPhaseInterface() {
        const gameArea = document.getElementById('phase-game-area');
        if (!gameArea) return;

        const phaseData = GameData.phases[4].data;
        
        gameArea.innerHTML = `
            <div class="phase4-container">
                <div class="instructions-panel">
                    <h3>🌐 Armazenamento Distribuído</h3>
                    <p>${GameData.messages.phase4.instructions}</p>
                    <div class="concept-explanation">
                        <div class="concept-box">
                            <h4>⚖️ Balanceamento de Carga</h4>
                            <p>Distribua os dados de forma <strong>equilibrada</strong> entre os servidores para otimizar performance e evitar sobrecarga.</p>
                        </div>
                        <div class="scoring-info">
                            <span>⚖️ Balanceado: +${phaseData.scoring.balanced} pontos</span>
                            <span>⚠️ Desbalanceado: +${phaseData.scoring.unbalanced} pontos</span>
                            <span>🔴 Sobrecarregado: +${phaseData.scoring.overloaded} pontos</span>
                        </div>
                    </div>
                </div>

                <div class="distribution-area">
                    <div class="data-source">
                        <h4>📦 Dados para Distribuir</h4>
                        <div id="data-container" class="data-container">
                            ${this.generateDataItems(phaseData.data)}
                        </div>
                        <div class="total-data">
                            Total: ${phaseData.data.reduce((sum, item) => sum + item.size, 0)} GB
                        </div>
                    </div>

                    <div class="servers-area">
                        <h4>🖥️ Servidores Disponíveis</h4>
                        <div id="servers-container" class="servers-container">
                            ${this.generateServerCards(phaseData.servers)}
                        </div>
                    </div>
                </div>

                <div class="distribution-analysis">
                    <div class="load-balance-info">
                        <h4>📊 Análise de Balanceamento</h4>
                        <div id="balance-chart" class="balance-chart">
                            ${this.generateBalanceChart()}
                        </div>
                        <div id="balance-status" class="balance-status">
                            <span class="status-indicator">Aguardando distribuição...</span>
                        </div>
                    </div>

                    <div class="action-buttons">
                        <button id="analyze-btn" class="secondary-btn" onclick="Phase4Handler.analyzeDistribution()">
                            📊 Analisar Distribuição
                        </button>
                        <button id="check-answer-btn" class="primary-btn" onclick="Phase4Handler.checkAnswer()" disabled>
                            ✅ Finalizar Distribuição
                        </button>
                        <button id="show-hint-btn" class="secondary-btn" onclick="Phase4Handler.showHint()">
                            💡 Dica
                        </button>
                    </div>
                </div>

                <div class="feedback-area">
                    <div id="feedback-message" class="feedback-message"></div>
                    <div id="detailed-explanation" class="detailed-explanation" style="display: none;"></div>
                </div>
            </div>
        `;

        this.setupDragAndDrop();
    },

    // Gerar itens de dados
    generateDataItems(dataItems) {
        return dataItems.map(item => `
            <div class="data-item draggable" 
                 draggable="true" 
                 data-data-id="${item.id}"
                 data-size="${item.size}"
                 data-type="${item.type}">
                <div class="data-header">
                    <span class="data-icon">${this.getDataTypeIcon(item.type)}</span>
                    <h4>${item.name}</h4>
                </div>
                <div class="data-info">
                    <span class="data-size">${item.size} GB</span>
                    <span class="data-type">${this.getDataTypeLabel(item.type)}</span>
                </div>
                <div class="drag-handle">⋮⋮</div>
            </div>
        `).join('');
    },

    // Obter ícone do tipo de dados
    getDataTypeIcon(type) {
        const icons = {
            'media': '🎵',
            'documents': '📄',
            'images': '🖼️'
        };
        return icons[type] || '📦';
    },

    // Obter label do tipo de dados
    getDataTypeLabel(type) {
        const labels = {
            'media': 'Mídia',
            'documents': 'Documentos',
            'images': 'Imagens'
        };
        return labels[type] || 'Dados';
    },

    // Gerar cards dos servidores
    generateServerCards(servers) {
        return servers.map(server => `
            <div class="server-card" 
                 data-server-id="${server.id}"
                 ondrop="Phase4Handler.handleDrop(event)" 
                 ondragover="Phase4Handler.handleDragOver(event)"
                 ondragenter="Phase4Handler.handleDragEnter(event)"
                 ondragleave="Phase4Handler.handleDragLeave(event)">
                <div class="server-header">
                    <span class="server-icon">🖥️</span>
                    <h4>${server.name}</h4>
                    <span class="server-location">📍 ${server.location}</span>
                </div>
                
                <div class="server-capacity">
                    <div class="capacity-bar">
                        <div class="capacity-fill" id="capacity-${server.id}" style="width: 0%;"></div>
                    </div>
                    <div class="capacity-text">
                        <span id="used-${server.id}">0</span>/${server.capacity} GB
                    </div>
                </div>

                <div class="server-data" id="server-data-${server.id}">
                    <div class="drop-hint">Arraste os dados aqui</div>
                </div>

                <div class="server-stats">
                    <div class="load-percentage" id="load-${server.id}">0%</div>
                    <div class="data-count" id="count-${server.id}">0 itens</div>
                </div>
            </div>
        `).join('');
    },

    // Gerar gráfico de balanceamento
    generateBalanceChart() {
        return `
            <div class="chart-bars">
                <div class="chart-bar">
                    <div class="bar-fill" id="bar-servidor-a" style="height: 0%;"></div>
                    <div class="bar-label">Servidor A</div>
                </div>
                <div class="chart-bar">
                    <div class="bar-fill" id="bar-servidor-b" style="height: 0%;"></div>
                    <div class="bar-label">Servidor B</div>
                </div>
                <div class="chart-bar">
                    <div class="bar-fill" id="bar-servidor-c" style="height: 0%;"></div>
                    <div class="bar-label">Servidor C</div>
                </div>
            </div>
            <div class="chart-legend">
                <span class="ideal-line">Linha ideal: 33.3%</span>
            </div>
        `;
    },

    // Configurar drag and drop
    setupDragAndDrop() {
        const dataItems = document.querySelectorAll('.data-item');
        
        dataItems.forEach(item => {
            item.addEventListener('dragstart', this.handleDragStart.bind(this));
            item.addEventListener('dragend', this.handleDragEnd.bind(this));
        });
    },

    // Iniciar arraste
    handleDragStart(event) {
        this.draggedData = event.target;
        event.target.classList.add('dragging');
        
        // Destacar servidores disponíveis
        const serverCards = document.querySelectorAll('.server-card');
        serverCards.forEach(card => {
            const serverId = card.dataset.serverId;
            const dataSize = parseInt(this.draggedData.dataset.size);
            const currentLoad = this.serverLoads[serverId];
            
            if (currentLoad + dataSize <= 100) {
                card.classList.add('drop-available');
            } else {
                card.classList.add('drop-unavailable');
            }
        });
    },

    // Finalizar arraste
    handleDragEnd(event) {
        event.target.classList.remove('dragging');
        
        // Remover destaques
        const serverCards = document.querySelectorAll('.server-card');
        serverCards.forEach(card => {
            card.classList.remove('drop-available', 'drop-unavailable', 'drag-over');
        });
        
        this.draggedData = null;
    },

    // Permitir drop
    handleDragOver(event) {
        event.preventDefault();
    },

    // Entrar na área de drop
    handleDragEnter(event) {
        event.preventDefault();
        const serverCard = event.currentTarget;
        const serverId = serverCard.dataset.serverId;
        const dataSize = parseInt(this.draggedData?.dataset.size || 0);
        const currentLoad = this.serverLoads[serverId];
        
        if (currentLoad + dataSize <= 100) {
            serverCard.classList.add('drag-over');
        }
    },

    // Sair da área de drop
    handleDragLeave(event) {
        event.currentTarget.classList.remove('drag-over');
    },

    // Processar drop
    handleDrop(event) {
        event.preventDefault();
        
        if (!this.draggedData) return;
        
        const serverCard = event.currentTarget;
        const serverId = serverCard.dataset.serverId;
        const dataId = this.draggedData.dataset.dataId;
        const dataSize = parseInt(this.draggedData.dataset.size);
        const currentLoad = this.serverLoads[serverId];
        
        // Verificar capacidade
        if (currentLoad + dataSize > 100) {
            this.showFeedback('Servidor não tem capacidade suficiente!', 'error');
            return;
        }
        
        // Verificar se o dado já foi atribuído
        if (this.dataAssignments[dataId]) {
            // Remover do servidor anterior
            const oldServerId = this.dataAssignments[dataId];
            this.removeDataFromServer(dataId, oldServerId);
        }
        
        // Adicionar ao novo servidor
        this.addDataToServer(dataId, serverId, dataSize);
        
        // Remover da área de origem
        this.draggedData.remove();
        
        // Atualizar interface
        this.updateServerDisplays();
        this.updateBalanceChart();
        this.updateActionButtons();
    },

    // Adicionar dados ao servidor
    addDataToServer(dataId, serverId, dataSize) {
        const phaseData = GameData.phases[4].data;
        const dataItem = phaseData.data.find(d => d.id === dataId);
        
        if (!dataItem) return;
        
        // Atualizar registros
        this.dataAssignments[dataId] = serverId;
        this.serverLoads[serverId] += dataSize;
        
        // Atualizar interface do servidor
        const serverDataArea = document.getElementById(`server-data-${serverId}`);
        if (serverDataArea) {
            // Remover hint se for o primeiro item
            const hint = serverDataArea.querySelector('.drop-hint');
            if (hint) {
                hint.style.display = 'none';
            }
            
            // Adicionar item visual
            const dataElement = document.createElement('div');
            dataElement.className = 'assigned-data-item';
            dataElement.dataset.dataId = dataId;
            dataElement.innerHTML = `
                <span class="data-icon">${this.getDataTypeIcon(dataItem.type)}</span>
                <span class="data-name">${dataItem.name}</span>
                <span class="data-size">${dataSize} GB</span>
                <button class="remove-data-btn" onclick="Phase4Handler.removeDataFromServer('${dataId}', '${serverId}')">
                    ✕
                </button>
            `;
            
            serverDataArea.appendChild(dataElement);
        }
    },

    // Remover dados do servidor
    removeDataFromServer(dataId, serverId) {
        const phaseData = GameData.phases[4].data;
        const dataItem = phaseData.data.find(d => d.id === dataId);
        
        if (!dataItem) return;
        
        // Atualizar registros
        delete this.dataAssignments[dataId];
        this.serverLoads[serverId] -= dataItem.size;
        
        // Remover da interface
        const dataElement = document.querySelector(`.assigned-data-item[data-data-id="${dataId}"]`);
        if (dataElement) {
            dataElement.remove();
        }
        
        // Recriar item na área de origem
        const dataContainer = document.getElementById('data-container');
        if (dataContainer) {
            const newDataItem = document.createElement('div');
            newDataItem.className = 'data-item draggable';
            newDataItem.draggable = true;
            newDataItem.dataset.dataId = dataItem.id;
            newDataItem.dataset.size = dataItem.size;
            newDataItem.dataset.type = dataItem.type;
            newDataItem.innerHTML = `
                <div class="data-header">
                    <span class="data-icon">${this.getDataTypeIcon(dataItem.type)}</span>
                    <h4>${dataItem.name}</h4>
                </div>
                <div class="data-info">
                    <span class="data-size">${dataItem.size} GB</span>
                    <span class="data-type">${this.getDataTypeLabel(dataItem.type)}</span>
                </div>
                <div class="drag-handle">⋮⋮</div>
            `;
            
            // Adicionar eventos
            newDataItem.addEventListener('dragstart', this.handleDragStart.bind(this));
            newDataItem.addEventListener('dragend', this.handleDragEnd.bind(this));
            
            dataContainer.appendChild(newDataItem);
        }
        
        // Mostrar hint se servidor ficar vazio
        const serverDataArea = document.getElementById(`server-data-${serverId}`);
        if (serverDataArea && Object.values(this.dataAssignments).filter(id => id === serverId).length === 0) {
            const hint = serverDataArea.querySelector('.drop-hint');
            if (hint) {
                hint.style.display = 'block';
            }
        }
        
        // Atualizar interface
        this.updateServerDisplays();
        this.updateBalanceChart();
        this.updateActionButtons();
    },

    // Atualizar displays dos servidores
    updateServerDisplays() {
        const phaseData = GameData.phases[4].data;
        
        phaseData.servers.forEach(server => {
            const serverId = server.id;
            const currentLoad = this.serverLoads[serverId];
            const percentage = (currentLoad / server.capacity) * 100;
            const itemCount = Object.values(this.dataAssignments).filter(id => id === serverId).length;
            
            // Atualizar barra de capacidade
            const capacityFill = document.getElementById(`capacity-${serverId}`);
            if (capacityFill) {
                capacityFill.style.width = `${percentage}%`;
                
                // Cores baseadas na carga
                if (percentage >= 90) {
                    capacityFill.className = 'capacity-fill overloaded';
                } else if (percentage >= 70) {
                    capacityFill.className = 'capacity-fill high-load';
                } else {
                    capacityFill.className = 'capacity-fill normal-load';
                }
            }
            
            // Atualizar texto de uso
            const usedElement = document.getElementById(`used-${serverId}`);
            if (usedElement) {
                usedElement.textContent = currentLoad;
            }
            
            // Atualizar percentual de carga
            const loadElement = document.getElementById(`load-${serverId}`);
            if (loadElement) {
                loadElement.textContent = `${Math.round(percentage)}%`;
            }
            
            // Atualizar contagem de itens
            const countElement = document.getElementById(`count-${serverId}`);
            if (countElement) {
                countElement.textContent = `${itemCount} ${itemCount === 1 ? 'item' : 'itens'}`;
            }
        });
    },

    // Atualizar gráfico de balanceamento
    updateBalanceChart() {
        const totalData = Object.keys(this.dataAssignments).length;
        const maxLoad = Math.max(...Object.values(this.serverLoads));
        
        Object.keys(this.serverLoads).forEach(serverId => {
            const load = this.serverLoads[serverId];
            const percentage = maxLoad > 0 ? (load / maxLoad) * 100 : 0;
            
            const barElement = document.getElementById(`bar-${serverId}`);
            if (barElement) {
                barElement.style.height = `${percentage}%`;
                
                // Cores baseadas no balanceamento
                const loadPercent = (load / 100) * 100;
                if (loadPercent >= 80) {
                    barElement.className = 'bar-fill overloaded';
                } else if (loadPercent >= 60) {
                    barElement.className = 'bar-fill high-load';
                } else {
                    barElement.className = 'bar-fill balanced';
                }
            }
        });
    },

    // Atualizar botões de ação
    updateActionButtons() {
        const totalData = 3; // Número total de itens de dados
        const assignedData = Object.keys(this.dataAssignments).length;
        
        const checkButton = document.getElementById('check-answer-btn');
        if (checkButton) {
            checkButton.disabled = assignedData < totalData || this.completed;
        }
        
        const analyzeButton = document.getElementById('analyze-btn');
        if (analyzeButton) {
            analyzeButton.disabled = assignedData === 0;
        }
    },

    // Analisar distribuição atual
    analyzeDistribution() {
        const balance = this.calculateBalance();
        const balanceStatus = document.getElementById('balance-status');
        
        if (balanceStatus) {
            let statusHTML = '';
            
            if (balance.isBalanced) {
                statusHTML = `
                    <span class="status-indicator balanced">✅ Distribuição Balanceada</span>
                    <p>Diferença máxima: ${balance.maxDifference} GB (${balance.maxDifferencePercent}%)</p>
                `;
            } else if (balance.isOverloaded) {
                statusHTML = `
                    <span class="status-indicator overloaded">🔴 Servidor Sobrecarregado</span>
                    <p>Servidor mais carregado: ${balance.maxLoadPercent}%</p>
                `;
            } else {
                statusHTML = `
                    <span class="status-indicator unbalanced">⚠️ Distribuição Desbalanceada</span>
                    <p>Diferença máxima: ${balance.maxDifference} GB (${balance.maxDifferencePercent}%)</p>
                `;
            }
            
            balanceStatus.innerHTML = statusHTML;
        }
        
        this.showFeedback(`Análise: ${balance.status}`, balance.isBalanced ? 'success' : 'warning');
    },

    // Calcular balanceamento
    calculateBalance() {
        const loads = Object.values(this.serverLoads);
        const totalLoad = loads.reduce((sum, load) => sum + load, 0);
        const averageLoad = totalLoad / loads.length;
        const maxLoad = Math.max(...loads);
        const minLoad = Math.min(...loads);
        const maxDifference = maxLoad - minLoad;
        const maxLoadPercent = Math.round((maxLoad / 100) * 100);
        const maxDifferencePercent = Math.round((maxDifference / averageLoad) * 100);
        
        const isOverloaded = maxLoadPercent >= 90;
        const isBalanced = maxDifferencePercent <= 20 && !isOverloaded;
        
        let status = '';
        if (isOverloaded) {
            status = 'Servidor sobrecarregado';
        } else if (isBalanced) {
            status = 'Bem balanceado';
        } else {
            status = 'Desbalanceado';
        }
        
        return {
            isBalanced,
            isOverloaded,
            maxLoad,
            minLoad,
            maxDifference,
            maxLoadPercent,
            maxDifferencePercent,
            averageLoad,
            status
        };
    },

    // Verificar resposta
    checkAnswer() {
        if (this.completed) return;
        
        this.attempts++;
        this.completed = true;
        
        const balance = this.calculateBalance();
        const phaseData = GameData.phases[4].data;
        
        if (balance.isBalanced) {
            this.score = phaseData.scoring.balanced;
            this.showFeedback(GameData.messages.phase4.completed, 'success');
        } else if (balance.isOverloaded) {
            this.score = phaseData.scoring.overloaded;
            this.showFeedback('Distribuição causa sobrecarga em servidor!', 'error');
        } else {
            this.score = phaseData.scoring.unbalanced;
            this.showFeedback('Distribuição desbalanceada, mas aceitável.', 'warning');
        }
        
        this.showDetailedExplanation(balance);
        GamePhases.updatePhaseScore(this.score);
        
        // Habilitar botão de finalizar
        const completeButton = document.getElementById('complete-phase-btn');
        if (completeButton) {
            completeButton.disabled = false;
            if (balance.isBalanced) {
                completeButton.classList.add('pulse');
            }
        }
        
        this.updateActionButtons();
    },

    // Mostrar explicação detalhada
    showDetailedExplanation(balance) {
        const explanationElement = document.getElementById('detailed-explanation');
        if (!explanationElement) return;
        
        const phaseData = GameData.phases[4].data;
        
        explanationElement.innerHTML = `
            <h4>📊 Análise Completa da Distribuição:</h4>
            <div class="distribution-analysis">
                <div class="balance-summary">
                    <h5>⚖️ Resumo do Balanceamento:</h5>
                    <div class="balance-metrics">
                        <div class="metric">
                            <strong>Carga Total:</strong> ${Object.values(this.serverLoads).reduce((a, b) => a + b, 0)} GB
                        </div>
                        <div class="metric">
                            <strong>Carga Média:</strong> ${Math.round(balance.averageLoad)} GB por servidor
                        </div>
                        <div class="metric">
                            <strong>Maior Diferença:</strong> ${balance.maxDifference} GB (${balance.maxDifferencePercent}%)
                        </div>
                        <div class="metric">
                            <strong>Status:</strong> ${balance.status}
                        </div>
                    </div>
                </div>
                
                <div class="servers-breakdown">
                    <h5>🖥️ Detalhamento por Servidor:</h5>
                    ${this.generateServersBreakdown()}
                </div>
                
                <div class="optimization-tips">
                    <h5>💡 Dicas de Otimização:</h5>
                    ${this.generateOptimizationTips(balance)}
                </div>
                
                <div class="key-concepts">
                    <h5>🔑 Conceitos Importantes:</h5>
                    <ul>
                        <li><strong>Load Balancing:</strong> Distribuir carga uniformemente entre recursos</li>
                        <li><strong>Hot Spots:</strong> Servidores com carga excessiva podem gerar gargalos</li>
                        <li><strong>Redundância:</strong> Distribuir dados críticos em múltiplos locais</li>
                        <li><strong>Latência:</strong> Localização geográfica afeta tempo de acesso</li>
                        <li><strong>Escalabilidade:</strong> Sistema deve suportar crescimento de dados</li>
                    </ul>
                </div>
            </div>
        `;
        
        explanationElement.style.display = 'block';
    },

    // Gerar detalhamento dos servidores
    generateServersBreakdown() {
        const phaseData = GameData.phases[4].data;
        
        return phaseData.servers.map(server => {
            const serverId = server.id;
            const load = this.serverLoads[serverId];
            const percentage = Math.round((load / server.capacity) * 100);
            const assignedItems = Object.entries(this.dataAssignments)
                .filter(([dataId, assignedServerId]) => assignedServerId === serverId)
                .map(([dataId]) => {
                    const dataItem = phaseData.data.find(d => d.id === dataId);
                    return dataItem ? dataItem.name : dataId;
                });
            
            let statusClass = 'normal';
            let statusText = 'Normal';
            if (percentage >= 90) {
                statusClass = 'overloaded';
                statusText = 'Sobrecarregado';
            } else if (percentage >= 70) {
                statusClass = 'high-load';
                statusText = 'Carga Alta';
            }
            
            return `
                <div class="server-breakdown ${statusClass}">
                    <div class="server-breakdown-header">
                        <strong>${server.name}</strong> (${server.location})
                        <span class="load-badge">${load}/${server.capacity} GB (${percentage}%)</span>
                        <span class="status-badge">${statusText}</span>
                    </div>
                    <div class="assigned-data">
                        <strong>Dados armazenados:</strong> ${assignedItems.join(', ') || 'Nenhum'}
                    </div>
                </div>
            `;
        }).join('');
    },

    // Gerar dicas de otimização
    generateOptimizationTips(balance) {
        const tips = [];
        
        if (balance.isOverloaded) {
            tips.push('🔴 <strong>Problema crítico:</strong> Mova dados do servidor sobrecarregado para outros servidores');
            tips.push('⚖️ <strong>Redistribuir:</strong> Divida dados grandes entre múltiplos servidores');
        } else if (!balance.isBalanced) {
            tips.push('⚠️ <strong>Melhorar balanceamento:</strong> Transfira alguns dados entre servidores');
            tips.push('📊 <strong>Meta:</strong> Mantenha diferenças de carga abaixo de 20%');
        } else {
            tips.push('✅ <strong>Excelente distribuição!</strong> Os servidores estão bem balanceados');
            tips.push('🎯 <strong>Manter qualidade:</strong> Continue distribuindo dados uniformemente');
        }
        
        tips.push('🌍 <strong>Considere localização:</strong> Dados acessados com frequência devem ficar próximos aos usuários');
        tips.push('🔄 <strong>Redundância:</strong> Em sistemas reais, mantenha cópias em múltiplos servidores');
        
        return `<ul>${tips.map(tip => `<li>${tip}</li>`).join('')}</ul>`;
    },

    // Mostrar feedback
    showFeedback(message, type) {
        const feedbackElement = document.getElementById('feedback-message');
        if (feedbackElement) {
            feedbackElement.textContent = message;
            feedbackElement.className = `feedback-message ${type}`;
            
            if (type !== 'success' && type !== 'error') {
                setTimeout(() => {
                    feedbackElement.textContent = '';
                    feedbackElement.className = 'feedback-message';
                }, 4000);
            }
        }
    },

    // Mostrar dica
    showHint() {
        const hints = [
            "Tente manter a carga de cada servidor entre 60-80% para melhor performance",
            "Dados grandes (como imagens e áudios) devem ser distribuídos entre servidores",
            "Evite sobrecarregar um servidor enquanto outros ficam subutilizados",
            "Considere a localização geográfica dos servidores para otimizar latência"
        ];
        
        const randomHint = hints[Math.floor(Math.random() * hints.length)];
        GamePhases.showHint(randomHint, 5000);
        
        // Destacar informações relevantes
        setTimeout(() => {
            this.highlightOptimalRange();
        }, 1000);
    },

    // Destacar faixa ótima de carga
    highlightOptimalRange() {
        const capacityBars = document.querySelectorAll('.capacity-bar');
        capacityBars.forEach(bar => {
            bar.classList.add('show-optimal-range');
        });
        
        setTimeout(() => {
            capacityBars.forEach(bar => {
                bar.classList.remove('show-optimal-range');
            });
        }, 3000);
    },

    // Resetar fase
    reset() {
        this.init();
    },

    // Verificar se há progresso
    hasProgress() {
        return Object.keys(this.dataAssignments).length > 0;
    },

    // Obter pontuação atual
    getScore() {
        return this.score;
    }
};

// Registrar handler da fase
GamePhases.registerPhaseHandler(4, Phase4Handler);

// Exportar para uso global
window.Phase4Handler = Phase4Handler;
