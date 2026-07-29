# VAMALA · Estudio creativo

Web estática basada en el dossier visual de VAMALA. La portada reproduce las tres primeras hojas del documento y el resto del contenido se distribuye en vistas internas accesibles desde el menú desplegable.

## Ver la web en local

Desde esta carpeta:

```bash
python3 -m http.server 8080
```

Después abre `http://localhost:8080`.

No requiere instalación ni dependencias de JavaScript.

> Ábrela siempre a través del servidor local, no con `file://`: el enrutado por hash y la carga de `assets/` esperan una URL `http://`.

## Estructura del proyecto

```
index.html          Todas las vistas del sitio, en un único documento
assets/styles.css   Estilos (paleta, tipografía, layout)
assets/site.js      Menú desplegable y enrutado por hash
assets/images/      Fotografías del estudio, talleres y retratos
```

## Cómo funciona la navegación

Es una single-page: todas las vistas viven dentro de `index.html`, cada una en un contenedor con su atributo `data-view`. `assets/site.js` lee el hash de la URL y muestra la vista correspondiente, ocultando el resto.

| Ruta | Vista |
| --- | --- |
| `#/` | `home` |
| `#/el-estudio` | `el-estudio` |
| `#/quien-hay-detras` | `quien-hay-detras` |
| `#/que-ofrecemos` | `que-ofrecemos` |
| `#/horarios-y-tarifas` | `horarios-y-tarifas` |
| `#/talleres-y-monograficos` | `talleres-y-monograficos` |
| `#/taller-halloween` | `taller-halloween` |
| `#/taller-navidad` | `taller-navidad` |
| `#/taller-tarjetas-navidenas` | `taller-tarjetas-navidenas` |

## Editar el contenido

- **Textos**: busca en `index.html` el bloque `data-view="..."` de la sección que quieras cambiar.
- **Añadir una vista nueva**: crea el contenedor con su `data-view`, y añade el enlace `href="#/tu-ruta"` en el menú. El nombre del `data-view` y el de la ruta deben coincidir.
- **Imágenes**: déjalas en `assets/images/` y referéncialas con una ruta relativa. Conviene comprimirlas antes de subirlas para que la web cargue rápido.
- **Colores y tipografía**: están centralizados al principio de `assets/styles.css`.

## Publicar los cambios

Al ser un sitio estático, basta con subir el contenido de la carpeta a cualquier hosting. Si se publica con GitHub Pages, cada push a `main` actualiza la web.
