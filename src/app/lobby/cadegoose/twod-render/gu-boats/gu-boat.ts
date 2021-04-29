import { BoatRender, moveEase } from '../../boat-render';
import { Boat } from 'src/app/lobby/quacken/boats/boat';
import { BoatTypes } from 'src/app/lobby/quacken/boats/boat-types';
import { SpriteData, Orientation } from '../sprite';
import { WarFrigData } from './objects/warfrig';
import { WarBrigData } from './objects/warbrig';
import { LongshipData } from './objects/longship';
import { BaghlahData } from './objects/baghlah';
import { DhowData } from './objects/dhow';
import { FanchuanData } from './objects/fanchuan';
import { GrandFrigData } from './objects/grandfrig';
import { JunkData } from './objects/junk';
import { LGSloopData } from './objects/lgsloop';
import { SMSloopData } from './objects/smsloop';
import { XebecData } from './objects/xebec';
import { MerchBrigData } from './objects/merchbrig';
import { MerchGalData } from './objects/merchgal';
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader';
import * as TWEEN from '@tweenjs/tween.js';

// pixel coordinates relative to top left of canvas
export class Point {
  constructor(public x = 0, public y = 0) { }

  project(): Position {
    return new Position().fromPoint(this);
  }

  fromPosition(p: { x: number, y: number }): Point {
    this.x = (p.y + p.x) * 32;
    this.y = (p.y - p.x + GuBoat.widthOffset) * 24;
    return this;
  }
}

// grid coordinates relative to top left of map
export class Position {
  constructor(public x = 0, public y = 0) { }

  unproject(): Point {
    return new Point().fromPosition(this);
  }

  fromPoint(p: { x: number, y: number }): Position {
    this.x = p.x / 64 - p.y / 48 + GuBoat.widthOffset / 2;
    this.y = p.x / 64 + p.y / 48 - GuBoat.widthOffset / 2;
    return this;
  }
}

const Boats: Partial<Record<BoatTypes, SpriteData>> = {
  [BoatTypes.WarFrig]: WarFrigData,
  [BoatTypes.WarBrig]: WarBrigData,
  [BoatTypes.Longship]: LongshipData,
  [BoatTypes.Baghlah]: BaghlahData,
  [BoatTypes.Dhow]: DhowData,
  [BoatTypes.Fanchuan]: FanchuanData,
  [BoatTypes.GrandFrig]: GrandFrigData,
  [BoatTypes.Junk]: JunkData,
  [BoatTypes.Cutter]: LGSloopData,
  [BoatTypes.Sloop]: SMSloopData,
  [BoatTypes.MerchBrig]: MerchBrigData,
  [BoatTypes.MerchGal]: MerchGalData,
  [BoatTypes.Xebec]: XebecData,
};

const faceTranslate = [0, 3, 2, 1];

export class GuBoat extends BoatRender {
  static widthOffset = 19;
  coords?: Point;
  private spriteData?: SpriteData;
  private orientationIndex = 2;
  orientation?: Orientation;
  img?: string;
  imgPosition?: string;
  flags: { p: number, t: number, offset: string }[] = [];

  constructor(boat: Boat, gltf: GLTF) {
    super(boat, gltf);
  }

  init(boat: Boat) {
    this.coords = new Point().fromPosition(boat.pos);
    this.spriteData = Boats[boat.type as BoatTypes];
    this.orientation = this.spriteData?.orientations[(faceTranslate[boat.face / 90] * 4 + 2) % 16] || {} as Orientation;
    if (!this.spriteData) return;
    this.img = 'url("/assets/boats/' + this.spriteData.name + '/sail.png")';
    this.imgPosition = this.orientation.x + 'px ' + this.orientation.y + 'px';
    this.rotateDeg = boat.face;
  }

  dispose() {
    return this.worker.addJob(() => {

    }, false);
  }

  showInfluence(v = true): void {

  }

  updateMoves(): BoatRender {
    return this;
  }

