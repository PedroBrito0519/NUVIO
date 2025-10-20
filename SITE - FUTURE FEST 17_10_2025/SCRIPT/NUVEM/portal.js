function toggleTheme() {
    const themeLink = document.getElementById('theme-style');
    const btn = document.querySelector('.theme-toggle-icon');
    const currentTheme = themeLink.getAttribute('href');

    if (currentTheme.includes('portalEscuro.css')) {
        themeLink.setAttribute('href', 'CSS/NUVEM/portal.css');
        btn.innerHTML = "🌙";
        document.body.classList.remove('dark-theme');
        localStorage.setItem('theme', 'light');
    } else {
        themeLink.setAttribute('href', 'CSS/NUVEM/portalEscuro.css');
        btn.innerHTML = "🌞";
        document.body.classList.add('dark-theme');
        localStorage.setItem('theme', 'dark');
    }
}

window.addEventListener('DOMContentLoaded', function() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    const themeLink = document.getElementById('theme-style');
    const btn = document.querySelector('.theme-toggle-icon');

    if (savedTheme === 'dark') {
        themeLink.setAttribute('href', 'CSS/NUVEM/portalEscuro.css');
        btn.innerHTML = "🌞";
        document.body.classList.add('dark-theme');
    } else {
        themeLink.setAttribute('href', 'CSS/NUVEM/portal.css');
        btn.innerHTML = "🌙";
        document.body.classList.remove('dark-theme');
    }
});




// ==================== Dados iniciais ====================
const fileSystem = {
  raiz: {
    type: "folder",
    date: new Date().toLocaleString("pt-BR"),
    owner: "Você",
    children: {}
  },
  compartilhados: {
    type: "folder",
    date: new Date().toLocaleString("pt-BR"),
    owner: "Sistema",
    children: {}
  },
  lixeira: {
    type: "folder",
    date: new Date().toLocaleString("pt-BR"),
    owner: "Sistema",
    children: {}
  }
};

let currentView = "raiz"; // "raiz" | "compartilhados" | "lixeira"
let folderStack = ["raiz"]; // Armazena o caminho das pastas pela qual o usuário navegou
let lastSort = { criteria: null, asc: true };

// ==================== Referências DOM ====================
const fileTable = document.getElementById("fileTable");
const currentPathEl = document.getElementById("currentPath");
const fileInput = document.getElementById("fileInput");
const folderInput = document.getElementById("folderInput");

const sortBtn = document.getElementById("sortBtn");
const sortOptions = document.getElementById("sortOptions");

const newFolderModal = document.getElementById("newFolderModal");
const newFolderName = document.getElementById("newFolderName");
const createFolderBtn = document.getElementById("createFolderBtn");
const cancelBtn = document.getElementById("cancelBtn");

const btnBack = document.getElementById("btnBack");

// ==================== Utilitários ====================
function getCurrentChildren() {
  let children = fileSystem;
  for (const folder of folderStack) {
    children = children[folder].children;
  }
  return children;
}

function updatePathDisplay() {
  const path = folderStack.join(" > ");
  currentPathEl.textContent = path ? `📂 ${path}` : "📂 Meus Arquivos";
  btnBack.style.display = folderStack.length > 1 ? "inline-block" : "none";
}

