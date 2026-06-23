# Guia de instalacion y ejecucion - TropelCare Control Room

## 1. Que debes tener instalado antes

Antes de correr el proyecto, verifica que tengas instalado:

### Node.js 18 o superior

```bash
node -v
npm -v
```

Si no tienes Node.js, instalalo desde https://nodejs.org/ o usando nvm.

### Git

```bash
git --version
```

Lo necesitaras para crear el repositorio publico.

## 2. Crear el archivo de variables de entorno

En la raiz del proyecto crea un archivo llamado exactamente:

```txt
.env
```

No debe estar dentro de `src`. Debe quedar al mismo nivel que `package.json`.

Copia este contenido y reemplaza los valores que entregue el TA:

```env
VITE_API_BASE_URL=https://TU-BACKEND/api/v1
VITE_API_DOCUMENTATION_URL=https://TU-BACKEND/docs
VITE_TEAM_CODE=TEAM-0XX
VITE_DEFAULT_EMAIL=operator@tuckersoft.com
VITE_DEFAULT_PASSWORD=REEMPLAZAR_PASSWORD_DEL_EQUIPO
```

Importante: el archivo `.env` esta en `.gitignore`, por lo tanto no se subira a GitHub. Si el docente pide entregar las variables de entorno, entregalas aparte por el canal indicado.

## 3. Instalar dependencias

Desde la carpeta raiz del proyecto ejecuta:

```bash
npm install
```

## 4. Correr el proyecto localmente

```bash
npm run dev
```

Luego abre la URL que muestra Vite, normalmente:

```txt
http://localhost:5173
```

## 5. Probar login

En la pantalla de login usa:

```txt
TEAM_CODE=TEAM-0XX
EMAIL=operator@tuckersoft.com
PASSWORD=password-del-equipo
```

Estos datos los debe entregar el TA.

## 6. Verificar antes de entregar

Ejecuta:

```bash
npm run typecheck
npm run build
```

Si alguno falla, corrige antes de subir.

## 7. Crear repositorio publico en GitHub

Desde la raiz del proyecto:

```bash
git init
git add .
git commit -m "TropelCare Control Room frontend"
git branch -M main
git remote add origin https://github.com/TU-USUARIO/tropelcare-control-room.git
git push -u origin main
```

Recuerda: no subas `.env` si tiene credenciales reales.

## 8. Deploy recomendado en Vercel

```bash
npm install -g vercel
vercel
```

En el panel de Vercel agrega las variables:

```txt
VITE_API_BASE_URL
VITE_API_DOCUMENTATION_URL
VITE_TEAM_CODE
VITE_DEFAULT_EMAIL
VITE_DEFAULT_PASSWORD
```

Despues del deploy, copia el link y pegalo en el README.

## 9. Que entregar

El enunciado pide:

1. Repositorio publico.
2. Link del deploy funcional.
3. README con integrantes, instalacion, comandos, variables requeridas, deploy y decisiones tecnicas.
4. Variables de entorno asignadas por el TA.

## 10. Rutas principales de la app

```txt
/login
/dashboard
/tropels
/signals
/signals/:id
/sectors
/sectors/:id/story
```

## 11. Orden recomendado durante la hackathon

1. Configurar `.env`.
2. Ejecutar `npm install`.
3. Ejecutar `npm run dev`.
4. Probar login.
5. Probar dashboard.
6. Probar filtros de tropeles y URL.
7. Probar infinite scroll.
8. Abrir detalle de senal y actualizar estado.
9. Probar story engine en desktop, mobile y teclado.
10. Ejecutar `npm run typecheck` y `npm run build`.
11. Subir a GitHub.
12. Deploy.
