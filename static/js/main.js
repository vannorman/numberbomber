// BUGS
// BUG: tilepop sometimes below other tiles.
// BUG: "cancel" touch does not work for moving finger off factor after press ? validate

/*
TODO
 stars system: Lost zero lives, maxed score
 score?
*/

var gameClicked = false;
var Settings = {
    explosionDelay : 200,
    debug : false,
    debugSfx : false,
    _mobile : null,
    useGeneratedLevels : false,
    get mobile(){
        if (this._mobile == null) this._mobile = mobileCheck();
        return this._mobile;
    },
    RandomDeal : false,
    Init () {
        this.LoadSettings();
    },
    LoadSettings(){
        $.ajax({
            type: 'POST',
            url: "get_settings/",
            headers: {
                "X-CSRFToken" : csrf
            },
            success: function (e) {
                console.log('settings load success:'); 
                let data = JSON.parse(e.data);
                console.log(data)
                if (Num.isNumber(data.musicVolume)){
                    audios.setMusicVolume(data.musicVolume);
                }
                if (Num.isNumber(data.soundVolume)){
                    audios.setSoundVolume(data.soundVolume);

                }

                GameManager.setMaxLevelReached(data.levelReached);
                GameManager.populateSkipLevelsList();
            },
            error: function (e) {
                console.log("Load settings error:"+JSON.stringify(e));
            }
        });
        $('html').on(Input.end, function(){
            if (Menu.settingsShown){
                Settings.SaveSettings();
            }
        });

    },
    SaveSettings(){
        data = {
           settings : JSON.stringify({
               soundVolume : audios.soundVolume,
               musicVolume : audios.musicVolume,
               levelReached : GameManager.maxLevelReached,
            })
        }
        $.ajax({
            type: 'POST',
            url: "save_settings/",
            headers: {
                "X-CSRFToken" : csrf
            },
            data : data,
            success: function (e) {
//                console.log('settings save success:'+JSON.stringify(e));
                
            },
            error: function (e) {
                console.log(JSON.stringify(e));
//                $('html').html(JSON.stringify(e));
            }
        });
    
    },
    
}
class Card {
    static Rock = "Rock";
    static Wild = "Wild";

    constructor(value, row, col, id, iced) {
        this.row = row;
        this.col = col;
        this.value = value;
        this.clicked = false;
        this.touched = false;
        this.id = id;
        this.iced = iced;
        this.exploding = false;
        this.sparking = false;
        this.popped = false;
        this.watchInputHover = null;
        this.watchInputHoverFactor = null;
        this.propagateLightningLoop = null;
        this.iceShine = null;
        this.factorTouched = false; // TODO: Factors should be their own class.

        this.$card = null;
        this.$ice = null;
        this.$factors = [];
    }

    get center(){
            let top = this.$card.offset().top + GameBoard.getDim()/3;
            let left = this.$card.offset().left + GameBoard.getDim()/3;
            return {
                top:top,
                left:left 
            };

    }

    deIce(){
        this.iced--;
        audios.iceCrack();
        let pos = this.center; 
        particleFx.hurt(pos,2200,3,80);

        this.$card.find('.iced').css('opacity',this.iced/3);
        if (this.iced == 0) {
            clearInterval(this.iceShine);
        }
    }

    static getCardById (id) {
        return GameBoard.cards.filter(x => x.id == id)[0];
    }
    
    instantiate(){
        let $card = this.createElement(this.value, this.row, this.col); 
        this.$card = $card;
        this.createFactors();

        let $this = this;
        this.bindClicks($this);
        if (this.iced > 0){
            $this.ice = $("<div class='iced'><div class='iceShine' style='position:absolute;top:0;left:0;width:100%;height:100%;'></div>");
//            for(let i=0;i<$this.iced;i++){
//                $this.ice.append('<div class="icedIcon"></div>');
//            }
            $card.append($this.ice);
            this.iceShine = setInterval(function(){
                $this.ice.find('.iceShine')
                    .css('background-image','url(/static/img/iceShine.png)')
                    .css('background-repeat','no-repeat')
                    .css('background-size','200%')
                    .css('background-position','-50% -50%')
                    .animate({'background-position-y': '150%','background-position-x':'150%'},1400,
                    function(){$this.ice.find('.iceShine').css('background-image','none');});

            },6500);
        }
        if (this.value == Card.Rock ){
            $card.append("<div class='rock'></div>");
        }

        this.createFactors();
        $('#game').append($card);
    }

    animatePressDown(){
        this.$card.addClass('pressed');
    }

    animatePressRelease(){
        this.$card.removeClass('pressed');
        clearInterval(this.watchInputHover);
    }

    cancelPress(){
        this.touched = false;
        this.animatePressRelease();
        clearInterval(this.watchInputHover);
    }

