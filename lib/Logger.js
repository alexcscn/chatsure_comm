/**
 * Vistek Comm Service
 * 日志记录器定义
 *
 * @module      public.js
 * @auther      ALEX
 * @date        2019/04/17
 * @email       8187265@qq.com
 */

const CommLogger = new function () {
  this.info = console.log;
}();

module.exports = CommLogger;