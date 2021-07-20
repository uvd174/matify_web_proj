import * as SVG from '@svgdotjs/svg.js'
import { ExprNode } from './ExprNode'
import { ExprTree } from './ExprTree'
import { PrintExpr, PlainPrintExpr, changeColor } from '../PrintExpr/PrintExpr'
import { Config } from '../Config/ConfigClass';

interface IExpr {
  string: string;
  cont: SVG.Container;
  tree: ExprTree;
  is_interactive: boolean;
  svg: SVG.Container;
  multi_id_list: Array<number>;
  multi_cont_list: Array<SVG.Element>;

  UnmarkExpr(): void;
}

class Expr {
  string: string;
  config: Config;
  font_size: number;
  cont: SVG.Container;
  tree: ExprTree;
  is_interactive: boolean;
  svg: SVG.Container;
  multi_id_list: Array<number>;
  multi_cont_list: Array<SVG.Element>;

  constructor(string: string, app: SVG.Container, is_interactive: boolean, font_size: number, config: Config) {
    this.string = string;
    this.config = config;
    this.cont = app.group();
    this.font_size = font_size;
    this.tree = new ExprTree(string, app.group());
    this.is_interactive = is_interactive;
    this.multi_id_list = [];
    this.multi_cont_list = [];
    if (is_interactive) {
      this.svg = PrintExpr(this, font_size, config);
    } else {
      this.svg = PlainPrintExpr(this, font_size, config);
    }
  }

  UnmarkExpr(): void {
    for (let i = 0; i < this.multi_cont_list.length; ++i) {
      changeColor(this.multi_cont_list[i], this.multi_cont_list[i].classes()[0],
        'uncolored', this.config.color_set.dark_t);
    }
    this.multi_id_list = [];
    this.multi_cont_list = [];
  }

  RebuildExpr(): void {
    this.svg.remove();
    this.multi_id_list = [];
    this.multi_cont_list = [];
    this.tree = new ExprTree(this.string, this.cont);
    if (this.is_interactive) {
      this.svg = PrintExpr(this, this.font_size, this.config);
    } else {
      this.svg = PlainPrintExpr(this, this.font_size, this.config);
    }

  }
}

export { Expr, IExpr };