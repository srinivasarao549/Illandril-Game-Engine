goog.provide("illandril.game.World");

goog.require("goog.math.Vec2");
goog.require("illandril.math.Bounds");
goog.require("illandril.game.objects.GameObject");
goog.require("illandril.game.objects.Container");

/**
 * @constructor
 * @param {illandril.game.World} world the world the object lives in
 * @param {illandril.math.Bounds} bounds the bounds that define the size and location of the object
 * @param {string|null} bg the URL of the background image for this object
 */
illandril.game.World = function() {
  this.viewports = [];
  
  this.objects = new illandril.game.objects.Container();
  
  this.inBulk = 0;
  this.hasUpdate = false;
  this.buckets = {};
};

var bucketSize = 100;
illandril.game.World.prototype.getBucket = function( center ) {
  var bucketX = Math.round( center.x / bucketSize );
  if ( this.buckets[bucketX] == null ) {
    this.buckets[bucketX] = {};
  }
  var bucketY = Math.round( center.y / bucketSize );
  if ( this.buckets[bucketX][bucketY] == null ) {
    this.buckets[bucketX][bucketY] = new illandril.game.objects.Container();
  }
  return this.buckets[bucketX][bucketY];
};

illandril.game.World.prototype.getNearbySolidObjects = function( center ) {
  var nearbyObjects = [];
  var bucketX = Math.round( center.x / bucketSize );
  var bucketY = Math.round( center.y / bucketSize );
  for ( var x = -1; x <= 1; x++ ) {
    var xBucketContainer = this.buckets[bucketX + x];
    if ( xBucketContainer != null ) {
      for ( var y = -1; y <= 1; y++ ) {
        var bucket = xBucketContainer[bucketY + y]
        if ( bucket != null ) {
          var bucketObjects = bucket.getSolidObjects();
          for ( var objIdx = 0; objIdx < bucketObjects.length; objIdx++ ) {
            nearbyObjects[nearbyObjects.length] = bucketObjects[objIdx];
          }
        }
      }
    }
  }
  return nearbyObjects;
};

illandril.game.World.prototype.startBulk = function() {
  this.inBulk++;
};

illandril.game.World.prototype.endBulk = function() {
  this.inBulk--;
  if ( this.hasUpdate ) {
    this.updateViewports();
  }
};

illandril.game.World.prototype.addObject = function( gameObject ) {
  this.objects.add( gameObject );
  this.objectMoved( gameObject );
};

illandril.game.World.prototype.removeObject = function( gameObject ) {
  this.objects.remove( gameObject );
  var oldBucket = gameObject.bucket;
  if ( oldBucket != null ) {
    oldBucket.remove( gameObject );
  }
  this.updateViewports();
};

illandril.game.World.prototype.getObjects = function( bounds ) {
  if ( bounds == null ) {
    return this.objects;
  }
  var topLeft = bounds.getTopLeft();
  var bottomRight = topLeft.clone().add( bounds.getSize() );
  var bucketX = Math.round( topLeft.x / bucketSize ) - 1;
  var bucketXMax = Math.round( bottomRight.x / bucketSize ) + 1;
  var bucketY = Math.round( topLeft.y / bucketSize ) - 1;
  var bucketYMax = Math.round( bottomRight.y / bucketSize ) + 1;
  var containedObjects = [];
  for( var x = bucketX; x <= bucketXMax; x++ ) {
    var xBucketContainer = this.buckets[x];
    if ( xBucketContainer != null ) {
      for( var y = bucketY; y <= bucketYMax; y++ ) {
        var bucket = xBucketContainer[y]
        if ( bucket != null ) {
          var bucketObjects = bucket.getAllObjects();
          for ( var objIdx = 0; objIdx < bucketObjects.length; objIdx++ ) {
            containedObjects[containedObjects.length] = bucketObjects[objIdx];
          }
        }
      }
    }
  }
  return containedObjects;
};

illandril.game.World.prototype.attachViewport = function( viewport ) {
  this.viewports[this.viewports.length] = viewport;
};

