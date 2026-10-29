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
## Changes to the plan (written during the work)
- Item 7 (shape type filter) was done before the speed measurement; the order of
  steps 7 and 8 above was swapped. Reason: the filter was quick and the measurement
  is more meaningful once the endpoint is final.
- The task list items 8 and 9 (WebSocket) are still not done. See "Not done" in
  docs/definition-of-done.md.

## Decision record

### 1. How custom backend code reaches the running server
- Taken: mount `cvat/apps/test`, `cvat/settings/base.py` and `cvat/urls.py` into the
  stock `cvat_server` container with `docker-compose.override.yml`.
- Rejected: building the server image from source with `docker-compose.dev.yml`.
- Cost of rejecting: the container now depends on the stock image matching my
  checkout. I checked that `base.py` and `urls.py` were identical (diff printed SAME),
  but a different image version could break the mounted files. The mount also lives in
  an override file that CVAT's `.gitignore` ignores, so it had to be added with `git add -f`.
- Why rejected: an earlier build filled the drive (SIGBUS) and each backend change
  would have meant a rebuild of 15 minutes or more.

### 2. How the endpoint is authorized
- Taken: a ViewSet with `iam_permission_class = TaskPermission` and an action named
  `annotations`, so CVAT maps `("annotations", "GET")` to the `view:annotations` scope.
  The 401 and 403 come from CVAT's own authentication and OPA check.
- Rejected: editing the permission map in `cvat/apps/engine/permissions.py` to add my
  own action name.
- Cost of rejecting: the action name is tied to CVAT's existing mapping, so renaming
  it would break authorization. A plain `APIView` was tried first and failed with a 500
  because CVAT's permission class needs `view.detail`.

### 3. What counts as an annotation
- Taken: one `LabeledShape` row with no parent (`parent IS NULL`), grouped by label name.
- Rejected: also counting tracks (`LabeledTrack`) and tags (`LabeledImage`).
- Cost of rejecting: tasks that use tracks or tags would be under-counted. The sample
  task has neither.
- Note: the total is 8109 shapes (8022 polygons and 87 masks), not the 7204 COCO
  annotations, because a COCO annotation with several polygon pieces becomes several shapes.

### 4. How the graph is drawn
- Taken: `chart.js` and `react-chartjs-2`, which were already dependencies of cvat-ui.
- Rejected: adding a new chart library.
- Cost of rejecting: less styling freedom; bars show no count labels.
