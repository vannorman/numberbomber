/*
Animations = {
    active : [],
    remove(anim){
        this.active.splice(this.active.indexOf(anim),1);
    },
    test(){
        this.$testObj1 = $('<div id="animTest" style="position:absolute;left:100;width:20px;height:20px;border:2px solid purple;">hi1</div>');
        this.$testObj2 = $('<div id="animTest" style="position:absolute;left:200;width:20px;height:20px;border:2px solid red;">hi2</div>');
        this.$testObj3 = $('<div id="animTest" style="position:absolute;left:300;width:20px;height:20px;border:2px solid blue;">hi3</div>');
        $('html').append(this.$testObj1).append(this.$testObj2).append(this.$testObj3);
        let testAnim1 = new Animation(
            'one',
            this.$testObj1,
            {top:100},
            1000,
            1 );
        let testAnim2 = new Animation(
            'two',
            this.$testObj2,
            {top:200},
            1000,
            2 );
        let testAnim3 = new Animation(
            'three',
            this.$testObj3,
            {top:300},
            1000,
            3 );
        setTimeout(function(){testAnim3.animate();},1000) // lowest priority
        setTimeout(function(){testAnim2.animate();},3000)
        setTimeout(function(){testAnim1.animate();},2000) // highest priority
        setTimeout(function(){testAnim2.animate();},6000)
    },
    animate($el,anims,priority,duration=1000,callback=null){
        let name = this.active.length.toString();
        let anim = new Animation(name,$el,anims,duration,priority,callback);
        anim.animate();

    }
}
class Animation {
    constructor(name,$el,animationList,duration,priority,callback=null){
        this.name = name;
        this.$el = $el;
        this.animationList = animationList;
        this.priority = priority;
        this.duration = duration;
        this.callback = callback;
    }

    animate(){
        let toRemove = [];
//        console.log('animating : '+this.name);
        Animations.active.filter(x => x.priority > this.priority).forEach(x => {
            //console.log('toRemPush :'+x.name);
            toRemove.push(x)
        });
        toRemove.forEach(x => {
            // console.log('stopping and removing '+x.name+', priority '+x.priority+', due to '+this.name+' with priority '+this.priority);
            x.$el.stop(); 
            Animations.remove(x);
        });
        if (Animations.active.filter(x => x.priority < this.priority).length > 0){
//            console.log('fail to start '+this.name+' due to higher priority anims running.');
            return;
        }
        this.$el.animate(
            this.animationList,
            this.duration,
            function(e){
                Animations.remove(this);
                if (this.callback != null && this.callback instanceof Function) {
                    this.callback(e);
                }
            });

       Animations.active.push(this);
    }
}
*/
