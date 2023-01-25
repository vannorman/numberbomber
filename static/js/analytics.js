$(document).ready(function(){
    Analytics.Init();
});

Analytics = {
    sessionId : -1,
    Init (){
        this.sessionId = Date.now();
        $('html').on(Input.move,function(){
            Analytics.move(Input.currentPos);
        });
        $(document).on(Input.start, '*' ,function(e){
            let a = document.elementFromPoint(Input.currentPos.x,Input.currentPos.y);
            while (a.id == '' && a.parentNode != null){
                a = a.parentNode;
            }

            Analytics.elementOnInputDown = a;
            e.stopPropagation();
        });
        $(document).on(Input.end, '*', function(e){
            let a = document.elementFromPoint(Input.currentPos.x,Input.currentPos.y);
            while (a.id == '' && a.parentNode != null){
                a = a.parentNode;
            }
            let b = Analytics.elementOnInputDown;
            if (a.id != null && a.isEqualNode(b)){
                Analytics.click(Input.currentPos,a.id);
            }
            e.stopPropagation();
        });

    },
    playbackStartTime : 0,
    async playback(session){
        this.playbackStartTime = performance.now();
        let $simMouse = $('<div style="position:absolute">^</div>');
        $('html').append($simMouse);
        for(let i=0;i<session.length;i++){
            let x = session[i];
            let xDelta = x.time + this.playbackStartTime - performance.now();
            console.log('xdelt:'+xDelta);
            if (xDelta > 0){
                console.log('await ..');
                await timer(xDelta);
            }
            console.log('x :'+i+', x time:'+x.time);
            if (x.move != null){
                $simMouse.css('top',x.move.y).css('left',x.move.x);
            }
            if (x.click != null){
                simulate(document.getElementById(x.click),'click');  
                simulate(document.getElementById(x.click),Input.start);                
                simulate(document.getElementById(x.click),Input.end);                
            }
        };
    },
    elementOnInputDown : null,
    lastMovedTime : 0,
    moveLogInterval : 50,
    move(pos){
        if (performance.now() > this.lastMovedTime + this.moveLogInterval) {
            this.lastMovedTime = performance.now();
            this.session.push({ move : pos, time : parseFloat(performance.now().toFixed(2)) });
        }
    },
    click(pos, id){
        this.session.push({click : id, time : parseFloat(performance.now().toFixed(2)) });
        this.saveToDisk();
    },
    saveToDisk(){
        $.ajax({
            type: 'POST',
            url: "track_session/",
            
            data : { id : this.sessionId, session : JSON.stringify(this.session) },
            success: function (e) {
                console.log('saved . e:'+JSON.stringify(e)); 
            },
            error: function (e) {
                $('html').html(JSON.stringify(e));
            }
        });
    },

    session : [],
    exampleSession1 : JSON.parse(lzw_decode('[{"move":āxć1043,"yć385}ĐtimĆ:399Ė,āăąćĉċčďđēĕė"ęěć4č7ėģĄĜħ:ČĎĐĒĝĭĘĚĜ4Č2ĶĂĸĦ"ĊĻĩľĬġįŃĲ158.3ňĤĹŌĨĽīŀŒİń214.4śŊĈŞŎŠĿĔţŔ:426Ř1ūĥŭōļĪűŁœıŵ323.źĢŉżĺſŐŢĮŤĲĳ9ňclickć"startGaıłƄ447ŘƖƋŜŋžŏšŲƒŴƩ8ƈƊķƍŮƏƳƂƓŵ9ƫ.6ŻŝƱŰőƵƄ502ƬǇưşƀǋƧĜǎ81.ġƻǈǔƐƴǗć5Ƈ7.8ǒŽǠƿųǍ29ǛĵƮŬƎƲƁǮǘ345.ƭǞǓůǕƑǣ:5ĳƈǆǴƼǉȃǢƃǘƪ0ǅǪǶǊȄȐǤǥǛǿƌǟȂǡǀŴ569ȓǝȞȁƾǸǌǘ7ǼǾȕƽǷǖșȆ80ǛŪƋƘƚƜ:"4"ȅ59ȥũȲȍȡǹć603ȓƺȩǫȠǭȭɍ08ŨŇȋȟȫȵǁ613ǧȝƯɔɟȘɡ19ȻȀɨȴɪŴ62ȰɦǵȳȗȏɡǰɥɉǬȬȅ6ǻ9ǜɿɕʁȶ6ƕȱȼƙƛƝ4_2Ƀʊ5Ȥ.ɜɯȖȎȢƄ657ȧʇɩɻɳɴȊʛɹʝɌ:6Ÿ2ʙʤɱʦƄ7Č6ʆɝȪʴʞĜʷ6ǧŚʻɰɺʾć7Ŧǧǩ˄ʜɋɗ:ˉɇȨɧˎɖȅȯ5ǛˌʪɊ˗ȶ753Ǜʩɓ˖ʉǁƫ2ȓɷȌʀɠŴƫ7ǧɒ˕ʫˏ˘9ɐʳˆʭ79ĕȔˍ˷˟ǁȸ˿ʍ˝˯ɲƄ8ʷŨ˵ɸ˞˨Ŵ̎ɇǳ̊ʈ˰̍8ŷɈ̛̃̓Ĝ8̤Ũ˭ɞʽʭ8˺Ź˼ʬː̫˺.̘˦̄̔ƄȦƪ̮˸ȶȦğʺ̙ʥˇ:Ǳɴʲ̠̋ʵĜ9ˊ̩̂́ː͌Ǆʚ"Ƚʐɀ9ʕǁɭǰ̵̡͎̌͋Ȥ˛̻̅ŴɆ1Ř˥˶͊͠ćɆɇ͉ͫ̒̓ǃ2͔ͬʹʭǃǄ̴͖ȿ"9ʓ͚ͧǱʅɮ͟ͺ͑ɭǽ̧ʼ˽ːČ0ȹǨ̷ͥĜΒȇ͇͏ΐȅČͩͲˮ̚͡ĨƇʹ˜ΉΣͮŎǐǧ˔ͳΪ̓Č3͆͸ΰ͂ʭļ1ʱΡ̨ΝȶļʢΖ̢ĨʡͪƗʏ΀7΄Ƅ1Čǎ̉ΩθΑČ̴̈͹αιώɐ̀ϒ͐Ξώ́ϗηϟπλ3ǽΨϘϓϠǐʹνΏ̯Ϡ3ĔσΤĻŧɬƉψȾƝ7_3όΘŖ0ϩ϶ΫώǥʱΈϫϥǁЉǄϰ˅ϲϦʃʹϣ΢Ϭπɤɭ̟ΜДЏŲ͈ͤϙΑĞ0ʹ̑ЙЎŴɣɆʱΎГ̼ЏĳϺζЫοдШʅ˥ͿƝnextLeąlЂċŶͷřЇβ4̀˴эιǎƩОϞйЭǎ̀ϝЍјύ˚ʘϪϤўΘțǛ˃ПгљŷУѩͦџˣƈίиРљŶб˧τĻȇɚќѣѵџˢǧЌѿѪҁĠϑѝҀѥʋʅИξҋċφҏϱ҆ѥɚʱɒоɀͷшѻɭʅѨїґĻɎ˫҉҅ѯΘɎБϼ͗"ͷЀҞ1ɴҴьФКЏɴŗΛңҖċʃŧђΑʃʢΕҸЬύʋǐӇѮΗӀ4́ѳҐҿĻˡŧӍҾҪċˡӆзӔӛӖһ͞Ҋӕ1ƫɏіқҰ6ҳ˿ʷҽӥӡͩЅŨВѹϷͩϏѾѴӦǚɢәӫŷ΃ΞƸͩӤҩӏĻƸɤԈӽӳƸНӓҕԐǼƈҔвԐğӶӃΞȦˢԝπǱЅҨԏԊɬҴȜԡЏĠˢәӲԧ̀ө҄ԦѺɬ8ԀԓԙԱǱƈѢԵӹğʠӱԉѺ˫ǏȓԴӠԊՇӰҢ԰ՆȹŦ̳ԫŴ˫ͩՊԔՌǏŅԯՅϷ˫ɽԥՋՑϨԾՕƄ˫ŅˤըĜժԀԘӸΫ˫˚ȉխćմӞշ:˫˳ɑջ˫̝ѧրə̈Տ՟ճ0͌ʅѸ̶ՑѐҷӎՆļǽӟ՚֓ӻԿդՠώ͆ՙԻ֓ͷʣӈѤոλǄԺղ̓ŦƆҎրɣ̎ՄՀճŧǼ֯яǧӷ֎֜ʗն֤ҤŦɎֿ֮ӕׁԀ֖֠֜ˉʱևֳ֫Էʹ׈֪ʭ֢4ֺͭ֫ŦΔЪ֛ճŦԮ֚֗ՠ2׋Ӽםי˳Ř׍קהǐϨϻׄӡͷ̫ǛŇ]')),

    /*

    [ move : x,y , click : element,pos , move : x,y
    */
}



