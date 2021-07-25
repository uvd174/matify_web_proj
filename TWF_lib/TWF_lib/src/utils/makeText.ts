import SVG from '@svgdotjs/svg.js';
import { Config } from '../Config/ConfigClass';

function makeText(cont: SVG.Container, text: string, config: Config, className: string) {
  let txt = cont.text(text).font({
    family: config.userConfig.fontSet.expr,
    fill: config.userConfig.colorSet.darkMain
  }).addClass(className);
  txt.leading(0.9);
  return txt;
}

export { makeText };