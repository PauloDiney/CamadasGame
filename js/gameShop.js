// Sistema da loja de habilidades
const GameShop = {
    
    // Inicializar loja
    init() {
        this.updateShopDisplay();
    },

    // Comprar habilidade
    buySkill(skillId, cost) {
        const skill = GameData.skills[skillId];
        if (!skill) {
            console.error('Habilidade não encontrada:', skillId);
            return false;
        }

        // Verificar se já possui a habilidade
        if (GameStorage.hasSkill(skillId)) {
            GameScreens.showTemporaryMessage('Você já possui esta habilidade!', 'warning');
            return false;
        }

        // Verificar pontos suficientes
        const playerData = GameStorage.getPlayerData();
        if (playerData.points < cost) {
            const needed = cost - playerData.points;
            GameScreens.showTemporaryMessage(
                `Você precisa de mais ${needed} pontos para comprar esta habilidade.`, 
                'error'
            );
            
            // Animação de erro no item da loja
            const skillElement = document.querySelector(`.shop-item[data-skill="${skillId}"]`);
            if (skillElement && window.Game && typeof Game.showAnimatedFeedback === 'function') {
                skillElement.classList.add('insufficient-points');
                Game.showAnimatedFeedback(skillElement, 'error');
            }
            
            return false;
        }

        // Realizar compra
        const result = GameStorage.purchaseSkill(skillId, cost);
        
        if (result.success) {
            // Mostrar mensagem de sucesso
            GameScreens.showTemporaryMessage(
                `${skill.name} adquirida com sucesso!`, 
                'success'
            );

            // Aplicar efeito visual no item comprado com animações avançadas
            const skillElement = document.querySelector(`.shop-item[data-skill="${skillId}"]`);
            if (skillElement) {
                // Animações avançadas se disponíveis
                if (window.Game && typeof Game.showAnimatedFeedback === 'function') {
                    skillElement.classList.add('purchased');
                    Game.showAnimatedFeedback(skillElement, 'success');
                    Game.addSuccessParticles(skillElement);
                } else {
                    // Fallback para animação básica
                    skillElement.classList.add('sparkle-effect');
                    setTimeout(() => {
                        skillElement.classList.remove('sparkle-effect');
                    }, 2000);
                }
            }

            // Atualizar displays
            this.updateShopDisplay();
            GameScreens.updatePointsDisplay();
            GameScreens.updateOwnedSkills();

            // Tocar som de compra
            this.playPurchaseSound();

            // Aplicar efeito imediato da habilidade se necessário
            this.applySkillEffect(skillId);

            return true;
        } else {
            // Mostrar mensagem de erro baseada na razão
            let message = 'Não foi possível comprar esta habilidade.';
            if (result.reason === 'already_owned') {
                message = 'Você já possui esta habilidade!';
            } else if (result.reason === 'insufficient_points') {
                message = 'Pontos insuficientes para esta compra.';
            }
            
            GameScreens.showTemporaryMessage(message, 'error');
            return false;
        }
    },

    // Atualizar exibição da loja
    updateShopDisplay() {
        const playerData = GameStorage.getPlayerData();
        
        Object.keys(GameData.skills).forEach(skillId => {
            const skill = GameData.skills[skillId];
            const skillElement = document.querySelector(`.shop-item[data-skill="${skillId}"]`);
            
            if (skillElement) {
                const hasSkill = playerData.ownedSkills.includes(skillId);
                const canAfford = playerData.points >= skill.price;
                
                // Atualizar estado visual
                skillElement.classList.toggle('owned', hasSkill);
                skillElement.classList.toggle('affordable', !hasSkill && canAfford);
                skillElement.classList.toggle('expensive', !hasSkill && !canAfford);
                
                // Atualizar botão de compra
                const buyButton = skillElement.querySelector('.buy-btn');
                if (buyButton) {
                    if (hasSkill) {
                        buyButton.textContent = '✓ Adquirida';
                        buyButton.disabled = true;
                        buyButton.classList.add('owned-btn');
                    } else {
                        buyButton.textContent = `Comprar (${skill.price} pts)`;
                        buyButton.disabled = !canAfford;
                        buyButton.classList.remove('owned-btn');
                    }
                }

                // Adicionar indicador de desconto se aplicável
                this.updateSkillDiscounts(skillElement, skill);
            }
        });
    },

    // Atualizar descontos de habilidades
    updateSkillDiscounts(skillElement, skill) {
        // Remover indicadores de desconto anteriores
        const existingDiscount = skillElement.querySelector('.discount-indicator');
        if (existingDiscount) {
            existingDiscount.remove();
        }

        // Exemplo: Desconto para combo de habilidades
        const playerData = GameStorage.getPlayerData();
        let discountPercent = 0;

        // Desconto para segunda habilidade
        if (playerData.ownedSkills.length === 1 && !playerData.ownedSkills.includes(skill.id)) {
            discountPercent = 10;
        }
        
        // Desconto para terceira habilidade
        if (playerData.ownedSkills.length === 2 && !playerData.ownedSkills.includes(skill.id)) {
            discountPercent = 20;
        }

        if (discountPercent > 0) {
            const discountElement = document.createElement('div');
            discountElement.className = 'discount-indicator';
            discountElement.innerHTML = `<span class="discount-badge">-${discountPercent}%</span>`;
            skillElement.appendChild(discountElement);
        }
    },

    // Aplicar efeito imediato da habilidade
    applySkillEffect(skillId) {
        const skill = GameData.skills[skillId];
        
        switch (skillId) {
            case 'auto-unlock':
                // Desbloquear todas as fases
                this.unlockAllPhases();
                break;
                
            case 'bonus-points':
                // Aplicar bônus retroativo nos pontos (pequeno boost)
                const bonusPoints = Math.floor(GameStorage.getPlayerData().points * 0.05);
                GameStorage.addPoints(bonusPoints);
                GameScreens.showTemporaryMessage(
                    `Bônus retroativo: +${bonusPoints} pontos!`, 
                    'success'
                );
                break;
                
            case 'time-bonus':
                // Mostrar dica sobre o bônus de tempo
                GameScreens.showTemporaryMessage(
                    'Complete fases em menos de 2 minutos para ganhar bônus!', 
                    'info', 
                    5000
                );
                break;
        }
    },

    // Desbloquear todas as fases (efeito da habilidade auto-unlock)
    unlockAllPhases() {
        GameScreens.showTemporaryMessage(
            'Todas as fases foram desbloqueadas!', 
            'success'
        );
        
        // Atualizar UI das fases
        setTimeout(() => {
            GameScreens.updateGameMap();
            GameScreens.updatePhasesList();
        }, 1000);
    },

    // Mostrar preview da habilidade
    showSkillPreview(skillId) {
        const skill = GameData.skills[skillId];
        if (!skill) return;

        // Criar modal de preview se não existir
        let previewModal = document.getElementById('skill-preview-modal');
        if (!previewModal) {
            previewModal = this.createPreviewModal();
        }

        // Preencher informações da habilidade
        const previewContent = previewModal.querySelector('.preview-content');
        previewContent.innerHTML = `
            <div class="skill-preview-header">
                <span class="skill-preview-icon">${skill.icon}</span>
                <h3>${skill.name}</h3>
            </div>
            <p class="skill-preview-description">${skill.description}</p>
            <div class="skill-preview-details">
                <p><strong>Efeito:</strong> ${this.getSkillEffectDescription(skill)}</p>
                <p><strong>Preço:</strong> ${skill.price} pontos</p>
            </div>
            <div class="skill-preview-actions">
                <button class="modal-btn secondary" onclick="GameShop.closeSkillPreview()">
                    Fechar
                </button>
                <button class="modal-btn primary" onclick="GameShop.buySkillFromPreview('${skillId}', ${skill.price})">
                    Comprar
                </button>
            </div>
        `;

        previewModal.classList.add('active');
    },

    // Criar modal de preview
    createPreviewModal() {
        const modal = document.createElement('div');
        modal.id = 'skill-preview-modal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content skill-preview-modal">
                <div class="preview-content">
                    <!-- Conteúdo será inserido dinamicamente -->
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        return modal;
    },

    // Obter descrição detalhada do efeito
    getSkillEffectDescription(skill) {
        const descriptions = {
            'bonus-points': 'Aumenta em 10% todos os pontos ganhos em fases',
            'auto-unlock': 'Remove a necessidade de pontos para desbloquear fases',
            'time-bonus': 'Concede 10 pontos extras ao completar fases rapidamente'
        };
        
        return descriptions[skill.id] || skill.description;
    },

    // Comprar habilidade via preview
    buySkillFromPreview(skillId, cost) {
        const success = this.buySkill(skillId, cost);
        if (success) {
            this.closeSkillPreview();
        }
    },

    // Fechar preview da habilidade
    closeSkillPreview() {
        const previewModal = document.getElementById('skill-preview-modal');
        if (previewModal) {
            previewModal.classList.remove('active');
        }
    },

    // Verificar se tem oferta especial ativa
    checkSpecialOffers() {
        const playerData = GameStorage.getPlayerData();
        const now = new Date();
        
        // Exemplo: Oferta de fim de semana
        const isWeekend = now.getDay() === 0 || now.getDay() === 6;
        if (isWeekend && !playerData.weekendOfferClaimed) {
            this.showSpecialOffer('weekend');
        }
        
        // Exemplo: Oferta para jogadores com muitos pontos
        if (playerData.points >= 100 && !playerData.highScoreOfferClaimed) {
            this.showSpecialOffer('highscore');
        }
    },

    // Mostrar oferta especial
    showSpecialOffer(offerType) {
        const offers = {
            weekend: {
                title: 'Oferta de Fim de Semana!',
                description: '20% de desconto em todas as habilidades',
                discount: 0.2
            },
            highscore: {
                title: 'Parabéns pelos 100+ pontos!',
                description: 'Habilidade gratuita à sua escolha',
                discount: 1.0
            }
        };
        
        const offer = offers[offerType];
        if (offer) {
            GameScreens.showTemporaryMessage(
                `🎉 ${offer.title} ${offer.description}`, 
                'success', 
                5000
            );
        }
    },

    // Obter estatísticas da loja
    getShopStats() {
        const playerData = GameStorage.getPlayerData();
        const totalSkills = Object.keys(GameData.skills).length;
        const ownedSkills = playerData.ownedSkills.length;
        const totalSpent = this.calculateTotalSpent();
        
        return {
            skillsOwned: ownedSkills,
            totalSkills: totalSkills,
            completion: Math.round((ownedSkills / totalSkills) * 100),
            totalSpent: totalSpent,
            canAffordAll: this.canAffordRemainingSkills()
        };
    },

    // Calcular total gasto em habilidades
    calculateTotalSpent() {
        const playerData = GameStorage.getPlayerData();
        return playerData.ownedSkills.reduce((total, skillId) => {
            const skill = GameData.skills[skillId];
            return total + (skill ? skill.price : 0);
        }, 0);
    },

    // Verificar se pode comprar todas as habilidades restantes
    canAffordRemainingSkills() {
        const playerData = GameStorage.getPlayerData();
        const remainingCost = Object.values(GameData.skills)
            .filter(skill => !playerData.ownedSkills.includes(skill.id))
            .reduce((total, skill) => total + skill.price, 0);
        
        return playerData.points >= remainingCost;
    },

    // Tocar som de compra (fictício)
    playPurchaseSound() {
        const settings = GameStorage.getSettings();
        if (settings.soundEnabled) {
            console.log('🔊 Som de compra realizada');
        }
    }
};

// Exportar para uso global
window.GameShop = GameShop;
