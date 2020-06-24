'use strict';

const fields = (reg, prefix, offset) =>
  reg.fields.reduce((res, field) => {
    const name = (prefix + '__' + field.name).toUpperCase();
    const byteOffset = offset + Math.floor(field.bitOffset / 8);
    const bitOffset = ((byteOffset * 8) + field.bitOffset);
    const bitRem = bitOffset % 8;
    return res.concat(
      [
        '',
        '#define ' + name + ' ' + bitOffset,
        '#define ' + name + '_BYTE ' + byteOffset,
        '#define ' + name + '_BIT ' + bitRem,
        '#define ' + name + '_WIDTH ' + field.bitWidth
      ]
    );
  }, []);

const registers = (ab, prefix, offset) => {
  if (ab.registerFiles !== undefined) {
    return ab.registerFiles.reduce((res, reg) => {
      const name = (prefix + '_' + reg.name).toUpperCase();
      return res.concat(
        ['', '// Register file:' + reg.name + ', addressOffset:' + reg.addressOffset]
          .concat(registers(reg, name, offset + reg.addressOffset))
      );
    }, []);
  } else {
    return ab.registers.reduce((res, reg) => {
      const name = (prefix + '_' + reg.name).toUpperCase();
      return res.concat(
        ['', '// Register:' + reg.name + ', addressOffset:' + reg.addressOffset]
          .concat(fields(reg, name, offset + reg.addressOffset))
      );
    }, []);
  }
};

const addressBlocks = (bi, prefix) =>
  bi.addressBlocks.reduce((res, ab) => {
    const name = (prefix + '_' + ab.name).toUpperCase();
    return res.concat(
      ['', '// Address block:' + ab.name + ', baseAddress:' + ab.baseAddress]
        .concat(registers(ab, name, ab.baseAddress))
    );
  }, []);

const memoryMaps = comp => {
  return comp.memoryMaps.reduce((res, bi) => {
    const name = (comp.name + '_' + bi.name).toUpperCase();
    return res.concat(
      ['', '// Memory map:' + bi.name].concat(addressBlocks(bi, name))
    );
  }, []);
};

exports.generate = p => {
  const comp = p.component;
  return [
    '// See LICENSE for license details.',
    '',
    '#ifndef ' + comp.name + '_h',
    '#define ' + comp.name + '_h',
    '',
    '// Component:' + comp.name
  ]
    .concat(memoryMaps(comp))
    .concat(['', '#endif', ''])
    .join('\n');
};
