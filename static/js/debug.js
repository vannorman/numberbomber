var Debug = {
    $gamestate : null,
    $debug : null,
    control : false,
    Init(){
        document.addEventListener("keyup", function(event) {
            if (event.key === "Control"){
                Debug.control = false;
            }

        });
        document.addEventListener("keydown", function(event) {
            if (Debug.control && Num.isNumber(parseInt(event.key))){
                GameManager.SkipToLevel(event.key);
            } else if (Debug.control){
                let lev = event.keyCode - 55;
                GameManager.SkipToLevel(lev);

            } else {
                console.log('keycode:'+event.keyCode);
            }

            if (event.key === "Control"){
                Debug.control = true;
            }
        });
        console.log('debug?');
        this.$debug = $('<div id="debug" style="position:fixed;top:0;left:0;font-size:0.6em;width:400px;height:100px;outline:1px solid red;background-color:#99999999;z-index:9999; pointer-events:none;"></div>');
        this.$touch = $('<div class="touch" style="font-size:1.2em;position:fixed;height:120px;overflow-y:hidden;vertical-align:bottom;outline:2px solid blue;"></div>');
        $('html').append(this.$debug);
        console.log('debug: '+$('#debug').offset().top);        
        this.$debug
            .append(this.$gamestate)
            .append(this.$cardVars)
            .append(this.$touch);

        let tl = $('html');        
//        tl.on(Input.start, function(e){ Debug.Touch(e,"start")});
//       tl.on("touchmove", function(e){ 
//         Debug.Touch(e,"move, y:"+Input.globalPos.y)
//        });
    },
    gameStateIndex : 0,
//    GameState(source){
//        Debug.$gamestate.find('.text').append('<br>'+this.gameStateIndex++ + ': '+GameManager.gameState+' from '+source)
//    },
    Touch(e, source){
      Debug.$touch.html(source);
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


