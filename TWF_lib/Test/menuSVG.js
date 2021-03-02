const testString = [["+(1;*(B;C))", "+(1;*(B;C))"], ["+(2;+(2;*(4;5)))", "(24)"],
    ["+(4;*(8;9))", "(76)"], ["+(5;*(10;11))", "(115)"], ["+(6;*(12;126))", "(1518)"],
    ["+(^(15;2);-(^(5;2)))", "(200)"], ["/(8;8)", "(1)"]];


MakeMainMenu(testString);

//================================================================================

function MakeMainMenu(levelsList) {
    let app = new SVG().addTo('body').size(window.innerWidth, Math.max(100 * (levelsList.length), window.innerHeight));
    app.viewbox(0, 0, window.innerWidth, Math.max(100 * (levelsList.length), window.innerHeight));
    app.rect(window.innerWidth, Math.max(100 * (levelsList.length), window.innerHeight)).fill(Colors.background);
    let cont = app.group();

    function cleanMainMenu() {
        app.remove();
    }

    function MakeLevelsButton(_levelsList) {
        let heightContOfConts = 0;
        for (let i = 0; i < _levelsList.length; ++i) {
            heightContOfConts += 80;
            let tmpCont = cont.group();
            let draw = tmpCont.group();

            tmpCont.add(interactive_button(draw, _levelsList[i][0], _levelsList[i][1], 1));
            draw.rect(500, 80).radius(10)
                .fill(Colors.background).center(window.innerWidth / 2, 100 * i + 100 / 2)
                .stroke( {color: Colors.rich, opacity: 0, width: 5} );
            (PlainPrintTree(TWF_lib.structureStringToExpression(_levelsList[i][0]),
                70, draw)).center(window.innerWidth / 2, 100 * i + 100 / 2);
        }

    }

    MakeLevelsButton(levelsList);

    function interactive_button(cont, string = "", res, f = 0) {
        let tmp = cont;
        tmp.css('cursor', 'pointer');
        tmp
            .on('mousedown', () => onButtonDownButton(cont, string, res, f))
            .on('mouseup mouseover', () => onButtonOverButton(cont))
            .on('mouseout', () => onButtonOutButton(cont));
        return tmp;
    }

    function onButtonDownButton(con, string, res, f = 0) {
        if (f) {
            cleanMainMenu();
            MakeMenuOfLevel(string, [string, res]);
        }
        con.animate(300, '<>').fill(Colors.background);
        for (let item of con.children()) {
            onButtonDownButton(item);
        }
    }

    function onButtonOverButton(con) {
        if (con.type === "text") return;
        con.animate(300, '<>').stroke( {opacity: 1} );
        for (let item of con.children()) {
            onButtonOverButton(item);
        }
    }

    function onButtonOutButton(con) {
        if (con.type === "text") return;
        con.animate(300, '<>').stroke( {opacity: 0} );
        for (let item of con.children()) {
            onButtonOutButton(item);
        }
    }
}


//=================================================================================================


