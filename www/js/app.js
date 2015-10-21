/*
 * Please see the included README.md file for license terms and conditions.
 */


// This file is a suggested starting place for your code.
// It is completely optional and not required.
// Note the reference that includes it in the index.html file.


/*jslint browser:true, devel:true, white:true, vars:true */
/*global $:false, intel:false app:false, dev:false, cordova:false */



// This file contains your event handlers, the center of your application.
// NOTE: see app.initEvents() in init-app.js for event handler initialization code.

// function myEventHandler() {
//     "use strict" ;
// // ...event handler code here...
// }

function onAppReady() {
    if( navigator.splashscreen && navigator.splashscreen.hide ) {   // Cordova API detected
        navigator.splashscreen.hide() ;
    }
}
document.addEventListener("app.Ready", onDeviceReady, false);

// ...additional event handlers here...
//Global instance of DirectoryEntry for our data
var DATADIR;
var knownfiles = [];

//Loaded my file system, now let's get a directory entry for where I'll store my crap
function onFSSuccess(fileSystem) {
    fileSystem.root.getDirectory("com.camden.imagedownloaddemo",{create:true},gotDir,onError);
}

//The directory entry callback
function gotDir(d){
    console.log("got dir");
    DATADIR = d;
    var reader = DATADIR.createReader();
    reader.readEntries(function(d){
        gotFiles(d);
        appReady();
    },onError);
}

//Result of reading my directory
function gotFiles(entries) {
    console.log("The dir has "+entries.length+" entries.");
    for (var i=0; i<entries.length; i++) {
        console.log(entries[i].name+' dir? '+entries[i].isDirectory);
        knownfiles.push(entries[i].name);
        renderPicture(entries[i].fullPath);
    }
}

function renderPicture(path){
    $("#photos").append("<img src='"+cordova.file.externalRootDirectory+path+"'>");
    console.log("<img src='"+cordova.file.externalRootDirectory+path+"'>");
}

function onError(e){
    console.log("ERROR");
    console.log(JSON.stringify(e));
}

function onDeviceReady() {
    //what do we have in cache already?
    $("#status").html("Checking your local cache....");
     window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, onFSSuccess, null);
}

function appReady(){
    $("#status").html("Ready to check remote files...");
    $.get("http://dpaluszak.pl/aimg/imagelist.php", {}, function(res) {
        if (res.length > 0) {
            $("#status").html("Going to sync some images...");
            for (var i = 0; i < res.length; i++) {
                if (knownfiles.indexOf(res[i]) == -1) {
                    console.log("need to download " + res[i]);
                    var ft = new FileTransfer();
                    var store = cordova.file.externalRootDirectory + "com.camden.imagedownloaddemo/" + res[i];
                    console.log(store);
                    var dlPath = DATADIR.fullPath + "/" + res[i];
                    console.log("downloading crap to " + store);
                    var file_name = "com.camden.imagedownloaddemo/" +res[i];
                    ft.download("http://dpaluszak.pl/aimg/pdf/" + escape(res[i]), store, function(){
                    renderPicture(file_name);
                    console.log("Successful download of "+store);
                    }, onError);
                }
            }
        }
        $("#status").html("");
    }, "json");

}

