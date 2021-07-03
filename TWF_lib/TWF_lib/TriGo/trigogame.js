(async () => {
  let response = await fetch('learn_levels.json');
  let game = await response.json();

  MakeMainMenu(game);
})();