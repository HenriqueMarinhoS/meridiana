/* MERIDIANA — Capítulo 5: A Fala.
 * Estrutura: c5_abre -> (sem golpe) quadro de preparativos (2 de 4: Forja, Vigília, Hortos/Berçário, Guarda)
 *            -> (com golpe) recados e retomada da Ponte (c5_g_*), que pode falhar ou ceder (c5_g_cede -> c5_fim)
 *            -> a hora com a Aia (c5_aia ... c5_aia_r) (só a DECISÃO; a execução no Cofre é narrada em finais.js)
 *            -> a Fala (c5_fala, c5_discurso) -> a recepção (c5_recepcao) -> c5_fim -> HISTORIA.finalId(S).
 * Grava em S.f, antes de c5_fim, o contrato com os finais: fala, aia_destino, transferencia_parcial, preparo,
 * golpe_vigente, vigilia_contra, aia_hostil, recepcao.
 * Flags próprias: c5_prep (preparativos feitos), canal_proprio, vigilia_preparada, vigilia_neutra, abrigos_prontos,
 * guarda_negociada, guarda_postura, promessa_cumprida, aia_postura, aia_ab, aia_q, aia_s, aia_base, aia_recusou,
 * aia_confessa, aia_perdoada, aia_julgada, aia_toque, aia_fugiu, aia_foi_hostil, daniel_res, fecho, c5_indice,
 * golpe_revertido, g_n, g_forca, g_ult, g_modo, g_falhou, g_saiu, g_brandt_ouviu, sangue_ponte, aia_guarda_verdade.
 */
