# Definition of Done

Written before any code (first version in commit 5b68cd1e9). Ticked at the end,
each line with evidence. A box without evidence counts as unticked.

## Floor
- [x] Endpoint returns per-class counts for a task, read from the database.
      Evidence: `/api/test/tasks/1/annotation-counts` returns total 8109; SQL gives
      person 2499, chair 466, car 416, identical to the API (psql GROUP BY query).
- [x] Page in the web UI calls the endpoint.
      Evidence: `/tasks/1/annotation-counts` on the dev server shows the data
      (cvat-ui/src/components/annotation-counts-page/annotation-counts-page.tsx).
- [x] Counts are shown as a graph.
      Evidence: horizontal bar chart with 79 classes, screenshot taken 00:08.
- [x] Empty case handled.
      Evidence: task 2 (`empty-test`) shows the empty message.
- [x] Failed request handled.
      Evidence: `/tasks/999/annotation-counts` shows an error alert with a Retry button
      (status 404).

## Auth
- [x] Request without login is refused. Evidence: 401, docs/evidence-auth.md.
- [x] User without access to the task is refused. Evidence: user `outsider` gets 403,
      docs/evidence-auth.md.

## Objective and extras
- [x] MO-1 measured 5 times. Evidence: docs/mo1-raw.txt, median 52.5 ms.
- [x] Target met (300 ms). Note: the target was too loose to be informative.
- [x] One filter added: shape type (all, polygon, mask). Evidence: mask 87, polygon 8022,
      all 8109; unknown type returns 400. Reason: the sample data contains exactly these
      two types, and masks are the COCO crowd regions.
- [x] Decision record written in docs/plan.md.

## Not tested
- [x] Task list item 8: live update over WebSocket. Evidence: with the page open, adding and removing a rectangle in task 2 each produced a `{"changed": true}` message and the graph updated without a reload (DevTools, Network, Socket).
- [x] Task list item 9: reconnect after a dropped connection. Evidence: after `docker restart cvat_server` the page opened a new socket (status 101) by itself, and the next add and remove updated the graph.
- The page was not checked against a task with tracks or tags; a task with more than a few
  thousand shapes; the page when served by the production UI image (only the webpack
  dev server on port 3000 was used, since the UI image was not rebuilt).

## Known limits of the WebSocket
- The socket only sends a change signal; the data is fetched again over HTTP, which keeps the 401 and 403 checks.
- The socket checks that the user is logged in and the task exists, but not task-level access (OPA). A logged-in user without access can learn that counts changed, not the counts.
- The server polls the database every 2 seconds, so an update arrives within about 2 to 4 seconds.
- Only the webpack dev server on port 3000 was used. Its console shows CVAT's own POST /api/events 403 errors (CSRF on another origin), unrelated to this feature.

## Housekeeping
- [x] No dead code, no commented-out blocks, no stray files in the diff. Evidence: `git diff --stat 4a09e27ff..HEAD` lists 14 files, all intended; no Python line over 100 characters.
- [x] PR is opened inside my own fork, not against cvat-ai/cvat. Evidence: https://github.com/DevHamad01/cvat/pull/1
- [ ] Loom is 5 minutes or less and answers K1 to K4.
