# Solução para Problemas de Caminhos (Live Server vs Netlify)

## Problema Identificado

O código estava usando verificações de caminho que funcionavam apenas em um ambiente:
- **Live Server**: Usa URLs com `.html` (ex: `loja.html`)
- **Netlify**: Remove o `.html` das URLs (ex: `/loja`)

Isso causava que o código funcionasse em apenas um dos ambientes.

## Solução Implementada

### 1. Arquivo de Utilitários (`js/path-utils.js`)

Criamos um arquivo centralizado com funções helper que funcionam em ambos os ambientes:

```javascript
// Verifica se está na página especificada (funciona com ou sem .html)
isPaginaAtual('loja') // Funciona tanto para 'loja.html' quanto '/loja'

// Verifica se o caminho contém determinado texto
caminhoContem('fases') // Para verificar se está na pasta fases/

// Retorna caminho correto para navegação
obterCaminhoNavegacao('loja') // Retorna 'loja.html'
```

### 2. Alterações no `global.js`

**Antes:**
```javascript
if (window.location.pathname.endsWith('loja')) { ... }
if (path.endsWith('loja.html')) { ... }
```

**Depois:**
```javascript
if (isPaginaAtual('loja')) { ... }
```

### 3. Alterações no `reset-progresso.js`

**Antes:**
```javascript
if (window.location.pathname.includes('trilha.html')) { ... }
```

**Depois:**
```javascript
const path = window.location.pathname;
if (path.includes('trilha') || path.endsWith('/trilha')) { ... }
```

### 4. Arquivos HTML Atualizados

Adicionamos o script `path-utils.js` antes dos outros scripts em:
- `index.html`
- `loja.html`

## Como Usar as Funções

### `isPaginaAtual(pageName)`
Verifica se você está na página especificada:
```javascript
if (isPaginaAtual('loja')) {
    // Código específico da loja
}

if (isPaginaAtual('index')) {
    // Código específico da página inicial
}
```

### `caminhoContem(pathPart)`
Verifica se o caminho contém determinada string:
```javascript
if (caminhoContem('fases')) {
    // Está em alguma página dentro da pasta fases/
}
```

### `estaNaPastaFases()`
Verifica se está em uma página dentro da pasta fases/:
```javascript
if (estaNaPastaFases()) {
    // Ajustar navegação relativa
}
```

### `obterCaminhoNavegacao(pageName)`
Retorna o caminho correto para navegação (com .html):
```javascript
window.location.href = obterCaminhoNavegacao('trilha');
// Resulta em: 'trilha.html'
```

## Benefícios

✅ **Compatibilidade Total**: Funciona em Live Server e Netlify
✅ **Código Centralizado**: Uma única fonte de verdade
✅ **Fácil Manutenção**: Alterar comportamento em um único lugar
✅ **Legibilidade**: Código mais limpo e intuitivo
✅ **Reutilizável**: Usar em qualquer página do projeto

## Checklist de Migração

Para migrar outros arquivos, siga estes passos:

1. ✅ Adicionar `<script src="js/path-utils.js"></script>` no HTML (antes dos outros scripts)
2. ✅ Substituir `.endsWith('pagina.html')` por `isPaginaAtual('pagina')`
3. ✅ Substituir `.includes('pagina.html')` por `caminhoContem('pagina')`
4. ✅ Testar no Live Server
5. ✅ Testar no Netlify

## Arquivos já Corrigidos

- ✅ `js/path-utils.js` (criado)
- ✅ `js/global.js`
- ✅ `js/reset-progresso.js`
- ✅ `index.html`
- ✅ `loja.html`

## Próximos Passos (Opcional)

Se necessário, aplicar a mesma solução em:
- Arquivos de fase (fase1.js, fase2.js, etc.)
- gameSystem.js
- gameSystemSimple.js
- trilha.js
