from django.conf.urls import *

import numberbomber.views

urlpatterns = [
    # Examples:
    # url(r'^$', 'numberbomber.views.home', name='home'),
    # url(r'^blog/', include('blog.urls')),

	url(r'^$', numberbomber.views.home),
    url(r'^track_session/?$', numberbomber.views.track_session), 
    url(r'^get_settings/?$', numberbomber.views.get_settings), 
    url(r'^save_settings/?$', numberbomber.views.save_settings), 

	url(r'^address/$', numberbomber.views.simple_page('address.html')), 
	url(r'^anim/?$', numberbomber.views.simple_page('anim.html')), 
	url(r'^anim2/?$', numberbomber.views.simple_page('anim2.html')), 
	url(r'^anim3/?$', numberbomber.views.simple_page('anim3.html')), 
#	url(r'^blog/(.*)$', numberbomber.views.blog), 

]
