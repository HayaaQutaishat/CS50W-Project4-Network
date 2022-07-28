from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from django.shortcuts import render
from django.urls import reverse
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt
import json
from .models import User, Post, Profile
from django.core.paginator import Paginator

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
            profile = Profile.create(user=user)
            profile.save()
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
    return JsonResponse({"post_id": post.id }, status=201)


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
    # user's posts
    user_posts = Post.objects.filter(creator=user).order_by('-date')

    posts = []
    for i in range(len(user_posts)):
        posts.append({'id': user_posts[i].id, 'date': user_posts[i].date.strftime('%H:%M %d %b %Y'), 'post': user_posts[i].post})

    # profile of logged in user
    user_profile = Profile.objects.get(user=request.user)
    # user's following
    x = user_profile.following.all()
    following_status = user in user_profile.following.all()

    # num_followers = user.following.count()
    num_followers = 0
    num_following = 0
    logged_user = request.user

    for u in Profile.objects.all():
        if user in u.following.all():
            num_followers += 1

    return JsonResponse([user.serialize(), num_followers, num_following, posts, logged_user.serialize(), following_status], safe=False)
    


@login_required
@csrf_exempt
def follow(request, user):
    if request.method != 'POST':
        return JsonResponse({"error": "POST request required."}, status=400)
    data = json.loads(request.body)
    follow = data.get("follow")
    print(follow)
    
    # clicked in user
    user = User.objects.get(username=user)
    user_profile = Profile.objects.get(user=request.user)
   
    num_followers = user.following.count()
    if not follow:
        num_followers += 1
        user_profile.following.add(user)
        user_profile.save()
        # print(num_followers)

        # print("hi")

        return JsonResponse({'status': 201, 'action': "Follow"})
    elif follow:
        user_profile.following.remove(user)
        user_profile.save()
        return JsonResponse({'status': 201, 'action': "Unfollow"})
    return JsonResponse({}, status=404)


@login_required
def following_posts(request):
    # get profile of logged in user 
    profile = Profile.objects.get(user=request.user)
    # following of logged in user 
    users = [user for user in profile.following.all()]
    for u in users:
        posts = Post.objects.filter(creator=u)
    return JsonResponse([post.serialize() for post in posts], safe=False)


# @login_required
# def like_status(request):
#     if request.method == 'POST':
#         data = json.loads(request.body)
#         post_id = data.get("id")
#         post = Post.objects.get(id=post_id)
#         user = User.objects.get(username=request.user)
#         liked = False
#         if user in post.likes.all():
#             liked = True
#         return JsonResponse({'status': 201, 'liked': liked})

