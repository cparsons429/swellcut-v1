
/*globals paper, console, $ */
/*jslint nomen: true, undef: true, sloppy: true */

// neurogram: picbreeder clone written in js.

/*

@licstart  The following is the entire license notice for the
JavaScript code in this page.

Copyright (C) 2019 Colin Parsons, Swellcut

The JavaScript code in this page is free software: you can
redistribute it and/or modify it under the terms of the GNU
General Public License (GNU GPL) as published by the Free Software
Foundation, either version 3 of the License, or (at your option)
any later version.  The code is distributed WITHOUT ANY WARRANTY;
without even the implied warranty of MERCHANTABILITY or FITNESS
FOR A PARTICULAR PURPOSE.  See the GNU GPL for more details.

As additional permission under GNU GPL version 3 section 7, you
may distribute non-source (e.g., minimized or compacted) forms of
that code without the copy of the GNU GPL normally required by
section 4, provided you include this license notice and a URL
through which recipients can access the Corresponding Source.


@licend  The above is the entire license notice
for the JavaScript code in this page.
*/

var neurogram = {};

var numImages = parseInt($("#num-images").val());
var thumbSize = 320;
var maxSelected = 3;  // we can only evolve max of 3 genomes

var genomeID;

var windowLocation = String(window.location.href);

var data;

var genome = [];  // array of genomes
var thumb = [];  // array of images
var genomeIDs = [];  // array of genome ids

var currSelected = 0;
var selectionList = [];

function setCanvasSize(i) {
  // set canvas width and height equal to the width of the canvas element container
  var width = $("#ce0").width();
  $("#canvas" + String(i)).width(width);
  $("#canvas" + String(i)).height(width);
}

function setCanvasSizes() {
  // set all canvas widths and heights equal to the width of the canvas element container
  var i;
  for (i = 0; i < numImages; i++) {
    setCanvasSize(i);
  }
}

setCanvasSizes();

var canvas;
var canvases = [];
var ctxs = [];

var i;
for (i = 0; i < numImages; i++) {
  canvas = document.getElementById('canvas' + String(i));
  canvases.push(canvas);
  ctxs.push(canvas.getContext('2d'));
}

// initialize NEAT library (set number of inputs and outputs)
N.init({nInput: 3, nOutput: 3});

function initAll() {
  // initializes random genomes at the beginning
  var i;
  genome = [];
  thumb = [];

  for (i = 0; i < numImages; i++) {
    genome.push(null);
    thumb.push(null);
  }
}

function initGenome() {
  N.randomizeRenderMode();
  var i, j;

  for (i = 0; i < numImages; i++) {
    genome[i] = new N.Genome();
  }

  for (i = 0; i < 8; i++) {
    for (j = 0; j < numImages; j++) {
      if (Math.random() < 0.5) {
        genome[j].addRandomNode();
      }
      if (Math.random() < 0.5) {
        genome[j].addRandomConnection();
      }
    }
  }
}

function initThumb() {
  // initializes all the images (must be run after genome array is populated)
  var i;
  for (i = 0; i < numImages; i++) {
    genome[i].roundWeights();
    thumb[i] = NetArt.genGenomeImage(genome[i], thumbSize, thumbSize);
  }
}

function maskThumb(i) {
  ctxs[i].fillStyle="rgba(255, 255, 255, 0.7)";
  ctxs[i].fillRect(0, 0, thumbSize, thumbSize);
}

function drawThumb(i) {
  var shirtMask = document.getElementById("shirtmask");
  var genImg = thumb[i].getCanvasImage(ctxs[i]);

  ctxs[i].clearRect(0, 0, thumbSize, thumbSize);
  ctxs[i].putImageData(genImg, 0, 0);
  ctxs[i].globalCompositeOperation = "source-over";
  ctxs[i].drawImage(shirtMask, 0, 0, canvases[i].width, canvases[i].height);
}

function drawAllThumb() {
  var i;

  for (i = 0; i < numImages; i++) {
    drawThumb(i);
  }
}

function darkenThumb(i) {
  // darkens a newly picked thumb, switches checkmark for x mark
  $("#ov" + String(i)).css("opacity", "0.2");
  $("#pd" + String(i)).css("display", "none");
  $("#ud" + String(i)).css("display", "block");
}

function lightenThumb(i) {
  // lightens a newly unpicked thumb, switches x mark for checkmark
  $("#ov" + String(i)).css("opacity", "0");
  $("#pd" + String(i)).css("display", "block");
  $("#ud" + String(i)).css("display", "none");
}