    bindClicks($this){
        if ($this.value == Card.Rock) return;

        this.$card.bind(Input.start,function(e){
            if ($this.touched  == false &&
            (GameManager.gameState == GameManager.GameState.Normal || GameManager.gameState == GameManager.GameState.TilePop)){

                $this.touched = true; 
                $this.watchInputHover = setInterval(function(){
                    // Was mouse still over this element? If not, "cancel" the click.
                    if (!Input.hoveringElement($this.$card)){
                        $this.cancelPress();
                    }
                },50);
                if (!$this.popped){
                    $this.animatePressDown();
                }
            }
        });
        this.$card.bind(Input.end,
            function(e){
                if ($this.touched) { 
                    $this.animatePressRelease();
                    $this.touched = false; 
                    $this.onClick(e);  
                }
            })  

    }

    onClick(e){
        if (GameManager.gameState == GameManager.GameState.Animating) return; 
        if (GameManager.gameState == GameManager.GameState.TilePop) { 
            GameBoard.closeAllCards(true, "cardclik");
            this.UnPopTile();
        } else if (this.iced <= 0 && !this.clicked && GameManager.gameState == GameManager.GameState.Normal) { 
            this.PopTile();
        } 
    }

    UnPopTile(){
        this.$tilePop.hide();
        this.popped = false;
        audios.unShowFactors(0.4);
        this.$card.removeClass('popped');
       this.clicked = false; 

    }
    
    PopTile(){
        this.popped=true;
        this.$card.addClass('popped');
        audios.showFactors();
        GameManager.setGameState(GameManager.GameState.TilePop,"click tile");
        this.clicked = true;
        GameBoard.fadeAllTilesExcept(this);
        this.$tilePop.fadeIn(200);
        if (this.value == Card.Wild) {
            console.log("Creating factors.");
            this.createFactors();        
        }

        // anim fx for factor button pop
        this.$card.find('.baseButton').each(function(){
            let w = parseInt($(this).css('width'));
            let h = parseInt($(this).css('height'));
            $(this).css('width',0);
            $(this).css('height',0);

            let $this = $(this);
            $(this).animate( {width: w*1.2, height: h*1.2},150,function(){ $this.css('width',w).css('height',h); });

//            $(this).addClass('factorsPopping');
//            let $this = $(this);
//            setTimeout(function(){
//                $this.removeClass('factorsPopping')
//            },300);
        });
    }


    createElement (value, row, col) {
        // Create the <div> element for this card, including its factors, position it, and append it to the DOM
        let $card = $('<div class="tile"></div>');
        let xPos = GameBoard.getDim() * col;
        let yPos = GameBoard.getDim() * row;
        let margin = 10; //parseInt($card.css('border-width'));
        $card   .attr('id',this.id)
                .css('left',xPos)
                .css('top',yPos)
                .css('width',GameBoard.getDim() - margin)
                .css('height',GameBoard.getDim() - margin);
        let $tileCenter = $('<div class="tileCenter"></div>');
        $card.append($tileCenter);
        let $tileNum = $('<div class="tileNum"></div>');
        $tileNum
                .css('font-size',GameBoard.getDim()/6)
                .html(value);
        $card.append($tileNum);
        let $tileBg = $('<div class="tileBg"></div>');
        $tileBg.css('background-image','url(/static/img/num/'+value+'.png)'); // Fails for non numeric, non /img/1.jpg style cards e.g. Rocks, Wild
        $tileCenter.append($tileBg);
        let $tilePop = $('<div class="tilePop"></div>');
        $tileNum.css('background','none');
        if (Num.isPrime(value)) {
            $card.addClass('prime');
            $card.css('-webkit-box-shadow','0 6px #1924FF');
        } else { 
            $card.addClass('composite');
            $tileCenter.css('-webkit-box-shadow:','0 0 10px #fff');
        }
           
        $tilePop.css('display','flex').hide();
       $card.append($tilePop);
       this.$tilePop = $tilePop;
       return $card; 
    }

