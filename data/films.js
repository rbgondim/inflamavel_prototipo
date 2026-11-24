/* Fonte única dos filmes.
   Antes esta lista existia duplicada em index / galeria / projeto, com sinopses
   ligeiramente diferentes em cada uma. Aqui:
     resumo   -> texto curto usado na listagem (projetos.html)
     synopsis -> texto da página de detalhe (projeto.html)
   Ordem do array = ordem de exibição, do mais recente para o mais antigo. */
window.INF = window.INF || {};

window.INF.films = [
  {
    slug: 'motel-destino',
    title: 'Motel Destino',
    format: 'Longa',
    year: '2024',
    country: 'Brasil / França / Alemanha / Reino Unido',
    duration: '—',
    director: 'Karim Aïnouz',
    roteiro: '—',
    elenco: ['Fabio Assunção', 'Iago Xavier', 'Nataly Rocha'],
    img: 'assets/img/motel-destino3.jpg',
    stills: [
      'assets/img/motel-destino.jpg',
      'assets/img/motel-destino2.jpg',
      'assets/img/motel-destino3.jpg'
    ],
    resumo: 'Sob o céu em chamas do litoral cearense, o Motel Destino torna-se palco de desejo, poder e violência quando a chegada de um jovem forasteiro muda para sempre a rotina do lugar.',
    synopsis: 'Sob o céu em chamas do litoral cearense, o Motel Destino é palco de desejo, poder e violência quando a chegada de um jovem forasteiro muda para sempre a rotina do lugar.',
    destaque: 'Primeiro longa cearense selecionado para a competição oficial do Festival de Cannes; estreia no Brasil em agosto de 2024.'
  },
  {
    slug: 'vida-invisivel',
    title: 'A Vida Invisível',
    format: 'Longa',
    year: '2019',
    country: 'Brasil / Alemanha',
    duration: '140 min',
    director: 'Karim Aïnouz',
    roteiro: 'Murilo Hauser, Inés Bortagaray e Karim Aïnouz — baseado no romance de Martha Batalha',
    elenco: ['Carol Duarte', 'Julia Stockler', 'Gregório Duvivier', 'Fernanda Montenegro'],
    img: 'assets/img/vida-invisivel.jpg',
    stills: [],
    resumo: 'No Rio de Janeiro dos anos 1950, duas irmãs são cruelmente separadas por uma família patriarcal e passam décadas acreditando em versões falsas do destino uma da outra.',
    synopsis: 'No Rio de Janeiro dos anos 1950, duas irmãs são cruelmente separadas por uma família rigidamente patriarcal e passam décadas acreditando em versões falsas do destino uma da outra.',
    destaque: 'Vencedor do prêmio Un Certain Regard no Festival de Cannes 2019; representante do Brasil na disputa por uma vaga ao Oscar de Melhor Filme Internacional.'
  },
  {
    slug: 'praia-do-futuro',
    title: 'Praia do Futuro',
    format: 'Longa',
    year: '2014',
    country: 'Brasil / Alemanha',
    duration: '106 min',
    director: 'Karim Aïnouz',
    roteiro: 'Karim Aïnouz e Felipe Bragança',
    elenco: ['Wagner Moura', 'Clemens Schick', 'Jesuíta Barbosa'],
    img: 'assets/img/praia-do-futuro.jpg',
    stills: [],
    resumo: 'Um salva-vidas de Fortaleza, abalado por não conseguir salvar um turista alemão, apaixona-se pelo amigo da vítima e muda-se para Berlim, deixando para trás o irmão mais novo.',
    synopsis: 'Um salva-vidas de Fortaleza, abalado por não conseguir salvar um turista alemão, se apaixona pelo amigo da vítima e muda-se para Berlim, deixando para trás o irmão mais novo, que anos depois parte em sua busca.',
    destaque: 'Selecionado para a Competição Oficial do Festival de Berlim 2014.'
  },
  {
    slug: 'viajo-preciso',
    title: 'Viajo Porque Preciso, Volto Porque Te Amo',
    format: 'Longa',
    year: '2009',
    country: 'Brasil',
    duration: '75 min',
    director: 'Karim Aïnouz e Marcelo Gomes',
    roteiro: 'Karim Aïnouz e Marcelo Gomes',
    elenco: ['Irandhir Santos (narração)'],
    img: 'assets/img/viajo-preciso.jpg',
    stills: [],
    resumo: 'Um geólogo atravessa o sertão nordestino avaliando o traçado de um canal que vai desviar as águas de um rio, e a solidão da paisagem árida passa a espelhar seu próprio esvaziamento interior.',
    synopsis: 'Um geólogo atravessa o sertão nordestino avaliando o traçado de um canal que vai desviar as águas de um rio, e a solidão da paisagem árida passa a espelhar seu próprio esvaziamento interior.',
    destaque: 'Estreou no Festival de Veneza 2009, na mostra Orizzonti.'
  },
  {
    slug: 'ceu-de-suely',
    title: 'O Céu de Suely',
    format: 'Longa',
    year: '2006',
    country: 'Brasil / Alemanha / França / Portugal',
    duration: '90 min',
    director: 'Karim Aïnouz',
    roteiro: 'Karim Aïnouz, Felipe Bragança e Maurício Zacharias',
    elenco: ['Hermila Guedes', 'João Miguel', 'Maria Menezes', 'Zezita Matos'],
    img: 'assets/img/ceu-de-suely.jpg',
    stills: [],
    resumo: 'De volta à pequena Iguatu, no sertão do Ceará, uma jovem mãe abandonada decide rifar uma noite com o próprio corpo, sob o codinome Suely, para recomeçar em outro lugar.',
    synopsis: 'De volta à pequena Iguatu, no interior do Ceará, com um filho recém-nascido e abandonada pelo companheiro, uma jovem decide rifar uma noite com o próprio corpo, sob o codinome Suely, em busca de dinheiro para recomeçar em outro lugar.',
    destaque: 'Selecionado para o Festival de Veneza 2006.'
  },
  {
    slug: 'madame-sata',
    title: 'Madame Satã',
    format: 'Longa',
    year: '2002',
    country: 'Brasil / França',
    duration: '105 min',
    director: 'Karim Aïnouz',
    roteiro: 'Karim Aïnouz e Marcelo Gomes',
    elenco: ['Lázaro Ramos', 'Marcélia Cartaxo', 'Flávio Bauraqui', 'Felippe Marques'],
    img: 'assets/img/madame-sata.jpg',
    stills: [],
    resumo: 'No Rio de Janeiro dos anos 1930, na boemia da Lapa, João Francisco dos Santos transita entre o crime e os palcos de cabaré até se transformar no lendário Madame Satã.',
    synopsis: 'No Rio de Janeiro dos anos 1930, na boemia da Lapa, João Francisco dos Santos transita entre o crime e os palcos de cabaré antes de se transformar no lendário Madame Satã.',
    destaque: 'Longa de estreia de Karim Aïnouz; selecionado para a mostra Un Certain Regard do Festival de Cannes 2002.'
  }
];

window.INF.filmBySlug = function (slug) {
  var list = window.INF.films;
  for (var i = 0; i < list.length; i++) if (list[i].slug === slug) return list[i];
  return null;
};
