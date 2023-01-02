function PostForm() {

    const post = () =>{
        console.log("Hello")
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
                window.location.href = "http://127.0.0.1:8000/"
               
            )
            .catch(err => console.log(err));

            textarea.value = ''
        } else {
            // if empty subject show message
            document.querySelector('#message').style.display = 'block';
        }
    }
    
    return(
        <div>
            <form>
                <label className="col-12">New Post</label>
                <input id="text-input" className="col-12" type="textarea"></input>
                <input id="message" className="col-12 text-danger" value="Can't post empty subject" 
                            readonly></input>
                <input id="btn_post" onClick={post} className="btn btn-primary my-1" type="button" value="Post"></input>
            </form>
        </div>
    )
}

ReactDOM.render(<PostForm />, document.querySelector('#post-form'))