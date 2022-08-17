from django.contrib.auth.models import AbstractUser
from django.db import models
import datetime


class User(AbstractUser):
    def serialize(self):
        return {
            "id": self.id,
            "username": self.username,
        }

class Post(models.Model):
    post = models.TextField(blank=True)
    creator = models.ForeignKey(User, on_delete=models.CASCADE, related_name="posts")
    date = models.DateTimeField(auto_now_add=True)
    likes = models.ManyToManyField(User, blank=True ,related_name="likes")

    def __str__(self):
        return f"{self.post}"

    def serialize(self):
        return {
            "id": self.id,
            "post": self.post,
            "creator": self.creator.username,
            "date": self.date.strftime("%A, %B %e, %Y"),
        }

    @classmethod
    def create(cls, post, creator):
        post = cls(post=post, creator=creator)
        return post


class Profile(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    follower = models.ManyToManyField(User, blank=True, related_name="follower")
    following = models.ManyToManyField(User, blank=True, related_name="following")


    @classmethod
    def create(cls, user, ):
        profile = cls(user=user)
        return profile

    def __str__(self):
        return f'{self.user}'