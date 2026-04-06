#!/usr/bin/env bash
# =============================================================================
# start-autonomous.sh — B2B Intelligence Site Autonomous Agent Loops
# 
# Four loops:
#   1. regulatory-crawler   — every 6 hours, 24/7
#   2. brief-generator      — every Monday 06:00 UTC
#   3. content-updater      — every Tuesday 08:00 UTC (after brief)
#   4. seo-monitor          — every Friday 09:00 UTC
#
# Prerequisites:
#   - Claude Code CLI installed and authenticated
#   - PROJECT_DIR env var set, or run from project root
#   - .env.local exists with UPSTASH_REDIS_REST_URL, RESEND_API_KEY, CRON_SECRET
#
# Usage: bash autonomous/start-autonomous.sh
# Run from the project root directory.
# =============================================================================

set -euo pipefail

PROJECT_DIR="${PROJECT_DIR:-$(pwd)}"
LOG_DIR="$PROJECT_DIR/.ruflo/logs"
PID_DIR="$PROJECT_DIR/.ruflo/pids"

mkdir -p "$LOG_DIR" "$PID_DIR"

echo "[autonomous] Starting B2B intelligence site autonomous agents"
echo "[autonomous] Project: $PROJECT_DIR"
echo "[autonomous] Logs: $LOG_DIR"
echo ""

# =============================================================================
# LOOP 1: Regulatory Crawler — every 6 hours, 24/7
# Regulations don't sleep. Neither does the crawler.
# =============================================================================
run_regulatory_crawler() {
  while true; do
    local timestamp
    timestamp=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
    echo "[$timestamp] [crawler] Starting crawl cycle" >> "$LOG_DIR/crawler.log"
    
    claude --model claude-sonnet-4-5 --max-tokens 300 \
      "Read autonomous/agents/regulatory-crawler.md. Run one crawl cycle now. 
      Log changes to .ruflo/logs/crawler.log with timestamp prefix.
      Output: summary only — sources checked, changes found, errors (if any).
      Max 300 tokens." \
      >> "$LOG_DIR/crawler.log" 2>&1
    
    echo "[$timestamp] [crawler] Cycle complete. Sleeping 6 hours." >> "$LOG_DIR/crawler.log"
    sleep 21600  # 6 hours
  done
}

# =============================================================================
# LOOP 2: Brief Generator — every Monday 06:00 UTC
# Generates and sends the weekly intelligence brief.
# =============================================================================
run_brief_generator() {
  while true; do
    # Wait until next Monday 06:00 UTC
    local now_epoch now_dow seconds_until_monday next_monday_epoch
    now_epoch=$(date -u +%s)
    now_dow=$(date -u +%u)  # 1=Mon, 7=Sun
    
    # Seconds from now until next Monday 06:00 UTC
    local seconds_since_mon_start
    seconds_since_mon_start=$(( (now_dow - 1) * 86400 + $(date -u +%H) * 3600 + $(date -u +%M) * 60 + $(date -u +%S) ))
    local seconds_per_week=604800
    local monday_offset_seconds=$(( 6 * 3600 ))  # 06:00 UTC
    local seconds_until_next
    seconds_until_next=$(( seconds_per_week - seconds_since_mon_start + monday_offset_seconds ))
    # If it's already past Monday 06:00 this week, wait until next week
    if [ "$seconds_until_next" -gt "$seconds_per_week" ]; then
      seconds_until_next=$(( seconds_until_next - seconds_per_week ))
    fi
    
    echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] [brief] Sleeping ${seconds_until_next}s until next Monday 06:00 UTC" >> "$LOG_DIR/brief-generator.log"
    sleep "$seconds_until_next"
    
    local brief_date
    brief_date=$(date -u +"%Y-%m-%d")
    echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] [brief] Generating brief for $brief_date" >> "$LOG_DIR/brief-generator.log"
    
    claude --model claude-sonnet-4-5 --max-tokens 600 \
      "Read autonomous/agents/brief-generator.md. Generate this week's regulatory brief.
      Today's date: $brief_date. 
      Save brief to src/data/briefs/$brief_date.json.
      After saving, call POST /api/brief/send with body {\"briefDate\": \"$brief_date\"} using the CRON_SECRET from .env.local.
      Output: brief headline + recipient count + any errors." \
      >> "$LOG_DIR/brief-generator.log" 2>&1
    
    echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] [brief] Done. Sleeping until next Monday." >> "$LOG_DIR/brief-generator.log"
    sleep 3600  # sleep 1h then re-enter the loop to recalculate next Monday
  done
}

