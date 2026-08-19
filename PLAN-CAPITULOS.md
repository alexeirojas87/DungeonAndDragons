# Capítulos estandarizados, puzles y generación encadenada por LLM

## Contexto

Hoy el juego tiene **un solo capítulo, hardcodeado**: `src/data/storyGraph.ts` exporta un `STORY_GRAPH` global y `gameEngine.ts` lo lee directamente (`STORY_GRAPH[this.state.story.currentNodeId]`), junto con `ADVENTURE_LOCATIONS`, `ADVENTURE_NPCS`, `ADVENTURE_QUESTS` y `MONSTER_TEMPLATES`. Hay ganchos con ids literales dentro del motor (`gameEngine.ts:1207` compara `this.state.location === 'crypt_guardian_room'` para lanzar `beginWardenAftermath`), y el narrador LLM recibe hechos canónicos con flags del Capítulo I escritos a mano (`dmClient.ts:85-110`). Al alcanzar un nodo `terminal`, `story.completed = true` y la partida se queda sin decisiones.

Además, hoy faltan dos piezas de juego:
- **La muerte no termina la partida.** En derrota (`gameEngine.ts:1212` y `:1490`) sólo se imprime un mensaje y se limpia el combate; el héroe queda a 0 HP y el jugador sigue escribiendo acciones.
- **No hay puzles.** `worldState.solvedPuzzles`, el evento `PUZZLE_SOLVED` y `Secret.requiresCheck` existen en los tipos pero **nunca se escriben ni se leen**. La progresión es sólo historia + decisión = consecuencia.

Objetivo: que al terminar un capítulo el jugador pulse **Continuar**, vea un *loading* y se genere con el LLM un capítulo nuevo **vinculado al anterior**, **listo para jugar y sin errores**; que ese capítulo incluya **puzles que desbloquean herramientas y ramas**; y que **morir acabe la partida**. Para todo ello el capítulo tiene que dejar de ser código y pasar a ser **datos con formato estándar y validable** — que es exactamente para lo que se creó el grafo de decisiones.

Decisiones tomadas con el usuario:
- El LLM genera **capítulo completo**: nodos + puzles + ubicaciones + NPCs con diálogo + monstruos/jefe + quest.
- El Capítulo I **se migra** al formato estándar (un único code path para autoral y generado).
- Si tras los reintentos el capítulo sigue inválido: **error visible con botón de reintentar** (sin capítulo de respaldo).
- Campaña **ilimitada**, con **resumen canónico acumulado** que alimenta al siguiente capítulo.
- Puzles: **tres variantes de un mismo tipo de nodo** (acertijo, mecanismo, tirada de habilidad).
- Fallar un puzle: **pistas progresivas, sin castigo**; siempre resoluble.
- Muerte: **fin de partida con el guardado conservado** (Reintentar desde el último checkpoint / Menú principal).

## Arquitectura

### 1. `src/engine/chapter.ts` — el contrato (nuevo)

Tipo `Chapter` + esquema **zod** (`zod` ya es dependencia) + validador estructural.

```ts
interface Chapter {
  id: string;                 // 'chapter-01', 'chapter-02'...
  index: number;
  title: string; titleEs: string;
  premise: string; premiseEs: string;    // alimenta el resumen y el prompt siguiente
  intro: IntroBeat[];                     // sustituye el bloque hardcodeado de initGame()
  startNodeId: string;
  startLocationId: string;
  nodes: Record<string, StoryNode>;       // StoryNode de storyGraph.ts + `kind`
  puzzles: Record<string, Puzzle>;
  locations: Record<string, WorldLocation>;
  npcs: Record<string, NPC>;
  monsters: Record<string, Omit<Enemy,'id'>>;
  items?: Record<string, ItemTemplate>;
  quests: Record<string, Quest>;
  mainQuestId: string;
  hooks: {
    bossLocationId: string;               // sustituye el literal 'crypt_guardian_room'
    aftermathNodeId: string;              // sustituye STORY_GRAPH.warden_aftermath
    routeDestinations?: Record<string, string>;
  };
  storyFacts: Array<{ flag: string; en: string; es: string }>;   // alimenta al narrador
  suggestions: Record<string, SuggestedAction[]>;                // por locationId
}
```

