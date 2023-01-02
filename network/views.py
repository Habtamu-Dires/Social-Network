from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render
from django.urls import reverse
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
import json
from django.views.decorators.csrf import csrf_exempt
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger

from .models import User, Post, Like, Follower


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


@csrf_exempt
@login_required
def add_post(request):
    if request.method != 'POST':
        return JsonResponse({"error": "POST request required."}, status=400)
    
    data = json.loads(request.body)
    body =  data.get('body')
    #create post
    post = Post(user = request.user ,body=body)
    post.save()
    
    return JsonResponse({"message": "Posted successfully"}, status=201)

# for each post 
def for_each_post(request,posts):
    array_of_posts = []
    for post in posts:
        num_of_likes = 0
        owner = False
        did_u_likeIt = False
        if(request.user == post.user):
            owner = True
        #how many likes for the post               
        likes = Like.objects.filter(post = post)
        if(likes):
            num_of_likes = len(likes)
        
        #did you like this post
        if(num_of_likes > 0):
            try:
                like = Like.objects.get(user=request.user, post=post)
                if(like):
                    did_u_likeIt = True
            except:
                pass
        
        post_dict = post.serialize()
        post_dict['owner'] = owner
        post_dict['like_count'] = num_of_likes
        post_dict['did_u_likeIt'] = did_u_likeIt
        array_of_posts.append(post_dict)
    
    #pagination
    p = Paginator(array_of_posts,10)
    page_number = request.GET.get('page')
    try:
        page_obj = p.page(page_number)
    except PageNotAnInteger:
        page_obj = p.page(1)
    except EmptyPage:
        page_obj = p.page(p.num_pages)

    posts = page_obj.object_list
    print(p.num_pages)
    pagination = {'num_pages': p.num_pages, 'has_next': page_obj.has_next(),
            'has_previous': page_obj.has_previous(), 'page_number': page_obj.number }
    if page_obj.has_next():
        pagination['next_page_number'] = page_obj.next_page_number()
    if page_obj.has_previous():
        pagination['previous_page_number'] = page_obj.previous_page_number()

    response = {'userId': request.user.id, 'posts': posts, 'pagination': pagination}
    
    return response


def posts(request):
    posts = Post.objects.all()
    #Retun posts in reverse chronological order
    posts = posts.order_by("-timestamp").all()
    #for each post
    response =for_each_post(request, posts)   
    #response = {'userId': request.user.id, 'posts': array_of_posts}
    
    return JsonResponse(response, safe=False)
    

def profile_page(request, user_id):
    accunt_user = User.objects.get(id = user_id)
    posts = Post.objects.filter(user=accunt_user)
    #get followers of the user here
    num_of_followers = 0
    followers = Follower.objects.filter(user = accunt_user)
    if(followers):
        num_of_followers =  len(followers)
    
    #did i follow him
    follow = False
    if(num_of_followers > 0):
        try:
           follower = Follower.objects.get(user = accunt_user ,follower = request.user)
           if(follower):
                follow = True
        except:
            print("You don't follow him")
    #get who the user followes
    num_of_following = 0
    follows = Follower.objects.filter(follower = accunt_user)
    if(follows):
        num_of_following = len(follows)
    
    #Retun posts in reverse chronological order
    posts = posts.order_by("-timestamp").all()
    #for each post
    response = for_each_post(request, posts)
    response['followers'] = num_of_followers
    response['following'] = num_of_following
    response['follow'] = follow
    
    return JsonResponse(response, safe=False)

def follow(request, user_id):
    accunt_user = User.objects.get(id = user_id)
    #check if the user already follows
    try:
        follower = Follower.objects.get(follower = request.user)
        follower.delete()
    except:
        follower = Follower(user = accunt_user, follower = request.user)
        follower.save()


    return profile_page(request, user_id)

def following(request):
    followes = Follower.objects.filter(follower = request.user)
    thePosts = []
    print(followes)
    for follow in followes:
        post = Post.objects.filter(user = follow.user)
        thePosts.append(post)
    
    #Retun posts in reverse chronological order
    posts = []
    for postss in thePosts:
        for post in postss:
            posts.append(post)

    posts.sort(key=lambda x: x.timestamp, reverse=True)

    #for each post
    response = for_each_post(request, posts)
    
    return JsonResponse(response, safe=False)

@csrf_exempt
def single_post(request, post_id):
    post = Post.objects.get(id = post_id)

    if request.method != "POST":    
        response = {'post': post.serialize()}
        return JsonResponse(response, safe=False)
    
    data = json.loads(request.body)
    body = data.get('body')
    post.body = body
    post.save()
    profile = data.get('profile')
    print(profile)
    if(profile):
        return profile_page(request, post.user.id)
    else:
        return posts(request)

@csrf_exempt
def like_post(request, post_id):
    post = Post.objects.get(id = post_id)
    try:
        like = Like.objects.get(user= request.user, post = post)
        if(like):
            like.delete()
    except:
        like = Like(user = request.user, post = post)
        like.save()
    data = json.loads(request.body)
    profile = data.get('profile')
    print(profile)
    if(profile):
        return profile_page(request, post.user.id)
    else:
        return posts(request)

    


