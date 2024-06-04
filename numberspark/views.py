import os
import time
import logging
import json
#import uuid
#import urllib
from datetime import datetime

#import re 
import requests # for setting cookies
from numberspark import settings
from django.views.decorators.cache import never_cache
from django.views.decorators.csrf import csrf_exempt


#oh lawd i have more includes than lines of code lol need to clean this up

from ipware import get_client_ip

from django.http import JsonResponse
import subprocess


#import requests

from numberspark.util import *
def simple_page(template):
    def handler(request):
        return renderWithNav(request, template)
    return handler

@never_cache
def home(request):
    obj = {}
    obj['works'] = []
    obj['works'].append({
        "title" : "Mathbreakers",
        "video" : { "source": "https://player.vimeo.com/video/73754523", "img" : "mb_1.jpg" },
        })
    return renderWithNav(request,'index.html', obj)


@csrf_exempt
def save_score(request):
    if request.method == "POST": #and request.headers.get("contentType": "application/json"):
        sid = request.POST.get('id')
        path = settings.STATICFILES_DIRS[0]+"/highscores/"
        if not os.path.exists(path):
            os.makedirs(path)
        now = datetime.datetime.now()
        today = now.strftime("%Y.%m.%d")
        f = open(path+today+".txt","a")
        ip = get_client_ip(request)

        score = request.POST.get('score') 
        print("score;"+score)
    
        f.write("\n"+score)
        f.close()
       
        integers = []
        with open(path+today+".txt","r") as file:
            for line in file:
                # Try to convert each line to an integer
                try:
                    integer = int(line.strip())
                    integers.append(integer)
                except ValueError:
                    # If conversion fails, skip the line
                    continue

        # Sort the integers from largest to smallest
        sorted_integers = sorted(integers, reverse=True)

        # Open the file in write mode and write the sorted integers
        with open(path+today+".txt","w") as file:
            for integer in sorted_integers:
                file.write(f"{integer}\n")

        return JsonResponse({"success":True})


@csrf_exempt
def get_scores(request):
    if request.method == "POST": #and request.headers.get("contentType": "application/json"):
        ip = get_client_ip(request)

        now = datetime.datetime.now()
        today = now.strftime("%Y.%m.%d")
        path = settings.STATICFILES_DIRS[0]+"/highscores/"+today+".txt"
        print("try open:"+path) 
        data = {"success":False,"scores":[]}
        if os.path.isfile(path):
            with open(path) as file:
                for line in file:
                    try: 
                        data['scores'].append(int(line.strip()))
                    except: print("fail line:"+str(line))
            file.close()
            success = True
        print("data:"+json.dumps(data))
        return JsonResponse({
            'success':success,
            'data':json.dumps(data)
            })

 

@csrf_exempt
def track_session(request):
    if request.method == "POST": #and request.headers.get("contentType": "application/json"):
        sid = request.POST.get('id')
        path =settings.STATICFILES_DIRS[0]+"/analytics/"
        if not os.path.exists(path):
            os.makedirs(path)
        f = open(path+"session_"+str(sid)+".txt","w")
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

@csrf_exempt
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

@csrf_exempt
def save_settings(request):
    if request.method == "POST": #and request.headers.get("contentType": "application/json"):
        # print("SAVE settings ???") 
        ip = get_client_ip(request)
        path =  settings.STATICFILES_DIRS[0]+"/user_settings/"+str(get_client_ip(request)+".settings.txt")
        print("path:"+path)
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

