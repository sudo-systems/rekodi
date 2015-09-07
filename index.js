var app = require('app');
var Tray = require('tray');
var Menu = require('menu');
var MenuItem = require('menu-item');
var BrowserWindow = require('browser-window');
require('crash-reporter').start();

require('wiredep')({ 
  cwd: __dirname,
  src: 'app/index.html'
});

var mainWindow = null;
var settingsWindow = null;
var trayIcon = null;

app.on('ready', function() {
  createMainWindow();
  createTaryIcon();
});

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 500, 
    height: 700,
    frame: false,
    resizable: false,
    title: 'ReKodi',
    icon: __dirname+ '/assets/icon.png',
    show: false
  });
  
  mainWindow.setMaxListeners(0);
  mainWindow.loadUrl('file://' +__dirname+ '/app/index.html');
  
  mainWindow.webContents.on('did-finish-load', function() {
    mainWindow.show();
  });

  mainWindow.on('window-all-closed', function() {
    mainWindow = null;
    app.quit();
  });
}

function createTaryIcon() {
  trayIcon = new Tray(__dirname+ '/assets/icon_tray.png');
  var taryContextMenu = new Menu();
  
  taryContextMenu.append(new MenuItem({ 
    label: 'Show', 
    click: function() { 
      mainWindow.focus();
    } 
  }));

  taryContextMenu.append(new MenuItem({ 
    label: 'Quit', 
    click: function() { 
      mainWindow.close();
    } 
  }));
  
  trayIcon.setToolTip('ReKodi, the Kodi remote');
  trayIcon.setContextMenu(taryContextMenu);
}
