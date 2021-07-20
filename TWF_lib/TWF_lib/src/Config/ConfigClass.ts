import { Colors, IColors } from './ColorClass'
import { Fonts, IFonts } from './FontClass'

interface IConfig {
  color_set: Colors;
  font_set: Fonts;
}

class Config {
  color_set: Colors;
  font_set: Fonts;

  constructor(colors?: IColors, fonts?: IFonts) {
    this.color_set = colors && new Colors(colors) || new Colors();
    this.font_set = fonts && new Fonts(fonts) || new Fonts();
  }
}

export { Config, IConfig };