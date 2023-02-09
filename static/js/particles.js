var particleFx = {
    dt : 50,
    textures : {
       fuzzk : 'url(/static/img/fuzzk.png)',
    },
    activeParticles : {},
    createParticle(
        texture = particleFx.textures.fuzzk,
        startSize = {min:10,max:25},
        sizeGrowthFactor = 1,
        sizeFlicker = {min:10,max:25},
        sizeFlickerInterval = {min:100,max:500}, // ms
        startPos = {left:0,top:0},
        startVelocity  = {left:0,top:0}, 
        velocityFlicker = {left:0,top:0},
        velocityFlickerInterval = 250, // ms
        duration = {min:2,max:2}, 
        startOpacity = {min:0.5,max:1},
        opacityFlicker = {min:0.5,max:1},
        opacityFlickerInterval = {min:100,max:250}, // ms 
    ){
        let id = crypto.randomUUID();
        let $el = $('<div class="particleFx" id='+id+'></div>');
        $('html').append($el);
        $el.css('background-image',texture)
            .css('width',Num.randomRange(startSize.min,startSize.max))
            .css('height',Num.randomRange(startSize.min,startSize.max))
            .css('opacity',Num.randomRange(startOpacity.min,startOpacity.max))
            .css('left',startPos.left)
            .css('top',startPos.top)

        particleFx.activeParticles[id] = {
            update : null,
            $el : $el,
            startSize : startSize,
            sizeGrowthFactor : sizeGrowthFactor,
            sizeFlicker : sizeFlicker,
            sizeFlickerTimer : 0,
            sizeFlickerInterval : sizeFlickerInterval,
            velocityFlicker : velocityFlicker,
            velocityFlickerTimer : 0,
            velocityFlickerInterval : velocityFlickerInterval,

            opacityFlicker : opacityFlicker,
            opacityFlickerTimer : 0,

            update : setInterval(function(){
                let x = particleFx.activeParticles[id];
                let dt = particleFx.dt;
                x.sizeFlickerTimer -= dt;
                instantSize = x.startSize;
                if (x.sizeFlickerTimer < 0){
                    x.sizeFlickerTimer = Num.randomRange(x.sizeFlickerInterval.min,x.sizeFlickerInterval.max);
                    x.sizeFlicker.min *= x.sizeGrowthFactor
                    instantSize = Num.randomRange(x.sizeFlicker.min,x.sizeFlicker.max);
                    x.$el.css('width',instantSize) 
                    x.$el.css('height',instantSize) 
                }
                x.opacityFlickerTimer -= dt;
                x.velocityFlickerTimer -= dt;

                // x.$el.animate( opacity : Num.randomRange(startOpacity.min,startOpacity.max), x.opacityFlickerInterval)

                let offset = { left: instantSize/2, top: instantSize/2}
                x.$el.css('left',startPos.left - offset.left)
                x.$el.css('top',startPos.top - offset.top)

                
            },particleFx.dt),
        };

        let lifeTime = Num.randomRange(duration.min,duration.max);
        console.log(id+' will die after '+lifeTime);
        setTimeout(function(){
            particleFx.endOfLife(id);
        },lifeTime * 1000);
    },
    endOfLife(id){
        console.log('end:'+id)
        let x = this.activeParticles[id];
        x.$el.remove();
        clearInterval(x.update);
        delete x;
    },
    fuzzk(startPos,destPos){
        // make a shiny flickering fuzzy electric ball that dances like a fairy
       let spark = SparkFX.makeSpark(
                    {top:startPos.top-GameBoard.getDim()/6,left:startPos.left-GameBoard.getDim()/6},
                     {top:destPos.top-GameBoard.getDim()/6,left:destPos.left-GameBoard.getDim()/6},
                750,0.4);
                clearInterval(spark.animation);
                spark.$el
                    .css('background-image','url(/static/img/spark.png')
                    .css('width','25')
                    .css('height','25')
                    .css('opacity','1')
    },
    hurt(pos,duration = 3000,scale=1,growth=160){
        let $hurt = $('<div class="hurt"></div>');
        $('html').append($hurt); 
        $hurt.css('position','absolute').css('top',pos.top).css('left',pos.left);
        $hurt.css('transform','scale('+scale+')');
        let maxSize = growth;
        let origSize = parseInt($hurt.css('width'));
        let finalPos = { top : pos.top - (maxSize - origSize)/2, left: pos.left - (maxSize - origSize)/2 } 
        console.log('final:'+JSON.stringify(finalPos));
        $hurt.animate({
            opacity:0,
            width:maxSize,
            height:maxSize,
            top:finalPos.top,
            left:finalPos.left
            },duration, function(){$hurt.remove();});

         
    },
    explode (el,slices=3,duration=500,distToMove=50){
        let startPos = { left : el.offset().left, top : el.offset().top};
        let w = h = el.width()/slices;
        for(var i=0;i<slices;i++){
            for (var j=0;j<slices;j++){
                let pos = { top: startPos.top + i * w, left : startPos.left + j * h};
                let distToMove = 50;
                let destPos = { top: startPos.top + i * w + (i-1)*distToMove, left : startPos.left + j * h + (j-1)*distToMove};
                let $slice = $('<div></div>');
                $('html').append($slice); 
                let img = el.find('.tileBg').css('background-image');
                $slice.css('background-image',img).css('background-size','300%').css('background-position',j * w+'% '+i*h+"%");
                if (i==0 && j==0) $slice.css('border-top-left-radius','40px');
                if (i==0 && j==slices-1) $slice.css('border-top-right-radius','40px');
                if (i==slices-1 && j==0) $slice.css('border-bottom-left-radius','40px');
                if (i==slices-1 && j==slices-1) $slice.css('border-bottom-right-radius','40px');
                SparkFX.makeSpark(
                    {top:startPos.top-GameBoard.getDim()/6,left:startPos.left-GameBoard.getDim()/6},
                     {top:destPos.top-GameBoard.getDim()/6,left:destPos.left-GameBoard.getDim()/6},
                750,0.4);
                $slice.css('width',w).css('position','absolute').css('height',h).css('top',pos.top).css('left',pos.left);
                $slice.css('z-index',-100);
                $slice.animate({top:destPos.top,left:destPos.left,opacity:0,'transform':'rotate(Math.random()*360)'},duration);
                setTimeout(function(){
                    $slice.remove();
                }, duration);
            }
        } 
    },
 //   scoreCt : 0,
    score (el, points, duration=2300){
        let startPos = { left : el.offset().left + el.width()/6, top : el.offset().top - el.height()/4};
        let distToMove = 50;
        let destPos = { top: startPos.top - distToMove};
        let $scoreFx = $('<div class="scoreText">'+points+'</div>');
        $('html').append($scoreFx);
//        this.scoreCt++;
        
        $scoreFx
            .css('width',el.width()/1.5)
            .css('height',el.height()/5)
            .css('top',startPos.top)
            .css('left',startPos.left)
            .css('font-size',GameBoard.getDim()/4);
        $scoreFx.animate({top:destPos.top,left:destPos.left,opacity:0},{ duration: duration, queue: false })
            .qcss({color:'red'}).delay(400)
            .qcss({color:'orange'}).delay(400)
            .qcss({color:'yellow'}).delay(400)
            .qcss({color:'green'}).delay(400)
            .qcss({color:'blue'}).delay(400)
            .qcss({color:'purple'}).delay(400)
            .qcss({color:'red'});
        setTimeout(function(){
                $scoreFx.remove();
            },duration);
        
        
        return;
    },

    sparks : [],

    Init(){
        let styleTag = $('<style>.particleFx { background-size: contain; background-repeat:no-repeat; position:fixed; }</style>')
        $('html > head').append(styleTag);
    },
}

