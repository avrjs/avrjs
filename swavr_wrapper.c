/*
 this file is the emscripten interface to swavr.
*/

#include "swavr/atmega328.h"
#include "swavr/atmega128.h"
#include "swavr/attiny1634.h"

#include <stdlib.h>

void avr_ins_nop(struct avr * const avr, uint16_t arg0, uint16_t arg1);
void avr_ins_movw(struct avr * const avr, uint16_t arg0, uint16_t arg1);
void avr_ins_muls(struct avr * const avr, uint16_t arg0, uint16_t arg1);
void avr_ins_mulsu(struct avr * const avr, uint16_t arg0, uint16_t arg1);
void avr_ins_fmul(struct avr * const avr, uint16_t arg0, uint16_t arg1);
void avr_ins_fmuls(struct avr * const avr, uint16_t arg0, uint16_t arg1);
void avr_ins_fmulsu(struct avr * const avr, uint16_t arg0, uint16_t arg1);
void avr_ins_cpc(struct avr * const avr, uint16_t arg0, uint16_t arg1);
void avr_ins_sbc(struct avr * const avr, uint16_t arg0, uint16_t arg1);
void avr_ins_add(struct avr * const avr, uint16_t arg0, uint16_t arg1);
void avr_ins_cpse(struct avr * const avr, uint16_t arg0, uint16_t arg1);
void avr_ins_cp(struct avr * const avr, uint16_t arg0, uint16_t arg1);
void avr_ins_sub(struct avr * const avr, uint16_t arg0, uint16_t arg1);
void avr_ins_adc(struct avr * const avr, uint16_t arg0, uint16_t arg1);
void avr_ins_and(struct avr * const avr, uint16_t arg0, uint16_t arg1);
void avr_ins_eor(struct avr * const avr, uint16_t arg0, uint16_t arg1);
void avr_ins_or(struct avr * const avr, uint16_t arg0, uint16_t arg1);
void avr_ins_mov(struct avr * const avr, uint16_t arg0, uint16_t arg1);
void avr_ins_cpi(struct avr * const avr, uint16_t arg0, uint16_t arg1);
void avr_ins_sbci(struct avr * const avr, uint16_t arg0, uint16_t arg1);
void avr_ins_subi(struct avr * const avr, uint16_t arg0, uint16_t arg1);
void avr_ins_ori(struct avr * const avr, uint16_t arg0, uint16_t arg1);
void avr_ins_andi(struct avr * const avr, uint16_t arg0, uint16_t arg1);
void avr_ins_ld_zpq(struct avr * const avr, uint16_t arg0, uint16_t arg1);
void avr_ins_ld_ypq(struct avr * const avr, uint16_t arg0, uint16_t arg1);
void avr_ins_st_zpq(struct avr * const avr, uint16_t arg0, uint16_t arg1);
void avr_ins_st_ypq(struct avr * const avr, uint16_t arg0, uint16_t arg1);
void avr_ins_lds(struct avr * const avr, uint16_t arg0, uint16_t arg1);
void avr_ins_ld_zp(struct avr * const avr, uint16_t arg0, uint16_t arg1);
void avr_ins_ld_mz(struct avr * const avr, uint16_t arg0, uint16_t arg1);
void avr_ins_lpm_z(struct avr * const avr, uint16_t arg0, uint16_t arg1);
void avr_ins_lpm_zp(struct avr * const avr, uint16_t arg0, uint16_t arg1);
void avr_ins_elpm_z(struct avr * const avr, uint16_t arg0, uint16_t arg1);
void avr_ins_elpm_zp(struct avr * const avr, uint16_t arg0, uint16_t arg1);
void avr_ins_ld_yp(struct avr * const avr, uint16_t arg0, uint16_t arg1);
void avr_ins_ld_my(struct avr * const avr, uint16_t arg0, uint16_t arg1);
void avr_ins_ld_x(struct avr * const avr, uint16_t arg0, uint16_t arg1);
void avr_ins_ld_xp(struct avr * const avr, uint16_t arg0, uint16_t arg1);
void avr_ins_ld_mx(struct avr * const avr, uint16_t arg0, uint16_t arg1);
void avr_ins_pop(struct avr * const avr, uint16_t arg0, uint16_t arg1);
void avr_ins_sts(struct avr * const avr, uint16_t arg0, uint16_t arg1);
void avr_ins_st_zp(struct avr * const avr, uint16_t arg0, uint16_t arg1);
void avr_ins_st_mz(struct avr * const avr, uint16_t arg0, uint16_t arg1);
void avr_ins_xch(struct avr * const avr, uint16_t arg0, uint16_t arg1);
void avr_ins_las(struct avr * const avr, uint16_t arg0, uint16_t arg1);
void avr_ins_lac(struct avr * const avr, uint16_t arg0, uint16_t arg1);
void avr_ins_lat(struct avr * const avr, uint16_t arg0, uint16_t arg1);
void avr_ins_st_yp(struct avr * const avr, uint16_t arg0, uint16_t arg1);
void avr_ins_st_my(struct avr * const avr, uint16_t arg0, uint16_t arg1);
void avr_ins_st_x(struct avr * const avr, uint16_t arg0, uint16_t arg1);
void avr_ins_st_xp(struct avr * const avr, uint16_t arg0, uint16_t arg1);
void avr_ins_st_mx(struct avr * const avr, uint16_t arg0, uint16_t arg1);
void avr_ins_push(struct avr * const avr, uint16_t arg0, uint16_t arg1);
void avr_ins_com(struct avr * const avr, uint16_t arg0, uint16_t arg1);
void avr_ins_neg(struct avr * const avr, uint16_t arg0, uint16_t arg1);
void avr_ins_swap(struct avr * const avr, uint16_t arg0, uint16_t arg1);
void avr_ins_inc(struct avr * const avr, uint16_t arg0, uint16_t arg1);
void avr_ins_asr(struct avr * const avr, uint16_t arg0, uint16_t arg1);
void avr_ins_lsr(struct avr * const avr, uint16_t arg0, uint16_t arg1);
void avr_ins_ror(struct avr * const avr, uint16_t arg0, uint16_t arg1);
void avr_ins_bset(struct avr * const avr, uint16_t arg0, uint16_t arg1);
void avr_ins_ijmp(struct avr * const avr, uint16_t arg0, uint16_t arg1);
void avr_ins_dec(struct avr * const avr, uint16_t arg0, uint16_t arg1);
void avr_ins_jmp(struct avr * const avr, uint16_t arg0, uint16_t arg1);
void avr_ins_call(struct avr * const avr, uint16_t arg0, uint16_t arg1);
void avr_ins_eijmp(struct avr * const avr, uint16_t arg0, uint16_t arg1);
void avr_ins_bclr(struct avr * const avr, uint16_t arg0, uint16_t arg1);
void avr_ins_ret(struct avr * const avr, uint16_t arg0, uint16_t arg1);
void avr_ins_icall(struct avr * const avr, uint16_t arg0, uint16_t arg1);
void avr_ins_reti(struct avr * const avr, uint16_t arg0, uint16_t arg1);
void avr_ins_eicall(struct avr * const avr, uint16_t arg0, uint16_t arg1);
void avr_ins_sleep(struct avr * const avr, uint16_t arg0, uint16_t arg1);
void avr_ins_break(struct avr * const avr, uint16_t arg0, uint16_t arg1);
void avr_ins_wdr(struct avr * const avr, uint16_t arg0, uint16_t arg1);
void avr_ins_lpm(struct avr * const avr, uint16_t arg0, uint16_t arg1);
void avr_ins_elpm_r0(struct avr * const avr, uint16_t arg0, uint16_t arg1);
void avr_ins_spm(struct avr * const avr, uint16_t arg0, uint16_t arg1);
void avr_ins_spm_zp(struct avr * const avr, uint16_t arg0, uint16_t arg1);
void avr_ins_adiw(struct avr * const avr, uint16_t arg0, uint16_t arg1);
void avr_ins_sbiw(struct avr * const avr, uint16_t arg0, uint16_t arg1);
void avr_ins_cbi(struct avr * const avr, uint16_t arg0, uint16_t arg1);
void avr_ins_sbic(struct avr * const avr, uint16_t arg0, uint16_t arg1);
void avr_ins_sbi(struct avr * const avr, uint16_t arg0, uint16_t arg1);
void avr_ins_sbis(struct avr * const avr, uint16_t arg0, uint16_t arg1);
void avr_ins_mul(struct avr * const avr, uint16_t arg0, uint16_t arg1);
/*void avr_ins_lds16(struct avr* const avr, uint16_t arg0, uint16_t arg1)*/
/*void avr_ins_sts16(struct avr* const avr, uint16_t arg0, uint16_t arg1)*/
void avr_ins_in(struct avr * const avr, uint16_t arg0, uint16_t arg1);
void avr_ins_out(struct avr * const avr, uint16_t arg0, uint16_t arg1);
void avr_ins_rjmp(struct avr * const avr, uint16_t arg0, uint16_t arg1);
void avr_ins_rcall(struct avr * const avr, uint16_t arg0, uint16_t arg1);
void avr_ins_ldi(struct avr * const avr, uint16_t arg0, uint16_t arg1);
void avr_ins_brbs(struct avr * const avr, uint16_t arg0, uint16_t arg1);
void avr_ins_brbc(struct avr * const avr, uint16_t arg0, uint16_t arg1);
void avr_ins_bld(struct avr * const avr, uint16_t arg0, uint16_t arg1);
void avr_ins_bst(struct avr * const avr, uint16_t arg0, uint16_t arg1);
void avr_ins_sbrc(struct avr * const avr, uint16_t arg0, uint16_t arg1);
void avr_ins_sbrs(struct avr * const avr, uint16_t arg0, uint16_t arg1);

