import { Directive, ElementRef, Input, OnInit, OnDestroy } from '@angular/core';

@Directive({
  selector: '[qdrag]'
})
export class QdragDirective implements OnInit, OnDestroy {
  @Input() qdrag: HTMLElement;
  @Input() bindToWindow: boolean;
  @Input() offsetX = 0;
  @Input() offsetY = 0;

  private rightGap: number;
  private startX = 0;
  private startY = 0;

  constructor(private el: ElementRef) { }

  ngOnInit() {
    this.offsetX = +this.offsetX;
    this.offsetY = +this.offsetY;
    this.updateTransform();

    if (!this.qdrag) this.qdrag = this.el.nativeElement;
    else this.qdrag.addEventListener('dblclick', () => {
      this.offsetX = 0;
      this.offsetY = 0;
      this.updateTransform();
    });
		this.qdrag.addEventListener('mousedown', this.onDown);
		this.qdrag.addEventListener('touchstart', this.touchStart);
    if (this.bindToWindow !== undefined) window.addEventListener('resize', this.offsetToRightGap);
  }

  ngOnDestroy() {
    this.qdrag.removeEventListener('mousedown', this.onDown);
		this.qdrag.removeEventListener('touchstart', this.touchStart);
    window.removeEventListener('resize', this.offsetToRightGap);
  }

  private updateTransform() {
    this.el.nativeElement.style.transform = `translate(${this.offsetX}px,${this.offsetY}px)`;
  }

  private offsetToRightGap = () => {
    if (this.rightGap !== undefined) {
      const box = this.qdrag.getBoundingClientRect();
      this.offsetX += window.innerWidth - box.right - this.rightGap;
      this.bindWindow(true);
    } else this.bindWindow();
  }

  private bindWindow(skipRight = false) {
    const box = this.qdrag.getBoundingClientRect();
    if (box.right < 30) {
      this.offsetX += 30 - box.right;
    } else if (!skipRight && box.left > window.innerWidth - 30) {
      this.offsetX += window.innerWidth - 30 - box.left;
    }
    if (box.bottom < 80) {
      this.offsetY += 80 - box.bottom;
    } else if (box.top > window.innerHeight - 30) {
      this.offsetY += window.innerHeight - 30 - box.top;
    }

    if (!skipRight) {
      if (box.right < window.innerWidth / 2) delete this.rightGap;
      else this.rightGap = window.innerWidth - box.right;
    }
    this.updateTransform();
  }

	private onDown = (event: MouseEvent) => {
    if (event.ctrlKey) return;
		document.addEventListener('mousemove', this.onMove);
		// document.addEventListener('mouseleave', this.onUp);
		document.addEventListener('mouseup', this.onUp);
		event.preventDefault();
	}

	private touchStart = (event: TouchEvent) => {
    this.startX = event.touches[0].clientX;
    this.startY = event.touches[0].clientY;
		document.addEventListener('touchmove', this.touchMove);
		document.addEventListener('touchcancel', this.touchEnd);
		document.addEventListener('touchend', this.touchEnd);
	}

	private onMove = (event: MouseEvent) => {
		this.offsetX += event.movementX;
		this.offsetY += event.movementY;
    this.updateTransform();
	}

	private touchMove = (event: TouchEvent) => {
    const touch = event.touches[0];
		this.offsetX += touch.clientX - this.startX;
		this.offsetY += touch.clientY - this.startY;
    this.startX = touch.clientX;
    this.startY = touch.clientY;
    this.updateTransform();
	}

	private onUp = () => {
		document.removeEventListener('mousemove', this.onMove);
		// document.removeEventListener('mouseleave', this.onUp);
		document.removeEventListener('mouseup', this.onUp);
    if (this.bindToWindow !== undefined) this.bindWindow();
	}

	private touchEnd = () => {
		document.removeEventListener('touchmove', this.touchMove);
		document.removeEventListener('touchcancel', this.touchEnd);
		document.removeEventListener('touchend', this.touchEnd);
	}
}
