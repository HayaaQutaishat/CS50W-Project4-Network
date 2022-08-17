from django.contrib import admin
from network.models import Post, Profile, User

# Register your models here.
admin.site.register(Post)
admin.site.register(Profile)
admin.site.register(User)