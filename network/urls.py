
from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),


    # API Routes 
    path("new_post", views.new_post, name="new_post"),
    path("posts", views.posts, name="posts"),
    path("post/<int:post_id>", views.load_new_post, name="load_new_post"),
    path("profile/<str:user>", views.profile, name="profile"),
]
