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
    sub:
        sub b, 1
        jnz mul
        sub a, out ; Вычитание
        mov out, a
    mul:
        sub b, 1
        jnz div
        ; ...
    div:
        sub b, 1
        jnz calculate_end
        ; ...
    calculate_end:

    mov d, 0 ; Сбросить сохранённую операцию
    
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