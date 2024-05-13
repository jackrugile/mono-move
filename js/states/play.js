$.statePlay = {};

$.statePlay.create = function () {
  this.tracks = [
    {
      top: 0,
      bot: $.game.height / 3,
    },
    {
      top: $.game.height / 3,
      bot: $.game.height / 3 + $.game.height / 3,
    },
    {
      top: $.game.height / 3 + $.game.height / 3,
      bot: $.game.height,
    },
  ];

  this.currentLevel = 0;

  // blocks
  this.blocks = new $.pool($.block, 0);

  // sparks
  this.sparks = new $.pool($.spark, 0);

  // explosions
  this.explosions = new $.pool($.explosion, 0);

  // buttons
  this.buttons = [];

  this.exiting = false;
};

$.statePlay.enter = function () {
  $.storage.set("playCount", $.storage.get("playCount") + 1);

  var sound = $.game.playSound("start-game");
  $.game.sound.setVolume(sound, 0.4);
  $.game.sound.setPlaybackRate(sound, 1);

  // screen shake
  this.shake = {
    translate: 0,
    x: 0,
    y: 0,
    xTarget: 0,
    yTarget: 0,
    xBias: 0,
    yBias: 0,
  };

  // deaths
  this.deaths = 0;

  // levels
  this.currentLevel = $.game.forceLevel ? $.game.forceLevel - 1 : 0;

  // tracks
  this.currentTrack = $.game.forceTrack ? $.game.forceTrack - 1 : 0;

  // track change tick
  this.trackChangeTick = 0;
  this.trackChangeTickMax = 35;

  // setup hero

  this.hero = new $.hero({
    x: 0,
    y: this.tracks[this.currentTrack].bot - $.game.unit / 2,
  });
  var x;
  if (this.currentLevel % 2 === 0) {
    if (this.currentTrack === 1) {
      x = $.game.width + this.hero.buffer;
    } else {
      x = -this.hero.buffer;
    }
  } else {
    if (this.currentTrack === 1) {
      x = -this.hero.buffer;
    } else {
      x = $.game.width + this.hero.buffer;
    }
  }
  this.hero.x = x;

  // death tick
  this.deathTickMax = 20;
  this.deathTick = 0;

  // level setup
  this.generateLevel();

  this.paused = false;

  this.textAlpha = 0;
  $.game.tween(this).wait(0.5).to({ textAlpha: 1 }, 1, "outExpo");

  this.tutHidden = false;
  this.tutTextAlpha = 0;
  if (this.currentLevel === 0) {
    $.game.tween(this).wait(0.5).to({ tutTextAlpha: 1 }, 1, "outExpo");
  }

  this.startTime = Date.now();
  this.pausedTime = 0;
  this.pausedStartTime = null;
  this.pausedEndTime = null;

  this.winFlag = false;

  // pause button
  let pauseButtonWidth = 120 / $.game.divisor;
  let pauseButtonHeight = 120 / $.game.divisor;
  let pauseButtonX = $.game.width / 2;
  let pauseButtonY = pauseButtonHeight / 2 + 40 / $.game.divisor;
  this.buttons.push(
    new $.button({
      layer: "play",
      x: pauseButtonX,
      y: pauseButtonY,
      width: pauseButtonWidth,
      height: pauseButtonHeight,
      enterDuration: 0.5,
      enterDelay: 0.5,
      image: () => "icon-pause",
      action: () => {
        this.pause();
      },
    })
  );

  // pause button
  // let pauseButtonWidth = 120 / $.game.divisor;
  // let pauseButtonHeight = 120 / $.game.divisor;
  // let pauseButtonX = $.game.width / 2 - 90 / $.game.divisor;
  // let pauseButtonY = pauseButtonHeight / 2 + 40 / $.game.divisor;
  // this.buttons.push(
  //   new $.button({
  //     layer: "play",
  //     x: pauseButtonX,
  //     y: pauseButtonY,
  //     width: pauseButtonWidth,
  //     height: pauseButtonHeight,
  //     image: () => "icon-pause",
  //     action: () => {
  //       this.pause();
  //     },
  //   })
  // );

  // mute button
  // let muteButtonWidth = 120 / $.game.divisor;
  // let muteButtonHeight = 120 / $.game.divisor;
  // let muteButtonX = $.game.width / 2 + 90 / $.game.divisor;
  // let muteButtonY = pauseButtonHeight / 2 + 40 / $.game.divisor;
  // this.buttons.push(
  //   new $.button({
  //     layer: "play",
  //     x: muteButtonX,
  //     y: muteButtonY,
  //     width: muteButtonWidth,
  //     height: muteButtonHeight,
  //     image: () => ($.storage.get("mute") ? "icon-sound-off" : "icon-sound-on"),
  //     action: () => {
  //       $.game.mute();
  //     },
  //   })
  // );

  // play button
  let playButtonWidth = 120 / $.game.divisor;
  let playButtonHeight = 120 / $.game.divisor;
  let playButtonX = $.game.width / 2 - 180 / $.game.divisor;
  let playButtonY = $.game.height / 2 + 80 / $.game.divisor;
  this.buttons.push(
    new $.button({
      layer: "pause",
      x: playButtonX,
      y: playButtonY,
      width: playButtonWidth,
      height: playButtonHeight,
      image: () => "icon-play",
      action: () => {
        this.pause();
      },
    })
  );

  // mute 2 button
  let muteButton2Width = 120 / $.game.divisor;
  let muteButton2Height = 120 / $.game.divisor;
  let muteButton2X = $.game.width / 2;
  let muteButton2Y = $.game.height / 2 + 80 / $.game.divisor;
  this.buttons.push(
    new $.button({
      layer: "pause",
      x: muteButton2X,
      y: muteButton2Y,
      width: muteButton2Width,
      height: muteButton2Height,
      image: () => ($.storage.get("mute") ? "icon-sound-off" : "icon-sound-on"),
      action: () => {
        $.game.mute();
      },
    })
  );

  // home button
  let homeButtonWidth = 120 / $.game.divisor;
  let homeButtonHeight = 120 / $.game.divisor;
  let homeButtonX = $.game.width / 2 + 180 / $.game.divisor;
  let homeButtonY = $.game.height / 2 + 80 / $.game.divisor;
  this.buttons.push(
    new $.button({
      layer: "pause",
      x: homeButtonX,
      y: homeButtonY,
      width: homeButtonWidth,
      height: homeButtonHeight,
      image: () => "icon-home",
      action: () => {
        this.exit();
      },
    })
  );

  this.tick = 0;
};

