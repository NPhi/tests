import {Injectable} from '@angular/core';

// Simple abstraction for dragging events names.
const eventsFor = {
  touch: {
    start: 'touchstart',
    move: 'touchmove',
    stop: 'touchend'
  },
  mouse: {
    start: 'mousedown',
    move: 'mousemove',
    stop: 'mouseup'
  }
};


@Injectable()
export class DraggableService {
	public dragEventFor;
	public eventsFor;
	constructor(){
		this.eventsFor = eventsFor;
		this.dragEventFor = eventsFor.mouse;
	}
	
	getTouchIdentifier(e) {
	  if (e.targetTouches && e.targetTouches[0]) return e.targetTouches[0].identifier;
	  if (e.changedTouches && e.changedTouches[0]) return e.changedTouches[0].identifier;
	}

	getControlPosition(e, touchIdentifier, draggableCore) {
	  if (typeof touchIdentifier === 'number') return null; // not the right touch
	  const node = draggableCore.el.nativeElement;

	  // User can provide an offsetParent if desired.
	  const offsetParent = node.offsetParent || node.ownerDocument.body;
	  return this.offsetXYFromParent(e, offsetParent);
	}
	
	//get offset parent
	offsetXYFromParent(evt, offsetParent) {
	  const isBody = offsetParent === offsetParent.ownerDocument.body;

	  const offsetParentRect = isBody ? {left: 0, top: 0} : offsetParent.getBoundingClientRect();

	  const x = evt.clientX + offsetParent.scrollLeft - offsetParentRect.left;

	  const y = evt.clientY + offsetParent.scrollTop - offsetParentRect.top;

	  return {x, y};
	}
	/**
	 * @param {DraggableDirective} contain tracking coordinates and current native DOM
	 * @param {x Position} x offset parent of the current dragged object
	 * @param {y Position} y offset parent of the current dragged object
	 * @return {CoreData} contains delta coordinates which is from the starting dragged point.
	 */
	createCoreData(draggable, x, y) {

	  const isStart = isNaN(draggable.lastX);

	    // If this is our first move, use the x and y as last coords.
	    return isStart ? {
	        node: draggable.el.nativeElement,
	        deltaX: 0, deltaY: 0,
	        lastX: x, lastY: y,
	        x: x, y: y } 
	      : { node: draggable.el.nativeElement, // Otherwise calculate proper values.
	          deltaX: x - draggable.lastX, deltaY: y - draggable.lastY,
	          lastX: draggable.lastX, lastY: draggable.lastY,
	          x: x, y: y
	        };

	}

}