struct emsc_avr_function_lookup
{
    void(*function)(struct avr * const, uint16_t, uint16_t);
    char mne[8];
};

static const struct emsc_avr_function_lookup emsc_avr_function_lookup[] = {
    {.function = &avr_ins_nop, .mne = "NOP"}, // NOP
    {.function = &avr_ins_movw, .mne = "MOVW"}, // MOVW Rd,Rr
    {.function = &avr_ins_muls, .mne = "MULS"}, // MULS Rd,Rr
    {.function = &avr_ins_mulsu, .mne = "MULSU"}, // MULSU Rd,Rr
    {.function = &avr_ins_fmul, .mne = "FLUL"}, // FMUL Rd,Rr
    {.function = &avr_ins_fmuls, .mne = "FMULS"}, // FMULS Rd,Rr
    {.function = &avr_ins_fmulsu, .mne = "FMULSU"}, // FMULSU Rd,Rr
    {.function = &avr_ins_cpc, .mne = "CPC"}, // CPC Rd,Rr
    {.function = &avr_ins_sbc, .mne = "SBC"}, // SBC Rd,Rr
    {.function = &avr_ins_add, .mne = "ADD"}, // ADD Rd,Rr
    {.function = &avr_ins_cpse, .mne = "CPSE"}, // CPSE Rd,Rr
    {.function = &avr_ins_cp, .mne = "CP"}, // CP Rd,Rr
    {.function = &avr_ins_sub, .mne = "SUB"}, // SUB Rd,Rr
    {.function = &avr_ins_adc, .mne = "ADC"}, // ADC Rd,Rr
    {.function = &avr_ins_and, .mne = "AND"}, // AND Rd,Rr
    {.function = &avr_ins_eor, .mne = "EOR"}, // EOR Rd,Rr
    {.function = &avr_ins_or, .mne = "OR"}, // OR Rd,Rr
    {.function = &avr_ins_mov, .mne = "MOV"}, // MOV Rd,Rr
    {.function = &avr_ins_cpi, .mne = "CPI"}, // CPI Rd,K
    {.function = &avr_ins_sbci, .mne = "SBCI"}, // SBCI Rd,k
    {.function = &avr_ins_subi, .mne = "SUBI"}, // SUBI Rd,K
    {.function = &avr_ins_ori, .mne = "ORI"}, // ORI Rd,K
    {.function = &avr_ins_andi, .mne = "ANDI"}, // ANDI Rd,K
    {.function = &avr_ins_ld_zpq, .mne = "LD_Z+Q"}, // LD Rd, Z+q
    {.function = &avr_ins_ld_ypq, .mne = "LD_Y+Q"}, // LD Rd, Y+q
    {.function = &avr_ins_st_zpq, .mne = "ST_Z+Q"}, // ST Z+q, Rr
    {.function = &avr_ins_st_ypq, .mne = "ST_Y+Q"}, // ST Y+q, Rr
    {.function = &avr_ins_lds, .mne = "LDS"}, // LDS Rd,k
    {.function = &avr_ins_ld_zp, .mne = "LD_Z+"}, // LD Rd, Z+
    {.function = &avr_ins_ld_mz, .mne = "LD_-Z"}, // LD Rd, -Z
    {.function = &avr_ins_lpm_z, .mne = "LPM_Z"}, // LPM Rd,Z
    {.function = &avr_ins_lpm_zp, .mne = "LPM_Z+"}, // LPM Rd Z+
    {.function = &avr_ins_elpm_z, .mne = "ELPM_Z"}, // ELPM, Z
    {.function = &avr_ins_elpm_zp, .mne = "ELPM_Z+"}, // ELPM, Z+
    {.function = &avr_ins_ld_yp, .mne = "LD_Y+"}, // LD Rd, Y+
    {.function = &avr_ins_ld_my, .mne = "LD_-Y"}, // LD Rd, -Y
    {.function = &avr_ins_ld_x, .mne = "LD_X"}, // LD Rd, X
    {.function = &avr_ins_ld_xp, .mne = "LD_X+"}, // LD Rd, X+
    {.function = &avr_ins_ld_mx, .mne = "LD_-X"}, // LD Rd, -X
    {.function = &avr_ins_pop, .mne = "POP"}, // POP Rd
    {.function = &avr_ins_sts, .mne = "STS"}, // STS k,Rd
    {.function = &avr_ins_st_zp, .mne = "ST_Z+"}, // ST Z+,Rr
    {.function = &avr_ins_st_mz, .mne = "ST_-Z"}, // ST -Z, Rr
    {.function = &avr_ins_xch, .mne = "XCH"}, // XCH Z,Rd
    {.function = &avr_ins_las, .mne = "LAS"}, // LAS Z,Rd
    {.function = &avr_ins_lac, .mne = "LAC"}, // LAC Z,Rd
    {.function = &avr_ins_lat, .mne = "LAT"}, // LAT Z,Rd
    {.function = &avr_ins_st_yp, .mne = "ST_Y+"}, // ST Y+,Rr
    {.function = &avr_ins_st_my, .mne = "ST_-Y"}, // ST -Y, Rr
    {.function = &avr_ins_st_x, .mne = "ST_X"}, // ST X,Rr
    {.function = &avr_ins_st_xp, .mne = "ST_X+"}, // ST X+,Rr
    {.function = &avr_ins_st_mx, .mne = "ST_-X"}, // ST -X, Rr
    {.function = &avr_ins_push, .mne = "PUSH"}, // PUSH Rr
    {.function = &avr_ins_com, .mne = "COM"}, // COM Rd
    {.function = &avr_ins_neg, .mne = "NEG"}, // NEG Rd
    {.function = &avr_ins_swap, .mne = "SWAP"}, // SWAP Rd
    {.function = &avr_ins_inc, .mne = "INC"}, // INC Rd
    {.function = &avr_ins_asr, .mne = "ASR"}, // ASR Rd
    {.function = &avr_ins_lsr, .mne = "LSR"}, // LSR Rd
    {.function = &avr_ins_ror, .mne = "ROR"}, // ROR Rd
    {.function = &avr_ins_bset, .mne = "BSET"}, // BSET
    {.function = &avr_ins_ijmp, .mne = "IJMP"}, // IJMP
    {.function = &avr_ins_dec, .mne = "DEC"}, // DEC Rd
    {.function = &avr_ins_jmp, .mne = "JMP"}, // JMP k
    {.function = &avr_ins_call, .mne = "CALL"}, // CALL
    {.function = &avr_ins_eijmp, .mne = "EIJMP"}, // EIJMP
    {.function = &avr_ins_bclr, .mne = "BCLR"}, // BCLR s
    {.function = &avr_ins_ret, .mne = "RET"}, // RET
    {.function = &avr_ins_icall, .mne = "ICALL"}, // ICALL
    {.function = &avr_ins_reti, .mne = "RETI"}, // RETI
    {.function = &avr_ins_eicall, .mne = "EICALL"}, // EICALL
    {.function = &avr_ins_sleep, .mne = "SLEEP"}, // SLEEP
    {.function = &avr_ins_break, .mne = "BREAK"}, // BREAK
    {.function = &avr_ins_wdr, .mne = "WDR"}, // WDR
    {.function = &avr_ins_lpm, .mne = "LPM"}, // LPM
    {.function = &avr_ins_elpm_r0, .mne = "ELPM"}, // ELPM
    {.function = &avr_ins_spm, .mne = "SPM"}, // SPM
    {.function = &avr_ins_spm_zp, .mne = "SPM_Z+"}, // SPM Z+
    {.function = &avr_ins_adiw, .mne = "ADIW"}, // ADIW Rp,uimm6
    {.function = &avr_ins_sbiw, .mne = "SBIW"}, // SBIW Rd+1:Rd,K
    {.function = &avr_ins_cbi, .mne = "CBI"}, // CBI A,b
    {.function = &avr_ins_sbic, .mne = "SBIC"}, // SBIC A,b
    {.function = &avr_ins_sbi, .mne = "SBI"}, // SBI A,b
    {.function = &avr_ins_sbis, .mne = "SBIS"}, // SBIS A,b
    {.function = &avr_ins_mul, .mne = "MUL"}, // MUL Rd,Rr
    //{.function = &avr_ins_lds16, .mne = "LDS"},   // LDS (16 bit)
    //{.function = &avr_ins_sts16, .mne = "STS"},   // STS k,Rd
    {.function = &avr_ins_in, .mne = "IN"}, // IN
    {.function = &avr_ins_out, .mne = "OUT"}, // OUT A,Rr
    {.function = &avr_ins_rjmp, .mne = "RJMP"}, // RJMP k
    {.function = &avr_ins_rcall, .mne = "RCALL"}, // RCALL k
    {.function = &avr_ins_ldi, .mne = "LDI"}, // LDI Rd,K
    {.function = &avr_ins_brbs, .mne = "BRBS"}, // BRBS s,k
    {.function = &avr_ins_brbc, .mne = "BRBC"}, // BRBC s,k
    {.function = &avr_ins_bld, .mne = "BLD"}, // BLD Rd,b
    {.function = &avr_ins_bst, .mne = "BST"}, // BST Rd,b
    {.function = &avr_ins_sbrc, .mne = "SBRC"}, // SBRC Rr,b
    {.function = &avr_ins_sbrs, .mne = "SBRS"}, // SBRS Rr,b
};

