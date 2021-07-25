function pxToNumber (str: string) : number {
  return Number(str.substr(0, str.length - 2));
}

export { pxToNumber };