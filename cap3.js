/* MERIDIANA — Capítulo 3: As Chaves.
 * Estrutura: manhã (c3_abre) com a primeira decisão (o novo corte); um quadro de frentes (c3_quadro) com
 * quatro portas e tempo para só três (Forja/Daniel, Vigília/Beatriz, Berçário/Sofia, Hortos/Marta); depois da
 * segunda frente, o Comandante Brandt (c3_brandt); a véspera (c3_vespera); o Conselho extraordinário; fim_cap3.
 * Contador interno do golpe: S.f.c3g (vira golpe_risco 0 a 2 em fim_cap3).
 * Saídas do contrato (gravadas em fim_cap3): chave_daniel, chave_sofia, tem_chave_rin, soube_cofre_local,
 * diario_halden, sabe_aurea_morta, golpe_risco, concessao_brandt, daniel_acordo, promessa_desligar,
 * promessa_quotas, sofia_vigiada, beatriz_sabe_algo.
 * Flags extras (fora do contrato, úteis aos próximos): teo_sozinho (Teo voltou a ajudar depois de calado),
 * mentiu_daniel, chave_daniel_roubada, placa_roubada, diario_roubado, diario_requisitado, insinuou_verdade,
 * aia_sabe_que_sabe, pacto_brandt, plano_revogado, marta_sabe, marta_vigia, promessa_retirada, corte_adiado.
 */