function updateSelected() {
  // lighten all
  var i;
  for (i = 0; i < numImages; i++) {
    lightenThumb(i);
  }

  // darken selected
  for (i = 0; i < selectionList.length; i++) {
    darkenThumb(selectionList[i]);
  }
}

function evolveDesigns() {
  // evolve picked designs!

  var len = selectionList.length;
  if (len === 0) {
    return;
  }

  var mom, dad, momGene, dadGene, preserveList, i;
  preserveList = R.zeros(numImages);

  for (i = 0; i < len; i++) {
    preserveList[selectionList[i]] = 1;
  }

  // mutate and evolve!
  for (i = 0; i < numImages; i++) {
    if (preserveList[i] === 0) {
      mom = selectionList[R.randi(0, len)];
      dad = selectionList[R.randi(0, len)];
      momGene = genome[mom];
      dadGene = genome[dad];

      if (mom === dad) {
        genome[i] = momGene.copy();
      } else {
        genome[i] = momGene.crossover(dadGene);
      }

      genome[i].mutateWeights();
      if (Math.random() < 0.5) {
        genome[i].addRandomNode();
      }
      if (Math.random() < 0.5) {
        genome[i].addRandomConnection();
      }

      genome[i].roundWeights();
      thumb[i] = NetArt.genGenomeImage(genome[i], thumbSize, thumbSize);
      drawThumb(i);
    }
  }

  // clear selection list
  selectionList = [];

  // redraw selection boxes
  updateSelected();
}

$(".pick-design").click(function() {
  // add design to picked list, pop off the previous third element (if there is one) from list, and update
  // preventing event from being propagated to parents and children of class
  event.stopPropagation();
  event.stopImmediatePropagation();

  currSelected = parseInt($(this).attr("id").substring(2));  // clicked id is "pdx", where "x" is the pick number

  while (selectionList.length >= maxSelected) {
    selectionList.shift();
  }

  selectionList.push(currSelected);

  updateSelected();
});

$(".unpick-design").click(function() {
  // remove design from picked list, and update
  // preventing event from being propagated to parents and children of class
  event.stopPropagation();
  event.stopImmediatePropagation();

  currSelected = parseInt($(this).attr("id").substring(2));  // clicked id is "udx", where "x" is the pick number
  selectionList.splice(selectionList.indexOf(currSelected), 1);

  updateSelected();
});

$(".evolve-arrow").click(function() {
  // preventing event from being propagated to parents and children of class
  event.stopPropagation();
  event.stopImmediatePropagation();

  evolveDesigns();
});

$(".save-design").click(function() {
  // open prompt for user to input email
  // preventing event from being propagated to parents and children of class
  event.stopPropagation();
  event.stopImmediatePropagation();

  currSelected = parseInt($(this).attr("id").substring(2));  // clicked id is "sdx", where "x" is the pick number

  if (genomeIDs.length == 0) {
    // we're emailing a new genome
    $("#genome-data").val(JSON.stringify(genome[currSelected].toJSON()));
  } else {
    // we're emailing a previously saved genome
    $("#genome-id").val(genomeIDs[currSelected]);
  }

  $("#image-data").val(String(canvases[currSelected].toDataURL()));

  $(".email-input").css("display", "block");
});

$(".modify-design").click(function() {
  // open design page with the selected genome as the parent of all genomes shown
  // preventing event from being propagated to parents and children of class
  event.stopPropagation();
  event.stopImmediatePropagation();

  currSelected = parseInt($(this).attr("id").substring(2));  // clicked id is "mdx", where "x" is the pick number

  window.location.assign("https://www.swellcut.com/design.html?gid=" + genomeIDs[currSelected]);
});

$(".instagram-logo").click(function() {
  // TODO post to instagram
  // for now, just open email prompt
  event.stopPropagation();
  event.stopImmediatePropagation();

  currSelected = parseInt($(this).attr("id").substring(2));  // clicked id is "igx", where "x" is the pick number

  $("#genome-id").val(genomeIDs[currSelected]);  // we're emailing a previously saved genome
  $("#image-data").val(String(canvases[currSelected].toDataURL()));

  $(".email-input").css("display", "block");
});