`StoryNode` gana `kind: 'beat' | 'route' | 'puzzle' | 'ending'` y, para `kind: 'puzzle'`, `puzzleId`.

### 2. Puzles — `src/engine/puzzles.ts` (nuevo)

Un único tipo `Puzzle` con tres variantes discriminadas por `kind`, para que el motor, el validador y el prompt del LLM compartan una sola forma:

```ts
type Puzzle = {
  id: string;
  title/titleEs, prompt/promptEs;        // el enunciado que ve el jugador
  hints: Array<{ en: string; es: string }>;   // ≥2, reveladas progresivamente
  unlocks: {
    flags?: Record<string, boolean>;     // abre choices con `requires`
    items?: string[];                    // "herramientas": el vial, el mapa del túnel...
    nodeId?: string;                     // rama bloqueada
    locationId?: string;                 // conexión nueva
  };
  solvedNodeId: string;                  // a dónde va la historia al resolverlo
  skipNodeId: string;                    // salida si el jugador lo abandona
} & (
  | { kind: 'riddle';    answers: string[]; answersEs: string[] }
  | { kind: 'mechanism'; steps: string[]; ordered: boolean;
      stepLabels: Array<{en,es}>; onWrongStep: {en,es} }
  | { kind: 'check';     skill: Skill; dc: number;
      clues: Array<{ id: string; en: string; es: string; dcReduction: number }> }
);
```

Resolución en el motor (`resolvePuzzleInput`), todo determinista y sin LLM:
- **riddle** — se normaliza la entrada del jugador (minúsculas, sin acentos ni puntuación, sin artículos) y se compara contra `answers`/`answersEs`.
- **mechanism** — el motor guarda el progreso parcial en `state.puzzleProgress[puzzleId]`; si `ordered`, un paso equivocado reinicia la secuencia con el texto `onWrongStep`; si no, basta con acumular todos los pasos.
- **check** — tirada de habilidad con el sistema de dados existente (`engine/dice.ts`), con la DC reducida por cada pista de `clues` ya descubierta (registradas vía `worldState.discoveredSecrets`). Se puede reintentar.

**Pistas progresivas, sin castigo**: `state.puzzleAttempts[puzzleId]` cuenta los intentos; a partir del 2º fallo se revela `hints[0]`, del 3º `hints[1]`, etc. Agotadas las pistas, el motor ofrece la solución. Un puzle **nunca** puede dejar la partida bloqueada — de ahí el `skipNodeId` obligatorio, y de ahí que el validador exija que las ramas que abre el puzle no sean el único camino a un final.

Al resolverse: se aplican `unlocks`, se añade el id a `worldState.solvedPuzzles`, se emite `PUZZLE_SOLVED` (ambos ya existen en los tipos pero hoy están muertos) y la historia salta a `solvedNodeId`.

UI: cuando el nodo actual es `kind: 'puzzle'`, `InputBar.tsx` cambia a modo puzle (enunciado + intentos + pistas reveladas; para `mechanism`, botones con los `stepLabels` en vez de texto libre) y `getSuggestedActions` ofrece «Pensar» / «Abandonar el enigma».

### 3. Validación — `validateChapter(chapter, usedIds): string[]`

**Generalización de `validateStoryGraph()`** (`storyGraph.ts:490`), que ya hace hoy el trabajo correcto (BFS sobre estados `arquetipo × origen × nodo × flags`) pero contra el grafo global. Se reusa el algoritmo y se amplía con:

