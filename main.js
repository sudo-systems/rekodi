var app = require('app');
var Tray = require('tray');
var Menu = require('menu');
var MenuItem = require('menu-item');
var BrowserWindow = require('browser-window');

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
    title: 'ReKODI',
    icon: __dirname+ '/icon.png'
  });
  
  mainWindow.loadUrl('file://' +__dirname+ '/public/player.html');

  mainWindow.on('closed', function() {
    mainWindow = null;
    app.quit();
  });
}

function createSettingsWindow() {
  settingsWindow = new BrowserWindow({
    width: 640,
    height: 480,
    frame: false,
    resizable: false
  });

  settingsWindow.loadUrl('file://' + __dirname + '/public/settings.html');

  settingsWindow.on('closed', function() {
    settingsWindow = null;
    mainWindow.focus();
  });
}

function createTaryIcon() {
  appIcon = new Tray(__dirname+ '/icon_tray.png');
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
    label: 'Settings', 
    click: function() {
      mainWindow.focus();
      createSettingsWindow();
    } 
  }));
  
  taryContextMenu.append(new MenuItem({ 
    label: 'Quit', 
    click: function() { 
      mainWindow.close();
    } 
  }));
  
  appIcon.setToolTip('ReKODI, the KODI remote');
  appIcon.setContextMenu(taryContextMenu);
}
