// Mission Control v2 - App.js

// State
let workers = [];
let statusData = {};
let alertsData = [];
let pricesData = [];
let tasksData = [];
let selectedWorker = null;

// DOM Elements
const officeMap = document.getElementById('officeMap');
const rosterList = document.getElementById('rosterList');
const missionConsole = document.getElementById('missionConsole');
const refreshBtn = document.getElementById('refreshBtn');
const connectBtn = document.getElementById('connectBtn');
const selectedMapBadge = document.getElementById('selectedMapBadge');
const selectedWorkerBadge = document.getElementById('selectedWorkerBadge');

// Worker Card Elements
const portraitImage = document.getElementById('portraitImage');
const portraitFallback = document.getElementById('portraitFallback');
const workerName = document.getElementById('workerName');
const workerStatus = document.getElementById('workerStatus');
const workerRole = document.getElementById('workerRole');
const workerDepartment = document.getElementById('workerDepartment');
const workerRoom = document.getElementById('workerRoom');
const workerMission = document.getElementById('workerMission');
const workerTagline = document.getElementById('workerTagline');
const workerFunctions = document.getElementById('workerFunctions');
const workerActions = document.getElementById('workerActions');
const workerInputs = document.getElementById('workerInputs');
const workerOutputs = document.getElementById('workerOutputs');

// Utility Functions
function log(message, type = 'info') {
  const now = new Date();
  const time = now.toLocaleTimeString('en-US', { hour12: false });
  const line = document.createElement('div');
  line.className = 'console-line';
  line.innerHTML = `
    <span class="console-time">[${time}]</span>
    <span class="console-msg ${type}">${message}</span>
  `;
  missionConsole.insertBefore(line, missionConsole.firstChild);
  
  // Keep only last 50 lines
  while (missionConsole.children.length > 50) {
    missionConsole.removeChild(missionConsole.lastChild);
  }
}

function getStatusClass(status) {
  if (!status) return 'idle';
  const s = status.toLowerCase();
  if (s === 'active' || s === 'online') return 'active';
  if (s === 'idle' || s === 'available') return 'idle';
  if (s === 'offline' || s === 'inactive') return 'offline';
  if (s === 'away' || s === 'break') return 'away';
  return 'idle';
}

function normalizeWorkers(data) {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (data.workers && Array.isArray(data.workers)) return data.workers;
  if (typeof data === 'object') {
    // Try to find any array property
    for (const key of Object.keys(data)) {
      if (Array.isArray(data[key])) {
        return data[key];
      }
    }
  }
  return [];
}

async function loadJSON(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (error) {
    log(`Missing file: ${url} - ${error.message}`, 'error');
    return null;
  }
}

async function loadAllData() {
  log('Loading dashboard data...', 'info');
  
  const [workersRaw, statusRaw, alertsRaw, pricesRaw, tasksRaw] = await Promise.all([
    loadJSON('./data/workers.json'),
    loadJSON('./data/status.json'),
    loadJSON('./data/alerts.json'),
    loadJSON('./data/prices.json'),
    loadJSON('./data/tasks.json')
  ]);
  
  workers = normalizeWorkers(workersRaw);
  statusData = statusRaw || {};
  alertsData = Array.isArray(alertsRaw) ? alertsRaw : (alertsRaw?.alerts || []);
  pricesData = Array.isArray(pricesRaw) ? pricesRaw : (pricesRaw?.prices || []);
  tasksData = Array.isArray(tasksRaw) ? tasksRaw : (tasksRaw?.tasks || []);
  
  // Merge status into workers
  if (workers.length && statusData) {
    workers = workers.map(w => {
      const s = statusData[w.id] || statusData[w.room];
      return s ? { ...w, status: s.status || w.status } : w;
    });
  }
  
  log(`Loaded ${workers.length} workers`, 'success');
  
  if (workers.length === 0) {
    log('No workers found - using fallback data', 'error');
    loadFallbackData();
  }
}