uint32_t emsc_atmega328_get_pc(const struct atmega328 * const mega)
{
    return mega->avr.pc;
}

const char*
emsc_atmega328_get_instruction_name(const struct atmega328 * const mega)
{
    static char fnf[] = "instruction_not_found";

    size_t i = 0;
    size_t limit = sizeof (emsc_avr_function_lookup) /
            sizeof (emsc_avr_function_lookup[0]);
    while ((emsc_avr_function_lookup[i].function !=
            mega->avr.pmem.decoded[mega->avr.pc].function) && (i < limit))
    {
        ++i;
    }
    if (i == limit)
    {
        return fnf;
    }
    return emsc_avr_function_lookup[i].mne;
}

void emsc_atmega328_tick(struct atmega328 * const mega)
{
    atmega328_tick(mega);
}

void emsc_atmega328_uart0_write(struct atmega328 * const mega,
                                const uint8_t value)
{
    atmega328_uart0_write(mega, value);
}

void emsc_atmega328_pmem_write_byte(struct atmega328 * const mega,
                                    const uint32_t address,
                                    const uint8_t data)
{
    atmega328_pmem_write_byte(&mega->avr.pmem, address, data);
}

void emsc_atmega328_destroy(struct atmega328 * const mega)
{
    free(mega);
}

