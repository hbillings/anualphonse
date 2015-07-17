$(document).ready(function(){
  var picStrip = {
    _months: ["Jan.", "Feb.", "March", "April", "May", "June", "July", "August", "Sept.", "Nov.", "Dec."],
    _filterHashtags: function(image){
      // Anu tags all his music pics with #singanusong, so only display those
      if ($.inArray("singanusong", image["tags"]) != -1){
        return true;
      }
      return false;
    },
    _truncateCaption: function(caption, counter){
      // Break captions on words instead of chars
      function nearestWord(counter){
        if (caption.charAt(counter) != ' ') {
          nearestWord(counter - 1);
        } else {
          caption =  caption.slice(0, counter) + "...";
        }
        return caption;
      }
      return nearestWord(counter);
    },
    _convertDate: function(unixTime){
      // TODO: figure out how to set self = this on the object
      var self = this;
      var date = new Date(unixTime*1000);
      return self._months[date.getMonth()] + " " + date.getDate();
    },
    _buildImages: function(recentPics){
      var self = this;
      var picTemplate = _.template($("#photos").html());
      _.each(recentPics, function(item){
        item["created_time"] = self._convertDate(item["created_time"]);
        // Sometimes Anu writes really long captions and it throws off the display
        if (item["caption"]["text"].length > 450) {
          item["caption"]["text"] = self._truncateCaption(item["caption"]["text"], 350);
        }
        $("#photo-strip").append(picTemplate({data: item}));
      });
      // Initialize the photo slider
      $('#photo-strip').slick({
        infinite: true,
        slidesToShow: 3,
        slidesToScroll: 3
      });
    },
    getInstagramFeed: function(url){
      var self = this;
      var recentPics = [];
      // NOTE: By default, Instagram returns most recent 20 pics
      $.ajax({
        type: "GET",
        dataType: "jsonp",
        cache: false,
        url: url
      })
      .done(function(data){
        $.each(data["data"], function(index, value){
          if (self._filterHashtags(value) == true) {
            recentPics.push(value);
          }
        });
        self._buildImages(recentPics);
      })
      .error(function(e){
        // Should probably handle this more gracefully
        console.log(e);
      });
    }
  }

  picStrip.getInstagramFeed("https://api.instagram.com/v1/users/239351137/media/recent/?client_id=5fbcc27fe79f42d6be1e3861498a176d");

  var audioPlayer = {
    // TODO: pull these from Tarbell spreadsheet somehow
    _songs: [{"title": "Love Does", "urls": ["../music/love_does.mp3"]}, {"title": "Sunny 16", "urls": ["../music/sunny16.mp3"]}],
    _currentSong: new Howl({ }),
    _currentSongID: 0,
    _incrementID: function(){
      var self = audioPlayer;
      if (self._currentSongID < (self._songs.length - 1)) {
          self._currentSongID += 1;
        } else {
          self._currentSongID = 0;
        }
    },
    _decrementID: function(){
      var self = audioPlayer;
      if (self._currentSongID == 0) {
        self._currentSongID = self._songs.length - 1;
      } else {
        self._currentSongID -=1;
      }
    },
    setUp: function(){
      $("#song-title").html(this._songs[0]["title"]);
      $("#play").on("click", this.playSong);
      $("#pause").on("click", this.pauseSong);
      $("#ff").on("click", this.fastForward);
      $("#rewind").on("click", this.rewind);
    },
    pauseSong: function(){
      $("#pause").hide();
      $("#play").show();
      audioPlayer._currentSong.pause();
    },
    playSong: function(){
      // Because the function is bound on click, "this" refers to the element clicked on instead of audioPlayer
      var self = audioPlayer;

      // Stop audio if we're playing
      self._currentSong.pause();
      $("#pause").show();
      $("#play").hide();
      // If the song is in the middle, resume playing
      if (self._currentSong.pos() != 0){
        self._currentSong.play();
      } else {
        self._currentSong = new Howl({
          urls: self._songs[self._currentSongID]["urls"],
          onend: function() {
            self._incrementID();
            self.playSong();
            //if $("#song-title") != title, set new title
          }
        }).play();
        $("#song-title").html(self._songs[self._currentSongID]["title"]);
      }
    },
    fastForward: function(){
      var self = audioPlayer;
      // Destroy previous object
      self._currentSong.unload();
      // Hacky way around trying to figure out if the song is playing -- doesn't always work
      // TODO: Fix this by upgrading to howler 2.0 and using the .playing method
      if (self._currentSong.pos(0)){
        self.playSong();
      }
    },
    rewind: function(){
      var self = audioPlayer;
      // Currently this is a little buggy and only takes you back to the beginning of the song.
      //self._currentSong.unload();
      //self._decrementID();

      self._currentSong.pos(0);
      self.playSong();
    }
  }

  audioPlayer.setUp();
});
