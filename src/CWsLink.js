/**
 * 确信平台SDK封装
 *
 * @module      CWsLink.js
 * @auther      ALEX
 * @date        2019/03/23
 * @email       8187265@qq.com
 */
const WebSocket = (window === global)?window.WebSocket:require('ws');
const IDT = require('./IDTConst');
const PUtility = require('./PUtility');
const CommLogger = require('./Logger');

const CWsLink = function()
{
    const self = this;
    self.ModuleName     = null;         //模块名字

    //初始化标志
    self.bInit = false;

    //配置参数
    self.strPeerUrl     = null;
    self.bNeedReg       = false;        //是否需要发起注册
    self.strUserId      = null;         //用户ID,可能是号码或者名字
    self.strUserPwd     = null;         //密码
    //回调函数指针
    self.onRecvMsg      = null;         //收到消息
    self.onStatus       = null;         //状态指示

    //运行参数
    self.m_bFirstStart  = true;         //是否第一次启动
    self.Status         = 0;            //0空闲,1连接发送,2注册发送,3运行
    self.Link           = null;         //WebSocket链路
    self.strUserNum     = null;         //用户号码
    self.CONNECT_TIMER_LEN = 5000;      //连接定时器,监视onOpen
    self.TimerConnect   = null;
    self.LOGIN_TIMER_LEN= 10000;        //登录超时定时器,监视注册消息
    self.TimerLogin     = null;
    self.HB_TIMER_LEN   = 5000;         //心跳定时器,监视链路
    self.TimerHB        = null;
    self.iHBCount       = 0;
    self.strAuthRsp     = null;         //鉴权计算结果,还需要给应用层,作为TOKEN

//--------------------------------------------------------------------------------
//      初始化
//  输入:
//      无
//  返回:
//      0:              成功
//      -1:             失败
//--------------------------------------------------------------------------------
    self.Init = function()
    {
        CommLogger.info(self.ModuleName, "Init");

        self.bInit          = false;

        self.strPeerUrl     = null;
        self.bNeedReg       = false;    //是否需要发起注册
        self.strUserId      = null;     //用户ID,可能是号码或者名字
        self.strUserPwd     = null;     //密码
        //回调函数指针
        self.onRecvMsg      = null;     //收到消息
        self.onSendMsg      = null;     //发送消息
        self.onStatus       = null;     //状态指示

        //运行参数
        self.m_bFirstStart  = true;     //是否第一次启动
        self.Status         = 0;        //0空闲,1连接发送,2注册发送,3运行
        self.Link           = null;     //WebSocket链路
        self.strUserNum     = null;     //用户号码
        self.CONNECT_TIMER_LEN = 5000;  //连接定时器,监视onOpen
        self.TimerConnect   = null;
        self.LOGIN_TIMER_LEN= 10000;    //登录超时定时器,监视注册消息
        self.TimerLogin     = null;
        self.HB_TIMER_LEN   = 5000;     //心跳定时器,监视链路
        self.TimerHB        = null;
        self.iHBCount       = 0;
        self.strAuthRsp     = null;     //鉴权计算结果,还需要给应用层,作为TOKEN
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
    self.ClearRun = function()
    {
        CommLogger.info(self.ModuleName, "ClearRun");

        //释放定时器
        if (null != self.TimerConnect)
        {
            CommLogger.info(self.ModuleName, "Stop TimerConnect");
            clearTimeout(self.TimerConnect);
            self.TimerConnect = null;
        }
        if (null != self.TimerLogin)
        {
            CommLogger.info(self.ModuleName, "Stop TimerLogin");
            clearTimeout(self.TimerLogin);
            self.TimerLogin = null;
        }
        if (null != self.TimerHB)
        {
            CommLogger.info(self.ModuleName, "Stop TimerHB");
            clearTimeout(self.TimerHB);
            self.TimerHB = null;
        }

        //释放链路
        if (null != self.Link)
        {
            self.Link.close();
            self.Link = null;
            CommLogger.info(self.ModuleName, "LinkClose");
        }
        return 0;
    };

//--------------------------------------------------------------------------------
//      进入连接状态
//  输入:
//      无
//  返回:
//      0:              成功
//      -1:             失败
//--------------------------------------------------------------------------------
    self.ConnectReq = function()
    {
        CommLogger.info(self.ModuleName, "ConnectReq");
        self.ClearRun();

        self.SetStatus(1, IDT.CAUSE_ZERO);

        //启动连接
        self.Link = new WebSocket(self.strPeerUrl);
        self.Link.binaryType = "blob";
        CommLogger.info(self.ModuleName, "LinkCreate");
        self.Link.onopen = function(evt) {
            self.onWsOpen(evt)
        };
        self.Link.onclose = function(evt) {
            self.onWsClose(evt)
        };
        self.Link.onmessage = function(evt) {
            self.onWsMessage(evt)
        };
        self.Link.onerror = function(evt) {
            self.onWsError(evt)
        };

        //启动定时器
        CommLogger.info(self.ModuleName, "Start TmConnect", self.CONNECT_TIMER_LEN);
        self.TimerConnect = setTimeout(self.TmConnect, self.CONNECT_TIMER_LEN);
        if (true == self.bNeedReg)
        {
            CommLogger.info(self.ModuleName, "Start TmLogin", self.LOGIN_TIMER_LEN);
            self.TimerLogin = setTimeout(self.TmLogin, self.LOGIN_TIMER_LEN);
        }
        return 0;
    };

//--------------------------------------------------------------------------------
//      内部使用的发送Json消息
//  输入:
//      data:           Json数据
//  返回:
//      0:              成功
//      -1:             失败
//--------------------------------------------------------------------------------
    self.SendJsonInner = function(data)
    {
//――――――――――――――――――――――――――――――――――――
//    属性值        属性常量        描述
//――――――――――――――――――――――――――――――――――――
//    0        CONNECTING        连接尚未建立
//    1        OPEN            WebSocket的链接已经建立
//    2        CLOSING            连接正在关闭
//    3        CLOSED            连接已经关闭或不可用
//――――――――――――――――――――――――――――――――――――
        if (1 != self.Link.readyState)
        {
            return -1;
        }

        if (null == data.SrcFsm)
        {
            data.SrcFsm = 0xffffffff;
        }
        if (null == data.DstFsm)
        {
            data.DstFsm = 0xffffffff;
        }

        var strMsg = JSON.stringify(data);
        self.Link.send(strMsg);

        if (self.onSendMsg && m_IDT_INST.RUN_MODE_DEBUG == m_IDT_INST.RUN_MODE)
        {
            self.onSendMsg(self.ModuleName, data);
        }
        return 0;
    };
//--------------------------------------------------------------------------------
//      发送Json消息
//  输入:
//      data:           Json数据
//  返回:
//      0:              成功
//      -1:             失败
//--------------------------------------------------------------------------------
    self.SendJson = function(data)
    {
        if (3 != self.Status)
            return -1;
        return self.SendJsonInner(data);
    };
//--------------------------------------------------------------------------------
//      设置状态
//  输入:
//      status:         状态值
//      usCause:        原因值
//  返回:
//      0:              成功
//      -1:             失败
//--------------------------------------------------------------------------------
    self.SetStatus = function(status, usCause)
    {
        CommLogger.info(self.ModuleName, "Status=", status, IDT.GetCauseStr(usCause));
        var oldStatus = self.Status;
        self.Status = status;

        if (null != self.onStatus)
        {
            //第一次启动,无条件发送响应
            if (self.m_bFirstStart)
            {
                if (3 == status)
                {
                    self.onStatus(1, usCause);
                    self.m_bFirstStart = false;
                    CommLogger.info(self.ModuleName, "onStatus", 1);
                }
                else if (0 == status)
                {
                    self.onStatus(0, usCause);
                    self.m_bFirstStart = false;
                    CommLogger.info(self.ModuleName, "onStatus", 0);
                }
            }
            else
            {
                if (3 != oldStatus && 3 == status)
                {
                    self.onStatus(1, usCause);
                    CommLogger.info(self.ModuleName, "onStatus", 1);
                }
                else if (3 == oldStatus && 0 == status)
                {
                    self.onStatus(0, usCause);
                    CommLogger.info(self.ModuleName, "onStatus", 0);
                }
            }
        }
        return 0;
    };

//--------------------------------------------------------------------------------
//      收到打开指示
//  输入:
//      evt
//  返回:
//      0:              成功
//      -1:             失败
//--------------------------------------------------------------------------------
    self.onWsOpen = function(event)
    {
        CommLogger.info(self.ModuleName, "onWsOpen");

        if (null == self.bInit)
            return 0;

        //停止连接定时器
        if (null != self.TimerConnect)
        {
            CommLogger.info(self.ModuleName, "Stop TimerConnect");
            clearTimeout(self.TimerConnect);
            self.TimerConnect = null;
        }

        //进入连接态
        self.SetStatus(2, IDT.CAUSE_ZERO);
        //如果需要注册
        if (true == self.bNeedReg)
        {
            //启动注册流程
            self.SendJsonInner({
                MsgCode : IDT.MSG_MM_REGREQ,
                MsgBody :
                    {
                        UsrNum      : self.strUserNum,  //用户号码
                        RegType     : 1,                //开机注册
                        AuthAlg     : "MD5",
                        AuthRealm   : "",
                        AuthNonce   : "",
                        AuthRsp     : "",
                        ConCurrent  : 0                 //第二链路,以后要去掉
                    }
            });

            //启动登录定时器.如果是Start调用引起的注册,在Start时,就启动了登录定时器
            if (null == self.TimerLogin)
            {
                CommLogger.info(self.ModuleName, "Start TmLogin", self.LOGIN_TIMER_LEN);
                self.TimerLogin = setTimeout(self.TmLogin, self.LOGIN_TIMER_LEN);
            }
        }
        else
        {
            if (null != self.onStatus)
            {
                self.SetStatus(3, IDT.CAUSE_ZERO);
            }
        }
        //启动心跳
        CommLogger.info(self.ModuleName, "Start TmHB", self.HB_TIMER_LEN);
        self.TimerHB = setTimeout(self.TmHB, self.HB_TIMER_LEN);
        return 0;
    };
//--------------------------------------------------------------------------------
//      收到关闭指示
//  输入:
//      evt
//  返回:
//      0:              成功
//      -1:             失败
//--------------------------------------------------------------------------------
    self.onWsClose = function(event)
    {
        CommLogger.info(self.ModuleName, "onWsClose");

        if (null == self.bInit)
            return 0;

        return 0;

        //依赖定时器
        /*
        self.ClearRun();
        //进入空闲态
        self.SetStatus(0);

        CommLogger.info(self.ModuleName, "Start TmConnect", self.CONNECT_TIMER_LEN);
        self.TimerConnect = setTimeout(self.TmConnect, self.CONNECT_TIMER_LEN);
        return 0;*/
    };
//--------------------------------------------------------------------------------
//      收到数据指示
//  输入:
//      evt
//  返回:
//      0:              成功
//      -1:             失败
//--------------------------------------------------------------------------------
    self.onWsMessage = function(event)
    {
        if (null == self.bInit)
            return 0;

        var msg = {};
        //try
        //{
        self.iHBCount = 0;

        // console.log('onMessage:', JSON.parse(event.data));
        // console.log('onMessage:', event.data);
        // console.log('onMessage:', JSON.stringify(JSON.parse(event.data), null, 4));

        //1.\r\n  ->  <br/>       SDP
        var newstr1 = event.data.replace(new RegExp("\r\n", "g"), "<br/>");
        //2.\n->空
        var newstr2 = newstr1.replace(new RegExp("\n", "g"), "");
        //3.\     ->  \\          文件路径
        var newstr3 = newstr2.replace(new RegExp("\\\\", "g"), "\\\\");
        //3.4.5,为会议链接转换
        //"{"MsgCode":"MM_PASSTHROUGH", "SrcFsm":-1, "DstFsm":48, "MsgBody":{"MyNum":"2010","PeerNum":"2014","TransMsgID":27,"ImInfo":{"Code":1,"Type":17,"UtSn":300,"Sn":"2018-03-13 16:40:45-5@300@76","Time":"2018-03-13 16:40:44","From":"2010","To":"#20018888810","OriTo":"20018888810","Txt":"{"fromDesc":"2010","fromNumber":"2010","subPara":"{\"accept\":false,\"content\":\"会议开始通知, 点击加入\",\"desc\":\"调度员发起组会议:\",\"meetId\":\"20018888810\",\"number\":\"20018888810\",\"time\":\"1970-01-01 08:00:00\",\"title\":\"\",\"type\":2}","toDesc":"","toNumber":"20018888810","type":0}","FileName":"","SourceFileName":""}}}"
        //4.\\"   ->  "
        var newstr4 = newstr3.replace(new RegExp('\\\\\\\\"', "g"), '"');
        //5.":"{" ->  ":{"
        var newstr5 = newstr4.replace(new RegExp('":"{"', "g"), '":{"');
        //6.}","  ->  },"
        var newstr6 = newstr5.replace(new RegExp('}","', "g"), '},"');
        try
        {
            msg = JSON.parse(newstr6);
        }
        catch (e)
        {
            CommLogger.info(self.ModuleName, "ErrorMsg:", event.data);
            return -1;
        }

        if (null != self.onRecvMsg)
        {
            self.onRecvMsg(msg);
        }

        switch (msg.MsgCode)
        {
            case IDT.MSG_MM_REGRSP://注册响应
                CommLogger.info(self.ModuleName, IDT.MSG_MM_REGRSP, IDT.GetCauseStr(msg.MsgBody.Result));

                switch (msg.MsgBody.Result)
                {
                    case 25://需要鉴权
                        self.strAuthRsp = PUtility.AuthMD5_Calc(msg.MsgBody.UsrNum, msg.MsgBody.AuthRealm, self.strUserPwd,
                            "REGISTER", msg.MsgBody.AuthAlg, msg.MsgBody.AuthNonce, "0.0.0.0");
                        self.SendJsonInner({
                            MsgCode : IDT.MSG_MM_REGREQ,
                            MsgBody : {
                                UsrNum      : msg.MsgBody.UsrNum,
                                RegType     : msg.MsgBody.RegType,
                                AuthAlg     : msg.MsgBody.AuthAlg,
                                AuthRealm   : msg.MsgBody.AuthRealm,
                                AuthNonce   : msg.MsgBody.AuthNonce,
                                AuthRsp     : self.strAuthRsp,
                                ConCurrent  : 0         //第二链路,以后要去掉
                            }
                        });
                        break;

                    case 0://注册成功
                        self.SetStatus(3, msg.MsgBody.Result);
                        CommLogger.info(self.ModuleName, "Stop TimerLogin");
                        clearTimeout(self.TimerLogin);
                        self.TimerLogin = null;
                        msg.MsgBody.AuthRsp = self.strAuthRsp;
                        break;

                    default:
                        self.SetStatus(0, msg.MsgBody.Result);
                        self.ClearRun();

                        // added by alex 2019-03-29
                        self.TimerLogin = setTimeout(self.TmLogin, self.LOGIN_TIMER_LEN);
                        break;
                }
                break;

            default:
                break;
        }
        //}
        //catch (e)
        //{
        //    CommLogger.info(self.ModuleName, "ErrorMsg:", event);
        //}
        return 0;
    };
//--------------------------------------------------------------------------------
//      收到错误指示
//  输入:
//      evt
//  返回:
//      0:              成功
//      -1:             失败
//--------------------------------------------------------------------------------
    self.onWsError = function(evt)
    {
        CommLogger.info(self.ModuleName, "onWsError");

        if (null == self.bInit)
            return 0;

        return 0;

        //出错处理
        //if (null != self.onUserError)
        //{
        //    self.onUserError(evt);
        //}
    };

//--------------------------------------------------------------------------------
//      Connect定时器到期
//--------------------------------------------------------------------------------
    self.TmConnect = function()
    {
        CommLogger.info(self.ModuleName, "TmConnectExpire");

        if (null == self.bInit)
            return 0;

        //到初始状态,重新连接
        self.TimerConnect = null;
        //进入空闲态
        self.SetStatus(0, IDT.CAUSE_ZERO);

        //重新连接
        self.ConnectReq();
    };
//--------------------------------------------------------------------------------
//      Login定时器到期
//--------------------------------------------------------------------------------
    self.TmLogin = function()
    {
        CommLogger.info(self.ModuleName, "TmLoginExpire");
        if (null == self.bInit)
            return 0;

        //到初始状态,重新连接
        self.TimerConnect = null;
        //进入空闲态
        self.SetStatus(0, IDT.CAUSE_TIMER_EXPIRY);

        //重新连接
        self.ConnectReq();
    };
//--------------------------------------------------------------------------------
//      HB定时器到期
//--------------------------------------------------------------------------------
    self.TmHB = function()
    {
        if (null == self.bInit)
            return 0;

        //CommLogger.info(self.ModuleName, "TmHBExpire");
        self.iHBCount++;

        if (self.iHBCount >= 3)
        {
            CommLogger.info(self.ModuleName, "TmHB_Disc");

            //到初始状态,重新连接
            self.TimerConnect = null;
            //进入空闲态
            self.SetStatus(0, IDT.CAUSE_TIMER_EXPIRY);
            //重新连接
            self.ConnectReq();
        }
        else
        {
            self.SendJsonInner({MsgCode : IDT.MSG_HB});//发送心跳包消息
            //启动心跳
            //CommLogger.info(self.ModuleName, "Start TmHB", self.HB_TIMER_LEN);
            self.TimerHB = setTimeout(self.TmHB, self.HB_TIMER_LEN);
        }
    };

//--------------------------------------------------------------------------------
//      启动
//  输入:
//      ModuleName:     模块名字
//      strPeerUrl:     对端URL
//      bNeedReg:       是否需要注册
//      strUserId:      用户ID,可以是号码,或者名字(UTF-8)
//      strUserPwd:     密码
//      onStatus:       状态回调
//      onRecvMsg:      消息到达回调
//      onSendMsg:      消息发送回调
//  返回:
//      0:              成功
//      -1:             失败
//--------------------------------------------------------------------------------
    self.Start = function(ModuleName, strPeerUrl, bNeedReg, strUserId, strUserPwd, onStatus, onRecvMsg, onSendMsg, objIdtApi)
    {
        self.ModuleName = ModuleName;
        self.IdtApi = objIdtApi;
        self.ServiceInstanse = self.IdtApi.ServiceInstanse;

        CommLogger.info(self.ModuleName, "Start");
        // 1.判断是否初始化过
        if (true == self.bInit)
        {
            // 2.如果初始化过,而且地址/用户ID和密码都相同,而且在线,返回成功
            if (self.strPeerUrl == strPeerUrl && self.strUserId == strUserId && self.strUserPwd == strUserPwd)
            {
                return 0;
            }

            // 3.如果初始化过,释放资源
            self.Exit();
        }

        // 初始化数据
        self.Init();
        CommLogger.info(self.ModuleName, "Init finished");

        // 记录参数
        self.strPeerUrl     = strPeerUrl;
        self.bNeedReg       = bNeedReg;
        self.strUserId      = strUserId;
        self.strUserPwd     = strUserPwd;
        self.onStatus       = onStatus;
        self.onRecvMsg      = onRecvMsg;
        self.onSendMsg      = onSendMsg;
        self.strUserNum     = strUserId;

        // 启动连接
        self.ConnectReq();

        self.bInit      = true;
        return 0;
    };
//--------------------------------------------------------------------------------
//      退出
//  输入:
//      无
//  返回:
//      0:              成功
//      -1:             失败
//--------------------------------------------------------------------------------
    self.Exit = function()
    {
        CommLogger.info(self.ModuleName, "Exit");

        self.ClearRun();

        self.bInit          = null;

        //配置参数
        self.strPeerUrl     = null;
        self.bNeedReg       = null;     //是否需要发起注册
        self.strUserId      = null;     //用户ID,可能是号码或者名字
        self.strUserPwd     = null;     //密码
        //回调函数指针
        self.onRecvMsg      = null;     //收到消息
        self.onSendMsg      = null;     //发送消息
        self.onStatus       = null;     //状态指示

        //运行参数
        self.m_bFirstStart  = null;     //是否第一次启动
        self.Status         = null;     //0空闲,1连接发送,2注册发送,3运行
        self.Link           = null;     //WebSocket链路
        self.strUserNum     = null;     //用户号码
        self.CONNECT_TIMER_LEN = null;  //连接定时器,监视onOpen
        self.TimerConnect   = null;
        self.LOGIN_TIMER_LEN= null;     //登录超时定时器,监视注册消息
        self.TimerLogin     = null;
        self.HB_TIMER_LEN   = null;     //心跳定时器,监视链路
        self.TimerHB        = null;
        self.iHBCount       = null;
        self.strAuthRsp     = null;     //鉴权计算结果,还需要给应用层,作为TOKEN

        return 0;
    };
};

module.exports = CWsLink;