void emsc_atmega328_reinit(struct atmega328 * const mega)
{
    atmega328_reinit(mega);
}

struct atmega328* emsc_atmega328_init(void(* const uart0_cb) (void*, uint8_t),
                                      void(* const sleep_cb) (void*, uint8_t),
                                    unsigned char bootsz, unsigned char bootrst)
{
    struct atmega328* mega = malloc(sizeof (*mega));
    if (mega != 0)
    {
        struct atmega328_callbacks callbacks = {
            .uart0 = uart0_cb,
            .sleep = sleep_cb
        };
        struct atmega328_config config = {
            .bootsz = bootsz,
            .bootrst = bootrst
        };
        atmega328_init(mega, callbacks, config);
    }
    return mega;
}

uint32_t emsc_atmega128_get_pc(const struct atmega128 * const mega)
{
    return mega->avr.pc;
}

const char*
emsc_atmega128_get_instruction_name(const struct atmega128 * const mega)
{
    static char fnf[] = "instruction_not_found";

    size_t i = 0;
    size_t limit = sizeof (emsc_avr_function_lookup) /
            sizeof (emsc_avr_function_lookup[0]);
    while ((emsc_avr_function_lookup[i].function !=
            mega->avr.pmem.decoded[mega->avr.pc].function) && (i < limit))
    {
        ++i;
    }
    if (i == limit)
    {
        return fnf;
    }
    return emsc_avr_function_lookup[i].mne;
}

