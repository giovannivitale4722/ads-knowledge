/* Shared helpers and the three registries every other file adds to. Load first. */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const money = v => '$' + v.toFixed(2);

function T(id, label) {
  return `<button type="button" class="term" data-t="${id}" aria-haspopup="dialog" aria-expanded="false">${label || TERMS[id].name}</button>`;
}

/* Topics live in js/topics/<id>.js, check questions next to them, demos in js/widgets/<name>.js. */
const TERMS = {};
const CHECKS = {};
const WIDGETS = {};
