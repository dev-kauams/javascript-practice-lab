// Registro dos desafios: cada item liga uma função pura a um exemplo de entrada.
// A interface lê este arquivo e monta um cartão por desafio, então adicionar um
// novo desafio exige apenas uma nova entrada aqui.
import * as strings from './strings.js';
import * as arrays from './arrays.js';
import * as objects from './objects.js';
import * as functions from './functions.js';
import * as types from './types.js';
import * as intl from './intl.js';

const json = (text) => JSON.parse(text);

export const groups = [
  {
    id: 'strings',
    title: 'Strings e expressões regulares',
    challenges: [
      {
        id: 'slugify',
        title: 'slugify',
        concept: 'normalize, replace e regex',
        fn: strings.slugify,
        example: 'Ação & Reação: Olá, Mundo!',
        run: (input) => strings.slugify(input),
      },
      {
        id: 'capitalize',
        title: 'capitalizeWords',
        concept: 'split, map e Set',
        fn: strings.capitalizeWords,
        example: 'maria da silva e souza',
        run: (input) => strings.capitalizeWords(input),
      },
      {
        id: 'emails',
        title: 'extractEmails',
        concept: 'match com flag g e remoção de duplicados',
        fn: strings.extractEmails,
        example: 'Fale com Ana@exemplo.com ou suporte@loja.com.br (ana@exemplo.com).',
        run: (input) => strings.extractEmails(input),
      },
      {
        id: 'palindrome',
        title: 'isPalindrome',
        concept: 'normalização e comparação',
        fn: strings.isPalindrome,
        example: 'Socorram-me, subi no ônibus em Marrocos',
        run: (input) => strings.isPalindrome(input),
      },
    ],
  },
  {
    id: 'arrays',
    title: 'Arrays: map, filter, reduce, find, some e every',
    challenges: [
      {
        id: 'adults',
        title: 'adultNames',
        concept: 'filter + map + sort',
        fn: arrays.adultNames,
        example:
          '[{"name":"Bia","age":17},{"name":"Caio","age":30},{"name":"Ana","age":18}]',
        run: (input) => arrays.adultNames(json(input)),
      },
      {
        id: 'totals',
        title: 'totalByCategory',
        concept: 'reduce com acumulador de objeto',
        fn: arrays.totalByCategory,
        example:
          '[{"category":"café","value":12},{"category":"pão","value":5},{"category":"café","value":8}]',
        run: (input) => arrays.totalByCategory(json(input)),
      },
      {
        id: 'find',
        title: 'findById',
        concept: 'find e ?? null',
        fn: arrays.findById,
        example: '[{"id":1,"nome":"A"},{"id":2,"nome":"B"}]',
        run: (input) => arrays.findById(json(input), 2),
        note: 'Busca o id 2 na lista informada.',
      },
      {
        id: 'validate',
        title: 'hasNegative / allNumbers',
        concept: 'some e every',
        fn: arrays.hasNegative,
        example: '[3, 8, -1, 4]',
        run: (input) => {
          const list = json(input);
          return {
            hasNegative: arrays.hasNegative(list),
            allNumbers: arrays.allNumbers(list),
          };
        },
      },
      {
        id: 'group',
        title: 'groupBy',
        concept: 'reduce e ??=',
        fn: arrays.groupBy,
        example: '["maçã","banana","abacate","uva","bergamota"]',
        run: (input) => arrays.groupBy(json(input), (word) => word[0]),
        note: 'Agrupa pela primeira letra.',
      },
      {
        id: 'average',
        title: 'average',
        concept: 'caso extremo: lista vazia',
        fn: arrays.average,
        example: '[10, 8, null, 7]',
        run: (input) => arrays.average(json(input)),
      },
      {
        id: 'chunk',
        title: 'chunk',
        concept: 'for com slice e validação de argumento',
        fn: arrays.chunk,
        example: '[1,2,3,4,5,6,7]',
        run: (input) => arrays.chunk(json(input), 3),
        note: 'Blocos de tamanho 3.',
      },
    ],
  },
  {
    id: 'objects',
    title: 'Objetos: desestruturação, spread/rest e optional chaining',
    challenges: [
      {
        id: 'describe',
        title: 'describeUser',
        concept: 'desestruturação com valores padrão',
        fn: objects.describeUser,
        example: '{"name":"Lia","age":29,"address":{"city":"Santos"}}',
        run: (input) => objects.describeUser(json(input)),
      },
      {
        id: 'city',
        title: 'getCity',
        concept: '?. e ??',
        fn: objects.getCity,
        example: '{"name":"Teo"}',
        run: (input) => objects.getCity(json(input)),
      },
      {
        id: 'merge',
        title: 'deepMerge',
        concept: 'spread, recursão e imutabilidade',
        fn: objects.deepMerge,
        example: '{"tema":{"cor":"roxo","fonte":14},"idioma":"pt-BR"}',
        run: (input) =>
          objects.deepMerge(json(input), { tema: { fonte: 18 }, beta: true }),
        note: 'Mescla com { tema: { fonte: 18 }, beta: true }.',
      },
      {
        id: 'omit',
        title: 'omit / pick',
        concept: 'rest e Object.fromEntries',
        fn: objects.omit,
        example: '{"id":7,"nome":"Ana","senha":"123"}',
        run: (input) => {
          const user = json(input);
          return {
            semSenha: objects.omit(user, 'senha'),
            soNome: objects.pick(user, 'nome'),
          };
        },
      },
      {
        id: 'sum',
        title: 'sumAll',
        concept: 'parâmetros rest e Number.isFinite',
        fn: objects.sumAll,
        example: '[1, 2, "x", 4.5]',
        run: (input) => objects.sumAll(...json(input)),
      },
      {
        id: 'path',
        title: 'getPath',
        concept: 'reduce com ?. em caminhos dinâmicos',
        fn: objects.getPath,
        example: '{"a":{"b":{"c":42}}}',
        run: (input) => ({
          'a.b.c': objects.getPath(json(input), 'a.b.c'),
          'a.x.c': objects.getPath(json(input), 'a.x.c', 'padrão'),
        }),
      },
    ],
  },
  {
    id: 'functions',
    title: 'Funções, escopo, closures e callbacks',
    challenges: [
      {
        id: 'counter',
        title: 'createCounter',
        concept: 'closure com estado privado',
        fn: functions.createCounter,
        example: '5',
        run: (input) => {
          const counter = functions.createCounter(Number(input) || 0, 2);
          counter.increment();
          counter.increment();
          counter.decrement();
          return { depoisDeTresChamadas: counter.value(), aposReset: counter.reset() };
        },
        note: 'Inicia no valor informado, passo 2: +1, +1, -1.',
      },
      {
        id: 'once',
        title: 'once',
        concept: 'closure e função de ordem superior',
        fn: functions.once,
        example: 'oi',
        run: (input) => {
          let executions = 0;
          const greet = functions.once((name) => {
            executions += 1;
            return `Olá, ${name}!`;
          });
          return {
            primeira: greet(input),
            segunda: greet('outro'),
            execucoes: executions,
          };
        },
      },
      {
        id: 'memoize',
        title: 'memoize',
        concept: 'closure com Map como cache',
        fn: functions.memoize,
        example: '30',
        run: (input) => {
          let calls = 0;
          const slowSquare = functions.memoize((n) => {
            calls += 1;
            return n * n;
          });
          const n = Number(input) || 0;
          return {
            resultados: [slowSquare(n), slowSquare(n), slowSquare(n)],
            chamadasReais: calls,
          };
        },
      },
      {
        id: 'pipe',
        title: 'pipe',
        concept: 'composição com reduce',
        fn: functions.pipe,
        example: '  Olá   Mundo  ',
        run: (input) =>
          functions.pipe(
            (text) => text.trim(),
            (text) => text.replace(/\s+/g, ' '),
            strings.slugify,
          )(input),
        note: 'trim → colapsar espaços → slugify.',
      },
      {
        id: 'callback',
        title: 'forEachWithIndex',
        concept: 'callbacks',
        fn: functions.forEachWithIndex,
        example: '["a","b","c"]',
        run: (input) => {
          const lines = [];
          functions.forEachWithIndex(json(input), (item, index) =>
            lines.push(`${index}: ${item}`),
          );
          return lines;
        },
      },
    ],
  },
  {
    id: 'types',
    title: 'Conversão e validação de tipos',
    challenges: [
      {
        id: 'typeof',
        title: 'typeOf',
        concept: 'typeof, Array.isArray e instanceof',
        fn: types.typeOf,
        example: '[1, null, "a", {"x":1}, [1]]',
        run: (input) =>
          json(input).map((value) => `${JSON.stringify(value)} → ${types.typeOf(value)}`),
      },
      {
        id: 'number',
        title: 'toNumberStrict',
        concept: 'validação antes de converter',
        fn: types.toNumberStrict,
        example: '["12,5","1.234,56","abc",""," 7 ","1e3"]',
        run: (input) =>
          json(input).map((v) => `${JSON.stringify(v)} → ${types.toNumberStrict(v)}`),
      },
      {
        id: 'boolean',
        title: 'parseBoolean',
        concept: 'normalização de texto',
        fn: types.parseBoolean,
        example: '["Sim","off","talvez","1"]',
        run: (input) => json(input).map((v) => `${v} → ${types.parseBoolean(v)}`),
      },
      {
        id: 'blank',
        title: 'isBlank / toPositiveInt',
        concept: 'valores vazios e falsy',
        fn: types.isBlank,
        example: '["", "   ", 0, "5", "-3", "2.5"]',
        run: (input) =>
          json(input).map(
            (v) =>
              `${JSON.stringify(v)} → vazio: ${types.isBlank(v)}, inteiro positivo: ${types.toPositiveInt(v)}`,
          ),
      },
    ],
  },
  {
    id: 'intl',
    title: 'Datas, moedas e números com Intl',
    challenges: [
      {
        id: 'currency',
        title: 'formatCurrency',
        concept: 'Intl.NumberFormat',
        fn: intl.formatCurrency,
        example: '1234.5',
        run: (input) => ({
          BRL: intl.formatCurrency(Number(input)),
          USD: intl.formatCurrency(Number(input), 'USD', 'en-US'),
          EUR: intl.formatCurrency(Number(input), 'EUR', 'de-DE'),
        }),
      },
      {
        id: 'number',
        title: 'formatNumber / formatPercent',
        concept: 'opções de Intl.NumberFormat',
        fn: intl.formatNumber,
        example: '0.4275',
        run: (input) => ({
          percentual: intl.formatPercent(Number(input)),
          compacto: intl.formatNumber(Number(input) * 1_000_000, 'pt-BR', {
            notation: 'compact',
          }),
        }),
      },
      {
        id: 'date',
        title: 'formatDate',
        concept: 'Intl.DateTimeFormat e datas inválidas',
        fn: intl.formatDate,
        example: '2026-10-24',
        run: (input) => ({
          longa: intl.formatDate(input),
          curta: intl.formatDate(input, 'pt-BR', { dateStyle: 'short' }),
          emIngles: intl.formatDate(input, 'en-US'),
        }),
      },
      {
        id: 'relative',
        title: 'relativeTime',
        concept: 'Intl.RelativeTimeFormat',
        fn: intl.relativeTime,
        example: '-259200',
        run: (input) => intl.relativeTime(Number(input)),
        note: 'Entrada em segundos (negativo = passado).',
      },
      {
        id: 'list',
        title: 'formatList',
        concept: 'Intl.ListFormat',
        fn: intl.formatList,
        example: '["HTML","CSS","JavaScript"]',
        run: (input) => intl.formatList(json(input)),
      },
    ],
  },
];
