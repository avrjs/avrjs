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

function atmega328(uart0_cb, sleep_cb, bootsz, bootrst)
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

    var mega = Module.ccall('emsc_atmega328_init', 'number', ['number', 'number', 'number', 'number'], [emsc_uart0_cb, emsc_sleep_cb, bootsz, bootrst]);

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

function load_default()
{
    window.defaults_loaded = 1;
    // loading avr
    if ($("#bootsz").length && $("#bootrst").length)
    {
        window.avrjs.init(window.u0_term.write, disp_sleep_cb, $("#bootsz").val(), $("#bootrst").prop("checked") ? 1 : 0);
    }
    else
    {
        window.avrjs.init(window.u0_term.write, disp_sleep_cb);
    }

    // loading hex
    var hot_drop = $("<div style='display:none;'></div>");
    $(document.body).append(hot_drop);
    hot_drop.load("avrjs_term_atmega328.hex", function ()
    {
	    var hex = hot_drop.html();
        var buf = new ArrayBuffer(hex.length);
        var hex_array = new Uint8Array(buf);
        for (var i = 0; i < hex.length; i++)
        {
            hex_array[i] = hex.charCodeAt(i);
        }
        window.avrjs.load(hex_array);
        window.avrjs.run();

        $("#btn_run").css("display", "inline");
        $("#btn_load").css("display", "inline");
    });
}

function avrjs()
{
    var interval = undefined;
    var frequency = 0;
    var avr = undefined;
    var tick_counter = 0;
    var measure_interval;
    var asleep = false;
    var running = false;
    var extern_sleep_cb = undefined;

    function uart0_write(c)
    {
        if (avr !== undefined)
        {
            avr.uart0_write(c);
        }
    }

    function tick() // function called every 10ms
    {
        var ts = performance.now();
        while ((performance.now() - ts) < 9)
        {
            for (var i = 0; i < 10; ++i)
            {
                if (asleep == false)
                {
                    avr.tick();
                    tick_counter ++;
                }
            }
        }
    }

    function sleep_cb(s)
    {
        if (s != 0)
        {
            if (interval !== undefined)
            {
                clearInterval(interval);
                interval = undefined;
                asleep = true;
            }
        }
        else
        {
            if ((running == true) && (interval === undefined))
            {
                interval = setInterval(tick, 10);
                asleep = false;
            }
        }
        if (extern_sleep_cb !== undefined)
        {
            extern_sleep_cb(s);
        }
    }

    function run()
    {
        running = true;
        asleep = false;
        if (interval === undefined)
        {
            interval = setInterval(tick, 10);
            measure_interval = setInterval(function () // function called every second
            {
                frequency = (tick_counter / 1000000);
                tick_counter = 0;
            }, 1000);
        }
    }

    function stop()
    {
        running = false;
        asleep = false;
        if (interval !== undefined)
        {
            clearInterval(interval);
            interval = undefined;
            clearInterval(measure_interval);
            measure_interval = undefined;
            frequency = 0;
        }
    }

    function is_running()
    {
        return running;
    }

    function is_asleep()
    {
        return asleep;
    }

    function get_frequency()
    {
        return frequency;
    }

    function load(hex)
    {
        if (avr !== undefined)
        {
            stop();
            ihex_parse(hex, avr.pmem_write_byte);
            return true;
        }
        return false;
    }

    function load_file(file_element)
    {
        if (avr !== undefined)
        {
            stop();
            ihex_handle(file_element, avr.pmem_write_byte);
            return true;
        }
        return false;
    }

    function init(uart0_cb, _extern_sleep_cb, bootsz, bootrst)
    {
        if (avr !== undefined)
        {
            if (interval !== undefined)
            {
                stop();
            }
            avr.destroy();
        }
        avr = atmega328(uart0_cb, sleep_cb, bootsz, bootrst);
        avr.extern_sleep_cb = _extern_sleep_cb;
    }

    return {
        uart0_write: uart0_write,
        run: run,
        stop: stop,
        is_running: is_running,
        is_asleep: is_asleep,
        get_frequency: get_frequency,
        load: load,
        load_file: load_file,
        init: init
    };
}
