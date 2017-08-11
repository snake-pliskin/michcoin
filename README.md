Демка ICO

Свойства
- Токен реализует интерфейс ERC20
- Фиксированное кол-во выпускаемых токенов
- Указан период, в течение которого смарт контракт продает токены
- Указан нижний порог сбора
- Указан верхний порог сбора

Процедура ICO
- Началом продаж токенов считать время загрузки контракта
    - Покупать можно с помощью функции buyToken() и отправкой эфира
- По истечению периода или продаже максимального кол-во токенов, завершаем ICO

Завершение ICO
- Операция покупки токенов блокируется
- Если минимальная сумма не собрана, то возвращаем эфир владельцам
- Если минимальная сумма достигнута, то переводим собранный эфир куда-то на левый счет

Вопросы
- При перегоне эфира на счет владельца или возврате, необходимы затраты на газ (сколько их будет?)
- Может сделать функцию которая показывает сколько эфира будет стоить желаемое кол-во токенов?

Параметры
- 1 MI4 = $1
- 1 ETH = 215 MI4
- Выпускаем 1075000 токенов, это 5000 ETH
- Минимальная сумма 100 ETH, это 21500 MI4
- Максимальная сумма 3000 ETH, это 645000 MI4
- 2 знака после запятой
- Адрес кошелька куда нести деньги после ICO

Деньги поступают в WEI, надо сконвертировать наш курс относительно, 
причем если на эти деньги нельзя купить 1 сотую токенов, то отменить транзакцию

msg.value (wei)
balance[msg.sender] (MI4*10^decimal)

tokenAmount = 215 * msg.value / (10**18)
tokenAmount = tokenToEtherRate * msg.value / (10**18)


MichCoin

MichCoin(tokenCount, decimals, duration, minTokenCount, maxTokenCount)
    tokenCount - кол-во целых токенов
    decimals - кол-во знаков после запятой
    duration - продолжительность ICO в минутах
    minTokenCount - кол-во целых токенов которые надо продать чтобы ИСО состоялось
    maxTokenCount - кол-во целых токенов по достижению которых ИСО закрывается
    tokenToEtherRate - отношение токена к эфиру

balanceOf(owner)
    тесты:
        - после запуска кол-во токенов у owned совпадает с введенем tokenCount*(10^decimals)
        - делаем transfer на левый кошелек и проверяем его баланс
transfer(to, value)
    тесты:
        - запоминаем балансы кошельков и делаем трансфер, должно поменяться соответствующе
        - отправляем больше чем в кошельке (экспешн или фальс)
transferFrom(from, to, value)
    тесты:
        - отправляем с одного на другой без аппрува балансы не должны поменяться (или бросается эксешпн)
        - отправляем с аппрувом - балансы должны поменяться
approve(spender, value)
    тесты:
        - делаем аппрув и смотрим через аллованс?
allowance(owner, spender)
    тесты:
        - связано с аппрувом
buyToken()
    тесты:
        - просто купить токены на эфир по курсу
        - попытка купли токенов большем чем выпущено
        - попытка купли токенов больше чем maxTokeCount
        - попытка купли дробной части токена
        - попытка купли за эфир меньше наименьшего дробного токена
        - попытка купли эфира после закрытия продажи
withdraw()
    тесты:
        - попытка вызова до закрытия торгов
        - вызов после удачного ИСО, должен произойти перевод на указанный кошелек
        - вызов после неудачного ИСО, должен произойти возврат средств
freeze()
    тесты:
        - заморозка функций transfer, transferFrom, approve, buyToken, withdraw попробовать их вызвать
unfreeze()
    тесты:
        - разморозить например transfer и убедиться что он работает



