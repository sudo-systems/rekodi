var remote = require('remote');
var mainWindow = remote.getCurrentWindow();
var player = null;
var fs = require('fs');
var path = require('path');
var xec = require('xbmc-event-client');
var volumeSlider = null;

var opts = {
  log: false,
  icontype: xec.ICON_PNG,
  //iconbuffer: fs.readFileSync('./node.png'),
  host: 'donda.nl',
  port: 9777
};

var kodiEventClient = new xec.XBMCEventClient('ReKodi', opts);

kodiEventClient.connect(function(errors, bytes) {
  if (errors.length) {
    alert('Could not connect to KODI Event Sever. Please check your sttings.');
  }
});

var Player = function() {
  this.initTooltips = function() {
    $('[title]').jBox('Tooltip',  {
      animation: 'move'
    });
  };
  
  this.loadPartials = function() {
    $('#player [data-partial]').each(function() {
      var loThis = $(this);
      var templatePartial = 'partials/'+$(this).attr('data-partial')+'.html';

      $.ajax({
        url: templatePartial,
        success: function(data) {
          loThis.html(data);
        },
        error: function(error) {
          console.error(error);
        }
      });
    });
  };
  
  this.initWindowControls = function() {
    $('#player #topBar .windowControls .button.close').on('click', function() {
      mainWindow.close();
    });

    $('#player #topBar .windowControls .button.minimize').on('click', function() {
      mainWindow.minimize();
    });
  };
  
  this.initPlaybackControls = function() {
    $('#player #controls li').on('click', function() {
      kodiEventClient.remotePress($(this).attr('data-button'));
    });
  };
  
  this.initVisualElements = function() {
    volumeSlider = new Dragdealer('volumeSlider');
    
    var magicLine = $('#player nav .magic-line');
    magicLine.css('left', $('#player nav li.active').position().left).data('origLeft', magicLine.position().left).data('origWidth', magicLine.width());

    $('#tabsWrapper nav li').on('click', function(e) {
      e.preventDefault();

      $('#tabsWrapper nav li').removeClass('active');
      $(this).addClass('active');

      var index = $(this).index();
      $('#tabsWrapper .tabs').attr('data-tab', index);

      var leftPos = $(this).position().left;
      var newWidth = $(this).width();

      magicLine.stop().animate({
        left: leftPos,
        width: newWidth
      }, 500);
    });
  };
};

function init() {
  player = new Player();
  player.initVisualElements();
  player.initTooltips();
  player.loadPartials();
  player.initPlaybackControls();
}

$(document).ready(function() {
  init();
});