# Plan: Annotation Analytics

Started: 29 Oct 2026, 23:12 (Asia/Karachi)
Deadline: 30 Oct 2026, 07:12 (8 h after the acknowledgement email)
Base commit: 4a09e27ff869b7aebbfdb07b29c4a34904a0221d

## Goal
Per-class annotation counts for a CVAT task: API endpoint, page, graph.

## Order and time budget (8 h)
1. Docs: plan, definition of done, objectives (45 min)
2. Django app `test`, mounted into the running server (40 min)
3. Endpoint: count LabeledShape rows per label for a task (45 min)
4. Auth: 401 without login, 403 without task access (60 min)
5. Frontend page, route, API call (60 min)
6. Graph, empty state, error state (60 min)
7. Filter by shape type (30 min)
8. Speed measurement, 5 runs (40 min)
9. Final docs, decision record, PR (40 min)
10. Loom recording (60 min)

## Decisions made before starting
- "Annotation" = one LabeledShape row. Tracks and tags are not counted
  (the sample task has none).
- Sample data: 1000 COCO val2017 images, 80 labels, 8109 shapes
  (8022 polygon, 87 mask), read from the database.
- Backend: mount the `test` app and two settings files into the stock
  image instead of rebuilding it (disk is limited).
- Frontend: webpack dev server on port 3000, proxying to 8080.

## Skipping
- Items 8 and 9 of the task list (WebSocket live update and reconnect)
  are skipped. Reason: the time budget is used up by items 1-7 and 10.
  Revisit only if time remains.