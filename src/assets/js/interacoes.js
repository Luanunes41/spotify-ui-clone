const aviso = document.querySelector('.aviso--acessivel');
const tituloAtual = document.querySelector('.player--titulo');
const artistaAtual = document.querySelector('.player--artista');
const botaoPlay = document.querySelector('.player--pausar');
const iconePlay = botaoPlay.querySelector('img');
const botaoCurtir = document.querySelector('.player--curtir');
const tempoAtual = document.querySelector('.player--tempo-atual');
const duracao = document.querySelector('.player--duracao');
const progresso = document.querySelector('.player--progresso .barra');
const preenchimento = progresso.querySelector('.barra--preenchida');
const faixas = [...document.querySelectorAll('.card')];
const painelAmigos = document.querySelector('.container--right');
const botaoPainel = painelAmigos.querySelector('.friend-activity--header button:last-child');

let indiceFaixa = -1;
let segundos = 0;
let tocando = false;
let temporizador;

function anunciar(mensagem) {
    aviso.textContent = '';
    window.setTimeout(() => { aviso.textContent = mensagem; }, 20);
}

function formatarTempo(valor) {
    return `${Math.floor(valor / 60)}:${String(valor % 60).padStart(2, '0')}`;
}

function atualizarProgresso() {
    const total = Number(progresso.getAttribute('aria-valuemax'));
    const percentual = Math.min((segundos / total) * 100, 100);
    tempoAtual.textContent = formatarTempo(segundos);
    progresso.setAttribute('aria-valuenow', String(Math.round(percentual)));
    preenchimento.style.width = `${percentual}%`;
}

function definirReproducao(estado) {
    tocando = estado;
    botaoPlay.setAttribute('aria-pressed', String(tocando));
    botaoPlay.setAttribute('aria-label', tocando ? 'Pausar' : 'Reproduzir');
    iconePlay.src = `src/assets/icons/player/${tocando ? 'pause' : 'play'}.svg`;
    window.clearInterval(temporizador);

    if (tocando) {
        temporizador = window.setInterval(() => {
            segundos += 1;
            if (segundos >= Number(progresso.getAttribute('aria-valuemax'))) {
                segundos = 0;
                const repetir = document.querySelector('[aria-label^="Desativar repetição"]')?.getAttribute('aria-pressed') === 'true';
                if (!repetir) definirReproducao(false);
            }
            atualizarProgresso();
        }, 1000);
    }
}

function selecionarFaixa(indice, iniciar = true) {
    if (!faixas.length) return;
    indiceFaixa = (indice + faixas.length) % faixas.length;
    const faixa = faixas[indiceFaixa];
    const titulo = faixa.querySelector('h3').textContent.trim();
    const artista = faixa.querySelector('p').textContent.trim();

    tituloAtual.textContent = titulo;
    artistaAtual.textContent = artista;
    botaoCurtir.setAttribute('aria-label', `Curtir ${titulo}`);
    botaoCurtir.setAttribute('aria-pressed', 'false');
    segundos = 0;
    atualizarProgresso();
    definirReproducao(iniciar);
    anunciar(`${iniciar ? 'Reproduzindo' : 'Selecionada'}: ${titulo}`);
}

document.querySelectorAll('.card').forEach((faixa, indice) => {
    faixa.addEventListener('click', (evento) => {
        evento.preventDefault();
        selecionarFaixa(indice);
    });
});

document.querySelectorAll('.atalho').forEach((atalho) => {
    atalho.addEventListener('click', (evento) => {
        evento.preventDefault();
        const nome = atalho.textContent.trim();
        const indice = faixas.findIndex((faixa) => faixa.querySelector('h3').textContent.trim() === nome);
        if (indice >= 0) selecionarFaixa(indice);
        else anunciar(`${nome} selecionado. A reprodução é apenas demonstrativa.`);
    });
});

botaoPlay.addEventListener('click', () => {
    definirReproducao(!tocando);
    anunciar(tocando ? 'Reprodução iniciada' : 'Reprodução pausada');
});

document.querySelector('[aria-label="Faixa anterior"]').addEventListener('click', () => {
    selecionarFaixa(indiceFaixa < 0 ? 0 : indiceFaixa - 1);
});

