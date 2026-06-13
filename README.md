# finance-app

Self-hosted личные (и в будущем семейные) финансы. Phase 1 — быстрый ввод расходов,
базовая статистика, хранение в Postgres. Подробный замысел и дорожная карта — ниже.

**Стек:** Next.js 15 (App Router, React 19, TypeScript) · Drizzle ORM · PostgreSQL ·
опциональный AI-парсинг через локальный **Lemonade Server** (OpenAI-совместимый).

---

## Структура

```
src/
  app/                 # страница + API-роуты (Next App Router)
    api/transactions/  # CRUD операций
    api/parse/         # AI-парсинг строки в поля (опционально)
  components/EntryForm.tsx
  db/
    schema.ts          # Drizzle-схема (источник правды для типов)
    index.ts           # ленивое подключение к БД
    seed-data/categories.json
  lib/                 # money, lemonade-клиент
drizzle/0000_init.sql  # DDL (применяется scripts/migrate.mjs)
scripts/migrate.mjs    # forward-only миграции
scripts/seed.mjs       # дефолтный юзер/счета/категории (идемпотентно)
Dockerfile             # standalone-образ, миграция+сид на старте
docker-compose.yml     # прод: reuse существующего Postgres в сети edge
docker-compose.dev.yml # локально: собственный Postgres
```

## Локальная разработка

**Вариант A — всё в Docker (проще всего):**
```bash
cp .env.dev.example .env.dev
docker compose -f docker-compose.dev.yml up --build
# открыть http://localhost:3000
```

**Вариант B — Next напрямую + свой Postgres:**
```bash
npm install
# .env с DATABASE_URL на доступный Postgres, затем:
npm run db:setup      # migrate + seed
npm run dev
```

## Деплой на сервер (pull образа)

1. **Создать БД и пользователя** в существующем Postgres (один раз), подключившись суперюзером инстанса:
   ```sql
   CREATE USER finance WITH PASSWORD 'СГЕНЕРИРУЙ_СИЛЬНЫЙ';
   CREATE DATABASE finance OWNER finance;
   \c finance
   GRANT ALL ON SCHEMA public TO finance;
   ALTER SCHEMA public OWNER TO finance;
   ```
2. **Стек** в `~/stacks/finance/`: положить `docker-compose.yml` и `.env`
   (на основе `.env.example`; `DATABASE_URL=postgres://finance:...@postgres:5432/finance`,
   `FINANCE_IMAGE=ghcr.io/<owner>/finance-app:latest`).
3. **Запуск:**
   ```bash
   docker compose pull
   docker compose up -d
   # миграции и сид применятся автоматически (AUTO_MIGRATE / AUTO_SEED)
   ```
4. **Доступ через тайнет** (`APP_PORT`, по умолчанию **8002** — 8001 занят kitchen-приложением):
   ```bash
   sudo tailscale serve --bg --https=8002 http://127.0.0.1:8002
   ```
   UI наружу не торчит — только в tailnet.

CI (`.github/workflows/docker-publish.yml`) на каждый push в `main` собирает и пушит
образ в GHCR — на сервере остаётся только `docker compose pull && up -d`.

## Переменные окружения

| Переменная | Назначение |
|---|---|
| `DATABASE_URL` | строка подключения к Postgres |
| `BASE_CURRENCY` | базовая валюта отчётов (по умолчанию `RUB`) |
| `LEMONADE_BASE_URL` | OpenAI-совместимый base URL Lemonade. **Пусто = AI выключен** (ручной ввод работает) |
| `LEMONADE_MODEL` | модель парсинга (по умолч. `Qwen3-Coder-30B-A3B-Instruct-GGUF`) |
| `AUTO_MIGRATE` / `AUTO_SEED` | гонять миграцию/сид на старте контейнера |

## AI-парсинг (Lemonade) и сеть WSL ↔ Windows

Lemonade крутится на **Windows-хосте** (NPU/GPU), а контейнер — в **WSL2**. Их надо состыковать:

- Lemonade должен слушать не только `127.0.0.1`, а быть доступен извне (хотя бы для WSL).
- В контейнере `LEMONADE_BASE_URL` указывает на хост. Варианты адреса:
  - `http://host.docker.internal:<порт>/api/v1` (в compose уже добавлен `host-gateway`);
  - либо IP Windows-хоста, видимый из WSL.
- Это подбирается точечно под твою сеть — пока `LEMONADE_BASE_URL` пуст, приложение
  полноценно работает на ручном вводе.

## Схема и миграции

- Источник правды для типов — `src/db/schema.ts` (Drizzle).
- DDL — `drizzle/0000_init.sql`, применяется `scripts/migrate.mjs` (идемпотентно, с журналом `_migrations`).
- Семейные сущности (`households`, `envelopes`, поля `scope` / `visibility` / `hidden_until`)
  уже заложены в схему, но в Phase 1 не используются — чтобы потом не ломать данные.

## Дорожная карта

- **Phase 1 (сейчас):** личный леджер, быстрый ввод (+опц. AI), базовая статистика.
- **Phase 2:** Metabase-дашборды, фото-чеки (vision), голос, импорт выписок, напоминания и бэкапы через n8n.
- **Phase 3:** инвестиции и доходность — Ghostfolio, единый net worth.
- **Phase 4:** семья — общие/личные траты, видимость, процентные конверты, балансы справедливости.
- **Phase 5:** скрытые операции с авто-раскрытием + нативное приложение (Expo).
