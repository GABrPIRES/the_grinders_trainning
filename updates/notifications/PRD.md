# PRD — Sistema de Notificações + E-mails

## Objetivo

Implementar um sistema de notificações in-app e e-mails transacionais para coaches e alunos,
cobrindo os eventos relevantes do ciclo de treino. Notificações e e-mails são independentes
e ambos opcionais — cada coach controla suas preferências. E-mails ficam desativados por padrão
(flag no admin), mas o sistema fica completo e pronto para ativar.

---

## Eventos cobertos

| # | Evento | Quem recebe | Canal |
|---|--------|-------------|-------|
| 1 | Coach publica todos os treinos de uma semana | Aluno | Notificação + e-mail |
| 2 | Aluno conclui um treino (finish) | Coach | Notificação + e-mail |
| 3 | Aluno não realiza um treino (job semanal) | Coach | Notificação + e-mail |

---

## Regras de negócio

### Evento 1 — Semana publicada
- Disparo: quando o último treino `draft` da semana é publicado (status → `published`)
  - Checa: `week.training_sessions.where(status: :draft).count == 0` após o publish
- Destinatário: o aluno dono do bloco de treino
- Conteúdo da notificação: "Seus treinos da semana X foram publicados pelo coach [nome]"
- Conteúdo do e-mail: resumo da semana (dias, exercícios principais)

### Evento 2 — Treino concluído
- Disparo: `POST /api/v1/treinos/:id/finish` → após atualizar status → `completed`
- Destinatário: o coach responsável pelo aluno
- Conteúdo: nome do aluno, treino, duração, cargas realizadas, RPE médio, exercícios feitos/não feitos
- Conteúdo do e-mail: tabela com detalhes do treino

### Evento 3 — Treino não realizado
- Disparo: job semanal (domingo 23h, fuso BR) — verifica treinos `published` com
  `end_date < hoje` sem `finished_at` (status ainda `published` ou `in_progress`)
- Destinatário: coach do aluno
- Conteúdo: "O aluno [nome] não realizou o treino de [data/nome]"
- Evitar spam: não notificar se o coach já recebeu alerta para o mesmo treino na mesma semana
  (campo `notified_at` ou cache)

---

## Preferências (Coach)

### Notificações in-app
- Toggle global "Receber notificações" — persiste no backend (`personals.notifications_enabled`)
- Se desativado: nenhuma notificação é criada para aquele coach

### E-mails (por evento)
- Habilitado apenas se o admin ativar a feature globalmente (`admin_settings.emails_enabled`)
- Cada coach escolhe quais eventos quer receber por e-mail:
  - `email_on_workout_completed` (padrão: true)
  - `email_on_workout_missed` (padrão: true)
  - O aluno recebe e-mail de "semana publicada" se o coach optou por enviar (coach controla)
    - `email_students_on_publish` (padrão: true)

---

## Frontend — Central de Notificações

### Bell no HeaderBar
- Badge com contagem de não lidas (chama `GET /api/v1/notifications?unread=true`)
- Polling a cada 60s (ou WebSocket via SolidCable no futuro)
- Clique → abre dropdown (desktop) ou drawer bottom-sheet (mobile)

### Dropdown/Drawer
- Lista de notificações ordenada por `created_at DESC`
- Cada item: ícone por tipo, mensagem, tempo relativo ("há 5 min"), dot se não lida
- Clique no item: marca como lida + navega para a rota relevante
- "Marcar todas como lidas"
- "Ver todas" → página `/coach/notifications` (histórico completo)

### Página de preferências (coach/settings)
- Seção "Notificações" expande com:
  - Toggle global de notificações in-app
  - (quando e-mails ativados pelo admin) checkboxes de eventos de e-mail
  - Mensagem "E-mails indisponíveis no momento" se feature flag off

---

## Considerações técnicas

- Backend já tem: `Notification` model, `GET /notifications`, `POST /notifications/:id/read`
- Adicionar: novos `notification_type` enum values, campos de preferência em `personals` e
  `admin_settings`, mailer `WorkoutMailer`, job `WorkoutMissedCheckJob`
- Feature flag global: tabela `admin_settings` com coluna `emails_enabled boolean default false`
- SolidQueue já configurado para jobs agendados
- Resend já configurado no backend

---

## Fora de escopo (por ora)
- Notificações push nativas (PWA push notifications via service worker)
- Notificações para aluno quando coach cancela treino
- Digest semanal por e-mail