document.querySelector('[aria-label="Próxima faixa"]').addEventListener('click', () => {
    const aleatorio = document.querySelector('[aria-label^="Desativar reprodução aleatória"]')?.getAttribute('aria-pressed') === 'true';
    const proxima = aleatorio ? Math.floor(Math.random() * faixas.length) : indiceFaixa + 1;
    selecionarFaixa(proxima);
});

botaoCurtir.addEventListener('click', () => {
    const curtida = botaoCurtir.getAttribute('aria-pressed') !== 'true';
    botaoCurtir.setAttribute('aria-pressed', String(curtida));
    anunciar(curtida ? 'Faixa adicionada às curtidas' : 'Faixa removida das curtidas');
});

document.querySelectorAll('.player--controles button[aria-pressed]').forEach((botao) => {
    if (botao === botaoPlay) return;
    botao.addEventListener('click', () => {
        const ativo = botao.getAttribute('aria-pressed') !== 'true';
        botao.setAttribute('aria-pressed', String(ativo));
        const nome = ativo ? botao.getAttribute('aria-label').replace('Ativar ', '') : botao.getAttribute('aria-label').replace('Desativar ', '');
        botao.setAttribute('aria-label', `${ativo ? 'Desativar' : 'Ativar'} ${nome}`);
        anunciar(`${nome} ${ativo ? 'ativada' : 'desativada'}`);
    });
});

botaoPainel.addEventListener('click', () => {
    const recolhido = botaoPainel.getAttribute('aria-expanded') === 'true';
    painelAmigos.querySelectorAll(':scope > :not(.friend-activity--header)').forEach((elemento) => {
        elemento.hidden = recolhido;
    });
    botaoPainel.setAttribute('aria-expanded', String(!recolhido));
    botaoPainel.setAttribute('aria-label', recolhido ? 'Expandir atividade de amigos' : 'Recolher atividade de amigos');
    const iconePainel = botaoPainel.querySelector('img');
    iconePainel.src = `src/assets/icons/amigos/${recolhido ? 'add' : 'close'}.svg`;
    iconePainel.classList.toggle('icone--add', recolhido);
    iconePainel.classList.toggle('icone--close', !recolhido);
    anunciar(recolhido ? 'Atividade de amigos recolhida' : 'Atividade de amigos expandida');
});

document.querySelectorAll('.menu--item').forEach((link) => {
    link.addEventListener('click', (evento) => {
        evento.preventDefault();
        document.querySelectorAll('.menu--item').forEach((item) => {
            item.removeAttribute('aria-current');
            item.classList.remove('texto--branco');
            item.classList.add('texto--cinza');
        });
        link.setAttribute('aria-current', 'page');
        link.classList.remove('texto--cinza');
        link.classList.add('texto--branco');

        if (link.getAttribute('href') === '#biblioteca') {
            document.querySelector('.menu--playlists').scrollIntoView({ behavior: 'smooth', block: 'start' });
            anunciar('Biblioteca selecionada');
        } else if (link.getAttribute('href') === '#inicio') {
            document.querySelector('.container--center').scrollTo({ top: 0, behavior: 'smooth' });
            anunciar('Início selecionado');
        } else {
            anunciar(`${link.textContent.trim()} selecionado. Esta área é apenas demonstrativa.`);
        }
    });
});

document.querySelectorAll('.componente--see--all').forEach((link) => {
    link.addEventListener('click', (evento) => {
        evento.preventDefault();
        anunciar(`Mais itens da seção ${link.closest('.secao').querySelector('h2').textContent} não estão disponíveis nesta demonstração.`);
    });
});

document.querySelectorAll('.topo--navegacao button, .usuario, .friend-activity--header button:first-child, .botao--settings, .player--extras button').forEach((botao) => {
    botao.addEventListener('click', () => anunciar(`${botao.getAttribute('aria-label') || botao.textContent.trim()} não está disponível nesta demonstração.`));
});

document.querySelector('.album--recolher').addEventListener('click', (evento) => {
    const capa = document.querySelector('.capa--tocando');
    const recolhida = capa.classList.contains('capa--recolhida');
    capa.classList.toggle('capa--recolhida', !recolhida);
    evento.currentTarget.setAttribute('aria-label', recolhida ? 'Recolher capa' : 'Mostrar capa');
    anunciar(recolhida ? 'Capa do álbum exibida' : 'Capa do álbum recolhida');
});

window.addEventListener('beforeunload', () => window.clearInterval(temporizador));
