import * as util from 'util';
import * as format from 'date-fns/format';
import * as stackTrace from 'stacktrace-js';
import * as path from 'path';

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

export interface LoggerOption {
  showDate?         : boolean;
  showFunctionName? : boolean;
  showLevel?        : boolean;
  showFileName?     : boolean;
  showLineNumber?   : boolean;
  showColumnNumber? : boolean;
  dateFormat?       : string;
  useLocalBinding?  : boolean;
}

export abstract class Logger {

  protected _level: LogLevel = LogLevel.all;
  protected _addons: any[];

  private _lastLevel: LogLevel;
  private _dateFormat: string;
  private _table: boolean;

  private readonly _loggableLevels: string[] = [
    'trace',
    'debug',
    'info',
    'warn',
    'error',
    'fatal',
  ];

  protected _traceIndex     : number;

  showDate         : boolean;
  showFunctionName : boolean;
  showLevel        : boolean;
  showFileName     : boolean;
  showLineNumber   : boolean;
  showColumnNumber : boolean;
  protected _useLocalBinding  : boolean;

  [propName: string]: any;

  constructor(option: LoggerOption={}) {
    const opt = { ...option };

    this._dateFormat       = opt.dateFormat!;
    this._useLocalBinding  = opt.useLocalBinding!;

    this.showDate         = opt.showDate!;
    this.showFunctionName = opt.showFunctionName!;
    this.showLevel        = opt.showLevel!;
    this.showFileName     = opt.showFileName!;
    this.showLineNumber   = opt.showLineNumber!;
    this.showColumnNumber = opt.showColumnNumber!;

    this._traceIndex = 3;
  }

  abstract _log(item: LogItem): void;

  protected _prepareAddons(item: LogItem) {
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
  }

  on() {
    this.setLevel(this._lastLevel);
  }

  off() {
    this._lastLevel = this._level;
    this.setLevel('off');
  }

}


