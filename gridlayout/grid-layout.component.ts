import { Component, Input,ContentChildren, AfterViewInit,ViewChildren,QueryList,OnInit } from '@angular/core';
import { TestGridComponent } from '../test-grid.component';

export type LayoutItemRequired = {w: number, h: number, x: number, y: number, i: string};
export type LayoutItem = LayoutItemRequired &
                         {minW?: number, minH?: number, maxW?: number, maxH?: number,
                          moved?: boolean, static?: boolean,
                          isDraggable?: boolean};
export type Layout = Array<LayoutItem>;
export type Position = {left: number, top: number, width: number, height: number};
export type DragCallbackData = {
  node: HTMLElement,
  x: number, y: number,
  deltaX: number, deltaY: number,
  lastX: number, lastY: number
};
export type DragEvent = {e: Event} & DragCallbackData;
export type Size = {width: number, height: number};
export type ResizeEvent = {e: Event, node: HTMLElement, size: Size};
  		
@Component({
  selector: 'grid-layout',
  template: `<div class="react-grid-layout" [ngStyle]="setStyles()">
	              <grid-item *ngFor="let l of layout;let i=index;" 
	              				[containerWidth]= "width"
	              				[rowHeight]="rowHeight"
	              				[cols]="cols"
  	           					[containerPadding]="containerPadding"
  	           					[margin]="margin"
  	           					(onDrag)="onDrag($event)"
	              				[w]="l.w"
	              				[h]="l.h"
	              				[x]="l.x"
	              				[y]="l.y"
	              				[i]="l.i"
	              ></grid-item>
	 		  </div>`,
})
export class GridLayoutComponent implements OnInit {
	
	@Input() propLayout;

  @ContentChildren(TestGridComponent) contentChildren: QueryList<TestGridComponent>;

	cols;
	width;
	layout;
	rowHeight;
	containerPadding;
	margin;
  layoutHeight;
  propLayout1;
  children;
	
	constructor(){
		this.cols = 12;
		this.width = 500;
		this.rowHeight = 50;
		this.containerPadding = [10,10];
		this.margin = [10,10];
    this.propLayout1 = [
        {i: 'a', x: 0, y: 0, w: 1, h: 2},
        {i: 'b', x: 1, y: 0, w: 3, h: 2},
        {i: 'c', x: 4, y: 0, w: 1, h: 2},
        {i: 'd', x: 0, y: 0, w: 1, h: 2},
        {i: 'f', x: 1, y: 0, w: 3, h: 2},
        {i: 'e', x: 4, y: 0, w: 1, h: 2}
     ];
     this.children = [
      {key : 'a'},{key : 'b'},{key: 'c'},{key : 'd'},{key: 'f'},{key : 'e'}
     ];
		this.layout = synchronizeLayoutWithChildren(this.propLayout1,this.children,this.cols,true);
    this.layoutHeight = this.containerHeight();
	}

	ngOnInit(){

	}

  containerHeight() {
    const nbRow = bottom(this.layout);
    const containerPaddingY = this.containerPadding ? this.containerPadding[1] : this.margin[1];
    return nbRow * this.rowHeight + (nbRow - 1) * this.margin[1] + containerPaddingY * 2;
  }

	onDrag({i,x,y,event}){
		let {layout} = this;

		let l = getLayoutItem(this.layout,i);
		if(!l) return;
	  this.layout = compact(moveElement(this.layout,l,x,y,false),true);
    this.layoutHeight = this.containerHeight();

	}

  setStyles(){
    const styles = {
      width: this.width + 'px',
      height: this.layoutHeight + 'px'
    }
    return styles;
  }

}


