# TropelCare Control Room - Pizza Protocol

Frontend para la hackathon de Desarrollo Basado en Plataformas. Implementa una consola operativa en React + TypeScript + Tailwind CSS para consumir la API cerrada del curso.

## Integrantes y codigos

- Integrante 1: Josue Yeremi Huaman Huamani
- Integrante 2: Dayron Saiyuk Cueva Loayza
- Integrante 3: Antony Yonel Rosales Esteban

## Variables de entorno requeridas

Crea un archivo `.env` en la raiz del proyecto copiando `.env.example`:

```env
VITE_API_BASE_URL=https://TU-BACKEND/api/v1
VITE_API_DOCUMENTATION_URL=https://TU-BACKEND/docs
VITE_TEAM_CODE=TEAM-0XX
VITE_DEFAULT_EMAIL=operator@tuckersoft.com
VITE_DEFAULT_PASSWORD=REEMPLAZAR_PASSWORD_DEL_EQUIPO
```

> Para la entrega, el docente pide entregar tambien las variables de entorno. No subas `.env` a GitHub si contiene password real. Entregalas por el canal indicado por el docente.

## Instalacion

```bash
npm install
```

## Ejecutar localmente

```bash
npm run dev
```

Abre la URL que muestre Vite, normalmente:

```txt
http://localhost:5173
```

## Comandos de verificacion

```bash
npm run typecheck
npm run build
```

Ambos deben terminar sin errores antes de entregar.

## Tecnologias

- React 18+
- TypeScript estricto
- Vite
- React Router
- Tailwind CSS
- Axios

## Checkpoints cubiertos

### Checkpoint 1 - Encender la consola

- Login con `teamCode`, `email` y `password`.
- Rutas protegidas.
- Restauracion de sesion con `/auth/me`.
- Logout.
- Dashboard real con `/dashboard/summary`.
- Loading, error y estado vacio.

### Checkpoint 2 - Atlas de Tropeles

- Paginacion real del servidor.
- Filtros combinables.
- Busqueda.
- Ordenamiento.
- Estado reflejado en URL.
- Restauracion al recargar o compartir URL.
- Proteccion contra respuestas antiguas mediante `AbortController` y `requestId`.

### Checkpoint 3 - Feed infinito

- Infinite scroll con `IntersectionObserver`.
- Feed cursor-based.
- Deduplicacion por ID.
- Una sola carga adicional en vuelo.
- Filtros persistidos en URL.
- Recuperacion de error sin borrar paginas previas.

### Checkpoint 4 - Atender una Senal

- Detalle de señal.
- Cambio de estado a `PROCESANDO` o `ATENDIDA`.
- Botones deshabilitados durante request.
- Confirmacion al completar.
- Error accionable y conservacion del estado anterior si falla.

### Checkpoint 5 - Sector Story Engine

- Ruta `/sectors/:id/story`.
- Narrativa por etapas activadas por scroll.
- Visual persistente sincronizado con etapa activa.
- Progreso de recorrido.
- Fallback con `IntersectionObserver`.
- Uso progresivo de View Transition API si existe.
- Soporte `prefers-reduced-motion` desde CSS.
- Navegacion por teclado con `tabIndex` y foco.

## Deploy

Puedes usar Vercel o Netlify. Asegurate de configurar las mismas variables de entorno en el panel del deploy.

### Vercel

```bash
npm install -g vercel
vercel
```

### Netlify

```bash
npm install -g netlify-cli
netlify deploy
```

## Link del deploy

COMPLETAR: pega aqui el link final del deploy.

## Decisiones tecnicas importantes

- No se usa React Query, SWR, TanStack Query ni librerias de cache de servidor.
- No se simula paginacion en cliente.
- El feed no usa boton `Cargar mas`; carga automaticamente con infinite scroll.
- No hay datos hardcodeados para reemplazar al backend.
- Se usan tipos TypeScript para respuestas de API y no se define `any` para DTOs.