  protected _update(animate: boolean, boat: Boat) {
    const startTime = animate ? new Date().valueOf() : 0;
    const promises: Promise<any>[] = [];

    promises.push(...this.updateBoatPos(startTime, boat.pos.x, boat.pos.y, boat.crunchDir, boat.moveTransition));

    if (!startTime || boat.face !== this.rotateDeg || boat.imageOpacity === 0) {
      promises.push(...this.updateBoatRot(startTime, boat.face, boat.rotateTransition, boat.imageOpacity));
    }

    if (this.team !== boat.team) {
    }

    return Promise.all(promises);
  }

  rebuildHeader() {

  }

  scaleHeader(): BoatRender {
    return this;
  }

  protected updateBoatPos(startTime: number, x: number, y: number, crunchDir: number, transitions: number[]) {
    let t: any;
    const decodeX = [0, 0.4, 0, -0.4];
    const decodeY = [-0.4, 0, 0.4, 0];

    const p = [
      new Promise<any>(resolve => {
        const offsetX = decodeX[crunchDir];
        if (startTime && offsetX) {
          new TWEEN.Tween(this.pos, BoatRender.tweens)
            .to({ x: x + offsetX }, 5000 / BoatRender.speed)
            .delay(7500 / BoatRender.speed)
            .repeatDelay(500 / BoatRender.speed)
            .repeat(1).yoyo(true)
            .start(startTime)
            .onUpdate(() => this.coords?.fromPosition(this.pos))
            .onComplete(resolve);

        } else if (startTime && transitions[0]) {
          t = new TWEEN.Tween(this.pos, BoatRender.tweens)
            .easing(moveEase[transitions[0]])
            .to({ x }, 10000 / BoatRender.speed)
            .delay(5000 / BoatRender.speed)
            .start(startTime)
            .onUpdate(() => this.coords?.fromPosition(this.pos))
            .onComplete(resolve);
        } else {
          resolve();
        }
      }).then(() => {
        this.pos = { x, y };
        this.coords?.fromPosition(this.pos);
      }),

      new Promise<any>(resolve => {
        const offsetY = decodeY[crunchDir];
        if (startTime && offsetY) {
          new TWEEN.Tween(this.pos, BoatRender.tweens)
            .to({ y: y + offsetY }, 5000 / BoatRender.speed)
            .delay(7500 / BoatRender.speed)
            .repeatDelay(500 / BoatRender.speed)
            .repeat(1).yoyo(true)
            .start(startTime)
            .onUpdate(() => this.coords?.fromPosition(this.pos))
            .onUpdate(() => console.log)
            .onComplete(resolve);

        } else if (startTime && transitions[1]) {
          t = new TWEEN.Tween(this.pos, BoatRender.tweens)
            .easing(moveEase[transitions[1]])
            .to({ y }, 10000 / BoatRender.speed)
            .delay(5000 / BoatRender.speed)
            .start(startTime)
            .onUpdate(() => this.coords?.fromPosition(this.pos))
            .onComplete(resolve);
        } else {
          resolve();
        }
      }).then(() => {
        this.pos = { x, y };
        this.coords?.fromPosition(this.pos);
      }),
    ];

    return p;
  }

  private updateImage(index = (faceTranslate[this.boat.face / 90] * 4 + 2) % 16) {
    this.orientationIndex = index;
    this.orientation = this.spriteData?.orientations[this.orientationIndex] || {} as Orientation;
    this.imgPosition = this.orientation.x + 'px ' + this.orientation.y + 'px';
  }

  protected updateBoatRot(startTime: number, face: number, transition: number, opacity: number) {
    const promises: Promise<any>[] = [];

    if (startTime && (transition || !opacity)) {
      promises.push(new Promise(resolve => {
        if (transition === 1) {
          const delay = 2000 / BoatRender.speed;
          const delayOffset = 5000 / BoatRender.speed;
          const offset = this.rotateDeg + 90 === face ? 15 : 1;
          for (let i = 1; i < 5; i++) {
            setTimeout(() => {
              this.updateImage((this.orientationIndex + offset) % 16);
            }, delayOffset + delay * i);
          }
          setTimeout(resolve, 10000 / BoatRender.speed);
        } else {
          this.updateImage();
          setTimeout(resolve, 10000 / BoatRender.speed);
        }
      }));
    } else {
      this.updateImage();
    }

    if (startTime && transition > 1) {
      promises.push(new Promise(resolve => {

      }));
    }

    this.rotateDeg = face;
    return promises;
  }
}
