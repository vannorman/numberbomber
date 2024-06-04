var ScreenManager = {
    HideAll(){
        $('#swap').hide();
        $('#deck').hide();
        $('#energy').hide();
        $('#game').hide();
        $('#tutorialScreen2').hide();

        $('#startGame').hide();
        $('#startGameAt7').hide();
        $('#startDailyShuffle').hide();
        $('#startTutorial').hide();

        $('#selectLevel').hide();
        $('#loseScreen').hide();
        $('#settingsBackboard').hide();
        $('#nextLevel').hide();
        $('#tip').hide();
        $('#tipGraphic').hide();
        $('#dailyShuffleScoreboard').hide();
        clearTimeout(GameManager.tipGraphicShowfn)
  
    },ShowWinScreen(options){
//        var { showTip = true } = options;
        $('#winScreen').show();
        $('#tip').show();
        $('#tip').html('');
        setTimeout(function(){
            UserTips.slowType($('#tip'),UserTips.randomTip,25);
            }, 2200);
       setTimeout(function(){$('#nextLevel').show();},Settings.debug ? 1 : 3500);
 
    }, HideWinScreen(){
        $('#winScreen').fadeOut();

    }, ShowGame(){
        $('#game').show();
        $('#gameBg').show();
        $('#settingsIcon').removeClass('disabled');
        $('#deck').show();
        $('#top').show();
 
   }, ShowDailyShuffleScoreboard(){
        $('#dailyShuffleScoreboard').show();
   },
 
}
