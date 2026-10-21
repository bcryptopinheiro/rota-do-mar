# Rota do Mar

Jogo de estudo de Geografia (teste do 11.º ano, matéria do Manual do 10.º ano, pp. 242–281): os recursos marítimos — zonas marítimas e ZEE, linha de costa e ação do mar, acidentes do litoral e portos, fatores da abundância de pescado (plataforma continental, correntes, nortada e upwelling), setor das pescas, aquicultura, indústria do pescado, salicultura, gestão do litoral e Economia Azul. HTML, CSS e JavaScript puro, num único ficheiro.
Funciona como app (PWA): pode ser adicionado ao ecrã principal e funciona sem internet.

Site: https://bcryptopinheiro.github.io/rota-do-mar/

## O que tem

- **Botão «Continuar»** no topo: leva sempre ao próximo passo certo (o jogo a meio, o mundo seguinte, a simulação ou a revisão dos erros)
- **Plano até ao teste**: o aluno indica a data do teste e o jogo diz o que fazer hoje (e que na véspera é a Simulação e a revisão dos erros)
- 7 mundos, todos abertos desde o início, com tempo estimado, 1 a 3 estrelas, XP e níveis. **A matéria vem aos bocadinhos**: uma parte curta, perguntas só sobre essa parte, a parte seguinte… e os desafios no fim. Ao repetir um mundo, pode-se escolher «só perguntas». O botão «Matéria» deixa rever a lição toda a meio do jogo
- **Respostas escritas dentro dos mundos** («Explica», «Justifica», «Com base no documento…»), logo a seguir à parte de matéria a que dizem respeito: o aluno escreve (fica guardado), compara com a resposta-modelo e marca os pontos que incluiu
- **Perguntas de documentos com dados**: ler valores, comparar e fazer contas simples com gráficos (diferenças, «quantas vezes mais», percentagens)
- **Opções equilibradas**: as respostas erradas são plausíveis e do mesmo tamanho que a certa, para o tamanho não denunciar a resposta (o `verificar.mjs` controla isto)
- **Resumo rápido**: uma página por tema com o essencial (tabelas e expressões a decorar) e os **tópicos das perguntas de desenvolvimento**, tirados dos critérios dos Exames Nacionais de Geografia A (2013, 2014, 2016 e 2025); cada tema traz também as **perguntas do próprio manual** com a resposta curta; a última página, «Como responder», explica as cotações (10 e 20 pontos) e as rasteiras mais comuns
- **Matéria toda**: as lições completas de cada tema, para ler ou rever de seguida, com mapas e esquemas legendados, tabelas, exemplos e truques
- Minijogos: escolha múltipla (algumas com gráficos, textos e mapas, como no teste), verdadeiro ou falso, completa a frase, classifica rápido (60 s), legenda o mapa ou esquema, ordena, liga
- Cartões de estudo por tema (com respostas abertas para as aprendizagens da ficha da professora), revisão dos erros e teste final de 0 a 20
- **Simulação do Teste** no formato da ficha da professora: Grupo I escolha múltipla com documentos, II verdadeiro ou falso, III completamento, IV associação e ordenação, V legendar um mapa ou esquema, VI respostas curtas/restritas e VII resposta extensa (as respostas escritas corrigem-se com resposta-modelo e checklist)
- **Modo relaxar (ASMR)**: fundo com ondas lentas e bolhas que sobem (toca numa bolha para a rebentar), som das ondas, sons suaves de bolhas ao acertar e ao tocar nos botões, e vibração leve (Android). Durante as partes de matéria o fundo fica mais discreto. Tudo opcional nas definições
- Ecrã inicial arrumado: minijogos, «O que sai no teste», definições e recomeçar ficam em secções que abrem (e o jogo lembra-se das que deixaste abertas)

## Guardar e recomeçar

Tudo fica guardado no browser (`localStorage`, chave `rota-do-mar-v1`):

- XP, estrelas, recordes, erros para rever e cartões que já sabes
- **Jogos a meio**: mundos, teste final e simulação (incluindo as legendas do mapa e o texto das respostas escritas, guardado enquanto se escreve). Ao sair com ✕, continua-se depois no mesmo sítio
- **Voltar atrás**: o botão **←** na barra de cima mostra os passos já feitos (partes de matéria, perguntas com a tua resposta, a certa e a explicação, respostas escritas, desafios). No teste final e na simulação (grupos I a III) pode-se voltar e **mudar a resposta**. O botão «voltar» do telemóvel recua um passo em vez de sair do jogo. No fim de cada mundo, do teste final, da simulação e da revisão dos erros há «Ver as tuas respostas»; nos cartões o ← mostra os anteriores e na matéria há «← Matéria anterior»
- **Recomeçar**: botão ↺ ao lado de cada mundo (com confirmação no ecrã; os mundos já abertos continuam abertos), e no início, com dois toques, recomeçar o teste final ou a simulação, limpar a revisão dos erros ou pôr os cartões como «por saber». «Apagar todo o progresso» apaga tudo menos as definições

## Onde está cada coisa

Está tudo em `index.html`:

| Parte | O que tem |
|---|---|
| `<style>` | Cores e aspeto (claro, escuro, telemóvel, mapas e gráficos, fundo animado) |
| `CONTEUDO` (topo do `<script>`) | Toda a matéria: lições, figuras (mapas e esquemas), documentos (gráficos e textos), perguntas, frases para classificar, ordenações, pares para ligar, cartões, Simulação do Teste |
| Resto do `<script>` | A lógica do jogo (não é preciso mexer para acrescentar perguntas) |

Outros ficheiros:

| Ficheiro | O que tem |
|---|---|
| `manifest.webmanifest`, `icons/` | Nome e ícones da app no ecrã principal |
| `sw.js` | Guarda o jogo no telemóvel para funcionar sem internet. **Ao publicar uma atualização, muda o número da versão** (v1 → v2 → …) |
| `testes/verificar.mjs` | Verifica perguntas, respostas dos exercícios do manual, mapas, lições, cartões, simulação e ficheiros da app: `node testes/verificar.mjs` (tem de acabar com «Tudo certo ✔») |

## Acrescentar perguntas

No objeto `CONTEUDO.perguntas`, a primeira opção de `o` é sempre a certa (o jogo baralha as opções):

```js
{ id:'m5-50', m:5, s:2, t:'mc', q:'Pergunta', o:['CERTA','errada','errada','errada'], e:'Explicação' }
{ id:'m5-51', m:5, s:2, t:'vf', q:'Afirmação', a:true, e:'Explicação' }
{ id:'m5-52', m:5, s:2, t:'completa', q:'Frase com ___ no sítio da palavra', o:['CERTA','errada','errada','errada'], e:'...' }
{ id:'m5-53', m:5, s:1, t:'mc', doc:'especies2019', q:'Segundo o documento…', o:[...], e:'...' }
```

`m` é o número do mundo (1–7) e `s` é a secção da lição desse mundo onde a matéria é explicada (começa em 0; a pergunta só aparece depois dessa parte). O `id` começa por `m` + esse número e tem de ser único. `doc` mostra um gráfico, texto ou mapa por cima da pergunta (de `CONTEUDO.documentos` ou `CONTEUDO.figuras`). Com `destaque:true`, a pergunta conta para o mínimo de perguntas essenciais do teste final.

## Antes de publicar uma alteração

1. `node testes/verificar.mjs` (tem de acabar com «Tudo certo ✔»).
2. No `sw.js`, subir a versão: `const VERSION = 'v1';` → `'v2'`.
3. Commit e push. O site atualiza em 1 a 2 minutos; no telemóvel, fecha a app e volta a abri-la com internet.