void emsc_atmega128_tick(struct atmega128 * const mega)
{
    atmega128_tick(mega);
}

void emsc_atmega128_uart0_write(struct atmega128 * const mega,
                                const uint8_t value)
{
    atmega128_uart0_write(mega, value);
}

void emsc_atmega128_pmem_write_byte(struct atmega128 * const mega,
                                    const uint32_t address,
                                    const uint8_t data)
{
    atmega128_pmem_write_byte(&mega->avr.pmem, address, data);
}

void emsc_atmega128_destroy(struct atmega128 * const mega)
{
    free(mega);
}

void emsc_atmega128_reinit(struct atmega128 * const mega)
{
    atmega128_reinit(mega);
}

struct atmega128* emsc_atmega128_init(void(* const uart0_cb) (void*, uint8_t),
                                      void(* const sleep_cb) (void*, uint8_t),
                                    unsigned char bootsz, unsigned char bootrst)
{
    struct atmega128* mega = malloc(sizeof (*mega));
    if (mega != 0)
    {
        struct atmega128_callbacks callbacks = {
            .uart0 = uart0_cb,
            .sleep = sleep_cb
        };
        struct atmega128_config config = {
            .bootsz = bootsz,
            .bootrst = bootrst
        };
        atmega128_init(mega, callbacks, config);

    }
    return mega;
}

