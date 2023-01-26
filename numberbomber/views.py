import os
import time
import pytz
import logging
import json
#import uuid
#import urllib
#import datetime
#import re 
import requests # for setting cookies
from numberbomber import settings
#from django.http import HttpResponseRedirect, HttpResponse
#from django.views.generic.base import RedirectView
#from django.utils import timezone
#from django.contrib import auth
#from django.forms.util import ErrorList
#from django.template.context import RequestContext
#from django.shortcuts import render, redirect
#from django.contrib.auth import logout as auth_logout
#from django.contrib.auth.decorators import login_required


#oh lawd i have more includes than lines of code lol need to clean this up

from ipware import get_client_ip

from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
import subprocess


#import requests

from numberbomber.util import *
def simple_page(template):
    def handler(request):
        return renderWithNav(request, template)
    return handler
   
def home(request):
    obj = {}
    obj['works'] = []
    obj['works'].append({
        "title" : "Mathbreakers",
        "video" : { "source": "https://player.vimeo.com/video/73754523", "img" : "mb_1.jpg" },
        })
    return renderWithNav(request,'index.html', obj)

@csrf_exempt
def track_session(request):
    if request.method == "POST": #and request.headers.get("contentType": "application/json"):
        session = request.POST.get('session') 
        sid = request.POST.get('id')
        subprocess.Popen('echo "'+json.dumps(session)+'" >> /home/ubuntu/numberbomber.com/type2.txt',shell=True)
        
        f = open(settings.STATIC_ROOT+"/analytics/session_"+str(sid)+".txt","w")

#        subprocess.Popen('echo "'+str(type(data))+'" >> /home/ubuntu/numberbomber.com/type.txt',shell=True)
#        subprocess.Popen('echo "'+str(type(data2))+'" >> /home/ubuntu/numberbomber.com/type2.txt',shell=True)
        ip = get_client_ip(request)

        os.environ['TZ'] = 'US/Central'
        time.tzset()
        thetime = time.strftime('%X %x %Z')

        content = {
            'time' : thetime,
            'ip' : ip,
            'session' : json.loads(session),
        }

        f.write(json.dumps(content))
        f.close()
        return JsonResponse({"success":True})