class SparkFX {
    constructor(pos,id){
        this.id = id;
        this.animation = null;
        this.animIndex = 0;
    }

    instantiate(pos,opacity=1){
        this.$el = $("<div class='spark'></div>");
        $('html').append(this.$el);
        this.$el.css('width',GameBoard.getDim())
                .css('height',GameBoard.getDim())
                .css('left',pos.left)
                .css('top',pos.top)
                .css('opacity',opacity)
        
        let $this = this;
        let interval = 70;
        this.animation = setInterval(function(){ 
            $this.$el.css('background-image','url(/static/img/spark'+$this.animIndex+'.png)'); $this.animIndex++; $this.animIndex %= 3; 
        },interval);
     
    }
    move(pos, duration = 2000 ){
        this.$el.animate( {top: pos.top, left: pos.left},duration,"linear");
    }

    static makeSpark(startPos,destPos,duration=800,opacity=1){
        let spark = new SparkFX();
        spark.instantiate(startPos,opacity);
        spark.move(destPos,duration);
        particleFx.sparks.push(spark);
        setTimeout(function(){
            spark.destroy();
            particleFx.sparks.splice(particleFx.sparks.indexOf(spark),1);
        },duration)
        return spark; 

    }
    
    destroy(){
        clearInterval(this.animation);
        this.$el.remove();
    }
        
}
particleFx.Init();
