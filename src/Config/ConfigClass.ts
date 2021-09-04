import { GameConfig } from './GameConfigClass';
import { UserConfig } from './UserConfigClass';

class Config {
  gameConfig: GameConfig;
  userConfig: UserConfig;

  constructor(gameConfig?: GameConfig, userConfig?: UserConfig) {
    this.gameConfig = gameConfig && new GameConfig(gameConfig) || new GameConfig();
    this.userConfig = userConfig && userConfig || new UserConfig();
  }
}

export { Config };