/**
 * 确信平台SDK封装
 *
 * @module      CIdtApi.js
 * @auther      ALEX
 * @date        2019/03/23
 * @email       8187265@qq.com
 */
const IDT = require('./IDTConst');
const CCFsm = require('./CCFsm');
const CWsLink = require('./CWsLink');
const FsmMgr = require('./FsmMgr');
const SubsFsm = require('./SubsFsm');
const TransFsm = require('./TransFsm');
const CommLogger = require('./Logger');

const CIdtApi = function()
{
    var self = this;

//--------------------------------------------------------------------------------
//      变量定义
//--------------------------------------------------------------------------------
    self.RUN_MODE           = 1;            //0运行态,1调试态
    self.RUN_MODE_DEBUG     = 1;            //调试
    self.RUN_MODE_RELEASE   = 0;            //发布

    //初始化标志
    self.bInit              = false;

    //配置参数
    self.bIsIe              = null;         //是否IE浏览器
    self.strSrvUrl          = null;         //MC地址
    self.strUserId          = null;         //用户ID,可能是用户号码或用户名
    self.strUserPwd         = null;         //用户密码

    //运行参数
    self.bWss               = null;         //是否WSS,对拼接GS地址有用
    self.strUserNum         = null;         //用户号码
    self.strUserName        = null;         //用户名字
    self.McLink             = null;         //MC的连接
    self.strGpsSrvUrl       = null;         //GPS服务器地址
    self.strStunServer      = null;         //StunServer
    self.GsLink             = null;         //GPS服务器的连接
    self.strGpsServer       = null;         //GpsServer
    self.strFtpServer       = null;         //FtpServer
    self.strFtpUser         = null;         //Ftp用户名
    self.strFtpPwd          = null;         //Ftp密码
    self.strTaskInfo        = null;         //任务服务器信息
    self.MyOrg              = null;         //自己归属的组织信息
    self.UsrType            = null;         //用户类型          UT_TYPE_TAP
    self.UsrAttr            = null;         //用户属性          UT_ATTR_PC
    self.Token              = null;         //TOKEN
    self.CallBack           = null;         //回调函数
    self.TransMgr           = null;         //事务管理者
    self.CC                 = null;         //呼叫管理者
    self.LocalStream        = null;         //本地摄像头和MIC
    self.GUSubsTable        = null;         //用户/组状态订阅
    self.GpsSubsTable       = null;         //GPS订阅,和状态订阅数据结构相同
    self.ScanTimer          = null;         //扫描定时器,1秒一次回调,20秒一个周期
    self.GUScanPos          = null;         //用户和组状态扫描位置
    self.GpsScanPos         = null;         //Gps扫描位置
    self.AudioInList        = [];           //声音输入设备列表
    self.AudioOutList       = [];           //声音输出设备列表
    self.VideoInList        = [];           //视频输入设备列表

//--------------------------------------------------------------------------------
//      得到呼叫Stream
//  输入:
//      stream:         stream对象
//  返回:
//      0:              成功
//      -1:             失败
//--------------------------------------------------------------------------------
    self.GotStream = function(stream)
    {
        CommLogger.info("IdtApi", "Got local stream");
        self.LocalStream = stream;
    };

    self.gotDevices = function(mediaDevices)
    {
        var i = 0;
        var AudioIn = [], AudioOut = [], VideoIn = [];
        for (i = 0; i < mediaDevices.length; i++)
        {
            if (mediaDevices[i].kind === 'audioinput')
            {
                self.AudioInList.push(mediaDevices[i]);
            }
            else if (mediaDevices[i].kind === 'audiooutput')
            {
                self.AudioOutList.push(mediaDevices[i]);
            }
            else if (mediaDevices[i].kind === 'videoinput')
            {
                self.VideoInList.push(mediaDevices[i]);
            }
        }
    };

//--------------------------------------------------------------------------------
//      启动
//  输入:
//      strSrvUrl:      服务器地址      ws://192.168.2.11:10004     wss://192.168.2.11:8801/mc_wss
//      strGpsSrvUrl:   GPS服务器地址   ws://192.168.2.11:10005     wss://192.168.2.11:8801/gs_wss
//      strUserId:      用户ID,可以是号码,或者名字(UTF-8)
//      strPwd:         密码
//      iMaxTrans:      最大事务数
//      iMaxCall:       最大呼叫数
//      iMaxStatueSubs: 最大状态订阅数,通常是1,订阅"0"或"###"
//      iMaxGpsSubs:    最大GPS订阅数,默认4096,0表示不需要GPS功能
//      CallBack:       回调函数
//          onRecvMsgHook:      收到消息的钩子函数,只用来调试打印,如果修改消息内容,会出问题
//          onSendMsgHook:      发送消息的钩子函数,只用来调试打印,如果修改消息内容,会出问题
//          onStatusInd:        登录状态指示
//          onGInfoInd:         组信息指示,指示用户在哪些组里面
//          onIMRecv:           即时消息接收指示
//          onGUOamInd:         用户/组OAM操作指示
//          onGUStatusInd:      用户/组状态指示
//          onGpsRecInd:        GPS数据指示
//          onGpsHisQueryInd:   GPS历史数据查询响应
//          onCallInd:          呼叫指示
//      bIsIe:          是否IE浏览器
//  返回:
//      0:              成功
//      -1:             失败
//--------------------------------------------------------------------------------
    self.Start = function(strSrvUrl, strGpsSrvUrl, strUserId, strPwd, iMaxTrans, iMaxCall, iMaxStatusSubs, iMaxGpsSubs, CallBack, bIsIe)
    {
        // 1.判断是否初始化过
        if (true == self.bInit)
        {
            // 2.如果初始化过,而且地址/用户ID和密码都相同,而且在线,返回成功
            if (self.strSrvUrl == strSrvUrl && self.strUserId == strUserId && self.strUserPwd == strPwd && 3 == self.McLink.Status)
            {
                return 0;
            }

            // 3.如果初始化过,释放资源
            self.Exit();
        }
        m_IDT_INST      = self;
        // 记录参数
        self.strSrvUrl  = strSrvUrl;
        self.strGpsSrvUrl = strGpsSrvUrl;
        self.strUserId  = strUserId;
        self.strUserPwd = strPwd;
        self.CallBack   = CallBack;
        self.bIsIe      = bIsIe;
        self.ServiceInstanse = CallBack.ServiceInstanse;
        if (-1 == self.strSrvUrl.indexOf('wss'))
        {
            self.bWss   = false;
        }
        else
        {
            self.bWss   = true;
        }
        //转换STUN地址
        self.strStunServer = self.strSrvUrl.split("//")[1];
        self.strStunServer = self.strStunServer.split(":")[0];
        self.strStunServer = "stun:" + self.strStunServer + ":10101";

        // 启动连接
        self.McLink = new CWsLink();
        self.McLink.Start("McLink", strSrvUrl, true, strUserId, strPwd, self.CallBack.onStatusInd, self.onWsLinkMcMessage, self.CallBack.onSendMsgHook, self);
        //self.strUserNum = strUserId;

        //初始化事务资源
        self.TransMgr = new FsmMgr();
        self.TransMgr.Start("TransMgr", iMaxTrans, TransFsm);

        //初始化呼叫资源
        self.CC = new FsmMgr();
        self.CC.Start("CCMgr", iMaxCall, CCFsm);
        if (false == self.bIsIe)
        {
            //navigator.mediaDevices.enumerateDevices().then(self.gotDevices);

            if (false == self.bWss)//HTTPS模式下,打开摄像头和麦克风不弹框
            {
                //navigator.mediaDevices.getUserMedia({audio: true, video: true})
                //    .then(self.GotStream);
                //.catch(function(e) { alert("getUserMedia() error: " + e.name); });混淆不通过!!!!!!!!
            }
        }

        //状态订阅
        self.GUSubsTable = new FsmMgr();
        self.GUSubsTable.Start("StatusSubsMgr", iMaxStatusSubs, SubsFsm);

        //GPS订阅
        self.GpsSubsTable = new FsmMgr();
        self.GpsSubsTable.Start("GpsSubsMgr", iMaxGpsSubs, SubsFsm);

        self.ScanTimer  = setTimeout(self.TmScan, 1000);
        self.GUScanPos  = 0;
        self.GpsScanPos = 0;

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
        if (false == self.bInit)
        {
            return 0;
        }
        self.McLink.Exit();
        self.McLink = null;
        if (null != self.CallBack.onStatusInd)
        {
            self.CallBack.onStatusInd(0, IDT.CAUSE_ZERO);
        }
        if (null != self.GsLink)
        {
            self.GsLink.Exit();
            self.GsLink= null;
        }
        self.CC.Exit();
        try
        {
            self.LocalStream.getAudioTracks()[0].stop();
        }
        catch (e)
        {
        }
        try
        {
            self.LocalStream.getVideoTracks()[0].stop();
        }
        catch (e)
        {
        }
        if (null != self.ScanTimer)
        {
            CommLogger.info("IdtApi", "Stop ScanTimer");
            clearTimeout(self.ScanTimer);
            self.ScanTimer = null;
        }
        self.GUSubsTable.Exit();
        self.GpsSubsTable.Exit();

        //配置参数
        self.bIsIe              = null;
        self.strSrvUrl          = null;
        self.strUserId          = null;
        self.strUserPwd         = null;

        //运行参数
        self.bWss               = null;
        self.strUserNum         = null;         //用户号码
        self.strUserName        = null;         //用户名字
        self.McLink             = null;         //MC的连接
        self.strGpsSrvUrl       = null;         //GPS服务器地址
        self.strStunServer      = null;         //StunServer
        self.GsLink             = null;         //GPS服务器的连接
        self.strGpsServer       = null;         //GpsServer
        self.strFtpServer       = null;         //FtpServer
        self.strFtpUser         = null;         //Ftp用户名
        self.strFtpPwd          = null;         //Ftp密码
        self.strTaskInfo        = null;         //任务服务器信息
        self.MyOrg              = null;         //自己归属的组织信息
        self.UsrType            = null;         //用户类型  IDT_TYPE_
        self.UsrAttr            = null;         //用户属性
        self.Token              = null;         //TOKEN
        self.CallBack           = null;         //回调函数
        self.TransMgr           = null;         //事务管理者
        self.CC                 = null;         //呼叫管理者
        self.LocalStream        = null;         //本地摄像头和MIC
        self.GUSubsTable        = null;         //用户/组状态订阅
        self.GpsSubsTable       = null;         //GPS订阅,和状态订阅数据结构相同
        self.ScanTimer          = null;         //扫描定时器,1秒一次回调,20秒一个周期
        self.GUScanPos          = null;         //用户和组状态扫描位置
        self.GpsScanPos         = null;         //Gps扫描位置

        self.LocalStream        = null;
        self.GUSubsTable        = null;
        self.GpsSubsTable       = null;
        self.GUScanPos          = null;
        self.GpsScanPos         = null;         //扫描位置
        self.AudioInList.splice(0, self.AudioInList.length);//声音输入设备列表
        self.AudioOutList.splice(0, self.AudioOutList.length);//声音输出设备列表
        self.VideoInList.splice(0, self.VideoInList.length);//视频输入设备列表

        m_IDT_INST              = null;

        //初始化标志
        self.bInit              = null;
        return 0;
    };

//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//      状态
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//--------------------------------------------------------------------------------
//      清除状态订阅
//  输入:
//      subs:           订阅管理者
//      link:           链路
//  返回:
//      0:              成功
//      -1:             失败
//--------------------------------------------------------------------------------
    self.ClearAllStatusSubs = function(subs, link)
    {

        var i, count;
        var strMsg='[';
        for (i = 0, count = 0; i < subs.iMaxFsm; i++)
        {
            if (null == subs.Fsm[i])
                break;
            if (true != subs.Fsm[i].bInit)
                break;

            if (0 == count)
                strMsg += ('{"Num":"' + subs.Fsm[i].Num + '","Level":' + IDT.GU_STATUSSUBS_NONE + '}');
            else
                strMsg += (',{"Num":"' + subs.Fsm[i].Num + '","Level":' + IDT.GU_STATUSSUBS_NONE + '}');
            subs.Fsm[i].ClearRun();
            count++;
        }
        strMsg+=']';

        if (count <= 0)
            return 0;

        var msg = JSON.parse(strMsg);
        if (null == link)
            return -1;

        link.SendJson({
            MsgCode : IDT.MSG_MM_STATUSSUBS,
            MsgBody :
                {
                    UsrNum      : self.strUserNum,
                    SN          : 1,
                    StatusSubs  : msg
                }
        });
        return 0;
    };
//--------------------------------------------------------------------------------
//      发送一条订阅请求给服务器
//  输入:
//      link:           链路
//      num:            用户号码或组号码,"##0"表示取消之前所有订阅,"0"表示所有用户,"###"表示自己所属的所有组
//      level:          订阅级别,GU_STATUSSUBS_e
//      dwSn:           SN,0表示不需要立即发送状态,1表示启动一次性加载,else为响应服务器的SN
//  返回:
//      0:              成功
//      -1:             失败
//--------------------------------------------------------------------------------
    self.SendStatusSubsOne = function(link, num, level, dwSn)
    {
        if (null == num || '' == num)
            return -1;
        if (null == link)
            return -1;
        link.SendJson({
            MsgCode : IDT.MSG_MM_STATUSSUBS,
            MsgBody :
                {
                    UsrNum      : self.strUserNum,
                    SN          : dwSn,
                    StatusSubs  : [{Num : num, Level : level}]
                }
        });
        return 0;
    };
//--------------------------------------------------------------------------------
//      发送订阅请求给服务器
//  输入:
//      link:           链路
//      subs:           订阅表
//      iStart:         开始位置
//      iEnd:           结束位置
//  返回:
//      0:              发送了消息
//      -1:             没有发送消息
//--------------------------------------------------------------------------------
    self.SendStatusSubs = function(link, subs, iStart, iEnd, sn)
    {
        if (null == link || null == subs || iStart < 0 || iEnd > subs.iMaxFsm || iEnd < iStart || iEnd - iStart > IDT.GU_STATUSSUBS_MAXNUM)
            return -1;
        var msg = {};
        msg.MsgCode         = IDT.MSG_MM_STATUSSUBS;
        msg.MsgBody         = {};
        msg.MsgBody.UsrNum  = self.strUserNum;
        msg.MsgBody.SN      = sn;
        var i, j;
        msg.MsgBody.StatusSubs = [];
        for (i = iStart, j = 0; i < iEnd; i++, j++)
        {
            if (false == subs.Fsm[i].bInit)
                break;
            msg.MsgBody.StatusSubs[j] = {};
            msg.MsgBody.StatusSubs[j].Num = subs.Fsm[i].Num;
            msg.MsgBody.StatusSubs[j].Level = subs.Fsm[i].Level;
        }
        if (j <= 0)
            return -1;
        if (null == link)
            return -1;
        link.SendJson(msg);
        return 0;
    };

//--------------------------------------------------------------------------------
//      订阅
//  输入:
//      name:           名字
//      table:          表
//      link:           链路
//      num:            号码
//      level:          订阅级别,GU_STATUSSUBS_e
//  返回:
//      0:              成功
//      -1:             失败
//--------------------------------------------------------------------------------
    self.TableSubs = function(name, table, link, num, level)
    {
        CommLogger.info("IdtApi", name, num, level);

        if (null == num || '' == num)
            return -1;
        if (null == level || level < IDT.GU_STATUSSUBS_NONE || level > IDT.GU_STATUSQUERY_MAX)
            return -1;

        // 1.取消
        if (num == IDT.GU_STATUSSUBS_STR_CLEARALL)
        {
            self.ClearAllStatusSubs(table, link);
            return 0;
        }

        // 2.订阅所有用户和组
        if (num == IDT.GU_STATUSSUBS_STR_ALL)
        {
            self.ClearAllStatusSubs(table, link);
        }

        //寻找相同的
        var i;
        for (i = 0; i < table.iMaxFsm; i++)
        {
            //获取第一个空闲
            if (false == table.Fsm[i].bInit)
            {
                break;
            }

            if (num == table.Fsm[i].Num)
            {
                table.Fsm[i].Level = level;
                if (IDT.GU_STATUSSUBS_NONE == level)
                {
                    table.Remove(i);
                }
                self.SendStatusSubsOne(link, num, level, 1);//第一次订阅SN=1
                return 0;
            }
        }

        if (i >= table.iMaxFsm)
            return -1;
        if (IDT.GU_STATUSSUBS_NONE == level)//置空,处理完毕
            return 0;
        table.Fsm[i].bInit = true;
        table.Fsm[i].Num = num;
        table.Fsm[i].Level = level;
        CommLogger.info(table.ModuleName, 'Alloc=', i);
        self.SendStatusSubsOne(link, num, level, 1);//第一次订阅SN=1
        return 0;
    };
//--------------------------------------------------------------------------------
//      状态订阅
//  输入:
//      num:            用户号码或组号码,"##0"表示取消之前所有订阅,"0"表示所有用户,"###"表示自己所属的所有组
//      level:          订阅级别,GU_STATUSSUBS_DETAIL1等
//  返回:
//      0:              成功
//      -1:             失败
//--------------------------------------------------------------------------------
    self.StatusSubs = function(num, level)
    {
        return self.TableSubs("StatusSubs", self.GUSubsTable, self.McLink, num, level);
    };
//--------------------------------------------------------------------------------
//      GPS订阅
//  输入:
//      num:            用户号码,"##0"表示取消之前所有订阅
//      level:          订阅级别,GU_STATUSSUBS_DETAIL1等
//  返回:
//      0:              成功
//      -1:             失败
//--------------------------------------------------------------------------------
    self.GpsSubs = function(num, level)
    {
        if (IDT.GU_STATUSSUBS_STR_ALL == num || IDT.GU_STATUSSUBS_STR_GROUP == num)
            return -1;
        return self.TableSubs("GpsSubs", self.GpsSubsTable, self.GsLink, num, level);
    };
//--------------------------------------------------------------------------------
//      GPS上报
//  输入:
//      num:            上报的号码(通常为自己,如果为其他用户,说明调度台指定了用户的位置信息)
//      longitude:      经度,字符串格式,6位小数
//      latitude:       纬度,字符串格式,6位小数,可以是负数
//      speed:          速度,字符串格式,6位小数
//      direction:      方向,字符串格式,6位小数
//      time:           时间,字符串格式,yyyy-mm-dd hh:mm:ss,例如"2017-11-11 15:5:34"
//  返回:
//      0:              成功
//      -1:             失败
//--------------------------------------------------------------------------------
    self.GpsReport = function(num, longitude, latitude, speed, direction, time)
    {
        if (null == num)
        {
            num = self.strUserNum;
        }

        self.GsLink.SendJson({
            MsgCode : IDT.MSG_MM_GPSREPORT,
            MsgBody :
                {
                    GpsRecStr   :
                        {
                            Num     : num,
                            Status  : 1,
                            Count   : 1,
                            GpsInfo :
                                [
                                    {
                                        Longitude   : longitude,
                                        Latitude    : latitude,
                                        Speed       : speed,
                                        Direction   : direction,
                                        Time        : time
                                    }
                                ]
                        }
                }
        });
        return 0;
    };
//--------------------------------------------------------------------------------
//      GPS历史数据查询
//  输入:
//      num:            查询的号码
//      sn:             操作序号
//      startTime:      开始时间,字符串格式,yyyy-mm-dd hh:mm:ss,例如"2017-11-11 15:5:34"
//      endTime:        结束时间,字符串格式,yyyy-mm-dd hh:mm:ss,例如"2017-11-11 15:5:34"
//  返回:
//      0:              成功
//      -1:             失败
//--------------------------------------------------------------------------------
    self.GpsHisQuery = function(num, sn, startTime, endTime)
    {
        self.GsLink.SendJson({
            MsgCode : IDT.MSG_MM_GPSHISQUERYREQ,
            MsgBody :
                {
                    UsrNum      : num,
                    SN          : sn,
                    GpsQueryExt :
                        {
                            EndFlag : 0,
                            Page    : 0,
                            Count   : IDT.GPS_REC_MAX,
                            StartTime : startTime,
                            EndTime : endTime
                        }
                }
        });
        return 0;
    };

//--------------------------------------------------------------------------------
//      扫描定时器到期
//--------------------------------------------------------------------------------
    self.TmScan = function()
    {
        self.ScanTimer  = setTimeout(self.TmScan, 1000);

        var i, iGpsStart = 0, iGpsEnd = 0, iGpsStep = Math.floor(self.GpsSubsTable.iMaxFsm / 20);
        iGpsStart   = self.GpsScanPos * iGpsStep;
        if (((self.GpsScanPos + 1) * iGpsStep) >= self.GpsSubsTable.iMaxFsm)
            iGpsEnd = self.GpsSubsTable.iMaxFsm;
        else
            iGpsEnd = (self.GpsScanPos + 1) * iGpsStep;
        //CommLogger.info("IdtApi", "GpsScan", iGpsStart, "~", iGpsEnd);

        for (i = iGpsStart; i < iGpsEnd; i += IDT.GU_STATUSSUBS_MAXNUM)
        {
            if (i + IDT.GU_STATUSSUBS_MAXNUM < iGpsEnd)
            {
                if (0 != self.SendStatusSubs(self.GsLink, self.GpsSubsTable, i, i + IDT.GU_STATUSSUBS_MAXNUM, 0))
                    break;
                // CommLogger.info("IdtApi", "GpsScanSend", i, "~", i + IDT.GU_STATUSSUBS_MAXNUM);
            }
            else
            {
                if (0 != self.SendStatusSubs(self.GsLink, self.GpsSubsTable, i, iGpsEnd, 0))
                    break;
                //CommLogger.info("IdtApi", "GpsScanSend", i, "~", iGpsEnd);
            }
        }

        if ((self.GpsScanPos * iGpsStep) >= self.GpsSubsTable.iMaxFsm)
        {
            self.GpsScanPos = 0;
        }
        else
        {
            self.GpsScanPos++;
        }

        self.GUScanPos++;
        if (self.GUScanPos >= 20)
        {
            self.GUScanPos = 0;
            self.SendStatusSubs(self.McLink, self.GUSubsTable, 0, self.GUSubsTable.iMaxFsm, 0);
            //CommLogger.info("IdtApi", "GUScanSend", 0, "~", self.GUSubsTable.iMaxFsm);
        }
        return 0;
    };

//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//      OAM操作
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//--------------------------------------------------------------------------------
//      OAM预处理
//  输入:
//      fnCallBack:     成功/失败的回调函数
//  返回:
//      -1:             失败
//      else:           事务状态机号
//--------------------------------------------------------------------------------
    self.OamPreProc = function(fnCallBack)
    {
        if (null == fnCallBack)
            return -1;
        if (false == self.bInit || 3 != self.McLink.Status)
        {
            fnCallBack(false, IDT.CAUSE_LINK_DISC, null);
            return -1;
        }
        var dwSn = self.TransMgr.Alloc();
        if (dwSn < 0)
        {
            fnCallBack(false, IDT.CAUSE_TEMPORARY_FAILURE, null);
            return -1;
        }
        self.TransMgr.Fsm[dwSn].Start(fnCallBack);
        return dwSn;
    };

//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//      组织操作开始
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//--------------------------------------------------------------------------------
//      查询组织
//  输入:
//      strNum:         组织号码,如果自己是admin,号码是"all",表示查询所有组织
//      fnCallBack:     成功/失败的回调函数
//  返回:
//      0:              成功
//      -1:             失败
//--------------------------------------------------------------------------------
    self.OQuery = function(strNum, fnCallBack)
    {
        var dwSn = self.OamPreProc(fnCallBack);
        if (dwSn < 0)
            return -1;

        self.McLink.SendJson({
            MsgCode : IDT.MSG_OAM_REQ,
            MsgBody :
                {
                    OpCode      : IDT.OPT_O_QUERY,
                    InvokeNum   : self.strUserNum,
                    OpSN        : dwSn,
                    OrgListMgr  :
                        [
                            {
                                Num     : strNum,
                                Name    : "",
                                Type    : 0,
                                Desc    : "",
                                UserNum : 0,
                                DsNum   : 0,
                                GNum    : 0,
                                EUNum   : 0,
                                DS0Num  : "",
                                DS0Pwd  : "",
                                DSName  : "",
                                DsIcon  : "",
                                AppName : "",
                                AppIcon : "",
                                USegStart : "",
                                USegEnd : "",
                                GSegStart : "",
                                GSegEnd : "",
                                DSSegStart : "",
                                DSSegEnd : "",
                                StartTime: "",
                                EndTime : ""
                            }
                        ]
                }
        });
        return 0;
    };
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//      组织操作结束
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//      用户操作开始
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//--------------------------------------------------------------------------------
//      查询用户
//  输入:
//      pucNum:         用户号码
//      fnCallBack:     成功/失败的回调函数
//  返回:
//      0:              成功
//      -1:             失败
//--------------------------------------------------------------------------------
    self.UQuery = function(pucNum, fnCallBack)
    {
        var dwSn = self.OamPreProc(fnCallBack);
        if (dwSn < 0)
            return -1;

        self.McLink.SendJson({
            MsgCode : IDT.MSG_OAM_REQ,
            MsgBody :
                {
                    OpCode      : IDT.OPT_USER_QUERY,
                    InvokeNum   : self.strUserNum,
                    OpSN        : dwSn,
                    UsrNum      : pucNum
                }
        });
        return 0;
    };
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//      用户操作结束
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//      组操作开始
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//--------------------------------------------------------------------------------
//      查询组
//  输入:
//      pucGNum:        组号码
//      fnCallBack:     成功/失败的回调函数
//  返回:
//      0:              成功
//      -1:             失败
//--------------------------------------------------------------------------------
    self.GQuery = function(pucGNum, fnCallBack)
    {
        var dwSn = self.OamPreProc(fnCallBack);
        if (dwSn < 0)
            return -1;

        self.McLink.SendJson({
            MsgCode : IDT.MSG_OAM_REQ,
            MsgBody :
                {
                    OpCode      : IDT.OPT_G_QUERY,
                    InvokeNum   : self.strUserNum,
                    OpSN        : dwSn,
                    GNum        : pucGNum,
                    QueryExt    :
                        {
                            All     : 0,
                            Group   : 0,
                            User    : 0,
                            Order   : 0,
                            Page    : 0,
                            Count   : 0,
                            TotalCount : 0
                        }
                }
        });
        return 0;
    };
//--------------------------------------------------------------------------------
//      查询组内用户信息
//  输入:
//      jQuery:         查询条件
//      fnCallBack:     成功/失败的回调函数
//  返回:
//      0:              成功
//      -1:             失败
//  注意:
//      jQuery = {
//          GNum        : strGNum,      组号码."0",表示查询组织下所有用户/组
//              QueryExt:
//              {
//                All     : 1,          是否所有用户/组,同"0"
//                Group   : iGroup,     是否查询组,0不查询,1查询
//                User    : iUser,      是否查询用户,0不查询,1查询
//                Order   : 0,          排序方式,0按号码排序,1按名字排序
//                Page    : iPage,      第几页
//                Count   : 1024,       每页有多少数据,最大1024
//                TotalCount : 0        总数,返回时使用
//            }
//        };
//--------------------------------------------------------------------------------
    self.GQueryU = function(jQuery, fnCallBack)
    {
        var dwSn = self.OamPreProc(fnCallBack);
        if (dwSn < 0)
            return -1;

        jQuery.OpCode    = IDT.OPT_G_QUERYUSER;
        jQuery.InvokeNum = self.strUserNum;
        jQuery.OpSN      = dwSn;
        self.McLink.SendJson({
            MsgCode : IDT.MSG_OAM_REQ,
            MsgBody : jQuery
        });
        return 0;
    };
//--------------------------------------------------------------------------------
//      查询用户所在组信息
//  输入:
//      pucUNum:        用户号码
//      fnCallBack:     成功/失败的回调函数
//  返回:
//      0:              成功
//      -1:             失败
//--------------------------------------------------------------------------------
    self.UQueryG = function(pucUNum, fnCallBack)
    {
        var dwSn = self.OamPreProc(fnCallBack);
        if (dwSn < 0)
            return -1;

        self.McLink.SendJson({
            MsgCode : IDT.MSG_OAM_REQ,
            MsgBody :
                {
                    OpCode      : IDT.OPT_U_QUERYGROUP,
                    InvokeNum   : self.strUserNum,
                    OpSN        : dwSn,
                    UsrNum      : pucUNum
                }
        });
        return 0;
    };
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//      组操作结束
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//--------------------------------------------------------------------------------
//      发送IM消息
//  输入:
//      dwSn:           消息事务号
//      dwType:         及时消息类型    IM_TYPE_TXT(1)
//      strTo:          目的号码
//      strTxt:         文本内容
//      strFileName:    文件名
//      strSourceFileName:源文件名
//  返回:
//      0:              成功
//      -1:             失败
//--------------------------------------------------------------------------------
    self.IMSend = function(dwSn, dwType, strTo, strTxt, strFileName, strSourceFileName)
    {
        self.McLink.SendJson({
            MsgCode : IDT.MSG_MM_PASSTHROUGH,
            MsgBody :
                {
                    MyNum       : self.strUserNum,
                    PeerNum     : strTo,
                    ImInfo      :
                        {
                            Code    : IDT.PTE_CODE_TXREQ,
                            Type    : dwType,   //IM_TYPE_TXT
                            UtSn    : dwSn,

                            From    : self.strUserNum,
                            To      : "",
                            OriTo   : strTo,
                            Txt     : strTxt,
                            FileName : strFileName,
                            SourceFileName : strSourceFileName
                        }
                }
        });
        return 0;
    };

    self.CallCheckFsm = function(ID)
    {
        if (null == ID || ID < 0 || ID >= self.CC.iMaxFsm)
            return -1;
        if (false == self.CC.Fsm[ID].m_bInit)
            return -1;
        return 0;
    };

//--------------------------------------------------------------------------------
//      启动呼出
//  输入:
//      UserCtx:        用户上下文
//      idLocalV:       本端音视频控件ID,video标签
//      idPeerV:        对端音视频控件ID,video标签
//      ucARx:          是否接收语音,1接收,0不接收
//      ucATx:          是否发送语音,1发送,0不发送
//      ucVRx:          是否接收视频,1接收,0不接收
//      ucVTx:          是否发送视频,1发送,0不发送
//      strPeerNum:     对方号码
//      SrvType:        业务类型,SRV_TYPE_BASIC_CALL等
//      strPwd:         密码,创建或进入会场的密码
//      ucCallOut:      服务器是否直接呼出,0不呼出,1直接呼出
//      ucDelG:         会议结束后,是否删除组,0不删除,1删除
//      ucUserMark;     用户标识,字符串形式
//      AudioInDeviceId:语音输入设备
//      VideoInDeviceIn:语音输入设备
//  返回:
//      -1:             失败
//      else:           呼叫标识
//  注意:
//      如果是组呼(SRV_TYPE_CONF, 语音发送为1,语音接收为0, 视频未定义,或者与语音相同)
//      1.strPeerNum为组号码
//      2.pAttr中,ucAudioSend为1,其余为0
//      如果是会议:
//      1.发起会议(SRV_TYPE_CONF, 语音发送为1,语音接收为1)
//          a)被叫号码可以为空,或者用户号码/组号码
//          b)strPwd为会议密码
//          c)在CallPeerAnswer时,带回会议的内部号码,为交换机产生的呼叫标识
//      2.加入会议(SRV_TYPE_CONF_JOIN,ucAudioRecv=1,ucVideoRecv=1)
//          a)strPeerNum为1中的c
//          b)strPwd为1中的b
//--------------------------------------------------------------------------------
    self.CallMakeOut = function(UserCtx, idLocalV, idPeerV, ucARx, ucATx, ucVRx, ucVTx, strPeerNum, SrvType, strPwd, ucCallOut, ucDelG, ucUserMark)
    {
        var i;
        i = self.CC.Alloc();
        if (i < 0)
        {
            CommLogger.info("IdtApi", "CallMakeOut", -1);
            return -1;
        }
        i = self.CC.Fsm[i].CallMakeOut(UserCtx, idLocalV, idPeerV, ucARx, ucATx, ucVRx, ucVTx, self.strUserNum, strPeerNum, SrvType, strPwd, ucCallOut, ucDelG, ucUserMark);
        if (i < 0)
        {
            CommLogger.info("IdtApi", "CallMakeOut", -1);
        }
        else
        {
            CommLogger.info("IdtApi", "CallMakeOut", i);
        }
        return i;
    };
//--------------------------------------------------------------------------------
//      用户应答
//  输入:
//      ID:             IDT的呼叫ID
//      UsrCtx:         用户上下文,通常不使用
//      idLocalV:       本端音视频控件ID,video标签
//      idPeerV:        对端音视频控件ID,video标签
//      ucARx:          是否接收语音,1接收,0不接收
//      ucATx:          是否发送语音,1发送,0不发送
//      ucVRx:          是否接收视频,1接收,0不接收
//      ucATx:          是否发送视频,1发送,0不发送
//  返回:
//      0:              成功
//      -1:             失败
//--------------------------------------------------------------------------------
    self.CallAnswer = function(ID, UsrCtx, idLocalV, idPeerV, ucARx, ucATx, ucVRx, ucVTx)
    {
        if (0 != self.CallCheckFsm(ID))
            return -1;
        self.CC.Fsm[ID].UserAnswer(UsrCtx, idLocalV, idPeerV, ucARx, ucATx, ucVRx, ucVTx);
        return 0;
    };
//--------------------------------------------------------------------------------
//      呼叫释放
//  输入:
//      ID:             IDT的呼叫ID
//      UsrCtx:         用户上下文,通常不用这个
//      uiCause:        释放原因值
//  返回:
//      0:              成功
//      -1:             失败
//--------------------------------------------------------------------------------
    self.CallRel = function(ID, UsrCtx, uiCause)
    {
        if (0 != self.CallCheckFsm(ID))
            return -1;
        self.CC.Fsm[ID].Rel(IDT.CLOSE_BYUSER, uiCause);
        return 0;
    };
//--------------------------------------------------------------------------------
//      设置对端音量
//  输入:
//      ID:             IDT的呼叫ID
//      volume:         音量,0.00~1.00
//  返回:
//      0:              成功
//      -1:             失败
//--------------------------------------------------------------------------------
    self.CallSetPeerVolume = function(ID, volume)
    {
        if (0 != self.CallCheckFsm(ID))
            return -1;
        try
        {
            if (null != self.CC.Fsm[ID].idPeerV)
            {
                if (true == m_IDT_INST.bIsIe)
                {
                    self.CC.Fsm[ID].idPeerV.setPeerVolume(volume);
                }
                else
                {
                    self.CC.Fsm[ID].idPeerV.volume = volume;
                }
                self.CC.Fsm[ID].tmp_bSetVolume = true;
            }
            else if (null != self.CC.Fsm[ID].tmp_idPeerV)
            {
                if (true == m_IDT_INST.bIsIe)
                {
                    self.CC.Fsm[ID].tmp_idPeerV.setPeerVolume(volume);
                }
                else
                {
                    self.CC.Fsm[ID].tmp_idPeerV.volume = volume;
                }
                self.CC.Fsm[ID].tmp_bSetVolume = true;
            }
            else
            {
                return -1;
            }
        }
        catch (e)
        {
            CommLogger.info("IdtApi", e);
            return -1;
        }
        return 0;
    };
//--------------------------------------------------------------------------------
//      设置本端音量
//  输入:
//      ID:             IDT的呼叫ID
//      volume:         音量,0.00~1.00
//  返回:
//      0:              成功
//      -1:             失败
//--------------------------------------------------------------------------------
    self.CallSetMyVolume = function(ID, volume)
    {
        if (0 != self.CallCheckFsm(ID))
            return -1;
        if (null == self.CC.Fsm[ID].idLocalV)
            return -1;
        try
        {
            if (true == m_IDT_INST.bIsIe)
            {
                //self.CC.Fsm[ID].idLocalV.setLocalVolume(volume);
            }
            else
            {
                self.CC.Fsm[ID].idLocalV.volume = volume;
            }
        }
        catch (e)
        {
            CommLogger.info("IdtApi", e);
            return -1;
        }
        return 0;
    };

//--------------------------------------------------------------------------------
//      通话状态下发送号码
//  输入:
//      ID:             IDT的呼叫ID
//      cNum:           发送的号码,ASC字符串形式,有效值为"0"~"9","*","#","A"~"D",16(FLASH)
//      dwStreamId:     流号
//  返回:
//      0:              成功
//      -1:             失败
//--------------------------------------------------------------------------------
    self.CallSendNum = function(ID, cNum)
    {
        if (0 != self.CallCheckFsm(ID))
            return -1;
        return 0;
    };
//--------------------------------------------------------------------------------
//      话权控制
//  输入:
//      ID:             IDT的呼叫ID
//      bWant:          true:话权请求,false:话权释放
//  返回:
//      0:              成功
//      -1:             失败
//--------------------------------------------------------------------------------
    self.CallMicCtrl = function(ID, bWant)
    {
        if (0 != self.CallCheckFsm(ID))
            return -1;
        self.CC.Fsm[ID].CallMicCtrl(bWant);
    };
//--------------------------------------------------------------------------------
//      呼叫中添加/删除用户
//  输入:
//      strCallRef:     呼叫参考号
//      strNum:         用户号码
//      ucOp:           0删除,1添加
//      ucARx:          是否接收语音,1接收,0不接收
//      ucATx:          是否发送语音,1发送,0不发送
//      ucVRx:          是否接收视频,1接收,0不接收
//      ucATx:          是否发送视频,1发送,0不发送
//  返回:
//      0:              成功
//      -1:             失败
//--------------------------------------------------------------------------------
    self.CallUserCtrl = function(strCallRef, strNum, ucOp, ucARx, ucATx, ucVRx, ucVTx)
    {
        return self.McLink.SendJson({
            MsgCode : IDT.MSG_CC_USERCTRL,
            MsgBody :
                {
                    CallUserCtrl:
                        {
                            CallRef : strCallRef,
                            Num     : strNum,
                            Op      : ucOp,
                            AudioRecv : ucARx,
                            AudioSend : ucATx,
                            VideoRecv : ucVRx,
                            VideoSend : ucVTx
                        }
                }
        });
    };
//--------------------------------------------------------------------------------
//      查询会场状态
//  输入:
//      strCallRef:     会议组号码
//      dwSn:           操作序号
//  返回:
//      0:              成功
//      -1:             失败
//--------------------------------------------------------------------------------
    self.CallConfStatusReq = function(strCallRef, dwSn)
    {
        return self.McLink.SendJson({
            MsgCode : IDT.MSG_CC_CONFSTATUSREQ,
            MsgBody :
                {
                    MyNum       : strCallRef,
                    OpSN        : dwSn
                }
        });
    };
//--------------------------------------------------------------------------------
//      会议控制
//  输入:
//      ID:             IDT的呼叫ID
//      strNum:         号码
//      ucCtrl:         控制信息,SRV_INFO_MICGIVE/SRV_INFO_MICTAKE
//      ucQueue:        队列号,0台上队列,1台下队列
//  返回:
//      0:              成功
//      -1:             失败
//--------------------------------------------------------------------------------
    self.CallConfCtrlReq = function(ID, strNum, ucCtrl, ucQueue)
    {
        if (0 != self.CallCheckFsm(ID))
            return -1;

        var dwInfo = ucQueue * 0x100 + ucCtrl;
        return self.McLink.SendJson({
            MsgCode : IDT.MSG_CC_INFO,
            SrcFsm  : self.CC.Fsm[ID].uiMyId,
            DstFsm  : self.CC.Fsm[ID].uiPeerFsmId,
            MsgBody :
                {
                    UsrNum      : strNum,
                    Info :
                        {
                            Info    : dwInfo,
                            InfoStr : strNum
                        }
                }
        });
    };
//--------------------------------------------------------------------------------
//      呼叫透传信息
//  输入:
//      ID:             IDT的呼叫ID
//      dwInfo:         信息码
//      pucInfo:        信息内容
//      peerNum:        对端号码,如果不存在呼叫,用这个号码进行处理
//  返回:
//      0:              成功
//      -1:             失败
//--------------------------------------------------------------------------------
    self.CallSendInfo = function(ID, dwInfo, pucInfo, peerNum)
    {
        if (0 == self.CallCheckFsm(ID))//状态机正确
        {
            return self.McLink.SendJson({
                MsgCode : IDT.MSG_CC_INFO,
                SrcFsm  : self.CC.Fsm[ID].uiMyId,
                DstFsm  : self.CC.Fsm[ID].uiPeerFsmId,
                MsgBody :
                    {
                        Info :
                            {
                                Info    : dwInfo,
                                InfoStr : pucInfo
                            }
                    }
            });
        }
        else//没有状态机,用号码直接处理
        {
            if (null == peerNum || '' == peerNum)
                return -1;
            return self.McLink.SendJson({
                MsgCode : IDT.MSG_CC_INFO,
                MsgBody :
                    {
                        Info :
                            {
                                Info    : dwInfo,
                                InfoStr : pucInfo
                            },
                        PeerNum : peerNum
                    }
            });
        }
    };
//--------------------------------------------------------------------------------
//      强拆
//  输入:
//      pcPeerNum:      对方号码
//  返回:
//      -1:             失败
//      else:           呼叫标识
//--------------------------------------------------------------------------------
    self.ForceRel = function(pcPeerNum)
    {
        return self.McLink.SendJson({
            MsgCode : IDT.MSG_CC_INFO,
            MsgBody :
                {
                    MyNum       : self.strUserNum,
                    PeerNum     : pcPeerNum,
                    SrvType     : IDT.SRV_TYPE_FORCE_REL
                }
        });
    };
//--------------------------------------------------------------------------------
//      GPS链路状态指示
//  输入:
//      status:         状态值
//      usCause:        原因值
//  返回:
//      0:              成功
//      -1:             失败
//--------------------------------------------------------------------------------
    self.onWsLinkGpsStatus = function(status, usCause)
    {
        CommLogger.info("IdtApi", "onWsLinkGpsStatus", status, usCause);
        self.GpsScanPos = 0;
        if (IDT.UT_STATUS_ONLINE != status)
            return 0;
        var i;
        for (i = 0; i < self.GpsSubsTable.iMaxFsm; i++)
        {
            if (false == self.GpsSubsTable.Fsm[i].bInit)
                break;
            self.SendStatusSubsOne(self.GsLink, self.GpsSubsTable.Fsm[i].Num, self.GpsSubsTable.Fsm[i].Level, 1);
        }
        return 0;
    };
//--------------------------------------------------------------------------------
//      GS消息指示
//  输入:
//      msg:            消息
//  返回:
//      0:              成功
//      -1:             失败
//--------------------------------------------------------------------------------
    self.onWsLinkGsMessage = function(msg)
    {
        var i;
        if (self.CallBack.onRecvMsgHook && self.RUN_MODE_DEBUG == self.RUN_MODE)
        {
            self.CallBack.onRecvMsgHook("GsLink", msg);
        }

        switch (msg.MsgCode)
        {
            case IDT.MSG_MM_GPSRECIND://GPS位置信息指示
                if (null != self.CallBack.onGpsRecInd)
                {
                    self.CallBack.onGpsRecInd(msg.MsgBody.GpsRecStr);
                }
                break;

            case IDT.MSG_MM_GPSHISQUERYRSP://GPS查询响应
                if (self.CallBack.onGpsHisQueryInd)
                {
                    self.CallBack.onGpsHisQueryInd(msg.MsgBody.UsrNum, msg.MsgBody.SN, msg.MsgBody.GpsQueryExt.EndFlag, msg.MsgBody.GpsRecStr);
                }
                //结束了
                if (1 == msg.MsgBody.GpsQueryExt.EndFlag)
                    break;

                self.GsLink.SendJson({
                    MsgCode : IDT.MSG_MM_GPSHISQUERYREQ,
                    MsgBody :
                        {
                            UsrNum      : msg.MsgBody.UsrNum,
                            SN          : msg.MsgBody.SN,
                            GpsQueryExt : msg.MsgBody.GpsQueryExt
                        }
                });
                break;

            default:
                break;
        }
        return 0;
    };
//--------------------------------------------------------------------------------
//      MC消息指示
//  输入:
//      msg:            消息
//  返回:
//      0:              成功
//      -1:             失败
//--------------------------------------------------------------------------------
    self.onWsLinkMcMessage = function(msg)
    {
        var i, strGps;
        if (self.CallBack.onRecvMsgHook && self.RUN_MODE_DEBUG == self.RUN_MODE)
        {
            self.CallBack.onRecvMsgHook("McLink", msg);
        }
        //console.log("onWsLinkMcMessage", msg);

        switch (msg.MsgCode)
        {
            case IDT.MSG_MM_REGRSP://注册响应
                if (0 != msg.MsgBody.Result)
                    break;

                // 传递事件
                self.CallBack.onRegResponse(msg);

                self.strUserNum = msg.MsgBody.UsrNum;

                if (0 != self.GpsSubsTable.iMaxFsm)//需要订阅GPS
                {
                    if (true == self.bWss)//是WSS
                    {
                        strGps = "wss://" + msg.MsgBody.GpsServerInfoWss +"//gs_wss";
                    }
                    else//是WS
                    {
                        strGps = "ws://" + msg.MsgBody.GpsServerInfo;
                    }

                    if (null == self.strGpsSrvUrl || "" == self.strGpsSrvUrl)
                    {
                        //if (self.strGpsSrvUrl != strGps)//如果和之前的不同,更新
                        {
                            self.strGpsSrvUrl = strGps;
                            if (null != self.GsLink)
                            {
                                self.GsLink.Exit();
                                self.GsLink = null;
                            }
                            self.GsLink = new CWsLink();
                            self.GsLink.Start("GsLink", self.strGpsSrvUrl, false, null, null, self.onWsLinkGpsStatus, self.onWsLinkGsMessage, self.CallBack.onSendMsgHook, self);
                        }
                    }
                    else
                    {
                        if (null == self.GsLink)
                        {
                            self.GsLink = new CWsLink();
                            self.GsLink.Start("GsLink", self.strGpsSrvUrl, false, null, null, self.onWsLinkGpsStatus, self.onWsLinkGsMessage, self.CallBack.onSendMsgHook, self);
                        }
                    }
                }

                if (null != msg.MsgBody.FtpServerInfo)
                {
                    self.strFtpServer   = msg.MsgBody.FtpServerInfo.IPAddr;
                    self.strFtpUser     = msg.MsgBody.FtpServerInfo.Name;
                    self.strFtpPwd      = msg.MsgBody.FtpServerInfo.Pwd;

                }
                if (null != msg.MsgBody.GpsServerInfo)
                {
                    self.strGpsServer   = msg.MsgBody.GpsServerInfo;
                }
                if (null != msg.MsgBody.TaskServerInfo)
                {
                    self.strTaskInfo   = msg.MsgBody.TaskServerInfo;
                }
                //SOS号码,未处理????????
                //组织
                if (null != msg.MsgBody.OrgList)
                {
                    self.MyOrg = msg.MsgBody.OrgList[0];
                }
                //TYPE
                if (null != msg.MsgBody.UserType)
                {
                    self.UsrType = msg.MsgBody.UserType;
                }
                //ATTR
                if (null != msg.MsgBody.UserAttr)
                {
                    self.UsrAttr = msg.MsgBody.UserAttr;
                }
                //NAME
                if (null != msg.MsgBody.UsrName)
                {
                    self.strUserName = msg.MsgBody.UsrName;
                }
                //NUM
                if (null != msg.MsgBody.UsrNum)
                {
                    self.strUserNum = msg.MsgBody.UsrNum;
                }
                else
                {
                    self.strUserNum = self.strUserId;
                }
                //Token
                self.Token = self.McLink.strAuthRsp;

                //发送组指示到用户
                if (self.CallBack.onGInfoInd)
                {
                    self.CallBack.onGInfoInd(msg.MsgBody.UsrGInfo);
                }
                break;

            case IDT.MSG_MM_STATUSNOTIFY://状态提示
                if (self.CallBack.onGUStatusInd)
                {
                    self.CallBack.onGUStatusInd(msg.MsgBody.GMemberStatus);
                }

                //如果是一次性加载，返回数据给服务器
                if (0 == msg.MsgBody.SN || null == msg.MsgBody.UsrNum || null == msg.MsgBody.StatusSubs)
                    break;
                if (IDT.GU_STATUSSUBS_NONE == msg.MsgBody.StatusSubs[0].Level)
                    break;
                for (i = 0; i < self.GUSubsTable.iMaxFsm; i++)
                {
                    if (false == self.GUSubsTable.Fsm[i].m_bInit)
                        break;
                    if (msg.MsgBody.StatusSubs[0].Num == self.GUSubsTable.Fsm[i].Num)
                    {
                        self.SendStatusSubsOne(self.McLink, self.GUSubsTable.Fsm[i].Num, self.GUSubsTable.Fsm[i].Level, msg.MsgBody.SN);
                        break;
                    }
                }
                break;

            case IDT.MSG_MM_PASSTHROUGH://IM
                switch (msg.MsgBody.ImInfo.Code)
                {
                    case IDT.PTE_CODE_TXREQ:
                        self.McLink.SendJson({
                            MsgCode : IDT.MSG_MM_PASSTHROUGH,
                            MsgBody :
                                {
                                    MyNum       : msg.MsgBody.PeerNum,
                                    PeerNum     : msg.MsgBody.MyNum,
                                    ImInfo      :
                                        {
                                            Code    : IDT.PTE_CODE_TXCFM,
                                            Type    : msg.MsgBody.ImInfo.Type,
                                            UtSn    : msg.MsgBody.ImInfo.UtSn,
                                            Sn      : msg.MsgBody.ImInfo.Sn
                                        }
                                }
                        });

                        if (self.CallBack.onIMRecv)
                        {
                            self.CallBack.onIMRecv(msg.MsgBody.ImInfo.Sn, msg.MsgBody.ImInfo.Type, msg.MsgBody.ImInfo.From, msg.MsgBody.TrueName, msg.MsgBody.ImInfo.To,
                                msg.MsgBody.ImInfo.OriTo, msg.MsgBody.ImInfo.Txt, msg.MsgBody.ImInfo.FileName, msg.MsgBody.ImInfo.SourceFileName,
                                msg.MsgBody.ImInfo.Time);
                        }
                        break;
                    case IDT.PTE_CODE_TXCFM:
                        if (self.CallBack.onIMStatusInd)
                        {
                            self.CallBack.onIMStatusInd(msg.MsgBody.ImInfo.UtSn, msg.MsgBody.ImInfo.Sn, msg.MsgBody.ImInfo.Type, msg.MsgBody.ImInfo.Code);
                            break;
                        }
                        break;
                    case IDT.PTE_CODE_USRREAD:
                        self.McLink.SendJson({
                            MsgCode : IDT.MSG_MM_PASSTHROUGH,
                            MsgBody :
                                {
                                    MyNum       : msg.MsgBody.PeerNum,
                                    PeerNum     : msg.MsgBody.MyNum,
                                    ImInfo      :
                                        {
                                            Code    : IDT.PTE_CODE_USRREADCFM,
                                            Type    : msg.MsgBody.ImInfo.Type,
                                            UtSn    : msg.MsgBody.ImInfo.UtSn,
                                            Sn      : msg.MsgBody.ImInfo.Sn
                                        }
                                }
                        });
                        break;
                    default:
                        break;
                }
                break;

            case IDT.MSG_OAM_RSP:
                i = msg.MsgBody.OpSN;
                if (i < 0 || i > self.TransMgr.iMaxFsm)
                    break;
                if (true != self.TransMgr.Fsm[i].bInit)
                    break;
                if (null != self.TransMgr.Fsm[i].pfCallBack)
                {
                    switch (msg.MsgBody.OpCode)
                    {
                        case IDT.OPT_O_QUERY://组织查询
                            if (0 == msg.MsgBody.Cause)
                            {
                                self.TransMgr.Fsm[i].pfCallBack(true, msg.MsgBody.Cause, IDT.GetCauseStr(msg.MsgBody.Cause), msg.MsgBody);
                            }
                            else
                            {
                                self.TransMgr.Fsm[i].pfCallBack(false, msg.MsgBody.Cause, IDT.GetCauseStr(msg.MsgBody.Cause), msg.MsgBody);
                            }
                            break;

                        case IDT.OPT_USER_QUERY://用户查询
                        case IDT.OPT_G_QUERY://组查询
                        case IDT.OPT_G_QUERYUSER://组中查询用户
                        case IDT.OPT_U_QUERYGROUP://用户查询所在组
                            if (0 == msg.MsgBody.Cause)
                            {
                                self.TransMgr.Fsm[i].pfCallBack(true, msg.MsgBody.Cause, IDT.GetCauseStr(msg.MsgBody.Cause), msg.MsgBody);
                            }
                            else
                            {
                                self.TransMgr.Fsm[i].pfCallBack(false, msg.MsgBody.Cause, IDT.GetCauseStr(msg.MsgBody.Cause), msg.MsgBody);
                            }
                            break;

                        default:
                            if (0 == msg.MsgBody.Cause)
                            {
                                self.TransMgr.Fsm[i].pfCallBack(true, msg.MsgBody.Cause, IDT.GetCauseStr(msg.MsgBody.Cause), msg.MsgBody);
                            }
                            else
                            {
                                self.TransMgr.Fsm[i].pfCallBack(false, msg.MsgBody.Cause, IDT.GetCauseStr(msg.MsgBody.Cause), msg.MsgBody);
                            }
                            break;
                    }
                }
                self.TransMgr.Fsm[i].ClearRun();
                break;

            case IDT.MSG_OAM_NOTIFY:
                if (null != self.CallBack.onGUOamInd)
                {
                    self.CallBack.onGUOamInd(msg.MsgBody.OpCode, msg.MsgBody.GNum, msg.MsgBody.GName, msg.MsgBody.UsrNum, msg.MsgBody.UsrName);
                }
                break;

            case IDT.MSG_CC_SETUP:                  //建立
                //创建FSM,处理Setup
                i = self.CC.Alloc();
                if (i < 0)
                    break;
                self.CC.Fsm[i].ProcPeerMsg(msg);
                break;

            case IDT.MSG_CC_SETUPACK:               //建立应答
            case IDT.MSG_CC_ALERT:                  //振铃
            case IDT.MSG_CC_CONN:                   //连接
            case IDT.MSG_CC_CONNACK:                //连接应答
            case IDT.MSG_CC_INFO:                   //信息
            case IDT.MSG_CC_INFOACK:                //信息应答
            case IDT.MSG_CC_MODIFY:                 //媒体修改
            case IDT.MSG_CC_MODIFYACK:              //媒体修改应答
            case IDT.MSG_CC_REL:                    //释放
            case IDT.MSG_CC_RLC:                    //释放完成
            case IDT.MSG_CC_USERCTRL:               //用户控制,加入呼叫/踢出呼叫
            case IDT.MSG_CC_STREAMCTRL:             //流控制
            case IDT.MSG_CC_CONFSTATUSREQ:          //会场状态请求
                //找到FSM,处理消息
                i = msg.DstFsm;
                if (null == i || i < 0 || i >= self.CC.iMaxFsm)
                    break;

                self.CC.Fsm[i].ProcPeerMsg(msg);
                break;

            case IDT.MSG_CC_CONFSTATUSRSP:          //会场状态响应
                if (self.CallBack.onCallInd)
                {
                    self.CallBack.onCallInd(IDT.CALL_EVENT_ConfStatusRsp, 0, msg.MsgBody);
                }
                break;

            case IDT.MSG_HB:                        //心跳
                if (null == msg.SrcFsm || null == msg.DstFsm)
                    break;
                if (0xffffffff != msg.SrcFsm || 0xffffffff != msg.DstFsm)
                {
                    i = msg.DstFsm;
                    if (null == i || i < 0 || i >= self.CC.iMaxFsm)
                        break;
                    self.CC.Fsm[i].ProcPeerMsg(msg);
                }
                break;

            default:
                break;
        }
        return 0;
    };
//--------------------------------------------------------------------------------
//      添加组织
//  输入:
//      jOrg:           组织Json对象
//      fnCallBack:     成功/失败的回调函数
//  返回:
//      0:              成功
//      -1:             失败
//  注意:
//      jOrg = {
//          Num     : "",                   组织号码不用填写,由服务器自动生成
//          Name    : strName,              组织名字
//          Type    : iType,                类型
//          Desc    : strDesc,              组织描述
//          UserNum : iUCount,              用户总数
//          DsNum   : iDCount,              调度台总数
//          GNum    : iGCount,              组个数
//          EUNum   : iEUCount,             终端用户数
//          DS0Num  : strD0Num,             初始调度台号码
//          DS0Pwd  : strD0Pwd,             初始调度台名字
//          DSName  : strDShowName,         调度台显示名字
//          DsIcon  : strDIcon,             调度台图标
//          AppName : strAppName,           APP显示名字
//          AppIcon : strAppIcon,           APP图标
//          USegStart : strUStart,          用户号段开始
//          USegEnd : strUEnd,              用户号段结束
//          GSegStart : strGStart,          组号段开始
//          GSegEnd : strGEnd,              组号段结束
//          DSSegStart : strDSStart,        调度台号段开始
//          DSSegEnd : strDSEnd,            调度台号段结束
//          StartTime: strStartTime,        有效期开始时间
//          EndTime : strEndTime};          有效期结束时间
//--------------------------------------------------------------------------------
    self.OAdd = function(jOrg, fnCallBack)
    {
        var dwSn = self.OamPreProc(fnCallBack);
        if (dwSn < 0)
            return -1;

        self.McLink.SendJson({
            MsgCode : IDT.MSG_OAM_REQ,
            MsgBody :
                {
                    OpCode      : IDT.OPT_O_ADD,
                    InvokeNum   : self.strUserNum,
                    OpSN        : dwSn,
                    OrgListMgr  :
                        [
                            jOrg
                        ]
                }
        });
        return 0;
    };
//--------------------------------------------------------------------------------
//      删除组织
//  输入:
//      strNum:         组织号码
//      fnCallBack:     成功/失败的回调函数
//  返回:
//      0:              成功
//      -1:             失败
//--------------------------------------------------------------------------------
    self.ODel = function(strNum, fnCallBack)
    {
        var dwSn = self.OamPreProc(fnCallBack);
        if (dwSn < 0)
            return -1;

        self.McLink.SendJson({
            MsgCode : IDT.MSG_OAM_REQ,
            MsgBody :
                {
                    OpCode      : IDT.OPT_O_DEL,
                    InvokeNum   : self.strUserNum,
                    OpSN        : dwSn,
                    OrgListMgr  :
                        [
                            {
                                Num     : strNum,
                                Name    : "",
                                Type    : 0,
                                Desc    : "",
                                UserNum : 0,
                                DsNum   : 0,
                                GNum    : 0,
                                EUNum   : 0,
                                DS0Num  : "",
                                DS0Pwd  : "",
                                DSName  : "",
                                DsIcon  : "",
                                AppName : "",
                                AppIcon : "",
                                USegStart : "",
                                USegEnd : "",
                                GSegStart : "",
                                GSegEnd : "",
                                DSSegStart : "",
                                DSSegEnd : "",
                                StartTime: "",
                                EndTime : ""
                            }
                        ]
                }
        });
        return 0;
    };
//--------------------------------------------------------------------------------
//      修改组织
//  输入:
//      jOrg:           组织Json对象
//      fnCallBack:     成功/失败的回调函数
//  返回:
//      0:              成功
//      -1:             失败
//  注意:
//      jOrg = {
//          Num     : strNum,               组织号码
//          Name    : strName,              组织名字
//          Type    : iType,                类型
//          Desc    : strDesc,              组织描述
//          UserNum : iUCount,              用户总数
//          DsNum   : iDCount,              调度台总数
//          GNum    : iGCount,              组个数
//          EUNum   : iEUCount,             终端用户数
//          DS0Num  : strD0Num,             初始调度台号码
//          DS0Pwd  : strD0Pwd,             初始调度台名字
//          DSName  : strDShowName,         调度台显示名字
//          DsIcon  : strDIcon,             调度台图标
//          AppName : strAppName,           APP显示名字
//          AppIcon : strAppIcon,           APP图标
//          USegStart : strUStart,          用户号段开始
//          USegEnd : strUEnd,              用户号段结束
//          GSegStart : strGStart,          组号段开始
//          GSegEnd : strGEnd,              组号段结束
//          DSSegStart : strDSStart,        调度台号段开始
//          DSSegEnd : strDSEnd,            调度台号段结束
//          StartTime: strStartTime,        有效期开始时间
//          EndTime : strEndTime};          有效期结束时间
//--------------------------------------------------------------------------------
    self.OModify = function(jOrg, fnCallBack)
    {
        var dwSn = self.OamPreProc(fnCallBack);
        if (dwSn < 0)
            return -1;

        self.McLink.SendJson({
            MsgCode : IDT.MSG_OAM_REQ,
            MsgBody :
                {
                    OpCode      : IDT.OPT_O_MODIFY,
                    InvokeNum   : self.strUserNum,
                    OpSN        : dwSn,
                    OrgListMgr  :
                        [
                            jOrg
                        ]
                }
        });
        return 0;
    };
//--------------------------------------------------------------------------------
//      添加用户
//  输入:
//      jUser:          用户Json对象
//      iCount:         开户个数,通常为1,大于1表示批开户
//      fnCallBack:     成功/失败的回调函数
//  返回:
//      0:              成功
//      -1:             失败
//  注意:
//      jUser = {
//          UsrNum      : strNum,               号码,最大32字节
//          UsrName     : strName,              名字,最大64字节
//          Pwd         : strPwd,               密码,64字节
//          UserType    : iType,                类型                    UT_TYPE_TAP
//          UserAttr    : iAttr,                属性                    UT_ATTR_HS
//          Prio        : iPrio,                优先级                  1~7,1最高
//          ConCurrent  : iConCurrent,          并发数,暂时不使用
//          UserIPAddr  : strCfgIp,             IP地址,字符串形式,192.168.2.11:8080
//          UserAddr    : strAddr,              用户地址,128字节
//          UserContact : strContact,           联系方式,128字节
//          UserDesc    : strDesc,              描述,128字节
//          VTime       : strVTime,             有效时间
//          CamInfo     :                       摄像头信息
//          {
//              Type    : iCamType,             摄像头类型              UT_TYPE_HK
//              Num     : "",                   摄像头网关号码
//              IPAddr  : strCamIp,             摄像头地址,可能是IP地址,或者域名
//              Port    : iCamPort,             端口号
//              Name    : strCamName,           用户名
//              Pwd     : strCamPwd,            密码
//              ChanNum : iCamChanNum           摄像头通道个数
//          },
//          WorkInfo    : strWorkInfo,          WorkInfo
//          UserProxy   : strProxyReg,          用户代理信息      格式:0,无效
//                                              功能块号,代理号码,密码,服务器IP地址:端口号,是否代理注册
//                                              例如:
//                                                  SIP*8000*8000*222.42.245.76:5080*1          代理SIP注册到222.42.245.76:5080
//                                                  TAP*8000*8000*124.160.11.21:10000*1         代理TAP注册到222.42.245.76:5080
//                                                  USER*8000*8000*8001*0                       对方是用户接入到IDS,代理号码是8000,呼出时,自己号码是8001
//          DataRole    : iDataRole,            数据权限
//          MenuRole    : iMenuRole,            菜单权限
//          DeptNum     : strDeptNum,           部门号码
//          ID          : strID,                身份证
//          WorkID      : strWorkId,            工作证
//          WorkUnit    : strWorkUnit,          工作单位
//          Title       : strTitle,             职务
//          CarID       : strCarId,             车牌
//          Tel         : strTel,               电话号码
//          Other       : strOther              其他
//      };
//
//      批开户时:
//          如果号码/用户名/密码相同,后续的号码加1,后续号码/后续用户名/后续密码相同
//          如果号码/用户名/密码不同,后续的号码加1,后续的名字为:名字+1(张三1,张三2,张三100),密码与第一个密码相同
//--------------------------------------------------------------------------------
    self.UAdd = function(jUser, iCount, fnCallBack)
    {
        var dwSn = self.OamPreProc(fnCallBack);
        if (dwSn < 0)
            return -1;

        jUser.OpCode    = IDT.OPT_USER_ADD;
        jUser.InvokeNum = self.strUserNum;
        jUser.OpSN      = dwSn;
        jUser.GNumU     = iCount;

        self.McLink.SendJson({
            MsgCode : IDT.MSG_OAM_REQ,
            MsgBody : jUser
        });
        return 0;
    };
//--------------------------------------------------------------------------------
//      删除用户
//  输入:
//      pucNum:         用户号码
//      iCount:         开户个数,通常为1,大于1表示批删除
//      fnCallBack:     成功/失败的回调函数
//  返回:
//      0:              成功
//      -1:             失败
//--------------------------------------------------------------------------------
    self.UDel = function(pucNum, iCount, fnCallBack)
    {
        var dwSn = self.OamPreProc(fnCallBack);
        if (dwSn < 0)
            return -1;

        self.McLink.SendJson({
            MsgCode : IDT.MSG_OAM_REQ,
            MsgBody :
                {
                    OpCode      : IDT.OPT_USER_DEL,
                    InvokeNum   : self.strUserNum,
                    OpSN        : dwSn,
                    UsrNum      : pucNum,
                    GNumU       : iCount
                }
        });
        return 0;
    };

//--------------------------------------------------------------------------------
//      修改用户
//  输入:
//      jUser:          用户Json对象
//      fnCallBack:     成功/失败的回调函数
//  返回:
//      0:              成功
//      -1:             失败
//  注意:
//      jUser = {
//          UsrNum      : strNum,               号码,最大32字节
//          UsrName     : strName,              名字,最大64字节
//          Pwd         : strPwd,               密码,64字节
//          UserType    : iType,                类型                    UT_TYPE_TAP
//          UserAttr    : iAttr,                属性                    UT_ATTR_HS
//          Prio        : iPrio,                优先级                  1~7,1最高
//          ConCurrent  : iConCurrent,          并发数,暂时不使用
//          UserIPAddr  : strCfgIp,             IP地址,字符串形式,192.168.2.11:8080
//          UserAddr    : strAddr,              用户地址,128字节
//          UserContact : strContact,           联系方式,128字节
//          UserDesc    : strDesc,              描述,128字节
//          VTime       : strVTime,             有效时间
//          CamInfo     :                       摄像头信息
//          {
//              Type    : iCamType,             摄像头类型              UT_TYPE_HK
//              Num     : "",                   摄像头网关号码
//              IPAddr  : strCamIp,             摄像头地址,可能是IP地址,或者域名
//              Port    : iCamPort,             端口号
//              Name    : strCamName,           用户名
//              Pwd     : strCamPwd,            密码
//              ChanNum : iCamChanNum           摄像头通道个数
//          },
//          WorkInfo    : strWorkInfo,          WorkInfo
//          UserProxy   : strProxyReg,          用户代理信息      格式:0,无效
//                                              功能块号,代理号码,密码,服务器IP地址:端口号,是否代理注册
//                                              例如:
//                                                  SIP*8000*8000*222.42.245.76:5080*1          代理SIP注册到222.42.245.76:5080
//                                                  TAP*8000*8000*124.160.11.21:10000*1         代理TAP注册到222.42.245.76:5080
//                                                  USER*8000*8000*8001*0                       对方是用户接入到IDS,代理号码是8000,呼出时,自己号码是8001
//          DataRole    : iDataRole,            数据权限
//          MenuRole    : iMenuRole,            菜单权限
//          DeptNum     : strDeptNum,           部门号码
//          ID          : strID,                身份证
//          WorkID      : strWorkId,            工作证
//          WorkUnit    : strWorkUnit,          工作单位
//          Title       : strTitle,             职务
//          CarID       : strCarId,             车牌
//          Tel         : strTel,               电话号码
//          Other       : strOther              其他
//      };
//--------------------------------------------------------------------------------
    self.UModify = function(jUser, fnCallBack)
    {
        var dwSn = self.OamPreProc(fnCallBack);
        if (dwSn < 0)
            return -1;

        jUser.OpCode    = IDT.OPT_USER_MODIFY;
        jUser.InvokeNum = self.strUserNum;
        jUser.OpSN      = dwSn;

        self.McLink.SendJson({
            MsgCode : IDT.MSG_OAM_REQ,
            MsgBody : jUser
        });
        return 0;
    };
//--------------------------------------------------------------------------------
//      添加组
//  输入:
//      jGroup:         组Json对象
//      jFather:        父组信息
//      jMember:        子成员信息
//      fnCallBack:     成功/失败的回调函数
//  返回:
//      0:              成功
//      -1:             失败
//  注意:
//      jGroup = {
//          GNum        : strGNum,              组名字,如果是空,由服务器自动分配组号码
//          GName       : strGName,             组名字
//          GType       : iType,                组类型,G_TYPE_FOMAL等
//          Prio        : iPrio,                优先级
//          AGNum       : strAGNum};            附加组号码,通常是摄像头组
//      jFather = [
//          {"Num" : "20018888810", "Prio" : 7}   父组号码,在父组中的优先级
//          ];
//      jMember = [
//              {"Prio":7,"Type":1,"Num":"2001"}    号码,类型(1用户,2组),优先级
//              {"Prio":7,"Type":1,"Num":"2002"}    号码,类型(1用户,2组),优先级
//          ];
//--------------------------------------------------------------------------------
    self.GAdd = function(jGroup, jFather, jMember, fnCallBack)
    {
        var dwSn = self.OamPreProc(fnCallBack);
        if (dwSn < 0)
            return -1;
        jGroup.OpCode   = IDT.OPT_G_ADD;
        jGroup.InvokeNum= self.strUserNum;
        jGroup.OpSN     = dwSn;
        if (null != jFather)
            jGroup.UsrGInfo = jFather;
        if (null != jMember)
            jGroup.GMember = jMember;

        self.McLink.SendJson({
            MsgCode : IDT.MSG_OAM_REQ,
            MsgBody : jGroup
        });
        return 0;
    };
//--------------------------------------------------------------------------------
//      删除组
//  输入:
//      pucGNum:        组号码
//      fnCallBack:     成功/失败的回调函数
//  返回:
//      0:              成功
//      -1:             失败
//--------------------------------------------------------------------------------
    self.GDel = function(pucGNum, fnCallBack)
    {
        var dwSn = self.OamPreProc(fnCallBack);
        if (dwSn < 0)
            return -1;

        self.McLink.SendJson({
            MsgCode : IDT.MSG_OAM_REQ,
            MsgBody :
                {
                    OpCode      : IDT.OPT_G_DEL,
                    InvokeNum   : self.strUserNum,
                    OpSN        : dwSn,
                    GNum        : pucGNum
                }
        });
        return 0;
    };
//--------------------------------------------------------------------------------
//      修改组
//  输入:
//      jGroup:         组Json对象
//      fnCallBack:     成功/失败的回调函数
//  返回:
//      0:              成功
//      -1:             失败
//  注意:
//      jGroup = {
//          GNum        : strGNum,              组名字,如果是空,由服务器自动分配组号码
//          GName       : strGName,             组名字
//          GType       : iType,                组类型,G_TYPE_FOMAL等
//          Prio        : iPrio,                优先级
//          AGNum       : strAGNum};            附加组号码,通常是摄像头组
//--------------------------------------------------------------------------------
    self.GModify = function(jGroup, fnCallBack)
    {
        var dwSn = self.OamPreProc(fnCallBack);
        if (dwSn < 0)
            return -1;

        jGroup.OpCode    = IDT.OPT_G_MODIFY;
        jGroup.InvokeNum = self.strUserNum;
        jGroup.OpSN      = dwSn;
        self.McLink.SendJson({
            MsgCode : IDT.MSG_OAM_REQ,
            MsgBody : jGroup
        });
        return 0;
    };
//--------------------------------------------------------------------------------
//      组添加用户
//  输入:
//      pucGNum:        组号码
//      pucUNum:        号码,可能是用户号码,或者组号码(子组)
//      ucType:         用户号码所属类型,GROUP_MEMBERTYPE_USER(1)表示pucNum是用户号码,GROUP_MEMBERTYPE_GROUP(2)表示pucNum是组号码
//      ucPrio:         优先级(默认为7)
//      fnCallBack:     成功/失败的回调函数
//  返回:
//      0:              成功
//      -1:             失败
//--------------------------------------------------------------------------------
    self.GAddU = function(pucGNum, pucNum, ucType, ucPrio, fnCallBack)
    {
        var dwSn = self.OamPreProc(fnCallBack);
        if (dwSn < 0)
            return -1;

        self.McLink.SendJson({
            MsgCode : IDT.MSG_OAM_REQ,
            MsgBody :
                {
                    OpCode      : IDT.OPT_G_ADDUSER,
                    InvokeNum   : self.strUserNum,
                    OpSN        : dwSn,
                    GNum        : pucGNum,
                    GMember     :
                        [
                            {
                                Prio    : ucPrio,
                                Type    : ucType,
                                UTType  : 0,
                                Attr    : 0,
                                Num     : pucNum,
                                Name    : "",
                                AGNum   : "",
                                ChanNum : 0,
                                Status  : 0,
                                FGCount : 0,
                                FGNum   : ""
                            }
                        ]
                }
        });
        return 0;
    };
//--------------------------------------------------------------------------------
//      组删除用户
//  输入:
//      pucGNum:        组号码
//      pucUNum:        号码,可能是用户号码,或者组号码(子组)
//      fnCallBack:     成功/失败的回调函数
//  返回:
//      0:              成功
//      -1:             失败
//--------------------------------------------------------------------------------
    self.GDelU = function(pucGNum, pucUNum, fnCallBack)
    {
        var dwSn = self.OamPreProc(fnCallBack);
        if (dwSn < 0)
            return -1;

        self.McLink.SendJson({
            MsgCode : IDT.MSG_OAM_REQ,
            MsgBody :
                {
                    OpCode      : IDT.OPT_G_DELUSER,
                    InvokeNum   : self.strUserNum,
                    OpSN        : dwSn,
                    GNum        : pucGNum,
                    UsrNum      : pucUNum
                }
        });
        return 0;
    };
//--------------------------------------------------------------------------------
//      组中修改用户
//  输入:
//      pucNum:         组号码
//      pucUNum:        号码,可能是用户号码,或者组号码(子组)
//      ucType:         用户号码所属类型,GROUP_MEMBERTYPE_USER(1)表示pucNum是用户号码,GROUP_MEMBERTYPE_GROUP(2)表示pucNum是组号码
//      ucPrio:         优先级(默认为7)
//      fnCallBack:     成功/失败的回调函数
//  返回:
//      0:              成功
//      -1:             失败
//--------------------------------------------------------------------------------
    self.GModifyU = function(pucGNum, pucNum, ucType, ucPrio, fnCallBack)
    {
        var dwSn = self.OamPreProc(fnCallBack);
        if (dwSn < 0)
            return -1;

        self.McLink.SendJson({
            MsgCode : IDT.MSG_OAM_REQ,
            MsgBody :
                {
                    OpCode      : IDT.OPT_G_MODIFYUSER,
                    InvokeNum   : self.strUserNum,
                    OpSN        : dwSn,
                    GNum        : pucGNum,
                    GMember     :
                        [
                            {
                                Prio    : ucPrio,
                                Type    : ucType,
                                UTType  : 0,
                                Attr    : 0,
                                Num     : pucNum,
                                Name    : "",
                                AGNum   : "",
                                ChanNum : 0,
                                Status  : 0,
                                FGCount : 0,
                                FGNum   : ""
                            }
                        ]
                }
        });
        return 0;
    };
}

module.exports = CIdtApi;
