import { Directive, ElementRef, HostListener, Renderer,EventEmitter,OnDestroy } from '@angular/core';
import { DraggableService } from './draggable.service';

@Directive({
  selector: '[dragEnabled]',
  providers: [DraggableService],
  outputs : [
    "onDragStart",
    "onDrag",
    "onDragStop"
  ]
})
export class DraggableDirective implements OnDestroy {

  private lastX : number;
  private lastY : number;
  private dragging : boolean;
  private unbindMouseMove;
  private unbindMouseUp;

  public onDragStart: EventEmitter<any>;
  public onDrag: EventEmitter<any>;
  public onDragStop: EventEmitter<any>;

  constructor(private el: ElementRef, private renderer: Renderer, private draggableService: DraggableService) {
    this.onDragStart = new EventEmitter();
    this.onDrag = new EventEmitter();
    this.onDragStop = new EventEmitter();
  }

  ngOnDestroy() {
    if(typeof this.unbindMouseMove === 'function'){
          this.unbindMouseMove();
    }
    if(typeof this.unbindMouseUp === 'function'){
          this.unbindMouseUp();
    }    
  }

  @HostListener('mousedown',['$event']) onMouseDown(event) {
    if(!this.dragging){
        this.handleDragStart(event);
    }
  }

  private handleDragStart(event) {

     // Only accept left-clicks.
    if (typeof event.button === 'number' && event.button !== 0) return false;
    
    this.dragEventHandler(event,(coreEvent) => {

      this.onDragStart.next({event,coreEvent});

      this.lastX = coreEvent.x;
      this.lastY = coreEvent.y;
      this.dragging = true;

      //subscribe events listeners for document node events
      this.unbindMouseMove = this.renderer.listenGlobal("document",
                                                      this.draggableService.dragEventFor.move,
                                                      this.handleDragging.bind(this));
      this.unbindMouseUp = this.renderer.listenGlobal("document",
                                                      this.draggableService.dragEventFor.stop,
                                                      this.handleDragStop.bind(this));
    });

  }

  private handleDragging(event) : void {
    
    this.dragEventHandler(event,(coreEvent) => {
      this.onDrag.next({event,coreEvent});
      this.lastX = coreEvent.x;
      this.lastY = coreEvent.y;
    })

  }

  private handleDragStop(event) : void {
    //prevent unsubscribe nothing if handlDragStop called before handleDragStart
    if(typeof this.unbindMouseMove === 'function'){
          this.unbindMouseMove();
          this.unbindMouseMove = null;
    }
    if(typeof this.unbindMouseUp === 'function'){
          this.unbindMouseUp();
          this.unbindMouseMove = null;
    }

    this.dragEventHandler(event,(coreEvent) => {
      //reset to default
      this.lastX = NaN;
      this.lastY = NaN;
      this.dragging = false;
      this.onDragStop.next({event,coreEvent});      
    });

  }

  private dragEventHandler(event,cb) : void {
      //TODO useful for touch device. Not implement anything yet
      // const touchIdentifier = this.draggableService.getTouchIdentifier(event);
    
      const position = this.draggableService.getControlPosition(event,null,this);
      
      if(position === undefined || position === null) {
        console.log("draggble object must have position");
        return null;
      }

      let {x,y} = position;

      const coreEvent = this.draggableService.createCoreData(this,x,y);

      cb(coreEvent);

  }

}