// ==================== Renderização ====================
function renderFiles() {
  fileTable.innerHTML = "";
  const folder = getCurrentChildren();

  const keys = Object.keys(folder);
  if (keys.length === 0) {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td colspan="5" style="opacity:.8">${currentView === "lixeira" ? "Lixeira vazia." : (currentView === "compartilhados" ? "Nenhum arquivo compartilhado." : "Pasta vazia.")}</td>`;
    fileTable.appendChild(tr);
    return;
  }

  for (const name of keys) {
    const item = folder[name];
    const tr = document.createElement("tr");

    // Nome
    const tdName = document.createElement("td");
    tdName.textContent = `${item.type === "folder" ? "📁" : "📄"} ${name}`;
    tdName.onclick = () => openFolder(name); // Ao clicar, abre a pasta
    tr.appendChild(tdName);

    // Data
    const tdDate = document.createElement("td");
    tdDate.textContent = item.date || "-";
    tr.appendChild(tdDate);

    // Tamanho
    const tdSize = document.createElement("td");
    tdSize.textContent = item.size ? `${item.size} KB` : "-";
    tr.appendChild(tdSize);

    // Dono
    const tdOwner = document.createElement("td");
    tdOwner.textContent = item.owner || "-";
    tr.appendChild(tdOwner);

    // Ações
    const tdActions = document.createElement("td");
    tdActions.classList.add("actions");

    if (currentView !== "lixeira") {
      const btnShare = document.createElement("button");
      btnShare.className = "btn-share";
      btnShare.title = "Compartilhar";
      btnShare.textContent = "🔗";
      btnShare.onclick = () => shareItem(name, item);
      tdActions.appendChild(btnShare);

      const btnDelete = document.createElement("button");
      btnDelete.className = "btn-delete";
      btnDelete.title = "Excluir";
      btnDelete.textContent = "🗑️";
      btnDelete.onclick = () => moveToTrash(name);
      tdActions.appendChild(btnDelete);
    }

    if (currentView === "lixeira") {
      const btnRestore = document.createElement("button");
      btnRestore.className = "btn-restore";
      btnRestore.textContent = "♻️ Restaurar";
      btnRestore.onclick = () => restoreItem(name);
      tdActions.appendChild(btnRestore);

      const btnDelete = document.createElement("button");
      btnDelete.className = "btn-permanent";
      btnDelete.textContent = "❌ Excluir";
      btnDelete.onclick = () => deletePermanent(name);
      tdActions.appendChild(btnDelete);
    }

    tr.appendChild(tdActions);
    fileTable.appendChild(tr);
  }
}

// ==================== Função de Navegação ====================
function openFolder(name) {
  if (fileSystem[currentView].children[name].type === "folder") {
    folderStack.push(name); // Empurra a nova pasta para o stack
    updatePathDisplay();
    renderFiles();
  }
}

function goBack() {
  folderStack.pop(); // Remove a última pasta do stack
  updatePathDisplay();
  renderFiles();
}

// ==================== Nova pasta (modal) ====================
function openNewFolderModal() {
  newFolderModal.classList.add("show");
  newFolderModal.setAttribute("aria-hidden", "false");
  newFolderName.value = "";
  setTimeout(() => newFolderName.focus(), 80);
}

createFolderBtn.addEventListener("click", () => {
  const name = newFolderName.value.trim();
  if (!name) {
    alert("Digite um nome válido para a pasta.");
    return;
  }
  const children = getCurrentChildren();
  if (children[name]) {
    alert("Já existe um arquivo/pasta com esse nome aqui.");
    return;
  }
  children[name] = {
    type: "folder",
    date: new Date().toLocaleString("pt-BR"),
    owner: "Você",
    children: {}
  };
  closeNewFolderModal();
  renderFiles();
});

cancelBtn.addEventListener("click", () => closeNewFolderModal());

function closeNewFolderModal() {
  newFolderModal.classList.remove("show");
  newFolderModal.setAttribute("aria-hidden", "true");
  newFolderName.value = "";
}

// ==================== Upload ====================
function triggerUpload() {
  fileInput.value = "";
  fileInput.click();
}

fileInput.addEventListener("change", (e) => {
  const file = e.target.files && e.target.files[0];
  if (!file) return;
  const children = getCurrentChildren();
  if (children[file.name]) {
    alert("Já existe um arquivo ou pasta com esse nome!");
    return;
  }
  children[file.name] = {
    type: "file",
    date: new Date(file.lastModified).toLocaleString("pt-BR"),
    size: Math.round(file.size / 1024),
    owner: "Você",
    content: file
  };
  renderFiles();
});

// ==================== Compartilhar ====================
function shareItem(name, item) {
  const target = fileSystem.compartilhados.children;
  let newName = name;
  let i = 1;
  while (target[newName]) {
    newName = `${name} (${i++})`;
  }
  target[newName] = { ...item, sharedBy: "Você" };
  alert(`"${name}" compartilhado.`);
  if (currentView === "compartilhados") renderFiles();
}

// ==================== Lixeira ====================
function moveToTrash(name) {
  const children = getCurrentChildren();
  const item = children[name];
  let newName = name;
  let i = 1;
  while (fileSystem.lixeira.children[newName]) {
    newName = `${name} (${i++})`;
  }
  fileSystem.lixeira.children[newName] = item;
  delete children[name];
  renderFiles();
}

function restoreItem(name) {
  const item = fileSystem.lixeira.children[name];
  let newName = name;
  let i = 1;
  while (fileSystem.raiz.children[newName]) {
    newName = `${name} (${i++})`;
  }
  fileSystem.raiz.children[newName] = item;
  delete fileSystem.lixeira.children[name];
  renderFiles();
}

function deletePermanent(name) {
  if (!confirm(`Excluir permanentemente "${name}"?`)) return;
  delete fileSystem.lixeira.children[name];
  renderFiles();
}

// ==================== Ordenação ====================
function parseDateBR(str) {
  if (!str) return 0;
  const [datePart, timePart = "00:00:00"] = str.split(" ");
  const [d, m, y] = datePart.split("/");
  return new Date(`${y}-${m}-${d}T${timePart}`).getTime();
}

function sortFiles(criteria) {
  const children = getCurrentChildren();
  let items = Object.entries(children);

  if (lastSort.criteria === criteria) {
    lastSort.asc = !lastSort.asc;
  } else {
    lastSort.criteria = criteria;
    lastSort.asc = true;
  }
  const mult = lastSort.asc ? 1 : -1;

  items.sort((a, b) => {
    const A = a[1], B = b[1];
    if (criteria === "name") return a[0].localeCompare(b[0]) * mult;
    if (criteria === "date") return (parseDateBR(A.date) - parseDateBR(B.date)) * mult;
    if (criteria === "size") return ((A.size || 0) - (B.size || 0)) * mult;
    if (criteria === "owner") return ((A.owner || "").localeCompare(B.owner || "")) * mult;
    return 0;
  });

  const ordered = {};
  for (const [k, v] of items) ordered[k] = v;

  fileSystem[currentView].children = ordered;
  renderFiles();
}

// ==================== Dropdown de Ordenação ====================
sortBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  sortOptions.classList.toggle("show");
});

sortOptions.querySelectorAll("div").forEach(opt => {
  opt.addEventListener("click", (e) => {
    e.stopPropagation();
    const crit = opt.dataset.sort;
    if (crit) sortFiles(crit);
    sortOptions.classList.remove("show");
  });
});

// Fechar dropdown se clicar fora
document.addEventListener("click", (e) => {
  if (!e.target.closest("#sortOptions") && !e.target.closest("#sortBtn")) {
    sortOptions.classList.remove("show");
  }
});

// ==================== Navegação na Sidebar ====================
document.querySelectorAll(".nav-item").forEach(item => {
  item.addEventListener("click", () => {
    document.querySelectorAll(".nav-item").forEach(i => i.classList.remove("active"));
    item.classList.add("active");
    currentView = item.dataset.view;
    folderStack = [currentView]; // Reseta a navegação de pastas
    updatePathDisplay();
    renderFiles();
  });
});

// ==================== Inicialização ====================
updatePathDisplay();
renderFiles();