$(".facebook-logo").click(function() {
  // TODO post to facebook
  // for now, just open email prompt
  event.stopPropagation();
  event.stopImmediatePropagation();

  currSelected = parseInt($(this).attr("id").substring(2));  // clicked id is "igx", where "x" is the pick number

  $("#genome-id").val(genomeIDs[currSelected]);  // we're emailing a previously saved genome
  $("#image-data").val(String(canvases[currSelected].toDataURL()));

  $(".email-input").css("display", "block");
});

$(".twitter-logo").click(function() {
  // TODO post to twitter
  // for now, just open email prompt
  event.stopPropagation();
  event.stopImmediatePropagation();

  currSelected = parseInt($(this).attr("id").substring(2));  // clicked id is "igx", where "x" is the pick number

  $("#genome-id").val(genomeIDs[currSelected]);  // we're emailing a previously saved genome
  $("#image-data").val(String(canvases[currSelected].toDataURL()));

  $(".email-input").css("display", "block");
});

$(".add-to-cart-icon").click(function() {
  // TODO add to cart
  // for now, just open email prompt
  event.stopPropagation();
  event.stopImmediatePropagation();

  currSelected = parseInt($(this).attr("id").substring(2));  // clicked id is "igx", where "x" is the pick number

  $("#genome-id").val(genomeIDs[currSelected]);  // we're emailing a previously saved genome
  $("#image-data").val(String(canvases[currSelected].toDataURL()));

  $(".email-input").css("display", "block");
});

$(".exit-email-input").click(function() {
  // close prompt for user to input email
  // preventing event from being propagated to parents and children of class
  event.stopPropagation();
  event.stopImmediatePropagation();

  // so the user can request a new image be sent
  $("#email-form").css("display", "block");
  $("#email-success").css("display", "none");

  $(".email-input").css("display", "none");
});

initAll();

if (windowLocation.indexOf("www.swellcut.com/design") != -1) {
  // neurogram is being accessed by our design page
  // get the queried genome id, if it exists
  var queryURL = "www.swellcut.com/design?gid=";
  genomeID = windowLocation.substring(windowLocation.indexOf(queryURL) + queryURL.length);

  $.post("https://www.swellcut.com/designgetter.php", {genome_id: genomeID}, function(data) {
    // if the queried genome exists in the database, populate design blocks with its children
    // creates our genomes and thumbs from a parent genome (if it exists)
    if (data === "undef") {
      // if the queried genome doesn't exist in the database, we're fine with randomly initialized design blocks
      initGenome();
      initThumb();
      drawAllThumb();
    } else {
      // if the queried genome exists in the database, populate design blocks with its children
      for (i = 0; i < numImages; i++) {
        genome[i] = new N.Genome();
      }

      genome[0].fromJSON(JSON.parse(data));
      thumb[0] = NetArt.genGenomeImage(genome[0], thumbSize, thumbSize);
      drawThumb(0);

      // populate all genomes with children of the provided parent
      selectionList[0] = 0;
      evolveDesigns();
    }
  });
} else {
  // neurogram is being accessed by our discover or favorites pages
  // populate discover/favorite blocks via our selection algorithm
  $.post("https://www.swellcut.com/algorithmicdesigngetter.php", {num_img: numImages}, function(data) {
    // creates our genomes and thumbs from the database
    var splitJSONs = data.split(";");

    for (i = 0; i < numImages; i++) {
      genomeIDs[i] = splitJSONs[2 * i];  // saving the string representation of the genome id we might want to modify

      genome[i] = new N.Genome();
      genome[i].fromJSON(JSON.parse(splitJSONs[2 * i + 1]));
      thumb[i] = NetArt.genGenomeImage(genome[i], thumbSize, thumbSize);
      drawThumb(i);
    }
  });
}

// resize canvases dynamically
window.onload = setCanvasSizes;
window.onresize = setCanvasSizes;

(function(lib) {
  "use strict";

  if (typeof module === "undefined" || typeof module.exports === "undefined") {
    window.jsfeat = lib;  // in ordinary browser attach library to window
  } else {
    module.exports = lib;  // in nodejs
  }
})(neurogram);

var Webflow = Webflow || [];
Webflow.push(function() {

  // === Custom Form Handling ===

  // unbind webflow form handling
  $(document).off('submit');

  // new form handling
  $('#email-form').submit(function(evt) {
    $.post("https://www.swellcut.com/designsaver.php", $("#email-form").serialize());
  	$("#email-form").css("display", "none");
    $("#email-success").css("display", "block");
    return false;
  });
});
