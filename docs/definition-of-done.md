# Definition of Done

Written before any code. Boxes are ticked at the end, each with evidence
(a number, a command output or a link). A box without evidence counts as unticked.

## Floor
- [ ] Endpoint returns per-class counts for a task, read from the database.
      Evidence: sum of counts equals 8109 for task 1; per-class numbers match SQL.
- [ ] Page in the web UI calls the endpoint.
- [ ] Counts are shown as a graph.
- [ ] Empty case (task with no annotations) handled.
- [ ] Failed request handled (error message shown).

## Auth
- [ ] Request without login is refused (expected 401). Evidence: curl output.
- [ ] User without access to the task is refused (expected 403). Evidence: curl output.

## Objective and extras
- [ ] Speed objective MO-1 measured 5 times, median and spread reported,
      raw output saved in docs/.
- [ ] Target met, or missed with the reason written down.
- [ ] One filter or grouping added (shape type), with the reason for choosing it.
- [ ] Decision record written in the Plan (approach taken, rejected, cost).

## Honesty
- [ ] Everything not finished is listed, with the reason (WebSocket live update
      and reconnect are planned as skipped).
- [ ] No dead code, no commented-out blocks, no stray files in the diff.
- [ ] PR is opened inside my own fork, not against cvat-ai/cvat.
- [ ] Loom is 5 minutes or less and answers K1 to K4.