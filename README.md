![shieldsIO](https://img.shields.io/github/issues/CodingCarlos/inapp-support.svg)
![shieldsIO](https://img.shields.io/github/release/CodingCarlos/inapp-support.svg)
![shieldsIO](https://img.shields.io/badge/license-AGPL-blue.svg)

**WARNING**: This is not a stable version. We are currently developing things, and it may have heavy security problems, have parts not finished, have parts broken, or crash unexpectedly. I do not recommend you to use it in production yet.

# inapp-support
HTML5 inApp support chat using your own firebase account. It is also possible to send images. Just include firebase, your config (as in firebase console is given to you), and add to your code:

```html
<!-- Include IASChat, take it from dist/chat.js -->
<script src="js/chat.js"></script>

<!-- Main working -->
<script type="text/javascript">	
window.onload = function() {
  window.IASChat = new IASChat({
    uid: '33g07u1sDg44aa12', // The user id here
    name: 'CodingCarlos',    // The user name here
    pic: 'http://yourdomain.com/pic/user/pic.jpg' // The user picture here
    button: true
  });
};
</script>
```

And it's done!

---

## Configuration
### client js
To configure the chat, just use the object passed on IASChat instantiation. *Bold are mandatory*

 - **uid**: String User id (if you put a Number, shall work, but I can't promise you that it will work as expected)
 - **name**: String User name
 - **pic**: String User picture
 - **button**: Boolean Show or not the fab button to open the chat
 - mainColor: Color [hex, name, rgb, rgba] Main color (chat topbar background, show button background and chat input border bottom)
 - textColor: Color Main text color (Chat topbar text/icons, show button text/icons)
 - topbarBg: Color Chat topbar background color
 - topbarColor: Color Chat topbar text and icons color
 - buttonBg: Color Show button background color
 - buttonColor: Color Show button text/icon color
 - inputBorderColor: Color Chat text input border bottom color
 - container: String Container for chat (*#identifier* or *.className*)
 - hashSign: String Symbol or string to add before url hash when chat open (Default: '?'. I.e.: url#existentHash**?**ias=true)
 - defaultSupportName: String Default support name (if no supporter assigned)
 - defaultSupportPic: String Default support picture (if no supporter assigned)
 - uploadFiles: Boolean Enable or disable the option to upload and send files (Default: true)
 - onlyPictures: Boolean Allow only pictures, or all file types (Default: true)

In IASChatProvider, there are some extra features:
 - container: String Container for support panel (*#identifier* or *.className*. Default: *body*)
 - chatContainer: String Container for chat (*#identifier* or *.className*. Default: *body* or support container)

 
*I'm open to any suggestion or request for more configuration params. Don't hesitate to open a new Issue*

### firebase
Create a new firebase project (or use a existing one), and add the configuration script to your code, if possible, before including chat.js.

Then, configure your security rules according to your authentication method (if you are already using firebase authentication as app authentication, the same authentication is valid). If you are not already using firebase authentication, but a custom method, maybe you shall [use the firease custom authentication method](https://firebase.google.com/docs/auth/web/custom-auth) (I'll try to add more info and demos in the future).

Just for a test, set the rules as this for database:
```
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```
And for storage:
```
service firebase.storage {
  match /b/chat-e6e7d.appspot.com/o {
    match /{allPaths=**} {
    	allow read, write: if true;
      //allow read, write: if request.auth != null;
    }
  }
}
```
**Be careful**: *This allows anybody to read and write ALL your database and files. This is just for test prouposes, not for production.*

## Support panel
Check the code in demo/support.html to add to your existent panel. No authorization/authentication done here. That is your work in your own control/support pannel. As said before, you shall check yourself the firebase rules.

```html
<!-- Include IASChat -->
<script src="js/chat.js"></script>
<!-- Include IASChat Support Provider -->
<script src="js/provider.js"></script>

<!-- Main working -->
<script type="text/javascript">	
window.onload = function() {
  window.IASChatProvider = new IASChatProvider({
    uid: '8sd0df4s8f0ss', // The support user id here
    name: 'Supporter',    // The support user name here
    pic: 'http://yourdomain.com/pic/user/pic.jpg' // The supporter picture here
    container: '#container' // OPTIONAL: Container for support pannel (*#identifier* or *.className*).
  });
};
</script>
```

### Assign user to supporter
Supporter wil got assigned any chat that answer. Unassigned chats will appear to all supporters. To change assignation, for now, you have to do it in firebase console. 

In the future any supporter will be able to assign a chat, or change it's assignations to other supporter. But so, in the future.

### Add supporters
Initialize the support user, and done.

### Secure the panel
This is your work. Support pannel in demo folder is not really a support panel, but a demo. This is not a fully control panel app, just a support chat "component" to add to your existing app.


## Contribute
You can use this code as you like. If you find a bug, or want to ask for a feature, just open an issue, and we'll do our best. If you can fix it, do a pull request to ``dev`` branch, and we promise to review it as fast as possible to merge it. 

If you are new on this open source world, here is a short guide about how to make a pull request to contribute:

1. [Fork](https://github.com/CodingCarlos/inapp-support/fork) then clone `git clone git@github.com:your-username/inapp-support.git` inapp-support repository
2. Create a new branch in your personally forked repo, with a name similar to your edits, such as `fix-whatever`
3. Make your edits inside your new branch
4. Commit them and push them back to your personal github fork
5. Make a new [Pull Request](https://github.com/CodingCarlos/inapp-support/compare/) on the inapp-support repo. Point your branch to the `dev` inapp-support branch and submit.

I will do my best to review and accept the commit as soon as possible.
