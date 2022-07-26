document.addEventListener('DOMContentLoaded', function() {
 
    document.querySelector('#all').addEventListener('click', function() {
      document.querySelector('#posts_view').style.display = 'block';
      document.querySelector('#new_post').style.display = 'none';
      document.querySelector('#profile_view').style.display = 'none';
    });

    document.querySelector('#post_form').addEventListener('submit', new_post);

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
          load_new_post();
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
      <span><strong><a id="userr" href="">${post.creator}</a></strong></span>
      <span id="time"><small><em>${post.date}</em></small></span><br><br>
      <span>${post.post}</span><br><br>
      <button id="likes" type="button" class="btn btn-primary">
      Likes <span class="badge badge-light">0</span>
      </button>
    `;
    document.querySelector('#posts_view').append(post_div);

      
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
      <span><strong><a id="userr" href="#">${post.creator}</a></strong></span>
      <span id="time"><small><em>${post.date}</em></small></span><br><br>
      <span>${post.post}</span><br><br>
      <button id="likes" type="button" class="btn btn-primary">
      Likes <span class="badge badge-light">0</span>
      </button>
    `;
    document.querySelector('#posts_view').append(post_div);
    
    
    })
    document.querySelector('#userr').addEventListener('click', event => profile(event.target.innerHTML))

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
        
        if (user !== data[4]["username"]){
          follow_btn = document.createElement('button');
          follow_btn.className = "btn btn-primary";
          follow_btn.innerHTML = "Follow";
          document.querySelector('#profile_view').append(follow_btn);
        } 

        const followers = document.createElement('p');
        followers.innerHTML = `Followers: ${data[1]}`;
        const following = document.createElement('p');
        following.innerHTML = `Following: ${data[2]}`;
        document.querySelector('#profile_view').append(followers);
        document.querySelector('#profile_view').append(following);


        data[3].forEach( () => {
          const div_post = document.createElement('div');
          div_post.className = "post_div";
          div_post.innerHTML =  `<p>${data[3][0]['date']}</p><p>${data[3][0]['post']}</p><br>`
          document.querySelector('#profile_view').append(div_post);
        })
})

}






// function profile(user) {

//   // Show the profile view and hide other views
//   document.querySelector('#new_post').style.display = 'none';
//   document.querySelector('#posts_view').style.display = 'none';
//   document.querySelector('#profile_view').style.display = 'block';


//   fetch(`/profile/${user}`)
//   .then(response => response.json())
//   .then(data => {
//       console.log(data);
//       // create the elements of profile
//       div_profile = document.createElement('div');
//       div_profile.className = "profile_div";
//       div_profile.innerHTML = `
//       <span><strong><a href="#">${user}</a></strong></span>
//       <span"><small><em>${data['num_followers']}</em></small></span>

//     `;
//     // data['posts'].forEach(post => {
//     //   div_post = document.createElement('p');
//     // })

//       document.querySelector('#profile_view').append(div_profile);


//       // add class name to elements
//       // archive_button.className = 'btn btn-outline-secondary';
//       // unarchive_button.className = 'btn btn-outline-secondary';
//       // reply_button.className = "btn btn-outline-primary";

//       // reply_button.style.marginRight = "7px";

//       // elements inner HTML
//       // from.innerHTML = `<strong>From: </strong>${email.sender}`;
//       // to.innerHTML = `<strong>To: </strong>${email.recipients}`;
//       // subject.innerHTML = `<strong>Subject: </strong>${email.subject}`;
//       // timestamp.innerHTML = `<strong>Timestamp: </strong>${email.timestamp}`;
//       // body.innerHTML = email.body;
//       // reply_button.innerHTML = "Reply";
//       // archive_button.innerHTML = "Archive";
//       // unarchive_button.innerHTML = "Unarchive";
    
//       // append elements to DOM
//       // document.querySelector('#view-email').append(from,to,subject,timestamp,body,reply_button);
// })

// }