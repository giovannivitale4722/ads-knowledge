# Ads Knowledge

A website for learning how Google Ads works, built from my notes and research.

Live site: https://www.giovitale.com/ads-knowledge/

To preview it locally, open `index.html` in a browser. There is no build step. Pushing to `main` redeploys the site on GitHub Pages.

## Folder layout

```
index.html              The page shell: header links, nav rail and the <script> list
css/
  base.css              Colors, fonts, layout, panels, buttons, term pop-up
  home.css              Roadmap, Start here, search, Browse by subject
  topic.css             Topic pages: text, tables, outline, Keep going, All topics
  demos.css             Styles for the interactive demos
  responsive.css        Phone layout and reduced motion (keep last)
js/
  core.js               Helpers and the TERMS, CHECKS and WIDGETS registries (loads first)
  config.js             "Updated" date and which subject each topic belongs to
  topics/<id>.js        One file per topic: its text, prerequisites and check questions
  widgets/<name>.js     One file per interactive demo
  roadmap.js            Roadmap ordering, stages and the lines between topics
  views/home.js         Home page
  views/topic.js        Topic page and its "On this page" outline
  views/glossary.js     All topics page
  views/ml.js           Machine learning hub page
  search.js             Search box
  app.js                Routing, the term pop-up and startup (loads last)
implementations/        Hands-on code projects, such as the C++ Target CPA autobidder
sources/                My original screenshots. Kept locally (git-ignored), never published
```

## Adding a topic

1. Copy an existing file in `js/topics/`, for example `cpm.js`, to `js/topics/<new-id>.js`.
2. Fill in `name`, `short` (the one-line definition shown in pop-ups), `needs` (topics to read first) and `body`.
   - Link another topic inside the text with `${T('id')}`, or `${T('id', 'custom label')}`.
   - Optional: add `CHECKS['<new-id>'] = [...]` for check-yourself questions.
3. Add the id to one subject in `js/config.js`.
4. Add `<script src="js/topics/<new-id>.js"></script>` to `index.html`, in the topics group.
5. Update `UPDATED` in `js/config.js`.

To add a machine learning worked example, put its id in the "Machine learning in ads" subject. It then appears on the ML page (`#ml`, built in `js/views/ml.js`) automatically.

The roadmap places topics automatically from `needs`. The browser console warns if a topic isn't in exactly one subject.

## Adding a demo

1. Create `js/widgets/<name>.js` with `WIDGETS.<name> = function (el) { ... };`
2. Add its script tag to the demos group in `index.html`.
3. Put `<div class="widget" data-widget="<name>"></div>` in a topic's body.
4. Add its styles to `css/demos.css`.

## Design and checks

The design follows the taste skill (the "achromatic ledger" app style). The skill isn't committed. Install it with `npx skills experimental_install`, which reads `skills-lock.json`. Then check changes with:

```
node .claude/skills/design-taste-frontend/scripts/lint.mjs --app index.html css js
node .claude/skills/design-taste-frontend/scripts/inspect.mjs --app index.html
```
