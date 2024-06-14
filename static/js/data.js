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
        this.factorTouched = false; // later: Factors should be their own class.

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
            this.UnPopTile();
        } else if (this.iced <= 0 && !this.clicked && GameManager.gameState == GameManager.GameState.Normal) { 
            this.PopTile();
        } 
    }

    UnPopTile(){
        GameManager.setGameState(GameManager.GameState.Normal,"GB.closeallcards() from: unpop");
        let $this = this;
        this.$card.find('.baseButton').each(function(){
            let w = parseInt($(this).css('width'));
            let h = parseInt($(this).css('height'));
            $(this).css('color','transparent');
            $(this).animate( {width: w*0.3, height: h*0.3},40,function(){ 
                $this.$tilePop.hide();
                $(this).css('width',w);
                $(this).css('height',h);
                $(this).css('color','black');
            });

        });
        this.popped = false;
        audios.unShowFactors(0.4);
        this.$card.removeClass('popped');
       this.clicked = false; 
        $('#backBoard').hide();
    }
    
    PopTile(){
        $('#backBoard').show();
        this.popped=true;
        this.$card.addClass('popped');
        audios.showFactors();
        GameManager.setGameState(GameManager.GameState.TilePop,"click tile");
        this.clicked = true;
//        GameBoard.fadeAllTilesExcept(this);
        this.$tilePop.fadeIn(200);
        if (this.value == Card.Wild || this.value == 1) {
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

        });
    }

    removeElement(){
        if (this.$card != null) this.$card.remove();
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
        if (value <= 81){
            $tileBg.css('background-image','url(/static/img/num/'+value+'.png)'); // Fails for non numeric, non /img/1.jpg style cards e.g. Rocks, Wild
        } else {
            $tileBg.css('background-image','url(/static/img/jm.png)'); // Fails for non numeric, non /img/1.jpg style cards e.g. Rocks, Wild

        }
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
        if (value == Card.Wild || value == 1){
            value = 1;
            this.getAdjacentCards().filter(x => Num.isNumber(x.value)).forEach(x => value *= x.value);
        }
        // in case of "wild", this could be the Nth time we called "CreateFactors"
        // later: change Wild so that when Wild is "unpressed" the factors are deleted, instead of deleting them during creation here 
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
   
   // later: rename "baseButton" and "factor" they are the same el
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
            this.UnPopTile();
            this.factorClicked(e,factor,power);
        }
    }


    async factorClicked(e,factor,power){
        // Detect adjacent cards to explode
        // later: Move state change to explode()
        let rowFromBottom = Math.abs((this.row - 3) % 4);

        // Record the move made in the format of {x}{y}:{factor}
        // A move on the bottom left tile where a "5" was clicked: "00:5"
        // A move on the top right tile where a "13"  was clicked: "33:13"
        let moveMade = this.col.toString()+rowFromBottom.toString()+":"+factor;

        GameManager.logMove(moveMade);
        GameManager.movesThisLevel++;
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
    
    getEmptySpacesToRight(){


        return 0;

        if (this.col == GameBoard.cols - 1){
            // we're already in the right-most column.
            return 0;
        }

        let cardsToRight = GameBoard.cards.filter(x => x.row == this.row && x.col > this.col).length;
        if (cardsToRight < GameBoard.cols - this.col - 1){
            // If  there was an empty space to my right,

            return GameBoard.cols - this.col - 1 - cardsToRight;
        } else {
            return 0;
        }
            
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

    async fallToRowCol(row,col){
        // later: This async is meaningless because the .animate function in fallToPos does not wait for its own return.
        this.row = row;
        this.col = col;
        await this.fallToPos(row*GameBoard.getDim(),col*GameBoard.getDim());
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

    async fallToPos(targetTop,targetLeft){
        let rowsToMove = Math.abs(targetTop - this.top()) / GameBoard.getDim();
        let duration = rowsToMove * 250;
        GameManager.setGameState(GameManager.GameState.Animating, "animating card "+this.value);
        if (Settings.debug) duration = 1;
       // Bounce animation with sounds at each bounce
       // Only play bounce sound if this is the bottom-most tile in this column.
       let clink = false;
         audios.clink(1)
        await this.$card   .animate({  top: targetTop, left:targetLeft }, 
                             {  duration: duration,    
                                easing: 'easeOutQuint',    
                                complete: () => {  } 
                             }).promise();
//                    .animate({ top: targetTop-50, left: targetLeft-50}, 
//                             {  duration: 100,   
//                                easing: 'easeOutQuad'})  
//                    .animate({  top: targetTop, left: targetLeft},  
//                             {  duration: 100,
//                                easing: 'easeInQuad',
//                                complete: () => { if (clink) audios.clink(0.5); } 
//                             })  
//                    .animate({  top: targetTop-10, left:targetLeft-10 },
//                             {
//                                duration: 20,    
//                                easing: 'easeOutQuad',
//                                })
//                    .animate({  top: targetTop, left:targetLeft},  
//                             {  duration: Math.random() * 10 + 10,
//                                easing: 'easeInQuad',
//                               complete: () => { audios.clink(0.1); }
//                             }).promise();

    }

    resetFade(){
//        this.$card.stop().css('opacity','1');
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

        

        // For primes, multiply each new value
        if (Num.isPrime(source.value) && Num.isPrime(caller.value) && Num.isPrime(this.value)){
            let score = 1;
            chain.forEach(x => score *= x.value);
            GameManager.addScore(score); 
            particleFx.score(this.$card,score); 

        } else {
        // For composites, exponentiate each by the chosen factor
            let score = Math.pow(factor,chain.length);
            GameManager.addScore(score); 
            particleFx.score(this.$card,score); 
            // Explode  FX;
        }
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
            if (source.id == this.id){
            //    console.log("source:"+source.value);
            }
            audios.buzz(); 

        }
        
        let ignored = []
        matched.filter(x => x.iced > 0)
            .forEach(x => {
                x.deIce(); 
                ignored.push(x);
            }) // de-ice iced cards faster than cards explode (before await); ignore this card for explosions later
        await timer(Settings.explosionDelay);

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

            // 2 -> 4 -> 6 -> 8 TRUE
            // 7 -> 13 -> 28 FALSE

            // prime -> prime -> prime
            if (Num.isPrime(source.value) && Num.isPrime(this.value) && Num.isPrime(x.value)){
                eligible.push(x);
            }

            // factor -> sharedFactor -> sharedFactor
            if (Num.mapFactors(this.value).has(factor) && Num.mapFactors(x.value).has(factor)){
                eligible.push(x);
            }
            
            if (this.value === 1) {
                if (Num.isPrime(x.value) || !Num.isPrime(x.value)) {
                    eligible.push(x);
                }
            }

            // any -> wild -> any
            if (x.value == Card.Wild
                || (this.value == Card.Wild && Num.mapFactors(x.value).has(factor) )
                || (this.value == Card.Wild && Num.isPrime(source.value) && Num.isPrime(x.value)) )
            {   
               eligible.push(x);
            }   
        }    
     //  console.log("eligible neighbors of "+this.value+" are: "+eligible.map(x => x.value).toString());
        return eligible;

    }

}


