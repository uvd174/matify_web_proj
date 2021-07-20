import * as SVG from '@svgdotjs/svg.js';
import { IConfig } from '../Config/ConfigClass'


interface ITimer {
  color: string;
  font: string;
  font_size: number;
  counter: number;
  cont: SVG.Container;
  svg: SVG.Text;
  intervalId: NodeJS.Timer;
  is_active: boolean;

  update(): void;
  start(): void;
  stop(): void;
  reset(): void;
}

class Timer {
  color: string;
  font: string;
  font_size: number;
  counter: number;
  cont: SVG.Container;
  svg: SVG.Text;
  intervalId: NodeJS.Timer;
  is_active: boolean;

  constructor(cont: SVG.Container, font_size: number, config: IConfig) {
    this.color = config.color_set.dark_t;
    this.font = config.font_set.main;
    this.font_size = font_size;
    this.counter = 0;
    this.cont = cont;
    this.is_active = true;
    this.svg = cont.text('00:00').font({
      size: this.font_size,
      family: this.font,
      fill: this.color,
      leading: 0.9
    });

    // @ts-ignore
    this.svg.css('user-select', 'none');

    this.intervalId = setInterval(this.update.bind(this), 1000);
  }

  update(): void {
    this.counter++;
    let time_passed = new Date(1000 * this.counter);

    this.svg.text(`${Math.floor(time_passed.getMinutes() / 10)}` +
      `${time_passed.getMinutes() % 10}:` +
      `${Math.floor(time_passed.getSeconds() / 10)}` +
      `${time_passed.getSeconds() % 10}`);
  }

  start(): void {
    this.is_active = true;
    this.intervalId = setInterval(this.update.bind(this), 1000);
  }

  stop(): void {
    if (this.intervalId) {
      this.is_active = false;
      clearInterval(this.intervalId);
    }
  }

  reset(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    this.is_active = true;
    this.counter = -1;
    this.update();
    this.intervalId = setInterval(this.update, 1000);
  }
}

export { Timer, ITimer };