$.button = function (opt) {
  $.merge(this, opt);

  this.layer = this.layer || "all";
  this.hovering = false;
  this.tick = 0;
  this.enterDuration = this.enterDuration || 0;
  this.enterDelay = this.enterDelay || 0;

  this.alpha = 0;
  this.scale = 1.1;
};

$.button.prototype.step = function () {
  $.game.tween(this).wait(this.enterDelay).to(
    {
      alpha: 1,
      scale: 1,
    },
    this.enterDuration,
    "outExpo"
  );

  if (
    !$.game.isTouchDevice &&
    $.pointInRect(
      $.game.pointer.x,
      $.game.pointer.y,
      this.x - this.width / 2,
      this.y - this.height / 2,
      this.width,
      this.height
    )
  ) {
    this.hovering = true;
  } else {
    this.hovering = false;
  }

  this.tick += $.game.dtNorm;
};

$.button.prototype.handlePointerDown = function (e) {
  if (
    $.pointInRect(
      e.x,
      e.y,
      this.x - this.width / 2,
      this.y - this.height / 2,
      this.width,
      this.height
    )
  ) {
    this.action();
    return true;
  }

  return false;
};

$.button.prototype.render = function () {
  $.ctx.save();

  $.ctx.a(this.alpha);
  $.ctx.globalCompositeOperation("lighter");

  let currentLevel = $.game.state.currentLevel || 0;
  let level = $.game.levels[currentLevel];

  if (this.hovering || $.game.isTouchDevice) {
    $.ctx.strokeStyle(`hsla(${level.hue2}, 100%, 85%, ${1})`);
  } else {
    $.ctx.strokeStyle(`hsla(${level.hue2}, 100%, 85%, ${0.5})`);
  }
  $.ctx.lineWidth(5 / $.game.divisor);
  $.ctx.beginPath();
  $.ctx.arc(this.x, this.y, (this.width / 2) * this.scale, 0, $.TAU);
  $.ctx.stroke();

  let size = (this.width / 2) * this.scale;
  $.ctx.drawImage(
    $.game.images[this.image()],
    this.x - size / 2,
    this.y - size / 2,
    size,
    size
  );

  $.ctx.restore();
};

$.button.prototype.destroy = function () {};
