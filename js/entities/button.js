$.button = function (opt) {
  $.merge(this, opt);

  this.layer = this.layer || "all";
  this.hovering = false;
};

$.button.prototype.step = function () {
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

  // $.ctx.globalCompositeOperation("source-over");
  // if (this.hovering || $.game.isTouchDevice) {
  //   $.ctx.fillStyle(`hsla(0, 0%, 0%, 0.25)`);
  // } else {
  //   $.ctx.fillStyle(`hsla(0, 0%, 0%, 0)`);
  // }
  // $.ctx.beginPath();
  // $.ctx.arc(this.x, this.y, this.width / 2 - 5 / $.game.divisor / 2, 0, $.TAU);
  // $.ctx.fill();

  $.ctx.globalCompositeOperation("lighter");

  if (this.hovering || $.game.isTouchDevice) {
    $.ctx.strokeStyle(
      `hsla(${$.game.levels[$.game.state.currentLevel].hue2}, 100%, 85%, ${1})`
    );
  } else {
    $.ctx.strokeStyle(
      `hsla(${
        $.game.levels[$.game.state.currentLevel].hue2
      }, 100%, 85%, ${0.5})`
    );
  }
  $.ctx.lineWidth(5 / $.game.divisor);
  $.ctx.beginPath();
  $.ctx.arc(this.x, this.y, this.width / 2, 0, $.TAU);
  $.ctx.stroke();

  let size = this.width / 2;
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