/* from https://stackoverflow.com/questions/6157929/how-to-simulate-a-mouse-click-using-javascript */
function simulate(element, eventName)
{
    var options = extend(defaultOptions, arguments[2] || {});
    var oEvent, eventType = null;

    for (var name in eventMatchers)
    {
        if (eventMatchers[name].test(eventName)) { eventType = name; break; }
    }

    if (!eventType)
        throw new SyntaxError('Only HTMLEvents and MouseEvents interfaces are supported');

    if (document.createEvent)
    {
        oEvent = document.createEvent(eventType);
        if (eventType == 'HTMLEvents')
        {
            oEvent.initEvent(eventName, options.bubbles, options.cancelable);
        }
        else
        {
            oEvent.initMouseEvent(eventName, options.bubbles, options.cancelable, document.defaultView,
            options.button, options.pointerX, options.pointerY, options.pointerX, options.pointerY,
            options.ctrlKey, options.altKey, options.shiftKey, options.metaKey, options.button, element);
        }
        element.dispatchEvent(oEvent);
        oEvent.stopPropagation();
    }
    else
    {
        options.clientX = options.pointerX;
        options.clientY = options.pointerY;
        var evt = document.createEventObject();
        oEvent = extend(evt, options);
        element.fireEvent('on' + eventName, oEvent);
    }
    return element;
}

function extend(destination, source) {
    for (var property in source)
      destination[property] = source[property];
    return destination;
}

var eventMatchers = {
    'HTMLEvents': /^(?:load|unload|abort|error|select|change|submit|reset|focus|blur|resize|scroll)$/,
    'MouseEvents': /^(?:click|dblclick|mouse(?:down|up|over|move|out))$/
}
var defaultOptions = {
    pointerX: 0,
    pointerY: 0,
    button: 0,
    ctrlKey: false,
    altKey: false,
    shiftKey: false,
    metaKey: false,
    bubbles: true,
    cancelable: true
}
