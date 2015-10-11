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

function attiny1634(uart0_write_cb)
{
    var emsc_attiny1634_destroy = Module.cwrap('emsc_attiny1634_destroy', 'number', ['number']);
    var emsc_attiny1634_reinit = Module.cwrap('emsc_attiny1634_reinit', 'number', ['number']);
    var emsc_attiny1634_tick = Module.cwrap('emsc_attiny1634_tick', 'number', ['number']);
    var emsc_attiny1634_uart0_write = Module.cwrap('emsc_attiny1634_uart0_write', 'number', ['number', 'number']);
    var emsc_attiny1634_pmem_write_byte = Module.cwrap('emsc_attiny1634_pmem_write_byte', 'number', ['number', 'number', 'number']);

    var emsc_attiny1634_get_pc = Module.cwrap('emsc_attiny1634_get_pc', 'number', ['number']);
    var emsc_attiny1634_get_instruction_name = Module.cwrap('emsc_attiny1634_get_instruction_name', 'number', ['number']);

    var emsc_uart0_write_cb = Runtime.addFunction(function(_, c){uart0_write_cb(c);});

    var tiny = Module.ccall('emsc_attiny1634_init', 'number', ['number', 'number'], [emsc_uart0_write_cb, 0]);

    return {
        reinit: function(){emsc_attiny1634_reinit(tiny);},
        tick: function(){emsc_attiny1634_tick(tiny);},
        uart0_write: function(data){emsc_attiny1634_uart0_write(tiny, data);},
        pmem_write_byte: function(address, data){emsc_attiny1634_pmem_write_byte(tiny, address, data);},
        get_pc: function(){return emsc_attiny1634_get_pc(tiny);},
        get_instruction_name: function(){return Pointer_stringify(emsc_attiny1634_get_instruction_name(tiny));},
        destroy: function()
        {
            Runtime.removeFunction(emsc_uart0_write_cb);
            emsc_attiny1634_destroy(tiny);
        }
    };
}
