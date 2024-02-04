const msg = document.getElementById('msg');
const container = document.querySelector('.container');
const token = localStorage.getItem('token');

function parseJwt (token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
}

window.addEventListener('DOMContentLoaded', async () => {
    try {
        getChats();
    } catch (err) {
        console.log(err);
    }
})

async function getChats(){
    try {
        const res = await axios.get(`/getChats`, {headers: {'auth': token}});
        const decodedToken = parseJwt(token);

        container.innerHTML = ''
        for(let userChatDetails of res.data){
            if (userChatDetails.userId === decodedToken.id) {
                const div = document.createElement('div')
                div.classList.add('message')
                div.classList.add('right')
                div.appendChild(document.createTextNode(`${userChatDetails.message}`))
                container.appendChild(div)
            } else {
                const div = document.createElement('div')
                div.classList.add('message')
                div.classList.add('left')
                div.appendChild(document.createTextNode(`${userChatDetails.message}`))
                container.appendChild(div)
            }
        }
    } catch (err) {
        console.log(err);
    }
}
async function storeChat(e){
    e.preventDefault();
    try {
        const userMessage = {
            message: msg.value
        }
        await axios.post(`/storeChat`,userMessage, {headers: {'auth': token}});
        msg.value = ''
    } catch (err) {
        console.log(err);
    }
}

setInterval(getChats, 1000);