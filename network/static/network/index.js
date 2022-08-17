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
          load_posts(result.post_id);
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

          let post_element = document.createElement('div');
          post_element.className = "post_element";

          post_element.innerHTML = `
          <span><strong><a id="post_${post.id}" href="#">${post.creator}</a></strong></span>
          <hr>
          <p class="card-subtitle mb-2 text-muted"> 
          <small><em>${post.date}</em></small>
          </p>
          <span>${post.post}</span><br>
          <br>
        `;
      wrapper.append(post_element);
      document.querySelector(`#post_${post.id}`).addEventListener('click', event => profile(event.target.innerHTML))

      // check if the post is already liked and show like or unlike button to user
      fetch('/like_status', {
        method: 'POST',
        body: JSON.stringify({
            post_id: post.id,
        })
      })
      .then(response => response.json())
      .then(result => {    
        
          console.log(result.like_status)
          if (result.like_status === false) {
            class_name = "fa fa-thumbs-up"
          } else {
            class_name = "fa fa-thumbs-down"
          }
          // create like icon
          let like_icon = document.createElement('i');
          like_icon.innerHTML = `<i id="like_toggle_${i}" class="${class_name}"></i>`
          // when users click on like/unlike 
          like_icon.addEventListener('click', (event) => like(event,result.data.post_id, class_name));
          
          post_element.append(like_icon)
      });

      // create Edit button
      fetch('get_user')
      .then(response => response.json())
      .then(data => {
        
        // show edit button only for user who created the post
        if (post.creator === data.user_requesting) {
          let edit_btn = document.createElement('a');
          edit_btn.className = "badge badge-primary";
          edit_btn.innerText = "Edit";
          post_element.append(edit_btn);
          edit_btn.addEventListener('click', () => edit_post(post.id, post.post, post_element));
        }
      });
          
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

    function edit_post(post_id, post_text, post_element) {

      let edit_post_div = document.createElement('div');
      edit_post_div.innerHTML = `
      <form id="edit_form">
        <textarea id="text_post" name="text_post" autofocus class="form-control">${post_text}</textarea><br>
        <input type="submit" value="Save" class="btn btn-primary"/>
      </form>
      `
      post_element.append(edit_post_div);
      document.querySelector('#edit_form').addEventListener('submit',() => edit(post_id));
    }

});
}

function like(event, post_id, class_name) {

  console.log(class_name)
  if(class_name === "fa fa-thumbs-up"){
    event.target.classList.remove("fa-thumbs-up")
    event.target.classList.add("fa-thumbs-down")
  } else {
    event.target.classList.remove("fa-thumbs-down")
    event.target.classList.add("fa-thumbs-up")
  }

  fetch('/like', {
    method: 'POST',
    body: JSON.stringify({
        post_id: post_id,
    })
    })
    .then(response => response.json())
    .then(result => {
        console.log(result);
        console.log(result.likes);
    });
}

function edit(post_id) {

  // send the value of post after editing to the backend
  const post = document.querySelector('#text_post').value;
  
  fetch(`/edit/${post_id}`, {
    method: 'POST',
    body: JSON.stringify({
        post: post,
    })
  })
  .then(response => response.json())
  .then(result => {
      // Print result
      console.log(result);
  });
  return false; 

}

function profile(user) {
  
    // Show the profile view and hide other views
    document.querySelector('#new_post').style.display = 'none';
    document.querySelector('#posts_view').style.display = 'none';
    document.querySelector('#profile_view').style.display = 'block';
    document.querySelector('#pagination').style.display = 'none';

    // create new div element for profile
    div_profile = document.createElement('div');
    document.querySelector('#profile_view').append(div_profile);
    div_profile.innerHTML = `
    <h1 id="username-profile">${user}</h1>`

    fetch(`/profile/${user}`)
    .then(response => response.json())
    .then(data => {
        console.log(data);
        
        
        // if logged_in user not the clicked_user show follow button
        if (user !== data[4]["username"]){
          follow_btn = document.createElement('button');
          follow_btn.className = "btn btn-primary";
          follow_btn.innerHTML = "Follow";
          document.querySelector('#profile_view').append(follow_btn);
          following_status = data[5]

          // when user click on other user's profile
          if (following_status == true) {
            follow_btn.innerHTML = "Unfollow";
        } else {
          follow_btn.innerHTML = "Follow";
        }
        // when user click on follow/unfollow button
          follow_btn.addEventListener('click', () => {
            fetch(`/follow/${user}`, {
                method: 'POST',
                body: JSON.stringify({
                    "following_status": following_status
                })
            })
                .then(response => response.json())
                .then(result => {
                    console.log(result)

                })   
            if (following_status === true) {
              follow_btn.innerHTML = "Unfollowed"; 
            } else {
              follow_btn.innerHTML = "Followed";
            }
        });
        }
        const followers = document.createElement('p');
        followers.innerHTML = `Followers: ${data[1]}`;
        const following = document.createElement('p');
        following.innerHTML = `Following: ${data[2]}`;
        document.querySelector('#profile_view').append(followers);
        document.querySelector('#profile_view').append(following);

        data[3].forEach((post) => {
          const post_element = document.createElement('div');
          post_element.className = "post_element";
          post_element.id = `post_${post.id}`
          post_element.innerHTML =  `<p>${post['date']}</p><p>${post['post']}</p><br>`
          document.querySelector('#profile_view').append(post_element);
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
        <span><strong><a id="post_${post.id}" href="#">${post.creator}</a></strong></span><br>
        <span id="time"><small><em>${post.date}</em></small></span><br><br>
        <span>${post.post}</span><br><br>
        <button id="likes" type="button" class="btn btn-primary">
        Likes <span class="badge badge-light">0</span>
        </button>
      `;
      post_div.style.border = "thin inset #C8C8C8";
      post_div.style.marginTop = "30px";
      post_div.style.padding = "10px 10px 10px 10px";

      document.querySelector('#following_posts_view').append(post_div);
      document.querySelector(`#post_${post.id}`).addEventListener('click', event => profile(event.target.innerHTML))
      })

  });

}


















