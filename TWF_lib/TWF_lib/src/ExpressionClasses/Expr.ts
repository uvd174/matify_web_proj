import * as SVG from '@svgdotjs/svg.js'
import { ExprNode } from './ExprNode'
import { ExprTree } from './ExprTree'
import { printExpr, plainPrintExpr, changeColor } from '../PrintExpr/PrintExpr'
import { Config } from '../Config/ConfigClass';


class Expr {
  string: string;
  config: Config;
  fontSize: number;
  cont: SVG.Container;
  tree: ExprTree;
  isInteractive: boolean;
  svg: SVG.Container;
  multiIdList: Array<number>;
  multiContList: Array<SVG.Element>;

  constructor(string: string, app: SVG.Container, isInteractive: boolean, fontSize: number, config: Config) {
    this.string = string;
    this.config = config;
    this.cont = app.group();
    this.fontSize = fontSize;
    this.tree = new ExprTree(string, app.group());
    this.isInteractive = isInteractive;
    this.multiIdList = [];
    this.multiContList = [];
    if (this.isInteractive) {
      this.svg = printExpr(this);
    } else {
      this.svg = plainPrintExpr(this);
    }
  }

  unmarkExpr(): void {
    for (let i = 0; i < this.multiContList.length; ++i) {
      changeColor(this.multiContList[i], this.multiContList[i].classes()[0],
        'uncolored', this.config.userConfig.colorSet.darkMain);
    }
    this.multiIdList = [];
    this.multiContList = [];
  }

  rebuildExpr(): void {
    this.svg.remove();
    this.multiIdList = [];
    this.multiContList = [];
    this.tree = new ExprTree(this.string, this.cont);
    if (this.isInteractive) {
      this.svg = printExpr(this);
    } else {
      this.svg = plainPrintExpr(this);
    }
  }
}

export { Expr };