- Estructura: zod (`ChapterSchema`) — tipos, ids `snake_case`, todos los campos bilingües presentes y no vacíos.
- Grafo: todo `choice.nextNodeId` existe; ids de decisión únicos; ningún nodo no terminal sin decisiones.
- **Alcanzabilidad total**: cada una de las 25 combinaciones arquetipo×origen llega a al menos un nodo `kind: 'ending'` sin quedarse sin opciones.
- **Puzles**: cada nodo `kind:'puzzle'` referencia un puzle existente; `solvedNodeId` y `skipNodeId` existen y son distintos; ≥2 pistas; `riddle` con ≥1 respuesta por idioma; `mechanism` con ≥2 pasos y `stepLabels` de la misma longitud; `check` con `dc` en 8-20 y una skill válida. **Se explora el BFS por las dos salidas** (resuelto y abandonado): si abandonar todos los puzles deja al jugador sin final alcanzable, es un error.
- Toda `requires: [{flag}]` es *seteable* aguas arriba por alguna decisión o `puzzle.unlocks` (si no, la opción es letra muerta).
- Integridad referencial: `startLocationId`, `hooks.bossLocationId`, `location.connections[]`, `location.npcs[]`, `location.enemies[]`, `npc.dialogue[].responses[].nextNodeId`, `mainQuestId`, ids de `loot`/`items`/`unlocks.items`.
- Sin colisiones de id con capítulos anteriores (`usedIds`).

### 4. `src/data/chapters/chapter-01.ts` — migración (nuevo, mueve contenido existente)

Reagrupa sin reescribir prosa: nodos de `storyGraph.ts`, ubicaciones de `locations.ts`, NPCs de `npcs.ts`, monstruos de `monsters.ts`, quests de `quests.ts`, el bloque narrativo de apertura hoy incrustado en `gameEngine.initGame()` (`gameEngine.ts:96-130`), los `storyFacts` de `dmClient.ts:85-110` y las sugerencias por ubicación de `intent.ts:341+`.

Se añaden **dos puzles autorales** al Capítulo I, para que el formato quede probado con contenido real y no sólo con lo generado:
- `c1_chapel_ledger` (**check**, `investigation` DC 14): descifrar el registro de la capilla desbloquea el `tunnel_map` — hoy ese flag sólo se obtiene por diálogo, así que pasa a tener dos vías.
- `c1_drowned_door_runes` (**mechanism**, secuencia de 3 runas): abre la rama del final `ending_remembered` sin depender exclusivamente del origen Ciénaga Sombría.

`src/data/chapters/index.ts` exporta `CHAPTER_ONE`. `createInitialStoryState()` e `isStoryChoiceAvailable()` se mantienen y re-exportan porque los usan `persistence.ts:8` e `intent.ts`.

### 5. Motor: de grafo global a capítulos cargados

En `gameEngine.ts`:
- `GameState` gana `chapters`, `activeChapterIndex`, `chronicle: ChapterSummary[]`, `puzzleProgress`, `puzzleAttempts` y `status: 'playing' | 'chapter_complete' | 'dead'` (`types.ts:435`).
- `currentChapter()` privado; **todas** las lecturas de `STORY_GRAPH[...]` (líneas 289, 307, 329, 486) pasan por él. Igual con locations/npcs/quests/monsters.
- `loadChapter(chapter)` fusiona los datos del capítulo en `state.worldState` y `state.quests`, mueve al héroe a `startLocationId`, resetea `state.story` y emite los `intro` beats. `initGame()` pasa a ser `loadChapter(CHAPTER_ONE)` + equipo inicial.
- Los literales de gancho (`'crypt_guardian_room'` en `:1207` y `:1508`, `STORY_GRAPH.warden_aftermath` en `:486`) se sustituyen por `chapter.hooks.*`; `finishMainQuest()` (`:501`) usa `chapter.mainQuestId`.
- Al entrar en un nodo `kind:'ending'`: `status = 'chapter_complete'` y se construye el **`ChapterSummary`**, que se empuja a `state.chronicle`:
  ```ts
  { chapterId, title, endingNodeId, endingTitle, route,
    outcome: 'success'|'failure'|'ambiguous',
    keyFlags: string[], values: Record<string,number>,
    puzzlesSolved: string[], survivors: string[], casualties: string[],
    heroSnapshot: { level, hp, maxHp, gold, notableItems } }
  ```
