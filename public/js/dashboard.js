const token = localStorage.getItem("token");
const modal = document.getElementById("myModal");
const closeBtn = document.getElementsByClassName("close")[0];
const groupNameInput = document.getElementById("groupNameInput");
const membersList = document.getElementById("membersList");
const createBtn = document.getElementById("createBtn");
const groupsContainer = document.getElementById("groupsContainer");
const dynamicContent = document.getElementById('dynamic-content');


function parseJwt(token) {
  var base64Url = token.split(".")[1];
  var base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  var jsonPayload = decodeURIComponent(
    window
      .atob(base64)
      .split("")
      .map(function (c) {
        return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
      })
      .join("")
  );
  return JSON.parse(jsonPayload);
}

window.addEventListener("DOMContentLoaded", async () => {
  try {
    
    const userRes = await axios.get(`/getUsers`, {
      headers: { auth: token },
    });
    
    const groupRes = await axios.get(`/getGroups`, {
      headers: { auth: token },
    });

    // showing users in the model
    for (let user of userRes.data) {
      showUsersOnModel(user.name)
    }

    // showing groups on the screen
    for (const group of groupRes.data) {
      showGroupsOnScreen(group.name)
    }

  } catch (err) {
    console.log(err);
  }
});

async function getChats(groupName) {
  try {
    const res = await axios.get(`/getChats?groupName=${groupName}`, {
      headers: { auth: token },
    });
    const decodedToken = parseJwt(token);
    
    const container = document.querySelector(".container");
    container.innerHTML = ''
    for (let userChatDetails of res.data) {
      if (userChatDetails.userId === decodedToken.id) {
        const div = document.createElement("div");
        div.classList.add("message");
        div.classList.add("right");
        div.appendChild(document.createTextNode(`${userChatDetails.message}`));
        container.appendChild(div);
      } else {
        const div = document.createElement("div");
        div.classList.add("message");
        div.classList.add("left");
        div.appendChild(document.createTextNode(`${userChatDetails.message}`));
        container.appendChild(div);
      }
    }
  } catch (err) {
    console.log(err);
  }
}
async function storeChat(e, groupName) {
  e.preventDefault();
  try {
    const msg = document.getElementById("msg");
    const userMessage = {
      message: msg.value,
    };
    await axios.post(
      `/storeChat?groupName=${groupName}`,
      userMessage,
      { headers: { auth: token } }
    );
    msg.value = "";
  } catch (err) {
    console.log(err);
  }
}
setInterval(() => {
  const selectedDiv = document.querySelector('.selected');
  console.log(selectedDiv);
  if (selectedDiv) {
    getChats(selectedDiv.textContent);
  }
}, 1000);

// group functions


async function openGroupModel() {
  modal.style.display = "block";
}

closeBtn.addEventListener("click", function () {
  modal.style.display = "none";
  resetModal(); // Reset modal fields when closing
});

async function createGroup() {
  try {
    const groupName = groupNameInput.value.trim();

    const selectedMembers = Array.from(document.querySelectorAll(".member-checkbox:checked")).map((checkbox) => checkbox.value);

    if (selectedMembers.length > 0) {
      // adding group to the backend
      const groupDetails = {
        name: groupName,
        selectedMembers: selectedMembers,
      };
      await axios.post(`/addGroup`, groupDetails, {
        headers: { auth: token },
      });

      //showing group to screen
      showGroupsOnScreen(groupName)

    }else{
      alert("Please add atleast one member to the group.");
    }

    modal.style.display = "none";
    resetModal();
  } catch (error) {
    alert("Something went wrong!")
  }
};

window.addEventListener("click", function (event) {
  if (event.target === modal) {
    modal.style.display = "none";
    resetModal(); // Reset modal fields when clicking outside modal
  }
});

function resetModal() {
  groupNameInput.value = "";
  // Uncheck all checkboxes
  document
    .querySelectorAll(".member-checkbox")
    .forEach((checkbox) => (checkbox.checked = false));
}

function showGroupChats(group) {
  // Remove the 'selected' class from all group names
  var groupNames = document.querySelectorAll('.group-name');
  groupNames.forEach(function(element) {
      element.classList.remove('selected');
  });
    
  // Add the 'selected' class to the clicked group
  group.classList.add('selected');

  
  dynamicContent.innerHTML = ''
  //creating main chat div container
  const div = document.createElement('div');
  div.classList.add('container');
  dynamicContent.appendChild(div)

  // adding send input to body
  var sendInput = `
  <div class="send">
      <form onsubmit="storeChat(event, '${group.textContent}')" class="send-container">
        <input type="text" name="msg" id="msg">
        <button type="submit" class="btn"><b>Send</b></button>
    </form>
  </div>`;

  dynamicContent.insertAdjacentHTML("beforeend", sendInput);

  getChats(group.textContent);
}

function showGroupsOnScreen(groupName){
  const div = document.createElement("div");
  div.textContent = groupName;
  div.classList.add("group-name");

  // to show specific chats
  div.addEventListener('click', () => {showGroupChats(div)})
  
  groupsContainer.appendChild(div);
}

function showUsersOnModel(userName){
  const membersList = document.getElementById("membersList");

  var checkboxesHTML = `<label><input type="checkbox" class="member-checkbox" value="${userName}"> ${userName}</label><br>`;

  membersList.insertAdjacentHTML("beforeend", checkboxesHTML);
}