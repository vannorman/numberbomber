import json
import uuid
import urllib
import datetime
import re 
import requests # for setting cookies
from numberbomber import settings
from django.shortcuts import render
from django.http import HttpResponseRedirect, HttpResponse
from django.views.generic.base import RedirectView
from django.utils import timezone
from django.contrib import auth
#from django.forms.util import ErrorList
from django.template.context import RequestContext
from django.shortcuts import render
from django.shortcuts import render, redirect, render
from django.contrib.auth import logout as auth_logout
from django.contrib.auth.decorators import login_required

from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse

import markdown
md = markdown.Markdown()

#import requests

from numberbomber.util import *
def simple_page(template):
    def handler(request):
        return renderWithNav(request, template)
    return handler

def blog_base(request):
    return blog(request,None)

   
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
    if request.method == "POST":

#        s = str(dict(request.POST.lists()))
        sid = request.POST.get('id')
        data = request.POST.get('session')
        f = open(settings.STATIC_ROOT+"/analytics/session_"+str(sid)+".txt","w")
        f.write(data)
        f.close()
        return JsonResponse({"success":True})

