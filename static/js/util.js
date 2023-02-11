class Num {
    static isNumber(value){
        return typeof value === 'number' && isFinite(value);
    }
    static isPrime(n){
        let facs = Num.mapFactors(n);
        if (facs.size == 1 && facs.has(n) && facs.get(n) == 1) return true;
        else return false;
    }
    static mapFactors(n) {
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
    static randomRange(min, max) { // min and max included 
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

        console.log("input init");  
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

        }
    },
    currentPos : {
        x : 0,
        y : 0

    },
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
        buzz : ['buzz_fs.wav','buzz_gs.wav','buzz_a.wav','buzz_b.wav','buzz_cs.wav','buzz_d.wav'],
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
        sounds["/static/sfx/"+clip].loop = true;
        setTimeout(function(){sounds["/static/sfx/"+clip].play();},10);
    },

    play (clip,vol=1){
        sounds["/static/sfx/"+clip].volume = vol * this.soundVolume / 100;
        sounds["/static/sfx/"+clip].play();
    },
    buzzTimerFn : null,
    buzzTimer : 0,
    buzzStack : 0,
    buzz(){
        this.buzzStack ++;
        audios.play(audios.sources.buzz[this.buzzStack % 6]);
    },
    playAny(clips=c,vol=1){ this.play(clips[Num.randomRange(0,clips.length-1)]),vol},
    iceCrack(vol=1){ this.playAny(this.sources.iceCrack,vol); },
    click(vol=1){ this.playAny(this.sources.click,vol); },
    showFactors(vol=1){         this.play(this.sources.showFactors[Num.randomRange(0,this.sources.showFactors.length-1)],vol);    },
    unShowFactors(vol=1){         this.play(this.sources.unShowFactors[Num.randomRange(0,this.sources.unShowFactors.length-1)],vol);    },
    clink(vol=1){         setTimeout(function(){ audios.playAny(audios.sources.clinks,vol);  }, Num.randomRange(0,100))  },
    swap(vol=1){        this.play(this.sources.swaps[Num.randomRange(0,this.sources.swaps.length-1)],vol);      },
    error(vol=1){       this.play(this.sources.errors[Num.randomRange(0,this.sources.errors.length-1)],vol);    },
    electric(vol=1){        this.play(this.sources.electric[Num.randomRange(0,this.sources.electric.length-1)],vol);      },

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
        this.initialized = true;
        let flatSoundsList = Object.keys(audios.sources).map(function(key) { return audios.sources[key]}).flat().map( x => "/static/sfx/"+x);
        sounds.load(flatSoundsList);
        // optional callback: sounds.whenLoaded = audios.setup;
        
        sounds.whenLoaded = function(){ 

            sounds["/static/sfx/"+audios.sources.music[0]].volume = audios.musicVolume / 100;
            sounds["/static/sfx/"+audios.sources.music[0]].play();

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
