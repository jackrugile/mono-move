$.stateMenu = {};

$.stateMenu.create = function () {
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

  this.buttons = [];
  this.hasEntered = false;
};

$.stateMenu.enter = function () {
  if (this.hasEntered) {
    var sound = $.game.playSound("end-game");
    $.game.sound.setVolume(sound, 0.4);
    $.game.sound.setPlaybackRate(sound, 1);
  }

  if (!this.hasEntered) {
    this.hasEntered = true;
  }

  $.html.classList.add("state-menu");

  this.titleScale = 1.1;
  this.titleAlpha = 0;

  this.tick = 0;
  this.entered = false;

  $.game.tween(this).wait(0.5).to(
    {
      titleScale: 1,
      titleAlpha: 1,
    },
    1,
    "outExpo"
  );

  // play button
  let playButtonWidth = 240 / $.game.divisor;
  let playButtonHeight = 240 / $.game.divisor;
  let playButtonX = $.game.width / 2;
  let playButtonY = $.game.height - $.game.height / 6;
  this.buttons.push(
    new $.button({
      layer: "all",
      x: playButtonX,
      y: playButtonY,
      width: playButtonWidth,
      height: playButtonHeight,
      enterDuration: 0.5,
      enterDelay: 0.5,
      image: () => "icon-play",
      action: () => {
        if (!$.game.musicIsPlaying) {
          $.game.music.play("music-1", true);
          $.game.musicIsPlaying = true;
        }
        $.game.setState($.statePlay);
      },
    })
  );
};

$.stateMenu.leave = function () {
  $.html.classList.remove("state-menu");
  this.buttons.length = 0;
};

$.stateMenu.step = function () {
  for (let i = 0, len = this.buttons.length; i < len; i++) {
    this.buttons[i].step();
  }

  this.tick += $.game.dtNorm;
};

$.stateMenu.render = function () {
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

  // title
  $.ctx.save();
  $.ctx.align(0.5);
  $.ctx.translate($.game.width / 2, $.game.height / 2);
  $.ctx.scale(
    this.titleScale / $.game.divisor,
    this.titleScale / $.game.divisor
  );
  $.ctx.a(0.5 * this.titleAlpha);
  $.ctx.drawImage($.game.images["title-glow"], 0, 0);
  $.ctx.a(this.titleAlpha);
  $.ctx.drawImage(
    $.game.images["title"],
    0,
    0,
    $.game.images.title.width,
    $.game.images.title.height / 2,
    0,
    -$.game.images.title.height / 4,
    $.game.images.title.width,
    $.game.images.title.height / 2
  );
  $.ctx.realign();
  $.ctx.restore();

  let translateIn = this.titleScale * (80 / $.game.divisor);

  $.ctx.save();
  $.ctx.font(`${Math.round(50 / $.game.divisor)}px latowf400`);
  $.ctx.textBaseline("middle");
  $.ctx.textAlign("center");
  // $.ctx.fillStyle(
  //   `hsla(${$.game.levels[0].hue2}, 100%, 85%, ${this.titleAlpha})`
  // );

  $.ctx.textBaseline("bottom");
  $.ctx.font(`${Math.round(32 / $.game.divisor)}px latowf400`);

  $.ctx.textAlign("left");
  $.ctx.fillStyle(
    `hsla(${$.game.levels[0].hue2}, 100%, 85%, ${this.titleAlpha})`
  );
  $.ctx.fillText(
    "PLAY COUNT: " + $.formatCommas($.storage.get("playCount")),
    40 / $.game.divisor + translateIn,
    $.game.height - 135 / $.game.divisor
  );
  $.ctx.fillText(
    "DEATH COUNT: " + $.formatCommas($.storage.get("deathCount")),
    40 / $.game.divisor + translateIn,
    $.game.height - 85 / $.game.divisor
  );
  var best = $.storage.get("deathBest");
  best = best == 99999 ? "N/A" : $.formatCommas(best);
  $.ctx.fillText(
    "DEATH BEST: " + best,
    40 / $.game.divisor + translateIn,
    $.game.height - 35 / $.game.divisor
  );
  $.ctx.textAlign("right");
  $.ctx.fillStyle(
    `hsla(${$.game.levels[0].hue1}, 100%, 85%, ${this.titleAlpha})`
  );
  $.ctx.fillText(
    "BY JACK RUGILE",
    $.game.width - 40 / $.game.divisor - translateIn,
    $.game.height - 135 / $.game.divisor
  );
  $.ctx.fillText(
    "JACKRUGILE.COM",
    $.game.width - 40 / $.game.divisor - translateIn,
    $.game.height - 85 / $.game.divisor
  );
  $.ctx.fillText(
    "@JACKRUGILE",
    $.game.width - 40 / $.game.divisor - translateIn,
    $.game.height - 35 / $.game.divisor
  );
  $.ctx.restore();

  for (let i = 0, len = this.buttons.length; i < len; i++) {
    this.buttons[i].render();
  }
};

$.stateMenu.pointerdown = function (e) {
  for (let i = 0, len = this.buttons.length; i < len; i++) {
    let button = this.buttons[i];
    if (button) {
      let result = button.handlePointerDown(e);
    }
  }
};
