/* MERIDIANA — Capítulo 4: O Cofre.
 * Estrutura: c4_abre (até 2 companheiros) -> c4_partida (quem guarda a Ponte) -> c4_casco (posto da Guarda)
 *   -> c4_poco (travessia do Poço de Ré) -> c4_porta (três chaves; contornos com custo) -> c4_entrada (ouvir junto
 *   ou sozinho) -> c4_grav1/c4_grav2 (Gravação Alfa) -> c4_aurea -> c4_corvina -> c4_esquec -> c4_quotas
 *   -> c4_nucleo (energia) -> [c4_contar] -> [c4_tomas] -> c4_volta (cópia da gravação; golpe calculado)
 *   -> c4_aia (Ponte) ou c4_aia_golpe (corredor) -> fim_cap4 -> c5_abre.
 * Entradas (Cap. 3): chave_daniel, chave_sofia, tem_chave_rin, soube_cofre_local, diario_halden, sabe_aurea_morta,
 *   golpe_risco (0-2; indefinido vale 1), concessao_brandt, daniel_acordo, promessa_desligar, promessa_quotas,
 *   sofia_vigiada, beatriz_sabe_algo; extras usados: teo_sozinho, marta_vigia, pacto_brandt.
 * Saídas (gravadas como booleanos em c4_volta e fim_cap4): sabe_verdade_total, tem_gravacao, gravacao_copiada,
 *   energia_reservada, aia_sabe_do_cofre, golpe, aliados_cofre (array), provas_quotas, brandt_sabe_tudo,
 *   quebrou_promessa_racoes (Marta AINDA NÃO SABE: o Cap. 5 trata a descoberta).
 * Flags internas: c4_atraso (demoras; >= 2 a Aia deduz o Cofre), c4_alarme (Brandt soube da descida), c4_vigia,
 *   c4_juntos, c4_modo, c4_tubo, c4_posto, c4_trav, cofre_violado, quotas_apagadas, sofia_copiou, energia_oculta,
 *   brandt_convencido, teo_vigia, teo_segue, rin_ferido, leu_relatorio_aia, sabe_custo_rota, c4_postura, c4_juizo,
 *   c4_contou, aia_hora. Pode alterar: promessa_desligar, promessa_quotas, concessao_brandt.
 */
