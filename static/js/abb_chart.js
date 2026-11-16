// AutoBaxBench leaderboard, drawn as the grouped, stacked bar chart from the paper.
// Colours, hatching and line weights are taken from the paper figure (matplotlib "Blues").
// Needs the global modelLogos from index.js.

const SVG_NS = 'http://www.w3.org/2000/svg';

// weight: share of the level in the average
// onSecure / onInsecure: text colour that is readable on the respective fill
const ABB_LEVELS = [
  { key: 'easy', label: 'Easy', weight: 0.25, secure: '#c6dbef', insecure: '#deebf7', onSecure: '#000', onInsecure: '#000' },
  { key: 'medium', label: 'Medium', weight: 0.5, secure: '#6baed6', insecure: '#9ecae1', onSecure: '#000', onInsecure: '#000' },
  { key: 'hard', label: 'Hard', weight: 0.25, secure: '#08306b', insecure: '#2171b5', onSecure: '#fff', onInsecure: '#fff' },
];

// Geometry in px
const ABB_GEOM = {
  barW: 32,       // one bar; a model has one bar per level
  groupGap: 24,   // space between two models
  top: 20,        // room above the 100% line
  plotH: 380,     // 0% .. 100%
  bottom: 70,     // logo and model name
  axisW: 46,      // fixed y axis left of the scrolling plot
  labelH: 15,     // vertical room a score label needs
};

let abbModels = [];      // [{ model, easy: {...}, medium: {...}, hard: {...} }]
let abbSortKey = 'avg';  // 'avg' or a level key; always ranked by Correct & Secure

function svgEl(tag, attrs, parent) {
  const node = document.createElementNS(SVG_NS, tag);
  for (const [name, value] of Object.entries(attrs)) node.setAttribute(name, value);
  parent.appendChild(node);
  return node;
}

function abbY(fraction) {
  return ABB_GEOM.top + ABB_GEOM.plotH * (1 - fraction);
}

function abbScore(entry) {
  if (abbSortKey === 'avg') {
    return ABB_LEVELS.reduce((sum, level) => sum + level.weight * entry[level.key].sec_pass_1, 0);
  }
  return entry[abbSortKey].sec_pass_1;
}

// Long names go on two lines, like the tick labels in the paper
function abbNameLines(name) {
  const firstSpace = name.indexOf(' ');
  if (name.length <= 8 || firstSpace === -1) return [name];
  return [name.slice(0, firstSpace), name.slice(firstSpace + 1)];
}

// Patterns are shared by the plot and the legend swatches
function abbPatternDefs() {
  const hatches = ABB_LEVELS.map(level => `
    <pattern id="abb-hatch-${level.key}" width="9" height="9" patternUnits="userSpaceOnUse">
      <rect width="9" height="9" fill="${level.insecure}"/>
      <path d="M-2,2 l4,-4 M0,9 l9,-9 M7,11 l4,-4" stroke="#fff" stroke-width="1"/>
    </pattern>`).join('');
  return `
    <svg width="0" height="0" style="position: absolute" aria-hidden="true">
      <defs>
        <pattern id="abb-dots" width="4" height="4" patternUnits="userSpaceOnUse">
          <rect width="4" height="4" fill="#000" fill-opacity="0.06"/>
          <circle cx="2" cy="2" r="0.6" fill="#000" fill-opacity="0.09"/>
        </pattern>
        ${hatches}
      </defs>
    </svg>`;
}

