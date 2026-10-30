# Copyright (C) CVAT.ai Corporation
#
# SPDX-License-Identifier: MIT

from rest_framework import routers

from .views import AnnotationCountViewSet

router = routers.SimpleRouter(trailing_slash=False)
router.register("tasks", AnnotationCountViewSet, basename="test-tasks")

urlpatterns = router.urls
