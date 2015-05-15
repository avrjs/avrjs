/*
ihex.js - An intel hex file parser. Made for avrjs

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

function hex2nib(hex)
{
    if (hex <= 0x39)
    {
	return hex - 0x30;
    }
    else
    {
	return hex - 0x37; 
    }
}

// the write argument must be a function with arguments (address, data)

function ihex_parse(data, write)
{
    var h_index = 0;
    var v_index = 0;
    var byte_count = 0;
    var data_index = 0;
    var address = 0;
    var base_address = 0;
    var record_type = 0;
    var hex_buffer  = 0; // this will hold the data from 2 hex ascii chars

    for (var i = 0; i < data.length; ++i)
    {
        var c = data[i];
        if (c == 0x3A) // start code
        {
            h_index = 1;
	    ++v_index;
        }
        else if (h_index > 0)
        {
            switch(h_index)
            {
            case 1: // byte_count 1
                byte_count = hex2nib(c) << 4;
                break;
	    case 2: // byte_count 2
		byte_count |= hex2nib(c);
            case 3: // address 0
                address = hex2nib(c) << 12;
                break;
            case 4: // address 1
                address |= hex2nib(c) << 8;
                break;
            case 5: // address 2
                address |= hex2nib(c) << 4;
                break;
            case 6: // address 3
                address |= hex2nib(c);
                break;
            case 7: // record_type 0
                record_type = hex2nib(c) << 4;
                break;
	    case 8: // record_type 1
		record_type |= hex2nib(c);
		break;
            default:
                switch(record_type)
                {
                case 0: // data
		    if (data_index < (byte_count * 2))
		    {
			if ((data_index % 2) == 1)
			{
			    hex_buffer |= hex2nib(c);
			    write(base_address + address, hex_buffer);	
			    ++address;
			}
			else
			{
			    hex_buffer = hex2nib(c) << 4;
			}
			++data_index;
		    }
		    else // checksum
		    {
			record_type = 6;
			data_index = 0;
		    }
                    break;
                case 1: // EOF
		    i = data.length; // break out of for loop
                    break;
                case 2: // extended segment address
		    // probably not used
                    break;
                case 3: // start segment address
		    // probably not used
                    break;
                case 4: // extended linear address
		    if (data_index == 0)
		    {
			base_address = hex2nib(c);
			++data_index;
		    }
		    else if (data_index < (byte_count * 2))
		    {
			base_address |= hex2nib(c) << (4 * data_index);
			++data_index;
		    }
		    else // checksum
		    {
			record_type = 6;
			data_index = 0;
		    }
                    break;
                case 5: // start linear address
		    // probably not used
                    break;
                case 6: // checksum
		    
		    break;
		}
                break;
            }
            ++h_index;
        }
    }
}

function ihex_handle(element, write)
{
    var input = element;
    var f = input.files[0];
    if (f)
    {
        var r = new FileReader();
        r.onload = function(e)
        {
            var chars_view = new Int8Array(r.result);
            ihex_parse(chars_view, write);
        };
        r.readAsArrayBuffer(f);
	return true;
    }
    return false;
}
