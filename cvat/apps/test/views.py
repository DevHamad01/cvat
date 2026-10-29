# Copyright (C) CVAT.ai Corporation
#
# SPDX-License-Identifier: MIT

from django.db.models import Count
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from cvat.apps.engine.models import LabeledShape, Task
from cvat.apps.engine.permissions import TaskPermission


class AnnotationCountViewSet(viewsets.GenericViewSet):
    queryset = Task.objects.all()
    filter_backends = []
    pagination_class = None
    iam_permission_class = TaskPermission

    # The action is named "annotations" because TaskPermission maps
    # ("annotations", "GET") to the view:annotations scope.
    @action(detail=True, methods=["GET"], url_path="annotation-counts")
    def annotations(self, request, pk=None):
        task = self.get_object()  # runs the object-level permission check
        rows = (
            LabeledShape.objects.filter(job__segment__task_id=task.id, parent__isnull=True)
            .values("label__name")
            .annotate(count=Count("id"))
            .order_by("-count", "label__name")
        )
        counts = [{"label": r["label__name"], "count": r["count"]} for r in rows]
        total = sum(c["count"] for c in counts)
        return Response({"task_id": task.id, "total": total, "counts": counts})
