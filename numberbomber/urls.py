from django.conf.urls import *

import numberbomber.views

urlpatterns = [
    # Examples:
    # url(r'^$', 'numberbomber.views.home', name='home'),
    # url(r'^blog/', include('blog.urls')),

	url(r'^$', numberbomber.views.home),
    url(r'^track_session/?$', numberbomber.views.track_session), 

	url(r'^address/$', numberbomber.views.simple_page('address.html')), 
#	url(r'^blog/(.*)$', numberbomber.views.blog), 

]
