$.block = function (opt) {};

$.block.prototype.init = function (opt) {
  $.merge(this, opt);
  this.hitRadius = this.size * 0.35;
  this.tick = 0;
  this.scale = 0;
  this.scaleTarget = 0;
  this.rotation = -$.HALFPI;
  this.rotationTarget = 0;
  this.alpha = 0;
  this.alphaTarget = 0;
  this.destroying = false;
  this.hitTick = 0;
  this.hitTickMax = 60;
};

$.block.prototype.step = function () {
  this.tick += $.game.dtNorm;

  if (this.destroying) {
    this.scaleTarget = 0;
  } else if (this.tick * 40 > this.y) {
    this.scaleTarget = 1;
  }

  this.scale +=
    (this.scaleTarget - this.scale) * (1 - Math.exp(-0.1 * $.game.dtNorm));

  if (this.destroying) {
    this.rotationTarget = $.PI;
  } else if (
    this.tick * 40 > this.y &&
    this.track == $.game.state.currentTrack
  ) {
    this.rotationTarget = 0;
  } else {
    this.rotationTarget = $.HALFPI;
  }
  this.rotation +=
    (this.rotationTarget - this.rotation) *
    (1 - Math.exp(-0.1 * $.game.dtNorm));

  if (this.destroying) {
    this.alphaTarget = 0;
  } else if (
    this.tick * 40 > this.y &&
    this.track == $.game.state.currentTrack
  ) {
    this.alphaTarget = 1;
  } else {
    this.alphaTarget = 0.2;
  }
  this.alpha +=
    (this.alphaTarget - this.alpha) * (1 - Math.exp(-0.1 * $.game.dtNorm));

  // handle hit
  if (this.hitTick > 0) {
    this.hitTick -= $.game.dtNorm;
    this.hitTick = Math.max(this.hitTick, 0);
  }

  if (this.destroying) {
    if (this.scale < 0.001) {
      this.pool.release(this);
    }
  }
};

$.block.prototype.render = function () {
  $.ctx.save();
  $.ctx.beginPath();
  $.ctx.rect(
    0,
    (this.track * $.game.height) / 3,
    $.game.width,
    $.game.height / 3
  );
  $.ctx.clip();

  $.ctx.save();
  $.ctx.translate(this.x + this.size / 2, this.y + this.size / 2);
  $.ctx.scale(this.scale, this.scale);
  $.ctx.rotate(this.rotation);
  $.ctx.a(this.alpha);
  $.ctx.fillStyle($.game.blockGradient);
  $.ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
  $.ctx.restore();

  // hit flash
  if (this.hitTick > 0) {
    $.ctx.save();
    $.ctx.beginPath();
    $.ctx.fillStyle(
      "hsla(0, 0%, 100%, " + this.hitTick / this.hitTickMax + ")"
    );
    $.ctx.fillRect(this.x, this.y, this.size, this.size);
    $.ctx.restore();
  }

  // draw hit radius
  if ($.game.isDebug) {
    $.ctx.beginPath();
    $.ctx.arc(
      this.x + this.size / 2,
      this.y + this.size / 2,
      this.hitRadius,
      0,
      $.TAU
    );
    $.ctx.fillStyle("hsla(0, 0%, 100%, 0.25)");
    $.ctx.fill();
  }

  $.ctx.restore();
};

$.block.prototype.destroy = function () {
  this.destroying = true;
};
