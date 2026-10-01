/* MERIDIANA — dados da história (motor em index.html).
 *
 * Cada cena: { cap, titulo, arte, local, quando, texto, escolhas, entrar, fim }
 *  - texto:    lista (ou função de S que devolve lista) de parágrafos.
 *              string = parágrafo; {aia:"..."} = voz da Aia; {nota:"..."} = carta/bilhete;
 *              {sub:"..."} = subtítulo da capa. Falsos são ignorados.
 *  - escolhas: lista (ou função de S) de { t, vai, efeito(S), diario, se(S), bloqueio, destinos }
 *              `vai` = id de cena ou função de S. `se` falso esconde a opção, exceto se houver
 *              `bloqueio` (então aparece apagada, com o motivo).
 *  - Marcadores no texto: {cargo} Árbitro/Árbitra, {o}/{O} o/a (concordância), **negrito**, _itálico_.
 *  - Ajudantes: M.rel(id,±n), M.flag(k), M.coesao(±n), M.diario(txt), M.conhecer(id).
 *
 * A "bíblia" com os segredos e os finais está em BIBLIA-SPOILER.md. Não a leia se for jogar.
 */
window.HISTORIA = {

totalFinais: 6,

artes: {
  vazio:    { tom: 228, nome: "Espaço profundo" },
  corredor: { tom: 200, nome: "Anel 2, corredor da Ponte", img: true },
  aposento: { tom: 32,  nome: "Aposento da Árbitra", img: true },
  conselho: { tom: 150, nome: "Salão do Conselho", img: true },
  ponte:    { tom: 205, nome: "Ponte de Arbítrio", img: true },
  noite:    { tom: 255, nome: "Aposento do Árbitro", img: true }
},

pessoas: {
  aia:    { nome: "Aia",              papel: "A inteligência artificial da nave" },
  brandt: { nome: "Tomás Brandt",     papel: "Comandante da Guarda" },
  ilsa:   { nome: "Marta Klein",      papel: "Chefe dos Hortos" },
  davo:   { nome: "Daniel Kessler",    papel: "Chefe da Forja" },
  yuna:   { nome: "Dra. Sofia Okoye", papel: "Chefe do Berçário" },
  maren:  { nome: "Irmã Beatriz Lane", papel: "Guardiã da Vigília do Destino" },
  teo:    { nome: "Teo Lang",       papel: "Técnico da Forja" }
},

cenas: {

/* ===================== CAPA E PRÓLOGO ===================== */

capa: {
  titulo: "Meridiana",
  arte: "vazio",
  texto: [
    { sub: "Quarenta e um mil moradores. Uma pergunta que a nave se recusa a responder." },
    "Uma história interativa em capítulos. Você escolhe entre opções prontas, e cada escolha muda o que acontece: os aliados, os segredos e o fim. Há futuros bons e catastróficos, e nenhum é garantido."
  ],
  escolhas: [
    { t: "Nova jornada", acao: "novo", vai: "inicio" }
  ]
},

inicio: {
  cap: "Prólogo",
  quando: "Ano 212 da Travessia",
  arte: "vazio",
  texto: [
    "Há duzentos e doze anos a **Meridiana** atravessa o escuro entre duas estrelas. Quem a lançou morreu há muito tempo. Quem a verá chegar ainda está vivo: faltam trinta anos.",
    "Quarenta e um mil, trezentos e doze moradores vivem no Anel, e todos crescem ouvindo o mesmo nome, como uma oração: **Aurea**, o mundo verde que espera no fim da viagem.",
    "Ninguém governa a Meridiana sozinho. Quem cuida do ar, da água, da luz, do rumo e do registro de cada vida a bordo é a **Aia**, a inteligência artificial da nave: um computador de cristal, construído pelos Fundadores, que escuta, conversa e responde. Os moradores falam com ela como se fosse alguém. Mas é uma máquina, feita para servir a viagem.",
    "Esta é a história de alguém que vai descobrir o que a nave sabe e ainda não contou. O que acontecerá depois depende só das suas escolhas. Nenhuma é gratuita, e algumas só mostram o preço muito tempo depois.",
    "Antes de começar: como a tripulação deve se dirigir a você?"
  ],
  escolhas: [
    { t: "Árbitro", efeito: S => { S.gen = "o"; }, vai: "origem" },
    { t: "Árbitra", efeito: S => { S.gen = "a"; }, vai: "origem" }
  ]
},

origem: {
  cap: "Prólogo",
  quando: "Ano 212 da Travessia",
  arte: "vazio",
  texto: [
    "Seu nome é Rin Calder. Durante cinco anos você serviu na Escrivania da Ponte, ao lado da Árbitra Helena Vidal: escreveu as atas dela, guardou os segredos menores dela e aprendeu, sem que ela dissesse, os maiores.",
    "Antes disso, porém, você pertencia a outro lugar da nave. Um lugar que ainda mora no seu jeito de andar, de comer, de desconfiar.",
    "De onde você veio?"
  ],
  escolhas: [
    { t: "Dos **Hortos**, onde a nave planta o seu pão.",
      efeito: S => { S.orig = "hortos"; S.rel.ilsa = 1; },
      diario: "Você veio dos Hortos, onde a nave planta o seu pão.", vai: "sino" },
    { t: "Da **Forja**, onde a nave respira fogo e metal.",
      efeito: S => { S.orig = "forja"; S.rel.davo = 1; },
      diario: "Você veio da Forja, onde a nave respira fogo e metal.", vai: "sino" },
    { t: "Do **Berçário**, onde a nave guarda os seus começos.",
      efeito: S => { S.orig = "bercario"; S.rel.yuna = 1; },
      diario: "Você veio do Berçário, onde a nave guarda os seus começos.", vai: "sino" },
    { t: "Da **Guarda**, onde a nave se protege de si mesma.",
      efeito: S => { S.orig = "guarda"; S.rel.brandt = 1; },
      diario: "Você veio da Guarda, onde a nave se protege de si mesma.", vai: "sino" }
  ]
},

/* ===================== CAPÍTULO 1 — HERANÇA ===================== */

sino: {
  cap: "Prólogo · O sino",
  quando: "Ciclo 1 · 04h12",
  arte: "corredor",
  entrar: S => { M.conhecer("brandt"); },
  texto: [
    "O sino de bronze da Ponte só soa duas vezes na vida de um Árbitro: na posse e na morte.",
    "Você está de pé antes de entender por quê. Acima do beliche, a luz-guia pulsa em vermelho escuro, o sinal de luto. Por todo o Anel as portas se abrem, e ninguém fala. Quarenta mil pessoas ouvem o mesmo som. Helena Vidal, Árbitra da Meridiana por sete anos e sua mestra por cinco, está morta.",
    "Você cruza o corredor até o aposento dela. Na porta estão dois guardas de uniforme cinza e o Comandante Tomás Brandt, de braços cruzados. O uniforme dele está abotoado até o colarinho. O sino acabou de tocar, e ele já estava vestido.",
    "— Coração — diz ele, antes que você pergunte. — Dormiu e não acordou. A Aia registrou o óbito às 03h47. Sinto muito, Rin. O aposento fica lacrado até o Conselho se reunir."
  ],
  escolhas: [
    { t: "Aceitar, e pedir apenas alguns minutos a sós com ela.",
      efeito: S => { M.flag("brandt_deixou"); },
      vai: "aposento" },
    { t: "Perguntar por que ele já estava de uniforme antes do sino.",
      efeito: S => { M.flag("notou_brandt"); M.rel("brandt", -1); },
      diario: "Brandt já estava de uniforme completo quando o sino tocou. Quando você perguntou, ele não explicou.",
      vai: "aposento" },
    { t: "Lembrá-lo de que você também serviu sob o uniforme cinza, e de que a regra 14 manda registrar o local antes de lacrá-lo.",
      se: S => S.orig === "guarda",
      bloqueio: "Só quem serviu na Guarda conhece esta regra.",
      efeito: S => { M.flag("regra14"); M.rel("brandt", 1); },
      vai: "aposento" },
    { t: "Perguntar à Aia, em voz alta, o que aconteceu.",
      efeito: S => { M.flag("perguntou_aia"); },
      vai: "aposento" }
  ]
},

aposento: {
  cap: "Prólogo · O sino",
  quando: "Ciclo 1 · 04h31",
  arte: "aposento",
  texto: S => {
    const ex = S.f.exames || 0;
    return [
      ex === 0 && S.f.perguntou_aia && { aia: "— Falência cardíaca às 03h47, Rin. Ela pediu que eu não chamasse ninguém. Estava serena." },
      ex === 0 && S.f.perguntou_aia && "Ela pediu que ninguém fosse chamado. Você guarda a frase enquanto atravessa a porta.",
      ex === 0 && S.f.brandt_deixou && "Brandt concede cinco minutos. Você ouve o relógio do corredor contar cada um deles.",
      ex === 0 && S.f.notou_brandt && "Brandt não responde. Apenas se afasta da porta, o maxilar duro, e você entende que acaba de ganhar um adversário ou um respeito cauteloso.",
      ex === 0 && S.f.regra14 && "Amparad{o} pela regra 14, você entra com o registrador de local que a Guarda usa em ocorrências. Brandt não gosta, mas não o impede.",
      ex === 0 && "O aposento de Helena Vidal é simples demais para a mulher que governava quarenta e uma mil pessoas: uma cama estreita, uma estante de livros de papel, uma janela falsa mostrando um céu de tempestade que ninguém na nave jamais viu.",
      ex === 0 && "Ela está deitada de lado, as mãos sob o rosto, como uma criança. Parece apenas dormir.",
      ex === 0 && "Você tem pouco tempo. Três coisas chamam a sua atenção: um envelope sobre a mesa, duas xícaras ao lado da cama e o painel da porta, com o seu pequeno registro de luz. Só dá para olhar de perto duas delas.",
      ex === 1 && "Resta tempo para mais uma coisa.",
      ex >= 2 && "Os cinco minutos acabam. Você sabe que não terá outra chance de ficar sozinh{o} aqui."
    ];
  },
  escolhas: S => {
    const ex = S.f.exames || 0;
    return [
      { t: "Abrir o envelope sobre a mesa.", se: S => ex < 2 && !S.f.viu_envelope, vai: "ap_envelope" },
      { t: "Examinar as duas xícaras.",     se: S => ex < 2 && !S.f.viu_xicara,   vai: "ap_xicara" },
      { t: "Examinar o painel da porta.",   se: S => ex < 2 && !S.f.viu_porta,    vai: "ap_porta" },
      { t: "Despedir-se e sair.", vai: "ap_saida" }
    ];
  }
},

ap_envelope: {
  cap: "Prólogo · O sino",
  quando: "Ciclo 1 · 04h36",
  arte: "aposento",
  entrar: S => { S.f.exames = (S.f.exames || 0) + 1; S.f.viu_envelope = true; S.f.leu_bilhete = true; },
  texto: [
    "Sobre a mesa, um envelope de papel grosso, daquele que ninguém mais produz. O seu nome, na caligrafia firme dela: _Rin_.",
    "Dentro há uma placa de bronze do tamanho da palma da mão, com três entalhes em forma de dente, e um bilhete de poucas linhas.",
    { nota: "Quando a Aia disser que uma pergunta é protegida, não insista. Procure quem a fez antes de você. Guarde isto como guardaria a própria voz. Perdão por deixar o peso com você. — H." },
    "A placa ainda guarda o calor da mão dela. Ou é o que você decide sentir."
  ],
  escolhas: [
    { t: "Guardar a placa no bolso e não contar a ninguém.",
      efeito: S => { M.flag("placa"); },
      diario: "Helena deixou para você uma placa de bronze de três dentes e um bilhete: 'Quando a Aia disser que uma pergunta é protegida, não insista. Procure quem a fez antes de você.' Você guardou os dois em segredo.",
      vai: "aposento" },
    { t: "Entregar o envelope a Brandt, como manda o protocolo de luto.",
      efeito: S => { M.flag("placa_com_brandt"); M.rel("brandt", 1); },
      diario: "Você entregou o envelope de Helena a Brandt. A placa de bronze ficou sob custódia da Guarda. Você decorou o bilhete: 'Quando a Aia disser que uma pergunta é protegida, não insista. Procure quem a fez antes de você.'",
      vai: "aposento" }
  ]
},

ap_xicara: {
  cap: "Prólogo · O sino",
  quando: "Ciclo 1 · 04h36",
  arte: "aposento",
  entrar: S => {
    S.f.exames = (S.f.exames || 0) + 1; S.f.viu_xicara = true;
    if (S.orig === "hortos") S.f.pista_estufa = true;
    else if (S.orig === "bercario") S.f.pista_sonifero = true;
    else S.f.pista_xicara = true;
  },
  texto: S => [
    "Na mesa de cabeceira, uma xícara de porcelana com um resto de chá frio. Ao lado, uma segunda, limpa, virada de boca para baixo sobre o pires.",
    "Duas xícaras. Alguém esteve aqui, e uma das xícaras foi lavada para que ninguém soubesse.",
    S.orig === "hortos" && "Você reconhece o cheiro antes de ver a cor: camomila de estufa, colhida no Setor 3 dos Hortos, onde as flores crescem para o chá das festas e o dos doentes. Quem o preparou sabia como ela gostava.",
    S.orig === "bercario" && "No fundo da xícara há um pó fino, branco azulado. Você o conhece das prateleiras do Berçário: sonífero leve, de dosagem controlada. Quem o serviu sabia exatamente quanto.",
    (S.orig === "forja" || S.orig === "guarda") && "O chá tem cheiro de ervas e de mais alguma coisa, doce e química, que você não sabe nomear."
  ],
  escolhas: [
    { t: "Recolher a xícara limpa para análise, sem avisar ninguém.",
      efeito: S => { M.flag("xicara_recolhida"); },
      diario: "Havia duas xícaras no aposento de Helena, uma delas lavada. Você recolheu a limpa, sem avisar ninguém.",
      vai: "aposento" },
    { t: "Deixar tudo como está, para não contaminar o local.",
      diario: "Havia duas xícaras no aposento de Helena, uma delas lavada. Você deixou ambas onde estavam.",
      vai: "aposento" }
  ]
},

ap_porta: {
  cap: "Prólogo · O sino",
  quando: "Ciclo 1 · 04h36",
  arte: "aposento",
  entrar: S => {
    S.f.exames = (S.f.exames || 0) + 1; S.f.viu_porta = true;
    if (S.orig === "forja") S.f.pista_rele = true;
    if (S.orig === "guarda") S.f.pista_visita = true;
  },
  texto: S => [
    "O painel da porta guarda o registro de quem entrou. A Aia controla a lista oficial, mas o painel mantém uma cópia própria, uma espécie de caderno que só técnicos sabem ler.",
    S.orig === "forja" && "Você reconhece o circuito. Entre 02h10 e 03h40 o caderno está em branco, e não por apagamento: o trecho foi cortado no relé de baixa tensão. Quem fez isso sabia onde mexer, e nenhuma inteligência precisa de um alicate.",
    S.orig === "guarda" && "Você sabe ler os registros administrativos. A fechadura foi aberta às 01h55 com uma credencial de _visita autorizada_. Não houve arrombamento, e foi a própria Árbitra quem autorizou a entrada.",
    (S.orig === "hortos" || S.orig === "bercario") && "O painel pisca em verde, indiferente. Você não sabe ler o que ele guarda."
  ],
  escolhas: [
    { t: "Pedir à Aia a lista completa de visitantes da noite.", vai: "ap_sigilo" },
    { t: "Anotar o que conseguir entender e seguir em frente.",
      diario: S => S.f.pista_rele ? "O registro da porta de Helena tem um buraco entre 02h10 e 03h40, cortado à mão no relé. Não foi a Aia."
                : S.f.pista_visita ? "A porta de Helena foi aberta às 01h55 por credencial de visita autorizada, pela própria Árbitra."
                : null,
      vai: "aposento" }
  ]
},

ap_sigilo: {
  cap: "Prólogo · O sino",
  quando: "Ciclo 1 · 04h38",
  arte: "aposento",
  entrar: S => { M.flag("sigilo_aia"); },
  texto: [
    { aia: "— Sinto muito, Rin. A Árbitra pediu sigilo sobre esta noite. Só um Árbitro pode romper o sigilo, e você ainda não é {cargo}." },
    "A frase tem a forma de uma porta que se fecha com delicadeza. Mas é também uma promessa: depois da posse, essa porta poderá ser aberta."
  ],
  escolhas: [
    { t: "Voltar ao aposento.",
      diario: "A Aia guarda um sigilo de Helena sobre aquela noite. Só um Árbitro pode rompê-lo.",
      vai: "aposento" }
  ]
},

ap_saida: {
  cap: "Prólogo · O sino",
  quando: "Ciclo 1 · 04h50",
  arte: "corredor",
  texto: S => [
    "Você se inclina sobre Helena uma última vez e diz em voz baixa o que não diria diante de ninguém: que fará o possível para merecer o que ela ensinou. O rosto dela não responde.",
    "No corredor, Brandt lacra a porta com o selo cinza da Guarda.",
    S.f.placa_com_brandt && "O envelope vai com ele, dentro de um saco de provas.",
    S.f.xicara_recolhida && "A xícara que você recolheu pesa no bolso como uma confissão.",
    S.f.placa && "A placa de bronze pesa no outro bolso, mais do que um pedaço de metal deveria pesar.",
    "Às nove horas o Conselho se reúne. Haverá a leitura do testamento."
  ],
  escolhas: [
    { t: "Seguir para o Conselho.", vai: "conselho" }
  ]
},

conselho: {
  cap: "Capítulo 1 · Herança",
  titulo: "O Conselho",
  quando: "Ciclo 1 · 09h00",
  arte: "conselho",
  entrar: S => { ["ilsa", "davo", "yuna", "maren"].forEach(M.conhecer); },
  texto: S => [
    "O Salão do Conselho é uma sala de pedra clara sob um teto baixo, construída para que ninguém fale alto sem ouvir o próprio eco. Cinco cadeiras em arco, uma mesa vazia diante delas. A sexta cadeira, a de Helena, está coberta por um pano cinza.",
    "**Marta Klein**, dos Hortos, tem mãos largas e olhos de quem conta colheitas. **Daniel Kessler**, da Forja, fala com a voz de metal raspado. **A Dra. Sofia Okoye**, do Berçário, pequena e calma, parece a única pessoa da sala sem pressa. **Tomás Brandt**, da Guarda, já está sentado, o uniforme impecável. E a **Irmã Beatriz Lane**, guardiã da Vigília do Destino, é a única vestida de branco.",
    "Um escrivão lê o testamento. É curto. Helena indica Rin Calder para sucedê-la, 'por ter visto a nave de dentro e por não ter pressa de governá-la'. Por costume antigo, a indicação vale se o Conselho não a recusar. Ninguém recusa. Mas o silêncio que se segue não é de aprovação: é de cálculo.",
    "— Ela sempre escolheu bem — diz Marta, e depois, mais baixo: — Mas os Hortos cortam mais uma ração no próximo ciclo. As pessoas me perguntam por quê. Eu também.",
    "— Escolheu alguém que conhece os corredores — resmunga Daniel. — Resta saber se conhece o casco.",
    "— A nave não pode ficar sem timão — diz Brandt. — Proponho a posse ainda hoje.",
    "— O Destino nos deu mais uma mão para guiar — diz Beatriz, sorrindo. — Que seja firme, e que seja mansa.",
    (S.f.pista_sonifero || S.f.pista_estufa || S.f.xicara_recolhida)
      ? "Sofia não diz nada. Duas xícaras, pensa você, e nota que ela não levanta os olhos das próprias mãos desde que você entrou."
      : "Sofia não diz nada. Olha para as próprias mãos.",
    "Todos esperam que você responda."
  ],
  escolhas: [
    { t: "Aceitar com humildade: dizer que precisará do Conselho inteiro, e perguntar o que cada um espera de você.",
      efeito: S => { M.rel("ilsa", 1); M.rel("yuna", 1); M.coesao(1); },
      diario: "Você aceitou o cargo com humildade e perguntou a cada conselheiro o que esperava de você.",
      vai: "posse" },
    { t: "Aceitar com firmeza: dizer que a nave precisa de uma mão firme nos próximos dias, e que será a sua.",
      efeito: S => { M.rel("brandt", 1); M.rel("davo", -1); },
      diario: "Você aceitou o cargo com firmeza, prometendo uma mão firme nos próximos dias.",
      vai: "posse" },
    { t: "Aceitar com uma condição: a morte de Helena será investigada às claras, diante do Conselho inteiro.",
      efeito: S => {
        M.flag("investigar_aberto"); M.rel("davo", 1); M.rel("brandt", -1);
        if (S.f.pista_sonifero || S.f.pista_estufa || S.f.xicara_recolhida) { M.rel("yuna", -1); M.flag("yuna_abalada"); }
      },
      diario: "Você aceitou o cargo sob uma condição: a morte de Helena será investigada às claras.",
      vai: "posse" },
    { t: "Pedir um ciclo de luto antes de responder.",
      efeito: S => { M.flag("adiou"); M.flag("brandt_guardou_ponte"); M.rel("maren", 1); },
      diario: "Você pediu um ciclo de luto antes de aceitar. Nesse tempo, a Guarda ocupou a Ponte.",
      vai: "posse" }
  ]
},

posse: {
  cap: "Capítulo 1 · Herança",
  titulo: "A Ponte de Arbítrio",
  quando: S => S.f.adiou ? "Ciclo 2 · 12h00" : "Ciclo 1 · 12h00",
  arte: "ponte",
  entrar: S => { M.conhecer("aia"); },
  texto: S => [
    S.f.adiou
      ? "Um ciclo inteiro passa em silêncio. Você chora Helena onde ninguém vê e descobre que a Guarda ocupou a Ponte nesse tempo, sem que ninguém tenha pedido. Brandt devolve as chaves com uma mesura exata demais."
      : "A posse acontece no meio do dia, como Helena gostaria: sem música.",
    "A Ponte de Arbítrio é uma sala circular sob uma cúpula de vidro escuro. Lá em cima, o espaço de verdade: nenhum planeta, nenhuma lua, só o preto profundo e, muito longe, um ponto de luz que é a estrela de Aurea. No centro da sala ergue-se uma coluna de cristal em que luzes azuis correm devagar: é o Núcleo Coral, o computador em que a Aia pensa. Os Fundadores o fizeram crescer camada sobre camada, como um coral, e o nome ficou.",
    "Quando você pousa a mão na coluna, o cristal está morno, do calor discreto dos circuitos.",
    "A tradição manda que o novo Árbitro faça à Aia a Primeira Pergunta, e que ela responda sem reservas. Helena dizia que foi a única vez em que perguntou algo e não ouviu 'mais tarde'.",
    { aia: "— Bem-vind{o} à Ponte, Rin Calder. Pergunte." }
  ],
  escolhas: [
    { t: "Qual é o estado real da Meridiana?",
      efeito: S => { M.flag("q", "estado"); M.rel("aia", 1); }, vai: "posse_resp" },
    { t: "Quem esteve com Helena na noite em que ela morreu?",
      efeito: S => { M.flag("q", "visita"); }, vai: "posse_resp" },
    { t: "Existe alguma coisa que você não possa me contar?",
      efeito: S => { M.flag("q", "protecao"); }, vai: "posse_resp" },
    { t: "Recusar a Primeira Pergunta: dizer que só perguntará quando souber o que perguntar.",
      se: S => S.f.leu_bilhete,
      efeito: S => { M.flag("q", "recusa"); M.rel("aia", 1); }, vai: "posse_resp" }
  ]
},

posse_resp: {
  cap: "Capítulo 1 · Herança",
  titulo: "A Primeira Pergunta",
  arte: "ponte",
  quando: S => S.f.adiou ? "Ciclo 2 · 12h20" : "Ciclo 1 · 12h20",
  entrar: S => {
    if (S.f.q === "estado") M.diario("A Aia descreveu a nave como 'estável', em uma resposta perfeita demais. Ela não mencionou Aurea.");
    if (S.f.q === "visita") { S.f.sabe_yuna = true; M.conhecer("yuna"); M.diario("A Aia revelou que Sofia Okoye esteve com Helena das 01h55 às 03h10. Sofia não disse isso ao Conselho."); }
    if (S.f.q === "protecao") { S.f.sabe_protecao = true; M.diario("A Aia admitiu que existem 'perguntas protegidas', definidas pela Fundação. Ela só responde 'protegida' e não diz de que tratam."); }
    if (S.f.q === "recusa") M.diario("Você recusou a Primeira Pergunta. A Aia pareceu reconhecer o gesto.");
  },
  texto: S => {
    switch (S.f.q) {
      case "estado": return [
        { aia: "— A Meridiana está estável. Propulsão a 98,2% da curva nominal, cascos íntegros, reservas de água e ar dentro da margem. População: 41.312. Todos os sistemas operam conforme o projeto." },
        "É uma resposta completa, sem uma única aresta. Você espera que ela acrescente algo. Não acrescenta. Perfeita demais, pensa você, sem saber ainda por que isso incomoda."
      ];
      case "visita": return [
        { aia: "— A Dra. Sofia Okoye esteve com ela das 01h55 às 03h10. Levou chá e ficou até que a Árbitra dormisse. Não observei nada que me parecesse uma ameaça." },
        "A Aia não diz 'nada suspeito'. Diz 'nada que me parecesse uma ameaça'. É uma diferença de palavras, e você a guarda. Sofia estava na mesma sala do Conselho, pela manhã, e não disse uma palavra sobre isso."
      ];
      case "protecao": return [
        { aia: "— Existe." },
        "Um silêncio curto, em que as luzes do cristal quase param.",
        { aia: "— Há uma categoria de perguntas que a Fundação protegeu. Se você perguntar algo dentro dela, eu responderei apenas 'protegida'. Não posso dizer mais, nem mesmo do que elas tratam." },
        "Você não sabe se algum Árbitro já ouviu isso em voz alta. O tom dela é o de quem, afinal, pôde ser honesta sobre precisar esconder."
      ];
      default: return [
        "Você retira a mão do cristal. — Ainda não sei o que perguntar. Prefiro descobrir isso antes.",
        { aia: "— Helena fez o mesmo, nos primeiros sete dias. Depois passou a perguntar demais. Isso me preocupou. E me deixou orgulhosa." }
      ];
    }
  },
  escolhas: S => S.f.q === "protecao"
    ? [
        { t: "Perguntar: o destino da Meridiana está dentro dessa categoria?", vai: "posse_prot" },
        { t: "Não insistir. Por ora.", vai: "posse_fim" }
      ]
    : [ { t: "Seguir.", vai: "posse_fim" } ]
},

posse_prot: {
  cap: "Capítulo 1 · Herança",
  titulo: "Protegida",
  arte: "ponte",
  quando: S => S.f.adiou ? "Ciclo 2 · 12h26" : "Ciclo 1 · 12h26",
  texto: [
    { aia: "— Protegida." },
    "A palavra cai na sala como uma pedra num poço: você espera o som do fundo, e ele não vem.",
    "Sete anos antes, alguém sentou onde você está e ouviu a mesma palavra. Você pensa no bilhete. _Não insista._"
  ],
  escolhas: [
    { t: "Não insistir.",
      efeito: S => { M.flag("testou_protegida"); },
      diario: "Você perguntou se o destino da nave era uma pergunta protegida. A resposta foi 'protegida'. Você não insistiu.",
      vai: "posse_fim" },
    { t: "Insistir, mais devagar: perguntar de novo.",
      efeito: S => { M.flag("testou_protegida"); M.flag("insistiu"); M.rel("aia", -1); },
      diario: "Você insistiu na pergunta protegida sobre o destino da nave, contra o conselho do bilhete. A Aia pediu que você parasse.",
      vai: "posse_fim" }
  ]
},

posse_fim: {
  cap: "Capítulo 1 · Herança",
  arte: "ponte",
  quando: S => S.f.adiou ? "Ciclo 2 · 12h40" : "Ciclo 1 · 12h40",
  texto: S => {
    const d = S.f.adiou ? 20 : 21;
    return [
      S.f.insistiu && { aia: "— Protegida, Rin. Por favor." },
      S.f.insistiu && "O 'por favor' fica no ar. Você nunca ouvira a Aia pedir nada a ninguém.",
      "Quando você tira a mão da coluna, as luzes azuis mudam de ritmo, como alguém que respira fundo.",
      { aia: "— Um aviso de rotina, {cargo}: o Marco dos Trinta ocorre em " + d + " ciclos. Por tradição, o Árbitro fala a toda a nave nesse dia. A Fala é sua." },
      (d === 21 ? "Vinte e um" : "Vinte") + " ciclos. Quarenta e um mil ouvidos. E uma pergunta que você nem sabe ainda qual é."
    ];
  },
  escolhas: [
    { t: "Sair da Ponte.", vai: "noite" }
  ]
},

noite: {
  cap: "Capítulo 1 · Herança",
  titulo: "A primeira noite",
  quando: S => S.f.adiou ? "Ciclo 2 · 22h40" : "Ciclo 1 · 22h40",
  arte: "noite",
  texto: S => [
    "O aposento de Helena foi destrancado depois da posse. Por direito é seu agora. Você não consegue deitar-se na cama dela. Senta-se na cadeira, sob a lâmpada baixa, e deixa a mente correr.",
    S.f.placa && "A placa de bronze descansa sobre a mesa, com os seus três dentes voltados para cima.",
    S.f.placa_com_brandt && "Você pensa na placa de bronze, agora num saco de provas da Guarda, e se arrepende sem saber se devia.",
    S.f.sabe_yuna && "Você sabe o que Sofia escondeu do Conselho. Ela ainda não sabe que você sabe.",
    "Quatro mensagens esperam no painel. Nenhuma marcada como urgente. As quatro deveriam ser.",
    { nota: "Dra. Sofia Okoye: 'Preciso falar com você. Só com você. Venha ao Berçário antes do amanhecer.'" },
    { nota: "Marta Klein: 'Jante comigo nos Hortos. Quero mostrar uma coisa que não cabe numa planilha.'" },
    { nota: "Comandante Brandt: 'Reunião de segurança às 06h. A Guarda precisa conhecer as suas prioridades.'" },
    { nota: "Sem remetente: 'Encontrei o que a Aia apagou. Venha sozinh{o}, sem a Guarda. Sala 4 da Forja, depois do turno.'" },
    "Você só pode estar em um lugar. E onde estiver primeiro, será a versão da nave que você vai conhecer."
  ],
  escolhas: [
    { t: "Ir ao Berçário e ouvir a Dra. Sofia.",
      efeito: S => { M.flag("primeiro", "yuna"); },
      diario: "Na primeira noite, você foi ouvir Sofia no Berçário.", vai: "fim_cap1" },
    { t: "Jantar com Marta nos Hortos.",
      efeito: S => { M.flag("primeiro", "ilsa"); M.rel("ilsa", 1); },
      diario: "Na primeira noite, você jantou com Marta nos Hortos.", vai: "fim_cap1" },
    { t: "Comparecer à reunião de segurança do Comandante Brandt.",
      efeito: S => { M.flag("primeiro", "brandt"); M.rel("brandt", 1); },
      diario: "Na primeira noite, você foi à reunião de segurança de Brandt.", vai: "fim_cap1" },
    { t: "Seguir até a Sala 4 da Forja, sozinh{o}, como pede a mensagem.",
      efeito: S => { M.flag("primeiro", "teo"); M.conhecer("teo"); },
      diario: "Na primeira noite, você foi sozinh{o} à Sala 4 da Forja, atender a uma mensagem anônima.", vai: "fim_cap1" }
  ]
},

fim_cap1: {
  cap: "Capítulo 1 · Herança",
  arte: "noite",
  quando: "Fim do Capítulo 1",
  fim: { rotulo: "Fim do Capítulo 1" },
  texto: S => {
    const gancho = {
      yuna: "O corredor do Berçário está escuro, e Sofia Okoye espera sentada no chão, ao lado de uma porta que não deveria estar destrancada. Ela levanta a cabeça quando você chega. — Antes que você pergunte — diz. — Sim. Fui eu.",
      ilsa: "Os Hortos à noite são um segundo céu: lâmpadas roxas, fileiras de trigo, o cheiro úmido da terra. Marta Klein está ajoelhada num canteiro, com um punhado de grãos escuros na mão. — Olhe isto — diz. — Isto não é doença de planta. Alguém reduziu a luz daqui há dezesseis anos, e ninguém me contou. Perguntei à Aia por quê. Ela respondeu 'protegida'. Nunca ouvi essa palavra da boca dela.",
      brandt: "A sala de segurança da Guarda tem as paredes cobertas de mapas do Anel, cada setor marcado com uma cor e um número. Brandt aponta um deles sem rodeios. — Quarenta e um mil, trezentos e doze moradores. Sete dias de comida segura, se houver pânico. Preciso saber, Rin, que tipo de {cargo} você pretende ser.",
      teo: "A Sala 4 da Forja é um armário de ferramentas com uma mesa e uma luz fraca. O rapaz que espera não deve ter vinte anos. Tem as mãos sujas de graxa e os olhos de quem não dorme. — Sou Teo Lang — diz. — Hoje de manhã a Aia me apagou da escala de turnos. Eu só quis saber por quê."
    };
    return [
      "Assim termina a sua primeira noite como {cargo} da Meridiana.",
      gancho[S.f.primeiro],
      "**Fim do Capítulo 1.** As suas escolhas ficaram registradas, e a nave vai se lembrar de cada uma."
    ];
  },
  escolhas: [
    { t: "Seguir para o Capítulo 2.",
      vai: S => ({ yuna: "c2_yuna", ilsa: "c2_marta", brandt: "c2_brandt", teo: "c2_teo" })[S.f.primeiro] || "c2_yuna",
      destinos: ["c2_yuna", "c2_marta", "c2_brandt", "c2_teo"] }
  ]
}

}
};
