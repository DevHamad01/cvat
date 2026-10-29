# Copyright (C) CVAT.ai Corporation
#
# SPDX-License-Identifier: MIT

from django.db.models import Count
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response

from cvat.apps.engine.models import LabeledShape, ShapeType, Task
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
        shapes = LabeledShape.objects.filter(job__segment__task_id=task.id, parent__isnull=True)
        shape_type = request.query_params.get("type")
        if shape_type is not None:
            if shape_type not in [c[0] for c in ShapeType.choices()]:
                raise ValidationError(f"Unknown shape type: {shape_type}")
            shapes = shapes.filter(type=shape_type)
        rows = (
            shapes.values("label__name")
            .annotate(count=Count("id"))
            .order_by("-count", "label__name")
        )
        counts = [{"label": r["label__name"], "count": r["count"]} for r in rows]
        total = sum(c["count"] for c in counts)
        return Response(
            {"task_id": task.id, "type": shape_type, "total": total, "counts": counts}
        )
