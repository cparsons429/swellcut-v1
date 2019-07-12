
/*globals paper, console, $ */
/*jslint nomen: true, undef: true, sloppy: true */

// neurogram: picbreeder clone written in js.

/*

@licstart  The following is the entire license notice for the
JavaScript code in this page.

Copyright (C) 2015 david ha, otoro.net, otoro labs

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

(function(global) {
  "use strict";

  var numImages = 12;
  var borderWidth = 1;
  var thumbSize = document.getElementById('sm0').width - 2 * borderWidth;
  var maxSelected = 3;  // we can only evolve max of 3 genomes

  var genome = [];  // array of genomes
  var thumb = [];  // array of images

  var currSelected = 0;
  var lastSelected = -1;
  var selectionList = [];

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
    var i, j;
    genome = [];
    thumb = [];
    lastSelected = -1;

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
    ctxs[i].fillRect(borderWidth, borderWidth, thumbSize, thumbSize);
  }

  function drawThumb(i) {
    ctxs[i].putImageData(thumb[i].getCanvasImage(ctxs[i]), thumbSize, thumbSize);
  }

  function drawAllThumb() {
    var i;

    for (i = 0; i < numImages; i++) {
      ctxs[i].clearRect(0, 0, thumbSize + 2 * borderWidth, thumbSize + 2 * borderWidth);
      drawThumb(i);
    }
  }

  function outlineThumb(i) {
    // draws a white box around pic i
    ctxs[i].beginPath();
    ctxs[i].lineWidth = "1";
    ctxs[i].strokeStyle = "#FFF";
    ctxs[i].rect(0, 0, thumbSize + 2 * borderWidth, thumbSize + 2 * borderWidth);
    ctxs[i].stroke();
  }

  function outlineAll() {
    var i;
    for (i = 0; i < numImages; i++) {
      outlineThumb(i);
    }
  }

  function darkenThumb(i) {
    // darkens a newly picked thumb, switches checkmark for x mark
    $("#ov" + String(i)).style.opacity = .2;
    $("#pd" + String(i)).style.display = "none";
    $("#ud" + String(i)).style.display = "block";
  }

  function lightenThumb(i) {
    // lightens a newly unpicked thumb, switches x mark for checkmark
    $("#ov" + String(i)).style.opacity = 0;
    $("#pd" + String(i)).style.display = "block";
    $("#ud" + String(i)).style.display = "none";
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

  $(".Pick Design").click(function(event) {
    currSelected = parseInt((event.target.id).substring(2));  // clicked id is "pdx", where "x" is the pick number
    var ix = selectionList.indexOf(currSelected);
    lastSelected = currSelected;

    if (ix === -1) {
      while (selectionList.length >= maxSelected) {
        selectionList.shift();
      }

      selectionList.push(currSelected);
    } else {
      selectionList.splice(ix, 1);
    }

    updateSelected();
  });

  $(".Evolve Arrow").click(function() {
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

  });

  function main() {
    // start of the program
    initAll();
    initGenome();
    initThumb();
    drawAllThumb();
  }

  global.main = main;
})(neurogram);

(function(lib) {
  "use strict";

  if (typeof module === "undefined" || typeof module.exports === "undefined") {
    window.jsfeat = lib;  // in ordinary browser attach library to window
  } else {
    module.exports = lib;  // in nodejs
  }
})(neurogram);
