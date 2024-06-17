var Settings = {
    enableSkip : true,
    get explosionDelay(){
        return this.debug ? 100 : 290;
    },
    debug : false,
    debugSfx : false,
    _mobile : null,
    useGeneratedLevels : false,
    controlHeld : false,
    get mobile(){
        if (this._mobile == null) this._mobile = mobileCheck();
        return this._mobile;
    },
    RandomDeal : false,
    Init () {
        this.LoadSettings();
        document.addEventListener("keydown", function(event) {
            if (event.key == "Control") {
                Settings.controlHeld = true;
            }
            if (event.key == "d") {
                if (Settings.controlHeld){
                    Settings.debug = !Settings.debug;
                    console.log("DEBUG:"+Settings.debug);
                }
            } 
        });
        document.addEventListener("keyup", function(event) {
            if (event.key == "Control") {
                Settings.controlHeld = false;
            }
        });

    },
    LoadSettings(){
        if (false && window.location.href == 'http://127.0.0.1:8000/'){
            audios.setMusicVolume(0);
            audios.setSoundVolume(0);
            $('#startGame').show();
            $('#startTutorial').hide();
            // skip tutorial automatically. 


        }
        else {
            $.ajax({
                type: 'POST',
                url: "get_settings/",
                headers: {
                    "X-CSRFToken" : csrf
                },
                success: function (e) {
                    console.log('settings load returned:'); 
                    let data = JSON.parse(e.data);
                    console.log(data)
                    if (Num.isNumber(data.musicVolume)){
                        audios.setMusicVolume(data.musicVolume);
                    }
                    if (Num.isNumber(data.soundVolume)){
                        audios.setSoundVolume(data.soundVolume);

                    }

                    if (Settings.enableSkip || (Num.isNumber(data.levelReached) && data.levelReached >= 5 && GameManager.gameState == GameManager.GameState.Menu)){
                        $('#startGame').show();
                        $('#startTutorial').hide();
                        // skip tutorial automatically. 
                    }
                    if (typeof data.highScores !== 'undefined') { GameManager.highScores = data.highScores };
                    GameManager.setMaxLevelReached(data.levelReached);
                    GameManager.populateSkipLevelsList();
    //                Input.enableScrollForLevelSkip();
                    GameManager.setMaxLevelReached(data.levelReached);
                    GameManager.populateSkipLevelsList();
    //                Input.enableScrollForLevelSkip();
                },
                error: function (e) {
                    console.log("Load settings error:"+JSON.stringify(e).substr(0,100));
                }
            });
            $('html').on(Input.end, function(){
                if (Menu.settingsShown){
                    Settings.SaveSettings();
                }
            });

        }
    },
    SaveSettings(){
        data = {
           settings : JSON.stringify({
               soundVolume : audios.soundVolume,
               musicVolume : audios.musicVolume,
               levelReached : GameManager.maxLevelReached,
            })
        }
        console.log("CSRF:"+csrf);
        $.ajax({
            type: 'POST',
            url: "save_settings/",
            headers: {
                'csrfmiddlewaretoken' : csrf,
                "X-CSRFToken" : csrf,
            },
            credentials: 'include',
            data : data,
            success: function (e) {
//                console.log('settings save success:'+JSON.stringify(e).trim(0,200));
                
            },
            error: function (e) {
                console.log("setting save err: "+ JSON.stringify(e).trim(0,200).substr(0,100));
//                $('html').html(JSON.stringify(e));
            }
        });
    
    },
    
}


