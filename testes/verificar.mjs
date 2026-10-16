// Verifica o conteúdo da Rota do Mar.
// Uso (na pasta do projeto):  node testes/verificar.mjs   (tem de acabar com «Tudo certo ✔»)
// Lê o index.html, confirma que o script não tem erros de sintaxe e verifica perguntas, minijogos, mapas, cartões, lições e a Simulação do Teste.
import { readFileSync, existsSync } from 'node:fs';
import vm from 'node:vm';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const script = html.split('<script>')[1].split('</script>')[0];

let fails = 0;
const ok = (cond, msg) => { console.log(`${cond ? '✔' : '✘'} ${msg}`); if (!cond) fails++; };

console.log('— Script —');
let sintaxe = true;
try { new vm.Script(script); } catch (e) { sintaxe = false; console.log(e.message); }
ok(sintaxe, 'o script não tem erros de sintaxe');

const ctx = {};
vm.createContext(ctx);
vm.runInContext(script.split('/* =====================================================================\n   MOTOR')[0] + ';globalThis.C = CONTEUDO;', ctx);
const C = ctx.C;
const NM = C.mundos.length;
const texto = JSON.stringify(C);

console.log('— Mundos —');
ok(NM === 7 && C.mundos.every((m, i) => m.n === i + 1), `7 mundos numerados de 1 a ${NM}`);
const existe = (e) => (e.k === 'sprint' ? C.classificar : e.k === 'ligar' ? C.ligar : e.k === 'ordem' ? C.ordenar : e.k === 'mapa' ? C.figuras : {})[e.set];
ok(C.mundos.every((m) => m.especiais.every(existe)), 'todos os minijogos dos mundos existem');

console.log('— Perguntas —');
const P = C.perguntas;
const ids = P.map((p) => p.id);
ok(new Set(ids).size === ids.length, `ids únicos (${ids.length} perguntas)`);
ok(P.every((p) => p.m >= 1 && p.m <= NM && p.id.startsWith('m' + p.m + '-')), `todas as perguntas têm mundo de 1 a ${NM} (e o id condiz)`);
ok(P.filter((p) => p.t !== 'vf').every((p) => Array.isArray(p.o) && p.o.length === 4 && new Set(p.o).size === 4), 'escolha múltipla e completa: 4 opções diferentes');
ok(P.filter((p) => p.t === 'vf').every((p) => typeof p.a === 'boolean'), 'verdadeiro/falso: resposta true ou false');
ok(P.filter((p) => p.t === 'completa').every((p) => p.q.includes('___')), 'completa a frase: tem o espaço ___');
ok(P.every((p) => p.e && p.e.length > 5), 'todas as perguntas têm explicação');
ok(P.filter((p) => p.doc).every((p) => C.documentos[p.doc] || C.figuras[p.doc]), 'os documentos das perguntas existem');
for (const m of C.mundos) {
  const n = P.filter((p) => p.m === m.n);
  ok(n.length >= m.nPerguntas + 4 && ['mc', 'vf', 'completa'].every((t) => n.some((p) => p.t === t)), `mundo ${m.n}: ${n.length} perguntas (chega para ${m.nPerguntas} por jogo, com os 3 tipos)`);
}
// Respostas que têm de bater certo com o manual (pp. 242–281)
const certa = (id) => { const p = P.find((x) => x.id === id); return p && (p.t === 'vf' ? p.a : p.o[0]); };
ok(certa('m1-01').startsWith('12 milhas') && certa('m1-02').includes('200 milhas') && certa('m1-06') === '1,852 km', 'zonas marítimas: 12 mn, 200 mn e 1 mn = 1,852 km');
ok(certa('m2-03') === 'o barlavento e o sotavento algarvios', 'p. 254, ex. 2: barlavento (arriba) e sotavento (praia)');
ok(certa('m4-18') === 'I, II, IV e V', 'p. 254, ex. 3.1: afirmações I, II, IV e V');
ok(certa('m5-04') === '(a: 5); (b: 1 e 3); (c: 2 e 4)', 'p. 270, ex. 2: associação dos tipos de pesca');
ok(certa('m5-22') === 'II, III, IV e V', 'p. 270, ex. 1.1: afirmações II, III, IV e V');
ok(certa('m5-23').startsWith('1.º cavala, 2.º carapau, 3.º atuns, 4.º sardinha'), 'p. 270, ex. 3: ranking em volume (2019)');
ok(/quente/.test(certa('m4-08')), 'Corrente de Portugal quente, como no manual (p. 253)');
ok(certa('m3-10').includes('flanco sul'), 'portos no flanco sul dos cabos (p. 250)');

