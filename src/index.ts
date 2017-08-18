import * as chalk from 'chalk';
import * as logUpdate from 'log-update';
import * as textTable from 'text-table';
import * as util from 'util';
import * as format from 'date-fns/format';
import * as stackTrace from 'stacktrace-js';
import * as path from 'path';

const isBrowser: () => boolean = () => (process as any).browser;

export enum LogLevel {
  all   = 0,
  trace = 10,
  debug = 20,
  info  = 30,
  warn  = 40,
  error = 50,
  fatal = 60,
  off   = 100,
}

export interface LogItem {
  level: LogLevel;
  date?: Date;
  messages: any[];
}

export interface AyaOption {
  showDate?: boolean;
  showFunctionName?: boolean;
  showLevel?: boolean;
  showFileName?: boolean;
  showLineNumber?: boolean;
  showColumnNumber?: boolean;
  dateFormat?: string;
  useLocalBinding?: boolean;
}

export class Aya {

  static defaultOption: AyaOption = isBrowser()
    ? {
      showDate         : true,
      showFunctionName : false,
      showLevel        : true,
      showFileName     : false,
      showLineNumber   : false,
      showColumnNumber : false,
      dateFormat       : 'YYYY-MM-DD HH:mm:ss.SSS',
      useLocalBinding  : true,
    }
    : {
      showDate         : true,
      showFunctionName : true,
      showLevel        : true,
      showFileName     : true,
      showLineNumber   : true,
      showColumnNumber : false,
      dateFormat       : 'YYYY-MM-DD HH:m:ss.SSS',
      useLocalBinding  : true,
    }

  private _chalkMap = {
    [LogLevel.trace]: chalk.grey,
    [LogLevel.debug]: chalk.blue,
    [LogLevel.info]: chalk.green,
    [LogLevel.warn]: chalk.yellow,
    [LogLevel.error]: chalk.red,
    [LogLevel.fatal]: chalk.red.bold,
  }

  private _browserMap = {
    [LogLevel.trace]: 'color:grey',
    [LogLevel.debug]: 'color:blue',
    [LogLevel.info]: 'color:green',
    [LogLevel.warn]: 'color:orange',
    [LogLevel.error]: 'color:red',
    [LogLevel.fatal]: 'color:red; font-weight:700',
  }

  private _level: LogLevel = LogLevel.all;
  private _lastLevel: LogLevel;
  private _dateFormat: string;
  private _table: boolean;
  private _addons: any[];
  private readonly _loggableLevels: string[] = [
    'trace',
    'debug',
    'info',
    'warn',
    'error',
    'fatal',
  ];

  private _traceIndex       : number;
  private _showDate         : boolean;
  private _showFunctionName : boolean;
  private _showLevel        : boolean;
  private _showFileName     : boolean;
  private _showLineNumber   : boolean;
  private _showColumnNumber : boolean;
  private _useLocalBinding  : boolean;

  get showDate()         : boolean { return this._showDate; }
  get showFunctionName() : boolean { return this._showFunctionName; }
  get showLevel()        : boolean { return this._showLevel; }
  get showFileName()     : boolean { return this._showFileName; }
  get showLineNumber()   : boolean { return this._showLineNumber; }
  get showColumnNumber() : boolean { return this._showColumnNumber; }

  set showDate(newValue: boolean)          { this._showDate         = newValue; isBrowser() && this._bindToConsoleLog() }
  set showFunctionName(newValue: boolean)  { this._showFunctionName = newValue; isBrowser() && this._bindToConsoleLog() }
  set showLevel(newValue: boolean)         { this._showLevel        = newValue; isBrowser() && this._bindToConsoleLog() }
  set showFileName(newValue: boolean)      { this._showFileName     = newValue; isBrowser() && this._bindToConsoleLog() }
  set showLineNumber(newValue: boolean)    { this._showLineNumber   = newValue; isBrowser() && this._bindToConsoleLog() }
  set showColumnNumber(newValue: boolean)  { this._showColumnNumber = newValue; isBrowser() && this._bindToConsoleLog() }

