<?php
define('TOKEN_AVAILABLE', '0x5ebdd159');
define('TOKEN_SOLD', '0x519ee19e');
define('TOKEN_TOTAL', '0x18160ddd');
define('TOKEN_MIN', '0x9d4c5451');
define('TOKEN_RATE', '0x40520f85');

define('TIME_START', '0x78e97925');
define('TIME_END', '0x3197cbb6');
define('TIME_BONUS_END', '0xee1a6295');

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

function importBlockchain($methodList) {
    $conn = getConnection();
    $ps = $conn->prepare("replace into blockchain(name, value) values(?,?)");
    $ps->bind_param("ss", $name, $value);
    foreach($methodList as $name) {
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

if (isset($_GET["import"])) {
    importBlockchain([TOKEN_AVAILABLE, TOKEN_SOLD, TOKEN_TOTAL, TOKEN_MIN, TOKEN_RATE, TIME_START, TIME_END, TIME_BONUS_END]);
}

if (isset($_GET["update"])) {
    importBlockchain([TOKEN_AVAILABLE, TOKEN_SOLD]);
}

$now = time();

$startTime = intval(getValue(TIME_START));
$bonusTime = intval(getValue(TIME_BONUS_END));
$durationTime = intval(getValue(TIME_END));

if ($now < $startTime) {
    var_dump("countdown for start");
} else if ($now >= $startTime && $now < $durationTime) {
    var_dump("ico open");
    $bonus = $now < $bonusTime;
    var_dump($bonus);
} else {
    var_dump("ico closed");
}

$tokenTotal = floor(intval(getValue(TOKEN_TOTAL)) / 1e8);
$tokenSold = floor(intval(getValue(TOKEN_SOLD)) / 1e8);
$tokenAvailable = floor(intval(getValue(TOKEN_AVAILABLE)) / 1e8);
$tokenMin = floor(intval(getValue(TOKEN_MIN)) / 1e8);
$tokenRate = floor(intval(getValue(TOKEN_RATE)));


?>
<!DOCTYPE html>
<html>
    <head>
        <meta charset="utf-8">
        <title>MichCoin</title>
          <meta name="viewport" content="width=device-width, initial-scale=1">
        <script src="web3.min.js"></script>
    </head>
    <body>

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

<?php if ($now >= $startTime && $now < $durationTime): ?>
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

<?php if ($now >= $startTime && $now < $bonusTime): ?>
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
      location.reload();
    }
  }
  updateClock();
  var timeinterval = setInterval(updateClock, 1000);
}

initializeClock('startclock', new Date(<?= $startTime ?> * 1000));
initializeClock('bonusclock', new Date(<?= $bonusTime ?> * 1000));
initializeClock('endclock', new Date(<?= $durationTime ?> * 1000));
</script>

