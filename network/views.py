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
    print(data)

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


def profile(request, user):
    # clicked on user (test)
    user = User.objects.get(username=user)
    # user's posts
    user_posts = Post.objects.filter(creator=user).order_by('-date')

    posts = []
    for i in range(len(user_posts)):
        posts.append({'id': user_posts[i].id, 'date': user_posts[i].date.strftime('%H:%M %d %b %Y'), 'post': user_posts[i].post})

    # profile of logged in user (Haya)
    user_profile = Profile.objects.get(user=user)
    # user's following (xx = test's following) (yy = test's followers)
    xx =  user_profile.following.all()
    yy =  user_profile.follower.all()
    following_status = request.user in yy
    follower_status = request.user in xx
  
    # num_followers = user.following.count()
    num_followers = user_profile.follower.count()
    num_following = user_profile.following.count()
    logged_user = request.user

    # for u in Profile.objects.all():
    #     if user in u.following.all():
    #         num_followers += 1

    # for u in Profile.objects.all():
    #     if user in u.follower.all():
    #         num_following += 1

    return JsonResponse([user.serialize(), num_followers, num_following, posts, logged_user.serialize(), following_status, follower_status], safe=False)
    

@login_required
@csrf_exempt
def follow(request, username):
    if request.method != 'POST':
        return JsonResponse({"error": "POST request required."}, status=400)
    data = json.loads(request.body)
    following_status = data.get("following_status")
 
    # clicked in user (example)
    user_object = User.objects.get(username=username)

    followed_user = Profile.objects.get(user=user_object) 
    following_user = Profile.objects.get(user=request.user) 

    if following_status:
        following_user.following.remove(user_object)
        followed_user.follower.remove(request.user)   
        following_user.save()
        followed_user.save()
        return JsonResponse({'status': 201, 'action': "Unfollow"})
    else:
        following_user.following.add(user_object)
        followed_user.follower.add(request.user)   
        followed_user.save()
        following_user.save()
        return JsonResponse({'status': 201, 'action': "Follow"})

 
@login_required
def following_posts(request):
    # get profile of logged in user 
    profile = Profile.objects.get(user=request.user)
    # following of logged in user
    users = [user for user in profile.following.all()]
    for u in users:
        posts = Post.objects.filter(creator=u)
    return JsonResponse([post.serialize() for post in posts], safe=False)


def user_requesting(request):
    
    if str(request.user) != 'AnonymousUser':
        user = str(request.user)
    return JsonResponse({'user_requesting': user})


@login_required
def edit(request, post_id):
    if request.method == "POST":
        data = json.loads(request.body)
        # the value of new post after editing
        new_post = data.get("post", "")
        post = Post.objects.get(pk=post_id)
        # update the value of this post in DB, and save it
        post.post = new_post
        post.save()
        return JsonResponse({"data": data })

    else:
        return JsonResponse({"error": "POST request required."}, status=400)


def like_status(request):
    if request.method == "POST":
        data = json.loads(request.body)
        post_id = data.get("post_id", "")
        user = User.objects.get(username=request.user)
        post = Post.objects.get(id=post_id)

        like_status = False
        # if the logged_in user is already liked this post then << like_status=True
        if user in post.likes.all():
            like_status = True
        return JsonResponse({"data": data, "like_status": like_status})
    else:
        return JsonResponse({"error": "POST request required."}, status=400)


@login_required
@csrf_exempt
def like(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        post_id = data.get("post_id")

        post = Post.objects.get(id=post_id)
        user = User.objects.get(username=request.user)

        if user not in post.likes.all():
            post.likes.add(user)
            like_status = True
        else:
            post.likes.remove(user)
            like_status = False
        post.save()
        likes = post.likes.count()
        return JsonResponse({'like_status': like_status, 'likes': likes})


    
    
