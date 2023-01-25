var Debug = {
    $gamestate : null,
    $debug : null,
    Init(){
        console.log("debug init");
        document.addEventListener("keydown", function(event) {
            if (Num.isNumber(parseInt(event.key))){
                GameManager.SkipToLevel(event.key);
            }
        });
        this.$debug = $('<div id="debug" style="position:fixed;top:0;left:0;font-size:0.6em;width:400px;height:100px;outline:1px solid red;background-color:#99999999;z-index:-101"></div>');
        this.$touch = $('<div class="touch" style="font-size:1.2em;position:fixed;height:120px;overflow-y:hidden;vertical-align:bottom;outline:2px solid blue;"></div>');
        
        $('html').append(this.$debug);
        this.$debug
            .append(this.$gamestate)
            .append(this.$cardVars)
            .append(this.$touch);
//        GameManager.onGameStateChanged.push(function(e){Debug.GameState(e)});

        let tl = $('#game');
        tl.on(Input.start, function(e){ Debug.Touch(e,"start")});
        tl.on("touchstart", function(e){ Debug.Touch(e,"start, inpt:"+Input.start)});
    },
    gameStateIndex : 0,
//    GameState(source){
//        Debug.$gamestate.find('.text').append('<br>'+this.gameStateIndex++ + ': '+GameManager.gameState+' from '+source)
//    },
    Touch(e, source){
      //if (Settings.debug) Debug.$touch.html(source);
    },
    Log(t,clear=false){
        if (clear) $('#debug').text(t);
        else $('#debug').append(t);
    },

}
class key {
    constructor() {
        this.press = new Promise(resolve => { window.addEventListener('keypress', resolve, {once:true}); });
    }
}


