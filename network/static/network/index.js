document.addEventListener('DOMContentLoaded', function() {

    // all posts view
    document.querySelector('#all').addEventListener('click', function() {
      document.querySelector('#posts_view').style.display = 'block';
      document.querySelector('#new_post').style.display = 'none';
      document.querySelector('#profile_view').style.display = 'none';
      document.querySelector('#following_posts_view').style.display = 'none';
    });
    document.querySelector('#post_form').addEventListener('submit', new_post);
    // following view
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
          // clear the text area field after submitiing the form
          document.querySelector('#post_text').value = "";
      });
      return false; 
    } 
    // By default, load all posts
    load_posts();
});


 // To load all posts
function load_posts(){ 
  
  // Show posts view
  document.querySelector('#posts_view').style.display = 'block';
  
fetch('/posts')
.then(response => response.json())
.then(posts => {
    console.log(posts);

    const post_element = document.querySelector('#posts_view');
    const pagination_element = document.querySelector('#pagination')

    let current_page = 1;
    let rows = 10;
    
    function display_posts(posts, wrapper, rows_per_page, page) {
      // when click next page, clear all the old 10 posts, and load new 10 
      wrapper.innerHTML = "";
      page--;

      // to loop through the posts
      let statrt = rows_per_page * page;
      let end = statrt + rows_per_page;
      let paginatedPosts = posts.slice(statrt, end);

      for (let i = 0; i < paginatedPosts.length; i++) {
        let post = paginatedPosts[i];
          let post_element = document.createElement('div')
          post_element.className = "post_element";

    
          post_element.innerHTML = `
          <span><strong><a id="post_${post.id}" href="#">${post.creator}</a></strong></span>
          <hr>
          <p class="card-subtitle mb-2 text-muted"> 
          <small><em>${post.date}</em></small>
          </p>
          <span>${post.post}</span><br>
          <br>
          <i class="fa-solid fa-thumbs-up"></i> ${post.likes}Likes
        `;
      // document.querySelector('#posts_view').append(post_element);
      wrapper.append(post_element);
      document.querySelector(`#post_${post.id}`).addEventListener('click', event => profile(event.target.innerHTML))
      }
    }
    function SetUpPagination(posts, wrapper, rows_per_page) {
      wrapper.innerHTML = "";
      // round up to get all posts and not lose any of them
      let page_count = Math.ceil(posts.length / rows_per_page);
      for (let i = 1; i < page_count + 1; i++) {
        let btn = PaginationButton(i, posts);
        wrapper.appendChild(btn);
      }
    }
    function PaginationButton(page, posts) {
      let button = document.createElement('button');
      button.innerText = page;
      button.id = "paginated_btn";
      if (current_page == page) button.classList.add('active');

      button.addEventListener('click', function() {
        current_page = page;
        display_posts(posts, post_element, rows, current_page);
      });
      return button;
    }
    display_posts(posts, post_element, rows, current_page);
    SetUpPagination(posts, pagination_element, rows);



});
}

function load_new_post(post_id) {
  
  fetch(`/post/${post_id}`)
  .then(response => response.json())
  .then(post => {
      console.log(post);
      const post_div = document.createElement('div')
      post_div.className = "post_div";
      post_div.innerHTML = `
      <span><strong><a id="post_${post.id}" href="#">${post.creator}</a></strong></span>
      <hr>
      <p class="card-subtitle mb-2 text-muted"> 
      <small><em>${post.date}</em></small>
      </p>
      <span>${post.post}</span><br>
      <button class="btn like">
      <svg xmls="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-hear-fill like" viewBox="0 0 16 16">
          <path fill-rule="evenodd" d="M8 1.314C12.438-3.248 23.534 4.735 8 15-7.534 4.736 3.562-3.248 8 1.314z"/>
      </svg>
      </button>
    <span class="margin"> 
          0 likes
    </span>
    `;
    // preapend: to append element at the top of DOM
    document.querySelector('#posts_view').prepend(post_div);      
  });
}

function profile(user) {

    // Show the profile view and hide other views
    document.querySelector('#new_post').style.display = 'none';
    document.querySelector('#posts_view').style.display = 'none';
    document.querySelector('#profile_view').style.display = 'block';

    // create new div element for profile
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


















