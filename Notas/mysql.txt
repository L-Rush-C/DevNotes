---
nombre: MySQL
logo: https://assets.pipedream.net/s.v0/app_1YMhwo/logo/orig
colores:
  - '#03658C'
  - '#F29F05'
---

# MySQL - Conceptos Básicos y Manipulación de Datos

MySQL es un sistema de gestión de bases de datos relacionales (RDBMS) de código abierto que utiliza SQL (Structured Query Language).

Permite almacenar, organizar y recuperar grandes cantidades de información de manera eficiente.

---

## DDL y DML

### DDL (Data Definition Language)
Conjunto de comandos SQL usados para definir y modificar la estructura de la base de datos, como crear, alterar o eliminar tablas.

**Ejemplos:** `CREATE`, `ALTER`, `DROP`.

### DML (Data Manipulation Language)
Conjunto de comandos SQL usados para manipular los datos dentro de las tablas, es decir, insertar, actualizar, eliminar o consultar datos.

**Ejemplos:** `INSERT`, `UPDATE`, `DELETE`, `SELECT`.

---

## Bases de Datos y Tablas

### Crear y Eliminar Bases de Datos

Las bases de datos son contenedores que agrupan tablas y otros objetos de la base de datos.

Para ver como esta estructura la base de datos debes hacer lo siguiente:

- Seleccionas la base de datos que quieras ver.
- das click en Next, Next y Finish y deberá aparecer algo parecido a esto:

#### Crear una base de datos
```sql
CREATE DATABASE nombre_de_la_base_de_datos;
```

#### Eliminar una base de datos
```sql
DROP DATABASE nombre_de_la_base_de_datos;
```

#### Seleccionar una base de datos para trabajar
```sql
USE nombre_de_la_base_de_datos;
```

---

### Crear y Eliminar Tablas

Las tablas son estructuras donde se almacena la información en filas y columnas.

#### Crear una tabla
Se definen las columnas y sus tipos de datos.

```sql
CREATE TABLE nombre_de_la_tabla (
columna1 TIPO_DE_DATO,
columna2 TIPO_DE_DATO,
PRIMARY KEY (columna_clave_primaria)
);
```

**Ejemplo:**
```sql
CREATE TABLE Usuarios (
id INT PRIMARY KEY AUTO_INCREMENT,
nombre VARCHAR(100),
email VARCHAR(255),
fecha_registro DATE
);
```

#### Eliminar una tabla
```sql
DROP TABLE nombre_de_la_tabla;
```

---

## Manipulación de Columnas y Datos

### Añadir una columna
```sql
ALTER TABLE nombre_de_la_tabla ADD COLUMN nueva_columna TIPO_DE_DATO;
```

### Eliminar una columna
```sql
ALTER TABLE nombre_de_la_tabla DROP COLUMN nombre_de_la_columna;
```

### Modificar una columna
*(Cambiar tipo de dato, tamaño, etc.)*
```sql
ALTER TABLE nombre_de_la_tabla MODIFY COLUMN nombre_de_la_columna NUEVO_TIPO_DE_DATO;
```

---

## Añadir Información (Registros)

Para insertar nuevas filas (registros) en una tabla.

### Insertar todos los valores
```sql
INSERT INTO nombre_de_la_tabla VALUES (valor1, valor2, ...);
```

### Insertar valores específicos en columnas
```sql
INSERT INTO nombre_de_la_tabla (columna1, columna2) VALUES (valor1, valor2);
```

---

## Editar Información (Registros)

Para actualizar datos existentes en una o más filas.

Utiliza la cláusula `WHERE` para especificar qué filas actualizar.

### Sintaxis
```sql
UPDATE nombre_de_la_tabla 
SET columna1 = nuevo_valor1, columna2 = nuevo_valor2 
WHERE condicion;
```

**Ejemplo:**
```sql
UPDATE Usuarios 
SET email = 'nuevo_correo@example.com' 
WHERE id = 1;
```