# =============================================================================
# LOOP 3: Content Updater — every Tuesday 08:00 UTC
# Updates jurisdiction pages and exchange data after the brief runs.
# =============================================================================
run_content_updater() {
  while true; do
    # Wait until next Tuesday 08:00 UTC
    local now_dow
    now_dow=$(date -u +%u)  # 2=Tue
    local seconds_since_tue_start
    seconds_since_tue_start=$(( (now_dow - 2) * 86400 + $(date -u +%H) * 3600 + $(date -u +%M) * 60 + $(date -u +%S) ))
    if [ "$seconds_since_tue_start" -lt 0 ]; then
      seconds_since_tue_start=$(( seconds_since_tue_start + 604800 ))
    fi
    local seconds_per_week=604800
    local tuesday_offset_seconds=$(( 8 * 3600 ))  # 08:00 UTC
    local seconds_until_next
    seconds_until_next=$(( seconds_per_week - seconds_since_tue_start + tuesday_offset_seconds ))
    if [ "$seconds_until_next" -gt "$seconds_per_week" ]; then
      seconds_until_next=$(( seconds_until_next - seconds_per_week ))
    fi
    
    echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] [content] Sleeping ${seconds_until_next}s until Tuesday 08:00 UTC" >> "$LOG_DIR/content-updater.log"
    sleep "$seconds_until_next"
    
    echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] [content] Starting content update" >> "$LOG_DIR/content-updater.log"
    
    claude --model claude-haiku-4-5 --max-tokens 200 \
      "Read autonomous/agents/content-updater.md.
      Update src/data/regulatory-status.json from latest regulatory-updates.json (past 7 days only).
      Check src/data/exchanges.json — flag any entries where lastVerified is >30 days ago.
      Update _meta.lastUpdated field in changed files.
      Output: files changed (list only). Max 200 tokens." \
      >> "$LOG_DIR/content-updater.log" 2>&1
    
    echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] [content] Done." >> "$LOG_DIR/content-updater.log"
    sleep 3600
  done
}

# =============================================================================
# LOOP 4: SEO Monitor — every Friday 09:00 UTC
# Tracks rankings and flags dropped pages.
# =============================================================================
run_seo_monitor() {
  while true; do
    # Wait until next Friday 09:00 UTC
    local now_dow
    now_dow=$(date -u +%u)  # 5=Fri
    local seconds_since_fri_start
    seconds_since_fri_start=$(( (now_dow - 5) * 86400 + $(date -u +%H) * 3600 + $(date -u +%M) * 60 + $(date -u +%S) ))
    if [ "$seconds_since_fri_start" -lt 0 ]; then
      seconds_since_fri_start=$(( seconds_since_fri_start + 604800 ))
    fi
    local seconds_per_week=604800
    local friday_offset_seconds=$(( 9 * 3600 ))  # 09:00 UTC
    local seconds_until_next
    seconds_until_next=$(( seconds_per_week - seconds_since_fri_start + friday_offset_seconds ))
    if [ "$seconds_until_next" -gt "$seconds_per_week" ]; then
      seconds_until_next=$(( seconds_until_next - seconds_per_week ))
    fi
    
    echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] [seo] Sleeping ${seconds_until_next}s until Friday 09:00 UTC" >> "$LOG_DIR/seo-monitor.log"
    sleep "$seconds_until_next"
    
    echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] [seo] Running SEO monitor" >> "$LOG_DIR/seo-monitor.log"
    
    claude --model claude-haiku-4-5 --max-tokens 300 \
      "Read autonomous/agents/seo-monitor.md.
      Check docs/growth/seo-strategy.md for tracked keywords.
      Log a weekly SEO status entry to .ruflo/logs/seo-monitor.log with format:
        - Date: [date]
        - Keywords to track: [list]
        - Action required: [any pages to update, content gaps to fill]
        - Next steps for content-seo agent
      Output summary only. Max 300 tokens." \
      >> "$LOG_DIR/seo-monitor.log" 2>&1
    
    echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] [seo] Done." >> "$LOG_DIR/seo-monitor.log"
    sleep 3600
  done
}

# =============================================================================
# PROCESS MANAGEMENT
# =============================================================================

cleanup() {
  echo ""
  echo "[autonomous] Shutting down all loops..."
  kill "${CRAWLER_PID:-}" "${BRIEF_PID:-}" "${CONTENT_PID:-}" "${SEO_PID:-}" 2>/dev/null || true
  echo "[autonomous] All loops stopped."
  exit 0
}

trap cleanup SIGINT SIGTERM

# Start all loops as background processes
run_regulatory_crawler &
CRAWLER_PID=$!
echo "[autonomous] Regulatory crawler started (PID: $CRAWLER_PID)"
echo "$CRAWLER_PID" > "$PID_DIR/crawler.pid"

run_brief_generator &
BRIEF_PID=$!
echo "[autonomous] Brief generator started (PID: $BRIEF_PID)"
echo "$BRIEF_PID" > "$PID_DIR/brief.pid"

run_content_updater &
CONTENT_PID=$!
echo "[autonomous] Content updater started (PID: $CONTENT_PID)"
echo "$CONTENT_PID" > "$PID_DIR/content.pid"

run_seo_monitor &
SEO_PID=$!
echo "[autonomous] SEO monitor started (PID: $SEO_PID)"
echo "$SEO_PID" > "$PID_DIR/seo.pid"

echo ""
echo "[autonomous] All loops running. Ctrl+C to stop."
echo "[autonomous] Logs: $LOG_DIR/"
echo ""

# Monitor loops — restart if a process dies unexpectedly
while true; do
  sleep 60
  for pid_file in "$PID_DIR"/*.pid; do
    pid=$(cat "$pid_file")
    if ! kill -0 "$pid" 2>/dev/null; then
      echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] [autonomous] Process $pid ($(basename "$pid_file")) died unexpectedly. Check logs." >> "$LOG_DIR/autonomous-monitor.log"
    fi
  done
done
