# ✅ Checklist de Testes - Nova Tela Principal

## 🎯 Como Testar Todas as Funcionalidades

Use este checklist para garantir que tudo está funcionando perfeitamente!

---

## 📋 TESTES VISUAIS

### Hero Section
- [ ] Logo aparece e flutua suavemente
- [ ] Título "Camadas da Conexão" tem efeito de brilho
- [ ] Subtítulo está legível
- [ ] Card de pontos aparece corretamente
- [ ] Estrela amarela está visível no card de pontos
- [ ] Número de pontos é mostrado (deve ser 2450 ou seu valor atual)

### Barra de Acessibilidade
- [ ] Barra aparece no canto superior direito
- [ ] 4 botões estão visíveis (microfone, A+, A-, círculo dividido)
- [ ] Botões têm borda cyan
- [ ] Tooltips aparecem ao passar o mouse

### Menu Principal
- [ ] 4 cards aparecem: Iniciar Jornada, Fases, Loja, Configurações
- [ ] Card "Iniciar Jornada" tem badge "Novo" amarelo
- [ ] Todos os ícones estão visíveis
- [ ] Descrições estão legíveis
- [ ] Cards têm efeito ao passar o mouse (elevam e brilham)

### Seção de Equipamentos
- [ ] Título "Equipamentos Ativos" aparece
- [ ] Se não tem equipamentos: mostra mensagem "Nenhum equipamento ativo"
- [ ] Link para loja está funcionando
- [ ] Se tem equipamentos: mostra cards dos equipamentos

---

## 🔊 TESTES DE VOZ

### Ativação
- [ ] Clicar no botão do microfone ativa a voz
- [ ] Botão fica azul claro quando ativo
- [ ] Pressionar `Alt + V` também ativa/desativa
- [ ] Aparece mensagem de voz ativada (áudio)
- [ ] Console mostra: "🎤 Sistema de Acessibilidade com Voz iniciado"

### Leitura de Elementos
- [ ] Passar mouse no card "Iniciar Jornada" → fala "Iniciar Jornada. Começar a trilha..."
- [ ] Passar mouse no card "Fases" → fala "Fases. Visualizar todas as fases..."
- [ ] Passar mouse no card "Loja" → fala "Loja. Acessar loja para comprar..."
- [ ] Passar mouse no card "Configurações" → fala "Configurações. Acessar configurações..."
- [ ] Passar mouse nos pontos → fala "Você tem X pontos"

### Indicador Visual
- [ ] Quando a voz fala, aparece indicador no canto inferior direito
- [ ] Indicador mostra "Leitura ativa" com ícone
- [ ] Indicador tem efeito de pulso
- [ ] Indicador desaparece quando para de falar

### Controle
- [ ] Pressionar `Esc` para a voz imediatamente
- [ ] Mover mouse para outro elemento troca a leitura
- [ ] Desativar voz (Alt+V) para a leitura

---

## 📏 TESTES DE FONTE

### Aumentar Fonte
- [ ] Clicar em `A+` aumenta todo o texto
- [ ] Pressionar `Alt + +` também aumenta
- [ ] Há 4 níveis: pequena → média → grande → muito grande
- [ ] No nível máximo, mostra mensagem "Já está no tamanho máximo"
- [ ] Com voz ativa, fala "Fonte aumentada para..."

### Diminuir Fonte
- [ ] Clicar em `A-` diminui todo o texto
- [ ] Pressionar `Alt + -` também diminui
- [ ] No nível mínimo, mostra mensagem "Já está no tamanho mínimo"
- [ ] Com voz ativa, fala "Fonte reduzida para..."

### Persistência
- [ ] Ajustar fonte e recarregar página (F5)
- [ ] Fonte mantém o tamanho escolhido
- [ ] Fechar aba e abrir novamente
- [ ] Fonte ainda está no tamanho escolhido

---

## 🌓 TESTES DE ALTO CONTRASTE

### Ativação
- [ ] Clicar no botão do círculo dividido ativa
- [ ] Pressionar `Alt + C` também ativa/desativa
- [ ] Botão fica azul claro quando ativo
- [ ] Com voz ativa, fala "Alto contraste ativado"

