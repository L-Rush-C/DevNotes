---
nombre: HTML
logo: https://cdn-icons-png.flaticon.com/512/174/174854.png
colores:
  - '#F2380F'
  - '#F2F2F2'
---

### Títulos y Párrafos
* [cite_start]**Títulos (`<h1>` a `<h6>`):** El `<h1>` es el más grande y el `<h6>` el más pequeño[cite: 328, 329].
* [cite_start]**Párrafos (`<p>`):** Se usan para bloques de texto sin límite[cite: 331].
* [cite_start]**Salto de línea (`<br>`):** Crea un espacio entre etiquetas sin necesidad de cierre[cite: 334].

---

## Formato de Texto
Puedes aplicar estilos visuales directamente con estas etiquetas:

- [cite_start]**Negrita:** `<strong>` frase `</strong>` [cite: 336, 337]
- [cite_start]*Cursiva:* `<em>` frase `</em>` [cite: 340, 341]
- [cite_start]<u>Subrayado:</u> `<u>` frase `</u>` [cite: 343, 344]
- [cite_start]Subíndice: `<sub>` [cite: 345, 346]
- [cite_start]Superíndice: `<sup>` [cite: 347, 348]

---

## Listas
[cite_start]Para cualquier lista, cada elemento debe ir dentro de una etiqueta `<li>`[cite: 350, 381].

### Ordenadas (`<ol>`)
[cite_start]Muestran elementos numerados[cite: 352]:
1. [cite_start]Elemento uno [cite: 357]
2. [cite_start]Elemento dos [cite: 359]

### No Ordenadas (`<ul>`)
Muestran viñetas. [cite_start]Se puede cambiar el estilo con el atributo `type` (circle, square, disc)[cite: 363, 364].

---

## Multimedia y Tablas
### Imágenes
[cite_start]` <img src="link" alt="descripción" width="150" height="150"> ` [cite: 382, 384]
> [cite_start]**Nota:** `src` es la ruta de la imagen y `alt` es el nombre alternativo[cite: 382, 387].

### Tablas (`<table>`)
[cite_start]Se componen de filas (`<tr>`), encabezados (`<th>`) y celdas de datos (`<td>`)[cite: 506, 510, 511].
- [cite_start]**colspan:** Une casillas horizontalmente[cite: 517].
- [cite_start]**rowspan:** Une casillas verticalmente[cite: 518].

---

## Formularios e Inputs (`<form>`)
[cite_start]Permiten capturar datos del usuario[cite: 576, 577].

| Tipo de Input | Función |
| :--- | :--- |
| `type="text"` | [cite_start]Casilla para texto normal[cite: 390]. |
| `type="password"` | [cite_start]Oculta caracteres por seguridad[cite: 411]. |
| `type="email"` | [cite_start]Valida que contenga un `@`[cite: 427]. |
| `type="radio"` | [cite_start]Selección única (círculo)[cite: 395]. |
| `type="checkbox"` | [cite_start]Casilla de verificación[cite: 403]. |
| `type="file"` | [cite_start]Para subir archivos[cite: 421]. |
| `type="color"` | [cite_start]Selector de colores[cite: 457]. |
| `type="date"` | [cite_start]Selector de fecha[cite: 464]. |

### Elementos Adicionales
- [cite_start]**`<label>`:** Texto descriptivo vinculado a un input[cite: 491].
- [cite_start]**`placeholder`:** Texto temporal dentro de la casilla[cite: 502].
- [cite_start]**`<select>`:** Lista de selección múltiple con opciones (`<option>`)[cite: 468, 469].
- [cite_start]**`<textarea>`:** Área de texto grande para párrafos largos[cite: 485].

---

## Estructura Semántica (HTML5)
[cite_start]Organiza el contenido de forma lógica para los navegadores[cite: 589]:

* [cite_start]**`<header>`:** Encabezado, logos o navegación[cite: 559].
* [cite_start]**`<nav>`:** Bloque de enlaces de navegación[cite: 614].
* [cite_start]**`<main>`:** Contenido principal del documento[cite: 617].
* [cite_start]**`<section>`:** Secciones independientes de contenido[cite: 589, 590].
* [cite_start]**`<article>`:** Contenido autocontenido (post, noticias)[cite: 598, 599].
* [cite_start]**`<aside>`:** Contenido lateral o tangencial[cite: 607, 608].
* [cite_start]**`<footer>`:** Pie de página con créditos o contacto[cite: 615].

---

### Interactividad
[cite_start]Para añadir lógica se usa la etiqueta `<script>`, que permite integrar **JavaScript** para responder a acciones del usuario[cite: 630, 631].