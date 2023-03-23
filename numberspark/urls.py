from django.conf.urls import *

import numberspark.views

urlpatterns = [
    # Examples:
    # url(r'^$', 'numberspark.views.home', name='home'),
    # url(r'^blog/', include('blog.urls')),

	url(r'^$', numberspark.views.home),
    url(r'^track_session/?$', numberspark.views.track_session), 
    url(r'^get_settings/?$', numberspark.views.get_settings), 
    url(r'^save_settings/?$', numberspark.views.save_settings), 

	url(r'^address/$', numberspark.views.simple_page('address.html')), 
	url(r'^anim/?$', numberspark.views.simple_page('anim.html')), 
	url(r'^anim2/?$', numberspark.views.simple_page('anim2.html')), 
	url(r'^anim3/?$', numberspark.views.simple_page('anim3.html')), 
#	url(r'^blog/(.*)$', numberspark.views.blog), 

]
