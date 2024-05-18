var GameBoard = {
    GetDailyShuffle(){

        // convert today's date into an integer that only chages with new day
        var todayInteger = new Date().toISOString().slice(0,10).replace(/-/g,"");
        var deck = Array.from({length: 64}, (_, i) => i + 1);
        

        return deterministicShuffle(todayInteger, deck);
    },
    ReverseDeckOrder(deck){
        let copy = [...deck]
        // [ 1, 2, 3, 4 ] => [3, 4, 1, 2]
        let reversed = [];
        let numRows = Math.ceil(deck.length / GameBoard.cols);

        // Array may have "missing cols" if len % cols != 0, 
        // so "pad" the array so the math works
    
        let pad = GameBoard.cols - copy.length % GameBoard.cols;

        if (pad != 0){
            for (let i=0;i<pad;i++){

                copy.unshift(-1);
            }
        }

        for(let i=0;i<numRows;i++){
           let slice = [...copy].splice(copy.length - GameBoard.cols * (i + 1), GameBoard.cols);
           reversed = reversed.concat(slice);
        }

        // Now remove pad (if any)
        reversed = reversed.filter(x => x != -1);
        return reversed;
    },
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
            let delay = 600;
            if (Settings.debug) delay = 1;
            setTimeout(function(){ 
                GameManager.setGameState(GameManager.GameState.Menu,"exp finished & cardlen 0");
                GameBoard.ClearBoard();
                GameManager.WinLevel();
            },delay);
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
        // later: Store current (mutable) deck in GameBoard, not GameManager
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

    onBoardResized() {
        this.cards.forEach(x => {
            x.removeElement();
            x.instantiate();
        });
    },


    async refreshBoard(){
        let cardsToDrop = [];

        // drop first
        GameBoard.cards.filter(x => x.getEmptySpacesBelowMe() > 0).forEach(x => {
            //cardsToDrop.push({ card:x, rows:x.getEmptySpacesBelowMe()});
            GameBoard.cardsToMove.push(x);
            x.row += x.getEmptySpacesBelowMe();
        });

        // then move right
        // Go through each column. If a column is totally empty, AND there were cards both to the left AND right of that column, 
        //  then slide cards to the LEFT of the empty column towards the RIGHT.
        for (let i=0; i<GameBoard.cols;i++){
            if (GameBoard.cards.filter(x => x.col == i).length == 0 && GameBoard.cards.filter(x => x.col < i).length != 0 && GameBoard.cards.filter(x => x.col > i).length > 0){
                GameBoard.cards.filter(x => x.col < i).forEach(x => {
                    x.col ++;
                    GameBoard.cardsToMove.push(x);
                });
            }
        }

        falling = [];
        this.cardsToMove.forEach(x => {
            falling.push(x.fallToRowCol(x.row,x.col)); // (targetTop,x.left());
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
        // this.cards.forEach(x => x.$card.stop().css('opacity',1));


//        this.cards.forEach(x => { x.close(fade); });
    }
}


