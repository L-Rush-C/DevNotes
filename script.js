// ─── Estado global ────────────────────────────────────────────────────────────
const estado = {
  lenguajes: [],    // [{id, nombre, logo, colores:[], nota:'', nombreArchivo:''}]
  activo: null,
  modoEditor: false,
  carpetaHandle: null,  // FileSystemDirectoryHandle
};

// ─── Inicialización ───────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  cargarMetadatos();
  renderizarSidebar();
  mostrarInicio();

  document.querySelector('.logo-lateral').addEventListener('click', mostrarInicio);
  document.getElementById('btnAbrirModal').addEventListener('click', () => {
    mostrarInicio();
    document.getElementById('inputNombre').focus();
  });
});

// ─── Metadatos en localStorage ────────────────────────────────────────────────
// Solo guarda nombre, svg, colores, nombreArchivo.
// El contenido de cada nota vive en su propio .md dentro de la carpeta elegida.

function guardarMetadatos() {
  const meta = estado.lenguajes.map(({ id, nombre, logo, colores, nombreArchivo }) => ({
    id, nombre, logo, colores, nombreArchivo,
  }));
  localStorage.setItem('devnotes_meta', JSON.stringify(meta));
}

function cargarMetadatos() {
  const raw = localStorage.getItem('devnotes_meta');
  if (raw) {
    // nota vacía por defecto; se llenará al abrir cada lenguaje leyendo el archivo
    estado.lenguajes = JSON.parse(raw).map(m => ({ ...m, nota: '', logo: m.logo || m.svg || '' }));
  }
}

// ─── File System Access API ───────────────────────────────────────────────────

async function elegirCarpeta() {
  if (!('showDirectoryPicker' in window)) {
    notificar('⚠ Usa Chrome o Edge — Firefox no soporta la File System Access API');
    return false;
  }
  try {
    estado.carpetaHandle = await window.showDirectoryPicker({ mode: 'readwrite' });
    notificar(`📁 Carpeta "${estado.carpetaHandle.name}" conectada`);
    return true;
  } catch {
    return false; // usuario canceló
  }
}

async function asegurarCarpeta() {
  if (estado.carpetaHandle) return true;
  notificar('Elige la carpeta donde se guardarán las notas…');
  return await elegirCarpeta();
}

async function escribirArchivo(nombreArchivo, contenido) {
  try {
    const handle = await estado.carpetaHandle.getFileHandle(nombreArchivo, { create: true });
    const writable = await handle.createWritable();
    await writable.write(contenido);
    await writable.close();
  } catch (e) {
    notificar('⚠ No se pudo escribir el archivo: ' + e.message);
  }
}

async function leerArchivo(nombreArchivo) {
  try {
    const handle = await estado.carpetaHandle.getFileHandle(nombreArchivo);
    const file = await handle.getFile();
    return await file.text();
  } catch {
    return null; // no existe aún
  }
}

async function eliminarArchivo(nombreArchivo) {
  try {
    await estado.carpetaHandle.removeEntry(nombreArchivo);
  } catch {
    // no existía, sin problema
  }
}

// ─── Nombre de archivo seguro ─────────────────────────────────────────────────
function nombreSeguro(nombre) {
  return nombre
    .toLowerCase()
    .replace(/[^a-z0-9áéíóúñü\-]/gi, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '') + '.md';
}

// ─── Utilidades ───────────────────────────────────────────────────────────────
function generarId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function mostrar(el) { el.classList.remove('oculto'); }
function ocultar(el) { el.classList.add('oculto'); }

