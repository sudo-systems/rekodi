var kodi = require('xbmc-ws');
var kodiStatus = null;
var wsConnection = null;

var KodiStatus = function () {
  this.setPlaybackControls = function(state) {
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
  };
  
  this.setVolume = function(volume, isMuted) {
    var $volumeControl = $('#player #controls #volumeSlider');
  };
  
  var showNoConnectionOverlay = function(show) {
    var $noConnectionOverlay = $('#player .noConnectionOverlay');
    
    if(show) {
      $noConnectionOverlay.fadeIn(250);
    }
    else {
      $noConnectionOverlay.fadeOut(250);
    }
  };
  
  this.setConnected = function(connected, message) {
    var $heartbeatIcon = $('#player #controls .heartbeat');
    
    if(message) {
      new Notification(message);
    }
    
    if(connected) {
      $heartbeatIcon.removeClass('offline').addClass('online');
      showNoConnectionOverlay(false);
    }
    else {
      wsConnection = null;
      $heartbeatIcon.removeClass('online').addClass('offline');
      showNoConnectionOverlay(true);
    }
  };
};

kodiStatus = new KodiStatus();

setInterval(function() {
  if(wsConnection === null) {
    establishWsConnection();
  }
}, 10000);

function establishWsConnection(callback) {
  kodi('donda.nl', 9090).then(function(connection) {
    kodiStatus.setConnected(true, 'Kodi connection established');
    wsConnection = connection;
    callback();
  },
  function(error) {
    kodiStatus.setConnected(false);
  });
}

$(document).ready(function() {
  establishWsConnection(function() {
    

    /* PLAYER EVENTS */
    wsConnection.Player.OnPause(function(response) {
      kodiStatus.setPlaybackControls('paused');
    });

    wsConnection.Player.OnPlay(function(response) {
      kodiStatus.setPlaybackControls('playing');
    });

    wsConnection.Player.OnStop(function(response) {
      kodiStatus.setPlaybackControls('stopped');
    });

    /* APPLICATION EVENTS */
    wsConnection.Application.OnVolumeChanged(function(response) {
      kodiStatus.setVolume(response.data.volume, response.data.muted);
    });

    /* SYSTEM EVENTS */
    wsConnection.System.OnQuit(function(response) {
      kodiStatus.setConnected(false, 'The connection with Kodi has been lost');
    });

    wsConnection.System.OnRestart(function(response) {
      kodiStatus.setConnected(false, 'Kodi is rebooting');
    });

    wsConnection.System.OnSleep(function(response) {
      
      kodiStatus.setConnected(false, 'Kodi went to sleep');
    });

    wsConnection.System.OnWake(function(response) {
      kodiStatus.setConnected(true, 'Kodi connection established');
    });
  });
});