$.statePlay.leave = function () {
  this.blocks.empty();
  this.sparks.empty();
  this.explosions.empty();
  this.hero.destroy();
  this.buttons.length = 0;

  $.game.sound.setVolume($.game.scrapeSound, 0);

  if (this.paused) {
    this.pausedEndTime = Date.now();
    this.pausedTime += this.pausedEndTime - this.pausedStartTime;
  }
  $.game.lastRunTime = Date.now() - this.startTime - this.pausedTime;
  $.game.lastRunDeaths = this.deaths;
};

$.statePlay.step = function () {
  if (!$.game.time.shouldStep) return;

  for (let i = 0, len = this.buttons.length; i < len; i++) {
    let button = this.buttons[i];
    if (
      button.layer === "all" ||
      (button.layer === "play" && !this.paused) ||
      (button.layer === "pause" && this.paused)
    ) {
      button.step();
    }
  }

  if (this.paused) {
    return;
  }

  // handle track flash
  if (this.trackChangeTick > 0) {
    this.trackChangeTick -= $.game.dtNorm;
    this.trackChangeTick = Math.max(this.trackChangeTick, 0);
  }

  // handle death flash
  if (this.deathTick > 0) {
    this.deathTick -= $.game.dtNorm;
    this.deathTick = Math.max(this.deathTick, 0);
  }

  this.handleScreenShake();
  this.blocks.each("step");
  this.sparks.each("step");
  this.explosions.each("step");
  this.hero.step();

  this.tick += $.game.dtNorm;

  if (this.winFlag) {
    this.win();
  }
};

