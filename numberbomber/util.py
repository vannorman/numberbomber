#TODO https://github.com/sdispater/pendulum -- python datetimes made easy

import sys
import json
import threading
import datetime
import uuid
import traceback
import time
import random
import urllib

from django.db.models.base import ObjectDoesNotExist
from itertools import chain
from django.core.mail import send_mail
from django.http import HttpResponseRedirect, HttpResponse, JsonResponse
from django.contrib.auth.decorators import login_required
from django.shortcuts import render
from django.forms.models import model_to_dict
from django.middleware import csrf
from django.conf import settings
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt
from django.utils import timezone
from django.utils.encoding import smart_str

from numberbomber.models import *
from numberbomber.forms import *

def alphaencode(number, alphabet='123456789ABCDEFGHJKLMNPRTUVWXYZabcdefghjkmnopqrstuvwxyz'):
	code = ''
	if 0 <= number < len(alphabet):
		return alphabet[number]
	while number != 0:
		number, i = divmod(number, len(alphabet))
		code = alphabet[i] + code
	return code

def client_post(view):
	return csrf_exempt(require_http_methods(['POST'])(view))

def client_get(view):
	return csrf_exempt(require_http_methods(['GET'])(view))

def get_or_create_csrf_token(request):
	token = request.META.get('CSRF_COOKIE', None)
	if token is None:
		token = csrf._get_new_csrf_string()
		request.META['CSRF_COOKIE'] = token
	request.META['CSRF_COOKIE_USED'] = True
	return token

def json_response(obj):
	try:
		if obj['success'] == False:
			del obj['success']
	except KeyError:
		pass
	return JsonResponse(obj) 


def get_client_ip(request):
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[-1].strip()
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip

def renderWithNav(request, template, obj = None, cookies = None):
	if obj is None:
		obj = {}	
	obj['safari'] = False
#	if not valid_browser(request):
#		obj['safari'] = True # Strictly here to know whether or not to render the mp4 first or the webm first, since Safari is too retarded
	obj["csrf"] = get_or_create_csrf_token(request)
	obj["version"] =  "?" + str(time.time())
	response = render(request, template, obj)
	return response

def serve_file(request, file, **kwargs):
	"""Serves files by redirecting to file.url (e.g., useful for Amazon S3)"""
	return HttpResponseRedirect(smart_str(file.url))


class EmailThread(threading.Thread):
	def __init__(self, subject, body, from_email, recipients):
		self.subject = subject
		self.body = body
		self.from_email = from_email
		self.recipients = recipients
		threading.Thread.__init__(self)

	def run(self):
		if 'SES' in settings.EMAIL_BACKEND:
			time.sleep(random.randint(0, 60))
		try:
			send_mail(self.subject, self.body, self.from_email, self.recipients)
		except Exception as e:
			pass
#			print str(timezone.now()) + " : Email sending failed to " + str(self.recipients)
#			print e

def emailtest():
	boto.set_stream_logger('boto')

	# Potential BOTO problem if you get "404" somewhere before "no authenticator found" -- boto needs to find its ~/.boto config file, but django can't see ~/ folder here. Solution: Put boto [Credentials] into /etc/boto.cfg, which Django can find.
	send_mail('s2','m2','robot@numberbomber.com',['ccnumberbomber@gmail.com'])



def send_mail_threaded(subject, body, fr, to):
	if not on_production_server(): return	
	rse = RobotSentEmail(email=to[0], title=subject, content=body, time=timezone.now())
	rse.save()
	# subject = "["+settings.SERVER_ROOT+"] " + subject
	EmailThread(subject, body, fr, to).start()


def valid_browser(request):
	if 'HTTP_USER_AGENT' in request.META:
		if 'Chrome' not in request.META['HTTP_USER_AGENT'] and 'Firefox' not in request.META['HTTP_USER_AGENT']:
			return False
		else:
			return True
	else:
		return False	


