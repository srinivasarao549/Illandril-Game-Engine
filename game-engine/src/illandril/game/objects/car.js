/**
 * @preserve Copyright (c) 2011, Joseph Spandrusyszyn
 * See https://github.com/illandril/Illandril-Game-Engine.
 */


goog.provide('illandril.game.objects.Car');

goog.require('goog.object');
goog.require('illandril');
goog.require('illandril.game.objects.Active');
goog.require('illandril.game.objects.GameObject');
goog.require('illandril.game.objects.Solid');

/**
 * @constructor
 * @extends illandril.game.objects.GameObject
 */
illandril.game.objects.Car = function(scene, bounds, bg, zIndex ) {
  illandril.game.objects.GameObject.call(this, scene, bounds, bg, zIndex);
  illandril.game.objects.Active.call(this);
  illandril.game.objects.Solid.call(this);
};
goog.inherits(illandril.game.objects.Car, illandril.game.objects.GameObject);
goog.object.extend(illandril.game.objects.Car.prototype, illandril.game.objects.Active.prototype);
goog.object.extend(illandril.game.objects.Car.prototype, illandril.game.objects.Solid.prototype);

illandril.game.objects.Car.prototype.think = function(tick ) {
  this.setVelocity(new goog.math.Vec2(Math.random(), 0));
};

illandril.game.objects.Car.prototype.canBeBlocked = function() { return false; };
illandril.game.objects.Car.prototype.canBlock = function() { return false; };

