# Inflamável — protótipo

Site estático da Cinema Inflamável. Sem build, sem dependências, sem framework:
abre no navegador e vai para o Vercel como está.

## Estrutura

```
index.html        home — splash animado + carrossel dos seis filmes
projetos.html     listagem vertical, um filme por tela
projeto.html      detalhe de um filme, escolhido por ?f=<slug>
info.html         quem somos, filmografia, fundadores, marcos, impressum

css/site.css      folha única: tokens, componentes, responsivo
js/heat.js        campo de ruído do gradiente da marca (compartilhado)
js/nav.js         header e alternância PT/EN (compartilhado)
js/home.js        splash + carrossel
js/projetos.js    revelação no scroll + amostragem de cor das imagens
js/projeto.js     preenche a página a partir do slug + carrossel do hero
js/info.js        troca de sede no impressum

data/films.js     os seis filmes — usado por projeto.html
assets/img/       stills (8) + logo.svg + favicon
assets/fonts/     Geist, Serial B, Serial B Blur

dev-server.py     servidor local sem cache
vercel.json       cabeçalhos de cache
```

## Como editar

**Layout e cor** → `css/site.css`. Os tokens estão no topo, em `:root`. O
gradiente `--heat` é a assinatura da marca; o valor no CSS é só o fallback, quem
manda é `js/heat.js`.

**Texto e estrutura das páginas** → o HTML da própria página. Todo o markup está
escrito de forma explícita, inclusive os seis cards da listagem, para que a
página continue legível.

**O logo** está embutido como SVG nas páginas, com `fill="currentColor"` — por
isso a cor vem de `color` e acompanha o token `--rosa` junto com o resto. Já foi
canvas pintado em js e depois `mask-image`; a máscara sumia por completo em
alguns navegadores em vez de degradar. `assets/img/logo.svg` é a fonte de onde
os paths saíram, para regerar os embutidos se o desenho mudar.

**Dados de um filme** → dois lugares, porque a listagem é markup estático e o
detalhe é template:

- `projetos.html` (o card na listagem)
- `data/films.js` (a página de detalhe)

O header e o rodapé estão repetidos nas quatro páginas. Isso é
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
python3 dev-server.py
```

Depois abra `http://localhost:4322`. Serve por HTTP, não por `file://` — a
amostragem de cor das imagens em `projetos.html` usa canvas e é bloqueada em
`file://`.

Use este servidor e não o `python3 -m http.server`: o embutido não manda
`Cache-Control`, o navegador cacheia CSS e JS por conta própria, e você fica
editando arquivo e vendo a versão antiga sem nenhum aviso.

## Variantes de cor em teste

Experimentos pendurados na URL, para comparar o mesmo site sem fixar escolha:

```
?texto=amarelo     ?fundo=grafite
?texto=vermelho    ?fundo=noite
                   ?fundo=creme
```

Combinam: `?texto=amarelo&fundo=noite`. Funciona porque todo texto do site
aponta para `--rosa` e todo fundo escuro para `--ink` — trocar dois tokens
troca tudo. Para fixar uma escolha, o valor sobe para o `:root` e o bloco de
variantes sai do CSS.

Contraste medido (texto corrido a 90%, mínimo de 4,5):

| texto | preto | grafite | noite | creme |
|---|---|---|---|---|
| rosa | 4,51 | 4,12 | 4,30 | 3,20 |
| amarelo | **11,46** | 10,50 | 10,94 | 1,25 |
| vermelho | 4,52 | 4,13 | 4,30 | 3,12 |

Os rótulos a 45% de opacidade ficam abaixo do mínimo em todas as combinações
menos as de amarelo sobre fundo escuro, que chegam a 3,5. Se a escolha final
não for amarelo, a escala de opacidade precisa ser repensada: hoje os níveis
baixos escurecem em direção ao fundo, e o caminho é clareá-los em direção ao
branco.

## Cache

Local: use `dev-server.py`, que manda `no-store`.

Produção: o `vercel.json` faz o HTML, o CSS e o JS revalidarem a cada
carregamento — assim ninguém fica com a folha de estilo antiga depois de um
deploy. As fontes são imutáveis (nunca mudam de conteúdo) e as imagens
revalidam de hora em hora.

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

- **Voltar para a home não repete o splash.** Antes, clicar em "Home" de qualquer
  página reiniciava a animação inteira.
- **`Serial B` tem os quatro pesos em todas as páginas.** Antes, só a home
  embutia 300/400/500/700; as outras traziam apenas o 700 e caíam em fallback
  onde o layout pedia 500.
- **Links normais.** As páginas apontavam umas para as outras por
  `Inflamavel Splash Home.dc.html`, com espaços na URL.

### O que continua igual

- PT / ENG / GER é só estado visual, nada é traduzido ainda. O botão troca o
  `lang` do documento (pt-BR / en / de) e dispara `inf:lang` em `js/nav.js`, que
  é onde a tradução entra quando os textos existirem.
- Os oito campos do Impressum de Berlim estão em branco. São dado cadastral de
  documento legal alemão e precisam vir da contabilidade — não se inventa.
- Detecção automática de idioma não está implementada.
- "Em Desenvolvimento" ainda aponta para `#`.
- Instagram, Vimeo e Contato ainda apontam para `#`.

## Pendências

- As imagens são fotogramas de filmes do Karim Aïnouz. Vale confirmar os direitos
  de uso antes de publicar em domínio próprio.
- As imagens são JPEG grandes (5,4 MB somados). Existem WebP das mesmas oito,
  nas mesmas dimensões, em `_SITE/IMAGENS` fora do repo: 1,5 MB, 72% a menos.
- O favicon ainda é `logo-white.png`, o wordmark antigo esticado num quadrado.
- O overlay de menu em tela cheia segue sem gatilho e com o maior `font-size`
  do css (124px), sem nunca aparecer na tela.
