# Evidence: authentication and authorization (item 5)

Endpoint: GET /api/test/tasks/1/annotation-counts

## No login -> 401
$ curl -s -i http://localhost:8080/api/test/tasks/1/annotation-counts
HTTP/1.1 401 Unauthorized
{"detail":"Authentication credentials were not provided."}

## Logged in as `outsider` (normal user, no access to task 1) -> 403
$ curl -s -b /tmp/outsider.cookies -o /dev/null -w "outsider: %{http_code}\n" http://localhost:8080/api/test/tasks/1/annotation-counts
outsider: 403
{"detail":"You do not have permission to perform this action."}

## Logged in as `hamad` (superuser) -> 200, total 8109
Checked in the browser; the total equals the database count
(polygon 8022 + mask 87).
