import levelsJson from '../learn_levels.json';

class GameConfig {
  levelsJson: any;

  constructor(gameConfig?: GameConfig) {
    this.levelsJson = gameConfig && gameConfig.levelsJson || levelsJson;
  }
}

export { GameConfig };