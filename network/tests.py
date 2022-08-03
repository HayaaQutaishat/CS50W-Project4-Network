from django.db.models import Max
from django.test import Client, TestCase

from .models import Profile, Post, User

# Create your tests here.
class FlightTestCase(TestCase):

    def setUp(self):
        # Create users.
        u1 = User.objects.create(username="u1")
        u2 = User.objects.create(username="u2")

        # Create posts.
        p1 = Post.objects.create(creator=u1, post="Hi")
        p2 = Post.objects.create(creator=u2, post="Hello!")
      
    # check number of posts for particular user
    def test_posts_count(self):
        u1 = User.objects.get(username="u1")
        self.assertEqual(Post.objects.filter(creator=u1).count(), 1)


