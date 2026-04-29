# Spec Técnico — Sistema de Notificações + E-mails

## Backend (Rails API)

### 1. Migration — campos de preferência

```ruby
# add_notification_prefs_to_personals
add_column :personals, :notifications_enabled, :boolean, default: true, null: false
add_column :personals, :email_on_workout_completed, :boolean, default: true, null: false
add_column :personals, :email_on_workout_missed, :boolean, default: true, null: false
add_column :personals, :email_students_on_publish, :boolean, default: true, null: false

# create_admin_settings (se não existir)
create_table :admin_settings, id: :uuid do |t|
  t.boolean :emails_enabled, default: false, null: false
  t.timestamps
end
```

### 2. Notification.notification_type — novos valores

```ruby
enum :notification_type, {
  # existentes
  feedback_form_available: 0,
  feedback_form_reminder: 1,
  feedback_overdue_coach_alert: 2,
  coach_review_pending: 3,
  # novos
  week_published: 4,        # para aluno
  workout_completed: 5,     # para coach
  workout_missed: 6,        # para coach
}
```

### 3. Helpers de disparo

```ruby
# app/services/notification_service.rb
module NotificationService
  def self.notify(user:, type:, payload: {})
    Notification.create!(user: user, notification_type: type, payload: payload)
  end

  def self.notify_coach_if_enabled(coach:, type:, payload: {})
    personal = coach.personal # ou coach diretamente se for Personal
    return unless personal&.notifications_enabled
    notify(user: coach, type: type, payload: payload)
  end
end
```

### 4. Evento 1 — Semana publicada (trigger no controller)

**Arquivo:** `app/controllers/api/v1/coach/treinos_controller.rb` (ou weeks_controller)
**Onde:** após `treino.update!(status: :published)`

```ruby
# Verifica se todos os treinos da semana foram publicados
week = treino.week
if week.training_sessions.where(status: :draft).count.zero?
  aluno_user = week.training_block.aluno.user
  NotificationService.notify(
    user: aluno_user,
    type: :week_published,
    payload: {
      week_id: week.id,
      week_number: week.week_number,
      coach_name: current_user.name,
      block_title: week.training_block.title,
    }
  )
  # E-mail (se feature flag ativa e coach optou)
  if AdminSettings.emails_enabled? && current_personal.email_students_on_publish
    WorkoutMailer.week_published(aluno_user, week, current_user).deliver_later
  end
end
```

### 5. Evento 2 — Treino concluído (trigger no controller)

**Arquivo:** `app/controllers/api/v1/treinos_controller.rb`
**Onde:** após `treino.update!(status: :completed, finished_at: Time.current)`

```ruby
coach_user = treino.personal&.user
if coach_user
  NotificationService.notify_coach_if_enabled(
    coach: coach_user,
    type: :workout_completed,
    payload: {
      treino_id: treino.id,
      treino_name: treino.name,
      aluno_name: current_user.name,
      duration_seconds: treino.duration_seconds,
      sections_summary: treino.sections.map { |s|
        { name: s.exercise_name, feito: s.feito, actual_load: s.actual_load, actual_rpe: s.actual_rpe }
      }
    }
  )
  if AdminSettings.emails_enabled? && coach_user.personal&.email_on_workout_completed
    WorkoutMailer.workout_completed(coach_user, treino, current_user).deliver_later
  end
end
```

### 6. Evento 3 — Treino não realizado (job)

**Arquivo:** `app/jobs/workout_missed_check_job.rb`

```ruby
class WorkoutMissedCheckJob < ApplicationJob
  queue_as :notifications

  def perform
    # Treinos publicados cuja semana já terminou e não foram concluídos
    missed = TrainingSession
      .includes(week: { training_block: :aluno }, personal: :user)
      .where(status: [:published, :in_progress])
      .joins(:week)
      .where("weeks.end_date < ?", Date.current)
      .where(missed_notified_at: nil) # evita re-notificar

    missed.each do |treino|
      coach_user = treino.personal&.user
      next unless coach_user

      NotificationService.notify_coach_if_enabled(
        coach: coach_user,
        type: :workout_missed,
        payload: {
          treino_id: treino.id,
          treino_name: treino.name,
          aluno_name: treino.week.training_block.aluno.user.name,
        }
      )
      treino.update_column(:missed_notified_at, Time.current)

      if AdminSettings.emails_enabled? && coach_user.personal&.email_on_workout_missed
        WorkoutMailer.workout_missed(coach_user, treino).deliver_later
      end
    end
  end
end
```

**config/recurring.yml:**
```yaml
workout_missed_check:
  class: WorkoutMissedCheckJob
  schedule: every sunday at 23:00 America/Sao_Paulo
```

