import * as SVG from '@svgdotjs/svg.js';

class ExprNode {
  value: string;
  parent: ExprNode | undefined;
  children: Array<ExprNode>;
  x: number;
  y: number;
  width: number;
  height: number;
  baseline: number;
  size: number;
  color: number;
  elements: Array<SVG.Element>;
  twfNode: any;

  constructor(node: any) {
    this.value = node.value;
    this.parent = undefined;
    this.children = [];
    this.x = 0;
    this.y = 0;
    this.width = 0;
    this.height = 0;
    this.baseline = 0;
    this.size = 0;
    this.color = -1;
    this.elements = [];
    this.twfNode = node;
  }
  add(childNode: ExprNode): void {
    this.children.push(childNode);
    childNode.parent = this;
  }
}

export { ExprNode };