$.statePlay.render = function () {
  if (!$.game.time.shouldRender) return;

  // bg gradient color
  $.ctx.drawImage(
    $.game.levels[this.currentLevel].levelGradientCanvas,
    0,
    0,
    $.game.width,
    $.game.height
  );

  // screen shake
  $.ctx.save();
  if (!this.paused && this.shake.translate) {
    $.ctx.translate(this.shake.x, this.shake.y);
  }

  // track gradients
  $.ctx.drawImage(
    $.game.trackGradientCanvas,
    -$.game.trackPadding,
    -$.game.trackPadding,
    $.game.width + $.game.trackPadding * 2,
    $.game.height / 3 + $.game.trackPadding
  );
  $.ctx.drawImage(
    $.game.trackGradientCanvas,
    -$.game.trackPadding,
    $.game.height / 3,
    $.game.width + $.game.trackPadding * 2,
    $.game.height / 3
  );
  $.ctx.drawImage(
    $.game.trackGradientCanvas,
    -$.game.trackPadding,
    $.game.height - $.game.height / 3,
    $.game.width + $.game.trackPadding * 2,
    $.game.height / 3 + $.game.trackPadding
  );

  this.blocks.each("render");
  this.hero.render();
  this.sparks.each("render");
  this.explosions.each("render");
  $.ctx.restore();

  // track change flash
  if (!this.paused && this.trackChangeTick > 0) {
    var y;
    if (this.currentTrack === 0) {
      y = this.tracks[2].top;
    } else {
      y = this.tracks[this.currentTrack - 1].top;
    }
    $.ctx.save();
    $.ctx.beginPath();
    $.ctx.fillStyle(
      "hsla(0, 0%, 100%, " +
        (this.trackChangeTick / this.trackChangeTickMax) * 0.75 +
        ")"
    );
    $.ctx.fillRect(0, y, $.game.width, $.game.height / 3);
    $.ctx.restore();
  }

  // screen death flash
  if (!this.paused && this.deathTick > 0) {
    $.ctx.beginPath();
    $.ctx.fillStyle(
      "hsla(0, 0%, 100%, " + (this.deathTick / this.deathTickMax) * 0.5 + ")"
    );
    $.ctx.fillRect(0, 0, $.game.width, $.game.height);
  }

  if (this.paused) {
    this.renderPause();
  }

  this.renderUI();

  // buttons
  for (let i = 0, len = this.buttons.length; i < len; i++) {
    let button = this.buttons[i];
    if (
      button.layer === "all" ||
      (button.layer === "play" && !this.paused) ||
      (button.layer === "pause" && this.paused)
    ) {
      button.render();
    }
  }
};

$.statePlay.pointerdown = function (e) {
  let buttonPressed = false;
  for (let i = 0, len = this.buttons.length; i < len; i++) {
    let button = this.buttons[i];
    if (
      button.layer === "all" ||
      (button.layer === "play" && !this.paused) ||
      (button.layer === "pause" && this.paused)
    ) {
      let result = button.handlePointerDown(e);
      if (result) {
        buttonPressed = true;
      }
    }
  }

  if (!this.paused && !buttonPressed) {
    this.hero.jump();
  }
};

$.statePlay.keydown = function (e) {
  if (e.key == "escape") {
    this.exit();
  } else if (e.key == "p") {
    this.pause();
  } else if ($.game.keyTriggers.indexOf(e.key) > -1) {
    if (!this.paused) {
      this.hero.jump();
    }
  }
};