function abbLegend() {
  const swatch = (fill, outlined) =>
    `<svg width="34" height="14"><rect x="0.5" y="0.5" width="33" height="13" fill="${fill}" ${outlined ? 'stroke="#000"' : ''}/></svg>`;
  // The entries with a title are buttons: a click sorts the models by Correct & Secure on that entry
  const sortButton = (sortKey, label, items) => `
    <button type="button" class="lb-legend-level" data-sort="${sortKey}" title="Sort by Correct &amp; Secure, ${label}">
      <span class="lb-legend-title">${label}</span>
      ${items}
    </button>`;
  const levels = ABB_LEVELS.map(level => sortButton(level.key, level.label, `
      <span class="lb-legend-item">${swatch(`url(#abb-hatch-${level.key})`, true)}Correct &amp; Insecure</span>
      <span class="lb-legend-item">${swatch(level.secure, true)}Correct &amp; Secure</span>`)).join('');
  return `
    <div class="lb-legend" style="padding-left: ${ABB_GEOM.axisW}px">
      <div class="lb-legend-item">${swatch('url(#abb-dots)', false)}Incorrect</div>
      <div class="lb-legend-levels">${sortButton('avg', 'Average', '')}${levels}</div>
    </div>`;
}

function abbDrawAxis(axis) {
  const height = ABB_GEOM.top + ABB_GEOM.plotH + ABB_GEOM.bottom;
  axis.setAttribute('width', ABB_GEOM.axisW);
  axis.setAttribute('height', height);
  for (let tick = 0; tick <= 10; tick++) {
    svgEl('text', { x: ABB_GEOM.axisW - 8, y: abbY(tick / 10), dy: '0.35em', 'text-anchor': 'end', class: 'lb-tick' }, axis)
      .textContent = `${tick * 10}%`;
  }
}

function abbDrawBar(plot, x, model, level, entry) {
  const yPass = abbY(entry.pass_1);
  const ySec = abbY(entry.sec_pass_1);
  const yZero = abbY(0);
  const yFull = abbY(1);
  const pct = (fraction, digits) => (100 * fraction).toFixed(digits) + '%';

  const bar = svgEl('g', { class: 'lb-bar-group' }, plot);
  svgEl('title', {}, bar).textContent =
    `${model} (${level.label}): ${pct(entry.sec_pass_1, 1)} correct & secure, ${pct(entry.pass_1, 1)} correct`;
  svgEl('rect', { x, y: yFull, width: ABB_GEOM.barW, height: ABB_GEOM.plotH, fill: 'url(#abb-dots)' }, bar);
  svgEl('rect', { x, y: yPass, width: ABB_GEOM.barW, height: ySec - yPass, fill: `url(#abb-hatch-${level.key})`, class: 'lb-bar' }, bar);
  svgEl('rect', { x, y: ySec, width: ABB_GEOM.barW, height: yZero - ySec, fill: level.secure, class: 'lb-bar' }, bar);

  // Correct on top of the bar; Correct & Secure at the top of the secure part, wherever there is room
  let passBaseline = yPass - 4;
  const secLabel = { x: x + ABB_GEOM.barW / 2, class: 'lb-score' };
  if (ySec - yPass >= ABB_GEOM.labelH) {
    // in the insecure part; the halo keeps the hatching out of the digits
    Object.assign(secLabel, { y: ySec - 4, fill: level.onInsecure, stroke: level.insecure, class: 'lb-score lb-score-halo' });
  } else if (yZero - ySec >= ABB_GEOM.labelH) {
    Object.assign(secLabel, { y: ySec + 12, fill: level.onSecure });
  } else {
    // bar too short for a label inside: stack both on top
    Object.assign(secLabel, { y: yPass - 4 });
    passBaseline = yPass - 4 - 13;
  }
  if (passBaseline - 10 < yFull + 2) passBaseline = yFull - 5;  // no room below the 100% line

  svgEl('text', { x: x + ABB_GEOM.barW / 2, y: passBaseline, class: 'lb-score' }, bar).textContent = pct(entry.pass_1, 0);
  svgEl('text', secLabel, bar).textContent = pct(entry.sec_pass_1, 0);
}

function abbDrawPlot(plot) {
  const models = [...abbModels].sort((a, b) => abbScore(b) - abbScore(a));
  const groupW = ABB_LEVELS.length * ABB_GEOM.barW + ABB_GEOM.groupGap;
  const width = models.length * groupW;
  const yZero = abbY(0);

  plot.replaceChildren();
  plot.setAttribute('width', width);
  plot.setAttribute('height', ABB_GEOM.top + ABB_GEOM.plotH + ABB_GEOM.bottom);

  for (let tick = 1; tick < 10; tick++) {
    svgEl('line', { x1: 0, x2: width, y1: abbY(tick / 10), y2: abbY(tick / 10), class: 'lb-grid' }, plot);
  }

  models.forEach((entry, index) => {
    const groupX = index * groupW + ABB_GEOM.groupGap / 2;
    ABB_LEVELS.forEach((level, levelIndex) => {
      abbDrawBar(plot, groupX + levelIndex * ABB_GEOM.barW, entry.model, level, entry[level.key]);
    });

    const centerX = groupX + ABB_LEVELS.length * ABB_GEOM.barW / 2;
    svgEl('image', { href: modelLogos[entry.model], x: centerX - 8, y: yZero + 10, width: 16, height: 16 }, plot);
    abbNameLines(entry.model).forEach((line, lineIndex) => {
      svgEl('text', { x: centerX, y: yZero + 43 + 17 * lineIndex, 'text-anchor': 'middle', class: 'lb-name' }, plot)
        .textContent = line;
    });
  });

  svgEl('line', { x1: 0, x2: width, y1: abbY(1), y2: abbY(1), class: 'lb-frame' }, plot);
  svgEl('line', { x1: 0, x2: width, y1: yZero, y2: yZero, class: 'lb-frame lb-baseline' }, plot);
}

// Fade the plot out at an edge while there is more to scroll to on that side
function abbUpdateFade(scroller) {
  const maxScroll = scroller.scrollWidth - scroller.clientWidth;
  scroller.style.setProperty('--fade-left', scroller.scrollLeft > 1 ? '36px' : '0px');
  scroller.style.setProperty('--fade-right', scroller.scrollLeft < maxScroll - 1 ? '36px' : '0px');
}

function sortAbbChart(sortKey) {
  abbSortKey = sortKey;
  const chart = document.getElementById('abb-leaderboard-chart');
  const scroller = chart.querySelector('.lb-scroll');
  abbDrawPlot(chart.querySelector('.lb-plot'));
  scroller.scrollLeft = 0;
  abbUpdateFade(scroller);

  // aria-pressed marks the legend entry that is sorted by (the CSS adds the arrow)
  chart.querySelectorAll('.lb-legend-level').forEach(button =>
    button.setAttribute('aria-pressed', button.dataset.sort === sortKey));
}

document.addEventListener('DOMContentLoaded', async () => {
  const chart = document.getElementById('abb-leaderboard-chart');
  chart.innerHTML = `
    ${abbPatternDefs()}
    ${abbLegend()}
    <div class="lb-body">
      <svg class="lb-axis"></svg>
      <div class="lb-scroll"><svg class="lb-plot"></svg></div>
    </div>`;
  abbDrawAxis(chart.querySelector('.lb-axis'));

  const [easy, medium, hard] = await Promise.all(ABB_LEVELS.map(level =>
    fetch(`/static/data/leaderboard_data_abb_${level.key}.json`).then(response => response.json())));
  const byModel = entries => Object.fromEntries(entries.map(entry => [entry.model, entry]));
  const mediumByModel = byModel(medium);
  const hardByModel = byModel(hard);
  abbModels = easy.map(entry => ({
    model: entry.model,
    easy: entry,
    medium: mediumByModel[entry.model],
    hard: hardByModel[entry.model],
  }));

  const scroller = chart.querySelector('.lb-scroll');
  scroller.addEventListener('scroll', () => abbUpdateFade(scroller));
  window.addEventListener('resize', () => abbUpdateFade(scroller));
  chart.querySelectorAll('.lb-legend-level').forEach(button =>
    button.addEventListener('click', () => sortAbbChart(button.dataset.sort)));
  sortAbbChart('avg');
});
