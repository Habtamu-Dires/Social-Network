
from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),

    # API Routes
    path("add_post", views.add_post, name="add_post"),
    path("posts", views.posts, name='posts'),
    path("profile_page/<int:user_id>", views.profile_page, name="profile_page"),
    path("follow/<int:user_id>",views.follow, name='follow'),
    path("following", views.following, name='following'),
    path("single_post/<int:post_id>", views.single_post, name="single_post"),
    path("like_post/<int:post_id>", views.like_post, name="like_post"),
]
