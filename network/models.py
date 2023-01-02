from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    pass

class Post(models.Model):
    user = models.ForeignKey("User", on_delete=models.CASCADE,related_name='timelne')
    body = models.CharField(max_length=255)
    timestamp = models.DateTimeField(auto_now_add=True)

    def serialize(self):
        return {
            "id": self.id,
            "user": self.user.username,
            "user_id": self.user.id,
            "body": self.body,
            "timestamp": self.timestamp.strftime("%b %d %Y, %I:%M %p")
        }


class Like(models.Model):
    user = models.ForeignKey("User", on_delete=models.CASCADE, related_name='likes')
    post = models.ForeignKey("Post", on_delete=models.CASCADE, related_name='likes')

class Follower(models.Model):
    user = models.ForeignKey("User", on_delete=models.CASCADE, related_name='followers')
    follower = models.ForeignKey("User", on_delete=models.CASCADE, related_name='followering')


