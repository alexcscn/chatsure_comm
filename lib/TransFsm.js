/**
 * 确信平台SDK封装
 *
 * @module      TransFsm.js
 * @auther      ALEX
 * @date        2019/03/23
 * @email       8187265@qq.com
 */
const IDT = require('./IDTConst');
const CommLogger = require('./Logger');

const TransFsm = function () {
    const self = this;
    self.uiMyId = null; //自己的ID号,数组下标,系统启动时赋值,之后不会变

    //初始化标志
    self.bInit = false;
    //发起时间
    self.InvokeTime = null;
    //定时器
    self.TIMER_LEN = 10000; //定时器,监视事务是否超时
    self.Timer = null;
    //回调函数
    self.pfCallBack = null;

    //--------------------------------------------------------------------------------
    //      初始化
    //  输入:
    //      无
    //  返回:
    //      0:              成功
    //      -1:             失败
    //--------------------------------------------------------------------------------
    self.Init = function () {
        CommLogger.info("TransFsm[", self.uiMyId, "]", "Init");

        self.ClearRun();
        return 0;
    };

    //--------------------------------------------------------------------------------
    //      清除运行数据
    //  输入:
    //      无
    //  返回:
    //      0:              成功
    //      -1:             失败
    //--------------------------------------------------------------------------------
    self.ClearRun = function () {
        CommLogger.info("TransFsm[", self.uiMyId, "]", "ClearRun");

        self.InvokeTime = null;
        self.pfCallBack = null;
        if (null != self.Timer) {
            clearTimeout(self.Timer);
            self.Timer = null;
        }
        self.bInit = false;

        return 0;
    };

    //--------------------------------------------------------------------------------
    //      定时器到期
    //--------------------------------------------------------------------------------
    self.TmExp = function () {
        CommLogger.info("TransFsm[", self.uiMyId, "]", "TmExp");
        if (null == self.bInit) return 0;

        self.Timer = null;
        if (null != self.pfCallBack) {
            self.pfCallBack(false, IDT.CAUSE_TIMER_EXPIRY, null);
        }
        self.ClearRun();
    };

    //--------------------------------------------------------------------------------
    //      启动
    //  输入:
    //      pfCallBack:     回调函数
    //  返回:
    //      0:              成功
    //      -1:             失败
    //--------------------------------------------------------------------------------
    self.Start = function (pfCallBack) {
        CommLogger.info("TransFsm[", self.uiMyId, "]", "Start");
        self.bInit = true;
        //self.InvokeTime  = curTime;
        self.pfCallBack = pfCallBack;
        self.Timer = setTimeout(self.TmExp, self.TIMER_LEN);
        return 0;
    };
};

module.exports = TransFsm;