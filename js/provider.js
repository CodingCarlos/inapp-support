/*Fill the users list*/

var usersRef = firebase.database().ref('users');
	
	usersRef.orderByChild("timestamp").on('child_added', function(snapshot){
	    var data = snapshot.val();
	    console.log("data:", data)
	    //document.getElementById("orderByChild").innerHTML += "<li>" + snapshot.key() + " was " + snapshot.val().height + " meters tall</li>";
	});
	
	userListEvents()

/*
var ref = new Firebase("https://dinosaur-facts.firebaseio.com/dinosaurs");
  ref.orderByChild("height").on("child_added", function(snapshot) {
    console.log(snapshot.key() + " was " + snapshot.val().height + " meters tall");
 });
*/

/*Set the Events for users list*/
function userListEvents(){
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
}