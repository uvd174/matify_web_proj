import defaults from '../defaults.json'

interface IColors {
  darkMain: string;
  darkAlternative: string;
  bright: string;
  lightBackground: string;
  gradientFrom: string;
  gradientTo: string;
}

class Colors {
  darkMain: string;
  darkAlternative: string;
  bright: string;
  lightBackground: string;
  gradientFrom: string;
  gradientTo: string;

  constructor(colors?: IColors) {
    this.darkMain = colors && colors.darkMain || defaults.colors.darkMain;
    this.darkAlternative = colors && colors.darkAlternative || defaults.colors.darkAlternative;
    this.bright = colors && colors.bright || defaults.colors.bright;
    this.lightBackground = colors && colors.lightBackground ||
                      defaults.colors.lightBackground;
    this.gradientFrom = colors && colors.gradientFrom ||
                         defaults.colors.gradientFrom;
    this.gradientTo = colors && colors.gradientTo ||
                       defaults.colors.gradientTo;
  }
}

export { Colors };