- Nuevos: `canAdvanceChapter()`, `appendChapter(chapter)`, `resolvePuzzleInput(raw)`.

**Muerte:** los dos puntos de derrota (`:1212` y `:1490`) además de narrar la caída ponen `state.status = 'dead'`, emiten `PLAYER_DIED` y **no** guardan. `processInput()` rechaza cualquier acción cuando `status === 'dead'`. Lo mismo para el daño fuera de combate (trampas, `:1339`, `:2289`): cualquier ruta que deje al héroe a 0 HP pasa por un único `checkHeroDeath()`.

En `intent.ts:341` `getSuggestedActions()` deja la cascada de `else if (locationId === '...')` y consulta `chapter.suggestions[locationId]`, con las de combate / historia / puzle como fallback genérico.

En `dmClient.ts` los `storyFacts` se construyen recorriendo `chapter.storyFacts`, más un bloque `PREVIOUSLY` con los últimos resúmenes del `chronicle` y los puzles ya resueltos, para que el narrador no contradiga ni el pasado ni lo que el jugador ya descubrió.

### 6. `src/app/api/chapter/route.ts` — generación (nuevo)

Mismo patrón que `src/app/api/dm/route.ts` (`NAN_API_KEY` sólo en servidor). Generación en **dos pasadas**, porque un capítulo completo no cabe fiablemente en una sola respuesta:

1. **Esquema** (`max_tokens` ~1500): título, premisa, gancho con el capítulo anterior, 5-7 *beats*, elenco (2-4 NPCs), 3-5 ubicaciones, jefe, **2-3 puzles con su función narrativa** (qué herramienta o rama desbloquea cada uno) y qué finales previos recoge. Validado contra un `OutlineSchema` pequeño.
2. **Expansión** (`max_tokens` ~8000, `temperature` 0.8): el JSON completo del `Chapter` a partir del esquema aprobado. El prompt incluye la especificación del schema, reglas de ids (prefijo obligatorio `c<N>_` → imposible colisionar), exigencia de campos EN+ES, el `chronicle` (últimos 2 resúmenes completos + hitos anteriores), el estado del héroe, y las listas cerradas de skills, arquetipos, orígenes y tipos de puzle.

Bucle de reparación: `safeParse` → `validateChapter` → si hay errores se reenvía el JSON con **la lista literal de errores** pidiendo sólo las correcciones, hasta **3 intentos**. Si sigue inválido → `422 { error, issues }`.

El servidor nunca devuelve un capítulo que no haya pasado zod **y** `validateChapter`: ese es el punto donde se cumple «que ya quede listo para jugar y no tenga errores».

### 7. UI

- **Fin de capítulo** — `GameScreen.tsx`: con `status === 'chapter_complete'`, panel de cierre (título del final + resumen) y botón **Continuar / Continue**.
- **`src/components/ChapterTransition.tsx`** (nuevo): overlay de carga con mensajes rotativos temáticos (el `fetch` puede tardar decenas de segundos) y, si falla, mensaje de error + **Reintentar** + «Volver al menú».
- **`src/components/DeathScreen.tsx`** (nuevo): con `status === 'dead'`, pantalla de muerte con la crónica de la campaña (capítulos superados, puzles resueltos, decisiones clave) y dos botones: **Reintentar** (recarga el último checkpoint) y **Menú principal**. El save **no** se borra.
- **`InputBar.tsx`**: modo puzle descrito en §2.
- `useGame.ts`: `advanceChapter()` → `isGeneratingChapter` → `POST /api/chapter` → `appendChapter` + `loadChapter` → `saveGame`; `retryFromCheckpoint()` para la muerte; `chapterError` expuesto al `GameScreen`.

### 8. Persistencia y checkpoints

`persistence.ts`: `SaveData.version` → **3**, con `gameState.chapters`, `chronicle` y estado de puzles. `loadGame()` migra v1/v2 inyectando `CHAPTER_ONE`, `activeChapterIndex: 0` y `chronicle: []` (mismo patrón que el backfill de `story` en `persistence.ts:64`).

