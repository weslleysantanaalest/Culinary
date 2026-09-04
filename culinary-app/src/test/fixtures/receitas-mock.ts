import type { Receita } from "@/types";

/**
 * FIXTURE DE TESTE — não usar em produção.
 *
 * Dataset mockado de receitas (21 itens) que originalmente vivia em
 * `src/data/receitas.ts`. A produção passou a consumir o backend Notion-backed
 * (/api/recipes); este dataset foi movido para cá para continuar servindo as
 * telas fora desta fase (Modo Cozinhar, Planejador, Lista de Ingredientes,
 * Busca por Ingredientes) e os testes, sem reintroduzir dados mock na produção.
 *
 * Os ids estáveis usados pelos e2e permanecem intactos
 * (massa-fresca-classica, pasta-pomodoro-classica, salmao-grelhado-aspargos).
 */
export const receitas: Receita[] = [
  {
    id: "pao-fermentacao-natural",
    titulo: "Pão de Fermentação Natural",
    categorias: ["PÃO", "ARTESANAL"],
    tempoPreparo: "24H",
    dificuldade: "DIFÍCIL",
    imagemUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBPmRvVCTczrgbJiKiv8IBmEr0OMR8x_lkuhWpqdG4_VbA_vatCSraLOU53xz9-M8RRzR5x5_mZc4NkvquvSTbYCzHflapCWsJ_W2fJST7Q4tpwHjwi-_JhrL8HQBwkXJPy_rMe6dVGhMgnPffVGugnvrVQuKLKoiN-bs9nMNGoNIZd9CjCa79IWujhprmLTjmYsaImQdjccZfUPlDwLZFs9hFijW6ySpCDoNecNkQbeanRNzesJbMj",
    ingredientes: [
      { nome: "Farinha de trigo tipo 00", quantidade: "500 g" },
      { nome: "Água", quantidade: "350 ml" },
      { nome: "Fermento natural (levain)", quantidade: "100 g" },
      { nome: "Sal marinho fino", quantidade: "10 g" },
    ],
    passos: [
      {
        numero: 1,
        instrucao:
          "Misture a farinha e a água e deixe descansar (autólise) por 30 minutos.",
        tempoEstimadoMinutos: 30,
        ingredientes: [
          { nome: "Farinha de trigo tipo 00", quantidade: "500 g" },
          { nome: "Água", quantidade: "350 ml" },
        ],
      },
      {
        numero: 2,
        instrucao: "Adicione o fermento natural e o sal, misture até incorporar.",
        tempoEstimadoMinutos: 10,
        ingredientes: [
          { nome: "Fermento natural (levain)", quantidade: "100 g" },
          { nome: "Sal marinho fino", quantidade: "10 g" },
        ],
      },
      {
        numero: 3,
        instrucao: "Deixe fermentar em temperatura ambiente por 18 a 24 horas.",
        tempoEstimadoMinutos: 1080,
        ingredientes: [],
      },
    ],
  },
  {
    id: "vieiras-grelhadas-pure-ervilhas",
    titulo: "Vieiras Grelhadas com Purê de Ervilhas",
    categorias: ["FRUTOS DO MAR"],
    tempoPreparo: "30 MIN",
    dificuldade: "MÉDIO",
    imagemUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCI53dOnrry-kQotsl_8O0HqCtjEL9w3djN4WAXB9JUckBexcRcixXuRJavzOjsdfSGEVii288BOmvsSejpX0nSid3Wy3E6Aw1DiMWC-57cUlVsHemcvldpZUI9-1WHITWdOJoyHi5L0eif3rmYISaWrX_z9m8Qs7Ul2nEl1_hRpK6RGw9avaLJCBVwV58k5P_ib5H-b0kOS3IRzPIegCYGZ5FDdK_9W7jOqeqUPYQSIEFWE-CJCBak",
    ingredientes: [
      { nome: "Vieiras frescas", quantidade: "8 unidades" },
      { nome: "Ervilhas frescas", quantidade: "300 g" },
      { nome: "Manteiga", quantidade: "20 g" },
      { nome: "Azeite de oliva extravirgem", quantidade: "1 colher de sopa" },
    ],
    passos: [
      {
        numero: 1,
        instrucao: "Cozinhe as ervilhas e bata com manteiga até obter um purê liso.",
        tempoEstimadoMinutos: 10,
        ingredientes: [
          { nome: "Ervilhas frescas", quantidade: "300 g" },
          { nome: "Manteiga", quantidade: "20 g" },
        ],
      },
      {
        numero: 2,
        instrucao: "Sele as vieiras no azeite bem quente por 1-2 minutos de cada lado.",
        tempoEstimadoMinutos: 5,
        ingredientes: [
          { nome: "Vieiras frescas", quantidade: "8 unidades" },
          { nome: "Azeite de oliva extravirgem", quantidade: "1 colher de sopa" },
        ],
      },
    ],
  },
  {
    id: "bolo-mille-crepe-matcha",
    titulo: "Bolo Mille-Crêpe de Matcha",
    categorias: ["SOBREMESA", "MATCHA"],
    tempoPreparo: "2H",
    dificuldade: "DIFÍCIL",
    imagemUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCHo2Nr7vSmeDCGNKWzfFoemSGzwNuBmSQrOgV0vNKnogybwi8QWJBg-1fLZ9vHeuWWw0hBqpoiuodiwQNVT7P7R9RXtzWEnlU2c3fxXxoag34OCloWeucgDM6_Tzx0vXyCHdgIk6fBq5KHpmcL1CoJHaFqRMUF-QiTQyTiH3Xpy_exlZerLrUrCmPkx8eCJAqM0t42mxRST1DMWKX45pUOYfbpy2peQh679dDw0CWZ68FU8Mt3PRpY",
    ingredientes: [
      { nome: "Farinha de trigo", quantidade: "250 g" },
      { nome: "Leite", quantidade: "500 ml" },
      { nome: "Chá matcha em pó", quantidade: "15 g" },
      { nome: "Ovos", quantidade: "4 unidades" },
    ],
    passos: [
      {
        numero: 1,
        instrucao: "Prepare a massa de crepe misturando farinha, leite, ovos e matcha.",
        tempoEstimadoMinutos: 15,
        ingredientes: [
          { nome: "Farinha de trigo", quantidade: "250 g" },
          { nome: "Leite", quantidade: "500 ml" },
          { nome: "Ovos", quantidade: "4 unidades" },
          { nome: "Chá matcha em pó", quantidade: "15 g" },
        ],
      },
      {
        numero: 2,
        instrucao: "Faça crepes finos um a um e empilhe com creme entre as camadas.",
        tempoEstimadoMinutos: 90,
        ingredientes: [],
      },
    ],
  },
  {
    id: "espresso-perfeito",
    titulo: "O Espresso Perfeito",
    categorias: ["BEBIDA"],
    tempoPreparo: "5 MIN",
    dificuldade: "FÁCIL",
    imagemUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDslR0Y_nctRuXCNiQ0oJVAiDRchixEzajhEd_uhvz9xiEK4nW8nVHHY9dTksge5utnFw8woJI5IdY9ukEU5ppXmNGZkv5KoR8PJ3KhHvsU7KSpDueaQACX2hd9P7S1oWFT_FzyGhMOqoQprepfW2w-6YRceKJ2yUH4vbq8DQealMzXYExhZ_bAEhBAcSVdhROjq0AjB7UGlkNB5sXN1QgKnhCSt-rWEuMqEq7-QNgw1lmKPfGrsyky",
    ingredientes: [{ nome: "Café em grãos moído fino", quantidade: "18 g" }],
    passos: [
      {
        numero: 1,
        instrucao: "Extraia o espresso na máquina por 25-30 segundos.",
        tempoEstimadoMinutos: 5,
        ingredientes: [{ nome: "Café em grãos moído fino", quantidade: "18 g" }],
      },
    ],
  },
  {
    id: "salada-caprese-tomates-heranca",
    titulo: "Salada Caprese com Tomates Herança",
    categorias: ["ENTRADA", "VEGETARIANO"],
    tempoPreparo: "15 MIN",
    dificuldade: "FÁCIL",
    imagemUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDLtMCDX5HHVftoLfr6tC8szPFgP2Q1sEya3iuYE7LUcooZI9OzvYyYyqRCDV4N3SClqNfqDyRGsVgE2Umq5vkAJz4EgIXN-I8mHhqYi5jt-usOcBvgD7dsQKbg7UA0TyjUz1RevYiwJgE9h30HBETy_4Y7Y4skqukjibFCdI3PWeXiYrQH22wx3SMG9Ckjykv53XrjWtM-X6wxscT2ZgjnWUIPT-TEBB4jGl9SCj4FR0rC9hvBkuSH",
    ingredientes: [
      { nome: "Tomates herança", quantidade: "4 unidades" },
      { nome: "Mussarela de búfala", quantidade: "200 g" },
      { nome: "Manjericão fresco", quantidade: "1 maço" },
      { nome: "Azeite de oliva extravirgem", quantidade: "2 colheres de sopa" },
    ],
    passos: [
      {
        numero: 1,
        instrucao: "Corte os tomates e a mussarela, arrume no prato alternando.",
        tempoEstimadoMinutos: 10,
        ingredientes: [
          { nome: "Tomates herança", quantidade: "4 unidades" },
          { nome: "Mussarela de búfala", quantidade: "200 g" },
        ],
      },
      {
        numero: 2,
        instrucao: "Finalize com manjericão fresco e um fio de azeite.",
        tempoEstimadoMinutos: 5,
        ingredientes: [
          { nome: "Manjericão fresco", quantidade: "1 maço" },
          { nome: "Azeite de oliva extravirgem", quantidade: "2 colheres de sopa" },
        ],
      },
    ],
  },
  {
    id: "ramen-tradicional-tonkotsu",
    titulo: "Ramen Tradicional Tonkotsu",
    categorias: ["PRATO PRINCIPAL"],
    tempoPreparo: "12H",
    dificuldade: "MÉDIO",
    imagemUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCSizDi1QPWDX48GvFVP8mvwEylTOgGZSzW3f9cDZ_ysdkw2pVG2Y1Vre5B9Jms2dk7KY1hrVcADo8sWW7r6amtZVddi6Vs4JZiw9D1W4zdYci2Fv1qYKtNrOF3xly30VOqh-KXEcU4e6BZCCLNigby10Pw7yC1UUUBaHF-4LtC44qYbO-d9L42CtVI565VXwQpS32jN7cSl3Ey9XqhiM_kk8rxdLcsm2I-xGRRp5DFUNgW6d_Ah9lF",
    ingredientes: [
      { nome: "Ossos de porco", quantidade: "2 kg" },
      { nome: "Macarrão ramen fresco", quantidade: "4 porções" },
      { nome: "Chashu (barriga de porco)", quantidade: "300 g" },
      { nome: "Ovo cozido", quantidade: "4 unidades" },
    ],
    passos: [
      {
        numero: 1,
        instrucao: "Cozinhe os ossos de porco em fogo baixo por 10-12 horas para o caldo.",
        tempoEstimadoMinutos: 660,
        ingredientes: [{ nome: "Ossos de porco", quantidade: "2 kg" }],
      },
      {
        numero: 2,
        instrucao: "Cozinhe o macarrão e monte com chashu e ovo.",
        tempoEstimadoMinutos: 15,
        ingredientes: [
          { nome: "Macarrão ramen fresco", quantidade: "4 porções" },
          { nome: "Chashu (barriga de porco)", quantidade: "300 g" },
          { nome: "Ovo cozido", quantidade: "4 unidades" },
        ],
      },
    ],
  },
  {
    id: "panqueca-perfeita",
    titulo: "Panqueca Perfeita",
    categorias: ["CAFÉ DA MANHÃ"],
    tempoPreparo: "25 MIN",
    dificuldade: "FÁCIL",
    imagemUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuC7vCXKLhhaKTLo0E1NMuxlHr8s12GVM_NZNlGHhVoGasW7PChuv8qk_4htiQt0WX5PSAdYNmRwKzm7ZMNrUimuCE-jAtwIjiDL-FvRl_ujPUjSr2IyCJ6jtLMcEA5_BD52G9IsK8PvDHsxUczB9AVpic3jgY8WZEjG5ADjTXZgGHXEqxRAs5llNvLhUxc1UgbNj5u4_fkt_eC7pPk26bu3BUWf86OWi1gSScWE_dgFAlCsN3oQwHG0",
    ingredientes: [
      { nome: "Farinha de trigo", quantidade: "200 g" },
      { nome: "Leite", quantidade: "300 ml" },
      { nome: "Ovos", quantidade: "2 unidades" },
      { nome: "Xarope de bordo", quantidade: "a gosto" },
    ],
    passos: [
      {
        numero: 1,
        instrucao: "Misture farinha, leite e ovos até obter uma massa lisa.",
        tempoEstimadoMinutos: 10,
        ingredientes: [
          { nome: "Farinha de trigo", quantidade: "200 g" },
          { nome: "Leite", quantidade: "300 ml" },
          { nome: "Ovos", quantidade: "2 unidades" },
        ],
      },
      {
        numero: 2,
        instrucao: "Cozinhe porções da massa na frigideira até dourar dos dois lados.",
        tempoEstimadoMinutos: 15,
        ingredientes: [],
      },
    ],
  },
  {
    id: "risoto-cogumelos",
    titulo: "Risoto de Cogumelos",
    categorias: ["PRINCIPAL"],
    tempoPreparo: "45 MIN",
    dificuldade: "MÉDIO",
    imagemUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuChBGzUNF8ZsvLEWf5_MAsZVEaZEQ2iwUz1fz9E8g6vbeuDZdOoor1f0J3NtvO8nbtboLClX-7mDCgQ9e8T7Jzq_D6T9EzYnZYmgkpRGNN0LYFQ2QPUE6vwOCaNPkqmAGm2JUhtQlccjKzxq88UR_cHO_qk7zFg479S0_Y14rOTRs745zWwIlwB9Bbcn1aT99g3jF2K071G3ADVmvPGAdiFe0KyYJo4xp5dfSpFQLJJBRiUSuYeGK6Y",
    ingredientes: [
      { nome: "Arroz arbóreo", quantidade: "300 g" },
      { nome: "Cogumelos frescos", quantidade: "250 g" },
      { nome: "Caldo de legumes", quantidade: "1 L" },
      { nome: "Queijo parmesão", quantidade: "50 g" },
    ],
    passos: [
      {
        numero: 1,
        instrucao: "Refogue os cogumelos e reserve.",
        tempoEstimadoMinutos: 10,
        ingredientes: [{ nome: "Cogumelos frescos", quantidade: "250 g" }],
      },
      {
        numero: 2,
        instrucao: "Cozinhe o arroz adicionando caldo gradualmente, mexendo sempre.",
        tempoEstimadoMinutos: 25,
        ingredientes: [
          { nome: "Arroz arbóreo", quantidade: "300 g" },
          { nome: "Caldo de legumes", quantidade: "1 L" },
        ],
      },
      {
        numero: 3,
        instrucao: "Finalize com os cogumelos reservados e queijo parmesão.",
        tempoEstimadoMinutos: 5,
        ingredientes: [{ nome: "Queijo parmesão", quantidade: "50 g" }],
      },
    ],
  },
  {
    id: "tarte-limao",
    titulo: "Tarte de Limão",
    categorias: ["SOBREMESA"],
    tempoPreparo: "1 HORA",
    dificuldade: "DIFÍCIL",
    imagemUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDPIU-p4lKDvDqyjbXg-GyWPncrmeDpmQ2K82mYT-wVA3RW71ggPbJ7LGenFnFbCjJOaIIhJmyRQZQVP0puZ094cDVqUMJ9pdTZhyRtFwTsOcYjion_k_jTLF--lq01104lro00qrS0Qv7sTlX1Ro2sGuIjhov8OFrZ2WT-Mp0MLZzbNjKaSsusB0tUTQpzMAmdLgOSudKnX8nsBakTHkf02D_HBj3N76Lk_50McaiUi3G1LNgRlE3M",
    ingredientes: [
      { nome: "Farinha de trigo", quantidade: "200 g" },
      { nome: "Manteiga", quantidade: "100 g" },
      { nome: "Suco de limão", quantidade: "150 ml" },
      { nome: "Ovos", quantidade: "3 unidades" },
    ],
    passos: [
      {
        numero: 1,
        instrucao: "Prepare a massa da torta com farinha e manteiga, e leve ao forno.",
        tempoEstimadoMinutos: 25,
        ingredientes: [
          { nome: "Farinha de trigo", quantidade: "200 g" },
          { nome: "Manteiga", quantidade: "100 g" },
        ],
      },
      {
        numero: 2,
        instrucao: "Prepare o creme de limão e despeje sobre a massa assada.",
        tempoEstimadoMinutos: 20,
        ingredientes: [
          { nome: "Suco de limão", quantidade: "150 ml" },
          { nome: "Ovos", quantidade: "3 unidades" },
        ],
      },
    ],
  },
  {
    id: "salada-caprese",
    titulo: "Salada Caprese",
    categorias: ["ENTRADA"],
    tempoPreparo: "15 MIN",
    dificuldade: "FÁCIL",
    imagemUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDGgxrIZcVdbOZYo2zadkKgKhBr4C5CyS0Ku0DQmivwLvXKIaJbA392Kq0QNoWeuegw70Uec5C_6e2ZF6PlbbQu0OeTogXpOiDWX6nj8TdSnmhfGKfGus_JuqYtAgn35pUOld2xcPum1Kkg3MrQdM5uYUliy54HnhZT3v3O4onl60BdbBB-2_00WqYl05DnZF32CU70YrBFhhSaCMgc8PwzWPTSkQAam4m_ffUE8A59e5ag1shvYA8H",
    ingredientes: [
      { nome: "Tomates", quantidade: "3 unidades" },
      { nome: "Mussarela fresca", quantidade: "150 g" },
      { nome: "Manjericão fresco", quantidade: "1 maço" },
    ],
    passos: [
      {
        numero: 1,
        instrucao: "Corte os tomates e a mussarela, arrume com manjericão e azeite.",
        tempoEstimadoMinutos: 15,
        ingredientes: [
          { nome: "Tomates", quantidade: "3 unidades" },
          { nome: "Mussarela fresca", quantidade: "150 g" },
          { nome: "Manjericão fresco", quantidade: "1 maço" },
        ],
      },
    ],
  },
  {
    id: "pao-sourdough",
    titulo: "Pão Sourdough",
    categorias: ["PÃES"],
    tempoPreparo: "24 HORAS",
    dificuldade: "DIFÍCIL",
    imagemUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAxXb6KF9_9IOrvI7GhloLBRFl8CnPM8lTuuqjKa4D6NejSM-9EVN_wAP7OJP0ZUKQbndmrGMNKjAyXoVgkVKng0Ldi2pA8TWo3v8eC9oT66jMIRpiQ7t3aI1NGCFXu00oP17gGym63M11aSiZYrmYngxBEdnZK1_GzvDSsxqgalIKpTcO84bX1xB5V0czTeoAUvHzGpoBbJ-8m0uXahxrR9iiemq8rBfC8TYMqkibtVSUv3HJ1A38q",
    ingredientes: [
      { nome: "Farinha de trigo", quantidade: "500 g" },
      { nome: "Água", quantidade: "350 ml" },
      { nome: "Fermento natural", quantidade: "100 g" },
      { nome: "Sal", quantidade: "10 g" },
    ],
    passos: [
      {
        numero: 1,
        instrucao: "Misture os ingredientes e deixe fermentar por 24 horas.",
        tempoEstimadoMinutos: 1440,
        ingredientes: [
          { nome: "Farinha de trigo", quantidade: "500 g" },
          { nome: "Água", quantidade: "350 ml" },
          { nome: "Fermento natural", quantidade: "100 g" },
          { nome: "Sal", quantidade: "10 g" },
        ],
      },
    ],
  },
  {
    id: "massa-fresca-classica",
    titulo: "Massa Fresca Clássica",
    categorias: ["MASSA", "ARTESANAL"],
    tempoPreparo: "45 MIN",
    dificuldade: "MÉDIO",
    imagemUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAIBhuHSAHFMynKDczdjKxf_OTSlJ2gqqsq0cgjHQfOVV28YBGVik4zpnOP3dSN_7w83jKSz51WSd96pqdABc9qY4ghAW86OcGodXn1_Q-JIupVNeiS1vpSc4_a0F7GsqKYAN5YFbM6Q89YEVIpV1VOE8S4d0lGQSbZl0Pyx3aPiT5DIhaEtcnCpusj91sTPn21oyMlRDygFs2eZMQuveQygVBZzLh6EtabEQQ0wYR7p9LoR8iWVU5k",
    ingredientes: [
      { nome: "Farinha de trigo tipo 00", quantidade: "2 xícaras" },
      { nome: "Ovos caipiras grandes", quantidade: "3 unidades" },
      { nome: "Sal marinho fino", quantidade: "1 colher de chá" },
      { nome: "Azeite de oliva extravirgem", quantidade: "1 colher de sopa" },
      { nome: "Farinha de semolina", quantidade: "para polvilhar" },
    ],
    passos: [
      {
        numero: 1,
        instrucao: "Disponha a farinha em monte e faça um buraco no centro.",
        tempoEstimadoMinutos: 5,
        ingredientes: [{ nome: "Farinha de trigo tipo 00", quantidade: "2 xícaras" }],
      },
      {
        numero: 2,
        instrucao: "Adicione os ovos, azeite e sal no buraco.",
        tempoEstimadoMinutos: 5,
        ingredientes: [
          { nome: "Ovos caipiras grandes", quantidade: "3 unidades" },
          { nome: "Azeite de oliva extravirgem", quantidade: "1 colher de sopa" },
          { nome: "Sal marinho fino", quantidade: "1 colher de chá" },
        ],
      },
      {
        numero: 3,
        instrucao:
          "Usando um garfo, bata delicadamente os ovos, incorporando lentamente a farinha das bordas até que a massa comece a se formar.",
        tempoEstimadoMinutos: 15,
        ingredientes: [],
      },
    ],
  },
  {
    id: "pao-levain-abacate-ovo-poche",
    titulo: "Pão de Levain com Abacate e Ovo Poché",
    categorias: ["CAFÉ DA MANHÃ"],
    tempoPreparo: "15 MIN",
    dificuldade: "FÁCIL",
    imagemUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBm9Cpnlc8ZTnExzOyEswUwYljX5yYAXIEnILJIFw-la0nV9BT_8BhcFox7T5vanMtTBmxIlZuSpWygyoCzEp-F1T0NuW8zSf4MrqsEWjemv5DryOv-TV55khSMaPRS4-e976sy9ywGW6TJDOtywDbbN0nt3mwCwtDeP60gijtzsSG5XCGzBg2UEFGpVaYoa3Q99AfNnnxbufAka-ApJyR0GxPSkeZCYf5X_fsGus03kdnZ9lFpMEkE",
    ingredientes: [
      { nome: "Pão de levain", quantidade: "2 fatias" },
      { nome: "Abacate", quantidade: "1 unidade" },
      { nome: "Ovo", quantidade: "1 unidade" },
    ],
    passos: [
      {
        numero: 1,
        instrucao: "Toste o pão de levain e amasse o abacate por cima.",
        tempoEstimadoMinutos: 5,
        ingredientes: [
          { nome: "Pão de levain", quantidade: "2 fatias" },
          { nome: "Abacate", quantidade: "1 unidade" },
        ],
      },
      {
        numero: 2,
        instrucao: "Prepare o ovo poché e finalize por cima da torrada.",
        tempoEstimadoMinutos: 10,
        ingredientes: [{ nome: "Ovo", quantidade: "1 unidade" }],
      },
    ],
  },
  {
    id: "salada-quinoa-vegetais-tahine",
    titulo: "Salada de Quinoa com Vegetais Assados e Molho de Tahine",
    categorias: ["ALMOÇO"],
    tempoPreparo: "40 MIN",
    dificuldade: "MÉDIO",
    imagemUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuB3T2lKZ_5YxsfVFchV6pkaTqBxdjLfBkqMiSwJ1nqnWRdZPgGg4bY_MxN07A6iTctVbfk909gi6U16BY97N5r3Hgo3-QSoFCLiu4xKx1u6dpFbsoF-cS04H-QHLxYwbKQ6rGmHWKc5iEgPgl92hklaa82okkoz7N9KKsUVQXZRIV20ZTrgu-OhY9iTF8JQSSGPc2lM6rAL0NENL5HVg9Eif8Yr09Sw5s_VDGoKZt6WnjP6FT39Bi0-",
    ingredientes: [
      { nome: "Quinoa", quantidade: "1 xícara" },
      { nome: "Cenoura", quantidade: "2 unidades" },
      { nome: "Beterraba", quantidade: "1 unidade" },
      { nome: "Tahine", quantidade: "2 colheres de sopa" },
    ],
    passos: [
      {
        numero: 1,
        instrucao: "Asse os vegetais no forno até dourarem.",
        tempoEstimadoMinutos: 25,
        ingredientes: [
          { nome: "Cenoura", quantidade: "2 unidades" },
          { nome: "Beterraba", quantidade: "1 unidade" },
        ],
      },
      {
        numero: 2,
        instrucao: "Cozinhe a quinoa e misture com os vegetais assados e o molho de tahine.",
        tempoEstimadoMinutos: 15,
        ingredientes: [
          { nome: "Quinoa", quantidade: "1 xícara" },
          { nome: "Tahine", quantidade: "2 colheres de sopa" },
        ],
      },
    ],
  },
  {
    id: "risoto-cogumelos-selvagens-trufa",
    titulo: "Risoto de Cogumelos Selvagens com Trufa",
    categorias: ["JANTAR"],
    tempoPreparo: "50 MIN",
    dificuldade: "MÉDIO",
    imagemUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuD_PegY4vuejZQRAssHsJ7XjaWI7_cLphJsgwlDAeNxNjKl4S2L_SAEcSPwb3LyBdSav0VmvN9fvBMQ8f5LqWn4BdQ6oRnebVd_rgL4ycxd9rfW4y5cgIlYI_iWXfpcrdE8FnOmzOyoUmlX4nTaOUgRxUVp8Av_64mO1kiKoERKP1Lr4xdrQ1xGsBZnqkKVpJNB7uSGm--zo0a4oRFvVue_qzJYo-v6kV1fN9VrHOCnVZ1BYpTo1zul",
    ingredientes: [
      { nome: "Arroz arbóreo", quantidade: "300 g" },
      { nome: "Cogumelos selvagens", quantidade: "300 g" },
      { nome: "Trufa negra", quantidade: "10 g" },
      { nome: "Caldo de legumes", quantidade: "1 L" },
    ],
    passos: [
      {
        numero: 1,
        instrucao: "Refogue os cogumelos selvagens e reserve.",
        tempoEstimadoMinutos: 10,
        ingredientes: [{ nome: "Cogumelos selvagens", quantidade: "300 g" }],
      },
      {
        numero: 2,
        instrucao: "Cozinhe o arroz com caldo gradual, finalize com trufa negra ralada.",
        tempoEstimadoMinutos: 30,
        ingredientes: [
          { nome: "Arroz arbóreo", quantidade: "300 g" },
          { nome: "Caldo de legumes", quantidade: "1 L" },
          { nome: "Trufa negra", quantidade: "10 g" },
        ],
      },
    ],
  },
  {
    id: "bolo-simples-caneca",
    titulo: "Bolo Simples de Caneca",
    categorias: ["SOBREMESA"],
    tempoPreparo: "15 MIN",
    dificuldade: "FÁCIL",
    imagemUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCnQtKQ9MZXWUM4Z88pYljXvYYiiruKkMTspByp-5IKdxJkYBFugg9jfC4XBY2RSajiQFDUQNSkv5HjBFlEQGRp2i-DGlHA0N6djxV2VMi15yQLDYWDLJyPDPNKrNbIy4V30g9kTic17qwMsTtlkjk6ojL6NZs8FeoayIV8e3GoOC-x7j-cOARjBlSpvzfHI7LZsiPufcsxMaFrXZxTs0Kq6q-P_dZzfMsWSmx5bDpzSNqbyEeP7hF0",
    ingredientes: [
      { nome: "Farinha de trigo", quantidade: "4 colheres de sopa" },
      { nome: "Açúcar", quantidade: "4 colheres de sopa" },
      { nome: "Ovos", quantidade: "1 unidade" },
      { nome: "Manteiga", quantidade: "1 colher de sopa" },
    ],
    passos: [
      {
        numero: 1,
        instrucao: "Misture todos os ingredientes na caneca até obter uma massa homogênea.",
        tempoEstimadoMinutos: 5,
        ingredientes: [
          { nome: "Farinha de trigo", quantidade: "4 colheres de sopa" },
          { nome: "Açúcar", quantidade: "4 colheres de sopa" },
          { nome: "Ovos", quantidade: "1 unidade" },
          { nome: "Manteiga", quantidade: "1 colher de sopa" },
        ],
      },
      {
        numero: 2,
        instrucao: "Leve ao micro-ondas por 2-3 minutos até crescer e firmar.",
        tempoEstimadoMinutos: 3,
        ingredientes: [],
      },
    ],
  },
  {
    id: "ovos-mexidos-perfeitos",
    titulo: "Ovos Mexidos Perfeitos",
    categorias: ["BÁSICO"],
    tempoPreparo: "5 MIN",
    dificuldade: "BÁSICO",
    imagemUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCu-2nKB-YMDi9MdH8XeYoe5zqtctpgA5uvyArVfibBko9tZ2M8icVEiWIXr8dkRww1Y35rPzWiSZHEj29Irsj6Gn0_bOTY_JNKrxf-rQ7c1Mc4oDc01t2tNG49BMRKLyuwdJXfMH-Y-BbSzOg1D9eowyMQOA4ehAWyHAAWghLHiSvNXYB-Fn2OwPkQUpbJG5yz3Tt6Bh7m7-ETXFuH_I0QNsOKIbO08JT1xIRG7eL-Sc-YFQS_MH-f",
    ingredientes: [
      { nome: "Ovos", quantidade: "3 unidades" },
      { nome: "Manteiga", quantidade: "10 g" },
      { nome: "Sal", quantidade: "a gosto" },
    ],
    passos: [
      {
        numero: 1,
        instrucao: "Bata os ovos com sal e cozinhe em fogo baixo na manteiga, mexendo sempre.",
        tempoEstimadoMinutos: 5,
        ingredientes: [
          { nome: "Ovos", quantidade: "3 unidades" },
          { nome: "Manteiga", quantidade: "10 g" },
          { nome: "Sal", quantidade: "a gosto" },
        ],
      },
    ],
  },
  {
    id: "bolo-marmore",
    titulo: "Bolo de Mármore",
    categorias: ["SOBREMESA"],
    tempoPreparo: "45 MIN",
    dificuldade: "MÉDIO",
    imagemUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAxqu_fL3NzSJ1Sez_v9GXj3pvrRRrJwQKQSzkkOGF8ZRN1LNTXRvNrRdH6SQG8_yux4wFKSvKd9S7OpIN-LLpQB4T6kWVQ6X3JFfjVIfR7r9jq4gkWJikmdm86xwyC-lZKR5Wlm3EKiRvc6NcxXTCbQx7gq6us7VkEujVOXBorTZisaTXF480pcX7a4kbFnJzSAEcPCo2wb7AKH_2WBNyYirUkNU1KEUbna9_eExGRtpQnyBh9nNSL",
    ingredientes: [
      { nome: "Farinha de trigo", quantidade: "300 g" },
      { nome: "Ovos", quantidade: "3 unidades" },
      { nome: "Manteiga", quantidade: "150 g" },
      { nome: "Açúcar", quantidade: "200 g" },
      { nome: "Cacau em pó", quantidade: "30 g" },
      { nome: "Leite", quantidade: "100 ml" },
    ],
    passos: [
      {
        numero: 1,
        instrucao: "Bata manteiga, açúcar e ovos até obter uma massa clara.",
        tempoEstimadoMinutos: 10,
        ingredientes: [
          { nome: "Manteiga", quantidade: "150 g" },
          { nome: "Açúcar", quantidade: "200 g" },
          { nome: "Ovos", quantidade: "3 unidades" },
        ],
      },
      {
        numero: 2,
        instrucao: "Divida a massa em duas partes e misture cacau em uma delas.",
        tempoEstimadoMinutos: 10,
        ingredientes: [
          { nome: "Farinha de trigo", quantidade: "300 g" },
          { nome: "Leite", quantidade: "100 ml" },
          { nome: "Cacau em pó", quantidade: "30 g" },
        ],
      },
      {
        numero: 3,
        instrucao: "Intercale as massas na forma e asse até dourar.",
        tempoEstimadoMinutos: 25,
        ingredientes: [],
      },
    ],
  },
  {
    id: "omelete-francesa",
    titulo: "Omelete Francesa",
    categorias: ["BÁSICO"],
    tempoPreparo: "10 MIN",
    dificuldade: "FÁCIL",
    imagemUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCTWXh2scj-w9uxvAFsGIQ2aw8vmvwh4rtwVZ5HtzCVyuWacwye6cFrxeTcqZePPRcsjXoq88yNx4mEoOlu6CW_4_X010gdb_YwRzuL0uRa1aNdBmMUKaFYZo9S4NWcNHcMNLdr7UiKiX3M0gXbUP3dCegDzrSm1-KOpMwhIeMT8xKdT32ERjNS2vdCsMKLopkPbiQO-7It5-wSNR93FAhL_XzIO6dJ0sRxotl7vnHFTFa4nwWbrm_x",
    ingredientes: [
      { nome: "Ovos", quantidade: "2 unidades" },
      { nome: "Manteiga", quantidade: "10 g" },
      { nome: "Cebolinha fresca", quantidade: "1 colher de sopa" },
    ],
    passos: [
      {
        numero: 1,
        instrucao: "Bata os ovos e cozinhe na manteiga, dobrando ao meio.",
        tempoEstimadoMinutos: 5,
        ingredientes: [
          { nome: "Ovos", quantidade: "2 unidades" },
          { nome: "Manteiga", quantidade: "10 g" },
        ],
      },
      {
        numero: 2,
        instrucao: "Finalize com cebolinha fresca picada por cima.",
        tempoEstimadoMinutos: 2,
        ingredientes: [{ nome: "Cebolinha fresca", quantidade: "1 colher de sopa" }],
      },
    ],
  },
  {
    id: "pasta-pomodoro-classica",
    titulo: "Pasta Pomodoro Clássica",
    categorias: ["MASSA"],
    tempoPreparo: "20 MIN",
    dificuldade: "FÁCIL",
    imagemUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAIBhuHSAHFMynKDczdjKxf_OTSlJ2gqqsq0cgjHQfOVV28YBGVik4zpnOP3dSN_7w83jKSz51WSd96pqdABc9qY4ghAW86OcGodXn1_Q-JIupVNeiS1vpSc4_a0F7GsqKYAN5YFbM6Q89YEVIpV1VOE8S4d0lGQSbZl0Pyx3aPiT5DIhaEtcnCpusj91sTPn21oyMlRDygFs2eZMQuveQygVBZzLh6EtabEQQ0wYR7p9LoR8iWVU5k",
    ingredientes: [
      { nome: "Massa (espaguete)", quantidade: "400 g" },
      { nome: "Tomate", quantidade: "6 unidades" },
      { nome: "Alho", quantidade: "3 dentes" },
      { nome: "Manjericão", quantidade: "1 maço" },
    ],
    passos: [
      {
        numero: 1,
        instrucao: "Cozinhe a massa em água salgada até ficar al dente.",
        tempoEstimadoMinutos: 10,
        ingredientes: [{ nome: "Massa (espaguete)", quantidade: "400 g" }],
      },
      {
        numero: 2,
        instrucao: "Prepare o sugo de tomate com alho e manjericão, misture com a massa.",
        tempoEstimadoMinutos: 10,
        ingredientes: [
          { nome: "Tomate", quantidade: "6 unidades" },
          { nome: "Alho", quantidade: "3 dentes" },
          { nome: "Manjericão", quantidade: "1 maço" },
        ],
      },
    ],
  },
  {
    id: "bruschetta-tomate-manjericao",
    titulo: "Bruschetta de Tomate e Manjericão",
    categorias: ["ENTRADA"],
    tempoPreparo: "15 MIN",
    dificuldade: "MUITO FÁCIL",
    imagemUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDv44fFgLSDXFUZzN4vWED03mlqp_DyyhUFxUfvlCy9IhP2nBdurFPuNNPvCXkLXGV6LdkLGL1UpygDGe99pdB6ujkDeycwpjJMr3Ihx7nJHZo8FAUcvuDEslmL8xsja1ddr-WAxFB9yoKCJEoAn6Q06zFbH9LQPFiqJzuPzc9Vi03YqjF8DXOFfyvwdqrC4q8V-iHcovuDMGwItCCv_ykv9zJ1YeuNyaGuGKjEKrqTYbb5AU61iL74",
    ingredientes: [
      { nome: "Pão italiano", quantidade: "1 unidade" },
      { nome: "Tomate", quantidade: "3 unidades" },
      { nome: "Alho", quantidade: "2 dentes" },
      { nome: "Manjericão", quantidade: "1 maço" },
    ],
    passos: [
      {
        numero: 1,
        instrucao: "Torre as fatias de pão e esfregue com alho.",
        tempoEstimadoMinutos: 5,
        ingredientes: [
          { nome: "Pão italiano", quantidade: "1 unidade" },
          { nome: "Alho", quantidade: "2 dentes" },
        ],
      },
      {
        numero: 2,
        instrucao: "Cubra com tomate picado e manjericão, finalize com azeite.",
        tempoEstimadoMinutos: 10,
        ingredientes: [
          { nome: "Tomate", quantidade: "3 unidades" },
          { nome: "Manjericão", quantidade: "1 maço" },
        ],
      },
    ],
  },
  {
    id: "salmao-grelhado-aspargos",
    titulo: "Salmão Grelhado com Aspargos",
    categorias: ["JANTAR", "PRATO PRINCIPAL"],
    tempoPreparo: "45 MIN",
    dificuldade: "MÉDIO",
    imagemUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDTwthw4MTumBrP5xPmM_gGvJXd6O9WB8VXThc6avkEkQMq-ulIkLVdALtzI9o1F7clDIByKTPvR5PiXuQr7I5P4611MqqWuznfzVOx3Q3sX3AR4VJDntdQrnO45E_nDfdjgsAPiyXOQEgJt1yQFguiZEmiuNzhJbgpQ3g7C2hM61HkEut0u4WrtGztZuSJha0FrFNQZ-M6wXBNtVEHSh67aR-s7UEI6gqVCou0El2Ahsuqu1KK-dLb",
    ingredientes: [
      { nome: "Filé de salmão", quantidade: "2 unidades" },
      { nome: "Aspargos frescos", quantidade: "200 g" },
      { nome: "Azeite de oliva extravirgem", quantidade: "2 colheres de sopa" },
      { nome: "Limão", quantidade: "1 unidade" },
    ],
    passos: [
      {
        numero: 1,
        instrucao: "Tempere o salmão com sal, limão e azeite.",
        tempoEstimadoMinutos: 10,
        ingredientes: [
          { nome: "Filé de salmão", quantidade: "2 unidades" },
          { nome: "Limão", quantidade: "1 unidade" },
          { nome: "Azeite de oliva extravirgem", quantidade: "2 colheres de sopa" },
        ],
      },
      {
        numero: 2,
        instrucao: "Grelhe o salmão e os aspargos até dourarem.",
        tempoEstimadoMinutos: 35,
        ingredientes: [{ nome: "Aspargos frescos", quantidade: "200 g" }],
      },
    ],
  },
];

export function getReceitas(): Receita[] {
  return receitas;
}

export function getReceitaPorId(id: string): Receita | undefined {
  return receitas.find((receita) => receita.id === id);
}