    createFactors(){
         // Add factor buttons inside of tilePop 
        let value = this.value;
        if (value == Card.Wild){
            value = 1;
            this.getAdjacentCards().filter(x => Num.isNumber(x.value)).forEach(x => value *= x.value);
        }
        // in case of "wild", this could be the Nth time we called "CreateFactors"
        // TODO: change Wild so that when Wild is "unpressed" the factors are deleted, instead of deleting them during creation here 
        this.$card.find('.baseButton').each(function(){$(this).remove();});
        
        let factorsMap = Num.mapFactors(value);
        factorsMap.forEach((power,base) => {
            let $btn = $('<div class="baseButton">'+base+'</div>');  
            $btn.css('padding-top',GameBoard.getDim()/4)
                .css('width',GameBoard.getDim()/3)
                .css('height',GameBoard.getDim()/2.6)
                .css('font-size',GameBoard.getDim()/4)
                .css('margin-top',-GameBoard.getDim()*0.9);
            if (power > 1) {
                let $power =$("<div class='power'>"+power+"</div>"); 
                $btn.append($power);
            }
            $btn.attr('id',this.id+'_'+base); // when user clicks later, we know the factor base that was clicked
            let $tilePop = this.$card.find('.tilePop');
            $tilePop.append($btn);
            let card = this;
            $btn.bind(Input.start,function(e) {
                card.factorPressed(e,base,power,$btn);
            });
            $btn.bind(Input.end,function(e) {
                card.factorUnpressed(e,base,power,$btn);
            });
            this.$factors.push($btn);
       });

    }
    destroy(){
        this.unbindClicks();
        clearInterval(this.iceShine);
    }

    unbindClicks(){
        this.$card.unbind('click');
        this.$card.find('.baseButton').each(function(){ $(this).unbind('click');});
    }
   
   // TODO: rename "baseButton" and "factor" they are the same el
    async factorPressed(e,factor,power,el) {
        this.factorTouched=true;
        el.addClass('pressed');
        let $this = this;
        this.watchInputHoverFactor = setInterval(function(){ 
            if (!Input.hoveringElement(el)){
                $this.factorPressCancel(el);
                clearInterval($this.watchInputHoverFactor);
            }
        },50);
        let source = this;
        let caller = this;
        let chain = [];
        await this.previewExplode(source,caller,factor,chain);
 
        chain.forEach(x => x.sparking = false);
        await this.previewExplode(source,caller,factor,chain);
        
        chain.forEach(x => x.sparking = false);
     }

    factorPressCancel(el){
        el.removeClass('pressed');
        clearInterval(this.watchInputHoverFactor);
    }

    factorUnpressed(e,factor,power,el) {
        if (this.factorPressed){
            this.factorPressed = false;
            el.removeClass('pressed');
            clearInterval(this.watchInputHoverFactor);
            this.factorClicked(e,factor,power);
        }
    }


    async factorClicked(e,factor,power){
        // Detect adjacent cards to explode
        // TODO: Move state change to explode()
        GameManager.setGameState(GameManager.GameState.Animating,"click factor");
        GameBoard.cards.forEach(x => x.resetFade());

        let source = this;
        let caller = this;
        let chain = [];
        await this.explode(source,caller,factor,chain);
        GameBoard.onExplosionChainFinished(source, factor, chain);
        
    }

    getCardsAboveMe(){
        return GameBoard.cards.filter(x => (x.row < this.row && x.col == this.col)); 
    }
    
    getCardsBelowMe(){
        return GameBoard.cards.filter(x => (x.row > this.row && x.col == this.col)); 
    }

    getCardsAboveMe(){
        return GameBoard.cards.filter(x => (x.row < this.row && x.col == this.col)); 
    }

    getEmptySpacesBelowMe(){
        return GameBoard.rows - (this.row + 1) - this.getCardsBelowMe().length;
    }
    
    getAdjacentCards(excluded=[]){
        let adjacent = [];
        GameBoard.cards.forEach(x => {
            if ((  this.row == x.row   && this.col == x.col+1)
                || (this.row == x.row+1 && this.col == x.col  )
                || (this.row == x.row   && this.col == x.col-1)
                || (this.row == x.row-1 && this.col == x.col  )){  
                if (!(excluded.includes(x.value)) && !(adjacent.includes(x.value))) {
                    // "excluded" Prevent infinite looping of two tiles next to each other
                    adjacent.push(x);
                }   
            }
        });
        return adjacent;
    }

    top(){
        return parseInt(this.$card.css('top'));
    }

    left(){
        return parseInt(this.$card.css('left'));
    }
    
    setPosRowCol(row,col){
        this.setPos(row*GameBoard.getDim(),col*GameBoard.getDim());
    }

    setPos(top,left){
        this.$card.css('top',top).css('left',left);
    }

    async fallToRow(row){
        // TODO: This async is meaningless because the .animate function in fallToPos does not wait for its own return.
        this.row = row;
        await this.fallToPos(row*GameBoard.getDim());
    }

    async moveToRowCol(row,col){
        this.row = row;
        this.col = col;
        await this.moveToPos(row*GameBoard.getDim(),col*GameBoard.getDim());
    }
    async moveToPos(targetTop,targetLeft,aud=null){
        let duration = 250;
       await this.$card.animate({
            top: targetTop,
            left: targetLeft,
          }, {duration:duration }).promise();
    }