<p>Token Total: <?= $tokenTotal ?></p>
<p>Token Sold: <?= $tokenSold ?></p>
<p>Token Available: <?= $tokenAvailable ?></p>
<p>Token Min: <?= $tokenMin ?></p>
<p>Rate: <?= $tokenRate ?> MCH = 1 ETH (in bonus period +10% MCH)</p>
<p>Send ETH to address: <?= $config["address"] ?></p>
<p>Contract ABI <textarea>[{"constant":true,"inputs":[],"name":"frozen","outputs":[{"name":"","type":"bool"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"name","outputs":[{"name":"","type":"string"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"_spender","type":"address"},{"name":"_value","type":"uint256"}],"name":"approve","outputs":[{"name":"success","type":"bool"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"_from","type":"address"},{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transferFrom","outputs":[{"name":"success","type":"bool"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"decimals","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"endTime","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":false,"inputs":[],"name":"withdraw","outputs":[],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"tokenToEtherRate","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"tokenSold","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"tokenAvailable","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":false,"inputs":[],"name":"freeze","outputs":[],"payable":false,"type":"function"},{"constant":false,"inputs":[],"name":"unfreeze","outputs":[],"payable":false,"type":"function"},{"constant":true,"inputs":[{"name":"_owner","type":"address"}],"name":"balanceOf","outputs":[{"name":"balance","type":"uint256"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"startTime","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"symbol","outputs":[{"name":"","type":"string"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"minTokens","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transfer","outputs":[{"name":"success","type":"bool"}],"payable":false,"type":"function"},{"constant":true,"inputs":[{"name":"_weis","type":"uint256"}],"name":"weiToToken","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":true,"inputs":[{"name":"_tokens","type":"uint256"}],"name":"tokenToWei","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":true,"inputs":[{"name":"_owner","type":"address"},{"name":"_spender","type":"address"}],"name":"allowance","outputs":[{"name":"remaining","type":"uint256"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"maxTokens","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"bonusEndTime","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"inputs":[{"name":"_tokenCount","type":"uint256"},{"name":"_minTokenCount","type":"uint256"},{"name":"_tokenToEtherRate","type":"uint256"},{"name":"_beginDurationInSec","type":"uint256"},{"name":"_durationInSec","type":"uint256"},{"name":"_bonusDurationInSec","type":"uint256"},{"name":"_mainAddress","type":"address"},{"name":"_reserveAddress","type":"address"}],"payable":false,"type":"constructor"},{"payable":true,"type":"fallback"},{"anonymous":false,"inputs":[{"indexed":true,"name":"_from","type":"address"},{"indexed":true,"name":"_to","type":"address"},{"indexed":false,"name":"_value","type":"uint256"}],"name":"Transfer","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"_owner","type":"address"},{"indexed":true,"name":"_spender","type":"address"},{"indexed":false,"name":"_value","type":"uint256"}],"name":"Approval","type":"event"}]</textarea></p>

<script>
var web3 = new Web3(new Web3.providers.HttpProvider("https://kovan.infura.io/<?= $config["token"] ?>"));
var abi = [{"constant":true,"inputs":[],"name":"frozen","outputs":[{"name":"","type":"bool"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"name","outputs":[{"name":"","type":"string"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"_spender","type":"address"},{"name":"_value","type":"uint256"}],"name":"approve","outputs":[{"name":"success","type":"bool"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"_from","type":"address"},{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transferFrom","outputs":[{"name":"success","type":"bool"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"decimals","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"endTime","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":false,"inputs":[],"name":"withdraw","outputs":[],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"tokenToEtherRate","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"tokenSold","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"tokenAvailable","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":false,"inputs":[],"name":"freeze","outputs":[],"payable":false,"type":"function"},{"constant":false,"inputs":[],"name":"unfreeze","outputs":[],"payable":false,"type":"function"},{"constant":true,"inputs":[{"name":"_owner","type":"address"}],"name":"balanceOf","outputs":[{"name":"balance","type":"uint256"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"startTime","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"symbol","outputs":[{"name":"","type":"string"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"minTokens","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transfer","outputs":[{"name":"success","type":"bool"}],"payable":false,"type":"function"},{"constant":true,"inputs":[{"name":"_weis","type":"uint256"}],"name":"weiToToken","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":true,"inputs":[{"name":"_tokens","type":"uint256"}],"name":"tokenToWei","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":true,"inputs":[{"name":"_owner","type":"address"},{"name":"_spender","type":"address"}],"name":"allowance","outputs":[{"name":"remaining","type":"uint256"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"maxTokens","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"bonusEndTime","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"inputs":[{"name":"_tokenCount","type":"uint256"},{"name":"_minTokenCount","type":"uint256"},{"name":"_tokenToEtherRate","type":"uint256"},{"name":"_beginDurationInSec","type":"uint256"},{"name":"_durationInSec","type":"uint256"},{"name":"_bonusDurationInSec","type":"uint256"},{"name":"_mainAddress","type":"address"},{"name":"_reserveAddress","type":"address"}],"payable":false,"type":"constructor"},{"payable":true,"type":"fallback"},{"anonymous":false,"inputs":[{"indexed":true,"name":"_from","type":"address"},{"indexed":true,"name":"_to","type":"address"},{"indexed":false,"name":"_value","type":"uint256"}],"name":"Transfer","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"_owner","type":"address"},{"indexed":true,"name":"_spender","type":"address"},{"indexed":false,"name":"_value","type":"uint256"}],"name":"Approval","type":"event"}];
var MichCoin = web3.eth.contract(abi);
var instance = MichCoin.at("<?= $config["address"] ?>");
var sold = instance.tokenSold();
console.log(sold.dividedBy(1e8).valueOf());
sold = instance.tokenAvailable();
console.log(sold.dividedBy(1e8).valueOf());

</script>

</body>
</html>
