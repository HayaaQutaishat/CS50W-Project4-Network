from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from django.shortcuts import render
from django.urls import reverse
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt
import json
from .models import User, Post, Follow


def index(request):
    return render(request, "network/index.html")

def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "network/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "network/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "network/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "network/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "network/register.html")



def new_post(request):

    # adding a new post must be via POST
    if request.method != "POST":
        return JsonResponse({"error": "POST request required."}, status=400)

    # Check post content
    data = json.loads(request.body)

    # Get post content and creator, then save the post to db
    post = data.get("post", "")
    creator = request.user
    post = Post.create(post=post, creator=creator)
    post.save()
    return JsonResponse({"message": "Post added successfully."}, status=201)



def posts(request):
    # All posts
    posts = Post.objects.all().order_by('-date')
    return JsonResponse([post.serialize() for post in posts], safe=False)


def load_new_post(request, post_id):
    post = Post.objects.get(pk=post_id)
    return JsonResponse(post.serialize(), safe=False)


def profile(request, user):
    # clicked on user
    user = User.objects.get(username=user)
    user_posts = Post.objects.filter(creator=user).order_by('-date')

    posts = []
    for i in range(len(user_posts)):
        posts.append({'date': user_posts[i].date.strftime('%H:%M %d %b %Y'), 'post': user_posts[i].post})


    # user_profile = Follow.objects.get(user=request.user)
    # print(user_profile)
    # print("Hi")
    # following_status = user in user_profile.following.all()
    # followers = 0
    # for u in Profile.objects.all():
    #     if user in u.following.all():
    #         followers += 1
    
    num_followers = user.followers.count()
    num_following = user.followings.count()
    logged_user = request.user

    return JsonResponse([user.serialize(), num_followers, num_following, posts, logged_user.serialize()], safe=False)
    




# def profile(request, user):
#     user = User.objects.get(username=user)
#     user_posts = Post.objects.filter(creator=user).order_by('-date')
#     posts = []
#     for i in range(len(user_posts)):
#         posts.append({'date': user_posts[i].date.strftime('%H:%M %d %b %Y'), 'post': user_posts[i].post})
#     num_followers = user.followers.count()
#     num_following = user.followings.count()

#     return JsonResponse([user.serialize(),posts, num_followers, num_following], safe=False)
    
