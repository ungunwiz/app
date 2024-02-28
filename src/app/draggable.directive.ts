import { Directive, ElementRef, HostListener, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appDraggable]',
})
export class DraggableDirective {
  private startX: number = 0;
  private startY: number = 0;
  private x: number = 0;
  private y: number = 0;
  private dragging: boolean = false;

  constructor(private el: ElementRef, private renderer: Renderer2) {
    this.renderer.setStyle(this.el.nativeElement, 'position', 'relative');
    this.renderer.setStyle(this.el.nativeElement, 'cursor', 'move');
  }

  @HostListener('mousedown', ['$event'])
  onMouseDown(event: MouseEvent) {
    event.preventDefault();
    this.startX = event.clientX - this.x;
    this.startY = event.clientY - this.y;
    this.dragging = true;
  }

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    if (!this.dragging) return;
    this.x = event.clientX - this.startX;
    this.y = event.clientY - this.startY;
    this.renderer.setStyle(
      this.el.nativeElement,
      'transform',
      `translate(${this.x}px, ${this.y}px)`
    );
  }

  @HostListener('document:mouseup')
  onMouseUp() {
    this.dragging = false;
  }
}
