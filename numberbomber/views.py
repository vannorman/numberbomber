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

def track_session(request):
    if request.method == "POST": #and request.headers.get("contentType": "application/json"):
        sid = request.POST.get('id')
        
        f = open(settings.STATICFILES_DIRS[0]+"/analytics/session_"+str(sid)+".txt","w")
        ip = get_client_ip(request)

        os.environ['TZ'] = 'US/Central'
        time.tzset()
        thetime = time.strftime('%X %x %Z')

        session = request.POST.get('session') 
        # print("TRACK SESSION . LOADS:"+str(json.loads(session)))
        content = {
            'time' : thetime,
            'ip' : ip,
            'session' : json.loads(session),
        }

        f.write(json.dumps(content))
        f.close()
        return JsonResponse({"success":True})

def get_settings(request):
    if request.method == "POST": #and request.headers.get("contentType": "application/json"):
        ip = get_client_ip(request)
        path =  settings.STATICFILES_DIRS[0]+"/user_settings/"+str(get_client_ip(request)+".settings.txt")
        success = False
        data = {"success":False}
        if os.path.isfile(path):
            f = open(path)
            data = json.load(f)
              
            f.close()
            success = True
        return JsonResponse({
            'success':success,
            'data':json.dumps(data)
            })

def save_settings(request):
    if request.method == "POST": #and request.headers.get("contentType": "application/json"):
        # print("SAVE settings ???") 
        ip = get_client_ip(request)
        path =  settings.STATICFILES_DIRS[0]+"/user_settings/"+str(get_client_ip(request)+".settings.txt")
        f = open(path,"w+")
        user_settings = request.POST.get('settings') 
        # print("user settings:"+user_settings)
        f.write(user_settings)
        f.close()
        success=True
        return JsonResponse({
            'success':success,
            'data':user_settings
        })

def set_settings(request):
    if request.method == "POST": #and request.headers.get("contentType": "application/json"):
        session = request.POST.get('session') 
        
        # if settings file for this user exists (ip.settings.txt) ... e.g. 127.0.0.1.settings.txt
        ip = get_client_ip(request)
        # print(str(ip))
        path =  settings.STATICFILES_DIRS[0]+"/user_settings/"+str(get_client_ip(request)+".settings.txt")
        success = False
        data = {"a":"a"}
        if os.path.isfile(path):
            f = open(path)
            data = json.load(f)
              
            f.close()
            success = True
        return JsonResponse({
            'success':success,
            'data':json.dumps(data)
            })

