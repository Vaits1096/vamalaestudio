/* El buzón de las inscripciones.
 *
 * Cuando alguien rellena la ficha en vamalaestudio.es/inscripcion, esto la
 * guarda. La app del estudio la recoge sola cada pocos minutos y, en cuanto la
 * tiene, la borra de aquí. El buzón es de paso, no un archivo.
 *
 * Tres cosas que sostienen esto:
 *
 * 1. Escribir es público, leer no. El formulario es una página abierta, así que
 *    cualquiera puede mandar algo. Pero para LEER hace falta la llave, que solo
 *    tiene la app de Valeria. Sin ella no se puede sacar ni un dato.
 *
 * 2. Nada se queda para siempre. Lo que la app recoge se borra al momento, y lo
 *    que nadie recoja se borra solo a los 30 días. Son datos de menores: cuanto
 *    menos tiempo estén aquí, mejor.
 *
 * 3. Solo entran fichas. Un texto que no lleve la cabecera de VAMALA se
 *    rechaza, y hay un tope de tamaño, para que el buzón no sirva de vertedero.
 */

const CABECERA = "### FICHA VAMALA";
const TOPE_BYTES = 24 * 1024;
const DIAS_QUE_AGUANTA = 30;

const json = (datos, codigo = 200) =>
  new Response(JSON.stringify(datos), {
    status: codigo,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" },
  });

async function prepararTabla(bd) {
  await bd.exec(
    "CREATE TABLE IF NOT EXISTS fichas (" +
    "id TEXT PRIMARY KEY, recibida TEXT NOT NULL, sede TEXT, nombre TEXT, ficha TEXT NOT NULL)");
}

async function limpiarViejas(bd) {
  const limite = new Date(Date.now() - DIAS_QUE_AGUANTA * 86400000).toISOString();
  await bd.prepare("DELETE FROM fichas WHERE recibida < ?").bind(limite).run();
}

function campo(texto, nombre) {
  const m = texto.match(new RegExp("^" + nombre + ":\\s*(.*)$", "m"));
  return m ? m[1].trim() : null;
}

/* La llave se compara entera y siempre, sin cortar en cuanto falla una letra:
 * comparar deprisa deja saber por dónde va bien, y así no. */
function llaveCorrecta(dada, buena) {
  if (!buena || !dada || dada.length !== buena.length) return false;
  let diferencia = 0;
  for (let i = 0; i < buena.length; i++) diferencia |= dada.charCodeAt(i) ^ buena.charCodeAt(i);
  return diferencia === 0;
}

const autorizada = (peticion, entorno) =>
  llaveCorrecta(peticion.headers.get("X-Vamala-Llave") || "", entorno.LLAVE || "");

export default {
  async fetch(peticion, entorno) {
    const url = new URL(peticion.url);
    const ruta = url.pathname.replace(/\/+$/, "");

    if (!ruta.startsWith("/api/")) return entorno.ASSETS.fetch(peticion);
    if (!entorno.BUZON) return json({ error: "El buzón todavía no está conectado." }, 503);

    // -------------------------------------------------- deja una ficha (público)
    if (ruta === "/api/inscripcion" && peticion.method === "POST") {
      const texto = await peticion.text();
      if (texto.length > TOPE_BYTES) return json({ error: "Demasiado larga." }, 413);
      if (!texto.includes(CABECERA)) return json({ error: "Eso no es una ficha." }, 400);

      await prepararTabla(entorno.BUZON);
      await limpiarViejas(entorno.BUZON);
      await entorno.BUZON.prepare(
        "INSERT INTO fichas (id, recibida, sede, nombre, ficha) VALUES (?,?,?,?,?)")
        .bind(crypto.randomUUID(), new Date().toISOString(),
              campo(texto, "SEDE"),
              [campo(texto, "NOMBRE"), campo(texto, "APELLIDOS")].filter(Boolean).join(" "),
              texto)
        .run();
      return json({ recibida: true });
    }

    // ------------------------------------------- recoge las fichas (solo la app)
    if (ruta === "/api/inscripciones" && peticion.method === "GET") {
      if (!autorizada(peticion, entorno)) return json({ error: "Sin llave." }, 401);
      await prepararTabla(entorno.BUZON);
      await limpiarViejas(entorno.BUZON);
      const { results } = await entorno.BUZON.prepare(
        "SELECT id, recibida, sede, nombre, ficha FROM fichas ORDER BY recibida").all();
      return json({ fichas: results || [] });
    }

    // --------------------------------- borra una ya recogida (solo la app)
    const m = ruta.match(/^\/api\/inscripciones\/([0-9a-f-]{36})$/);
    if (m && peticion.method === "DELETE") {
      if (!autorizada(peticion, entorno)) return json({ error: "Sin llave." }, 401);
      await entorno.BUZON.prepare("DELETE FROM fichas WHERE id = ?").bind(m[1]).run();
      return json({ borrada: true });
    }

    return json({ error: "No existe esa dirección." }, 404);
  },
};
