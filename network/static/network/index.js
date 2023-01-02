document.addEventListener('DOMContentLoaded', ()=>{
    document.querySelector('#btn_post').onclick = post;

});

const post = () =>{
    const textarea = document.querySelector('#text-input');
    if(textarea.value !== ''){
        document.querySelector('#message').style.display = 'none';
        const body = textarea.value;
        
        fetch('/post', {
            method: 'POST',
            body: JSON.stringify({
              body: body              
            })
          }).then(response => response.json())
          .then(result => {
            console.log(result)
          })
          .catch(err => console.log(err));

        textarea.value = ''
    } else {
        // if empty subject show message
        document.querySelector('#message').style.display = 'block';
    }
}