import * as SVG from '@svgdotjs/svg.js';

class ExprNode {
  value: string;
  children: Array<ExprNode>;
  cont: SVG.Container;
  twfNode: any;

  constructor(node: any, app: SVG.Container) {
    this.value = node.value;
    this.children = [];
    this.cont = app.group();
    this.twfNode = node;
    this.cont.addClass("uncolored");
  }
  add(childNode: ExprNode): void {
    this.children.push(childNode);
  }
}

export { ExprNode };