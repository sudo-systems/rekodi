var remote = require('remote');
var settingsWindow = remote.getCurrentWindow();

$(document).ready(function() {
  $('#settings #topBar .windowControls .button.close').on('click', function() {
    settingsWindow.close();
  });
});