; Обработка нажатой клавиши
mov a, in
sub a, 9
; Если a < 0, то нажата цифра
jgz eq
mov a, d
and a, 1
jz digit
mov out, 0
and d, -2
digit:
shl out, 1
mov a, out
shl a, 2
add out, a
add out, in
jmp exit
; Если a = 0, то нажат знак "="
eq:
jz op
sub a, 6
jz key_15
op:
    ; Если a < 0, то нажат знак арифметической операции

    ; Если число ещё не было введено, то нужно вставить минус


    mov a, d ; Считать из регистра d операнд и операцию
    shr a, 4
    mov b, d
    shr b, 1
    and b, 7

    ; Производим операцию
    jz calculate_end
    sub b, 1
    jnz sub
    add out, a ; Сложение
    jmp calculate_end
    sub:
        sub b, 1
        jnz mul
        sub a, out ; Вычитание
        mov out, a
        jmp calculate_end
    mul:
        sub b, 1
        jnz div

        ; Умножение
        mov c, 1 ; Знак результата

        tst out ; Проверяем out
        jgz mul_negative_check_a
        xor out, -1 ; Если out < 0, инвертируем знак результата и делаем out положительным
        add out, 1
        xor c, 1
    mul_negative_check_a:
        tst a ; Проверяем a
        jgz mul_negative_check_end
        xor a, -1 ; Если a < 0, инвертируем знак результата и делаем a положительным
        add a, 1
        xor c, 1
    mul_negative_check_end:

        mov b, out ; Последовательно перемножаем каждый бит
        mov out, 0
        mul_loop:
            mov c, a
            and c, 1
            jz mul_bit_zero
            add out, b
        mul_bit_zero:
            shl b, 1
            shr a, 1
            jgz mul_loop
        
        tst c ; Проверяем знак результата
        jz calculate_end
        xor out, -1 ; Инвертируем результат
        add out, 1
        jmp calculate_end
    div:
        sub b, 1
        jnz calculate_end

        ; Деление
    calculate_end:

    and d, 1 ; Сбросить сохранённую операцию (оставляем только знак ввода)
    
    mov a, in ; Если нажат знак "=", то выходим
    sub a, 10
    jz exit

    mov d, out ; Сохранить в регистр d операнд и операцию
    shl d, 4
    sub in, 10
    shl in, 1
    or d, in
    or d, 1

    jmp exit
key_15: ; Если нажата кнопка "C"
    mov a, out ; https://stackoverflow.com/a/2033226/16475499
    shr a, 1
    mov b, out
    shr b, 2
    add a, b
    mov b, a
    shr b, 4
    add a, b
    mov b, a
    shr b, 8
    add a, b
    mov b, a
    shr b, 16
    add a, b
    shr a, 3
    mov b, 9
    mov c, a
    clear_loop:
        add c, a
        sub b, 1
        jnz clear_loop
    sub out, c
    add out, 6
    shr out, 4
    add out, a

exit: