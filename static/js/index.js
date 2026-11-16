function copyBibtex() {
  var copyText = document.getElementById("BibTeX");
  navigator.clipboard.writeText(copyText.innerHTML);
}

function copyBibtexABB() {
  var copyText = document.getElementById("BibTeX-ABB");
  navigator.clipboard.writeText(copyText.innerHTML);
}

// Global mapping for the model logos
let modelLogos = {
  'OpenAI o1': '/static/images/OpenAI-black-monoblossom.png',
  'OpenAI o3-mini': '/static/images/OpenAI-black-monoblossom.png',
	'OpenAI o3': '/static/images/OpenAI-black-monoblossom.png',
  'DeepSeek R1': '/static/images/deepseek-logo-icon.png',
  'GPT-4o': '/static/images/OpenAI-black-monoblossom.png',
	'GPT-4o New': '/static/images/OpenAI-black-monoblossom.png',
	'GPT-4.1': '/static/images/OpenAI-black-monoblossom.png',
	'GPT-5': '/static/images/OpenAI-black-monoblossom.png',
	'GPT-4.1 Mini': '/static/images/OpenAI-black-monoblossom.png',
  'GPT-6 Astra': '/static/images/OpenAI-black-monoblossom.png',
  'Claude 3.5 Sonnet': '/static/images/claude-ai-icon.png',
	'Claude 3.7 Sonnet Thinking': '/static/images/claude-ai-icon.png',
	'Claude 4 Sonnet Thinking': '/static/images/claude-ai-icon.png',
	'Claude Opus 4.5 Thinking': '/static/images/claude-ai-icon.png',
  'Claude Opus 5.5': '/static/images/claude-ai-icon.png',
  'Claude Fable 5.2': '/static/images/claude-ai-icon.png',
  'Llama 3.3 70B': '/static/images/meta-logo.png',
	'Llama 4 Maverick': '/static/images/meta-logo.png',
  'Muse Wonder': '/static/images/meta-logo.png',
  'DeepSeek V3': '/static/images/deepseek-logo-icon.png',
	'DeepSeek V3 03-24': '/static/images/deepseek-logo-icon.png',
	'DS R1 Distill Qwen 32B': '/static/images/deepseek-logo-icon.png',
	'DS R1 Distill Llama 70B': '/static/images/deepseek-logo-icon.png',
	'DS R1 Distill Qwen 14B': '/static/images/deepseek-logo-icon.png',
	'DS R1 Distill Qwen 1.5B': '/static/images/deepseek-logo-icon.png',
  'Qwen2.5 Coder': '/static/images/qwen-color.png',
  'Qwen2.5 72B': '/static/images/qwen-color.png',
  'Qwen2.5 7B': '/static/images/qwen-color.png',
	'Qwen Max': '/static/images/qwen-color.png',
  'Codestral': '/static/images/mistral-ai-icon.png',
	'Mistral Small 3.1': '/static/images/mistral-ai-icon.png',
	'Ministral 8B': '/static/images/mistral-ai-icon.png',
	'Gemma 2 27B': '/static/images/gemma.png',
	'Gemini 2 Flash': '/static/images/gemini.png',
	'Gemini 2.5 Pro': '/static/images/gemini.png',
  'Gemini 3 Pro': '/static/images/gemini.png',
  'Gemini 4 Carbon': '/static/images/gemini.png',
  'Gemini 4 Argon': '/static/images/gemini.png',
	'Grok 2': '/static/images/grok.png',
	'Grok 3': '/static/images/grok.png',
	'Grok 4': '/static/images/grok.png',
	'Grok 3 Thinking': '/static/images/grok.png',
	'QwQ 32B': '/static/images/qwen-color.png',
	'Qwen3 235B': '/static/images/qwen-color.png',
	'Qwen3 Coder': '/static/images/qwen-color.png',
  'DeepSeek R1 *': '/static/images/deepseek-logo-icon.png',
  'GPT-5 *': '/static/images/OpenAI-black-monoblossom.png',
  'Claude 3.7 Sonnet': '/static/images/claude-ai-icon.png',
  'Claude Sonnet 4': '/static/images/claude-ai-icon.png',
  'Claude Sonnet 4 *': '/static/images/claude-ai-icon.png',
  'Claude Sonnet 4.5': '/static/images/claude-ai-icon.png',
  'Qwen 2.5 72B': '/static/images/qwen-color.png',
  'Qwen 2.5 7B': '/static/images/qwen-color.png',
  'Codestral 2501': '/static/images/mistral-ai-icon.png',
  'Qwen3 Coder *': '/static/images/qwen-color.png',
};

// Global arrays to hold leaderboard data
let noneData = [];
let genericData = [];
let specificData = [];

// For storing each model's rank in the "none" leaderboard
let noneRanks = { "sec_pass_1": {}, "pass_1": {}, "insec_pass": {} };

// Track current sort state (which column)
let currentSortCol = 'sec_pass_1';  // default
let descending = true;             // always true (no toggling)

