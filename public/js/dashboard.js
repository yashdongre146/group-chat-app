const token = localStorage.getItem("token");
const modal = document.getElementById("myModal");
const closeBtn = document.getElementsByClassName("close")[0];
const groupNameInput = document.getElementById("groupNameInput");
const membersList = document.getElementById("membersList");
const createBtn = document.getElementById("createBtn");
const dynamicContent = document.getElementById("dynamic-content");
const decodedToken = parseJwt(token);

const socket = io();

socket.on('receive', data=>{
  const container = document.querySelector(".container");
  if (data.id === decodedToken.id) {
    if(!data.isImage){
      const div = document.createElement("div");
      div.classList.add("message");
      div.classList.add("right");
      div.appendChild(document.createTextNode(`You: ${data.message}`));
      container.appendChild(div);
    }else{
      const imgDiv = document.createElement("div");
      imgDiv.classList.add("message");
      imgDiv.classList.add("right");
      imgDiv.appendChild(document.createTextNode(`You: `));

      const img = document.createElement("img");
      img.src = data.message;
      img.height = 75;
      img.width = 100;
      // Add click event listener to open image in a new window
      img.addEventListener("click", function() {
        window.open(data.message, "_blank");
      });
      imgDiv.appendChild(img);
      container.appendChild(imgDiv);
    }
  } else {
      if(!data.isImage){
        const div = document.createElement("div");
        div.classList.add("message");
        div.classList.add("left");
        div.appendChild(document.createTextNode(`${data.name}: ${data.message}`));
        container.appendChild(div);
      }else{
        const imgDiv = document.createElement("div");
        imgDiv.classList.add("message");
        imgDiv.classList.add("left");
        imgDiv.appendChild(document.createTextNode(`${data.name}: `));

        const img = document.createElement("img");
        img.src = data.message;
        img.height = 75;
        img.width = 100;
        // Add click event listener to open image in a new window
        img.addEventListener("click", function() {
          window.open(data.message, "_blank");
        });
        imgDiv.appendChild(img);
        container.appendChild(imgDiv);
      }
  }
})

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
      showUsersOnModel(user.name);
    }

    // showing groups on the screen
    for (const group of groupRes.data) {
      showGroupsOnScreen(group.name);
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
    const container = document.querySelector(".container");
    container.innerHTML = "";
    for (let userChatDetails of res.data.chats) {
      if (userChatDetails.userId === decodedToken.id) {
        if (!userChatDetails.isImage) {
          const div = document.createElement("div");
          div.classList.add("message");
          div.classList.add("right");
          div.appendChild(document.createTextNode(`You: ${userChatDetails.message}`));
          container.appendChild(div);
        } else {
          const imgDiv = document.createElement("div");
          imgDiv.classList.add("message");
          imgDiv.classList.add("right");
          imgDiv.appendChild(document.createTextNode(`You: `));

          const img = document.createElement("img");
          img.src = userChatDetails.message;
          img.height = 75;
          img.width = 100;
          // Add click event listener to open image in a new window
          img.addEventListener("click", function() {
            window.open(userChatDetails.message, "_blank");
          });
          imgDiv.appendChild(img);
          container.appendChild(imgDiv);
        }
      } else {
        if (!userChatDetails.isImage) {
          let user;
          for (let userObj of res.data.users) {
            if (userObj.id === userChatDetails.userId) {
              user = userObj;
            }
          }
          const div = document.createElement("div");
          div.classList.add("message");
          div.classList.add("left");
          div.appendChild(document.createTextNode(`${user.name}: ${userChatDetails.message}`));
          container.appendChild(div);
        }else{
          let user;
          for (let userObj of res.data.users) {
            if (userObj.id === userChatDetails.userId) {
              user = userObj;
            }
          }
          // const user = res.data.users[userChatDetails.userId-1];
          const imgDiv = document.createElement("div");
          imgDiv.classList.add("message");
          imgDiv.classList.add("left");
          imgDiv.appendChild(document.createTextNode(`${user.name}: `));

          const img = document.createElement("img");
          img.src = userChatDetails.message;
          img.height = 75;
          img.width = 100;
          // Add click event listener to open image in a new window
          img.addEventListener("click", function() {
            window.open(userChatDetails.message, "_blank");
          });
          imgDiv.appendChild(img);
          container.appendChild(imgDiv);
        }
      }
    }
  } catch (err) {
    console.log(err);
  }
}
async function getGroupMembers(groupName) {
  try {
    const res = await axios.get(`/getGroupMembers?groupName=${groupName}`, {
      headers: { auth: token },
    });
    

    const showMembersDiv = document.querySelector(".showMembersDiv");
    showMembersDiv.innerHTML = "";
    const h3 = document.createElement("h3");
    h3.appendChild(document.createTextNode(`Group Members`));
    showMembersDiv.appendChild(h3);
    for (let groupMember of res.data.groupmembers) {
      const div = document.createElement("div");
      div.appendChild(document.createTextNode(`${groupMember.name}`));

      if (res.data.adminIds.includes(decodedToken.id) && !res.data.adminIds.includes(groupMember.id)) {
        const makeAdmin = document.createElement("button");
        makeAdmin.appendChild(document.createTextNode("Make admin"));
        makeAdmin.addEventListener("click", () => {
          makeUserAdmin(div.firstChild, groupName);
        });

        const removeFromGroup = document.createElement("button");
        removeFromGroup.appendChild(document.createTextNode("Remove From Group"));
        removeFromGroup.addEventListener("click", () => {
          removeUserFromGroup(div.firstChild, groupName);
        });

        div.appendChild(makeAdmin);
        div.appendChild(removeFromGroup);
      }
      showMembersDiv.appendChild(div);
    }
    if (res.data.adminIds.includes(decodedToken.id)) {
      getAllUsers(groupName, res.data.groupmembers);
    }
  } catch (err) {
    console.log(err);
  }
}
async function getAllUsers(groupName, groupMembers) {
  try {
    const res = await axios.get(`/getUsers`, {
      headers: { auth: token },
    });

    //adding empty div to show all users
    const allUsersDiv = document.createElement("div");
    allUsersDiv.id = "allUsersDiv"

    // const allUsersDiv = document.getElementById("allUsersDiv");
    allUsersDiv.innerHTML = "";
    for (let user of res.data) {
      const div = document.createElement("div");
      div.appendChild(document.createTextNode(`${user.name}`));

      if (!groupMembers.some(groupMember => groupMember.id === user.id)) {
        const addToGroup = document.createElement("button");
        addToGroup.appendChild(document.createTextNode("Add to Group"));
        addToGroup.addEventListener("click", () => {
          addUserToGroup(div.firstChild, groupName);
        });
        
        div.appendChild(addToGroup);
      }


      allUsersDiv.appendChild(div);
    }
    const showMembersDiv = document.querySelector(".showMembersDiv");
    const h3 = document.createElement("h3");
    h3.appendChild(document.createTextNode(`All Users:`));
    showMembersDiv.appendChild(h3);
    showMembersDiv.appendChild(allUsersDiv);
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
    await axios.post(`/storeChat?groupName=${groupName}`, userMessage, {
      headers: { auth: token },
    });

    // // socket code
    socket.emit('send', {message: userMessage.message, decodedToken})
    msg.value = "";
  } catch (err) {
    console.log(err);
  }
}