    async fallToPos(targetTop){
        let rowsToMove = Math.abs(targetTop - this.top()) / GameBoard.getDim();
        let duration = rowsToMove * 250;
        GameManager.setGameState(GameManager.GameState.Animating, "animating card "+this.value);
        if (Settings.debug) duration = 1;
       // Bounce animation with sounds at each bounce
       // Only play bounce sound if this is the bottom-most tile in this column.
       let clink = false;
        if (this.getCardsBelowMe().length == 0) clink = true; 
       await this.$card   .animate({  top: targetTop }, 
                             {  duration: duration,    
                                easing: 'easeInQuad',    
                                complete: () => { if (clink) audios.clink(1)} 
                             })  
                    .animate({ top: targetTop-50,}, 
                             {  duration: 100,   
                                easing: 'easeOutQuad'})  
                    .animate({  top: targetTop },  
                             {  duration: 100,
                                easing: 'easeInQuad',
                                complete: () => { if (clink) audios.clink(0.5); } 
                             })  
                    .animate({  top: targetTop-10 },
                             {
                                duration: 20,    
                                easing: 'easeOutQuad',
                                })
                    .animate({  top: targetTop},  
                             {  duration: Math.random() * 10 + 10,
                                easing: 'easeInQuad',
                               complete: () => { audios.clink(0.1); }
                             }).promise();

    }

    resetFade(){
        this.$card.stop().css('opacity','1');
    }

    async previewExplode(source, caller, factor, chain){
        this.sparking = true;
        chain.push(this);
        
        await timer(400);
        // Explode neighbors

        let filterFn = function(x) { return !x.sparking; };
        let matched = this.getMatchedNeighbors(source,factor,filterFn);

        let explosions = []
        matched.forEach(x => {
            if (x.iced > 1){
            } else {
                if (source.exploding) {
                    // quit doing fx if exploding
                    return;
                }
                let startPos = {left:this.$card.offset().left,top: this.$card.offset().top};
                let spark = new SparkFX();
                spark.instantiate(startPos);
                let destPos = {left:x.$card.offset().left,top:x.$card.offset().top};
                let duration = 800;
                spark.move(destPos,duration);
                particleFx.sparks.push(spark);
                setTimeout(function(){
                    spark.destroy();
                    particleFx.sparks.splice(particleFx.sparks.indexOf(spark),1);
                },duration)
      
                    explosions.push(x.previewExplode(source,this,factor,chain));
                    audios.electric();
                }
        }); 

       await Promise.all(explosions);

        return chain;
    }

    
    async explode(source, caller, factor, chain, delay=0){
        if (this.exploding) return;
        this.exploding = true;
        chain.push(this);
        let score = Math.pow(factor,chain.length);
        GameManager.addScore(score); 
        particleFx.score(this.$card,score); 
        // Explode  FX;
        let duration = Math.random()*250+1500;
        let distToMove = Math.random()*25+10;
        let slices = 3;
        particleFx.explode(this.$card,slices,duration,distToMove);
        let $card = this.$card;
        $card.find('.tileBg').remove();
        $card.find('.tileCenter').css('background-image', 'url(/static/img/explode.png')
            .css('background-size','cover')
            .fadeOut(0.5,function(){
               $card.fadeOut(200) 
           });

        // Explode neighbors
        let filterFn = function(x) { return !x.exploding; };
        let matched = this.getMatchedNeighbors(source,factor,filterFn);
        if (matched.length == 0 && chain.length == 1){
            GameManager.LoseALife("chian 1");
        } else {
            audios.buzz(); 

        }
        
        let ignored = []
        matched.filter(x => x.iced > 0)
            .forEach(x => {
                x.deIce(); 
                ignored.push(x);
            }) // de-ice iced cards faster than cards explode (before await); ignore this card for explosions later

    
        Settings.debug ? await timer(1) : await timer(400);
        let explosions = [];
        for(let i=0;i<matched.length;i++){
            let x = matched[i];
            if (ignored.includes(x)){
                // Do nothing, it's ignored because it was de-iced earlier; this avoides de-icing and exploding in one go
            } else {
                // if only one was matched, play it normally without an additional delay.
                // OR if there was more than one match, no matter what the previous delay, on the first match, proceed with no delay.
                let matchedLength = matched.length - matched.filter(x => x.iced > 0).length 
                if (matchedLength == 1 || (matchedLength > 1 && i == 0)) {
                    explosions.push(x.explode(source,this,factor,chain));
                } else {
                    // if there was more than one match, and we're now exploding the 2nd or greater, cumulatively increase the delay.
                    await timer(150);
                    explosions.push(x.explode(source,this,factor,chain,delay));
                }
           }
         }

        await Promise.all(explosions);
        // Remove this card
        GameBoard.removeCard(this);
        this.destroy();
        return chain;
    }

