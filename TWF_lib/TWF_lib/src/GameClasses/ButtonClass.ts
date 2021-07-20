import * as SVG from '@svgdotjs/svg.js';
import { Config } from '../Config/ConfigClass';

class Button {
  svg: SVG.Container;
  cont: SVG.Container;
  rect: SVG.Rect;
  text: SVG.Text;

  constructor(cont: SVG.Container, width: number, height: number, font_size: number, text: string, config: Config) {
    this.cont = cont;
    this.svg = cont.group();
    this.rect = this.svg.rect(width, height).radius(10)
      .fill(config.color_set.background)
      .stroke( {color: config.color_set.rich, opacity: 0, width: 5} );
    this.svg.css('cursor', 'pointer');
    this.svg.on('mouseup mouseenter', () => onMouseEnter(this.svg));
    this.svg.on('mouseleave', () => onMouseLeave(this.svg));
    this.text = this.svg.text(text).font({
      size: font_size,
      family: config.font_set.expr,
      fill: config.color_set.dark_t
    }).center(this.rect.cx(), this.rect.cy());
    // @ts-ignore
    this.text.css('user-select', 'none');
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