console.log('— Classificar, ordenar e ligar —');
for (const [k, set] of Object.entries(C.classificar)) {
  ok(set.mundo >= 1 && set.mundo <= NM && set.itens.length >= 8 && set.itens.every((i) => set.cats.some((c) => c.k === i.c)) && set.cats.every((c) => set.porque[c.k] && set.itens.some((i) => i.c === c.k)), `${k}: ${set.itens.length} frases com categoria válida e explicação`);
}
for (const [k, o] of Object.entries(C.ordenar)) ok(o.linhas.length >= 4 && new Set(o.linhas).size === o.linhas.length && o.nota, `ordenar ${k}: ${o.linhas.length} passos diferentes`);
for (const [k, l] of Object.entries(C.ligar)) ok(l.pares.length >= 3 && new Set(l.pares.map((p) => p[0])).size === l.pares.length && new Set(l.pares.map((p) => p[1])).size === l.pares.length, `ligar ${k}: ${l.pares.length} pares sem repetições`);
const proc = Object.fromEntries(C.ligar.processos.pares);
ok(proc['Ria de Aveiro'] === 'Recuo do mar e acumulação de sedimentos' && proc['Tômbolo de Peniche'] === 'Acumulação de areia e seixos' && proc['Delta lávico do Seixal'] === 'Escoada lávica', 'p. 249, ex. 1: processos de formação');
ok(Object.fromEntries(C.ligar.cabos.pares)['Cabo Espichel'] === 'Sesimbra', 'p. 250: o cabo Espichel abriga Sesimbra');

console.log('— Mapas, esquemas e documentos —');
for (const [k, f] of Object.entries(C.figuras)) {
  const nomes = f.pontos.map((p) => p.r);
  const coords = f.tipo === 'mapa'
    ? f.pontos.every((p) => p.p[0] > 36.9 && p.p[0] < 42.2 && p.p[1] > -9.6 && p.p[1] < -6.1)
    : f.pontos.every((p) => p.xy[0] >= 8 && p.xy[0] <= 332 && p.xy[1] >= 8 && p.xy[1] <= 220);
  ok(new Set(nomes).size === nomes.length && nomes.length >= 4 && coords, `figura ${k}: ${nomes.length} legendas diferentes e coordenadas dentro do desenho`);
}
for (const [k, d] of Object.entries(C.documentos)) ok(d.titulo && d.fonte && (d.tipo === 'texto' ? d.texto.length > 50 : d.dados.length >= 3 && d.dados.every((x) => typeof x[1] === 'number')), `documento ${k}: título, fonte e dados`);
const esp = C.documentos.especies2019.dados.map((d) => d[0]);
ok(esp.join(',') === 'Cavala,Carapau,Atuns e similares,Sardinha,Biqueirão', 'gráfico de 2019 com a ordem do manual (p. 259)');

console.log('— Simulação do Teste —');
const S = C.simulacao, G = S.grupos;
ok(G.reduce((s, g) => s + g.cotacao, 0) === 20, 'cotações somam 20 valores');
const tipo = (t, extra) => P.filter((p) => p.t === t && (!extra || extra(p))).length;
ok(tipo('mc', (p) => p.doc) >= G[0].nDoc * 2 && tipo('mc', (p) => !p.doc) >= G[0].n * 3, `Grupo I: escolhas múltiplas com documento (${tipo('mc', (p) => p.doc)}) e sem (${tipo('mc', (p) => !p.doc)})`);
ok(tipo('vf') >= G[1].n * 3, `Grupo II: há ${tipo('vf')} verdadeiro/falso`);
ok(tipo('completa') >= G[2].n * 3, `Grupo III: há ${tipo('completa')} frases para completar`);
ok(S.ligar.every((k) => C.ligar[k]) && S.ordenar.every((k) => C.ordenar[k]) && S.mapas.every((k) => C.figuras[k]), 'Grupos IV e V: associações, ordenações e mapas existem');
ok(S.curtas.length >= G[5].n * 3 && S.curtas.every((d) => d.pontos.length >= 2 && d.modelo.length > 150), `Grupo VI: ${S.curtas.length} respostas curtas com checklist e resposta-modelo`);
ok(S.extensas.length >= 3 && S.extensas.every((d) => d.pontos.length >= 4 && d.modelo.length > 600), `Grupo VII: ${S.extensas.length} respostas extensas com checklist e resposta-modelo`);
ok(new Set(S.curtas.concat(S.extensas).map((d) => d.id)).size === S.curtas.length + S.extensas.length, 'ids das respostas escritas únicos');

console.log('— Cartões —');
const cid = C.cartoes.map((c) => c.id);
ok(new Set(cid).size === cid.length, `ids únicos (${cid.length} cartões)`);
ok(C.mundos.every((m) => C.cartoes.filter((c) => c.m === m.n).length >= 4 && C.cartoes.some((c) => c.m === m.n && c.aberta)), 'cada mundo tem pelo menos 4 cartões, com respostas abertas');
// As 19 aprendizagens da ficha da professora têm de ter um cartão de resposta aberta
const aprend = [/Caracteriza a linha de costa/, /recuo de uma arriba/, /formas de relevo/, /localização da maioria dos portos/, /zonas marítimas sob soberania/, /Distingue a ZEE/,
  /fatores naturais na disponibilidade/, /Nortada: situação/, /acordos bilaterais/, /Upwelling|upwelling/, /sardinha aparecer/, /medidas sustentáveis/, /situação atual da atividade piscatória/,
  /pressão sobre a zona costeira/, /programas de gestão/, /soluções para um desenvolvimento/, /potencialização/, /Economia Azul/];
