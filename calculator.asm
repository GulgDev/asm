; Обработка нажатой клавиши
mov a, in
sub a, 9
; Если a < 0, то нажата цифра
jgz eq
shl out, 1
mov a, out
shl a, 2
add out, a
add out, in
jmp exit
; Если a = 0, то нажат знак "="
.eq
jz op
sub a, 5
jz key_15
.op
    ; Если a < 0, то нажат знак арифметической операции    

    mov a, d ; Считать из регистра d операнд и операцию
    shr a, 3
    mov b, d
    and b, 7

    ; Производим операцию
    jnz sub
    add out, a
    .sub
        sub b, 1
        jnz mul
        ; ...
    .mul
        sub b, 1
        jnz div
        ; ...
    .div
        sub b, 1
        jnz calculate_end
        ; ...
    .calculate_end
    
    mov a, in ; Если нажат знак "=", то выходим
    sub a, 10
    jz exit

    mov d, out ; Сохранить в регистр d операнд и операцию
    shl d, 3
    sub in, 11
    or d, in

    mov out, 0 ; Очистить экран

    jmp exit
.key_15
    ; Если a = 0, то нажата кнопка "C"

.exit