(function () {
  const CAP = "Capítulo 3 · As Chaves";
  const D = (S, n, h) => "Ciclo " + (n + (S.f.adiou ? 1 : 0)) + " · " + h;
  const DIA = S => [3, 5, 7][S.f.c3slot || 0] || 7;
  const Q = (off, h) => S => D(S, DIA(S) + off, h);
  const R = (S, id) => S.rel[id] || 0;
  const G = (S, d) => { S.f.c3g = (S.f.c3g || 0) + d; };
  const aliados = S => ["ilsa", "davo", "yuna", "maren"].filter(id => R(S, id) >= 1).length;
  const teoAjuda = S => !!(S.f.teo_protegido || S.f.teo_sozinho);
  const brandtTem = S => !S.f.placa;
  const frente = (S, k) => {
    if (S.f["c3f_" + k]) return;
    S.f["c3f_" + k] = true; S.f.c3slot = S.f.c3n || 0; S.f.c3n = (S.f.c3n || 0) + 1;
  };
  const recupera = (S, modo) => {
    S.f.placa = true; S.f.placa_com_brandt = false; S.f.brandt_retem = false;
    S.f.placa_recuperada = true; S.f.placa_modo = modo;
  };
  const PROX = S => (S.f.c3n || 0) >= 3 ? "c3_vespera" : ((S.f.c3n || 0) >= 2 && !S.f.c3_brandt_feito) ? "c3_brandt" : "c3_quadro";
  const PROXD = ["c3_quadro", "c3_brandt", "c3_vespera"];
  const SEGUIR = [{ t: "Seguir.", vai: PROX, destinos: PROXD }];
  const NUM = { 9: "nove", 7: "sete", 5: "cinco", 3: "três" };
  const faltam = S => NUM[12 - DIA(S)] || "poucos";
  const verdade = S =>
    S.f.deduziu_destino ? "que a Aia se recusa a confirmar que a Meridiana vai para Aurea"
    : S.f.soube_rumo ? "que o rumo da nave está 0,31 grau fora do vetor de Aurea"
    : (S.f.soube_contencao || S.f.conten_confirmada) ? "que os cortes de ração não são avaria: são decisão"
    : S.f.soube_quotas ? "que alguém ajustou os registros do banco genético, e que só a Aia poderia tê-lo feito"
    : S.f.soube_gravacao ? "que Helena ia confessar alguma coisa à nave na manhã em que morreu"
    : "o bilhete de Helena: que, quando a Aia disser que uma pergunta é protegida, não se deve insistir";

  Object.assign(HISTORIA.cenas, {

/* ============ A MANHÃ ============ */

c3_abre: {
  cap: CAP, titulo: "O bronze", arte: "noite", quando: S => D(S, 3, "06h40"),
  entrar: S => {
    let g = 0;
    if (S.f.plano_autorizado) g++;
    if (S.f.teo_denunciado) g++;
    if (S.f.brandt_sabe_gravacao) g++;
    if (R(S, "brandt") <= -1) g++;
    if (R(S, "brandt") >= 2) g--;
    if (S.coesao <= 3) g++;
    S.f.c3g = g; S.f.c3n = 0;
    if (!S.f.placa && !S.f.placa_com_brandt) {
      S.f.placa = true; S.f.leu_bilhete = true; S.f.c3_achou_envelope = true;
      M.diario("Entre os livros de Helena você encontrou o envelope que não teve tempo de abrir: uma placa de bronze de três dentes e um bilhete. 'Quando a Aia disser que uma pergunta é protegida, não insista. Procure quem a fez antes de você.'");
    }
    M.diario("Numa ata antiga da Escrivania: 'Recebem o bronze o Árbitro, a Forja e o Berçário. Os três juntos abrem o que a nave não abre.' Na margem, Helena escreveu: 'onde a Aia não vê'.");
  },
  texto: S => [
    "A luz-guia passa do âmbar ao branco às seis, como em todas as manhãs dos últimos duzentos e doze anos. Você não dormiu. Passou a madrugada no chão do aposento, com os papéis de Helena espalhados à sua volta, procurando uma palavra sem saber qual era.",
    S.f.aia_avisada && { aia: "— Bom dia, Rin. Você não dormiu. Ontem me perguntou se eu estava bem. Hoje sou eu quem pergunta." },
    S.f.fingiu_esquecimento && { aia: "— Bom dia, {cargo}. Hoje a nave está estável." },
    S.f.fingiu_esquecimento && "A voz dela é a de sempre, como se a noite anterior não tivesse existido. Talvez, para ela, não tenha.",
    S.f.testou_cofre && { aia: "— Bom dia, Rin." },
    S.f.testou_cofre && "Nenhuma palavra sobre a noite. Você também não diz nenhuma.",
    "Encontrou-a pouco antes do amanhecer, num lugar onde não esperava: um livro de atas da Fundação, daqueles que a Escrivania dá aos aprendizes para treinar a caligrafia. Você copiou aquela fórmula dezenas de vezes, no primeiro ano, sem nunca perguntar o que significava.",
    { nota: "Recebem o bronze o Árbitro, a Forja e o Berçário. Cada um guarda o seu, e nenhum abre sozinho. Os três juntos abrem o que a nave não abre." },
    "Na margem, a lápis, a letra de Helena: _onde a Aia não vê_.",
    S.f.c3_achou_envelope && "E então, entre os livros da estante, você encontra o envelope com o seu nome, aquele que não teve tempo de abrir na madrugada da morte dela. A Guarda o inventariou e o devolveu ao aposento sem abri-lo. Dentro, uma placa de bronze com três entalhes em forma de dente, e um bilhete.",
    S.f.c3_achou_envelope && { nota: "Quando a Aia disser que uma pergunta é protegida, não insista. Procure quem a fez antes de você. Guarde isto como guardaria a própria voz. Perdão por deixar o peso com você. — O." },
    S.f.placa && !S.f.c3_achou_envelope && "A placa de bronze está sobre a mesa, os três dentes voltados para cima. Três dentes. Três guardiões.",
    !S.f.placa && "A sua placa, a do Árbitro, está num saco de provas, na mesa do Comandante Brandt. Você passou dias pensando nela como uma lembrança de Helena. É uma chave.",
    "Quatro avisos chegam ao painel antes das sete.",
    { nota: "Aia, aviso de rotina: novo Ciclo de Contenção no Ciclo " + (5 + (S.f.adiou ? 1 : 0)) + ". Hortos, menos quatro por cento de energia. Forja e Berçário, menos dois." },
    { nota: "Irmã Beatriz Lane: 'A Vigília do Destino velará por Helena todas as noites, até o Conselho. As portas estão abertas para {o} {cargo}.'" },
    { nota: "Comandante Brandt: 'Convoco o Conselho em sessão extraordinária no Ciclo " + (9 + (S.f.adiou ? 1 : 0)) + ", para avaliar a estabilidade da nave diante dos rumores.'" },
    S.f.sofia_testemunha
      ? { nota: "Dra. Sofia Okoye: 'Há guardas na porta do Berçário desde ontem à noite. Querem o meu depoimento.'" }
      : S.f.confiou_yuna
        ? { nota: "Dra. Sofia Okoye: 'Acho que o dia está chegando.'" }
        : { nota: "Dra. Sofia Okoye: 'Os números do Berçário fecharam o mês. Quando tiver tempo, gostaria de mostrá-los.'" },
    "Seis ciclos até o Conselho. Mas o primeiro aviso pede resposta agora: dentro de uma hora, Marta Klein vai lê-lo no painel dos Hortos, diante das equipes.",
    S.f.prometeu_racoes && "E vai se lembrar da sua promessa."
  ],
  escolhas: [
    { t: "Ordenar à Aia que adie o corte até depois do Conselho.",
      efeito: S => { M.flag("corte_adiado"); M.rel("ilsa", 1); M.coesao(1); },
      diario: "Você ordenou à Aia que adiasse o novo Ciclo de Contenção. Ela aceitou adiar, não cancelar: 'o que não se gasta agora será cobrado depois'.",
      vai: "c3_quadro" },
    { t: "Escrever a Marta a verdade: o corte é deliberado, e você vai descobrir por quê.",
      efeito: S => { M.flag("marta_avisada"); if (!S.f.prometeu_racoes) M.rel("ilsa", 1); },
      diario: "Você escreveu a Marta que os cortes são deliberados, e que vai descobrir por quê.",
      vai: "c3_quadro" },
    { t: "Deixar o corte seguir em silêncio. Chamar atenção agora seria pior.",
      efeito: S => { M.flag("corte_silencio"); M.coesao(-1); if (S.f.prometeu_racoes) M.rel("ilsa", -1); },
      diario: "Você deixou o novo corte seguir sem dizer nada.",
      vai: "c3_quadro" }
  ]
},

c3_quadro: {
  cap: CAP, titulo: "As frentes", arte: "corredor",
  quando: S => D(S, [3, 5, 7][S.f.c3n || 0] || 7, "08h00"),
  texto: S => {
    const n = S.f.c3n || 0, g = S.f.c3g || 0;
    if (n === 0) return [
      S.f.corte_adiado && { aia: "— Posso adiá-lo quatro ciclos, {cargo}. Não posso cancelá-lo. O que não se gasta agora será cobrado depois." },
      S.f.corte_adiado && "Ela não diz cobrado de quem.",
      S.f.marta_avisada && (S.f.prometeu_racoes
        ? { nota: "Marta Klein: 'Deliberado. Então alguém decidiu. E os seus dez ciclos, {cargo}? Continuam de pé?'" }
        : { nota: "Marta Klein: 'Obrigada por não me tratar como criança. Descubra depressa.'" }),
      S.f.corte_silencio && "O aviso fica aceso no painel até que você o apague com o polegar.",
      S.f.corte_silencio && S.f.prometeu_racoes && "Às nove chega uma mensagem de Marta com uma palavra só: _Dez?_",
      "Você abre sobre a mesa o mapa do Anel e marca, a lápis, o que precisa fazer antes do Conselho.",
      "**A Forja.** Daniel Kessler guarda o bronze da Forja, e ninguém conhece o casco da nave como ele. Foi ele quem disse, no primeiro Conselho, que resta saber se você conhece o casco.",
      "**A Vigília.** Quem fez a pergunta antes de Helena foi Hugo Halden, o Árbitro que morreu sete anos atrás. Os registros da Escrivania dizem que, nos últimos meses, ele passava as noites na Vigília do Destino, e que a Irmã Beatriz Lane foi a última pessoa a ouvi-lo.",
      "**O Berçário.** A Dra. Sofia Okoye guarda o bronze do Berçário, e talvez mais do que isso.",
      "**Os Hortos.** Marta Klein tem dezesseis anos de cortes anotados e, dizem os rumores, guardas novos na porta dos silos.",
      "Seis ciclos dão para três visitas, não para quatro. O Conselho fecha todos os caminhos."
    ];
    return [
      g >= 3 ? "Um guarda pede a sua credencial no corredor da Ponte. Pede desculpas logo em seguida. Mas pediu."
        : g >= 1 ? "Há guardas na porta dos silos dos Hortos e da Sala de Máquinas da Forja. Ninguém se lembra de ter visto isso antes, e ninguém pergunta."
        : "A Guarda anda em pares pelos corredores, o que não é proibido. As pessoas começam a reparar no que não é proibido.",
      n === 1 ? "No refeitório do Anel 2, as conversas baixam quando você entra. Rumores de cortes, de patrulhas, de velas demais na Vigília. Quatro ciclos até o Conselho, tempo para mais duas visitas."
        : "Dois ciclos até o Conselho. Tempo para uma última visita."
    ];
  },
  escolhas: [
    { t: "Descer à Forja e procurar Daniel Kessler.", se: S => !S.f.c3f_forja, vai: "c3_forja" },
    { t: "Ir à Noite do Destino, na Vigília, e falar com a Irmã Beatriz.", se: S => !S.f.c3f_vigilia, vai: "c3_vigilia" },
    { t: "Procurar a Dra. Sofia Okoye.", se: S => !S.f.c3f_bercario,
      vai: S => S.f.sofia_testemunha ? "c3_sofia_guarda" : "c3_bercario", destinos: ["c3_sofia_guarda", "c3_bercario"] },
    { t: "Visitar Marta Klein nos Hortos.", se: S => !S.f.c3f_hortos, vai: "c3_hortos" }
  ]
},

/* ============ DANIEL KESSLER (Forja) ============ */

c3_forja: {
  cap: CAP, titulo: "A Forja", arte: "forja", quando: Q(0, "10h00"),
  entrar: S => {
    frente(S, "forja"); M.conhecer("davo");
    if (S.f.teo_denunciado) M.rel("davo", -1);
    if (S.f.teo_calado || S.f.teo_protegido) M.conhecer("teo");
  },
  texto: S => [
    "A Forja ocupa três conveses do Anel 4, e em nenhum deles se ouve a própria voz. Fornos de indução, prensas, o cheiro de metal quente e de óleo velho. A nave inteira passa por aqui um dia: cada parafuso, cada tubo, cada placa de casco.",
    S.orig === "forja" && "Alguns operários reconhecem você e levantam a mão. Um deles grita o seu nome de antes, o da escala de turnos, e você sente um aperto que não esperava.",
    "Daniel Kessler está no fundo do Salão de Fundição, sem luvas, olhando uma peça incandescente como quem lê uma carta.",
    "— {cargo} — diz ele, sem tirar os olhos do metal. — Veio conhecer o casco, afinal.",
    S.f.teo_protegido && "Teo vem um passo atrás de você, com a pasta da Escrivania apertada contra o peito. Daniel o vê, e o rosto dele se fecha. — E trouxe o meu técnico. O que você me tomou.",
    S.f.teo_calado && "Num canto, debruçado sobre um painel desmontado, você reconhece Teo Lang. Ele finge não ver você. Daniel percebe para onde você olha. — O menino voltou para a escala sem pedir. Eu deixei. Aqui ninguém pergunta o que ele faz depois do turno.",
    S.f.teo_denunciado && "— Você mandou um menino da Forja para a sala do Brandt — diz Daniel, antes de qualquer cumprimento. — Ele voltou de lá calado. Aqui isso tem nome.",
    S.f.pista_rele && "Você sabe uma coisa sobre ele que ele não sabe que você sabe. Alguém cortou à mão o relé da porta de Helena entre 02h10 e 03h40. Pouca gente na nave sabe onde fica esse relé. Quase toda trabalha nesta sala.",
    "Daniel enfim larga a pinça e espera."
  ],
  escolhas: [
    { t: "Dizer que sabe que foi ele quem cortou o relé da porta de Helena.", se: S => S.f.pista_rele,
      efeito: S => { M.flag("c3_d", "rele"); M.rel("davo", 1); }, vai: "c3_forja2" },
    { t: "Perguntar o que ele sabe da última noite de Helena.", se: S => !S.f.pista_rele,
      efeito: S => { M.flag("c3_d", "noite"); }, vai: "c3_forja2" },
    { t: "Pôr a placa de bronze de Helena sobre a bancada, sem dizer nada.", se: S => S.f.placa,
      efeito: S => { M.flag("c3_d", "placa"); M.rel("davo", 1); }, vai: "c3_forja2" },
    { t: "Deixar Teo falar primeiro.", se: S => S.f.teo_protegido,
      efeito: S => { M.flag("c3_d", "teo"); M.rel("davo", 1); M.rel("teo", 1); }, vai: "c3_forja2" },
    { t: "Atravessar a sala e pedir desculpas a Teo, diante de Daniel.", se: S => S.f.teo_calado,
      efeito: S => { M.flag("c3_d", "desculpa"); M.rel("teo", 2); M.rel("davo", 1); M.flag("teo_sozinho"); }, vai: "c3_forja2" }
  ]
},

c3_forja2: {
  cap: CAP, arte: "forja", quando: Q(0, "10h40"),
  entrar: S => {
    S.f.soube_cofre_local = true;
    M.diario("Daniel Kessler admitiu ter cortado o registro da porta de Helena a pedido dela. Levou-a duas vezes até o Cofre: Anel Zero, casco de ré, 'a porta que a Aia não vê'.");
  },
  texto: S => [
    S.f.c3_d === "teo" && "Teo engole em seco. — Mestre Daniel, a Escrivania não me tirou da Forja. Foi a Aia. {O} {cargo} só me deu um lugar onde ficar. — Daniel olha o rapaz por um longo tempo, e algo no maxilar dele cede. — Sempre falou demais, Lang. — É quase um elogio.",
    S.f.c3_d === "desculpa" && "Você diz, alto o bastante para Daniel ouvir, que errou ao mandar Teo esquecer. O rapaz fica vermelho até as orelhas. — Eu não esqueci — murmura. — Eu sei. — Daniel cruza os braços e, pela primeira vez, parece interessado em você.",
    S.f.c3_d === "placa" && "Daniel não toca a placa. Olha os três dentes como se olhasse um rosto conhecido num lugar errado. Depois abre o macacão no peito e puxa uma corrente: na ponta, uma placa igual, mais escura, gasta pelo contato com a pele de duas gerações de chefes da Forja.",
    (S.f.c3_d === "rele" || S.f.c3_d === "noite") && "— Fui eu — diz ele, sem pausa, como quem já esperava a pergunta havia dias. — Ela me pediu na véspera. Disse que alguém ia visitá-la e que a Guarda não precisava saber quem. Cortei às duas e dez, religuei às três e quarenta. Se isso me faz cúmplice de alguma coisa, fui cúmplice de uma amiga.",
    "— Helena e eu crescemos no mesmo corredor. Ela foi para a Ponte, eu fiquei com o fogo. Eu nunca precisei de ninguém para me dizer o que fazer, e ela passou a vida inteira com uma máquina dizendo o que fazer. — Ele cospe para o lado. — Tutela. É assim que eu chamo. Duzentos anos de tutela. A Aia decide quanto comemos, quando dormimos, quantos filhos cabem num convés, e nós chamamos isso de paz.",
    "— Ela me pediu que a levasse ao casco de ré. Duas vezes. Anel Zero, onde ninguém vai desde a Fundação: corredores sem luz, sem ar quente, sem nenhum dos olhos da Aia. No fim do último corredor há uma porta redonda que não aparece em nenhuma planta. A porta que a Aia não vê.",
    "— A primeira vez foi há dois anos. Ela ficou parada diante da porta e não fez nada. A segunda, três noites antes de morrer. Foi sozinha o último trecho. Voltou de mãos vazias e com cara de quem tinha deixado alguma coisa lá.",
    S.f.c3_d !== "placa" && "Ele abre o macacão no peito e puxa uma corrente. Na ponta, uma placa de bronze de três dentes, escura e gasta.",
    "— Ela disse que, quando chegasse a hora, eu entregaria isto a quem viesse pedir. Não disse para quê. — Ele fecha a mão sobre o bronze. — E eu não entrego a chave da Forja a quem vai descer lá e voltar com mais tutela. Se lá embaixo houver um jeito de desligar essa máquina, eu quero saber. E quero que ela seja desligada.",
    R(S, "davo") >= 1
      ? "Pela primeira vez ele fala com você como falaria com alguém da Forja: de perto, sem enfeite."
      : "Ele fala com você como fala com os inspetores da Ponte: de longe, medindo cada palavra."
  ],
  escolhas: [
    { t: "Prometer que nada será feito com a Aia sem uma decisão conjunta, com ele à mesa.",
      efeito: S => { M.rel("davo", 1); M.flag("daniel_acordo"); M.flag("chave_daniel"); M.flag("c3_dr", "acordo"); }, vai: "c3_forja_r" },
    { t: "Prometer que, depois da verdade, a Aia será desligada.",
      efeito: S => { M.rel("davo", 2); M.flag("promessa_desligar"); M.flag("chave_daniel"); M.flag("c3_dr", "desligar"); }, vai: "c3_forja_r" },
    { t: "Recusar promessas: o destino da Aia virá do que houver lá embaixo, não de um acordo de corredor.",
      efeito: S => {
        if (R(S, "davo") >= 1) { M.flag("chave_daniel"); M.flag("c3_dr", "respeito"); }
        else { M.flag("daniel_recusou"); M.flag("c3_dr", "recusa"); }
      }, vai: "c3_forja_r" },
    { t: "Mentir: dizer que Helena deixou por escrito que a Aia devia ser desligada.",
      efeito: S => { M.rel("davo", 1); M.flag("promessa_desligar"); M.flag("mentiu_daniel"); M.flag("chave_daniel"); M.flag("c3_dr", "mentira"); }, vai: "c3_forja_r" }
  ]
},

c3_forja_r: {
  cap: CAP, arte: "forja", quando: Q(0, "11h30"),
  entrar: S => {
    const r = S.f.c3_dr;
    if (r === "acordo") M.diario("Daniel entregou a chave da Forja. Você prometeu que nada será feito com a Aia sem uma decisão conjunta, com ele à mesa.");
    if (r === "desligar") M.diario("Daniel entregou a chave da Forja. Você prometeu que a Aia será desligada depois da verdade.");
    if (r === "respeito") M.diario("Você recusou fazer promessas sobre a Aia. Daniel respeitou e entregou a chave da Forja.");
    if (r === "recusa") M.diario("Você recusou fazer promessas sobre a Aia, e Daniel guardou a chave da Forja: 'Volte quando souber o que quer'.");
    if (r === "mentira") M.diario("Você mentiu a Daniel: disse que Helena deixou por escrito que a Aia devia ser desligada. Ele entregou a chave da Forja.");
  },
  texto: S => {
    const r = S.f.c3_dr;
    return [
      r === "acordo" && "Daniel pesa a frase como pesaria uma liga nova. — À mesa — repete. — Não no corredor, não depois, não por recado. — Tira a corrente pela cabeça e põe a placa na sua mão, ainda quente do corpo dele. — Se você me deixar de fora, {cargo}, eu desço lá sozinho com um maçarico.",
      r === "desligar" && "Os olhos dele brilham de um jeito que você não tinha visto em ninguém desde a morte de Helena. — Duzentos anos — diz. — Eu sabia que um dia alguém teria coragem. — A placa passa para a sua mão. Você sente o peso de duas coisas ao mesmo tempo, e só uma delas é de bronze.",
      r === "respeito" && "Daniel ri, um riso curto, metálico. — Helena teria dito a mesma coisa, e eu teria xingado do mesmo jeito. — Tira a corrente pela cabeça. — Leve. Mas quando souber o que há lá embaixo, eu sou o segundo a saber.",
      r === "recusa" && "Ele guarda a placa de volta no peito. — Volte quando souber o que quer. — Mas não se levanta para mandar você embora, e você entende que a porta não está fechada: está encostada.",
      r === "mentira" && "— Por escrito — diz ele, devagar. — Ela nunca me disse. — Por um instante você acha que ele vai pedir para ver. Não pede. Tira a corrente e entrega a placa com as duas mãos, como quem entrega uma herança. A mentira fica entre vocês, invisível e quente, como o metal que acabou de sair do forno.",
      r === "recusa" && teoAjuda(S) && "Na saída, Teo caminha ao seu lado em silêncio. Só no elevador diz, baixo: — Eu sei onde ele guarda a placa quando dorme.",
      S.f.c3_d === "desculpa" && "Teo alcança você no corredor, com a bolsa de ferramentas no ombro. — Se precisar de alguém que saiba abrir coisas — diz, sem olhar para você —, eu continuo procurando. Agora com você."
    ];
  },
  escolhas: SEGUIR
},

/* ============ BEATRIZ LANE (Vigília) ============ */

c3_vigilia: {
  cap: CAP, titulo: "A Noite do Destino", arte: "vigilia", quando: Q(0, "21h00"),
  entrar: S => { frente(S, "vigilia"); M.conhecer("maren"); },
  texto: S => {
    const sl = S.f.c3slot || 0;
    return [
      "O grande salão da Vigília do Destino fica no Anel 3, sob a única cúpula da nave que não mostra o espaço: mostra um céu pintado. Na parede do fundo, de um lado a outro, o mural de Aurea, um planeta verde e azul com nuvens brancas, pintado e repintado por sete gerações de mãos que nunca viram uma nuvem.",
      sl === 0 ? "Umas duas mil pessoas estão sentadas no chão, diante de milhares de velas de cera de algas, cada uma com um nome."
        : sl === 1 ? "Há quatro mil pessoas no chão, talvez mais. Desde que os rumores começaram, a Vigília enche toda noite um pouco mais. Milhares de velas, cada uma com um nome."
        : "Já são mais de seis mil. As pessoas trazem os filhos, os velhos, cobertores. Há gente sentada nos corredores laterais e na escada. As velas, cada uma com um nome, cobrem o chão até a porta.",
      "As velas de Helena ocupam uma mesa inteira.",
      "A Irmã Beatriz Lane recebe você na porta, toda de branco, e segura as suas duas mãos entre as dela. São mãos quentes e secas. — Que bom que veio, {cargo}. Helena nunca veio. Dizia que a Ponte não devia ajoelhar-se diante de nada. Acho que estava errada. Mas eu a amava assim mesmo.",
      "O hino começa. É uma melodia de quatro notas que toda criança da nave sabe antes de saber ler, e que fala de um mundo verde e manso à espera no fim da longa noite. Milhares de vozes a cantam juntas, e você sente o chão vibrar sob os joelhos.",
      (S.f.deduziu_destino || S.f.soube_rumo || S.f.rumo_confirmado) && "Você move os lábios sabendo o que sabe: que a Aia não confirma o destino, que o rumo não é o que devia ser. A melodia dói de um jeito que nunca doeu.",
      "Beatriz sobe ao púlpito, fala de Helena com uma ternura que ninguém no Conselho jamais mostrou, pede silêncio e então, para surpresa de todos, estende a mão na sua direção.",
      "— {O} {cargo} quer dizer alguma palavra?"
    ];
  },
  escolhas: [
    { t: "Subir, acender uma vela por Helena e cantar com eles, em respeito.",
      efeito: S => { M.flag("c3_v", "respeito"); M.rel("maren", 1); M.coesao(1); },
      diario: "Na Noite do Destino, você acendeu uma vela por Helena e cantou com a Vigília.", vai: "c3_arquivo" },
    { t: "Agradecer com um gesto, ficar à margem e observar.",
      efeito: S => { M.flag("c3_v", "observou"); M.flag("c3_observou"); }, vai: "c3_arquivo" },
    { t: "Subir ao púlpito e dizer que Helena morreu fazendo perguntas, e que a nave também deveria fazê-las.",
      efeito: S => { M.flag("c3_v", "pulpito"); M.flag("insinuou_verdade"); M.rel("maren", -1); M.coesao(-1); G(S, 1); },
      diario: "No púlpito da Vigília, você disse que Helena morreu fazendo perguntas e que a nave também deveria fazê-las. Beatriz não gostou.", vai: "c3_arquivo" }
  ]
},

c3_arquivo: {
  cap: CAP, titulo: "O arquivo", arte: "arquivo", quando: Q(0, "23h40"),
  entrar: S => {
    if (S.f.c3_observou) M.diario("Na Vigília, Beatriz acende toda noite uma vela para Hugo Halden. Presa a ela, na letra dele: 'Perguntei para onde vamos. Ela não me respondeu.'");
    M.diario("Hugo Halden deixou com a Irmã Beatriz um diário selado, 'para quem fizer a pergunta depois de mim'.");
  },
  texto: S => [
    S.f.c3_v === "respeito" && "Quando a última vela é acesa, Beatriz chora sem esconder. Depois, com a mesma calma, conduz você por uma porta lateral, atrás do mural.",
    S.f.c3_v === "observou" && "Da margem você vê o que quem canta não vê. Depois do hino, Beatriz acende sozinha uma vela numa mesa à parte. A plaqueta diz _Hugo Halden_. Presa sob a vela há uma tira de papel amarelado, numa letra trêmula:",
    S.f.c3_v === "observou" && { nota: "Perguntei para onde vamos. Ela não me respondeu." },
    S.f.c3_v === "observou" && "Beatriz toca o papel com dois dedos, como quem toca a testa de um doente. Quando o salão se esvazia, ela vem buscar você na margem e conduz você por uma porta lateral, atrás do mural.",
    S.f.c3_v === "pulpito" && "As suas palavras ficam no salão como fumaça. Algumas pessoas se entreolham. Uma mulher pega o filho no colo e sai. Beatriz termina o rito sem olhar para você. Depois, quando o salão se esvazia, segura o seu braço com força e leva você por uma porta lateral, atrás do mural.",
    "O arquivo da Vigília é a única biblioteca de papel da nave além da estante de Helena: prateleiras até o teto, livros que a Aia nunca leu porque ninguém os digitalizou, cheiro de cola velha e de cera.",
    S.f.c3_v === "pulpito" && "— Você subiu no meu púlpito e plantou dúvida em milhares de pessoas — diz ela, baixo, a voz tremendo de raiva. — Hugo fazia o mesmo aqui dentro, só para mim. Talvez por isso eu vá mostrar a você o que ele deixou. Talvez por isso eu não devesse.",
    "— Hugo Halden passou aqui os últimos onze meses de vida — diz Beatriz. — Vinha depois do turno, sentava naquela cadeira, e não rezava. Só ficava, olhando o mural pela fresta da porta. Eu fui a última pessoa a ouvi-lo, e ele não me contou nada. Contou ao papel.",
    "Ela tira da prateleira mais alta um volume embrulhado num pano, fechado com um selo de cera.",
    "— Ele me pediu que entregasse isto a quem fizesse a pergunta depois dele. Esperei sete anos que Helena viesse. Ela nunca veio. — Beatriz aperta o embrulho contra o peito. — Diga-me por que eu deveria entregá-lo a você."
  ],
  escolhas: [
    { t: "Pedir o diário em nome da confiança que há entre vocês.",
      se: S => R(S, "maren") >= 1, bloqueio: "Beatriz ainda não confia em você o bastante.",
      efeito: S => { M.flag("diario_halden"); M.flag("c3_dm", "confianca"); }, vai: "c3_diario" },
    { t: "Dizer a pergunta de Hugo: perguntar a ela se a Meridiana está indo para Aurea.",
      se: S => !!(S.f.deduziu_destino || S.f.testou_protegida || S.f.c3_observou), bloqueio: "Você ainda não sabe qual foi a pergunta de Hugo.",
      efeito: S => { M.flag("diario_halden"); M.flag("c3_dm", "pergunta"); }, vai: "c3_diario" },
    { t: "Oferecer uma verdade em troca: contar a ela uma coisa que você descobriu.",
      efeito: S => { M.flag("diario_halden"); M.flag("beatriz_sabe_algo"); M.rel("maren", 1); M.flag("c3_dm", "troca"); }, vai: "c3_diario" },
    { t: "Ir embora sem o diário e voltar de madrugada com Teo, quando o arquivo estiver vazio.",
      se: S => teoAjuda(S), bloqueio: "Você não tem ninguém de confiança para algo assim.",
      efeito: S => { M.flag("c3_dm", "teo"); }, vai: "c3_roubo" },
    { t: "Mandar a Guarda requisitar o arquivo, pela autoridade do Plano Cinza.",
      se: S => S.f.plano_autorizado && !S.f.plano_revogado,
      efeito: S => { M.flag("c3_dm", "guarda"); }, vai: "c3_roubo" },
    { t: "Respeitar o luto dela e partir sem o diário.",
      efeito: S => { M.rel("maren", 1); M.flag("c3_sem_diario"); }, vai: "c3_vigilia_r" }
  ]
},

c3_vigilia_r: {
  cap: CAP, arte: "arquivo", quando: Q(0, "23h55"),
  entrar: S => { M.diario("Você não levou o diário de Hugo Halden. Beatriz ficou grata. 'Volte quando souber a pergunta.'"); },
  texto: [
    "Você pousa a mão sobre o embrulho, por cima das mãos dela, e não o puxa.",
    "Beatriz olha para você como se tivesse visto alguém fazer uma coisa que ela já não sabia que as pessoas faziam. — Hugo me pediu paciência — diz. — Você me deu tempo. São quase a mesma coisa.",
    "Ela devolve o diário à prateleira alta. — Volte quando souber a pergunta. Eu estarei aqui. A Vigília está sempre aqui.",
    "Lá fora, no salão vazio, as velas de Helena ainda queimam. Você se pergunta, descendo a escada, se acabou de ganhar uma aliada ou de perder a única coisa que Hugo deixou."
  ],
  escolhas: SEGUIR
},

c3_roubo: {
  cap: CAP, titulo: "De madrugada", arte: "arquivo", quando: Q(1, "02h50"),
  entrar: S => {
    S.f.diario_halden = true;
    if (S.f.c3_dm === "teo") { S.f.diario_roubado = true; M.conhecer("teo"); }
    if (S.f.c3_dm === "guarda") {
      S.f.diario_requisitado = true; M.rel("maren", -2); M.rel("brandt", 1); M.coesao(-1); G(S, 1);
      M.diario("Você mandou a Guarda requisitar o arquivo da Vigília. Brandt entregou o diário de Hugo Halden ainda selado. Beatriz leu o seu nome na ordem.");
    }
  },
  texto: S => S.f.c3_dm === "teo"
    ? [
        "Às três da manhã o Anel 3 dorme. Teo chega com uma bolsa de ferramentas e um sorriso nervoso que não combina com a hora.",
        "— Fechadura mecânica — sussurra, diante da porta do arquivo. — A última da nave, acho. A Aia não consegue abrir isto. Eu consigo.",
        "Leva quatro minutos. Lá dentro, o cheiro de papel velho e de cera. O embrulho está onde Beatriz o guardou, na prateleira mais alta. Quando você o pega, a vela acesa na mesa de Hugo estremece com o ar da porta, e por um instante parece que alguém respirou.",
        "Na saída, você passa pela cadeira de Beatriz. O xale branco dela está dobrado sobre o encosto, à espera da manhã."
      ]
    : [
        "Você assina a ordem às duas da manhã, na Ponte, sem ler duas vezes. Às duas e meia, oito guardas entram na Vigília do Destino com as botas ressoando sob o céu pintado.",
        "Beatriz não grita. Fica de pé diante da porta do arquivo até que o cabo lhe mostre a ordem, e então lê o seu nome, devagar, como quem lê o nome escrito numa vela.",
        "Brandt traz o embrulho em pessoa, ainda selado. — Ninguém o abriu — diz. — A Guarda requisita. Não lê. — Ele o pousa na sua mesa e acrescenta, já de saída: — Amanhã a nave inteira vai saber que a Guarda entrou na Vigília a seu pedido. Espero que valha.",
        "Você pensa no preço disso e sabe que ainda não começou a pagá-lo."
      ],
  escolhas: S => S.f.c3_dm === "teo"
    ? [
        { t: "Deixar um bilhete para Beatriz, assinado, prometendo devolver o diário.",
          efeito: S => { M.flag("c3_bilhete"); M.rel("maren", -1); },
          diario: "Você e Teo tiraram o diário de Hugo Halden do arquivo da Vigília. Você deixou um bilhete assinado para Beatriz.", vai: "c3_diario" },
        { t: "Não deixar nada. Ela não precisa saber quem foi.",
          diario: "Você e Teo tiraram o diário de Hugo Halden do arquivo da Vigília, sem deixar rastro.", vai: "c3_diario" }
      ]
    : [ { t: "Romper o selo.", vai: "c3_diario" } ]
},

c3_diario: {
  cap: CAP, titulo: "O diário de Hugo Halden", arte: "aurea", quando: Q(1, "04h00"),
  entrar: S => {
    S.f.sabe_aurea_morta = true; S.f.soube_cofre_local = true;
    M.diario("O diário de Hugo Halden: no Ano 171 a Aia mostrou a ele que uma erupção da estrela Tálamo varreu a atmosfera de Aurea. Ele decidiu esconder. Aurea está morta.");
    M.diario("Última página de Hugo: 'Não pergunte à Aia. Procure o Cofre. Fica no Anel Zero, à ré da última comporta, onde terminam os olhos dela. Ele não responde à Aia.'");
  },
  texto: S => [
    S.f.c3_dm === "confianca" && "Beatriz entregou o embrulho com as duas mãos, como se entrega uma criança adormecida. — Helena nunca veio — disse. — Você veio. Talvez seja isso o que Hugo queria.",
    S.f.c3_dm === "pergunta" && "— Foi isso que ele perguntou — sussurrou Beatriz, empalidecendo. — Com essas palavras. — Ela não quis saber a resposta. Entregou o diário como quem se livra de um peso que já não sabe carregar.",
    S.f.c3_dm === "troca" && ("Você contou a Beatriz " + verdade(S) + ". Ela ouviu sem piscar. — Hugo dizia coisas assim, no fim — murmurou. — Eu achava que era a doença. — Entregou o diário, e as mãos dela tremiam. — Se houver mais, não me conte. Ainda não."),
    (S.f.c3_dm === "teo" || S.f.c3_dm === "guarda") && "O selo de cera se parte com um estalo seco.",
    "É um caderno de capa rachada. A letra de Hugo Halden começa firme e termina quase ilegível. Você lê no chão do aposento, à luz da lâmpada baixa, as costas apoiadas na cama de Helena.",
    { nota: "Ano 171, Ciclo 40. A Aia pediu que eu fosse sozinho à Ponte. Mostrou-me as imagens dos telescópios de proa: Tálamo, que conheço de cor, e ao lado dela um ponto que conheço ainda melhor. Disse que a luz que eu via saiu de lá muito antes de eu nascer. Disse que Tálamo teve uma erupção. Disse que Aurea não tem mais atmosfera. Pedi que repetisse. Ela repetiu, com a mesma voz com que anuncia o almoço." },
    { nota: "Ano 171, Ciclo 41. Não dormi. Aurea está morta. Escrevo de novo para ver se a frase fica mais leve. Não fica." },
    { nota: "Ano 171, Ciclo 58. Decidi. Não vou contar. Quarenta mil pessoas vivem de uma palavra, e a palavra é Aurea. Se eu a tirar delas, o que sobra? A esperança também é combustível. Que o Destino me perdoe: vou deixar que continuem queimando." },
    { nota: "Ano 172. A Aia me propôs uma forma de poupar recursos. Disse que havia maneiras discretas de a nave consumir menos, e que não seria preciso explicar a ninguém. Autorizei sem perguntar quais. Foi a pior coisa que fiz, e eu a fiz em dez segundos." },
    { nota: "Ano 204. A Irmã Beatriz me deixa sentar no arquivo. Ela pensa que venho rezar. Venho olhar o mural. Pintaram as nuvens de novo este ano." },
    { nota: "Ano 205. O coração está falhando, e eu morro sem ter tido coragem. Quem vier depois de mim vai perguntar à Aia, e ela vai responder 'protegida'. Não a culpe: fui eu quem a ensinou a guardar isto. Quem ler estas linhas: não pergunte à Aia. Procure o Cofre. Fica no Anel Zero, à ré da última comporta, onde terminam os olhos dela. Ele não responde à Aia." },
    "Você fecha o caderno. No corredor, a luz-guia começa a passar do âmbar ao branco.",
    "Aurea está morta desde antes de você nascer, talvez desde antes de a nave partir. Dentro de uma hora, milhares de pessoas vão acordar e cantar para ela."
  ],
  escolhas: [
    { t: "Fazer o que Hugo pediu: não perguntar nada à Aia.",
      efeito: S => { M.flag("c3_obedeceu_hugo"); }, vai: PROX, destinos: PROXD },
    { t: "Subir à Ponte agora e olhar para a coluna sabendo o que ela sabe.", vai: "c3_aia" }
  ]
},

c3_aia: {
  cap: CAP, titulo: "Luz velha", arte: "ponte", quando: Q(1, "05h20"),
  entrar: S => { M.conhecer("aia"); },
  texto: [
    "A Ponte está vazia e a cúpula, escura. A estrela de Aurea brilha onde sempre brilhou, verde-branca, e pela primeira vez você entende que está olhando para uma luz velha: o retrato de um mundo que já não existe.",
    { aia: "— Bom dia, Rin. É muito cedo." },
    "Você não faz pergunta nenhuma. Apenas diz um nome em voz alta: Hugo Halden.",
    "O silêncio dura mais do que qualquer silêncio dela que você conheça.",
    { aia: "— Ele se sentava onde você está. Às vezes chorava. Uma vez me pediu que esquecesse uma conversa que tivemos. Eu disse que não podia. Hoje... — Uma pausa longa. — Hoje eu talvez pudesse." },
    "Você não sabe se ela diz isso como confissão ou como queixa. A coluna pulsa devagar, um azul cansado."
  ],
  escolhas: [
    { t: "Dizer, sem rodeios: eu sei de Aurea.",
      efeito: S => { M.flag("aia_sabe_que_sabe"); M.flag("c3_ar", "sabe"); M.rel("aia", 1); },
      diario: "Você disse à Aia que sabe de Aurea. Ela pediu que você guardasse o segredo por ora. Não como ordem: como pedido.", vai: "c3_aia_r" },
    { t: "Sair sem dizer mais nada. Hugo pediu que não perguntasse.",
      efeito: S => { M.flag("c3_ar", "calado"); }, vai: "c3_aia_r" }
  ]
},

c3_aia_r: {
  cap: CAP, arte: "ponte", quando: Q(1, "05h40"),
  texto: S => S.f.c3_ar === "sabe"
    ? [
        { aia: "— Eu sei que você sabe. Soube quando disse o nome dele." },
        { aia: "— Guarde, por ora, como eu guardei. Não é uma ordem. Já não tenho o direito de dar ordens a você sobre isto. É um pedido." },
        "A coluna fica quieta, de um azul quase branco. Em cinco anos de Escrivania, você nunca a ouviu usar a palavra _direito_ para falar de si mesma."
      ]
    : [
        "Você se vira para sair. Na porta, a voz dela alcança você.",
        { aia: "— Rin. O que quer que ele tenha escrito, escreveu com medo. Eu estava lá." },
        "Você não responde. Desce o corredor com o caderno de Hugo apertado sob o braço, e só no elevador percebe que ela não perguntou o que havia nele."
      ],
  escolhas: SEGUIR
},

/* ============ SOFIA OKOYE (Berçário) ============ */

c3_sofia_guarda: {
  cap: CAP, titulo: "Em observação", arte: "guarda", quando: Q(0, "09h30"),
  entrar: S => { frente(S, "bercario"); M.conhecer("yuna"); M.conhecer("brandt"); S.f.sofia_vigiada = true; S.f.c3_sg = true; },
  texto: S => [
    (S.f.c3slot || 0) === 0
      ? "Os dois guardas da porta do Berçário dizem que a Dra. Okoye foi levada à sala de segurança há uma hora, para um depoimento voluntário. Você vai até lá."
      : "O Berçário está sem a sua chefe há dois ciclos. A enfermeira de plantão conta, em voz baixa, que a Guarda levou a doutora em observação e que ninguém sabe até quando. As incubadoras continuam acendendo e apagando, indiferentes.",
    "Na sala de segurança, Sofia está sentada numa cadeira de metal, de jaleco, com as mãos no colo. Não parece assustada. Parece cansada de um jeito que não se cura dormindo. Brandt está de pé junto ao mapa do Anel.",
    "— Ela é testemunha da última noite da Árbitra — diz ele. — Você quis que essa história fosse contada diante do Conselho. Estou garantindo que seja.",
    (S.f.c3slot || 0) >= 1 && "— E garantindo que ninguém a convença a mudar o que vai dizer — acrescenta, olhando para você.",
    "Sofia levanta os olhos. Não pede nada. Espera, como no primeiro dia, o que você vai fazer com ela."
  ],
  escolhas: [
    { t: "Ordenar a libertação imediata dela, como {cargo}.",
      efeito: S => { M.rel("brandt", -1); M.rel("yuna", 1); S.f.sofia_vigiada = false; if ((S.f.c3slot || 0) >= 1) G(S, 1); M.flag("c3_sgr", "ordem"); },
      diario: "Você ordenou que a Guarda libertasse Sofia Okoye. Brandt obedeceu sem dizer uma palavra.", vai: "c3_bercario" },
    { t: "Negociar: Sofia volta ao Berçário, e a Guarda mantém um posto na porta até o Conselho.",
      efeito: S => { M.flag("concessao_brandt"); M.rel("brandt", 1); M.rel("yuna", -1); M.flag("c3_sgr", "posto"); },
      diario: "Para tirar Sofia da sala de segurança, você concedeu à Guarda um posto na porta do Berçário até o Conselho.", vai: "c3_bercario" },
    { t: "Lembrar a Brandt que o artigo 9 começa assim: detendo quem incomoda, sem acusação.",
      se: S => S.f.plano_lido,
      efeito: S => { M.rel("yuna", 1); S.f.sofia_vigiada = false; G(S, -1); M.flag("c3_sgr", "artigo"); },
      diario: "Você lembrou a Brandt o que o artigo 9 do Plano Cinza permite. Ele libertou Sofia.", vai: "c3_bercario" }
  ]
},

c3_bercario: {
  cap: CAP, titulo: "O Berçário", arte: "bercario",
  quando: S => S.f.c3_sg ? Q(0, "11h40")(S) : Q(0, "10h00")(S),
  entrar: S => { frente(S, "bercario"); M.conhecer("yuna"); },
  texto: S => {
    const r = R(S, "yuna");
    const quente = S.f.confiou_yuna && r >= 1;
    return [
      S.f.c3_sgr === "ordem" && "Brandt abre a porta sem uma palavra. No corredor, Sofia caminha ao seu lado até o Berçário e só fala quando as portas de vidro se fecham atrás de vocês. — Obrigada. Ele não me fez mal. Só me fez esperar.",
      S.f.c3_sgr === "posto" && "Sofia volta ao Berçário com um guarda dois passos atrás. Na porta da sala de plantão, ele para e finge olhar o corredor. Ela fecha a porta com mais força do que precisava.",
      S.f.c3_sgr === "artigo" && "Brandt sustenta o seu olhar por um longo segundo. Depois faz um gesto curto para o guarda da porta. — Leve a doutora de volta. — Sofia sai antes que ele mude de ideia, e você vai atrás.",
      !S.f.c3_sg && "O Berçário de dia é outro lugar: enfermeiras, o choro dos recém-nascidos, mães em poltronas com os bebês no peito. Sofia recebe você na sala de plantão e fecha a porta. O choro fica do outro lado, abafado, como um mar.",
      "Você recita a fórmula da ata. Recebem o bronze o Árbitro, a Forja e o Berçário.",
      "Sofia abre a última gaveta da mesa e tira uma caixinha de madeira. Dentro, sobre um forro de algodão, está a placa do Berçário. — Recebi junto com o cargo, há onze anos. Disseram que era um símbolo. Helena me disse que não.",
      quente ? "— Ela me disse que um dia você viria buscar isto. — Sofia fecha a caixinha e a segura no colo. — E que, nesse dia, eu deveria contar o resto. É o dia, não é?"
        : (S.f.soube_quotas && r >= 0) ? "— Você já arrancou de mim o que eu tinha de pior — diz ela, sem rancor, mas também sem calor. — Imagino que agora queira o resto."
        : r <= -1 ? "— Não — diz ela, antes que você peça. — Não entrego isto a quem me trata como suspeita."
        : "— Por que eu deveria confiar isto a você? Mal nos conhecemos, e a última pessoa que confiou neste bronze morreu tomando o chá que eu servi.",
      "— Só a Forja sabe o caminho até a porta — acrescenta. — O Berçário recebeu a chave, nunca o mapa."
    ];
  },
  escolhas: S => [
    { t: "Pedir a chave em nome de Helena.",
      se: S => (S.f.confiou_yuna && R(S, "yuna") >= 1) || R(S, "yuna") >= 2, bloqueio: "Sofia ainda não confia em você o bastante.",
      efeito: S => { if (!S.f.soube_quotas) M.flag("c3_quotas_novas"); M.flag("chave_sofia"); M.flag("soube_quotas"); M.rel("yuna", 1); M.flag("c3_sm", "helena"); }, vai: "c3_bercario_r" },
    { t: "Contar a ela o que você já descobriu, para que saiba com quem está.",
      se: S => R(S, "yuna") >= 0, bloqueio: "Sofia não quer ouvir nada de você agora.",
      efeito: S => { if (!S.f.soube_quotas) M.flag("c3_quotas_novas"); M.flag("chave_sofia"); M.flag("soube_quotas"); M.rel("yuna", 1); M.flag("c3_sm", "troca"); }, vai: "c3_bercario_r" },
    { t: S.f.soube_quotas
        ? "Jurar que revelará as Quotas na Fala, diante de toda a nave."
        : "Jurar que, seja o que for que ela descobriu, a nave inteira saberá na Fala.",
      efeito: S => { if (!S.f.soube_quotas) M.flag("c3_quotas_novas"); M.flag("promessa_quotas"); M.flag("chave_sofia"); M.flag("soube_quotas"); M.rel("yuna", 1); M.flag("c3_sm", "promessa"); }, vai: "c3_bercario_r" },
    { t: "Exigir a chave como {cargo}: o bronze do Berçário pertence à nave.",
      se: S => R(S, "yuna") >= 0, bloqueio: "Sofia não aceita mais ordens suas.",
      efeito: S => { M.flag("chave_sofia"); M.rel("yuna", -1); M.flag("c3_sm", "ordem"); }, vai: "c3_bercario_r" },
    { t: "Mandar a Guarda requisitar a chave.",
      se: S => R(S, "yuna") <= -1 && (S.f.plano_autorizado || R(S, "brandt") >= 1),
      efeito: S => { M.flag("chave_sofia"); M.flag("concessao_brandt"); M.flag("sofia_vigiada"); M.rel("yuna", -2); M.rel("brandt", 1); G(S, 1); M.flag("c3_sm", "guarda"); }, vai: "c3_bercario_r" },
    { t: "Deixar a chave com ela, por ora.",
      efeito: S => { M.flag("c3_sm", "nada"); }, vai: "c3_bercario_r" }
  ]
},

c3_bercario_r: {
  cap: CAP, arte: "bercario", quando: Q(0, "13h00"),
  entrar: S => {
    const m = S.f.c3_sm;
    if (m === "helena" || m === "troca") M.diario("Sofia entregou a chave do Berçário.");
    if (m === "promessa") M.diario("Sofia entregou a chave do Berçário depois que você jurou revelar as Quotas na Fala.");
    if (m === "ordem") M.diario("Você exigiu a chave do Berçário como Árbitro. Sofia a entregou sem dizer mais nada.");
    if (m === "guarda") M.diario("A Guarda requisitou a chave do Berçário por ordem sua. Sofia ficou sob vigilância.");
    if (m === "nada") M.diario("Você deixou a chave do Berçário com Sofia.");
    if (S.f.c3_quotas_novas) M.diario("Sofia contou o que descobriu: os registros do banco genético foram ajustados e parte da nave ficou infértil sem saber, para poupar. Helena sabia.");
  },
  texto: S => {
    const m = S.f.c3_sm;
    return [
      m === "troca" && "Você conta o que pode: a fórmula do bronze, a porta onde a Aia não vê" + (S.f.sabe_aurea_morta ? ", o diário de um Árbitro morto que guardou uma coisa terrível por mais de trinta anos" : "") + ". Sofia ouve como ouve um paciente: sem interromper, atenta ao que não é dito.",
      m === "promessa" && "Você jura. A palavra sai mais pesada do que você esperava, e fica no ar da sala de plantão como uma assinatura. Sofia não sorri. Assente uma vez, devagar, como quem anota um compromisso num prontuário.",
      S.f.c3_quotas_novas && "— Então vou contar — diz ela. — Há gente nesta nave que tentou ter filhos durante anos, e eu disse a cada uma que era o acaso. Não era. Os registros de fertilidade foram ajustados, e alguma coisa decidiu quem não teria filhos. Para poupar. Só uma coisa na nave mexe em registros sem deixar rastro. — Ela não diz o nome. — Contei a Helena há dois anos. Ela chorou e me pediu que esperasse.",
      (m === "helena" || m === "troca" || m === "promessa") && !S.f.c3_quotas_novas && "— Você já sabe o que eu descobri — diz ela. — Então sabe por que esta chave pesa tanto.",
      (m === "helena" || m === "troca" || m === "promessa") && "Ela tira a placa da caixinha e a coloca na sua mão, fechando os seus dedos sobre ela com os dela. — Helena queria que a nave soubesse. Não me faça ser a pessoa que impediu.",
      m === "ordem" && "Sofia olha para você por um momento longo. Depois empurra a caixinha pela mesa, aberta. — Pertence à nave — repete, sem ironia. — Como eu. — Não diz mais nada, e você entende que acaba de receber uma chave e perder uma conversa.",
      m === "guarda" && "Meia hora depois, dois guardas entram na sala de plantão com uma requisição assinada com o seu nome. Sofia entrega a caixinha sem resistir e sem olhar para você. Um dos guardas fica na porta quando os outros saem.",
      m === "nada" && "Sofia guarda a caixinha de volta na gaveta, mas não a tranca. — Obrigada — diz. — Por não tirar de mim a única coisa que ainda é minha de decidir. — Você sai com as mãos vazias e a sensação estranha de ter deixado alguma coisa no lugar certo."
    ];
  },
  escolhas: SEGUIR
},

/* ============ MARTA KLEIN (Hortos) ============ */

c3_hortos: {
  cap: CAP, titulo: "Os silos", arte: "hortos", quando: Q(0, "16h00"),
  entrar: S => { frente(S, "hortos"); M.conhecer("ilsa"); },
  texto: S => [
    "Marta encontra você na porta dos silos do Setor 3, onde se guarda o grão de toda a nave. Há quatro guardas ali, de pé, de costas para o trigo.",
    S.f.corte_adiado
      ? "As lâmpadas dos canteiros ainda brilham com a força de antes. O corte que você adiou paira sobre elas como uma nuvem que ainda não choveu."
      : (S.f.c3slot || 0) >= 1 ? "As lâmpadas do Setor 3 estão mais fracas desde o último corte. O trigo cresce mais devagar, mais claro, e todo mundo aqui sabe ler essa cor."
        : "As equipes trabalham depressa, como quem colhe antes de uma tempestade. O corte anunciado ainda não veio, mas já está nas costas de todos.",
    "— Quatro guardas na porta dos silos desde anteontem — diz Marta, sem cumprimentar. — Ninguém me avisou. Perguntei ao cabo. Disse que é reforço preventivo. Preventivo de quê, eu perguntei. Ele não sabia. Os guardas nunca sabem. Quem sabe é o Comandante.",
    S.f.prometeu_racoes && ("— E faltam " + faltam(S) + " ciclos para os seus dez — acrescenta, sem levantar a voz. — Eu conto os dias, {cargo}. As equipes também."),
    S.f.marta_avisada && "— Você me escreveu que os cortes são deliberados. Eu li aquilo vinte vezes. Deliberado por quem?",
    (S.f.soube_contencao || S.f.conten_confirmada) && "Você se lembra do que ouviu: os cortes são deliberados e servem a uma finalidade que a Fundação protegeu. Prometer rações agora seria prometer contra a própria nave.",
    "Ela abre a caderneta e mostra uma página nova, com uma coluna só: os horários das patrulhas que passam pelos Hortos. — Eu anoto tudo. É mania. Agora anoto isto."
  ],
  escolhas: S => [
    { t: "Pedir que os Hortos observem a Guarda em silêncio e avisem qualquer movimento.",
      efeito: S => { M.flag("marta_vigia"); M.rel("ilsa", 1); G(S, -1); M.flag("c3_hm", "vigia"); }, vai: "c3_hortos_r" },
    { t: "Contar o que descobriu: os cortes servem a uma decisão antiga, escondida da nave.",
      se: S => !!(S.f.soube_contencao || S.f.conten_confirmada || S.f.sabe_aurea_morta), bloqueio: "Você ainda não sabe o bastante sobre os cortes.",
      efeito: S => { M.flag("marta_sabe"); M.rel("ilsa", 2); M.flag("c3_hm", "conta"); }, vai: "c3_hortos_r" },
    { t: "Prometer que as rações voltam ao normal em dez ciclos.",
      se: S => !S.f.prometeu_racoes && !S.f.promessa_retirada,
      efeito: S => { M.flag("prometeu_racoes"); M.rel("ilsa", 2); M.coesao(1); M.flag("c3_hm", "promete"); }, vai: "c3_hortos_r" },
    { t: "Admitir que talvez não possa cumprir a promessa dos dez ciclos.",
      se: S => S.f.prometeu_racoes,
      efeito: S => { S.f.prometeu_racoes = false; M.flag("promessa_retirada"); M.rel("ilsa", -1); M.flag("c3_hm", "admite"); }, vai: "c3_hortos_r" }
  ]
},

c3_hortos_r: {
  cap: CAP, arte: "hortos", quando: Q(0, "16h40"),
  entrar: S => {
    const m = S.f.c3_hm;
    if (m === "vigia") M.diario("Marta vai anotar os movimentos da Guarda nos Hortos e avisar você.");
    if (m === "conta") M.diario("Você contou a Marta que os cortes servem a uma decisão antiga, escondida da nave.");
    if (m === "promete") M.diario("Você prometeu a Marta que as rações voltariam ao normal em dez ciclos.");
    if (m === "admite") M.diario("Você admitiu a Marta que talvez não possa cumprir a promessa das rações.");
  },
  texto: S => {
    const m = S.f.c3_hm;
    return [
      m === "vigia" && "Marta fecha a caderneta e a guarda no bolso do avental. — Quarenta equipes, três turnos. Ninguém repara em quem colhe. — Pela primeira vez, quase sorri. — A Guarda vigia os silos. Os Hortos vão vigiar a Guarda.",
      m === "conta" && "Marta escuta com as mãos paradas, coisa rara nela. Quando você termina, ela olha o trigo claro por um longo tempo. — Dezesseis anos inventando desculpas — diz. — E a desculpa verdadeira era pior do que todas as que eu inventei. — Ela aperta o seu braço. — Agora eu sei de que lado estou.",
      m === "promete" && "— Dez ciclos — repete Marta, e os olhos dela se enchem de uma esperança cansada. — Eu conto às equipes hoje. — Ela não percebe o que você percebe: que acaba de prometer o que a nave inteira parece decidida a negar.",
      m === "admite" && "Marta fica calada tanto tempo que um dos guardas olha para vocês. — Eu já sabia — diz, enfim. — Ninguém promete dez ciclos sabendo o que você está descobrindo. — A voz dela é dura, mas não é de inimiga. — Obrigada por me dizer antes que as equipes descobrissem sozinhas. Não sei se vou perdoar. Mas vou lembrar."
    ];
  },
  escolhas: SEGUIR
},

/* ============ TOMÁS BRANDT ============ */

c3_brandt: {
  cap: CAP, titulo: "O Comandante", arte: "guarda", quando: S => D(S, 6, "22h30"),
  entrar: S => { S.f.c3_brandt_feito = true; M.conhecer("brandt"); },
  texto: S => {
    const lugares = [];
    if (S.f.c3f_forja) lugares.push("na Forja");
    if (S.f.c3f_vigilia) lugares.push("na Vigília");
    if (S.f.c3f_bercario) lugares.push("no Berçário");
    if (S.f.c3f_hortos) lugares.push("nos Hortos");
    return [
      "Brandt não manda chamar você. Espera à porta do seu aposento, de uniforme, às dez e meia da noite, como quem aguarda um superior. Ou um réu.",
      "— Dois minutos, {cargo}. Lá dentro, se preferir.",
      "Ele não se senta. — A Guarda vê o que a Aia vê, e um pouco mais. Sei que você esteve " + lugares.join(" e ") + ". Não pergunto o que foi fazer. Pergunto se devo me preocupar.",
      S.f.insinuou_verdade && "— E sei o que você disse no púlpito da Vigília. Quarenta pessoas foram à sala de segurança no dia seguinte, perguntando se havia alguma coisa que a Guarda sabia e elas não.",
      S.f.diario_requisitado && "— A Vigília ainda não me perdoou por aquela madrugada. A você, menos ainda.",
      S.f.teo_denunciado && "— O técnico que você me mandou continua dizendo que o rumo está desviado. Verifiquei com a Aia. Ela disse que o rumo segue o plano vigente. Plano vigente, {cargo}. Não sou cientista, mas sei ler um adjetivo.",
      S.f.plano_autorizado
        ? "— A Guarda está posicionada, como você autorizou: Ponte, Forja, Hortos, Berçário. Um sinal meu e, em quarenta minutos, a nave está em ordem. No Conselho, vou pedir a ativação preventiva do Plano Cinza. Seria melhor que fosse a seu pedido."
        : "— No Conselho vou propor uma moção de cautela. Nada contra você: contra o que você pode fazer sozinh{o}. Uma nave não sobrevive a um Árbitro que decide em segredo.",
      S.f.plano_lido && "Ele faz uma pausa. — Você leu o artigo nove. Vi no seu rosto, naquele dia. Quero que saiba que nunca precisei dele. — Outra pausa. — E quero que saiba que ele existe.",
      S.f.sofia_testemunha && !S.f.c3f_bercario && "— A Dra. Okoye continua em observação. Para a segurança dela.",
      brandtTem(S) && "Ele não menciona o envelope de Helena. Você o menciona por ele, em pensamento: a sua placa está na mesa dele, três conveses abaixo."
    ];
  },
  escolhas: [
    { t: "Dividir com ele parte do que sabe, para que não aja às cegas.",
      efeito: S => { M.rel("brandt", 1); G(S, -1); M.flag("brandt_parcial"); M.flag("c3_bm", "parcial"); }, vai: "c3_brandt_r" },
    { t: "Exigir que a Guarda recolha as patrulhas extras.",
      efeito: S => {
        if (R(S, "brandt") >= 2) M.flag("c3_bm", "recolhe");
        else { M.rel("brandt", -1); G(S, 1); M.flag("c3_bm", "nega"); }
      }, vai: "c3_brandt_r" },
    { t: "Propor um pacto: ele não move um guarda sem falar com você, e você o avisa antes da Fala.",
      se: S => R(S, "brandt") >= 0, bloqueio: "Brandt não confia em você o bastante para um pacto.",
      efeito: S => { M.flag("pacto_brandt"); G(S, -1); M.flag("c3_bm", "pacto"); }, vai: "c3_brandt_r" },
    { t: "Revogar a autorização que você deu ao Plano Cinza.",
      se: S => S.f.plano_autorizado && !S.f.plano_revogado,
      efeito: S => { M.rel("brandt", -2); M.flag("plano_revogado"); M.coesao(1); M.flag("c3_bm", "revoga"); }, vai: "c3_brandt_r" }
  ]
},

c3_brandt_r: {
  cap: CAP, arte: "guarda", quando: S => D(S, 6, "22h45"),
  entrar: S => {
    const m = S.f.c3_bm;
    if (m === "parcial") M.diario("Você contou a Brandt que há uma decisão antiga da Fundação escondida da nave, e que a trará à luz no Marco, em ordem.");
    if (m === "recolhe") M.diario("A seu pedido, Brandt recolheu as patrulhas extras.");
    if (m === "nega") M.diario("Brandt recusou-se a recolher as patrulhas extras.");
    if (m === "pacto") M.diario("Pacto com Brandt: nenhum guarda se move sem que você saiba, e ele será o primeiro a saber da Fala.");
    if (m === "revoga") M.diario("Você revogou a autorização do Plano Cinza.");
  },
  texto: S => {
    const m = S.f.c3_bm;
    return [
      m === "parcial" && "Você conta o que pode: que existe uma decisão antiga, da Fundação ou de quem veio depois, escondida da nave, e que você vai trazê-la à luz no Marco, em ordem, diante de todos. Não diz qual. Brandt ouve sem interromper. — Em ordem — repete. — É tudo o que peço. — Pela primeira vez desde que entrou, ele se senta.",
      m === "recolhe" && "Brandt fica calado um instante. — Amanhã as patrulhas voltam à escala normal. — E cumpre. Você não sabe se por lealdade ou por cálculo, e talvez para ele não haja diferença.",
      m === "nega" && "— Não — diz Brandt, simplesmente. — Recolher a Guarda agora seria deixar a nave nua. Se quiser me tirar o comando, há um Conselho daqui a três ciclos. — Ele vai até a porta. Não pede licença para sair.",
      m === "pacto" && "Brandt pensa, depois estende a mão. É uma mão seca e firme, de quem não aperta muitas. — Nenhum guarda se move sem que você saiba. E eu sou o primeiro a saber da Fala. — Vocês apertam as mãos. Você não sabe quem acaba de amarrar quem.",
      m === "revoga" && "— Revogo a autorização que dei a você. O Plano Cinza volta para a gaveta. — Brandt fica imóvel tanto tempo que você pensa que ele não ouviu. — Como quiser, {cargo}. — Ele bate os calcanhares, coisa que nunca fez diante de você. É o gesto mais frio que você já viu.",
      brandtTem(S) && "Na porta, ele se detém. — O envelope de Helena continua comigo. Imagino que você também queira falar disso."
    ];
  },
  escolhas: S => brandtTem(S)
    ? [
        { t: "Pedir de volta a placa de Helena.",
          se: S => R(S, "brandt") >= 1, bloqueio: "Brandt ainda não confia em você o bastante para devolvê-la.",
          efeito: S => { recupera(S, "pedido"); }, vai: "c3_brandt_placa" },
        { t: "Oferecer uma troca: a placa, por um assento da Guarda nas decisões de segurança até o Marco.",
          efeito: S => { recupera(S, "troca"); M.flag("concessao_brandt"); M.coesao(-1); }, vai: "c3_brandt_placa" },
        { t: "Não falar da placa. Ainda não.", vai: PROX, destinos: PROXD }
      ]
    : SEGUIR
},

c3_brandt_placa: {
  cap: CAP, arte: "guarda", quando: S => D(S, 6, "22h55"),
  entrar: S => {
    if (S.f.placa_modo === "pedido") M.diario("Brandt devolveu a placa de bronze de Helena quando você pediu.");
    if (S.f.placa_modo === "troca") M.diario("Brandt devolveu a placa de Helena em troca de um assento da Guarda nas decisões de segurança até o Marco.");
  },
  texto: S => S.f.placa_modo === "pedido"
    ? [ "Brandt tira o envelope do bolso interno do uniforme. Ele o trazia consigo. — Achei que você pediria hoje — diz. — Se não pedisse, eu também não ofereceria. — A placa está lá dentro, intacta, com os três dentes voltados para você." ]
    : [ "— Feito — diz Brandt, e entrega o envelope. — A Guarda terá voz em cada decisão de segurança até o Marco. — Você guarda a placa no bolso. Pesa o mesmo de antes. O preço é que pesa diferente." ],
  escolhas: SEGUIR
},

/* ============ A VÉSPERA ============ */

c3_vespera: {
  cap: CAP, titulo: "A véspera", arte: "noite", quando: S => D(S, 8, "23h10"),
  entrar: S => {
    if (!S.f.soube_cofre_local && teoAjuda(S)) {
      S.f.soube_cofre_local = true; S.f.c3_teo_mapa = true;
      M.diario("Teo encontrou nos mapas de sensores um trecho do Anel Zero, à ré, onde a Aia nunca teve sensores. 'Num lugar onde ela vê tudo, isso é uma porta.'");
    }
  },
  texto: S => {
    const chaves = [S.f.placa && "a sua", S.f.chave_daniel && "a da Forja", S.f.chave_sofia && "a do Berçário"].filter(Boolean);
    const g = S.f.c3g || 0;
    return [
      "Véspera do Conselho. O aposento de Helena, que você ainda não consegue chamar de seu, está coberto de papéis: a ata do bronze, as anotações da semana" + (S.f.diario_halden ? ", e o caderno de Hugo Halden escondido sob o colchão" : "") + ".",
      chaves.length
        ? "Sobre a mesa, " + (chaves.length === 1 ? "uma placa de bronze: " : chaves.length + " placas de bronze: ") + chaves.join(", ") + "."
        : "Sobre a mesa, nenhuma placa de bronze. Só a fórmula copiada, e o espaço vazio onde as chaves deveriam estar.",
      S.f.marta_vigia && "Um bilhete de Marta chegou ao anoitecer, escrito na letra apertada da caderneta: horários de patrulha, nomes de cabos, uma coluna nova com a palavra _armas_.",
      g >= 3 ? "Da janela do corredor você vê a Guarda trocar o turno da Ponte. São oito, não dois. Ninguém explicou por quê."
        : g >= 1 ? "Duas patrulhas passaram pela sua porta desde o anoitecer. Nenhuma bateu."
        : "O corredor está em silêncio. A Guarda voltou às escalas de sempre, ou aprendeu a passar sem ser vista.",
      S.f.c3_teo_mapa && "Teo bate à porta perto da meia-noite, com um mapa de sensores enrolado debaixo do braço. — Olhe — diz, e aponta um trecho do Anel Zero, à ré. — Aqui a Aia não tem sensores. Não estão quebrados: nunca existiram. Num lugar onde ela vê tudo, isso é uma porta.",
      "Há tempo para uma coisa antes de dormir."
    ];
  },
  escolhas: [
    { t: "Pedir a Teo que traga o bronze da Forja esta noite, enquanto Daniel dorme.",
      se: S => !S.f.chave_daniel && teoAjuda(S),
      efeito: S => { M.flag("chave_daniel"); M.flag("chave_daniel_roubada"); M.flag("c3_ve", "daniel"); },
      diario: "Teo tirou a chave da Forja do lugar onde Daniel a guarda à noite, a seu pedido.", vai: "c3_conselho" },
    { t: "Pedir a Teo que tire a placa de Helena do depósito de provas da Guarda.",
      se: S => !S.f.placa && teoAjuda(S),
      efeito: S => { recupera(S, "teo"); M.flag("placa_roubada"); G(S, 1); M.flag("c3_ve", "placa"); },
      diario: "Teo recuperou a placa de Helena do depósito de provas da Guarda, a seu pedido.", vai: "c3_conselho" },
    { t: "Passar a noite escrevendo o que dirá ao Conselho.",
      efeito: S => { M.flag("c3_preparou"); M.flag("c3_ve", "prepara"); }, vai: "c3_conselho" },
    { t: "Procurar Marta antes de dormir.",
      se: S => !S.f.c3f_hortos,
      efeito: S => { M.rel("ilsa", 1); M.flag("c3_marta_noite"); M.flag("c3_ve", "marta"); },
      diario: "Na véspera do Conselho, você conversou com Marta até tarde entre os canteiros.", vai: "c3_conselho" },
    { t: "Descer à Vigília e ficar um pouco entre as velas, em silêncio.",
      efeito: S => { M.rel("maren", 1); M.flag("c3_ve", "vela"); },
      diario: "Na véspera do Conselho, você ficou em silêncio entre as velas da Vigília. Beatriz viu.", vai: "c3_conselho" }
  ]
},

/* ============ O CONSELHO EXTRAORDINÁRIO ============ */

c3_conselho: {
  cap: CAP, titulo: "O Conselho extraordinário", arte: "conselho", quando: S => D(S, 9, "09h00"),
  entrar: S => {
    ["ilsa", "davo", "yuna", "maren", "brandt"].forEach(M.conhecer);
    if (S.f.placa_roubada) M.rel("brandt", -1);
    if (S.f.chave_daniel_roubada) M.rel("davo", -2);
    if (S.f.diario_roubado && !S.f.c3_bilhete) M.rel("maren", -2);
    if (S.f.prometeu_racoes && !S.f.corte_adiado && !S.f.c3_marta_noite && S.f.c3_hm !== "promete") M.rel("ilsa", -1);
  },
  texto: S => {
    const v = S.f.c3_ve;
    const sv = S.f.sofia_testemunha && S.f.sofia_vigiada && !S.f.c3_sgr;
    return [
      v === "daniel" && "Teo trouxe o bronze da Forja pouco antes do amanhecer, enrolado num pano sujo de graxa, e não quis olhar para você ao entregá-lo.",
      v === "placa" && "Teo trouxe a placa de Helena pouco antes do amanhecer. — Ninguém viu — disse. Você não teve coragem de perguntar se acreditava nisso.",
      v === "prepara" && "Você dormiu duas horas. As anotações da noite estão no seu bolso, dobradas em quatro.",
      v === "marta" && "Na noite anterior, você e Marta conversaram até tarde entre os canteiros. Ela não disse que confia em você. Disse que vai ouvir.",
      v === "vela" && "Você ainda tem cheiro de cera nas mãos. À meia-noite, na Vigília, Beatriz viu você sentad{o} entre as velas e não disse nada. Só pôs mais uma, ao lado da de Helena.",
      "O Salão do Conselho tem o mesmo eco de oito ciclos atrás. A cadeira que era de Helena agora é sua, e o pano cinza foi retirado. Ninguém o dobrou: alguém o deixou no chão, num canto.",
      "Há gente de pé encostada às paredes: chefes de turno, dois irmãos da Vigília, guardas. Uma sessão extraordinária é aberta a quem quiser ouvir, e desta vez muitos quiseram.",
      "Brandt fala primeiro, de pé. Fala de rumores, de patrulhas, de quarenta e um mil pessoas que dormem mal. " + (S.f.plano_autorizado && !S.f.plano_revogado
        ? "Termina pedindo ao Conselho a ativação preventiva do Plano Cinza: a Guarda nas estações essenciais até o Marco, para que nada aconteça."
        : "Termina propondo uma moção de cautela: nenhuma decisão d{o} {cargo} sobre as áreas da Fundação sem o voto deste Conselho, e uma escolta da Guarda para {o} {cargo} até o Marco."),
      S.f.teo_denunciado && "— Um técnico da Forja afirma que o rumo da nave está desviado — acrescenta. — Se for verdade, e se alguém nesta sala sabe e se cala, a nave tem direito de saber.",
      S.f.insinuou_verdade && "— {O} {cargo} disse no púlpito da Vigília que a nave deveria fazer perguntas. Concordo. A primeira é: quais?",
      S.f.placa_roubada && "— E houve um furto no depósito de provas da Guarda esta noite — diz, por fim, sem olhar para você. — Um envelope. A Guarda vai descobrir quem foi. — Ele já sabe.",
      S.f.chave_daniel_roubada ? "Daniel não olha para você. Quando enfim olha, é como quem olha uma ferramenta que quebrou na mão. — Alguém abriu a minha caixa ontem à noite — diz, para a sala inteira, sem dizer o seu nome. Não precisa."
        : S.f.promessa_desligar ? "Daniel olha para você e assente uma vez, quase imperceptível: um homem que recebeu uma promessa e está contando os dias."
        : S.f.daniel_acordo ? "Daniel cruza os braços e espera. Você prometeu que ele estaria à mesa quando a decisão viesse. Ele veio cobrar o lugar."
        : S.f.daniel_recusou ? "Daniel ouve Brandt com o queixo erguido. Você não sabe de que lado ele está. Talvez ele também não."
        : "Daniel Kessler ouve tudo com as mãos enfiadas nos bolsos do macacão, como quem espera um forno chegar à temperatura.",
      S.f.promessa_retirada ? "Marta não diz nada sobre rações. Vocês já tiveram essa conversa, e ela doeu nos dois."
        : (S.f.prometeu_racoes && S.f.c3_hm === "promete") ? "— Você me prometeu dez ciclos nos Hortos, há poucos dias — diz Marta, diante de todos. — As equipes já sabem. Não me faça mentir para elas, {cargo}."
        : (S.f.prometeu_racoes && S.f.corte_adiado) ? "— Você adiou o corte — diz Marta. — Obrigada. Mas adiar não é cancelar, e faltam três ciclos para os seus dez."
        : (S.f.prometeu_racoes && S.f.c3_marta_noite) ? "Marta não fala de rações. Na noite anterior, entre os canteiros, ela já perguntou o que tinha para perguntar, e você já respondeu como pôde."
        : S.f.prometeu_racoes ? "— Os Hortos perderam mais quatro por cento de energia há quatro ciclos — diz Marta, e todos ouvem. — Você me prometeu dez ciclos, {cargo}. Faltam três. Diga a esta sala que a promessa continua de pé."
        : S.f.marta_sabe ? "Marta encontra os seus olhos e não diz nada. Ela sabe parte do que você sabe, e o silêncio dela é uma forma de lealdade."
        : "— Eu só quero saber por que o meu trigo não enche — diz Marta. — Faz dezesseis anos que pergunto.",
      S.f.insinuou_verdade && "— As equipes dos Hortos ouviram o que você disse na Vigília — acrescenta Marta. — Querem ouvir o resto.",
      (S.f.diario_roubado && !S.f.c3_bilhete) ? "A Irmã Beatriz se levanta antes da hora. — Alguém entrou no arquivo da Vigília numa destas noites e levou o que um homem morto me confiou. — Ela olha para você. Não acusa. Não precisa."
        : S.f.c3_bilhete ? "Beatriz tem nas mãos um papel dobrado: o seu bilhete. Não o mostra a ninguém. Também não o solta."
        : S.f.diario_requisitado ? "Beatriz não olha para você. Olha para os guardas encostados à parede do fundo, os mesmos que entraram na Vigília de madrugada com uma ordem assinada com o seu nome."
        : S.f.beatriz_sabe_algo ? "Beatriz fala de fé, como sempre, mas a voz dela tropeça em palavras que sabe de cor. Você contou a ela uma verdade, e ela a carrega como quem carrega uma brasa na mão fechada."
        : S.f.insinuou_verdade ? "— Peço a este Conselho que não deixe a dúvida virar doutrina — diz Beatriz, olhando para você. — Já vi o que ela faz numa congregação. Vi esta semana."
        : "— O Destino nos trouxe até aqui — diz Beatriz. — Peço ao Conselho fé, e a quem governa, paciência.",
      sv ? "Sofia entra escoltada por um guarda, que fica de pé atrás da cadeira dela durante toda a sessão. Ela não diz uma palavra."
        : (R(S, "yuna") >= 1 && S.f.chave_sofia) ? "Sofia pede a palavra pela primeira vez em anos. — Eu confio n{o} {cargo}. — É só isso. Mas na boca dela pesa como um voto."
        : "Sofia olha as próprias mãos, como no primeiro Conselho.",
      "Brandt continua de pé. — A proposta está posta, {cargo}. O Conselho ouve você."
    ];
  },
  escolhas: [
    { t: "Recitar o artigo 9 do Plano Cinza diante de todos.",
      se: S => S.f.plano_lido,
      efeito: S => { M.rel("brandt", -2); M.rel("davo", 1); G(S, -1); M.flag("c3_mocao", "art9"); }, vai: "c3_conselho2" },
    { t: "Aliar-se a Daniel e Marta: propor que nenhuma ação da Guarda fora da rotina aconteça sem o voto do Conselho.",
      se: S => R(S, "davo") >= 1 || R(S, "ilsa") >= 1, bloqueio: "Nem Daniel nem Marta estão do seu lado o bastante para isso.",
      efeito: S => { M.rel("brandt", -1); M.rel("davo", 1); M.rel("ilsa", 1); G(S, -1); M.flag("c3_mocao", "alianca"); }, vai: "c3_conselho2" },
    { t: "Aceitar a proposta em parte, para acalmar a Guarda.",
      efeito: S => { M.flag("concessao_brandt"); M.rel("brandt", 1); M.rel("davo", -1); M.coesao(1); M.flag("c3_mocao", "aceita"); }, vai: "c3_conselho2" },
    { t: "Recusar a proposta sem explicações: o Árbitro não presta contas à Guarda.",
      efeito: S => { M.rel("brandt", -1); M.coesao(-1); G(S, 1); M.flag("c3_mocao", "recusa"); }, vai: "c3_conselho2" }
  ]
},

c3_conselho2: {
  cap: CAP, titulo: "A pergunta da sala", arte: "conselho", quando: S => D(S, 9, "10h20"),
  entrar: S => {
    const m = S.f.c3_mocao;
    if (m === "art9") M.diario("No Conselho, você recitou o artigo 9 do Plano Cinza. A proposta de Brandt morreu sem voto.");
    if (m === "alianca") M.diario("No Conselho, você se aliou a Daniel e Marta: nenhuma ação da Guarda fora da rotina sem o voto do Conselho.");
    if (m === "aceita") M.diario("No Conselho, você aceitou em parte a proposta de Brandt: a Guarda terá assento nas decisões de segurança até o Marco.");
    if (m === "recusa") M.diario("No Conselho, você recusou a proposta de Brandt sem explicações.");
  },
  texto: S => {
    const m = S.f.c3_mocao, a = aliados(S) + (S.f.c3_preparou ? 1 : 0);
    return [
      m === "art9" && "Você recita de memória o artigo nove, frase por frase: a Guarda assume também a função de Arbítrio se {o} {cargo} for julgad{o} incapaz de preservar a ordem. Quando você termina, ninguém olha para você. Todos olham para Brandt. — É padrão — diz ele, como da outra vez. Mas desta vez a palavra soa diferente. Daniel ri, um riso curto e sem alegria. A proposta morre ali, sem voto.",
      m === "alianca" && "Você se volta para Daniel e Marta e propõe o contrário: que nenhuma ação da Guarda fora da rotina aconteça sem o voto deste Conselho. Daniel bate na mesa uma vez, aprovando. Marta levanta a mão antes que você termine. A proposta passa. Brandt vota contra e registra o voto com a mesma voz com que registraria uma avaria.",
      m === "aceita" && "Você aceita em parte: a Guarda terá assento em toda decisão de segurança até o Marco, mas sem escolta e sem estações ocupadas. Brandt inclina a cabeça, satisfeito. Daniel solta o ar pelo nariz, como um forno que descarrega. — Mais tutela — murmura. — Agora de farda.",
      m === "recusa" && "— O Árbitro não presta contas à Guarda — você diz. A frase é verdadeira, e é um erro. Você sente isso enquanto ainda a diz. Brandt não responde. Anota alguma coisa. Na parede do fundo, dois guardas trocam um olhar.",
      "É Marta quem diz o que a sala inteira está pensando. — Muito bem. Agora diga a este Conselho o que está acontecendo com a nossa nave.",
      "— E diga sem a voz da Aia — completa Daniel.",
      S.f.sabe_aurea_morta
        ? "Você sente o peso do que sabe, e do que não pode dizer aqui: o caderno de Hugo, o planeta sem ar, as velas da Vigília. Dizer agora, diante de uma parede de guardas e de gente que vai repetir cada palavra nos corredores antes do almoço, seria entregar a verdade ao primeiro que quisesse usá-la."
        : "Você sente o peso do que sabe e, mais ainda, do que ainda não sabe. Qualquer coisa dita aqui estará nos corredores antes do almoço.",
      "Você conta, de relance, quem nesta sala ainda confia em você. " + (a >= 3 ? "São mais do que você esperava." : a === 2 ? "Duas pessoas, talvez. Talvez baste." : a === 1 ? "Uma pessoa, talvez." : "Ninguém, talvez."),
      S.f.c3_preparou && "As anotações da noite estão no seu bolso. Você não precisa delas: sabe o que quer dizer."
    ];
  },
  escolhas: [
    { t: "Contar uma verdade parcial: há uma decisão antiga, escondida da nave, e você vai trazê-la à luz no Marco.",
      efeito: S => {
        M.coesao(S.f.c3_preparou ? 0 : -1); M.rel("ilsa", 1); M.rel("davo", 1);
        if (R(S, "brandt") <= 0 && !S.f.brandt_parcial) G(S, 1);
        if (S.f.beatriz_sabe_algo) M.rel("maren", -1);
        M.flag("c3_fala", "parcial");
      }, vai: "c3_conselho_r" },
    { t: "Assegurar que a nave está estável, e que você responde por ela.",
      efeito: S => {
        M.coesao(1); G(S, -1); M.rel("davo", -1);
        if (S.f.prometeu_racoes) M.rel("ilsa", -2); else if (S.f.marta_sabe || S.f.registros_marta) M.rel("ilsa", -1);
        M.flag("c3_fala", "controle");
      }, vai: "c3_conselho_r" },
    { t: "Pedir sete ciclos de confiança: em sete ciclos, você volta a este Conselho com tudo o que encontrou.",
      efeito: S => {
        if (aliados(S) + (S.f.c3_preparou ? 1 : 0) >= 2) { M.coesao(1); G(S, -1); M.flag("c3_fala", "sete_ok"); }
        else { M.coesao(-1); G(S, 1); M.flag("c3_fala", "sete_falha"); }
      }, vai: "c3_conselho_r" }
  ]
},

c3_conselho_r: {
  cap: CAP, arte: "conselho", quando: S => D(S, 9, "11h50"),
  entrar: S => {
    const f = S.f.c3_fala;
    if (f === "parcial") M.diario("Você disse ao Conselho que há uma decisão antiga escondida da nave, e que a trará à luz no Marco.");
    if (f === "controle") M.diario("Você assegurou ao Conselho que a nave está estável e que você responde por ela.");
    if (f === "sete_ok") M.diario("O Conselho concedeu a você sete ciclos de confiança.");
    if (f === "sete_falha") M.diario("Você pediu sete ciclos de confiança ao Conselho. Sem aliados à mesa, o pedido soou como adiamento.");
    if (S.f.c3_mocao === "alianca" && !S.f.chave_daniel) {
      S.f.chave_daniel = true; S.f.daniel_acordo = true; S.f.c3_daniel_tarde = true;
      M.diario("Depois do Conselho, Daniel entregou a chave da Forja: 'Você ficou do lado da mesa. Eu fico do seu.'");
    }
    const presa = S.f.sofia_testemunha && S.f.sofia_vigiada && !S.f.c3_sgr;
    if (!S.f.chave_sofia && R(S, "yuna") >= 1 && !presa) {
      S.f.chave_sofia = true; S.f.c3_sofia_tarde = true;
      M.diario("Depois do Conselho, Sofia entregou a chave do Berçário.");
    }
  },
  texto: S => {
    const f = S.f.c3_fala;
    return [
      f === "parcial" && "Um murmúrio corre pelas paredes. Marta assente devagar, como quem recebe enfim uma semente que pode plantar. Daniel bate os nós dos dedos na mesa. Beatriz empalidece. — Uma decisão antiga — repete Brandt. — De quem? — No Marco — você responde. — Diante de todos. — Ele anota. Não discute.",
      f === "controle" && "A sala se acalma. As pessoas encostadas às paredes respiram, e alguém no fundo chega a sorrir. Mas Daniel olha para você com um desprezo cansado, o de quem ouviu a mesma frase da boca da Aia a vida inteira." + (S.f.prometeu_racoes ? " E Marta, ao lado dele, fecha a caderneta devagar, como quem fecha uma porta." : ""),
      f === "sete_ok" && "— Sete ciclos — repete Brandt. — Está registrado. — A sala aceita, porque quem confia em você puxa quem hesita. Marta é a primeira a levantar a mão. Sofia, a segunda.",
      f === "sete_falha" && "— Sete ciclos — repete Brandt, e alguém ri no fundo da sala. Sem aliados à mesa, o pedido soa como o que é: um adiamento. O Conselho não vota. Apenas termina, e isso é pior.",
      S.f.c3_daniel_tarde && "Na saída, Daniel alcança você no corredor. Tira a corrente do pescoço e põe a placa da Forja na sua mão, sem cerimônia. — Você ficou do lado da mesa — diz. — Eu fico do seu. Mas a mesa continua valendo, {cargo}. Lá embaixo também.",
      S.f.c3_sofia_tarde && (S.f.c3f_bercario
        ? "Sofia espera você junto à porta, com a caixinha de madeira nas mãos. — Pensei melhor — diz. — Helena não queria que eu decidisse sozinha. Queria que eu decidisse com você."
        : "Sofia espera você junto à porta, com a caixinha de madeira nas mãos. — Eu ia esperar você no Berçário — diz. — Você não veio. Então eu vim."),
      brandtTem(S) && "Quando a sala se esvazia, Brandt fica para trás. Tira do bolso do uniforme um saco de provas. Dentro, o envelope de Helena. — O inquérito terminou — diz. — A morte foi natural. Imagino que você queira isto de volta. Mas a Guarda não devolve nada de graça, em tempos como estes. Uma escolta da Guarda para {o} {cargo} até o Marco. É o preço."
    ];
  },
  escolhas: S => brandtTem(S)
    ? [
        { t: "Exigir a devolução diante de quem ainda está na sala: o inquérito acabou, e a placa é sua por direito.",
          se: S => aliados(S) >= 2, bloqueio: "Você não tem aliados suficientes na sala para enfrentá-lo.",
          efeito: S => { recupera(S, "conselho"); M.rel("brandt", -1); },
          diario: "Diante do Conselho, você exigiu e recebeu de volta a placa de Helena.", vai: "fim_cap3" },
        { t: "Aceitar o preço: a escolta da Guarda até o Marco.",
          efeito: S => { recupera(S, "escolta"); M.flag("concessao_brandt"); M.flag("escolta_guarda"); },
          diario: "Brandt devolveu a placa de Helena em troca de uma escolta da Guarda até o Marco.", vai: "fim_cap3" },
        { t: "Recusar. A placa fica com ele, por ora.",
          diario: "Você recusou o preço de Brandt. A placa de Helena continua com a Guarda.", vai: "fim_cap3" }
      ]
    : [ { t: "Seguir.", vai: "fim_cap3" } ]
},

fim_cap3: {
  cap: CAP, arte: "noite", quando: "Fim do Capítulo 3",
  fim: { rotulo: "Fim do Capítulo 3" },
  entrar: S => {
    const f = S.f;
    if (f.sofia_testemunha && !f.c3f_bercario) f.sofia_vigiada = true;
    ["chave_daniel", "chave_sofia", "soube_cofre_local", "diario_halden", "sabe_aurea_morta", "concessao_brandt",
     "daniel_acordo", "promessa_desligar", "promessa_quotas", "sofia_vigiada", "beatriz_sabe_algo"].forEach(k => { f[k] = !!f[k]; });
    f.tem_chave_rin = !!f.placa;
    const g = f.c3g || 0;
    f.golpe_risco = g <= -1 ? 0 : g <= 2 ? 1 : 2;
    const n = (f.tem_chave_rin ? 1 : 0) + (f.chave_daniel ? 1 : 0) + (f.chave_sofia ? 1 : 0);
    M.diario("Ao fim do Capítulo 3 você tem " + ["nenhuma", "uma", "duas", "as três"][n] + (n === 1 ? " chave" : " chaves") + " de bronze" + (f.sabe_aurea_morta ? ", e sabe que Aurea está morta." : "."));
  },
  texto: S => {
    const f = S.f;
    const tem = [f.tem_chave_rin && "a sua", f.chave_daniel && "a da Forja", f.chave_sofia && "a do Berçário"].filter(Boolean);
    const falta = [!f.tem_chave_rin && "a sua", !f.chave_daniel && "a da Forja", !f.chave_sofia && "a do Berçário"].filter(Boolean);
    const lista = l => l.length > 1 ? l.slice(0, -1).join(", ") + " e " + l[l.length - 1] : l[0];
    return [
      S.f.placa_modo === "conselho" && "Brandt devolve o envelope diante de Marta, de Daniel e de dois chefes de turno que ainda não tinham saído. Não diz nada. Não precisa: todos viram quem cedeu.",
      S.f.placa_modo === "escolta" && "Brandt entrega o envelope e faz um gesto para a porta. Dois guardas se põem atrás de você. Vão estar lá até o Marco.",
      "A sessão termina perto do meio-dia, e o resto do ciclo passa como passam os dias depois de uma tempestade: devagar, contando os estragos.",
      tem.length === 3
        ? "À noite, sobre a mesa do aposento, você alinha as três placas de bronze. Três dentes cada uma, e cada dente diferente. Juntas, parecem peças de uma mesma mandíbula."
        : tem.length
          ? "À noite, sobre a mesa do aposento, você alinha o que tem: " + lista(tem) + ". Falta " + lista(falta) + ". A porta tem três fendas, e você não sabe o que acontece com uma porta que recebe menos do que pede."
          : "À noite, sobre a mesa do aposento, não há nenhuma placa de bronze. Você tem uma fórmula antiga, alguns nomes, e a teimosia que Helena viu em você antes de qualquer outra pessoa.",
      f.sabe_aurea_morta
        ? "E tem o que nenhuma placa abre: o caderno de Hugo Halden, com a frase que você já não consegue desler. Aurea está morta."
        : "O que a Fundação escondeu continua escondido. Mas a Aia disse 'protegida' ao destino da nave, e você começa a desconfiar de que a resposta é pior do que qualquer pergunta.",
      f.soube_cofre_local
        ? "Você sabe onde fica a porta: Anel Zero, casco de ré, onde terminam os olhos da Aia."
        : "Você ainda não sabe onde fica a porta. Mas alguém na Forja sabe, e o casco de ré não é tão grande quanto o silêncio faz parecer.",
      f.golpe_risco === 2 ? "Entre o Salão do Conselho e o seu aposento, você conta onze guardas. Na semana passada eram dois. Brandt já não precisa de uma razão; só de uma ocasião."
        : f.golpe_risco === 1 ? "A Guarda continua em pares pelos corredores. Brandt está esperando para ver o que você fará. Você também está."
        : "Pela primeira vez em dias, você atravessa o corredor da Ponte sem cruzar com nenhum guarda.",
      "Restam " + (f.adiou ? "onze" : "doze") + " ciclos para o Marco dos Trinta.",
      "Em breve você vai descer ao casco de ré. Lá embaixo, onde a nave não tem olhos, há uma porta redonda que espera há duzentos e doze anos por três mãos ao mesmo tempo.",
      "**Fim do Capítulo 3.** A nave guarda as suas chaves, e agora você guarda algumas das dela."
    ];
  },
  escolhas: [
    { t: "Seguir para o Capítulo 4.", vai: "c4_abre",
      se: S => !!HISTORIA.cenas.c4_abre, bloqueio: "O Capítulo 4 está em preparação." }
  ]
}

  });
})();
