var remote = require('remote');
var BrowserWindow = remote.require('browser-window');
var kodiRcWindow = null;
var mainWindow = remote.getCurrentWindow();

$(document).ready(function() {
  /*$('#showRemote').on('click', function() {
    kodiRcWindow = new BrowserWindow({
      width: 400,
      height: 500
    });

    kodiRcWindow.loadUrl('file://' + __dirname + '/remote.html');
    
    kodiRcWindow.on('closed', function() {
      remoteWindow = null;
    });
  });*/
  
  $('#topBar .windowControls .button.close').on('click', function() {
    mainWindow.close();
  });
  
  $('#topBar .windowControls .button.minimize').on('click', function() {
    mainWindow.minimize();
  });
});