ok(aprend.every((r) => C.cartoes.some((c) => r.test(c.frente))), 'há cartões para as aprendizagens da ficha da professora');

console.log('— Lições (matéria antes das perguntas) —');
for (const m of C.mundos) {
  const L = C.licoes[m.n];
  ok(L && L.ideia && L.truque && L.seccoes.length >= 3 && L.seccoes.every((s) => s.t && (s.l.length || s.tabela || (s.quiz && C.classificar[s.quiz])) && s.l.every((r) => r.length === 2 && r[1].length > 20) && (!s.fig || C.figuras[s.fig])), `mundo ${m.n}: lição com secções explicadas, figuras válidas e truque`);
}
ok(/[Pp]p?\. 24\d/.test(C.licoes[1].ideia) && /pp\. 272–281/.test(C.licoes[7].ideia), 'lições indicam as páginas do manual');

console.log('— Matéria aos bocadinhos dentro dos mundos —');
ok(P.every((p) => Number.isInteger(p.s) && C.licoes[p.m].seccoes[p.s] && !C.licoes[p.m].seccoes[p.s].quiz), 'cada pergunta indica a secção da lição (s) onde a matéria é explicada');
for (const m of C.mundos) {
  const partes = C.licoes[m.n].seccoes.map((s, i) => ({ s, i })).filter((x) => !x.s.quiz);
  const semPerg = partes.filter((x) => x.s.l.length && !P.some((p) => p.m === m.n && p.s === x.i));
  ok(partes.length >= 3 && !semPerg.length && partes.length <= 6, `mundo ${m.n}: ${partes.length} partes de matéria, todas com perguntas a seguir`);
}

console.log('— Respostas escritas dentro dos mundos —');
const E = C.escritas;
ok(new Set(E.map((e) => e.id)).size === E.length, `ids únicos (${E.length} respostas escritas)`);
for (const m of C.mundos) {
  const es = E.filter((e) => e.m === m.n);
  ok(es.length >= 2 && es.every((e) => C.licoes[m.n].seccoes[e.s] && !C.licoes[m.n].seccoes[e.s].quiz && (!e.doc || C.documentos[e.doc] || C.figuras[e.doc]) && e.pontos.length >= 3 && e.modelo.length > 200),
    `mundo ${m.n}: ${es.length} respostas escritas com secção, documento, 3 pontos e resposta-modelo`);
}
ok(E.filter((e) => e.doc).length >= 8, `respostas escritas com documento (${E.filter((e) => e.doc).length}), como no teste`);

console.log('— Opções equilibradas (a certa não pode ser sempre a mais comprida) —');
const mcs = P.filter((p) => p.t !== 'vf');
const longa = mcs.filter((p) => { const L = p.o.map((s) => s.length), mx = Math.max(...L); return L[0] === mx && L.filter((l) => l === mx).length === 1; }).length;
ok(longa / mcs.length <= 0.35, `a certa é a mais comprida em ${Math.round(longa / mcs.length * 100)}% das perguntas (máximo 35%; por acaso seria ≈25%)`);
ok(P.filter((p) => p.doc && /cerca de|vezes|soma|diferença|aproximadamente|em conjunto/i.test(p.q + p.o[0])).length >= 6, 'há perguntas que obrigam a ler e comparar valores dos documentos');

console.log('— Português de Portugal —');
const brasil = /\b(ônibus|time de|tela\b|celular|equipe\b|registrar|usuário|arquivo|você)\b/i;
ok(!brasil.test(texto), 'sem palavras do português do Brasil');
ok(!/\b(acção|direcção|actual|óptimo|exacto)\b/i.test(texto), 'ortografia do Acordo Ortográfico (ação, direção, atual…)');

console.log('— App (funciona sem internet) —');
const sw = readFileSync(new URL('../sw.js', import.meta.url), 'utf8');
const files = [...sw.split('const FILES = [')[1].split('];')[0].matchAll(/'([^']+)'/g)].map((m) => m[1]);
ok(files.filter((f) => f !== './').every((f) => existsSync(new URL('../' + f.slice(2), import.meta.url))), `sw.js: os ${files.length} ficheiros guardados existem`);
ok(/const VERSION = 'v\d+';/.test(sw) && /rota-do-mar-\$\{VERSION\}/.test(sw), 'sw.js tem VERSION (sobe em cada atualização)');
const man = JSON.parse(readFileSync(new URL('../manifest.webmanifest', import.meta.url), 'utf8'));
ok(man.icons.every((i) => existsSync(new URL('../' + i.src, import.meta.url))), 'manifest: os ícones existem');
ok(/rel="manifest"/.test(html) && /serviceWorker\.register\('sw\.js'\)/.test(html), 'index.html liga o manifest e regista o sw.js');
ok(/const CHAVE = 'rota-do-mar-v1'/.test(html), 'progresso guardado no localStorage com a chave própria');

console.log(fails ? `\n${fails} problema(s) ✘` : '\nTudo certo ✔');
process.exit(fails ? 1 : 0);
