// ─── Estado global ────────────────────────────────────────────────────────────
const estado = {
  lenguajes: [],    // [{id, nombre, logo, colores:[], nota:'', nombreArchivo:''}]
  activo: null,
  modoEditor: false,
  modoMetadatos: false,
  carpetaHandle: null,  // FileSystemDirectoryHandle
};

// ─── Inicialización ───────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  // Coloreado propio: strings=amarillo, símbolos=blanco, resto=verde
  function colorearCodigo(raw) {
    // Escapar HTML primero
    let s = raw
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // Tokenizar en orden: strings primero, luego símbolos, el resto queda verde
    const tokens = [];
    const regex = /("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`)|(=|&gt;|&lt;|\/|\(|\)|\{|\}|\[|\]|;|:|,|\.)/g;
    let last = 0;
    let m;
    while ((m = regex.exec(s)) !== null) {
      if (m.index > last) {
        tokens.push('<span class="dn-verde">' + s.slice(last, m.index) + '</span>');
      }
      if (m[1]) {
        // string entre comillas → amarillo
        tokens.push('<span class="dn-amarillo">' + m[1] + '</span>');
      } else {
        // símbolo → blanco
        tokens.push('<span class="dn-blanco">' + m[2] + '</span>');
      }
      last = m.index + m[0].length;
    }
    if (last < s.length) {
      tokens.push('<span class="dn-verde">' + s.slice(last) + '</span>');
    }
    return tokens.join('');
  }

  const renderer = new marked.Renderer();
  renderer.code = function(code, lang) {
    const rawCode = typeof code === 'object' ? code.text : code;
    const colored = colorearCodigo(rawCode);
    return '<pre><code class="dn-code">' + colored + '</code></pre>';
  };
  marked.use({ renderer });

  cargarMetadatos();
  
  // Cargar automáticamente las notas desde Notas/
  await cargarNotasAutomaticamente();
  
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
  // No guardar lenguajes en localStorage, solo otros datos si es necesario
  // Para portabilidad, todo viene de los archivos
}

function cargarMetadatos() {
  // No cargar lenguajes desde localStorage
  estado.lenguajes = [];
}

// ─── Cargar notas automáticamente desde Notas/index.json ─────────────────────

async function cargarNotasAutomaticamente() {
  try {
    console.log('📂 Cargando lista de notas desde Notas/index.json...');
    
    // Cargar el index.json
    const respuesta = await fetch('/DevNotes/Notas/index.json');
    if (!respuesta.ok) {
      console.error('❌ No se pudo cargar el index.json');
      notificar('⚠ No se encontró la carpeta de notas');
      return;
    }

    const archivos = await respuesta.json();
    console.log(`✓ Se encontraron ${archivos.length} archivo(s)`);

    // Cargar cada archivo .md
    for (const item of archivos) {
      await cargarNotaDesdeURL(item.nombreArchivo, item.nombre);
    }

    if (estado.lenguajes.length > 0) {
      renderizarSidebar();
      console.log(`✓ ${estado.lenguajes.length} nota(s) cargada(s)`);
      notificar(`✓ ${estado.lenguajes.length} nota(s) cargada(s) automáticamente`);
    }
  } catch (e) {
    console.error('❌ Error cargando notas:', e);
    notificar('⚠ Error al cargar las notas: ' + e.message);
  }
}