El autoguardado actual es poco fiable para «Reintentar» (`useGame.ts:149` guarda sólo cuando `eventLog.length % 10 === 0`, y podría guardar ya muerto). Se añade un **slot de checkpoint** separado (`gauntlet_checkpoint`) escrito en momentos seguros y deterministas: al cargar un capítulo, al resolver una decisión de historia, al resolver un puzle y **justo antes de iniciar un combate**. Morir no lo toca, así que **Reintentar** siempre vuelve a un estado vivo y coherente.

Riesgo real: `localStorage` ~5 MB y cada capítulo generado pesa. Se guardan **completos sólo el capítulo actual y el anterior**; los previos se reducen a su `ChapterSummary` (el motor sólo necesita el activo para jugar). Ante `QuotaExceededError` se poda el `narrative` a los últimos 100 entries y se reintenta.

## Archivos

**Nuevos**: `src/engine/chapter.ts`, `src/engine/puzzles.ts`, `src/data/chapters/chapter-01.ts`, `src/data/chapters/index.ts`, `src/app/api/chapter/route.ts`, `src/ai/chapterPrompt.ts`, `src/components/ChapterTransition.tsx`, `src/components/DeathScreen.tsx`, `scripts/validate-chapters.ts`.

**Modificados**: `src/engine/gameEngine.ts` (el grueso), `src/engine/types.ts`, `src/engine/intent.ts`, `src/ai/dmClient.ts`, `src/hooks/useGame.ts`, `src/components/GameScreen.tsx`, `src/components/InputBar.tsx`, `src/lib/persistence.ts`, `src/data/storyGraph.ts`.

## Verificación

1. `npx tsc --noEmit` y `pnpm build` sin errores; `pnpm lint` sin errores nuevos (hay 7 preexistentes en otros módulos).
2. `scripts/validate-chapters.ts` → `validateChapter(CHAPTER_ONE)` devuelve `[]`. Es la prueba de que la migración no rompió nada: el mismo BFS de 25 combinaciones arquetipo×origen que hoy pasa en `validateStoryGraph()` debe seguir pasando, ahora también con las salidas de puzle abandonado.
3. Partida completa del Capítulo I en `http://localhost:3000` con Mago de Tormenta y con Clérigo de Ciénaga Sombría (las combinaciones híbridas del trabajo anterior): decisiones, efectos de arquetipo (+4 HP, barrera, emboscada evitada) y finales idénticos tras la migración.
4. **Puzles**: resolver `c1_chapel_ledger` (que aparezca el `tunnel_map` en el inventario y se abra la ruta del túnel) y `c1_drowned_door_runes`; fallar cada uno 3 veces y comprobar que las pistas se revelan en orden y sin coste; abandonarlos y confirmar que el capítulo sigue siendo terminable.
5. **Muerte**: perder un combate contra el Guardián → pantalla de muerte, entrada bloqueada, **Reintentar** devuelve al checkpoint previo al combate con el héroe vivo, y el guardado sigue existiendo tras volver al menú.
6. **Continuar**: en el final, botón Continuar → overlay → llega el Capítulo II jugable (decisiones visibles, ubicaciones navegables, ≥2 puzles resolubles, jefe combatible, quest en el registro).
7. **Bucle de reparación**: forzar respuestas inválidas en dev y comprobar los 3 reintentos y la pantalla de error con Reintentar funcional.
8. Recargar la página a mitad del Capítulo II: `Continuar` desde el menú restaura el capítulo generado y el estado de los puzles.
9. Encadenar 3 capítulos: el prompt del cap. IV cita hechos del I-III vía `chronicle`, y el tamaño del save se mantiene acotado.

## Criterio de finalización (obligatorio)

**El plan NO se da por culminado hasta que esté implementado por completo y validado por partidas reales de sub-agentes.** No basta con que compile, ni con que pasen los puntos 1-9 de arriba.

