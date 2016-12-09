**WARNING**: This is not a stable version. We are currently developing things, and it may have heavy security problems, have parts not finished, have parts broken, or crash unexpectedly. I do not recommend you to use it in production yet.

# inapp-support
HTML5 inApp support chat using your own firebase account. Just put your firebase details in js/firebase.js (as in firebase console is given to you), and add to your code:

```html
<!-- Include IASChat -->
<script src="js/chat.js"></script>

<!-- Main working -->
<script type="text/javascript">	
window.onload = function() {
  window.IASChat = new IASChat({
    uid: '33g07u1sDg44aa12', // The user id here
    name: 'CodingCarlos',    // The user name here
    button: true
  });
};
</script>
```

And it's done!

---

## Configuration
### client js
To configure the chat, just use the object passed on IASChat instantiation.

 - uid: String User id (if you put a Number, shall work, but I can't promise you that it will work as expected)
 - name: String User name
 - button: Boolean Show or not the fab button to open the chat
 
 Next up!
 
  - Topbar background color
  - Topbar text color
  - Topbar default image
  - Topbar default "support" name
  - Fab background color
  - Fab icon color

### firebase
Right now, I'm not sure how to configure firebase well, but I will do my research

## Support panel
Take the code in support.html and add to your existent panel. Yes, so easy. Yes, I've done very little work on this part.

### Assign user to supporter
For now, no assignation is done. In v0.1, supporter wil got assigned any chat that answer. Unassigned chats will appear to all supporters. To change assignation, for now, you have to do it in firebase console. In v0.2 the actual supporter will be able to change the supporter assigned to the chat.

### Add supporters
Will be a beautifull form to do that in the 0.2. Now, initialize the user and done.

### Secure the panel
Yes, I shall work on this.

  
## Responsiveness
Nope, right now is not desktop/tablet responsive, just mobile, but I'm doing my best to add larger screnn support. 