function notificar(msg, dur = 2800) {
  const n = document.getElementById('notificacion');
  n.textContent = msg;
  mostrar(n);
  clearTimeout(n._t);
  n._t = setTimeout(() => ocultar(n), dur);
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────
function renderizarSidebar() {
  const lista = document.getElementById('listaLenguajes');
  lista.innerHTML = '';

  estado.lenguajes.forEach(lang => {
    const li = document.createElement('li');
    li.className = 'item-nav';

    const btn = document.createElement('button');
    btn.className = 'enlace-nav' + (estado.activo === lang.id ? ' activo' : '');
    btn.setAttribute('aria-label', lang.nombre);
    btn.setAttribute('data-id', lang.id);

    let logoHtml = lang.logo.startsWith('<svg') ? lang.logo : `<img src="${lang.logo}" alt="${lang.nombre}" style="width:20px; height:20px; object-fit:contain;">`;
    btn.innerHTML = `
      ${logoHtml}
      <span class="tooltip-nav">${lang.nombre}</span>
      ${lang.colores[0] ? `<span class="dot-color" style="background:${lang.colores[0]}"></span>` : ''}
    `;
    btn.addEventListener('click', () => abrirLenguaje(lang.id));

    li.appendChild(btn);
    lista.appendChild(li);
  });
}

// ─── Navegación ───────────────────────────────────────────────────────────────
function mostrarInicio() {
  estado.activo = null;
  estado.modoEditor = false;
  mostrar(document.getElementById('pantallaInicio'));
  ocultar(document.getElementById('pantallaNota'));
  document.querySelectorAll('.enlace-nav').forEach(b => b.classList.remove('activo'));
}

async function abrirLenguaje(id) {
  const lang = estado.lenguajes.find(l => l.id === id);
  if (!lang) return;

  // Necesitamos la carpeta para leer el archivo
  if (!await asegurarCarpeta()) return;

  const contenido = await leerArchivo(lang.nombreArchivo);
  lang.nota = contenido ?? `# ${lang.nombre}\n\nEmpieza a escribir tus apuntes aquí…`;

  estado.activo = id;
  estado.modoEditor = false;

  ocultar(document.getElementById('pantallaInicio'));
  mostrar(document.getElementById('pantallaNota'));
  ocultar(document.getElementById('editorPanel'));

  document.querySelectorAll('.enlace-nav').forEach(b => {
    b.classList.toggle('activo', b.dataset.id === id);
  });

  document.getElementById('notaNombre').textContent = lang.nombre;
  document.getElementById('notaLogoWrapper').innerHTML = lang.logo.startsWith('<svg') ? lang.logo : `<img src="${lang.logo}" alt="${lang.nombre}">`;

  document.getElementById('notaColores').innerHTML = lang.colores
    .map(c => `<span class="pastilla-color" style="background:${c}" title="${c}"></span>`)
    .join('');

  const color = lang.colores[0] || '#c9a86c';
  document.getElementById('notaEncabezado').style.borderBottomColor = color + '40';

  renderizarNota(lang.nota);
}

function renderizarNota(markdown) {
  const el = document.getElementById('notaContenido');
  el.innerHTML = typeof marked !== 'undefined'
    ? marked.parse(markdown || '')
    : `<pre>${markdown}</pre>`;
}

// ─── Editor ───────────────────────────────────────────────────────────────────
function toggleEditor() {
  const panel = document.getElementById('editorPanel');
  const btn = document.getElementById('btnEditar');
  estado.modoEditor = !estado.modoEditor;

  if (estado.modoEditor) {
    const lang = estado.lenguajes.find(l => l.id === estado.activo);
    if (!lang) return;
    document.getElementById('editorTexto').value = lang.nota;
    previsualizarEditor();
    mostrar(panel);
    btn.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="14" height="14">
        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
      </svg> Cerrar`;
    document.getElementById('editorTexto').focus();
  } else {
    ocultar(panel);
    btn.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="14" height="14">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
      </svg> Editar`;
  }
}

function previsualizarEditor() {
  const texto = document.getElementById('editorTexto').value;
  const preview = document.getElementById('editorPreview');
  preview.innerHTML = typeof marked !== 'undefined'
    ? marked.parse(texto)
    : texto;
  preview.className = 'editor-preview nota-contenido';
}

async function guardarNota() {
  const lang = estado.lenguajes.find(l => l.id === estado.activo);
  if (!lang) return;
  if (!await asegurarCarpeta()) return;

  const texto = document.getElementById('editorTexto').value;
  lang.nota = texto;

  await escribirArchivo(lang.nombreArchivo, texto);
  renderizarNota(texto);
  notificar(`✓ Guardado → ${lang.nombreArchivo}`);
}

// ─── Agregar lenguaje ─────────────────────────────────────────────────────────
async function agregarLenguaje() {
  const nombre = document.getElementById('inputNombre').value.trim();
  const logo    = document.getElementById('inputLogo').value.trim();
  const nota   = document.getElementById('inputNota').value.trim();

  if (!nombre) {
    notificar('⚠ Escribe el nombre del lenguaje');
    document.getElementById('inputNombre').focus();
    return;
  }

  if (!await asegurarCarpeta()) return;

  const colores = [];
  document.querySelectorAll('.input-color').forEach(input => {
    const val = input.value.trim();
    if (val && /^#[0-9A-Fa-f]{3,6}$/.test(val)) colores.push(val);
  });

  const nombreArchivo = nombreSeguro(nombre);
  const contenidoInicial = nota || `# ${nombre}\n\nEmpieza a escribir tus apuntes aquí…`;

  const nuevoLang = {
    id: generarId(),
    nombre,
    logo: logo || logoPorDefecto(nombre),
    colores,
    nota: contenidoInicial,
    nombreArchivo,
  };

  await escribirArchivo(nombreArchivo, contenidoInicial);

  estado.lenguajes.push(nuevoLang);
  guardarMetadatos();
  renderizarSidebar();

  document.getElementById('inputNombre').value = '';
  document.getElementById('inputLogo').value = '';
  document.getElementById('inputNota').value = '';
  resetearColores();

  notificar(`✓ ${nombre} creado → ${nombreArchivo}`);
  setTimeout(() => abrirLenguaje(nuevoLang.id), 250);
}

function logoPorDefecto(nombre) {
  const ini = nombre.charAt(0).toUpperCase();
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
    <rect width="32" height="32" rx="6" fill="#1e232b"/>
    <text x="16" y="21" text-anchor="middle" font-family="'Syne',sans-serif"
      font-weight="700" font-size="16" fill="#c9a86c">${ini}</text>
  </svg>`;
}

// ─── Colores ──────────────────────────────────────────────────────────────────
let contadorColores = 1;

function actualizarPreviewColor(input, index) {
  const val = input.value.trim();
  const prev = document.getElementById('preview' + index);
  if (prev && /^#[0-9A-Fa-f]{3,6}$/.test(val)) prev.style.background = val;
}

function agregarFilaColor() {
  const container = document.getElementById('coloresContainer');
  const idx = contadorColores++;
  const fila = document.createElement('div');
  fila.className = 'color-fila';
  fila.innerHTML = `
    <div class="color-preview" id="preview${idx}" style="background:#888"></div>
    <input type="text" class="input-campo input-color" placeholder="#888888" maxlength="7"
      oninput="actualizarPreviewColor(this, ${idx})">
    <button class="boton-quitar-color" onclick="quitarColor(this)" title="Quitar">✕</button>
  `;
  container.appendChild(fila);
}

function quitarColor(btn) {
  if (document.querySelectorAll('.color-fila').length <= 1) {
    notificar('Necesitas al menos un color'); return;
  }
  btn.closest('.color-fila').remove();
}

function resetearColores() {
  document.getElementById('coloresContainer').innerHTML = `
    <div class="color-fila">
      <div class="color-preview" id="preview0" style="background:#4A90D9"></div>
      <input type="text" class="input-campo input-color" placeholder="#4A90D9" maxlength="7"
        oninput="actualizarPreviewColor(this, 0)">
      <button class="boton-quitar-color" onclick="quitarColor(this)" title="Quitar">✕</button>
    </div>
  `;
  contadorColores = 1;
}

// ─── Eliminar lenguaje ────────────────────────────────────────────────────────
async function eliminarLenguajeActual() {
  if (!estado.activo) return;
  const lang = estado.lenguajes.find(l => l.id === estado.activo);
  if (!lang) return;

  if (!confirm(`¿Eliminar "${lang.nombre}"?\nTambién se borrará ${lang.nombreArchivo} de la carpeta.`)) return;

  if (estado.carpetaHandle) await eliminarArchivo(lang.nombreArchivo);

  estado.lenguajes = estado.lenguajes.filter(l => l.id !== estado.activo);
  estado.activo = null;
  guardarMetadatos();
  renderizarSidebar();
  mostrarInicio();
  notificar(`✓ ${lang.nombre} eliminado`);
}

// ─── Atajos de teclado ────────────────────────────────────────────────────────
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && estado.modoEditor) toggleEditor();
  if ((e.ctrlKey || e.metaKey) && e.key === 's' && estado.modoEditor) {
    e.preventDefault();
    guardarNota();
  }
});
