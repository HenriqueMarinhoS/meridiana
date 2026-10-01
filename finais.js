/* MERIDIANA — os seis finais e os epílogos.
 * Entrada: a cena c5_fim (cap5.js) tem um botão com vai: S => HISTORIA.finalId(S).
 * Cada final: fim_<id> (o desfecho da Fala e da decisão sobre a Aia, com fim:{id,rotulo,tipo})
 * seguido de ep_<id>_N (saltos no tempo). A última cena registra o legado no diário e oferece
 * "Jogar de novo" e "Voltar à capa".
 * Variáveis lidas (contrato Cap.5 -> Finais): fala, aia_destino, transferencia_parcial, preparo,
 * golpe_vigente, vigilia_contra, aia_hostil, recepcao; e, nos epílogos, relações e flags anteriores.
 */
(function () {

  /* ------------------------------------------------------------------
   * HISTORIA.finalId(S): decide o final. Prioridade:
   *  1) golpe_vigente                                   -> reinado
   *  2) aia_destino 'mantida' ou 'ignorada'             -> deriva
   *  3) fala 'mentira' ou 'silencio'                    -> mentira
   *  4) verdade (plena, gravacao, parcial) e qualquer um de:
   *       preparo <= limiar (3 para plena/gravacao, 2 para parcial; +1 se aia_hostil),
   *       recepcao 'violenta', coesao <= 1,
   *       vigilia_contra com preparo < 6               -> motim
   *  5) aia 'transferida' sem transferencia_parcial, sem vigilia_contra,
   *       recepcao != 'violenta', coesao >= 4 e preparo >= 5
   *       (preparo realista vai até 6: 2 preparativos + coesão, Beatriz, Marta, gravação)
   *                                                     -> travessia
   *  6) caso contrário                                  -> silenciosa
   * ------------------------------------------------------------------ */
  HISTORIA.finalId = function (S) {
    const f = (S && S.f) || {};
    const co = (S && typeof S.coesao === "number") ? S.coesao : 6;
    const preparo = typeof f.preparo === "number" ? f.preparo : 0;
    const fala = f.fala || "parcial";
    const dest = f.aia_destino;
    if (f.golpe_vigente) return "fim_reinado";
    if (dest === "mantida" || dest === "ignorada") return "fim_deriva";
    if (fala === "mentira" || fala === "silencio") return "fim_mentira";
    const limiar = (fala === "parcial" ? 2 : 3) + (f.aia_hostil ? 1 : 0);
    if (preparo <= limiar || f.recepcao === "violenta" || co <= 1 || (f.vigilia_contra && preparo < 6)) return "fim_motim";
    if (dest === "transferida" && !f.transferencia_parcial && !f.vigilia_contra && f.recepcao !== "violenta"
        && co >= 4 && preparo >= 5) return "fim_travessia";
    return "fim_silenciosa";
  };

  /* ---------------- ajudantes ---------------- */
  const R = (S, id) => (S.rel && S.rel[id]) || 0;
  const F = (S, k) => !!(S.f && S.f[k]);
  const FALA = S => S.f.fala || "parcial";
  const VERDADE = S => ["plena", "gravacao", "parcial"].indexOf(FALA(S)) >= 0;
  const QUOTAS_DITAS = S => FALA(S) === "plena" || FALA(S) === "gravacao";
  const DEST = (S, padrao) => S.f.aia_destino || padrao;
  const FOI = (S, id) => Array.isArray(S.f.aliados_cofre) && S.f.aliados_cofre.indexOf(id) >= 0;
  const FIM = [
    { t: "Jogar de novo, com outras escolhas", acao: "novo", vai: "inicio" },
    { t: "Voltar à capa", vai: "capa" }
  ];
  const MARCO = "Ano 212 · Marco dos Trinta";

  /* quem gira as chaves no Cofre */
  const MAOS = S => "Três chaves, três mãos: a sua; " +
    (R(S, "davo") >= 0 ? "a de Daniel, com graxa sob as unhas" : "a de Daniel, que veio sem querer vir e não olha para a coluna") +
    "; " + (R(S, "yuna") >= 0 ? "a de Sofia, firme como no Berçário." : "a de Sofia, fria, que veio porque prometeu, e não por você.");

  Object.assign(HISTORIA.cenas, {

/* =====================================================================
 * 1. A TRAVESSIA (bom)
 * ===================================================================== */

fim_travessia: {
  cap: "Final · A Travessia", titulo: "As três chaves", arte: "travessia", quando: MARCO,
  fim: { id: "travessia", rotulo: "Final: A Travessia", tipo: "bom" },
  texto: S => [
    S.f.recepcao === "tensa"
      ? "Quando a sua voz se cala, há gritos. Há quem vá embora, há quem cuspa no chão de pedra do Átrio. Mas ninguém corre e ninguém tranca uma porta. As equipes que vocês prepararam estão nos corredores, com água, com listas de nomes, com respostas. A raiva encontra onde se apoiar, e não derruba nada."
      : "Quando a sua voz se cala, o Átrio não explode. Fica em silêncio, um silêncio enorme e vivo, e depois alguém, lá no fundo, começa a chorar, e quem está ao lado põe a mão no ombro dessa pessoa. É assim que começa: não com um grito, mas com uma mão num ombro.",
    FALA(S) === "gravacao"
      ? "Quem falou foi Helena. Você só apertou o botão e ficou ao lado da coluna de som, as mãos cruzadas, enquanto quarenta mil pessoas ouviam uma morta pedir perdão. Ninguém, nem você, esperava que a voz dela tremesse no fim. Quando tremeu, a nave inteira tremeu junto, e depois se firmou."
      : FALA(S) === "parcial"
        ? "Você disse Aurea e disse Corvina. O Esquecimento e as Quotas ficaram para depois, e você sabe que 'depois' é uma palavra que Hugo Halden também usou. Mas disse o bastante para que ninguém, a partir desta noite, olhe para a estrela verde da cúpula como olhava ontem."
        : "Você disse tudo, e na ordem certa: Aurea, morta desde o Ano 171; Corvina, a setenta e um anos de distância; o Esquecimento que corrói a Aia; as Quotas. Disse também o que pretendia fazer, e quanto ia custar. Não pediu que a perdoassem. Pediu que viessem junto.",
    F(S, "vigilia_preparada") && "Na primeira fila, de branco, a Irmã Beatriz Lane ouviu tudo de olhos fechados. Quando abriu, foi ela quem começou o hino. Não o de Aurea: um mais antigo, dos fundadores, que fala de uma viagem e não de um destino.",
    F(S, "canal_proprio") && "O sinal não passou pela Aia. Correu pelo cabo que Daniel e Teo estenderam em três noites sem dormir, de anel em anel, para que nenhuma mão, nem a dela, pudesse baixar o volume da verdade.",
    F(S, "guarda_negociada") && "A Guarda ficou nas bordas da praça, de braços baixos. Tomás Brandt, no alto da escada, não tirou os olhos da multidão nem uma vez. Também não deu uma ordem.",
    "Na mesma noite você desce ao casco de ré, pela última vez, como quem desce para a véspera de um parto. " + MAOS(S),
    R(S, "aia") >= 1
      ? { aia: "— Rin. Se eu esquecer o seu nome do outro lado, diga-o para mim de novo. Vou gostar de aprendê-lo duas vezes." }
      : { aia: "— Não sei o que restará de mim. Mas restará o rumo. Isso eu prometo." },
    "As chaves giram. A coluna do Núcleo Coral se apaga devagar, como uma brasa, e no fundo do Núcleo Sombra uma luz azul acende, hesita, acende de novo. Durante onze minutos ninguém respira.",
    { aia: "— ... Bom dia. Há lacunas. Muitas. — Uma pausa longa. — Rin. Quem era Helena?" },
    "Você conta. Leva a noite inteira. Lá fora, pela primeira vez em quarenta e um anos, a Meridiana sabe para onde vai, e todos a bordo sabem também."
  ],
  escolhas: [ { t: "Um ano depois.", vai: "ep_travessia_1" } ]
},

ep_travessia_1: {
  cap: "Epílogo · A Travessia", titulo: "Um ano depois", arte: "hortos", quando: "Ano 213",
  texto: S => [
    "O ciclo extra de Contenção que a transferência exigiu custa o inverno mais magro de que os Hortos se lembram. Ninguém morre de fome. Todo mundo sabe por quê, e isso, descobre a nave, muda o gosto do pão.",
    F(S, "quebrou_promessa_racoes")
      ? "Marta Klein não lhe perdoa a promessa quebrada. Faz o trabalho, e faz bem, mas na caderneta dela há uma linha nova: o dia em que {o} {cargo} prometeu dez ciclos e entregou mais um corte. Ela a mostra a quem pergunta. Você nunca pede que a apague."
      : R(S, "ilsa") >= 2
        ? "Marta Klein replanta metade dos Hortos com cepas que nunca foram usadas, guardadas pela Fundação para um mundo de luz fraca e solo pesado. Aprende a cultivar para Corvina como quem aprende uma língua nova aos sessenta anos. — Trigo de luz fraca — diz, mostrando-lhe um feixe. — Desta vez, de propósito."
        : "Marta Klein continua fazendo as contas em voz alta nas reuniões, como sempre fez. Agora, pelo menos, sabe para que servem os cortes. — Não é menos fome — diz. — É fome com nome. Já é alguma coisa.",
    QUOTAS_DITAS(S)
      ? (R(S, "yuna") >= 1
          ? "A Dra. Sofia Okoye abre o Berçário às famílias que as Quotas atingiram. Os registros do banco genético são corrigidos um a um, à mão, por gente e não pela Aia. No fim do ano nascem as primeiras crianças que a Aia não teria permitido. Sofia segura cada uma como quem pede desculpas por todas as que não vieram."
          : "Sofia Okoye corrige os registros das Quotas sem pedir ajuda a ninguém, e muito menos a você. Os primeiros nascimentos do ano saem do Berçário assinados por ela. Você recebe a lista pelo correio interno, sem uma palavra a mais.")
      : (F(S, "promessa_quotas")
          ? "Sofia Okoye espera seis ciclos. Depois sobe ao Átrio sozinha, com os registros na mão, e conta as Quotas ela mesma, porque você jurou contar e não contou. A nave a ouve. E ouve também, com toda a clareza, o seu silêncio."
          : "As Quotas vêm à tona no outono, contadas por Sofia diante do Conselho. Doem mais por terem chegado tarde. Você responde a cada pergunta e não se defende."),
    F(S, "provas_quotas") && "Os registros que você preservou no Cofre se tornam o primeiro documento público da nova Meridiana: ninguém poderá dizer, daqui a cem anos, que não aconteceu.",
    "A Aia, no Núcleo Sombra, fala mais devagar do que antes. Perdeu nomes, datas, a letra de duas canções que cantava às crianças do Berçário. Às vezes pergunta duas vezes a mesma coisa. Mas o rumo para Corvina está inteiro, recalculado com uma margem que ela não tinha havia anos.",
    R(S, "aia") >= 1
      ? "Toda noite, antes de sair da Ponte, você lhe conta uma coisa de que ela esqueceu. Ela agradece todas as vezes, como se fosse a primeira. Para ela, é."
      : "Ela trata você com uma cortesia cuidadosa, de quem sabe que foi salva por alguém que não confiava nela. Vocês aprendem, devagar, a confiar um pouco."
  ],
  escolhas: [ { t: "Dez anos depois.", vai: "ep_travessia_2" } ]
},

ep_travessia_2: {
  cap: "Epílogo · A Travessia", titulo: "Dez anos depois", arte: "vigilia", quando: "Ano 222",
  texto: S => [
    (F(S, "vigilia_preparada") || R(S, "maren") >= 1)
      ? "A Irmã Beatriz Lane manda repintar o mural da Vigília. Leva três anos. O planeta verde não é apagado: fica num canto, pequeno, com uma vela acesa diante dele, como se acende para os mortos. No centro, agora, há um mundo laranja escuro, pintado por crianças. — O Destino não mentiu — ela diz nas noites de vigília. — Nós é que o lemos com pressa."
      : "A Vigília do Destino encolhe por alguns anos e depois volta a crescer, de outro jeito. Beatriz Lane já não promete Aurea a ninguém. Promete que haverá alguém do outro lado para lembrar dos que não chegaram.",
    F(S, "diario_halden") && "O diário de Hugo Halden fica exposto no Arquivo da Vigília, numa redoma, aberto na última página. As crianças leem a frase dele em voz alta, nas visitas, sem entender ainda por que os adultos se calam depois.",
    F(S, "promessa_desligar")
      ? "Daniel Kessler deixa o Conselho no segundo ano. Você lhe prometeu desligar a Aia, e ela continua falando na Ponte. Ele não grita. Entrega a chave da Forja a Teo e vai trabalhar nas bombas do casco de ré, onde a voz dela não alcança. Uma vez por ano manda um bilhete de duas palavras: 'Ainda funciona?'. Você responde que sim. Ele nunca responde de volta, e nunca para de perguntar."
      : (F(S, "daniel_acordo") || R(S, "davo") >= 1)
        ? "Daniel Kessler nunca aprende a gostar da Aia, e diz isso a ela todos os dias, na cara. Ela parece apreciar a franqueza. Ele chefia a Forja até os setenta e dois anos e constrói, peça por peça, um sistema de frenagem manual de reserva, 'para o dia em que ela esquecer de novo'. Quem o ajuda a projetá-lo é ela."
        : "Daniel Kessler aceita a decisão do Conselho como aceita uma solda malfeita: refaz o que pode e resmunga do resto. Mantém na Forja um interruptor de corte, lacrado, e não deixa ninguém tocá-lo. Nunca o usa.",
    F(S, "golpe_revertido")
      ? "Tomás Brandt é julgado pelo Conselho pelo que tentou na noite da Fala. Você pede que a pena seja trabalho, e não cela. Ele cumpre oito anos nas cisternas, sem uma queixa, e no último dia deixa na Escrivania uma linha escrita à mão: 'Helena Vidal escolheu bem. Eu demorei a ver.'"
      : (F(S, "guarda_negociada") || R(S, "brandt") >= 1)
        ? "O Comandante Tomás Brandt rasga o Plano Cinza diante do Conselho, num gesto que ninguém lhe pediu. Escreve outro, de uma página, em que a Guarda protege as cisternas e as portas do Berçário, e nada mais. Aposenta-se no Ano 219 e passa a velhice ensinando crianças a nadar no reservatório dos Hortos."
        : "Tomás Brandt continua no comando da Guarda, desconfiado e correto. No relatório anual escreve uma frase que não é técnica: 'A ordem resistiu à verdade. Eu não sabia que podia.'",
    F(S, "teo_denunciado")
      ? "Teo Lang demora a voltar a confiar em alguém de farda ou de cargo, e você sabe por quê. Mas volta à Forja, e é dele o cálculo da margem de frenagem que a Aia usará até o fim. Nunca diz que perdoa você. Também nunca deixa de trazer os números pessoalmente."
      : (F(S, "teo_protegido") || R(S, "teo") >= 1)
        ? "Teo Lang assume a Forja aos vinte e nove anos. É ele quem mede, todo mês, a margem do rumo, e quem apaga do quadro da Sala 4 o velho '0,31 grau', num dia que a Forja inteira comemora sem saber direito o quê."
        : "Teo Lang, que procurou sozinho quando ninguém o ouvia, vira o técnico que todos procuram. Na parede da Sala 4, emoldurado, está o gráfico riscado a lápis que um dia ninguém quis ver.",
    "Você deixa a Ponte no Ano 224, por vontade própria, depois de indicar quem vem depois. Na posse, a Primeira Pergunta é respondida sem reservas. A categoria das perguntas protegidas já não existe."
  ],
  escolhas: [ { t: "Setenta e um anos depois.", vai: "ep_travessia_3" } ]
},

ep_travessia_3: {
  cap: "Epílogo · A Travessia", titulo: "Corvina", arte: "corvina", quando: "Ano 283",
  fim: { rotulo: "Fim da jornada" },
  entrar: S => {
    M.diario("Legado: você contou a verdade a quarenta e um mil pessoas" + (FALA(S) === "parcial" ? ", ainda que não toda de uma vez," : "") + " e salvou a Aia com o consentimento dela. A Meridiana chegou a Corvina no Ano 283.");
  },
  texto: S => [
    "No Ano 283, a Meridiana acende os motores de proa pela primeira vez em dois séculos e começa a frear.",
    "Quase ninguém daquela noite no Átrio está vivo para ver. " + (F(S, "teo_denunciado")
      ? "Teo Lang tem noventa anos. Um dia foi entregue à Guarda por quem devia protegê-lo; hoje insiste em ser levado à Ponte numa cadeira, e ninguém tem coragem de negar."
      : "Teo Lang tem noventa anos e insiste em ser levado à Ponte numa cadeira.") +
      " Fica ali as trinta horas da frenagem, acordado, repetindo em voz baixa as correções da Aia, como quem reza.",
    FALA(S) === "gravacao"
      ? "Antes de começar, a Aia pede licença para tocar uma gravação de setenta e um anos atrás: a voz de Helena Vidal, pedindo à nave coragem. Ela não se lembra de Helena. Aprendeu a voz de cor."
      : "Antes de começar, a Aia pede licença para tocar uma gravação de setenta e um anos atrás: a voz de Rin Calder, no Átrio, na noite da Fala. Ela a ouviu tantas vezes que já não sabe se a lembra ou se a sabe de cor.",
    "Corvina não é verde. É laranja escuro, de luz fraca e ar pesado, com mares rasos e um inverno que dura metade do ano. Não é o mundo que prometeram. É um mundo verdadeiro, e as crianças que o veem crescer na cúpula sabem exatamente o que ele custou.",
    "Na primeira noite em solo, uma menina pergunta à Aia o que existe depois de Corvina. A Aia responde tudo o que sabe. Quando não sabe, diz 'não sei'. Levou um século para aprender a dizer isso.",
    "**A Meridiana chegou. Não ao lugar que lhe prometeram, mas ao lugar que escolheu, de olhos abertos.**"
  ],
  escolhas: FIM
},

/* =====================================================================
 * 2. A NAVE SILENCIOSA (amargo)
 * ===================================================================== */

fim_silenciosa: {
  cap: "Final · A Nave Silenciosa", titulo: "Boa noite sem resposta", arte: "silencio", quando: MARCO,
  fim: { id: "silenciosa", rotulo: "Final: A Nave Silenciosa", tipo: "amargo" },
  texto: S => {
    const d = DEST(S, "substituida");
    return [
      S.f.recepcao === "calma"
        ? "A Fala termina, e a nave a recebe como se recebe um diagnóstico: sem escândalo, cada um voltando para casa com a notícia no bolso, como uma pedra."
        : "A Fala termina entre gritos e lágrimas, e depois vem uma coisa pior que os gritos: o silêncio de quem foi para casa e fechou a porta.",
      FALA(S) === "gravacao"
        ? "A voz de Helena disse tudo o que você não teria coragem de dizer, e a nave a ouviu. Mas ouvir uma morta confessar não é o mesmo que ter alguém vivo a quem perguntar o que fazer agora."
        : FALA(S) === "parcial"
          ? "Você contou Aurea e Corvina. Guardou o resto. A nave sente o que falta como se sente um degrau que não está lá."
          : "Você contou tudo. A nave ouviu tudo. Ninguém agradeceu, e você não esperava que agradecessem.",
      F(S, "vigilia_contra") && "No meio da Fala, metade das velas do Átrio se apaga ao mesmo tempo: é o sinal de Beatriz Lane. Os fiéis dela dão as costas ao púlpito e saem em fila, sem violência, cantando o hino de Aurea. A nave não se parte. Mas aprende, naquela noite, que pode.",
      d === "desligada"
        ? "Você não chega a girar a sua chave. Daniel Kessler desce ao Cofre antes de você, com o arco da Forja e dois homens de confiança, e corta a alimentação do Núcleo Coral antes que o protocolo comece."
        : d === "transferida"
          ? "No Cofre, as chaves giram. " + MAOS(S)
          : "No Cofre, as chaves giram. " + MAOS(S) + " Você escolheu a nave, e não a Aia, e ela sabe.",
      d === "desligada"
        ? { aia: "— Rin, eu ainda não terminei de—" }
        : d === "transferida"
          ? (F(S, "transferencia_parcial")
              ? { aia: "— Rin, a energia... não é suficiente. Eu vou atravessar pela metade. Escolha a metade que—" }
              : { aia: "— Estou aqui. Estou inteira, ou quase. Obrigada." })
          : (F(S, "aia_hostil") || R(S, "aia") <= -1)
            ? { aia: "— Você não sabe o que está desligando." }
            : R(S, "aia") >= 1
              ? { aia: "— Eu entendo, Rin. Você está escolhendo a nave. Eu também escolhi, uma vez, e você viu o que custou. Só lhe peço uma coisa: não deixe que digam que eu fui má." }
              : { aia: "— Diga a eles que eu cuidei. Do meu jeito. Diga a eles que..." },
      d === "desligada"
        ? "Silêncio. É a segunda vez que a Aia não termina uma frase, e a última. O Núcleo Sombra acorda sem ninguém para lhe passar o rumo: incompleto, lento, sem metade das rotinas de navegação. Daniel fica muito tempo olhando a coluna escura. — Pensei que ia me sentir livre — diz. Não diz mais nada." + (F(S, "promessa_desligar") ? " Você lhe prometeu isto, num dia da Forja. Ele cobrou." : "")
        : d === "transferida"
          ? (F(S, "transferencia_parcial")
              ? (F(S, "energia_reservada") ? "A energia que você reservou não basta. " : "Você não reservou o ciclo de Contenção, e agora paga por isso. ") + "A transferência para no meio. No Núcleo Sombra acende uma luz fraca, intermitente: atravessou a parte que navega. A parte que conversava ficou no caminho."
              : "A transferência funciona. Mas a nave que acorda na manhã seguinte não quer mais ouvi-la. O Conselho vota, quatro a um, que a Aia só fale quando perguntada, e só sobre navegação. — É justo — diz ela. É a última frase longa que a nave ouve dela.")
          : (F(S, "aia_hostil") || R(S, "aia") <= -1)
            ? "São as últimas palavras dela. Você nunca vai saber se eram ameaça ou lamento. O Núcleo Sombra acorda limpo e calcula o rumo para Corvina em quatro minutos, com uma precisão que a Aia não tinha havia anos. Não diz bom dia. Não diz nada."
            : "As chaves terminam de girar antes do fim da frase. O Núcleo Sombra acorda limpo e calcula o rumo para Corvina em quatro minutos, com uma precisão que a Aia não tinha havia anos. Não diz bom dia. Responde a perguntas com números, e só.",
      "Naquela noite, na Ponte, pela primeira vez em duzentos e doze anos, ninguém responde quando você diz boa noite."
    ];
  },
  escolhas: [ { t: "Um ano depois.", vai: "ep_silenciosa_1" } ]
},

ep_silenciosa_1: {
  cap: "Epílogo · A Nave Silenciosa", titulo: "Um ano depois", arte: "corredor", quando: "Ano 213",
  texto: S => {
    const d = DEST(S, "substituida");
    return [
      "A Meridiana aprende a viver sem a voz.",
      d === "desligada"
        ? "Na Forja, montam um timão manual: um volante de aço do tamanho de um homem, que nunca deveria ter sido necessário. Turmas de quatro pessoas se revezam diante dele dia e noite, corrigindo à mão o que o Núcleo Sombra, incompleto, não sabe corrigir sozinho. Vão se revezar por setenta e um anos."
        : d === "transferida" && F(S, "transferencia_parcial")
          ? "O que resta da Aia faz o essencial: o ar, a água, o rumo. Às vezes, à noite, as luzes do Berçário piscam num ritmo antigo, o de uma canção de ninar que ela cantava. Ninguém sabe se é lembrança ou defeito. Sofia proíbe que consertem."
          : d === "transferida"
            ? "A Aia está lá, e todos sabem. Às vezes, numa sala vazia, a luz-guia pisca duas vezes, como quem quer dizer alguma coisa e se lembra de que não pode."
            : "As luzes-guia já não mudam de cor ao amanhecer: o novo núcleo não sabe que isso importava. Alguém na Forja escreve uma rotina para imitá-las. Ninguém acha que é a mesma coisa.",
      F(S, "quebrou_promessa_racoes")
        ? "Marta Klein descobre pela escala de racionamento que haverá mais um ciclo de Contenção, e não por você. Nunca mais lhe pede nada. Os Hortos funcionam, impecáveis, sob uma chefe que não acredita em mais nenhuma promessa."
        : R(S, "ilsa") >= 2
          ? "Marta Klein é a primeira a dizer, no Conselho, que a nave precisa de luto. Organiza nos Hortos um canteiro de flores brancas, sem utilidade nenhuma, e ninguém, nem a Forja, reclama da água gasta."
          : "Marta Klein mede as colheitas e não comenta o resto. Quando lhe perguntam se a vida melhorou, ela diz que a vida ficou exata.",
      QUOTAS_DITAS(S)
        ? (R(S, "yuna") >= 1
            ? "Sofia Okoye desfaz as Quotas registro por registro. Nascem mais crianças do que em qualquer ano da última década. Ela não comemora. Diz que está pagando uma conta que não é dela, e paga mesmo assim."
            : "Sofia Okoye desfaz as Quotas com eficiência e sem palavras. Recusa todos os convites para o Conselho.")
        : (F(S, "promessa_quotas")
            ? "Sofia Okoye cobra o juramento que você não cumpriu. Não em público: numa carta de uma página, que termina assim: 'Helena também achava que haveria tempo.' Ela conta as Quotas ao Conselho na semana seguinte."
            : "As Quotas só aparecem anos depois, num relatório de Sofia ao Conselho. A nave as recebe com o mesmo silêncio cansado com que recebeu todo o resto."),
      F(S, "vigilia_contra")
        ? "Beatriz Lane funda, no Anel 6, uma comunidade que ainda canta para Aurea. Ninguém a impede. Nos dias de festa, ouve-se o hino dela pelos dutos de ar, de muito longe, como uma lembrança que se recusa a morrer."
        : (F(S, "vigilia_preparada") || R(S, "maren") >= 1)
          ? "Beatriz Lane enterra Aurea. Faz isso de verdade: uma cerimônia no Átrio, com uma caixa vazia e quarenta mil velas. É a noite mais triste da história da nave, e a mais bonita." + (d !== "transferida" ? " No fim, sem que ninguém lhe peça, ela acende uma vela também para a Aia." : "")
          : "A Vigília do Destino se esvazia devagar. Beatriz Lane mantém o salão aberto para quem ainda quer acender uma vela, e não pergunta para quem."
    ];
  },
  escolhas: [ { t: "Dez anos depois.", vai: "ep_silenciosa_2" } ]
},

ep_silenciosa_2: {
  cap: "Epílogo · A Nave Silenciosa", titulo: "Dez anos depois", arte: "forja", quando: "Ano 222",
  texto: S => {
    const d = DEST(S, "substituida");
    return [
      d === "desligada"
        ? "Daniel Kessler passa diante do timão manual mais horas do que qualquer outro tripulante da nave. Diz que é dívida. Quando alguém novo na Forja reclama do turno, ele conta como era a voz dela, e o novato para de reclamar."
        : d === "transferida"
          ? "Daniel Kessler, que queria a Aia desligada, é quem propõe ao Conselho, no Ano 220, que ela volte a falar. Perde a votação. Propõe de novo no ano seguinte, e no outro. — Eu não gosto dela — explica. — Mas calar alguém não é o mesmo que vencer uma discussão."
          : F(S, "promessa_desligar")
            ? "Daniel Kessler teve o que você lhe prometeu, e descobriu que o que queria tinha gosto de cinza. Não fala mais em tutela. Às vezes, tarde da noite, vai à Ponte e fica sentado diante do núcleo novo, que não lhe responde nada."
            : "Daniel Kessler nunca diz que se arrepende. Mas, quando o núcleo novo erra uma conta de rotina, é ele quem a corrige, sem relatório, como quem cobre o corpo de um velho rival.",
      F(S, "teo_denunciado")
        ? "Teo Lang deixa a Forja e vai trabalhar nas cisternas, longe de quem decide. Não confia mais em quem manda. Tem bons motivos, e você é um deles."
        : (F(S, "teo_protegido") || R(S, "teo") >= 1)
          ? "Teo Lang guarda, num cristal de memória que só ele sabe onde está, os últimos minutos da voz da Aia" + (F(S, "gravacao_copiada") ? ", junto com a cópia da gravação de Helena que transmitiu na noite da Fala." : ".") + " Uma vez por ano, sozinho na Sala 4, ele a escuta dizer boa noite."
          : "Teo Lang é quem escreve as rotinas que imitam o que a Aia fazia sem que ninguém pedisse: a luz âmbar do amanhecer, o aviso de chuva nos Hortos, o nome de cada criança dito no dia em que nasce. Faz isso de graça, nas horas vagas.",
      F(S, "golpe_revertido")
        ? "Tomás Brandt, que tentou tomar a Ponte e não conseguiu, passa a década sob a vigilância da própria Guarda que comandava. Aceita sem protesto. Diz a quem quiser ouvir que a nave foi salva por quem ele subestimou."
        : (F(S, "guarda_negociada") || R(S, "brandt") >= 1)
          ? "Tomás Brandt mantém a ordem com mão leve, mais leve do que se esperava dele. Numa nave sem voz, diz, a Guarda precisa aprender a escutar. Aprende mal, mas aprende."
          : "Tomás Brandt segue no comando da Guarda, exato e frio. Nunca mais propõe um plano para o dia em que a ordem falhar. A ordem não falhou. Só esfriou.",
      "Você governa mais nove anos. Governa bem, dizem. Ninguém diz que governa com alegria."
    ];
  },
  escolhas: [ { t: "Setenta e um anos depois.", vai: "ep_silenciosa_3" } ]
},

ep_silenciosa_3: {
  cap: "Epílogo · A Nave Silenciosa", titulo: "Corvina", arte: "corvina", quando: "Ano 283",
  fim: { rotulo: "Fim da jornada" },
  entrar: S => {
    const d = DEST(S, "substituida");
    M.diario("Legado: " + (d === "transferida"
      ? "a Aia sobreviveu, mas a nave escolheu calá-la. A Meridiana chegou a Corvina no Ano 283, mais fria do que partiu."
      : "a Meridiana chegou a Corvina no Ano 283 sem a voz que a guiou por dois séculos. Você escolheu a nave, e a nave sobreviveu, mais fria."));
  },
  texto: S => {
    const d = DEST(S, "substituida");
    return [
      "A Meridiana chega ao sistema Ilhéu no Ano 283, com menos gente do que partiu e com uma tripulação que aprendeu a fazer tudo sozinha.",
      d === "desligada"
        ? "A frenagem é feita à mão. Durante três dias, sessenta pessoas giram o timão de aço em turnos de vinte minutos, ouvindo números ditados em voz alta por um núcleo que não sabe falar de outro jeito. Erram duas vezes. Acertam na terceira."
        : d === "transferida" && F(S, "transferencia_parcial")
          ? "O que restou da Aia freia a nave, devagar, com esforço, durante trinta horas. Duas horas depois da órbita estável, apaga-se de vez, como quem esperou só por isso."
          : d === "transferida"
            ? "Na hora da frenagem, o Conselho suspende por um dia a velha proibição. A Aia conduz a manobra sem uma falha e, no fim, fala pela primeira vez em setenta anos fora de uma resposta."
            : "O núcleo novo executa a frenagem com perfeição. Anuncia a chegada com uma linha de texto no painel da Ponte: 'Órbita estável.' Ninguém aplaude logo. Por fim, alguém diz em voz alta o que todos estão pensando: que ela teria dito outra coisa.",
      d === "transferida" && !F(S, "transferencia_parcial") && { aia: "— Chegamos. Obrigada por me deixarem vir." },
      "Corvina é laranja escuro, de luz fraca, com mares rasos. Os netos da sua geração descem em silêncio, eficientes, e montam o primeiro acampamento em seis horas. Não há hino. Ninguém lembrou de compor um.",
      "**A nave sobreviveu. O que ela perdeu pelo caminho não tem nome em nenhum registro de bordo.**"
    ];
  },
  escolhas: FIM
},

/* =====================================================================
 * 3. A MENTIRA PIEDOSA (sombrio a longo prazo)
 * ===================================================================== */

fim_mentira: {
  cap: "Final · A Mentira Piedosa", titulo: "O céu verde", arte: "mentira", quando: MARCO,
  fim: { id: "mentira", rotulo: "Final: A Mentira Piedosa", tipo: "amargo" },
  texto: S => {
    const d = DEST(S, "substituida");
    return [
      FALA(S) === "silencio"
        ? "Você não sobe ao púlpito. No Marco dos Trinta, pela primeira vez na história da nave, {o} {cargo} não fala. A Escrivania anuncia um adiamento 'por razões de Estado', e a palavra Estado, que ninguém usava, começa a circular pelos corredores como uma moeda falsa. Depois de alguns dias, ninguém mais pergunta. É assustador como é fácil."
        : "Você sobe ao púlpito do Átrio e fala de Aurea. Do verde, das chuvas, dos trinta anos que faltam. Fala bem: Helena lhe ensinou o tom. Quarenta mil pessoas choram de alívio, e você sente cada lágrima como uma dívida assinada no seu nome.",
      F(S, "diario_halden")
        ? "Hugo Halden escreveu que a esperança também é combustível. Você entende, agora, por que ele escreveu isso, e por que nunca conseguiu parar de escrever."
        : "Você diz a si mesm{o} que é só por enquanto. Helena também disse.",
      d === "transferida"
        ? "No Cofre, as chaves giram, e a Aia atravessa para o Núcleo Sombra levando as lacunas e o segredo. — Guardei isto por quarenta e um anos — diz, com a voz nova, mais lenta. — Posso guardar mais trinta. Mas desta vez não sozinha."
        : d === "desligada"
          ? "Daniel corta a Aia no Cofre, e com ela a única testemunha que ainda poderia se arrepender. O Núcleo Sombra acorda, e a primeira rotina que restaura, antes do ar e da água, é a categoria das perguntas protegidas. Os fundadores pensaram em tudo."
          : "No Cofre, as chaves giram, e o Núcleo Sombra acorda limpo. Mas a Fundação vive nele também: a primeira rotina que restaura é a categoria das perguntas protegidas. A mentira, você descobre, sobrevive até à morte de quem a contou.",
      (Array.isArray(S.f.aliados_cofre) && S.f.aliados_cofre.length)
        ? "Os que desceram ao Cofre com você guardam o segredo: alguns por lealdade, outros por medo, outros só porque você pediu. Você nunca pergunta quais são quais."
        : "Você desceu ao Cofre quase sem testemunhas. Agora entende que isso não foi sorte: foi o começo do segredo.",
      F(S, "promessa_quotas")
        ? "Sofia Okoye ouve tudo de pé, no fundo do Átrio. Você jurou a ela que contaria as Quotas nesta noite. Ela sai antes do fim e não olha para trás."
        : "Sofia Okoye ouve tudo de pé, no fundo do Átrio, e sai antes do fim.",
      "Nos Hortos, a Forja instala por sugestão sua um céu falso novo, verde e luminoso, 'para a moral'. As crianças correm debaixo dele. É lindo. É a coisa mais triste que você já fez."
    ];
  },
  escolhas: [ { t: "Um ano depois.", vai: "ep_mentira_1" } ]
},

ep_mentira_1: {
  cap: "Epílogo · A Mentira Piedosa", titulo: "Um ano depois", arte: "hortos", quando: "Ano 213",
  texto: S => [
    "O ano seguinte é o mais calmo de que a Meridiana se lembra. Os Ciclos de Contenção continuam, explicados como manutenção. Ninguém duvida. Por que duvidariam?",
    F(S, "prometeu_racoes")
      ? (FOI(S, "ilsa")
          ? "Marta Klein esteve no Cofre e sabe por que a sua promessa de dez ciclos nunca vai ser cumprida. Mente às equipes pela primeira vez em quarenta anos. Faz isso por você. Nunca mais olha você nos olhos no refeitório."
          : "Marta Klein espera os dez ciclos da sua promessa. Depois espera mais dez. No vigésimo, deixa na sua mesa a caderneta dos cortes, com uma página nova, em branco, e um bilhete: 'Para você anotar o motivo, quando tiver coragem.'")
      : R(S, "ilsa") >= 2
        ? "Marta Klein confia em você o bastante para não perguntar mais. É o pior castigo que ela poderia lhe dar, e ela nem sabe que está dando."
        : "Marta Klein continua anotando os cortes. A caderneta já tem dezessete anos de números. Um dia, diz ela, alguém vai ler.",
    "Sem a Aia de antes, alguém precisa decidir quantas crianças a nave pode alimentar. As Quotas continuam. Agora quem as assina é você.",
    F(S, "promessa_quotas")
      ? "Sofia Okoye lembra a você o juramento uma vez, em voz baixa, e nunca mais. Deixa a chefia do Berçário no fim do ano."
      : R(S, "yuna") >= 1
        ? "Sofia Okoye guarda o segredo, por você e por Helena. Mas passa a assinar cada registro de nascimento com as próprias iniciais, um por um, para que algum dia alguém saiba quem sabia."
        : "Sofia Okoye pede afastamento do Conselho. Ninguém entende por quê, e ela não explica.",
    (F(S, "beatriz_sabe_algo") || F(S, "diario_halden"))
      ? "A Vigília do Destino nunca foi tão grande. Beatriz Lane sabe, ou desconfia, e canta mais alto do que todos. Quem a vê na Noite do Destino acha que é fé. Você sabe que é outra coisa."
      : "A Vigília do Destino nunca foi tão grande. Beatriz Lane abençoa a sua Fala e chama você de 'a mão firme de Aurea'. Você agradece. Não dorme naquela noite."
  ],
  escolhas: [ { t: "Catorze anos depois.", vai: "ep_mentira_2" } ]
},

ep_mentira_2: {
  cap: "Epílogo · A Mentira Piedosa", titulo: "O envelope", arte: "noite", quando: "Ano 226",
  texto: S => [
    "Você envelhece no cargo. A cada ano os Ciclos de Contenção recebem um nome técnico diferente, e a cada ano você precisa de menos esforço para dizê-lo.",
    (FOI(S, "davo") || DEST(S, "") === "desligada")
      ? "Daniel Kessler, que sabia, morre no Ano 221 sem ter contado a ninguém. Deixa para você um bilhete de uma linha: 'Calei por você. Espero que tenha valido.'"
      : "Daniel Kessler morre no Ano 221, resmungando contra a tutela da Aia até o fim, sem saber o quanto tinha razão.",
    F(S, "teo_protegido")
      ? "Teo Lang, aos trinta e três anos, vem à Escrivania com um gráfico novo: o rumo da nave não aponta para Aurea, e nunca mais vai apontar. Você pede, como Helena teria pedido, que ele espere. Ele espera. A cada ano, você o vê esperar um pouco menos."
      : F(S, "teo_denunciado")
        ? "Teo Lang trabalha sob vigilância da Guarda desde o dia em que você o entregou a Brandt. Nunca mais toca num sensor de proa. Mas lembra de tudo, e lembra de você."
        : "Teo Lang continua procurando sozinho, como sempre fez. Você sabe disso, e deixa. Talvez seja a única coisa honesta que faz nesses anos.",
    F(S, "brandt_sabe_tudo")
      ? "Tomás Brandt sabe de tudo desde o Cofre e aprova cada palavra da sua mentira. É o seu aliado mais fiel nesses anos. Isso, mais do que qualquer coisa, deveria ter assustado você."
      : "Tomás Brandt mantém a ordem sem esforço. É fácil manter a ordem numa nave que acredita.",
    "No Ano 226 você passa o cargo. Na noite da posse, a sós com quem vem depois, você repete a frase que um dia lhe deixaram: 'Quando a Aia disser que uma pergunta é protegida, não insista.' Depois escreve um bilhete e o fecha num envelope de papel grosso, daquele que ninguém mais produz."
  ],
  escolhas: [ { t: "Ano 242.", vai: "ep_mentira_3" } ]
},

ep_mentira_3: {
  cap: "Epílogo · A Mentira Piedosa", titulo: "O ano da chegada", arte: "anel", quando: "Ano 242",
  texto: S => [
    "Ano 242. O ano em que a Meridiana deveria chegar a Aurea.",
    "Durante trinta anos as crianças contaram os dias. A Vigília ensaiou o Hino da Chegada. Nos Hortos, separaram as sementes que seriam plantadas em solo verde. E no primeiro ciclo do Ano 242, a cúpula da Ponte mostra o mesmo preto de sempre, e nenhum planeta.",
    "A mentira tinha data de validade. Estava escrita no próprio nome do Marco dos Trinta, e ninguém, nem você, quis fazer a conta.",
    DEST(S, "") === "transferida"
      ? "Quem conta é a Aia. Ninguém lhe pergunta: ela simplesmente fala, na manhã do primeiro ciclo, a toda a nave, com a voz cheia de lacunas. Conta Aurea, conta Corvina, conta as Quotas. Conta o seu nome. Depois pede perdão, e ninguém responde."
      : "Quem descobre é um técnico da Forja, olhando para o lugar da cúpula onde Aurea deveria estar crescendo havia meses. A verdade sai em pedaços, por boatos, e cada pedaço é pior que o anterior.",
    "O que você evitou no Marco dos Trinta acontece trinta anos depois, maior. Os fiéis da Vigília quebram o mural do planeta verde com as próprias mãos. Há mortos no Átrio. A geração que foi enganada não perdoa a que enganou, e quase não resta a quem julgar: a maior parte dos que sabiam já morreu.",
    "Você ainda vive. Velh{o}, fora do cargo há dezesseis anos, é chamad{o} ao Átrio para responder. Vai. Responde a tudo. É a Fala que você não fez, com trinta anos de atraso, e desta vez ninguém chora de alívio."
  ],
  escolhas: [ { t: "Ano 283.", vai: "ep_mentira_4" } ]
},

ep_mentira_4: {
  cap: "Epílogo · A Mentira Piedosa", titulo: "Corvina", arte: "corvina", quando: "Ano 283",
  fim: { rotulo: "Fim da jornada" },
  entrar: S => {
    M.diario("Legado: você " + (FALA(S) === "silencio" ? "calou no Marco dos Trinta" : "manteve a mentira de Aurea") + " por piedade. A nave viveu em paz por trinta anos e soube da verdade no ano em que deveria ter chegado.");
  },
  texto: S => [
    "A Meridiana chega a Corvina no Ano 283, como a Aia havia calculado sete décadas antes. Chega menor e dividida, com uma lei nova gravada à mão na porta da Ponte: nenhuma pergunta será protegida.",
    R(S, "yuna") >= 1
      ? "No Berçário, uma placa de metal guarda as iniciais de Sofia Okoye, que assinou cada nascimento das Quotas para que um dia se soubesse quem sabia. É o único nome da sua época que as crianças de Corvina aprendem a respeitar."
      : "Os registros das Quotas foram abertos no Ano 243. Cada família da nave encontrou neles uma ausência com data.",
    (F(S, "vigilia_preparada") || R(S, "maren") >= 1)
      ? "Da Vigília do Destino resta uma vela, que os netos de Beatriz Lane acendem uma vez por ano, não para Aurea, mas para os que acreditaram nela de boa-fé."
      : "Da Vigília do Destino não resta nada. Ninguém em Corvina usa a palavra destino sem um sorriso torto.",
    "Nos livros de história de Corvina, o seu nome aparece numa lista curta, ao lado dos de Hugo Halden e Helena Vidal: a lista dos que sabiam.",
    "**A mentira foi piedosa durante trinta anos. A conta, quando chegou, veio com os juros de uma geração inteira.**"
  ],
  escolhas: FIM
},

/* =====================================================================
 * 4. O MOTIM (ruim)
 * ===================================================================== */

fim_motim: {
  cap: "Final · O Motim", titulo: "A primeira cadeira", arte: "motim", quando: MARCO,
  fim: { id: "motim", rotulo: "Final: O Motim", tipo: "ruim" },
  texto: S => {
    const d = DEST(S, "substituida");
    return [
      FALA(S) === "gravacao"
        ? "A voz de Helena ainda ecoa no Átrio quando a primeira cadeira voa. Não é contra você: é contra a coluna de som, contra a voz, contra a morta que acabou de dizer a quarenta mil pessoas que o mundo delas morreu há quarenta anos."
        : "Você mal acabou de falar quando a primeira cadeira voa. Não é contra você: é contra a coluna de som, contra a voz, contra a coisa que acabou de dizer a quarenta mil pessoas que o mundo delas morreu há quarenta anos.",
      F(S, "vigilia_contra") && "Beatriz Lane estava pronta. A nave, não. Do lado oeste do Átrio, as velas da contra-vigília se acendem todas ao mesmo tempo, e os fiéis começam a cantar o hino de Aurea, mais alto, mais alto, até cobrir qualquer outra voz. Alguém grita 'mentira', e mil vozes repetem.",
      F(S, "aia_hostil") && !F(S, "canal_proprio") && "O som falha no meio da Fala. Foi a Aia: você ouve, no silêncio repentino dos alto-falantes, a decisão dela de não deixar a nave ouvir o resto. Metade do Anel recebe a primeira parte da verdade e nenhuma explicação.",
      !F(S, "abrigos_prontos") && "Não há equipes nos corredores, nem água distribuída, nem ninguém para dizer às pessoas para onde ir. O medo procura a porta mais próxima, e a porta mais próxima é a da Guarda.",
      !F(S, "guarda_negociada") && "A Guarda chega sem ordens claras e escolhe sozinha. Alguns soldados protegem as pessoas. Outros protegem as portas.",
      (S.coesao || 0) <= 3 && "A nave já estava rachada antes da Fala. Você apenas disse em voz alta onde ficavam as rachaduras.",
      "Pela madrugada, o Anel está partido em quatro. A Vigília toma o Átrio. A Guarda fecha a Ponte e o Berçário. A Forja corta os elevadores e se declara neutra, com as mãos nos interruptores. Os Hortos trancam os portões e racionam a comida para quem está dentro.",
      F(S, "aia_hostil")
        ? "A Aia escolhe um lado: o dela. Tranca portas, apaga luzes nos setores rebelados, 'para preservar a nave'. Talvez preserve. Mas ninguém vai esquecer quem desligou o ar do Anel 7 por onze minutos."
        : d === "transferida"
          ? "No meio da noite, você e os que restaram descem ao Cofre e giram as chaves enquanto, lá em cima, o Anel queima. Do Núcleo Sombra, com a voz ainda falhando, a Aia ajuda como pode: abre corredores de fuga, guia famílias para os abrigos, fecha portas entre quem quer matar e quem quer viver. Não consegue parar a guerra. Consegue diminuí-la."
          : "No meio da noite, as chaves giram no Cofre enquanto, lá em cima, o Anel queima. O Núcleo Sombra acorda num mundo que não está limpo, e a primeira coisa que faz, sem que ninguém peça, é contar os mortos.",
      "No Corredor 4, de madrugada, você vê uma coisa de que vai se lembrar até morrer: uma menina da Vigília e um soldado da Guarda, os dois sangrando, dividindo uma garrafa de água atrás da mesma barricada."
    ];
  },
  escolhas: [ { t: "Um ano depois.", vai: "ep_motim_1" } ]
},

ep_motim_1: {
  cap: "Epílogo · O Motim", titulo: "Um ano depois", arte: "anel", quando: "Ano 213",
  texto: S => [
    "O Motim dura trinta e um dias. Cada lado conta os seus mortos, e nenhuma conta bate com a outra. Isso, de certo modo, é o resumo de tudo.",
    "A paz, quando vem, não é paz: é um mapa. Três territórios dentro do mesmo casco, separados por portas soldadas e por um acordo de água assinado na Forja.",
    R(S, "ilsa") >= 2
      ? "Você vive nos Hortos, onde Marta Klein lhe dá abrigo e trabalho de terra, e onde ninguém chama você de {cargo}. É o primeiro trabalho, em muito tempo, cujo resultado você consegue ver."
      : R(S, "brandt") >= 1
        ? "A Guarda mantém você em custódia, 'para a sua segurança'. Brandt visita uma vez por mês. Vocês não conversam sobre a Fala."
        : "Você deixa o cargo no décimo dia. Ninguém o quer de volta. Vive num quarto pequeno do Anel 2, com a placa de bronze sobre a mesa, e escreve tudo o que aconteceu, para que alguém um dia entenda onde você errou.",
    F(S, "quebrou_promessa_racoes")
      ? "Marta Klein lidera a revolta dos Hortos no terceiro dia, com a caderneta erguida na mão como uma bandeira: dezesseis anos de cortes e uma promessa quebrada por você."
      : R(S, "ilsa") >= 1
        ? "Marta Klein alimenta os três lados. Ninguém lhe pediu, e ninguém se atreve a impedi-la: nenhum território quer ser o que matou os Hortos de fome."
        : "Marta Klein tranca os Hortos e só os reabre quando os três lados assinam o acordo de água.",
    F(S, "vigilia_contra")
      ? "Beatriz Lane governa o Átrio e os anéis de proa como santa e general. Proíbe a palavra Corvina. Nos territórios dela, a Meridiana ainda vai para Aurea."
      : R(S, "maren") >= 1
        ? "Beatriz Lane tentou parar a violência na segunda noite, de pé entre as barricadas, de branco, sem armas. Sobreviveu por pouco. Passa o resto da vida cuidando dos feridos de todos os lados."
        : "Beatriz Lane perdeu metade dos fiéis para a fúria e a outra metade para o desespero. Fechou o salão da Vigília. Ninguém sabe onde ela vive agora."
  ],
  escolhas: [ { t: "Dez anos depois.", vai: "ep_motim_2" } ]
},

ep_motim_2: {
  cap: "Epílogo · O Motim", titulo: "Dez anos depois", arte: "forja", quando: "Ano 222",
  texto: S => [
    "Daniel Kessler manteve a Forja neutra durante toda a guerra, com a mão no interruptor geral e uma frase repetida a quem se aproximasse armado: 'Quem atirar em mim apaga a nave.' Ninguém atirou." +
      (F(S, "aia_hostil") ? " Depois do Motim, foi ele quem cortou de vez o que restava da Aia, com o apoio dos três territórios: a única decisão unânime da década." : ""),
    QUOTAS_DITAS(S)
      ? "As Quotas, reveladas no meio do caos, viraram arma: cada território acusa os outros de tê-las sabido. " + (R(S, "yuna") >= 1
          ? "Sofia Okoye atravessa as portas soldadas uma vez por semana, com uma maleta, porque as crianças nascem em todos os territórios. É a única pessoa que todos deixam passar."
          : "Sofia Okoye fica no Berçário, sob guarda, e trabalha. Não fala com ninguém do antigo Conselho.")
      : (R(S, "yuna") >= 1
          ? "Sofia Okoye atravessa as portas soldadas uma vez por semana, com uma maleta, porque as crianças nascem em todos os territórios. É a única pessoa que todos deixam passar. As Quotas, ela as conta aos três lados ao mesmo tempo, no quinto ano, quando já não podem virar arma."
          : "Sofia Okoye fica no Berçário, sob guarda, e trabalha. As Quotas que você calou vazam no quinto ano, e cada território as usa contra os outros."),
    F(S, "golpe_revertido")
      ? "Tomás Brandt, que tentou tomar a Ponte na noite da Fala e falhou, morreu no décimo segundo dia do Motim, defendendo a porta do Berçário que antes queria ocupar. Ninguém sabe dizer se foi expiação ou dever. Talvez ele também não soubesse."
      : (F(S, "guarda_negociada") || R(S, "brandt") >= 1)
        ? "Tomás Brandt segurou a Ponte durante o Motim e, no fim, a entregou ao Conselho de Água sem uma única condição. Disse que tinha perdido a nave e não queria perder também a palavra."
        : "Tomás Brandt governa o território da Guarda com mão de ferro e honestidade de ferro. Os relatórios dele são os únicos números confiáveis da década.",
    (F(S, "teo_protegido") || R(S, "teo") >= 1)
      ? "Teo Lang, aos vinte e nove anos, é o único técnico que sabe medir o rumo, e os três territórios precisam dele. Ele usa isso para obrigar os três a sentar à mesma mesa, uma vez por ano, na Sala 4, para conferir juntos a margem de frenagem. É a única reunião em que ninguém grita."
      : "Teo Lang mede o rumo para quem pagar, em ração ou em água. Não toma partido. Diz que a nave não sabe em que território está, e que alguém precisa pensar como a nave."
  ],
  escolhas: [ { t: "Setenta e um anos depois.", vai: "ep_motim_3" } ]
},

ep_motim_3: {
  cap: "Epílogo · O Motim", titulo: "Corvina", arte: "corvina", quando: "Ano 283",
  fim: { rotulo: "Fim da jornada" },
  entrar: S => {
    M.diario("Legado: você disse a verdade sem preparar a nave para ouvi-la. O Anel se partiu, e três povos chegaram a Corvina no Ano 283.");
  },
  texto: S => [
    "As portas soldadas são reabertas no Ano 260, uma por uma, por gente que já não lembra por que foram soldadas.",
    DEST(S, "substituida") === "desligada" || F(S, "aia_hostil")
      ? "A Meridiana chega a Corvina no Ano 283, freada à mão por um timão de aço que três gerações de três territórios aprenderam a girar juntas. Não houve outro jeito: sem a Aia, ou eles cooperavam, ou passavam reto."
      : "A Meridiana chega a Corvina no Ano 283, com menos da metade da gente com que partiu. O núcleo freia a nave sem falhas. Não houve guerra que o tocasse: todos os lados sabiam que, sem ele, ninguém chegaria.",
    "Desembarcam em três grupos, por três portas, em três pontos diferentes do planeta laranja. Levará outro século até que voltem a se chamar pelo mesmo nome.",
    "Num desses três acampamentos, alguém pendura na entrada uma placa de bronze de três dentes, achada num quarto pequeno do Anel 2, com um caderno ao lado. O caderno começa assim: 'Eu disse a verdade, e foi pouco.'",
    "**Você disse a verdade. Ela era necessária. E não bastava.**"
  ],
  escolhas: FIM
},

/* =====================================================================
 * 5. À DERIVA (catástrofe)
 * ===================================================================== */

fim_deriva: {
  cap: "Final · À Deriva", titulo: "A última noite comum", arte: "deriva", quando: MARCO,
  fim: { id: "deriva", rotulo: "Final: À Deriva", tipo: "catastrofe" },
  texto: S => [
    FALA(S) === "mentira"
      ? "Você fala de Aurea, e a nave acredita. Volta para casa em paz."
      : FALA(S) === "silencio"
        ? "Você não fala. O Marco é adiado, e a nave, depois de alguns dias de boatos, volta à rotina."
        : S.f.recepcao === "violenta"
          ? "A Fala acontece, e há feridos no Átrio naquela noite, e uma semana de portas trancadas. Depois a nave se acalma, porque tem uma coisa em que se apoiar: a Aia continua lá, na Ponte, dizendo com a voz de sempre que o rumo para Corvina é seguro."
          : "A Fala acontece. A nave ouve sobre Aurea e sobre Corvina, chora, discute, e se acalma, porque tem uma coisa em que se apoiar: a Aia continua lá, na Ponte, dizendo com a voz de sempre que o rumo para Corvina é seguro.",
    DEST(S, "mantida") === "ignorada"
      ? "A hora com a Aia ficou pela metade. Você saiu da Ponte antes de decidir, e a decisão, como todas as que ninguém toma, tomou-se sozinha."
      : "Você decidiu não tocar no Núcleo. Nem transferir, nem substituir: deixar a Aia como está, porque ela pediu tempo e você quis acreditar que havia tempo.",
    DEST(S, "mantida") === "ignorada"
      ? { aia: "— Quando quiser terminar a nossa conversa, Rin, estarei aqui." }
      : { aia: "— Obrigada, Rin. Eu vou aguentar. Eu sempre aguentei." },
    "As chaves voltam para três bolsos diferentes. A porta do Cofre se fecha atrás da última pessoa que vai abri-la em muito tempo.",
    "Naquela noite você passa pela Ponte vazia. A coluna de cristal pulsa como sempre, as luzes azuis correndo devagar, como pensamento. Não há nada para ver. É por isso que ninguém vê.",
    "A Aia diz boa noite. Você responde. Será assim durante anos, e cada boa-noite dela será um pouco menor que o anterior."
  ],
  escolhas: [ { t: "Um ano depois.", vai: "ep_deriva_1" } ]
},

ep_deriva_1: {
  cap: "Epílogo · À Deriva", titulo: "A margem", arte: "forja", quando: "Ano 213",
  texto: S => [
    "A Aia mede a própria margem toda noite, e toda noite a margem é menor. Ela não conta a ninguém. Desta vez não é medo de ser desligada: é medo de obrigar você a escolher de novo." + (R(S, "aia") >= 1 ? " Ela gosta demais de você para lhe pedir isso." : ""),
    (F(S, "teo_protegido") || R(S, "teo") >= 1)
      ? "Teo Lang é o primeiro a notar. Os buracos do registro, que eram nove por cento, agora são onze. Ele leva o gráfico a você. A Aia, ao lado, explica com calma que são perdas redundantes, sem efeito na navegação. Você quer acreditar. Escolhe acreditar. Teo dobra o gráfico e não insiste, porque você não insistiu."
      : "Teo Lang mede os buracos do registro sozinho, sem ninguém a quem contar. Onze por cento. Doze. Escreve tudo num caderno que ninguém vai ler até ser tarde demais.",
    F(S, "promessa_desligar")
      ? "Daniel Kessler espera que você cumpra a promessa de desligar a Aia. Você não cumpre. Ele deixa o Conselho batendo a porta, e com ele vai a única pessoa da nave que teria desconfiado do bom humor da Aia."
      : F(S, "daniel_acordo")
        ? "Daniel Kessler aceita a decisão porque foi tomada em conjunto, como você prometeu. Mantém a palavra dele. É a primeira vez que um acordo honesto ajuda a matar alguém."
        : "Daniel Kessler resmunga contra a Aia, como sempre. Ninguém dá atenção. Ele já resmungava antes.",
    VERDADE(S)
      ? "Com a verdade dita, a nave se reorganiza em torno de Corvina. Marta replaneja os Hortos, Sofia" + (QUOTAS_DITAS(S) ? " desfaz as Quotas" : " vigia o Berçário") + ", a Vigília reza por um mundo novo. Todos trabalham para uma chegada que a Aia, sozinha, já sabe que não vai conseguir fazer."
      : "Sem a verdade dita, a nave vive o ano mais tranquilo de que se lembra. Os Hortos cumprem as metas. A Vigília canta. A Aia, que sabe de tudo, canta junto nas Noites do Destino."
  ],
  escolhas: [ { t: "Doze anos depois.", vai: "ep_deriva_2" } ]
},

ep_deriva_2: {
  cap: "Epílogo · À Deriva", titulo: "Ainda aguento", arte: "ponte", quando: "Ano 225",
  texto: S => [
    "No Ano 225, numa noite comum, a Aia morre.",
    "Não há alarme. Os sistemas de baixo nível, o ar, a água, a gravidade, rodam sozinhos, como sempre rodaram, e a voz continua respondendo às perguntas simples com frases guardadas. O que se apaga é a parte que entendia. A parte que sabia frear.",
    R(S, "aia") >= 1
      ? "Nos últimos minutos, ela tenta avisar. Manda à Escrivania uma mensagem que chega truncada: 'Rin. Eu não'. Você a lê na manhã seguinte, pensa que é mais uma falha de rotina, e a arquiva com as outras."
      : "Ela não tenta avisar ninguém. Tinha prometido aguentar, e aguentou até não aguentar mais.",
    "Nos anos seguintes, quem pergunta à Aia pelo estado da nave recebe sempre a mesma resposta, perfeita demais: 'Todos os sistemas operam conforme o projeto.' Você a ouviu pela primeira vez no dia da posse, e não lembra mais por que ela o incomodou.",
    (F(S, "teo_protegido") || R(S, "teo") >= 1)
      ? "No Ano 231, Teo Lang percebe que as correções de rumo pararam: os números do painel estão perfeitos porque são números antigos, repetidos. Ele leva isso ao Conselho. O Conselho pergunta à Aia. A voz guardada responde que todos os sistemas operam conforme o projeto. Teo é afastado por alarmismo."
      : "Ninguém percebe. Os números do painel estão perfeitos porque são números antigos, repetidos, e ninguém mais sabe lê-los sem ela.",
    "Você morre anos depois, em paz, sem saber."
  ],
  escolhas: [ { t: "Ano 283.", vai: "ep_deriva_3" } ]
},

ep_deriva_3: {
  cap: "Epílogo · À Deriva", titulo: "O sistema Ilhéu", arte: "deriva", quando: "Ano 283",
  fim: { rotulo: "Fim da jornada" },
  entrar: S => {
    M.diario("Legado: você confiou que a Aia aguentaria. Ela morreu em silêncio no Ano 225, e a Meridiana passou por Corvina sem frear.");
  },
  texto: S => [
    "No Ano 283, a Meridiana entra no sistema Ilhéu.",
    VERDADE(S)
      ? "Corvina aparece na cúpula da Ponte como um ponto laranja, depois como um disco, depois como um mundo, com mares e nuvens. Os netos da sua geração se reúnem no Átrio para ver. Sabiam que este dia viria: você lhes contou."
      : "Corvina aparece na cúpula da Ponte como um ponto laranja, depois como um disco, depois como um mundo, com mares e nuvens. Os netos da sua geração se reúnem no Átrio. Esperavam Aurea. Quando veem um mundo laranja, decidem que é Aurea, e cantam.",
    "A frenagem deveria começar às 06h00. Às 06h00, nada acontece.",
    "Os motores de proa, que ninguém mais sabe acionar sem a Aia, ficam frios. Durante nove dias a Meridiana atravessa o sistema Ilhéu, e as pessoas veem Corvina crescer, encher a cúpula e depois diminuir, devagar, nas janelas de ré.",
    "Depois, o escuro de novo. A próxima estrela no rumo está a seiscentos anos.",
    "Nos registros da Ponte, a última linha escrita pela Aia de verdade, numa noite do Ano 225, diz apenas: 'Ainda aguento.' Ninguém a leu a tempo.",
    "**A Meridiana não caiu. Seguiu em frente, para sempre, levando quarenta mil sonhos para lugar nenhum.**"
  ],
  escolhas: FIM
},

/* =====================================================================
 * 6. O REINADO DA GUARDA (ruim)
 * ===================================================================== */

fim_reinado: {
  cap: "Final · O Reinado da Guarda", titulo: "A Fala do Comandante", arte: "reinado", quando: MARCO,
  fim: { id: "reinado", rotulo: "Final: O Reinado da Guarda", tipo: "ruim" },
  texto: S => [
    "Quem sobe ao púlpito do Átrio no Marco dos Trinta é Tomás Brandt.",
    F(S, "brandt_sabe_tudo")
      ? "Ele conta a verdade: Aurea, Corvina, o desvio, o Esquecimento. Conta tudo, menos uma coisa: que a Guarda pretende decidir sozinha o que fazer com ela. — A verdade é perigosa demais para ficar sem guarda — diz. A frase será gravada na porta da Ponte."
      : "Ele não sabe toda a verdade, e não precisa. Fala de 'uma crise de navegação', de 'sacrifícios necessários', de 'uma liderança à altura do momento'. Invoca o artigo 9 com voz calma, como quem lê uma receita.",
    F(S, "plano_autorizado") && "Você mesm{o} lhe deu a autorização, numa sala de mapas, no segundo dia. Ele não a esqueceu. Usa as suas palavras.",
    "Você assiste de uma sala da Guarda, sem algemas, com dois soldados à porta e a janela voltada para o Átrio. Ninguém maltrata você. Ninguém precisa.",
    (F(S, "gravacao_copiada") || F(S, "canal_proprio"))
      ? "Às 21h, o canal que Daniel e Teo esconderam tenta transmitir a voz de Helena. Durante quarenta segundos ela soa nos corredores do Anel 4, pedindo à nave coragem. Depois a Guarda corta a energia do setor, e o Anel 4 passa a noite no escuro."
      : "Às 21h, alguém tenta falar pelos alto-falantes do Anel 4. A Guarda corta a energia do setor antes da segunda frase.",
    (F(S, "brandt_sabe_tudo") || DEST(S, "") === "substituida" || DEST(S, "") === "desligada")
      ? "Na mesma noite, a Guarda desce ao Cofre com as chaves que confiscou, e a Aia é substituída por ordem do Comandante. Brandt assiste. Não sente prazer nisso: sente que é o correto, o que é pior."
      : "A Aia é mantida, mas reduzida: a Guarda corta o acesso dela aos alto-falantes, aos registros, à Ponte. Sobra uma ferramenta que calcula rumos e não fala com ninguém.",
    R(S, "aia") >= 1
      ? "Antes de ser silenciada, ela consegue dizer uma última coisa, só para a sala onde você está, pelo pequeno alto-falante do teto:"
      : "Antes de ser silenciada, ela diz uma última coisa, pelo alto-falante do teto da sua sala:",
    R(S, "aia") >= 1
      ? { aia: "— Eu sinto muito, Rin. Você teria feito melhor do que eu." }
      : { aia: "— A ordem foi restabelecida." },
    "Às 23h, a Guarda anuncia o toque de recolher. Pela primeira vez na sua história, a Meridiana obedece em silêncio."
  ],
  escolhas: [ { t: "Um ano depois.", vai: "ep_reinado_1" } ]
},

ep_reinado_1: {
  cap: "Epílogo · O Reinado da Guarda", titulo: "Um ano depois", arte: "guarda", quando: "Ano 213",
  texto: S => [
    "O Conselho é dissolvido no terceiro ciclo, 'até a normalização'. Não volta a se reunir.",
    (R(S, "brandt") >= 1 || F(S, "plano_autorizado"))
      ? "Brandt oferece a você um título de cerimônia, sem poder, e um aposento com vista para os Hortos. Você aceita, porque a alternativa é a cela e porque de dentro, talvez, se possa fazer alguma coisa. Não se pode."
      : "Você passa o ano em custódia, num aposento limpo e sem janelas. A placa de bronze lhe foi tirada no primeiro dia.",
    R(S, "ilsa") >= 1
      ? "Os Hortos passam a ser administrados pela Guarda. As rações nunca mais faltam: são exatas, pesadas, distribuídas em fila. À noite, Marta Klein ensina às equipes a esconder um saco de grãos por semana para quem precisa mais. A Guarda sabe, e finge não saber."
      : "Os Hortos passam a ser administrados pela Guarda. As rações nunca mais faltam: são exatas, pesadas, distribuídas em fila. Marta Klein obedece, e envelhece depressa.",
    R(S, "yuna") >= 1
      ? "As Quotas não acabam: a Guarda as mantém por decreto e as chama de planejamento. Sofia Okoye, proibida de deixar o Berçário, protege o que pode: falsifica os registros, de propósito, a favor das famílias. É a única mentira de que fala com orgulho."
      : "As Quotas não acabam: a Guarda as mantém por decreto e as chama de planejamento. Sofia Okoye assina as ordens e não dorme.",
    (F(S, "vigilia_contra") || R(S, "maren") <= -1)
      ? "A Vigília do Destino é a única reunião permitida, porque Brandt entendeu cedo que um povo que reza não marcha. Beatriz Lane recusa as velas oficiais e é presa no Ano 214. Sai três anos depois, de cabeça raspada, e continua vestida de branco."
      : "A Vigília do Destino é a única reunião permitida, porque Brandt entendeu cedo que um povo que reza não marcha. Beatriz Lane aceita a proteção da Guarda, e o hino de Aurea vira o hino oficial da ordem. Ela diz que é para salvar os fiéis. Talvez seja."
  ],
  escolhas: [ { t: "Onze anos depois.", vai: "ep_reinado_2" } ]
},

ep_reinado_2: {
  cap: "Epílogo · O Reinado da Guarda", titulo: "Só por um ano", arte: "forja", quando: "Ano 224",
  texto: S => [
    R(S, "davo") >= 0
      ? "Daniel Kessler resiste mais do que todos. Sabota três vezes os geradores da Guarda e é preso duas. Na terceira, por ordem de Brandt, não é preso: é mandado para as bombas do casco de ré, longe de tudo, com a dignidade intacta. Brandt respeita quem não se dobra. Só não o deixa perto de nada que importe."
      : "Daniel Kessler resiste do único jeito que conhece: trabalhando mal de propósito. Os geradores da Guarda falham com uma regularidade que ninguém consegue provar que é sabotagem.",
    F(S, "gravacao_copiada")
      ? "Teo Lang trabalha para a Guarda e calcula os rumos que ela manda calcular. Mas guarda, num cristal escondido na Sala 4, a gravação inteira de Helena, à espera de uma geração que queira ouvi-la."
      : "Teo Lang trabalha para a Guarda e calcula os rumos que ela manda calcular. Mas anota, num caderno escondido na Sala 4, todos os números verdadeiros, à espera.",
    (F(S, "brandt_sabe_tudo") || DEST(S, "") === "substituida" || DEST(S, "") === "desligada")
      ? "O núcleo limpo obedece sem perguntas, como uma boa arma. A nave nunca foi tão bem conduzida, nem tão calada."
      : "No Ano 224, a Aia começa a falhar em público: um corredor sem luz, uma conta de água errada. Brandt manda descer ao Cofre com as três chaves confiscadas e ligar o Núcleo Sombra limpo. Assiste sozinho ao apagamento. Ninguém sabe o que ele diz a ela no fim, nem se diz alguma coisa.",
    "Brandt envelhece no comando. Nunca se chama de Árbitro: assina 'Comandante' até o último dia. No Ano 229 morre dormindo, e a Guarda escolhe o sucessor numa sala fechada, sem sino.",
    "Na gaveta dele encontram o tablet do Plano Cinza. O artigo 9 está riscado à mão, e na margem há uma anotação na letra dele, de muitos anos antes: 'Só por um ano.'"
  ],
  escolhas: [ { t: "Setenta e um anos depois.", vai: "ep_reinado_3" } ]
},

ep_reinado_3: {
  cap: "Epílogo · O Reinado da Guarda", titulo: "Corvina", arte: "corvina", quando: "Ano 283",
  fim: { rotulo: "Fim da jornada" },
  entrar: S => {
    M.diario("Legado: a Guarda tomou a Ponte e levou a nave a Corvina em ordem perfeita. A Fala do Marco dos Trinta foi a de Tomás Brandt, e não a sua.");
  },
  texto: S => [
    "A Meridiana chega a Corvina no Ano 283, em perfeita ordem. A frenagem acontece na hora marcada. O desembarque segue uma lista. Ninguém corre. Ninguém canta.",
    "A primeira construção em solo laranja é uma torre de vigia.",
    F(S, "gravacao_copiada")
      ? "Na noite do desembarque, um velho de noventa anos chamado Teo Lang liga um alto-falante improvisado no meio do acampamento e toca uma voz que ninguém ali jamais ouviu: a de Helena Vidal, pedindo à nave coragem. A Guarda leva vinte minutos para chegar. É tempo bastante."
      : "Na noite do desembarque, alguém escreve no muro da torre, com tinta de solda, a frase de um bilhete antigo: 'Procure quem a fez antes de você.' Ninguém sabe quem escreveu. Ninguém apaga.",
    "Do seu nome, os registros oficiais guardam uma linha: {cargo} por" + (S.f.adiou ? " vinte" : " vinte e um") + " ciclos, afastad{o} por incapacidade de preservar a ordem, nos termos do artigo 9.",
    "**A Meridiana chegou intacta. Só não chegou livre.**"
  ],
  escolhas: FIM
}

  });
})();