async function cargarNotaDesdeURL(nombreArchivo, nombrePredeterminado) {
  try {
    const url = `/DevNotes/Notas/${nombreArchivo}`;
    const respuesta = await fetch(url);
    
    if (!respuesta.ok) {
      console.warn(`⚠ No se pudo cargar ${nombreArchivo}`);
      return;
    }

    const contenido = await respuesta.text();
    console.log(`✓ Cargado: ${nombreArchivo}`);

    // Parsear frontmatter
    let nombre = nombrePredeterminado;
    let logo = null;
    let colores = ['#4A90D9'];
    let nota = contenido;

    const lines = contenido.split('\n');
    console.log(`📋 Primera línea de ${nombreArchivo}:`, JSON.stringify(lines[0]));
    
    if (lines[0].trim() === '---') {
      const endIndex = lines.indexOf('---', 1);
      if (endIndex > 0) {
        const frontmatterStr = lines.slice(1, endIndex).join('\n');
        try {
          const meta = jsyaml.load(frontmatterStr);
          console.log(`🔍 Frontmatter parseado de ${nombreArchivo}:`, meta);
          if (meta.nombre) nombre = meta.nombre;
          if (meta.logo) logo = meta.logo;
          if (meta.colores) {
            colores = meta.colores;
            console.log(`🎨 Colores encontrados:`, colores);
          }
          nota = lines.slice(endIndex + 1).join('\n').trim();
        } catch (e) {
          console.warn(`⚠ Error parseando frontmatter de ${nombreArchivo}:`, e);
        }
      }
    }

    // Crear objeto de lenguaje
    const lang = {
      id: generarId(),
      nombre,
      logo: logo || logoPorDefecto(nombre),
      colores,
      nombreArchivo,
      nota,
    };

    estado.lenguajes.push(lang);
  } catch (e) {
    console.error(`❌ Error cargando ${nombreArchivo}:`, e);
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

function cerrarModal() {
  ocultar(document.getElementById('overlay'));
  ocultar(document.getElementById('modal'));
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
  estado.modoMetadatos = false;
  mostrar(document.getElementById('pantallaInicio'));
  ocultar(document.getElementById('pantallaNota'));
  ocultar(document.getElementById('editorPanel'));
  ocultar(document.getElementById('metadatosPanel'));
  document.querySelectorAll('.enlace-nav').forEach(b => b.classList.remove('activo'));
}

async function abrirLenguaje(id) {
  const lang = estado.lenguajes.find(l => l.id === id);
  if (!lang) return;

  estado.activo = id;
  estado.modoEditor = false;
  estado.modoMetadatos = false;

  ocultar(document.getElementById('pantallaInicio'));
  mostrar(document.getElementById('pantallaNota'));
  ocultar(document.getElementById('editorPanel'));
  ocultar(document.getElementById('metadatosPanel'));

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
    // Cerrar metadatos si está abierto
    if (estado.modoMetadatos) toggleEditarMetadatos();
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

  const texto = document.getElementById('editorTexto').value;
  lang.nota = texto;

  // Guardar en localStorage como borrador
  localStorage.setItem(`nota_${lang.id}`, JSON.stringify({
    contenido: texto,
    fecha: new Date().toISOString()
  }));

  renderizarNota(texto);
  notificar(`✓ Borrador guardado`);
}

// ─── Editar metadatos ─────────────────────────────────────────────────────────
function toggleEditarMetadatos() {
  const panel = document.getElementById('metadatosPanel');
  const btn = document.getElementById('btnEditarMetadatos');
  estado.modoMetadatos = !estado.modoMetadatos;

  if (estado.modoMetadatos) {
    // Cerrar editor si está abierto
    if (estado.modoEditor) toggleEditor();
    const lang = estado.lenguajes.find(l => l.id === estado.activo);
    if (!lang) return;
    document.getElementById('inputEditarNombre').value = lang.nombre;
    document.getElementById('inputEditarLogo').value = lang.logo;
    renderizarColoresEditar(lang.colores);
    mostrar(panel);
    btn.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="14" height="14">
        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
      </svg> Cerrar`;
  } else {
    ocultar(panel);
    btn.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="14" height="14">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
      </svg> Editar info`;
  }
}

function renderizarColoresEditar(colores) {
  const container = document.getElementById('coloresEditarContainer');
  container.innerHTML = '';
  colores.forEach((color, index) => {
    const fila = document.createElement('div');
    fila.className = 'color-fila';
    fila.innerHTML = `
      <div class="color-preview" id="previewEditar${index}" style="background:${color}"></div>
      <input type="text" class="input-campo input-color" value="${color}" maxlength="7"
        oninput="actualizarPreviewColorEditar(this, ${index})">
      <button class="boton-quitar-color" onclick="quitarColorEditar(this)" title="Quitar">✕</button>
    `;
    container.appendChild(fila);
  });
  if (colores.length === 0) {
    agregarFilaColorEditar();
  }
}

function actualizarPreviewColorEditar(input, index) {
  const val = input.value.trim();
  const prev = document.getElementById('previewEditar' + index);
  if (prev && /^#[0-9A-Fa-f]{3,6}$/.test(val)) prev.style.background = val;
}

function agregarFilaColorEditar() {
  const container = document.getElementById('coloresEditarContainer');
  const index = container.children.length;
  const fila = document.createElement('div');
  fila.className = 'color-fila';
  fila.innerHTML = `
    <div class="color-preview" id="previewEditar${index}" style="background:#888"></div>
    <input type="text" class="input-campo input-color" placeholder="#888888" maxlength="7"
      oninput="actualizarPreviewColorEditar(this, ${index})">
    <button class="boton-quitar-color" onclick="quitarColorEditar(this)" title="Quitar">✕</button>
  `;
  container.appendChild(fila);
}

function quitarColorEditar(btn) {
  const container = document.getElementById('coloresEditarContainer');
  if (container.children.length <= 1) {
    notificar('Necesitas al menos un color'); return;
  }
  btn.closest('.color-fila').remove();
}

async function guardarMetadatosNota() {
  const lang = estado.lenguajes.find(l => l.id === estado.activo);
  if (!lang) return;

  const nuevoNombre = document.getElementById('inputEditarNombre').value.trim();
  const nuevoLogo = document.getElementById('inputEditarLogo').value.trim();

  if (!nuevoNombre) {
    notificar('⚠ Escribe el nombre del lenguaje');
    document.getElementById('inputEditarNombre').focus();
    return;
  }

  const nuevosColores = [];
  document.querySelectorAll('#coloresEditarContainer .input-color').forEach(input => {
    const val = input.value.trim();
    if (val && /^#[0-9A-Fa-f]{3,6}$/.test(val)) nuevosColores.push(val);
  });

  // Actualizar lang (solo en memoria, no se puede guardar en GitHub Pages)
  lang.nombre = nuevoNombre;
  lang.logo = nuevoLogo;
  lang.colores = nuevosColores;

  // Guardar en localStorage
  localStorage.setItem(`metadata_${lang.id}`, JSON.stringify({
    nombre: lang.nombre,
    logo: lang.logo,
    colores: lang.colores
  }));

  renderizarSidebar();
  abrirLenguaje(lang.id); // re-renderizar la nota
  notificar('✓ Información actualizada (borrador local)');
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

  const colores = [];
  document.querySelectorAll('.input-color').forEach(input => {
    const val = input.value.trim();
    if (val && /^#[0-9A-Fa-f]{3,6}$/.test(val)) colores.push(val);
  });

  const contenidoInicial = nota || `# ${nombre}\n\nEmpieza a escribir tus apuntes aquí…`;

  const nuevoLang = {
    id: generarId(),
    nombre,
    logo: logo || logoPorDefecto(nombre),
    colores,
    nota: contenidoInicial,
    nombreArchivo: nombreSeguro(nombre),
  };

  // Guardar en localStorage como borrador
  localStorage.setItem(`metadata_${nuevoLang.id}`, JSON.stringify({
    nombre: nuevoLang.nombre,
    logo: nuevoLang.logo,
    colores: nuevoLang.colores
  }));

  localStorage.setItem(`nota_${nuevoLang.id}`, JSON.stringify({
    contenido: contenidoInicial,
    fecha: new Date().toISOString()
  }));

  estado.lenguajes.push(nuevoLang);
  renderizarSidebar();

  document.getElementById('inputNombre').value = '';
  document.getElementById('inputLogo').value = '';
  document.getElementById('inputNota').value = '';
  resetearColores();

  notificar(`✓ "${nombre}" agregado como borrador local (para publicar, agregarlo a Notas/index.json)`);
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

  if (!confirm(`¿Eliminar "${lang.nombre}"?`)) return;

  // Limpiar localStorage
  localStorage.removeItem(`metadata_${lang.id}`);
  localStorage.removeItem(`nota_${lang.id}`);

  estado.lenguajes = estado.lenguajes.filter(l => l.id !== estado.activo);
  estado.activo = null;
  renderizarSidebar();
  mostrarInicio();
  
  const msg = lang.nombreArchivo 
    ? `✓ "${lang.nombre}" eliminado (para publicar cambios, actualiza Notas/index.json en GitHub)`
    : `✓ "${lang.nombre}" eliminado`;
  notificar(msg);
}

// ─── Atajos de teclado ────────────────────────────────────────────────────────
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && estado.modoEditor) toggleEditor();
  if ((e.ctrlKey || e.metaKey) && e.key === 's' && estado.modoEditor) {
    e.preventDefault();
    guardarNota();
  }
});
