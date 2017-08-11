<?php

define('START_TIME',    "0x78e97925");
define('DURATION_TIME', "0xf8b75fb5");
define('BONUS_TIME',    "0x69465538");

include "config." . gethostname() . ".php";

function getConnection() {
    global $config;
    return new mysqli($config["dbHost"], $config["dbUser"], $config["dbPass"], $config["dbName"]);
}

function readBlockchain($methodHash) {
    global $config;
    $content = file_get_contents("https://api.infura.io/v1/jsonrpc/kovan/eth_call?params=[{%22to%22:%22".$config["address"]."%22,%22data%22:%22".$methodHash."%22}]&token=" . $config["token"]);
    $json = json_decode($content);
    $value = hexdec($json->result);
    return $value;
}

function importBlockchain() {
    $conn = getConnection();
    $ps = $conn->prepare("replace into blockchain(name, value) values(?,?)");
    $ps->bind_param("ss", $name, $value);
    foreach([START_TIME, DURATION_TIME, BONUS_TIME] as $name) {
        $value = readBlockchain($name);
        $ps->execute();
    }
    $conn->close();
}

function getValue($name) {
    $result = 0;
    $conn = getConnection();
    $ps = $conn->prepare("select value from blockchain where name = ?");
    $ps->bind_param("s", $name);
    $ps->execute();
    $ps->bind_result($value);
    if ($ps->fetch()) {
        $result = $value;
    }
    $conn->close();
    return $result;
}

$now = time();
$startTime = intval(getValue(START_TIME));
$bonusTime = $startTime + intval(getValue(BONUS_TIME));
$durationTime = $startTime + intval(getValue(DURATION_TIME));


if ($now < $startTime) {
    var_dump("countdown for start");
} else if ($now >= $startTime && $now < $durationTime) {
    var_dump("ico open");
    $bonus = $now < $bonusTime;
    var_dump($bonus);
} else {
    var_dump("ico closed");
}
 
?>

<?php if ($now < $startTime): ?>
<h1>Start Clock</h1>
<div id="startclock">
  <div>
    <span class="days"></span>
    <div class="smalltext">Days</div>
  </div>
  <div>
    <span class="hours"></span>
    <div class="smalltext">Hours</div>
  </div>
  <div>
    <span class="minutes"></span>
    <div class="smalltext">Minutes</div>
  </div>
  <div>
    <span class="seconds"></span>
    <div class="smalltext">Seconds</div>
  </div>
</div>
<?php endif ?>

<?php if ($now > $startTime && $now < $durationTime): ?>
<h1>End Clock</h1>
<div id="endclock">
  <div>
    <span class="days"></span>
    <div class="smalltext">Days</div>
  </div>
  <div>
    <span class="hours"></span>
    <div class="smalltext">Hours</div>
  </div>
  <div>
    <span class="minutes"></span>
    <div class="smalltext">Minutes</div>
  </div>
  <div>
    <span class="seconds"></span>
    <div class="smalltext">Seconds</div>
  </div>
</div>
<?php endif ?>

<?php if ($now > $startTime && $now < $bonusTime): ?>
<h1>Bonus Clock</h1>
<div id="bonusclock">
  <div>
    <span class="days"></span>
    <div class="smalltext">Days</div>
  </div>
  <div>
    <span class="hours"></span>
    <div class="smalltext">Hours</div>
  </div>
  <div>
    <span class="minutes"></span>
    <div class="smalltext">Minutes</div>
  </div>
  <div>
    <span class="seconds"></span>
    <div class="smalltext">Seconds</div>
  </div>
</div>
<?php endif ?>

<script>
function getTimeRemaining(endtime) {
  var t = Date.parse(endtime) - Date.parse(new Date());
  var seconds = Math.floor((t / 1000) % 60);
  var minutes = Math.floor((t / 1000 / 60) % 60);
  var hours = Math.floor((t / (1000 * 60 * 60)) % 24);
  var days = Math.floor(t / (1000 * 60 * 60 * 24));
  return {
    'total': t,
    'days': days,
    'hours': hours,
    'minutes': minutes,
    'seconds': seconds
  };
}

function initializeClock(id, endtime) {
  var clock = document.getElementById(id);
  if (!clock)
      return;
  var daysSpan = clock.querySelector('.days');
  var hoursSpan = clock.querySelector('.hours');
  var minutesSpan = clock.querySelector('.minutes');
  var secondsSpan = clock.querySelector('.seconds');

  function updateClock() {
    var t = getTimeRemaining(endtime);

    daysSpan.innerHTML = t.days;
    hoursSpan.innerHTML = ('0' + t.hours).slice(-2);
    minutesSpan.innerHTML = ('0' + t.minutes).slice(-2);
    secondsSpan.innerHTML = ('0' + t.seconds).slice(-2);

    if (t.total <= 0) {
      clearInterval(timeinterval);
    }
  }
  updateClock();
  var timeinterval = setInterval(updateClock, 1000);
}

initializeClock('startclock', new Date(<?= $startTime ?> * 1000));
initializeClock('bonusclock', new Date(<?= $bonusTime ?> * 1000));
initializeClock('endclock', new Date(<?= $durationTime ?> * 1000));
</script>
