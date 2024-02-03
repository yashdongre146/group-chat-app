const msg = document.getElementById('msg');
const token = localStorage.getItem('token');

async function storeChat(e){
    e.preventDefault();
    try {
        const userMessage = {
            message: msg.value
        }
        const res = await axios.post(`/storeChat`,userMessage, {headers: {'auth': token}});

        alert(res.data.message);
    } catch (err) {
        console.log(err);
    }
}