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
    $content = file_get_contents("https://api.infura.io/v1/jsonrpc/mainnet/eth_call?params=[{%22to%22:%22".$config["address"]."%22,%22data%22:%22".$methodHash."%22}]&token=" . $config["token"]);
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


function renderLanding() {
    global $config;

    $now = time();
    $startTime = intval(getValue(TIME_START));
    $bonusTime = intval(getValue(TIME_BONUS_END));
    $endTime = intval(getValue(TIME_END));

//    $startTime = $now + 60*60*64;
//    $bonusTime = $startTime + 2000;
//    $endTime = $startTime + 3000;

    $address = $config["address"];

    $tokenTotal = floor(intval(getValue(TOKEN_TOTAL)) / 1e8);
    $tokenSold = floor(intval(getValue(TOKEN_SOLD)) / 1e8);
    $tokenAvailable = floor(intval(getValue(TOKEN_AVAILABLE)) / 1e8);
    $tokenMin = floor(intval(getValue(TOKEN_MIN)) / 1e8);
    $tokenRate = floor(intval(getValue(TOKEN_RATE)));
    $tokenSoldPercent = floor($tokenSold/($tokenSold + $tokenAvailable) * 100);

    $timerMessage = "";
    $timer = 0;
    if ($now < $startTime) {
        $timerMessage = "ICO starts in:";
        $timer = $startTime * 1000;
    } else if ($now < $endTime) {
        $timerMessage = "ICO end in:";
        $timer = $endTime * 1000;
    } else {
        $timerMessage = "ICO over";
    }
    include "view.html";
}

if (isset($_GET["import"])) {
    importBlockchain([TOKEN_AVAILABLE, TOKEN_SOLD, TOKEN_TOTAL, TOKEN_MIN, TOKEN_RATE, TIME_START, TIME_END, TIME_BONUS_END]);
} else if (isset($_GET["update"])) {
    importBlockchain([TOKEN_AVAILABLE, TOKEN_SOLD]);
} else {
    renderLanding();
}