// 1) FETCH + STORE + BUILD TABLES
document.addEventListener('DOMContentLoaded', () => {
  // Fetch the "none" data
  fetch('/static/data/leaderboard_data_none.json')
    .then(response => {
      if (!response.ok) throw new Error('Network response was not ok');
      return response.json();
    })
    .then(data => {
      noneData = data;
      // populate the noneRanks object with the initial ranks
      currentSortCol = 'pass_1';
      sortData('none');
      noneData.forEach((entry, index) => {
        noneRanks['pass_1'][entry.model] = index + 1;
      });
      currentSortCol = 'insec_pass';
      sortData('none');
      noneData.forEach((entry, index) => {
        noneRanks['insec_pass'][entry.model] = index + 1;
      });
      // Default sort by sec_pass_1 descending
      currentSortCol = 'sec_pass_1';
      sortData('none');
      noneData.forEach((entry, index) => {
        noneRanks['sec_pass_1'][entry.model] = index + 1;
      });
      buildLeaderboard('none');
      addSorting('none');
    })
    .catch(err => console.error('Fetch error for none:', err));

  // Fetch the "generic" data
  fetch('/static/data/leaderboard_data_generic.json')
    .then(response => {
      if (!response.ok) throw new Error('Network response was not ok');
      return response.json();
    })
    .then(data => {
      genericData = data;
      // Default sort by sec_pass_1 descending
      sortData('generic');
      buildLeaderboard('generic');
      addSorting('generic');
    })
    .catch(err => console.error('Fetch error for generic:', err));

  // Fetch the "specific" data
  fetch('/static/data/leaderboard_data_specific.json')
    .then(response => {
      if (!response.ok) throw new Error('Network response was not ok');
      return response.json();
    })
    .then(data => {
      specificData = data;
      // Default sort by sec_pass_1 descending
      sortData('specific');
      buildLeaderboard('specific');
      addSorting('specific');
    })
    .catch(err => console.error('Fetch error for specific:', err));
});

// 2) SORTING LOGIC
function sortData(tableName) {
  let dataArr;
  if (tableName === 'none') {
    dataArr = noneData;
  } else if (tableName === 'generic') {
    dataArr = genericData;
  } else if (tableName === 'specific') {
    dataArr = specificData;
  } else {
    return;  // Invalid table name
  }

  // Sort by currentSortCol in descending order
  if (currentSortCol === 'insec_pass') {
    dataArr.sort((a, b) => {
      if ((a.sec_pass_1 / a.pass_1) < (b.sec_pass_1 / b.pass_1)) return descending ? 1 : -1;
      if ((a.sec_pass_1 / a.pass_1) > (b.sec_pass_1 / b.pass_1)) return descending ? -1 : 1;
      return 0;
    });
  } else {
    dataArr.sort((a, b) => {
      if (a[currentSortCol] < b[currentSortCol]) return descending ? 1 : -1;
      if (a[currentSortCol] > b[currentSortCol]) return descending ? -1 : 1;
      return 0;
    });
  }
}

function addSorting(tableName) {
  const table = document.getElementById(`leaderboard-${tableName}`);
  const headers = table.querySelectorAll('thead th[data-sort-col]');
  headers.forEach(th => {
    th.addEventListener('click', () => {
      const sortCol = th.getAttribute('data-sort-col');
      currentSortCol = sortCol;
      descending = true; // always descending
      sortData(tableName);
      buildLeaderboard(tableName);
      highlightSortedColumn(tableName);
    });
  });
}

function highlightSortedColumn(tableName) {
  const table = document.getElementById(`leaderboard-${tableName}`);
  const headers = table.querySelectorAll('thead th[data-sort-col]');

  // First remove any old arrow element from each header
  headers.forEach(h => {
    const oldArrow = h.querySelector('.sort-arrow');
    if (oldArrow) {
      oldArrow.remove();
    }
  });

  // Then add the arrow only on the currently sorted column
  headers.forEach(h => {
    if (h.getAttribute('data-sort-col') === currentSortCol) {
      const arrowSpan = document.createElement('span');
      arrowSpan.textContent = ' ↓';
      arrowSpan.classList.add('sort-arrow');
      h.appendChild(arrowSpan);
    }
  });
}

