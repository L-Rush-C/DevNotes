# DevNotes

Sistema de gestión de notas técnicas en formato Markdown con interfaz personalizada.

## Descripción
DevNotes es una herramienta diseñada para estandarizar la toma de apuntes de programación. A diferencia de los editores de texto convencionales, este proyecto aplica una estructura de documentación técnica (Wiki/Docs) sobre archivos locales, permitiendo mantener un flujo de trabajo similar al de un entorno de desarrollo.

## Funcionalidad
El sistema automatiza la creación de archivos `.md` mediante los siguientes pasos:

1. **Entrada de datos:** Se capturan campos específicos (Título, URL de referencia y contenido).
2. **Generación de archivos:** El sistema crea un archivo `.md` en el directorio seleccionado por el usuario.
3. **Estructuración:** Las primeras líneas del archivo se reservan para metadatos (configuración y origen), mientras que el resto contiene el cuerpo del apunte en texto plano o código.
4. **Visualización:** La interfaz renderiza estos archivos aplicando un tema oscuro minimalista con identificadores visuales por lenguaje.

---

### Notas de desarrollo
Este proyecto surge de la necesidad de sustituir herramientas de ofimática genéricas por una solución integrada al flujo de trabajo de un desarrollador de software.