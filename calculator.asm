; Обработка нажатой клавиши
mov a, in
sub a, 9
; Если a < 0, то нажата цифра
jgz eq
swp d
mov c, d
and c, 1
mov a, d ; Проверить, был ли нажат знак арифметической операции
and a, 2
jz digit
mov out, 0 ; Если был, то начать ввод заново
xor d, 2
digit:
swp d
mov b, out ; Умножить out на 10
shl out, 1
mov a, out
shl a, 2
add out, a
tst b ; Проверяем, является ли ввод отрицательным
jlz digit_sub
add out, in ; Если нет, то прибавлем in
jmp negate
digit_sub:
sub out, in ; Иначе вычитаем
negate:
tst b ; Если введена первая цифра, и до этого был нажат минус, то надо инвертировать ввод
jnz exit
tst c
jz exit
xor out, -1
add out, 1
jmp exit
; Если a = 0, то нажат знак "="
eq:
jz op
sub a, 6
jz key_15
op:
    ; Если a < 0, то нажат знак арифметической операции

    ; Если число ещё не было введено и был нажат знак "-", то нужно вставить минус
    swp d
    mov a, d
    and a, 2
    jnz minus_check
    tst out
    jnz calculate
    minus_check:
    mov a, in
    sub a, 12
    jnz calculate
    or d, 1
    swp d
    jmp exit

    calculate:
    mov a, d ; Считать из регистра d операнд и операцию
    shr a, 5
    mov b, d
    shr b, 2
    and b, 7
    swp d

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
        mov d, 1 ; Знак результата

        tst out ; Проверяем out
        jgz mul_negative_check_a
        xor out, -1 ; Если out < 0, инвертируем знак результата и делаем out положительным
        add out, 1
        xor d, 1
    mul_negative_check_a:
        tst a ; Проверяем a
        jgz mul_negative_check_end
        xor a, -1 ; Если a < 0, инвертируем знак результата и делаем a положительным
        add a, 1
        xor d, 1
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
        
        tst d ; Проверяем знак результата
        jnz calculate_end
        xor out, -1 ; Инвертируем результат
        add out, 1
        jmp calculate_end
    div:
        ; Деление
        mov d, 1 ; Знак результата

        tst out ; Проверяем out
        jgz div_negative_check_a
        xor out, -1 ; Если out < 0, инвертируем знак результата и делаем out положительным
        add out, 1
        xor d, 1
    div_negative_check_a:
        tst a ; Проверяем a
        jgz div_negative_check_end
        xor a, -1 ; Если a < 0, инвертируем знак результата и делаем a положительным
        add a, 1
        xor d, 1
    div_negative_check_end:

        mov b, 1 ; Последовательно делим
        mov c, 0
        div_loop:
            sub a, out
            jlz div_loop_lt
            add c, b
            jmp div_loop_inc
        div_loop_lt:
            add a, out
        div_loop_inc:
            shl out, 1
            shl b, 1
            tst a
            jgz div_loop
        
        mov out, c

        tst d ; Проверяем знак результата
        jnz calculate_end
        xor out, -1 ; Инвертируем результат
        add out, 1

    calculate_end:

    mov d, out ; Сохранить операнд и операцию
    shl d, 5
    sub in, 10
    shl in, 2
    or d, in
    or d, 2
    swp d

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