import { Expr } from '../ExpressionClasses/Expr';
import { Timer } from '../TimerClass/TimerClass';
import { Config } from '../Config/ConfigClass';
import * as SVG from '@svgdotjs/svg.js';
// @ts-ignore
import { TWF_lib } from '../libs/TWF_lib';
import { Button } from '../GameClasses/ButtonClass';
import { LearnSubmenu } from './LearnSubmenuClass';
import { compiledConfiguration } from '../index';
import { makeText } from "../utils/makeText";
import { pxToNumber } from "../utils/pxToNumber";

class Level {
  config: Config;
  levelIndex: number;
  taskIndex: number;
  svg: SVG.Container;
  expr: Expr;
  goal: Expr;
  timer: Timer;
  stepCounter: SVG.Text;
  isCompleted: boolean;
  isInfoShown: boolean;
  leftsList: Array<any>;
  rightsList: Array<any>;
  stateStack: Array<string>;
  subsCont: SVG.Container;
  subsWindow: SVG.Container;

  constructor(levelIndex: number, taskIndex: number, config: Config, showInfo: boolean) {
    this.levelIndex = levelIndex;
    this.taskIndex = taskIndex;
    this.config = config;
    this.isInfoShown = showInfo;
    this.svg = SVG.SVG().addTo('body').size(window.innerWidth,
      window.innerHeight);
    this.svg.rect(window.innerWidth, window.innerHeight).fill(this.config.userConfig.colorSet.lightBackground);

    let task = this.config.gameConfig.levelsJson.levels[levelIndex].tasks[taskIndex];

    this.goal = new Expr(task.goalExpressionStructureString, this.svg, false, 100, this.config);
    this.goal.svg.remove();
    this.expr = new Expr(task.originalExpressionStructureString, this.svg, true, 100, this.config);
    putExpr(this);

    this.isCompleted = false;
    this.leftsList = [];
    this.rightsList = [];

    this.stateStack = [task.originalExpressionStructureString];

    this.subsWindow = this.svg.nested();
    const subsWindowWidth = window.innerWidth - 200;
    const subsWindowHeight = window.innerHeight / 2.7;
    this.subsWindow
      .size(subsWindowWidth, subsWindowHeight)
      .move(100, window.innerHeight / 5 * 3)
      .rect(subsWindowWidth, subsWindowHeight)
      .fill(this.config.userConfig.colorSet.lightBackground).radius(10);

    this.subsCont = this.subsWindow.group();

//===============================top_interface_init============================

    const topInterfacePadding = 50;

    let levelsMenuButton = new Button(this.svg, '🡸', this.config, 'levelsMenuButton');
    levelsMenuButton.svg.on('mousedown', () => {
      new LearnSubmenu(this.config);
      this.clear();
    });
    levelsMenuButton.svg.center(50, topInterfacePadding);

    this.timer = new Timer(this.svg, 50, this.config);
    this.timer.svg.center(this.svg.cx(), topInterfacePadding);

    let stepCounterIndicator = this.svg.group();
    this.stepCounter = makeText(stepCounterIndicator, '0', this.config, 'stepCounter')
      .center(stepCounterIndicator.cx(), stepCounterIndicator.cy());
    stepCounterIndicator.center((levelsMenuButton.svg.cx() + this.timer.svg.cx()) / 2,
      topInterfacePadding);

    let resetButton = new Button(this.svg, '\u27F2', this.config, 'resetButton');
    resetButton.svg.on('mousedown', () => {
      new Level(levelIndex, taskIndex, this.config, false);
      this.clear();
    });
    resetButton.svg.center(window.innerWidth * 3.5 / 5, topInterfacePadding);

    let undoButton = new Button(this.svg, '\u27F5', this.config, 'undoButton');
    undoButton.svg.on('mousedown', () => {
      if (this.stateStack.length === 1) {
        return;
      }
      this.leftsList = [];
      this.rightsList = [];
      this.stateStack.pop();
      this.stepCounter.text(`${this.stateStack.length - 1}`);
      // @ts-ignored
      this.expr.string = this.stateStack[this.stateStack.length - 1];
      this.expr.rebuildExpr();
      this.expr.svg.on('mousedown', this.rebuildSubsMenu.bind(this));
      putExpr(this);
    });
    undoButton.svg.center(window.innerWidth * 4 / 5, topInterfacePadding);

    let unmarkButton = new Button(this.svg, '🧽', this.config, 'unmarkButton');
    unmarkButton.svg.on('mousedown', () => {
      this.expr.unmarkExpr();
      this.leftsList = [];
      this.rightsList = [];
      this.subsCont.remove();
    });
    unmarkButton.svg.center(window.innerWidth * 4.5 / 5, topInterfacePadding);

    //document.addEventListener('keydown', spaceDown);
    //document.addEventListener('keyup', spaceUp); //TODO======================

    let prettyLine = this.svg.group();
    prettyLine.line(10,
      topInterfacePadding * 2,
      window.innerWidth - 10,
      topInterfacePadding * 2)
      .stroke({ width: 3, color: this.config.userConfig.colorSet.darkAlternative });

//===============================top_interface_init============================

    let taskDescription = this.svg.group();

    if (task.goalType === 'CUSTOM') {
      makeText(taskDescription, task.descriptionRu, this.config, 'taskDescription');
      taskDescription.cx(this.svg.cx()).y(Number(prettyLine.y()) + 25);
    } else if (task.goalType === 'EXPR') {
      let taskDescription = new Expr(task.goalExpressionStructureString, this.svg, false, 100, this.config);
      taskDescription.svg.cx(this.svg.cx()).y(Number(prettyLine.y()) + 25); //TODO=====================
    }

    if (showInfo) {
      this.timer.stop();
      let shade = this.svg.group();
      shade.rect().addClass('shade');
      shade.on('mousedown', () => removeInfo(this));

      let info = this.svg.group();
      let infoTitle = info.group();
      makeText(infoTitle, this.config.gameConfig.levelsJson.levels[levelIndex].nameRu,
        this.config, 'infoTitleText');

      let levelDescription = makeText(info, this.config.gameConfig.levelsJson.levels[levelIndex].descriptionRu,
        this.config, 'levelDescription')
        .font({
          leading: 1.5,
        });

      let infoBox = info
        .rect()
        .addClass('infoBox')
        .radius(10)
        .fill(this.config.userConfig.colorSet.lightBackground)
        .stroke(this.config.userConfig.colorSet.bright)
        .after(levelDescription).after(infoTitle);
      let infoCalculatedStyle = getComputedStyle(infoBox.node);

      infoTitle.cx(info.cx()).dy(50);
      levelDescription.cx(info.cx()).dy(150);

      let checkButton = new Button(info, '✓', this.config, 'checkButton');
      checkButton.svg.cx(info.cx()).dy(pxToNumber(infoCalculatedStyle.height) * 3 / 4); // Seems to work

      info.cx(this.svg.cx()).dy(30);


      checkButton.svg.on('mousedown', () => removeInfo(this));

      function removeInfo(level: Level){
        level.timer.start();
        shade.remove();
        info.remove();
      }
    }

    this.expr.svg.on('mousedown', this.rebuildSubsMenu.bind(this));
    this.subsWindow.on('mousedown', this.rebuildLevel.bind(this));
  }

