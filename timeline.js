function timeline_init() {
    document.getElementById("time-input").value = 0;
}

function update_time() {
    var ele = document.getElementById("time");
    var input = document.getElementById("time-input");
    var time = new Date();
    time.setMinutes(time.getMinutes() + parseInt(input.value));
    ele.innerText = time;
    // draw_ISS(get_render_time());
    updateISS();

    var ori_time = wwd.goToAnimator.travelTime;
    wwd.goToAnimator.travelTime = 0;
    focusISS();
    wwd.goToAnimator.travelTime = ori_time;
}

function get_user_time() {
    var input = document.getElementById("time-input");
    return parseInt(input.value) * 60;
}