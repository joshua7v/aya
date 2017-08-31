import { Logger, LogLevel, LoggerOption, LogItem } from './logger';

export class Aya extends Logger {

  static defaultOption = {
    showDate         : true,
    showFunctionName : false,
    showLevel        : true,
    showFileName     : false,
    showLineNumber   : false,
    showColumnNumber : false,
    dateFormat       : 'YYYY-MM-DD HH:mm:ss.SSS',
    useLocalBinding  : true,
  }

  static colorMap = {
    [LogLevel.trace] : 'color : grey',
    [LogLevel.debug] : 'color : blue',
    [LogLevel.info]  : 'color : green',
    [LogLevel.warn]  : 'color : orange',
    [LogLevel.error] : 'color : red',
    [LogLevel.fatal] : 'color : red; font-weight : 700',
  }

  get showDate()         : boolean  {  return this._showDate;          }
  get showFunctionName() : boolean  {  return this._showFunctionName;  }
  get showLevel()        : boolean  {  return this._showLevel;         }
  get showFileName()     : boolean  {  return this._showFileName;      }
  get showLineNumber()   : boolean  {  return this._showLineNumber;    }
  get showColumnNumber() : boolean  {  return this._showColumnNumber;  }

  set showDate(newValue: boolean)          { this._showDate         = newValue; this._bindToConsoleLog() }
  set showFunctionName(newValue: boolean)  { this._showFunctionName = newValue; this._bindToConsoleLog() }
  set showLevel(newValue: boolean)         { this._showLevel        = newValue; this._bindToConsoleLog() }
  set showFileName(newValue: boolean)      { this._showFileName     = newValue; this._bindToConsoleLog() }
  set showLineNumber(newValue: boolean)    { this._showLineNumber   = newValue; this._bindToConsoleLog() }
  set showColumnNumber(newValue: boolean)  { this._showColumnNumber = newValue; this._bindToConsoleLog() }

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

    this._traceIndex = 2;

    this._bindToConsoleLog();
  }

  setLevel(level: string | LogLevel) {
    super.setLevel(level);

    this._bindToConsoleLog();
  }

  private _bindToConsoleLog() {
    this['trace'] = this._log({ level: LogLevel.trace, messages: [] });
    this['debug'] = this._log({ level: LogLevel.debug, messages: [] });
    this['info']  = this._log({ level: LogLevel.info, messages: [] });
    this['warn']  = this._log({ level: LogLevel.warn, messages: [] });
    this['error'] = this._log({ level: LogLevel.error, messages: [] });
    this['fatal'] = this._log({ level: LogLevel.fatal, messages: [] });
  }

  _log(item: LogItem) {
    this._prepareAddons(item);

    return item.level >= this._level
      ? console.log.bind(window.console, `%c${this._addons.join(' ')}${this._addons.length === 0 ? '' : ':'}`, Aya.colorMap[item.level], ...item.messages)
      : () => {};
  }

}