function MakeMenuOfLevel(level, curLevel) {

    let stateStack = [];
    multiFlag = false;
    multiArr = [];
    multiArrCont = [];
    changeMultipleFlag(false);

    let app = new SVG().addTo('body').size(window.innerWidth, window.innerHeight);
    app.viewbox(0, 0, window.innerWidth, window.innerHeight);
    app.rect(window.innerWidth, window.innerHeight).fill(Colors.background);


    function initTimer(app, init_font_size) {
        const timer_colour = Colors.dark_t;
        let counter = 0;

        let txt = app.text("00:00").font({
            size: init_font_size,
            family: Fonts.main,
            fill: timer_colour,
            leading: 0.9
        });

        txt.css('user-select', 'none');

        function updateTimer() {
            counter++;
            let time_passed = new Date(1000 * counter);

            txt.text(`${Math.floor(time_passed.getMinutes() / 10)}` +
                `${time_passed.getMinutes() % 10}:` +
                `${Math.floor(time_passed.getSeconds() / 10)}` +
                `${time_passed.getSeconds() % 10}`);
        }

        intervalId = setInterval(updateTimer, 1000);

        return txt;
    }

    let contOfButtons = app.group();
    let stepCounterButton = contOfButtons.group();

    let button_height = (window.innerHeight / 5 - 60) / 3 * 2;
    let button_width = (window.innerWidth - 200 - 30 * 4) / 5;

    let stepCounterButtonRect = stepCounterButton.size(button_width, button_height)
        .rect(button_width, button_height)
        .fill(Colors.background).radius(10)
        .move(100 + (30 + button_width), 15);

    let stepCounterButtonText = stepCounterButton.text("0").font({
        size: 50,
        family: Fonts.main,
        fill: Colors.dark_t
    }).center(stepCounterButtonRect.cx(), stepCounterButtonRect.cy());

    stepCounterButtonText.css('user-select', 'none');

    let contTree = app.nested();
    let expr = app.group();
    MakeExpression();

    let goalExpr = PlainPrintTree(TWF_lib.structureStringToExpression(curLevel[1]), 60, app)
              .center((window.innerWidth / 2), (window.innerHeight / 6 + 15));
    for (let item of goalExpr.children()) {
        item.css('cursor', 'default');
    }

    function MakeExpression() {
        contTree.remove();
        expr.remove();
        contTree = app.nested();

        let NewTreeRoot = TWF_lib.structureStringToExpression(level);

        stateStack.push(level);
        stepCounterButtonText.text(`${stateStack.length - 1}`);

        compiledConfiguration = TWF_lib.createCompiledConfigurationFromExpressionSubstitutionsAndParams(
            [TWF_lib.expressionSubstitutionFromStructureStrings(level, curLevel[1]),
                TWF_lib.expressionSubstitutionFromStructureStrings(void 0, void 0, void 0, void 0, void 0, void 0, void 0, "NumberPlusMinus1", void 0, void 0),
                TWF_lib.expressionSubstitutionFromStructureStrings(void 0, void 0, void 0, void 0, void 0, void 0, void 0, "DecimalToFraction", void 0, void 0),
                TWF_lib.expressionSubstitutionFromStructureStrings(void 0, void 0, void 0, void 0, void 0, void 0, void 0, "PowFactorization", void 0, void 0),
                TWF_lib.expressionSubstitutionFromStructureStrings(void 0, void 0, void 0, void 0, void 0, void 0, void 0, "MultiplicationFactorization", void 0, void 0),
                TWF_lib.expressionSubstitutionFromStructureStrings(void 0, void 0, void 0, void 0, void 0, void 0, void 0, "OpeningBrackets", void 0, void 0),
                TWF_lib.expressionSubstitutionFromStructureStrings(void 0, void 0, void 0, void 0, void 0, void 0, void 0, "ParentBracketsExpansion", void 0, void 0),
                TWF_lib.expressionSubstitutionFromStructureStrings(void 0, void 0, void 0, void 0, void 0, void 0, void 0, "ArgumentsSwap", void 0, void 0),
                TWF_lib.expressionSubstitutionFromStructureStrings(void 0, void 0, void 0, void 0, void 0, void 0, void 0, "ArgumentsPermutationInOther", void 0, void 0),
                TWF_lib.expressionSubstitutionFromStructureStrings(void 0, void 0, void 0, void 0, void 0, void 0, void 0, "ReduceArithmetic", void 0, void 0),
                TWF_lib.expressionSubstitutionFromStructureStrings(void 0, void 0, void 0, void 0, void 0, void 0, void 0, "ReduceFraction", void 0, void 0),
                TWF_lib.expressionSubstitutionFromStructureStrings(void 0, void 0, void 0, void 0, void 0, void 0, void 0, "AdditiveComplicatingExtension", void 0, void 0),
                TWF_lib.expressionSubstitutionFromStructureStrings(void 0, void 0, void 0, void 0, void 0, void 0, void 0, "MultiplicativeComplicatingExtension", void 0, void 0),
                TWF_lib.expressionSubstitutionFromStructureStrings(void 0, void 0, void 0, void 0, void 0, void 0, void 0, "MinusInOutBrackets", void 0, void 0),
                TWF_lib.expressionSubstitutionFromStructureStrings(void 0, void 0, void 0, void 0, void 0, void 0, void 0, "SimpleComputation", void 0, void 0)])

        init(compiledConfiguration, level, MakeMenu, multiFlag, []);

        expr = PrintTree(NewTreeRoot, 100, app);
        let szw = expr.bbox().width / (window.innerWidth - 200);

        if (szw > 1) {
            expr.remove()
            expr = PrintTree(NewTreeRoot, 100 / szw, app);
        }
        if (szw > 1) {
            szw = 100 / szw;
        } else szw = 100;

        let szh = expr.bbox().height / (window.innerHeight / 3);
        if (szh > 1) {
            szh = szw / szh;
            expr.remove()
            expr = PrintTree(NewTreeRoot, szh, app);
        }

        expr.cx(window.innerWidth / 2);
        expr.cy(window.innerHeight / 2.4);
    }

    let cont = app.nested();
    let height_cont = window.innerHeight / 2.7;
    let width_cont = window.innerWidth - 200;
    let width_inner_cont = width_cont - 8;
    cont.size(width_cont, height_cont)
        .move(100, (window.innerHeight / 5 * 3))
        .rect(width_cont, height_cont)
        .fill(Colors.background).radius(10);
    let contOfCont = cont.group();


    function MakeMenu(listOfValues, arrSubs) {
        cont.size(width_cont, height_cont)
            .move(100, (window.innerHeight / 5 * 3))
            .rect(width_cont, height_cont)
            .fill(Colors.background).radius(10);
        contOfCont.remove();
        contOfCont = cont.group();


        let heightContOfConts = 4;
        for (let i = 0; i < listOfValues.length; ++i) {

            let innerCont = contOfCont.group();

            interactive_button_1(innerCont, false, i);

            let leftSubstitutionPart = PlainPrintTree(TWF_lib.structureStringToExpression(listOfValues[i][0]), 50, innerCont).x(10);
            let tmpWidth = innerCont.width() + 10;

            let arrowRight = innerCont.group().text("\u27F6").font({
                size: 50,
                family: Fonts.main,
                fill: Colors.dark_t
            }).css("user-select", "none").x(tmpWidth);
            tmpWidth = innerCont.width() + 10;

            let rightSubstitutionPart;
            try {
                rightSubstitutionPart = PlainPrintTree(TWF_lib.structureStringToExpression(listOfValues[i][1]), 50, innerCont).x(tmpWidth);
            } catch (err) {
                leftSubstitutionPart.remove();
                arrowRight.remove();
                console.log("Error occurred!");
                continue;
            }

            tmpWidth = innerCont.width() + 40;

            if (tmpWidth > width_inner_cont) {
                leftSubstitutionPart.remove();
                arrowRight.remove();
                rightSubstitutionPart.remove();

                leftSubstitutionPart = PlainPrintTree(TWF_lib.structureStringToExpression(listOfValues[i][0]),
                    50 / tmpWidth * width_inner_cont, innerCont).x(10);

                arrowRight = innerCont.group().text("\u27F6").font({
                    size: 50 / tmpWidth * width_inner_cont,
                    family: Fonts.main,
                    fill: Colors.dark_t
                }).css("user-select", "none").x(leftSubstitutionPart.bbox().width + 10);

                rightSubstitutionPart = PlainPrintTree(TWF_lib.structureStringToExpression(listOfValues[i][1]),
                    50 / tmpWidth * width_inner_cont, innerCont).x(leftSubstitutionPart.bbox().width + arrowRight.bbox().width + 10);
            }

            let innerContRect = innerCont.rect(width_inner_cont, innerCont.height()).radius(10)
                .dx(2)
                .y(heightContOfConts)
                .fill(Colors.background).stroke( {color: Colors.rich, width: 4, opacity: 0} )
                .back();

            leftSubstitutionPart.cy(innerContRect.cy());
            arrowRight.cy(innerContRect.cy());
            rightSubstitutionPart.cy(innerContRect.cy());

            heightContOfConts += innerCont.bbox().height + 4;
        }

        function moveScrollUp(con, tmp) {
            con.animate(300, '<>')
                .dy(tmp * 2)
            if (con.y() > contOfCont.y() - height_cont) {
                con.animate(300, '<>').y(2);
            }
        }

        function moveScrollDown(con, tmp) {
            con.animate(300, '<>')
                .dy(tmp * 2);
            if (con.y() < cont.y() + height_cont - heightContOfConts) {
                con.animate(300, '<>').y(height_cont - heightContOfConts);
            }
        }

        contOfCont.on('scroll', function (e) {
            if (heightContOfConts < height_cont) return;
            let tmp = e.detail.some;
            if (tmp > 0) {
                moveScrollUp(contOfCont, tmp);
            } else {
                moveScrollDown(contOfCont, tmp);
            }
        });

        function addHandler(object, event, handler) {
            if (object.addEventListener) {
                object.addEventListener(event, handler, false, {passive: false});
            } else if (object.attachEvent) {
                object.attachEvent('on' + event, handler, {passive: false});
            } else alert("Обработчик не поддерживается");
        }

        addHandler(document, 'mousewheel', wheel);


        function onButtonDownButton1(con, f = false, index = -1) {
            if (con.width() === width_inner_cont)
                con.animate(300, '<>').fill(Colors.background);
            for (let item of con.children()) {
                onButtonDownButton1(item);
            }
            if (index !== -1) {
                level = arrSubs[index].resultExpression.toString();
                if (level === curLevel[1]) {
                    cleanMenuOfLevel('win');
                    return;
                }
                cleanMenuOfLevel('level', level);
            }
            if (f) cleanMenuOfLevel('main');
        }


        function onButtonOverButton1(con) {
            if (con.type === "text") return;
            con.animate(300, '<>').stroke( { opacity: 1 } );
            for (let item of con.children()) {
                onButtonOverButton1(item);
            }
        }

        function onButtonOutButton1(con) {
            if (con.type === "text") return;
            con.animate(300, '<>').stroke( {opacity: 0} );
            for (let item of con.children()) {
                onButtonOutButton1(item);
            }
        }

        function interactive_button_1(cont, f = false, index = -1) {
            let tmp = cont;
            tmp.css('cursor', 'pointer');
            tmp
                .on('mousedown', () => onButtonDownButton1(cont, f, index))
                .on('mouseup mouseover', () => onButtonOverButton1(cont))
                .on('mouseout', () => onButtonOutButton1(cont));
            return tmp;
        }
    }

    function wheel(event) {
        let delta;
        event = event || window.event;
        if (event.wheelDelta) {
            delta = event.wheelDelta / 120;
            if (window.opera) delta = -delta;
        } else if (event.detail) {
            delta = -event.detail / 3;
        }
        if (event.preventDefault) event.preventDefault();
        event.returnValue = false;
        if (ins(cont, event.pageX, event.pageY)) {
            contOfCont.fire('scroll', {some: delta})
        }
    }

    function interactive_button(cont, f = 'false', index = -1) {
        let tmp = cont;
        tmp.css('cursor', 'pointer');
        tmp.css('user-select', 'none');
        tmp
            .on('mousedown', () => onButtonDownButton(cont, f, index))
            .on('mouseup mouseover', () => onButtonOverButton(cont))
            .on('mouseout', () => onButtonOutButton(cont));
        return tmp;
    }


    function onButtonDownButton(con, f = 'false', index) {
        if (con.type === "text") return;
        con.animate(300, '<>').fill(Colors.background);
        for (let item of con.children()) {
            onButtonDownButton(item);
        }
        if (index === 3) {
            cleanMenuOfLevel('level compl');
            return;
        }
        if (f === 'undo') cleanMenuOfLevel('undo');
        if (f === 'true') cleanMenuOfLevel('main');
        if (f === 'level') cleanMenuOfLevel('level');
        if (f === 'level compl') cleanMenuOfLevel('level compl');
        if (f === 'exit') clearMultipleMenu();
    }


    function onButtonOverButton(con) {
        if (con.type === "text") return;
        con.animate(300, '<>').fill(Colors.background);
        for (let item of con.children()) {
            onButtonOverButton(item);
        }
    }

    function onButtonOutButton(con) {
        if (con.type === "text") return;
        con.animate(300, '<>').fill(Colors.background);
        for (let item of con.children()) {
            onButtonOutButton(item);
        }
    }

    function ins(cont, x, y) {
        return (x >= cont.x()) && (y >= cont.y()) && (x <= cont.x() + width_cont) && (y <= cont.y() + height_cont);
    }

    for (let i = 0; i < 4; ++i) {
        if (i === 1) {
            continue;
        }
        if (i === 2) {
            let timerButton = contOfButtons.group();

            let timerButtonRect = timerButton.size(button_width, button_height)
                .rect(button_width, button_height)
                .fill(Colors.background).radius(10)
                .move(100 + 2 * (30 + button_width), 15);

            timerButton.add(initTimer(app, 50).center(timerButtonRect.cx(), timerButtonRect.cy()));
            continue;
        }
        if (i === 3) {
            let resetButton = contOfButtons.group();

            let resetButtonRect = resetButton.size(button_width, button_height)
                .rect(button_width / 2 - 15, button_height)
                .fill(Colors.background).radius(10)
                .move(100 + i * (30 + button_width), 15);

            contOfButtons.add(interactive_button(resetButton, 'false', i));

            resetButton.group().text("\u27F2").font({
                size: 50,
                family: Fonts.main,
                fill: Colors.dark_t
            }).center(resetButtonRect.cx(), resetButtonRect.cy());

            let undoButton = contOfButtons.group();

            let rectButt = undoButton.size(button_width, button_height)
                .rect(button_width / 2 - 15, button_height)
                .fill(Colors.background).radius(10)
                .move(100 + i * (30 + button_width) + (button_width / 2) + 15, 15);

            undoButton.group().text("\u27F5").font({
                size: 60,
                family: Fonts.main,
                fill: Colors.dark_t
            }).center(rectButt.cx(), rectButt.cy());

            contOfButtons.add(interactive_button(undoButton, 'undo'));
            continue;
        }
        let goBackButton = contOfButtons.group();

        let goBackButtonRect = goBackButton.size(button_width, button_height)
            .rect(button_width, button_height)
            .fill(Colors.background).radius(10)
            .move(100 + i * (30 + button_width), 15);

        contOfButtons.add(interactive_button(goBackButton, 'true'));
        if (i === 0) {
            goBackButton.group().text("Level Menu").font({
                size: 40,
                family: Fonts.main,
                fill: Colors.dark_t
            }).center(goBackButtonRect.cx(), goBackButtonRect.cy());
        }

    }

    let unmarkButton = contOfButtons.group();
    let unmarkButtonRect = unmarkButton.size(button_width, button_height)
        .rect(button_width, button_height)
        .fill(Colors.background).radius(10)
        .move(100 + 4 * (30 + button_width), 15);
    contOfButtons.add(interactive_button(unmarkButton, 'exit'));

    contOfButtons.line(10, contOfButtons.y() + contOfButtons.bbox().height + 10,
                                      window.innerWidth - 10, contOfButtons.y() + contOfButtons.bbox().height + 10)
                                .stroke({ width: 3, color: Colors.dark_o });

    function spaceDown(event) {
        if (event.code === 'Space') {
            onButtonDownButton(unmarkButton, 'exit', -1);
        }
    }

    function spaceUp(event) {
        if (event.code === 'Space') {
            onButtonOutButton(unmarkButton);
        }
    }


    document.addEventListener('keydown', spaceDown);
    document.addEventListener('keyup', spaceUp);
    unmarkButton.group().text("Unmark").font({
        size: 40,
        family: Fonts.main,
        fill: Colors.dark_t
    }).center(unmarkButtonRect.cx(), unmarkButtonRect.cy());

    function clearMultipleMenu() {
        for (let i = 0; i < multiArrCont.length; ++i) {
            changeColor(multiArrCont[i], multiArrCont[i].classes()[0], "uncolored", default_text_color);
        }
        changeMultipleFlag(false);
        MakeMenu([], []);
    }

    function removeHandler(object, event, handler) {
        if (object.removeEventListener) {
            object.removeEventListener(event, handler, false);
        } else if (object.detachEvent) {
            object.detachEvent('on' + event, handler);
        } else alert("Remove handler is not supported");
    }


    function cleanMenuOfLevel(f = 'main', _level = "") {
        if (f === "undo") {
            if (stateStack.length <= 1) return;
            stateStack.pop();
            level = stateStack.pop();
            MakeExpression();
            return;
        }

        if (f === 'level') {
            MakeExpression();
            MakeMenu([], []);
            return;
        }

        removeHandler(document, 'mousewheel', wheel);

        if (f === 'win') {
            clearInterval(intervalId);
            MakeExpression();
            document.removeEventListener('keydown', spaceDown, false);
            document.removeEventListener('keydown', spaceUp, false);
            MakeWinMenu(app);
            return;
        }

        contOfButtons.remove();
        contOfCont.remove();
        cont.remove();
        contTree.remove();
        contOfButtons.remove();
        app.remove();

        if (f === 'main') MakeMainMenu(testString);

        if (f === 'level compl') {
            MakeMenuOfLevel(curLevel[0], curLevel);
        }
    }


    function MakeWinMenu() {
        let _cont = app.nested();
        _cont.size(window.innerWidth, window.innerHeight)
            .move(0, 0)
            .rect(window.innerWidth, window.innerHeight)
            .fill({color: Colors.rich, opacity: 0.6}); //4e3232

        {
            let tmp = _cont.group();

            tmp.size(button_width, button_height)
                .rect(500, 80)
                .fill(Colors.background).radius(10)
                .center(window.innerWidth / 2, window.innerHeight / 2 - 60);

            _cont.add(interactive_button(tmp, 'true'));
            tmp.group().text("Level Menu").font({
                size: 50,
                family: Fonts.main,
                fill: Colors.dark_t
            }).center(window.innerWidth / 2, window.innerHeight / 2 - 60);
        }
        {
            let tmp = _cont.group();

            tmp.size(button_width, button_height)
                .rect(500, 80)
                .fill(Colors.background).radius(10)
                .center(window.innerWidth / 2, window.innerHeight / 2 + 60);

            _cont.add(interactive_button(tmp, 'level compl'));
            tmp.group().text("Play Again").font({
                size: 50,
                family: Fonts.main,
                fill: Colors.dark_t
            }).center(window.innerWidth / 2, window.innerHeight / 2 + 60);
        }

    }
}
