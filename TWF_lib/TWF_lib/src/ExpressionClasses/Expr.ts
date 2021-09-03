import * as SVG from '@svgdotjs/svg.js'
import { ExprTree } from './ExprTree'
import { printExpr, printTree, plainPrintExpr, changeColor } from '../PrintExpr/PrintExpr'
import { Config } from '../Config/ConfigClass';
import { ExprNode } from "./ExprNode";


function getColor(n: number, config: Config): string {
  if (n < 0) {
    return new SVG.Color(config.userConfig.colorSet.darkMain).toHex();
  }
  let color = new SVG.Color(config.userConfig.colorSet.gradientTo).to(config.userConfig.colorSet.gradientFrom);
  return color.at(2 / (n + 2)).toHex();
}


class Expr {
  string: string;
  config: Config;
  fontSize: number;
  cont: SVG.Container;
  tree: ExprTree;
  isInteractive: boolean;
  svg: SVG.Container;
  multiIdList: Array<number>;
  multiNodeList: Array<ExprNode>;

  constructor(string: string, app: SVG.Container, isInteractive: boolean, fontSize: number, config: Config) {
    this.string = string;
    this.config = config;
    this.cont = app.group();
    this.fontSize = fontSize;
    this.tree = new ExprTree(string);
    this.isInteractive = isInteractive;
    this.multiIdList = [];
    this.multiNodeList = [];
    this.svg = this.cont.group();
    if (this.isInteractive) {
      this.svg = printTree(this);
    } else {
      this.svg = plainPrintExpr(this);
    }
  }

  click(node: ExprNode): void {
    let index = this.multiIdList.indexOf(node.twfNode.nodeId);

    if (index == -1) {
      this.multiIdList.unshift(node.twfNode.nodeId);
      this.multiNodeList.unshift(node);
      for (let i = 0; i < this.multiNodeList.length; ++i) {
        this.recolor(this.multiNodeList[i], i);
      }

    } else {
      let parentColor = -1;
      if (node.parent != undefined) {
        parentColor = node.parent.color;
      }
      this.multiIdList.splice(index, 1);
      this.multiNodeList.splice(index, 1);
      this.recolor(node, parentColor);
      for (let i = index; i < this.multiNodeList.length; ++i) {
        this.recolor(this.multiNodeList[i], i);
      }
    }
  }

  recolor(node: ExprNode, colorNumber: number): void {
    for (let element of node.elements) {
      // @ts-ignore
      element.animate(300, '<>').attr({
        fill: getColor(colorNumber, this.config)
      });
    }

    node.color = colorNumber;

    for (let child of node.children) {
      if (this.multiIdList.indexOf(child.twfNode.nodeId) == -1) {
        this.recolor(child, colorNumber);
      }
    }
  }

  unmarkExpr(): void {
    this.multiIdList = [];

    for (let node of this.multiNodeList) {
      this.recolor(node, -1);
    }

    this.multiNodeList = [];
  }

  rebuildExpr(): void {
    this.svg.remove();
    this.multiIdList = [];
    this.tree = new ExprTree(this.string);
    if (this.isInteractive) {
      this.svg = printExpr(this);
    } else {
      this.svg = plainPrintExpr(this);
    }
  }
}

export { Expr };