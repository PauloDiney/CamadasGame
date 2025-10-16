/**
 * Utilitários para manipulação de caminhos e URLs
 * Funciona tanto no Live Server (com .html) quanto no Netlify (sem .html)
 */

/**
 * Verifica se a página atual corresponde ao nome fornecido
 * @param {string} pageName - Nome da página (com ou sem .html)
 * @returns {boolean}
 */
function isPaginaAtual(pageName) {
    const path = window.location.pathname;
    const pageNameWithoutExt = pageName.replace('.html', '');
    
    // Normaliza o path removendo barras duplas
    const normalizedPath = path.replace(/\/+/g, '/');
    
    // Verifica múltiplas condições para garantir compatibilidade
    return normalizedPath.endsWith(`${pageNameWithoutExt}.html`) ||
           normalizedPath.endsWith(`/${pageNameWithoutExt}`) ||
           normalizedPath.endsWith(`${pageNameWithoutExt}`) ||
           normalizedPath === `/${pageNameWithoutExt}` ||
           normalizedPath === `${pageNameWithoutExt}` ||
           normalizedPath.includes(`/${pageNameWithoutExt}.html`) ||
           normalizedPath.includes(`/${pageNameWithoutExt}/`);
}

/**
 * Verifica se o caminho atual contém determinado nome
 * @param {string} pathPart - Parte do caminho a verificar
 * @returns {boolean}
 */
function caminhoContem(pathPart) {
    const path = window.location.pathname;
    const pathPartWithoutExt = pathPart.replace('.html', '');
    return path.includes(pathPartWithoutExt);
}

/**
 * Retorna o caminho correto para navegação (adiciona .html se necessário)
 * @param {string} pageName - Nome da página
 * @returns {string}
 */
function obterCaminhoNavegacao(pageName) {
    // Se já tem extensão, retorna como está
    if (pageName.endsWith('.html')) {
        return pageName;
    }
    // Adiciona .html para compatibilidade com Live Server
    return `${pageName}.html`;
}

/**
 * Verifica se está em uma página dentro da pasta fases/
 * @returns {boolean}
 */
function estaNaPastaFases() {
    return window.location.pathname.includes('/fases/');
}