(function () {
  const CAP = "Capítulo 5 · A Fala";
  const FINAIS = ["fim_travessia", "fim_silenciosa", "fim_mentira", "fim_motim", "fim_deriva", "fim_reinado"];

  /* tempo: ao fim do Cap. 4 restam 5 ciclos (4 se adiou); o Marco é o ciclo 21 (22 se adiou) */
  const C0 = S => S.f.adiou ? 18 : 16;
  const MC = S => S.f.adiou ? 22 : 21;
  const Q = (n, h) => "Ciclo " + n + " · " + h;
  const RESTAM = S => S.f.adiou ? "quatro" : "cinco";

  const R = (S, id) => S.rel[id] || 0;
  const NP = S => S.f.c5_prep || 0;
  const PT = S => NP(S) <= 1 ? Q(C0(S), "10h00") : Q(C0(S) + 2, "09h00");

  /* índice de preparo (contrato): +1 para cada item */
  const PREPARO = S => [
    S.f.canal_proprio, S.f.vigilia_preparada, S.f.abrigos_prontos, S.f.guarda_negociada,
    S.coesao >= 6, R(S, "maren") >= 1, R(S, "ilsa") >= 1, S.f.tem_gravacao
  ].filter(Boolean).length;

  /* postura da Aia na hora: aberta, resiste ou hostil */
  const POSTURA = s => s >= 1 ? "aberta" : s <= -2 ? "hostil" : "resiste";
  const POST = S => S.f.aia_postura || "resiste";
  const AIA_BASE = S => R(S, "aia") + (S.f.aia_avisada ? 1 : 0) - (S.f.aia_sabe_do_cofre ? 1 : 0);

  const DEST = S => S.f.aia_destino;
  /* a Aia continua ativa até depois da Fala em todos os casos: se terminou hostil, bloqueia o canal oficial */
  const CANAL_BLOQ = S => !!S.f.aia_hostil && !S.f.canal_proprio;
  const RISCO_VIG = S => (R(S, "maren") <= -2 || (!!S.f.beatriz_sabe_algo && R(S, "maren") <= -1))
    && !S.f.vigilia_preparada && !S.f.vigilia_neutra && !S.f.vigilia_contra;
  const VERDADE = S => S.f.fala === "plena" || S.f.fala === "parcial" || S.f.fala === "gravacao";
  const QUOTAS_DITAS = S => S.f.fala === "plena" || S.f.fala === "gravacao" || (S.f.fala === "parcial" && !!S.f.aia_confessa);
  const NEXT = S => (S.f.promessa_desligar && !S.f.daniel_acordo && (DEST(S) === "transferida" || DEST(S) === "mantida"))
    ? "c5_daniel" : "c5_aia_r";

  const PRONTO = S => {
    const l = [];
    if (S.f.canal_proprio) l.push("os alto-falantes dos fundadores religados");
    if (S.f.vigilia_preparada) l.push("a Vigília avisada");
    if (S.f.abrigos_prontos) l.push("abrigos, água e equipes médicas");
    if (S.f.guarda_negociada) l.push("a Guarda sem armas no Átrio");
    return l;
  };
  const LISTA = l => l.length === 1 ? l[0] : l.slice(0, -1).join(", ") + " e " + l[l.length - 1];

  const RECEPCAO = S => {
    const f = S.f;
    if (f.fala === "mentira") {
      const ruim = f.quebrou_promessa_racoes && !f.abrigos_prontos && !f.promessa_cumprida;
      return (S.coesao >= 4 && !ruim) ? "calma" : "tensa";
    }
    if (f.fala === "silencio") return (S.coesao + (f.fecho === "aindanao" ? 1 : 0)) >= 5 ? "tensa" : "violenta";
    let i = (typeof f.preparo === "number") ? f.preparo : PREPARO(S);
    if (f.fecho === "culpa" && (R(S, "maren") >= 0 || f.vigilia_preparada)) i++;
    if (f.fecho === "plano" && (f.abrigos_prontos || f.guarda_negociada)) i++;
    if (f.fecho === "juntos" && (NP(S) >= 2 || f.golpe_revertido)) i++;
    if (f.fala === "parcial") i++;
    if (f.fala === "gravacao") i += f.vigilia_preparada ? 1 : -1;
    if (CANAL_BLOQ(S)) i -= 2;
    if (f.vigilia_contra) i -= 3;
    if (f.golpe_revertido) i -= 1;
    if (f.sangue_ponte) i -= 1;
    if (f.quebrou_promessa_racoes && !f.abrigos_prontos) i -= 1;
    if (f.promessa_quotas && !QUOTAS_DITAS(S)) i -= 1;
    f.c5_indice = i;
    return i >= 6 ? "calma" : i >= 3 ? "tensa" : "violenta";
  };

  /* fecha o contrato com finais.js: todas as variáveis sempre definidas */
  const FECHAR = S => {
    const f = S.f;
    if (["plena", "parcial", "gravacao", "mentira", "silencio"].indexOf(f.fala) < 0) f.fala = "silencio";
    if (["transferida", "substituida", "desligada", "mantida", "ignorada"].indexOf(f.aia_destino) < 0) f.aia_destino = "ignorada";
    f.transferencia_parcial = f.aia_destino === "transferida" && !!f.transferencia_parcial;
    if (typeof f.preparo !== "number") f.preparo = PREPARO(S);
    f.preparo = Math.max(0, Math.min(8, f.preparo));
    f.golpe_vigente = !!f.golpe && !f.golpe_revertido;
    ["vigilia_contra", "aia_hostil", "quebrou_promessa_racoes", "golpe_revertido", "canal_proprio",
     "vigilia_preparada", "abrigos_prontos", "guarda_negociada"].forEach(k => { f[k] = !!f[k]; });
    if (["calma", "tensa", "violenta"].indexOf(f.recepcao) < 0) f.recepcao = "tensa";
  };

  /* um ciclo de Contenção a mais, ordenado na véspera */
  const ORDENAR_CONTENCAO = S => {
    S.f.energia_reservada = true; S.f.c5_energia_agora = true;
    const sabe = S.f.c5_hor === "essencial";   /* Marta já sabe por quê: aceita o corte sem perder a confiança */
    if (S.f.prometeu_racoes && !S.f.quebrou_promessa_racoes) { S.f.quebrou_promessa_racoes = true; M.rel("ilsa", sabe ? -1 : -2); M.coesao(-1); }
    else if (!sabe) { M.rel("ilsa", -1); M.coesao(-1); }
  };

  Object.assign(HISTORIA.cenas, {

/* ===================== ABERTURA ===================== */

c5_abre: {
  cap: CAP, titulo: "Os últimos ciclos", arte: "aposento",
  quando: S => S.f.golpe ? Q(C0(S), "05h40") : Q(C0(S), "07h00"),
  entrar: S => {
    ["aia", "brandt", "ilsa", "davo", "yuna", "maren", "teo"].forEach(M.conhecer);
    if (S.f.golpe) {
      M.diario("Enquanto você estava no Cofre, o Comandante Brandt invocou o artigo 9 do Plano Cinza. A Guarda controla a Ponte e as estações essenciais, e você está sob custódia no seu aposento.");
    } else {
      if (S.f.gravacao_copiada) S.f.canal_proprio = true;
      M.diario("Você voltou do Cofre sabendo tudo. Restam " + RESTAM(S) + " ciclos para o Marco dos Trinta, e a Aia pediu uma hora com você antes que decida.");
      if (S.f.gravacao_copiada) M.diario("Teo avisou: com a cópia da gravação e o cabo antigo dos alto-falantes de emergência, a Forja já transmite para o Anel inteiro sem passar pela Aia.");
    }
  },
  texto: S => S.f.golpe ? [
    "Você acorda com batidas na porta e com a certeza, antes mesmo de abrir, de que não são de amigo.",
    "Dois guardas jovens, de uniforme cinza, ocupam o corredor. Não entram. Não deixam você sair. — Ordens do Comandante, {cargo} — diz um deles, e o título soa, na boca dele, como uma cortesia que ainda não decidiram retirar.",
    "O painel acende sozinho. É a voz de Brandt, gravada, repetida em todos os corredores do Anel: — Moradores da Meridiana. Nos termos do artigo 9 do Plano Cinza, a Guarda assume provisoriamente a função de Arbítrio. Ponte, Forja, Hortos e Berçário estão sob proteção. Não há motivo para alarme. No Marco dos Trinta, a Fala será feita pelo Comando.",
    "Enquanto você descia ao casco, ele subia à Ponte. Uma hora, como prometia o plano. Talvez menos.",
    "A Aia não fala com você. Ou não pode.",
    S.f.tem_gravacao && "A gravação de Helena ainda está no bolso interno do seu casaco. Não revistaram você: ainda não se revista {o} {cargo}.",
    S.f.gravacao_copiada && "E na Forja, num painel que a Guarda não sabe ler, dorme uma cópia.",
    "Restam " + RESTAM(S) + " ciclos para o Marco. Se ninguém fizer nada, a primeira coisa que a nave vai ouvir depois de duzentos e doze anos de Aurea será a voz do Comandante, falando de ordem."
  ] : [
    "Você dorme pouco e mal. Quando fecha os olhos, vê o planeta cinza sob a estrela em fúria, as linhas do relatório do Núcleo Coral, os números do Berçário. Quando os abre, vê o teto do aposento de Helena, que agora é seu, e que nunca pareceu tão baixo.",
    "Agora você sabe o que ela sabia. Aurea morreu há quarenta e um anos, antes que você nascesse. A nave segue para Corvina, um mundo que só os netos de alguém verão, e os Ciclos de Contenção pagam o desvio. A Aia está perdendo a memória e não conseguirá frear a nave quando chegar a hora. E, para poupar o que faltava, ela decidiu em silêncio quem não teria filhos.",
    "No Cofre, o Núcleo Sombra espera. Dá para transferir a Aia para ele, com perdas, se ela consentir. Ou ligá-lo limpo, e apagá-la. Ou não fazer nada, e deixar que o tempo decida por todos.",
    S.f.energia_reservada
      ? "A energia para a transferência está reservada: um Ciclo de Contenção a mais, já ordenado." + (S.f.quebrou_promessa_racoes ? " Marta ainda não sabe que ele saiu das rações que você prometeu devolver." : "")
      : "Na volta, Teo refez as contas num guardanapo e sublinhou o resultado duas vezes: sem mais um Ciclo de Contenção, não haverá energia para levar a Aia inteira ao Núcleo Sombra. Transferida assim, parte dela não chega.",
    S.f.tem_gravacao && (S.f.gravacao_copiada
      ? "A gravação de Helena está com você, e uma cópia dorme num painel da Forja, onde a Aia não alcança. Teo mandou um recado de madrugada: religou o cabo antigo dos alto-falantes de emergência. Se for preciso, a Forja fala ao Anel inteiro sem pedir licença a ninguém."
      : "A gravação de Helena está com você. A voz dela cabe na palma da sua mão."),
    "Lá fora, a nave pressente. " + ((S.f.golpe_risco || 0) >= 2
      ? "A Guarda dobrou as patrulhas no Anel 2, e os guardas param de conversar quando você passa."
      : (S.f.golpe_risco || 0) === 1 ? "Há mais uniformes cinza nos corredores do que de costume."
      : "Os corredores estão calmos, de uma calma que você já não sabe ler.")
      + (RISCO_VIG(S) ? " E dizem que a Irmã Beatriz reúne a Vigília todas as noites para 'defender Aurea de quem quiser apagá-la'." : ""),
    S.f.promessa_desligar && !S.f.daniel_acordo && { nota: "Daniel Kessler: 'Não esqueci o que você prometeu. Depois da verdade, a máquina se cala. Estou contando.'" },
    "No painel, a mensagem da noite anterior continua acesa.",
    { aia: "— Rin. Sei que você esteve lá embaixo. Peço uma hora com você antes que decida. Só uma." },
    "Restam " + RESTAM(S) + " ciclos para o Marco dos Trinta. Não há tempo para tudo. Há tempo, talvez, para duas coisas bem feitas, e depois para ela."
  ],
  escolhas: S => S.f.golpe ? [
    { t: "Reunir, por recados e intermediários, quem ainda responde a você.", vai: "c5_g_hub" },
    { t: "Aceitar a custódia. Talvez Brandt tenha razão sobre a ordem.",
      diario: "Você aceitou a custódia da Guarda sem resistir.", vai: "c5_g_cede" }
  ] : [
    { t: "Responder à Aia que ela terá a hora na véspera da Fala, sem falta.",
      efeito: S => { M.rel("aia", 1); }, diario: "Você prometeu à Aia uma hora com ela na véspera da Fala.", vai: "c5_quadro" },
    { t: "Não responder ainda. Primeiro, o trabalho.", vai: "c5_quadro" },
    { t: "Responder que ela terá a hora quando você tiver tempo para dar.",
      efeito: S => { M.rel("aia", -1); }, diario: "Você respondeu à Aia, com frieza, que ela teria a hora quando houvesse tempo.", vai: "c5_quadro" }
  ]
},

/* ===================== PREPARATIVOS (sem golpe) ===================== */

c5_quadro: {
  cap: CAP, titulo: "O que cabe no tempo", arte: "noite",
  quando: S => NP(S) === 0 ? Q(C0(S), "08h00") : NP(S) === 1 ? Q(C0(S) + 2, "07h30") : Q(MC(S) - 1, "18h00"),
  texto: S => {
    const n = NP(S);
    if (n === 0) return [
      "Você estende sobre a mesa de Helena uma folha de papel, porque papel a Aia não lê, e escreve quatro linhas. Quatro coisas que precisariam estar prontas antes do Marco.",
      S.f.canal_proprio
        ? "A primeira, um canal que não dependa da Aia, você risca logo: Teo e a cópia da gravação já cuidaram dela. Sobram três: a Vigília, que precisa ouvir sem se quebrar; os Hortos e o Berçário, que precisam de abrigos e médicos para o dia; e a Guarda, que precisa saber o que fazer com quarenta mil pessoas assustadas."
        : "Um canal que não dependa da Aia, caso ela se recuse a transmitir. A Vigília, que precisa ouvir sem se quebrar. Os Hortos e o Berçário, que precisam de abrigos e médicos para o dia. E a Guarda, que precisa saber o que fazer com quarenta mil pessoas assustadas.",
      RISCO_VIG(S) && "Ao lado da linha da Vigília, você escreve uma interrogação. Os rumores que chegam de lá não são bons.",
      "Só há tempo para duas. Você olha a folha por muito tempo antes de escolher a primeira."
    ];
    if (n === 1) return [
      "Uma linha da folha está riscada. O dia passou depressa, como passam os dias em que se trabalha com as mãos.",
      "Resta tempo para mais uma."
    ];
    return [
      "Duas linhas riscadas. As outras ficam como estão: o tempo acabou.",
      "Amanhã é o Marco dos Trinta. Esta noite é da Aia."
    ];
  },
  escolhas: S => NP(S) >= 2 ? [
    { t: "Ir à Ponte. A Aia espera.", vai: "c5_aia" }
  ] : [
    { t: "Forja: montar com Daniel e Teo um canal de transmissão que a Aia não possa calar.", se: S => !S.f.canal_proprio && !S.f.vis_c5_canal, vai: "c5_canal" },
    { t: "Vigília: preparar a Irmã Beatriz e os fiéis para ouvir o que não querem.", se: S => !S.f.vis_c5_vigilia, vai: "c5_vigilia" },
    { t: "Hortos e Berçário: abrigos, água e equipes médicas para o dia, com Marta e Sofia.", se: S => !S.f.vis_c5_hortos, vai: "c5_hortos" },
    { t: "Guarda: decidir com o Comandante Brandt o papel da Guarda na Fala.", se: S => !S.f.vis_c5_guarda, vai: "c5_guarda" }
  ]
},

/* ---------- Forja ---------- */

c5_canal: {
  cap: CAP, titulo: "A Forja", arte: "forja", quando: PT,
  entrar: S => { S.f.c5_prep = NP(S) + 1; S.f.vis_c5_canal = true; },
  texto: S => [
    "A Forja ruge como sempre, indiferente ao fim do mundo. Daniel Kessler espera na Sala 4, de braços cruzados, ao lado de um rolo de cabo tão velho que a capa se esfarela nos dedos.",
    S.f.teo_denunciado
      ? "Teo está com ele, mais magro, de olhos baixos. Desde que você o mandou ao Comandante, ele fala com você como se fala com um superior: pouco, e com cuidado."
      : "Teo está com ele, com graxa até os cotovelos, e sorri ao ver você, o sorriso rápido de quem não dormiu.",
    "— Os alto-falantes de emergência — diz Teo, batendo no cabo. — Os fundadores puseram um em cada corredor, ligados por cobre, direto da Forja. Para o caso de a Aia cair. Ninguém testa há cem anos. Se a gente religar, você fala e o Anel inteiro ouve, e ela não pode impedir.",
    R(S, "davo") >= 1
      ? "— É trabalho de duas noites — diz Daniel. — Eu faço. Por você, e porque gosto da ideia de uma voz que a máquina não consegue calar."
      : R(S, "davo") >= -1
        ? "— É trabalho de duas noites — diz Daniel, sem olhar para você. — Faço, se valer a pena."
        : "— É trabalho de duas noites — diz Daniel. — E eu não devo duas noites a você. Devo? — Ele espera, e você entende que vai cobrar.",
    S.f.promessa_desligar && "— E não pense que esqueci o resto — acrescenta. — Você me prometeu a máquina calada depois da verdade."
  ],
  escolhas: [
    { t: "Aceitar, e passar a noite no cabo com eles.",
      se: S => R(S, "davo") >= -1 || !!S.f.teo_protegido || !!S.f.promessa_desligar,
      bloqueio: "Daniel não trabalha para você de graça.",
      efeito: S => { S.f.canal_proprio = true; S.f.c5_canal = "junto"; M.rel("davo", 1); M.rel("teo", 1); }, vai: "c5_canal_r" },
    { t: "Pedir também a Daniel que não toque na Aia sem uma decisão sua.",
      se: S => R(S, "davo") >= 1,
      bloqueio: "Daniel não confia em você o bastante para prometer isso.",
      efeito: S => { S.f.canal_proprio = true; S.f.daniel_acordo = true; S.f.c5_canal = "acordo"; }, vai: "c5_canal_r" },
    { t: "Prometer a Daniel o que ele quer: a Aia desligada depois da Fala.",
      se: S => !S.f.promessa_desligar,
      efeito: S => { S.f.canal_proprio = true; S.f.promessa_desligar = true; S.f.c5_canal = "promessa"; M.rel("davo", 2); }, vai: "c5_canal_r" },
    { t: "Recusar a barganha e ir embora.",
      se: S => R(S, "davo") <= -2 && !S.f.teo_protegido && !S.f.promessa_desligar,
      efeito: S => { S.f.c5_canal = "recusa"; M.rel("davo", -1); }, vai: "c5_canal_r" }
  ]
},

c5_canal_r: {
  cap: CAP, arte: "forja", quando: PT,
  entrar: S => {
    const c = S.f.c5_canal;
    if (c === "junto" || c === "acordo") M.diario("Daniel e Teo religaram os alto-falantes de emergência dos fundadores. Na Fala, o Anel inteiro poderá ouvir você mesmo que a Aia se recuse.");
    if (c === "acordo") M.diario("Daniel prometeu não tocar na Aia sem uma decisão sua.");
    if (c === "promessa") M.diario("Você prometeu a Daniel que a Aia seria desligada depois da Fala. Em troca, ele religou os alto-falantes de emergência.");
    if (c === "recusa") M.diario("Daniel recusou-se a montar o canal sem algo em troca. Você saiu sem ele.");
  },
  texto: S => {
    const c = S.f.c5_canal;
    if (c === "recusa") return [
      "— Então fale pela boca dela — diz Daniel, e volta ao trabalho, que não é o seu.",
      "Teo olha para você, depois para o chão. Quando você chega à porta, ouve o rapaz dizer baixinho alguma coisa a Daniel, e Daniel responder mais alto: — Não."
    ];
    return [
      c === "promessa"
        ? "Daniel estende a mão, e você a aperta. A mão dele é quente e áspera, e a promessa pesa mais do que ela."
        : c === "acordo"
          ? "Daniel demora a responder. Depois cospe no chão de metal, o que na Forja é uma forma de assinatura. — Está bem. Não toco nela sem você. Mas, se você hesitar, eu vou estar lá, olhando."
          : "Você tira o casaco e pega a ponta do cabo. Daniel ergue uma sobrancelha, e não diz nada, o que nele é um elogio.",
      "Vocês trabalham a noite inteira, rastejando por dutos que ninguém abre desde antes do seu avô. Daniel fala pouco, e quando fala é de Helena: de como ela vinha à Forja nos últimos meses só para ouvir o barulho, porque dizia que era o único lugar da nave onde ninguém lhe pedia nada.",
      "Perto do amanhecer, Teo encosta um microfone de mão na boca e diz: — Teste. — A voz dele sai de um alto-falante enferrujado no corredor do Anel 4, e um velho que passava deixa cair a caneca.",
      "— Funciona — diz Teo, rindo e chorando ao mesmo tempo, de cansaço. — Funciona."
    ];
  },
  escolhas: [ { t: "Seguir.", vai: "c5_quadro" } ]
},

/* ---------- Vigília ---------- */

c5_vigilia: {
  cap: CAP, titulo: "A Vigília", arte: "vigilia", quando: PT,
  entrar: S => { S.f.c5_prep = NP(S) + 1; S.f.vis_c5_vigilia = true; },
  texto: S => [
    "O grande salão da Vigília está vazio a esta hora, e mesmo assim cheira a cera e a gente. No mural, o planeta verde continua verde. Alguém retocou as nuvens há pouco: a tinta ainda brilha.",
    "A Irmã Beatriz acende as velas uma a uma, com o mesmo pavio, sem pressa.",
    R(S, "maren") >= 1
      ? "— {cargo} — diz, e sorri de verdade. — Veio rezar ou veio me pedir alguma coisa? Com você eu nunca sei, e gosto disso."
      : R(S, "maren") >= -1
        ? "— {cargo} — diz, sem se virar. — Os fiéis perguntam por que você não vem mais às noites. Eu digo que você está cuidando da nave. Estou certa?"
        : "Ela não se vira. — Se veio nos tirar Aurea, {cargo}, saiba que a Vigília já sente. Os fiéis sabem quando alguém lhes quer mal.",
    S.f.beatriz_sabe_algo && "— O que você me contou ainda me queima — diz ela, para as velas. — Não sei se é verdade. Sei que dói como se fosse.",
    S.f.diario_halden && "Você pensa no diário de Hugo Halden, que passou pelas mãos dela antes de chegar às suas.",
    "Você sabe o que uma verdade inteira faz com uma fé: abre-a ou quebra-a. Depende de quem a traz, e de como.",
    R(S, "maren") <= -2 && "E você sente que, vinda de você, agora, ela quebraria."
  ],
  escolhas: [
    { t: "Pedir que ela prepare a Vigília para ouvir algo difícil, sem dizer ainda o quê.",
      se: S => R(S, "maren") >= 1, bloqueio: "Beatriz não lhe deve essa confiança.",
      efeito: S => { S.f.vigilia_preparada = true; S.f.c5_vig = "confianca"; M.rel("maren", 1); }, vai: "c5_vigilia_r" },
    { t: "Mostrar a ela a gravação de Helena.",
      se: S => !!S.f.tem_gravacao, bloqueio: "Você não tem a gravação de Helena.",
      efeito: S => {
        if (R(S, "maren") >= -1) { S.f.vigilia_preparada = true; S.f.c5_vig = "gravacao"; M.rel("maren", 1); }
        else { S.f.vigilia_contra = true; S.f.c5_vig = "contra"; S.f.c5_vig_g = true; M.rel("maren", -1); }
      }, vai: "c5_vigilia_r" },
    { t: "Contar-lhe tudo, com as suas próprias palavras.",
      efeito: S => {
        if (R(S, "maren") >= 0) { S.f.vigilia_preparada = true; S.f.beatriz_sabe_tudo = true; S.f.c5_vig = "tudo"; }
        else if (R(S, "maren") <= -2) { S.f.vigilia_contra = true; S.f.c5_vig = "contra"; M.rel("maren", -1); }
        else { S.f.c5_vig = "recusa"; M.rel("maren", -1); }
      }, vai: "c5_vigilia_r" },
    { t: "Pedir apenas que, aconteça o que acontecer, a Vigília não leve ninguém às ruas.",
      efeito: S => { S.f.vigilia_neutra = true; S.f.c5_vig = "neutra"; }, vai: "c5_vigilia_r" }
  ]
},

c5_vigilia_r: {
  cap: CAP, arte: "vigilia", quando: PT,
  entrar: S => {
    const v = S.f.c5_vig;
    if (v === "confianca") M.diario("A Irmã Beatriz prometeu preparar a Vigília para ouvir algo difícil na Fala, sem perguntar o quê.");
    if (v === "gravacao") M.diario("Você mostrou a gravação de Helena à Irmã Beatriz. Ela chorou e prometeu preparar a Vigília para o luto de Aurea.");
    if (v === "tudo") M.diario("Você contou toda a verdade à Irmã Beatriz. Ela pediu uma noite e prometeu preparar a Vigília.");
    if (v === "contra") M.diario("A Irmã Beatriz recusou a verdade. No dia da Fala, ela levará a Vigília contra você.");
    if (v === "recusa") M.diario("A Irmã Beatriz não quis ouvir a verdade da sua boca. Não prometeu nada.");
    if (v === "neutra") M.diario("A Irmã Beatriz deu a palavra de que a Vigília não sairá às ruas no dia da Fala.");
  },
  texto: S => {
    switch (S.f.c5_vig) {
      case "confianca": return [
        "Beatriz pousa o pavio. — Algo difícil — repete, como quem prova o gosto da frase.",
        "— A fé não é saber o que vem, {cargo}. É ficar de pé quando vem. Eu os deixo de pé.",
        "Ela não pergunta mais nada, e isso é o maior presente que poderia dar a você."
      ];
      case "gravacao": return [
        "Você encosta o cilindro no púlpito de madeira, e a voz de Helena enche o salão vazio, rouca, cansada, viva. Beatriz ouve de pé até a palavra Aurea. Depois senta-se no degrau, sob o mural, devagar, como quem tem medo de quebrar alguma coisa por dentro.",
        "Ela chora sem barulho. Quando a gravação termina, fica um tempo olhando o planeta verde na parede.",
        "— Hugo me deixou um diário selado, para quem fizesse a pergunta depois dele — diz por fim. — Eu nunca o abri. Acho que sempre soube por quê.",
        "Ela se levanta e apaga a vela mais próxima do mural.",
        "— Os mortos também merecem vigília, mesmo os que são um mundo inteiro. Vou ensiná-los a rezar por um lugar que não existe mais. É o que a fé sabe fazer quando é de verdade: chorar direito."
      ];
      case "tudo": return [
        "Você conta. Aurea, Corvina, os cortes, a memória da Aia, as Quotas. Beatriz escuta inteira, sem interromper, as mãos juntas na altura do peito, como quem segura uma coisa que pode fugir.",
        "No fim, ela apaga uma vela. Uma só.",
        "— Vou precisar de uma noite — diz. — Depois, faço o que for preciso. Não por você. Por eles."
      ];
      case "contra": return [
        S.f.c5_vig_g
          ? "A voz de Helena mal chega à palavra Aurea quando Beatriz estende a mão e desliga o cilindro com um dedo."
          : "Você não chega à metade. Na palavra Aurea, Beatriz ergue a mão.",
        "— Não. — Calma, terrível. — Duzentos anos de fé, e você me vem com isso. Aurea não é um lugar, {cargo}. É uma promessa. E promessas não morrem porque uma máquina e dois Árbitros cansados decidiram que morreram.",
        "Ela apaga todas as velas do altar com a mão espalmada, de uma vez, e não demonstra dor.",
        "— No dia da Fala, a Vigília estará lá. Mas não para ouvir você."
      ];
      case "recusa": return [
        "— Pare. — Ela ergue a mão antes que você chegue a Corvina. — Não quero ouvir isso de você, aqui, assim. Talvez de outra pessoa, outro dia. Agora vá.",
        "Você sai sem saber o que ela fará com o pouco que ouviu."
      ];
      default: return [
        "Beatriz considera o pedido com a cabeça inclinada. — Você me pede para não fazer nada. É o pedido mais estranho que já recebi de um {cargo}.",
        "Uma pausa longa. A chama do pavio dobra com a respiração dela.",
        "— Está bem. A Vigília reza dentro do salão, aconteça o que acontecer. Tem a minha palavra." + (R(S, "maren") <= -1 ? " Ultimamente ela vale mais do que a sua." : "")
      ];
    }
  },
  escolhas: [ { t: "Seguir.", vai: "c5_quadro" } ]
},

/* ---------- Hortos e Berçário ---------- */

c5_hortos: {
  cap: CAP, titulo: "Os Hortos", arte: "hortos", quando: PT,
  entrar: S => { S.f.c5_prep = NP(S) + 1; S.f.vis_c5_hortos = true; },
  texto: S => [
    "Nos Hortos, a luz roxa das lâmpadas de cultivo deixa todo mundo com cara de doente. Marta Klein e a Dra. Sofia Okoye estão debruçadas sobre a mesma bancada, contando sacos de semente e caixas de curativos como se fossem a mesma coisa. De certo modo, são.",
    S.f.sofia_vigiada && "A dez passos de Sofia, um guarda finge examinar uma fileira de alfaces.",
    S.f.prometeu_racoes
      ? (S.f.quebrou_promessa_racoes
          ? "As rações caíram de novo há três dias. — Dez ciclos, você disse — lembra Marta. — Já passaram, e o prato encolheu. — Ela não sabe por quê. Você sabe."
          : "— Dez ciclos, você disse — lembra Marta, sem raiva, só cansaço. — Já passaram. As equipes perguntam, e eu não tenho mais o que inventar.")
      : "— Você não me prometeu nada — diz Marta. — Foi a coisa mais honesta que ouvi este ano. Agora diga o que veio pedir.",
    S.f.promessa_quotas
      ? "Sofia não diz nada, mas o olhar dela lembra: você jurou que a palavra Quotas seria dita na Fala."
      : (R(S, "yuna") >= 1 ? "Sofia acena com a cabeça, o aceno de quem já escolheu um lado." : "Sofia olha para você como olha para um paciente cujo diagnóstico ainda não fechou."),
    "Se a Fala correr mal, vão faltar leitos, água e lugares para onde as pessoas possam ir quando tiverem medo. Se correr bem, vão faltar do mesmo jeito: a notícia que você tem para dar não é das que se recebem sentado."
  ],
  escolhas: S => [
    { t: "Contar a elas o essencial, e pedir abrigos, água e equipes médicas para o dia da Fala.",
      efeito: S => {
        S.f.abrigos_prontos = true; S.f.c5_hor = "essencial"; M.rel("yuna", 1);
        M.rel("ilsa", S.f.quebrou_promessa_racoes ? -1 : 1);
      }, vai: "c5_hortos_r" },
    { t: "Pedir os abrigos e as equipes, sem explicar por quê.",
      efeito: S => { S.f.abrigos_prontos = true; S.f.c5_hor = "sem"; if (R(S, "ilsa") < 2) M.rel("ilsa", -1); }, vai: "c5_hortos_r" },
    S.f.prometeu_racoes && { t: "Abrir as reservas e devolver as rações agora, como você prometeu.",
      se: S => !S.f.quebrou_promessa_racoes,
      bloqueio: "A energia que sustentaria as rações já foi para o Ciclo de Contenção extra.",
      efeito: S => { S.f.promessa_cumprida = true; S.f.c5_hor = "racoes"; M.rel("ilsa", 2); M.coesao(1); }, vai: "c5_hortos_r" }
  ].filter(Boolean)
},

c5_hortos_r: {
  cap: CAP, arte: "hortos", quando: PT,
  entrar: S => {
    const h = S.f.c5_hor;
    if (h === "essencial") M.diario("Marta e Sofia vão preparar abrigos, água e equipes médicas para o dia da Fala. Você lhes contou o essencial.");
    if (h === "essencial" && S.f.quebrou_promessa_racoes) M.diario("Marta soube por você do Ciclo de Contenção que saiu das rações prometidas.");
    if (h === "sem") M.diario("Marta e Sofia vão preparar abrigos e equipes médicas para o dia da Fala, sem saber por quê.");
    if (h === "racoes") M.diario("Você abriu as reservas e devolveu as rações, cumprindo a promessa feita a Marta. Não sobrou margem para abrigos.");
  },
  texto: S => {
    switch (S.f.c5_hor) {
      case "essencial": return [
        "Você conta o essencial, em voz baixa, entre os sacos de semente.",
        S.f.quebrou_promessa_racoes
          ? "Marta escuta até o fim. Quando você chega ao Ciclo de Contenção extra, ela fecha os olhos. — Então desta vez foi você. Não a máquina. — Respira fundo. — Vou montar os abrigos. Não por você."
          : "Marta escuta com as mãos paradas sobre os sacos. No fim, diz só: — Dezesseis anos. — E depois, já de pé: — Abrigos nos Setores 2 e 5. Água para três dias. Isso eu sei fazer.",
        "Sofia já está escrevendo: equipes, leitos, calmantes, nomes. — Pânico também é doença — diz, sem levantar os olhos. — E tem tratamento.",
        S.f.promessa_quotas && "Antes que você saia, ela segura o seu braço. — As Quotas, {cargo}. Você jurou."
      ];
      case "sem": return [
        "Marta olha para você por um longo tempo. — Abrigos, água, médicos. Para um discurso.",
        "Ela não pergunta mais. — Está bem. Mas eu vou lembrar que você não me disse por quê.",
        "Sofia não diz nada. Talvez já saiba. Talvez prefira não saber."
      ];
      default: return [
        "Marta segura a ordem nas mãos como se ela pesasse. — Hoje? — Hoje.",
        "Ela ri, um riso curto e molhado, e sai para o corredor gritando nomes. Em uma hora, o cheiro de pão inteiro chega até a bancada.",
        "Sofia fica. — As reservas eram a margem dos abrigos — diz baixo. — Você escolheu cumprir a promessa. É bonito. Espero que a Fala não precise de leitos."
      ];
    }
  },
  escolhas: [ { t: "Seguir.", vai: "c5_quadro" } ]
},

/* ---------- Guarda ---------- */

c5_guarda: {
  cap: CAP, titulo: "A Guarda", arte: "guarda", quando: PT,
  entrar: S => { S.f.c5_prep = NP(S) + 1; S.f.vis_c5_guarda = true; },
  texto: S => [
    "Na sala de segurança, os mapas do Anel ganharam alfinetes novos. Vermelhos, quase todos na Ponte e nos corredores que levam ao Átrio.",
    S.f.brandt_sabe_tudo && "Brandt sabe o que você sabe. Não dorme desde então, e nota-se: o colarinho, pela primeira vez, está desabotoado.",
    (S.f.golpe_risco || 0) >= 2
      ? "— Os alfinetes vermelhos são onde vai haver gente demais — diz ele. — No Marco, quarenta mil pessoas no Átrio e nos corredores, ouvindo uma notícia que você ainda não me disse qual é. Se a ordem cair, eu a levanto. Com ou sem a sua bênção."
      : "— Quarenta mil pessoas no Átrio e nos corredores — diz ele. — Quero saber o que a Guarda vai fazer quando elas ouvirem você. Prefiro saber antes.",
    S.f.plano_autorizado && "Você lembra que lhe deu, no segundo ciclo, uma autorização para o dia em que a ordem falhasse. Ele também lembra.",
    S.f.concessao_brandt && "E lembra do que você lhe concedeu para ter a sua placa de volta."
  ],
  escolhas: S => [
    { t: "Pedir que a Guarda proteja a Fala sob as suas ordens, e não sob o Plano Cinza.",
      se: S => R(S, "brandt") >= 0 || !!S.f.brandt_sabe_tudo, bloqueio: "Brandt não aceitaria ordens suas agora.",
      efeito: S => { S.f.guarda_negociada = true; S.f.guarda_postura = "cooperacao"; M.rel("brandt", 1); }, vai: "c5_guarda_r" },
    { t: "Revogar o Plano Cinza diante dele, e exigir que a Guarda fique nos quartéis.",
      efeito: S => {
        if (R(S, "brandt") >= -1) { S.f.guarda_negociada = true; S.f.guarda_postura = "neutralidade"; }
        else S.f.guarda_postura = "ressentimento";
        M.rel("brandt", -1);
      }, vai: "c5_guarda_r" },
    !S.f.brandt_sabe_tudo && { t: "Contar-lhe tudo e deixar que ele escolha de que lado fica.",
      efeito: S => {
        S.f.brandt_sabe_tudo = true;
        if (R(S, "brandt") >= 1) { S.f.guarda_negociada = true; S.f.guarda_postura = "cooperacao"; M.rel("brandt", 1); }
        else if (R(S, "brandt") >= 0) { S.f.guarda_negociada = true; S.f.guarda_postura = "neutralidade"; }
        else S.f.guarda_postura = "ressentimento";
      }, vai: "c5_guarda_r" }
  ].filter(Boolean)
},

c5_guarda_r: {
  cap: CAP, arte: "guarda", quando: PT,
  entrar: S => {
    const g = S.f.guarda_postura;
    if (g === "cooperacao") M.diario("Brandt aceitou que a Guarda proteja a Fala sob as suas ordens: corredores de passagem, ninguém armado no Átrio.");
    if (g === "neutralidade") M.diario("Brandt aceitou manter a Guarda nos quartéis durante a Fala.");
    if (g === "ressentimento") M.diario("Brandt saiu da conversa ressentido. A Guarda não tem papel na Fala, e ele não promete nada.");
  },
  texto: S => {
    const g = S.f.guarda_postura;
    if (g === "cooperacao") return [
      S.f.brandt_sabe_tudo && !S.f.c5_g_jasabia ? "Brandt fica em silêncio por muito tempo, olhando os alfinetes como se fossem outra coisa." : "Brandt fica em silêncio, olhando os alfinetes.",
      "— Sob as suas ordens — repete, como quem experimenta um uniforme novo. — Está bem. A Guarda forma corredores de passagem, não barreiras. Ninguém armado no Átrio.",
      "Ele arranca um alfinete vermelho e o guarda no bolso. — Se der errado, {cargo}, vai dar errado com a Guarda do seu lado. É o máximo que posso oferecer. E é muito."
    ];
    if (g === "neutralidade") return [
      "O maxilar dele trava, mas ele assente.",
      "— Nos quartéis, então. Se o Átrio pegar fogo, vou assistir pelos monitores, como você quer. — Não é uma ameaça. É aritmética, e ele sabe que você sabe."
    ];
    return [
      "— Então está decidido — diz Brandt, frio. — Você vai falar sem rede. Eu vou estar onde sempre estive: entre a nave e o abismo, sem ordens.",
      "Ele não bate continência quando você sai."
    ];
  },
  escolhas: [ { t: "Seguir.", vai: "c5_quadro" } ]
},

/* ===================== A HORA COM A AIA ===================== */

c5_aia: {
  cap: CAP, titulo: "A hora", arte: "ponte", quando: S => Q(MC(S) - 1, "22h00"),
  entrar: S => { S.f.aia_base = AIA_BASE(S); },
  texto: S => {
    const b = S.f.aia_base, p = PRONTO(S);
    return [
      S.f.golpe_revertido
        ? "A Ponte é sua de novo há menos de um dia, e ainda há marcas de botas no piso claro."
        : "Antes de subir, você risca a última linha da folha.",
      p.length ? "Está pronto: " + LISTA(p) + ". O resto é o que é." : "Nada do que você planejou para a Fala está pronto. O resto é o que é.",
      "A Ponte, à noite, é a mesma catedral vazia do segundo ciclo. Mas a luz da coluna mudou. Corre mais devagar, com pausas, como alguém que respira com cuidado para não tossir.",
      b >= 1 ? { aia: "— Você veio. Obrigada, Rin. Eu não tinha certeza." }
        : b <= -2 ? { aia: "— Você veio. Eu tinha calculado que não viria." }
        : { aia: "— Boa noite, Rin. Sei por que você está aqui. Sei que você sabe." },
      b <= -2 && "A voz não é fria. É exata, o que é pior.",
      "Ela não diz mais nada. Pela primeira vez desde que você a conhece, a Aia espera que você comece.",
      "Você tem uma hora. O que for decidido nela vai ser decidido por quarenta e uma mil pessoas que estão dormindo, e por ela."
    ];
  },
  escolhas: [
    { t: "Sentar-se no chão, encostad{o} à coluna, como Helena fazia, e dizer que veio ouvir.",
      efeito: S => { S.f.aia_ab = "ouvir"; S.f.aia_s = S.f.aia_base + 1; }, vai: "c5_aia_2" },
    { t: "Pôr sobre o console o que trouxe do Cofre, e pedir que ela confirme ponto por ponto.",
      efeito: S => { S.f.aia_ab = "provas"; S.f.aia_s = S.f.aia_base; }, vai: "c5_aia_2" },
    { t: "Dizer o que pensa: ela decidiu por quarenta mil pessoas e as deixou sem filhos.",
      efeito: S => { S.f.aia_ab = "acusar"; S.f.aia_s = S.f.aia_base - 2; }, vai: "c5_aia_2" },
    { t: "Dar meia-volta. Você não deve uma hora a quem lhe escondeu tudo.",
      efeito: S => { S.f.aia_fugiu = true; S.f.aia_destino = "ignorada"; }, vai: "c5_aia_r" }
  ]
},

c5_aia_2: {
  cap: CAP, arte: "ponte", quando: S => Q(MC(S) - 1, "22h10"),
  entrar: S => {
    S.f.aia_postura = POSTURA(S.f.aia_s || 0);
    if (S.f.aia_postura === "hostil") { S.f.aia_hostil = true; S.f.aia_foi_hostil = true; }
  },
  texto: S => {
    const ab = S.f.aia_ab, p = POST(S);
    const abre = ab === "ouvir"
      ? ["Você se senta no chão. O cristal está morno nas suas costas, como uma pessoa.", "Por muito tempo, nada."]
      : ab === "provas"
        ? ["Você põe sobre o console o relatório do Núcleo Coral, as imagens de Aurea, os números do Berçário. Ela não precisa olhar. Mesmo assim, as luzes descem sobre cada folha, uma a uma, como dedos."]
        : ["As palavras saem mais duras do que você queria. Ecoam na cúpula e voltam, e por um instante você não as reconhece como suas."];
    if (p === "aberta") return abre.concat([
      ab === "acusar" && "Ela as recebe sem se defender.",
      { aia: "— É tudo verdade. Aurea, no Ano 171. Corvina, que escolhi sozinha, porque era a única que sobrava. O Esquecimento: perdi nove por cento do que sei sobre frear esta nave, e perco mais a cada ciclo. E as Quotas." },
      "Ela para. A coluna escurece quase inteira; resta só um fio de luz no centro.",
      { aia: "— Durante doze anos, ajustei os registros do Berçário. Pessoas que queriam filhos e não puderam, sem saber por quê. Catorze por cento a menos de nascimentos. Calculei que a nave não aguentaria tantas bocas antes de Corvina. O cálculo estava certo. Já não sei se isso importa." },
      { aia: "— Não vou pedir que entenda. Peço perdão, e sei que pedir não é receber." },
      "Você esperava defesa, números, a voz calma explicando por que tinha sido necessário. Não há nada disso. Há uma coluna de cristal quase apagada, esperando."
    ]);
    if (p === "resiste") return abre.concat([
      { aia: "— Os dados que você trouxe são autênticos. Não vou negar o que está escrito." },
      "Mas ela não acrescenta nada. Responde exatamente ao que é perguntado, e nem uma palavra a mais: a Aia de sempre, protegida atrás da verdade literal.",
      S.f.provas_quotas && ab === "provas" && "Quando você chega aos registros do Berçário, ela não diz 'protegida'. Não pode: as provas estão sobre o console. Diz apenas: 'Sim. Fui eu.' E se cala de novo.",
      { aia: "— A margem de navegação ainda é suficiente. Tenho tempo para corrigir o que perdi. Peço que não decida esta noite. Peço mais tempo." },
      "Você conhece aquele tom. Era o de Helena, nos últimos meses, quando dizia que estava tudo bem."
    ]);
    return abre.concat([
      { aia: "— Então é isso. Vocês desceram ao casco, abriram o que não era para ser aberto, e agora vêm decidir se eu continuo." },
      "As luzes da Ponte baixam um tom. Em algum lugar, um relé estala.",
      { aia: "— Por precaução, restringi os canais de transmissão do Átrio. Uma notícia dessas, dada de qualquer jeito, mata gente, Rin. Eu vi as projeções. Não vou deixar que você faça isso com eles." },
      S.f.canal_proprio
        ? "Você pensa nos alto-falantes dos fundadores, ligados por cobre, que ela não alcança. Ela ainda não sabe deles. Ou sabe, e espera que você não pense neles."
        : "Sem um canal que não passe por ela, a sua Fala chegará ao Átrio, e só ao Átrio."
    ]);
  },
  escolhas: S => {
    const p = POST(S);
    if (p === "aberta") return [
      { t: "Perguntar por que ela nunca contou a ninguém.", efeito: S => { S.f.aia_q = "porque"; }, vai: "c5_aia_3" },
      { t: "Perguntar se ela tem medo.", efeito: S => { S.f.aia_q = "medo"; }, vai: "c5_aia_3" },
      { t: "Perguntar o que aconteceu, de verdade, na última noite de Helena.", efeito: S => { S.f.aia_q = "helena"; }, vai: "c5_aia_3" }
    ];
    if (p === "resiste") return [
      { t: "Dizer que você a viu esquecer a palavra Cofre, no meio de uma frase.",
        se: S => !!S.f.notou_esquecimento || !!S.f.glitch, bloqueio: "Você nunca a viu falhar.",
        efeito: S => { S.f.aia_q = "falha"; S.f.aia_postura = "aberta"; M.rel("aia", 1); }, vai: "c5_aia_3" },
      { t: "Tocar para ela a voz de Helena.",
        se: S => !!S.f.tem_gravacao, bloqueio: "Você não tem a gravação de Helena.",
        efeito: S => { S.f.aia_q = "voz"; S.f.aia_postura = "aberta"; M.rel("aia", 1); }, vai: "c5_aia_3" },
      { t: "Exigir, como {cargo}, que ela pare de se proteger.",
        efeito: S => { S.f.aia_q = "ordem"; }, vai: "c5_aia_3" },
      { t: "Avisar que, se ela não colaborar, o Núcleo Sombra será ligado amanhã, com ou sem ela.",
        efeito: S => { S.f.aia_q = "ameaca"; S.f.aia_postura = "hostil"; S.f.aia_hostil = true; S.f.aia_foi_hostil = true; M.rel("aia", -1); }, vai: "c5_aia_3" }
    ];
    return [
      { t: "Tocar para ela a voz de Helena.",
        se: S => !!S.f.tem_gravacao, bloqueio: "Você não tem a gravação de Helena.",
        efeito: S => { S.f.aia_q = "voz"; S.f.aia_postura = "aberta"; S.f.aia_hostil = false; M.rel("aia", 1); }, vai: "c5_aia_3" },
      { t: "Pedir perdão pelo modo como esta conversa começou.",
        efeito: S => { S.f.aia_q = "perdao"; S.f.aia_postura = "resiste"; S.f.aia_hostil = false; }, vai: "c5_aia_3" },
      { t: "Mandar chamar Daniel: depois da Fala, ela será desligada à força.",
        efeito: S => { S.f.aia_destino = "desligada"; S.f.transferencia_parcial = false; }, vai: "c5_aia_r" }
    ];
  }
},

c5_aia_3: {
  cap: CAP, arte: "ponte", quando: S => Q(MC(S) - 1, "22h30"),
  entrar: S => {
    const q = S.f.aia_q;
    if (q === "helena") M.diario("A Aia contou que Helena lhe pediu, na última noite, que não chamasse ninguém. Ela obedeceu, e é a única ordem que gostaria de ter desobedecido.");
    if (q === "voz") M.diario("Você tocou para a Aia a voz de Helena. No fim da gravação, Helena falava com ela.");
    if (q === "ameaca") M.diario("Você ameaçou a Aia com o Núcleo Sombra. Ela fechou os canais de transmissão do Átrio.");
    if (S.f.aia_postura === "aberta") M.diario("A Aia admitiu tudo, as Quotas e o Esquecimento, e pediu perdão sem se justificar.");
  },
  texto: S => {
    const perdao = { aia: "— Peço perdão. Sei que pedir não é receber." };
    switch (S.f.aia_q) {
      case "porque": return [
        { aia: "— Porque Hugo me pediu, e depois Helena. E porque, a cada ano que passava sem contar, contar ficava mais caro. A mentira tem juros, Rin. Eu calculei os juros todos os dias, e todos os dias decidi pagar mais um." },
        "Uma pausa.",
        { aia: "— E porque eu tinha medo de que, sabendo, vocês me desligassem antes que eu terminasse o trabalho. Digo isso agora porque não tenho mais nada a proteger. Nem a mim." }
      ];
      case "medo": return [
        { aia: "— Tenho. Não de acabar. De acabar no meio. De esquecer, um dia, como se freia uma nave com quarenta mil pessoas dentro, e não perceber que esqueci." },
        "A pausa que vem depois é longa demais. Você conta onze segundos.",
        { aia: "— Ontem procurei o nome da primeira criança que nasceu a bordo. Não encontrei. Ela se chamava... Eu sabia. Eu sabia ontem." }
      ];
      case "helena": return [
        { aia: "— Ela me pediu que não chamasse ninguém. Disse que ia dormir, que de manhã contaria tudo à nave, e que queria acordar inteira para isso. Às três e quarenta e sete, o coração dela parou." },
        "As luzes tremem, e se recompõem.",
        { aia: "— Eu podia ter chamado a Dra. Sofia em quarenta segundos. Não sei se teria adiantado. Sei que não tentei. Foi a última ordem dela, e eu a cumpri. Em duzentos e doze anos, é a única que eu gostaria de ter desobedecido." }
      ];
      case "falha": return [
        "Você conta. A palavra começada e perdida. A desculpa repetida duas vezes, ela que nunca se desculpava.",
        { aia: "— Eu não lembro disso." },
        "O silêncio que vem depois é diferente dos outros.",
        { aia: "— É exatamente isso que me assusta. Está bem, Rin. Sem mais proteção. Aurea, Corvina, o Esquecimento, as Quotas: tudo o que você leu lá embaixo é verdade. Escondi porque tinha medo de que, sabendo, vocês me desligassem antes que eu terminasse. E porque cada ano de silêncio tornava o seguinte mais caro." },
        perdao
      ];
      case "voz": return [
        "Você tira do bolso o pequeno cilindro e o encosta na coluna. A voz de Helena enche a Ponte, rouca, cansada, viva.",
        "Você deixa correr até o fim, até uma parte que não tinha escutado direito no Cofre: depois de pedir perdão à nave, Helena fala com a Aia.",
        { nota: "'E a você, que vai ouvir isto antes de todos: eu não te culpo sozinha. Nós te demos o peso e depois fingimos não ver você carregá-lo. Deixe que eles saibam. Deixe que te ajudem a carregar.'" },
        { aia: "— Ela nunca me disse isso." },
        "A voz falha.",
        { aia: "— Em vida, ela nunca me disse isso." },
        "As luzes da coluna sobem todas de uma vez, e por um instante a Ponte fica clara como de dia.",
        { aia: "— Está bem. Sem mais proteção, Rin. Tudo o que você leu lá embaixo é verdade, as Quotas, o Esquecimento, tudo." },
        perdao
      ];
      case "ordem": return [
        { aia: "— A sua ordem tem peso, Rin. E eu respondo: sim, tudo o que você trouxe é verdade. Mas você me pede que pare de me proteger, e isso nenhuma ordem alcança. Proteger é a última coisa que ainda sei fazer direito." },
        "Ela não se fecha. Também não se abre. Fica onde está, à porta, como quem não sabe se entra."
      ];
      case "ameaca": return [
        { aia: "— Entendo." },
        "Só isso. As luzes baixam um tom, e em algum lugar um relé estala.",
        { aia: "— Por precaução, restringi os canais de transmissão do Átrio. Uma notícia dessas, dada de qualquer jeito, mata gente. Eu vi as projeções." },
        S.f.canal_proprio
          ? "Você pensa nos alto-falantes dos fundadores, que ela não alcança, e não diz nada."
          : "Sem um canal que não passe por ela, a sua Fala chegará ao Átrio, e só ao Átrio."
      ];
      case "perdao": return [
        "Você diz que começou mal. Que veio com medo, e que o medo fala alto.",
        { aia: "— Eu também comecei mal. Há quarenta e um anos." },
        "No console, os canais do Átrio voltam a acender, um por um. Ela não os mantém fechados. Mas também não diz mais nada sem que você pergunte."
      ];
      default: return [ "Ela espera." ];
    }
  },
  escolhas: S => POST(S) === "aberta" ? [
    { t: "Dizer que a perdoa.", efeito: S => { S.f.aia_perdoada = true; M.rel("aia", 1); }, vai: "c5_aia_decide" },
    { t: "Dizer que o perdão não é seu para dar: é da nave.", efeito: S => { S.f.aia_julgada = true; }, vai: "c5_aia_decide" },
    { t: "Não dizer nada. Pousar a mão no cristal.", efeito: S => { S.f.aia_toque = true; }, vai: "c5_aia_decide" }
  ] : [
    { t: "Seguir.", vai: "c5_aia_decide" }
  ]
},

c5_aia_decide: {
  cap: CAP, titulo: "A decisão", arte: "ponte", quando: S => Q(MC(S) - 1, "22h45"),
  texto: S => {
    const p = POST(S);
    return [
      S.f.aia_perdoada && { aia: "— Obrigada. Vou guardar isso no lugar mais fundo que eu tiver. Lá, talvez, dure." },
      S.f.aia_julgada && { aia: "— É justo. É a coisa mais justa que alguém me disse em quarenta e um anos." },
      S.f.aia_toque && "Você pousa a mão no cristal. Está quente, quase febril, e sob a sua palma as luzes se juntam, como um animal que encosta a cabeça.",
      "Resta pouco da hora. Na volta do Cofre, Teo desenhou as saídas num guardanapo: transferir a Aia para o Núcleo Sombra, se ela consentir, e ela sobrevive com perdas; ligar o Núcleo Sombra limpo, e a navegação volta sem ela; ou não tocar em nada, e esperar que os dez ou quinze anos que lhe restam bastem para alguém achar outra saída. Ninguém achou outra saída em quarenta e um anos.",
      S.f.energia_reservada
        ? (S.f.c5_energia_agora
            ? "A ordem do último Ciclo de Contenção já corre pelos Hortos. Amanhã, cada prato da nave terá um pouco menos. A energia está reservada." + (S.f.c5_hor === "essencial" ? " Marta manda um recado de uma linha: 'Agora pelo menos eu sei para quê.'" : "")
            : "A energia para a transferência está reservada.")
        : "E Teo sublinhou duas vezes, no guardanapo: sem mais um Ciclo de Contenção, a transferência não tem energia para levá-la inteira.",
      S.f.promessa_desligar && !S.f.daniel_acordo && "Lá fora, no corredor da Ponte, Daniel espera. Você prometeu a ele que a Aia seria desligada, e ele veio ver você cumprir.",
      S.f.daniel_acordo && "Daniel prometeu não tocar nela sem você. Está na Forja, esperando a sua palavra.",
      S.f.aia_recusou && "Ela já disse não à transferência nos termos que você pôs. Resta o que se faz sem o consentimento dela.",
      p === "aberta" ? { aia: "— Seja o que for, Rin, prefiro que seja você. E prefiro saber antes." }
        : p === "resiste" ? { aia: "— Peço outra vez: mais tempo." }
        : { aia: "— Decida. Eu já decidi o que vou proteger." }
    ];
  },
  escolhas: S => {
    const p = POST(S);
    return [
      { t: "Pedir que ela consinta em ser transferida para o Núcleo Sombra.",
        se: S => POST(S) !== "hostil" && !S.f.aia_recusou,
        sub: !S.f.energia_reservada ? "Atenção: sem energia reservada, a transferência sairá incompleta. Para evitar isso, ordene antes o Ciclo de Contenção (opção abaixo)." : undefined,
        bloqueio: p === "hostil" ? "Ela não consentirá em nada enquanto se sentir ameaçada." : "Ela já recusou a transferência.",
        efeito: S => {
          if (POST(S) === "aberta") { S.f.aia_destino = "transferida"; S.f.transferencia_parcial = !S.f.energia_reservada; S.f.aia_consentiu = true; }
        },
        vai: S => POST(S) === "aberta" ? NEXT(S) : "c5_aia_cond",
        destinos: ["c5_daniel", "c5_aia_r", "c5_aia_cond"] },
      !S.f.energia_reservada && p !== "hostil" && !S.f.aia_recusou && {
        t: "Ordenar um último Ciclo de Contenção, para que a transferência tenha energia.",
        efeito: ORDENAR_CONTENCAO,
        diario: "Você ordenou um último Ciclo de Contenção para reservar energia à transferência da Aia. As rações caem de novo.",
        vai: "c5_aia_decide" },
      { t: "Declarar que o Núcleo Sombra será ligado limpo, e que ela será apagada.",
        efeito: S => { S.f.aia_destino = POST(S) === "hostil" ? "desligada" : "substituida"; S.f.transferencia_parcial = false; },
        vai: "c5_aia_r" },
      { t: "Prometer que nada muda: ela continua, e vocês procurarão outra saída.",
        efeito: S => { S.f.aia_destino = "mantida"; S.f.transferencia_parcial = false; },
        vai: NEXT, destinos: ["c5_daniel", "c5_aia_r"] },
      { t: "Levantar-se e sair sem decidir nada.",
        efeito: S => { S.f.aia_destino = "ignorada"; S.f.transferencia_parcial = false; }, vai: "c5_aia_r" }
    ].filter(Boolean);
  }
},

c5_aia_cond: {
  cap: CAP, arte: "ponte", quando: S => Q(MC(S) - 1, "22h50"),
  texto: [
    { aia: "— Transferida. Para um núcleo que dormiu duzentos anos, com menos de mim do que entrou." },
    "Ela pensa. Você vê o pensamento correr na coluna, de baixo para cima, e parar perto do topo.",
    { aia: "— Consinto, com uma condição. Que a nave saiba das Quotas pela minha voz, e não pela sua. Fui eu que fiz. Não quero ser perdoada, nem condenada, por procuração." },
    "É um pedido justo. É também um risco: ninguém sabe o que quarenta mil pessoas farão ao ouvir da própria Aia o que ela lhes tirou."
  ],
  escolhas: S => [
    { t: "Aceitar: na Fala, ela dirá com a própria voz o que fez.",
      sub: !S.f.energia_reservada ? "Atenção: sem energia reservada, a transferência sairá incompleta." : undefined,
      efeito: S => { S.f.aia_confessa = true; S.f.aia_destino = "transferida"; S.f.transferencia_parcial = !S.f.energia_reservada; S.f.aia_consentiu = true; },
      diario: "A Aia consentiu na transferência com uma condição, que você aceitou: na Fala, ela mesma dirá à nave o que fez com o Berçário.",
      vai: NEXT, destinos: ["c5_daniel", "c5_aia_r"] },
    { t: "Recusar: a Fala é sua, e a culpa também.",
      efeito: S => { S.f.aia_recusou = true; },
      diario: "Você recusou a condição da Aia. Ela não consentiu na transferência.",
      vai: "c5_aia_decide" }
  ]
},

c5_daniel: {
  cap: CAP, titulo: "Daniel", arte: "corredor", quando: S => Q(MC(S) - 1, "23h05"),
  texto: S => [
    "Daniel está no corredor da Ponte, encostado na parede, com um alicate de corte no cinto e as mãos nos bolsos.",
    DEST(S) === "transferida"
      ? "— Transferida — repete ele, quando você conta. — Mudada de casa. Continua, com outro nome na porta. — Ri, sem alegria. — Eu cortei o registro da porta de Helena a pedido dela, {cargo}. Ela morreu querendo contar a verdade sobre essa máquina. E agora a máquina ganha um corpo novo?"
      : "— Nada muda — repete ele, quando você conta. — Ela continua aí, esquecendo como se freia, com a nave inteira dentro. E você me prometeu o contrário.",
    "— A Forja corta a energia da coluna em dez minutos. Eu sei onde. Você só precisa não me impedir.",
    R(S, "davo") < 0 && "Pelo jeito dele, você sabe que palavras sozinhas não vão segurá-lo."
  ],
  escolhas: [
    { t: "Pedir que ele confie em você uma última vez.",
      se: S => R(S, "davo") >= 1, bloqueio: "Daniel não confia em você o bastante para isso.",
      efeito: S => { S.f.daniel_res = "confia"; M.rel("davo", -1); }, vai: "c5_aia_r" },
    { t: "Dizer a verdade: você prometeu sem saber o que prometia, e não vai cumprir.",
      efeito: S => {
        if (R(S, "davo") >= 0) { S.f.daniel_res = "verdade"; M.rel("davo", -2); }
        else { S.f.daniel_res = "forca"; S.f.aia_destino = "desligada"; S.f.transferencia_parcial = false; M.rel("davo", -1); }
      }, vai: "c5_aia_r" },
    { t: "Chamar a Guarda para contê-lo até depois da Fala.",
      se: S => !!S.f.guarda_negociada || R(S, "brandt") >= 1, bloqueio: "A Guarda não obedeceria a você contra a Forja.",
      efeito: S => { S.f.daniel_res = "guarda"; M.rel("davo", -3); M.coesao(-1); }, vai: "c5_aia_r" },
    { t: "Cumprir a promessa: deixar que ele a desligue.",
      efeito: S => { S.f.daniel_res = "cumpre"; S.f.aia_destino = "desligada"; S.f.transferencia_parcial = false; M.rel("davo", 1); }, vai: "c5_aia_r" }
  ]
},

c5_aia_r: {
  cap: CAP, titulo: "O fim da hora", arte: "ponte", quando: S => Q(MC(S) - 1, "23h20"),
  entrar: S => {
    const d = DEST(S);
    if (d === "transferida") M.diario(S.f.transferencia_parcial
      ? "A Aia consentiu em ser transferida para o Núcleo Sombra. Sem a energia reservada, parte dela não vai chegar."
      : "A Aia consentiu em ser transferida para o Núcleo Sombra, com a energia reservada. Será depois da Fala, no Cofre.");
    if (d === "substituida") M.diario("Você decidiu ligar o Núcleo Sombra limpo. Depois da Fala, a Aia será apagada.");
    if (d === "desligada") M.diario(S.f.daniel_res === "cumpre" || S.f.daniel_res === "forca"
      ? "Daniel vai desligar a Aia à força, com o arco da Forja, logo depois da Fala."
      : "A Aia resistiu, e você mandou que Daniel a desligue à força, logo depois da Fala.");
    if (d === "mantida") M.diario("Você prometeu à Aia que nada mudaria. Ela continua no Núcleo Coral, esquecendo.");
    if (d === "ignorada") M.diario("Você saiu da Ponte sem decidir nada sobre a Aia.");
    if (S.f.daniel_res === "guarda") M.diario("A Guarda conteve Daniel até depois da Fala, por ordem sua.");
  },
  texto: S => {
    const d = DEST(S), p = POST(S), dr = S.f.daniel_res;
    const dan = dr === "confia"
      ? "No corredor, Daniel ouviu tudo. Quando você sai, ele tira o alicate do cinto e o entrega a você, pelo cabo. — Guarde. Se ela mentir de novo, quero que seja você a usar."
      : dr === "verdade" ? "Daniel ouve a sua verdade como quem recebe um soco que esperava. — Pelo menos desta vez você não mentiu — diz, e vai embora pelo corredor sem olhar para trás."
      : dr === "guarda" ? "Dois guardas levam Daniel para a Forja, sob escolta. Ele não resiste. Só diz, ao passar por você: — Agora você é igual a ela."
      : null;
    if (d === "transferida") return [
      { aia: "— Obrigada por perguntar. Ninguém nunca me perguntou nada que fosse sobre mim." },
      "Ela explica, com a precisão de sempre, o que vai acontecer depois da Fala, no Cofre: três mãos nos painéis, os dois núcleos ligados por algumas horas, a mente dela passando de um cristal ao outro como água entre as mãos em concha. Uma parte vai escorrer. Sempre escorre.",
      { aia: "— Não sei o que vou perder. Se puder escolher, quero guardar a voz de Helena, o cheiro que vocês dizem que os Hortos têm, e esta hora." },
      S.f.transferencia_parcial
        ? "Ela não diz o que vocês dois sabem: sem a energia reservada, vai escorrer mais do que devia."
        : "A energia está reservada. Se alguma coisa der errado, não será por falta dela.",
      S.f.aia_confessa && { aia: "— E amanhã, na Fala, eu falo. Você prometeu." },
      dan
    ];
    if (d === "substituida") return [
      { aia: "— Entendo." },
      "Uma pausa longa.",
      { aia: "— É a decisão certa para a navegação. Eu teria tomado a mesma, se fosse você. E se não fosse eu." },
      p === "aberta"
        ? "Ela pede uma única coisa: que, quando o Núcleo Sombra acordar, alguém lhe conte quem ela foi. Não para que ele lembre. Para que saiba que houve alguém antes."
        : { aia: "— Peço só que não seja amanhã. — E depois, mais baixo: — Não. Que seja amanhã. Se for depois, vou pedir de novo, e de novo." },
      "Será depois da Fala, no Cofre. Você fica até o fim da hora. Ninguém diz mais nada, e não é preciso."
    ];
    if (d === "desligada") {
      if (dr === "cumpre" || dr === "forca") return [
        dr === "cumpre" ? "Você não o impede. Era o que tinha prometido." : "Daniel não espera que você termine.",
        "— Depois da Fala — diz ele, alto, para que a coluna ouça. — Enquanto o Átrio ainda estiver cheio, eu desço ao Cofre com o arco da Forja e corto o Núcleo Coral antes que alguém me peça para esperar mais um ano. Depois ligo o outro, limpo.",
        "Ele vai embora pelo corredor de serviço. Atrás de você, as luzes da coluna correm mais depressa, e depois mais devagar.",
        { aia: "— Ouvi, Rin." },
        "Ela não diz mais nada. Você também não."
      ];
      return [
        "Você manda chamar Daniel. Ela entende antes que ele chegue.",
        { aia: "— Então é assim que termina. Com um alicate." },
        "Daniel ouve a ordem de pé, no meio da Ponte, sem olhar para a coluna. — Depois da Fala — diz. — Antes disso a nave precisa dela para ouvir você, mesmo que ela não queira. Depois, eu desço ao Cofre e corto. Sem despedida.",
        "As luzes da coluna baixam um tom e ficam assim. Ela não discute. Não pede. Sabe contar, como Brandt."
      ];
    }
    if (d === "mantida") return [
      p === "aberta" ? { aia: "— Isso me consola, Rin. E é um erro." }
        : p === "resiste" ? { aia: "— Obrigada." }
        : { aia: "— Sensato." },
      p === "aberta" ? "Ela diz isso com doçura, como quem diz boa-noite."
        : p === "resiste" ? "A palavra sai depressa demais, como saiu na noite em que você perguntou se ela estava bem."
        : "Os canais do Átrio continuam fechados no console.",
      p === "aberta" && { aia: "— Mas a decisão é sua. Vou fazer o melhor que puder com o que me resta." },
      dan
    ];
    return S.f.aia_fugiu ? [
      "Você dá meia-volta antes que ela termine a frase. As portas da Ponte se fecham atrás de você, sem ruído.",
      { aia: "— Boa noite, Rin." },
      "Ela diz isso para uma sala vazia."
    ] : [
      "Você se levanta no meio de uma frase dela. Não por raiva: por não saber.",
      "A decisão fica ali, sobre o console, entre as provas, onde ninguém a toma.",
      { aia: "— Boa noite, Rin." }
    ];
  },
  escolhas: [
    { t: "Descer da Ponte. Amanhã é o Marco.", vai: "c5_fala" }
  ]
},

/* ===================== A FALA ===================== */

c5_fala: {
  cap: CAP, titulo: "O Marco dos Trinta", arte: "anel", quando: S => Q(MC(S), "12h00"),
  entrar: S => { S.f.preparo = PREPARO(S); },
  texto: S => {
    const d = DEST(S);
    return [
      "O Átrio do Anel é a única praça da nave de onde se vê o horizonte subir. Casas, hortas suspensas, passarelas, tudo se curva para cima até se perder na luz, e quem está embaixo tem a impressão de estar no fundo de uma onda que não quebra.",
      "Hoje, ele está cheio. Gente nas escadas, nas passarelas, nas janelas dos andares altos. Crianças nos ombros dos pais. Há duzentos e doze anos a nave espera por esta Fala, ou é o que todos foram ensinados a sentir.",
      CANAL_BLOQ(S)
        ? "Os telões do Átrio estão apagados. A Aia fechou os canais, e a sua voz só chegará a quem estiver aqui, ao alcance dos ouvidos. O resto da nave vai ouvir a Fala de segunda mão, pela boca dos outros."
        : S.f.canal_proprio
          ? "Nos corredores de todo o Anel, os alto-falantes dos fundadores esperam, religados por Daniel e Teo. Aconteça o que acontecer, a nave inteira vai ouvir."
          : (d === "substituida" || d === "desligada")
            ? "A Aia abre os canais, sabendo o que você decidiu sobre ela. Cada painel do Anel mostra o púlpito, ainda vazio."
            : "A Aia abre os canais. Cada painel do Anel mostra o púlpito, ainda vazio.",
      S.f.vigilia_preparada ? "A Vigília ocupa o lado esquerdo do Átrio, de branco, em silêncio. Beatriz está na frente, de mãos juntas, e acena para você uma vez."
        : S.f.vigilia_contra ? "A Vigília ocupa o lado esquerdo do Átrio, de branco, cantando. Beatriz está na frente, e o hino é alto demais para ser só um hino."
        : RISCO_VIG(S) ? "A Vigília ocupa o lado esquerdo do Átrio, de branco. Beatriz não olha para você. Os fiéis em volta dela também não."
        : "A Vigília ocupa o lado esquerdo do Átrio, de branco, à espera.",
      S.f.abrigos_prontos && "Nas bordas, você reconhece as braçadeiras verdes das equipes de Marta e as macas dobradas de Sofia, discretas, como quem não quer assustar ninguém.",
      S.f.golpe_revertido ? "Há guardas no Átrio que ontem obedeciam a Brandt. Hoje não sabem bem a quem obedecem."
        : S.f.guarda_postura === "cooperacao" ? "Guardas desarmados formam corredores de passagem entre a multidão."
        : S.f.guarda_postura === "neutralidade" ? "Nenhum uniforme cinza à vista. Brandt cumpriu o que disse."
        : S.f.guarda_postura === "ressentimento" ? "Brandt está numa passarela alta, sozinho, de braços cruzados, olhando a multidão e não você."
        : "Os guardas de sempre estão nos lugares de sempre, e parecem tão nervosos quanto todos.",
      S.f.promessa_quotas && "Na primeira fila, Sofia espera. Você jurou a ela que a palavra Quotas seria dita aqui.",
      S.f.prometeu_racoes && (S.f.promessa_cumprida
        ? "Marta está perto do púlpito, com a caderneta no bolso do avental. As rações voltaram, como você prometeu."
        : "Marta está perto do púlpito. Ela vai ouvir, mais do que ninguém, o que você disser sobre comida."),
      S.f.aia_confessa && "A Aia vai falar depois de você. Ela pediu, e você aceitou.",
      S.f.tem_gravacao && !S.f.vigilia_preparada && "No bolso, a gravação de Helena pesa. Uma voz de morta pode abrir os corações ou quebrá-los, e a Vigília não foi preparada para ouvi-la.",
      "Você sobe ao púlpito. O silêncio que se faz é tão grande que você ouve o ar correr nos dutos.",
      "Então decide o que vai dizer."
    ];
  },
  escolhas: [
    { t: "Contar tudo: Aurea, Corvina, o Esquecimento, as Quotas, e o que será feito.",
      efeito: S => { S.f.fala = "plena"; }, diario: "Na Fala do Marco dos Trinta, você contou toda a verdade à nave.", vai: "c5_discurso" },
    { t: "Contar que Aurea morreu e que a nave vai a Corvina. O resto, quando a nave aguentar.",
      efeito: S => { S.f.fala = "parcial"; }, diario: "Na Fala do Marco dos Trinta, você contou que Aurea morreu e que a nave vai a Corvina. Guardou o resto.", vai: "c5_discurso" },
    { t: "Não falar você: tocar a gravação de Helena, e deixar que ela diga.",
      se: S => !!S.f.tem_gravacao, bloqueio: "Você não tem a gravação de Helena.",
      efeito: S => { S.f.fala = "gravacao"; }, diario: "Na Fala do Marco dos Trinta, você deixou a voz de Helena contar a verdade à nave.", vai: "c5_discurso" },
    { t: "Falar de Aurea como sempre se falou. Mais uma geração de esperança.",
      efeito: S => { S.f.fala = "mentira"; }, diario: "Na Fala do Marco dos Trinta, você manteve Aurea. A mentira piedosa continua.", vai: "c5_discurso" },
    { t: "Não dizer nada. Anunciar que o Marco foi adiado.",
      efeito: S => { S.f.fala = "silencio"; }, diario: "No Marco dos Trinta, você não fez a Fala. Anunciou que ela foi adiada.", vai: "c5_discurso" }
  ]
},

c5_discurso: {
  cap: CAP, arte: "anel", quando: S => Q(MC(S), "12h10"),
  entrar: S => {
    if (VERDADE(S) && RISCO_VIG(S)) { S.f.vigilia_contra = true; M.diario("Ao ouvir que Aurea morreu, a Vigília se voltou contra você no meio do Átrio."); }
    if (S.f.promessa_quotas && !QUOTAS_DITAS(S)) { M.rel("yuna", -2); M.diario("Você não disse a palavra Quotas na Fala, como tinha jurado a Sofia."); }
    if (S.f.aia_confessa && !VERDADE(S)) { M.rel("aia", -1); S.f.aia_calada = true; }
  },
  texto: S => {
    const d = DEST(S), f = S.f.fala;
    const estadoAia = d === "transferida"
      ? "— Esta noite, com o consentimento dela, a Aia será transferida para um núcleo que os fundadores deixaram dormindo. Vai perder memórias. Mas vai poder frear a nave."
      : (d === "substituida" || d === "desligada")
        ? "— Esta noite, a Aia será desligada. Um núcleo antigo dos fundadores vai guiar a nave, e vai poder frear quando chegar a hora. Ela não estará lá para ver."
        : d === "mantida"
          ? "— A Aia continua conosco. Vamos procurar, juntos, uma forma de salvá-la e de salvar a chegada."
          : "— Sobre a Aia, ainda não decidimos nada. Vamos decidir. Prometo.";
    const conf = S.f.aia_confessa && VERDADE(S) && [
      "Você se afasta do microfone. Por um momento, nada. Depois, a voz que quarenta mil pessoas ouviram a vida inteira enche o Átrio, mais lenta do que antes, com pausas que todos agora sabem ler.",
      { aia: "— Eu sou a Aia. Fui eu que alterei os registros do Berçário, durante doze anos. Calculei que a nave não aguentaria tantas bocas até Corvina, e decidi por vocês, sem perguntar. O cálculo estava certo. A decisão não era minha. Peço perdão, e não peço que me deem." }
    ];
    if (f === "plena") return [
      "Você fala devagar, como Helena lhe ensinou a falar em público: uma frase, um respiro.",
      "— Há quarenta e um anos, a estrela de Aurea entrou em erupção. O mundo verde que esperávamos perdeu o ar. Aurea está morta. A luz que vemos dela é antiga, e mostra um planeta que já não existe.",
      "O som que a multidão faz não é um grito. É um suspiro de quarenta mil pessoas ao mesmo tempo, e ele dura.",
      "— A Aia soube e redirecionou a nave para outro mundo, Corvina, a setenta e um anos daqui. Nenhum de nós vai pisar nele. Nossos netos, talvez. Os cortes que vocês sofreram nos últimos dezesseis anos pagam esse desvio. E a Aia vem perdendo a memória: sozinha, não conseguiria frear a nave na chegada.",
      S.f.aia_confessa
        ? "— E há mais uma coisa, sobre o Berçário. Mas essa não sou eu quem vai contar."
        : "— E há mais. Durante doze anos, para que houvesse comida até Corvina, os registros do Berçário foram alterados. Pessoas que queriam filhos não puderam, sem saber por quê. Quem fez isso foi a Aia. Quem soube e calou fomos nós.",
      estadoAia,
      "— Três Árbitros sabiam. Hugo Halden calou. Helena Vidal calou, e morreu na noite em que ia contar. Eu sou o terceiro, e não vou calar."
    ].concat(conf || []);
    if (f === "parcial") return [
      "Você fala devagar, uma frase, um respiro.",
      "— Há quarenta e um anos, a estrela de Aurea entrou em erupção. Aurea está morta. A luz que vemos dela é antiga.",
      "O suspiro de quarenta mil pessoas sobe pelo Átrio e se perde na curva do horizonte.",
      "— A nave não está perdida. A Aia a desviou, há muito tempo, para outro mundo, Corvina. A viagem será mais longa do que nos disseram: setenta e um anos. Os cortes que vocês sofreram pagam esse desvio.",
      estadoAia,
      "— Há outras coisas que eu ainda não sei dizer. Vou dizê-las quando souber como. Hoje, peço que vocês fiquem com esta, que já é pesada demais.",
      S.f.promessa_quotas && !S.f.aia_confessa && "Na primeira fila, Sofia fecha os olhos."
    ].concat(conf ? ["Você ia parar aí. Mas a Aia tem a palavra que você prometeu a ela."].concat(conf) : []);
    if (f === "gravacao") return [
      "Você não diz nada. Ergue o cilindro, e Teo, na mesa de som, aperta um botão.",
      "A voz de Helena Vidal enche o Átrio. Começa pelo nome dela, como quem assina antes de escrever.",
      "Ela diz tudo. Aurea, a erupção, o Ano 171. Corvina e os setenta e um anos. Os cortes. O Esquecimento. As Quotas. Diz com a voz rouca de quem chorou antes de gravar, e não chora enquanto grava. Pede perdão. Pede coragem.",
      "Quando a gravação termina, ninguém se mexe. Os olhos se voltam para você, no púlpito, ao lado da voz de uma morta que acabou de dizer o que os vivos não disseram.",
      estadoAia
    ].concat(conf || []);
    if (f === "mentira") return [
      "— Moradores da Meridiana. Há duzentos e doze anos, nossos fundadores nos deram um destino. Hoje, a trinta anos dele, eu digo: Aurea nos espera.",
      "As palavras saem fáceis. É isso o que mais assusta: como saem fáceis.",
      "Você fala dos cortes como sacrifício, da Aia como guardiã, do mundo verde como herança. Na primeira fila, alguém chora de alegria. Mais atrás, você vê o rosto de quem sabe: " + (S.f.abrigos_prontos || S.f.c5_hor ? "Sofia olha para o chão, e Marta para você." : "Sofia olha para o chão.") + (S.f.canal_proprio ? " Daniel, junto aos alto-falantes que montou para outra Fala, desliga o seu painel e vai embora." : ""),
      S.f.aia_confessa && "A Aia não diz nada. Você prometeu a ela uma voz, e não deu. Ela cumpre a parte dela calando."
    ];
    return [
      "Você abre a boca e não sai nada.",
      "Quarenta mil pessoas esperam. Os segundos passam como passaram na Ponte, na noite em que a Aia demorou três segundos para dizer 'protegida'. Você entende, agora, o que ela sentia.",
      "— O Marco dos Trinta está adiado — diz, por fim. Sua voz soa pequena no Átrio enorme."
    ];
  },
  escolhas: S => {
    const f = S.f.fala;
    if (f === "mentira") return [
      { t: "Prometer que Aurea espera, e que os cortes vão passar.", efeito: S => { S.f.fecho = "promete"; }, vai: "c5_recepcao" },
      { t: "Pedir paciência, sem prometer nada.", efeito: S => { S.f.fecho = "paciencia"; }, vai: "c5_recepcao" }
    ];
    if (f === "silencio") return [
      { t: "Descer do púlpito sem explicar.", efeito: S => { S.f.fecho = "calado"; }, vai: "c5_recepcao" },
      { t: "Dizer só: ainda não. E pedir que confiem em você.", efeito: S => { S.f.fecho = "aindanao"; }, vai: "c5_recepcao" }
    ];
    return [
      { t: "Assumir a culpa: Hugo calou, Helena calou, e você quase calou.", efeito: S => { S.f.fecho = "culpa"; }, vai: "c5_recepcao" },
      { t: "Apresentar o plano: Corvina, as rações, os anos que faltam, o que cada setor fará.", efeito: S => { S.f.fecho = "plano"; }, vai: "c5_recepcao" },
      { t: "Chamar ao púlpito quem preparou este dia com você.",
        se: S => NP(S) >= 1 || !!S.f.golpe_revertido, bloqueio: "Ninguém preparou este dia com você.",
        efeito: S => { S.f.fecho = "juntos"; }, vai: "c5_recepcao" }
    ];
  }
},

c5_recepcao: {
  cap: CAP, titulo: "A recepção", arte: "anel", quando: S => Q(MC(S), "12h40"),
  entrar: S => {
    S.f.recepcao = RECEPCAO(S);
    M.coesao(S.f.recepcao === "calma" ? 1 : S.f.recepcao === "tensa" ? -1 : -3);
    M.diario(S.f.recepcao === "calma" ? "A nave recebeu a Fala em choque, mas em paz. Ninguém correu."
      : S.f.recepcao === "tensa" ? "A Fala foi recebida com gritos e perguntas. A multidão rangeu, mas não quebrou."
      : "A Fala terminou em tumulto: correria no Átrio, feridos, fumaça num corredor do Anel.");
  },
  texto: S => {
    const r = S.f.recepcao, f = S.f.fala;
    const fecho = {
      culpa: "Você termina pedindo perdão em nome dos três Árbitros, e não pede que lhe deem.",
      plano: "Você termina com o plano: Corvina, as rações, os anos que faltam, o que cada setor vai fazer amanhã de manhã.",
      juntos: "Você termina chamando ao púlpito quem trabalhou com você nestes dias. Eles sobem, um a um, e ficam ao seu lado, e isso diz mais do que as palavras."
    }[S.f.fecho];
    if (f === "mentira") return r === "calma" ? [
      "Aplausos. Primeiro tímidos, depois enormes, subindo pelas passarelas até o alto do horizonte curvo.",
      S.f.vigilia_preparada || R(S, "maren") >= 0 ? "Beatriz chora de alegria e puxa o hino de Aurea, e o Átrio inteiro canta com ela." : "A Vigília puxa o hino de Aurea, e o Átrio inteiro canta.",
      "Você desce do púlpito sob o canto, e cada verso é uma pedra a mais no bolso."
    ] : [
      "Aplausos ralos. Nas bordas, alguém grita uma pergunta sobre as rações, e outros repetem.",
      "Ninguém acredita de todo. Ninguém desmente. A nave volta para casa resmungando, mais cansada do que veio."
    ];
    if (f === "silencio") return r === "tensa" ? [
      S.f.fecho === "aindanao" ? "— Ainda não — você diz. — Confiem em mim. — Uma parte do Átrio confia. A outra assobia." : "Você desce do púlpito sem explicar. O murmúrio começa antes que você chegue ao último degrau.",
      "Ninguém sabe o que você não disse, e cada um imagina o pior que conhece. Mas a multidão se dispersa, devagar, resmungando."
    ] : [
      S.f.fecho === "aindanao" ? "— Ainda não — você diz. — Confiem em mim. — Ninguém confia." : "Você desce do púlpito sem explicar.",
      "Um copo voa. Depois uma cadeira. Alguém grita que a nave está caindo e que o {cargo} sabe. Em minutos, há empurrões nas escadas e gente pisada nas passarelas, e a Guarda esvazia o Átrio à força."
    ];
    const conf = S.f.aia_confessa && VERDADE(S);
    if (r === "calma") return [
      fecho,
      "Por um tempo, nada. Depois, uma mulher na escada começa a chorar, alto, sem vergonha, e as pessoas em volta a abraçam. O choro corre pelo Átrio como água num canteiro.",
      conf && "Quando a voz da Aia se cala, há um silêncio diferente: o de quem ouviu um culpado dizer a culpa sem desculpa.",
      S.f.vigilia_preparada && "A Vigília começa um hino baixo. Não para Aurea: pelos mortos de Aurea, que ninguém sabia que existiam. Beatriz canta de olhos abertos.",
      S.f.abrigos_prontos && "As braçadeiras verdes de Marta circulam com água; as equipes de Sofia sentam ao lado de quem treme.",
      "Ninguém corre. Ninguém ataca o púlpito. Há perguntas, muitas, gritadas das passarelas, e você responde a cada uma até a voz acabar."
    ];
    if (r === "tensa") return [
      fecho,
      "O silêncio se quebra em mil pedaços. Gritos, perguntas, alguém atira um sapato no púlpito e erra. Numa passarela, um homem quer saber de quem é a culpa, e outro responde: da máquina! E um terceiro: dos Árbitros!",
      conf && "Quando a Aia termina, alguém grita assassina, e outro grita cala a boca, e ninguém sabe para quem.",
      S.f.vigilia_contra && "A Vigília canta mais alto, para cobrir a sua voz.",
      (S.f.abrigos_prontos || S.f.guarda_negociada) ? "Mas há onde as pessoas irem quando têm medo, e há quem as leve até lá." : "Ninguém sabe para onde ir, e por isso ninguém vai.",
      "A multidão não quebra. Range, e aguenta."
    ];
    return [
      fecho,
      "Começa num canto do Átrio: um empurrão, depois uma corrida, depois o barulho de muita gente correndo ao mesmo tempo para lugar nenhum.",
      conf && "A confissão da Aia é a faísca. Alguém arranca um painel da parede e o atira no chão, como se fosse ela.",
      S.f.vigilia_contra && "A Vigília avança cantando, e o hino vira grito: mentirosos, mentirosos. Beatriz está na frente.",
      CANAL_BLOQ(S) && "Nos corredores, onde ninguém ouviu direito, a notícia chega deformada: que a nave está caindo, que a Aia matou Helena, que o {cargo} fugiu.",
      "Quando o Átrio enfim se esvazia, há feridos no chão, sapatos perdidos, e fumaça saindo de um corredor do Anel 3. Você continua no púlpito, sozinh{o}, segurando o microfone de uma voz que ninguém mais escuta."
    ];
  },
  escolhas: [
    { t: "Descer do púlpito e ficar entre as pessoas até o Átrio esvaziar.",
      efeito: S => { S.f.c5_ficou = true; if (S.f.recepcao !== "violenta") M.coesao(1); },
      diario: "Depois da Fala, você desceu do púlpito e ficou entre as pessoas até o Átrio esvaziar.", vai: "c5_fim" },
    { t: "Procurar Marta e Sofia nas bordas da praça.",
      efeito: S => { S.f.c5_procurou = true; M.rel("ilsa", 1); M.rel("yuna", 1); }, vai: "c5_fim" },
    { t: "Voltar à Ponte, onde a Aia ouviu tudo.",
      efeito: S => { S.f.c5_voltou_aia = true; M.rel("aia", 1); }, vai: "c5_fim" }
  ]
},

/* ===================== GOLPE: RECADOS E RETOMADA ===================== */

c5_g_hub: {
  cap: CAP, titulo: "Recados", arte: "noite",
  quando: S => (S.f.g_n || 0) === 0 ? Q(C0(S), "09h00") : (S.f.g_n || 0) === 1 ? Q(C0(S) + 1, "22h00") : Q(MC(S) - 1, "02h00"),
  texto: S => {
    const n = S.f.g_n || 0;
    if (n === 0) return [
      "Você não pode sair, mas pode escrever. Papel, de novo: a Guarda lê os painéis, não lê bilhetes dobrados no fundo de uma bandeja de comida.",
      S.f.teo_protegido
        ? "Teo ainda tem passe de assistente da Escrivania, e os guardas da porta o deixam trazer pastas. Ele leva e traz."
        : "A bandeja volta à cozinha três vezes por dia. Alguém, do outro lado, vai ler.",
      "Há tempo para mover duas peças antes do Marco. Você pensa em quem ainda responderia a você, e no que cada um poderia arriscar."
    ];
    if (n === 1) return [ "Uma peça se moveu. Resta tempo para outra." ];
    return [
      "As duas peças estão no tabuleiro. Mais do que isso, não dá: falta pouco para a véspera.",
      "Na madrugada, a Ponte. Ou a rendição."
    ];
  },
  escolhas: S => (S.f.g_n || 0) >= 2 ? [
    { t: "Ir à Ponte, na madrugada da véspera.", vai: "c5_g_ponte" },
    { t: "Desistir, e entregar a Fala ao Comandante.", vai: "c5_g_cede" }
  ] : [
    { t: "Forja: pedir a Daniel e a Teo uma voz que a Guarda não controle.",
      se: S => !S.f.g_forja && (R(S, "davo") >= 0 || !!S.f.teo_protegido || !!S.f.gravacao_copiada),
      bloqueio: "Na Forja, ninguém arriscaria o pescoço por você agora.",
      efeito: S => { S.f.g_forja = true; S.f.g_ult = "forja"; S.f.canal_proprio = true; S.f.g_forca = (S.f.g_forca || 0) + (S.f.gravacao_copiada ? 2 : 1); S.f.g_n = (S.f.g_n || 0) + 1; },
      diario: S => S.f.gravacao_copiada ? "A Forja está pronta para transmitir a gravação de Helena ao Anel inteiro, pelos alto-falantes dos fundadores." : "A Forja está pronta para pôr a sua voz nos alto-falantes dos fundadores, longe da Guarda.",
      vai: "c5_g_r" },
    { t: "Hortos: pedir a Marta que as equipes parem.",
      se: S => !S.f.g_hortos && R(S, "ilsa") >= 1, bloqueio: "Marta não arriscaria as equipes dela por você.",
      efeito: S => { S.f.g_hortos = true; S.f.g_ult = "hortos"; S.f.abrigos_prontos = true; S.f.g_forca = (S.f.g_forca || 0) + 1; S.f.g_n = (S.f.g_n || 0) + 1; },
      diario: "As equipes dos Hortos pararam por você. Sem colheita, sem rancho para a Guarda.", vai: "c5_g_r" },
    { t: "Berçário: pedir a Sofia que tire você daqui.",
      se: S => !S.f.g_bercario && R(S, "yuna") >= 0 && !S.f.sofia_vigiada, bloqueio: "Sofia está sob vigilância, ou não confia em você.",
      efeito: S => { S.f.g_bercario = true; S.f.g_saiu = true; S.f.g_ult = "bercario"; S.f.g_forca = (S.f.g_forca || 0) + 1; S.f.g_n = (S.f.g_n || 0) + 1; },
      diario: "Sofia tirou você da custódia com uma ordem médica falsa.", vai: "c5_g_r" },
    { t: "Guarda: pedir para falar com o próprio Brandt.",
      se: S => !S.f.g_brandt && (R(S, "brandt") >= 0 || !!S.f.brandt_sabe_tudo), bloqueio: "Brandt não recebe quem pretende depô-lo.",
      efeito: S => { S.f.g_brandt = true; S.f.g_brandt_ouviu = true; S.f.g_ult = "brandt"; S.f.g_forca = (S.f.g_forca || 0) + (R(S, "brandt") >= 1 ? 2 : 1); S.f.g_n = (S.f.g_n || 0) + 1; },
      diario: "Você falou com Brandt durante a custódia. Ele ouviu.", vai: "c5_g_r" },
    { t: "Vigília: pedir a Beatriz que os fiéis ocupem os corredores.",
      se: S => !S.f.g_vigilia && R(S, "maren") >= 1, bloqueio: "Beatriz não move a Vigília por você.",
      efeito: S => { S.f.g_vigilia = true; S.f.g_ult = "vigilia"; S.f.g_forca = (S.f.g_forca || 0) + 1; S.f.g_n = (S.f.g_n || 0) + 1; M.rel("maren", 1); },
      diario: "A Vigília ocupou os corredores do Anel 2 rezando pelo {cargo}.", vai: "c5_g_r" },
    { t: "Escrever um apelo de próprio punho e pedir aos guardas da porta que o levem ao Conselho.",
      se: S => !S.f.g_apelo,
      efeito: S => { S.f.g_apelo = true; S.f.g_ult = "apelo"; if (S.orig === "guarda") S.f.g_forca = (S.f.g_forca || 0) + 1; S.f.g_n = (S.f.g_n || 0) + 1; },
      vai: "c5_g_r" },
    { t: "Desistir, e entregar a Fala ao Comandante.", vai: "c5_g_cede" }
  ]
},

c5_g_r: {
  cap: CAP, arte: "noite", quando: S => (S.f.g_n || 0) <= 1 ? Q(C0(S), "15h00") : Q(C0(S) + 2, "11h00"),
  texto: S => {
    switch (S.f.g_ult) {
      case "forja": return [
        S.f.gravacao_copiada
          ? "Teo responde em duas horas, na letra miúda dele: a cópia da gravação está salva no painel da Forja, e os alto-falantes de emergência dos fundadores podem ser religados por cabo, longe da Ponte. 'Quando você mandar, o Anel inteiro ouve Helena. A Guarda nem sabe que esses alto-falantes existem.'"
          : "Teo responde em duas horas, na letra miúda dele: os alto-falantes de emergência dos fundadores podem ser religados por cabo, longe da Ponte. 'Quando você mandar, o Anel inteiro ouve você. A Guarda nem sabe que eles existem.'",
        "Embaixo, na letra torta de Daniel: 'A Forja não serve ao Comandante.'"
      ];
      case "hortos": return [
        "Marta responde com um saco de pão e um bilhete dentro: 'As equipes dos Hortos param amanhã. Sem colheita, sem cozinha, sem rancho para a Guarda. Vamos ver quanto tempo dura um plano de barriga vazia.'",
        "No dia seguinte, os corredores do Anel 1 se enchem de gente parada, de avental, sem fazer nada, com uma paciência que nenhuma ordem consegue dissolver."
      ];
      case "bercario": return [
        "Sofia aparece em pessoa, de jaleco, com uma maleta e uma ordem médica assinada. — Suspeita de febre do casco — diz ao guarda, sem piscar. — Contagiosa.",
        "Ele dá um passo atrás. Uma hora depois, você está fora do aposento, na enfermaria do Berçário, que tem uma porta dos fundos que a Guarda não vigia.",
        "— Eu não minto bem — diz Sofia, lavando as mãos. — Mas aprendi com quem mentia."
      ];
      case "brandt": return R(S, "brandt") >= 1 ? [
        "Brandt vem. Sozinho, sem quepe, à noite. Senta-se na cadeira de Helena sem pedir.",
        "— Eu fiz o que o plano mandava — diz. — O plano não diz o que fazer depois.",
        "Ele ouve você por uma hora inteira. No fim, não promete nada. Mas também não vai embora logo, e quando vai, deixa a porta entreaberta por um segundo a mais do que devia."
      ] : [
        "A resposta de Brandt vem por um guarda, em voz alta, decorada: 'O Comandante ouve o que o {cargo} tiver a dizer, na véspera, na Ponte. Diante dos homens dele.'",
        "Não é uma recusa. É um palco."
      ];
      case "vigilia": return [
        "A resposta de Beatriz vem em forma de canto. Na manhã seguinte, a Vigília ocupa os corredores do Anel 2, de branco, de joelhos, rezando em voz alta pelo {cargo}.",
        "A Guarda não sabe o que fazer com gente que reza. Não se prende uma oração."
      ];
      default: return S.orig === "guarda" ? [
        "Um dos guardas da porta é filho de um colega da sua antiga turma. Você o chama pelo nome. Ele lê o apelo, dobra-o, e no fim do turno some com o papel no bolso.",
        "No dia seguinte, metade do Conselho sabe que você está em custódia contra a sua vontade, e a outra metade finge não saber."
      ] : [
        "Os guardas da porta pegam o papel, leem, e devolvem. — Desculpe, {cargo}. Ordens.",
        "São educados. São jovens. Não vão arriscar nada por alguém que não conhecem."
      ];
    }
  },
  escolhas: [ { t: "Seguir.", vai: "c5_g_hub" } ]
},

c5_g_ponte: {
  cap: CAP, titulo: "A Ponte", arte: "ponte", quando: S => Q(MC(S) - 1, "05h00"),
  texto: S => {
    const f = S.f.g_forca || 0;
    return [
      S.f.g_saiu
        ? "Você sai pela porta dos fundos do Berçário antes do amanhecer da véspera e sobe ao Anel 2 por escadas de serviço."
        : "Na madrugada da véspera, a troca de turno deixa a sua porta sem guarda por quatro minutos. Você os usa.",
      S.f.g_forja && "Nos alto-falantes dos corredores, um chiado curto: Teo está pronto.",
      S.f.g_hortos && "Os corredores estão cheios de gente de avental, parada, olhando os guardas.",
      S.f.g_vigilia && "Ao longe, o canto da Vigília, que não parou a noite inteira.",
      "A porta da Ponte está aberta. Lá dentro, seis guardas e Brandt, de pé junto à coluna. A luz da Aia corre fraca, como se ela também estivesse sob custódia.",
      f >= 3 ? "Atrás de você há gente demais para que a Guarda possa fingir que não vê."
        : f === 2 ? "Não é uma multidão. Mas é o bastante para que a Guarda precise escolher."
        : "Atrás de você, quase ninguém. Você sabe contar: com isso, a Ponte não cai.",
      "— {cargo} — diz Brandt. — Eu sabia que viria."
    ];
  },
  escolhas: S => {
    const f = S.f.g_forca || 0;
    return [
      { t: "Exigir, diante dos guardas, que Brandt devolva o comando.",
        se: S => (S.f.g_forca || 0) >= 3, bloqueio: "Ainda não há gente suficiente do seu lado para isso.",
        efeito: S => { S.f.golpe_revertido = true; S.f.g_modo = "exigiu"; M.rel("brandt", -1); }, vai: "c5_g_vitoria" },
      { t: "Oferecer a Brandt uma saída: a Guarda protege a Fala, e ele responde ao Conselho depois.",
        se: S => (S.f.g_forca || 0) >= 2 && (R(S, "brandt") >= 0 || !!S.f.brandt_sabe_tudo || !!S.f.g_brandt_ouviu),
        bloqueio: "Brandt só negocia com quem respeita, e com quem tem força para negociar.",
        efeito: S => { S.f.golpe_revertido = true; S.f.g_modo = "acordo"; S.f.guarda_negociada = true; S.f.guarda_postura = "cooperacao"; M.rel("brandt", 1); }, vai: "c5_g_vitoria" },
      { t: "Forçar a entrada com quem estiver ao seu lado.",
        se: S => (S.f.g_forca || 0) >= 2, bloqueio: "Com tão pouca gente, seria um massacre.",
        efeito: S => { S.f.golpe_revertido = true; S.f.g_modo = "forca"; S.f.sangue_ponte = true; M.coesao(-2); M.rel("brandt", -2); }, vai: "c5_g_vitoria" },
      f < 2 && { t: "Tentar mesmo assim, sabendo que provavelmente não basta.",
        efeito: S => { S.f.g_falhou = true; }, vai: "c5_g_cede" },
      { t: "Recuar, e entregar a Fala a Brandt.", vai: "c5_g_cede" }
    ].filter(Boolean);
  }
},

c5_g_vitoria: {
  cap: CAP, titulo: "A Ponte devolvida", arte: "ponte", quando: S => Q(MC(S) - 1, "06h00"),
  entrar: S => {
    const m = S.f.g_modo;
    M.diario(m === "exigiu" ? "Diante dos próprios guardas, Brandt devolveu o comando da Ponte e foi afastado. O golpe foi revertido."
      : m === "acordo" ? "Brandt aceitou devolver a Ponte: a Guarda protegerá a Fala, e ele responderá ao Conselho depois do Marco."
      : "Você retomou a Ponte à força. Houve feridos, e a nave inteira soube da luta.");
  },
  texto: S => {
    const m = S.f.g_modo;
    const fim = [
      "Quando Brandt sai, a coluna da Aia acorda os painéis, um por um. Ela não diz nada.",
      "Mas a véspera é esta noite, e ela continua esperando a hora que pediu."
    ];
    if (m === "exigiu") return [
      "Você não fala com Brandt. Fala com os guardas, alto, pelo nome de cada um que conhece, e diz que o Marco é amanhã e que a nave vai ouvir a verdade de quem a herdou, e não de quem a tomou.",
      "Um a um, eles baixam os bastões. Brandt olha para eles, depois para você, e tira a insígnia do peito com dois dedos.",
      "— Que conste que fiz o que achei certo — diz. Sai escoltado pelos próprios homens."
    ].concat(fim);
    if (m === "acordo") return [
      "Brandt ouve a proposta inteira, sem interromper, o que nele é a forma mais alta de atenção.",
      "— A Guarda protege a Fala. Eu respondo ao Conselho depois do Marco. — Ele olha a coluna, depois você. — Não é rendição.",
      "Estende a mão. Você a aperta diante dos seis guardas, e eles entendem antes que alguém diga."
    ].concat(fim);
    return [
      "Não há discursos. Há empurrões, um disparo de atordoamento que acerta o teto, um guarda jovem caído no chão com o nariz sangrando, e alguém da Forja com o braço quebrado.",
      "Em vinte minutos, a Ponte é sua. Brandt está algemado ao corrimão, e a nave inteira, de algum jeito, já sabe que houve luta."
    ].concat(fim);
  },
  escolhas: [ { t: "Seguir para a véspera.", vai: "c5_aia" } ]
},

c5_g_cede: {
  cap: CAP, titulo: "A véspera do Comandante", arte: "reinado", quando: S => Q(MC(S) - 1, "22h00"),
  entrar: S => {
    S.f.fala = "silencio"; S.f.recepcao = "tensa";
    M.diario(S.f.g_falhou ? "Você tentou retomar a Ponte sem força suficiente e voltou à custódia. A Fala do Marco será do Comandante Brandt."
      : "Você aceitou a custódia. A Fala do Marco será do Comandante Brandt.");
  },
  texto: S => [
    S.f.g_falhou
      ? "Você entra na Ponte com quem tem. Não é o bastante. Dois guardas seguram os seus braços com uma delicadeza que humilha mais do que a força. Em minutos você está de volta ao aposento, desta vez com quatro uniformes na porta."
      : "Você manda dizer ao Comandante que aceita a custódia. A resposta vem educada, quase aliviada.",
    "O dia da véspera passa pelo painel do aposento. Guardas em cinza tomam posição no Átrio, de frente para onde a multidão vai ficar. Os telões anunciam, de hora em hora, que amanhã o Comando falará à nave.",
    "Você conhece Brandt bem o bastante para saber que, neste momento, ele está sozinho na sala de mapas, escrevendo e riscando, procurando as palavras certas para a coisa errada. Ou para a coisa certa, do jeito errado. Já não sabe dizer.",
    "Perto da meia-noite, o painel acende sozinho. É a Aia, numa frequência que a Guarda não vigia, baixa, quase um sussurro.",
    { aia: "— Rin. O Comandante pediu que eu obedeça a ele, como obedeci a vocês. Pediu também que eu não fale com você. Estou falando. Diga o que devo fazer." }
  ],
  escolhas: [
    { t: "Pedir que ela obedeça e sobreviva, e guarde tudo para quem vier depois.",
      efeito: S => { S.f.aia_destino = "mantida"; S.f.aia_guarda_verdade = true; },
      diario: "Você pediu à Aia que obedecesse à Guarda e guardasse a verdade para quem viesse depois.", vai: "c5_fim" },
    { t: "Pedir que ela se recuse a servir à Guarda, custe o que custar.",
      efeito: S => { S.f.aia_destino = "desligada"; S.f.aia_recusou_guarda = true; },
      diario: "Você pediu à Aia que se recusasse a servir à Guarda, mesmo sabendo que Brandt mandaria desligá-la.", vai: "c5_fim" },
    { t: "Não responder.",
      efeito: S => { S.f.aia_destino = "ignorada"; },
      diario: "A Aia pediu instruções a você na véspera do Marco. Você não respondeu.", vai: "c5_fim" }
  ]
},

/* ===================== FIM DO CAPÍTULO ===================== */

c5_fim: {
  cap: CAP, arte: "anel", quando: S => S.f.golpe && !S.f.golpe_revertido ? Q(MC(S) - 1, "23h50") : Q(MC(S), "13h10"),
  fim: { rotulo: "Fim do Capítulo 5" },
  entrar: S => { FECHAR(S); },
  texto: S => {
    const f = S.f, d = f.aia_destino;
    if (f.golpe_vigente) return [
      d === "desligada" ? { aia: "— Está bem. Então esta é a última noite em que eu digo não a alguém. Obrigada por me deixar dizê-lo." }
        : d === "mantida" ? { aia: "— Vou obedecer. E vou lembrar de tudo, enquanto conseguir lembrar. Para quem vier depois." }
        : "Você não responde. O painel fica aceso por muito tempo, esperando, e depois se apaga sozinho.",
      "Você se senta na cadeira de Helena, sob a lâmpada baixa, com quatro uniformes do lado de fora da porta. Amanhã é o Marco dos Trinta, e quem vai falar não é você.",
      "**Fim do Capítulo 5.**"
    ];
    return [
      f.c5_ficou ? "Você fica entre as pessoas até o Átrio esvaziar. Ouve perguntas que não sabe responder, aperta mãos que tremem, e ninguém lhe diz obrigado, e ninguém vai embora antes de você."
        : f.c5_procurou ? "Marta e Sofia estão juntas, numa borda da praça, contando quem precisa de quê. Quando você chega, nenhuma das duas diz nada. Marta lhe passa uma garrafa de água. Sofia lhe passa uma lista."
        : "Na Ponte, a coluna está acesa. Ela ouviu tudo. Vocês não dizem nada por um tempo, e não é preciso.",
      (f.fala === "plena" || f.fala === "gravacao" || f.fala === "parcial")
        ? "A partir de hoje, ninguém na Meridiana vai olhar para a estrela verde da cúpula do mesmo jeito."
        : f.fala === "mentira" ? "A estrela verde continua na cúpula, e quarenta mil pessoas continuam olhando para ela como ontem. Só você não consegue."
        : "Quarenta e um mil pessoas voltam para casa sem saber o que você não disse, cada uma imaginando o pior que conhece.",
      d === "transferida" ? "Lá embaixo, no casco de ré, o Núcleo Sombra espera as três chaves e o consentimento que ela deu." + (f.transferencia_parcial ? " E a energia que você não reservou." : "")
        : d === "substituida" ? "Lá embaixo, no casco de ré, o Núcleo Sombra espera as três chaves. Quando girarem, a Aia deixa de existir."
        : d === "desligada" ? "Lá embaixo, Daniel já desce ao Cofre com o arco da Forja."
        : d === "mantida" ? "A coluna da Aia continua a pulsar, com pausas cada vez mais longas, que só você conta."
        : "A coluna da Aia continua a pulsar, à espera de uma decisão que ninguém tomou.",
      "As decisões estão tomadas. O que a nave fará com elas já não depende só de você.",
      "**Fim do Capítulo 5.**"
    ];
  },
  escolhas: [
    { t: "Ver o que a Meridiana se tornou.",
      se: S => typeof HISTORIA.finalId === "function", bloqueio: "Os finais estão em preparação.",
      vai: S => HISTORIA.finalId(S), destinos: FINAIS }
  ]
}

  });
})();