function loadFallbackData() {
  workers = [
    { id: 'atlas', name: 'Atlas', displayName: 'Atlas', role: 'Chief Coordinator', department: 'Command', room: 'Atlas Desk', status: 'active', mission: 'Coordinate all worker systems and ensure operational efficiency across the facility.', tagline: 'The backbone of operations', coreFunctions: ['System Coordination', 'Resource Allocation', 'Emergency Response'], quickActions: ['View Schedule', 'Send Alert', 'Generate Report'], inputs: ['Status Updates', 'Worker Reports', 'Alerts'], outputs: ['Directives', 'Reports', 'Schedules'], color: '#00d4ff' },
    { id: 'nova', name: 'Nova', displayName: 'Nova', role: 'Marketing Lead', department: 'Marketing', room: 'Left Wing A', status: 'active', mission: 'Drive brand awareness and lead generation through multi-channel campaigns.', tagline: 'Ideas that shine', coreFunctions: ['Campaign Management', 'Content Strategy', 'Brand Development'], quickActions: ['View Campaigns', 'Create Brief', 'Check Analytics'], inputs: ['Market Data', 'Brand Guidelines', 'Budget'], outputs: ['Campaigns', 'Content', 'Reports'], color: '#a371f7' },
    { id: 'spark', name: 'Spark', displayName: 'Spark', role: 'Sales Director', department: 'Sales', room: 'Right Wing B', status: 'idle', mission: 'Maximize revenue through strategic client relationships and pipeline management.', tagline: 'Closers close', coreFunctions: ['Pipeline Management', 'Client Relations', 'Revenue Tracking'], quickActions: ['View Pipeline', 'Add Deal', 'Schedule Call'], inputs: ['Leads', 'Pricing Data', 'Client Info'], outputs: ['Quotes', 'Proposals', 'Forecasts'], color: '#3fb950' },
    { id: 'echo', name: 'Echo', displayName: 'Echo', role: 'Research Scientist', department: 'Research', room: 'Right Wing A', status: 'active', mission: 'Conduct experiments and analyze data to drive product innovation.', tagline: 'In pursuit of truth', coreFunctions: ['Data Analysis', 'Experiment Design', 'Hypothesis Testing'], quickActions: ['View Experiments', 'Analyze Data', 'Write Paper'], inputs: ['Datasets', 'Literature', 'Hypotheses'], outputs: ['Findings', 'Papers', 'Patents'], color: '#d29922' },
    { id: 'pulse', name: 'Pulse', displayName: 'Pulse', role: 'Operations Manager', department: 'Operations', room: 'Bottom Wing', status: 'away', mission: 'Ensure smooth daily operations and coordinate cross-departmental workflows.', tagline: 'Always moving', coreFunctions: ['Process Optimization', 'Vendor Management', 'Logistics'], quickActions: ['View Tasks', 'Assign Work', 'Check Status'], inputs: ['Requests', 'Resources', 'Schedules'], outputs: ['Tasks', 'Assignments', 'Reports'], color: '#db6d28' },
    { id: 'atlas-system', name: 'Atlas System', displayName: 'Atlas System', role: 'Shared Infrastructure', department: 'Operations', room: 'Atlas Desk', status: 'active', mission: 'Core infrastructure and shared services for all workers.', tagline: 'Always running', coreFunctions: ['API Services', 'Data Storage', 'Authentication'], inputs: ['Requests', 'Data'], outputs: ['Responses', 'Data'], color: '#6e7681' }
  ];
  
  statusData = {};
  workers.forEach(w => {
    statusData[w.id] = { status: w.status, room: w.room, timestamp: new Date().toISOString() };
  });
  
  log('Loaded fallback worker data', 'info');
}

