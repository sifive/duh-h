#!/usr/bin/env node
'use strict';

const fs = require('fs-extra');
const yargs = require('yargs');
const duhCore = require('duh-core');

const lib = require('../lib/index.js');

const genMetals = async argv => {
  if (argv.verbose) {
    console.log('generate');
  }
  const duh = await duhCore.readDuh(argv);

  // generate .h file
  const headerFile = lib.generate(duh);

  if (argv.output) {
    await fs.outputFile(argv.output, headerFile);
  } else {
    console.log(headerFile);
  }
};

yargs
  .option('verbose', {
    alias: 'v',
    default: false
  })
  .command({
    command: 'metals filename [output]',
    desc: 'convert DUH file to Header file for Metals',
    handler: genMetals,
    builder: yargs => {
      yargs
        .positional('filename', {
          type: 'string',
          desc: 'DUH file name'
        })
        .positional('output', {
          type: 'string',
          desc: 'Header file name'
        });
    }
  })
  .demandCommand()
  .help().argv;