    getMatchedNeighbors(source,factor,filterFn){
        let neighbors = this.getAdjacentCards().filter(x => filterFn(x)); 
        let eligible = [];
        for(var i=0;i<neighbors.length;i++){
            let x = neighbors[i]; 
            if (Num.mapFactors(x.value).has(factor) && !(Num.isPrime(source.value) && Num.isPrime(this.value) && Num.isPrime(x.value))) {
                eligible.push(x);
//                console.log('this ('+this.value+') matched x ('+x.value+') by factor');
             } else if (Num.isPrime(source.value) && Num.isPrime(this.value) && Num.isPrime(x.value)){
                eligible.push(x);
//                console.log('this ('+this.value+') matched x ('+x.value+') by prime');
            } else if (x.value == Card.Wild 
                || (this.value == Card.Wild && Num.mapFactors(x.value).has(factor) )
                || (this.value == Card.Wild && Num.isPrime(source.value) && Num.isPrime(x.value)) )
            {    
               eligible.push(x);
            }    
       
        }    
        return eligible;

    }

//    close(fade=false){
//       if (!fade) this.resetFade(fade);
//       else this.$card.animate({opacity:1});
//       this.$card.find('.tilePop').stop().hide();
//       this.clicked = false; 
//    }
}

var GameBoard = {
    BoardCleared(){
        return this.cards.filter(x => Num.isNumber(x.value)).length == 0;
    },
    BoardSettled(){
        return this.cards.filter(x => x.getEmptySpacesBelowMe().length).length == 0;
    },
    BoardStateUnwinnable(){ 
        return this.cards.length == this.cards.filter(x => x.iced > 0 || !Num.isNumber(x.value)).length && this.cards.filter(x => Num.isNumber(x.value)).length > 0;
    },
    StackNewCardsOnEmptyColumns(){
        for(var col=0;col<this.cols;col++){
            let cardsInCol = this.cards.filter(x => x.col == col).length;
            let missingCount = this.rows - cardsInCol;
            for(var i=0;i<missingCount;i++){
                let row = -(i+1);
                let card = this.generateCard(row, col);
                if (GameManager.currentDeck.length == 0) return;
            }
        } 
    },
    async onExplosionChainFinished (source, factor, chain){
        // await new key().press; 
        GameBoard.StackNewCardsOnEmptyColumns();
        // await new key().press; 
        await GameBoard.refreshBoard();

        // We may have already lost, allow early out if so.
        if (GameManager.currentGameLost) {
            return;
        }

        if (GameBoard.BoardSettled() && GameBoard.BoardCleared()){
            // Level finished and animations finished
            setTimeout(function(){ 
                GameManager.setGameState(GameManager.GameState.Menu,"exp finished & cardlen 0");
                GameBoard.ClearBoard();
                GameManager.WinLevel();
            },1800);
        } else if (GameBoard.BoardStateUnwinnable()) { 
            // Level got into an unnwinnable state
            GameManager.setGameState(GameManager.GameState.Menu,"lost ");
            GameManager.LoseGame('Level failed ! You didnt break the ice blocks');
        } else { 
            // Refreshed was false and no other special states detected; resume game as normal.
            // Level got into an unnwinnable state
            GameManager.setGameState(GameManager.GameState.Normal,"normal resu");
        }
    },
 
    cardsToExplode : 0,
    cardsToMove : [],
    ClearBoard(){
        this.cards.forEach(x => x.$card.remove());
        this.cardsToExplode = 0;
        this.cards = [];
    },
    rows : 4,
    cols : 4,
    getDim(){
        return ($('#game').width()/this.rows);
    },
    cardsToRemove : [],
    cards : [],
    cardIdIndex : 0,
    fadeAllTilesExcept(card){
        this.cards.forEach(x => {
            if (x != card) {
                x.$card.animate({
                    opacity: 0.5,
                  }, 400, function() {
                });
 
            }
        });
    },
    async generateCards (){
        for(var row=this.rows-1;row>=0;row--){
            await timer(Math.random()*50);
            for (var col=0;col<this.cols; col++){ 
                if (GameManager.currentDeck.length <= 0) break;
                let card = this.generateCard(-this.rows + row,col);
           }
        }
    },
    generateCard(row,col){
        // TODO: Store current (mutable) deck in GameBoard, not GameManager
        let value = Settings.RandomDeal ? this.getRandomCardValueFromDeck() : GameManager.currentDeck[0];
        if (value == null) return null;
        let curLevel = GameManager.levels[GameManager.currentLevelIndex];
        let iced = 0;
        if (GameManager.currentIced.includes(value)) {
           iced = 2;
           GameManager.currentIced.splice(GameManager.currentIced.indexOf(value),1);
        }
        let card = new Card(value, row, col, GameBoard.cardIdIndex++, iced);
        card.instantiate(row);
        this.placeCardFromDeckOntoBoard(card);
        return card;
      },
    getRandomCardValueFromDeck() { 
        if (GameManager.currentDeck.length == 0) {
            return null;
        }
        var cardIndex = Num.randomRange(0,GameManager.currentDeck.length-1);
        return GameManager.currentDeck[cardIndex];
    },

    placeCardFromDeckOntoBoard  (card) {
       this.cards.push(card);
        var index = GameManager.currentDeck.indexOf(card.value);
        GameManager.currentDeck.splice(index, 1);
        $('#cardsLeft').html(GameManager.currentDeck.length+" / "+GameManager.currentLevel.deck.length);
        return card;
    },

    removeCard(card) {
        card.$card.remove();
        GameBoard.cards.splice(GameBoard.cards.indexOf(card),1);
    },
    async refreshBoard(){
        let cardsToDrop = [];
        GameBoard.cards.filter(x => x.getEmptySpacesBelowMe() > 0).forEach(x => {
            cardsToDrop.push({ card:x, rows:x.getEmptySpacesBelowMe()});
            GameBoard.cardsToMove.push(x);
            x.row += x.getEmptySpacesBelowMe();
        });
        falling = [];
        this.cardsToMove.forEach(x => {
            falling.push(x.fallToRow(x.row,x.col)); // (targetTop,x.left());
        });
        await Promise.all(falling);
        this.cardsToMove = [];

    },

    getPos (row,col){
        let offset = { left : $('#game').offset().left, top : $('#game').offset().top };
        let left =  GameBoard.getDim() * (col) + offset.left;
        let top = GameBoard.getDim() * (row) + offset.top;
        return { left : left, top: top } 
    },

    closeAllCards (fade=false, src="undf"){
        GameManager.setGameState(GameManager.GameState.Normal,"GB.closeallcards() from: "+src);
        this.cards.filter(x => x.popped == true).forEach(x => { x.UnPopTile(); });
        this.cards.forEach(x => x.$card.stop().css('opacity',1));

//        this.cards.forEach(x => { x.close(fade); });
    }
}


