# chatsure_comm
确信SIP通信服务器SDK封装js版

##Example:
```javascript
const {CIdtApi,IDT,CommLogger} = require('chatsure_comm');

function OnRecvMsgHook(link, msg){
    if (msg.MsgCode === IDT.MSG_HB)
        return;
    CommLogger.info('\nonRecvMsgHook', JSON.stringify(msg));
}
function OnSendMsgHook(link, msg) {
    if (IDT.MSG_HB === msg.MsgCode)
        return;
    if (IDT.MSG_MM_STATUSSUBS === msg.MsgCode)
        if (0 === msg.MsgBody.SN)
            return;
    CommLogger.info('onSendMsgHook', JSON.stringify(msg));
}
function OnGInfoInd(gInfo) {
    CommLogger.info("onGInfoInd", JSON.stringify(gInfo));
}
function OnIMRecv(pucSn, dwType, pcFrom, pcFromName, pcTo, pcOriTo, pcTxt, pcFileName, pcSourceFileName, pcTime) {
    CommLogger.info("\nonIMRecv", "onIMRecv", pucSn, dwType, pcFrom, pcFromName, pcTo, pcOriTo, pcTxt, pcFileName, pcSourceFileName, pcTime);
}
function OnIMStatusInd(dwSn, pucSn, dwType, ucStatus) {
    CommLogger.info("\nonIMStatusInd", "onIMStatusInd", dwSn, pucSn, dwType, ucStatus);
}
function OnGUOamInd(dwOptCode, pucGNum, pucGName, pucUNum, pucUName, ucUAttr) {
    CommLogger.info('\nonGUOamInd')
}
function OnGUStatusInd(GMemberStatus){
    CommLogger.info("\nonGUStatusInd", "onGUStatusInd", json_format(GMemberStatus));
}
function OnGpsRecInd(GpsRecStr) {
    CommLogger.info("\nonGpsRecInd", "onGpsRecInd", json_format(GpsRecStr));
}
function OnGpsHisQueryInd(UsrNum, sn, EndFlag, GpsRecStr) {
    CommLogger.info("\nonGpsHisQueryInd", "onGpsHisQueryInd", UsrNum, sn, EndFlag, GpsRecStr);
}
function OnCallInd(event) {
    var params = arguments.length;
    CommLogger.info(event)

    switch (event)
    {
        case IDT.CALL_EVENT_Rel://event, UsrCtx, ID(IDT的呼叫ID), ucClose(IDT.CLOSE_BYUSER), usCause(IDT.CAUSE_ZERO)
            if (params < 5)
                return -1;
            CommLogger.info("\nonCallInd", "CALL_EVENT_Rel", event, arguments[1], arguments[2], arguments[3], IDT.GetCauseStr(arguments[4]));
            break;

        case IDT.CALL_EVENT_PeerAnswer://event, UsrCtx, PeerNum, PeerName, SrvType(可能与发出时不同.例如想发起组呼(主控),但变成组呼接入), UserMark, UserCallRef
            if (params < 5)
                return -1;
            CommLogger.info("\nonCallInd", "CALL_EVENT_PeerAnswer", event, arguments[1], arguments[2], arguments[3], arguments[4], arguments[5], arguments[6]);
            //m_IdtApi.CallConfCtrlReq(m_CallId, null, IDT.SRV_INFO_AUTOMICON, 1);//0是台上话权,1是台下话权.自由发言只针对台下话权
            break;

        case IDT.CALL_EVENT_In://event, ID(此时是IDT的呼叫ID,不是用户上下文), pcPeerNum, pcPeerName, SrvType, bIsGCall, ARx, ATx, VRx, VTx, UserMark, UserCallRef
            if (params < 10)
                return -1;
            //此时UsrCtx是IDT的callid,同CallMakeOut的返回值
            CommLogger.info('onCallInd CALL_EVENT_In', arguments)
            CommLogger.info("\nonCallInd", "CALL_EVENT_In", event, arguments[1], arguments[2], arguments[3], arguments[4],
                arguments[5], arguments[6], arguments[7], arguments[8], arguments[9], arguments[10], arguments[11]);
            break;

        case IDT.CALL_EVENT_MicInd://event, UsrCtx, ind(0听话,1讲话)
            if (params < 3)
                return -1;
            break;

        case IDT.CALL_EVENT_RecvInfo://event, UsrCtx, Info, InfoStr
            if (params < 4)
                return -1;
            break;

        case IDT.CALL_EVENT_TalkingIDInd://event, UsrCtx, TalkingNum, TalkingName
            if (params < 4)
                return -1;
            break;

        case IDT.CALL_EVENT_ConfCtrlInd://event, UsrCtx, Info{Info(IDT.SRV_INFO_MICREL), InfoStr}
            if (params < 3)
                return -1;
            CommLogger.info("\nonCallInd", "CALL_EVENT_ConfCtrlInd", event, arguments[1], arguments[2]);
            break;

        case IDT.CALL_EVENT_ConfStatusRsp://event, UsrCtx(无效), MsgBody
            if (params < 3)
                return -1;
            CommLogger.info("\nonCallInd", "CALL_EVENT_ConfStatusRsp", event, arguments[1], arguments[2]);
            break;

        default:
            break;
    }
    return 0;
}
function OnRegResponse(msg) {
    CommLogger.info('OnRegResponse', JSON.parse(JSON.stringify(msg)));
}

let options = {
    mc_wss:             'wss://202.103.96.111:8801/mc_wss',
    gs_wss:             'wss://202.103.96.111:8801/gs_wss',
    user_id:            '6001',
    password:           '****',
    max_trans:          32,
    max_call:           32,
    max_status_subs:    1,
    max_gps_subs:       4096,
};
let Server = new CIdtApi();

Server.Start(
    options.mc_wss,
    options.gs_wss,
    options.user_id,
    options.password,
    options.max_trans,
    options.max_call,
    options.max_status_subs,
    options.max_gps_subs,
    {
        onRecvMsgHook    : OnRecvMsgHook,            //收到消息的钩子函数,只用来调试打印,如果修改消息内容,会出问题
        onSendMsgHook    : OnSendMsgHook,            //发送消息的钩子函数,只用来调试打印,如果修改消息内容,会出问题
        onStatusInd      : (status, usCause) => {
            CommLogger.info('onStatusInd', status, usCause);
            if (status === 1) {
                CommLogger.info('启动成功')
            } else if (status === 0) {
                CommLogger.info('启动失败')
            } else {
                CommLogger.info('Start: onStatusInd error', IDT.GetCauseStr(usCause))
            }
        },
        onGInfoInd       : OnGInfoInd,               //组信息指示,指示用户在哪些组里面
        onIMRecv         : OnIMRecv,                 //短信接收指示
        onIMStatusInd    : OnIMStatusInd,            //短信状态指示
        onGUOamInd       : OnGUOamInd,               //用户/组OAM操作指示
        onGUStatusInd    : OnGUStatusInd,            //用户/组状态指示
        onGpsRecInd      : OnGpsRecInd,              //GPS数据指示
        onGpsHisQueryInd : OnGpsHisQueryInd,         //GPS历史数据查询响应
        onCallInd        : OnCallInd,                //呼叫指示
        onRegResponse    : OnRegResponse,            //注册响应事件
        ServiceInstanse  : null,                     //服务实例对象
    },
    false
);


```