/**
 * sailing.js
 */

// Declare variables
var $titleBox = $(".title-box");
var $title = $(".title-container");
var $racetrack = $(".racetrack");
var $header = $(".header");
var $settingsTrigger = $("#settingsTrigger");
var $namesTrigger = $("#namesTrigger");
var $resetTrigger = $("#resetTrigger");
var $settings = $(".settings");
var $names = $(".names");
var $close = $(".close");
var $selector = $("#groups, #questions");

// Declare audio files
var theme = new Audio(
  "https://s3-us-west-2.amazonaws.com/s.cdpn.io/930851/spongebob.mp3" // spongebob theme
);
var sail = new Audio(
  "https://s3-us-west-2.amazonaws.com/s.cdpn.io/930851/sail.mp3" // sail declaration
);
var winner = new Audio(
  "https://s3-us-west-2.amazonaws.com/s.cdpn.io/930851/winner.mp3" // you win
);

// Initialize the scoreboard
$(document).ready(function() {
  var racetrack = new Racetrack();
  racetrack.create();
});

// Hide the title when it is clicked
// and show the header and racetrack
$titleBox.click(function() {
  theme.play();
  $title.hide("slow");
  $header.show("slow");
  $racetrack.show("slow");
});

// Reveal header when hovered
$header.hover(function() {
  $header.toggleClass("active");
});

// Play sail audio when a marker is clicked
// that is not the final marker
$(document).on("click", ".marker:not(:last-of-type)", function() {
  sail.play();
  advanceMarker($(this));
});

// Play winner audio when a marker is clicked
// that is the final marker
$(document).on("click", ".marker:last-of-type", function() {
  winner.play();
  advanceMarker($(this));
});

// Close the data-target element when
// a close button is clicekd
$close.click(function() {
  var $this = $(this);
  var targetId = $this.data("target");
  var $target = $("#" + targetId);
  $target.hide();
});

// Show the settings modal when the
// settings trigger is clicked
$settingsTrigger.click(function() {
  $settings.css("display", "flex");
});

// Show the names modal when the
// names trigger is clicked
$namesTrigger.click(function() {
  var names = new Names();
  names.addNameInputs();
  $names.css("display", "flex");
});

// Recreate the racetrack when the
// reset trigger is clicked
$resetTrigger.click(function() {
  var racetrack = new Racetrack();
  racetrack.create();
});

// Hide the settings or names modal, if displayed,
// when the esc key is pressed
$(document).on("keydown", function(e) {
  if (e.keyCode === 27) { // esc
    $settings.hide();
    $names.hide();
  }
});

// Recreate the racetrack when there is a change
// in the number of groups or questions
$selector.change(function() {
  var racetrack = new Racetrack();
  racetrack.create();
});

// Resize the racetrack and markers when the
// window is resized
$(window).resize(function() {
  var racetrack = new Racetrack();
  racetrack.resize();
});

// Changes the displayed team name when changed
// in the team names modal
$(document).on("change", "input[name^='team-']", function() {
  var $input = $(this);
  var $target = $("#" + $input.attr("name"));
  var $name = $input.val();
  $target.text($name);
});

/**
 * Advances the given scoreboard marker
 */
var advanceMarker = function($marker) {
  var $parent = $marker.parent();
  var $active = $parent.find(".active");
  $marker.toggleClass("active");
  $active.toggleClass("active");
};


/**
 * Class responsible for creating and changing team names
 */
class Names {
  constructor() {
    this.inputs = $(".name-inputs");
    this.titles = $(".track-title");
    this.numGroups = this.getNumGroups();
  }

  // Adds the given qty of name inputs to the team names modal
  addNameInputs() {
    var inputs = [];
    this.titles.each(function(index) {
      var num = (index + 1); // start count at one
      inputs.push("<input type='text' name='team-" + num + "' value='" + $(this).text() + "'>");
    });
    this.inputs.html(inputs.join(""));
  }
  