// Render Functions
function renderOfficeMap() {
  officeMap.innerHTML = '';
  
  const rooms = [
    { name: 'Left Wing A', zone: 'Marketing', workers: workers.filter(w => w.room === 'Left Wing A') },
    { name: 'Left Wing B', zone: 'Brand', workers: workers.filter(w => w.room === 'Left Wing B') },
    { name: 'Center A', zone: 'Command', workers: workers.filter(w => w.room === 'Center A') },
    { name: 'Center B', zone: 'Planning', workers: workers.filter(w => w.room === 'Center B') },
    { name: 'Atlas Desk', zone: 'Command', workers: workers.filter(w => w.room === 'Atlas Desk') },
    { name: 'Right Wing A', zone: 'Research', workers: workers.filter(w => w.room === 'Right Wing A') },
    { name: 'Right Wing B', zone: 'Analytics', workers: workers.filter(w => w.room === 'Right Wing B') },
    { name: 'Right Wing C', zone: 'Sales', workers: workers.filter(w => w.room === 'Right Wing C') },
    { name: 'Bottom Wing', zone: 'Operations', workers: workers.filter(w => w.room === 'Bottom Wing' || w.room === 'Storage') },
    { name: 'Entry', zone: 'Reception', workers: workers.filter(w => w.room === 'Entry') },
    { name: 'Meeting Room', zone: 'Collaboration', workers: workers.filter(w => w.room === 'Meeting Room') },
    { name: 'Break Room', zone: 'Support', workers: workers.filter(w => w.room === 'Break Room') }
  ];
  
  rooms.forEach(room => {
    const worker = room.workers[0];
    const card = document.createElement('div');
    card.className = `room-card ${worker ? '' : 'empty'} ${selectedWorker && selectedWorker.room === room.name ? 'selected' : ''}`;
    
    card.innerHTML = `
      <div class="room-name">${room.name}</div>
      <div class="room-worker">${worker ? (worker.displayName || worker.name) : '— Empty —'}</div>
      ${worker ? `<span class="room-status ${getStatusClass(worker.status)}">${worker.status.toUpperCase()}</span>` : ''}
    `;
    
    if (worker) {
      card.addEventListener('click', () => selectWorker(worker));
    } else {
      card.addEventListener('click', () => {
        selectedMapBadge.textContent = room.name;
        log(`Selected empty room: ${room.name}`, 'info');
      });
    }
    
    officeMap.appendChild(card);
  });
}

function renderRoster() {
  rosterList.innerHTML = '';
  
  workers.forEach(worker => {
    const item = document.createElement('div');
    item.className = `roster-item ${selectedWorker && selectedWorker.id === worker.id ? 'selected' : ''}`;
    item.innerHTML = `
      <div class="roster-dot ${getStatusClass(worker.status)}"></div>
      <span class="roster-name">${worker.displayName || worker.name}</span>
    `;
    item.addEventListener('click', () => selectWorker(worker));
    rosterList.appendChild(item);
  });
}

