import math

from django.contrib.auth.models import User
from django.db import models
from django.utils import timezone
from django.db.models.signals import pre_save, post_save
from django.dispatch import receiver
from django.template.defaultfilters import slugify
import datetime



