// Fase 2: Paralelismo (Multiple Choice)
const Phase2Handler = {
    score: 0,
    selectedTasks: [],
    attempts: 0,
    completed: false,

    // Inicializar fase
    init() {
        this.score = 0;
        this.selectedTasks = [];
        this.attempts = 0;
        this.completed = false;
        this.createPhaseInterface();
        GamePhases.updatePhaseScore(this.score);
    },

    // Criar interface da fase
    createPhaseInterface() {
        const gameArea = document.getElementById('phase-game-area');
        if (!gameArea) return;

        const phaseData = GameData.phases[2].data;
        
        gameArea.innerHTML = `
            <div class="phase2-container">
                <div class="instructions-panel">
                    <h3>⚡ Identifique Tarefas Paralelas</h3>
                    <p>${GameData.messages.phase2.instructions}</p>
                    <div class="concept-explanation">
                        <div class="concept-box">
                            <h4>🔄 Paralelismo</h4>
                            <p>Tarefas que podem ser executadas <strong>simultaneamente</strong> porque não dependem umas das outras ou usam recursos diferentes.</p>
                        </div>
                        <div class="scoring-info">
                            <span>✅ Tudo correto: +${phaseData.scoring.correct} pontos</span>
                            <span>❌ Erro: ${phaseData.scoring.wrong} pontos</span>
                        </div>
                    </div>
                </div>

                <div class="tasks-selection">
                    <h4>Selecione as tarefas que podem ser executadas em paralelo:</h4>
                    <div id="tasks-container" class="tasks-container">
                        ${this.generateTaskCards(phaseData.tasks)}
                    </div>
                </div>

                <div class="analysis-area">
                    <div class="selection-summary">
                        <h4>Suas Seleções:</h4>
                        <div id="selected-summary" class="selected-summary">
                            <p class="no-selection">Nenhuma tarefa selecionada ainda</p>
                        </div>
                    </div>

                    <div class="action-buttons">
                        <button id="check-answer-btn" class="primary-btn" onclick="Phase2Handler.checkAnswer()" disabled>
                            🔍 Verificar Resposta
                        </button>
                        <button id="show-hint-btn" class="secondary-btn" onclick="Phase2Handler.showHint()">
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

    // Gerar cards das tarefas
    generateTaskCards(tasks) {
        return tasks.map(task => `
            <div class="task-card" data-task-id="${task.id}" data-parallel="${task.parallel}">
                <div class="task-header">
                    <div class="task-checkbox">
                        <input type="checkbox" id="task-${task.id}" onchange="Phase2Handler.toggleTask('${task.id}')">
                        <label for="task-${task.id}"></label>
                    </div>
                    <h4>${task.name}</h4>
                </div>
                <p class="task-description">${task.description}</p>
                <div class="task-analysis">
                    <span class="analysis-label">Análise:</span>
                    <span class="analysis-hint" style="display: none;">${this.getTaskAnalysis(task)}</span>
                </div>
            </div>
        `).join('');
    },

    // Obter análise da tarefa
    getTaskAnalysis(task) {
        const analyses = {
            'processar-imagem': 'Uso intensivo de CPU, pode ser executada em paralelo com operações de I/O',
            'salvar-relatorio': 'Operação de I/O (disco), pode executar enquanto CPU processa outras tarefas',
            'sincronizar-audio': 'Processamento independente de áudio, não interfere com outras operações',
            'imprimir-documento': 'Recurso exclusivo (impressora), apenas uma tarefa pode usar por vez'
        };
        return analyses[task.id] || 'Análise não disponível';
    },

    // Alternar seleção de tarefa
    toggleTask(taskId) {
        const checkbox = document.getElementById(`task-${taskId}`);
        const taskCard = document.querySelector(`.task-card[data-task-id="${taskId}"]`);
        
        if (!checkbox || !taskCard) return;

        if (checkbox.checked) {
            // Adicionar à seleção
            this.selectedTasks.push(taskId);
            taskCard.classList.add('selected');
        } else {
            // Remover da seleção
            this.selectedTasks = this.selectedTasks.filter(id => id !== taskId);
            taskCard.classList.remove('selected');
        }

        this.updateSelectionSummary();
        this.updateCheckButton();
    },

    // Atualizar resumo das seleções
    updateSelectionSummary() {
        const summaryElement = document.getElementById('selected-summary');
        if (!summaryElement) return;

        if (this.selectedTasks.length === 0) {
            summaryElement.innerHTML = '<p class="no-selection">Nenhuma tarefa selecionada ainda</p>';
        } else {
            const phaseData = GameData.phases[2].data;
            const selectedTaskNames = this.selectedTasks.map(taskId => {
                const task = phaseData.tasks.find(t => t.id === taskId);
                return task ? task.name : taskId;
            });

            summaryElement.innerHTML = `
                <div class="selected-tasks">
                    <p><strong>Tarefas selecionadas (${this.selectedTasks.length}):</strong></p>
                    <ul>
                        ${selectedTaskNames.map(name => `<li>${name}</li>`).join('')}
                    </ul>
                </div>
            `;
        }
    },

    // Atualizar botão de verificação
    updateCheckButton() {
        const checkButton = document.getElementById('check-answer-btn');
        if (checkButton) {
            checkButton.disabled = this.selectedTasks.length === 0 || this.completed;
        }
    },

    // Verificar resposta
    checkAnswer() {
        if (this.completed) return;

        const phaseData = GameData.phases[2].data;
        const correctTasks = phaseData.tasks.filter(task => task.parallel).map(task => task.id);
        
        this.attempts++;

        // Verificar se a resposta está correta
        const isCorrect = this.arraysEqual(
            this.selectedTasks.sort(),
            correctTasks.sort()
        );

        if (isCorrect) {
            // Resposta correta
            this.score = phaseData.scoring.correct;
            this.completed = true;
            
            this.showFeedback(GameData.messages.phase2.completed, 'success');
            this.showDetailedExplanation(true);
            this.highlightCorrectAnswers();
            
            // Habilitar botão de finalizar
            const completeButton = document.getElementById('complete-phase-btn');
            if (completeButton) {
                completeButton.disabled = false;
                completeButton.classList.add('pulse');
            }

        } else {
            // Resposta incorreta
            this.score = phaseData.scoring.wrong;
            
            const wrongCount = this.countWrongAnswers(correctTasks);
            this.showFeedback(
                `Nem todas as respostas estão corretas. Você teve ${wrongCount} erro(s).`, 
                'error'
            );
            this.showDetailedExplanation(false);
            this.highlightWrongAnswers(correctTasks);
        }

        GamePhases.updatePhaseScore(this.score);
        this.updateCheckButton();
    },

    // Verificar se arrays são iguais
    arraysEqual(arr1, arr2) {
        return arr1.length === arr2.length && arr1.every(val => arr2.includes(val));
    },

    // Contar respostas erradas
    countWrongAnswers(correctTasks) {
        let wrongCount = 0;
        
        // Tarefas selecionadas incorretamente
        this.selectedTasks.forEach(taskId => {
            if (!correctTasks.includes(taskId)) {
                wrongCount++;
            }
        });
        
        // Tarefas corretas não selecionadas
        correctTasks.forEach(taskId => {
            if (!this.selectedTasks.includes(taskId)) {
                wrongCount++;
            }
        });
        
        return wrongCount;
    },

    // Destacar respostas corretas
    highlightCorrectAnswers() {
        const phaseData = GameData.phases[2].data;
        
        phaseData.tasks.forEach(task => {
            const taskCard = document.querySelector(`.task-card[data-task-id="${task.id}"]`);
            if (taskCard) {
                if (task.parallel) {
                    taskCard.classList.add('correct-answer');
                } else {
                    taskCard.classList.add('correctly-not-selected');
                }
            }
        });
    },

    // Destacar respostas erradas
    highlightWrongAnswers(correctTasks) {
        this.selectedTasks.forEach(taskId => {
            const taskCard = document.querySelector(`.task-card[data-task-id="${taskId}"]`);
            if (taskCard && !correctTasks.includes(taskId)) {
                taskCard.classList.add('wrong-answer');
            }
        });

        // Destacar tarefas que deveriam ter sido selecionadas
        correctTasks.forEach(taskId => {
            if (!this.selectedTasks.includes(taskId)) {
                const taskCard = document.querySelector(`.task-card[data-task-id="${taskId}"]`);
                if (taskCard) {
                    taskCard.classList.add('should-be-selected');
                }
            }
        });
    },

    // Mostrar explicação detalhada
    showDetailedExplanation(isCorrect) {
        const explanationElement = document.getElementById('detailed-explanation');
        if (!explanationElement) return;

        const phaseData = GameData.phases[2].data;
        
        let explanationHTML = `
            <h4>📚 Explicação Detalhada:</h4>
            <div class="explanation-content">
        `;

        phaseData.tasks.forEach(task => {
            const wasSelected = this.selectedTasks.includes(task.id);
            const shouldBeSelected = task.parallel;
            const isTaskCorrect = (wasSelected && shouldBeSelected) || (!wasSelected && !shouldBeSelected);
            
            explanationHTML += `
                <div class="task-explanation ${isTaskCorrect ? 'correct' : 'incorrect'}">
                    <div class="task-explanation-header">
                        <span class="task-icon">${isTaskCorrect ? '✅' : '❌'}</span>
                        <strong>${task.name}</strong>
                        <span class="parallel-indicator">${task.parallel ? '(Paralelo)' : '(Sequencial)'}</span>
                    </div>
                    <p>${task.description}</p>
                    <div class="analysis-detail">
                        <strong>Por quê:</strong> ${this.getTaskAnalysis(task)}
                    </div>
                </div>
            `;
        });

        explanationHTML += `
            </div>
            <div class="key-concepts">
                <h5>💡 Conceitos importantes:</h5>
                <ul>
                    <li><strong>Paralelismo real:</strong> Tarefas que usam recursos diferentes (CPU vs I/O)</li>
                    <li><strong>Recursos exclusivos:</strong> Apenas uma tarefa pode usar por vez (ex: impressora)</li>
                    <li><strong>Independência:</strong> Tarefas que não dependem de resultados de outras</li>
                </ul>
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
            
            // Não remover automaticamente para dar tempo de ler
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
            "Pense em quais tarefas usam recursos diferentes (CPU, disco, rede)",
            "Operações de I/O (salvar, imprimir) podem executar junto com processamento de CPU?", 
            "Recursos exclusivos (como impressora) só podem ser usados por uma tarefa",
            "Tarefas independentes podem executar simultaneamente"
        ];
        
        const randomHint = hints[Math.floor(Math.random() * hints.length)];
        GamePhases.showHint(randomHint, 5000);
        
        // Mostrar análise das tarefas após a dica
        setTimeout(() => {
            this.toggleAnalysisVisibility();
        }, 1000);
    },

    // Alternar visibilidade das análises
    toggleAnalysisVisibility() {
        const analysisHints = document.querySelectorAll('.analysis-hint');
        const areVisible = analysisHints[0]?.style.display !== 'none';
        
        analysisHints.forEach(hint => {
            hint.style.display = areVisible ? 'none' : 'inline';
        });
        
        const hintButton = document.getElementById('show-hint-btn');
        if (hintButton) {
            hintButton.textContent = areVisible ? '💡 Dica' : '🔍 Ocultar Análise';
        }
    },

    // Resetar fase
    reset() {
        // Limpar seleções
        const checkboxes = document.querySelectorAll('.task-card input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            checkbox.checked = false;
        });

        // Remover classes visuais
        const taskCards = document.querySelectorAll('.task-card');
        taskCards.forEach(card => {
            card.className = 'task-card';
        });

        // Ocultar explicação
        const explanationElement = document.getElementById('detailed-explanation');
        if (explanationElement) {
            explanationElement.style.display = 'none';
        }

        this.init();
    },

    // Verificar se há progresso
    hasProgress() {
        return this.selectedTasks.length > 0;
    },

    // Obter pontuação atual
    getScore() {
        return this.score;
    }
};

// Registrar handler da fase
GamePhases.registerPhaseHandler(2, Phase2Handler);

// Exportar para uso global
window.Phase2Handler = Phase2Handler;
