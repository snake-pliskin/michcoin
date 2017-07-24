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

