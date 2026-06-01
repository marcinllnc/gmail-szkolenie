#!/bin/bash
set -e

APP_NAME="gmail-szkolenie"
COMPOSE_FILE="docker-compose.yml"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

info()    { echo -e "${GREEN}[${APP_NAME}]${NC} $1"; }
warn()    { echo -e "${YELLOW}[${APP_NAME}]${NC} $1"; }
error()   { echo -e "${RED}[${APP_NAME}]${NC} $1"; exit 1; }

cd "$(dirname "$0")"

case "${1:-help}" in

  start)
    info "Buduję i uruchamiam..."
    docker compose -f "$COMPOSE_FILE" up -d --build
    info "Gotowe. Kontener: $(docker compose -f "$COMPOSE_FILE" ps -q app)"
    ;;

  stop)
    info "Zatrzymuję..."
    docker compose -f "$COMPOSE_FILE" down
    info "Zatrzymano."
    ;;

  restart)
    info "Restartuję..."
    docker compose -f "$COMPOSE_FILE" restart
    info "Zrestartowano."
    ;;

  build)
    info "Przebudowuję obraz (no-cache)..."
    docker compose -f "$COMPOSE_FILE" build --no-cache
    info "Build gotowy."
    ;;

  logs)
    docker compose -f "$COMPOSE_FILE" logs -f --tail=100
    ;;

  status)
    docker compose -f "$COMPOSE_FILE" ps
    ;;

  update)
    info "Pull + rebuild + restart..."
    git pull
    docker compose -f "$COMPOSE_FILE" up -d --build
    info "Zaktualizowano."
    ;;

  help|*)
    echo ""
    echo "Użycie: ./manage.sh <komenda>"
    echo ""
    echo "  start    – zbuduj obraz i uruchom kontener"
    echo "  stop     – zatrzymaj kontener"
    echo "  restart  – zrestartuj kontener"
    echo "  build    – przebuduj obraz od zera (no-cache)"
    echo "  logs     – logi na żywo"
    echo "  status   – status kontenera"
    echo "  update   – git pull + rebuild + restart"
    echo ""
    ;;

esac
