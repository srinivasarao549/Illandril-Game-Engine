/**
 * @preserve Copyright (c) 2011, Joseph Spandrusyszyn
 * See https://github.com/illandril/Illandril-Game-Engine.
 */


goog.provide('illandril.game.objects.Slope');

goog.require('goog.object');
goog.require('illandril');
goog.require('illandril.game.objects.Solid');

/**
 * @constructor
 * @extends illandril.game.objects.Solid
 */
illandril.game.objects.Slope = function(direction ) {
  illandril.game.objects.Solid.call(this);
  this.direction = direction;
};
goog.inherits(illandril.game.objects.Slope, illandril.game.objects.Solid);

illandril.game.objects.Slope.DIRECTION = {
  NE: 0, // Slope goes from bottom left to top right, blocks on bottom and right
  SE: 1, // Slope goes from top left to bottom right, blocks on top and right
  SW: 2, // Slope goes from bottom left to top right, blocks on top and left
  NW: 3  // Slope goes from top left to bottom right, blocks on bottom and left
};

illandril.game.objects.Slope.RAMP_OFFSET = 0.4; // We add a little bit of offset from the ramp to stop from getting stuck when moving quickly along slopes

illandril.game.objects.Slope.prototype.blocksFromTop = function() {
  return this.direction == illandril.game.objects.Slope.DIRECTION.SE || this.direction == illandril.game.objects.Slope.DIRECTION.SW;
};
illandril.game.objects.Slope.prototype.blocksFromBottom = function() {
  return this.direction == illandril.game.objects.Slope.DIRECTION.NE || this.direction == illandril.game.objects.Slope.DIRECTION.NW;
};
illandril.game.objects.Slope.prototype.blocksFromLeft = function() {
  return this.direction == illandril.game.objects.Slope.DIRECTION.NW || this.direction == illandril.game.objects.Slope.DIRECTION.SW;
};
illandril.game.objects.Slope.prototype.blocksFromRight = function() {
  return this.direction == illandril.game.objects.Slope.DIRECTION.NE || this.direction == illandril.game.objects.Slope.DIRECTION.SE;
};

illandril.game.objects.Slope.prototype.collideWith = function(otherObject, movement) {
  if (otherObject.canBeBlockedBy(this)) {
    var thisBounds = this.getBlockingBounds();
    var otherBounds = otherObject.getBlockingBounds();
    var size = thisBounds.getSize();
    if (this.direction == illandril.game.objects.Slope.DIRECTION.NE) {
      var y = otherBounds.getBottom() - thisBounds.getBottom();
      var x = thisBounds.getRight() - otherBounds.getRight();
      var slope = Math.min((size.x - x) / size.x, 1);
      var rampTop = slope * size.y + illandril.game.objects.Slope.RAMP_OFFSET;
      if (rampTop > y) {
        otherObject.moveBy(new goog.math.Vec2(0, rampTop - y));
        if ( movement.y < 0 ) {
          otherObject.blockedY();
        }
      }
    } else if (this.direction == illandril.game.objects.Slope.DIRECTION.SE) {
      var y = thisBounds.getTop() - otherBounds.getTop();
      var x = thisBounds.getRight() - otherBounds.getRight();
      var slope = Math.min((size.x - x) / size.x, 1);
      var rampBottom = slope * size.y + illandril.game.objects.Slope.RAMP_OFFSET;
      if (rampBottom > y) {
        otherObject.moveBy(new goog.math.Vec2(0, -1 * (rampBottom - y)));
        if ( movement.y > 0 ) {
          otherObject.blockedY();
        }
      }
    } else if (this.direction == illandril.game.objects.Slope.DIRECTION.SW) {
      var y = thisBounds.getTop() - otherBounds.getTop();
      var x = otherBounds.getLeft() - thisBounds.getLeft();
      var slope = Math.min((size.x - x) / size.x, 1);
      var rampBottom = slope * size.y + illandril.game.objects.Slope.RAMP_OFFSET;
      if (rampBottom > y) {
        otherObject.moveBy(new goog.math.Vec2(0, -1 * (rampBottom - y)));
        if ( movement.y > 0 ) {
          otherObject.blockedY();
        }
      }
    } else /* NW */ {
      var y = otherBounds.getBottom() - thisBounds.getBottom();
      var x = otherBounds.getLeft() - thisBounds.getLeft();
      var slope = Math.min((size.x - x) / size.x, 1);
      var rampTop = slope * size.y + illandril.game.objects.Slope.RAMP_OFFSET;
      if (rampTop > y) {
        otherObject.moveBy(new goog.math.Vec2(0, rampTop - y));
        if ( movement.y < 0 ) {
          otherObject.blockedY();
        }
      }
    }
  }
};