  // Returns the number of selected groups
  getNumGroups() {
    var racetrack = new Racetrack();
    return racetrack.getSelectedGroups();
  }
}


/**
 * Class responsible for creating and sizing the racetrack
 */
class Racetrack {
  constructor() {
    this.racetrack = $(".racetrack-container");
  }

  // Creates a racetrack with the selected number of groups
  // and questions sized to fit within the user's viewport
  create() {
    this.clear();
    this.addGroups(this.getSelectedGroups());
    this.addQuestions(this.getSelectedQuestions());
    this.resize();
  }

  // Clears all groups and questions from the racetrack
  clear() {
    this.racetrack.html("");
  }

  // Adds the given qty of groups to the racetrack
  addGroups(qty) {
    for (var i = 0; i < qty; i++) {
      var groupNum = (i + 1); // start count at one
      var groupNumText = this._getNumberText(groupNum);
      var group = "" +
          "<div class='track'>" +
            "<div class='track-title' id='team-" + groupNum + "'>" + groupNumText + "</div>" +
            "<div class='marker active'>0</div>" +
          "</div>";
      this.racetrack.append(group);
    }
  }

  // Adds the given qty of questions to each track of the racetrack
  addQuestions(qty) {
    var tracks = this.getTracks();
    var questions = [];
    for (var i = 0; i < qty; i++) {
      var num = (i + 1); // start count at one
      questions.push("<div class='marker'>" + num + "</div>");
    }
    tracks.append(questions.join(""));
  }

  // Resizes the racetrack markers to ensure everything
  // fits within the user's viewport
  resize() {
    this._makeRacetrackInvisible();
    var markers = $(".marker");
    var markerSize = this._getMarkerSize();
    var fontSize = (markerSize - (markerSize * 0.5));
    var titleSize = (markerSize / 0.7);
    var markerStyles = {
      width: markerSize + "px",
      height: markerSize + "px",
      lineHeight: markerSize + "px",
      fontSize: fontSize + "px"
    };
    markers.css(markerStyles);
    var titleStyles = {
      lineHeight: titleSize + "px",
      fontSize: titleSize + "px"
    }
    $(".track-title").css(titleStyles);
    this._makeRacetrackVisible();
  }

  // Returns the number of selected groups
  getSelectedGroups() {
    return parseInt($("#groups").val());
  }

  // Returns the number of selected questions
  getSelectedQuestions() {
    return parseInt($("#questions").val());
  }

  // Returns the tracks that make up the racetrack
  getTracks() {
    return this.racetrack.children(".track");
  }

  // Returns the size of the marker based on the height
  // and width of the tracks
  _getMarkerSize() {
    var tracks = this.getTracks();
    var trackHeight = tracks.height();
    var trackWidth = tracks.width();
    var numQuestions = this.getSelectedQuestions();

    var markerSizeByHeight = trackHeight;
    var markerSizeByWidth = (trackWidth / (numQuestions + 1));

    var markerSizeBase = Math.min(markerSizeByHeight, markerSizeByWidth);
    var markerSize = (markerSizeBase - (markerSizeBase * 0.3));
    return markerSize;
  }

  // Sets the racetrack to display:block and visibility:invisible
  // to keep the racetrack hidden but allow for size measurements
  _makeRacetrackInvisible() {
    $(".racetrack.hidden")
      .removeClass("hidden")
      .css("visibility", "hidden");
  }

  // Sets the racetrack to display:none and visibility:visible
  // to allow the racetrack to be shown by jQuery.show() method
  _makeRacetrackVisible() {
    $(".racetrack")
      .addClass("hidden")
      .css("visibility", "visible");
  }
  
  // Returns the text form of a given number up to 10
  _getNumberText(number) {
    switch(number) {
      case 1: return 'one';
      case 2: return 'two';
      case 3: return 'three';
      case 4: return 'four';
      case 5: return 'five';
      case 6: return 'six';
      case 7: return 'seven';
      case 8: return 'eight';
      case 9: return 'nine';
      case 10: return 'ten';
    }
  }
}
