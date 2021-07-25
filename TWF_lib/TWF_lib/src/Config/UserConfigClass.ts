import { Colors } from './ColorClass'
import { Fonts } from './FontClass'

class UserConfig {
  colorSet: Colors;
  fontSet: Fonts;

  constructor(colors?: Colors, fonts?: Fonts) {
    this.colorSet = colors && new Colors(colors) || new Colors();
    this.fontSet = fonts && new Fonts(fonts) || new Fonts();
  }
}

export { UserConfig };