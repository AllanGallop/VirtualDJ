$(function(){
    socket= io.connect('http://localhost:5000');

    socket.on('playNext',function(arr){
        arr = arr.split(',');
        current_title = arr[1];
        current_artist = arr[2];
        $('#artist').text(current_artist);
        $('#title').text(current_title);
    });

    $('#btn_play').on('click',function(){ socket.emit('pause'); });
    $('#btn_bck').on('click',function(){ socket.emit('skip','backward'); });
    $('#btn_fwd').on('click',function(){socket.emit('skip','forward'); });
});