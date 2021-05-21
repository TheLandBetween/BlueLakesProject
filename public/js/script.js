let myVar = 3;

function addFish(fishCount, emptyFishNode) {
    var container = $("#fishes")[0];
    container.load("../../views/partials/fish.ejs");
}

$(document).ready(function(){
    $('.my-background-video').bgVideo();
   document.querySelector('video').playbackRate = 0.5;
});

function passwordChanged() { //Password strength meter
    var strength = document.getElementById('strength');
    var strongRegex = new RegExp("^(?=.{14,})(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*\\W).*$", "g");
    var mediumRegex = new RegExp("^(?=.{10,})(((?=.*[A-Z])(?=.*[a-z]))|((?=.*[A-Z])(?=.*[0-9]))|((?=.*[a-z])(?=.*[0-9]))).*$", "g");
    var enoughRegex = new RegExp("(?=.{8,}).*", "g");
    var pwd = document.getElementById("password");
    if (pwd.value.length == 0) {
        strength.innerHTML = 'Type Password';
    } else if (false == enoughRegex.test(pwd.value)) {
        strength.innerHTML = 'More Characters (At least 8)';
    } else if (strongRegex.test(pwd.value)) {
        strength.innerHTML = '<span style="color:green">Strong!</span>';
    } else if (mediumRegex.test(pwd.value)) {
        strength.innerHTML = '<span style="color:orange">Medium! (Add symbols, capitals, numbers)</span>';
    } else {
        strength.innerHTML = '<span style="color:red">Weak! (Add symbols, capitals, numbers)</span>';
    }
}
