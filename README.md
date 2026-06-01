# Gmail Mastery Simulator

Interaktywna aplikacja szkoleniowa symulująca interfejs Gmaila. Uczy zaawansowanych funkcji poprzez praktyczne zadania z walidacją w czasie rzeczywistym.

## Moduły szkoleniowe

| Moduł | Zadania |
|---|---|
| 1. Zarządzanie szumem | Archiwizacja masowa, duże załączniki |
| 2. Zaawansowane wyszukiwanie | `from:`, `subject:`, `filename:`, `OR`, negacja, `older_than:`, przedział dat, domena, zakres rozmiaru, kombajn |
| 3. Organizacja | Gwiazdki, etykiety, snooze, wyciszanie wątków |
| 4. Automatyzacja | Filtry, auto-responder, stopka e-mail |
| 5. Power User | Szablony odpowiedzi, skróty klawiszowe |

## Szybki start (Docker)

```bash
./manage.sh start
```

Aplikacja dostępna pod adresem skonfigurowanym w reverse proxy (domyślnie port `3000`).

## Zarządzanie

```bash
./manage.sh start     # Zbuduj i uruchom
./manage.sh stop      # Zatrzymaj
./manage.sh restart   # Restart
./manage.sh logs      # Logi na żywo
./manage.sh build     # Przebuduj obraz
./manage.sh status    # Status kontenera
```

## Wymagania

- Docker 24+
- Docker Compose v2

## Stos technologiczny

- **Frontend:** Next.js 15, React 19, Tailwind CSS 3
- **Deployment:** Docker (multi-stage build, standalone output)
- **Port:** 3000
