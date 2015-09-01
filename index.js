var app = require('app');
var Tray = require('tray');
var Menu = require('menu');
var MenuItem = require('menu-item');
var BrowserWindow = require('browser-window');

require('wiredep')({ 
  cwd: __dirname,
  src: 'app/index.html'
});
require('crash-reporter').start();

var mainWindow = null;
var settingsWindow = null;
var appIcon = null;

app.on('window-all-closed', function() {
  if (process.platform != 'darwin') {
    app.quit();
  }
});

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

  mainWindow.on('closed', function() {
    mainWindow = null;
    app.quit();
  });
}

function createTaryIcon() {
  appIcon = new Tray(__dirname+ '/assets/icon_tray.png');
  var taryContextMenu = new Menu();
  
  taryContextMenu.append(new MenuItem({ 
    label: 'Show', 
    click: function() { 
      mainWindow.focus();
    } 
  }));
  
  taryContextMenu.append(new MenuItem({ 
    label: 'Open development tools', 
    click: function() { 
      mainWindow.openDevTools();
    } 
  }));

  taryContextMenu.append(new MenuItem({ 
    label: 'Quit', 
    click: function() { 
      mainWindow.close();
    } 
  }));
  
  appIcon.setToolTip('ReKodi, the Kodi remote');
  appIcon.setContextMenu(taryContextMenu);
}