illandril.game.World.prototype.updateViewports = function() {
  this.hasUpdate = true;
  if ( this.inBulk == 0 ) {
    this.hasUpdate = false;
    for ( var idx = 0; idx < this.viewports.length; idx++ ) {
      this.viewports[idx].update();
    }
  }
};

illandril.game.World.prototype.objectMoved = function( gameObject ) {
  var oldBucket = gameObject.bucket;
  var newBucket = this.getBucket( gameObject.getPosition() );
  if ( oldBucket != null && oldBucket != newBucket ) {
    oldBucket.remove( gameObject );
  }
  newBucket.add( gameObject );
  gameObject.bucket = newBucket;
  this.updateViewports();
};

doRandom = false;
randomObject = null;
illandril.game.World.prototype.update = function( tick ) {
  tick = Math.min( tick, 1000 );
  this.startBulk();
  if ( doRandom && Math.random() * 100 < 25 ) {
    if ( randomObject != null ) {
      this.removeObject( randomObject );
    }
    randomObject = new illandril.game.objects.GameObject( this, illandril.math.Bounds.fromCenter( new goog.math.Vec2( 500, 0 ), new goog.math.Vec2( Math.random() * 100, Math.random() * 100 ) ) );
  }
  var movingObjects = this.think( tick );
  this.move( tick, movingObjects );
  this.endBulk();
};

illandril.game.World.prototype.think = function( tick ) {
  var movingObjects = [];
  var activeObjects = this.objects.getActiveObjects();
  for ( var idx = 0; idx < activeObjects.length; idx++ ) {
    var obj = activeObjects[idx];
    var needsUpdate = obj.think( tick );
    if ( obj.isMoving() ) {
      movingObjects.push( obj );
    }
  }
  return movingObjects;
};

illandril.game.World.prototype.move = function( tick, movingObjects ) {
  for ( var idx = 0; idx < movingObjects.length; idx++ ) {
    var obj = movingObjects[idx];
    var movement = obj.getVelocity().scale( tick / 50 );
    var intersectionBounds = illandril.math.Bounds.fromCenter( obj.getPosition().add( movement ), obj.getSize() );
    var hasBlockingCollision = checkForCollisions( obj, intersectionBounds, this.getNearbySolidObjects( obj.getPosition() ) );
    if ( !hasBlockingCollision ) {
      obj.moveBy( movement );
      // "friction"
      obj.addVelocity( obj.getVelocity().scale( 1 - Math.min( 1, tick / 100 ) ).invert() );
    } else {
      obj.setVelocity( new goog.math.Vec2( 0, 0 ) );
    }
  }
};

illandril.game.World.prototype.hasObjectIntersecting = function( bounds ) {
  var objectList = this.getNearbySolidObjects( bounds.getCenter() );
  var hasCollision = false;
  for( var idx = 0; idx < objectList.length && !hasCollision; idx++ ) {
    hasCollision = bounds.intersects( objectList[idx].getBounds() );
  }
  return hasCollision;
};

function checkForCollisions( movingObject, bounds, objectList ) {
  var hasBlockingCollision = false;
  var collidingObjects = [];
  for ( var idx = 0; idx < objectList.length && !hasBlockingCollision; idx++ ) {
    var nearbyObject = objectList[idx];
    if ( movingObject == nearbyObject ) {
      continue;
    }
    var collision = bounds.intersects( nearbyObject.getBounds() );
    if ( collision ) {
      collidingObjects.push( nearbyObject );
      hasBlockingCollision = ( movingObject.canBeBlocked()
                               && movingObject.canBeBlockedBy( nearbyObject )
                               && nearbyObject.blocks( movingObject ) );
    }
  }
  if ( !hasBlockingCollision ) {
    for ( var idx = 0; idx < collidingObjects.length; idx++ ) {
      movingObject.collideWith( collidingObjects[idx] );
      collidingObjects[idx].collideWith( movingObject );
    }
  }
  return hasBlockingCollision;
};

