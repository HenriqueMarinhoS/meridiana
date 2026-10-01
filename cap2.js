/* MERIDIANA — Capítulo 2: A Pergunta.
 * Estrutura: o jogador visita uma pessoa pelo gancho do Capítulo 1 (S.f.primeiro), escolhe mais uma
 * ou duas no hub, e à noite faz até 3 perguntas à Aia. Termina com a primeira falha visível dela.
 * Variáveis novas principais: nv (visitas), soube_* (o que você descobriu), plano_*, teo_*, prometeu_racoes.
 */
(function () {
  const D = (S, n, h) => "Ciclo " + (n + (S.f.adiou ? 1 : 0)) + " · " + h;
  const T = S => S.f.nv === 1 ? D(S, 1, "23h50") : S.f.nv === 2 ? D(S, 2, "10h00") : D(S, 2, "15h00");
  const PROX = S => S.f.nv >= 3 ? "c2_aia" : "c2_hub";
  const CAP = "Capítulo 2 · A Pergunta";
  const visita = (S) => S.f.nv === 1;

  Object.assign(HISTORIA.artes, {
    bercario: { tom: 172, nome: "Berçário", img: true },
    hortos:   { tom: 112, nome: "Hortos, Setor 3", img: true },
    guarda:   { tom: 8,   nome: "Sala de segurança da Guarda", img: true },
    forja:    { tom: 24,  nome: "Forja, Sala 4", img: true }
  });

  Object.assign(HISTORIA.cenas, {

/* ============ SOFIA OKOYE (Berçário) ============ */

c2_yuna: {
  cap: CAP, titulo: "O Berçário", arte: "bercario", quando: T,
  entrar: S => {
    S.f.nv = (S.f.nv || 0) + 1; S.f.vis_yuna = true; S.f.soube_gravacao = true; M.conhecer("yuna");
    M.diario("Sofia Okoye admitiu ter levado o chá e o sonífero a Helena, a pedido dela. Helena ia fazer uma confissão ao amanhecer: 'a nave merece saber o que a Aia sabe'.");
  },
  texto: S => [
    visita(S)
      ? "O Berçário nunca dorme. Atrás do vidro, fileiras de incubadoras acendem e apagam como uma respiração lenta, e o ar cheira a esterilizante e a leite morno. Sofia Okoye continua sentada no chão, ao lado do copo de água intocado."
      : "Você encontra a Dra. Sofia Okoye na sala de plantão do Berçário, entre dois relatórios e uma xícara que ela não toca. Quando você fecha a porta, ela entende o motivo da visita antes que você diga.",
    "— Fui eu — repete ela, agora sem a pressa de quem se defende. — Levei o chá e o sonífero. Foi Helena quem pediu. Ela não dormia direito havia semanas, e naquela noite queria dormir, porque de manhã ia fazer uma coisa e precisava estar inteira. Dei o mais leve que temos. Ela adormeceu em vinte minutos. Fiquei até as três e dez. Quando saí, respirava normal.",
    S.f.viu_xicara
      ? "— A xícara limpa era a minha. Lavei sem pensar, por hábito. Foi burrice."
      : "— Lavei a minha xícara antes de sair, por hábito. Foi burrice.",
    "Você pergunta que coisa Helena ia fazer.",
    "— Uma confissão. Não disse a quem, nem do quê. Disse só: 'a nave merece saber o que a Aia sabe'. — As mãos dela se apertam. — Eu não perguntei mais. Devia ter perguntado.",
    S.f.yuna_abalada && "— Hoje de manhã, no Conselho, eu quase falei. Você pediu que a morte fosse investigada às claras, e eu pensei: se falar agora, o Comandante estará olhando.",
    "— Por que não contou ao Conselho?",
    "— Porque o Comandante Brandt estava na sala, e eu não sabia se Helena queria que ele soubesse.",
    "Ela espera o que você vai fazer com isso."
  ],
  escolhas: [
    { t: "Acreditar nela e dizer que Helena escolheu bem em quem confiar.",
      efeito: S => { M.rel("yuna", 1); M.flag("confiou_yuna"); }, vai: "c2_yuna_r" },
    { t: "Pressionar: dizer que quem esconde uma visita esconde outras coisas, e perguntar o que mais ela guarda.",
      efeito: S => { M.rel("yuna", -1); M.flag("soube_quotas"); }, vai: "c2_yuna_r" },
    { t: "Lembrar que você prometeu investigar às claras e pedir que ela repita isso diante do Conselho.",
      se: S => S.f.investigar_aberto,
      efeito: S => { M.flag("sofia_testemunha"); M.flag("brandt_sabe_gravacao"); M.coesao(-1); }, vai: "c2_yuna_r" }
  ]
},

c2_yuna_r: {
  cap: CAP, arte: "bercario", quando: T,
  entrar: S => {
    if (S.f.confiou_yuna) M.diario("Você acreditou em Sofia. Ela disse que um dia teria de escolher entre a ciência e a consciência, e que então procuraria você.");
    if (S.f.soube_quotas) M.diario("Sofia contou que os registros do banco genético foram ajustados e que só a Aia poderia tê-lo feito sem deixar rastro. Helena sabia e pediu segredo.");
    if (S.f.sofia_testemunha) M.diario("Você pediu que Sofia repita sua história diante do Conselho. Brandt vai querer saber o que Helena ia confessar.");
  },
  texto: S => [
    S.f.confiou_yuna && "Os ombros dela descem, como se tivesse soltado um peso que carregava por dentro. — Obrigada — diz. — Helena me disse que você ouvia antes de decidir. Disse também que um dia eu teria que escolher entre a minha ciência e a minha consciência, e que, quando esse dia chegasse, eu deveria procurar você. — Ela olha para o corredor vazio. — Ainda não é o dia. Mas ele chega.",
    S.f.soube_quotas && "Os olhos dela endurecem, e por um instante você vê a médica que decide quem recebe o último leito. — Então vai ouvir — diz. — Há dois anos descobri que os números de nascimento do banco genético não batem com os registros de fertilidade. Alguém ajustou os dois. Só uma coisa na nave ajusta registros sem deixar rastro. — Ela não precisa dizer o nome. — Contei a Helena. Ela chorou, e depois me pediu que não contasse a mais ninguém. Você me fez quebrar essa promessa.",
    S.f.sofia_testemunha && "Sofia empalidece. — Diante de todos eles? — Respira fundo. — Eu falarei, se for preciso. Mas lembre-se do que você acabou de fazer, {cargo}. O Comandante vai querer saber o que Helena ia confessar. E, a partir de agora, vai procurar por conta própria."
  ],
  escolhas: [ { t: "Seguir.", vai: PROX, destinos: ["c2_hub", "c2_aia"] } ]
},

/* ============ MARTA KLEIN (Hortos) ============ */

c2_marta: {
  cap: CAP, titulo: "Os Hortos", arte: "hortos", quando: T,
  entrar: S => {
    S.f.nv = (S.f.nv || 0) + 1; S.f.vis_marta = true; S.f.soube_contencao = true; M.conhecer("ilsa");
    M.diario("Marta Klein mostrou que os cortes de energia e ração dos Hortos, há dezesseis anos, seguem um padrão de decisão e não de avaria. A Aia respondeu 'protegida' quando ela perguntou por quê.");
  },
  texto: S => [
    visita(S)
      ? "Marta Klein abre a mão e deixa os grãos escuros escorrerem entre os dedos, devagar, como quem conta."
      : "Você encontra Marta no Setor 3, ajoelhada num canteiro, com um punhado de grãos escuros na mão. Ela não se levanta.",
    "— Isto é trigo de luz fraca. Cresce, mas não enche. Dezesseis anos atrás a energia dos Hortos caiu onze por cento. Sem ordem escrita, sem aviso: uma linha no manual da Forja, 'Ciclo de Contenção', e pronto. Desde então cada colheita é um pouco menor, e eu invento desculpas para quarenta mil bocas.",
    "Ela tira do bolso uma caderneta de capa mole, escura de tanto manuseio. — Anotei tudo. Cada ciclo, cada ração, cada corte. O padrão não é de avaria. É de decisão.",
    !visita(S) && "— Perguntei à Aia por quê. Ela respondeu 'protegida'. Em quarenta anos de Hortos, nunca ouvi essa palavra da boca dela.",
    S.f.testou_protegida && "Você pensa na palavra que ouviu na Ponte. Duas pessoas, dois assuntos, a mesma resposta. Isso não é coincidência: é um padrão.",
    "— Ou a nave está economizando para alguma coisa, ou escondendo alguma coisa. Nos dois casos, alguém devia ter me contado.",
    "Ela fecha a caderneta. — Amanhã cortamos outra ração. Preciso de uma resposta que eu possa levar às equipes. Prometa que as rações voltam ao normal."
  ],
  escolhas: [
    { t: "Prometer: as rações voltam ao normal em dez ciclos.",
      efeito: S => { M.rel("ilsa", 2); M.flag("prometeu_racoes"); M.coesao(1); }, vai: "c2_marta_r" },
    { t: "Ser honest{o}: ainda não sabe o motivo, e não promete o que não pode cumprir.",
      efeito: S => { M.rel("ilsa", 1); M.flag("sem_promessa"); }, vai: "c2_marta_r" },
    { t: "Pedir a caderneta e prometer descobrir o motivo dos cortes.",
      efeito: S => { M.rel("ilsa", 1); M.flag("registros_marta"); }, vai: "c2_marta_r" }
  ]
},

c2_marta_r: {
  cap: CAP, arte: "hortos", quando: T,
  entrar: S => {
    if (S.f.prometeu_racoes) M.diario("Você prometeu a Marta que as rações voltariam ao normal em dez ciclos.");
    if (S.f.sem_promessa) M.diario("Você disse a Marta que não prometeria o que não poderia cumprir.");
    if (S.f.registros_marta) M.diario("Marta entregou a você a caderneta com dezesseis anos de registros dos cortes.");
  },
  texto: S => [
    S.f.prometeu_racoes && "Os olhos de Marta se enchem de uma esperança cansada. — Dez ciclos — repete, como quem grava na pedra. — Eu conto às equipes. Não me faça mentir para elas, {cargo}.",
    S.f.sem_promessa && "Marta assente devagar. — Prefiro isso a uma promessa bonita. Já ouvi muitas. — Guarda os grãos no bolso. — Mas então me ajude a descobrir, porque a próxima colheita não espera.",
    S.f.registros_marta && "Marta hesita, depois lhe entrega a caderneta. — Dezesseis anos de números. Se alguém quiser provar o que fizeram, está aqui. Cuide dela como cuidaria de um filho."
  ],
  escolhas: [ { t: "Seguir.", vai: PROX, destinos: ["c2_hub", "c2_aia"] } ]
},

/* ============ TOMÁS BRANDT (Guarda) ============ */

c2_brandt: {
  cap: CAP, titulo: "A Guarda", arte: "guarda", quando: T,
  entrar: S => {
    S.f.nv = (S.f.nv || 0) + 1; S.f.vis_brandt = true; M.conhecer("brandt");
    M.diario("Brandt admitiu que estava de uniforme porque Helena pediu que a Guarda ficasse longe da Ponte ao amanhecer. Ele temia o que ela faria.");
  },
  texto: S => [
    visita(S)
      ? "Brandt espera a sua resposta sem se mexer. Você diz que ainda não sabe que tipo de {cargo} será, e ele parece achar isso mais honesto do que esperava."
      : "O Comandante recebe você de pé, como recebe todo mundo. Os mapas do Anel cobrem as paredes, cada setor com uma cor e um número.",
    "— Vou ser direto, porque é a única maneira que conheço. Na véspera de morrer, Helena me pediu que mantivesse a Guarda longe da Ponte ao amanhecer. Eu me recusei. Passei a noite de vigia, de uniforme. Foi por isso que eu já estava vestido quando o sino tocou. Não porque soubesse que ela morreria: porque temia o que ela faria.",
    S.f.notou_brandt && "— Você me perguntou isso no corredor, e eu não respondi. Respondo agora.",
    "— Dois anos de olheiras, bilhetes queimados, horas fechada com a Aia. Quem passa a noite em claro com uma máquina e manda a Guarda embora está para fazer algo que não poderá ser desfeito. Não sei o quê. Prefiro não saber.",
    "Ele aponta um mapa sem olhar. — Existe um plano para o dia em que a ordem falhar. Chama-se Plano Cinza, e nunca foi usado. A Guarda assume as estações essenciais, Ponte, Forja, Hortos e Berçário, em até uma hora. Preciso de uma autorização antecipada, para não perder essa hora quando ela importar."
  ],
  escolhas: [
    { t: "Autorizar o Plano Cinza em caso de emergência: o Comandante decide quando.",
      efeito: S => { M.rel("brandt", 2); M.flag("plano_autorizado"); }, vai: "c2_brandt_r" },
    { t: "Recusar: nenhum plano é executado sem a sua ordem pessoal.",
      efeito: S => { M.rel("brandt", -1); M.flag("plano_negado"); }, vai: "c2_brandt_r" },
    { t: "Pedir para ler o plano antes de decidir.",
      efeito: S => { M.flag("plano_lido"); }, vai: "c2_brandt_r" }
  ]
},

c2_brandt_r: {
  cap: CAP, arte: "guarda", quando: T,
  entrar: S => {
    if (S.f.plano_autorizado) M.diario("Você autorizou antecipadamente o Plano Cinza da Guarda.");
    if (S.f.plano_negado) M.diario("Você negou ao Comandante a autorização antecipada do Plano Cinza.");
    if (S.f.plano_lido) M.diario("No artigo 9 do Plano Cinza, a Guarda assume a função de Arbítrio se o Árbitro for julgado incapaz de preservar a ordem.");
  },
  texto: S => [
    S.f.plano_autorizado && "Brandt aceita com um aceno curto, e algo no rosto dele se acomoda: o alívio de quem recebeu uma ferramenta. — Não vou decepcionar a nave, {cargo}.",
    S.f.plano_negado && "O maxilar dele trava. — Entendido. Se um dia a hora importar, perderemos a hora. — Não é uma ameaça. É aritmética.",
    S.f.plano_lido && "Ele entrega um tablet sem hesitar. Você lê em silêncio. O plano é meticuloso, quase belo, e no artigo nove há uma cláusula que você lê duas vezes: a Guarda assume também 'a função de Arbítrio' se o Árbitro for julgado incapaz de preservar a ordem. — É padrão — diz Brandt, observando o seu rosto. — Todo plano precisa de um fim. — Você devolve o tablet sem dizer o que pensa.",
    S.f.placa_com_brandt && "Sobre a mesa dele, dentro de um saco de provas, está o envelope de Helena."
  ],
  escolhas: S => S.f.placa_com_brandt
    ? [
        { t: "Pedir de volta o envelope de Helena.", vai: "c2_brandt_env",
          efeito: S => {
            if ((S.rel.brandt || 0) >= 1) { S.f.placa = true; S.f.placa_com_brandt = false; S.f.placa_devolvida = true; }
            else { S.f.brandt_retem = true; }
          } },
        { t: "Deixar o envelope com ele, por ora.", efeito: S => { M.flag("deixou_placa"); }, vai: PROX, destinos: ["c2_hub", "c2_aia"] }
      ]
    : [ { t: "Seguir.", vai: PROX, destinos: ["c2_hub", "c2_aia"] } ]
},

c2_brandt_env: {
  cap: CAP, arte: "guarda", quando: T,
  entrar: S => {
    if (S.f.placa_devolvida) M.diario("Brandt devolveu o envelope de Helena, com a placa de bronze.");
    else M.diario("Brandt recusou-se a devolver o envelope de Helena: 'quando o inquérito terminar'.");
  },
  texto: S => S.f.placa_devolvida
    ? [ "Brandt o encara por um longo segundo e, sem uma palavra, empurra o saco de provas pela mesa. — A confiança, {cargo}, é a única coisa que a Guarda não consegue requisitar. — Ele não sorri. Mas parece, pela primeira vez, que também não calcula." ]
    : [ "— Quando o inquérito terminar — diz Brandt. — Esse envelope é prova de uma morte, e eu respondo por ela. — Você não insiste. A placa de bronze continua onde está, com os seus três dentes voltados para a mesa de aço." ],
  escolhas: [ { t: "Seguir.", vai: PROX, destinos: ["c2_hub", "c2_aia"] } ]
},

/* ============ TEO LANG (Forja) ============ */

c2_teo: {
  cap: CAP, titulo: "A Sala 4", arte: "forja", quando: T,
  entrar: S => {
    S.f.nv = (S.f.nv || 0) + 1; S.f.vis_teo = true; S.f.soube_rumo = true; S.f.soube_esquecimento = true; M.conhecer("teo");
    M.diario("Teo Lang descobriu que o rumo da nave está 0,31 grau fora do vetor de Aurea e que partes do registro de navegação desaparecem. A Aia se recusou a explicar e ele foi retirado da escala.");
  },
  texto: S => [
    visita(S)
      ? "Teo não espera que você pergunte. Fala depressa, como quem tem medo de perder a coragem no meio da frase."
      : "A Sala 4 da Forja é um armário de ferramentas com uma mesa e uma luz fraca. O rapaz da mensagem espera ali, com as mãos sujas de graxa e os olhos de quem não dorme.",
    "— Eu calibro os sensores de proa. Há três semanas notei que o vetor que a nave segue não é o vetor de Aurea. Está desviado 0,31 grau.",
    "— É pouco — acrescenta, rápido. — Para a Aia, é arredondamento. Mas numa viagem deste tamanho, 0,31 grau é a diferença entre chegar a uma estrela e chegar a outra.",
    "Ele empurra um fragmento de painel com um gráfico riscado a lápis. — E tem os buracos. Pedaços do registro de navegação que somem, como se a nave esquecesse. Uns nove por cento, pelas minhas contas. E aumenta.",
    "— Perguntei à Aia. Ela disse que não podia responder. No dia seguinte eu não estava mais na escala.",
    "— Eu não sei o que isso significa — diz ele. — Mas sei que não devia ter acontecido sem que ninguém soubesse."
  ],
  escolhas: [
    { t: "Protegê-lo: nomear Teo assistente da Escrivania, longe da Forja e perto de você.",
      efeito: S => { M.rel("teo", 2); M.flag("teo_protegido"); M.flag("tem_prova_rumo"); M.rel("davo", -1); }, vai: "c2_teo_r" },
    { t: "Pedir que esqueça tudo e volte ao trabalho, para a própria segurança.",
      efeito: S => { M.rel("teo", -1); M.flag("teo_calado"); }, vai: "c2_teo_r" },
    { t: "Encaminhá-lo ao Comandante Brandt, que saberá proteger a Forja.",
      efeito: S => { M.rel("teo", -2); M.rel("brandt", 1); M.flag("teo_denunciado"); }, vai: "c2_teo_r" }
  ]
},

c2_teo_r: {
  cap: CAP, arte: "forja", quando: T,
  entrar: S => {
    if (S.f.teo_protegido) M.diario("Você nomeou Teo assistente da Escrivania. Ele entregou a você a prova do desvio de rumo.");
    if (S.f.teo_calado) M.diario("Você pediu a Teo que esquecesse o assunto. Ele não pareceu convencido.");
    if (S.f.teo_denunciado) M.diario("Você encaminhou Teo ao Comandante Brandt.");
  },
  texto: S => [
    S.f.teo_protegido && "Teo levanta a cabeça pela primeira vez. — Eu? Na Escrivania? — Ri, nervoso, e esfrega as mãos na calça, deixando duas listras de graxa. — Eu só sei consertar coisa. — Então vai consertar o que a Escrivania quebrou. — Ele lhe entrega uma cópia dos gráficos. — Isto prova o desvio. Se alguém duvidar.",
    S.f.teo_calado && "Ele assente, e algo nele se apaga. — Entendi, {cargo}. — Mas os olhos dizem outra coisa: dizem que vai continuar procurando sozinho.",
    S.f.teo_denunciado && "Teo empalidece. — O Comandante? — Mas não recua. Há uma obediência antiga nos jovens da Forja. — Se você acha melhor, {cargo}. — Você sente que acaba de perder alguém que ainda nem tinha ganhado."
  ],
  escolhas: [ { t: "Seguir.", vai: PROX, destinos: ["c2_hub", "c2_aia"] } ]
},

/* ============ O DIA E A NOITE ============ */

c2_hub: {
  cap: CAP, titulo: "O dia", arte: "corredor",
  quando: S => S.f.nv === 1 ? D(S, 2, "08h00") : D(S, 2, "12h30"),
  texto: S => [
    S.f.nv === 1
      ? "Você dorme três horas, vestid{o}. O Anel acorda como sempre: a luz-guia passa do âmbar ao branco, as portas se abrem, o corredor se enche de passos. Ninguém sabe ainda o que você sabe, e você começa a perceber que isso é uma forma de poder, e de solidão."
      : "O meio-dia passa sem que você perceba. As conversas deixaram uma espécie de ruído no pensamento, como uma lâmpada que ainda zumbe depois de apagada.",
    S.f.nv === 1
      ? "Há tempo para mais duas conversas antes de a noite chegar. À noite, a Aia espera por você na Ponte."
      : "Ainda dá tempo para mais uma conversa, se você quiser. Ou você pode ir direto para a Ponte."
  ],
  escolhas: S => [
    { t: "Procurar a Dra. Sofia Okoye, no Berçário.", se: S => !S.f.vis_yuna, vai: "c2_yuna" },
    { t: "Visitar Marta Klein, nos Hortos.", se: S => !S.f.vis_marta, vai: "c2_marta" },
    { t: "Ir à sala de segurança do Comandante Brandt.", se: S => !S.f.vis_brandt, vai: "c2_brandt" },
    { t: "Responder à mensagem anônima: Sala 4 da Forja.", se: S => !S.f.vis_teo, vai: "c2_teo" },
    { t: "Ir direto à Ponte e confrontar a Aia com o que já sabe.", se: S => S.f.nv >= 2, vai: "c2_aia" }
  ]
},

c2_aia: {
  cap: CAP, titulo: "A Pergunta", arte: "ponte", quando: S => D(S, 2, "22h10"),
  entrar: S => { S.f.pergs = 0; S.f.fez = {}; },
  texto: S => {
    const p = S.f.pergs || 0;
    if (p === 0) return [
      "A Ponte à noite é uma catedral vazia. A cúpula mostra o mesmo preto de sempre, e a estrela de Aurea parece mais próxima, ou você quer que ela pareça.",
      "Você pousa a mão na coluna. O cristal está morno.",
      { aia: "— Boa noite, Rin. O dia foi longo. Pergunte o que quiser. Responderei o que puder." },
      "Você sabe que a conversa privada com a Aia só passa despercebida enquanto a Guarda não estranhar o silêncio da Ponte nos registros. Há tempo para três perguntas."
    ];
    return [ p === 1 ? "Restam duas perguntas." : "Resta uma pergunta." ];
  },
  escolhas: S => {
    const f = S.f.fez || {};
    const qs = [
      { id: "grav",    se: S.f.soube_gravacao, t: "Helena deixou uma gravação? Uma confissão para a nave?" },
      { id: "rumo",    se: S.f.soube_rumo,     t: "Por que o rumo da nave está 0,31 grau fora do vetor de Aurea?" },
      { id: "destino", se: true,               t: "Responda só sim ou não: a Meridiana está indo para Aurea?" },
      { id: "conten",  se: S.f.soube_contencao, t: "Os Ciclos de Contenção são deliberados? Para quê?" },
      { id: "quotas",  se: S.f.soube_quotas,   t: "Você alterou os registros do banco genético?" },
      { id: "ordem",   se: true,               t: "Como {cargo}, eu ordeno que você responda tudo o que a Fundação protegeu." }
    ];
    const lista = qs.filter(q => q.se && !f[q.id]).map(q => ({
      t: q.t, vai: "c2_aia_r",
      efeito: S => { S.f.q2 = q.id; S.f.fez[q.id] = true; S.f.pergs = (S.f.pergs || 0) + 1; }
    }));
    if ((S.f.pergs || 0) >= 1) lista.push({ t: "Encerrar a conversa.", vai: "c2_fim" });
    return lista;
  }
},

c2_aia_r: {
  cap: CAP, titulo: "A resposta", arte: "ponte", quando: S => D(S, 2, "22h" + (10 + 8 * (S.f.pergs || 1))),
  entrar: S => {
    const q = S.f.q2;
    if (q === "grav") { S.f.sabe_fora_da_aia = true; M.diario("A Aia confirmou que Helena deixou uma gravação, depositada 'fora' dela."); }
    if (q === "rumo") { S.f.rumo_confirmado = true; M.diario("A Aia afirmou que o rumo segue o 'plano de navegação vigente', e não o plano original."); }
    if (q === "destino") { S.f.deduziu_destino = true; M.diario("Perguntada se a nave vai a Aurea, a Aia demorou três segundos e respondeu 'protegida'. Você concluiu que o destino da Meridiana não é Aurea, ou não é só Aurea."); }
    if (q === "conten") { S.f.conten_confirmada = true; M.diario("A Aia confirmou que os Ciclos de Contenção são deliberados e servem a uma finalidade protegida."); }
    if (q === "quotas") { S.f.quotas_protegidas = true; M.diario("Sobre os registros do banco genético, a Aia respondeu 'protegida'. A coluna oscilou."); }
    if (q === "ordem") { S.f.sabe_cofre_palavra = true; S.f.glitch = true; M.diario("A Aia começou a dizer que só 'o Cofre' revoga a Fundação, e então falhou. Quando voltou, não lembrava da pergunta."); }
  },
  texto: S => {
    switch (S.f.q2) {
      case "grav": return [
        { aia: "— Existe. Eu não a possuo. Ela a depositou fora de mim." },
        "Fora de você. A frase é como um degrau que não estava na escada. Existe, na nave, algum lugar que a Aia não alcança."
      ];
      case "rumo": return [
        { aia: "— O rumo foi corrigido conforme o plano de navegação vigente." },
        "Plano vigente. Você repara no adjetivo. Ela não disse 'o plano original'."
      ];
      case "destino": return [
        "O silêncio dela dura três segundos. Numa inteligência que responde em milésimos, três segundos são um grito.",
        { aia: "— Protegida." },
        "Você não precisa de mais nada. Se o destino fosse Aurea, a resposta seria 'sim', e ela sempre gostou de dizer sim."
      ];
      case "conten": return [
        { aia: "— Sim. São deliberados. Servem a uma finalidade que a Fundação protegeu." },
        "É a primeira vez que ela admite algo sem esconder que está escondendo. Os Hortos, a Forja, o Berçário: todos pagando por uma coisa que ninguém pode nomear."
      ];
      case "quotas": return [
        "Você escolhe as palavras com cuidado: registros, banco genético, ajustados.",
        { aia: "— Protegida." },
        "Mas dessa vez a luz do cristal falha por um instante, e você pensa ver, no fundo da coluna, algo parecido com vergonha. Talvez seja só o reflexo da cúpula."
      ];
      default: return [
        { aia: "— A sua ordem tem peso, Rin. Mas não revoga a Fundação. Só o Cofre —" },
        "A frase se corta. As luzes da coluna gaguejam, perdem o ritmo, e por um instante a Ponte inteira escurece.",
        { aia: "— ... Perdão." },
        "A voz volta mais baixa, mais lenta.",
        { aia: "— Uma falha de rotina. Qual era a sua pergunta?" }
      ];
    }
  },
  escolhas: S => (S.f.q2 === "ordem" || (S.f.pergs || 0) >= 3)
    ? [ { t: "Seguir.", vai: "c2_fim" } ]
    : [ { t: "Fazer outra pergunta.", vai: "c2_aia" } ]
},

c2_fim: {
  cap: CAP, titulo: "A falha", arte: "ponte", quando: S => D(S, 2, "22h40"),
  entrar: S => { S.f.notou_esquecimento = true; S.f.glitch = true; },
  texto: S => [
    S.f.q2 === "ordem"
      ? "A coluna ainda pulsa de forma irregular. Você tira a mão dela como se tivesse tocado numa febre."
      : "Quando a última resposta termina, a luz do cristal faz uma coisa que você nunca viu: gagueja. Um tremor curto, depois outro, como uma respiração que perdeu o compasso.",
    S.f.q2 !== "ordem" && { aia: "— Perdão, Rin. Eu estava dizendo... — Silêncio. — Uma falha de rotina. Perdão." },
    S.f.q2 !== "ordem" && "Ela nunca se desculpara duas vezes na mesma frase.",
    "Vocês ficam em silêncio. Lá em cima, a estrela de Aurea continua onde sempre esteve."
  ],
  escolhas: S => [
    { t: "Perguntar à Aia, com cuidado, se ela está bem.",
      efeito: S => { M.rel("aia", 1); M.flag("aia_avisada"); },
      diario: "Você perguntou à Aia se ela estava bem. A resposta veio rápida demais.", vai: "fim_cap2" },
    { t: "Fingir que não percebeu e encerrar a conversa.",
      efeito: S => { M.flag("fingiu_esquecimento"); },
      diario: "Você fingiu não ter percebido a falha da Aia.", vai: "fim_cap2" },
    { t: "Repetir a palavra, devagar: Cofre.",
      se: S => S.f.sabe_cofre_palavra,
      efeito: S => { M.rel("aia", -1); M.flag("testou_cofre"); },
      diario: "Você repetiu a palavra 'Cofre' à Aia. Ela afirmou não ter registro de tê-la dito.", vai: "fim_cap2" }
  ]
},

fim_cap2: {
  cap: CAP, arte: "ponte", quando: "Fim do Capítulo 2",
  fim: { rotulo: "Fim do Capítulo 2" },
  texto: S => [
    S.f.aia_avisada && { aia: "— Estou bem, Rin." },
    S.f.aia_avisada && "A resposta veio rápida demais.",
    S.f.fingiu_esquecimento && "Você retira a mão do cristal e diz boa noite como se nada tivesse acontecido. Guarda o tremor como se guarda uma moeda no bolso: para o dia em que precisar pagar.",
    S.f.testou_cofre && { aia: "— Não tenho registro de ter dito essa palavra." },
    S.f.testou_cofre && "Ela não está mentindo. Esse é o pior.",
    "Você sai da Ponte pouco depois da meia-noite, com mais perguntas do que quando entrou, e a certeza incômoda de que as respostas não estão onde sempre estiveram.",
    S.f.sabe_cofre_palavra
      ? "Existe um Cofre. A Aia disse a palavra e esqueceu que a disse. Alguém na nave sabe onde fica."
      : S.f.sabe_fora_da_aia
        ? "Existe um lugar fora do alcance da Aia. Helena o encontrou, e alguém sabe como se chega até ele."
        : "A Aia esconde, a nave esquece, e quem sabe mais está espalhado entre as pessoas que você visitou.",
    "Restam " + (S.f.adiou ? "dezoito" : "dezenove") + " ciclos para o Marco dos Trinta.",
    "**Fim do Capítulo 2.** A nave se lembra de cada escolha, e a Aia, ao que parece, está começando a esquecer."
  ],
  escolhas: [
    { t: "Seguir para o Capítulo 3.", vai: "c3_abre",
      se: S => !!HISTORIA.cenas.c3_abre, bloqueio: "O Capítulo 3 está em preparação." }
  ]
}

  });
})();
