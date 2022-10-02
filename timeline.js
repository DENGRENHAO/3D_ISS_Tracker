function timeline_init() {
    document.getElementById("time-input").value = 0;
}

function update_time() {
    // draw_ISS(get_render_time());
    updateISS();
    const ori_time = wwd.goToAnimator.travelTime;
    wwd.goToAnimator.travelTime = 0;
    focusISS();
    wwd.goToAnimator.travelTime = ori_time;
}

function get_user_time() {
    var input_time = document.getElementById("time-input");
    return parseInt(input_time.value) * 60;
}

function to_default_time() {
    var input = document.getElementById("time-input");
    input.value = 0;
    update_time();
}