  clear() {
    this.svg.remove();
    if (this.timer.isActive) {
      clearInterval(this.timer.intervalId);
    }
  }

  rebuildLevel() {
    this.expr.rebuildExpr();
    this.expr.svg.on('mousedown', this.rebuildSubsMenu.bind(this));
    this.leftsList = [];
    this.rightsList = [];
    this.stateStack.push(this.expr.string);
    this.stepCounter.text(`${this.stateStack.length - 1}`);
    this.rebuildSubsMenu();
    putExpr(this);
    if (this.expr.string === this.goal.string) {
      this.makeWinMenu();
    }
  }

  makeWinMenu() {
    let winShade = this.svg.group();
    winShade.rect(Number(this.svg.width()), Number(this.svg.height())).fill({
      color: this.config.userConfig.colorSet.bright,
      opacity: 0.6
    });

    clearInterval(this.timer.intervalId);

    let winBox = this.svg.group();
    winBox
      .rect(450, window.innerHeight / 3)
      .fill(this.config.userConfig.colorSet.lightBackground)
      .radius(10);

    let winTitle = winBox.group();
    makeText(winTitle, 'Level completed!', this.config, 'winTitleText')
      .center(winTitle.cx(), winTitle.cy());
    winTitle.center(winBox.cx(), Number(winBox.height()) / 3);

    const bottomOffset = Number(winBox.height()) - 50;

    if (this.taskIndex !== this.config.gameConfig.levelsJson.levels.length) {

      let nextButton = new Button(winBox, '➔', this.config, 'winNextButton');

      nextButton.svg
        .cx(winBox.cx())
        .cy(bottomOffset)
        .on('mousedown', () => {
          new Level(this.levelIndex, this.taskIndex + 1, this.config, false);
          this.clear();
        });
    }

    let winResetButton = new Button(winBox, '\u27F2', this.config, 'winResetButton');
    winResetButton.svg.cx(winBox.cx() + 100).cy(bottomOffset);
    winResetButton.svg.on('mousedown', () => {
      new Level(this.levelIndex, this.taskIndex, this.config, false);
      this.clear();
    });

    let winLearnSubmenuButton = new Button(winBox, '🡸', this.config, 'winLearnSubmenuButton');
    winLearnSubmenuButton.svg.cx(winBox.cx() - 100).cy(bottomOffset)
      .on('mousedown', () => {
        new LearnSubmenu(this.config)
        this.clear();
      });

    winBox.center(this.svg.cx(), window.innerHeight / 2 - 60);
  }

