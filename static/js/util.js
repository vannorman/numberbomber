class Num {
    static isNumber(value){
        return typeof value === 'number' && isFinite(value);
    }
    static isPrime(n){
        if (n == 1) return true;
        let facs = Num.mapFactors(n);
        if (facs.size == 1 && facs.has(n) && facs.get(n) == 1) return true;
        else return false;
    }
    static mapFactors(n) {
        if (n == 1) {
            let m = new Map();
            m.set(1,1)
            return m;
        }
        let factors = Num.getPrimeFactors(n);
        let factorsMap = new Map();
        for (var i=0; i<factors.length;i++){ 
            var num = factors[i];
             if (factorsMap.has(num)) {
                 factorsMap.set(num, factorsMap.get(num) + 1);
             } else {
                factorsMap.set(num, 1);
              }
        }
        return factorsMap;
   } 
   static getPrimeFactors(num) { 
        let factors = [];
        for (let i = 2; i <= Math.sqrt(num); i++) {
        while (num % i === 0) {
          factors.push(i);
          num /= i;
        }
      }
      if (num > 1) factors.push(num);
      return factors;
    }
    static randomRange(min, max) { // min and max included // INT only
        return Math.floor(Math.random() * (max - min + 1) + min);
    }
}

function mobileCheck() {
  let check = false;
  (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
  return check;
};

function timer(ms) { return new Promise(res => setTimeout(res, ms)); }


var Input = {
    start : "mousedown",
    end : "mouseup",
    move : "mousemove",
    interaction : "pointer-events",
    hoveringElement(el){
        let leftMin = el.offset().left;
        let leftMax = leftMin + el.outerWidth();
        let topMin = el.offset().top;
        let topMax = topMin + el.outerHeight();
//        console.log("this inputpos:"+this.currentPos.x+", "+this.currentPos.y+", el top, left, width, height:"+el.offset().top+", "+el.offset().left+', '+el.width()+', '+el.height());
        if (this.currentPos.x > leftMin && this.currentPos.x < leftMax && this.currentPos.y > topMin && this.currentPos.y < topMax){
            return true;
        } else {
            return false;
        } 
    }, 
    Init(){

        let mobile =mobileCheck();  
        if (mobile){
            this.start = "touchstart";
            this.end = "touchend";
            this.move = "touchmove";
            this.interaction = "touch-action";
        } else {

        }
        if (!mobile){
            $(document).mousemove(function(event) {
                Input.currentPos.x = event.pageX;
                Input.currentPos.y = event.pageY;
            });
        } else {
            $('#game').on('touchstart', function(e){
                Input.currentPos.x = event.pageX;
                Input.currentPos.y = event.pageY;
            });
            $('#game').on('touchmove', function(e){
                Input.currentPos.x = e.touches[0].pageX;
                Input.currentPos.y = e.touches[0].pageY;
            });



            if (Input.scrollLevelSkip){
                $('#main').on('touchstart', function(e){
                    Debug.Touch(e,"start :"+event.pageY);
                    Input.touchStart.x = event.pageX;
                    Input.touchStart.y = event.pageY;
                    Input.globalPos.x = event.pageX;
                    Input.globalPos.y = event.pageY;
                });
                $('#main').on('touchmove', function(e){
                    e.preventDefault();
                    Input.globalPos.x = e.touches[0].pageX;
                    Input.globalPos.y = e.touches[0].pageY;
                    if (Input.scrollLevelSkip){
                        let d = Input.touchStart.y - Input.globalPos.y;
                        let flipped  = (d * Input.prevD) > 0;
                        if (flipped) Input.touchStart.y = e.touches[0].pageY;
                        Input.prevD = d; 
                        Debug.Touch(e,"cur: "+Input.globalPos.y+", d:"+d);
                        let top = parseInt($('.levelBtn').css('top'));
                        $('.levelBtn').css('top',top-d*5);
                    }
                });
             }

        }
    },
    prevD : 0,
    touchStart : {
        x : 0,
        y : 0
    },
    globalPos : {
        x : 0,
        y : 0
    },
    currentPos : {
        x : 0,
        y : 0
    },
    scrollLevelSkip : false,
    enableScrollForLevelSkip(){
       this.scrollLevelSkip = true; 
    }
}

$.fn.extend({
   qcss: function(css) {
      return $(this).queue(function(next) {
         $(this).css(css);
         next();
      });
   }
});

// LZW-compress a string
function lzw_encode(s) {
    var dict = {};
    var data = (s + "").split("");
    var out = [];
    var currChar;
    var phrase = data[0];
    var code = 256;
    for (var i=1; i<data.length; i++) {
        currChar=data[i];
        if (dict[phrase + currChar] != null) {
            phrase += currChar;
        }
        else {
            out.push(phrase.length > 1 ? dict[phrase] : phrase.charCodeAt(0));
            dict[phrase + currChar] = code;
            code++;
            phrase=currChar;
        }
    }
    out.push(phrase.length > 1 ? dict[phrase] : phrase.charCodeAt(0));
    for (var i=0; i<out.length; i++) {
        out[i] = String.fromCharCode(out[i]);
    }
    return out.join("");
}

// Decompress an LZW-encoded string
function lzw_decode(s) {
    var dict = {};
    var data = (s + "").split("");
    var currChar = data[0];
    var oldPhrase = currChar;
    var out = [currChar];
    var code = 256;
    var phrase;
    for (var i=1; i<data.length; i++) {
        var currCode = data[i].charCodeAt(0);
        if (currCode < 256) {
            phrase = data[i];
        }
        else {
           phrase = dict[currCode] ? dict[currCode] : (oldPhrase + currChar);
        }
        out.push(phrase);
        currChar = phrase.charAt(0);
        dict[code] = oldPhrase + currChar;
        code++;
        oldPhrase = phrase;
    }
    return out.join("");
}


var audios = {
    soundVolume : 100,
    musicVolume : 100,
    sources : {
        clinks: ['fall4.wav',],
        errors: ['minus.wav'],
        swaps : ['swap.wav'],
        buzz : [...Array(16).keys()].filter(x => x != 0).map(x => "notes/" + x + ".wav"),
        showFactors : ['show_factors.wav'],
        unShowFactors : ['unshow_factors.wav'],
        electric : ['zappy_thang.wav'],
        win : ['win.wav'],
        doot : ['doot2.wav'],
        click : ['click.wav'],
        iceCrack : ['iceCrack.wav','iceCrack2.wav'],
        music : ['numbersparkv2.mp3'],
    },

    playMusic(clip){
        if (!this.initialized) return;    
        sounds["/static/sfx/"+clip].loop = true;
        setTimeout(function(){sounds["/static/sfx/"+clip].play();},10);
    },
    clipTimeout : 0,
    clipTimer : null,
    play (clip,vol=1){
        if (!this.initialized) return;    
        if (clip == "fall4.wav"){
            if (this.clipTimeout <= 0){
                this.clipTimeout = 400;
                sounds["/static/sfx/"+clip].volume = vol * this.soundVolume / 100;
                sounds["/static/sfx/"+clip].play();
            }
        } else {
            sounds["/static/sfx/"+clip].volume = vol * this.soundVolume / 100;
            sounds["/static/sfx/"+clip].play();
        }
    },
    buzzTimerFn : null,
    buzzTimer : 0,
    buzzStack : 0,
    buzz(){
        this.buzzStack ++;
        let thisBuzz = audios.sources.buzz[this.buzzStack % this.sources.buzz.length];
        audios.play(thisBuzz,3);
    },
    playAny(clips=c,vol=1){ 
        if (this.initialized) {
            this.play(clips[Num.randomRange(0,clips.length-1)]),vol
            }
        },
    iceCrack(vol=1){ this.playAny(this.sources.iceCrack,vol); },
    click(vol=1){ this.playAny(this.sources.click,vol); },
    showFactors(vol=1){         this.play(this.sources.showFactors[Num.randomRange(0,this.sources.showFactors.length-1)],vol);    },
    unShowFactors(vol=1){         this.play(this.sources.unShowFactors[Num.randomRange(0,this.sources.unShowFactors.length-1)],vol);    },
    clink(vol=1){         setTimeout(function(){ audios.playAny(audios.sources.clinks,vol);  }, Num.randomRange(0,100))  },
    swap(vol=1){        this.play(this.sources.swaps[Num.randomRange(0,this.sources.swaps.length-1)],vol);      },
    error(vol=1){       this.play(this.sources.errors[Num.randomRange(0,this.sources.errors.length-1)],vol);    },
    electric(vol=0.4){        this.play(this.sources.electric[Num.randomRange(0,this.sources.electric.length-1)],vol);      },

    initialized : false,
    PreInit(){
        $('html').bind(Input.start,function(e){
            if (!audios.initialized) {
                audios.init();
                $('html').unbind(Input.start);
            }
        });
    },
    clinkOnMouseUp : false,
    init (){
        if (this.initialized) {    return; }
        this.clipTimer = setInterval(function(){ audios.clipTimeout -= 50 },50)
        let flatSoundsList = Object.keys(audios.sources).map(function(key) { return audios.sources[key]}).flat().map( x => "/static/sfx/"+x);
        sounds.load(flatSoundsList);
        // optional callback: sounds.whenLoaded = audios.setup;
        
        sounds.whenLoaded = function(){ 
            audios.initialized = true;
            sounds["/static/sfx/"+audios.sources.music[0]].loop = true;
            sounds["/static/sfx/"+audios.sources.music[0]].volume = audios.musicVolume / 100;
            setTimeout(function(){ sounds["/static/sfx/"+audios.sources.music[0]].play();},1);

        }

        $('#soundVolume').on('input', function(){
            audios.soundVolume = parseInt($(this).val());
            audios.clinkOnMouseUp = true;
        });
        $('html').on(Input.end,function(e){
            if (audios.clinkOnMouseUp){
                audios.play(audios.sources.doot[0]);
                audios.clinkOnMouseUp = false;
            }
        });
        
        $('#musicVolume').on('input', function(){
            audios.musicVolume = parseInt($(this).val());
            sounds["/static/sfx/"+audios.sources.music[0]].volume = audios.musicVolume / 100;

        });
    },
    setSoundVolume(v){
        $('#soundVolume').val(v);
        this.soundVolume = v;
    },
    setMusicVolume(v){
        this.musicVolume = v;
        $('#musicVolume').val(v);
    },
}

function getCenter($div){
    return {left:$div.offset().left + $div.width()/2, top:$div.offset().top + $div.height()/2};
}

UserTips = {
    tips : [
            "Iced numbers melt when a compatible neighbor explodes.",
            "Hold down your finger or mouse on a factor to preview it.",
            "Use fewer swaps to get a higher score!",
            "Use fewer moves to maximize your score!",
            "Iced numbers have to be melted before they will explode.",
            "Only numbers that match your chosen factor will explode.",
            "Prime numbers explode other prime numbers.",
            "Rocks can't be exploded; you need to work around them.",
            "You can use the SWAP button (bottom right) to swap two tiles.",
            ],
    getTipForLevel(levelIndex){
        //console.log('getting tip:'+levelIndex);
        let tip =  GameManager.levels[levelIndex].tip;
        let tipText = tip !== undefined ? tip : this.randomTip;
        return tipText; 
    },
    getTipGraphicForLevel(levelIndex){
        return GameManager.levels[levelIndex].tipGraphic;
    },
    get randomTip(){
       return this.tips[Num.randomRange(0,this.tips.length-1)];
    },
    activeTimeouts : [],
    Stop(){
       this.activeTimeouts.forEach(x => clearTimeout(x)); 
       this.activeTimeouts = [];
    },
    slowType($el,text, delay = 60, spaceDelay = 60){
        $el.html('');
        this.Stop();
        delay *= (Math.random()/2 + 0.75);
        let space = 0;
        let chars = 0;
        let maxChars = 25;
        for (let i=0;i<text.length;i++){
            chars++;
            let br = '';
            if (text[i] === " "){
                
                space += spaceDelay;

                // Look ahead to next word. If word will make chars (this line) go over maxChars (width of div), add a br.
                let remaining = text.slice(i,text.length);
                if (remaining.split(' ').length > 1){
                    let thisWordLen = remaining.split(' ')[0].length;
                    let nextWordLen = remaining.split(' ')[1].length;
                    let lineLength = chars + thisWordLen + 1 + nextWordLen + 1;
                    if (lineLength > maxChars){
                        br = '<br>';
                        chars = 0;
                    }
                }
            }

            this.activeTimeouts.push(setTimeout(function(){
                $el.append(text[i] + br);
            }, i * delay + space));
        }
    },

}

const Tutorial = {
    Start(){
        $('#tutorialScreen').show();
        this.showScreen(this.index);
    },
    showScreen(i){
        $('#tutList').html(Tutorial.screen[Tutorial.index].tip);
        $('#tutVid').trigger('pause');
        $('#tutSrc').attr('src',Tutorial.screen[Tutorial.index].vid);
        $('#tutVid').trigger('load'); 
        $('#tutVid').trigger('play');
        $('#nextTutorial').text('OK ('+(this.index+1)+'/4)');
    },
    index : 0,
    screen : [{
        tip : "<li> Click a tile to show factors. "
                +"<li>Click a factor to explode it. ",
        vid : "/static/mov/tut_exp.mp4"
    },{
        tip : "<li> Nearby tiles can also explode..."
                +"<li> IF they share a factor..."
                +"<li> Or, if both tiles are prime. ",
        vid : "/static/mov/tut_chain.mp4"
     },{
        tip : "<li> Iced numbers must be melted."
                +"<li> Melt ice by exploding nearby numbers that match a factor.",
        vid : "/static/mov/tut_ice.mp4"
     },{
        tip : "<li> If a tile explodes alone, you lose an energy."
                +"<li> You lose if energy runs out.",
        vid : "/static/mov/tut_lose.mp4"
    }],Init(){
         $('#startTutorial').on('click',function(){
            Tutorial.Start();
            $('#startTutorial').hide();
         });
         $('#nextTutorial').on('click',function(){
            Tutorial.index++;
            if (Tutorial.index >= Tutorial.screen.length){
                $('#tutorialScreen').hide();
                $('#startGame').show();

            } else {
                Tutorial.showScreen(Tutorial.index);
            }
         });


    }
}
const Score  = {
    blankStar : '&#9734;',
    filledStar : '&#9733;',
    CalculateStars(){
        let livesScore = GameManager.lives / GameManager.currentLevel.lives;
        let movesScore = GameManager.currentLevel.minimumMoves / Math.min(Infinity,GameManager.movesThisLevel);
        let totalScore = Math.floor(3 * livesScore * movesScore);
        // console.log("lives:"+livesScore+", moves:"+movesScore+", tota;"+totalScore);
        return totalScore;

    },
    DisplayStars () {
        score = Score.CalculateStars();
        let starWidth = 80;
        let showNextAfter = 1000;
        let delay = 400;
        if (Settings.debug) delay = 1;
        $('#win2').html(Score.blankStar+Score.blankStar+Score.blankStar);
        let wTop = $('#win2').offset().top + $('#win2').height()/2;
        let wWidth = $(window).width()/2;
        
        if (score >= 1) {
            setTimeout(function(){
                let pos = {top: wTop, left: wWidth - starWidth}; 
                particleFx.hurt(pos,2200,1,120);
                audios.buzz();
               audios.play(audios.sources.doot[0]);
                $('#win2').html(Score.filledStar+Score.blankStar+Score.blankStar);
            },delay);
            showNextAfter += delay;
        } 
        if (score >= 2) {
            setTimeout(function(){
                let pos = {top: wTop, left: wWidth}; 
                particleFx.hurt(pos,2200,1,120);
                audios.buzz();
                audios.play(audios.sources.doot[0]);
                $('#win2').html(Score.filledStar+Score.filledStar+Score.blankStar);
            },delay*2);
            showNextAfter += delay;
        } 
        if (score >= 3) {
            setTimeout(function(){
                let pos = {top: wTop, left: wWidth + starWidth}; 
                particleFx.hurt(pos,2200,1,120);
                audios.buzz();
                audios.play(audios.sources.doot[0]);
                $('#win2').html(Score.filledStar+Score.filledStar+Score.filledStar);
            },delay*3);
            showNextAfter += delay;
        } 
        return showNextAfter;
    }
}

Array.prototype.shuffle = function() {
    return this.map(value => ({ value, sort: Math.random() }))
                .sort((a, b) => a.sort - b.sort)
                .map(({ value }) => value)
 }

function deterministicShuffle(seed, nums) {
    // Define a custom pseudo-random number generator (PRNG)
    function customRandom() {
        var x = Math.sin(seed++) * 10000;
        return x - Math.floor(x);
    }

    // Fisher-Yates shuffle algorithm with custom PRNG
    for (var i = nums.length - 1; i > 0; i--) {
        var j = Math.floor(customRandom() * (i + 1));
        var temp = nums[i];
        nums[i] = nums[j];
        nums[j] = temp;
    }

    return nums;
}

//function getCookie(name) {
//    let cookieValue = null;
//    if (document.cookie && document.cookie !== '') {
//        const cookies = document.cookie.split(';');
//        for (let i = 0; i < cookies.length; i++) {
//            const cookie = cookies[i].trim();
//            // Does this cookie string begin with the name we want?
//            if (cookie.substring(0, name.length + 1) === (name + '=')) {
//                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
//                break;
//            }
//        }
//    }
//    return cookieValue;
//}
