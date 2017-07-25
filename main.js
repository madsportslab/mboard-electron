const {app, BrowserWindow} = require("electron");

const pug = require("electron-pug")({pretty: true}, null);

const path = require("path");
const url  = require("url");
const req  = require("request");

var os = require("os");

let mainWindow

function getAddress(name) {

  var retval = "127.0.0.1";
  var ifaces = os.networkInterfaces();

  Object.keys(ifaces).forEach(function(ifname) {

    if(ifname === name) {

      ifaces[ifname].forEach(function(ifconf) {

        if(ifconf.family === "IPv4") {
          retval = ifconf.address;
        }

      });

    }
  
  });

  return retval;
  
} // getAddress

function checkAvailability(url, fn) {

  req(url, function(err, res, body) {

    if(res === undefined) {
      fn(false);
    } else if(res && res.statusCode === 0) {
      fn(false);
    } else if(res && res.statusCode === 200) {
      fn(true);  
    } else {
      fn(false);
    }

  });

} // checkAvailability

function createWindow() {

  mainWindow = new BrowserWindow();
  mainWindow.setFullScreen(true);

  mainWindow.loadURL(`file://${__dirname}/splashscreen.pug`);

  mainWindow.on("closed", function() {
    mainWindow = null;
  });

} // createWindow

app.on("ready", createWindow)

app.on("window-all-closed", function() {

  if(process.platform !== "darwin") {
    app.quit();
  }

});

app.on("activate", function() {

  if(mainWindow === null) {
    createWindow();
  }

});

setTimeout(function() {

  var ip = getAddress("en");
  
  if(ip === null) {

    console.log("IP address not found.");
    mainWindow.loadURL(`file://${__dirname}/error.no.ip.pug`);

  } else {

    var url = "http://" + ip + ":9002/setup";

    checkAvailability(url, function(ret) {

      if(ret) {
        mainWindow.loadURL(url);
        //mainWindow.loadURL(`file://${__dirname}/setup.pug`);
        //mainWindow.loadURL(`file://${__dirname}/display.pug`);
      } else {
        mainWindow.loadURL(`file://${__dirname}/error.no.service.pug`);
      }

    });

    mainWindow.on("closed", function() {
      mainWindow = null;
    });

  }
    
}, 2000);