$.statePlay.gamepaddown = function (data) {
  if (!this.paused) {
    this.hero.jump();
  }
  if (
    data.button == "up" ||
    data.button == "right" ||
    data.button == "down" ||
    data.button == "left" ||
    data.button == "l1" ||
    data.button == "l2"
  ) {
  }
  if (
    data.button == "1" ||
    data.button == "2" ||
    data.button == "3" ||
    data.button == "4" ||
    data.button == "r1" ||
    data.button == "r2"
  ) {
  }
};

$.statePlay.handleScreenShake = function () {
  this.shake.xBias +=
    (0 - this.shake.xBias) * (1 - Math.exp(-0.1 * $.game.dtNorm));
  this.shake.yBias +=
    (0 - this.shake.yBias) * (1 - Math.exp(-0.1 * $.game.dtNorm));

  if (this.shake.translate > 0.001) {
    this.shake.translate +=
      (0 - this.shake.translate) * (1 - Math.exp(-0.1 * $.game.dtNorm));
    this.shake.xTarget =
      $.rand(-this.shake.translate, this.shake.translate) + this.shake.xBias;
    this.shake.yTarget =
      $.rand(-this.shake.translate, this.shake.translate) + this.shake.yBias;
  } else {
    this.shake.xTarget = 0;
    this.shake.yTarget = 0;
  }

  this.shake.x +=
    (this.shake.xTarget - this.shake.x) * (1 - Math.exp(-0.9 * $.game.dtNorm));
  this.shake.y +=
    (this.shake.yTarget - this.shake.y) * (1 - Math.exp(-0.9 * $.game.dtNorm));
};

$.statePlay.getTrack = function () {
  return this.tracks[this.currentTrack];
};

$.statePlay.generateLevel = function () {
  for (var col = 0; col < $.game.levels[this.currentLevel].map.width; col++) {
    for (
      var row = 0;
      row < $.game.levels[this.currentLevel].map.height;
      row++
    ) {
      var val =
        $.game.levels[this.currentLevel].map.layers[1].data[
          $.game.levels[this.currentLevel].map.width * row + col
        ];
      if (val === 1) {
        var x = col * $.game.unit,
          y = row * $.game.unit,
          track;
        if (y < this.tracks[0].bot) {
          track = 0;
        } else if (y < this.tracks[1].bot) {
          track = 1;
        } else if (y < this.tracks[2].bot) {
          track = 2;
        }
        this.blocks.create({
          pool: this.blocks,
          x: x,
          y: y,
          size: $.game.unit,
          track: track,
        });
      }
    }
  }
};

$.statePlay.destroyLevel = function () {
  this.blocks.each("destroy");
};

$.statePlay.pause = function () {
  if (this.paused) {
    this.paused = false;
    $.html.classList.remove("paused");
    this.pausedEndTime = Date.now();
    this.pausedTime += this.pausedEndTime - this.pausedStartTime;
  } else {
    this.paused = true;
    $.game.sound.setVolume($.game.scrapeSound, 0);
    $.html.classList.add("paused");
    this.pausedStartTime = Date.now();
  }
};

$.statePlay.exit = function () {
  if (this.exiting) return;

  this.exiting = true;
  window.setTimeout(() => {
    if (
      window.confirm(
        "Are you sure you want to end this game and return to the menu?"
      )
    ) {
      $.game.setState($.stateMenu);
    }
    this.exiting = false;
  }, 10);
};

