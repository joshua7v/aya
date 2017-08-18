import { Aya } from '../src';

const aya = new Aya();

const arr = [ 1, 2, 3, 4 ];
const obj = { example: 'example prop', arr };
const messages = [ 'example message', arr, obj ];

main();

function main() {
  basicUsage();
  // setLevel();
  // showFunctionName();
  // showDate();
}

function basicUsage() {
  aya.trace(...messages);
  aya.debug(...messages);
  aya.info(...messages);
  aya.warn(...messages);
  aya.error(...messages);
  aya.fatal(...messages);
}

function setLevel() {
  aya.setLevel('info');

  aya.trace(...messages);
  aya.debug(...messages);
  aya.info(...messages);
  aya.warn(...messages);

  aya.setLevel('fatal')

  aya.error(...messages);
  aya.fatal(...messages);
}

function showFunctionName() {
  aya.showFunctionName = false;

  aya.trace(...messages);
  aya.debug(...messages);
  aya.info(...messages);

  aya.showFunctionName = true;

  aya.warn(...messages);
  aya.error(...messages);
  aya.fatal(...messages);
}

function showDate() {
  aya.showDate = false;

  aya.trace(...messages);
  aya.debug(...messages);
  aya.info(...messages);

  aya.showDate = true;

  aya.warn(...messages);
  aya.error(...messages);
  aya.fatal(...messages);
}
