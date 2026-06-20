# OA Proposal — Issue #359

## Title
[OPENCODE] [OPENCODE] API: MAX Law enforcement — 100% English logs/errors/responses + ESLint rule with exclusions

## Source
GitHub issue #359

## Objective
## Objective
## Objective
Enforce 100% English in all API output (logs, errors, JSON responses) and add automated lint rule with proper exclusions for multilingual assets.

## Scope
1. **Sweep & Replace** all Spanish strings in goalchain_api/src/:
   - Console logs in `getOrUpdateContextCache` (lines 643-646, 650-651, 663-664, 667-668, 671-672)
   - `masterContext` system prompt (lines 675-700) — keep as string constant but translate to English instructions
   - Coach error replies (lines 926, 967-968) — return English error messages
   - `serverSystemPrompt` fallback (lines 981-994) — translate to English
   - Any other console.log/warn/error in Spanish

2. **Standardize Error Responses** via new `src/utils/response.ts`:
   ```typescript
   export function errorResponse(message: string, detail?: string): object {
     return { error: detail ? `Failed to ${message}: ${detail}` : `Failed to ${message}` };
   }
   export function successResponse<T>(data: T, meta?: object): object {
     return { success: true, data, ...meta };
   }
   ```

3. **Coach Language Detection** — only reply in Spanish if user explicitly requests via `Accept-Language: es` header or `?lang=es` query param:
   ```typescript
   function getReplyLanguage(req: Request): "en" | "es" {
     return req.headers["accept-language"]?.startsWith("es") || req.query.lang === "es" ? "es" : "en";
   }
   ```

4. **Add ESLint Rule** in goalchain_api/.eslintrc.js:
   ```js
   rules: {
     "no-non-ascii": ["error", {
       "allow": [
         "docs/**",
         "ai_context/**", 
         "goalchain_webapp/src/i18n/**",
         "goalchain_webapp/public/locales/**"
       ]
     }]

## OA Plan (draft)
- Analyze repository constraints and META alignment.
- Implement minimal safe changes first.
- Run local checks where feasible.
- Prepare draft PR for Cursor review.

## Risk / rollback
- Risk: scope drift or unstable dependencies.
- Rollback: revert branch `exp/opencode-issue-359` and close draft PR.
