export function getTimerInMinutes(timerInSeconds) {
    const minutes = Math.floor(timerInSeconds / 60);
    const seconds = timerInSeconds % 60;
    const result = `${padTo2Digits(minutes)}:${padTo2Digits(seconds)}`;

    return result;
}

function padTo2Digits(num) {
    return num.toString().padStart(2, "0");
}
