var kodi = require('xbmc-ws');

$(document).ready(function() {
  kodi('donda.nl', 9090).then(function(connection) {
    connection.Player.OnPause(function(serverData) {
      setControlState('paused');
    });

    connection.Player.OnPlay(function(serverData) {
      setControlState('playing');
    });

    connection.Player.OnStop(function(serverData) {
      setControlState('stopped');
    });
  });
});

function setControlState(state) {
  var $pauseButton = $('#player #controls [data-button=pause]');
  var $playButton = $('#player #controls [data-button=play]');
  var $stopButton = $('#player #controls [data-button=stop]');
  
  if(state === 'playing') {
    $playButton.hide();
    $pauseButton.css('display', 'inline-block');
    $stopButton.css('display', 'inline-block');
  }
  else if(state === 'paused') {
    $playButton.css('display', 'inline-block');
    $pauseButton.hide();
    $stopButton.css('display', 'inline-block');
  }
  else {
    $playButton.css('display', 'inline-block');
    $pauseButton.hide();
    $stopButton.hide();
  }
}
