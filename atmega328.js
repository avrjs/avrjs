/*
atmega328.js - An Atmel (TM) AVR (TM) simulator

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

function atmega328(uart0_cb, sleep_cb)
{
    var emsc_atmega328_destroy = Module.cwrap('emsc_atmega328_destroy', 'number', ['number']);
    var emsc_atmega328_reinit = Module.cwrap('emsc_atmega328_reinit', 'number', ['number']);
    var emsc_atmega328_tick = Module.cwrap('emsc_atmega328_tick', 'number', ['number']);
    var emsc_atmega328_uart0_write = Module.cwrap('emsc_atmega328_uart0_write', 'number', ['number', 'number']);
    var emsc_atmega328_pmem_write_byte = Module.cwrap('emsc_atmega328_pmem_write_byte', 'number', ['number', 'number', 'number']);

    var emsc_atmega328_get_pc = Module.cwrap('emsc_atmega328_get_pc', 'number', ['number']);
    var emsc_atmega328_get_instruction_name = Module.cwrap('emsc_atmega328_get_instruction_name', 'number', ['number']);

    var emsc_uart0_cb = Runtime.addFunction(function(_, c){uart0_cb(c);});
    var emsc_sleep_cb = Runtime.addFunction(function(_, sleep){sleep_cb(sleep);});

    var mega = Module.ccall('emsc_atmega328_init', 'number', ['number', 'number'], [emsc_uart0_cb, emsc_sleep_cb]);

    return {
        reinit: function(){emsc_atmega328_reinit(mega);},
        tick: function(){emsc_atmega328_tick(mega);},
        uart0_write: function(data){emsc_atmega328_uart0_write(mega, data);},
        pmem_write_byte: function(address, data){emsc_atmega328_pmem_write_byte(mega, address, data);},
        get_pc: function(){return emsc_atmega328_get_pc(mega);},
        get_instruction_name: function(){return Pointer_stringify(emsc_atmega328_get_instruction_name(mega));},
        destroy: function()
        {
            Runtime.removeFunction(emsc_uart0_cb);
            Runtime.removeFunction(emsc_sleep_cb);
            emsc_atmega328_destroy(mega);
        }
    };
}
