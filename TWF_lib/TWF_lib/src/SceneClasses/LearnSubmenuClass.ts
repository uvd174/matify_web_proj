import * as SVG from '@svgdotjs/svg.js';
import { Config } from '../Config/ConfigClass';
import { Button } from '../GameClasses/ButtonClass';
import { MainMenu } from './MainMenuClass';
import { Level } from './LevelClass';
import { makeText } from "../utils/makeText";

class LearnSubmenu {
  config: Config;
  svg: SVG.Container;

  constructor(config: Config) {
    this.config = config;
    this.svg = SVG.SVG().addTo('body').size(window.innerWidth,
      window.innerHeight);
    this.svg.rect(window.innerWidth, window.innerHeight).fill(config.userConfig.colorSet.lightBackground);

    let learnTitle = this.svg.group();
    makeText(learnTitle, 'Learn levels', config, 'learnTitleText');
    learnTitle.center(this.svg.cx(), 50);

    let mainMenuButton = new Button(this.svg, '🡸', config, 'mainMenuButton');
    mainMenuButton.svg.dmove(20, 20);
    mainMenuButton.svg.on('mousedown', () => {
      new MainMenu(config);
      this.clear();
    });

    let levelsCont = this.svg.group();

    let verticalOffset = 0;
    for (let i = 0; i < this.config.gameConfig.levelsJson.levels.length; ++i) {
      let levelButton = new Button(
        levelsCont,
        `${this.config.gameConfig.levelsJson.levels[i].code}. ` +
        this.config.gameConfig.levelsJson.levels[i].nameRu,
        config,
        'levelButton'
      );

      levelButton.svg.on('mousedown', () => {
        new Level(i, 0, config, true); // can be stored in some config file
        this.clear();
      })

      levelButton.svg.dy(verticalOffset);
      verticalOffset += Number(levelButton.svg.height()) + 5;
    }

    levelsCont.center(this.svg.cx(), 200);
  }

  clear() {
    this.svg.remove();
  }
}

export { LearnSubmenu };