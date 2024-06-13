// Hide "Energy" until you can die
// Specific "Energy" hint on first "You can lose" level
// Level 5 intro energy
// Level 17 is a 5x4 at start but turns into 5x5 after first move
// level 17 18 are off (too wide) - 


// BACKLOG
// save music vol doesn't work on ios

/*
    - button should be % of widht of game and text match size, not bigger than title
*/

function GenerateName() {
    const mathyTerms = [
        'Geometric', 'Algebraic', 'Calculus', 'Vector', 'Matrix',
        'Differential', 'Integral', 'Trigonometric', 'Exponential',
        'Logarithmic', 'Polynomial', 'Quadratic', 'Rational',
        'Symmetric', 'Asymmetric', 'Cubic', 'Linear', 'Nonlinear',
        'Discrete', 'Continuous', 'Modular', 'Parabolic', 'Elliptic',
        'Hyperbolic', 'Transcendental', 'Binomial', 'Fibonacci',
        'Pythagorean', 'Cartesian', 'Fractal'
    ];

    const animals = [
        'Fox', 'Rabbit', 'Tiger', 'Lion', 'Elephant', 'Cheetah',
        'Leopard', 'Panther', 'Giraffe', 'Zebra', 'Monkey', 'Gorilla',
        'Chimpanzee', 'Koala', 'Kangaroo', 'Panda', 'Wolf', 'Bear',
        'Deer', 'Eagle', 'Falcon', 'Hawk', 'Owl', 'Penguin', 'Peacock',
        'Dolphin', 'Whale', 'Shark', 'Turtle', 'Lizard'
    ];

    const mathyTerm = mathyTerms[Math.floor(Math.random() * mathyTerms.length)];
    const animal = animals[Math.floor(Math.random() * animals.length)];

    return mathyTerm + animal;
}


