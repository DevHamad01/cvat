# Copyright (C) CVAT.ai Corporation
#
# SPDX-License-Identifier: MIT

import asyncio
import json
import re
from http.cookies import SimpleCookie

from asgiref.sync import sync_to_async
from django.conf import settings
from django.contrib.auth import SESSION_KEY, get_user_model
from django.contrib.sessions.backends.db import SessionStore
from django.db.models import Count

from cvat.apps.engine.models import LabeledShape, Task

PATH_PATTERN = re.compile(r"^/api/test/ws/tasks/(?P<task_id>\d+)/annotation-counts$")
POLL_SECONDS = 2
CLOSE_UNAUTHORIZED = 4401
CLOSE_NOT_FOUND = 4404


def _authorize(cookie_header: str, task_id: int) -> int | None:
    """Returns a close code if the connection must be refused, otherwise None."""
    morsel = SimpleCookie(cookie_header).get(settings.SESSION_COOKIE_NAME)
    if morsel is None:
        return CLOSE_UNAUTHORIZED

    user_id = SessionStore(session_key=morsel.value).get(SESSION_KEY)
    if user_id is None or not get_user_model().objects.filter(pk=user_id, is_active=True).exists():
        return CLOSE_UNAUTHORIZED

    if not Task.objects.filter(pk=task_id).exists():
        return CLOSE_NOT_FOUND

    return None


def _snapshot(task_id: int) -> list:
    return list(
        LabeledShape.objects.filter(job__segment__task_id=task_id, parent__isnull=True)
        .values_list("label__name")
        .annotate(count=Count("id"))
        .order_by("label__name")
    )


async def websocket_application(scope, receive, send):
    match = PATH_PATTERN.match(scope["path"])
    await receive()  # websocket.connect
    if match is None:
        await send({"type": "websocket.close", "code": CLOSE_NOT_FOUND})
        return

    task_id = int(match["task_id"])
    cookie_header = dict(scope["headers"]).get(b"cookie", b"").decode()
    close_code = await sync_to_async(_authorize)(cookie_header, task_id)
    if close_code is not None:
        await send({"type": "websocket.close", "code": close_code})
        return

    await send({"type": "websocket.accept"})
    last = await sync_to_async(_snapshot)(task_id)
    incoming = asyncio.ensure_future(receive())
    try:
        while True:
            done, _ = await asyncio.wait({incoming}, timeout=POLL_SECONDS)
            if done:
                if incoming.result()["type"] == "websocket.disconnect":
                    return
                incoming = asyncio.ensure_future(receive())

            current = await sync_to_async(_snapshot)(task_id)
            if current != last:
                last = current
                await send({"type": "websocket.send", "text": json.dumps({"changed": True})})
    finally:
        incoming.cancel()
