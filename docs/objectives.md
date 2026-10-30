# Objectives

## Machine
- CPU: Intel Core i5-8265U @ 1.60 GHz, 4 cores / 8 logical processors (Dell Latitude 3400)
- RAM: 15.9 GB (WSL limited to 10 GB by .wslconfig)
- OS: Windows 11 Pro, WSL2 Ubuntu, Docker Desktop
- CVAT commit: 4a09e27ff869b7aebbfdb07b29c4a34904a0221d

## MO-1
| Field | Entry |
|---|---|
| ID | MO-1 |
| What is measured | Server time to answer GET of the per-class count endpoint for task 1 (8109 shapes, 80 labels). |
| How | `curl -w '%{time_total}'` against http://localhost:8080 with a session cookie, 5 runs, raw output saved in docs/. |
| Target | Median of 5 runs at or below 300 ms. |
| Why this target | A single GROUP BY over about 8000 rows should be fast; 300 ms leaves room for the permission check (OPA call) and HTTP overhead. |
| Conditions | Local Docker stack, stock images with test app mounted, sample data (1000 COCO images), nothing else running, first request after restart discarded as warm-up. |
| Not included | Frontend rendering time, tasks with video, cold start. |

## MO-1 result
Measured 2026-10-30 00:32 (Asia/Karachi). Raw output: docs/mo1-raw.txt

| Run | Time (ms) |
|---|---|
| warm-up (discarded) | 55.5 |
| 1 | 56.1 |
| 2 | 51.3 |
| 3 | 53.7 |
| 4 | 52.5 |
| 5 | 52.3 |

- Median of 5 runs: 52.5 ms. Spread: 51.3 to 56.1 ms (range 4.8 ms).
- Target of 300 ms: met.
- Honest note: the target was set conservatively and cleared by a wide margin, so
  it says little about performance. With 8109 rows a single GROUP BY is cheap.
  A tighter target (about 100 ms) would have been more informative.
- Conditions differed slightly from the plan: the webpack dev server and several
  browser tabs were running during the measurement. Requests went through nginx,
  authentication and the OPA permission check; the figure is end-to-end server time.