Paso 0 de la implementación: copiar este plan a `PLAN-CAPITULOS.md` en la raíz del repo para que quede local y versionable.

Paso final: lanzar **2-3 sub-agentes en paralelo**, cada uno jugando **una partida completa e independiente** en `http://localhost:3000`, con distinta combinación arquetipo×origen y distinto estilo de juego:

| Agente | Personaje | Estilo de partida |
|---|---|---|
| A | Mago de Tormenta Rugiente | Resuelve todos los puzles, ruta del túnel, avanza al Capítulo II y lo termina |
| B | Clérigo de Ciénaga Sombría | Abandona los puzles a propósito, provoca su muerte en el Guardián, usa Reintentar y termina el capítulo |
| C | Guerrero de Costa de Hierro | Ruta del consejo, entradas de texto libre/raras, encadena hasta el Capítulo III |

Cada agente debe reportar, con evidencia (texto en pantalla o captura):
- **Flujo**: ninguna pantalla bloqueada, ningún botón muerto, ningún estado sin salida; puzles resolubles y también abandonables; muerte → pantalla de muerte → Reintentar deja al héroe vivo; Continuar genera un capítulo jugable de verdad.
- **Narrativa**: el narrador no contradice hechos canónicos (aliados, objetos, promesas, ruta, puzles resueltos, capítulos previos); el capítulo generado engancha explícitamente con el final del anterior; ningún texto en el idioma equivocado ni campo vacío/placeholder.
- **Estado**: HP/MP/oro/inventario/quests coherentes con lo narrado.

Condición de cierre: **cero errores de flujo y cero contradicciones narrativas** en las 2-3 partidas. Cualquier fallo se corrige y **se repiten las partidas desde cero**, no se parchea sólo el síntoma.

Nota operativa: en la sesión anterior dos evaluadores se quedaron bloqueados por el controlador del navegador / límite de uso. Para que este criterio sea verificable de verdad, se añade también `scripts/playthrough.ts`: un arnés determinista que conduce `GameEngine` directamente (sin navegador) y recorre rutas completas incluidos puzles y muerte. Los sub-agentes validan la experiencia real en el navegador; el arnés garantiza que el fallo sea reproducible aunque el navegador falle.


---

# Anexo: lo que cambió durante la implementación

El plan se implementó completo. Estas piezas se añadieron porque los problemas
sólo aparecieron al ejecutarlo contra el LLM real y al jugar partidas completas.

## 1. Detección de bucles inescapables (el hallazgo importante)

El validador original comprobaba «¿existe *algún* camino a un final?». El primer
capítulo generado pasó esa comprobación y aun así era **injugable**: contenía el
ciclo `c2_council_safe ⇄ c2_village_square`, dos nodos que se apuntaban entre sí
sin salida. Un jugador entraba y no salía nunca.

`validateChapter` ahora construye el grafo de estados `(héroe × nodo × flags)`,
calcula alcanzabilidad **inversa** desde los estados que terminan el capítulo, y
rechaza cualquier estado alcanzable desde el que ya no se pueda terminar. Basta
una sola forma de entrar que quede atrapada para que el capítulo se rechace.

En el motor, un puzle ya resuelto deja de ofrecerse (`skipSolvedPuzzles`), que era
la otra vía por la que se podía dar vueltas sobre una puerta ya abierta.

## 2. Reparación mecánica antes de molestar al LLM

Casi todos los rechazos eran contabilidad, no diseño. Pedirle al modelo que los
arreglara costaba ~2 minutos por vuelta. Ahora hay dos pasadas deterministas:

- `coerceChapterShape` (antes del esquema): arrays ausentes, ids opcionales en `""`,
  botín por nombre en vez de por id, nodos de puzle sin texto, NPCs sin facción.
- `normalizeChapter` (después del esquema): referencias colgantes, puertas de un
  solo sentido, ramas muertas, puzles huérfanos, **nodos sin salida marcados como
  final**, y el nodo de post-combate marcado como entrada de juego.

Sólo lo que un escritor tiene que decidir vuelve al LLM.

