mov a, in
sub a, 10
jlz digit
sub a, 1
jlz result
sub a, 1
jlz add
sub a, 1
jlz sub
sub a, 1
jlz mul
sub a, 1
jlz div
sub a, 1
jz clear
jmp exit

.digit
    mov a, 9
    mov b, out
    .digit_loop
        add out, b
        sub a, 1
        jnz digit_loop
    add out, in
    jmp exit

.clear
    mov a, out
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
    .clear_loop
        add c, a
        sub b, 1
        jnz clear_loop
    sub out, c
    add out, 6
    shr out, 4
    add out, a
    jmp exit

.result
    jmp exit

.add
    jmp exit

.sub
    jmp exit

.mul
    jmp exit

.div
    jmp exit

.exit