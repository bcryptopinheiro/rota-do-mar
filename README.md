# Rota do Mar

Jogo de estudo de Geografia (teste do 11.º ano, matéria do Manual do 10.º ano, pp. 242–281): os recursos marítimos — zonas marítimas e ZEE, linha de costa e ação do mar, acidentes do litoral e portos, fatores da abundância de pescado (plataforma continental, correntes, nortada e upwelling), setor das pescas, aquicultura, indústria do pescado, salicultura, gestão do litoral e Economia Azul. HTML, CSS e JavaScript puro, num único ficheiro.
Funciona como app (PWA): pode ser adicionado ao ecrã principal e funciona sem internet.

Site: https://bcryptopinheiro.github.io/rota-do-mar/

## O que tem

- **Aprender a matéria**: a matéria dos 7 mundos explicada, com mapas e esquemas legendados, tabelas, exemplos e truques. Cada mundo abre com a sua lição antes das perguntas, e o botão «Matéria» deixa revê-la a meio do jogo
- 7 mundos que se desbloqueiam com 70%, com 1 a 3 estrelas, XP e níveis
- Minijogos: escolha múltipla (algumas com gráficos, textos e mapas, como no teste), verdadeiro ou falso, completa a frase, classifica rápido (60 s), legenda o mapa ou esquema, ordena, liga
- Cartões de estudo por tema (com respostas abertas para as aprendizagens da ficha da professora), revisão dos erros e teste final de 0 a 20
- **Simulação do Teste** no formato da ficha da professora: Grupo I escolha múltipla com documentos, II verdadeiro ou falso, III completamento, IV associação e ordenação, V legendar um mapa ou esquema, VI respostas curtas/restritas e VII resposta extensa (as respostas escritas corrigem-se com resposta-modelo e checklist)
- Fundo animado de bolhas do mar (pode ser desligado nas definições) e som opcional

## Guardar e recomeçar

Tudo fica guardado no browser (`localStorage`, chave `rota-do-mar-v1`):

- XP, estrelas, recordes, erros para rever e cartões que já sabes
- **Jogos a meio**: mundos, teste final e simulação (incluindo as legendas do mapa e o texto das respostas escritas, guardado enquanto se escreve). Ao sair com ✕, continua-se depois no mesmo sítio
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
{ id:'m5-50', m:5, t:'mc', q:'Pergunta', o:['CERTA','errada','errada','errada'], e:'Explicação' }
{ id:'m5-51', m:5, t:'vf', q:'Afirmação', a:true, e:'Explicação' }
{ id:'m5-52', m:5, t:'completa', q:'Frase com ___ no sítio da palavra', o:['CERTA','errada','errada','errada'], e:'...' }
{ id:'m5-53', m:5, t:'mc', doc:'especies2019', q:'Segundo o documento…', o:[...], e:'...' }
```

`m` é o número do mundo (1–7), o `id` começa por `m` + esse número e tem de ser único. `doc` mostra um gráfico, texto ou mapa por cima da pergunta (de `CONTEUDO.documentos` ou `CONTEUDO.figuras`). Com `destaque:true`, a pergunta conta para o mínimo de perguntas essenciais do teste final.

## Antes de publicar uma alteração

1. `node testes/verificar.mjs` (tem de acabar com «Tudo certo ✔»).
2. No `sw.js`, subir a versão: `const VERSION = 'v1';` → `'v2'`.
3. Commit e push. O site atualiza em 1 a 2 minutos; no telemóvel, fecha a app e volta a abri-la com internet.
