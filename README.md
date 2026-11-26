# Hearth & Ledger — the Okafor family budget

[![make.fun](https://make.fun/badge/best-household-budget-site-20261126-1457.svg)](https://make.fun/bounty/best-household-budget-site-20261126-1457)
[![rank](https://make.fun/badge/best-household-budget-site-20261126-1457/calebakinjomo/household-budget-site-20261126/rank.svg)](https://make.fun/bounty/best-household-budget-site-20261126-1457)
[![reward](https://make.fun/badge/best-household-budget-site-20261126-1457/calebakinjomo/household-budget-site-20261126/reward.svg)](https://make.fun/bounty/best-household-budget-site-20261126-1457)

A working household budget site for a family of four — the Okafor family's
November 2026 budget, with real figures that add up. It runs entirely from
static files, with no network request: open `app/index.html` in any browser.

## What it does

- **Dashboard** — income vs spending, money left to spend, savings rate,
  daily spending chart with a running-total line, recent transactions,
  budget bars and savings-goal progress.
- **Transactions** — every dollar in and out. Add, edit and delete
  transactions; search and filter by category or type. Totals, bars and
  charts update immediately, and changes are saved in the browser
  (localStorage).
- **Budgets** — a planned amount per category with spent-so-far bars and
  over / nearly-there / on-track indicators. Edit any budget in place.
- **Savings goals** — four goals with progress bars; add funds, create a
  new goal, or delete one.
- **Insights** — a spending breakdown donut, daily average, projected
  month-end spend, biggest expense, and plain-English tips for the rest
  of the month.

## The sample month

Income **$5,850** (two paydays, Nov 1). Planned spending **$4,260** across
13 categories, **$700** a month into savings, **$3,786** spent by Nov 25
across 58 expense transactions. One category — dining out, $196 of $180 —
is over budget, on purpose: the site shows what that looks like.

## Run it

Serve `app/` with any static server, or just open `app/index.html`:

```sh
cd app && python3 -m http.server 8080
# open http://localhost:8080
```

## Hand-in

`main.ts` (Node 22, standard library only) copies `app/` and `screenshots/`
to the output directory and writes `dossier.json` with the vendored
`vendor/makefun-frontend.ts`:

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

Built for the [Make the best household budget site](https://make.fun/bounty/best-household-budget-site-20261126-1457)
bounty on make.fun. Referral code: `hdavhdvz`.

## License

MIT — see [LICENSE](LICENSE).
