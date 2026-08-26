# Inflamável — protótipo

Site estático da Cinema Inflamável. Sem build, sem dependências, sem framework:
abre no navegador e vai para o Vercel como está.

## Estrutura

```
index.html        home — splash animado + carrossel dos seis filmes
projetos.html     listagem vertical, um filme por tela
projeto.html      detalhe de um filme, escolhido por ?f=<slug>
info.html         escolha de sede + quem somos, filmografia, fundadores, impressum

css/site.css      folha única: tokens, componentes, responsivo
js/heat.js        campo de ruído do gradiente da marca (compartilhado)
js/nav.js         header, menu e alternância PT/EN (compartilhado)
js/home.js        splash + carrossel
js/projetos.js    revelação no scroll + amostragem de cor das imagens
js/projeto.js     preenche a página a partir do slug + carrossel do hero
js/info.js        porta de entrada da sede

data/films.js     os seis filmes — usado por projeto.html
assets/img/       imagens (9)
assets/fonts/     Geist, Serial B, Serial B Blur
vercel.json       cabeçalhos de cache
```

## Como editar

**Layout e cor** → `css/site.css`. Os tokens estão no topo, em `:root`. O
gradiente `--heat` é a assinatura da marca; o valor no CSS é só o fallback, quem
manda é `js/heat.js`.

**Texto e estrutura das páginas** → o HTML da própria página. Todo o markup está
escrito de forma explícita, inclusive os seis cards da listagem, para que a
página continue legível e importável no Figma.

**Dados de um filme** → dois lugares, porque a listagem é markup estático e o
detalhe é template:

- `projetos.html` (o card na listagem)
- `data/films.js` (a página de detalhe)

O header, o menu e o rodapé estão repetidos nas quatro páginas. Isso é
intencional: sem build, a alternativa seria injetá-los por JS, e aí o Figma
importaria páginas com o topo vazio.

## Botões de sintonia

No topo de `js/home.js`:

| constante | padrão | o que faz |
|---|---|---|
| `FLOW_SPEED` | `2.3` | velocidade do campo de ruído no splash |
| `LOGO_VISIBILITY` | `1` | 0 = logo com a cor crua do gradiente, 1 = quase branco |
| `GRAIN` | `1` | opacidade do grão sobre o splash |
| `SPLASH_ONCE_PER_SESSION` | `true` | splash só no primeiro carregamento da sessão |

`?splash=1` na URL força o splash mesmo já tendo sido visto.

## Rodar local

```bash
python3 -m http.server 4322
```

Depois abra `http://localhost:4322`. Serve por HTTP, não por `file://` — a
amostragem de cor das imagens em `projetos.html` usa canvas e é bloqueada em
`file://`.

## De onde isto veio

O repositório era formado por quatro arquivos HTML de 5 a 8 MB, exportados de
uma ferramenta de design-to-code: cada um trazia um payload embutido em base64
(imagens, fontes, React) e um runtime próprio com templating `{{ }}`, `<sc-for>`
e `<sc-if>`. Não havia CSS nem JS separados — todo o estilo era `style=""` inline
e toda a lógica vivia numa string dentro do HTML.

Esta versão desembrulha aquilo em arquivos comuns. Os bundles originais
continuam no histórico do git:

```bash
git show 50b76ae:index.html > /tmp/bundle-original.html
```

### O que mudou de comportamento

- **O menu abre.** No bundle o overlay existia mas nenhum botão o acionava. Agora
  tem hambúrguer no header — e é assim que se navega no mobile, onde a nav
  horizontal fica escondida.
- **Voltar para a home não repete o splash.** Antes, clicar em "Home" de qualquer
  página reiniciava a animação inteira.
- **A sede escolhida em Info persiste na sessão.**
- **`Serial B` tem os quatro pesos em todas as páginas.** Antes, só a home
  embutia 300/400/500/700; as outras traziam apenas o 700 e caíam em fallback
  onde o layout pedia 500.
- **Links normais.** As páginas apontavam umas para as outras por
  `Inflamavel Splash Home.dc.html`, com espaços na URL.

### O que continua igual

- PT / EN é só estado visual, nada é traduzido. O gancho para quando houver
  tradução é o evento `inf:lang`, disparado em `js/nav.js`.
- "Em Desenvolvimento" ainda aponta para `#`.
- Instagram, Vimeo e Contato ainda apontam para `#`.

## Pendências

- As imagens são fotogramas de filmes do Karim Aïnouz. Vale confirmar os direitos
  de uso antes de publicar em domínio próprio.
- As imagens são JPEG grandes (a maior tem 1 MB). Converter para WebP/AVIF cortaria
  uns 70% sem perda visível.
