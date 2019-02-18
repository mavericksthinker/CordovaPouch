
var ENTER_KEY = 13;
var newTodoDom = document.getElementById('new-todo');
var syncDom = document.getElementById('sync-wrapper');
var port = 3000;
var remoteCouch = 'http://localhost:'+port+'/posdemo';
var remote = new PouchDB(remoteCouch);
var app = {
  // Application Constructor
  initialize: function() {
      document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
  },

  // deviceready Event Handler
  //
  // Bind any cordova events here. Common events are:
  // 'pause', 'resume', etc.
  onDeviceReady: function() {
      this.receivedEvent('deviceready');
      startNodeProject();
      cordova.plugins.backgroundMode.enable();
  },
  // Update DOM on a Received Event
  receivedEvent: function(id) {
    syncDom.setAttribute('data-sync-state', 'error');
    console.log('Received Event: ' + id);
  }
};

app.initialize();
  // EDITING STARTS HERE (you dont need to edit anything above this line)

  var db = new PouchDB('posdemo');

  db.changes({
  since: 'now',
  live: true
  }).on('change', console.log);

  // Initialise a sync with the remote server
//  function sync() {
//  syncDom.setAttribute('data-sync-state', 'syncing');
//  var opts = {live: true,retry:true};
//  db.replicate.to(remoteCouch, opts, syncError);
//  db.replicate.from(remoteCouch, opts,syncError);
//  db.sync(remoteCouch,opts,syncError)
//  syncDom.setAttribute('data-sync-state', 'syncing');
//  db.sync(remoteCouch,opts).on('active',syncSuccess).on('error',syncError)
//  }).on('error',syncError);
//}

  // EDITING STARTS HERE (you dont need to edit anything below this line)

  // There was some form or error syncing
  function syncError() {
    syncDom.setAttribute('data-sync-state', 'error');
  }
  function sync(){
  var opts = {live:true,retry:true};
  db.sync(remoteCouch,opts);
  }

  function syncSuccess() {
    syncDom.setAttribute('data-sync-state', 'syncing');
  }
  // If they press enter while editing an entry, blur it to trigger save
  // (or delete)
  function todoKeyPressed(todo, event) {
    if (event.keyCode === ENTER_KEY) {
      var inputEditTodo = document.getElementById('input_' + todo._id);
      inputEditTodo.blur();
    }
  }

  function addTodo(ports){
  port = ports;
  document.getElementById('new-todo').placeholder = 'Server is running on port : '+port;
  nodejs.channel.post('change',port);
  remoteCouch = 'http://localhost:'+port+'/posdemo';
  /*let fauxton = "'http://localhost:"+port+"/_utils'";
  console.log(fauxton);
  document.getElementById('fauxton').onclick = "window.location="+fauxton+";";
  console.log(document.getElementById('fauxton').onclick);*/
  remote = new PouchDB(remoteCouch);
  console.log('Port changed to '+port);
  }///data/data/com.mav.hottab/files/backup.txt

  function obtainIp(){
  networkinterface.getWiFiIPAddress(onSuccess,onError);
  }

  function onSuccess(ipInfo){
  console.log("IP : "+ipInfo.ip+" Subnet : "+ipInfo.subnet);
  document.getElementById('ip').innerHTML = ipInfo.ip;
  }
  function onError(err){
  console.log(err);
  document.getElementById('ip').innerHTML = "Ip Address";
  }

  function newTodoKeyPressHandler( event ) {
    if (event.keyCode === ENTER_KEY) {
      addTodo(newTodoDom.value);
      newTodoDom.value = '';
    }
  }

  function addEventListeners() {
    newTodoDom.addEventListener('keypress', newTodoKeyPressHandler, false);
  }

  addEventListeners();
function channelListener(msg) {
    console.log('[cordova] received:' + msg);
}

function startupCallback(err) {
    if (err) {
        console.log(err);
    } else {
        console.log ('Node.js Mobile Engine Started');
        nodejs.channel.send('Hello from Cordova!');
    }
};

function startNodeProject() {
    nodejs.channel.setListener(channelListener);
    console.log("port sending : "+port);
    nodejs.channel.post('change',port);
    nodejs.start('main.js', startupCallback);
    //nodejs.channel.on('init',checkIfFileExists);
    // To disable the stdout/stderr redirection to the Android logcat:
    // nodejs.start('main.js', startupCallback, { redirectOutputToLogcat: false });
};

setInterval(function(){
  remote.info().then(info=>{
  syncSuccess();
}).catch(err=>{
syncError();
//console.log(err);
});
},3000);

document.addEventListener("DOMContentLoaded",function(){
	this.querySelector(".icon").addEventListener("click",function(){
		let waitClass = "waiting",
			runClass = "running",
			cl = this.classList;

		if (!cl.contains(waitClass) && !cl.contains(runClass)) {
			cl.add(waitClass);
			setTimeout(function(){
				cl.remove(waitClass);
				setTimeout(function(){
					cl.add(runClass);
					setTimeout(function(){
						cl.remove(runClass);
					}, 4000);
				}, 200);
			}, 1800);
		}
	});
});

if(remoteCouch){
  sync();
}

/*function backupClient(){
      nodejs.channel.post('download',"Initiating Download");
    }
*/
function backupServer(){
  nodejs.channel.post('backup','success');
}
/*
function checkIfFileExist(){
var dest = cordova.file.externalRootDirectory+'Download/images.jpeg';
    // path is the full absolute path to the file.
    window.resolveLocalFileSystemURL(dest, fileExists, fileDoesNotExist);
}
function fileExists(fileEntry){
    alert("File " + fileEntry.fullPath + " exists!");
}
function fileDoesNotExist(){
    alert("file does not exist");
}

function checkIfFileExists(paths){
var path = cordova.file.dataDirectory+'backup.txt';
   console.log(path);
   checkIfFileExist();
   window.resolveLocalFileSystemURL(path,  function(fs) {
      var dest = cordova.file.externalRootDirectory+'Download/';
                                              window.resolveLocalFileSystemURL(dest,function(directoryEntry) {
                                                 console.log(directoryEntry.fullPath);
                                                 fs.copyTo(directoryEntry, "database.txt", function() {
                                                    console.log('Download successful');
                                                 }, function(err) {
                                                    console.log('Error : '+err);
                                                 });
                                              }, function(){
                                                  //err
                                              });
                                          }, function(){
                                              //err
                                          });
}*/
