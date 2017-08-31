import * as chalk from 'chalk';
import * as util from 'util';
import { Logger, LogLevel, LoggerOption, LogItem } from './logger';

export class Aya extends Logger {

  static defaultOption = {
    showDate         : true,
    showFunctionName : true,
    showLevel        : true,
    showFileName     : true,
    showLineNumber   : true,
    showColumnNumber : false,
    dateFormat       : 'YYYY-MM-DD HH:m:ss.SSS',
    useLocalBinding  : true,
  }

  constructor(option: LoggerOption={}) {
    super(option);
    const opt = { ...Aya.defaultOption, ...option };

    this.dateFormat       = opt.dateFormat!;
    this.showDate         = opt.showDate!;
    this.showFunctionName = opt.showFunctionName!;
    this.showLevel        = opt.showLevel!;
    this.showFileName     = opt.showFileName!;
    this.showLineNumber   = opt.showLineNumber!;
    this.showColumnNumber = opt.showColumnNumber!;
    this.useLocalBinding  = opt.useLocalBinding!;

    this._traceIndex = 3;

  }

  private _chalkMap = {
    [LogLevel.trace]: chalk.grey,
    [LogLevel.debug]: chalk.blue,
    [LogLevel.info]: chalk.green,
    [LogLevel.warn]: chalk.yellow,
    [LogLevel.error]: chalk.red,
    [LogLevel.fatal]: chalk.red.bold,
  }

  _log(item: LogItem) {
    this._prepareAddons(item);

    const output = `${this._addons.join(' ')}${this._addons.length === 0 ? '' : ': '}${item.messages.map(x => util.inspect(x)).join(', ')}`;
    const chalk = this._chalkMap[item.level];

    if (chalk === void 0) {
      throw new Error('got unexpected log level');
    }

    if (item.level >= this._level) {
      console.log(chalk(output));
    }
  }

  trace(...messages: any[]) {
    this._log({ level: LogLevel.trace, messages });
  }

  debug(...messages: any[]) {
    this._log({ level: LogLevel.debug, messages });
  }

  info(...messages: any[]) {
    this._log({ level: LogLevel.info, messages });
  }

  warn(...messages: any[]) {
    this._log({ level: LogLevel.warn, messages });
  }

  error(...messages: any[]) {
    this._log({ level: LogLevel.error, messages });
  }

  fatal(...messages: any[]) {
    this._log({ level: LogLevel.fatal, messages });
  }

}