var SwapManager = {
    RefreshBtn (){
        this.ChangeAvailableSwaps(this.swaps);
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
            this.mousedown = true; 
        });
        $('#swap').bind(Input.end,function(e){
            if (this.mousedown){
               SwapManager.onClick(e); 
            }
            this.mousedown = false;
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
    ChangeAvailableSwaps (ct){
        this.swapsLeft += ct;
        if (this.swapsLeft <= 0){
            $('#swap').addClass('disabled');
            this.swapsLeft = 0;
        } else {
            $('#swap').removeClass('disabled');
        }
        this.UpdateSwapsLeftText();
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
        Debug.Touch(e,"start drag");
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
        card.$card.css('z-index',10);
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
        this.draggingCard.$card.css('z-index',0);
        this.draggingCard = null;
        GameManager.setGameState(GameManager.GameState.Normal,"endDrag"); 
        this.ending = false;
        this.endSwapMode(e);         
    }
}

$(document).ready(function(){
    if (Settings.mobile){
        $('#game').css('width','100%');
        $('#main').css('width','100%');
        let w = parseInt($('#game').css('height'));
        $('#game').css('top','calc(50% - '+w/3+'px');
        $('#settingsIcon').css('width','10%');
        
    }
    // document.body.addEventListener('touchemove',function(e){ e.preventDefault(); });
    Settings.Init();
    Input.Init();
    GameManager.Init();
    SwapManager.Init();
    audios.PreInit();
    Menu.Init();
    Analytics.Init(); // will attempt to set IP for Music as well, not an analytics function ... but it is the one gets the for IP, which audios dependency uses to set sfx and musicvol
    if (Settings.debug) Debug.Init();
    if (Settings.debugSfx) SFX.Init();

});

var Menu = {
    gameStateChanged (m){
         },
    settingsShown : false,
    ToggleSettings(){
        if (!this.settingsShown){
            this.settingsShown = true;
            $('#settingsBackboard').show();
            GameManager.setGameState(GameManager.GameState.Paused,"pause");
            audios.play(audios.sources.doot[0]);
        } else {
            this.settingsShown = false;
            $('#settingsBackboard').hide();
            GameManager.setGameState(GameManager.GameState.Normal,"unpause");
            audios.play(audios.sources.doot[0]);

        }
    },
    Init (){
        GameManager.onGameStateChanged.push(function(e){
            Menu.gameStateChanged(e)
        });

        // TODO: These should be on inputManager?
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
    
    populateSkipLevelsList(){
        Object.keys(this.levels).forEach(x => {
            x = parseInt(x);
            if (GameManager.maxLevelReached >= x){

                $levelBtn = $("<div id='skip_"+x+"' class='levelBtn'>Skip to "+x+"</div>");
                $('#levelSkip').append($levelBtn);
                $levelBtn.bind('click',function(){
                    audios.click();
                    GameManager.SkipToLevel(x);
                });
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
    addScore(amt){ 
        GameManager.score += amt;
        $(".scoreboard").html(Intl.NumberFormat('en-us').format(GameManager.score));
    },
    lives : 4,
    UpdateLifeCounter(){
        $('#lives').html(this.lives);
    },
    LoseALife(source){
        console.log("lost life Source:"+source);

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
    LoseGame(title,text){
        console.log("LoseGame.");
        GameManager.currentGameLost = true;
        setTimeout(function(){audios.error();},100);
        setTimeout(function(){audios.error();},200);
        setTimeout(function(){audios.error();},300);
        setTimeout(function(){$('#loseScreen').show()});
        $('#loseScreen').find('.title').html(title);
        $('#loseScreen').find('.text').html(text);
    },
    Init () {
        $('#restartLevel').on('click',function(){
            audios.click();
//            GameManager.currentLevelIndex = 0;
            GameManager.StartLevel();
        });
         $('#restartGame').on('click',function(){
            location.reload();
        });
        $('#nextLevel').on('click',function(){
            audios.click();
            $('#winScreen').fadeOut();
            GameManager.currentLevelIndex++;
            GameManager.StartLevel();
            $('#level').html('Level: '+GameManager.currentLevelIndex);
        });
         $('#startGame').on('click',function(){
            audios.click();
            GameManager.StartLevel();
            $('#titleBg').hide();


        });
          $('#selectLevel').on('click',function(){
            audios.click();
            $('#mainMenu').fadeOut();
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
    HideMenus(){
        
        $('#startGame').hide();
        $('#selectLevel').hide();
        $('#loseScreen').hide();
        $('#settingsBackboard').hide();
    },

    async StartLevel(){
        this.currentGameLost = false; // hacky .. we use this as a separate way to track game state, because too many things update game state which can cause errors. This is to prevent user from seeing "won level" screen after clearing a level, losing the game, and pressing next before the previous "check if level cleareD" function has finished. Ideally we early exit that function (onExplosionChainFinished) ..
        this.setMaxLevelReached(this.currentLevelIndex); 
        $('#levelTitle').html('Level '+this.currentLevelIndex);
        $('#nextLevel').hide();
        this.HideMenus();
        $('#game').show();
        $('#gameBg').show();
        $('#settingsIcon').removeClass('disabled');
        $('#energy').show();
        $('#deck').show();
        $('#swap').show();
        $('#top').show();
        GameBoard.ClearBoard(); 
        this.lives = this.currentLevel.lives;
        this.UpdateLifeCounter();
        this.currentDeck = [...this.levels[this.currentLevelIndex].deck];
        this.currentIced = [...this.levels[this.currentLevelIndex].iced];
        this.setGameState(this.GameState.Init, "initializing ..");
        GameBoard.rows = GameManager.currentLevel.boardSize.rows;
        GameBoard.cols = GameManager.currentLevel.boardSize.cols;
        // Only set animation callback to be triggered after all cards are instanced.
        await GameBoard.generateCards();
        await GameBoard.refreshBoard();
        GameManager.setGameState(GameManager.GameState.Normal, "animation callback after startgame");

        SwapManager.ChangeAvailableSwaps(GameManager.levels[GameManager.currentLevelIndex].swaps);
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
//        if (GameManager.gameState == GameManager.GameState.Menu){
//            $('#titleBg').show();
//            $('#gameBg').hide();
//        } else {
//            $('#titleBg').hide();
//            $('#gameBg').show();
//
//        }
    },
    WinLevel(){
        audios.play(audios.sources.win[0]);
        $('#swap').hide();
        $('#deck').hide();
        $('#energy').hide();
        $('#settingsIcon').hide();
    
        $('#game').hide();
        $('#winScreen').show();
        let showNextAfter = Score.DisplayStars();

        setTimeout(function(){ $('#nextLevel').show(); },showNextAfter);
        GameManager.setMaxLevelReached(GameManager.currentLevelIndex+1);
        Settings.SaveSettings();
    },

    currentLevelIndex : 0,
    // TODO: How to make "levels" immutable?
    // https://www.freecodecamp.org/news/javascript-immutability-frozen-objects-with-examples/
     levels : {
        0 : {
            deck : [10,10,10,9,9,9,4,4,4],
            iced : [],
            swaps : 1,
            lives : 3,
            boardSize : { rows : 3, cols : 3 },
            minimumMoves : 2,
        },
        1 : {
            deck : [...Array(18).keys()].filter(x => x > 1).map(x => [x,x]).flat(), //.concat([...Array(18).keys()].filter(x => x > 1)),
//            deck : [ 4, 4, 4, 4, 4, Card.Rock, Card.Rock, 9, 9, Card.Rock, Card.Rock, 9, 9, 9, 9, 4],
            iced : [],
            swaps : 1,
            lives : 4,
            boardSize : { rows : 4, cols : 4 },
            minimumMoves : 3,
        },
        2 : {
            deck : [...Array(32).keys()].filter(x => x > 1),
            iced : [],
            swaps : 3,
            lives : 4,
            boardSize : { rows : 4, cols : 4 },
            minimumMoves : 4,
        },
        3 : {
            deck : [...Array(64).keys()].filter(x => x > 1),
            iced : [],
            swaps : 4,
            lives : 4,
            boardSize : { rows : 4, cols : 4 },
        },
         4 : {
            deck : [4, 4, 4, 4, 6, 6, 6, 6, 8, 8, 8, 8, 10, 10, 10, 10], //...Array(81).keys()].filter(x => ((Num.isPrime(x) || x % 2 == 0) && x > 1)),
            iced : [8,8,8,8],
            swaps : 5,
            lives : 4,
            boardSize : { rows : 4, cols : 4 },
        },
         5 : {
            deck : [...Array(81).keys()].filter(x => ((x % 7 == 0 || x % 11 == 0 || x % 13 == 0) && x > 1)),
            iced : [2],
            swaps : 6,
            lives : 4,
            boardSize : { rows : 5, cols : 5 },
        },
         6 : {
            deck : [...Array(81).keys()].filter(x => (x > 1 && !Num.isPrime(x))),
            iced : [2],
            swaps : 7,
            lives : 4,
            boardSize : { rows : 5, cols : 5 },
        },
         7 : {
            deck : [...Array(81).keys()].filter(x => x > 1),
            deck : [2],
            iced : [],
            swaps : 8,
            lives : 4,
            boardSize : { rows : 5, cols : 5 },
        },
         8 : {
            deck : [...Array(81).keys()].filter(x => (x > 1 && x % 2 != 0)),
            iced : [2],
            swaps : 10,
            lives : 4,
            boardSize : { rows : 5, cols : 5 },
        },
        
    },
    advanceLevel(){
        this.currentLevelIndex ++;
        $('#level').html("Level:"+this.currentLevelIndex);
    },
    currentDeck : [],
    currentIced : [],
    get currentLevel(){
        return this.levels[this.currentLevelIndex];
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

const Score  = {
    blankStar : '&#9734;',
    filledStar : '&#9733;',
    CalculateStars(){
        let livesScore = GameManager.lives / GameManager.currentLevel.lives;
        let movesScore = GameManager.currentLevel.minimumMoves / GameManager.movesThisLevel;
        let totalScore = Math.floor(3 * livesScore * movesScore);
        console.log("lives:"+livesScore+", moves:"+movesScore+", tota;"+totalScore);
        return totalScore;

    },
    DisplayStars () {
        score = Score.CalculateStars();
        let starWidth = 70;
        let showNextAfter = 1000;
        let delay = 750;
        $('#win2').html(Score.blankStar+Score.blankStar+Score.blankStar);
        if (score >= 1) {
            setTimeout(function(){
                let pos = { top : $('#win2').offset().top + starWidth * 0.5, left : $('#win2').offset().left + starWidth * 0.5}
                particleFx.hurt(pos,2200,1,120);
                audios.play(audios.sources.doot[0]);
                $('#win2').html(Score.filledStar+Score.blankStar+Score.blankStar);
            },delay);
            showNextAfter += delay;
        } 
        if (score >= 2) {
            setTimeout(function(){
                let pos = { top : $('#win2').offset().top + starWidth * 0.5, left : $('#win2').offset().left + starWidth * 1.5}
                particleFx.hurt(pos,2200,1,120);
                audios.play(audios.sources.doot[0]);
                $('#win2').html(Score.filledStar+Score.filledStar+Score.blankStar);
            },delay*2);
            showNextAfter += delay;
        } 
        if (score >= 3) {
            setTimeout(function(){
                let pos = { top : $('#win2').offset().top + starWidth * 0.5, left : $('#win2').offset().left + starWidth * 2.5}
                particleFx.hurt(pos,2200,1,120);
                audios.play(audios.sources.doot[0]);
                $('#win2').html(Score.filledStar+Score.filledStar+Score.filledStar);
            },delay*3);
            showNextAfter += delay;
        } 
        return showNextAfter;
    }
}
