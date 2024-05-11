$.stateWin = {};

$.stateWin.create = function () {
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

  // sparks
  this.sparks = new $.pool($.spark, 0);

  // explosions
  this.explosions = new $.pool($.explosion, 0);

  this.buttons = [];
};

$.stateWin.enter = function () {
  $.html.classList.add("state-win");
  this.actionTickMax = 80;
  this.tick = 0;

  if ($.game.lastRunDeaths < $.storage.get("deathBest")) {
    $.storage.set("deathBest", $.game.lastRunDeaths);
  }

  // play button
  let playButtonWidth = 240 / $.game.divisor;
  let playButtonHeight = 240 / $.game.divisor;
  let playButtonX = $.game.width / 2 - 180 / $.game.divisor;
  let playButtonY = $.game.height - $.game.height / 6;
  this.buttons.push(
    new $.button({
      layer: "all",
      x: playButtonX,
      y: playButtonY,
      width: playButtonWidth,
      height: playButtonHeight,
      image: () => "icon-play",
      action: () => {
        $.game.setState($.statePlay);
      },
    })
  );

  // home button
  let homeButtonWidth = 240 / $.game.divisor;
  let homeButtonHeight = 240 / $.game.divisor;
  let homeButtonX = $.game.width / 2 + 180 / $.game.divisor;
  let homeButtonY = $.game.height - $.game.height / 6;
  this.buttons.push(
    new $.button({
      layer: "all",
      x: homeButtonX,
      y: homeButtonY,
      width: homeButtonWidth,
      height: homeButtonHeight,
      image: () => "icon-home",
      action: () => {
        $.game.setState($.stateMenu);
      },
    })
  );
};

$.stateWin.leave = function () {
  this.sparks.empty();
  this.explosions.empty();
  this.buttons.length = 0;
  $.html.classList.remove("state-win");
};

$.stateWin.step = function () {
  if (Math.random() < 0.04 * $.game.dtNorm) {
    var x = $.rand(0, $.game.width),
      y = $.rand(0, $.game.height),
      radius = $.rand(40, 160) / $.game.divisor;

    for (var i = 0, length = 15; i < length; i++) {
      var size = $.rand(1, 2);
      this.sparks.create({
        pool: this.sparks,
        x: x + $.rand(0, Math.cos((i / length) * $.TAU) * radius),
        y: y + $.rand(0, Math.sin((i / length) * $.TAU) * radius),
        angle: (i / length) * $.TAU,
        vel: $.rand(1, 10) / $.game.divisor,
        drag: 0.96,
        decay: 0.01,
        w: size,
        h: size,
        burst: true,
      });
    }

    for (var i = 0, length = 60; i < length; i++) {
      var size = $.rand(1, 5) / $.game.divisor;
      this.sparks.create({
        pool: this.sparks,
        x: x + $.rand(0, Math.cos((i / length) * $.TAU) * radius),
        y: y + $.rand(0, Math.sin((i / length) * $.TAU) * radius),
        angle: (i / length) * $.TAU,
        vel: $.rand(1, 10) / $.game.divisor,
        drag: 0.96,
        decay: 0.01,
        w: size,
        h: size,
        burst: false,
        hue: 0,
        saturation: 0,
        lightness: $.rand(50, 80),
      });
    }

    for (var i = 0; i < 20; i++) {
      $.game.state.explosions.create({
        pool: $.game.state.explosions,
        x: x + $.rand(0, Math.cos((i / length) * $.TAU) * radius * 2),
        y: y + $.rand(0, Math.sin((i / length) * $.TAU) * radius * 2),
        radius: $.rand(1, 3) / $.game.divisor,
        decay: 0.02,
      });
    }

    $.game.state.explosions.create({
      pool: $.game.state.explosions,
      x: x,
      y: y,
      radius: 20 / $.game.divisor,
      decay: 0.02,
    });

    var sound = $.game.playSound("explosion-1");
    $.game.sound.setVolume(sound, $.rand(0.05, 0.25));
    $.game.isChrome &&
      $.game.sound.setPanning(
        sound,
        $.clamp((x / $.game.width) * 2 - 1, -1, 1)
      );
    $.game.sound.setPlaybackRate(sound, $.rand(0.2, 0.8));
  }

  this.sparks.each("step");
  this.explosions.each("step");

  for (let i = 0, len = this.buttons.length; i < len; i++) {
    this.buttons[i].step();
  }

  this.tick += $.game.dtNorm;
};

$.stateWin.render = function () {
  // bg gradient color
  $.ctx.drawImage(
    $.game.levels[0].levelGradientCanvas,
    0,
    0,
    $.game.width,
    $.game.height
  );

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

  var timesText = $.game.lastRunDeaths === 1 ? "TIME" : "TIMES",
    statusText =
      "YOU DIED " +
      $.formatCommas($.game.lastRunDeaths) +
      " " +
      timesText +
      " IN " +
      $.msToString($.game.lastRunTime);

  $.ctx.save();
  $.ctx.textAlign("center");
  $.ctx.textBaseline("middle");
  $.ctx.font(`${Math.round(120 / $.game.divisor)}px latowf400`);
  $.ctx.fillStyle("#fff");
  $.ctx.fillText(
    "VICTORY!",
    $.game.width / 2,
    $.game.height / 2 - 50 / $.game.divisor
  );
  $.ctx.font(`${Math.round(64 / $.game.divisor)}px latowf400`);
  $.ctx.fillText(
    statusText,
    $.game.width / 2,
    $.game.height / 2 + 80 / $.game.divisor
  );
  $.ctx.restore();

  this.sparks.each("render");
  this.explosions.each("render");

  for (let i = 0, len = this.buttons.length; i < len; i++) {
    this.buttons[i].render();
  }
};

$.stateWin.pointerdown = function (e) {
  if (this.tick < this.actionTickMax) {
    return false;
  }

  for (let i = 0, len = this.buttons.length; i < len; i++) {
    let button = this.buttons[i];
    if (button) {
      let result = button.handlePointerDown(e);
    }
  }
};

$.stateWin.keydown = function (e) {
  if (this.tick < this.actionTickMax) {
    return false;
  }
  if (e.key == "escape") {
    $.game.setState($.stateMenu);
  }
};