function synchronizeLayoutWithChildren(initialLayout, children, cols, verticalCompact) {
  initialLayout = initialLayout || [];

  // Generate one layout item per child.
  let layout: Layout = [];
 children.forEach((child, i) => {
    // Don't overwrite if it already exists.
    const exists = getLayoutItem(initialLayout, child.key || "1" /* FIXME satisfies Flow */);
      if (exists) {
	      layout[i] = cloneLayoutItem(exists);
	    } else{
	        // Nothing provided: ensure this is added to the bottom
	        layout[i] = cloneLayoutItem({w: 1, h: 1, x: 0, y: bottom(layout), i: child.key || "1"});
	    }
  });

  // Correct the layout.
  layout = correctBounds(layout, {cols: cols});
  layout = compact(layout, verticalCompact);
  return layout;
}
function bottom(layout: Layout): number {
  let max = 0, bottomY;
  for (let i = 0, len = layout.length; i < len; i++) {
    bottomY = layout[i].y + layout[i].h;
    if (bottomY > max) max = bottomY;
  }
  return max;
}

function compact(layout: Layout, verticalCompact: boolean): Layout {
  // Statics go in the compareWith array right away so items flow around them.
  const compareWith = getStatics(layout);
  // We go through the items by row and column.
  const sorted = sortLayoutItemsByRowCol(layout);

  // Holding for new items.
  const out = Array(layout.length);

  for (let i = 0, len = sorted.length; i < len; i++) {
     //my change from original code
     // don't want to create a new reference for a layout
    // let l = cloneLayoutItem(sorted[i]);
    let l = sorted[i];
    // Don't move static elements
    if (!l.static) {
      l = compactItem(compareWith, l, verticalCompact);

      // Add to comparison array. We only collide with items before this one.
      // Statics are already in this array.
      compareWith.push(l);
    }
    // Add to output array to make sure they still come out in the right order.
    out[layout.indexOf(sorted[i])] = l;
    // Clear moved flag, if it exists.
    l.moved = false;
  }
  return out;
}

function compactItem(compareWith: Layout, l: LayoutItem, verticalCompact: boolean): LayoutItem {
  if (verticalCompact) {
    // Bottom 'y' possible is the bottom of the layout.
    // This allows you to do nice stuff like specify {y: Infinity}
    // This is here because the layout must be sorted in order to get the correct bottom `y`.
    l.y = Math.min(bottom(compareWith), l.y);

    // Move the element up as far as it can go without colliding.
    while (l.y > 0 && !getFirstCollision(compareWith, l)) {
      l.y--;
    }
  }
  // Move it down, and keep moving it down if it's colliding.
  let collides;
  while((collides = getFirstCollision(compareWith, l))) {
    l.y = collides.y + collides.h;
  }
  return l;
}

function sortLayoutItemsByRowCol(layout: Layout): Layout {
  return [].concat(layout).sort(function(a, b) {
    if (a.y > b.y || (a.y === b.y && a.x > b.x)) {
      return 1;
    } else if (a.y === b.y && a.x === b.x) {
      // Without this, we can get different sort results in IE vs. Chrome/FF
      return 0;
    }
    return -1;
  });
}

function correctBounds(layout: Layout, bounds: {cols: number}): Layout {
  const collidesWith = getStatics(layout);
  for (let i = 0, len = layout.length; i < len; i++) {
    const l = layout[i];
    // Overflows right
    if (l.x + l.w > bounds.cols) l.x = bounds.cols - l.w;
    // Overflows left
    if (l.x < 0) {
      l.x = 0;
      l.w = bounds.cols;
    }
    if (!l.static) collidesWith.push(l);
    else {
      // If this is static and collides with other statics, we must move it down.
      // We have to do something nicer than just letting them overlap.
      while(getFirstCollision(collidesWith, l)) {
        l.y++;
      }
    }
  }
  return layout;
}

function collides(l1: LayoutItem, l2: LayoutItem): boolean {
  if (l1 === l2) return false; // same element
  if (l1.x + l1.w <= l2.x) return false; // l1 is left of l2
  if (l1.x >= l2.x + l2.w) return false; // l1 is right of l2
  if (l1.y + l1.h <= l2.y) return false; // l1 is above l2
  if (l1.y >= l2.y + l2.h) return false; // l1 is below l2
  return true; // boxes overlap
}

