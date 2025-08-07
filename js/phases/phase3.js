// Fase 3: Concorrência (Single Choice)
const Phase3Handler = {
    score: 0,
    selectedOption: null,
    attempts: 0,
    completed: false,

    // Inicializar fase
    init() {
        this.score = 0;
        this.selectedOption = null;
        this.attempts = 0;
        this.completed = false;
        this.createPhaseInterface();
        GamePhases.updatePhaseScore(this.score);
    },

    // Criar interface da fase
    createPhaseInterface() {
        const gameArea = document.getElementById('phase-game-area');
        if (!gameArea) return;

        const phaseData = GameData.phases[3].data;
        
        gameArea.innerHTML = `
            <div class="phase3-container">
                <div class="instructions-panel">
                    <h3>🔄 Gerenciamento de Concorrência</h3>
                    <p>${GameData.messages.phase3.instructions}</p>
                    <div class="concept-explanation">
                        <div class="concept-box">
                            <h4>⚠️ Concorrência</h4>
                            <p>Quando múltiplos processos tentam acessar o mesmo recurso simultaneamente, precisamos de mecanismos para evitar <strong>condições de corrida</strong> e garantir <strong>consistência de dados</strong>.</p>
                        </div>
                        <div class="scoring-info">
                            <span>✅ Resposta correta: +${phaseData.scoring.correct} pontos</span>
                            <span>❌ Resposta errada: ${phaseData.scoring.wrong} pontos</span>
                        </div>
                    </div>
                </div>

                <div class="scenario-area">
                    <div class="scenario-box">
                        <h4>🎯 Cenário:</h4>
                        <div class="scenario-visual">
                            <div class="user-icons">
                                <div class="user-icon">👤 Usuário A</div>
                                <div class="access-arrow">📝</div>
                                <div class="shared-resource">📄 arquivo.txt</div>
                                <div class="access-arrow">📝</div>
                                <div class="user-icon">👤 Usuário B</div>
                            </div>
                        </div>
                        <p class="scenario-description">${phaseData.scenario}</p>
                        <div class="problem-highlight">
                            <strong>Problema:</strong> Se ambos editarem simultaneamente, as alterações podem se sobrepor e dados podem ser perdidos!
                        </div>
                    </div>
                </div>

                <div class="options-area">
                    <h4>Como você resolveria esta situação?</h4>
                    <div id="options-container" class="options-container">
                        ${this.generateOptionCards(phaseData.options)}
                    </div>
                </div>

                <div class="analysis-section">
                    <div class="selected-option-info" id="selected-option-info" style="display: none;">
                        <h4>Sua Escolha:</h4>
                        <div id="selected-option-detail"></div>
                    </div>

                    <div class="action-buttons">
                        <button id="check-answer-btn" class="primary-btn" onclick="Phase3Handler.checkAnswer()" disabled>
                            ✅ Confirmar Resposta
                        </button>
                        <button id="show-hint-btn" class="secondary-btn" onclick="Phase3Handler.showHint()">
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
    },

    // Gerar cards das opções
    generateOptionCards(options) {
        return options.map(option => `
            <div class="option-card" data-option-id="${option.id}" onclick="Phase3Handler.selectOption('${option.id}')">
                <div class="option-header">
                    <div class="option-radio">
                        <input type="radio" name="concurrency-option" id="option-${option.id}" value="${option.id}">
                        <label for="option-${option.id}"></label>
                    </div>
                    <h4>${option.name}</h4>
                    <span class="option-indicator ${option.correct ? 'correct-solution' : 'problematic-solution'}" style="display: none;">
                        ${option.correct ? '✅' : '⚠️'}
                    </span>
                </div>
                <p class="option-description">${option.description}</p>
                <div class="option-analysis">
                    <div class="consequences" style="display: none;">
                        <strong>Consequências:</strong>
                        <span class="consequence-text">${this.getOptionConsequences(option)}</span>
                    </div>
                    <div class="implementation" style="display: none;">
                        <strong>Como implementar:</strong>
                        <span class="implementation-text">${this.getImplementationDetails(option)}</span>
                    </div>
                </div>
            </div>
        `).join('');
    },

    // Obter consequências da opção
    getOptionConsequences(option) {
        const consequences = {
            'aplicar-trava': 'Evita condições de corrida, garante consistência de dados. Pode reduzir performance em casos de alta concorrência.',
            'ignorar': 'Risco alto de corrupção de dados, perda de alterações, inconsistências. Não é uma solução viável.',
            'espera': 'Funciona, mas não é otimizado. Um usuário fica ocioso desnecessariamente, reduzindo eficiência.'
        };
        return consequences[option.id] || 'Consequências não mapeadas';
    },

    // Obter detalhes de implementação
    getImplementationDetails(option) {
        const implementations = {
            'aplicar-trava': 'Usar mutex, semáforos ou locks de arquivo. Implementar timeout para evitar deadlocks.',
            'ignorar': 'Não implementar nenhum controle de concorrência (NÃO recomendado).',
            'espera': 'Sistema de filas ou controle manual de turnos. Menos eficiente que locks.'
        };
        return implementations[option.id] || 'Implementação não mapeada';
    },

    // Selecionar opção
    selectOption(optionId) {
        if (this.completed) return;

        // Remover seleção anterior
        const optionCards = document.querySelectorAll('.option-card');
        optionCards.forEach(card => {
            card.classList.remove('selected');
        });

        // Marcar nova seleção
        const selectedCard = document.querySelector(`.option-card[data-option-id="${optionId}"]`);
        if (selectedCard) {
            selectedCard.classList.add('selected');
        }

        // Atualizar radio button
        const radioButton = document.getElementById(`option-${optionId}`);
        if (radioButton) {
            radioButton.checked = true;
        }

        this.selectedOption = optionId;
        this.updateSelectedOptionInfo();
        this.updateCheckButton();
    },

    // Atualizar informações da opção selecionada
    updateSelectedOptionInfo() {
        const infoElement = document.getElementById('selected-option-info');
        const detailElement = document.getElementById('selected-option-detail');
        
        if (!infoElement || !detailElement || !this.selectedOption) return;

        const phaseData = GameData.phases[3].data;
        const selectedOptionData = phaseData.options.find(opt => opt.id === this.selectedOption);
        
        if (selectedOptionData) {
            detailElement.innerHTML = `
                <div class="selected-option-card">
                    <h5>${selectedOptionData.name}</h5>
                    <p>${selectedOptionData.description}</p>
                    <div class="preview-consequences">
                        <strong>Possíveis consequências:</strong>
                        <p>${this.getOptionConsequences(selectedOptionData)}</p>
                    </div>
                </div>
            `;
            infoElement.style.display = 'block';
        }
    },

    // Atualizar botão de verificação
    updateCheckButton() {
        const checkButton = document.getElementById('check-answer-btn');
        if (checkButton) {
            checkButton.disabled = !this.selectedOption || this.completed;
        }
    },

    // Verificar resposta
    checkAnswer() {
        if (this.completed || !this.selectedOption) return;

        const phaseData = GameData.phases[3].data;
        const selectedOptionData = phaseData.options.find(opt => opt.id === this.selectedOption);
        
        this.attempts++;
        this.completed = true;

        if (selectedOptionData && selectedOptionData.correct) {
            // Resposta correta
            this.score = phaseData.scoring.correct;
            
            this.showFeedback(GameData.messages.phase3.completed, 'success');
            this.highlightCorrectAnswer();
            
            // Habilitar botão de finalizar
            const completeButton = document.getElementById('complete-phase-btn');
            if (completeButton) {
                completeButton.disabled = false;
                completeButton.classList.add('pulse');
            }

        } else {
            // Resposta incorreta
            this.score = phaseData.scoring.wrong;
            
            this.showFeedback(
                `Resposta incorreta. A trava de acesso é a melhor solução para evitar condições de corrida.`, 
                'error'
            );
            this.highlightWrongAnswer();
        }

        this.showDetailedExplanation();
        GamePhases.updatePhaseScore(this.score);
        this.updateCheckButton();
    },

    // Destacar resposta correta
    highlightCorrectAnswer() {
        const selectedCard = document.querySelector(`.option-card[data-option-id="${this.selectedOption}"]`);
        if (selectedCard) {
            selectedCard.classList.add('correct-answer');
            
            // Adicionar efeito especial
            setTimeout(() => {
                selectedCard.classList.add('sparkle-effect');
            }, 500);
        }

        // Mostrar indicadores
        this.showOptionIndicators();
    },

    // Destacar resposta errada
    highlightWrongAnswer() {
        const selectedCard = document.querySelector(`.option-card[data-option-id="${this.selectedOption}"]`);
        if (selectedCard) {
            selectedCard.classList.add('wrong-answer');
        }

        // Destacar a resposta correta
        const phaseData = GameData.phases[3].data;
        const correctOption = phaseData.options.find(opt => opt.correct);
        if (correctOption) {
            const correctCard = document.querySelector(`.option-card[data-option-id="${correctOption.id}"]`);
            if (correctCard) {
                correctCard.classList.add('should-be-selected');
            }
        }

        // Mostrar indicadores
        this.showOptionIndicators();
    },

    // Mostrar indicadores das opções
    showOptionIndicators() {
        const indicators = document.querySelectorAll('.option-indicator');
        indicators.forEach(indicator => {
            indicator.style.display = 'inline';
        });
    },

    // Mostrar explicação detalhada
    showDetailedExplanation() {
        const explanationElement = document.getElementById('detailed-explanation');
        if (!explanationElement) return;

        const phaseData = GameData.phases[3].data;
        
        let explanationHTML = `
            <h4>📚 Explicação Completa:</h4>
            <div class="concurrency-explanation">
                <div class="problem-analysis">
                    <h5>🔍 Análise do Problema:</h5>
                    <p>Quando dois ou mais processos tentam acessar o mesmo recurso simultaneamente, podem ocorrer:</p>
                    <ul>
                        <li><strong>Race Condition (Condição de Corrida):</strong> O resultado depende da ordem de execução</li>
                        <li><strong>Data Corruption (Corrupção de Dados):</strong> Dados podem ser perdidos ou corrompidos</li>
                        <li><strong>Inconsistent State (Estado Inconsistente):</strong> O sistema fica em estado inválido</li>
                    </ul>
                </div>

                <div class="solutions-analysis">
                    <h5>💡 Análise das Soluções:</h5>
        `;

        phaseData.options.forEach(option => {
            const isSelected = option.id === this.selectedOption;
            const statusClass = option.correct ? 'correct-solution' : 'problematic-solution';
            
            explanationHTML += `
                <div class="solution-analysis ${statusClass} ${isSelected ? 'was-selected' : ''}">
                    <div class="solution-header">
                        <span class="solution-icon">${option.correct ? '✅' : '❌'}</span>
                        <strong>${option.name}</strong>
                        ${isSelected ? '<span class="selected-badge">Sua escolha</span>' : ''}
                    </div>
                    <p><strong>Descrição:</strong> ${option.description}</p>
                    <p><strong>Consequências:</strong> ${this.getOptionConsequences(option)}</p>
                    <p><strong>Implementação:</strong> ${this.getImplementationDetails(option)}</p>
                </div>
            `;
        });

        explanationHTML += `
                </div>

                <div class="key-concepts">
                    <h5>🔑 Conceitos Importantes:</h5>
                    <div class="concepts-grid">
                        <div class="concept-item">
                            <strong>Mutex (Mutual Exclusion):</strong>
                            <p>Garante que apenas um processo acesse o recurso por vez</p>
                        </div>
                        <div class="concept-item">
                            <strong>Deadlock:</strong>
                            <p>Situação onde processos ficam esperando uns aos outros indefinidamente</p>
                        </div>
                        <div class="concept-item">
                            <strong>Atomicidade:</strong>
                            <p>Operação que é executada completamente ou não é executada</p>
                        </div>
                        <div class="concept-item">
                            <strong>Lock:</strong>
                            <p>Mecanismo que impede acesso simultâneo a um recurso</p>
                        </div>
                    </div>
                </div>

                <div class="best-practices">
                    <h5>🏆 Melhores Práticas:</h5>
                    <ul>
                        <li>Sempre usar locks para recursos compartilhados</li>
                        <li>Implementar timeouts para evitar deadlocks</li>
                        <li>Minimizar o tempo que os locks são mantidos</li>
                        <li>Usar transações para operações críticas</li>
                        <li>Considerar alternativas como estruturas lock-free</li>
                    </ul>
                </div>
            </div>
        `;

        explanationElement.innerHTML = explanationHTML;
        explanationElement.style.display = 'block';
    },

    // Mostrar feedback
    showFeedback(message, type) {
        const feedbackElement = document.getElementById('feedback-message');
        if (feedbackElement) {
            feedbackElement.textContent = message;
            feedbackElement.className = `feedback-message ${type}`;
        }
    },

    // Mostrar dica
    showHint() {
        const hints = [
            "Pense no que acontece quando dois usuários fazem alterações no mesmo arquivo ao mesmo tempo",
            "A solução deve evitar que dados sejam perdidos ou corrompidos",
            "Controles de concorrência são essenciais em sistemas multiusuário",
            "A melhor solução garante integridade dos dados sem causar deadlocks"
        ];
        
        const randomHint = hints[Math.floor(Math.random() * hints.length)];
        GamePhases.showHint(randomHint, 5000);
        
        // Mostrar análises detalhadas das opções
        setTimeout(() => {
            this.toggleAnalysisVisibility();
        }, 1000);
    },

    // Alternar visibilidade das análises
    toggleAnalysisVisibility() {
        const analyses = document.querySelectorAll('.option-analysis > div');
        const areVisible = analyses[0]?.style.display !== 'none';
        
        analyses.forEach(analysis => {
            analysis.style.display = areVisible ? 'none' : 'block';
        });
        
        const hintButton = document.getElementById('show-hint-btn');
        if (hintButton && !this.completed) {
            hintButton.textContent = areVisible ? '💡 Dica' : '🔍 Ocultar Análise';
        }
    },

    // Resetar fase
    reset() {
        // Desmarcar opções
        const radioButtons = document.querySelectorAll('input[name="concurrency-option"]');
        radioButtons.forEach(radio => {
            radio.checked = false;
        });

        // Remover classes visuais
        const optionCards = document.querySelectorAll('.option-card');
        optionCards.forEach(card => {
            card.className = 'option-card';
        });

        // Ocultar informações
        const infoElement = document.getElementById('selected-option-info');
        if (infoElement) {
            infoElement.style.display = 'none';
        }

        const explanationElement = document.getElementById('detailed-explanation');
        if (explanationElement) {
            explanationElement.style.display = 'none';
        }

        this.init();
    },

    // Verificar se há progresso
    hasProgress() {
        return this.selectedOption !== null;
    },

    // Obter pontuação atual
    getScore() {
        return this.score;
    }
};

// Registrar handler da fase
GamePhases.registerPhaseHandler(3, Phase3Handler);

// Exportar para uso global
window.Phase3Handler = Phase3Handler;