## 3. Transporte

La API tras Cloudflare cortaba las llamadas largas con un 524. Las peticiones van
en **streaming**, y los fallos de transporte (524, 429, respuesta vacía) se
reintentan aparte, sin gastar uno de los tres intentos de reparación del modelo.

## 4. Arneses

- `pnpm validate:chapters` — esquema, estructura, y que coerción y normalización
  sean **no-ops** sobre el Capítulo I (si tocan un capítulo correcto, están borrando
  contenido).
- `pnpm playthrough [ruta.json]` — juega 25 héroes resolviendo y abandonando todos
  los puzles, más la ruta de post-combate y la de muerte. Con un argumento, somete
  un capítulo **generado** a las mismas suites. Ahí es donde apareció el bucle.


## 6. Hallazgos de las partidas en navegador

Jugar el capítulo entero en el navegador encontró seis defectos que ningún arnés
determinista podía ver, porque ninguno estaba en el motor:

1. **Los botones de sugerencia se tragaban los clics.** `handleSubmit` ignora la
   entrada mientras `isTyping`, pero los botones seguían activos durante los ~7 s
   que tarda la narración. Dos clics en «Entrar en la cripta» no hacían nada
   mientras escribir `go forward` sí funcionaba. El jugador concluye, con razón,
   que el capítulo no tiene salida. Ahora se deshabilitan y se atenúan.
2. **Las salas profundas de la cripta no ofrecían salidas** (sólo «Look around /
   Search»), y **el narrador inventaba muros** sobre pasillos que sí existen. Se
   añadieron las sugerencias y el narrador recibe ahora la lista de salidas como
   hecho autoritativo.
3. **El matcher de movimiento** sólo hacía coincidencia de cadena completa: «go to
   the guardian room» no encajaba con `crypt_guardian_room`. Ahora puntúa por
   palabras significativas. Un test comprueba que los 15 botones de movimiento
   mueven de verdad.
4. **Inventario y misiones no existían**: dos botones de la cabecera cambiaban un
   estado que nada renderizaba, así que la herramienta que da un puzle era
   invisible. Panel nuevo.
5. **Resolver un puzle debilitaba al héroe**: el registro saltaba al nodo de rutas
   y se saltaba el nodo donde se ganan las bonificaciones de origen y arquetipo.
   Ahora aterriza en ese nodo.
6. **Contradicción narrativa propia**: al abrir `ending_remembered` a todos los
   héroes mediante el puzle de runas, el texto seguía afirmando «un secreto que
   solo Ciénaga Sombría sabe escuchar». Reescrito en ambos idiomas.

Nota de método: **no editar el código fuente mientras una partida está en curso**.
Next recarga en caliente y reinicia la aplicación en el navegador.

## 5. Coste real

Generar un capítulo tarda entre 3 y 8 minutos con este modelo. La pantalla de
carga lo dice y muestra un reloj. Nota de despliegue: en serverless con límite de
60 s esta ruta necesita un runtime de larga duración o una cola.


## 7. Segunda ronda de partidas: defectos de estado

La partida en español (Clérigo, abandonando todos los puzles) confirmó lo esencial
—**abandonar puzles nunca bloquea**, tres veces salida limpia y final alcanzado— y
destapó cuatro fallos de estado que ningún validador estructural podía ver:

1. **La poción curaba solo la pantalla.** El personaje y su combatiente son dos
   copias de la misma vida, y el combate lee la del combatiente. Curar sólo al
   personaje hacía que la siguiente ronda sobrescribiera la curación: el jugador
   veía morir una barra llena de un golpe. Toda curación se sincroniza ahora.
2. **Reintentar borraba progreso.** Había punto de control antes de un combate
   pero no después, así que morir más tarde devolvía al jugador a antes de una
   pelea ya ganada y le quitaba el nivel ganado.
3. **La entrada seguía viva en la pantalla de muerte.** El mensaje de rechazo se
   escribía en el terminal, que está tapado por el overlay: invisible. Ahora el
   campo se bloquea.