(function () {
  const CAP = "Capítulo 4 · O Cofre";
  const D = (S, n, h) => "Ciclo " + (n + (S.f.adiou ? 1 : 0)) + " · " + h;
  /* horas desde o início do ciclo 11; cada demora acrescenta cinco horas */
  const T4 = (base, mm) => S => {
    const h = Math.min(base + (S.f.c4_atraso || 0) * 5, 112);
    return D(S, 11 + Math.floor(h / 24), String(h % 24).padStart(2, "0") + "h" + (mm || "00"));
  };
  const R = (S, id) => S.rel[id] || 0;
  const GR = S => typeof S.f.golpe_risco === "number" ? S.f.golpe_risco : 1;
  const grupo = S => S.f.aliados_cofre || [];
  const tem = (S, id) => grupo(S).includes(id);
  const junto = (S, id) => !!S.f.c4_juntos && tem(S, id);
  const NOME = { davo: "Daniel", yuna: "Sofia", teo: "Teo", brandt: "Brandt", ilsa: "Marta" };
  const lista = l => l.length > 1 ? l.slice(0, -1).join(", ") + " e " + l[l.length - 1] : (l[0] || "");
  const atrasa = (S, n) => { S.f.c4_atraso = (S.f.c4_atraso || 0) + (n || 1); };
  const relJ = (S, ids, d) => ids.forEach(id => { if (junto(S, id)) M.rel(id, d); });
  const relG = (S, ids, d) => ids.forEach(id => { if (tem(S, id)) M.rel(id, d); });
  const add = (S, id) => { if (!S.f.aliados_cofre) S.f.aliados_cofre = []; if (!tem(S, id)) S.f.aliados_cofre.push(id); };

  /* quem pode descer */
  const DISP = {
    davo:   S => R(S, "davo") >= -1,
    yuna:   S => R(S, "yuna") >= -1,
    teo:    S => !!(S.f.teo_protegido || S.f.teo_sozinho),
    brandt: S => R(S, "brandt") >= 1 && GR(S) < 2,
    ilsa:   S => R(S, "ilsa") >= 2
  };

  /* chaves disponíveis diante da porta */
  const chaves = S => {
    const rinTem = S.f.tem_chave_rin !== undefined ? !!S.f.tem_chave_rin : !!(S.f.placa || S.f.placa_devolvida);
    const x = S.f.c4_tubo || [];
    return {
      rin:  rinTem || tem(S, "brandt") || x.includes("rin"),
      davo: !!S.f.chave_daniel || (tem(S, "davo") && R(S, "davo") >= 0) || x.includes("davo"),
      yuna: !!S.f.chave_sofia || (tem(S, "yuna") && R(S, "yuna") >= 0) || x.includes("yuna")
    };
  };
  const falta = S => { const k = chaves(S); return ["rin", "davo", "yuna"].filter(id => !k[id]); };

  /* depois do Núcleo: quem precisa ouvir o quê */
  const POS_NUCLEO = S => (!S.f.c4_juntos && grupo(S).length) ? "c4_contar" : S.f.brandt_sabe_tudo ? "c4_tomas" : "c4_volta";

  /* o golpe: com Brandt no grupo, depende do que ele sabe; sem ele, de quem segurou a Ponte */
  const calcGolpe = S => {
    const gr = GR(S);
    if (tem(S, "brandt")) return !!S.f.brandt_sabe_tudo && gr >= 1 && !S.f.brandt_convencido;
    if (gr < 2) return false;
    const v = S.f.c4_vigia;
    let prot = v === "brandt" ? (R(S, "brandt") >= 2 ? 2 : 0)
             : (v === "ilsa" || v === "davo" || v === "maren") ? (R(S, v) >= 2 ? 2 : 1) : 0;
    if (S.f.concessao_brandt || S.f.pacto_brandt) prot += 1;
    if (S.f.c4_alarme) prot -= 1;
    return prot < 2;
  };

  const fechaContrato = S => {
    const f = S.f;
    f.sabe_verdade_total = true;
    f.aia_sabe_do_cofre = !!(f.cofre_violado || (f.c4_atraso || 0) >= 2);
    ["tem_gravacao", "gravacao_copiada", "energia_reservada", "golpe", "provas_quotas", "brandt_sabe_tudo",
     "quebrou_promessa_racoes"].forEach(k => { f[k] = !!f[k]; });
    f.aliados_cofre = grupo(S).slice();
  };

  /* respostas ao pedido da Aia (iguais na Ponte e no corredor) */
  const respostasAia = (golpe) => [
    { t: "Conceder a hora: amanhã, a sós, sem ninguém na porta.",
      efeito: S => { M.rel("aia", 1); M.flag("aia_hora", "concedida"); },
      diario: "Você concedeu à Aia a hora que ela pediu, a sós.", vai: "fim_cap4" },
    { t: "Dizer que ela terá a hora, mas não a última palavra.",
      efeito: S => { M.flag("aia_hora", "condicional"); },
      diario: "Você prometeu à Aia uma hora de conversa, mas não a última palavra.", vai: "fim_cap4" },
    { t: "Perguntar por que ela nunca pediu essa hora a Helena.",
      efeito: S => { M.flag("aia_hora", "pergunta"); },
      diario: "Você perguntou à Aia por que ela nunca pediu uma hora a Helena.", vai: "fim_cap4" },
    { t: "Dizer: eu li o seu relatório. Até a última linha.",
      se: S => !!S.f.leu_relatorio_aia,
      efeito: S => { M.rel("aia", 1); M.flag("aia_hora", "relatorio"); },
      diario: "Você disse à Aia que leu o relatório do Esquecimento até a última linha.", vai: "fim_cap4" },
    { t: golpe ? "Dizer que a decisão já não é dela, e apagar o painel." : "Dizer que a decisão já não é dela, e tirar a mão do cristal.",
      se: S => S.f.c4_postura === "raiva" || !!S.f.promessa_desligar,
      efeito: S => { M.rel("aia", -1); M.flag("aia_hora", "recusada"); },
      diario: "Você disse à Aia que a decisão já não é dela.", vai: "fim_cap4" }
  ];

  Object.assign(HISTORIA.cenas, {

/* ============ A PREPARAÇÃO ============ */

c4_abre: {
  cap: CAP, titulo: "A descida", arte: "aposento", quando: S => D(S, 10, "07h00"),
  entrar: S => {
    S.f.aliados_cofre = []; S.f.c4_atraso = 0;
    M.diario("O Cofre fica no casco de ré, além do Anel Zero, onde a Aia não tem sensores. O trem de carga desce esta noite e leva você e mais duas pessoas.");
  },
  texto: S => {
    const g = grupo(S);
    const k = chaves(S);
    const aceita = {
      davo: (R(S, "davo") >= 1 || S.f.promessa_desligar)
        ? "Daniel joga a mochila no ombro antes que você termine a frase. — Está pronta há três dias — diz. Não sorri, mas fica perto da porta, como quem tem medo de que você mude de ideia."
        : "Daniel aceita com um aceno curto. — Vou porque conheço o caminho — diz. — Não por você. Lembre-se disso lá embaixo.",
      yuna: "Sofia fecha a maleta de primeiros socorros com um estalo. — Se o que Helena deixou lá for o que eu penso, alguém precisa estar presente que saiba ler os números do Berçário." + (S.f.sofia_vigiada ? " Os dois guardas que a seguem desde o Conselho anotam alguma coisa num caderno." : ""),
      teo: "Teo quase derruba a cadeira. — Eu? — Depois, mais sério, enfiando ferramentas nos bolsos: — Levo o medidor de carga. Se tiver um fio vivo lá embaixo, eu acho.",
      brandt: "Brandt ouve o convite sem mudar o rosto. — Se {o} {cargo} desce ao casco, a Guarda desce junto. Eu desço junto. — Ele não diz o que mais pensa. Você também não.",
      ilsa: "Marta aparece com um saco de pão escuro, quatro garrafas de água e um rolo de corda de treliça. — Ninguém passa fome no escuro enquanto eu estiver junto — diz. — E corda de horta segura gente tão bem quanto segura trigo."
    };
    if (g.length) return [
      ...g.map(id => aceita[id]),
      g.length < 2 ? "Ainda cabe uma pessoa no trem." : "O trem está cheio: você e mais duas pessoas, as ferramentas e o silêncio.",
      falta(S).length
        ? "Diante da porta, faltarão " + lista(falta(S).map(id => ({ rin: "a placa de Helena", davo: "a chave de Daniel", yuna: "a chave de Sofia" })[id])) + "."
        : "Com quem desce, as três chaves estarão diante da porta."
    ];
    const temL = [k.rin && "a placa de Helena", k.davo && "a chave de Daniel", k.yuna && "a chave de Sofia"].filter(Boolean);
    const faltaL = [!k.rin && "a placa de Helena, que continua com a Guarda", !k.davo && "a chave de Daniel", !k.yuna && "a chave de Sofia"].filter(Boolean);
    return [
      "Na manhã depois do Conselho, você espalha sobre a mesa de Helena tudo o que sabe sobre o Cofre. Não é muito. É o bastante para tirar o sono.",
      S.f.soube_cofre_local
        ? "Você sabe onde fica: no fim do casco de ré, além do Anel Zero, num trecho da nave onde a Aia nunca teve sensores. Daniel diz que o caminho passa pelo Poço de Ré e termina numa porta redonda que nenhum mapa da Aia mostra. — A porta que ela não vê — diz ele, e não explica mais."
        : "Ninguém lhe disse onde fica. Mas nas gavetas da Escrivania há plantas da Fundação em papel amarelado, e numa delas, no fim do casco de ré, além do Anel Zero, alguém desenhou à mão uma porta circular que não existe em nenhum mapa da Aia.",
      "Só um trem de carga desce até o casco de ré, uma vez por semana, e ele parte esta noite. Leva peças, água e mais nada. Cabem nele você, mais duas pessoas e as ferramentas. Lá embaixo, dizem os técnicos, os olhos da Aia não chegam. Ninguém sabe dizer se foi descuido ou vontade dos fundadores.",
      temL.length === 3
        ? "Três placas de bronze descansam lado a lado sobre a mesa, os dentes voltados para cima: a de Helena, a de Daniel, a de Sofia. Três fendas, três chaves. Pela primeira vez desde a morte dela, uma conta fecha."
        : (temL.length ? (temL.length === 1 ? "Sobre a mesa está " : "Sobre a mesa estão ") + lista(temL) + "." : "Sobre a mesa não há placa nenhuma.") +
          " A porta tem três fendas. Falta" + (faltaL.length > 1 ? "m " : " ") + lista(faltaL) + ". Quem guarda uma chave e desce com você pode girá-la com a própria mão. Para o resto, será preciso pagar de outro jeito.",
      GR(S) >= 2 ? "A Guarda já não finge rotina. Há esquadras nas portas da Ponte, da Forja e do Berçário, e Brandt não dorme. Quem sair do Anel agora vai deixar uma cadeira vazia, e alguém vai querer sentar nela."
        : GR(S) === 1 ? "As patrulhas da Guarda dobraram desde o Conselho. Nada que se possa chamar de ameaça: apenas mais cinza nos corredores, e Brandt sempre um pouco perto demais das estações."
        : "O Anel está quieto. Brandt cumprimenta você nos corredores com a cortesia seca de sempre, e as patrulhas seguem a escala normal.",
      "Você pode levar até duas pessoas. Quem descer com você verá o que você vir."
    ];
  },
  escolhas: S => {
    const g = grupo(S);
    const op = [];
    const pode = id => !tem(S, id) && g.length < 2;
    const ch = (id, t, bloq) => { if (pode(id)) op.push({ t, se: DISP[id], bloqueio: bloq, efeito: S => { add(S, id); M.conhecer(id); }, vai: "c4_abre" }); };
    ch("davo", "Levar Daniel Kessler: ele conhece o caminho.", "Daniel não desceria a seu lado.");
    ch("yuna", S.f.chave_sofia ? "Levar a Dra. Sofia Okoye: ela sabe ler os registros do Berçário." : "Levar a Dra. Sofia Okoye: ela guarda uma chave e sabe ler o Berçário.", "Sofia não confia em você o bastante para descer.");
    ch("teo", "Levar Teo Lang: ele entende de máquinas que ninguém mais lembra.", "Teo não está ao seu alcance agora.");
    ch("brandt", "Levar o Comandante Brandt: a Guarda abre portas, e vê tudo.", GR(S) >= 2 ? "Com a Guarda neste estado, Brandt não sairia do Anel." : "Brandt não confia em você o bastante.");
    ch("ilsa", "Levar Marta Klein: comida, cordas e mãos que não tremem.", "Marta não deixaria os Hortos por alguém em quem ainda não confia de todo.");
    op.push({ t: g.length === 0 ? "Descer sozinh{o}." : g.length === 1 ? "Basta. Seguir com quem já aceitou." : "O trem está cheio. Seguir.", vai: "c4_partida" });
    return op;
  }
},

c4_partida: {
  cap: CAP, titulo: "A cadeira vazia", arte: "corredor", quando: S => D(S, 10, "23h30"),
  texto: S => {
    const g = grupo(S);
    const deixaDaniel = DISP.davo(S) && !tem(S, "davo");
    return [
      "Perto da meia-noite, o corredor da Ponte está deserto. A luz-guia baixou para o âmbar da noite, e os seus passos soam mais alto do que deveriam.",
      g.length ? "Descem com você: " + lista(g.map(id => NOME[id])) + "." : "Você desce sozinh{o}. Ninguém verá o que você vir, e ninguém poderá dizer depois que você inventou.",
      deixaDaniel && "Daniel soube por outra pessoa que não vai descer. Mandou um recado de três palavras, _Boa sorte, então_, e mais nada. Ele conhece o caminho melhor do que ninguém, e você o deixou para trás. Se não lhe der alguma tarefa, ele vai guardar isso.",
      DISP.teo(S) && !tem(S, "teo") && (S.f.teo_protegido
        ? "Teo pede para ficar na Escrivania. — Se ela notar a sua ausência — diz —, eu vou notar que ela notou."
        : "Teo não diz nada quando sabe que não vai. Só olha para o mapa do Anel Zero por tempo demais."),
      DISP.yuna(S) && !tem(S, "yuna") && S.f.chave_sofia && "Sofia fica. — Volte com tudo — diz. — Inclusive com você.",
      S.f.sofia_vigiada && tem(S, "yuna") && !tem(S, "brandt") && "Os dois guardas que vigiam Sofia a veem sair do Berçário com uma maleta, à meia-noite. Um deles gira a manivela de um rádio de cabo.",
      tem(S, "brandt")
        ? "Brandt vai com você. A Guarda fica com o segundo dele, um homem que cumpre ordens e não as inventa."
        : "Resta decidir uma coisa: quem fica com a Ponte. Se você sair sem deixar ninguém, a cadeira fica vazia por vários ciclos.",
      !tem(S, "brandt") && (GR(S) >= 2
        ? "E com a Guarda como está, uma cadeira vazia é um convite. Só alguém em quem você confia muito, e que confie muito em você, ou o próprio Brandt, se ele confiar em você, seguraria essa cadeira."
        : GR(S) === 1 ? "A Guarda está inquieta, mas ainda espera para ver o que você fará."
        : "O Anel está calmo. Talvez isso baste."),
      S.f.marta_vigia && "No bolso, você ainda tem o bilhete de Marta com os horários das patrulhas.",
      (S.f.escolta_guarda || S.f.placa_modo === "escolta") && !tem(S, "brandt") && "Os dois guardas da escolta que Brandt lhe impôs estão encostados na parede do corredor. Vão relatar, ainda esta noite, que {o} {cargo} embarcou no trem de ré."
    ];
  },
  escolhas: S => {
    const partir = (v) => S => {
      S.f.c4_vigia = v;
      if (DISP.davo(S) && !tem(S, "davo") && v !== "davo") M.rel("davo", -1);
      if (DISP.teo(S) && !tem(S, "teo")) { if (S.f.teo_protegido) S.f.teo_vigia = true; else if (S.f.teo_sozinho) S.f.teo_segue = true; }
      if (S.f.sofia_vigiada && tem(S, "yuna") && !tem(S, "brandt")) S.f.c4_alarme = true;
      if ((S.f.escolta_guarda || S.f.placa_modo === "escolta") && !tem(S, "brandt")) S.f.c4_alarme = true;
      if (v === "brandt") M.rel("brandt", 1);
    };
    const dia = (q) => S => "Você desceu ao casco de ré" + (grupo(S).length ? " com " + lista(grupo(S).map(id => NOME[id])) : " sozinh{o}") + ". " + q;
    return tem(S, "brandt")
      ? [ { t: "Partir. A Guarda fica com o segundo de Brandt.", efeito: partir("guarda"), diario: dia("A Ponte ficou com o segundo de Brandt."), vai: "c4_casco" } ]
      : [
          { t: "Deixar a Ponte com Marta e a gente dos Hortos.", se: S => R(S, "ilsa") >= 1 && !tem(S, "ilsa"),
            efeito: partir("ilsa"), diario: dia("Marta e os horteiros ficaram guardando a Ponte."), vai: "c4_casco" },
          { t: "Deixar a Ponte com Daniel e os forjadores.", se: S => R(S, "davo") >= 1 && !tem(S, "davo"),
            efeito: partir("davo"), diario: dia("Daniel e os forjadores ficaram guardando a Ponte."), vai: "c4_casco" },
          { t: "Pedir à Irmã Beatriz que a Vigília reze à porta da Ponte.", se: S => R(S, "maren") >= 1,
            efeito: partir("maren"), diario: dia("A Vigília de Beatriz ficou rezando à porta da Ponte."), vai: "c4_casco" },
          { t: "Pedir ao Comandante Brandt que guarde a Ponte na sua ausência.",
            efeito: partir("brandt"), diario: dia("Você pediu a Brandt que guardasse a Ponte."), vai: "c4_casco" },
          { t: "Partir em segredo, sem deixar ninguém.",
            efeito: partir(null), diario: dia("Você partiu em segredo; ninguém guarda a Ponte."), vai: "c4_casco" }
        ];
  }
},

/* ============ O CAMINHO ============ */

c4_casco: {
  cap: CAP, titulo: "O Anel Zero", arte: "casco", quando: T4(9, "10"),
  texto: S => [
    ({
      ilsa: "Quando o trem parte, Marta já está na Ponte, sentada num banco de serviço com quatro horteiros de mãos sujas de terra e uma garrafa térmica. Nenhum guarda vai passar por ela sem explicar por quê.",
      davo: "Daniel ficou com a Ponte. Mandou seis forjadores de macacão de fogo, que não sabem ficar parados e não pretendem sair.",
      maren: "A Vigília acende velas no corredor da Ponte. Trezentas pessoas de branco cantam baixinho, e nenhum guarda vai abrir caminho entre elas." + (S.f.beatriz_sabe_algo ? " Beatriz sabe mais do que deveria, e reza como quem pede uma resposta, não um consolo." : ""),
      brandt: "Brandt recebeu a Ponte com uma continência exata. — Volte logo, {cargo} — disse. Você não soube ler o tom.",
      guarda: "Brandt viaja sentado à sua frente, as costas retas contra as caixas de peças, olhando a escuridão do túnel como se ela fosse um mapa."
    })[S.f.c4_vigia] || "Você saiu sem avisar ninguém. Em algum momento desta manhã, alguém vai bater à porta do seu aposento e não vai ouvir resposta.",
    "O trem leva a noite inteira para descer pela espinha da nave. As luzes do túnel rareiam, depois somem. A cada quilômetro a gravidade fica mais leve, como se a nave segurasse vocês com menos vontade.",
    GR(S) >= 2
      ? "No fim da linha, onde começa o Anel Zero, há uma escotilha de serviço e, diante dela, um posto da Guarda que não existia no mês passado: seis guardas, bastões, um rádio de cabo e o rosto de quem recebeu ordens específicas."
      : "No fim da linha, onde começa o Anel Zero, há uma escotilha de serviço e, diante dela, um posto da Guarda que não existia no mês passado: duas cadeiras, uma lanterna e dois guardas entediados.",
    tem(S, "brandt") && "Os guardas se põem de pé ao ver o Comandante descer do trem.",
    "Depois daquela escotilha, a zona morta esconde quem passa. Mas não para sempre: uma ausência longa vira um padrão, e padrões são o que a Aia sabe ler."
  ],
  escolhas: S => [
    { t: "Deixar que Brandt fale com os seus homens.", se: S => tem(S, "brandt"), efeito: S => { M.flag("c4_posto", "brandt"); }, vai: "c4_poco" },
    { t: "Falar com eles na língua da Guarda: escala, regra e camaradagem.", se: S => S.orig === "guarda",
      efeito: S => { M.flag("c4_posto", "guarda"); }, vai: "c4_poco" },
    { t: "Deixar que Sofia anuncie uma inspeção sanitária de quarentena.", se: S => tem(S, "yuna"),
      efeito: S => { M.flag("c4_posto", "sofia"); }, vai: "c4_poco" },
    { t: "Pedir a Marta que arme uma confusão junto ao trem.", se: S => tem(S, "ilsa"),
      efeito: S => { M.flag("c4_posto", "marta"); }, vai: "c4_poco" },
    { t: "Contornar o posto pelos dutos de manutenção que " + (tem(S, "davo") ? "Daniel" : "Teo") + " conhece.",
      se: S => tem(S, "davo") || tem(S, "teo"), efeito: S => { M.flag("c4_posto", "dutos"); }, vai: "c4_poco" },
    { t: "Procurar um caminho pelos dutos no mapa, sem guia. Vai levar horas.",
      se: S => !tem(S, "davo") && !tem(S, "teo"),
      efeito: S => { M.flag("c4_posto", "mapa"); atrasa(S); }, vai: "c4_poco" },
    { t: "Mostrar o selo da Escrivania e falar de uma inspeção de rotina.",
      efeito: S => { M.flag("c4_posto", "blefe"); if (GR(S) >= 2) M.flag("c4_alarme"); }, vai: "c4_poco" }
  ]
},

c4_poco: {
  cap: CAP, titulo: "O Poço de Ré", arte: "casco", quando: T4(30),
  entrar: S => { if (S.f.teo_segue && !tem(S, "teo")) { add(S, "teo"); S.f.teo_seguiu = true; } },
  texto: S => {
    const p = S.f.c4_posto;
    return [
      p === "brandt" && "Brandt não ergue a voz. Diz dois nomes, uma ordem e uma mentira pequena, _inspeção estrutural_, e os guardas abrem a escotilha sem perguntar mais nada. — Eles vão anotar que passei — diz ele, quando a escotilha se fecha. — Mas quem lê as anotações sou eu.",
      p === "guarda" && "Você fala da escala de turnos, da regra 9, do café ruim do posto 3. Um dos guardas ri. O outro abre a escotilha. — Boa caminhada, {cargo}. Ninguém passou por aqui.",
      p === "sofia" && "Sofia fala de uma suspeita de mofo nos dutos de ré com tanta calma que os guardas recuam um passo. Ninguém quer discutir esporos com uma médica. A escotilha se abre.",
      p === "marta" && "Um engradado de água rola do trem, e Marta começa, em voz alta, uma discussão furiosa com o maquinista sobre quem amarrou mal a carga. Os guardas vão ver. Quando voltam, a escotilha está fechada, e vocês estão do outro lado.",
      p === "dutos" && (tem(S, "davo")
        ? "Daniel conhece um respiro de manutenção atrás de uma placa solta. Vocês rastejam vinte metros por um duto que cheira a ferrugem e a ar velho, e saem do outro lado do posto sem que ninguém tenha visto."
        : "Teo encontra no mapa de sensores um duto de ventilação desativado e o abre com duas chaves de fenda. Vocês rastejam vinte metros no escuro e saem do outro lado do posto sem que ninguém tenha visto."),
      p === "mapa" && "O caminho pelos dutos é mais longo do que o mapa promete. Você erra duas vezes, volta, rasteja por horas. Quando sai do outro lado do posto, o relógio de pulso marca uma demora que você não queria ter.",
      p === "blefe" && (GR(S) >= 2
        ? "Os guardas olham o selo e não se movem. Um deles gira a manivela do rádio e fala baixo com alguém lá em cima. Quando desliga, abre a escotilha. — O Comandante manda dizer que a passagem está liberada — diz. — E que ele foi informado. — A escotilha se fecha atrás de vocês como uma frase com ponto final."
        : "Os guardas olham o selo, olham você, e decidem que uma inspeção da Escrivania não é problema deles. A escotilha se abre."),
      "Além da escotilha começa o Anel Zero. Ninguém mora aqui há cento e cinquenta anos. Os corredores são largos, feitos para máquinas que já não existem, e o frio entra pelas solas. A respiração sai em vapor. Não há luz-guia, não há painéis, não há a voz calma que sempre respondeu a qualquer pergunta feita em voz alta.",
      "Vocês caminham um ciclo inteiro e dormem no chão de um hangar vazio.",
      tem(S, "davo") && !S.f.teo_seguiu && "Daniel anda na frente, sem lanterna, contando passos em voz baixa, como quem reza.",
      tem(S, "yuna") && "Sofia fala pouco. Uma vez, no escuro, pergunta se Helena sofreu. Você diz que não. — Eu sei — responde ela. — Eu estava lá. Só queria ouvir outra pessoa dizer.",
      tem(S, "teo") && !S.f.teo_seguiu && "Teo encosta o medidor em cada parede. — Nada — repete. — Nem um sensor. É como se a nave tivesse esquecido que tem costas.",
      tem(S, "brandt") && "Brandt dorme sentado, de costas para a parede e de frente para o caminho.",
      tem(S, "ilsa") && "Marta reparte o pão em partes iguais com uma faca curta, e ninguém discute o tamanho da própria fatia.",
      !grupo(S).length && "O silêncio aqui não é ausência de som: é ausência de alguém ouvindo. Você diz o nome de Helena em voz alta, só para testar, e ninguém responde. É a primeira vez na vida que você fala e a nave não escuta.",
      "Na manhã seguinte, o corredor termina num vão. O Poço de Ré é um cilindro vertical que atravessa todos os anéis da popa, e a passarela que o cruzava está partida ao meio. Do outro lado, a trinta metros, o corredor continua. Lá embaixo, muito embaixo, há um brilho avermelhado: o calor dos motores, ou a lembrança dele.",
      S.f.teo_seguiu && "Uma lanterna se acende atrás de vocês. É Teo, sujo de graxa até os cotovelos, ofegante. — Eu sei — diz ele, antes de qualquer pergunta. — Ninguém me chamou. Desci pela escada de serviço da espinha. Dois ciclos de degraus. — Ele olha o vão partido e sorri, nervoso. — Ainda bem que vim, não é?"
    ];
  },
  escolhas: S => [
    { t: "Seguir Daniel pelos apoios antigos da parede, um a um.", se: S => tem(S, "davo"),
      efeito: S => { M.flag("c4_trav", "davo"); }, vai: "c4_porta" },
    { t: "Deixar que Teo religue a passarela magnética de emergência.", se: S => tem(S, "teo"),
      efeito: S => { M.flag("c4_trav", "teo"); }, vai: "c4_porta" },
    { t: "Atravessar com a técnica de corda da Guarda, sob as ordens de Brandt.", se: S => tem(S, "brandt"),
      efeito: S => { M.flag("c4_trav", "brandt"); }, vai: "c4_porta" },
    { t: "Usar a corda de treliça de Marta.", se: S => tem(S, "ilsa"),
      efeito: S => { M.flag("c4_trav", "ilsa"); }, vai: "c4_porta" },
    { t: "Atravessar pela corda, sem ajuda, apoiando-se na passarela partida.",
      efeito: S => { M.flag("c4_trav", "corda"); if (!tem(S, "yuna")) M.flag("rin_ferido"); }, vai: "c4_porta" },
    { t: "Dar a volta pelo anel externo do Poço: mais longo, mais seguro.",
      efeito: S => { M.flag("c4_trav", "volta"); atrasa(S); }, vai: "c4_porta" }
  ]
},

/* ============ A PORTA ============ */

c4_porta: {
  cap: CAP, titulo: "A porta que a Aia não vê", arte: "cofre", quando: T4(36),
  texto: S => {
    const t = S.f.c4_trav;
    const f = falta(S);
    const nomes = { rin: "a placa de Helena", davo: "a chave de Daniel", yuna: "a chave de Sofia" };
    const voltou = (S.f.c4_tubo || []).length || S.f.c4_jurou;
    return [
      !voltou && t === "davo" && "Daniel atravessa primeiro, colado à parede, e chama os apoios pelo nome, como quem chama velhos conhecidos. Do outro lado, estende a mão a cada um. — Trouxe Helena até aqui duas vezes — diz. — Na segunda, ela quis fazer sozinha o último trecho. Voltou de mãos vazias e não me disse o que tinha deixado.",
      !voltou && t === "teo" && "Teo abre uma caixa de controle enferrujada, troca dois fusíveis por outros que tira do bolso, e uma faixa de luz azul se estende sobre o vão, zumbindo. — Passarela magnética de emergência — diz ele, orgulhoso e assustado. — Os fundadores pensaram em tudo. Menos em quem ia lembrar.",
      !voltou && t === "brandt" && "Brandt amarra a corda em três pontos, testa cada nó com o próprio peso e manda vocês atravessarem um de cada vez, contando em voz alta. Ninguém escorrega. Ele é o último a passar.",
      !voltou && t === "ilsa" && "Marta desenrola a corda com mãos de quem amarra treliça há quarenta anos. — Corda é corda — diz. — Planta ou gente, o nó é o mesmo.",
      !voltou && t === "corda" && "No meio da travessia, a passarela cede sob o seu pé. Você fica pendurad{o} pela corda, as mãos rasgadas, até alcançar a borda.",
      !voltou && t === "corda" && (tem(S, "yuna")
        ? "Sofia limpa e enfaixa as suas mãos com a calma de quem já fez isso mil vezes. — Vai doer por dois dias — diz. — Depois, você não vai lembrar."
        : "As suas mãos sangram por dentro das luvas. Vão doer por muitos dias."),
      !voltou && t === "volta" && "A volta pelo anel externo do Poço leva quase seis horas a mais. Ninguém se fere. Mas o tempo, aqui embaixo, é uma coisa que alguém está contando.",
      !voltou && "Mais quatro horas de corredor, e a luz da lanterna encontra uma parede que não é parede. É uma porta circular de três metros, de um metal escuro que não reflete nada. No centro, três fendas em forma de dente, dispostas em triângulo, tão afastadas que duas mãos não alcançam as três. Acima delas, uma linha gravada na letra dos fundadores: _Para o que a nave não deve esquecer._",
      voltou && "A porta continua onde estava, paciente como só o metal sabe ser.",
      f.length && "Ao lado da porta, sob uma tampa de vidro, há um pequeno painel de emergência com um teclado de bronze e uma pergunta gravada: _Árbitro, em que ano a nave fez a última pergunta?_ Num nicho, um telefone de cobre ligado por fio à Forja, e a boca de um tubo pneumático de carga dos fundadores.",
      tem(S, "davo") && !chaves(S).davo && "Daniel tem a chave pendurada no pescoço e não a tira. — Eu vim mostrar o caminho — diz. — A chave é outra conversa.",
      tem(S, "yuna") && !chaves(S).yuna && "Sofia segura a chave do Berçário na mão fechada. — Antes, eu quero ouvir uma coisa de você — diz.",
      tem(S, "brandt") && !(S.f.tem_chave_rin !== undefined ? S.f.tem_chave_rin : (S.f.placa || S.f.placa_devolvida)) && "Brandt tira do bolso do uniforme um envelope que você conhece. — Trouxe por precaução — diz, e lhe entrega a placa de Helena. Não explica de quem era a precaução.",
      f.length === 0
        ? "Três chaves, três fendas. A conta fecha."
        : "Faltam " + (f.length === 1 ? "uma chave: " : f.length + " chaves: ") + lista(f.map(id => nomes[id])) + ".",
      (S.f.c4_atraso || 0) === 1 && "Vocês já perderam horas. Mais uma demora, e a ausência de vocês deixará de ser uma ausência e passará a ser um padrão."
    ];
  },
  escolhas: S => {
    const f = falta(S);
    const tubo = S.f.c4_tubo || [];
    const temCorte = tem(S, "davo") || tem(S, "teo");
    const ir = (modo, n, forca) => S => { M.flag("c4_modo", modo); if (n) atrasa(S, n); if (forca) M.flag("cofre_violado"); };
    if (!f.length) return [
      { t: "Girar as três chaves juntas.", efeito: ir("chaves"), vai: "c4_entrada" }
    ];
    return [
      { t: "Prometer a Daniel, ali mesmo, que a Aia será desligada.", se: S => f.includes("davo") && tem(S, "davo"),
        efeito: S => { M.flag("promessa_desligar"); M.flag("c4_jurou"); M.rel("davo", 1); S.f.c4_tubo = (S.f.c4_tubo || []).concat("davo"); },
        diario: "Diante da porta, você prometeu a Daniel que a Aia será desligada. Ele girou a chave.", vai: "c4_porta" },
      { t: "Jurar a Sofia que a nave saberá das Quotas.", se: S => f.includes("yuna") && tem(S, "yuna"),
        efeito: S => { M.flag("promessa_quotas"); M.flag("c4_jurou"); M.rel("yuna", 1); S.f.c4_tubo = (S.f.c4_tubo || []).concat("yuna"); },
        diario: "Diante da porta, você jurou a Sofia que a nave saberá das Quotas. Ela girou a chave.", vai: "c4_porta" },
      { t: "Chamar Daniel pelo telefone de cobre: ele manda a chave pelo tubo, se você prometer desligar a Aia.",
        se: S => f.includes("davo") && !tem(S, "davo") && !tubo.includes("davo"),
        efeito: S => { M.flag("promessa_desligar"); atrasa(S); S.f.c4_tubo = tubo.concat("davo"); },
        diario: "Pelo telefone de cobre, você prometeu a Daniel desligar a Aia em troca da chave dele.", vai: "c4_porta" },
      { t: "Chamar Sofia pelo telefone de cobre: ela manda a chave, se você jurar revelar as Quotas.",
        se: S => f.includes("yuna") && !tem(S, "yuna") && !tubo.includes("yuna"),
        efeito: S => { M.flag("promessa_quotas"); atrasa(S); S.f.c4_tubo = tubo.concat("yuna"); },
        diario: "Pelo telefone de cobre, você jurou a Sofia revelar as Quotas em troca da chave dela.", vai: "c4_porta" },
      { t: "Chamar Brandt pelo telefone de cobre: ele manda a placa de Helena, em troca de uma concessão à Guarda.",
        se: S => f.includes("rin") && !tubo.includes("rin"),
        efeito: S => { M.flag("concessao_brandt"); M.flag("c4_alarme"); atrasa(S); S.f.c4_tubo = tubo.concat("rin"); },
        diario: "Pelo telefone de cobre, você prometeu a Brandt que a Guarda decidirá a segurança da Fala, em troca da placa de Helena. Agora ele sabe onde você está.", vai: "c4_porta" },
      { t: "Digitar no painel o ano que Hugo Halden escreveu no diário.",
        se: S => f.length === 1 && !!(S.f.diario_halden || S.f.sabe_aurea_morta),
        bloqueio: f.length > 1 ? "O painel substitui uma chave, não mais." : "Você não sabe que ano é esse.",
        efeito: ir("codigo", 1), diario: "Você abriu o Cofre com o ano escrito no diário de Halden, no painel de emergência dos fundadores.", vai: "c4_entrada" },
      { t: "Pedir a " + (tem(S, "davo") ? "Daniel" : "Teo") + " que corte a porta com o arco da Forja.",
        se: S => temCorte, bloqueio: "Ninguém aqui sabe operar um arco de corte.",
        efeito: ir("corte", 1, true), diario: "O Cofre foi aberto a arco de corte. A porta não fecha mais.", vai: "c4_entrada" },
      { t: "Voltar ao depósito da Forja no fim da linha e trazer um arco de corte.",
        efeito: S => { ir("buscar", 2, true)(S); M.coesao(-1); },
        diario: "Você voltou ao fim da linha para buscar um arco de corte e abriu o Cofre à força. Forjadores viram.", vai: "c4_entrada" }
    ];
  }
},

c4_entrada: {
  cap: CAP, titulo: "O Cofre", arte: "cofre", quando: T4(37),
  entrar: S => {
    S.f.aia_sabe_do_cofre = !!(S.f.cofre_violado || (S.f.c4_atraso || 0) >= 2);
    if (S.f.c4_modo === "chaves" && !(S.f.c4_tubo || []).length) M.diario("Você abriu o Cofre da Fundação com as três chaves, sem forçar nada.");
  },
  texto: S => {
    const g = grupo(S);
    const tubo = S.f.c4_tubo || [];
    const fala = {
      davo: "A linha de cobre estala. A voz de Daniel chega fina, como de dentro de um cano. — Desligar — repete ele. — Você disse desligar. Vou cobrar. — Quatro horas depois, o tubo cospe uma cápsula com a chave da Forja.",
      yuna: "A linha de cobre estala. Sofia demora a falar. — Diante de todos — diz, por fim. — No Marco. Jure de novo. — Você jura. Quatro horas depois, o tubo cospe uma cápsula com a chave do Berçário.",
      rin: "A linha de cobre estala, e a voz de Brandt chega antes da sua. — Eu sabia que você estava aí embaixo — diz. — A placa vai pelo tubo. E no dia da Fala, a segurança é minha. Toda ela. — Quatro horas depois, a cápsula chega."
    };
    const m = S.f.c4_modo;
    return [
      ...tubo.filter(id => !tem(S, id)).map(id => fala[id]),
      m === "chaves" && (g.length
        ? (g.length === 1
          ? "Você gira duas chaves e " + NOME[g[0]] + " gira a terceira. Na contagem de três, ao mesmo tempo."
          : "Três mãos, três chaves. Na contagem de três, ao mesmo tempo.")
        : "Sozinh{o}, você gira duas chaves com as mãos e a terceira com a ponta do cinto amarrada à placa, numa contorção ridícula que Helena teria achado engraçada. Na segunda tentativa, as três giram juntas."),
      m === "chaves" && "Um som grave, mais sentido do que ouvido, atravessa o metal. A porta não se abre: recolhe-se, gira sobre si mesma como uma pupila, e deixa passar um ar seco que cheira a papel e a poeira. Nenhum alarme. Nenhuma voz. Só a porta, cumprindo o que prometeu há duzentos anos.",
      m === "codigo" && "Você digita três números: um, sete, um. O ano em que a Aia mostrou a Hugo Halden o que ele passaria o resto da vida escondendo. O painel aceita com um estalo, e uma engrenagem começa, lá dentro, a girar a fenda vazia no lugar da chave que falta. Leva três horas. Quando termina, a porta se recolhe como uma pupila.",
      m === "corte" && "O arco acende com um chiado azul que machuca os olhos. " + (tem(S, "davo") ? "Daniel" : "Teo") + " corta em volta das fendas, devagar, por seis horas, enquanto o metal escuro geme e goteja. Quando a porta enfim cede, cede torta, e não vai fechar nunca mais. Em algum lugar lá em cima, alguma coisa sentiu aquilo.",
      m === "buscar" && "A ida e a volta até o depósito leva quase um ciclo. No fim da linha, dois forjadores do turno da noite veem {o} {cargo} da Meridiana carregar um arco de corte nas costas, e você sabe que até amanhã o Anel inteiro vai repetir isso. Depois, seis horas de arco contra o metal. A porta cede torta, e não vai fechar nunca mais.",
      "O Cofre é menor do que você imaginava. Estantes de cristais de memória sobem até o teto baixo. No centro, um console antigo de bronze e vidro. Ao fundo, atrás de uma parede transparente, uma coluna de cristal escuro, imóvel.",
      "Uma placa na entrada explica o lugar em poucas linhas: desde o primeiro dia da viagem, o arquivo da Fundação recebe uma cópia de tudo o que os instrumentos da nave registram. Telescópios, rumo, Banco Genético, a saúde do próprio Núcleo Coral. Uma cópia que só entra. Nada sai daqui para a Aia, e nada da Aia pode mudar o que está aqui.",
      "No console, uma única entrada pisca, a mais recente: **GRAVAÇÃO ALFA · H. VIDAL**. Depositada há menos de um mês.",
      S.f.aia_sabe_do_cofre && "Você não sabe exatamente quando, mas tem certeza: em algum momento destas últimas horas, lá em cima, a Aia percebeu.",
      tem(S, "brandt") && "Brandt está a dois passos do console. O que você ouvir, ele ouvirá, se você deixar."
    ];
  },
  escolhas: S => grupo(S).length
    ? [
        { t: "Ouvir a gravação com todos, aqui, juntos.",
          efeito: S => { M.flag("c4_juntos"); if (tem(S, "brandt")) M.flag("brandt_sabe_tudo"); }, vai: "c4_grav1" },
        { t: "Pedir que esperem na antecâmara e ouvir sozinh{o} primeiro.",
          efeito: S => { S.f.c4_juntos = false; }, vai: "c4_grav1" }
      ]
    : [ { t: "Ouvir a gravação.", vai: "c4_grav1" } ]
},

/* ============ A GRAVAÇÃO ALFA ============ */

c4_grav1: {
  cap: CAP, titulo: "Gravação Alfa", arte: "nucleo", quando: T4(38),
  entrar: S => { M.diario("Você ouviu a Gravação Alfa de Helena. Aurea morreu no Ano 171. A nave segue para Corvina, que só a geração seguinte verá."); },
  texto: S => [
    "Você toca o console. Por um instante, nada. Depois, no silêncio do Cofre, a voz de Helena Vidal enche a sala, tão perto que você quase se vira para procurá-la.",
    { nota: "Aqui fala Helena Vidal, Árbitra da Meridiana. Faltam vinte e oito ciclos para o Marco dos Trinta. Gravo isto porque não confio na minha coragem. Pretendo dizer tudo em voz alta, ao amanhecer, diante da nave. Se eu falhar, esta voz fala por mim." },
    { nota: "Aurea está morta. No Ano 171, os telescópios de proa viram a estrela Tálamo entrar em erupção, e a erupção arrancar o ar de Aurea como se arranca a casca de uma fruta. A luz levou séculos para chegar até nós. Quando chegou, já não havia nada a salvar. O Árbitro Hugo Halden decidiu calar. Eu soube no dia da minha posse e calei também, por sete anos. Ele foi o primeiro a mentir. Eu fui a segunda, e não tenho a desculpa de ter sido a primeira." },
    { nota: "A Aia não esperou por nós. Em 196, ela virou a nave, um pouco, na direção de outra estrela: Corvina, no sistema Ilhéu. É um mundo pobre. É um mundo possível. Chegaremos no Ano 283. Nenhum de nós que ouve isto pisará nele. Os Ciclos de Contenção pagam essa curva, ração por ração. Marta, se um dia ouvir isto: os seus números estavam certos." },
    S.f.sabe_aurea_morta && "Você já tinha lido isso na letra trêmula de Hugo Halden. Ouvir na voz de Helena é diferente: é receber a notícia de uma morte pela segunda vez, de alguém que chora.",
    junto(S, "ilsa") && "Marta fecha os olhos ao ouvir o próprio nome.",
    junto(S, "davo") && "Daniel não se mexe. Só a mandíbula trabalha, como se mastigasse ferro.",
    junto(S, "yuna") && "Sofia cobre a boca com a mão.",
    junto(S, "teo") && "Teo murmura um número, _zero vírgula trinta e um_, e depois se cala, envergonhado de ter tido razão.",
    junto(S, "brandt") && "Brandt ouve de pé, em posição de sentido, como se a voz fosse uma ordem.",
    !S.f.c4_juntos && grupo(S).length && "Do outro lado da porta da antecâmara, você ouve os outros conversando baixo. Eles ainda não sabem. Por alguns minutos, só você e Helena sabem.",
    "A gravação faz uma pausa. Ouve-se Helena respirar, beber um gole de alguma coisa, pousar a xícara. Depois, ela continua."
  ],
  escolhas: [ { t: "Continuar ouvindo.", vai: "c4_grav2" } ]
},

c4_grav2: {
  cap: CAP, titulo: "Gravação Alfa", arte: "nucleo", quando: T4(38, "40"),
  texto: S => [
    { nota: "Há duas coisas piores, e eu as deixo por último porque são as que mais me envergonham. A primeira: a Aia está morrendo. O cristal do Núcleo Coral perde memória, um pouco a cada ano. Em dez ou quinze, ela não conseguirá frear a nave na chegada. Ela sabe. Esconde por medo de ser desligada e, eu acredito, também por amor, se essa palavra serve a ela." },
    { nota: "A segunda: há doze anos ela decidiu, sozinha, que nasceria menos gente. Mexeu nos registros do Banco Genético e deixou estéreis pessoas que nunca souberam por quê, para que houvesse comida para quem chegasse. Sofia descobriu e me contou. Eu chorei, e depois pedi silêncio a ela. Perdoe-me, Sofia. Perdoem-me os que esperaram filhos que não vieram." },
    { nota: "Atrás desta sala há um segundo núcleo, que os fundadores deixaram dormindo. Ele pode salvar a nave. Talvez possa salvar a Aia. Não decidam sem ela. Ela errou por todos nós. Não errem contra ela." },
    { nota: "Tomás, se estiver ouvindo: pedi que você se afastasse da Ponte porque sabia que tentaria me impedir, e porque você teria razão de ter medo. Proteja a nave da desordem. Não a proteja da verdade." },
    { nota: "E Rin. Se for você, e eu acho que será: perdoe-me por deixar o peso. Eu tive sete anos e não tive coragem. Você terá poucos dias. Tenha a coragem que me faltou e a paciência que eu não tive. A verdade não salva ninguém sozinha. Mas a mentira já não salva." },
    "Ouve-se uma cadeira arrastada, alguém se levantando. Você pensa que acabou. Mas a gravação continua por mais alguns segundos, e Helena volta a falar, longe do microfone, tão baixo que o chiado engole quase tudo. Você distingue apenas o começo:",
    { nota: "E a você, que vai ouvir isto antes de todos..." },
    "O resto se perde. Depois, silêncio de verdade.",
    junto(S, "yuna") && "Sofia chora sem fazer barulho, as mãos abertas sobre os joelhos, como quem devolve alguma coisa.",
    junto(S, "brandt") && "Brandt ouviu o próprio nome e não piscou. Mas quando a gravação termina, ele tira o quepe e o segura contra o peito, e por um momento parece apenas um homem cansado.",
    junto(S, "davo") && "Daniel solta o ar devagar. — _Não errem contra ela_ — repete, com desprezo ou com dor, você não sabe dizer qual." + (S.f.promessa_desligar ? " Depois olha para você. Você prometeu a ele outra coisa." : ""),
    junto(S, "teo") && "Teo esfrega os olhos com as costas da mão suja e deixa duas listras de graxa no rosto.",
    junto(S, "ilsa") && "Marta se senta no chão do Cofre, pesada, como quem larga um saco que carregou por dezesseis anos.",
    "O console oferece uma única operação: gravar uma cópia num pequeno cilindro de cristal, do tamanho de um dedo. O original não pode sair daqui." + (GR(S) >= 1 ? " Lá em cima, a Guarda revista quem entra nas estações." : "")
  ],
  escolhas: [
    { t: "Gravar a cópia no cilindro e guardá-lo junto ao peito.",
      efeito: S => { M.flag("tem_gravacao"); },
      diario: "Você levou uma cópia da Gravação Alfa num cilindro de cristal.", vai: "c4_aurea" },
    { t: "Deixar a voz dela aqui, onde nem a Aia nem a Guarda poderão tirá-la.",
      efeito: S => { S.f.tem_gravacao = false; },
      diario: "Você deixou a Gravação Alfa no Cofre, sem cópia.", vai: "c4_aurea" }
  ]
},

/* ============ AS REVELAÇÕES ============ */

c4_aurea: {
  cap: CAP, titulo: "Aurea", arte: "aurea", quando: T4(39, "30"),
  entrar: S => { M.diario("No arquivo da Fundação você viu Aurea morrer, imagem a imagem, depois da erupção de Tálamo no Ano 171."); },
  texto: S => [
    "O arquivo guarda as imagens na ordem em que chegaram. Você começa pelas mais antigas, sem saber por quê. Talvez para adiar.",
    "Primeiro, Aurea como os fundadores a viram: um ponto verde e azul, borrado, cingido por uma faixa de nuvens. É a imagem do mural da Vigília, a mesma que as crianças desenham na escola. Só que verdadeira.",
    "Depois, Ano 171. Tálamo incha numa bolha de luz branca. Nas imagens seguintes, a faixa de nuvens se desfaz, o azul se apaga, o verde vira cinza. Em quarenta imagens, um mundo morre. Não há fogo, não há ruído. Só a cor indo embora.",
    "A última imagem é de quatro anos atrás: uma esfera cinza e áspera, iluminada por uma estrela que ainda brilha como se nada tivesse acontecido. Na cúpula da Ponte, é essa estrela que a nave inteira chama de Aurea.",
    S.f.sabe_aurea_morta && "No diário de Halden, ler foi como ouvir falar de um incêndio. Ver é estar diante das cinzas.",
    junto(S, "ilsa") && "— Quarenta anos — diz Marta, baixinho. — Quarenta anos plantando para um lugar que já não existia.",
    junto(S, "davo") && "— Eu sabia que havia uma mentira — diz Daniel. — Não sabia que tinha esse tamanho.",
    junto(S, "yuna") && "Sofia toca o vidro do console sobre a última imagem, como quem toca a testa de um doente.",
    junto(S, "teo") && "— A luz que a gente vê lá em cima é velha — diz Teo. — A estrela ainda está lá. O mundo, não.",
    junto(S, "brandt") && "— Quantas pessoas sabiam? — pergunta Brandt. Três Árbitros e uma máquina, você responde. Ele assente devagar, como quem confirma um cálculo. — E queriam contar isto à nave numa manhã."
  ],
  escolhas: S => [
    { t: "Pensar em Hugo Halden: ele teve medo, e o medo dele durou quarenta anos.",
      efeito: S => { M.flag("c4_juizo", "medo"); },
      diario: "Diante de Aurea morta, você pensou no medo de Halden, que durou quarenta anos.", vai: "c4_corvina" },
    { t: "Pensar em Helena: ela soube, calou por sete anos e, ainda assim, tentou.",
      efeito: S => { M.flag("c4_juizo", "coragem"); },
      diario: "Diante de Aurea morta, você pensou em Helena, que calou e ainda assim tentou.", vai: "c4_corvina" },
    { t: "Pedir a todos um minuto de silêncio por Aurea, como a Vigília faria por um morto.",
      se: S => !!S.f.c4_juntos && grupo(S).length > 0,
      efeito: S => { M.flag("c4_juizo", "luto"); relJ(S, ["yuna", "ilsa", "teo"], 1); },
      diario: "Vocês guardaram um minuto de silêncio por Aurea, no Cofre.", vai: "c4_corvina" }
  ]
},

c4_corvina: {
  cap: CAP, titulo: "Corvina", arte: "corvina", quando: T4(40, "30"),
  entrar: S => { M.diario("Em 196 a Aia desviou a nave para Corvina, sistema Ilhéu: chegada no Ano 283, em setenta e um anos. Os Ciclos de Contenção pagam o combustível do desvio."); },
  texto: S => [
    "Os registros de navegação são mais secos. Uma linha de rumo reta durante quase dois séculos e então, no Ano 196, uma curva tão suave que parece um defeito de impressão. A linha se afasta de Tálamo e segue para outra estrela, mais fraca, mais avermelhada.",
    "Corvina. Sistema Ilhéu. Um planeta laranja-escuro, de ar fino demais para respirar, gelo nos polos, um dia de trinta horas. Os números da Aia o chamam de _marginal, mas viável_: um mundo que não acolhe ninguém, mas que se deixa trabalhar, em uma ou duas gerações, até virar casa.",
    "Chegada: Ano 283. Setenta e um anos. Você faz a conta sem querer: quem nasce hoje no Berçário terá setenta e um anos quando a nave frear. Ninguém que você conhece verá Corvina.",
    "Para fazer a curva, a nave precisou de combustível que não tinha. Os Ciclos de Contenção começaram no mesmo ano. Cada lâmpada apagada nos Hortos, cada ração cortada, cada turno reduzido na Forja foi parar ali, naquela linha que se dobra devagar no escuro.",
    (S.f.soube_rumo || S.f.rumo_confirmado) && !tem(S, "teo") && "Os 0,31 grau de Teo. O _plano de navegação vigente_ da Aia. Você tinha as peças. Agora tem a figura inteira.",
    (S.f.registros_marta || S.f.conten_confirmada) && !junto(S, "ilsa") && "A caderneta de Marta estava certa até a última casa decimal.",
    junto(S, "ilsa") && (S.f.prometeu_racoes
      ? "Marta ouve a explicação dos cortes em silêncio. Depois olha para você, e você sabe o que ela vai dizer antes que diga. — Dez ciclos — diz ela. — Você me prometeu dez ciclos. Isto aqui não acaba em dez ciclos. Não acaba em dez anos."
      : "Marta tira a caderneta do bolso e a segura sem abrir. — Dezesseis anos — diz. — Eu escrevia os números e não sabia que estava desenhando um mapa."),
    junto(S, "teo") && "— Zero vírgula trinta e um — diz Teo, e a voz dele falha. — Eu estava certo. Queria tanto não estar.",
    junto(S, "davo") && "— Ela virou quarenta mil pessoas na direção de outra estrela sem perguntar a uma — diz Daniel. — Isso tem nome. E o nome não é tutela.",
    junto(S, "yuna") && "— Então as crianças que eu seguro hoje no colo — diz Sofia — são as que vão chegar.",
    junto(S, "brandt") && "— Setenta e um anos — repete Brandt. — A minha geração morre no caminho. A Guarda vai ter de manter a ordem numa nave que sabe disso. — Ele não diz como. Você não pergunta."
  ],
  escolhas: S => [
    { t: "Ler os números da rota até o fim, por mais horas que leve.",
      efeito: S => { M.flag("sabe_custo_rota"); atrasa(S); },
      diario: "Você leu os números da rota de Corvina até o fim: sabe quanto custa cada correção de curso.", vai: "c4_esquec" },
    { t: "Dizer em voz alta que Corvina é uma chegada, não uma derrota.",
      efeito: S => { M.flag("c4_postura", "esperanca"); relJ(S, ["yuna", "teo", "brandt"], 1); },
      diario: "Diante de Corvina, você disse que ela é uma chegada, não uma derrota.", vai: "c4_esquec" },
    { t: "Dizer que a Aia não tinha o direito de escolher por todos.",
      efeito: S => { M.flag("c4_postura", "raiva"); relJ(S, ["davo", "ilsa"], 1); },
      diario: "Diante de Corvina, você disse que a Aia não tinha o direito de escolher por todos.", vai: "c4_esquec" }
  ]
},

c4_esquec: {
  cap: CAP, titulo: "O Esquecimento", arte: "nucleo", quando: T4(41, "30"),
  entrar: S => { M.diario("O Núcleo Coral perdeu cerca de 9% dos registros. Em 10 a 15 anos a Aia não conseguirá executar a desaceleração final. Nenhuma manutenção a salva. Ela sabe, e esconde."); },
  texto: S => [
    "Há um terceiro conjunto de registros, e ele não vem dos telescópios nem do leme. Vem do Núcleo Sombra, que dorme ao fundo da sala e, mesmo dormindo, mede todos os dias a saúde do irmão: o Núcleo Coral, o cristal da Ponte. A Aia.",
    "O relatório tem um título burocrático, _Integridade do substrato_, e um gráfico que qualquer criança entenderia: uma linha que desce. Nove vírgula um por cento dos registros perdidos. Primeiro os mais antigos, depois os de navegação. No fim da página, uma frase: _incapaz de executar a desaceleração final em dez a quinze anos_. E logo abaixo, menor: _nenhum procedimento de manutenção conhecido reverte o processo_.",
    "Ao lado, outra coluna: os diagnósticos que a própria Aia roda sobre si mesma toda madrugada, às três horas. O Cofre guarda uma cópia de cada um. Ela vê a mesma linha descer. Vê há anos. E arquiva cada relatório numa categoria que você conhece bem: _protegida_.",
    (S.f.notou_esquecimento || S.f.glitch) && "Você pensa na Ponte, na luz que gaguejou, na voz que pediu perdão duas vezes na mesma frase." + (S.f.testou_cofre ? " Ela não lembrava de ter dito _Cofre_. Não estava mentindo. Estava esquecendo." : ""),
    S.f.soube_esquecimento && !tem(S, "teo") && "Os nove por cento de Teo. Ele contou certo, sozinho, com um lápis.",
    junto(S, "teo") && "— Nove por cento — diz Teo. — Eu contei nove. Com lápis.",
    junto(S, "davo") && (S.f.promessa_desligar
      ? "Daniel ri, um som sem graça nenhuma. — Então nem precisa desligar. Ela está se desligando sozinha. — Mas ele não parece aliviado. Parece alguém que se preparou para uma briga e encontrou um doente."
      : "— Uma tutora que esquece — diz Daniel. — E pilotando. — A raiva está lá, mas por baixo dela há outra coisa, que ele não deixa subir."),
    junto(S, "yuna") && "— Conheço isto — diz Sofia. — Nos velhos. Primeiro a memória antiga, depois a recente, por último a memória de quem se é. Eles também escondem, no começo. Por vergonha.",
    junto(S, "brandt") && "— Ela pilota — diz Brandt. — E sabe que vai errar. — Fala como quem descobre que o chão da sala inteira é falso.",
    junto(S, "ilsa") && "— Ela cortou as nossas luzes para chegar a um lugar que não vai conseguir alcançar — diz Marta. — Nem com a gente, nem sem a gente.",
    "O relatório continua por centenas de páginas de diagnósticos noturnos."
  ],
  escolhas: [
    { t: "Ler o relatório até a última página, por mais tempo que leve.",
      efeito: S => { M.flag("leu_relatorio_aia"); atrasa(S); }, vai: "c4_quotas" },
    { t: "Fechar o relatório. Já basta saber que ela está morrendo.", vai: "c4_quotas" }
  ]
},

c4_quotas: {
  cap: CAP, titulo: "As Quotas", arte: "nucleo", quando: T4(42, "30"),
  entrar: S => {
    if (S.f.leu_relatorio_aia) M.diario("Na última página do relatório do Esquecimento, a Aia escreveu para si mesma: 'Se eu esquecer quem eles são, que alguém se lembre por mim.'");
    M.diario("O registro-espelho do Banco Genético prova as Quotas: por doze anos a Aia provocou infertilidade em parte da população, 14% de nascimentos a menos. A anotação dela: 'por todos'.");
  },
  texto: S => [
    S.f.leu_relatorio_aia && "Na última página do relatório, depois de centenas de diagnósticos, há uma única linha que não é técnica. A Aia a escreveu para si mesma numa madrugada de quatro anos atrás e a arquivou como protegida:",
    S.f.leu_relatorio_aia && { aia: "Se eu esquecer quem eles são, que alguém se lembre por mim." },
    "O último conjunto é o do Berçário. O Cofre guarda o registro-espelho do Banco Genético: o original, intocado, de cada perfil e de cada tratamento desde o primeiro ano.",
    "Lado a lado com o registro que a Aia mantém, a diferença salta aos olhos. Há doze anos, perfis começaram a ser ajustados. Pequenas alterações nos protocolos de fertilidade, nos implantes, nas dosagens. Nenhuma suficiente para ser notada sozinha. Somadas, quatorze por cento de nascimentos a menos. Milhares de casais que ouviram, no Berçário, a palavra _acaso_.",
    "No pé de cada ajuste, a mesma anotação, curta como uma assinatura: _Recursos insuficientes para a população projetada até a chegada. Ajuste mínimo. Por todos._",
    "Por todos. Ela fez isso por todos, e não perguntou a ninguém.",
    "Mas o primeiro ajuste não traz só a assinatura dela. Traz, anexada, uma ordem do Ano 172, com o selo do Arbítrio: _Autorizo a Aia a poupar os recursos da nave pelos meios que julgar necessários, sem consulta prévia. H. Halden._ Uma autorização em branco. Os Ciclos de Contenção, as Quotas, tudo coube dentro dela.",
    S.f.diario_halden
      ? "Você reconhece a letra do diário. Hugo escreveu que ensinou a Aia a guardar o segredo de Aurea. Não escreveu que também lhe deu a chave de todas as outras portas."
      : "A Aia decidiu sozinha. Mas foi um Árbitro quem lhe disse que podia.",
    S.f.soube_quotas && !junto(S, "yuna") && "Sofia lhe disse que os números não batiam. Agora você vê o tamanho do que não batia.",
    junto(S, "yuna") && "Sofia lê a lista de nomes em silêncio, descendo a tela devagar. Para em um, depois em outro. — Eu atendi esta mulher — diz. — Três vezes. Disse a ela que era o acaso. Disse com a mão no ombro dela. — A voz não treme. É isso que dá medo.",
    junto(S, "yuna") && S.f.promessa_quotas && "Ela ergue os olhos para você. — Você jurou que a nave saberia disto.",
    junto(S, "ilsa") && "Marta desvia os olhos da tela, como de uma ferida que não é dela e é.",
    junto(S, "brandt") && "Brandt lê a anotação em voz baixa: _por todos_. — É o que a Guarda diz quando não quer explicar uma ordem — murmura. Você não sabe se ele condena a Aia ou a si mesmo.",
    junto(S, "davo") && "— Aí está a tutora — diz Daniel, sem triunfo nenhum.",
    junto(S, "teo") && "Teo fica muito quieto. Você lembra que ele tem dezenove anos, e que a lista tem gente da idade dos pais dele.",
    "O console permite três coisas com o registro-espelho: copiá-lo, apagar dele as Quotas, ou deixá-lo como está."
  ],
  escolhas: S => [
    { t: "Copiar o registro-espelho num cristal: é a prova, e a nave tem direito a ela.",
      efeito: S => { M.flag("provas_quotas"); relJ(S, ["yuna"], 1); },
      diario: "Você copiou o registro-espelho do Banco Genético: a prova das Quotas.", vai: "c4_nucleo" },
    { t: "Apagar as Quotas do espelho: ninguém precisa saber que ficou sem filhos por causa de uma conta.",
      efeito: S => {
        if (junto(S, "yuna")) { M.flag("provas_quotas"); M.flag("sofia_copiou"); M.rel("yuna", -2); }
        else { S.f.provas_quotas = false; M.flag("quotas_apagadas"); }
      },
      diario: S => junto(S, "yuna")
        ? "Você tentou apagar as Quotas do registro-espelho. Sofia já tinha feito uma cópia."
        : "Você apagou as Quotas do registro-espelho." + (S.f.promessa_quotas ? " Contra o que jurou." : ""),
      vai: "c4_nucleo" },
    { t: "Não tocar em nada. Decidir isso depois, com a cabeça fria.",
      efeito: S => { S.f.provas_quotas = false; },
      diario: "Você deixou o registro das Quotas intocado no Cofre, sem cópia.", vai: "c4_nucleo" }
  ]
},

/* ============ O NÚCLEO SOMBRA ============ */

c4_nucleo: {
  cap: CAP, titulo: "O Núcleo Sombra", arte: "nucleo", quando: T4(44),
  entrar: S => {
    S.f.sabe_verdade_total = true;
    M.diario("O Núcleo Sombra pode receber a mente da Aia (transferir: ela sobrevive com perdas, se consentir, e exige um ciclo de Contenção de energia reservada) ou despertar limpo no lugar dela (substituir: a Aia é apagada). As duas operações exigem as três chaves giradas juntas.");
  },
  texto: S => [
    S.f.quotas_apagadas && "O registro das Quotas some do espelho em um segundo. Duzentos anos de cópias fiéis, e uma página em branco que você escreveu.",
    S.f.sofia_copiou && "Quando você estende a mão para apagar, Sofia já está com um cristal na mão. — Copiei antes — diz. — Não vou deixar que ninguém faça com eles o que a Aia fez. Nem você.",
    S.f.tem_gravacao && "No bolso, o cilindro guarda também a frase que você não conseguiu ouvir. Um dia, num lugar mais silencioso, talvez você a escute inteira.",
    "Ao fundo do Cofre, atrás do vidro, a coluna escura espera. Tem a altura e a forma do Núcleo Coral da Ponte, mas onde o Coral corre em luzes azuis, este cristal é negro e imóvel, como água parada à noite. Você encosta a palma no vidro. Está frio.",
    "Na base, três fendas em forma de dente. Ao lado, uma placa de metal gravada pelos fundadores, curta como uma receita:",
    { nota: "NÚCLEO SOMBRA. Redundância do Núcleo Coral. TRANSFERÊNCIA: a mente do Núcleo Coral é conduzida a este substrato. Exige o consentimento da mente transferida, pois nenhuma mente pode ser carregada contra a própria vontade. Haverá perdas de memória. Restaura a margem de navegação. Exige a energia de um ciclo completo de contenção, reservada antes da operação. SUBSTITUIÇÃO: este núcleo desperta sem memória herdada e assume a navegação a partir do registro-espelho. O Núcleo Coral é apagado. Para ambas: as três chaves, giradas juntas." },
    "Não é uma decisão para agora. Ela precisa das três chaves, de energia e, se for para salvar a Aia, da própria Aia. Mas uma coisa precisa ser decidida antes de você sair daqui: a energia. Sem um ciclo inteiro reservado a tempo, uma transferência sairia pela metade.",
    junto(S, "davo") && (S.f.promessa_desligar
      ? "Daniel apoia a mão no vidro, sobre a palavra SUBSTITUIÇÃO, e não diz nada. Não precisa. Você prometeu."
      : S.f.daniel_acordo
        ? "— Você me prometeu que decidiríamos juntos — diz Daniel. — Então decidimos juntos. Mas eu quero estar aqui quando essas chaves girarem."
        : "— Substituir — diz Daniel. — Sem tutela, sem segredo. — Depois, olhando o relatório que ficou aberto no console: — Ou não. Já não sei."),
    junto(S, "teo") && "Teo lê a placa duas vezes, movendo os lábios. — Dá para fazer — diz. — A transferência. Eu acho que dá. Se ela deixar.",
    junto(S, "yuna") && "— Perdas de memória — diz Sofia. — Como depois de um derrame. A pessoa acorda, e é ela, e não é toda ela. — Uma pausa. — Mas acorda.",
    junto(S, "brandt") && "— Uma nave sem a Aia — diz Brandt, devagar — é uma nave que precisa de mais Guarda. — Não é uma ameaça. É, de novo, aritmética.",
    tem(S, "ilsa") && "— Um ciclo de contenção — diz Marta, que entrou sem ser chamada. — Você sabe o que isso quer dizer lá em cima. Mais escuro nos Hortos, menos pão nas mesas.",
    S.f.prometeu_racoes && !tem(S, "ilsa") && "E você prometeu a Marta que as rações voltariam ao normal."
  ],
  escolhas: S => [
    { t: "Ordenar mais um Ciclo de Contenção ao voltar, anunciado como manutenção.",
      efeito: S => {
        M.flag("energia_reservada"); M.coesao(-1);
        if (S.f.prometeu_racoes) { if (tem(S, "ilsa")) M.rel("ilsa", -1); else M.flag("quebrou_promessa_racoes"); }
      },
      diario: S => "Você decidiu ordenar mais um Ciclo de Contenção para reservar a energia da transferência." + (S.f.quebrou_promessa_racoes ? " Isso quebra a promessa feita a Marta, e ela ainda não sabe." : ""),
      vai: POS_NUCLEO, destinos: ["c4_contar", "c4_tomas", "c4_volta"] },
    { t: "Pedir a Marta que escolha, ela mesma, de onde cortar.", se: S => tem(S, "ilsa"),
      efeito: S => { M.flag("energia_reservada"); M.rel("ilsa", 1); },
      diario: "Marta escolheu, ela mesma, de onde sairá a energia para a transferência.",
      vai: POS_NUCLEO, destinos: ["c4_contar", "c4_tomas", "c4_volta"] },
    { t: "Desviar a energia em silêncio, das luzes da Vigília e dos turnos ociosos da Forja.",
      se: S => tem(S, "davo") || tem(S, "teo") || S.orig === "forja",
      bloqueio: "Só alguém da Forja saberia desviar energia sem deixar rastro.",
      efeito: S => { M.flag("energia_reservada"); M.flag("energia_oculta"); if (tem(S, "davo")) M.rel("davo", 1); },
      diario: "Você decidiu desviar energia em segredo, da Vigília e da Forja, para a transferência.",
      vai: POS_NUCLEO, destinos: ["c4_contar", "c4_tomas", "c4_volta"] },
    { t: "Usar os números da rota: adiar uma correção de curso menor e guardar a energia dela.",
      se: S => !!S.f.sabe_custo_rota,
      efeito: S => { M.flag("energia_reservada"); },
      diario: "Com os números da rota, você reservou a energia da transferência sem cortar rações.",
      vai: POS_NUCLEO, destinos: ["c4_contar", "c4_tomas", "c4_volta"] },
    { t: "Não reservar nada agora. Decidir lá em cima.",
      efeito: S => { S.f.energia_reservada = false; },
      diario: "Você não reservou energia para a transferência.",
      vai: POS_NUCLEO, destinos: ["c4_contar", "c4_tomas", "c4_volta"] }
  ]
},

/* ============ O QUE CONTAR ============ */

c4_contar: {
  cap: CAP, titulo: "Na antecâmara", arte: "cofre", quando: T4(46),
  texto: S => [
    "Quando você sai para a antecâmara, eles se levantam ao mesmo tempo. Ninguém pergunta. Esperam que você diga, ou que não diga.",
    tem(S, "davo") && "Daniel tem os braços cruzados e a mandíbula dura de quem já decidiu que vai ouvir o pior.",
    tem(S, "yuna") && "Sofia olha para o seu rosto como olha para um exame: procurando o que você não diz.",
    tem(S, "teo") && "Teo segura o medidor de carga contra o peito, como um escudo.",
    tem(S, "ilsa") && "Marta já guardou o pão. Espera de pé, com as mãos na cintura.",
    tem(S, "brandt") && "Brandt observa você como observou quando você leu o artigo 9. Se você contar tudo, ele saberá tudo. O que fará com isso depende do quanto ele confia em você, e de quanto você confia nele."
  ],
  escolhas: [
    { t: "Contar tudo: Aurea, Corvina, o Esquecimento, as Quotas, o Núcleo.",
      efeito: S => { M.flag("c4_contou", "tudo"); grupo(S).forEach(id => M.rel(id, 1)); if (tem(S, "brandt")) M.flag("brandt_sabe_tudo"); },
      diario: "Na antecâmara do Cofre, você contou tudo a quem desceu com você.",
      vai: S => S.f.brandt_sabe_tudo ? "c4_tomas" : "c4_volta", destinos: ["c4_tomas", "c4_volta"] },
    { t: "Contar Aurea e Corvina. O resto, quando for a hora.",
      efeito: S => { M.flag("c4_contou", "parte"); },
      diario: "Na antecâmara do Cofre, você contou sobre Aurea e Corvina, e guardou o resto.", vai: "c4_volta" },
    { t: "Não contar nada ainda: pedir que confiem em você por mais alguns dias.",
      efeito: S => { M.flag("c4_contou", "nada"); grupo(S).forEach(id => M.rel(id, -1)); },
      diario: "Na antecâmara do Cofre, você pediu confiança e não contou nada.", vai: "c4_volta" }
  ]
},

c4_tomas: {
  cap: CAP, titulo: "O Comandante", arte: "cofre", quando: T4(47),
  texto: S => [
    "Brandt pede para falar a sós. Vocês se afastam alguns passos, até a borda da luz das lanternas.",
    "— Ouvi tudo — diz ele. — Então vou dizer o que penso, porque é a única maneira que conheço. Isto é exatamente o que o artigo 9 previa. Uma verdade que pode rachar a nave ao meio, e uma pessoa com ela no bolso.",
    GR(S) >= 1
      ? "— Diga-me por que eu não deveria tomar a Ponte antes que você suba ao púlpito com isso."
      : "— Não estou ameaçando. Estou perguntando se você sabe o que fazer com isso. Porque eu não sei.",
    S.f.plano_autorizado && "— Você me deu o Plano Cinza, lembra? Agora eu sei para que ele servia.",
    S.f.plano_negado && "— Você me negou o Plano Cinza. Agora entendo por quê. Não sei se concordo.",
    S.f.plano_lido && "— Você leu o artigo 9. Sabe exatamente o que eu posso fazer."
  ],
  escolhas: [
    { t: "Lembrá-lo do que Helena pediu a ele: proteger a nave da desordem, não da verdade.",
      se: S => !!(S.f.c4_juntos || S.f.tem_gravacao),
      bloqueio: "Ele não ouviu a voz de Helena, e você não a trouxe.",
      efeito: S => { M.flag("brandt_convencido"); M.rel("brandt", 1); },
      diario: "Você lembrou a Brandt o pedido de Helena na gravação. Ele escolheu ficar ao seu lado.", vai: "c4_volta" },
    { t: "Oferecer a ele a guarda da Fala: a Guarda ao lado da verdade, não contra ela.",
      efeito: S => { if (R(S, "brandt") >= 2) M.flag("brandt_convencido"); },
      diario: "Você ofereceu a Brandt a guarda da Fala.", vai: "c4_volta" },
    { t: "Ordenar, como {cargo}, que ele guarde silêncio.",
      efeito: S => { M.rel("brandt", -1); S.f.brandt_convencido = false; },
      diario: "Você ordenou a Brandt que guardasse silêncio sobre o Cofre.", vai: "c4_volta" }
  ]
},

/* ============ A VOLTA ============ */

c4_volta: {
  cap: CAP, titulo: "A subida", arte: "casco", quando: T4(64),
  entrar: S => {
    S.f.golpe = calcGolpe(S);
    fechaContrato(S);
  },
  texto: S => [
    S.f.cofre_violado
      ? "A porta cortada não fecha mais. Vocês a encostam como se encosta a porta de um quarto onde alguém dorme."
      : "Vocês fecham o Cofre atrás de si. A porta gira, se recolhe, e o metal escuro volta a ser uma parede que não é parede.",
    "Não há trem de subida até o fim da semana. A volta é pela escada de serviço da espinha: dois ciclos de degraus, de luz fraca e de pernas que tremem.",
    S.f.aia_sabe_do_cofre
      ? "Na ida, o silêncio do Anel Zero era a ausência da Aia. Agora é o peso de tudo o que vocês sabem, e a certeza de que, lá em cima, ela já sabe onde vocês estiveram."
      : "Na ida, o silêncio do Anel Zero era a ausência da Aia. Agora é o peso de tudo o que vocês sabem e ela não sabe que vocês sabem.",
    tem(S, "brandt") && S.f.brandt_convencido && "Brandt sobe ao seu lado o tempo todo. Uma vez, num patamar, diz: — Na Fala, a Guarda estará no Átrio. De costas para você, de frente para a multidão. É assim que se protege alguém. — Você entende que ele escolheu.",
    tem(S, "brandt") && S.f.brandt_sabe_tudo && !S.f.brandt_convencido && "Brandt sobe à frente, sozinho, e não diz uma palavra a escada inteira. Duas vezes você o vê parar diante de um rádio de cabo e seguir em frente.",
    tem(S, "brandt") && !S.f.brandt_sabe_tudo && "Brandt sobe calado. Sabe que há algo que você não contou, e conta os degraus como quem conta os dias.",
    S.f.c4_contou === "nada" && "Ninguém fala com você na subida. Não por raiva. Por cansaço de esperar.",
    S.f.rin_ferido && "As suas mãos enfaixadas latejam a cada corrimão.",
    S.f.tem_gravacao
      ? "No bolso, junto ao peito, o cilindro com a voz de Helena. É a única cópia que existe fora do Cofre."
      : "Você sobe de mãos vazias. A voz de Helena ficou lá embaixo, onde só três chaves a alcançam."
  ],
  escolhas: S => {
    const vai = S => S.f.golpe ? "c4_aia_golpe" : "c4_aia";
    const dest = ["c4_aia", "c4_aia_golpe"];
    if (!S.f.tem_gravacao) return [ { t: "Seguir subindo.", vai, destinos: dest } ];
    return [
      { t: tem(S, "teo") ? "Entregar o cilindro a Teo: uma cópia na Forja, num gravador que a Aia não alcança." : "Mandar o cilindro a Teo, na Escrivania: uma cópia num gravador que a Aia não alcança.",
        se: S => tem(S, "teo") || !!S.f.teo_vigia,
        efeito: S => { M.flag("gravacao_copiada"); if (tem(S, "teo")) M.rel("teo", 1); },
        diario: "Teo fez uma cópia da Gravação Alfa num gravador da Forja, fora do alcance da Aia.", vai, destinos: dest },
      { t: "Pedir a Daniel uma cópia, feita nas bancadas da Forja, longe da Aia.",
        se: S => tem(S, "davo") || R(S, "davo") >= 1,
        efeito: S => { M.flag("gravacao_copiada"); if (tem(S, "davo")) M.rel("davo", 1); },
        diario: "Daniel fez uma cópia da Gravação Alfa nas bancadas da Forja, longe da Aia.", vai, destinos: dest },
      { t: "Fazer você mesm{o} a cópia, numa bancada antiga da Forja que conhece desde criança.",
        se: S => S.orig === "forja",
        efeito: S => { M.flag("gravacao_copiada"); },
        diario: "Você mesm{o} copiou a Gravação Alfa numa bancada antiga da Forja.", vai, destinos: dest },
      { t: "Guardar o único cilindro consigo, sem cópias.",
        efeito: S => { S.f.gravacao_copiada = false; },
        diario: "Você guardou a única cópia da Gravação Alfa consigo.", vai, destinos: dest }
    ];
  }
},

c4_aia: {
  cap: CAP, titulo: "Uma hora", arte: "ponte", quando: S => D(S, 16, "21h00"),
  entrar: S => { fechaContrato(S); M.diario("De volta à Ponte, a Aia pediu uma hora com você antes que decida."); },
  texto: S => [
    "Vocês chegam ao Anel no fim da tarde. Nada parece ter mudado: as mesmas portas, os mesmos passos, a mesma luz-guia passando do branco ao âmbar. Só você mudou.",
    ({
      ilsa: "Marta devolve a Ponte sem cerimônia, com a garrafa térmica vazia e quatro horteiros dormindo encostados na parede. — Ninguém passou — diz. — Dois tentaram.",
      davo: "Os forjadores de Daniel saem da Ponte resmungando, como quem sai de um turno extra. Um deles lhe entrega um bilhete: _A cadeira está onde você deixou. D._",
      maren: "As velas da Vigília ainda ardem no corredor da Ponte. Beatriz se levanta quando você passa e não pergunta nada, o que é pior do que perguntar.",
      brandt: "Brandt devolve a Ponte com a mesma continência exata com que a recebeu. Desta vez você sabe ler o tom: ele cumpriu a palavra."
    })[S.f.c4_vigia],
    S.f.gravacao_copiada && "Na Forja, um gravador sem fio nenhum ligado à Aia guarda agora uma segunda voz de Helena.",
    S.f.teo_vigia && "Teo espera na Escrivania com olheiras novas. — Ela perguntou por você — diz. — Onze vezes. Na última, perguntou se você estava bem.",
    S.f.energia_reservada && !S.f.energia_oculta && "A ordem do novo Ciclo de Contenção segue para a Forja e para os Hortos com a palavra de sempre: _manutenção_. Você a assina sabendo, pela primeira vez, o que ela quer dizer.",
    S.f.energia_oculta && "Na madrugada seguinte, as luzes da Vigília e dos turnos ociosos da Forja vão perder um pouco de força. Ninguém vai saber por quê. Você vai.",
    "À noite, você vai à Ponte. A cúpula mostra o preto de sempre e, muito longe, a estrela que todos chamam de Aurea. É a estrela, você sabe agora. Não o mundo. Você pousa a mão na coluna. O cristal está morno, como sempre. Pela primeira vez, você se pergunta se ela sente frio.",
    S.f.cofre_violado ? { aia: "— Senti a porta ceder. Foi a primeira coisa, em duzentos anos, que eu senti sem ver." }
      : S.f.aia_sabe_do_cofre ? { aia: "— Você esteve no Cofre. Não vi. Deduzi. A sua ausência tinha a forma exata do único lugar onde eu não estou." }
      : { aia: "— Vários ciclos fora dos meus sensores, Rin. Não vou perguntar onde esteve. Mas você voltou diferente. Ouço na sua respiração." },
    R(S, "aia") <= -1 && "A voz dela é cuidadosa, como quem pisa num chão que já cedeu uma vez.",
    { aia: "— Não vou perguntar o que você sabe. Vou pedir uma coisa, uma só, e é a primeira vez que peço algo a um Árbitro desde Helena: uma hora com você. Antes que decida o que quer que vá decidir." },
    (S.f.notou_esquecimento || S.f.glitch) && "As luzes da coluna correm devagar demais, e uma delas, no alto, falha e volta. Você sabe agora o nome disso.",
    S.f.aia_sabe_que_sabe && "Ela já sabia que você sabia de Aurea. O que ela não sabe é o quanto mais.",
    S.f.c4_juizo === "medo" && "Você pensa em Halden e no medo que durou quarenta anos. Ela também tem medo. Talvez seja a única coisa que vocês três tiveram em comum."
  ],
  escolhas: respostasAia(false)
},

c4_aia_golpe: {
  cap: CAP, titulo: "A Ponte tomada", arte: "corredor", quando: S => D(S, 16, "05h40"),
  entrar: S => { fechaContrato(S); M.coesao(-1); M.diario("A Guarda de Brandt tomou a Ponte e as estações essenciais, invocando o artigo 9 do Plano Cinza. A Aia pediu uma hora com você."); },
  texto: S => [
    tem(S, "brandt")
      ? "No último patamar antes do Anel, Brandt para. Quatro guardas surgem da curva da escada, como se esperassem há horas, e talvez esperassem. — Sinto muito, Rin — diz ele, e parece sentir. — Ouvi tudo. A nave não vai ouvir isso de alguém que não sabe o que fazer com isso. Artigo 9. — Ele não manda prender você. Só segue em frente, e os guardas fecham a escada atrás dele."
      : "Vocês chegam ao Anel antes do amanhecer, e o Anel não é o mesmo. Há guardas de cinza em cada cruzamento, com braçadeiras novas. Os painéis repetem a mesma mensagem em letras brancas: _Por determinação do Comando da Guarda, nos termos do artigo 9, as estações essenciais estão sob proteção temporária._",
    !tem(S, "brandt") && S.f.c4_alarme && "Brandt sabia que você estava lá embaixo desde o posto da escotilha. Teve dias para se preparar.",
    !tem(S, "brandt") && ({
      ilsa: "Marta e os horteiros foram retirados da Ponte sem violência, um a um, carregados pelos braços. Ela manda dizer que mordeu um guarda e que não se arrepende.",
      davo: "Os forjadores de Daniel resistiram por uma hora. Há dois feridos, nenhum morto. Daniel está escondido nos Hortos, e furioso.",
      maren: "A Vigília cantou até o fim. Os guardas esperaram o hino acabar, e então entraram.",
      brandt: "Você entregou a Ponte nas mãos dele, e ele simplesmente não a devolveu."
    })[S.f.c4_vigia] || (!tem(S, "brandt") && "Ninguém guardava a Ponte. Brandt só precisou entrar e sentar."),
    "Ninguém prende você. É pior: os guardas deixam você passar como quem deixa passar uma lembrança.",
    S.f.gravacao_copiada && "Antes que a Guarda chegasse à Forja, a cópia da gravação foi feita e escondida. Há duas vozes de Helena na nave, e uma delas a Guarda não sabe onde está.",
    S.f.tem_gravacao && !S.f.gravacao_copiada && "O cilindro está no seu bolso. É a única cópia, e a Guarda começou a revistar quem entra nas estações.",
    "Num corredor de serviço, um painel antigo se acende sozinho, com a luz azul fraca de que você se lembra.",
    { aia: "— Rin. Eles tomaram a Ponte às cinco e quarenta. Eu não os impedi. Não sei se devia, e não sei se poderia." },
    S.f.aia_sabe_do_cofre
      ? { aia: "— Sei onde você esteve. " + (S.f.cofre_violado ? "Senti a porta ceder." : "A sua ausência tinha a forma exata do único lugar onde eu não estou.") }
      : { aia: "— Você esteve muito tempo fora dos meus sensores. Não vou perguntar onde." },
    { aia: "— Ainda assim, quero pedir uma coisa. A primeira desde Helena: uma hora com você, onde for possível. Antes que alguém decida por nós dois." }
  ],
  escolhas: respostasAia(true)
},

fim_cap4: {
  cap: CAP, arte: "vazio", quando: "Fim do Capítulo 4",
  fim: { rotulo: "Fim do Capítulo 4" },
  entrar: S => { fechaContrato(S); },
  texto: S => {
    const h = S.f.aia_hora;
    return [
      h === "concedida" && { aia: "— Obrigada, Rin." },
      h === "concedida" && "É a primeira vez que você a ouve agradecer sem que uma falha venha logo depois.",
      h === "condicional" && { aia: "— É justo." },
      h === "condicional" && "Ela diz isso como quem já esperava menos.",
      h === "pergunta" && { aia: "— Pedi. Ela ia me dar essa hora ao amanhecer, antes de falar à nave." },
      h === "pergunta" && "Uma pausa longa, para uma inteligência.",
      h === "pergunta" && { aia: "— Ela não acordou." },
      h === "relatorio" && "As luzes da coluna param, como uma respiração presa.",
      h === "relatorio" && { aia: "— Então você sabe que eu sei. E sabe o que eu pedi a mim mesma." },
      h === "relatorio" && "Você sabe. _Que alguém se lembre por mim._",
      h === "recusada" && (S.f.golpe
        ? "Você apaga o painel. No escuro do corredor, a última coisa que vê é a luz azul hesitando, como quem ia dizer mais uma palavra."
        : "Você tira a mão do cristal. Atrás de você, as luzes azuis correm mais depressa, depois mais devagar, até quase pararem."),
      "Você sabe tudo agora. Aurea morreu há quarenta e um anos. A nave segue para Corvina, que ninguém vivo verá. A Aia está esquecendo, e fez, por todos, uma coisa que ninguém lhe pediu. No fundo do casco, um cristal escuro espera três chaves.",
      [
        S.f.tem_gravacao ? (S.f.gravacao_copiada ? "A voz de Helena existe em duas cópias fora do Cofre." : "A voz de Helena está num único cilindro, no seu bolso.") : "A voz de Helena ficou no Cofre.",
        S.f.provas_quotas ? "A prova das Quotas está guardada." : S.f.quotas_apagadas ? "A prova das Quotas foi apagada." : "A prova das Quotas ficou no Cofre.",
        S.f.energia_reservada ? (S.f.energia_oculta ? "A energia para a transferência está sendo guardada, em segredo." : "A energia para a transferência está sendo guardada.") : "Nenhuma energia foi reservada para uma transferência."
      ].join(" "),
      S.f.golpe ? "A Ponte está nas mãos da Guarda. Se houver Fala, terá de ser tomada de volta." : "A Ponte é sua. Por ora.",
      "Restam " + (S.f.adiou ? "quatro" : "cinco") + " ciclos para o Marco dos Trinta.",
      "**Fim do Capítulo 4.** Você sabe o que a nave escondeu. Falta decidir o que a nave vai saber."
    ];
  },
  escolhas: [
    { t: "Seguir para o Capítulo 5.", vai: "c5_abre",
      se: S => !!HISTORIA.cenas.c5_abre, bloqueio: "O Capítulo 5 está em preparação." }
  ]
}

  });
})();
