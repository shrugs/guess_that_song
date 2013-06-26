$(document).ready(function() {
    var maxTime = 15;
    var currentTime = maxTime;
    var currentSongID = null;
    var completedSongs = [];
    var tagID = null; //will store which genre we are using
    var timingInterval; //handles our counter

    /*
    ** Creates our stream from a song ID **
    */
    function playSong(songID) {
        console.log("Clicked");
        currentSongID = songID;
        $.ajax({
          url: "../../lib/GroovesharkAPI-PHP/songGetter.php",
          type: "POST",
          data: {
            song: songID
          },
          success: function(response) {
            var responseData = jQuery.parseJSON(response);
            console.log(window.player);
            window.player.playStreamKey(responseData.StreamKey, responseData.StreamServerHostname, responseData.StreamServerID);
            setTimeout(startTimer(), 700);
          }
        });
    }

    function playError() {
        alert("Error playing song... finding new one");
        completeSong();
    }

    /*
    ** resets timer and calls method to grab new song **
    */
    function initNewSong(autoPlayTag) {
        currentTime = maxTime;
        getNewGenrePlayList(autoPlayTag);
    }

    function completeSong() {
        stopMusic();
        if (currentSongID !== null) {
            completedSongs.push(currentSongID);
        }
        initNewSong(tagID);
    }

    function isAlreadyPlayed(songID) {
        var exists = false;
        for (var i = 0; i < completedSongs.length; i++) {
            if (completedSongs[i] == songID) {
                exists = true;
                break;
            }
        }
        return exists;
    }

    /*
    ** Gets JSON from genre tag (autoPlayTag) that has our next SongID **
    */
    function getNewGenrePlayList(autoPlayTag) {
        $.ajax({
          url: "../../lib/getGenrePlaylist.php",
          type: "POST",
          data: {
            autoPlayTag: autoPlayTag
          },
          success: function(response) {
            var responseData = jQuery.parseJSON(response);
            autoPlayState = JSON.stringify(responseData.autoplayState);
            var nextSong = responseData.nextSong.SongID;
            console.log("response: "+autoPlayState);
            if (isAlreadyPlayed(nextSong)) {
                console.log("already played.. trying again");
                getNewGenrePlayList(autoPlayTag);
            }else{
                playSong(nextSong);
            }
          }
        });
    }

    function startTimer() {
        timingInterval = setInterval(function() {
                                currentTime--;
                                if (currentTime <= 0) {
                                    completeSong();
                                    clearInterval(timingInterval);
                                }
                                $("#timer").html(currentTime);
                            }, 1000);
    }

    function pauseMusic() {
        window.player.pauseStream();
    }

    function resumeMusic() {
        window.player.resumeStream();
    }

    function stopMusic() {
        window.player.stopStream();
    }

    var doc = $(document);

    $(".genre").on("click", function(e) {
        e.preventDefault();
        $(".genre").each(function() {
            $(this).parent().removeClass('genreSelected');
        });
        $(this).parent().addClass('genreSelected');
        // clearInterval(timingInterval);
        // currentTime = maxTime;
        tagID = $(this).attr('id');
        // $("#time-left").html("Loading...");
        // initNewSong(tagID);
    });

    $(".genre").hover(function() {
        $(this).parent().addClass('active');
        $(this).css('color', 'black');
    }, function() {
        $(this).parent().removeClass('active');
        $(this).css('color', 'gray');
    });

    doc.on("click", "#playBtn", function(e) {
        e.preventDefault();
        clearInterval(timingInterval);
        currentTime = maxTime;
        // tagID = $(this).attr('id');
        $("#time-left").html("Loading...");
        initNewSong(tagID);
    });

    doc.on("click", ".pause", function() {
        currentTime += 30;
        pauseMusic();
    });

    doc.on("click", ".resume", function() {
        resumeMusic();
    });

});