$.statePlay.renderUI = function () {
  $.ctx.save();

  // hide tut text after level 1
  if (this.currentLevel > 0) {
    if (!this.tutHidden) {
      this.tutHidden = true;
      $.game.tween(this).to({ tutTextAlpha: 0 }, 1, "outExpo");
    }
  }

  // tutorial
  if (!this.paused) {
    $.ctx.textBaseline("middle");
    $.ctx.textAlign("center");
    $.ctx.font(`${Math.round(50 / $.game.divisor)}px latowf400`);
    $.ctx.fillStyle(
      `hsla(${$.game.levels[$.game.state.currentLevel].hue2}, 100%, 85%, ${
        this.tutTextAlpha
      })`
    );
    $.ctx.fillText(
      `[ ${$.game.controlString} ] TO SWITCH GRAVITY`,
      $.game.width / 2,
      ($.game.height / 3) * 0.7
    );
    $.ctx.fillText("AVOID THE OBSTACLES", $.game.width / 2, $.game.height / 2);
    $.ctx.fillText(
      "STAY CALM",
      $.game.width / 2,
      $.game.height - ($.game.height / 3) * 0.7
    );
  }

  // styles
  $.ctx.textBaseline("top");
  $.ctx.font(`${Math.round(75 / $.game.divisor)}px latowf400`);

  // death display
  $.ctx.textAlign("left");
  $.ctx.fillStyle(
    `hsla(${$.game.levels[$.game.state.currentLevel].hue2}, 100%, 85%, ${
      this.textAlpha
    })`
  );
  $.ctx.fillText(
    $.pad(this.deaths, 3),
    40 / $.game.divisor,
    40 / $.game.divisor
  );

  // level display
  $.ctx.textAlign("right");
  $.ctx.fillStyle(
    `hsla(${$.game.levels[$.game.state.currentLevel].hue1}, 100%, 85%, ${
      this.textAlpha
    })`
  );
  $.ctx.fillText(
    this.currentLevel + 1 + "/" + $.game.levels.length,
    $.game.width - 40 / $.game.divisor,
    40 / $.game.divisor
  );

  // death label
  $.ctx.font(`${Math.round(32 / $.game.divisor)}px latowf400`);
  $.ctx.textAlign("left");
  $.ctx.fillStyle(
    `hsla(${$.game.levels[$.game.state.currentLevel].hue2}, 100%, 85%, ${
      this.textAlpha
    })`
  );
  $.ctx.fillText("DEATHS", 40 / $.game.divisor, 120 / $.game.divisor);

  // level label
  $.ctx.textAlign("right");
  $.ctx.fillStyle(
    `hsla(${$.game.levels[$.game.state.currentLevel].hue1}, 100%, 85%, ${
      this.textAlpha
    })`
  );
  $.ctx.fillText(
    "LEVEL",
    $.game.width - 40 / $.game.divisor,
    120 / $.game.divisor
  );

  // controls display
  if (!$.game.isTouchDevice) {
    $.ctx.textBaseline("bottom");
    $.ctx.font(`${Math.round(32 / $.game.divisor)}px latowf400`);
    $.ctx.textAlign("left");
    $.ctx.fillStyle(
      `hsla(${$.game.levels[$.game.state.currentLevel].hue2}, 100%, 85%, ${
        this.textAlpha
      })`
    );
    $.ctx.fillText(
      "[ P ] PAUSE",
      40 / $.game.divisor,
      $.game.height - 135 / $.game.divisor
    );
    $.ctx.fillText(
      "[ M ] MUTE",
      40 / $.game.divisor,
      $.game.height - 85 / $.game.divisor
    );
    $.ctx.fillText(
      "[ ESC ] MENU",
      40 / $.game.divisor,
      $.game.height - 35 / $.game.divisor
    );
  }

  $.ctx.restore();
};

$.statePlay.renderPause = function () {
  $.ctx.fillStyle("hsla(0, 0%, 0%, 0.65)");
  $.ctx.fillRect(0, 0, $.game.width, $.game.height);
  $.ctx.textAlign("center");
  $.ctx.textBaseline("middle");

  $.ctx.font(`${Math.round(90 / $.game.divisor)}px latowf400`);
  $.ctx.fillStyle("#fff");
  $.ctx.fillText(
    "PAUSED",
    $.game.width / 2,
    $.game.height / 2 - 80 / $.game.divisor
  );
};

$.statePlay.win = function () {
  var sound = $.game.playSound("win-game");
  $.game.sound.setVolume(sound, 0.7);
  $.game.sound.setPlaybackRate(sound, 1);
  $.game.setState($.stateWin);
};
