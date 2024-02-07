const msg = document.getElementById('msg');
const container = document.querySelector('.container');
const token = localStorage.getItem('token');
let currentPage = 1;
let pageData;
let prevData;
let isGetChatsRunning = false;
let newMessage = false;

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
        getChats(currentPage);
    } catch (err) {
        console.log(err);
    }
})

async function getChats(page){
    try {
        if (isGetChatsRunning) {
            return;
        }
        isGetChatsRunning = true;
        const res = await axios.get(`/getChats?page=${page}`, {headers: {'auth': token}});
        
        if (_.isEqual(prevData, res.data)) {
            return;
        } else {
            if (newMessage) {
                const decodedToken = parseJwt(token);
                currentPage = res.data.currentPage;
                if (res.data.chats[res.data.chats.length - 1].userId === decodedToken.id) {
                    const div = document.createElement('div')
                    div.classList.add('message')
                    div.classList.add('right')
                    div.appendChild(document.createTextNode(`${res.data.chats[res.data.chats.length - 1].message}`))
                    container.appendChild(div)
                } else {
                    const div = document.createElement('div')
                    div.classList.add('message')
                    div.classList.add('left')
                    div.appendChild(document.createTextNode(`${res.data.chats[res.data.chats.length - 1].message}`))
                    container.appendChild(div)
                } 
                newMessage = false;
                prevData = res.data;
                return;
            }
            // if ((prevData && prevData.chats) && (res.data && res.data.chats)){
            //     //edge case
            //     if (_.isEqual(res.data.chats[8].message, prevData.chats[7].message)) {
            //         alert("edge case");
            //         // Extract the last element of the arra
            //         const lastItem = res.data.chats[res.data.chats.length - 1];
                    
            //         // Modify the original array to contain only the last element
            //         res.data.chats.length = 0;  // Clear the original array
            //         res.data.chats.push(lastItem);  // Push the last item back inthe original array
            //         prevData.chats.push(lastItem);  // Push the last item back inthe original array

            //     }
            // }
           
            // if (!(res.data.chats.length === 1)) {
                prevData = res.data
            // }
        }
        const decodedToken = parseJwt(token);
        currentPage = res.data.currentPage;
        for(let userChatDetails of res.data.chats){
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
        pageData = res.data;
        // container.scrollTop = container.scrollHeight;
    } catch (err) {
        console.log(err);
    } finally {
        // Set the flag to indicate that getChats has completed its execution
        isGetChatsRunning = false;
    }
}
async function storeChat(e){
    e.preventDefault();
    try {
        isGetChatsRunning = true;
        const userMessage = {
            message: msg.value
        }
        const res = await axios.post(`/storeChat?page=${currentPage}`,userMessage, {headers: {'auth': token}});
        msg.value = ''
        newMessage = true;
        if (res.data.hasMoreData) {
            currentPage+=1;
        }
        
    } catch (err) {
        console.log(err);
    } finally{
        // Set the flag to indicate that getChats has completed its execution
        isGetChatsRunning = false;
    }
}

function handleScroll() {
    var scrollableContainer = document.querySelector(".container");

    // Check if the scrollbar has reached the bottom
    if (scrollableContainer.scrollTop + scrollableContainer.clientHeight >= scrollableContainer.scrollHeight) {
        showPagignation(pageData)
        // Call your function here
        // Call your function to load more messages or perform some action
    }
}

  async function showPagignation(pageData) {
    if (pageData.hasNextPage) {
      getChats(pageData.nextPage);
    }
  }
setInterval(()=>{
    getChats(currentPage)
}, 1000);
