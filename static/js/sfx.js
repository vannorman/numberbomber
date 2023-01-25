const SFX = {
    frequency : 1046.5,
    pitch : 1200,
    reverse : false,
    randomPitch : 0,
    attack : 0.5,
    decay : 0.5,
    dissonance : 0,
    pan : 0,
    delay : 0.2,
    feedback  : 0.2,
    filter : 2000,
    reverbDuration : 0.5,
    reverbDelay : 1000,
    reverbReverse : false,
    Wf  : [
        "sine", 
        "sawtooth", 
        "square", 
        "triangle", 
    ],
    wfi : 0,
    get waveform(){
        return this.Wf[this.wfi];
    },

    Init(){
        this.$debug = $('<div id="debug" style="position:fixed;top:0;left:0;font-size:1.6em;width:400px;height:600px;outline:1px solid red;background-color:#99999999;z-index:101"></div>');
        $('html').append(this.$debug);
        let $this = this;
        $(window).on("keydown", function(event) {
            let k = event.key;
            switch(k){
                case 'w': $this.wfi += 1; if ($this.wfi < 0) $this.wfi = $this.Wf.length-1; $this.wfi %= $this.Wf.length;  break;
                
                case 'A' : $this.attack += 0.05; break;
                case 'a':  $this.attack -= 0.05; break;
                
                case 'Z' : $this.decay += 0.05; break;
                case 'z':  $this.decay -= 0.05; break;
                 
                case '`': $this.frequency += 100; break;
                case '~':  $this.frequency   -= 100; break;
                
                case '1': $this.pitch += 25; break;
                case '!':  $this.pitch  -= 25; break;
    
                case '3': $this.dissonance += 0.5; break;
                case '#':  $this.dissonance -= 0.5; break;
                
                case 'P': $this.pan += .2; break;
                case 'p':  $this.pan -= .2; break;
                
                case 'D': $this.delay += .02; break;
                case 'd':  $this.delay -= .02; break;
                
                case 'F': $this.feedback += .05; break;
                case 'f':  $this.feedback -= .05; break;
                
                case 'G' : $this.filter += 200; break;
                case 'g':  $this.filter -= 200; break;
               
                case 'R' : $this.reverbDelay += 200; break;
                case 'r':  $this.reverbDelay -= 200; break;
                
                case 'T' : $this.reverbDuration += 200; break;
                case 't':  $this.reverbDuration -= 200; break;
                
                case 'Y' : $this.reverbReverse = true; break;
                case 'y' : $this.reverbReverse = false; break;
                
                case 'U' : $this.reverse = true; break;
                case 'u' : $this.reverse = false; break;

                case 'J' : $this.setJumpSound(); break;
                case 'K' : $this.setShootSound(); break;
                case 'L' : $this.setExplosionSound(); break;
            }
            $this.play();
            $this.$debug.html('hold SHIFT to reverse'
                        +'<br>~/`: freq: '+$this.frequency
                        +'<br>1/!: pitch: '+$this.pitch
                        +'<br>3/#: dis: '+$this.dissonance
                        +'<br>u/U: reverse: '+$this.reverse
                        +'<br>w: waveform: '+$this.waveform
                        +'<br>P: pan: '+$this.pan
                        +'<br>d: delay / f: feedbk / g: filt: '
                        +'<br>'+$this.delay.toFixed(2)+' / '+$this.feedback.toFixed(2)+' / '+$this.filter
                        +'<br>r: revrb del / t: revrb dur / y: invert: '
                        +'<br>'+$this.reverbDelay.toFixed(2)+' / '+$this.reverbDuration.toFixed(2)+' / '+$this.reverbReverse
                        +'<br>a: attack: '+$this.attack.toFixed(2)
                        +'<br>z: decay : '+$this.decay.toFixed(2)
                        +'<br>'
                        +'<br> Press to set:'
                        +'<br>J : jump sound'
                        +'<br>K : shoot sound'
                        +'<br>L : explode sound'

                        );
        });    
        this.$debug.html('press any key to start');
    },

    play() {
      soundEffect(
        this.frequency,           //frequency
        this.attack,                //attack
        this.decay,              //decay
        this.waveform,       //waveform
        1,                //Volume
        this.pan,             //pan
        0,                //wait before playing
        this.pitch,             //pitch bend amount
        this.reverse,            //reverse bend
        0,                //random pitch range
        this.dissonance,               //dissonance
        [this.delay, this.feedback, this.filter], //echo array: [delay, feedback, filter]
        undefined
      );
    },
    setJumpSound(){
        this.frequency = 523.25;
        this.attack = 0.05;
        this.decay = 0.2;
        this.wfi = 0;
        //3,            //volume
        this.pan = 0.8;
        // 0,            //wait before playing
        this.pitch = 200; 
        this.reverse = true;
        this.randomPitch; 
        this.dissonance = 0,            //dissonance
        this.delay = 0;
        this.feedback = 0;
        this.filter = 0;
    },
    setShootSound(){
        this.frequency = 1046;
        this.attack=0;
        this.decay = 0.3;
        this.wfi = 1; // sawtooth
        //1,                //Volume
        this.pan = -0.8;
        //0,                //wait before playing
        this.pitch = 1200;
        this.reverse = false;
        // 0,                //random pitch range
        this.dissonance = 0.25;               //dissonance
        this.delay = 0.2;
        this.feedback = 0.2;
        this.filter = 2000;
        // undefined         //reverb array: [duration, decay, reverse?]
    },
    setExplosionSound(){
        this.frequency = 16;
        this.attack = 0;
        this.decay = 1;
        this.wfi = 1; // sawtooth
        //1,                //Volume
        this.pan = 0;
        //0,                //wait before playing
        this.pitch = 0;
        this.reverse = false;
        // 0,                //random pitch range
        this.dissonance = 50;               //dissonance
        this.delay = 0;
        this.feedback = 0;
        this.filter = 0;
    },

}
/*
function bonusSound() {
  //D
  soundEffect(587.33, 0, 0.2, "square", 1, 0, 0);
  //A
  soundEffect(880, 0, 0.2, "square", 1, 0, 0.1);
  //High D
  soundEffect(1174.66, 0, 0.3, "square", 1, 0, 0.2);
}
*/

/* electric saw sound
1: freq: 746.5<br>1: pitch: 100<br>3: dis: 5<br>u/U: reverse: false<br>w: waveform: square<br>P: pan: 0<br>d: delay / f: feedbk / g: filt: <br>0.00 / 0.10 / 2400<br>r: revrb del / t: revrb dur / y: invert: <br>200.00 / 1000.50 / true<br>a: attack: 0.30<br>z: decay : 0.15<br><br> Press to set:<br>J : jump sound<br>K : shoot sound<br>L : explode sound</div>
*/
