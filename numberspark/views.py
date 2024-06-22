import os
import time
import logging
import json
import pytz
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
        ip = get_client_ip(request)
        geo = get_geo_ip(ip)
        save_score = True if request.POST.get('saveScore') == 'true' else False
        new_score = request.POST.get('score') 
        new_moves = request.POST.get('moves')
        date_offset = request.POST.get('dateOffset')
       # print("Moves 1;"+new_moves)
        path = settings.STATICFILES_DIRS[0]+"/highscores/"
        CST = pytz.timezone('US/Central')
        now = datetime.datetime.now(CST)
        now += datetime.timedelta(days=int(date_offset))
        today = now.strftime("%Y.%m.%d")
        if not os.path.exists(path):
            os.makedirs(path)
        
        score_file = path+today+".txt"
        scores = []
        if not os.path.exists(score_file):
            with open(score_file, 'w'): pass

        data = {"success":False,"scores":[]}
        with open(score_file,"r+") as file:

            # get all existing scores from the file
            for line in file:
                try:
                    score = line.strip().split(',')
                    integer = int(score[0])
                    yip = score[1] if len(score) > 1 else "Unknown3"
                    moves = score[2] if len(score) > 2 else "Unrecorded"
                    # print("moves:"+moves)
                    if (integer > 0): scores.append([integer,yip,moves])
                except ValueError:
#                    print("val err:"+str(line))
                    # This may happen if there is a non-integer line in the file. Skip
                    continue

            # get score from client
            if save_score == True:
                try:
                    if not 'e+' in str(new_score):
                        if int(new_score) > 0: 
                            # print("append score w moves:"+new_moves)
                            scores.append([int(new_score),ip,new_moves])  # add new score
                            # print('added '+str(new_score)+' to scores, len:'+str(len(scores)))
                    else:
                        e_score = new_score.split('e+') # in case score had exponent
                        int_score = int(float(e_score[0])*math.pow(10,int(e_score[1])))
                        # print("append2 score w moves:"+new_moves)
                        if int_score > 0: scores.append([int_score,ip,new_moves])

                except Exception as e: 
                    scores.append([-1,ip,moves])

            # print("scores:"+str(scores))
            sorted_scores = sorted(scores, key=lambda x: x[0], reverse=True)
            # print("sorted scores:"+str(scores))
#            for s in sorted_scores: print(str(s))
            file.seek(0) # Move the file pointer to the beginning to overwrite the content
#            print("writing "+str(len(integers))+" to file:"+str(integers)) 
            for score in sorted_scores:
                line = str(score[0]) +  ',' + str(score[1]) + ',' + str(score[2])
                file.write(f"{line}\n")

            # Truncate the file to the current position to remove old content
            file.truncate()
            file.seek(0)
            for line in file: 
                try: 
#                    print("Appending:"+line.strip())
                    data['scores'].append(line.strip())
                except: 
                    pass
#                    print("fail read scores line into get response:"+str(line))
            file.close()
            data['success'] = True
        
        data['user_ip'] = geo

        # before return data, check if data has ips, and if yes, don't return ips, instead return the geo name.
        for i in range(len(data['scores'])):
            item = data['scores'][i]
            cs = item.split(',')
            try:
                cs[1] = get_geo_ip(cs[1])
                data['scores'][i] = ','.join(cs)
            except:
                pass
        return JsonResponse({
            'success':True,
            'data':json.dumps(data)
            })


@csrf_exempt
def get_scores(request):
    if request.method == "POST": #and request.headers.get("contentType": "application/json"):
        ip = get_client_ip(request)

        now = datetime.datetime.now()
        today = now.strftime("%Y.%m.%d")
        path = settings.STATICFILES_DIRS[0]+"/highscores/"+today+".txt"
        # print("try open:"+path) 
        data = {"success":False,"scores":[]} # duplicate success
        if os.path.isfile(path):
            with open(path) as file:
                for line in file:
                    try: 
                        #.mprint("Appending:"+line.strip())
                        data['scores'].append(int(line.strip()))
                    except: 
                        # print("fail read scores line into get response:"+str(line))
                        pass
            file.close()
            success = True
        else: 
            success = False
#        print('jr:'+ip);
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
        # print("path:"+path)
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

def get_geo_ip(ip):
    # was it memoized?
    path = settings.STATICFILES_DIRS[0]+"/highscores/ip_lookup_table.csv"
    if not os.path.exists(path):
#        print('no ip lookup file, create it')
        with open(path, 'w'): pass
    else:
#        print('found ip table')
        with open(path, 'r') as file:
            for line in file:
#                print('comparing asked ip: '+ip+' to line: '+line)
                try: 
                    sline = line.strip().split(',')
                    ip2 = sline[0]
                    geo = sline[1]
                    if ip == ip2:
#                        print('match')
                        return geo
                except Exception as e: 
#                    print('except: '+str(e))
                    pass
    url = f"http://ip-api.com/json/{ip}"
    response = requests.get(url)
    data = response.json()
    geo = "Unknown2"
    if data['status'] == 'success':
        geo = data['city'] +' '+data['region']
    
    with open(path, 'a') as file:
        # print('saving:'+ip+','+geo)
        file.write(ip+','+geo+'\n')

    return geo