var gameClicked = false;
var SwapManager = {
    UserHasSwappedOnceAlready : false,
    RefreshBtn (){
        this.SetAvailableSwaps(this.swaps);
    },
    mousedown : false,
    onClick (e){
        e.stopPropagation();
        e.stopImmediatePropagation();
        if (GameManager.gameState == GameManager.GameState.Swapping){
            this.endSwapMode(e);
        } else if (GameManager.gameState == GameManager.GameState.Normal) {
            this.enterSwapMode(e);
        }
    },
    enterSwapMode(e){
        this.UserHasSwappedOnceAlready = true;
        $('#swap').removeClass('pulseGlow');
        GameManager.setGameState(GameManager.GameState.Swapping,"swapBtnClick");
        $('#swap').addClass('pressed');
        $('.tile').each(function(){
            $(this).addClass('swapping');
            $(this).css('animation-duration',Math.random()*0.25+0.75+"s");
        });
        $('#swap').addClass('swapping');
    },
    endSwapMode(e){
        $('#swap').removeClass('pressed');
        $('.tile').each(function(){
            $(this).removeClass('swapping');
        });
        $('#swap').removeClass('swapping');
        GameManager.setGameState(GameManager.GameState.Normal,"swapBtnClick");
     },
    Init(){
        GameManager.onGameStateChanged.push(function(e){SwapManager.gameStateChanged(e)});

        $('#swap').bind(Input.start,function(e){ 
            SwapManager.mousedown = true; 
        });
        $('#swap').bind(Input.end,function(e){
            if (SwapManager.mousedown){
               SwapManager.onClick(e); 
            }
            SwapManager.mousedown = false;
        });
        $('#game').on(Input.start, '.tile',function(e){
            if (GameManager.gameState == GameManager.GameState.Swapping && $(this).hasClass('swapping')){
                card = Card.getCardById(parseInt($(this).attr('id')));
                SwapManager.StartDraggingCard(e, card);
            }
        });
    },
    gameStateChanged(e){
        if (GameBoard.cards.length > 0 
            && (GameManager.gameState == GameManager.GameState.Normal 
            || GameManager.gameState == GameManager.GameState.Swapping
            || (GameManager.gameState == GameManager.GameState.Animating && GameManager.previousGameState == GameManager.GameState.Swapping))){

            
        } else {
        }
    },
    swapsLeft : 0,
    SetAvailableSwaps (ct){
        this.swapsLeft = ct;
        this.UpdateSwapsLeftText();
        this.UpdateSwapButtonEnabled();
         if (this.swapsLeft > 0 && !this.UserHasSwappedOnceAlready){
//            console.log('swaps:'+this.swapsLeft);
            $('#swap').addClass('pulseGlow');
        }
},
    UpdateSwapButtonEnabled(){
       if (this.swapsLeft <= 0){
            $('#swap').addClass('disabled');
            this.swapsLeft = 0;
        } else {
            $('#swap').removeClass('disabled');
        }

    },
    ChangeAvailableSwaps (ct){
        this.swapsLeft += ct;
        this.UpdateSwapsLeftText();
        this.UpdateSwapButtonEnabled();
    },
    UpdateSwapsLeftText(){
        $('#swapsLeft').html(this.swapsLeft);
    },
    swappables : {},
    draggingCard : null, // which card is user dragging to swap
    swappablePositions : {},
    swappableCards : [],  // what cards were adjacent to selected card
    hoveredCard : null,
    hoveredCardPrevious : null, 
    startingSpot : {row:0, col:0}, // where will selected card snap to
    draggingCardTarget : {row:0, col:0}, // where will selected card snap to
    followMouse : null, 
    StartDraggingCard (e, card){
        // Debug.Touch(e,"start drag");
        GameManager.setGameState(GameManager.GameState.Swapping);
        GameBoard.cards.forEach(x => {x.$card.removeClass('swapping')});


        this.draggingCard = card;
        this.draggingCardTarget.row = this.draggingCard.row;
        this.draggingCardTarget.col = this.draggingCard.col;
        card.$card.addClass('pickedUp');
        this.swappableCards = card.getAdjacentCards();
        this.swappableCards.forEach(x => {
            this.swappablePositions[x.id] = {row:x.row,col:x.col};
            x.$card.addClass('swapping');
        });
        this.startingSpot.row = card.row;
        this.startingSpot.col = card.col;
        SwapManager.hoveredCardPrevious = card;
        this.followMouse = setInterval(function(){
            let dc = SwapManager.draggingCard.$card;
            let e = Input.currentPos;
            let x = e.x - parseInt(dc.css('width'))/2 - $('#game').offset().left;
            let y = e.y - parseInt(dc.css('height'))/2 - $('#game').offset().top;
            if (Settings.mobile) y -= GameBoard.getDim()/3;
            dc.css('left',x).css('top',y);
            let d = GameBoard.getDim() / 2;
            
            // did we hover over a swappable card?
            Object.keys(SwapManager.swappablePositions).forEach( key => {
                let x = SwapManager.swappablePositions[key];
                let pos = GameBoard.getPos(x.row,x.col);
                let leftDelta = Math.abs(dc.offset().left-pos.left);
                let topDelta = Math.abs(dc.offset().top-pos.top);
                let threshold = GameBoard.getDim()/2;
                if (leftDelta  < threshold && topDelta < threshold){
                    SwapManager.hoveredCard = Card.getCardById(key);
                    if (GameManager.gameState == GameManager.GameState.Swapping){
                        SwapManager.SwapHoveredCard();
                    }
                }
            });

            // Did we hover over the starting position?
            let pos = GameBoard.getPos(SwapManager.draggingCard.row,SwapManager.draggingCard.col);
            let leftDelta = Math.abs(dc.offset().left-pos.left);
            let topDelta = Math.abs(dc.offset().top-pos.top);
            if (leftDelta  < 50 && topDelta < 50){
                if (GameManager.gameState == GameManager.GameState.Swapping && SwapManager.revertedToStartPositions == false){
                    SwapManager.RevertToStartingPositions();
                }
            }
        },20);

    },
    revertedToStartPositions : false,
    RevertToStartingPositions(){
        this.revertedToStartPositions = true;
        this.hoveredCardPrevious = null;
        this.swappableCards.forEach(x => {
            x.moveToRowCol(this.swappablePositions[x.id].row,this.swappablePositions[x.id].col);
        });
        this.draggingCardTarget.row = this.startingSpot.row;
        this.draggingCardTarget.col = this.startingSpot.col;
        audios.swap();

    },
    SwapHoveredCard () {
        if (this.hoveredCard == this.hoveredCardPrevious) return;
        this.revertedToStartPositions = false;
        this.hoveredCardPrevious = this.hoveredCard;
        this.swappableCards.forEach(x => {
            // move all non-hovered cards back to their starting positions
            if (x.id == this.hoveredCard.id) return;
            x.moveToRowCol(this.swappablePositions[x.id].row,this.swappablePositions[x.id].col);
        });
        // move hovered card to the starting position of the dragged card
        this.hoveredCard.moveToRowCol(this.startingSpot.row,this.startingSpot.col);

        // set target position of dragged card to the swapped card, for snapping there when it is released
        this.draggingCardTarget.row = this.swappablePositions[this.hoveredCard.id].row;
        this.draggingCardTarget.col = this.swappablePositions[this.hoveredCard.id].col;
        audios.swap();
    },
    ending : false,
    onInputEnd(e){
        if (this.draggingCard != null){
            this.EndDrag(e);
        } else {
            this.endSwapMode(e);         
        }
    },
    async EndDrag (e){
        
        if (this.ending) return;
        this.ending = true;
        // Did the user actually swap?
        if (this.draggingCardTarget.row == this.startingSpot.row && this.draggingCardTarget.col == this.startingSpot.col){
            // User did NOT swap, do not decrease swaps.
        } else {
            SwapManager.ChangeAvailableSwaps(-1);
        }

        this.hoveredCard = null;
        this.hoveredCardPrevious = null;
        clearInterval(this.followMouse);
        this.swappablePositions = [];
        $('.tile').each(function(){ $(this).removeClass('swapping');});
        await this.draggingCard.moveToRowCol(this.draggingCardTarget.row,this.draggingCardTarget.col); //css('left',tileReturnPos.x).css('top',tileReturnPos.y);
        
        this.draggingCard.$card.removeClass('pickedUp');
        this.swappableCards= [];
        this.draggingCard = null;
        GameManager.setGameState(GameManager.GameState.Normal,"endDrag"); 
        this.ending = false;
        this.endSwapMode(e);         
    }
}

