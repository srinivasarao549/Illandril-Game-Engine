goog.provide("illandril.game.ui.Viewport");

goog.require("goog.math.Vec2");
goog.require("illandril.math.Bounds");

/**
 * @constructor
 */
illandril.game.ui.Viewport = function( container, scene, size ) {
  var vpcontainer = container;
  this.domObject = document.createElement('span');
  this.domObject.className = 'viewport';
  this.domObject.style.width = size.x + "px";
  this.domObject.style.height = size.y + "px";
  this.domObject.style.zIndex = 0;
  this.hide();
  vpcontainer.appendChild( this.domObject );
  this.domObjects = {};
  this.domObjectsCount = 0;
  this.bounds = new illandril.math.Bounds( new goog.math.Vec2( 0, 0 ), size );
  this.zoomedBounds = this.bounds;
  this.zoom = 1;
  this.movedSinceLastUpdate = false;
  this.zoomedSinceLastUpdate = false;
  this.scene = scene;
  this.following = null;
  this.scene.attachViewport( this );
};

illandril.game.ui.Viewport.prototype.setZoom = function( zoom ) {
  this.zoom = zoom;
  this.zoomedBounds = this.bounds.divide( this.zoom );
  var size = this.zoomedBounds.getSize();
  this.domObject.style.width = size.x + "px";
  this.domObject.style.height = size.y + "px";
  this.domObject.style.zoom = zoom;
  this.domObject.style["MozTransform"] = "scale(" + zoom + ")";
  this.movedSinceLastUpdate = true;
  this.zoomedSinceLastUpdate = true;
  this.scene.updateViewports();
};

illandril.game.ui.Viewport.prototype.lookAtNoUpdate = function( position ) {
  this.bounds.centerOn( position );
  this.zoomedBounds.centerOn( position );
  this.movedSinceLastUpdate = true;
};

illandril.game.ui.Viewport.prototype.lookAt = function( position ) {
  this.following = null;
  this.lookAtNoUpdate( position );
  this.scene.updateViewports();
};

illandril.game.ui.Viewport.prototype.follow = function( obj ) {
  this.following = obj;
  this.scene.updateViewports();
};

illandril.game.ui.Viewport.prototype.hide = function() {
  this.domObject.style.display = "none";
};

illandril.game.ui.Viewport.prototype.show = function() {
  this.domObject.style.display = "";
};

illandril.game.ui.Viewport.prototype.update = function( tickTime, gameTime ) {
  if ( this.following != null ) {
    this.lookAtNoUpdate( this.following.getPosition() );
  }
  
  var shownObjects = [];
  var objectsToShow = this.scene.getObjects( this.zoomedBounds );
  var topLeft = this.zoomedBounds.getTopLeft();
  for ( var idx = 0; idx < objectsToShow.length; idx++ ) {
    var obj = objectsToShow[idx];
    var objPos = obj.getPosition();
    var objSize = obj.getSize();
    // make sure it's big enough to see (at least 1 sq pixel of surface area)
    if ( this.zoom >= 1 || ( ( objSize.x * objSize.y ) * this.zoom ) >= 1 ) {
      shownObjects[shownObjects.length] = obj.id;
      var objDom = this.domObjects[obj.id];
      if ( objDom == null ) {
        objDom = document.createElement( 'span' );
        this.domObjects[obj.id] = objDom;
        this.domObjectsCount++;
        objDom.className = "gameObject";
        objDom.obj = obj;
        objDom.savedStyle = {};
        if ( obj.bg != null ) {
          objDom.style.backgroundColor = "transparent";
        }
        objDom.onclick = function(e) {
          if ( this.obj.onClick != null ) {
            this.obj.onClick(e);
          }
        };
        objDom.onmousedown = function(e) {
          if ( this.obj.onMouseDown != null ) {
            this.obj.onMouseDown(e);
          }
        };
        objDom.onmouseup = function(e) {
          if ( this.obj.onMouseUp != null ) {
            this.obj.onMouseUp(e);
          }
        };
        objDom.onmouseover = function(e) {
          if ( this.obj.onMouseOver != null ) {
            this.obj.onMouseOver(e);
          }
        };
        objDom.onmouseout = function(e) {
          if ( this.obj.onMouseOut != null ) {
            this.obj.onMouseOut(e);
          }
        };
        this.domObject.appendChild( objDom );
      }
      var resized = this.zoomedSinceLastUpdate || objDom.savedStyle.width != objSize.x || objDom.savedStyle.height != objSize.y;
      var moved = this.movedSinceLastUpdate || resized || objDom.savedStyle.top != objPos.y || objDom.savedStyle.left != objPos.x
      if ( moved ) {
        objDom.style.left = ( objPos.x - objSize.x / 2 - topLeft.x ) + "px";
        objDom.style.top = ( objPos.y - objSize.y / 2 - topLeft.y ) + "px";
        objDom.savedStyle.left = objPos.x;
        objDom.savedStyle.top = objPos.y;
      }
      if ( resized ) {
        objDom.style.width = objSize.x + "px";
        objDom.style.height = objSize.y + "px";
        objDom.savedStyle.width = objSize.x;
        objDom.savedStyle.height = objSize.y;
      }
      if ( objDom.savedStyle.z != obj.zIndex ) {
        objDom.style.zIndex = Math.max( 1, obj.zIndex + 1000 );
        objDom.savedStyle.z = obj.zIndex;
      }
      if ( obj.bg != null ) {
        var sprite = obj.bg.getSprite( gameTime, obj );
        // We save the old BG and BGPos as seperate attributes because CSS engines can tweak the values returned from style
        if ( objDom.savedStyle.bg != sprite.src ) {
          objDom.style.backgroundImage = "url(" + sprite.src + ")";
          objDom.savedStyle.bg = sprite.src;
        }
        if ( objDom.savedStyle.bgX != sprite.x || objDom.savedStyle.bgY != sprite.y ) {
          objDom.style.backgroundPosition = ( sprite.x * -1 ) + "px " + ( sprite.y * -1 ) + "px";
          objDom.savedStyle.bgX = sprite.x;
          objDom.savedStyle.bgY = sprite.y;
        }
      }
    }
  }
  
  this.clean( shownObjects );
};

illandril.game.ui.Viewport.prototype.clean = function( shownObjects ) {
  if ( this.domObjectsCount > shownObjects.length ) {
    for ( var objID in this.domObjects ) {
      var hasObj = false;
      for ( var idx = 0; idx < shownObjects.length && !hasObj; idx++ ) {
        hasObj = shownObjects[idx] == objID;
      }
      if ( !hasObj ) {
        this.domObject.removeChild( this.domObjects[objID] );
        delete this.domObjects[objID];
        this.domObjectsCount--;
      }
    }
  }
};

illandril.game.ui.Viewport.prototype.getBounds = function() {
  return this.bounds;
};
