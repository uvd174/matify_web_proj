import { ExprNode } from './ExprNode';
import * as SVG from '@svgdotjs/svg.js';
// @ts-ignore
import { TWF_lib } from '../libs/TWF_lib';

function MakeTree(node: any, app: SVG.Container): ExprNode {
  let cur_node: ExprNode = new ExprNode(node, app);
  for (let i = 0; i < node.children.size; i++) {
    cur_node.add(MakeTree(node.children.toArray()[i], app));
  }
  return cur_node;
}

class ExprTree {
  root: ExprNode;

  constructor(expr_string: string, app: SVG.Container) {
    this.root = MakeTree(TWF_lib.structureStringToExpression(expr_string).children.toArray()[0], app);
  }
}

export { ExprTree };