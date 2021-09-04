import { Config } from '../Config/ConfigClass';
import * as SVG from '@svgdotjs/svg.js';
import { Button } from '../GameClasses/ButtonClass';
import { LearnSubmenu } from './LearnSubmenuClass';

class MainMenu {
  config: Config;
  svg: SVG.Container;

  constructor(config: Config) {
    this.config = config;
    this.svg = SVG.SVG().addTo('body').size(window.innerWidth, window.innerHeight);
    this.svg.rect(window.innerWidth, window.innerHeight).fill(config.userConfig.colorSet.lightBackground);

    let title = this.svg.group();
    let mainTitleText = title.text('TriGo')
    mainTitleText.addClass('mainTitleText')
    .font({
        family: config.userConfig.fontSet.expr,
        fill: config.userConfig.colorSet.darkMain
      })
      .leading(0.9)
      .center(this.svg.cx(), 80);

    let mainBox = this.svg.group();

    let learnButton = new Button(mainBox, 'Learn', config, 'mainBoxButton');
    learnButton.svg.center(mainBox.cx(), mainBox.cy());
    learnButton.svg.on('mousedown', () => {
      new LearnSubmenu(config);
      this.clear();
    });

    let practiceButton = new Button(mainBox, 'Practice', config, 'mainBoxButton');
    practiceButton.svg.dy(Number(learnButton.svg.height()) + 5);
    practiceButton.svg.on('mousedown', () => {
      /*
      new PracticeSubmenu(config, practiceLevels);
      this.clear();
      */
    });

    mainBox.center(this.svg.cx(), this.svg.cy());
  }

  clear() {
    this.svg.remove();
  }
}

export { MainMenu };