function renderWorkerCard(worker) {
  if (!worker) {
    workerName.textContent = 'No Worker Selected';
    workerStatus.textContent = '—';
    workerRole.textContent = 'Select a worker from the map or roster';
    workerDepartment.textContent = '—';
    workerRoom.textContent = '—';
    workerMission.textContent = '';
    workerTagline.textContent = '';
    workerFunctions.innerHTML = '<span class="chip-item">No data</span>';
    workerActions.innerHTML = '';
    workerInputs.innerHTML = '<span class="chip-item">No data</span>';
    workerOutputs.innerHTML = '<span class="chip-item">No data</span>';
    portraitImage.classList.add('hidden');
    portraitFallback.style.display = 'flex';
    return;
  }
  
  const displayName = worker.displayName || worker.name || worker.id;
  const status = worker.status || 'idle';
  
  selectedWorkerBadge.textContent = displayName;
  workerName.textContent = displayName;
  workerStatus.textContent = status.toUpperCase();
  workerStatus.className = `status-pill ${getStatusClass(status)}`;
  workerRole.textContent = worker.role || 'No role';
  workerDepartment.textContent = worker.department || 'No department';
  workerRoom.textContent = worker.room || 'No room';
  workerMission.textContent = worker.mission || 'No mission defined';
  workerTagline.textContent = worker.tagline || '';
  
  // Portrait
  if (worker.portrait) {
    portraitImage.src = worker.portrait;
    portraitImage.classList.remove('hidden');
    portraitFallback.style.display = 'none';
  } else {
    portraitImage.classList.add('hidden');
    portraitFallback.style.display = 'flex';
  }
  
  // Functions
  workerFunctions.innerHTML = '';
  const functions = worker.coreFunctions || worker.functions || [];
  (Array.isArray(functions) ? functions : []).slice(0, 4).forEach(fn => {
    const span = document.createElement('span');
    span.className = 'stack-item';
    span.textContent = fn;
    workerFunctions.appendChild(span);
  });
  if (functions.length === 0) {
    workerFunctions.innerHTML = '<span class="chip-item">No functions</span>';
  }
  
  // Actions
  workerActions.innerHTML = '';
  const actions = worker.quickActions || worker.actions || [];
  (Array.isArray(actions) ? actions : []).slice(0, 3).forEach(action => {
    const span = document.createElement('span');
    span.className = 'action-item';
    span.textContent = action;
    workerActions.appendChild(span);
  });
  if (actions.length === 0) {
    workerActions.innerHTML = '<span class="chip-item">No actions</span>';
  }
  
  // Inputs
  workerInputs.innerHTML = '';
  const inputs = worker.inputs || [];
  (Array.isArray(inputs) ? inputs : []).slice(0, 4).forEach(input => {
    const span = document.createElement('span');
    span.className = 'chip-item';
    span.textContent = input;
    workerInputs.appendChild(span);
  });
  if (inputs.length === 0) {
    workerInputs.innerHTML = '<span class="chip-item">No inputs</span>';
  }
  
  // Outputs
  workerOutputs.innerHTML = '';
  const outputs = worker.outputs || [];
  (Array.isArray(outputs) ? outputs : []).slice(0, 4).forEach(output => {
    const span = document.createElement('span');
    span.className = 'chip-item';
    span.textContent = output;
    workerOutputs.appendChild(span);
  });
  if (outputs.length === 0) {
    workerOutputs.innerHTML = '<span class="chip-item">No outputs</span>';
  }
}

function selectWorker(worker) {
  selectedWorker = worker;
  const displayName = worker.displayName || worker.name;
  
  selectedMapBadge.textContent = worker.room || 'Unknown';
  renderOfficeMap();
  renderRoster();
  renderWorkerCard(worker);
  
  log(`Selected worker: ${displayName} (${worker.status})`, 'success');
}

// Event Handlers
async function handleRefresh() {
  log('Refreshing data...', 'info');
  await loadAllData();
  
  if (selectedWorker) {
    const updated = workers.find(w => w.id === selectedWorker.id);
    if (updated) {
      selectWorker(updated);
    }
  } else if (workers.length > 0) {
    selectWorker(workers[0]);
  }
  
  renderOfficeMap();
  renderRoster();
  log('Refresh complete', 'success');
}

function handleConnect() {
  log('Atlas link ready - local mode active', 'info');
  log('Backend connection: simulated (local-only)', 'success');
}

// Initialize
async function init() {
  log('Mission Control dashboard loaded', 'info');
  
  await loadAllData();
  renderOfficeMap();
  renderRoster();
  
  if (workers.length > 0) {
    selectWorker(workers[0]);
  } else {
    renderWorkerCard(null);
  }
  
  refreshBtn.addEventListener('click', handleRefresh);
  connectBtn.addEventListener('click', handleConnect);
  
  log('Ready for operation', 'success');
}

// Start
init();