**Migration adicional:** `add_column :training_sessions, :missed_notified_at, :datetime`

### 7. WorkoutMailer

```ruby
# app/mailers/workout_mailer.rb
class WorkoutMailer < ApplicationMailer
  def week_published(aluno_user, week, coach_user)
    @aluno   = aluno_user
    @week    = week
    @coach   = coach_user
    mail(to: @aluno.email, subject: "Seus treinos da semana #{@week.week_number} foram publicados!")
  end

  def workout_completed(coach_user, treino, aluno_user)
    @coach   = coach_user
    @treino  = treino
    @aluno   = aluno_user
    mail(to: @coach.email, subject: "#{@aluno.name} completou um treino")
  end

  def workout_missed(coach_user, treino)
    @coach   = coach_user
    @treino  = treino
    @aluno   = treino.week.training_block.aluno.user
    mail(to: @coach.email, subject: "#{@aluno.name} não realizou um treino")
  end
end
```

### 8. NotificationsController — novos endpoints necessários

Adicionar ao controller existente:
- `GET /api/v1/notifications` — já existe, adicionar param `?unread=true`
- `POST /api/v1/notifications/:id/read` — já existe
- `POST /api/v1/notifications/read_all` — marcar todas como lidas (novo)
- `GET /api/v1/coach/notification_preferences` — retorna prefs do coach
- `PATCH /api/v1/coach/notification_preferences` — atualiza prefs

### 9. AdminSettings model

```ruby
class AdminSetting < ApplicationRecord
  def self.emails_enabled?
    first_or_create.emails_enabled
  end
end
```

Endpoint admin: `PATCH /api/v1/admin/settings` com `{ emails_enabled: true/false }`

---

## Frontend (Next.js)

### Arquivos a criar/modificar

| Arquivo | Ação |
|---------|------|
| `hooks/useNotifications.tsx` | Hook com polling + estado global de notificações |
| `components/layout/NotificationsDropdown.tsx` | Dropdown desktop + drawer mobile |
| `components/layout/HeaderBar.tsx` | Integrar NotificationsDropdown, badge dinâmico |
| `app/coach/settings/page.tsx` | Expandir seção de notificações com preferências reais |
| `app/admin/settings/page.tsx` | Adicionar toggle `emails_enabled` |

### useNotifications hook

```tsx
// hooks/useNotifications.tsx
export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = useCallback(async () => {
    const data = await fetchWithAuth('notifications');
    setNotifications(data);
    setUnreadCount(data.filter((n: Notification) => !n.read_at).length);
  }, []);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60_000); // polling 60s
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const markRead = async (id: string) => {
    await fetchWithAuth(`notifications/${id}/read`, { method: 'POST' });
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read_at: new Date().toISOString() } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllRead = async () => {
    await fetchWithAuth('notifications/read_all', { method: 'POST' });
    setNotifications(prev => prev.map(n => ({ ...n, read_at: n.read_at ?? new Date().toISOString() })));
    setUnreadCount(0);
  };

  return { notifications, unreadCount, markRead, markAllRead, refresh: fetchNotifications };
}
```

### NotificationsDropdown

- Desktop: `absolute right-0 top-12 w-96 bg-surface-elevated border border-line rounded-2xl shadow-2xl z-50`
- Mobile: drawer bottom-sheet (`fixed inset-x-0 bottom-0 rounded-t-2xl`)
- Ícones por tipo:
  - `week_published` → `BookOpen` (verde)
  - `workout_completed` → `CheckCircle2` (azul)
  - `workout_missed` → `AlertCircle` (laranja)
  - feedback types → `ClipboardList` (cinza)
- Tempo relativo: `formatDistanceToNow` do `date-fns/locale/pt-BR`
- Deep link por tipo:
  - `week_published` → `/aluno/treinos`
  - `workout_completed` → `/coach/treinos/{aluno_id}` (via payload)
  - `workout_missed` → `/coach/students/{aluno_id}`

### Rota de notificação por tipo (payload.route)
Incluir `route` no payload ao criar a notificação no backend para simplificar o deep link no frontend.

---

## Ordem de implementação sugerida

1. **Backend migration** — campos de preferência + admin_settings
2. **Backend notification types** + NotificationService
3. **Backend triggers** — eventos 1 e 2 nos controllers
4. **Backend job** — evento 3 (WorkoutMissedCheckJob)
5. **Backend mailers** — WorkoutMailer (templates simples HTML)
6. **Backend API** — novos endpoints (read_all, preferences)
7. **Frontend hook** — useNotifications
8. **Frontend UI** — NotificationsDropdown + integração no HeaderBar
9. **Frontend settings** — seção de preferências real no coach/settings
10. **Frontend admin** — toggle emails_enabled no admin/settings
