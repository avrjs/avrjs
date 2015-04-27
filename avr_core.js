/*
avr_core.js - An Atmel (TM) AVR (TM) simulator

Copyright (C) 2015  Julian Ingram

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

// this is the core module, it implements the entire instruction set.

"use strict";

function uint32_tostr(number)
{
    // >>> makes the number unsigned
    // & 0xFFFF gets rid of the more significant set bits if the number is
    // actually stored as a 32 bit signed int
    // .slice and the "000" format the number to be always 4 digits
    return(("0000000" + (((number >>> 0) & 0xFFFFFFFF).toString(16))).slice(-8));
}

function uint16_tostr(number)
{
    // >>> makes the number unsigned
    // & 0xFFFF gets rid of the more significant set bits if the number is
    // actually stored as a 32 bit signed int
    // .slice and the "000" format the number to be always 4 digits
    return(("000" + (((number >>> 0) & 0xFFFF).toString(16))).slice(-4));
}

function uint8_tostr(number)
{
    // the >>> makes the number unsigned
    // the & 0xFFFF gets rid of the more significant set bits if the number is
    // actually stored as a 32 bit signed int
    // .slice and the "0" format the number to be always 2 digits
    return(("0" + (((number >>> 0) & 0xFF).toString(16))).slice(-2));
}

function core(dmem, pmem, pc_size_bytes)
{
  var instructions = [
      {p: 0x0000, m: 0xFFFF, w: 1, f: ins_nop},     // NOP
      {p: 0x0100, m: 0xFF00, w: 1, f: ins_movw},    // MOVW Rd,Rr
      {p: 0x0200, m: 0xFF00, w: 1, f: ins_muls},    // MULS Rd,Rr
      {p: 0x0300, m: 0xFF88, w: 1, f: ins_mulsu},   // MULSU Rd,Rr
      {p: 0x0308, m: 0xFF88, w: 1, f: ins_fmul},    // FMUL Rd,Rr
      {p: 0x0380, m: 0xFF88, w: 1, f: ins_fmuls},   // FMULS Rd,Rr
      {p: 0x0388, m: 0xFF88, w: 1, f: ins_fmulsu},  // FMULSU Rd,Rr
      {p: 0x0400, m: 0xFC00, w: 1, f: ins_cpc},     // CPC Rd,Rr
      {p: 0x0800, m: 0xFC00, w: 1, f: ins_sbc},     // SBC Rd,Rr
      {p: 0x0C00, m: 0xFC00, w: 1, f: ins_add},     // ADD Rd,Rr
      {p: 0x1000, m: 0xFC00, w: 1, f: ins_cpse},    // CPSE Rd,Rr
      {p: 0x1400, m: 0xFC00, w: 1, f: ins_cp},      // CP Rd,Rr
      {p: 0x1800, m: 0xFC00, w: 1, f: ins_sub},     // SUB Rd,Rr
      {p: 0x1C00, m: 0xFC00, w: 1, f: ins_adc},     // ADC Rd,Rr
      {p: 0x2000, m: 0xFC00, w: 1, f: ins_and},     // AND Rd,Rr
      {p: 0x2400, m: 0xFC00, w: 1, f: ins_eor},     // EOR Rd,Rr
      {p: 0x2800, m: 0xFC00, w: 1, f: ins_or},      // OR Rd,Rr
      {p: 0x2C00, m: 0xFC00, w: 1, f: ins_mov},     // MOV Rd,Rr
      {p: 0x3000, m: 0xF000, w: 1, f: ins_cpi},     // CPI Rd,K
      {p: 0x4000, m: 0xF000, w: 1, f: ins_sbci},    // SBCI Rd,k
      {p: 0x5000, m: 0xF000, w: 1, f: ins_subi},    // SUBI Rd,K
      {p: 0x6000, m: 0xF000, w: 1, f: ins_ori},     // ORI Rd,K
      {p: 0x7000, m: 0xF000, w: 1, f: ins_andi},    // ANDI Rd,K
      {p: 0x8000, m: 0xD208, w: 1, f: ins_ld_zpq},  // LD Rd, Z+q
      {p: 0x8008, m: 0xD208, w: 1, f: ins_ld_ypq},  // LD Rd, Y+q
      {p: 0x8200, m: 0xD208, w: 1, f: ins_st_zpq},  // ST Z+q, Rr
      {p: 0x8208, m: 0xD208, w: 1, f: ins_st_ypq},  // ST Y+q, Rr
      {p: 0x9000, m: 0xFE0F, w: 2, f: ins_lds},     // LDS Rd,k
      {p: 0x9001, m: 0xFE0F, w: 1, f: ins_ld_zp},   // LD Rd, Z+
      {p: 0x9002, m: 0xFE0F, w: 1, f: ins_ld_mz},   // LD Rd, -Z
      {p: 0x9004, m: 0xFE0F, w: 1, f: ins_lpm_z},   // LPM Rd,Z
      {p: 0x9005, m: 0xFE0F, w: 1, f: ins_lpm_zp},  // LPM Rd Z+
      {p: 0x9006, m: 0xFE0F, w: 1, f: ins_elpm_z},  // ELPM, Z
      {p: 0x9007, m: 0xFE0F, w: 1, f: ins_elpm_zp}, // ELPM, Z+
      {p: 0x9009, m: 0xFE0F, w: 1, f: ins_ld_yp},   // LD Rd, Y+
      {p: 0x900A, m: 0xFE0F, w: 1, f: ins_ld_my},   // LD Rd, -Y
      {p: 0x900C, m: 0xFE0F, w: 1, f: ins_ld_x},    // LD Rd, X
      {p: 0x900D, m: 0xFE0F, w: 1, f: ins_ld_xp},   // LD Rd, X+
      {p: 0x900E, m: 0xFE0F, w: 1, f: ins_ld_mx},   // LD Rd, -X
      {p: 0x900F, m: 0x9E0F, w: 1, f: ins_pop},     // POP Rd
      {p: 0x9200, m: 0xFE0F, w: 2, f: ins_sts},     // STS k,Rd
      {p: 0x9201, m: 0xFE0F, w: 1, f: ins_st_zp},   // ST Z+,Rr
      {p: 0x9202, m: 0xFE0F, w: 1, f: ins_st_mz},   // ST -Z, Rr
      {p: 0x9204, m: 0xFE0F, w: 1, f: ins_xch},     // XCH Z,Rd
      {p: 0x9205, m: 0xFE0F, w: 1, f: ins_las},     // LAS Z,Rd
      {p: 0x9206, m: 0xFE0F, w: 1, f: ins_lac},     // LAC Z,Rd
      {p: 0x9207, m: 0xFE0F, w: 1, f: ins_lat},     // LAT Z,Rd
      {p: 0x9209, m: 0xFE0F, w: 1, f: ins_st_yp},   // ST Y+,Rr
      {p: 0x920A, m: 0xFE0F, w: 1, f: ins_st_my},   // ST -Y, Rr
      {p: 0x920C, m: 0xFE0F, w: 1, f: ins_st_x},    // ST X,Rr
      {p: 0x920D, m: 0xFE0F, w: 1, f: ins_st_xp},   // ST X+,Rr
      {p: 0x920E, m: 0xFE0F, w: 1, f: ins_st_mx},   // ST -X, Rr
      {p: 0x920F, m: 0xFE0F, w: 1, f: ins_push},    // PUSH Rr
      {p: 0x9400, m: 0xFE0F, w: 1, f: ins_com},     // COM Rd
      {p: 0x9401, m: 0xFE0F, w: 1, f: ins_neg},     // NEG Rd
      {p: 0x9402, m: 0xFE0F, w: 1, f: ins_swap},    // SWAP Rd
      {p: 0x9403, m: 0xFE0F, w: 1, f: ins_inc},     // INC Rd
      {p: 0x9405, m: 0xFE0F, w: 1, f: ins_asr},     // ASR Rd
      {p: 0x9406, m: 0xFE0F, w: 1, f: ins_lsr},     // LSR Rd
      {p: 0x9407, m: 0xFE0F, w: 1, f: ins_ror},     // ROR Rd
      {p: 0x9408, m: 0xFF8F, w: 1, f: ins_bset},    // BSET
      {p: 0x9409, m: 0xFFFF, w: 1, f: ins_ijmp},    // IJMP
      {p: 0x940A, m: 0xFE0F, w: 1, f: ins_dec},     // DEC Rd
      {p: 0x940C, m: 0xFE0E, w: 2, f: ins_jmp},     // JMP k
      {p: 0x940E, m: 0xFE0E, w: 2, f: ins_call},    // CALL
      {p: 0x9419, m: 0xFFFF, w: 1, f: ins_eijmp},   // EIJMP
      {p: 0x9488, m: 0xFF8F, w: 1, f: ins_bclr},    // BCLR s
      {p: 0x9508, m: 0xFFFF, w: 1, f: ins_ret},     // RET
      {p: 0x9509, m: 0xFFFF, w: 1, f: ins_icall},   // ICALL
      {p: 0x9518, m: 0xFFFF, w: 1, f: ins_reti},    // RETI
      {p: 0x9519, m: 0xFFFF, w: 1, f: ins_eicall},  // EICALL
      {p: 0x9588, m: 0xFFFF, w: 1, f: ins_sleep},   // SLEEP
      {p: 0x9598, m: 0xFFFF, w: 1, f: ins_break},   // BREAK
      {p: 0x95A8, m: 0xFFFF, w: 1, f: ins_wdr},     // WDR
      {p: 0x95C8, m: 0xFFFF, w: 1, f: ins_lpm},     // LPM
      {p: 0x95D8, m: 0xFFFF, w: 1, f: ins_elpm},    // ELPM
      {p: 0x95E8, m: 0xFFFF, w: 1, f: ins_spm},     // SPM
      {p: 0x95F8, m: 0xFFFF, w: 1, f: ins_spm_zp},  // SPM Z+
      {p: 0x9600, m: 0xFF00, w: 1, f: ins_adiw},    // ADIW Rp,uimm6
      {p: 0x9700, m: 0xFF00, w: 1, f: ins_sbiw},    // SBIW Rd+1:Rd,K
      {p: 0x9800, m: 0xFF00, w: 1, f: ins_cbi},     // CBI A,b
      {p: 0x9900, m: 0xFF00, w: 1, f: ins_sbic},    // SBIC A,b
      {p: 0x9A00, m: 0xFF00, w: 1, f: ins_sbi},     // SBI A,b
      {p: 0x9B00, m: 0xFF00, w: 1, f: ins_sbis},    // SBIS A,b
      {p: 0x9C00, m: 0xFC00, w: 1, f: ins_mul},     // MUL Rd,Rr
      //{p: 0xA000, m: 0xF800, w: 1, f: ins_lds16},   // LDS (16 bit)
      //{p: 0xA800, m: 0xF800, w: 1, f: ins_sts16},   // STS k,Rd
      {p: 0xB000, m: 0xF800, w: 1, f: ins_in},      // IN
      {p: 0xB800, m: 0xF800, w: 1, f: ins_out},     // OUT A,Rr
      {p: 0xC000, m: 0xF000, w: 1, f: ins_rjmp},    // RJMP k
      {p: 0xD000, m: 0xF000, w: 1, f: ins_rcall},   // RCALL k
      {p: 0xE000, m: 0xF000, w: 1, f: ins_ldi},     // LDI Rd,K
      {p: 0xF000, m: 0xFC00, w: 1, f: ins_brbs},    // BRBS s,k
      {p: 0xF400, m: 0xFC00, w: 1, f: ins_brbc},    // BRBC s,k
      {p: 0xF800, m: 0xFE08, w: 1, f: ins_bld},     // BLD Rd,b
      {p: 0xFA00, m: 0xFE08, w: 1, f: ins_bst},     // BST Rd,b
      {p: 0xFC00, m: 0xFE08, w: 1, f: ins_sbrc},    // SBRC Rr,b
      {p: 0xFE00, m: 0xFE08, w: 1, f: ins_sbrs},    // SBRS Rr,b
  ];

  // extract bit and justify (returns either 1 or 0)
  function ebj(number, bit)
  {
    return (number & (1 << bit)) >> bit;
  }

  // extract the complement of a bit and justify (returns either 1 or 0)
  function ebjn(number, bit)
  {
    return ebj(number, bit) ^ 1;
  }

  // carry1: Rd7 & Rr7 | Rr7 & !R7 | !R7 & Rd7
  function c1(Rd, Rr, R)
  {
    if (((ebj(Rd, 7) & ebj(Rr, 7)) | (ebj(Rr, 7) & ebjn(R, 7))
    | (ebjn(R, 7) & ebj(Rd, 7))) != 0)
    {
        dmem.sreg.c.set();
    }
    else
    {
        dmem.sreg.c.clear();
    }
  }

  // carry2: !R15 & Rdh7
  function c2(Rdh, R)
  {
    if ((ebjn(R, 15) & ebj(Rdh, 7)) != 0)
    {
        dmem.sreg.c.set();
    }
    else
    {
        dmem.sreg.c.clear();
    }
  }

  // carry3: Rd0
  function c3(Rd)
  {
    if ((Rd & 0x01) != 0)
    {
        dmem.sreg.c.set();
    }
    else
    {
        dmem.sreg.c.clear();
    }
  }

  // carry4: !Rd7 & Rr7 | Rr7 & R7 | R7 & !Rd7
  function c4(Rd, Rr, R)
  {
    if (((ebjn(Rd, 7) & ebj(Rr, 7))
    | (ebj(Rr, 7) & ebj(R, 7)) | (ebj(R, 7) & ebjn(Rd, 7))) != 0)
    {
        dmem.sreg.c.set();
    }
    else
    {
        dmem.sreg.c.clear();
    }
  }

  // carry5: Rd7
  function c5(Rd)
  {
    if ((Rd & 0x80) != 0)
    {
        dmem.sreg.c.set();
    }
    else
    {
        dmem.sreg.c.clear();
    }
  }

  // carry6: R15
  function c6(R)
  {
    if ((R & 0x8000) != 0)
    {
        dmem.sreg.c.set();
    }
    else
    {
        dmem.sreg.c.clear();
    }
  }

  // carry7: R7 | R6 | R5 | R4 | R3 | R2 | R1 | R0
  function c7(R)
  {
    if ((R & 0xFF) == 0)
    {
        dmem.sreg.c.set();
    }
    else
    {
        dmem.sreg.c.clear();
    }
  }

  // carry8: R15 & !Rdh7
  function c8(Rdh, R)
  {
    if ((ebj(R, 15) & ebjn(Rdh, 7)) != 0)
    {
        dmem.sreg.c.set();
    }
    else
    {
        dmem.sreg.c.clear();
    }
  }


  // zero1: !R7 & !R6 & !R5 & !R4 & !R3 & !R2 & !R1 & !R0
  function z1(R)
  {
    if ((R & 0xFF) == 0)
    {
        dmem.sreg.z.set();
    }
    else
    {
        dmem.sreg.z.clear();
    }
  }

  // zero2: !R15 & !R14 & !R13 & !R12 & !R11 & !R10 & !R9 & !R8 & !R7 & !R6
  // & !R5 & !R4 & !R3 & !R2 & !R1 & !R0
  function z2(R)
  {
    if ((R & 0xFFFF) == 0)
    {
        dmem.sreg.z.set();
    }
    else
    {
        dmem.sreg.z.clear();
    }
  }

  // zero3: !R7 & !R6 & !R5 & !R4 & !R3 & !R2 & !R1 & !R0 & Z
  function z3(R)
  {
    if ((R & 0xFF) != 0)
    {
        dmem.sreg.z.clear();
    }
  }

  // negative1: R7
  function n1(R)
  {
    if ((R & 0x80) != 0)
    {
        dmem.sreg.n.set();
    }
    else
    {
        dmem.sreg.n.clear();
    }
  }

  // negative2: R15
  function n2(R)
  {
    if ((R & 0x8000) != 0)
    {
        dmem.sreg.n.set();
    }
    else
    {
        dmem.sreg.n.clear();
    }
  }

  // twos complement overflow1: Rd7 & Rr7 & !R7 | !Rd7 & !Rr7 & R7
  function v1(Rd, Rr, R)
  {
    if (((ebj(Rd, 7) & ebj(Rr, 7) & ebjn(R, 7)) | (ebjn(Rd, 7)
    & ebjn(Rr, 7) & ebj(R, 7))) != 0)
    {
        dmem.sreg.v.set();
    }
    else
    {
        dmem.sreg.v.clear();
    }
  }

  // twos complement overflow2: !Rdh7 & R15
  function v2(Rdh, R)
  {
    if ((ebjn(Rdh, 7) & ebj(R, 15)) != 0)
    {
        dmem.sreg.v.set();
    }
    else
    {
        dmem.sreg.v.clear();
    }
  }

  // twos complement overflow3: N ^ C
  function v3()
  {
      if ((dmem.sreg.n.read() ^ dmem.sreg.c.read()) != 0)
      {
          dmem.sreg.v.set();
      }
      else
      {
          dmem.sreg.v.clear();
      }
  }

  // twos complement overflow4: Rd7 & !Rr7 & !R7 | !Rd7 & Rr7 & R7
  function v4(Rd, Rr, R)
  {
    if (((ebj(Rd, 7) & ebjn(Rr, 7) & ebjn(R, 7)) | (ebjn(Rd, 7)
    & ebj(Rr, 7) & ebj(R, 7))) != 0)
    {
        dmem.sreg.v.set();
    }
    else
    {
        dmem.sreg.v.clear();
    }
  }

  // twos complement overflow5: !R7 & R6 & R5 & R4 & R3 & R2 & R1 & R0
  function v5(R)
  {
    if (R == 0x80)
    {
        dmem.sreg.v.set();
    }
    else
    {
        dmem.sreg.v.clear();
    }
  }

  // twos complement overflow6: R7 & !R6 & !R5 & !R4 & !R3 & !R2 & !R1 & !R0
  function v6(R)
  {
    if (R == 0x7F)
    {
        dmem.sreg.v.set();
    }
    else
    {
        dmem.sreg.v.clear();
    }
  }

  // twos complement overflow7: Rdh7 & !R15
  function v7(Rdh, R)
  {
    if ((ebj(Rdh, 7) & ebjn(R, 15)) != 0)
    {
        dmem.sreg.v.set();
    }
    else
    {
        dmem.sreg.v.clear();
    }
  }

  // sign: N ^ V
  function s1()
  {
    if ((dmem.sreg.n.read() ^ dmem.sreg.v.read()) != 0)
    {
        dmem.sreg.s.set();
    }
    else
    {
        dmem.sreg.s.clear();
    }
  }

  // half carry1: Rd3 & Rr3 | Rr3 & !R3 | !R3 & Rd3
  function h1(Rd, Rr, R)
  {

    if (((ebj(Rd, 3) & ebj(Rr, 3)) | (ebj(Rr, 3) & ebjn(R, 3))
    | (ebjn(R, 3) & ebj(Rd, 3))) != 0)
    {
        dmem.sreg.h.set();
    }
    else
    {
        dmem.sreg.h.clear();
    }
  }

  // half carry2: !Rd3 & Rr3 | Rr3 & R3 | R3 & !Rd3
  function h2(Rd, Rr, R)
  {
    if (((ebjn(Rd, 3) & ebj(Rr, 3)) | (ebj(Rr, 3) & ebj(R, 3))
    | (ebj(R, 3) & ebjn(Rd, 3))) != 0)
    {
        dmem.sreg.h.set();
    }
    else
    {
        dmem.sreg.h.clear();
    }
  }

  // half carry3: Rd3
  function h3(Rd)
  {
    if ((Rd & 0x08) != 0)
    {
        dmem.sreg.h.set();
    }
    else
    {
        dmem.sreg.h.clear();
    }
  }

  // half carry4: R3 | Rd3
  function h4(Rd, R)
  {
    if ((ebj(R, 3) | ebj(Rd, 3)) != 0)
    {
      dmem.sreg.h.set();
    }
    else
    {
        dmem.sreg.h.clear();
    }
  }

  function x01F0(instruction)
  {
    return (instruction & 0x01F0) >> 4;
  }

  function x020F(instruction)
  {
    return (instruction & 0x000F) | (instruction & 0x0200) >> 5;
  }

  function x0030(instruction)
  {
    return (instruction & 0x0030) >> 4;
  }

  function x00CF(instruction)
  {
    return (instruction & 0x000F) | (instruction & 0x00C0) >> 2;
  }

  function x0F0F(instruction)
  {
    return (instruction & 0x000F) | (instruction & 0x0F00) >> 4;
  }

  function x00F0(instruction)
  {
    return (instruction & 0x00F0) >> 4;
  }

  function x0070(instruction)
  {
    return (instruction & 0x0070) >> 4;
  }

  function x0007(instruction)
  {
    return instruction & 0x0007;
  }

  function x03F8(instruction)
  {
    return (instruction & 0x03F8) >> 3;
  }

  function xFFFF01F1(instruction)
  {
    return ((instruction & 0x000001F0) << 13)
    | ((instruction & 0xFFFF0000) >> 16)
    | ((instruction & 0x00000001) << 16);
  }

  function x01F1(instruction)
  {
    return ((instruction & 0x01F0) >> 3) | (instruction & 0x0001);
  }

  function x00F8(instruction)
  {
    return (instruction & 0x00F8) >> 3;
  }

  function x03FF(instruction)
  {
    return instruction & 0x03FF;
  }

  function x060F(instruction)
  {
    return (instruction & 0x000F) | ((instruction & 0x0600) >> 5);
  }

  function x2C07(instruction)
  {
    return (instruction & 0x0007) | ((instruction & 0x0C00) >> 7)
      | ((instruction & 0x2000) >> 8);
  }

  function xFFFF0000(instruction)
  {
    return (instruction & 0xFFFF0000) >> 16;
  }

  function x070F(instruction)
  {
    return (instruction & 0x000F) | ((instruction & 0x0700) >> 4);
  }

  function x000F(instruction)
  {
    return instruction & 0x000F;
  }

  function x0FFF(instruction)
  {
    return instruction & 0x0FFF;
  }

  function pop()
  {
    var sp = dmem.sp.read() + 1;
    dmem.sp.write(sp);
    //console.log("pull from: " + uint16_tostr(sp) + " : " + uint8_tostr(dmem.read(sp)));
    return dmem.read(sp);
  }

  function push(Rd)
  {
    var sp = dmem.sp.read();
    dmem.write(sp, Rd);
    //console.log("push to: " + uint16_tostr(sp) + " : " + uint8_tostr(Rd));
    dmem.sp.write(sp - 1);
  }

  function skip(pc)
  {
    var instruction = pmem.read(pc);
    var i = 0;
    while ((i < instructions.length) && ((instruction &
        instructions[i].m) != instructions[i].p))
    {
        ++i;
    }

    return pc + instructions[i].w;
  }

  // adds a register to annother, includes the carry bit in the status reg
  function ins_adc(instruction, pc)
  {
    var d = x01F0(instruction);
    var r = x020F(instruction);
    var Rd = dmem.read(d);
    var Rr = dmem.read(r);

    var R = ((((Rd + Rr) & 0xFF) + dmem.sreg.c.read()) & 0xFF);

    c1(Rd, Rr, R);
    z1(R);
    n1(R);
    v1(Rd, Rr, R);
    s1();
    h1(Rd, Rr, R);

    dmem.write(d, R);

    return pc + 1;
  }

  // adds a register to annother, treats carry as 0
  function ins_add(instruction, pc)
  {
    var d = x01F0(instruction);
    var r = x020F(instruction);
    var Rd = dmem.read(d);
    var Rr = dmem.read(r);

    var R = ((Rd + Rr) & 0xFF);

    c1(Rd, Rr, R);
    z1(R);
    n1(R);
    v1(Rd, Rr, R);
    s1();
    h1(Rd, Rr, R);

    dmem.write(d, R);

    return pc + 1;
  }

  // adds a literal to a register pair
  function ins_adiw(instruction, pc)
  {
    var K = x00CF(instruction);
    var d = 24 + (x0030(instruction) << 1);
    var Rd = dmem.read(d);
    var Rdh = dmem.read(d + 1);
    Rd |= Rdh << 8;

    var R = ((Rd + K) & 0xFFFF);

    c2(Rdh);
    z2(R);
    n2(R);
    v2(Rdh, R);
    s1();

    dmem.write(d, R & 0xFF);
    dmem.write(d + 1, (R >> 8) & 0xFF);

    return pc + 1;
  }

  // ands two registers and puts the result in the first
  function ins_and(instruction, pc)
  {
    var d = x01F0(instruction);
    var r = x020F(instruction);
    var Rd = dmem.read(d);
    var Rr = dmem.read(r);

    var R = Rd & Rr;

    z1(R);
    n1(R);
    s1();

    dmem.write(d, R);

    return pc + 1;
  }

  // ands a register and a literal, putting the result in the register
  function ins_andi(instruction, pc)
  {
    var d = 16 + x00F0(instruction);
    var K = x0F0F(instruction);
    var Rd = dmem.read(d);

    var R = Rd & K;

    z1(R);
    n1(R);
    s1();

    dmem.write(d, R);

    return pc + 1;
  }

  // shift right
  function ins_asr(instruction, pc)
  {
    var d = x01F0(instruction);
    var Rd = dmem.read(d);

    var R = Rd >> 1;

    c3(Rd);
    z1(R);
    n1(R);
    v3();
    s1();

    dmem.write(d, R);

    return pc + 1;
  }

  // clear a bit in sreg
  function ins_bclr(instruction, pc)
  {
    var s = x0070(instruction);

    dmem.write(dmem.sreg.loc,  dmem.read(dmem.sreg.loc) & ~(1 << s));

    return pc + 1;
  }

  // load a bit from sreg storage
  function ins_bld(instruction, pc)
  {
    var d = x01F0(instruction);
    var b = x0007(instruction);

    if (dmem.sreg.read_t() != 0)
    {
      dmem.write(d, dmem.read(d) | (1 << b));
    }
    else
    {
      dmem.write(d, dmem.read(d) & ~(1 << b));
    }

    return pc + 1;
  }

  // branch if bit in sreg is clear
  function ins_brbc(instruction, pc)
  {
    var s = x0007(instruction);
    if ((dmem.read(dmem.sreg.loc) & (1 << s)) == 0)
    {
      var kp = (instruction & 0x01F8) >> 3;
      var kn = (instruction & 0x0200) >> 3;
      pc += kp;
      pc -= kn;
    }

    return pc + 1;
  }

  // branch if bit in sreg is set
  function ins_brbs(instruction, pc)
  {
    var s = x0007(instruction);
    if ((dmem.read(dmem.sreg.loc) & (1 << s)) != 0)
    {
      var kp = (instruction & 0x01F8) >> 3;
      var kn = (instruction & 0x0200) >> 3;
      pc += kp;
      pc -= kn;
    }

    return pc + 1;
  }

  function ins_break(instruction, pc)
  {
    // treat as noop
    return pc + 1;
  }

  // set bit in status register
  function ins_bset(instruction, pc)
  {
    var s = x0070(instruction);

    dmem.write(dmem.sreg.loc, dmem.read(dmem.sreg.loc) | (1 << s));

    return pc + 1;
  }

  // store a bit in the sreg
  function ins_bst(instruction, pc)
  {
    var d = x01F0(instruction);
    var b = x0007(instruction);

    if ((dmem.read(d) & (1 << b)) != 0)
    {
      dmem.sreg.t.set();
    }
    else
    {
      dmem.sreg.t.clear();
    }

    return pc + 1;
  }

  // calls a subroutine (32 bit instruction)
  function ins_call(instruction, pc)
  {
    // push pc + 2 onto the stack
    var pc_ret = pc + 2;
    for (var i = pc_size_bytes - 1; i >= 0; --i)
    {
      push((pc_ret >> (i << 3)) & 0xFF);
    }
    return xFFFF01F1(instruction);
  }

  // clear a bit in IO register
  function ins_cbi(instruction, pc)
  {
    var A = x00F8(instruction);
    var b = x0007(instruction);

    dmem.write(A + 0x20, dmem.read(A + 0x20) & ~(1 << b));

    return pc + 1;
  }

  function ins_com(instruction, pc)
  {
    var d = x01F0(instruction);
    var Rd = dmem.read(d);

    var R = (~Rd) & 0xFF;

    dmem.sreg.c.set();
    z1(R);
    n1(R);
    dmem.sreg.v.clear();
    s1();

    dmem.write(d, R);

    return pc + 1;
  }

  function ins_cp(instruction, pc)
  {
    var d = x01F0(instruction);
    var r = x020F(instruction);
    var Rd = dmem.read(d);
    var Rr = dmem.read(r);

    var R = Rd - Rr;

    c4(Rd, Rr, R);
    z1(R);
    n1(R);
    v4(Rd, Rr, R);
    s1();
    h2(Rd, Rr, R);

    return pc + 1;
  }

  function ins_cpc(instruction, pc)
  {
    var d = x01F0(instruction);
    var r = x020F(instruction);
    var Rd = dmem.read(d);
    var Rr = dmem.read(r);

    var R = (Rd - Rr) - dmem.sreg.c.read();

    c4(Rd, Rr, R);
    z3(R);
    n1(R);
    v4(Rd, Rr, R);
    s1();
    h2(Rd, Rr, R);

    return pc + 1;
  }

  function ins_cpi(instruction, pc)
  {
    var d = 16 + x00F0(instruction);
    var K = x0F0F(instruction);
    var Rd = dmem.read(d);

    var R = Rd - K;

    c4(Rd, K, R);
    z1(R);
    n1(R);
    v4(Rd, K, R);
    s1();
    h2(Rd, K, R);

    return pc + 1;
  }

  // compare skip if equal
  function ins_cpse(instruction, pc)
  {
    var d = x01F0(instruction);
    var r = x020F(instruction);
    var Rd = dmem.read(d);
    var Rr = dmem.read(r);

    return (Rd == Rr) ? skip(pc + 1) : pc + 1;
  }

  function ins_dec(instruction, pc)
  {
    var d = x01F0(instruction);
    var Rd = dmem.read(d);

    var R = Rd - 1;

    z1(R);
    n1(R);
    v5(R);
    s1();

    dmem.write(d, R);

    return pc + 1;
  }

  function ins_eicall(instruction, pc)
  {
    var pc_ret = pc + 2;
    for (var i = pc_size_bytes - 1; i >= 0; --i)
    {
      push(pc_ret >> (i << 3));
    }

    pc = dmem.z.read();
    pc |= dmem.eind.read() << 16;

    return pc;
  }

  function ins_eijmp(instruction, pc)
  {
    pc = dmem.z.read();
    pc |= dmem.eind.read() << 16;

    return pc;
  }

  function ins_elpm(instruction, pc)
  {
    var p_addr = dmem.z.read();
    p_addr |= dmem.rampz.read() << 16;

    dmem.write(0, pmem.read_byte(p_addr));

    return pc + 1;
  }

  function ins_elpm_z(instruction, pc)
  {
      var d = x01F0(instruction);

      var p_addr = dmem.z.read();
      p_addr |= dmem.rampz.read() << 16;

      dmem.write(d, pmem.read_byte(p_addr));

      return pc + 1;
  }

  function ins_elpm_zp(instruction, pc)
  {
      var d = x01F0(instruction);

      var p_addr = dmem.z.read();
      p_addr |= dmem.rampz.read() << 16;

      dmem.write(d, pmem.read_byte(p_addr));

      ++p_addr;
      dmem.z.write(p_addr);
      dmem.rampz.write(p_addr >> 16);

      return pc + 1;
  }

  function ins_eor(instruction, pc)
  {
      var d = x01F0(instruction);
      var r = x020F(instruction);
      var Rd = dmem.read(d);
      var Rr = dmem.read(r);

      var R = Rd ^ Rr;

      z1(R);
      n1(R);
      dmem.sreg.v.clear();
      s1();

      dmem.write(d, R);

      return pc + 1;
  }

  function ins_fmul(instruction, pc)
  {
      var d = 16 + x0070(instruction);
      var r = 16 + isnt.x0007(instruction);
      var Rd = dmem.read(d);
      var Rr = dmem.read(r);

      // TODO: so some FMUL stuff

      if ((R & (1 << 16)) != 0)
      {
          dmem.sreg.c.set();
      }
      else
      {
          dmem.sreg.c.clear();
      }
      dmem.sreg.z2(R)

      dmem.write(0, R);
      dmem.write(1, R >> 8);

      return pc + 1;
  }

  function ins_fmuls(instruction, pc)
  {
      var d = 16 + x0070(instruction);
      var r = 16 + isnt.x0007(instruction);
      var Rd = dmem.read(d);
      var Rr = dmem.read(r);

      // TODO: so some FMUL stuff

      if ((R & (1 << 16)) != 0)
      {
          dmem.sreg.c.set();
      }
      else
      {
          dmem.sreg.c.clear();
      }
      dmem.sreg.z2(R)

      dmem.write(0, R);
      dmem.write(1, R >> 8);

      return pc + 1;
  }

  function ins_fmulsu(instruction, pc)
  {
      var d = 16 + x0070(instruction);
      var r = 16 + isnt.x0007(instruction);
      var Rd = dmem.read(d);
      var Rr = dmem.read(r);

      // TODO: so some FMUL stuff

      if ((R & (1 << 16)) != 0)
      {
          dmem.sreg.c.set();
      }
      else
      {
          dmem.sreg.c.clear();
      }
      dmem.sreg.z2(R)

      dmem.write(0, R);
      dmem.write(1, R >> 8);

      return pc + 1;
  }

  function ins_icall(instruction, pc)
  {
      // push pc + 1 onto the stack
      var pc_ret = pc + 1;
      for (var i = pc_size_bytes - 1; i >= 0; --i)
      {
        push(pc_ret >> (i << 3));
      }

      return dmem.z.read();
  }

  function ins_ijmp(instruction, pc)
  {
      return dmem.z.read();
  }

  function ins_in(instruction, pc)
  {
      var d = x01F0(instruction);
      var A = x060F(instruction);
      var RA = dmem.read(A + 0x20);

      dmem.write(d, RA);

      return pc + 1;
  }

  function ins_inc(instruction, pc)
  {
      var d = x01F0(instruction);
      var Rd = dmem.read(d);

      var R = Rd + 1;

      z1(R);
      n1(R);
      v6();
      s1();

      dmem.write(d, R);

      return pc + 1;
  }

  function ins_jmp(instruction, pc)
  {
      return xFFFF01F1(instruction);
  }

  function ins_lac(instruction, pc)
  {
      var r = x01F0(instruction);
      var Z = dmem.z.read();
      var Zv = dmem.read(Z);

      dmem.write(Z, dmem.read(r) & ~Zv); // no idea if this is right
      dmem.write(r, Zv);

      return pc + 1;
  }

  function ins_las(instruction, pc)
  {
      var r = x01F0(instruction);
      var Z = dmem.z.read();
      var Zv = dmem.read(Z);

      dmem.write(Z, dmem.read(r) | Zv); // no idea if this is right
      dmem.write(r, Zv);

      return pc + 1;
  }

  function ins_lat(instruction, pc)
  {
      var r = x01F0(instruction);
      var Z = dmem.z.read();
      var Zv = dmem.read(Z);

      dmem.write(Z, dmem.read(r) ^ Zv); // no idea if this is right
      dmem.write(r, Zv);

      return pc + 1;
  }

  function ins_ld_x(instruction, pc)
  {
      var d = x01F0(instruction);
      var X = dmem.x.read();
      X |= dmem.rampx.read() << 16;

      dmem.write(d, dmem.read(X));

      return pc + 1;
  }

  function ins_ld_xp(instruction, pc)
  {
      var d = x01F0(instruction);
      var X = dmem.x.read();
      X |= dmem.rampx.read() << 16;

      dmem.write(d, dmem.read(X));

      ++X;
      dmem.x.write(X);
      dmem.rampx.write(X >> 16);

      return pc + 1;
  }

  function ins_ld_mx(instruction, pc)
  {
      var d = x01F0(instruction);
      var X = dmem.x.read();
      X |= dmem.rampx.read() << 16;
      --X;

      dmem.write(d, dmem.read(X));

      dmem.x.write(X);
      dmem.rampx.write(X >> 16);

      return pc + 1;
  }

  function ins_ld_yp(instruction, pc)
  {
      var d = x01F0(instruction);
      var Y = dmem.y.read();
      Y |= dmem.rampy.read() << 16;

      dmem.write(d, dmem.read(Y));

      ++Y;
      dmem.y.write(Y);
      dmem.rampy.write(Y >> 16);

      return pc + 1;
  }

  function ins_ld_my(instruction, pc)
  {
      var d = x01F0(instruction);
      var Y = dmem.y.read();
      Y |= dmem.rampy.read() << 16;
      --Y;

      dmem.write(d, dmem.read(Y));

      dmem.y.write(Y);
      dmem.rampy.write(Y >> 16);

      return pc + 1;
  }

  function ins_ld_ypq(instruction, pc)
  {
      var d = x01F0(instruction);
      var q = x2C07(instruction);
      var Y = dmem.y.read();
      Y |= dmem.rampy.read() << 16;

      dmem.write(d, dmem.read(Y + q));

      return pc + 1;
  }

  function ins_ld_zp(instruction, pc)
  {
      var d = x01F0(instruction);
      var Z = dmem.z.read();
      Z |= dmem.rampy.read() << 16;

      dmem.write(d, dmem.read(Z));

      ++Z;
      dmem.z.write(Z);
      dmem.rampz.write(Z >> 16);

      return pc + 1;
  }

  function ins_ld_mz(instruction, pc)
  {
      var d = x01F0(instruction);
      var Z = dmem.z.read();
      Z |= dmem.rampz.read() << 16;
      --Z;

      dmem.write(d, dmem.read(Z));

      dmem.z.write(Z);
      dmem.rampz.write(Z >> 16);

      return pc + 1;
  }

  function ins_ld_zpq(instruction, pc)
  {
      var d = x01F0(instruction);
      var q = x2C07(instruction);
      var Z = dmem.z.read();
      Z |= dmem.rampz.read() << 16;

      dmem.write(d, dmem.read(Z + q));

      return pc + 1;
  }

  function ins_ldi(instruction, pc)
  {
      var d = 16 + x00F0(instruction);
      var K = x0F0F(instruction);

      dmem.write(d, K);

      return pc + 1;
  }

  function ins_lds(instruction, pc)
  {
      var d = x01F0(instruction);
      var k = xFFFF0000(instruction);
      k |= dmem.rampd.read() << 16;

      dmem.write(d, dmem.read(k));

      return pc + 2;
  }

  /*function ins_lds16(instruction, pc)
  {
      var d = 16 + x00F0(instruction);
      var k = 0x40 + ((instruction & 0x000F) | ((instruction & 0x0600) >> 5)
      | ((instruction & 0x0100) >> 2)
      | (((instruction & 0x0100) ^ 0x0100) >> 2));

      dmem.write(d, dmem.read(k));

      return pc + 1;
  }*/

  function ins_lpm(instruction, pc)
  {
      dmem.write(0, pmem.read_byte(dmem.z.read()));

      return pc + 1;
  }

  function ins_lpm_z(instruction, pc)
  {
      var d = x01F0(instruction);
      dmem.write(d, pmem.read_byte(dmem.z.read()));

      return pc + 1;
  }

  function ins_lpm_zp(instruction, pc)
  {
      var d = x01F0(instruction);
      var Z = dmem.z.read();
      dmem.write(d, pmem.read_byte(Z));

      ++Z;
      dmem.z.write(Z);

      return pc + 1;
  }

  function ins_lsr(instruction, pc)
  {
      var d = x01F0(instruction);
      var Rd = dmem.read(d);

      var R = Rd >> 1;

      c3(Rd);
      z1(R);
      dmem.sreg.n.clear();
      v3();
      s1();

      dmem.write(d, R);

      return pc + 1;
  }

  function ins_mov(instruction, pc)
  {
      var d = x01F0(instruction);
      var r = x020F(instruction);

      dmem.write(d, dmem.read(r));

      return pc + 1;
  }

  function ins_movw(instruction, pc)
  {
      var d = x00F0(instruction) << 1;
      var r = x000F(instruction) << 1;

      dmem.write(d, dmem.read(r));
      dmem.write(d + 1, dmem.read(r + 1));

      return pc + 1;
  }

  function ins_mul(instruction, pc)
  {
      var d = x01F0(instruction);
      var r = x020F(instruction);
      var Rd = dmem.read(d);
      var Rr = dmem.read(r);

      var R = Rd * Rr;

      c6(R);
      z2(R);

      dmem.write(0, R);
      dmem.write(1, R << 8);

      return pc + 1;
  }

  function ins_muls(instruction, pc)
  {
      var d = x01F0(instruction);
      var r = x020F(instruction);
      var Rd = dmem.read(d);
      var Rr = dmem.read(r);
      var Rds = (Rd & 0x7F) - (Rd & 0x80);
      var Rrs = (Rr & 0x7F) - (Rr & 0x80);

      var R = Rds * Rrs;

      c6(R);
      z2(R);

      dmem.write(0, R);
      dmem.write(1, R << 8);

      return pc + 1;
  }

  function ins_mulsu(instruction, pc)
  {
      var d = x01F0(instruction);
      var r = x020F(instruction);
      var Rd = dmem.read(d);
      var Rr = dmem.read(r);
      var Rds = (Rd & 0x7F) - (Rd & 0x80);

      var R = Rds * Rr;

      c6(R);
      z2(R);

      dmem.write(0, R);
      dmem.write(1, R << 8);

      return pc + 1;
  }

  function ins_neg(instruction, pc)
  {
      var d = x01F0(instruction);
      var Rd = dmem.read(d);

      var R = (~Rd) + 1;

      c7(R);
      z1(R);
      n1(R);
      v6(R);
      s1();
      h4(Rd, R);

      dmem.write(d, R);

      return pc + 1;
  }

  function ins_nop(instruction, pc)
  {
      return pc + 1;
  }

  function ins_or(instruction, pc)
  {
      var d = x01F0(instruction);
      var r = x020F(instruction);
      var Rd = dmem.read(d);
      var Rr = dmem.read(r);

      var R = Rd | Rr;

      z1(R);
      n1(R);
      dmem.sreg.v.clear();
      s1();

      dmem.write(d, R);

      return pc + 1;
  }

  function ins_ori(instruction, pc)
  {
      var d = 16 + x00F0(instruction);
      var k = x0F0F(instruction);
      var Rd = dmem.read(d);

      var R = Rd | K;

      z1(R);
      n1(R);
      dmem.sreg.v.clear();
      s1();

      dmem.write(d, R);

      return pc + 1;
  }

  function ins_out(instruction, pc)
  {
      var r = x01F0(instruction);
      var A = x060F(instruction);

      dmem.write(A + 0x20, dmem.read(r));

      return pc + 1;
  }

  function ins_pop(instruction, pc)
  {
      var d = x01F0(instruction);

      dmem.write(d, pop());

      return pc + 1;
  }

  function ins_push(instruction, pc)
  {
    var d = x01F0(instruction);

    push(dmem.read(d));

    return pc + 1;
  }

  function ins_rcall(instruction, pc)
  {
      pc += 1;
      for (var i = pc_size_bytes - 1; i >= 0; --i)
      {
        push(pc >> (i << 3));
      }

      var k = x0FFF(instruction);

      pc += k & 0x07FF;
      pc -= k & 0x0800;

      return pc;
  }

  function ins_ret(instruction, pc)
  {
      pc = pop();
      for (var i = 1; i < pc_size_bytes; ++i)
      {
        pc |= pop() << (i << 3);
      }
      return pc;
  }

  function ins_reti(instruction, pc)
  {
    pc = pop();
    for (var i = 1; i < pc_size_bytes; ++i)
    {
      pc |= pop() << (i << 3);
    }
    return pc;
  }

  function ins_rjmp(instruction, pc)
  {
    return ((pc + (instruction & 0x07FF)) - (instruction & 0x0800)) + 1;
  }

  function ins_ror(instruction, pc)
  {
    var d = x01F0(instruction);
    var Rd = dmem.read(d);

    var R = Rd >> 1;
    R |= dmem.sreg.c.read() << 7;

    c3(Rd);
    z1(R);
    n1(R);
    v3();
    s1();

    dmem.write(d, R);

    return pc + 1;
  }

  function ins_sbc(instruction, pc)
  {
    var d = x01F0(instruction);
    var r = x020F(instruction);
    var Rd = dmem.read(d);
    var Rr = dmem.read(r)

    var R = (Rd - Rr) - dmem.sreg.c.read();

    c4(Rd, Rr, R);
    z3(R);
    n1(R);
    v4(Rd, Rr, R);
    s1();
    h2(Rd, Rr, R);

    dmem.write(d, R);

    return pc + 1;
  }

  function ins_sbci(instruction, pc)
  {
    var d = 16 + x00F0(instruction);
    var K = x0F0F(instruction);
    var Rd = dmem.read(d);

    var R = (Rd - K) - dmem.sreg.c.read();

    c4(Rd, K, R);
    z3(R);
    n1(R);
    v4(Rd, K, R);
    s1();
    h2(Rd, K, R);

    dmem.write(d, R);

    return pc + 1;
  }

  function ins_sbi(instruction, pc)
  {
    var b = x0007(instruction);
    var A = x00F8(instruction);

    dmem.write(A + 0x20, dmem.read(A + 0x20) | (1 << b));

    return pc + 1;
  }

  function ins_sbic(instruction, pc)
  {
    var b = x0007(instruction);
    var A = x00F8(instruction);

    return ((dmem.read(A + 0x20) & (1 << b)) == 0) ? skip(pc + 1) : pc + 1;
  }

  function ins_sbis(instruction, pc)
  {
    var b = x0007(instruction);
    var A = x00F8(instruction);

    return ((dmem.read(A + 0x20) & (1 << b)) != 0) ? skip(pc + 1) : pc + 1;
  }

  function ins_sbiw(instruction, pc)
  {
    var d = 24 + (x0030(instruction) << 1);
    var K = x00CF(instruction);
    var Rd = dmem.read(d);
    var Rdh = dmem.read(d + 1);
    Rd |= Rdh << 8;

    var R = Rd - K;

    c8(Rdh, R);
    z2(R);
    n2(R);
    v7(Rdh, R);
    s1();

    dmem.write(d, R);
    dmem.write(d + 1, R >> 8);

    return pc + 1;
  }

  function ins_sbrc(instruction, pc)
  {
    var r = x01F0(instruction);
    var b = x0007(instruction);

    return ((dmem.read(r) & (1 << b)) == 0) ? skip(pc + 1) : pc + 1;
  }

  function ins_sbrs(instruction, pc)
  {
    var r = x01F0(instruction);
    var b = x0007(instruction);

    return ((dmem.read(r) & (1 << b)) != 0) ? skip(pc + 1) : pc + 1;
  }

  function ins_sleep(instruction, pc)
  {
    // I'm not tired.
    return pc + 1;
  }

  function ins_spm(instruction, pc)
  {
    // TODO: this
    return pc + 1;
  }

  function ins_spm_zp(instruction, pc)
  {
    // TODO: this
    return pc + 1;
  }

  function ins_st_x(instruction, pc)
  {
    var d = x01F0(instruction);
    var X = dmem.x.read();
    X |= dmem.rampx.read() << 16;

    dmem.write(X, dmem.read(d));

    return pc + 1;
  }

  function ins_st_xp(instruction, pc)
  {
    var d = x01F0(instruction);
    var X = dmem.x.read();
    X |= dmem.rampx.read() << 16;

    dmem.write(X, dmem.read(d));

    ++X;
    dmem.x.write(X);
    dmem.rampx.write(X >> 16);

    return pc + 1;
  }

  function ins_st_mx(instruction, pc)
  {
    var d = x01F0(instruction);
    var X = dmem.x.read();
    X |= dmem.rampx.read() << 16;

    --X;
    dmem.write(X, dmem.read(d));

    dmem.x.write(X);
    dmem.rampx.write(X >> 16);

    return pc + 1;
  }

  function ins_st_yp(instruction, pc)
  {
    var d = x01F0(instruction);
    var Y = dmem.y.read();
    Y |= dmem.rampy.read() << 16;

    dmem.write(Y, dmem.read(d));

    ++Y;
    dmem.y.write(Y);
    dmem.rampy.write(Y >> 16);

    return pc + 1;
  }

  function ins_st_my(instruction, pc)
  {
    var d = x01F0(instruction);
    var Y = dmem.y.read();
    Y |= dmem.rampy.read() << 16;

    --Y;
    dmem.write(Y, dmem.read(d));

    dmem.y.write(Y);
    dmem.rampy.write(Y >> 16);

    return pc + 1;
  }

  function ins_st_ypq(instruction, pc)
  {
    var d = x01F0(instruction);
    var q = x2C07(instruction);
    var Y = dmem.y.read();
    Y |= dmem.rampy.read() << 16;

    dmem.write(Y + q, dmem.read(d));

    return pc + 1;
  }

  function ins_st_zp(instruction, pc)
  {
    var d = x01F0(instruction);
    var Z = dmem.z.read();
    Z |= dmem.rampz.read() << 16;

    dmem.write(Z, dmem.read(d));

    ++Z;
    dmem.z.write(Z);
    dmem.rampz.write(Z >> 16);

    return pc + 1;
  }

  function ins_st_mz(instruction, pc)
  {
    var d = x01F0(instruction);
    var Z = dmem.z.read();
    Z |= dmem.rampz.read() << 16;

    --Z;
    dmem.write(Z, dmem.read(d));

    dmem.z.write(Z);
    dmem.rampz.write(Z >> 16);

    return pc + 1;
  }

  function ins_st_zpq(instruction, pc)
  {
    var d = x01F0(instruction);
    var q = x2C07(instruction);
    var Z = dmem.z.read();
    Z |= dmem.rampz.read() << 16;

    dmem.write(Z + q, dmem.read(d));

    return pc + 1;
  }

  function ins_sts(instruction, pc)
  {
    var d = x01F0(instruction);
    var k = xFFFF0000(instruction);
    k |= dmem.rampd.read() << 16;

    dmem.write(k, dmem.read(d));

    return pc + 2;
  }

  /*function ins_sts16(instruction, pc)
  {
    var d = 16 + x00F0(instruction);
    var k = 0x40 + ((instruction & 0x000F) | ((instruction & 0x0600) >> 5)
    | ((instruction & 0x0100) >> 2) | (((instruction & 0x0100) ^ 0x0100) >> 2));
    // TODO: check this

    dmem.write(k, dmem.read(d));

    return pc + 1;
  }*/

  function ins_sub(instruction, pc)
  {
    var d = x01F0(instruction);
    var r = x020F(instruction);
    var Rd = dmem.read(d);
    var Rr = dmem.read(r)

    var R = Rd - Rr;

    c4(Rd, Rr, R);
    z3(R);
    n1(R);
    v4(Rd, Rr, R);
    s1();
    h2(Rd, Rr, R);

    dmem.write(d, R);

    return pc + 1;
  }

  function ins_subi(instruction, pc)
  {
    var d = 16 + x00F0(instruction);
    var K = x0F0F(instruction);
    var Rd = dmem.read(d);

    var R = Rd - K;

    c4(Rd, K, R);
    z3(R);
    n1(R);
    v4(Rd, K, R);
    s1();
    h2(Rd, K, R);

    dmem.write(d, R);

    return pc + 1;
  }

  function ins_swap(instruction, pc)
  {
    var d = x01F0(instruction);
    var Rd = dmem.read(d);

    dmem.write(d, ((Rd & 0x0F) << 4) | ((Rd & 0xF0) >> 4));

    return pc + 1;
  }

  function ins_wdr(instruction, pc)
  {
    return pc + 1;
  }

  function ins_xch(instruction, pc)
  {
    var r = x01F0(instruction);
    var Z = dmem.z.read();
    var Rr = dmem.read(r);

    dmem.write(r, dmem.read(z));
    dmem.write(Z, Rr);

    return pc + 1;
  }

  return instructions;
}