function getFirstCollision(layout: Layout, layoutItem: LayoutItem): LayoutItem {
  for (let i = 0, len = layout.length; i < len; i++) {
    if (collides(layout[i], layoutItem)) return layout[i];
  }
}


function getStatics(layout: Layout): Array<LayoutItem> {
  return layout.filter((l) => l.static);
}

function getLayoutItem(layout, id) {
  for (let i = 0, len = layout.length; i < len; i++) {
    if (layout[i].i === id) return layout[i];
  }
}

function cloneLayoutItem(layoutItem: LayoutItem): LayoutItem {
  return {
    w: layoutItem.w, h: layoutItem.h, x: layoutItem.x, y: layoutItem.y, i: layoutItem.i,
    minW: layoutItem.minW, maxW: layoutItem.maxW, minH: layoutItem.minH, maxH: layoutItem.maxH,
    moved: Boolean(layoutItem.moved), static: Boolean(layoutItem.static),
    // These can be null
    isDraggable: layoutItem.isDraggable
  };
}

function getAllCollisions(layout: Layout, layoutItem: LayoutItem): Array<LayoutItem> {
  return layout.filter((l) => collides(l, layoutItem));
}

function moveElementAwayFromCollision(layout: Layout, collidesWith: LayoutItem,
                                             itemToMove: LayoutItem, isUserAction: boolean): Layout {

  // If there is enough space above the collision to put this element, move it there.
  // We only do this on the main collision as this can get funky in cascades and cause
  // unwanted swapping behavior.
  if (isUserAction) {
    // Make a mock item so we don't modify the item here, only modify in moveElement.
    const fakeItem: LayoutItem = {
      x: itemToMove.x,
      y: itemToMove.y,
      w: itemToMove.w,
      h: itemToMove.h,
      i: '-1'
    };
    fakeItem.y = Math.max(collidesWith.y - itemToMove.h, 0);
    if (!getFirstCollision(layout, fakeItem)) {
      return moveElement(layout, itemToMove, undefined, fakeItem.y,false);
    }
  }

  // Previously this was optimized to move below the collision directly, but this can cause problems
  // with cascading moves, as an item may actually leapfrog a collision and cause a reversal in order.
  return moveElement(layout, itemToMove, undefined, itemToMove.y + 1,false);
}

function moveElement(layout: Layout, l: LayoutItem, x: any, y: any, isUserAction: any): Layout {
  if (l.static) return layout;

  // Short-circuit if nothing to do.
  if (l.y === y && l.x === x) return layout;

  const movingUp = y && l.y > y;
  // This is quite a bit faster than extending the object
  if (typeof x === 'number') l.x = x;
  if (typeof y === 'number') l.y = y;

  // TODO : set move somwhow
 // l.moved = true;

  // If this collides with anything, move it.
  // When doing this comparison, we have to sort the items we compare with
  // to ensure, in the case of multiple collisions, that we're getting the
  // nearest collision.
  let sorted = sortLayoutItemsByRowCol(layout);
  if (movingUp) sorted = sorted.reverse();
  const collisions = getAllCollisions(sorted, l);
  // Move each item that collides away from this element.
  for (let i = 0, len = collisions.length; i < len; i++) {
    const collision = collisions[i];
    // console.log('resolving collision between', l.i, 'at', l.y, 'and', collision.i, 'at', collision.y);
    // Short circuit so we can't infinite loop
    if (collision.moved) continue;

    // This makes it feel a bit more precise by waiting to swap for just a bit when moving up.
    if (l.y > collision.y && l.y - collision.y > collision.h / 4) continue;

    // Don't move static items - we have to move *this* element away
    if (collision.static) {
      layout = moveElementAwayFromCollision(layout, collision, l, isUserAction);
    } else {
      layout = moveElementAwayFromCollision(layout, l, collision, isUserAction);
    }
  }

  return layout;
}