### Visual
- [ ] Fundo fica preto puro (#000)
- [ ] Texto fica branco puro (#FFF)
- [ ] Todos os cards têm borda branca grossa (3px)
- [ ] Ícones ficam brancos
- [ ] Sem gradientes ou transparências

### Persistência
- [ ] Ativar alto contraste e recarregar (F5)
- [ ] Alto contraste continua ativo
- [ ] Fechar e abrir aba
- [ ] Alto contraste mantém estado

---

## ⌨️ TESTES DE TECLADO

### Navegação por Tab
- [ ] Pressionar Tab foca o primeiro botão de acessibilidade
- [ ] Tab novamente vai para próximo botão
- [ ] Tab percorre todos os 4 botões de acessibilidade
- [ ] Tab depois foca os 4 cards do menu
- [ ] Tab foca links de equipamentos se houver
- [ ] Shift+Tab volta na ordem reversa

### Indicador de Foco
- [ ] Elementos focados têm borda cyan de 3px
- [ ] Borda tem offset de 2px ou 4px
- [ ] Foco é claramente visível

### Atalhos
- [ ] `Alt + V` → Liga/desliga voz (funciona de qualquer lugar)
- [ ] `Alt + +` → Aumenta fonte
- [ ] `Alt + -` → Diminui fonte
- [ ] `Alt + C` → Liga/desliga alto contraste
- [ ] `Esc` → Para a voz se estiver falando
- [ ] `Enter` em elemento focado → Clica no elemento

---

## 📱 TESTES DE RESPONSIVIDADE

### Desktop (>1024px)
- [ ] 4 cards do menu em linha (grid 4 colunas)
- [ ] Barra de acessibilidade no canto superior direito
- [ ] Tudo bem espaçado
- [ ] Hero section centralizada

### Tablet (768-1024px)
- [ ] 2 cards do menu por linha (grid 2 colunas)
- [ ] Barra de acessibilidade um pouco menor
- [ ] Botões ficam 44x44px
- [ ] Ainda legível e bonito

### Mobile (<768px)
- [ ] 1 card por linha (grid 1 coluna)
- [ ] Barra de acessibilidade faz wrap (2x2)
- [ ] Botões ficam 40x40px
- [ ] Título menor mas legível
- [ ] Padding reduzido
- [ ] Cards ocupam largura total

### Muito Pequeno (<480px)
- [ ] Logo fica menor (60x60)
- [ ] Título ainda menor
- [ ] Card de pontos empilha verticalmente
- [ ] Tudo ainda funciona e é clicável
- [ ] Sem scroll horizontal

---

## 🔗 TESTES DE NAVEGAÇÃO

### Links Funcionando
- [ ] Clicar em "Iniciar Jornada" → vai para trilha.html
- [ ] Clicar em "Fases" → vai para fases.html
- [ ] Clicar em "Loja" → vai para loja.html
- [ ] Clicar em "Configurações" → vai para configuracoes.html
- [ ] Link "Loja" na seção de equipamentos funciona

### Sem Erros
- [ ] Console não mostra erros em vermelho
- [ ] Todos os arquivos CSS carregam
- [ ] Todos os arquivos JS carregam
- [ ] Sem erro 404

---

## 🎨 TESTES DE ANIMAÇÕES

### Entrada na Página
- [ ] Hero section aparece suavemente
- [ ] Cards do menu aparecem um por um (stagger)
- [ ] Card 1 aparece primeiro, depois 2, 3, 4
- [ ] Animação é suave (não trava)

### Hover nos Cards
- [ ] Card eleva 10px ao passar mouse
- [ ] Card aumenta levemente (scale 1.02)
- [ ] Sombra fica mais forte e azul
- [ ] Borda fica cyan brilhante
- [ ] Ícone aumenta e gira 5 graus
- [ ] Transição é suave (400ms cubic-bezier)

### Badge "Novo"
- [ ] Badge no card "Iniciar Jornada" pulsa suavemente
- [ ] Animação é contínua (infinite)
- [ ] Não distrai demais

### Logo Flutuante
- [ ] Logo do hero sobe e desce suavemente
- [ ] Movimento é contínuo
- [ ] Parece flutuar no ar

---

## 💾 TESTES DE PERSISTÊNCIA

### LocalStorage
- [ ] Ativar voz → recarregar → voz continua ativa
- [ ] Aumentar fonte → recarregar → fonte continua grande
- [ ] Ativar contraste → recarregar → contraste continua
- [ ] Todas as 3 configurações juntas persistem
- [ ] Fechar navegador → abrir → configurações mantidas

### Console
- [ ] F12 → Application → Local Storage → file://
- [ ] Deve ter: `voiceEnabled`, `fontSize`, `highContrast`
- [ ] Valores corretos (true/false, small/medium/large/xlarge)

---

## 🧪 TESTES DE COMPATIBILIDADE

### Chrome/Edge
- [ ] Tudo funciona perfeitamente
- [ ] Voz é clara e natural
- [ ] Animações são suaves
- [ ] Sem lag

### Firefox
- [ ] Visual idêntico
- [ ] Voz funciona (pode ser diferente)
- [ ] Todas as funcionalidades OK

### Safari
- [ ] Visual mantém qualidade
- [ ] Voz pode ter diferenças
- [ ] Glassmorphism funciona
- [ ] Animações suaves

---

## 🐛 TESTES DE ERROS

### Console do Navegador
- [ ] Abrir DevTools (F12)
- [ ] Ir para Console
- [ ] Deve ver mensagens verdes de sucesso:
  ```
  ✅ Acessibilidade inicializada
  ✅ Sistema de Acessibilidade com Voz carregado
  📋 Atalhos disponíveis: ...
  ```
- [ ] NÃO deve ter erros em vermelho
- [ ] Avisos (warnings) amarelos são OK

### Network
- [ ] F12 → Network → Recarregar
- [ ] Todos os arquivos carregam (status 200)
- [ ] index-modern.css carrega
- [ ] voice-accessibility.js carrega
- [ ] Sem 404 ou 500

---

## ♿ TESTES DE ACESSIBILIDADE

### Leitores de Tela (se disponível)
- [ ] NVDA/JAWS lê corretamente
- [ ] Elementos têm labels adequados
- [ ] Live region anuncia mudanças
- [ ] Navegação faz sentido

### ARIA
- [ ] Inspecionar elementos (F12)
- [ ] Verificar atributos aria-*
- [ ] role="toolbar" na barra de acessibilidade
- [ ] role="main" no conteúdo principal
- [ ] aria-live="polite" na região de anúncios

### Contraste de Cores
- [ ] Texto é legível no fundo
- [ ] Botões têm bom contraste
- [ ] Alto contraste tem contraste máximo

---

## 📊 PONTUAÇÃO FINAL

Total de testes: **~120 itens**

### Mínimo para Aprovar: 90% (108 testes)

Sua pontuação: _____ / 120

**Resultado:**
- [ ] 120/120 = 🏆 PERFEITO!
- [ ] 108-119 = ✅ APROVADO
- [ ] 90-107 = ⚠️ PRECISA REVISAR
- [ ] <90 = ❌ REPROVAR - corrigir bugs

---

## 🎯 TESTES PRIORITÁRIOS (TOP 10)

Se tiver pouco tempo, teste pelo menos estes:

1. [ ] Voz ativa e fala ao passar mouse nos cards
2. [ ] Botões A+ e A- mudam tamanho da fonte
3. [ ] Alto contraste deixa tudo preto e branco
4. [ ] Atalhos de teclado funcionam (Alt+V, Alt+C, etc)
5. [ ] Cards do menu levantam ao passar mouse
6. [ ] Todos os 4 links do menu funcionam
7. [ ] Configurações persistem após recarregar (F5)
8. [ ] Responsivo no celular (use DevTools F12 → Mobile)
9. [ ] Console não tem erros vermelhos
10. [ ] Tab navega por todos os elementos

---

## 📝 RELATÓRIO DE BUGS

Se encontrar problemas, anote aqui:

### Bug 1:
- **O que:** ___________________________
- **Como reproduzir:** ___________________________
- **Navegador:** ___________________________
- **Gravidade:** [ ] Crítico [ ] Alto [ ] Médio [ ] Baixo

### Bug 2:
- **O que:** ___________________________
- **Como reproduzir:** ___________________________
- **Navegador:** ___________________________
- **Gravidade:** [ ] Crítico [ ] Alto [ ] Médio [ ] Baixo

---

## ✅ APROVAÇÃO FINAL

- [ ] Todos os testes prioritários passaram
- [ ] Pelo menos 90% dos testes totais passaram
- [ ] Nenhum bug crítico encontrado
- [ ] Experiência é fluida e agradável

**Assinatura do Testador:** ___________________________  
**Data:** ___/___/______  
**Status:** [ ] ✅ APROVADO [ ] ❌ REPROVAR [ ] ⚠️ APROVAR COM RESSALVAS

---

## 🎉 PARABÉNS!

Se todos os testes passaram, você tem uma tela principal **totalmente acessível** e **moderna**! 🚀

**Próximos passos:**
1. Fazer deploy no Netlify
2. Testar em produção
3. Coletar feedback de usuários
4. Aplicar mesmo design em outras páginas
