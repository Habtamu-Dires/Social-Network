
const PostList = () => {

    const [response, setResponse] = React.useState(null)

    //fetch and dsiplay all posts
    const Fetch = () =>{
        // calling setState/response unconditionally creates infinite loops
        if(!response){
            fetch('/posts')
            .then(response => response.json())
            .then(response => {
                setResponse(response)
                console.log('the the', response)})            
            .catch(err => console.log(err))

           return(
            <div>
                Loading...
            </div>
           )
        } else if(response){
            console.log("The response ", response)
            
            const theResult = response.map(resp =>{
                return(
                    <div keys={resp.id} id='single-post'>
                        <h6>{resp.owner}</h6>
                        <a href="#">Edit</a>
                        <p>{resp.body}<br></br>
                        <span style={{fontSize: 10}}>{resp.timestamp}</span></p>                        
                    </div>
                )
            });

            return(
                <div>
                    {theResult}
                </div>
            )
            
        } 
        
    }

    return(
       <Fetch />
    );
}

export default PostList;