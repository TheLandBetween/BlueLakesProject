let myVar = 3;

function addFish(fishCount, emptyFishNode) {
    var container = $("#fishes")[0];
    container.load("../../views/partials/fish.ejs");
}

$(document).ready(function(){
    $('.my-background-video').bgVideo();
   document.querySelector('video').playbackRate = 0.5;
});