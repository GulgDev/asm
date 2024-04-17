mov a, in
sub a, 10
jlz digit
jz result
sub a, 3
jz clear

mov c, d
shr c, 3
mov a, d
and a, 7
jz add
sub a, 1
jz sub
sub a, 1
jz mul
sub a, 1
jz div
jmp end

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
    add out, c
    jmp end

.sub
    jmp end

.mul
    jmp end

.div
    jmp end

.end
    mov d, out
    shl d, 3
    mov a, in
    sub a, 11
    or d, a

.exit