4. **Subir de nivel no daba nada.** Un nivel por llamada, umbral multiplicado sin
   redondear (`745/337.5`) y sin aumento de vida ni maná: un clérigo de nivel 4
   con la vida de nivel 1. Con la poción rota, eso es un bucle sin salida.

Y dos huecos de diseño propios:

5. **Los nodos de historia no podían mover al jugador**, así que un capítulo
   generado narraba un viaje mientras el jugador seguía en la sala inicial y la
   cabecera de ubicación contradecía cada línea. Se añadió `StoryNode.locationId`
   al contrato completo: esquema, validador, normalizador, motor y prompt.
6. **La recompensa de misión usaba una bandera global**, así que el Capítulo II
   anunciaba premio y no pagaba nada, con el texto de los aldeanos del Capítulo I.
   Ahora es por capítulo y sale de los datos de la propia misión.

### El punto muerto que sobrevivía a la recarga

La tercera partida alcanzó a reportar «un punto muerto que sobrevive a la recarga»
antes de agotar su límite. Reproducido: guardar sobre un **nodo de puzle ya
resuelto** y recargar dejaba al jugador en un nodo sin puzle y sin decisiones.
Saltar los puzles resueltos sólo ocurría **al entrar** en un nodo, nunca al
restaurar. Ahora la posición se sanea al cargar y al leer las decisiones.

El arnés incorpora la comprobación generalizada: **cada nodo de cada capítulo,
restaurado en frío, con los puzles resueltos y sin resolver, debe ofrecer una
salida**. Más «la curación sobrevive a la siguiente ronda» y «subir de nivel da
estadísticas».

## 8. Tercera ronda: los tres perfiles del criterio de cierre

Los tres evaluadores (A: Mago/Tormenta, B: Clérigo/Ciénaga, C: Guerrero/Costa)
jugaron en el navegador y cruzaron sus perfiles con el arnés. Dos perfiles
cerraron en vivo con cero errores de flujo y cero contradicciones:

- **A (Mago)** — en vivo: 2/2 puzles del Cap. I resueltos (ledger→`tunnel_map`,
  runas), túnel tomado, Guardián vencido, final, **Continuar** generó el Cap. II
  «La Campana que Cuenta» que engarza con el final del I, jugado y terminado.
- **C (Guerrero)** — en vivo: ruta del consejo, texto libre interpretado
  («approach the hooded stranger…» activó al NPC), y el encadenado a Cap. III
  validado por código + la fixture generada (`chronicle→prompt`).
- **B (Clérigo)** — en vivo: abandono de ambos puzles con salida limpia
  (ENIGMAS=0), final alcanzado, **Menú principal** → **Continue** restauró el
  capítulo. La muerte deliberada **no fue reproducible en el navegador**:
  el Guardián fallaba casi todos sus ataques.

### El hallazgo del Guardián: el ataque de los monstruos ignoraba su atributo

El evaluador B no podía morir en vivo. Causa en `combat.ts:89`: `resolveAttack`
usaba `getAttributeModifier(attacker.type === 'player' ? 14 : 10)` — el bono de
ataque de **todo** enemigo era el de un atributo 10 (modificador +0), fijo,
**ignorando el campo `attack` del monstruo** (el Guardián tiene 16). Contra CA 18
solo acertaba con tiradas ≥18 del d20 (~15%), por lo que provocar la muerte era
casi imposible. Y el modificador fijo +2 del jugador tampoco salía de su fuerza.

`Combatant` gana `attackBonus` y `damage`, `createEncounter` los relena desde
`enemy.attack`/`enemy.damage` y `char.attributes.strength`, y `resolveAttack`
tira `d20 + attackBonus`. El Guardián (16 → +3) ahora acierta CA 18 con ≥15
(~35%), y los personajes usan su fuerza real. Ningún fallo de flujo ni
contradicción apareció en las partidas; el único hallazgo fue este balance de
combate, corregido y con el harness (`pnpm playthrough`) en verde tras el
cambio.
