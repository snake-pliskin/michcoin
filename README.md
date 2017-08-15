Демка ICO
=========
- Токен реализует интерфейс ERC20
- Фиксированное кол-во выпускаемых токенов
- Указан период, в течение которого смарт контракт продает токены
- Указан нижний порог сбора
- Существует резевер в 15%, т.е. доступно для продажи 85%
- Можно указать бонусный период, в течении которого можно купить +10% токенов
- 8 знаков после запятой

Процедура ICO
-------------
- Началом продаж токенов указывается в виде интервала от времени загрузки контракта
    - Покупать можно с помощью отправления эфира
    - В течении указанного периода выплачивается бонус в +10% токенов
- По истечению времени ИСО или продаже максимального кол-во токенов, завершаем ICO

Завершение ICO
--------------
- Операция покупки токенов блокируется
- Если минимальная сумма не собрана, то возвращаем эфир владельцам
- Если минимальная сумма достигнута, то переводим собранный эфир на кошельки
    - главный, 85% (мультисиг)
    - резевр, 15%

Описание конструктора
---------------------
MichCoin
- tokenCount - кол-во целых токенов
- minTokenCount - кол-во целых токенов которые надо продать чтобы ИСО состоялось
- tokenToEtherRate - отношение токена к эфиру
- beginDurationInSec - через сколько секунд после загрузки смарт-контракта начнется ИСО
- durationInSec - продолжительность ИСО
- bonusDurationInSec - продолжительность бонусного периода
- mainAddress - адрес кошелька куда будут выгружены средства после ИСО
- reserveAddress - адрес кошелька куда будет выгружен резерв

Тесты
-----
- constructor
    - скидывает все токены на баланс контракта
- balanceOf(owner)
    - после запуска кол-во токенов у owned совпадает с введенем tokenCount\*(10^decimals)
    - делаем transfer на левый кошелек и проверяем его баланс
- transfer(to, value)
    - запоминаем балансы кошельков и делаем трансфер, должно поменяться соответствующе
    - отправляем больше чем в кошельке (экспешн или фальс)
    - нельзя отправить 0 токенов
- transferFrom(from, to, value)
    - отправляем с одного на другой без аппрува балансы не должны поменяться (или бросается эксешпн)
    - отправляем с аппрувом - балансы должны поменяться
    - нельзя отправить 0 токенов
    - делаем аппрув большем чем есть в кошельке, и пытаемся отправить большем чем в кошельке (бросает эксепшн)
- approve(spender, value)
    - делаем аппрув и смотрим через аллованс?
- allowance(owner, spender)
    - связано с аппрувом
- () покупка токена
    - просто купить токены на эфир по курсу
    - попытка купли токенов большем чем выпущено
    - попытка купли токенов больше чем maxTokens
    - попытка купли дробной части токена
    - попытка купли за эфир меньше наименьшего дробного токена
    - попытка купли эфира после закрытия продажи
- withdraw()
    - попытка вызова до закрытия торгов
    - вызов после удачного ИСО, должен произойти перевод на указанный кошелек
    - вызов после неудачного ИСО, должен произойти возврат средств
- freeze()
    - заморозка функций transfer, transferFrom, approve, buyToken, withdraw попробовать их вызвать
- unfreeze()
    - разморозить например transfer и убедиться что он работает
- периоды
    - нельзя купить после закрытия ИСО
    - нельзя купить до открытия ИСО
    - минимум не достигнут, период ИСО истекает и возврат средств
    - тоже самое, только с начислением бонусов
