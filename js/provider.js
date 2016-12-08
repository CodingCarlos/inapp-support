var usersChat = document.getElementsByClassName("users-chat");

function usersChatManagement(event) {
    var event = event || window.event;
    var element = event.target || event.srcElement;
    window.IASChat.setUser({
        cid: element.getAttribute("data-cid"), 
        uid: element.getAttribute("data-uid")
    }); 
    window.IASChat.open(event);
};

for (var i = 0; i < usersChat.length; i++) {
    usersChat[i].addEventListener('click', usersChatManagement, false);
}
