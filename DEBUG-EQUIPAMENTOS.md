# 🔧 Debug: Equipamentos não aparecem no Netlify

## 📋 Problema
Os equipamentos aparecem corretamente no Live Server, mas não aparecem no Netlify.

## 🛠️ Solução Implementada

### 1. Logs de Debug Adicionados

Adicionei logs detalhados em todo o sistema para identificar onde está o problema:

#### No `isPaginaAtual()`:
- Mostra o pathname atual
- Mostra todas as verificações de caminho
- Mostra o resultado final

#### No `atualizarEquipamentos()`:
- Mostra se detectou index ou loja
- Mostra se encontrou o container
- Mostra os itens equipados
- Mostra qual HTML foi inserido

### 2. Função `isPaginaAtual()` Melhorada

A função agora verifica **7 condições diferentes** para garantir compatibilidade:

```javascript
function isPaginaAtual(pageName) {
    const normalizedPath = path.replace(/\/+/g, '/');
    
    return normalizedPath.endsWith(`${pageNameWithoutExt}.html`) ||     // /loja.html
           normalizedPath.endsWith(`/${pageNameWithoutExt}`) ||          // /loja
           normalizedPath.endsWith(`${pageNameWithoutExt}`) ||           // loja
           normalizedPath === `/${pageNameWithoutExt}` ||                // exatamente /loja
           normalizedPath === `${pageNameWithoutExt}` ||                 // exatamente loja
           normalizedPath.includes(`/${pageNameWithoutExt}.html`) ||     // contém /loja.html
           normalizedPath.includes(`/${pageNameWithoutExt}/`);           // contém /loja/
}
```

## 🧪 Como Testar

### Teste Local (Live Server):

1. Abra `teste-equipamentos.html` no navegador
2. Abra o Console (F12)
3. Observe os logs automáticos
4. Clique em "🔍 Testar Detecção de Página"
5. Verifique se detecta corretamente

### Teste no Netlify:

1. Faça deploy do código atualizado
2. Acesse a página no Netlify
3. Abra o Console (F12)
4. Procure pelos logs que começam com `[isPaginaAtual]` e `[atualizarEquipamentos]`
5. Identifique qual verificação está falhando

## 🔍 O que Verificar nos Logs

### Se estiver funcionando:
```
[isPaginaAtual] Verificando "index"
[isPaginaAtual] Path atual: "/index.html"
[isPaginaAtual] Resultado: true
[atualizarEquipamentos] É index? true, É loja? false
[atualizarEquipamentos] Container encontrado: [object HTMLDivElement]
```

### Se não estiver funcionando:
```
[isPaginaAtual] Verificando "index"
[isPaginaAtual] Path atual: "/algum-caminho-estranho"
[isPaginaAtual] Resultado: false
[atualizarEquipamentos] Não é index nem loja, saindo...
```

## 📊 Checklist de Debug

Quando abrir a página no Netlify, verifique:

- [ ] O console mostra logs do `[DOMContentLoaded]`?
- [ ] Qual é o `pathname` exato mostrado no log?
- [ ] O `isPaginaAtual('index')` retorna `true`?
- [ ] O `isPaginaAtual('loja')` retorna `true` (quando na loja)?
- [ ] O container é encontrado?
- [ ] Existem itens no localStorage?

## 🎯 Possíveis Causas

### Causa 1: Pathname diferente
**Sintoma:** Logs mostram pathname inesperado
**Solução:** Ajustar a função `isPaginaAtual` com o padrão correto

### Causa 2: Script não carrega
**Sintoma:** Nenhum log aparece no console
**Solução:** Verificar se os scripts estão sendo carregados (aba Network do DevTools)

### Causa 3: Container não existe
**Sintoma:** Log mostra "Container não encontrado"
**Solução:** Verificar se o HTML tem `id="equipamentos-container"`

### Causa 4: Ordem de carregamento
**Sintoma:** Scripts carregam, mas container ainda não existe
**Solução:** Já resolvido com `DOMContentLoaded`

## 💡 Próximos Passos

1. **Teste Local**: Abra `teste-equipamentos.html` e verifique se funciona
2. **Verifique Logs**: Abra `index.html` ou `loja.html` e veja os logs no console
3. **Me envie os logs**: Copie os logs que aparecem no console do Netlify
4. **Ajustaremos juntos**: Com base nos logs, podemos identificar o problema exato

## 🚨 Importante

Os logs **temporários** adicionados podem ser removidos depois que identificarmos o problema. Eles estão lá apenas para debug.

Para remover os logs depois:
1. Procure por todas as linhas com `console.log` em `global.js`
2. Delete ou comente as linhas de debug
3. Mantenha apenas a lógica funcional

## 📞 Me envie estas informações

Para eu ajudar melhor, me envie:

1. **URL do Netlify** onde o problema ocorre
2. **Screenshot** ou texto dos logs do console
3. **Pathname** exato que aparece nos logs
4. Se possível, teste a página `teste-equipamentos.html` no Netlify também