  rebuildSubsMenu() {
    this.rightsList = [];
    if (this.expr.multiIdList.length !== 0) {
      this.rightsList = (TWF_lib.findApplicableSubstitutionsInSelectedPlace(
        TWF_lib.structureStringToExpression(this.expr.string),
        this.expr.multiIdList,
        compiledConfiguration)).toArray();
    }
    this.leftsList = [];
    for (let i = 0; i < this.rightsList.length; i++) {
      if (this.rightsList[i].resultExpression.toString() === "To get application result use argument 'withReadyApplicationResult' = 'true'()") continue;
      this.leftsList.push([this.rightsList[i].originalExpressionChangingPart.toString(),
        this.rightsList[i].resultExpressionChangingPart.toString()])
    }
    this.subsCont.remove();
    this.subsCont = makeSubsMenu(this.subsWindow, this.leftsList, this.rightsList, this.expr);
  }
}

function putExpr(level: Level) {
  const widthLimit = window.innerWidth - 200;
  const heightLimit = window.innerHeight / 3;
  level.expr.fontSize = 100;

  let currentWidthRatio = level.expr.svg.bbox().width / widthLimit;
  let currentHeightRatio = level.expr.svg.bbox().height / heightLimit

  if (currentWidthRatio > 1 || currentHeightRatio > 1) {
    level.expr.fontSize = 100 / Math.max(currentWidthRatio, currentHeightRatio);
    level.expr.rebuildExpr();
    level.expr.svg.on('mousedown', level.rebuildSubsMenu.bind(level));
  }

  level.expr.svg.cx(level.svg.cx());
  level.expr.svg.cy(window.innerHeight / 2.4);
}

function makeSubsMenu(window: SVG.Container, listOfLefts: Array<string>,
  listOfRights: Array<string>, expr: Expr) {
  if (listOfLefts.length !== listOfRights.length) {
    console.log('left-rights error!');
  }

  let subsMenu = window.group();
  let subsMenuHeight = 4;
  for (let i = 0; i < listOfLefts.length; ++i) {

    let innerCont = subsMenu.group();
    const innerContWidth = Number(window.width()) - 8;
    const innerContDefaultHeight = 65;

    let leftSub = new Expr(listOfLefts[i][0], innerCont, false, 50, expr.config)
      .svg.x(10);

    let horizontalOffset = Number(innerCont.width()) + 10;

    let rightArrowBox = innerCont.group();
    let rightArrow = makeText(rightArrowBox, '\u27F6', expr.config, 'rightArrow')
      .x(horizontalOffset);

    horizontalOffset = Number(innerCont.width()) + 10;

    let rightSub = new Expr(listOfLefts[i][1], innerCont, false, 50, expr.config)
      .svg.x(horizontalOffset);

    horizontalOffset = Number(innerCont.width()) + 40;

    if (horizontalOffset > innerContWidth ||
      innerCont.height() > innerContDefaultHeight * 2) {
      let maxRatio = Math.max(innerContWidth / horizontalOffset,
        Number(innerCont.height()) / (innerContDefaultHeight * 2));

      leftSub.remove();
      rightArrow.remove();
      rightSub.remove();

      leftSub = new Expr(listOfLefts[i][0], innerCont, false, 50 / maxRatio, expr.config).svg.x(10);

      rightArrow = makeText(rightArrowBox, '\u27F6', expr.config, 'rightArrow')
        .font({ size: 50 / maxRatio })
        .x(leftSub.bbox().width + 10);

      rightSub = new Expr(listOfLefts[i][1], innerCont, false, 50 / maxRatio, expr.config)
        .svg.x(leftSub.bbox().width + rightArrow.bbox().width + 10);
    }

    let subButton = new Button(innerCont, '', expr.config, 'subButton');
    subButton.svg.stroke({ width: 4 }).back();
    subButton.rect.width(innerContWidth).height(Number(innerCont.height())).css({ cursor: 'pointer'});

    innerCont.on('mousedown', () => {
      // @ts-ignore
      expr.string = listOfRights[i].resultExpression.toString();
    });

    leftSub.cy(subButton.rect.cy());
    rightArrow.cy(subButton.rect.cy());
    rightSub.cy(subButton.rect.cy());

    innerCont.dx(2).y(subsMenuHeight);

    subsMenuHeight += Number(innerCont.height()) + 4;
  }

  subsMenu.dy(2);

  return subsMenu;
}

export { Level };