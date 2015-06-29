$(document).ready(function(){
  function createPicStrip(url){
    function _filterHashtags(image){
      if ($.inArray("singanusong", image["tags"]) != -1){
        return true;
      }
      return false;
    }
    function _buildImages(recentPics){
      console.log(recentPics);
      var picTemplate = _.template($("#photos").html());
      _.each(recentPics, function(item){
        $("#photo-strip").append(picTemplate({data: item}));
      });
      $('#photo-strip').slick({
        infinite: true,
        slidesToShow: 3,
        slidesToScroll: 3
      });
    }
    function _getInstagramFeed(){
      var recentPics = [];
      // By default, Instagram seems to return 20 pics
      $.ajax({
        type: "GET",
        dataType: "jsonp",
        cache: false,
        url: url
      })
      .done(function(data){
        $.each(data["data"], function(index, value){
          if (_filterHashtags(value) == true) {
            recentPics.push(value);
          }
        });
        _buildImages(recentPics);
      })
      .error(function(e){
        console.log(e);
      });
    }
    _getInstagramFeed();
  }

  createPicStrip("https://api.instagram.com/v1/users/239351137/media/recent/?client_id=5fbcc27fe79f42d6be1e3861498a176d");
});
