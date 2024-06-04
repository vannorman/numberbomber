from django.conf.urls import *
from django.urls import include, re_path


import numberspark.views

urlpatterns = [
    # Examples:
    # url(r'^$', 'numberspark.views.home', name='home'),
    # url(r'^blog/', include('blog.re_paths')),

	re_path(r'^$', numberspark.views.home),
    re_path(r'^track_session/?$', numberspark.views.track_session), 
    re_path(r'^get_settings/?$', numberspark.views.get_settings), 
    re_path(r'^save_settings/?$', numberspark.views.save_settings), 
    re_path(r'^save_score/?$', numberspark.views.save_score), 
    re_path(r'^get_scores/?$', numberspark.views.get_scores), 

	re_path(r'^address/$', numberspark.views.simple_page('address.html')), 
	re_path(r'^anim/?$', numberspark.views.simple_page('anim.html')), 
	re_path(r'^anim2/?$', numberspark.views.simple_page('anim2.html')), 
	re_path(r'^anim3/?$', numberspark.views.simple_page('anim3.html')), 
#	url(r'^blog/(.*)$', numberspark.views.blog), 

]
