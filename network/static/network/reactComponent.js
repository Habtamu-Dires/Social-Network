
function PostForm(props) {

    const post = () =>{
        const textarea = document.querySelector('#text-input');
        if(textarea.value !== ''){
           document.querySelector('#message').style.display = 'none';
            const body = textarea.value;
            
            fetch('/add_post', {
                method: 'POST',
                body: JSON.stringify({
                body: body              
                })
            }).then(response => response.json())
            .then(result => 
               props.setResponse(null)
            )
            .catch(err => console.log(err));

            textarea.value = ''
        } else {
            // if empty subject show message
            document.querySelector('#message').style.display = 'block';
        }
    }
    
    if(props.response && props.response.userId){
        return(
            <div id="post-form">
                <form onSubmit={e => { e.preventDefault(); }}>
                    <label className="col-12">New Post</label>
                    <input id="text-input" className="col-12" type="textarea"></input>
                    <input id="message" className="col-12 text-danger" value="Can't post empty subject" 
                                readonly></input>
                    <input onClick={post} className="btn btn-primary my-1" type="submit" value="Post"></input>
                </form>
            </div>
        )
    } else{
        return(
            <div></div>
        )
    }
    
}

//fetch and dsiplay all posts
const Fetch = (props) =>{
    const [userId, setUserId] = React.useState(null);
    
    if(props.response && props.response.userId){
        //user name clicked
        document.querySelector('#profile-name').onclick = () => {
            setUserId(props.response.userId)      
        }
        //following 
        document.querySelector('#following').onclick =() => {
            fetch('/following')
            .then(response => response.json())
            .then(response => {
                document.querySelector('#post-form').style.display = 'none';
                props.setResponse(response)
                
            })
            .catch(err => console.log(err))
        }

    }

    //follow /unfollow
    const follow = (userID) => {
        console.log("follo / unfollow", userID)
        
        fetch(`follow/${userID}`)
        .then(response => response.json())
        .then(response => {
            props.setResponse(response)
           
        })
        .catch(err => console.log(err))
        
    } 
    //edit
    const edit = (post_id) => {
        fetch(`single_post/${post_id}`)
        .then(resonse => resonse.json())
        .then(response => {
            document.getElementById(`${post_id}`).style.display = 'block';
            document.getElementById(`text-${post_id}`).value = response.post.body;

        })
        .catch(err => console.log(err))
    }
    //save edit
    const save_edit = (post_id) => {
        const page_number = props.response.pagination.page_number;
        const url = `single_post/${post_id}?page=${page_number}`;
        //check in which page it is
        let profile = true;   //in profile page
        if(props.response.followers === undefined){
            profile = false;
        }
        const body = document.getElementById(`text-${post_id}`).value;
        fetch(url,{
            method: 'POST',
            body: JSON.stringify({
                body: body,
                profile: profile
            })
        })
        .then(resonse => resonse.json())
        .then(response => {            
            document.getElementById(`${post_id}`).style.display = 'none';
            props.setResponse(response)

        })
        .catch(err => console.log(err))        
    }

    //click like heart / or unlike
    const like_heart = (post_id) => {
        const page_number = props.response.pagination.page_number;
        const url =  `like_post/${post_id}?page=${page_number}`;
        //check in which page it is
        let profile = true;    // profile page
        if(props.response.followers === undefined){
            profile = false;
        }
        fetch(url,{
            method: 'POST',
            body: JSON.stringify({
                profile: profile
            })
        })
        .then(response => response.json())
        .then(response => {
            props.setResponse(response)
        })
        .catch(err => console.log(err))

    } 
    //pagination buttons
    const nextBtn = () => {
        const next_page_number = props.response.pagination.next_page_number;
        let url = `/posts?page=${next_page_number}`;
        //which page are we
        if(props.response.followers !== undefined) {  
            const userId = props.response.posts[0].user_id;
            url = `/profile_page/${userId}?page=${next_page_number}`;
        }
        fetch(url)
        .then(response => response.json())
        .then(response=> {
            props.setResponse(response)
        
        })
        .catch(err => console.log(err))
    }

    const prevBtn = () => {
        const previous_page_number = props.response.pagination.previous_page_number;
        let url = `/posts?page=${previous_page_number}`;
        ///which page are we
        if(props.response.followers !== undefined) {  
            const userId = props.response.posts[0].user_id;
            url = `/profile_page/${userId}?page=${previous_page_number}`;
        }
        fetch(url)
        .then(response => response.json())
        .then(response=> {
            props.setResponse(response)
            
        })
        .catch(err => console.log(err))
    }
    
    //profile page
    if(userId){
        if(document.querySelector('#post-form')){
            document.querySelector('#post-form').style.display = 'none';
        }
        fetch(`profile_page/${userId}`)
        .then(response => response.json())
        .then(response => {
            props.setResponse(response)
            
        })
        .catch(err => console.log(err))
        //reset userID to null
        setUserId(null)


    }  else if(!props.response){
        fetch('/posts')
        .then(response => response.json())
        .then(response => {
            props.setResponse(response)
            })            
        .catch(err => console.log(err))

       return(
        <div>
            Loading...
        </div>
       )
    } else if(props.response){
        //console.log(props.response.pagination.num_pages)
        const thePosts = props.response.posts.map(resp =>{
            if(resp.owner){
                if(resp.did_u_likeIt){
                    return(
                        <div keys={resp.id} id='single-post'>
                            <a onClick={()=> setUserId(resp.user_id)} href="#" style={{color: 'white'}}>{resp.user}</a><br></br>
                            <a style={{color:'blue'}} onClick={()=> edit(resp.id)} href="#">Edit</a>    
                            <p>{resp.body}<br></br>
                            <div id={resp.id} className="row" style={{display: 'none'}}>
                                <form onSubmit={e => { e.preventDefault(); }}>
                                    <input id={`text-${resp.id}`} type="text" className="col-12" />
                                    <input onClick={()=> save_edit(resp.id)} type="submit" className="btn btn-primary btn-sm" value='Save'/>
                                </form>
                            </div>                            
                            <span style={{fontSize: 10}}>{resp.timestamp}</span><br></br>
                            <sapn><i onClick={()=> like_heart(resp.id)} style={{color: 'red'}} 
                                   className="bi bi-suit-heart-fill"> </i>{" "}{resp.like_count}</sapn><br></br>
                            <span style={{fontSize: 10}}>comment</span></p>                                               
                        </div>
                    )       
                } else{
                    return(  //style="cursor: pointer;"
                        <div keys={resp.id} id='single-post'>
                            <a onClick={()=> setUserId(resp.user_id)} style={{color: 'white',cursor: 'pointer'}}>{resp.user}</a><br></br>
                            <a style={{color:'blue'}} onClick={()=> edit(resp.id)} href="#">Edit</a>    
                            <p>{resp.body}<br></br>
                            <div id={resp.id}  className="row" style={{display: 'none'}}>
                                <form onSubmit={e => { e.preventDefault(); }}>
                                    <input id={`text-${resp.id}`} type="text" className="col-12" />
                                    <input onClick={()=> save_edit(resp.id)} type="submit" className="btn btn-primary btn-sm" value='Save'/>
                                </form>
                            </div>  
                            <span style={{fontSize: 10}}>{resp.timestamp}</span><br></br>
                            <sapn><i onClick={()=> like_heart(resp.id)} className="bi bi-suit-heart"></i>{" "}{resp.like_count}</sapn><br></br>
                            <span style={{fontSize: 10}}>comment</span></p>                                               
                        </div>
                    )   
                }
                
            } else{
                if(resp.did_u_likeIt){
                    return(                    
                        <div keys={resp.id} id='single-post'>
                            <a onClick={()=> setUserId(resp.user_id)} style={{color: 'white',cursor: 'pointer'}}>{resp.user}</a><br></br>
                            <p>{resp.body}<br></br>
                            <span style={{fontSize: 10}}>{resp.timestamp}</span><br></br>
                            <sapn><i onClick={()=> like_heart(resp.id)} style={{color: 'red'}} className="bi bi-suit-heart-fill"></i>{" "}{resp.like_count}</sapn><br></br>
                            <span style={{fontSize: 10}}>comment</span></p>                                               
                        </div>
                    )
                } else{
                    return(                    
                        <div keys={resp.id} id='single-post'>
                            <a onClick={()=> setUserId(resp.user_id)} style={{color: 'white',cursor: 'pointer'}}>{resp.user}</a><br></br>
                            <p>{resp.body}<br></br>
                            <span style={{fontSize: 10}}>{resp.timestamp}</span><br></br>
                            <sapn><i onClick={()=> like_heart(resp.id)} className="bi bi-suit-heart"></i>{" "}{resp.like_count}</sapn><br></br>
                            <span style={{fontSize: 10}}>comment</span></p>                                               
                        </div>
                    )
                }
                
            }
        });
        //pagination 
        let children = []
        if(props.response.pagination.has_next && props.response.pagination.has_previous) {
            
          const child1 = React.createElement('li',{className: "page-item"},
                React.createElement('a', {onClick: ()=>{nextBtn()}, className: "page-link"},'Next'),);
          const child2 = React.createElement('li',{className: "page-item"},
                React.createElement('a', {onClick: ()=>{prevBtn()} ,className: "page-link"},'Previous'),
                         );
           children.push(child2)
           children.push(child1)
        } else if(props.response.pagination.has_next) {
            children = React.createElement('li',{className: "page-item"},
                React.createElement('a', {onClick: ()=>{nextBtn()}, className: "page-link",},'Next'),);
            
        } else if(props.response.pagination.has_previous) {
            children = React.createElement('li',{className: "page-item"},
                React.createElement('a',{onClick: ()=>{prevBtn()} ,className: "page-link"},'Previous'),);    
        }

        function Pagination () {
            return React.createElement(
                'div', null,
                React.createElement('ul',{className: "pagination"},
                 children
                )
            );

        }
                
        if(props.response.followers === undefined) {
            return(
                <div>
                    <div>
                        {thePosts}
                    </div>                    
                    <Pagination />   
                </div>              
            )   
        } else {
            if(!props.response.userId || props.response.posts[0].owner){
                return(
                    <div>
                        <div className='row'>
                            <h1 className="col-3">{props.response.posts[0].user}</h1>
                            <h5 className="col-3">{props.response.following} Following</h5>
                            <h5 className="col-3">{props.response.followers} Follower</h5>
                        </div>
                        <div>
                            {thePosts}
                        </div>
                        <Pagination /> 
                    </div>
                )
            } else if(props.response.follow && props.response.userId){
                return(
                    <div>
                        <div className='row mb-5'>
                            <h2 className="col-3">{props.response.posts[0].user}</h2>
                            <h6 className="col-3">{props.response.following} Following</h6>
                            <h6 className="col-3">{props.response.followers} Follower</h6>
                            <button onClick={()=>follow(props.response.posts[0].user_id)} className="btn btn-primary ">
                                                following</button>
                        </div>
                        <div>
                            {thePosts}
                        </div>
                        <Pagination /> 
                    </div>
                )
            }
            else{
                return(
                    <div>
                        <div className='row mb-5'>
                            <h2 className="col-3">{props.response.posts[0].user}</h2>
                            <h6 className="col-3">{props.response.following} Following</h6>
                            <h6 className="col-3">{props.response.followers} Follower</h6>
                            <button onClick={()=>follow(props.response.posts[0].user_id)} className="btn btn-primary ">
                                Follow</button>
                        </div>
                        <div>
                            {thePosts}
                        </div>
                        <Pagination /> 
                    </div>
                )
            }
        }
        
    } 
    
}

function App() {
    
    const [response, setResponse] = React.useState(null)
    
    return(
       <React.Fragment>
            <div>
                <PostForm response={response} setResponse={setResponse}/>
            </div>
            <div className="my-5">
                <Fetch response={response} setResponse={setResponse}/>
            </div>  
       </React.Fragment >

    );
}

ReactDOM.render(<App />, document.querySelector('#posts'))

