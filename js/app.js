/* ==========================================================================
   HAAL LAB - Interactive Web Engine & Simulation Logic
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initParticleCanvas();
  initCalculator();
  initAgentSandbox();
  initRAGSandbox();
  initWizardModal();
  initScrollAnimations();
});

/* --------------------------------------------------------------------------
   1. Interactive Canvas Background (Neural Mesh & Mouse Attraction)
   -------------------------------------------------------------------------- */
function initParticleCanvas() {
  const canvas = document.getElementById('particle-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  const mouse = { x: null, y: null, radius: 150 };

  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  window.addEventListener('mouseleave', () => {
    mouse.x = null;
    mouse.y = null;
  });

  const particles = [];
  const particleCount = Math.min(Math.floor(width / 18), 70);

  class Particle {
    constructor() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.vx = (Math.random() - 0.5) * 0.6;
      this.vy = (Math.random() - 0.5) * 0.6;
      this.radius = Math.random() * 2 + 1;
      this.color = Math.random() > 0.4 ? 'rgba(0, 242, 254, ' : 'rgba(99, 102, 241, ';
      this.alpha = Math.random() * 0.5 + 0.2;
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;

      if (this.x < 0 || this.x > width) this.vx *= -1;
      if (this.y < 0 || this.y > height) this.vy *= -1;

      // Mouse attraction
      if (mouse.x !== null && mouse.y !== null) {
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < mouse.radius) {
          const force = (mouse.radius - dist) / mouse.radius;
          this.x -= (dx / dist) * force * 1.5;
          this.y -= (dy / dist) * force * 1.5;
        }
      }
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = this.color + this.alpha + ')';
      ctx.shadowBlur = 10;
      ctx.shadowColor = 'rgba(0, 242, 254, 0.5)';
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  }

  for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle());
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);

    // Connect particles
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 140) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          const opacity = (1 - dist / 140) * 0.15;
          ctx.strokeStyle = `rgba(0, 242, 254, ${opacity})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
    }

    particles.forEach((p) => {
      p.update();
      p.draw();
    });

    requestAnimationFrame(animate);
  }

  animate();
}

/* --------------------------------------------------------------------------
   2. Interactive Private AI Calculator Logic
   -------------------------------------------------------------------------- */
function initCalculator() {
  const tokenSlider = document.getElementById('calc-tokens');
  const tokenValDisp = document.getElementById('calc-tokens-val');
  const gpuSelect = document.getElementById('calc-gpu');
  const deploySelect = document.getElementById('calc-deploy');

  const statThroughput = document.getElementById('stat-throughput');
  const statLatency = document.getElementById('stat-latency');
  const statSavings = document.getElementById('stat-savings');
  const statCompliance = document.getElementById('stat-compliance');

  if (!tokenSlider) return;

  function updateCalculations() {
    const millionTokens = parseFloat(tokenSlider.value);
    tokenValDisp.textContent = `${millionTokens}M Tokens / day`;

    const gpuMult = parseFloat(gpuSelect.value || 1);
    const isAirGapped = deploySelect.value === 'airgapped';

    // Calculation formulas
    const tokensPerSec = Math.round(75 * gpuMult * (1 + (millionTokens / 100)));
    const latencyMs = isAirGapped ? Math.max(4, Math.round(14 / gpuMult)) : Math.round(28 / gpuMult);
    
    // Cloud API cost equivalent (~$3.00 per 1M tokens) vs On-prem server amortized cost
    const cloudAnnualCost = millionTokens * 3.0 * 365;
    const onPremAnnualCost = 28000 + (gpuMult * 12000);
    const netSavings = Math.max(15000, cloudAnnualCost - onPremAnnualCost);
    const formattedSavings = '$' + Math.round(netSavings).toLocaleString();

    const compliancePercent = isAirGapped ? '100% (ISO 27001)' : '99.4% (Private VPC)';

    statThroughput.textContent = `${tokensPerSec} tok/s`;
    statLatency.textContent = `< ${latencyMs} ms`;
    statSavings.textContent = formattedSavings;
    statCompliance.textContent = compliancePercent;
  }

  tokenSlider.addEventListener('input', updateCalculations);
  gpuSelect.addEventListener('change', updateCalculations);
  deploySelect.addEventListener('change', updateCalculations);

  updateCalculations();
}

/* --------------------------------------------------------------------------
   3. Autonomous Multi-Agent Sandbox (Live DAG Runner)
   -------------------------------------------------------------------------- */
const sandboxPresets = {
  fin: {
    nodes: [
      { name: "Ingestion Router Node", desc: "Verifies zero egress & parses PDF stream", status: "completed" },
      { name: "Vector RAG Search", desc: "Retrieves 10 top SEC financial chunks", status: "completed" },
      { name: "Graph Reranker Node", desc: "Maps entity dependencies in Neo4j", status: "active" },
      { name: "vLLM Quantized Synthesizer", desc: "Runs Llama-3.3 70B local inference", status: "pending" },
      { name: "Air-Gap Guardrail Validator", desc: "Checks PII redacting & output bounds", status: "pending" }
    ],
    logs: [
      "[00:00.01] SYSTEM: Initializing Air-Gapped Financial Audit Swarm...",
      "[00:00.04] ROUTER: Network sockets locked down (0 egress channels).",
      "[00:00.12] VECTOR_RAG: Scanned 1.4M embeddings in 3.2ms. Cosine similarity: 0.941.",
      "[00:00.28] GRAPH_NODE: Navigating 3-hop relationships in Neo4j knowledge graph...",
      "[00:00.45] LLM_LOCAL: Streaming first token from local 4x NVIDIA H100 cluster...",
      "[00:00.82] GUARDRAIL: PII scan complete (0 leaks). Output verified."
    ]
  },
  med: {
    nodes: [
      { name: "Clinical Query Router", desc: "Parses HIPAA patient context", status: "completed" },
      { name: "PubMed Local Embedding Search", desc: "RAG lookup over 30M medical papers", status: "completed" },
      { name: "Oncology Knowledge Graph", desc: "Cross-references drug interaction nodes", status: "active" },
      { name: "Haal-VLM Medical Reasoning", desc: "Generates clinical trial recommendations", status: "pending" },
      { name: "HIPAA Audit Logger", desc: "Encrypted local ledger storage", status: "pending" }
    ],
    logs: [
      "[00:00.01] SYSTEM: Medical Knowledge Graph Swarm initialized.",
      "[00:00.05] SECURITY: Air-gap verified. Zero telemetry enabled.",
      "[00:00.18] RAG_ENGINE: 8 PubMed papers loaded (Qdrant HNSW vector index).",
      "[00:00.32] KNOWLEDGE_GRAPH: Entity matching: [Target Mutation: BRAF V600E].",
      "[00:00.67] vLLM: Generating medical evidence summary with local 128k context...",
      "[00:00.95] SUCCESS: Clinical synthesis complete in 950ms."
    ]
  },
  code: {
    nodes: [
      { name: "AST Code Analyzer", desc: "Extracts call graph & symbol index", status: "completed" },
      { name: "Vulnerability Pattern RAG", desc: "Matches CVE database & CWE taxonomy", status: "completed" },
      { name: "Static Proof Solver", desc: "Solves formal logic constraints", status: "active" },
      { name: "Defensive Patch Generator", desc: "Synthesizes memory-safe C++ refactor", status: "pending" },
      { name: "Air-Gapped Sandbox Executor", desc: "Compiles & runs unit test suite", status: "pending" }
    ],
    logs: [
      "[00:00.02] CODE_AGENT: Scanning repository AST (124 files, C++20)...",
      "[00:00.09] VULN_RAG: Detected buffer overflow potential in parser.cpp:142.",
      "[00:00.24] SOLVER: Constructing Z3 SMT constraint proof...",
      "[00:00.51] SYNTHESIZER: Generating memory-safe std::span patch...",
      "[00:00.78] TEST_RUNNER: Executing local container unit tests: 42 PASSED."
    ]
  }
};

function initAgentSandbox() {
  const dagContainer = document.getElementById('dag-container');
  const terminalLogs = document.getElementById('terminal-logs');
  const presetBtns = document.querySelectorAll('.preset-btn');
  const runBtn = document.getElementById('run-swarm-btn');

  if (!dagContainer) return;

  let currentPreset = 'fin';

  function renderPreset(key) {
    currentPreset = key;
    const data = sandboxPresets[key];

    // Render DAG Nodes
    dagContainer.innerHTML = '';
    data.nodes.forEach((node, index) => {
      const nodeEl = document.createElement('div');
      nodeEl.className = `dag-node ${node.status}`;
      nodeEl.innerHTML = `
        <div class="node-info">
          <div class="node-status-icon">${index + 1}</div>
          <div>
            <div style="font-weight: 600; font-size: 0.95rem;">${node.name}</div>
            <div style="font-size: 0.78rem; color: var(--text-muted);">${node.desc}</div>
          </div>
        </div>
        <div class="font-mono" style="font-size: 0.75rem; color: var(--accent-cyan);">
          ${node.status === 'completed' ? '✓ OK' : node.status === 'active' ? '● RUNNING' : 'WAITING'}
        </div>
      `;
      dagContainer.appendChild(nodeEl);
    });

    // Render Logs
    terminalLogs.innerHTML = '';
    data.logs.forEach(log => {
      const logLine = document.createElement('div');
      logLine.className = 'log-line';
      if (log.includes('SYSTEM') || log.includes('SECURITY')) {
        logLine.innerHTML = `<span class="log-time">${log.substring(0, 10)}</span><span class="log-sys">${log.substring(10)}</span>`;
      } else if (log.includes('SUCCESS') || log.includes('PASSED')) {
        logLine.innerHTML = `<span class="log-time">${log.substring(0, 10)}</span><span class="log-success">${log.substring(10)}</span>`;
      } else {
        logLine.innerHTML = `<span class="log-time">${log.substring(0, 10)}</span>${log.substring(10)}`;
      }
      terminalLogs.appendChild(logLine);
    });
  }

  presetBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      presetBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderPreset(btn.dataset.preset);
    });
  });

  if (runBtn) {
    runBtn.addEventListener('click', () => {
      showToast(`Executing Swarm Simulation: ${currentPreset.toUpperCase()}...`);
      renderPreset(currentPreset);
    });
  }

  renderPreset('fin');
}

/* --------------------------------------------------------------------------
   4. Interactive RAG & Knowledge Sandbox
   -------------------------------------------------------------------------- */
const ragDocs = [
  { id: "DOC-8921", title: "Enterprise Data Sovereignty Architecture", score: "0.964 Similarity", text: "HAAL LAB private AI instances enforce hardware-isolated memory pages and zero network telemetry outbound traffic." },
  { id: "DOC-4412", title: "Speculative Quantization Benchmark", score: "0.912 Similarity", text: "By coupling GGUF 4-bit quantizations with vLLM tensor parallelism, throughput achieves 140 tokens/sec on 4x H100 GPUs." },
  { id: "DOC-1094", title: "Hybrid Knowledge Graph Retrieval", score: "0.885 Similarity", text: "Combining Qdrant vector similarity search with Neo4j graph relational hops eliminates hallucination rates by 94%." }
];

function initRAGSandbox() {
  const ragContainer = document.getElementById('rag-results-container');
  const searchInput = document.getElementById('rag-search-input');
  if (!ragContainer || !searchInput) return;

  function renderRAG(filter = '') {
    ragContainer.innerHTML = '';
    const filtered = ragDocs.filter(d => 
      d.title.toLowerCase().includes(filter.toLowerCase()) || 
      d.text.toLowerCase().includes(filter.toLowerCase())
    );

    if (filtered.length === 0) {
      ragContainer.innerHTML = `<div style="color: var(--text-muted); font-size: 0.9rem;">No chunks match the semantic query. Try keywords like "Sovereignty", "vLLM", or "Graph".</div>`;
      return;
    }

    filtered.forEach(doc => {
      const chunkEl = document.createElement('div');
      chunkEl.className = 'rag-chunk';
      chunkEl.innerHTML = `
        <div class="chunk-meta">
          <span>${doc.id} • ${doc.title}</span>
          <span>${doc.score}</span>
        </div>
        <div style="font-size: 0.9rem; color: var(--text-muted);">${doc.text}</div>
      `;
      ragContainer.appendChild(chunkEl);
    });
  }

  searchInput.addEventListener('input', (e) => {
    renderRAG(e.target.value);
  });

  renderRAG();
}

/* --------------------------------------------------------------------------
   5. Interactive Project Audit & Wizard Modal
   -------------------------------------------------------------------------- */
function initWizardModal() {
  const openBtns = document.querySelectorAll('.open-wizard-btn');
  const modalOverlay = document.getElementById('wizard-modal');
  const modalClose = document.getElementById('modal-close-btn');

  const stepContainer = document.getElementById('wizard-step-body');
  const wizardTitle = document.getElementById('wizard-step-title');
  const wizardNext = document.getElementById('wizard-next-btn');

  if (!modalOverlay) return;

  let currentStep = 1;
  const selections = { industry: 'Defense & Aerospace', deploy: 'Air-Gapped On-Premises', goal: 'Private Multi-Agent Swarm' };

  const steps = [
    {
      title: "Step 1: Select Your Industry Sector",
      options: ["Defense & Security", "Financial Engineering", "Healthcare & Genomics", "Enterprise SaaS"],
      key: 'industry'
    },
    {
      title: "Step 2: Deployment Infrastructure",
      options: ["Air-Gapped On-Premises Cluster", "Private Cloud (AWS / GCP / Azure)", "Hybrid Edge Node Stack"],
      key: 'deploy'
    },
    {
      title: "Step 3: Primary AI Capability Goal",
      options: ["Private Multi-Agent Swarm", "Hybrid Vector + Graph RAG", "Custom LLM Fine-Tuning (GGUF/vLLM)"],
      key: 'goal'
    }
  ];

  function openModal() {
    currentStep = 1;
    renderStep(1);
    modalOverlay.classList.add('active');
  }

  function closeModal() {
    modalOverlay.classList.remove('active');
  }

  function renderStep(stepNum) {
    if (stepNum > steps.length) {
      // Summary Step
      wizardTitle.textContent = "Architecture Recommendation Ready";
      stepContainer.innerHTML = `
        <div style="background: rgba(0, 242, 254, 0.05); border: 1px solid var(--border-glow); border-radius: var(--radius-md); padding: 1.5rem; margin-bottom: 1.5rem;">
          <div style="font-weight: 700; font-size: 1.1rem; color: #fff; margin-bottom: 0.75rem;">Tailored Architecture Spec:</div>
          <ul style="list-style: none; display: flex; flex-direction: column; gap: 0.5rem; font-size: 0.9rem; color: var(--text-muted);">
            <li>🔹 <strong>Sector:</strong> ${selections.industry}</li>
            <li>🔹 <strong>Infrastructure:</strong> ${selections.deploy}</li>
            <li>🔹 <strong>Core Module:</strong> ${selections.goal}</li>
            <li>🔹 <strong>Estimated Latency:</strong> &lt; 8ms first-token</li>
          </ul>
        </div>
        <div class="form-group">
          <label class="form-label">Corporate Email Address</label>
          <input type="email" id="wizard-email" class="select-input" placeholder="cto@enterprise.com" required />
        </div>
      `;
      wizardNext.textContent = "Submit & Receive Blueprint";
      return;
    }

    const stepData = steps[stepNum - 1];
    wizardTitle.textContent = stepData.title;

    let optsHtml = `<div class="wizard-options">`;
    stepData.options.forEach(opt => {
      const isSelected = selections[stepData.key] === opt;
      optsHtml += `
        <div class="wizard-opt ${isSelected ? 'selected' : ''}" data-val="${opt}">
          <span>${opt}</span>
          <span>${isSelected ? '✓' : ''}</span>
        </div>
      `;
    });
    optsHtml += `</div>`;
    stepContainer.innerHTML = optsHtml;
    wizardNext.textContent = stepNum === steps.length ? "Review Architecture" : "Next Step →";

    // Add option click handlers
    document.querySelectorAll('.wizard-opt').forEach(optEl => {
      optEl.addEventListener('click', () => {
        selections[stepData.key] = optEl.dataset.val;
        renderStep(stepNum);
      });
    });
  }

  openBtns.forEach(btn => btn.addEventListener('click', openModal));
  if (modalClose) modalClose.addEventListener('click', closeModal);

  if (wizardNext) {
    wizardNext.addEventListener('click', () => {
      if (currentStep <= steps.length) {
        currentStep++;
        renderStep(currentStep);
      } else {
        const email = document.getElementById('wizard-email')?.value;
        if (!email || !email.includes('@')) {
          showToast('Please enter a valid corporate email address.');
          return;
        }
        closeModal();
        showToast('Technical proposal requested! A HAAL LAB partner will respond within 4 hours.');
      }
    });
  }
}

/* --------------------------------------------------------------------------
   6. Global Toast Notification System
   -------------------------------------------------------------------------- */
function showToast(message) {
  let toastContainer = document.querySelector('.toast-container');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.className = 'toast-container';
    document.body.appendChild(toastContainer);
  }

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `<span>⚡</span> <span>${message}</span>`;
  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

/* --------------------------------------------------------------------------
   7. Scroll Animations & Observers
   -------------------------------------------------------------------------- */
function initScrollAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.bento-card, .calculator-card, .paper-card, .matrix-wrapper').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(25px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
  });
}