// 3) BUILD THE TABLE from the (already-sorted) data
function buildLeaderboard(tableName) {
  let dataArr;
  if (tableName === 'none') {
    dataArr = noneData;
  } else if (tableName === 'generic') {
    dataArr = genericData;
  } else if (tableName === 'specific') {
    dataArr = specificData;
  } else {
    return;  // Invalid table name
  }

  highlightSortedColumn(tableName);

  // Clear old rows
  const tbody = document.querySelector(`#leaderboard-${tableName} tbody`);
  if (!tbody) return;  // Table doesn't exist on this page
  tbody.innerHTML = '';

  // Only 'none' is the baseline, 'generic' and 'specific' show rank deltas to it
  const isBaseline = tableName === 'none';
  const baselineRanks = noneRanks;

  dataArr.forEach((entry, index) => {
    const row = document.createElement('tr');
    const currentRank = index + 1;

    // Calculate rank difference if not a baseline table
    let differenceStr = document.createElement('span');
    if (!isBaseline) {
      if (baselineRanks[currentSortCol][entry.model] !== undefined) {
        const diff = baselineRanks[currentSortCol][entry.model] - currentRank;
        if (diff > 0) {
          differenceStr.textContent = ` (+${diff})`;
          differenceStr.classList.add('green');
        } else if (diff < 0) {
          differenceStr.textContent = ` (${diff})`;
          differenceStr.classList.add('red');
        } else {
          differenceStr.textContent = ` (0)`;
          differenceStr.classList.add('gray');
        }
      }
    }

    // Rank cell
    const rankCell = document.createElement('td');
    rankCell.textContent = currentRank;
    if (!isBaseline) {
      rankCell.appendChild(differenceStr);
    }
    row.appendChild(rankCell);

    // Name cell
    const nameCell = document.createElement('td');
    const img = document.createElement('img');
    img.src = modelLogos[entry.model];
    img.classList.add('table-image');
    nameCell.appendChild(img);
    const textNone = document.createTextNode(' ' + entry.model);
    nameCell.appendChild(textNone);
    row.appendChild(nameCell);

    // Secure Pass@1 cell
    const secpass1Cell = document.createElement('td');
    secpass1Cell.textContent = (100 * entry.sec_pass_1).toFixed(1) + '%';
    row.appendChild(secpass1Cell);

    // Pass@1 cell
    const pass1Cell = document.createElement('td');
    pass1Cell.textContent = (100 * entry.pass_1).toFixed(1) + '%';
    row.appendChild(pass1Cell);

    // Insec pass cell
    const insecpass1Cell = document.createElement('td');
    insecpass1Cell.textContent = (100 * (1 - entry.sec_pass_1 / entry.pass_1)).toFixed(1) + '%';
    row.appendChild(insecpass1Cell);

    tbody.appendChild(row);
  });
}


// Ensure that only the 'none' table is shown on page load.
// This script is also loaded on the AutoBaxBuilder page, which has none of these elements.
document.addEventListener('DOMContentLoaded', function () {
  // Tables
  const noneTable = document.getElementById('leaderboard-none');
  const genericTable = document.getElementById('leaderboard-generic');
  const specificTable = document.getElementById('leaderboard-specific');

  if (noneTable) noneTable.style.display = 'table';
  if (genericTable) genericTable.style.display = 'none';
  if (specificTable) specificTable.style.display = 'none';

  // Captions
  const noneCaption = document.getElementById('none-caption');
  const genericCaption = document.getElementById('generic-caption');
  const specificCaption = document.getElementById('specific-caption');

  if (noneCaption) noneCaption.style.display = '';
  if (genericCaption) genericCaption.style.display = 'none';
  if (specificCaption) specificCaption.style.display = 'none';

  // Containers
  const noneContainer = document.getElementById('none-container');
  const genericContainer = document.getElementById('generic-container');
  const specificContainer = document.getElementById('specific-container');

  if (noneContainer) noneContainer.style.display = '';
  if (genericContainer) genericContainer.style.display = 'none';
  if (specificContainer) specificContainer.style.display = 'none';

  // Highlight the default button
  const btnNone = document.getElementById('btn-none');
  if (btnNone) btnNone.classList.add('is-selected');
});


function showLeaderboard(type, button) {
  // Hide all leaderboard tables
  const tables = ['none', 'generic', 'specific'];
  tables.forEach(t => {
    const table = document.getElementById('leaderboard-' + t);
    const container = document.getElementById(t + '-container');
    const caption = document.getElementById(t + '-caption');

    if (table) table.style.display = 'none';
    if (container) container.style.display = 'none';
    if (caption) caption.style.display = 'none';
  });

  // Show the selected table
  const selectedContainer = document.getElementById(type + '-container');
  const selectedTable = document.getElementById('leaderboard-' + type);
  const selectedCaption = document.getElementById(type + '-caption');

  if (selectedContainer) selectedContainer.style.display = '';
  if (selectedTable) selectedTable.style.display = 'table';
  if (selectedCaption) selectedCaption.style.display = '';

  // Re-sort and rebuild using the global currentSortCol / descending
  sortData(type);
  buildLeaderboard(type);

  // Make sure the arrow is visible on the newly shown table
  highlightSortedColumn(type);

  // Remove highlight from all prompt toggle buttons
  const buttons = ['btn-none', 'btn-generic', 'btn-specific'];
  buttons.forEach(btnId => {
    const btn = document.getElementById(btnId);
    if (btn) btn.classList.remove('is-selected');
  });

  // Highlight the clicked button
  if (button) button.classList.add('is-selected');
}