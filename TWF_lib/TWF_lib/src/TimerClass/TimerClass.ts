import * as SVG from '@svgdotjs/svg.js';
import { Config } from '../Config/ConfigClass'


class Timer {
  color: string;
  font: string;
  fontSize: number;
  counter: number;
  cont: SVG.Container;
  svg: SVG.Text;
  intervalId: NodeJS.Timer;
  isActive: boolean;

  constructor(cont: SVG.Container, fontSize: number, config: Config) {
    this.color = config.userConfig.colorSet.darkMain;
    this.font = config.userConfig.fontSet.main;
    this.fontSize = fontSize;
    this.counter = 0;
    this.cont = cont;
    this.isActive = true;
    this.svg = cont.text('00:00').font({
      size: this.fontSize,
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
    let timePassed = new Date(1000 * this.counter);

    this.svg.text(`${Math.floor(timePassed.getMinutes() / 10)}` +
      `${timePassed.getMinutes() % 10}:` +
      `${Math.floor(timePassed.getSeconds() / 10)}` +
      `${timePassed.getSeconds() % 10}`);
  }

  start(): void {
    this.isActive = true;
    this.intervalId = setInterval(this.update.bind(this), 1000);
  }

  stop(): void {
    if (this.intervalId) {
      this.isActive = false;
      clearInterval(this.intervalId);
    }
  }

  reset(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    this.isActive = true;
    this.counter = -1;
    this.update();
    this.intervalId = setInterval(this.update, 1000);
  }
}

export { Timer };