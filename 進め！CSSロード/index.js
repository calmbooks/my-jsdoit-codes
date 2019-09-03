function $id(id) {
  return document.getElementById(id);
}

var start = $id('start');
var goal = $id('goal');
var timerNum = $id('timerNum');
var tweetText = $id('tweetText');
var resultBtn = $id('resultBtn');

start.onmouseover = startRoad;
goal.onmouseover = goalRoad;

function startRoad() {
  startTimer();
  start.onmouseover = false;
}
function goalRoad() {
  stopTimer();
  tweetText.innerHTML = '記録<strong>' + timerNum.innerHTML + '</strong>秒！';
  resultBtn.onclick = resultTweet;
}
function startTimer() {
  timer = setInterval(function() {
    timerNum.innerHTML = parseInt(timerNum.innerHTML) + 1;
  },1000 );
}
function stopTimer() {
  clearInterval(timer);
}
function resultTweet() {
  var text = 'CSSロードを' + timerNum.innerHTML + '秒で駆け抜けました。';
  window.open('http://twitter.com/share?url=http://jsdo.it/calmbooks/cssRoad&text=' + text, 'tweet', 'width=550, height=450,personalbar=0,toolbar=0,scrollbars=1,resizable=1');
}
