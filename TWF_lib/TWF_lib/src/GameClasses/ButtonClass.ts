import * as SVG from '@svgdotjs/svg.js';
import { Config } from '../Config/ConfigClass';
import { pxToNumber } from '../utils/pxToNumber';

class Button {
  svg: SVG.Container;
  cont: SVG.Container;
  rect: SVG.Rect;
  text: SVG.Text;

  constructor(cont: SVG.Container, text: string, config: Config, className: string) {
    this.cont = cont;
    this.svg = cont.group();
    this.svg.addClass(className);
    this.rect = this.svg.rect().radius(10)
      .fill(config.userConfig.colorSet.lightBackground)
      .stroke( {color: config.userConfig.colorSet.bright, opacity: 0, width: 5} );

    this.svg.on('mouseup mouseenter', () => onMouseEnter(this.svg));
    this.svg.on('mouseleave', () => onMouseLeave(this.svg));

    this.text = this.svg.text(text).font({
      family: config.userConfig.fontSet.expr,
      fill: config.userConfig.colorSet.darkMain
    });

    let computedStyle = getComputedStyle(this.rect.node);

    this.text.center(pxToNumber(computedStyle.width) / 2, pxToNumber(computedStyle.height) / 2);
    this.text.leading(0.9);
  }
}


function onMouseEnter(con: SVG.Element) {
  if (con.type === 'text') return;
  // @ts-ignore
  con.animate(300, '<>').stroke( {opacity: 1} );
  for (let item of con.children()) {
    onMouseEnter(item);
  }
}

function onMouseLeave(con: SVG.Element) {
  if (con.type === 'text') return;
  // @ts-ignore
  con.animate(300, '<>').stroke( {opacity: 0} );
  for (let item of con.children()) {
    onMouseLeave(item);
  }
}

export { Button };