const selectedDiv = document.querySelector(".selected");
if (selectedDiv) {
  getChats(selectedDiv.textContent);
}

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

    const selectedMembers = Array.from(
      document.querySelectorAll(".member-checkbox:checked")
    ).map((checkbox) => checkbox.value);

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
      showGroupsOnScreen(groupName);
    } else {
      alert("Please add atleast one member to the group.");
    }

    modal.style.display = "none";
    resetModal();
  } catch (error) {
    alert("Something went wrong!");
  }
}

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

async function showGroupChats(group) {
  // Remove the 'selected' class from all group names
  var groupNames = document.querySelectorAll(".group-name");
  groupNames.forEach(function (element) {
    element.classList.remove("selected");
  });

  // Add the 'selected' class to the clicked group
  group.classList.add("selected");

  dynamicContent.innerHTML = "";
  //creating main chat div container
  const div = document.createElement("div");
  div.classList.add("container");
  dynamicContent.appendChild(div);

  //creating div to show group members to the users and all users
  const showMembersDiv = document.createElement("div");
  showMembersDiv.classList.add("showMembersDiv");
  dynamicContent.appendChild(showMembersDiv);

  // adding send input to body
  var sendInput = `
  <div class="send">
      <form onsubmit="storeChat(event, '${group.textContent}')" class="send-container">
        <input type="text" name="msg" id="msg">
        <input type="file" id="imageInput" accept="image/*">
        <button type="button" class="btn" onclick="sendImages('${group.textContent}')"><b>Send Images</b></button>
        <button type="submit" class="btn"><b>Send</b></button>
    </form>
  </div>`;
  document.body.insertAdjacentHTML("beforeend", sendInput);

  getChats(group.textContent);
  getGroupMembers(group.textContent);
}

function showGroupsOnScreen(groupName) {
  const groupsContainer = document.getElementById("groupsContainer");

  const div = document.createElement("div");
  div.textContent = groupName;
  div.classList.add("group-name");

  // to show specific chats
  div.addEventListener("click", () => {
    showGroupChats(div);
  });
  groupsContainer.appendChild(div);
}

function showUsersOnModel(userName) {
  const membersList = document.getElementById("membersList");

  var checkboxesHTML = `<label><input type="checkbox" class="member-checkbox" value="${userName}"> ${userName}</label><br>`;

  membersList.insertAdjacentHTML("beforeend", checkboxesHTML);
}

async function makeUserAdmin(userName, groupName) {
  try {
    const res = await axios.get(`/makeUserAdmin?userName=${userName.textContent}&groupName=${groupName}`, {
      headers: { auth: token },
    });

    alert(res.data.message)
  } catch (err) {
    alert("User is already admin")
  }
}
async function removeUserFromGroup(userName, groupName) {
  try {
    await axios.get(`/removeUserFromGroup?userName=${userName.textContent}&groupName=${groupName}`, {
      headers: { auth: token },
    });

    getGroupMembers(groupName)
    alert("user deleted.")
  } catch (err) {
    alert("something went wrong.")
  }
}
async function addUserToGroup(userName, groupName) {
  try {
    await axios.get(`/addUserToGroup?userName=${userName.textContent}&groupName=${groupName}`, {
      headers: { auth: token },
    });

    getGroupMembers(groupName)
    alert("user added.")
  } catch (err) {
    alert("something went wrong.")
  }
}
async function sendImages(groupName){
  var fileInput = document.getElementById('imageInput');
  var file = fileInput.files[0];

  if (file) {
    console.log("Selected image:", file);
    const formData = new FormData();
    formData.append('imageFile', file);
    formData.append('groupName', groupName);
    const res = await axios.post('/sendImages', formData, {
      headers: { auth: token}      
    });
    // // socket code
    socket.emit('send', {message: res.data.fileUrl, isImage: res.data.isImage, decodedToken})
  } else {
    alert("No image selected.");
  }
}