$(document).ready(function(){
    if (Settings.mobile){
        $('#main').css('width','100%');
        
        $('#settingsIcon').css('width','10%');
        $('input[type="text"]').css('width','150%').css('margin-left','-10px');    
    }
    // document.body.addEventListener('touchemove',function(e){ e.preventDefault(); });
    Settings.Init();
    Input.Init();
    GameManager.Init();
    SwapManager.Init();
    audios.PreInit();
    Menu.Init();
    Tutorial.Init();
    Analytics.Init(); // will attempt to set IP for Music as well, not an analytics function ... but it is the one gets the for IP, which audios dependency uses to set sfx and musicvol
    $('#backBoard').on('click',function(){
        GameBoard.cards.filter(x => x.popped == true).forEach(x => { x.UnPopTile(); });
    });
    if (Settings.debug) {
        Debug.Init();
        
        GameManager.StartLevel();
        console.log("Starting Level:", this.currentLevelIndex);  // Add this line


    }
    if (Settings.debugSfx) SFX.Init();

    $(window).resize(function(){
       GameBoard.onBoardResized(); 
    });

    if (window.location.href.includes('highscores')){
        GameManager.SaveAndGetHighScores();
        ScreenManager.HideAll();
        ScreenManager.ShowDailyShuffleScoreboard();
 
    }

});

var Menu = {
    gameStateChanged (m){
         },
    settingsShown : false,
    ToggleSettings(){
        if (!this.settingsShown){
            this.settingsShown = true;
            $('#creditsIcon').show();
            $('#game').css('z-index',1);
            $('#settingsBackboard').show();
            GameManager.setGameState(GameManager.GameState.Paused,"pause");
            audios.play(audios.sources.doot[0]);
        } else {
            this.settingsShown = false;
            $('#game').css('z-index',1004);
            $('#settingsBackboard').hide();
            $('#creditsIcon').hide();
            
            GameManager.setGameState(GameManager.GameState.Normal,"unpause");
            audios.play(audios.sources.doot[0]);

            if (this.creditsShown){
                this.ToggleCredits();
            }

        }
    },
    creditScrollfn : null,
    ToggleCredits(){
        if (!this.creditsShown){
            this.creditsShown = true;
            $('#creditsBackboard').fadeIn(1200);
            $('#credits').css('bottom','-100px');
            Menu.creditScrollFn =  setInterval(function(){
                let b = parseInt($('#credits').css('bottom'));
                $('#credits').css('bottom',b += 1);
                if ($('#credits').offset().top < 220){ 
                    console.log("clear!");
                    clearInterval(Menu.creditScrollFn);
                }
            },50);
        } else {
            clearInterval(Menu.creditScrollFn);
            this.creditsShown = false;
            $('#creditsBackboard').fadeOut();
            
        }


    },
    Init (){
        GameManager.onGameStateChanged.push(function(e){
            Menu.gameStateChanged(e)
        });
        $('#creditsBackboard').hide();

        // later: These should be on inputManager?
        $('#creditsIcon').on('click',function(e){
            Menu.ToggleCredits();
        });
        $('#settingsIcon').on('click',function(e){
            e.stopPropagation();
            Menu.ToggleSettings();
        });
        $('#game').on(Input.start,'.tile',function(e){
           // tileClicked = true; 
        });
        $('#main').on(Input.start,function(e){
            gameClicked = true;
        });
        $('#main').on(Input.end,function(e){
            if (gameClicked && !GameManager.gameState != GameManager.GameState.Paused){
                if (GameManager.gameState == GameManager.GameState.Swapping) {
                    SwapManager.onInputEnd(e); 
                }
                gameClicked = false;
                if (GameManager.gameState == GameManager.GameState.Paused 
                || GameManager.gameState == GameManager.GameState.Animating 
                || GameManager.gameState == GameManager.GameState.Swapping) {
                    return;
                }
                return;
                // Did we click ON the card that was open? If so, do not close all tiles.
                let a = document.elementFromPoint(Input.currentPos.x,Input.currentPos.y);
                while (a.id == '' && a.parentNode != null){
                    a = a.parentNode;
                }
                let clickedCard = Card.getCardById(a.id);
                if (clickedCard  == null || !clickedCard.popped) { 
//                    GameBoard.closeAllCards(false, "maincl");
  //                  GameManager.setGameState(GameManager.GameState.Normal,"click another tile while tile was open");
                }

            }
            
        });

    }
}


