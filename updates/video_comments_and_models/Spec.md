# Spec Técnica — Vídeos, Comentários e Modelos de Exercício

## Stack e Convenções

- **Frontend**: Next.js App Router (TypeScript), Tailwind CSS com tokens semânticos
- **Backend**: Rails API (existing), autenticação via JWT cookie
- **Estado**: React state local (sem Zustand/Redux nesta fase)
- **Ícones**: Lucide React

---

## Modelo de Dados (API)

### Exercício — campos novos

```json
{
  "id": "uuid",
  "name": "Agachamento Livre",
  "coach_comment": "Texto livre do coach (nullable)",
  "video_links": ["https://youtube.com/watch?v=...", "..."]
}
```

### Modelo de Exercício — novo recurso

```json
{
  "id": "uuid",
  "coach_id": "uuid",
  "name": "Agachamento — Carga Base",
  "exercise_name": "Agachamento Livre",
  "load": 100,
  "load_unit": "kg",
  "series": 4,
  "reps": 6,
  "rpe": 8,
  "coach_comment": "Texto livre...",
  "video_links": ["..."]
}
```

---

## Endpoints Necessários (Rails)

### Vídeos e Comentários (no exercício existente)
```
PATCH /api/v1/exercicios/:id
  body: { exercicio: { coach_comment, video_links } }
```

### Modelos de Exercício
```
GET  /api/v1/exercise_models          → lista modelos do coach autenticado
POST /api/v1/exercise_models          → cria novo modelo
GET  /api/v1/exercise_models/:id      → detalhes
DELETE /api/v1/exercise_models/:id    → remove
```

---

## Componentes Frontend

### `ExerciseVideoButton` (novo)
- Exibido no header do exercício quando `video_links.length > 0`
- Ícone: `Youtube` (Lucide)
- Se 1 link: abre diretamente em nova aba
- Se múltiplos: abre um mini-modal com lista de links

**Props**:
```tsx
interface ExerciseVideoButtonProps {
  links: string[];
}
```

### `CoachCommentBadge` (novo)
- Exibido abaixo do nome do exercício quando `coach_comment` está preenchido
- Visual: fundo `bg-semantic-info-bg border border-semantic-info-border rounded-xl p-3`
- Ícone: `MessageSquare` (Lucide)
- Texto do comentário em `text-sm text-semantic-info-text`

**Props**:
```tsx
interface CoachCommentBadgeProps {
  comment: string;
}
```

### Modal de Modelos de Exercício (`ExerciseModelModal`)
- Aberto pelo coach ao criar/editar exercício
- Campo de busca por nome
- Lista de modelos: nome, exercício, carga/séries/reps
- Botão "Importar" aplica os dados no formulário
- Botão "Salvar como Modelo" abre um campo para nomear e confirmar

---

## Fluxo Coach — Adicionar Vídeo/Comentário

1. Na tela de edição de exercício (`/coach/treinos/[id]/[treinoId]`), o card do exercício ganha dois novos campos opcionais:
   - `coach_comment`: `<textarea>` com placeholder
   - `video_links`: lista de inputs text com botão "+" para adicionar mais

2. Ao salvar o exercício, os novos campos são enviados junto ao PATCH

3. No preview/execução do aluno, os campos são exibidos se presentes

---

## Fluxo Coach — Salvar como Modelo

1. No card de exercício (modo edição), botão "Salvar como Modelo" no footer
2. Modal com campo `model_name` (nome descritivo para o modelo)
3. POST para `/exercise_models` com dados atuais do exercício
4. Toast de confirmação "Modelo salvo!"

---

## Fluxo Coach — Importar Modelo

1. No formulário de criação de exercício, botão "Usar Modelo"
2. Abre `ExerciseModelModal` com busca
3. Ao selecionar, preenche automaticamente: `exercise_name`, `load`, `load_unit`, `series`, `reps`, `rpe`, `coach_comment`, `video_links`
4. Coach pode editar antes de salvar

---

## Notas de Implementação

- `video_links` é um array no banco (PostgreSQL `text[]` ou jsonb). Validar URL do YouTube no frontend antes de salvar
- `coach_comment` é nullable; não exibir componente se null/vazio
- No aluno, o campo `coach_comment` é read-only; exibir ANTES do campo de observação do aluno
- Modelos não têm versionamento na v1 — editar modelo substitui (ou apenas apagar e criar novo)
- Limite inicial: 3 links de vídeo por exercício (evitar abuse)

---

## Ordem de Implementação Sugerida

1. **Backend**: Migrations para `coach_comment`, `video_links` no exercício
2. **Backend**: CRUD de `ExerciseModel`
3. **Frontend**: `CoachCommentBadge` + `ExerciseVideoButton` (view-only para o aluno)
4. **Frontend**: Campos de edição no painel do coach
5. **Frontend**: Modal de modelos (salvar + importar)
