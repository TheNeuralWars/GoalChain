# Handoff Sprint 3 — UserContext, Profile Overhaul & Scroll Snapping

- **Status:** done
- **Priority:** P1
- **Owner (implementer):** antigravity
- **Reviewers:** hermes | human
- **Created:** 2026-06-26

## Objective

Sincronizar y documentar los cambios arquitectónicos del Sprint 3 (Contexto de Usuario Reactivo), el rediseño premium del perfil con muro social, y la implementación de scroll-snapping a pantalla completa en la landing page para que Hermes disponga del contexto completo del repositorio.

---

## Context

Durante esta sesión de pair programming local en la Win PC (`win-90p10qeopqq`), hemos realizado cambios estructurales profundos en la webapp (`goalchain_webapp/`) y en el sitio estático (`docs/`). Es indispensable dejar todo subido a `main` y registrar el resumen para evitar desalineaciones con las ejecuciones autónomas de Hermes.

---

## Cambios Arquitectónicos Registrados

### 1. Estatus de Sesión Centralizado (`UserContext.tsx`)
- Se eliminaron las consultas imperativas aisladas a `localStorage`.
- Se creó `UserContext.tsx` que provee `user` de forma reactiva a toda la aplicación.
- Sincroniza múltiples pestañas mediante un listener de eventos `'storage'`.
- La interfaz `GoalChainUser` ahora incluye:
  - `bio`, `location` (personales).
  - `twitter`, `telegram`, `discord`, `github` (sociales).
  - `forwardingEmail` (reenvío de correo para la casilla `@goalchain.fun`).
  - `accentColor` (tema dinámico de la interfaz).
  - `customPhotoUrl` (imagen de perfil en Base64).
  - `following` (array de usernames seguidos).

### 2. Renovación Premium de Perfil (`UserProfile.tsx` & `index.css`)
- **Modo Edición**: Permite configurar datos personales, redes, Base64 avatar upload (peso validado a `< 1.5MB`) y correo destino.
- **Temas de Acento Reactivos**: Utiliza inline styles para enlazar la propiedad `--accent-theme` a los elementos CSS de manera dinámica.
- **Social Feed & Follows**:
  - Muro interactivo de publicaciones con persistencia en `localStorage` y opción de dar "Like".
  - Botón "Follow/Unfollow" con contadores reactivos de seguidores.
- **Unificación de Cantera**: Reemplazo de las cartas estáticas por el componente de alta fidelidad `LayeredNftCard` en `SquadGallery.tsx`.

### 3. Scroll Snapping Desktop (`docs/index.html`)
- **Diseño por Cuadros (Slides de 100vh)**:
  - Activado en desktop (`>= 1024px`).
  - Convierte el header, secciones y footer en slides absolutos de `100vh`.
  - Transición fluida: las secciones entran deslizándose hacia arriba con desvanecimiento y escalado (97% a 100%).
  - Paginación lateral (dots de neón flotantes).
- **Controlador JavaScript Inteligente**:
  - Intercepta `wheel`, `keydown` y gestos de deslizamiento (`touch`).
  - **Soporte para Contenidos Altos**: Si una sección tiene scroll interno en laptops compactas, el script le permite scrollar de forma nativa. Solo al llegar a los límites (top/bottom) se dispara el salto de slide.
  - Sincronización hash con el navbar superior.
  - **Failsafe Mobile**: En pantallas `< 1024px`, se desactiva el snapping y se restituye el scroll nativo clásico.

---

## Commits Confirmados en `main`

1. `feat(webapp): refactor user session to react context for global reactive sync`
2. `feat(profile): overhaul user profile with custom themes, socials, email routing, follow system, and public feed`
3. `feat(squad): integrate LayeredNftCard into SquadGallery for high-fidelity squad visualization`
4. `fix(marketplace): resolve TypeScript compiler error for optional player price narrowing`
5. `feat(docs): implement smooth full-page scrolling and screen-snapping transitions for landing page`

---

## Notas para Hermes

- **Typings de Player**: `PlayerRow` (definido en `LayeredNftCard.tsx`) tiene la propiedad `price` marcada como opcional (`price?: string`). Al consumirla, recuerda realizar estrechamiento de tipos (type narrowing) mediante condicionales ternarios o validaciones previas para evitar el error `TS18048` de TypeScript.
- **Namespace Safety**: Todo script añadido secuencialmente en `docs/` debe estar envuelto en una IIFE autoejecutable. No declares variables globales usando `const` o `let`.
- **Compilación**: Asegúrate de correr siempre `npm run build` en `goalchain_webapp/` para auditar el compilador antes de dar por finalizada una tarea visual.