---

## Eliminar Información (Registros)

Para borrar filas de una tabla.

Utiliza la cláusula `WHERE` para especificar qué filas eliminar.

> ⚠️ Nota importante: Si no usas `WHERE`, se borrarán todas las filas.

### Sintaxis
```sql
DELETE FROM nombre_de_la_tabla WHERE condicion;
```

**Ejemplo:**
```sql
DELETE FROM Usuarios WHERE nombre = 'Juan';
```

---

## Seleccionar Información (Consultas SELECT)

La sentencia `SELECT` es una de las más usadas y potentes. Permite recuperar datos de una o varias tablas.

### Seleccionar todas las columnas
El asterisco `*` significa *todas las columnas*.

```sql
SELECT * FROM nombre_de_la_tabla;
```

### Seleccionar columnas específicas
```sql
SELECT columna1, columna2 FROM nombre_de_la_tabla;
```

---

## Filtrar resultados con WHERE

La cláusula `WHERE` se usa para especificar una condición de filtro.

### Operadores de comparación
- `<>` o `!=` → diferente de  
- `=` → igual a  
- `>` → mayor que  
- `<` → menor que  
- `>=` → mayor o igual que  
- `<=` → menor o igual que  

### Otros operadores
- `AVG` → promedio  
- `ASC` → orden ascendente  
- `DESC` → orden descendente  

### Uso de comodines
- `%` → cualquier cosa  

Ejemplos:
- que termine con p: `LIKE '%p'`  
- que empiece con p: `LIKE 'p%'`  
- que contenga p: `LIKE '%p%'`  

---

### Operadores lógicos
- `AND` → ambas condiciones deben ser verdaderas  
- `OR` → al menos una condición debe ser verdadera  
- `NOT` → invierte la condición  

**Ejemplo:**
```sql
SELECT * FROM Productos WHERE precio > 50 AND stock < 10;

SELECT * FROM Pedidos 
WHERE estado = 'pendiente' OR fecha_pedido < '2024-01-01';
```

---

## Combinar tablas con JOIN en SQL

Los `JOIN` se usan para combinar filas de dos o más tablas basándose en una columna en común.

`ON` se usa para indicar la condición de unión.

---

### Tipos de JOIN

#### INNER JOIN
Devuelve solo las filas que tienen coincidencias en ambas tablas.

```sql
SELECT * FROM TablaA 
INNER JOIN TablaB 
ON TablaA.columna_comun = TablaB.columna_comun;
```

---

#### LEFT JOIN
Devuelve todas las filas de la tabla izquierda y las coincidencias de la derecha.

Si no hay coincidencia, los valores serán `NULL`.

```sql
SELECT * FROM TablaA 
LEFT JOIN TablaB 
ON TablaA.columna_comun = TablaB.columna_comun;
```

---

#### RIGHT JOIN
Devuelve todas las filas de la tabla derecha y las coincidencias de la izquierda.

```sql
SELECT * FROM TablaA 
RIGHT JOIN TablaB 
ON TablaA.columna_comun = TablaB.columna_comun;
```

---

#### FULL JOIN
Devuelve todas las filas de ambas tablas.

Si no hay coincidencia, rellena con **NULL**.

```sql
SELECT * FROM TablaA 
FULL JOIN TablaB 
ON TablaA.columna_comun = TablaB.columna_comun;
```

> Nota: MySQL no soporta `FULL JOIN` directamente.

---

#### CROSS JOIN
Devuelve el producto cartesiano entre las tablas.

```sql
SELECT * FROM TablaA CROSS JOIN TablaB;
```

---

## Alias con AS

Se usa para dar un nombre corto o alias a tablas o columnas.

```sql
SELECT P.id_pedido, P.total, C.nombre_cliente, C.email
FROM Pedidos AS P
INNER JOIN Clientes AS C 
ON P.id_cliente = C.id_cliente;
```