from django.contrib import admin

from .models import User, Post

# Register your models here. 
#admin: hab  pass: habtamu@123
admin.site.register(User)
admin.site.register(Post)