var GameManager = {
    isDailyShuffle : false, 
    highScores : {},
    populateSkipLevelsList(){
        if (Settings.enableSkip || (GameManager.maxLevelReached > 0 && GameManager.gameState == GameManager.GameState.Menu)){
            $('#selectLevel').show();
        }
        let arr = Settings.enableSkip ? [...Array(100).keys()] : [...Array(GameManager.maxLevelReached).keys()];
        
        arr.forEach(x => {
            x = parseInt(x);
            $levelBtn = $("<div id='skip_"+x+"' class='levelBtn pressableBtn'>Level "+x+"</div>");
            $('#levelSkip').append($levelBtn);
            if (Settings.enableSkip || GameManager.maxLevelReached >= x){
                if (GameManager.maxLevelReached > x){
                    $levelBtn.prepend("<span style='color:#0c0'>✓ </span>");
                }
                $levelBtn.bind('click',function(){
                    audios.click();
                    GameManager.SkipToLevel(x);
                });
            } else {
                $levelBtn.prepend("🔒 ");
                $levelBtn.addClass('disabled');
            }
        });
        


    },
    currentGameLost : false,
    maxLevelReached : 0,
    movesThisLevel : 0,
    setMaxLevelReached(n){
        this.maxLevelReached = Math.max(n,this.maxLevelReached);
    //    Settings.
    },
    async ChangeGameStateAfter(newState, promises){
       await Promise.all(promises);
       this.setGameState(newState,"after promsies");
    },
    score : 0,
    showScorePower : false,
    maxScoreDigits : 5, 
    addScore(amt){
        this.score += amt;
        let scoreTuple = this.score.toExponential(5).toString().split('e+');
        let exponent = parseInt(scoreTuple[1]);
        let textScore = scoreTuple[0];
        if (!this.showScorePower && exponent > this.maxScoreDigits){
            // Triggers only once, the first time score needs powers
            this.showScorePower = true;
            $('#odometer').css('right',60).parent().append("<div id='exp' style='width:120;height:40px;position:absolute;right:0;top:75px;font-size:2em;color:#03fcf4;'>x 10<sup class='pulsing' id='scorePower'>2</sup></div>");
            particleFx.hurt(getCenter($('#scorePower')));
        } 
        if (this.showScorePower){
            $(".scoreboard").html(Intl.NumberFormat('en-us', {minimumFractionDigits:5,maximumFractionDigits:5}).format(parseFloat(textScore)));
            let prevP = parseInt($('#scorePower').html());
            if (exponent > prevP){
                particleFx.hurt(getCenter($('#scorePower')));
            }
            $('#scorePower').html(exponent);
            $('#scorePower').css('color','hsl('+exponent*10+' 100% 50%)');
        } else {
            // Normal score, before reaching powers
            $(".scoreboard").html(Intl.NumberFormat('en-us').format(GameManager.score));
        }


    },
    lives : 4,
    UpdateLifeCounter(){
        $('#lives').html(this.lives);
    },
    LoseALife(source){
//        console.log("lost life Source:"+source);

        this.lives--;
        audios.error();
        this.UpdateLifeCounter();
        let pos = {top:$('#lives').offset().top, left:$('#lives').offset().left};
        setTimeout(function(){
            particleFx.hurt(pos);
            particleFx.score($('#lives'), -1,8000);
        },250);
        if (this.lives <= 0){
            this.LoseGame('LEVEL FAILED','You ran out of energy!');
        }
    },
    tipGraphicShowFn : null,
    LoseGame(title,text){
        console.log("LoseGame.");
        GameManager.currentGameLost = true;
        clearTimeout(this.tipGrahpicShowFn);
        setTimeout(function(){audios.error();},100);
        setTimeout(function(){audios.error();},200);
        setTimeout(function(){audios.error();},300);
        setTimeout(function(){$('#loseScreen').show()});
        $('#tipGraphic').css('background-image','none').css('display','none');
        $('#tip').show();
        $('#tip').html('');
        setTimeout(function(){
            UserTips.slowType($('#tip'),UserTips.getTipForLevel(GameManager.currentLevelIndex),25);
            }, 2200);
        let gfx = UserTips.getTipGraphicForLevel(GameManager.currentLevelIndex);
        if (gfx !== undefined) {
            this.tipGraphicShowfn = setTimeout(function(){ 
                $('#tipGraphic').css('background-image','url('+gfx+')');
                $('#tipGraphic').show(); 
                
            },3000);
        }
        $('#loseScreen').find('.title').html(title);
        $('#loseScreen').find('.text').html(text);
    },
    Init () {
        document.getElementById('odometer').odometer.format.precision=5; // but it doesn't work here so i put it after startlevel??
        this.gameState = GameManager.GameState.Menu;
        $('.restartLevel').on('click',function(){
            audios.click();
            if (GameManager.isDailyShuffle) GameManager.StartDailyShuffle();
            else GameManager.StartLevel();
        });
         $('.restartGame').on('click',function(){
            ScreenManager.HideAll();
            ScreenManager.ShowStartScreen();
        });
        $('#nextLevel').on('click',function(){
            audios.click();
            ScreenManager.HideWinScreen();
            GameManager.currentLevelIndex++;
            console.log("Curlev;"+GameManager.currentLevelIndex);
            GameManager.StartLevel('next');
            $('#level').html('Level: '+GameManager.currentLevelIndex);
            UserTips.Stop();
        });

        $('#startGame').on('click',function(){
            ScreenManager.HideAll();
            ScreenManager.ShowGame();
            audios.click();
            GameManager.StartLevel('next2');
            $('#titleBg').hide();
        });

        $('#startDailyShuffle').on('click',function(){
            $('#tutorialScreen2').hide();
            audios.click();
            GameManager.StartDailyShuffle();
            $('#titleBg').hide();
        });

          $('#selectLevel').on('click',function(){
            audios.click();
            $('#mainMenu').fadeOut();
            $('html').css('overflow-y','scroll').css('-webkit-overflow-scrolling','touch');
            $('#levelSkip').show().fadeIn();

        });
        if (typeof GeneratedLevels !== 'undefined' && Settings.useGeneratedLevels){
            this.levels = GeneratedLevels.levels;
        }

        this.onGameStateChanged.push(this.gameStateChanged);
    },
    SkipToLevel(level){
        this.currentLevelIndex = level;
        $('#level').html('Level: '+this.currentLevelIndex);
        $('#levelSkip').fadeOut();
        this.StartLevel();
    },
   noBounceLoaded : false,
    async StartDailyShuffle(){

        GameManager.score=0;
        $('#exp').remove();
        document.getElementById('odometer').odometer.format.precision=5;
        GameManager.currentLevelIndex = -1;
        
        GameManager.isDailyShuffle = true; // so that WinLevel will save the score differently for Daily Shuffle scores
    
        // Reset the score to zero for the new level
        this.score = 0; 
        this.el = document.getElementById('odometer');
        // Update the Odometer instance to reflect the new score
        if (this.el.odometer) {
            this.el.odometer.update(0);
        } else {
            // Fallback in case the Odometer instance isn't accessible as expected
            $("#odometer").html("0");
        }

        if (!this.noBounceLoaded){
            this.noBounceLoaded = true;
          const script = document.createElement("script");
          script.src = '/static/js/inobounce.js'; 
          script.type = 'text/javascript';
          document.head.appendChild(script);
        }
        ScreenManager.HideAll();
        GameManager.movesThisLevel = 0;
        this.currentGameLost = false; // hacky .. we use this as a separate way to track game state, because too many things update game state which can cause errors. This is to prevent user from seeing "won level" screen after clearing a level, losing the game, and pressing next before the previous "check if level cleareD" function has finished. Ideally we early exit that function (onExplosionChainFinished) ..
        this.setMaxLevelReached(this.currentLevelIndex); 
        $('#levelTitle').html('Daily Shuffle');
        ScreenManager.HideAll();
        $('#startGame').hide();
        $('#startGameAt7').hide();
        $('#startTutorial').hide();
        ScreenManager.ShowGame();
       
        SwapManager.SetAvailableSwaps(this.currentLevel.swaps);
        
        if (SwapManager.swapsLeft > 0) {
            $('#swap').show();

        }
        if (GameManager.currentLevelIndex >= GameManager.startShowEnergyIndex){
             $('#energy').show();
             if (GameManager.currentLevelIndex == GameManager.startShowEnergyIndex){
                 $('#energy').addClass('pulseGlow');
             } else {
                 $('#energy').removeClass('pulseGlow');
             }
        }
        

        GameBoard.ClearBoard(); 
        this.lives = this.currentLevel.lives;
        this.UpdateLifeCounter();
        

       
        this.currentDeck = GameBoard.GetDailyShuffle();
        GameBoard.rows = GameManager.currentLevel.boardSize.rows;
        GameBoard.cols = GameManager.currentLevel.boardSize.cols;
        

        //console.log('this cur deck:'+this.currentDeck.toString());
        this.currentIced = [...this.currentLevel.iced]; //levels[this.currentLevelIndex].iced];
        this.setGameState(this.GameState.Init, "initializing ..");
        // Only set animation callback to be triggered after all cards are instanced.
        await GameBoard.generateCards();
        await GameBoard.refreshBoard();
        GameManager.setGameState(GameManager.GameState.Normal, "animation callback after startgame");

    },
     async StartLevel(){
        document.getElementById('odometer').odometer.format.precision=5;
         //    console.log("Start"); 
        // Reset the score to zero for the new level
        this.score = 0; 
        this.el = document.getElementById('odometer');
        // Update the Odometer instance to reflect the new score
        if (this.el.odometer) {
            this.el.odometer.update(0);
        } else {
            // Fallback in case the Odometer instance isn't accessible as expected
            $("#odometer").html("0");
        }

        if (!this.noBounceLoaded){
            this.noBounceLoaded = true;
          const script = document.createElement("script");
          script.src = '/static/js/inobounce.js'; 
          script.type = 'text/javascript';
          document.head.appendChild(script);
        }
        GameManager.movesThisLevel = 0;
        this.currentGameLost = false; // hacky .. we use this as a separate way to track game state, because too many things update game state which can cause errors. This is to prevent user from seeing "won level" screen after clearing a level, losing the game, and pressing next before the previous "check if level cleareD" function has finished. Ideally we early exit that function (onExplosionChainFinished) ..
        this.setMaxLevelReached(this.currentLevelIndex); 
        $('#levelTitle').html('Level '+this.currentLevelIndex);
        ScreenManager.HideAll();
        ScreenManager.ShowGame();
        
        SwapManager.SetAvailableSwaps(this.currentLevel.swaps);
        
        if (SwapManager.swapsLeft > 0) {
            $('#swap').show();

        }
        if (GameManager.currentLevelIndex >= GameManager.startShowEnergyIndex){
             $('#energy').show();
             if (GameManager.currentLevelIndex == GameManager.startShowEnergyIndex){
                 $('#energy').addClass('pulseGlow');
             } else {
                 $('#energy').removeClass('pulseGlow');
             }
        }
        

        GameBoard.ClearBoard(); 
        this.lives = this.currentLevel.lives;
        this.UpdateLifeCounter();
        GameBoard.rows = GameManager.currentLevel.boardSize.rows;
        GameBoard.cols = GameManager.currentLevel.boardSize.cols;
        this.currentDeck = GameBoard.ReverseDeckOrder(GameManager.currentLevel.deck);
        //console.log('this cur deck:'+this.currentDeck.toString());
        this.currentIced = [...this.currentLevel.iced]; //levels[this.currentLevelIndex].iced];
        this.setGameState(this.GameState.Init, "initializing ..");
        // Only set animation callback to be triggered after all cards are instanced.
        await GameBoard.generateCards();
        await GameBoard.refreshBoard();
        GameManager.setGameState(GameManager.GameState.Normal, "animation callback after startgame");

    },
     GameState : {
        Init : "Init",
        Normal : "Normal",
        Paused : "Paused",
        TilePop : "TilePop",
        Swapping : "Swapping",
        Animating : "Animating",
        Menu : "Menu",
    },
    gameState : null, 
    previousGameState : null,

    setGameState(newState, source){
        if (this.gameState != newState){
            this.previousGameState = this.gameState;
            this.gameState = newState;
//            console.log("gamestate set to: "+newState+" from:"+source);
            this.onGameStateChanged.forEach(x => { if (x != null) x(source); }); //!= null) this.onGameStateChanged();
        }
    },
    onGameStateChanged : [],
    gameStateChanged(){
    },
    SaveAndGetHighScores(){
        highScore = GameManager.score;
        var data = { score : highScore }
        $.ajax({
            type: 'POST',
            url: "save_score/",
            data : data,
            headers: {
                "X-CSRFToken": csrf
            },
            success: function (e) {
                console.log('scores:'); 
                let data = JSON.parse(e.data);
                console.log(data);
                $('#highScores').html('<ol id="listy" style="padding-left:55px;overflow-y:scroll;height:67%; text-align: center;width:calc(100% - 55px);margin:0 auto;"></ol>')
                var list = JSON.parse(JSON.stringify(data.scores));
                var ip = data.user_ip;
                console.log('ip:'+ip);
                var yourScoreFound = false;
                for(var i=0;i<list.length;i++){
                    var line = list[i].split(',');
                    var score = parseInt(line[0]);
                    // console.log("line:"+line+", score;"+score);

                    let expScore = score.toExponential(5);
                    let splitScore = expScore.toString().split('e+');
                    let textExp = splitScore[1];
                    let colorVal =  getColorFromInt(parseInt(splitScore[1]))
                    let score_ip = line[1];
                    let htmlScore = splitScore[0] + "<span style='color:#eee'> × 10</span>" + "<span class='exponent' style='color:"+colorVal+"'>" + textExp +"</span>";

                    // Create a new <li> element
                    var listItem = $('<li></li>');

                    listItem.html(htmlScore);
                    if (i ==0) listItem.html("👑 " + listItem.html())
                    listItem.append(" <span style='font-size:0.6em;color:gray;'>"+score_ip+"</span>");
                    // Append the <li> element to another element (e.g., <ul> with id="myList")
                    yous = ['also you','was you','you too','you as well','you again']
                     if (score_ip == ip){
                        if (score == GameManager.score && !yourScoreFound) {
                            yourScoreFound = true;
                            listItem.html(listItem.html() + " <span style='position:relative;width:120px;color:red'>←Your Score</span>")
                            listItem.css('background-color','#666');
                            listItem.css('border-radius','15px');
                        } else {
                            const randomYou = yous[Math.floor(Math.random() * yous.length)];
                            listItem.html(listItem.html() + " <span style='position:relative;width:160px;font-size:0.6em;color:gray;'><- "+randomYou+"</span>")
                        }
                    }


                    $('#listy').append(listItem);


                }
 //                console.log('saved . e:'+JSON.stringify(e).slice(0,1000)); 
            },
            error: function (e) {
  //              console.log(JSON.stringify(e).slice(0,1000));
            }
 
        })


    },
    WinLevel(){
        audios.play(audios.sources.win[0]);
        ScreenManager.HideAll();
        if (GameManager.isDailyShuffle){
            ScreenManager.ShowDailyShuffleScoreboard();
        } else {
            ScreenManager.ShowWinScreen({shoTip:true});
        }
        GameManager.setMaxLevelReached(GameManager.currentLevelIndex+1);
        Settings.SaveSettings();
        $('.currentScore').text("Score: " + GameManager.score);
        let currentLevel = GameManager.currentLevelIndex.toString();
        let highScore = GameManager.score;
        if (GameManager.isDailyShuffle){
            // update the today's daily shuffle high score text file with your current score.


            // TODO
            // ajax call to python to get current high score
            // add high score to the list and order it
            // if yes, another ajax to write high score
            GameManager.SaveAndGetHighScores();
                       // read text from the daily shuffle file for today's date.


        } else if (currentLevel in GameManager.highScores){
            let oldHighScore = parseInt(GameManager.highScores [currentLevel]);
            if (GameManager.score > oldHighScore){
                GameManager.highScores [currentLevel] = GameManager.score;
            }else{
                highScore = oldHighScore;
            }
        }else {
            GameManager.highScores [currentLevel] = GameManager.score;
        }


        $('.highScore').text("High Score: " + highScore);
        $('#tip').show();
        $('#tip').html('');

        if (GameManager.isDailyShuffle) {
            // show high score board
            // TODO
        } else {
              // Use getTipForLevel to get the appropriate tip
            setTimeout(function(){
                var tipForLevel = UserTips.getTipForLevel(GameManager.currentLevelIndex);
                    UserTips.slowType($('#tip'), tipForLevel, 25);
                }, 2200);

            let showNextAfter = Score.DisplayStars();
            if (Settings.debug) showNextAfter = 1;
            // $('#nextLevel').removeClass('disabled');;
            setTimeout(function(){$('#nextLevel').show();},Settings.debug ? 1 : 3500);
            GameManager.setMaxLevelReached(GameManager.currentLevelIndex+1);
            Settings.SaveSettings();
        
        }

        this.showScorePower=false;
    },

    currentLevelIndex : 0,
    // later: How to make "levels" immutable?
    // https://www.freecodecamp.org/news/javascript-immutability-frozen-objects-with-examples/
            // deck : [...Array(25).keys()].filter(x => (x > 1 && !Num.isPrime(x))).sort(() => Math.random() - 0.5),
     startShowEnergyIndex : 0,
     levels : levels,
     createRandomLevel(i){
        let rc = Math.min(6, Math.floor(i / 3.5));
        let deck = [...Array(i*3).keys()].filter(x => x > 1);
        if (i > 24) deck = [...deck].map(x => [x,x]).flat();
        let rockPositions = [...Array(Math.floor(i/3)).keys()].map(x => Num.randomRange(0,deck.length-(i/3)));
        rockPositions.forEach(x => deck.splice(x, 0, Card.Rock));
        let iced = [...Array(Math.floor(i/4)).keys()].map(x => Num.randomRange(2,i*2));
        let level = {
            deck : deck,
            iced : iced,
            swaps : Math.floor(i/3),
            lives : Math.floor(i/3),
            boardSize : { rows : rc, cols : rc},
        }
        return level;
 
    },
    advanceLevel(){
        this.currentLevelIndex ++;
        $('#level').html("Level:"+this.currentLevelIndex);
    },
    currentDeck : [],
    currentIced : [],
    get currentLevel(){
        if (Object.keys(this.levels).length > this.currentLevelIndex ){
            return this.levels[this.currentLevelIndex];
        } else {
            return this.createRandomLevel(this.currentLevelIndex);
        }
    }
}

