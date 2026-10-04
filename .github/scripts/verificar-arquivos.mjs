// Confere se todo arquivo local citado no HTML (src/href) e no CSS (url()) existe.
// Uso: node .github/scripts/verificar-arquivos.mjs
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';

const raiz = process.cwd();

function listarCss(pasta) {
    return readdirSync(pasta, { withFileTypes: true }).flatMap((item) => {
        const caminho = join(pasta, item.name);
        if (item.isDirectory()) return listarCss(caminho);
        return item.name.endsWith('.css') ? [caminho] : [];
    });
}

// Ignora links externos, âncoras, data URIs e afins
function ehLocal(ref) {
    return ref && !/^(https?:|\/\/|#|data:|mailto:|tel:|javascript:)/i.test(ref);
}

const arquivos = [
    { arquivo: join(raiz, 'index.html'), padrao: /\b(?:src|href)="([^"]+)"/g },
    ...listarCss(join(raiz, 'src')).map((arquivo) => ({
        arquivo,
        padrao: /url\(\s*['"]?([^'")]+)['"]?\s*\)/g,
    })),
];

const faltando = [];
let total = 0;

for (const { arquivo, padrao } of arquivos) {
    const conteudo = readFileSync(arquivo, 'utf8');
    for (const [, ref] of conteudo.matchAll(padrao)) {
        if (!ehLocal(ref)) continue;
        total++;
        const alvo = join(dirname(arquivo), decodeURI(ref.split(/[?#]/)[0]));
        if (!existsSync(alvo)) faltando.push(`${relative(raiz, arquivo)} → ${ref}`);
    }
}

if (faltando.length) {
    console.error(`✖ ${faltando.length} referência(s) quebrada(s):`);
    faltando.forEach((linha) => console.error(`  ${linha}`));
    process.exit(1);
}

console.log(`✔ ${total} referências locais conferidas em ${arquivos.length} arquivo(s), nenhuma quebrada.`);
