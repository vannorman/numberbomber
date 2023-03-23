from functools import partial

from django import forms
from django.utils.safestring import mark_safe
from django.utils.translation import ugettext_lazy as _
from django.conf import settings

from django.contrib.auth.models import User
from django.forms import widgets
from django.utils.html import conditional_escape, format_html

from numberspark.models import *
from django.core.validators import RegexValidator
alphanumeric = RegexValidator(r'^[_\s0-9a-zA-Z]*$', 'Only alphanumeric characters are allowed.')

# from https://djangosnippets.org/snippets/1956/
# class HorizontalRadioRenderer(forms.RadioSelect.renderer):