  [propName: string]: any;

  constructor(option: AyaOption={}) {
    const opt = { ...Aya.defaultOption, ...option };

    this._dateFormat       = opt.dateFormat!;
    this._showDate         = opt.showDate!;
    this._showFunctionName = opt.showFunctionName!;
    this._showLevel        = opt.showLevel!;
    this._showFileName     = opt.showFileName!;
    this._showLineNumber   = opt.showLineNumber!;
    this._showColumnNumber = opt.showColumnNumber!;
    this._useLocalBinding  = opt.useLocalBinding!;

    this._traceIndex = 3;

    if (isBrowser()) {
      this._bindToConsoleLog();

      this._traceIndex = 2;
    }
  }

  private _bindToConsoleLog() {
    this['trace'] = this._log({ level: LogLevel.trace, messages: [] });
    this['debug'] = this._log({ level: LogLevel.debug, messages: [] });
    this['info']  = this._log({ level: LogLevel.info, messages: [] });
    this['warn']  = this._log({ level: LogLevel.warn, messages: [] });
    this['error'] = this._log({ level: LogLevel.error, messages: [] });
    this['fatal'] = this._log({ level: LogLevel.fatal, messages: [] });
  }

  private _log(item: LogItem) {
    this._prepareAddons(item);

    if (isBrowser()) {
      return item.level >= this._level
        ? console.log.bind(window.console, `%c${this._addons.join(' ')}${this._addons.length === 0 ? '' : ':'}`, this._browserMap[item.level], ...item.messages)
        : () => {};
    } else {
      const output = `${this._addons.join(' ')}${this._addons.length === 0 ? '' : ': '}${item.messages.map(x => util.inspect(x)).join(', ')}`;
      const chalk = this._chalkMap[item.level];

      if (chalk === void 0) {
        throw new Error('got unexpected log level');
      }

      if (item.level >= this._level) {
        console.log(chalk(output));
      }
    }
  }

  private _prepareAddons(item: LogItem) {
    this._addons = [];

    if (this.showDate)
      this._addons.push(`${format(new Date(), this._dateFormat)}`);

    if (this.showLevel)
      this._addons.push(`[${LogLevel[item.level]}]`);

    const stack = stackTrace.getSync();
    const funcs = stack.map(s => s.getFunctionName());
    const fileNames = stack.map(s => s.getFileName());
    const lineNumbers = stack.map(s => s.getLineNumber());
    const columnNumbers = stack.map(s => s.getColumnNumber());
    const fileName = this._getBasedirAndName(fileNames[3])

    if (this.showFunctionName) {
      this._addons.push(`[${funcs[this._traceIndex]}]`);
    }

    if (this.showFileName && this.showLineNumber && this.showColumnNumber) {
      this._addons.push(`[${fileName}:${lineNumbers[this._traceIndex]}-${columnNumbers[this._traceIndex]}]`);
    } else if (this.showFileName && this.showLineNumber) {
      this._addons.push(`[${fileName}:${lineNumbers[this._traceIndex]}]`);
    }

  }

  private _getBasedirAndName(filename: string) {
    const basename = path.basename(filename)
    const basedir = path.basename(path.dirname(filename))
    return `... ${basedir}/${basename}`;
  }

  private _getLogLevelNames() {
    return util.inspect(Object.keys(LogLevel).filter(k => isNaN(+k)));
  }

  setLevel(level: string | LogLevel) {
    if (!(level in LogLevel)) {
      throw new Error(`level must be one of ${this._getLogLevelNames()}`)
    }

    if (typeof level === 'string') {
      this._level = LogLevel[level as keyof typeof LogLevel] as LogLevel;
    } else {
      this._level = level;
    }

    isBrowser() && this._bindToConsoleLog();
  }

  on() {
    this.setLevel(this._lastLevel);
  }

  off() {
    this._lastLevel = this._level;
    this.setLevel('off');
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