uint32_t emsc_attiny1634_get_pc(const struct attiny1634 * const tiny)
{
    return tiny->avr.pc;
}

const char*
emsc_attiny1634_get_instruction_name(const struct attiny1634 * const tiny)
{
    static char fnf[] = "instruction_not_found";

    size_t i = 0;
    size_t limit = sizeof (emsc_avr_function_lookup) /
            sizeof (emsc_avr_function_lookup[0]);
    while ((emsc_avr_function_lookup[i].function !=
            tiny->avr.pmem.decoded[tiny->avr.pc].function) && (i < limit))
    {
        ++i;
    }
    if (i == limit)
    {
        return fnf;
    }
    return emsc_avr_function_lookup[i].mne;
}

void emsc_attiny1634_tick(struct attiny1634 * const tiny)
{
    attiny1634_tick(tiny);
}

void emsc_attiny1634_uart0_write(struct attiny1634 * const tiny,
                                 const uint8_t value)
{
    attiny1634_uart0_write(tiny, value);
}

void emsc_attiny1634_pmem_write_byte(struct attiny1634 * const tiny,
                                     const uint32_t address,
                                     const uint8_t data)
{
    attiny1634_pmem_write_byte(&tiny->avr.pmem, address, data);
}

void emsc_attiny1634_destroy(struct attiny1634 * const tiny)
{
    free(tiny);
}

void emsc_attiny1634_reinit(struct attiny1634 * const tiny)
{
    attiny1634_reinit(tiny);
}

struct attiny1634* emsc_attiny1634_init(void(* const uart0_cb) (void*, uint8_t),
                                        void(* const sleep_cb) (void*, uint8_t))
{
    struct attiny1634* tiny = malloc(sizeof (*tiny));
    if (tiny != 0)
    {
        struct attiny1634_callbacks callbacks = {
            .uart0 = uart0_cb,
            .sleep = sleep_cb
        };
        attiny1634_init(tiny, callbacks);
    }
    return tiny;
}
