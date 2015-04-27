/*
avr.js - An Atmel (TM) AVR (TM) simulator

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

// This simulates an ATTiny 1634 (so chosen because it is the simplest AVR with
// 2 UART ports). This is currently the only form of IO this simulator supports
// but adding others shouldn't be too much trouble, please feel free to contact
// me if you have any specific requirements and are not able to implement a
// solution yourself.

"use strict";

function reg_bit(mem, loc, bit)
{
  function read()
  {
    return (mem[loc] & (1 << bit)) >> bit;
  }

  function set()
  {
    mem[loc] |= 1 << bit;
  }

  function clear()
  {
    mem[loc] &= ~(1 << bit);
  }

  return {
    read: read,
    set: set,
    clear: clear,
  };
}

function sreg(mem, loc)
{
  var c = reg_bit(mem, loc, 0);
  var z = reg_bit(mem, loc, 1);
  var n = reg_bit(mem, loc, 2);
  var v = reg_bit(mem, loc, 3);
  var s = reg_bit(mem, loc, 4);
  var h = reg_bit(mem, loc, 5);
  var t = reg_bit(mem, loc, 6);
  var i = reg_bit(mem, loc, 7);

  return {
    c: c,
    z: z,
    n: n,
    v: v,
    s: s,
    h: h,
    t: t,
    i: i,
    loc: loc
  };
};

function sp(mem, loc, len)
{
  function write(value)
  {
    for (var i = 0; i < len; ++i)
    {
      mem[loc + i] = (value >> (i << 3)) & 0xFF;
    }
  }

  // initialise to RAMEND
  write(mem.length - 1);

  function read()
  {
    var value = 0;
    for (var i = 0; i < len; ++i)
    {
      value |= (mem[loc + i] & 0xFF) << (i << 3);
    }
    return value;
  }

  return {
    write: write,
    read: read,
    loc: loc
  };
}

function p_reg(mem, loc)
{
  function write(value)
  {
    mem[loc] = value & 0xFF;
    mem[loc + 1] = (value >> 8) & 0xFF;
  }

  function read()
  {
    var value = mem[loc] & 0xFF;
    value |= (mem[loc + 1] & 0xFF) << 8;
    return value;
  }

  return {
    write: write,
    read: read,
    loc: loc
  };
}

function eind(mem, loc)
{
  function write(value)
  {
  }

  function read()
  {
      return 0;
  }

  return {
    write: write,
    read: read,
    loc: loc
  };
}

function ramp(mem, loc)
{
  function write(value)
  {
  }

  function read()
  {
    return 0;
  }

  return {
    write: write,
    read: read,
    loc: loc
  };
}

function udr(mem, loc, write_cb)
{
    // initialise uart registers
    mem[0x46] = 0x20;
    mem[0x44] = 0x06;
    mem[0x43] = 0x20;

    var mpcm = reg_bit(mem, 0x46, 0);
    var u2x = reg_bit(mem, 0x46, 1);
    var upe = reg_bit(mem, 0x46, 2);
    var dor = reg_bit(mem, 0x46, 3);
    var fe = reg_bit(mem, 0x46, 4);
    var udre = reg_bit(mem, 0x46, 5);
    var txc = reg_bit(mem, 0x46, 6);
    var rxc = reg_bit(mem, 0x46, 7);

    var txb8 = reg_bit(mem, 0x45, 0);
    var rxb8 = reg_bit(mem, 0x45, 1);
    var ucsz2 = reg_bit(mem, 0x45, 2);
    var txen = reg_bit(mem, 0x45, 3);
    var rxen = reg_bit(mem, 0x45, 4);
    var udrie = reg_bit(mem, 0x45, 5);
    var txcie = reg_bit(mem, 0x45, 6);
    var rxcie = reg_bit(mem, 0x45, 7);

    var ucpol = reg_bit(mem, 0x44, 0);
    var ucsz0 = reg_bit(mem, 0x44, 1);
    var ucsz1 = reg_bit(mem, 0x44, 2);
    var usbs = reg_bit(mem, 0x44, 3);
    var upm0 = reg_bit(mem, 0x44, 4);
    var upm1 = reg_bit(mem, 0x44, 5);
    var umsel0 = reg_bit(mem, 0x44, 6);
    var umsel1 = reg_bit(mem, 0x44, 7);

    var rx_shift;
    var rx_shift_full = false; // this is true when there is valid data in the
    // shift reg

    // called when udr is written to by the core, no buffering, just throw it
    // out
    function write(value)
    {
        write_cb.fun(value, write_cb.arg);
    }

    // called when udr is read by the core
    function read()
    {
        var value = 0;
        if (rxc.read() != 0)
        {
            value = mem[loc] & 0xFF;
            if (rx_shift_full == true)
            { // tracsfer the shift register into the now empty udr0(rx)
                mem[loc] = rx_shift & 0xFF;
                rx_shift_full = false;
            }
            rxc.clear();
        }
        return value;
    }

    // called externally to simulate another device writing to the uart
    function external_write(value)
    {
        if (rxen.read() != 0)
        {
            if (rxc.read() != 0)
            { // udr0(rx) full, try to store in shift reg
                if (rx_shift_full == true)
                { // shift reg full, atat overrun
                    dor.set();
                }
                else
                { // shift reg empty
                    rx_shift = value;
                    rx_shift_full = true;
                }
            }
            else
            {
                mem[loc] = value & 0xFF;
                rxc.set();
            }

        }
    }

    return {
        external_write: external_write,
        write: write,
        read: read
  };
}

function dmem(callbacks)
{
  // this initialises to 0
  var mem = new Int8Array(0x0500);

  var _sreg = sreg(mem, 0x5F);
  var _sp = sp(mem, 0x5D, 2);
  var x = p_reg(mem, 0x1A);
  var y = p_reg(mem, 0x1C);
  var z = p_reg(mem, 0x1E);
  var rampx = ramp(mem, 0);
  var rampy = ramp(mem, 0);
  var rampz = ramp(mem, 0);
  var rampd = ramp(mem, 0);
  var _eind = eind(mem, 0);

  // these registers represent elements of memory that have an external effect.
  var registers = {};

  registers[0x40] = udr(mem, 0x40, callbacks.uart0);

  function write(address, value)
  {
    var register = registers[address];
    if (register !== undefined)
    {
        register.write(value);
    }
    else // if no register defined
    {
        mem[address] = value & 0xFF;
    }
  }

  function read(address)
  {
    var register = registers[address];
    if (register !== undefined)
    {
        return register.read();
    }
    else
    {
        return mem[address] & 0xFF;
    }
  }

  return {
    uart0: registers[0x40],
    read: read,
    write: write,
    sreg: _sreg,
    sp: _sp,
    x: x,
    y: y,
    z: z,
    rampx: rampx,
    rampy: rampy,
    rampz: rampz,
    rampd: rampd,
    eind: _eind
  };
}

function pmem()
{
  // this initialises to 0
  var mem = new Int16Array(0x2000);

  function write(address, value)
  {
    mem[address] = value & 0xFFFF;
  }

  function read(address)
  {
    return mem[address] & 0xFFFF;
  }

  function write_byte(address, value)
  {
    var word_address = address >> 1;
    mem[word_address] &= ~(0xFF << ((address % 2) << 3));
    mem[word_address] |= (value & 0xFF) << ((address % 2) << 3);
  }

  function read_byte(address)
  {
    var word_address = address >> 1;
    return (mem[word_address] >> ((address % 2) << 3)) & 0xFF;
  }

  return {
    read: read,
    write: write,
    read_byte: read_byte,
    write_byte: write_byte
  };
}

// callbacks takes the form:
// {
// uart0: {
//  fun: function(value, arg){},
//  arg: 0
//  }
// uart1: {
//  fun: function(value, arg){},
//  arg: 0
//  }
// }

function avr(callbacks)
{
  var _dmem = dmem(callbacks);
  var _pmem = pmem();

  var pc = 0;
  var pc_size_bytes = 2;
  var io_offset = 0x20;

  var instructions = core(_dmem, _pmem, pc_size_bytes);

  function tick()
  {
      var instruction = _pmem.read(pc);
      var i = 0;
      while ((i < instructions.length) && ((instruction &
          instructions[i].m) != instructions[i].p))
      {
          ++i;
      }
      if (instructions[i].w == 2)
      {
          instruction |= _pmem.read(pc + 1) << 16;
      }

      pc = instructions[i].f(instruction, pc);
      //console.log(instructions[i].fn.name);
      //console.log("pc: " + uint16_tostr(pc * 2)
      //+ " sp: " + uint16_tostr(_dmem.sp.read()));
  }

  return {
      tick: tick,
      uart0_write: _dmem.uart0.external_write,
      pmem_write: _pmem.write
  };
}
