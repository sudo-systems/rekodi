var app = require('app');
var Tray = require('tray');
var BrowserWindow = require('browser-window');

require('crash-reporter').start();

var mainWindow = null;
var appIcon = null;

app.on('window-all-closed', function() {
  if (process.platform != 'darwin') {
    app.quit();
  }
});

app.on('ready', function() {
  appIcon = new Tray(__dirname+ '/icon_tray.png');
  
  mainWindow = new BrowserWindow({
    width: 500, 
    height: 800,
    frame: false,
    resizable: false,
    title: 'ReKODI',
    icon: __dirname+ '/icon.png'
  });
  
  mainWindow.loadUrl('file://' +__dirname+ '/public/player.html');
  mainWindow.openDevTools();

  mainWindow.on('closed', function() {
    mainWindow = null;
    app.quit();
  });
});
