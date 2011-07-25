/*
 * Copyright (c) 2006-2007 Erin Catto http://www.gphysics.com
 *
 * This software is provided 'as-is', without any express or implied
 * warranty.  In no event will the authors be held liable for any damages
 * arising from the use of this software.
 * Permission is granted to anyone to use this software for any purpose,
 * including commercial applications, and to alter it and redistribute it
 * freely, subject to the following restrictions:
 * 1. The origin of this software must not be misrepresented; you must not
 * claim that you wrote the original software. If you use this software
 * in a product, an acknowledgment in the product documentation would be
 * appreciated but is not required.
 * 2. Altered source versions must be plainly marked as such, and must not be
 * misrepresented as being the original software.
 * 3. This notice may not be removed or altered from any source distribution.
 */
 
/*
 * This copy includes modifications by Illandril for performance optimizations and readability
 * It is split into multiple files:
 *   Box2D (this file - include first)
 *   base 
 *   collision
 *   dynamics
 *   unopped (temporary file, containing everything not yet optimized - include second to last)
 *   post (include last)
 */
 
goog.provide('Box2D');
goog.require('Box2D.base');
goog.require('Box2D.Collision');
goog.require('Box2D.Dynamics');
goog.require('Box2D.unopped');
goog.require('Box2D.Post');