let drags = new Set() //set of all active drags
document.addEventListener("touchmove", function(event){
  if(!event.isTrusted)return //don't react to fake touches
  Array.from(event.changedTouches).forEach(function(touch){
    drags.add(touch.identifier) //mark this touch as a drag
  })
})
document.addEventListener("touchend", function(event){
  if(!event.isTrusted)return
  let isDrag = false
  Array.from(event.changedTouches).forEach(function(touch){
    if(drags.has(touch.identifier)){
      isDrag = true
    }
    drags.delete(touch.identifier) //touch ended, so delete it
  })
  if(!isDrag && document.activeElement == document.body){
    //note that double-tap only happens when the body is active
    event.preventDefault() //don't zoom
    event.stopPropagation() //don't relay event
    event.target.focus() //in case it's an input element
    event.target.click() //in case it has a click handler
    event.target.dispatchEvent(new TouchEvent("touchend",event))
    //dispatch a copy of this event (for other touch handlers)
  }
})

var map = {}; // You could also use an array
onkeydown = onkeyup = function(e){
    e = e || event; // to deal with IE
    // 76 => L
    map[e.keyCode] = e.type == 'keydown';
    // console.log(e.keyCode);
    // console.log("map:"+JSON.stringify(map));
    if (map[17] && map[87]){
        GameManager.WinLevel();
    }
    if (map[17] && map[76]){
        GameManager.LoseGame();
    }
    /* insert conditional here */
}

function getColorFromInt(value) {
    // Ensure the value is within the valid range
    if (value < 0) value = 0
    if (value > 25) value = 25


// Apply a skew to the value
    const skewFactor = 2; // Adjust this factor to control the skew
    const normalizedValue = value / 21.5;
    const skewedValue = Math.pow(normalizedValue, skewFactor);

    // Calculate the hue value based on the skewed value
    const startHue = 270; // Purple
    const endHue = 60;    // Yellow
    const hue = startHue + ((endHue - startHue) * skewedValue);

    // Return the color in HSL format
    return `hsl(${hue}, 100%, 50%)`;

}
