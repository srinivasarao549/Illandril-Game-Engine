/*
 * See Box2D.js
 */
goog.provide('Box2D.Common.b2Color');

goog.require('Box2D.defineProperty');
goog.require('Box2D.Common.Math.b2Math');

Box2D.Common.b2Color = function(rr, gg, bb) {
    this._r = 255 * Box2D.Common.Math.b2Math.Clamp(rr, 0.0, 1.0);
    this._g = 255 * Box2D.Common.Math.b2Math.Clamp(gg, 0.0, 1.0);
    this._b = 255 * Box2D.Common.Math.b2Math.Clamp(bb, 0.0, 1.0);
};

Box2D.Common.b2Color.prototype.Set = function(rr, gg, bb) {
    this._r = 255 * Box2D.Common.Math.b2Math.Clamp(rr, 0.0, 1.0);
    this._g = 255 * Box2D.Common.Math.b2Math.Clamp(gg, 0.0, 1.0);
    this._b = 255 * Box2D.Common.Math.b2Math.Clamp(bb, 0.0, 1.0);
};

Box2D.defineProperty(Box2D.Common.b2Color.prototype, 'r', {
    enumerable: false,
    configurable: true,
    set: function(rr) {
        this._r = 255 * Box2D.Common.Math.b2Math.Clamp(rr, 0.0, 1.0);
    }
});

Box2D.defineProperty(Box2D.Common.b2Color.prototype, 'g', {
    enumerable: false,
    configurable: true,
    set: function(gg) {
        this._g = 255 * Box2D.Common.Math.b2Math.Clamp(gg, 0.0, 1.0);
    }
});

Box2D.defineProperty(Box2D.Common.b2Color.prototype, 'b', {
    enumerable: false,
    configurable: true,
    set: function(bb) {
        this._b = 255 * Box2D.Common.Math.b2Math.Clamp(bb, 0.0, 1.0);
    }
});

Box2D.defineProperty(Box2D.Common.b2Color.prototype, 'color', {
    enumerable: false,
    configurable: true,
    get: function() {
        return (this._r << 16) | (this._g << 8) | (this._b);
    }
});