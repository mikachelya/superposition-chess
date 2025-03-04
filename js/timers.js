let timers;


let actualTimers = [];
let lastMoveTimestamp;
let lastMoveTimestampVisual;
let minutes;
let increment;


function initialiseTimers() {
    document.querySelectorAll(".chess-clock").forEach(el => {
        el.style.display = "flex";
    });
    
    timers = [
        document.querySelector(".chess-clock.clock-bottom"),
        document.querySelector(".chess-clock.clock-top"),
    ];

    if (perspective == BLACK)
        timers.reverse();

    timeControl = timeControl.split("+");
    minutes = +timeControl[0];
    increment = +timeControl[1];
    setTimerText(timers[0], minutes * 60);
    setTimerText(timers[1], minutes * 60);
}


function updateTimers(message) {
    if (actualTimers[message.origin] === undefined) {
        lastMoveTimestamp = message.timestamp;
        actualTimers[message.origin] = minutes * 60;
        return;
    }

    let secondsElapsed = message.timestamp - lastMoveTimestamp;
    actualTimers[message.origin] -= secondsElapsed;

    if (actualTimers[message.origin] < 0)
        playerFlagged(message.origin);

    if (increment)
        actualTimers[message.origin] += increment;

    setTimerText(timers[mainBoard.currentMove], actualTimers[mainBoard.currentMove]);
    setTimerText(timers[1 - mainBoard.currentMove], actualTimers[1 - mainBoard.currentMove]);

    lastMoveTimestamp = message.timestamp;
}


function drawTimers() {
    if (actualTimers.length != 2)
        return;
    let timeElapsed = Date.now() / 1000 - max(lastMoveTimestamp, lastMoveTimestampVisual);

    let timeRemaining = actualTimers[mainBoard.currentMove] - timeElapsed;
    if (timeRemaining < (mainBoard.currentMove == perspective ? 0 : -1)) // give 1000ms leeway for opponent to account for potential ping
        playerFlagged(mainBoard.currentMove);

    setTimerText(timers[mainBoard.currentMove], timeRemaining);

}


function setTimerText(timer, seconds) {
    if (seconds < 0)
        seconds = 0;

    let text = `${Math.floor(seconds / 60).toString().padStart(2, '0')}:${Math.floor(seconds % 60).toString().padStart(2, '0')}`;
    if (seconds < 10)
        text += "." + Math.floor((seconds % 1) * 10).toString();
    timer.innerText = text;
}


function playerFlagged(player) {
    endGame(player == WHITE ? 0 : 1);
}