var RekodiApp = require(__dirname+ '/js/lib/rekodi-app');
var rekodiApp = new RekodiApp();

function init() {
  rekodiApp.dom.set({
    heartbeatIcon: $('#player #controls .heartbeat'),
    noConnectionOverlay: $('#player .noConnectionOverlay'),
    pauseButton: $('#player #controls [data-button=pause]'),
    playButton: $('#player #controls [data-button=play]'),
    stopButton: $('#player #controls [data-button=stop]')
  });
  
  new rekodiApp.tabs($('#mainTabsWrapper'));
  rekodiApp.gui.initTooltips();
  
  rekodiApp.eventClient.connect(function() {
    rekodiApp.controls.init();
  });
  
  rekodiApp.api.connectPersistent(function() {
    /* PLAYER EVENTS */
    rekodiApp.api.link.Player.OnPause(function(response) {
      rekodiApp.gui.setPlaybackControls(rekodiApp.enums.api.PAUSED);
    });

    rekodiApp.api.link.Player.OnPlay(function(response) {
      rekodiApp.gui.setPlaybackControls(rekodiApp.enums.api.PLAYING);
    });

    rekodiApp.api.link.Player.OnStop(function(response) {
      rekodiApp.gui.setPlaybackControls(rekodiApp.enums.api.STOPPED);
    });

    /* APPLICATION EVENTS */
    rekodiApp.api.link.Application.OnVolumeChanged(function(response) {
      rekodiApp.gui.setVolume(response.data.volume, response.data.muted);
    });

    /* SYSTEM EVENTS */
    rekodiApp.api.link.System.OnQuit(function(response) {
      rekodiApp.gui.setConnected(false, 'The connection with Kodi has been lost');
    });

    rekodiApp.api.link.System.OnRestart(function(response) {
      rekodiApp.gui.setConnected(false, 'Kodi is rebooting');
    });

    rekodiApp.api.link.System.OnSleep(function(response) {
      rekodiApp.gui.setConnected(false, 'Kodi went to sleep');
    });

    rekodiApp.api.link.System.OnWake(function(response) {
      rekodiApp.gui.setConnected(true, 'Kodi connection established');
    });
});
}

$(document).ready(function() {
  init();
});