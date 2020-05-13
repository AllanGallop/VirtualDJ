class Player {

    constructor(config,socket){
        this.socket = socket || {};
        this.audio = new Audio();
        this.canvas = document.getElementById(config.canvas);
        this.ctx = this.canvas.getContext("2d");
        this.context = new (window.AudioContext || window.webkitAudioContext)();
        this.analyser = this.context.createAnalyser();
        this.source = this.context.createMediaElementSource(this.audio);
        this.source.connect(this.analyser);
        this.analyser.connect(this.context.destination);
        this.frequency_array = new Uint8Array(this.analyser.frequencyBinCount);
        this.audio.addEventListener("ended",this.onEnded.bind(this));
        this.current_artist = "VirtualDJ";
        this.current_title = "Allan Gallop";
        this.isPaused = false;
        this.playNext();
    }

    animationLooper(){
        var center_x, center_y, radius, bars, x, y, x_end, y_end, bar_height, bar_width, rads;
        bars = 200; //100
        bar_width = 4; //4
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        // find the center of the window
        center_x = this.canvas.width / 2;
        center_y = this.canvas.height / 2;
        radius = 200;

        //draw a circle
        this.ctx.beginPath();
        this.ctx.arc(center_x,center_y,radius,0,2*Math.PI);
        this.ctx.strokeStyle = "rgba(255,255,255,0.5)";
        this.ctx.stroke();

        this.analyser.getByteFrequencyData(this.frequency_array);

        for(var i = 0; i < bars; i++){
            //divide a circle into equal parts
            rads = Math.PI * 2 / bars;
            bar_height = this.frequency_array[i]*0.35; //0.4
            // set coordinates
            x = center_x + Math.cos(rads * i) * (radius);
            y = center_y + Math.sin(rads * i) * (radius);
            x_end = center_x + Math.cos(rads * i)*(radius + bar_height);
            y_end = center_y + Math.sin(rads * i)*(radius + bar_height);
            //draw a bar
            this.drawBar(x, y, x_end, y_end, bar_width);

        }
        this.ctx.fillStyle = "white";
        this.ctx.textAlign = "center"
        this.ctx.font = "24px Helvetica";
        this.ctx.fillText(this.current_title, center_x, center_y);
        this.ctx.font = "14px Helvetica";
        this.ctx.fillText('by '+this.current_artist, center_x, (center_y+14));
        var self = this;
        window.requestAnimationFrame(function() { self.animationLooper(); } );
    }

    drawBar(x1, y1, x2, y2, width){
        var lineColor = "rgb(255,255,255)";
        this.ctx.strokeStyle = lineColor;
        this.ctx.lineWidth = width;
        this.ctx.beginPath();
        this.ctx.moveTo(x1,y1);
        this.ctx.lineTo(x2,y2);
        this.ctx.stroke();
    }
    play(src,title,artist){
        this.audio.src = src;
        this.current_artist = artist;
        this.current_title = title;
        this.audio.play();
        this.animationLooper();
    }
    pause(){
        if(this.isPaused){
            this.audio.play();
            this.isPaused = false;
        }else{
            this.audio.pause();
            this.isPaused = true;
        }
    }
    playNext(){
        this.socket.emit('skip','forward');
    }
    onEnded(){
        this.playNext();
    }
}

socket= io.connect('http://localhost:5000');
var p = new Player(
    {
        canvas:'myCanvas'
    }
    ,socket);
socket.on('connect',function(){
    console.log('Connected to server');
});
socket.on('error',function(msg){
    alert(msg);
});
socket.on('pause',function(){
    p.pause();
});
socket.on('playNext',function(arr){
    arr = arr.split(',');
    current_title = arr[1];
    current_artist = arr[2];
    current_track = "media/"+arr[0];
    p.play(current_track,current_artist,current_title);
});