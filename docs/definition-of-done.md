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

## Not done
- [ ] Task list item 8: live update over WebSocket. Not started.
- [ ] Task list item 9: reconnect after a dropped connection. Not started.
  Reason: time went to setup problems (disk full, Docker crash) and to items 1 to 7.
- Not tested: the page against a task with tracks or tags; a task with more than a few
  thousand shapes; the page when served by the production UI image (only the webpack
  dev server on port 3000 was used, since the UI image was not rebuilt).

## Housekeeping
- [ ] No dead code, no commented-out blocks, no stray files in the diff.
- [ ] PR is opened inside my own fork, not against cvat-ai/cvat.
- [ ] Loom is 5 minutes or less and answers K1 to K4.
