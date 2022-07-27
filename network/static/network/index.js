document.addEventListener('DOMContentLoaded', function() {

    // all posts section
    document.querySelector('#all').addEventListener('click', function() {
      document.querySelector('#posts_view').style.display = 'block';
      document.querySelector('#new_post').style.display = 'none';
      document.querySelector('#profile_view').style.display = 'none';
      document.querySelector('#following_posts_view').style.display = 'none';
    });

    document.querySelector('#post_form').addEventListener('submit', new_post);
    document.querySelector('#followingg').addEventListener('click', load_following);

    function new_post(event) {
      event.preventDefault()
      const post = document.querySelector('#post_text').value;

      fetch('/new_post', {
        method: 'POST',
        body: JSON.stringify({
            post: post,
        })
      })
      .then(response => response.json())
      .then(result => {
          console.log(result);
          load_new_post(result.post_id);
          // clear the field after submitiing the form
          document.querySelector('#post_text').value = "";
      });
      return false; 
    } 
    // By default, load all posts
    
    load_posts();

});


function load_new_post(post_id) {
  
  fetch(`/post/${post_id}`)
  .then(response => response.json())
  .then(post => {
      console.log(post);
      const post_div = document.createElement('div')
      post_div.className = "post_div";
      post_div.innerHTML = `
      <span><strong><a id="post_${post.id}" href="">${post.creator}</a></strong></span>
      <span id="time"><small><em>${post.date}</em></small></span><br><br>
      <span>${post.post}</span><br><br>
      <button id="likes" type="button" class="btn btn-primary">
      Likes <span class="badge badge-light">0</span>
      </button>
    `;
    document.querySelector('#posts_view').prepend(post_div);      
  });
}


// To load all posts
function load_posts(){ 
  
  // Show posts view
  document.querySelector('#posts_view').style.display = 'block';
  

fetch('/posts')
.then(response => response.json())
.then(posts => {
    // console.log(posts);
    posts.forEach(post => {
      const post_div = document.createElement('div')
      post_div.className = "post_div";
      post_div.innerHTML = `
      <span><strong><a id="post_${post.id}" href="#">${post.creator}</a></strong></span>
      <span id="time"><small><em>${post.date}</em></small></span><br><br>
      <span>${post.post}</span><br><br>
      <button id="likes" type="button" class="btn btn-primary">
      Likes <span class="badge badge-light">0</span>
      </button>
    `;
      document.querySelector('#posts_view').append(post_div);
      document.querySelector(`#post_${post.id}`).addEventListener('click', event => profile(event.target.innerHTML))
    })

});

}


function profile(user) {

    // Show the profile view and hide other views
    document.querySelector('#new_post').style.display = 'none';
    document.querySelector('#posts_view').style.display = 'none';
    document.querySelector('#profile_view').style.display = 'block';


    div_profile = document.createElement('div');
    document.querySelector('#profile_view').append(div_profile);
    div_profile.innerHTML = `
    <h1 id="username-profile">${user}</h1>`

    fetch(`/profile/${user}`)
    .then(response => response.json())
    .then(data => {
        console.log(data);
        
        // if logged in user not clicked user show follow button
        if (user !== data[4]["username"]){
          follow_btn = document.createElement('button');
          follow_btn.className = "btn btn-primary";
          follow_btn.innerHTML = "Follow";
          document.querySelector('#profile_view').append(follow_btn);
          console.log(data[5])

          // when user click on other user's profile
          if (data[5] == true) {
            // if following_status = true
            follow_btn.innerHTML = "Unfollow";
            follow = true
        } else {
          // if following_status = false
          follow_btn.innerHTML = "Follow";
          follow = false
        }
        // when user click on follow/unfollow button
          follow_btn.addEventListener('click', () => {
            if (follow === true) {
              follow_btn.innerHTML = "Unfollowed";
            } else {
              follow_btn.innerHTML = "Followed";
            }
            fetch(`/follow/${user}`, {
                method: 'POST',
                body: JSON.stringify({
                    "follow": follow
                })
            })
                .then(response => response.json())
                .then(result => {
                    console.log(result)
                })
        });
        } 

        
        const followers = document.createElement('p');
        followers.innerHTML = `Followers: ${data[1]}`;
        const following = document.createElement('p');
        following.innerHTML = `Following: ${data[2]}`;
        document.querySelector('#profile_view').append(followers);
        document.querySelector('#profile_view').append(following);

        data[3].forEach((post) => {
          const div_post = document.createElement('div');
          div_post.className = "post_div";
          div_post.id = `post_${post.id}`
          div_post.innerHTML =  `<p>${post['date']}</p><p>${post['post']}</p><br>`
          document.querySelector('#profile_view').append(div_post);
        })
})

}


function load_following() {

  // Show the following view and hide other views
  document.querySelector('#posts_view').style.display = 'none';
  document.querySelector('#new_post').style.display = 'none';
  document.querySelector('#profile_view').style.display = 'none';
  document.querySelector('#following_posts_view').style.display = 'block';

  
  
  fetch('/following_posts')
  .then(response => response.json())
  .then(posts => {
      console.log(posts);
      posts.forEach(post => {
        const post_div = document.createElement('div')
        post_div.className = "post_div";
        post_div.innerHTML = `
        <span><strong><a id="post_${post.id}" href="#">${post.creator}</a></strong></span>
        <span id="time"><small><em>${post.date}</em></small></span><br><br>
        <span>${post.post}</span><br><br>
        <button id="likes" type="button" class="btn btn-primary">
        Likes <span class="badge badge-light">0</span>
        </button>
      `;
      document.querySelector('#following_posts_view').append(post_div);
      document.querySelector(`#post_${post.id}`).addEventListener('click', event => profile(event.target.innerHTML))
      })

  });

}




