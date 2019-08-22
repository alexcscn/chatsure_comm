/**
 * 确信平台SDK封装
 *
 * @module      IDTConst.js
 * @auther      ALEX
 * @date        2019/03/23
 * @email       8187265@qq.com
 */

//--------------------------------------------------------------------------------
//      常量定义
//--------------------------------------------------------------------------------
const IDT = {
    //组织类型
    O_TYPE_TRIAL: 0, //试用
    O_TYPE_FOMAL: 1, //正式
    //组类型
    G_TYPE_FOMAL: 1, //正式组
    G_TYPE_TEMPORARY: 2, //临时组

    //终端类型
    UT_TYPE_NONE: 0, //无效
    // 1~0x3f:       标准终端
    UT_TYPE_SIP: 0x01, //标准SIP终端
    UT_TYPE_SIPEX: 0x02, //支持扩展SIP接口的终端
    //0x40~0x5f:    使用TAP协议的终端
    UT_TYPE_TAP: 0x40, //通用TAP终端
    UT_TYPE_DISPATCH: 0x41, //调度台
    UT_TYPE_VGW: 0x42, //视频网关
    UT_TYPE_NS: 0x43, //存储
    UT_TYPE_ORGADMIN: 0x44, //组织管理员
    UT_TYPE_GPSONLY: 0x45, //只有GPS功能的终端
    UT_TYPE_28181: 0x46, //使用28181协议的平台或终端

    //0x60~0x7f:    其他厂家终端
    //ucCamType
    UT_TYPE_AHCS: 0x60, //安徽创世摄像头
    UT_TYPE_HK: 0x61, //海康摄像头
    UT_TYPE_FSAN: 0x62, //富视安摄像头
    UT_TYPE_HKPLAT: 0x63, //海康平台
    UT_TYPE_DHPLAT: 0x64, //大华平台
    UT_TYPE_BTX: 0x65, //比特新


    //0xf0~0xff:    内部使用的终端类型
    UT_TYPE_WEBRTC: 0xf0, //标准WEBRTC接口

    //终端属性,使用场合,显示用
    UT_ATTR_NONE: 0, //无效
    UT_ATTR_PC: 1, //PC机
    UT_ATTR_FIXED: 2, //固定台
    UT_ATTR_HS: 3, //手持机
    UT_ATTR_VEHICLE: 4, //车载台
    UT_ATTR_GW: 5, //网关
    UT_ATTR_ADMIN: 0x10, //管理员
    UT_ATTR_DS: 0x11, //调度台
    UT_ATTR_MS: 0x12, //手持机
    UT_ATTR_IPPHONE: 0x13, //IP话机
    UT_ATTR_GATEWAY: 0x14, //网关
    UT_ATTR_FIXCAM: 0x15, //固定摄像头
    UT_ATTR_DISPATCH_SIMPLE: 0x16, //只看见自己组内用户的调度员
    UT_ATTR_P_VEHICLE: 0x30, //警车
    UT_ATTR_F_VEHICLE: 0x31, //消防车
    UT_ATTR_E_VEHICLE: 0x32, //工程车
    UT_ATTR_TAXI: 0x33, //出租车
    UT_ATTR_TRUCK: 0x34, //卡车
    UT_ATTR_P_MOTO: 0x35, //警用摩托车

    //0x60~0x7f:    其他厂家终端,与UT_TYPE_一致
    UT_ATTR_HKPLAT: 0x63, //海康平台
    UT_ATTR_DHPLAT: 0x64, //大华平台
    UT_ATTR_GROUP: 0x80, //是组,在OAM操作中使用

    //管理消息
    OPT_USER_ADD: 1, //用户添加
    OPT_USER_DEL: 2, //用户删除
    OPT_USER_MODIFY: 3, //用户修改
    OPT_USER_QUERY: 4, //用户查询
    OPT_G_ADD: 5, //组添加
    OPT_G_DEL: 6, //组删除
    OPT_G_MODIFY: 7, //组修改
    OPT_G_QUERY: 8, //组查询
    OPT_G_ADDUSER: 9, //组中添加用户
    OPT_G_DELUSER: 10, //组中删除用户
    OPT_G_MODIFYUSER: 11, //组中修改用户
    OPT_G_QUERYUSER: 12, //组中查询用户
    OPT_U_QUERYGROUP: 13, //用户查询所在组
    OPT_O_ADD: 14, //组织添加
    OPT_O_DEL: 15, //组织删除
    OPT_O_MODIFY: 16, //组织修改
    OPT_O_QUERY: 17, //组织查询
    OPT_GMEMBER_EXTINFO: 18, //设置组成员信息
    OPT_R_ADD: 19, //路由添加
    OPT_R_DEL: 20, //路由删除
    OPT_R_MODIFY: 21, //路由修改
    OPT_R_QUERY: 22, //路由查询

    //业务类型
    SRV_TYPE_BASIC_CALL: 16, //基本两方呼叫
    SRV_TYPE_CONF: 17, //会议,也是会议主席
    SRV_TYPE_CONF_JOIN: 18, //会议参与方
    SRV_TYPE_FORCE_INJ: 19, //强插
    SRV_TYPE_FORCE_REL: 20, //强拆
    SRV_TYPE_WATCH: 21, //监控
    SRV_TYPE_WATCH_DOWN: 21, //监控下载
    SRV_TYPE_WATCH_UP: 22, //监控上传
    SRV_TYPE_NS_CALL: 23, //给存储服务器的呼叫    避免递归存储
    SRV_TYPE_IM: 0x50, //及时消息
    SRV_TYPE_MULTICALL: 0x80, //多种业务,只用在用户查询,给调度台显示用

    //呼叫传递的INFO消息
    SRV_INFO_MICNONE: 0, //未定义
    SRV_INFO_MICREQ: 1, //话权申请
    SRV_INFO_MICREL: 2, //话权释放
    SRV_INFO_MICGIVE: 3, //给与话权
    SRV_INFO_MICTAKE: 4, //收回话权
    SRV_INFO_MICINFO: 5, //话权提示
    SRV_INFO_AUTOMICON: 10, //打开自由发言
    SRV_INFO_AUTOMICOFF: 11, //关闭自由发言
    SRV_INFO_CAMHISPLAY: 12, //播放历史视频
    SRV_INFO_TALKON: 13, //打开对讲
    SRV_INFO_TALKOFF: 14, //关闭对讲
    SRV_INFO_TALKONRSP: 15, //打开对讲响应
    SRV_INFO_TALKOFFRSP: 16, //关闭对讲响应
    SRV_INFO_NSREC: 17, //NS存储记录
    SRV_INFO_ICECAND: 18, //IceCandidate
    SRV_INFO_ICESTATE: 19, //IceStateChange
    SRV_INFO_SDP: 20, //本端SDP传送
    SRV_INFO_CAMCTRL: 21, //摄像头控制
    SRV_INFO_NUM: 22, //号码

    //摄像头上下左右聚焦等控制
    SRV_CAMCTRL_UP: 1, //上            速度
    SRV_CAMCTRL_DOWN: 2, //下            速度
    SRV_CAMCTRL_LEFT: 3, //左            速度
    SRV_CAMCTRL_RIGHT: 4, //右            速度
    SRV_CAMCTRL_ZOOMWIDE: 5, //缩小          速度
    SRV_CAMCTRL_ZOOMTELE: 6, //放大          速度
    SRV_CAMCTRL_FOCUSNEAR: 7, //近焦          速度
    SRV_CAMCTRL_FOCUSFAR: 8, //远焦          速度
    SRV_CAMCTRL_IRISOPEN: 9, //光圈放大      速度
    SRV_CAMCTRL_IRISCLOSE: 10, //光圈缩小      速度
    SRV_CAMCTRL_AUTOSCAN: 11, //自动扫描      开启/停止
    SRV_CAMCTRL_CRUISE: 12, //巡航          开启/停止
    SRV_CAMCTRL_INFRARED: 13, //红外          开启/停止
    SRV_CAMCTRL_RAINSTRIP: 14, //雨刷          开启/停止
    SRV_CAMCTRL_PRESET: 15, //预置位        预置位位置
    SRV_CAMCTRL_WARNOUTPUT: 16, //告警输出
    SRV_CAMCTRL_SETPARAM: 17, //设置参数
    SRV_CAMCTRL_REBOOT: 18, //重启设备
    SRV_CAMCTRL_STOP: 19, //停止之前云台操作

    //原因值
    CAUSE_ZERO: 0, //null
    CAUSE_UNASSIGNED_NUMBER: 1, //未分配号码
    CAUSE_NO_ROUTE_TO_DEST: 2, //无目的路由
    CAUSE_USER_BUSY: 3, //用户忙
    CAUSE_ALERT_NO_ANSWER: 4, //用户无应答(人不应答)
    CAUSE_CALL_REJECTED: 5, //呼叫被拒绝
    CAUSE_ROUTING_ERROR: 6, //路由错误
    CAUSE_FACILITY_REJECTED: 7, //设备拒绝
    CAUSE_ERROR_IPADDR: 8, //错误IP地址过来的业务请求
    CAUSE_NORMAL_UNSPECIFIED: 9, //通常,未指定
    CAUSE_TEMPORARY_FAILURE: 10, //临时错误
    CAUSE_RESOURCE_UNAVAIL: 11, //资源不可用
    CAUSE_INVALID_CALL_REF: 12, //不正确的呼叫参考号
    CAUSE_MANDATORY_IE_MISSING: 13, //必选信息单元丢失
    CAUSE_TIMER_EXPIRY: 14, //定时器超时
    CAUSE_CALL_REJ_BY_USER: 15, //被用户拒绝
    CAUSE_CALLEE_STOP: 16, //被叫停止
    CAUSE_USER_NO_EXIST: 17, //用户不存在
    CAUSE_MS_UNACCESSAVLE: 18, //不可接入
    CAUSE_MS_POWEROFF: 19, //用户关机
    CAUSE_FORCE_RELEASE: 20, //强制拆线
    CAUSE_HO_RELEASE: 21, //切换拆线
    CAUSE_CALL_CONFLICT: 22, //呼叫冲突
    CAUSE_TEMP_UNAVAIL: 23, //暂时无法接通
    CAUSE_AUTH_ERROR: 24, //鉴权错误
    CAUSE_NEED_AUTH: 25, //需要鉴权
    CAUSE_SDP_SEL: 26, //SDP选择错误
    CAUSE_MS_ERROR: 27, //媒体资源错误
    CAUSE_INNER_ERROR: 28, //内部错误
    CAUSE_PRIO_ERROR: 29, //优先级不够
    CAUSE_SRV_CONFLICT: 30, //业务冲突
    CAUSE_NOTREL_RECALL: 31, //由于业务要求,不释放,启动重呼定时器
    CAUSE_NO_CALL: 32, //呼叫不存在
    CAUSE_DUP_REG: 33, //重复注册
    CAUSE_MG_OFFLINE: 34, //MG离线
    CAUSE_DS_REQ_QUITCALL: 35, //调度员要求退出呼叫
    CAUSE_DB_ERROR: 36, //数据库操作错误
    CAUSE_TOOMANY_USER: 37, //太多的用户
    CAUSE_SAME_USERNUM: 38, //相同的用户号码
    CAUSE_SAME_USERIPADDR: 39, //相同的固定IP地址
    CAUSE_PARAM_ERROR: 40, //参数错误
    CAUSE_SAME_GNUM: 41, //相同的组号码
    CAUSE_TOOMANY_GROUP: 42, //太多的组
    CAUSE_NO_GROUP: 43, //没有这个组
    CAUSE_SAME_USERNAME: 44, //相同的用户名字
    CAUSE_OAM_OPT_ERROR: 45, //OAM操作错误
    CAUSE_INVALID_NUM_FORMAT: 46, //不正确的地址格式
    CAUSE_INVALID_DNSIP: 47, //DNS或IP地址错误
    CAUSE_SRV_NOTSUPPORT: 48, //不支持的业务
    CAUSE_MEDIA_NOTDATA: 49, //没有媒体数据
    CAUSE_RECALL: 50, //重新呼叫
    CAUSE_LINK_DISC: 51, //断链
    CAUSE_ORG_RIGHT: 52, //组织越权(节点)
    CAUSE_SAME_ORGNUM: 53, //相同的组织号码
    CAUSE_SAME_ORGNAME: 54, //相同的组织名字
    CAUSE_UNASSIGNED_ORG: 55, //未分配的组织号码
    CAUSE_INOTHER_ORG: 56, //在其他组织中
    CAUSE_HAVE_GCALL: 57, //已经有组呼存在
    CAUSE_HAVE_CONF: 58, //已经有会议存在
    CAUSE_SEG_FORMAT: 59, //错误的号段格式
    CAUSE_USEG_CONFLICT: 60, //用户号码段冲突
    CAUSE_GSEG_CONFLICT: 61, //组号码段冲突
    CAUSE_NOTIN_SEG: 62, //不在号段内
    CAUSE_USER_IN_TOOMANY_GROUP: 63, //用户所在组太多
    CAUSE_DSSEG_CONFLICT: 64, //调度台号段冲突
    CAUSE_OUTNETWORK_NUM: 65, //外网用户
    CAUSE_CFU: 66, //无条件呼叫前转
    CAUSE_CFB: 67, //遇忙呼叫前转
    CAUSE_CFNRc: 68, //不可及呼叫前转
    CAUSE_CFNRy: 69, //无应答呼叫前转
    CAUSE_MAX_FWDTIME: 70, //到达最大前转次数
    CAUSE_OAM_RIGHT: 71, //OAM操作无权限
    CAUSE_DGT_ERROR: 72, //号码错误
    CAUSE_RESOURCE_NOTENOUGH: 73, //资源不足
    CAUSE_ORG_EXPIRE: 74, //组织到期
    CAUSE_USER_EXPIRE: 75, //用户到期
    CAUSE_SAME_ROUTENAME: 76, //相同的路由名字
    CAUSE_UNASSIGNED_ROUTE: 77, //未分配的路由

    CAUSE_MAX: 0x1fff,

    CAUSE_EXPIRE_IDT: 0x0000, //IDT定时器超时
    CAUSE_EXPIRE_MC: 0x4000, //MC定时器超时
    CAUSE_EXPIRE_MG: 0x8000, //MG定时器超时

    //呼叫事件
    CALL_EVENT_Rel: 1, //呼叫释放
    CALL_EVENT_PeerAnswer: 2, //对端应答
    CALL_EVENT_In: 3, //入呼叫进入
    CALL_EVENT_MicInd: 4, //话权指示,0话权被释放,1获得话权
    CALL_EVENT_RecvInfo: 5, //呼叫透传信息指示
    CALL_EVENT_TalkingIDInd: 6, //讲话方提示
    CALL_EVENT_ConfCtrlInd: 7, //会议控制指示
    CALL_EVENT_ConfStatusRsp: 8, //查询会场状态响应

    //--------------------------------------------------------------------------------
    //      消息ID
    //--------------------------------------------------------------------------------
    MSG_TRANS: "TRANS",
    MSG_HB: "HB",
    MSG_MM_REGREQ: "MM_REGREQ",
    MSG_MM_REGRSP: "MM_REGRSP",
    MSG_MM_ACCREQ: "MM_ACCREQ",
    MSG_MM_ACCRSP: "MM_ACCRSP",
    MSG_MM_ROUTEREQ: "MM_ROUTEREQ",
    MSG_MM_ROUTERSP: "MM_ROUTERSP",
    MSG_MM_PROFREQ: "MM_PROFREQ",
    MSG_MM_PROFRSP: "MM_PROFRSP",
    MSG_MM_QUIT: "MM_QUIT",
    MSG_MM_MODREQ: "MM_MODREQ",
    MSG_MM_MODRSP: "MM_MODRSP",
    MSG_MM_PASSTHROUGH: "MM_PASSTHROUGH",
    MSG_MM_PROXYREGREQ: "MM_PROXYREGREQ",
    MSG_MM_PROXYREGRSP: "MM_PROXYREGRSP",
    MSG_CC_SETUP: "CC_SETUP",
    MSG_CC_SETUPACK: "CC_SETUPACK",
    MSG_CC_ALERT: "CC_ALERT",
    MSG_CC_CONN: "CC_CONN",
    MSG_CC_CONNACK: "CC_CONNACK",
    MSG_CC_INFO: "CC_INFO",
    MSG_CC_INFOACK: "CC_INFOACK",
    MSG_CC_MODIFY: "CC_MODIFY",
    MSG_CC_MODIFYACK: "CC_MODIFYACK",
    MSG_CC_REL: "CC_REL",
    MSG_CC_RLC: "CC_RLC",
    MSG_CC_USERCTRL: "CC_USERCTRL",
    MSG_CC_STREAMCTRL: "CC_STREAMCTRL",
    MSG_CC_CONFSTATUSREQ: "CC_CONFSTATUSREQ",
    MSG_CC_CONFSTATUSRSP: "CC_CONFSTATUSRSP",
    MSG_OAM_REQ: "OAM_REQ",
    MSG_OAM_RSP: "OAM_RSP",
    MSG_OAM_NOTIFY: "OAM_NOTIFY",
    MSG_MM_STATUSSUBS: "MM_STATUSSUBS",
    MSG_MM_STATUSNOTIFY: "MM_STATUSNOTIFY",
    MSG_MM_GPSREPORT: "MM_GPSREPORT",
    MSG_MM_GPSRECIND: "MM_GPSRECIND",
    MSG_MM_GPSHISQUERYREQ: "MM_GPSHISQUERYREQ",
    MSG_MM_GPSHISQUERYRSP: "MM_GPSHISQUERYRSP",

    //--------------------------------------------------------------------------------
    //      MC定时器
    //--------------------------------------------------------------------------------
    CCTM_HB_CSA_P: 1,
    CCTM_HB_CSA_MG: 2,
    CCTM_HB_BCSM: 3,

    //CSA消息
    CCTM_WAIT_MGBINGRSP: 4,
    CCTM_WAIT_MGIVRRSP: 5,
    CCTM_WAIT_MGCONNRSP: 6,
    CCTM_WAIT_MGDISCRSP: 7,
    CCTM_WAIT_MMACCRSP: 8,
    CCTM_WAIT_PSETUPACK: 9,
    CCTM_WAIT_PCONNACK: 10,
    CCTM_WAIT_MY_MGMODMYRSP: 11,
    CCTM_WAIT_MY_PMODRSP: 12,
    CCTM_WAIT_MY_MGMODPEERRSP: 13,
    CCTM_WAIT_P_MGMODRSP: 14,

    //BCSM消息
    //消息定时器
    CCTM_WAIT_SETUPACK: 15,
    CCTM_WAIT_CONNACK: 16,
    //收号定时器
    CCTM_RECVNUM_START: 17,
    CCTM_RECVNUM_INTER: 18,
    CCTM_RECVNUM_TOTAL: 19,
    //O端
    CCTM_O_PIC_AuthorizeOriginationAttempt: 20, //等待MM的接入响应,CSA
    CCTM_O_PIC_CollectInfomation: 21,
    CCTM_O_PIC_AnalyzeInfomation: 22,
    CCTM_O_PIC_SelectRoute: 23, //等待MM的路由响应 BCSM
    CCTM_O_PIC_AuthorizeCallSetup: 24,
    CCTM_O_PIC_SendCall: 25,
    CCTM_O_PIC_Alerting: 26,
    CCTM_O_PIC_Active: 27,
    CCTM_O_PIC_Suspended: 28,
    CCTM_O_PIC_Exception: 29,
    //T端
    CCTM_T_PIC_AuthorizeTerminationAttempt: 30,
    CCTM_T_PIC_SelectFacility: 31,
    CCTM_T_PIC_PresentCall: 32,
    CCTM_T_PIC_Alerting: 33,
    CCTM_T_PIC_Active: 34,
    CCTM_T_PIC_Suspended: 35,
    CCTM_T_PIC_Exception: 36,

    CCTM_RE_CALL: 37,
    CCTM_CS_MICGET: 38,
    CCTM_CS_MICREL: 39,

    CCTM_RECV_NUM: 40,
    CCTM_RECV_NUM_TOTAL: 41,

    //--------------------------------------------------------------------------------
    //      MG定时器
    //--------------------------------------------------------------------------------
    CPTM_SCAN: 0x01, //TCP扫描定时器
    CPTM_HB: 0x02, //状态机与主控状态机的心跳定时器

    //--------------------------------------------------------------------------------
    //      IDT定时器
    //--------------------------------------------------------------------------------
    CPTM_MM_REG: 0x10, // 注册请求
    CPTM_MM_OFFLINE: 0x11, // 离线扫描
    CPTM_MM_PERIOD: 0x12, // 周期注册
    CPTM_MM_MODIFY: 0x13, // 修改用户属性
    CPTM_MM_NAT: 0x14, // NAT

    CPTM_CC_SETUPACK: 0x20, // 发送SETUP,等待SETUP_ACK
    CPTM_CC_CONN: 0x21, // 发送SETUP,等待CONN
    CPTM_CC_ANSWER: 0x22, // 发送CallIn给用户,等用户应答
    CPTM_CC_CONNACK: 0x23, // 发送CONN给对端,等待CONNACK
    CPTM_CC_HB: 0x24, // 通话后的心跳定时器

    //释放方向
    CLOSE_BYUSER: 1, //用户发起关闭
    CLOSE_BYPEER: 2, //对端发起关闭
    CLOSE_BYINNER: 3, //内部发起关闭

    //状态订阅字符串
    GU_STATUSSUBS_STR_CLEARALL: "##0", //清除所有
    GU_STATUSSUBS_STR_GROUP: "###", //相关组和其下用户
    GU_STATUSSUBS_STR_ALL: "0", //所有用户和组
    //状态订阅级别枚举值
    GU_STATUSSUBS_NONE: 0, //不提示
    GU_STATUSSUBS_OAM: 1, //相关组和用户的操作维护
    GU_STATUSSUBS_BASIC: 2, //基本状态,在线离线
    GU_STATUSSUBS_DETAIL: 3, //详细状态,呼叫状态
    GU_STATUSSUBS_DETAIL1: 4, //最详细状态,呼叫号码
    GU_STATUSQUERY_MAX: 5,

    GROUP_MEMBERTYPE_NONE: 0,
    GROUP_MEMBERTYPE_USER: 1,
    GROUP_MEMBERTYPE_GROUP: 2,

    //用户状态
    UT_STATUS_OFFLINE: 0, //离线
    UT_STATUS_ONLINE: 1, //在线

    //呼叫状态
    GU_STATUSCALL_IDLE: 0,
    GU_STATUSCALL_OALERT: 1, //主叫听回铃,主叫起呼就置,有可能被叫还没振铃,还处于接续中
    GU_STATUSCALL_TALERT: 2, //被叫振铃
    GU_STATUSCALL_TALKING: 3, //通话
    GU_STATUSCALL_G_TALKING: 4, //组呼/会议讲话
    GU_STATUSCALL_G_LISTEN: 5, //组呼/会议听话

    GU_STATUSSUBS_MAXNUM: 16, //消息中一次最多带多少个订阅请求

    GPS_REC_MAX: 24, //最大一次GPS历史数据查询有多少条记录

    //会场信息状态,CALL_EVENT_ConfStatusRsp时使用
    CONF_MEMBERSTATUS_IDLE: 0, //空闲
    CONF_MEMBERSTATUS_LISTEN: 1, //听话
    CONF_MEMBERSTATUS_TALK1: 2, //台下讲话
    CONF_MEMBERSTATUS_TALK0: 3, //台上讲话

    //即时通信消息码,也是即时通信状态指示码
    PTE_CODE_TXREQ: 1, //发送请求
    PTE_CODE_TXCFM: 2, //传输确认
    PTE_CODE_USRREAD: 3, //用户阅读
    PTE_CODE_USRREADCFM: 4, //用户阅读消息的确认
    PTE_CODE_FILENAMEREQ: 5, //文件名请求
    PTE_CODE_FILENAMERSP: 6, //文件名响应

    //及时消息类型
    IM_TYPE_NONE: 0x00, //无
    //01~7f需要存储转发,用户确认收到的,通过IDT_IMSend/IDT_IMRecv传递
    IM_TYPE_TXT: 0x01, //只有文本                  不需要文件          from + to + orito + text
    IM_TYPE_GPS: 0x02, //GPS位置信息               不需要文件          from + to + orito + text(字符串:经度,纬度)
    IM_TYPE_IMAGE: 0x03, //图像                      需要文件            from + to + orito + text + filename + sourcefilename
    IM_TYPE_AUDIO: 0x04, //语音文件,微信             需要文件            from + to + orito + text + filename + sourcefilename
    IM_TYPE_VIDEO: 0x05, //视频录像文件              需要文件            from + to + orito + text + filename + sourcefilename
    IM_TYPE_FILE: 0x06, //任意文件                  需要文件            from + to + orito + text + filename + sourcefilename
    IM_TYPE_BCALL: 0x07, //单呼语音呼叫              APP本地存储使用,不传递
    IM_TYPE_VCALL: 0x08, //单呼视频呼叫              APP本地存储使用,不传递
    IM_TYPE_GCALL: 0x09, //组呼                      APP本地存储使用,不传递
    IM_TYPE_CONF: 0x11, //会议格式消息              不需要文件          from + to + orito + text
    //IDT_IMSend/IDT_IMRecv的pcTxt字段,是会议格式消息内容.采用Json格式,内容为:
    //  {
    //  public int type;       //0 会议预约信息通知 1 成员会议回复结果消息 2 会议开始通知
    //  public String number;   //会议组号码信息
    //  public String meetId;   //会场号码
    //会议预约信息通知 填写
    //  public String title; // 会议标题
    //  public String desc;  // 会议描述
    //  public String time;  // 会议时间
    //成员会议回复结果消息 填写
    //  public boolean accept;  // 是否接受
    //  public String reason;    // 拒绝原因
    //  }
    //  会议主持人群发消息时,from=主持人号码,to=组号码
    //  会议成员发是否接受会议时,from=会议成员号码,to=组号码
    IM_TYPE_GCALLAUDIO: 0x12, //组呼语音消息              需要文件            from + to + orito + text + filename + sourcefilename
    IM_TYPE_CONFREC: 0x13, //会议录音                  需要文件            from + to + orito + text + filename + sourcefilename

    //0x80~0xff不需要存储转发,用户如果不在线,就直接丢弃,通过IDT_SendPassThrouth/IDT_RecvPassTrouth传递
    IM_TYPE_NSSUBS: 0x80, //存储订阅                  不需要文件          起始号码~结束号码;起始号码~结束号码;起始号码~结束号码;
    IM_TYPE_NSQUERYREQ: 0x81, //存储查询                  不需要文件          NS_QUERY_s
    IM_TYPE_NSQUERYRSP: 0x82, //存储查询响应              不需要文件          NS_QUERYRSP_s
    IM_TYPE_VSQUERYCHAN_REQ: 0x83, //视频网关查询通道请求      不需要文件          4001*97*192.168.2.38*8000*admin*admin123
    IM_TYPE_VSQUERYCHAN_RSP: 0x84, //视频网关查询通道响应      不需要文件          号码#通道号-名称;通道号-名称;通道号-名称;通道号-名称;通道号-名称;通道号-名称
    IM_TYPE_CAM_PLAYBACK: 0x85, //摄像头回放                不需要文件          开始时间~结束时间
    IM_TYPE_ECHO_REQ: 0x86, //EchoReq                   不需要文件          事物号*秒*纳秒*填充  TimeMs的值  (%d*%d*%d)
    IM_TYPE_ECHO_RSP: 0x87, //EchoRsp                   不需要文件          事物号*秒*纳秒*填充  TimeMs的值  (%d*%d*%d)
    IM_TYPE_WRITE_PAR_REQ: 0x88, //写参数请求                不需要文件          事物号*section*key*value    (%d*%s*%s*%s)
    IM_TYPE_WRITE_PAR_RSP: 0x89, //写参数响应                不需要文件          事物号*section*key*value    (%d*%s*%s*%s)
    IM_TYPE_READ_PAR_REQ: 0x8A, //读参数请求                不需要文件          事物号*section*key          (%d*%s*%s)
    IM_TYPE_READ_PAR_RSP: 0x8B, //读参数响应                不需要文件          事物号*section*key*value    (%d*%s*%s*%s)
    IM_TYPE_DISP_CMD_REQ: 0x8C, //调度命令请求              不需要文件          事物号*命令号*目标号码      (%d*%d*%s)
    //  0x01    版本查看
    //  0x02    视频上传
    //  0x03    视频下载
    //  0x04    通话
    //  0x05    发送位置信息
    IM_TYPE_DISP_CMD_RSP: 0x8D, //调度命令响应              不需要文件          事物号*命令号*目标号码      (%d*%d*%s)
    IM_TYPE_USER: 0xff //用户自定义                不需要文件
};

//--------------------------------------------------------------------------------
//      获取MC定时器字符串
//  输入:
//      wTm:            定时器值
//  返回:
//      MC定时器字符串
//--------------------------------------------------------------------------------
IDT.GetMcTmStr = function (wTm) {
    var strCause;

    switch (wTm) {
        case IDT.CCTM_HB_CSA_P:
            return "CCTM_HB_CSA_P";
        case IDT.CCTM_HB_CSA_MG:
            return "CCTM_HB_CSA_MG";
        case IDT.CCTM_HB_BCSM:
            return "CCTM_HB_BCSM";

        //CSA消息
        case IDT.CCTM_WAIT_MGBINGRSP:
            return "CCTM_WAIT_MGBINGRSP";
        case IDT.CCTM_WAIT_MGIVRRSP:
            return "CCTM_WAIT_MGIVRRSP";
        case IDT.CCTM_WAIT_MGCONNRSP:
            return "CCTM_WAIT_MGCONNRSP";
        case IDT.CCTM_WAIT_MGDISCRSP:
            return "CCTM_WAIT_MGDISCRSP";
        case IDT.CCTM_WAIT_MMACCRSP:
            return "CCTM_WAIT_MMACCRSP";
        case IDT.CCTM_WAIT_PSETUPACK:
            return "CCTM_WAIT_PSETUPACK";
        case IDT.CCTM_WAIT_PCONNACK:
            return "CCTM_WAIT_PCONNACK";
        case IDT.CCTM_WAIT_MY_MGMODMYRSP:
            return "CCTM_WAIT_MY_MGMODMYRSP";
        case IDT.CCTM_WAIT_MY_PMODRSP:
            return "CCTM_WAIT_MY_PMODRSP";
        case IDT.CCTM_WAIT_MY_MGMODPEERRSP:
            return "CCTM_WAIT_MY_MGMODPEERRSP";
        case IDT.CCTM_WAIT_P_MGMODRSP:
            return "CCTM_WAIT_P_MGMODRSP";

        //BCSM消息
        //消息定时器
        case IDT.CCTM_WAIT_SETUPACK:
            return "CCTM_WAIT_SETUPACK";
        case IDT.CCTM_WAIT_CONNACK:
            return "CCTM_WAIT_CONNACK";
        //收号定时器
        case IDT.CCTM_RECVNUM_START:
            return "CCTM_RECVNUM_START";
        case IDT.CCTM_RECVNUM_INTER:
            return "CCTM_RECVNUM_INTER";
        case IDT.CCTM_RECVNUM_TOTAL:
            return "CCTM_RECVNUM_TOTAL";
        //O端
        case IDT.CCTM_O_PIC_AuthorizeOriginationAttempt:
            return "CCTM_O_PIC_AuthorizeOriginationAttempt";
        case IDT.CCTM_O_PIC_CollectInfomation:
            return "CCTM_O_PIC_CollectInfomation";
        case IDT.CCTM_O_PIC_AnalyzeInfomation:
            return "CCTM_O_PIC_AnalyzeInfomation";
        case IDT.CCTM_O_PIC_SelectRoute:
            return "CCTM_O_PIC_SelectRoute";
        case IDT.CCTM_O_PIC_AuthorizeCallSetup:
            return "CCTM_O_PIC_AuthorizeCallSetup";
        case IDT.CCTM_O_PIC_SendCall:
            return "CCTM_O_PIC_SendCall";
        case IDT.CCTM_O_PIC_Alerting:
            return "CCTM_O_PIC_Alerting";
        case IDT.CCTM_O_PIC_Active:
            return "CCTM_O_PIC_Active";
        case IDT.CCTM_O_PIC_Suspended:
            return "CCTM_O_PIC_Suspended";
        case IDT.CCTM_O_PIC_Exception:
            return "CCTM_O_PIC_Exception";
        //T端
        case IDT.CCTM_T_PIC_AuthorizeTerminationAttempt:
            return "CCTM_T_PIC_AuthorizeTerminationAttempt";
        case IDT.CCTM_T_PIC_SelectFacility:
            return "CCTM_T_PIC_SelectFacility";
        case IDT.CCTM_T_PIC_PresentCall:
            return "CCTM_T_PIC_PresentCall";
        case IDT.CCTM_T_PIC_Alerting:
            return "CCTM_T_PIC_Alerting";
        case IDT.CCTM_T_PIC_Active:
            return "CCTM_T_PIC_Active";
        case IDT.CCTM_T_PIC_Suspended:
            return "CCTM_T_PIC_Suspended";
        case IDT.CCTM_T_PIC_Exception:
            return "CCTM_T_PIC_Exception";

        case IDT.CCTM_RE_CALL:
            return "CCTM_RE_CALL";
        case IDT.CCTM_CS_MICGET:
            return "CCTM_CS_MICGET";
        case IDT.CCTM_CS_MICREL:
            return "CCTM_CS_MICREL";

        case IDT.CCTM_RECV_NUM:
            return "CCTM_RECV_NUM";
        case IDT.CCTM_RECV_NUM_TOTAL:
            return "CCTM_RECV_NUM_TOTAL";

        default:
            strCause = "Tm=" + wTm;
            return strCause;
    }
};
//--------------------------------------------------------------------------------
//      获取MG定时器字符串
//  输入:
//      wTm:            定时器值
//  返回:
//      MG定时器字符串
//--------------------------------------------------------------------------------
IDT.GetMgTmStr = function (wTm) {
    var strCause;

    switch (wTm) {
        case IDT.CPTM_SCAN:
            return "CPTM_SCAN";
        case IDT.CPTM_HB:
            return "CPTM_HB";
        default:
            strCause = "Tm=" + wTm;
            return strCause;
    }
};
//--------------------------------------------------------------------------------
//      获取IDT定时器字符串
//  输入:
//      wTm:            定时器值
//  返回:
//      IDT定时器字符串
//--------------------------------------------------------------------------------
IDT.GetIdtTmStr = function (wTm) {
    var strCause;

    switch (wTm) {
        case IDT.CPTM_MM_REG:
            return "CPTM_MM_REG";
        case IDT.CPTM_MM_OFFLINE:
            return "CPTM_MM_OFFLINE";
        case IDT.CPTM_MM_PERIOD:
            return "CPTM_MM_PERIOD";
        case IDT.CPTM_MM_MODIFY:
            return "CPTM_MM_MODIFY";
        case IDT.CPTM_MM_NAT:
            return "CPTM_MM_NAT";
        case IDT.CPTM_CC_SETUPACK:
            return "CPTM_CC_SETUPACK";
        case IDT.CPTM_CC_CONN:
            return "CPTM_CC_CONN";
        case IDT.CPTM_CC_ANSWER:
            return "CPTM_CC_ANSWER";
        case IDT.CPTM_CC_CONNACK:
            return "CPTM_CC_CONNACK";
        case IDT.CPTM_CC_HB:
            return "CPTM_CC_HB";
        default:
            strCause = "Tm=" + wTm;
            return strCause;
    }
};
//--------------------------------------------------------------------------------
//      获取原因值字符串
//  输入:
//      usCause:        原因值
//  返回:
//      原因值字符串
//--------------------------------------------------------------------------------
IDT.GetCauseStr = function (usCause) {
    var strCause;
    if (IDT.CAUSE_TIMER_EXPIRY == (usCause & 0xff)) {
        var ucSrc = usCause & 0xc000;
        var ucH = (usCause & 0x3f00) >> 8;
        switch (ucSrc) {
            case IDT.CAUSE_EXPIRE_IDT:
                //IDT定时器超时
                strCause = "定时器超时:IDT-" + IDT.GetIdtTmStr(ucH);
                break;
            case IDT.CAUSE_EXPIRE_MC:
                //MC定时器超时
                strCause = "定时器超时:MC-" + IDT.GetMcTmStr(ucH);
                break;
            case IDT.CAUSE_EXPIRE_MG:
                //MG定时器超时
                strCause = "定时器超时:MG-" + IDT.GetMgTmStr(ucH);
                break;
            default:
                strCause = "定时器超时:" + ucSrc + ucH;
                break;
        }
        return strCause;
    }

    switch (usCause) {
        case IDT.CAUSE_ZERO:
            return "错误0";
        case IDT.CAUSE_UNASSIGNED_NUMBER:
            return "未分配号码";
        case IDT.CAUSE_NO_ROUTE_TO_DEST:
            return "无目的路由";
        case IDT.CAUSE_USER_BUSY:
            return "用户忙";
        case IDT.CAUSE_ALERT_NO_ANSWER:
            return "用户无应答(人不应答)";
        case IDT.CAUSE_CALL_REJECTED:
            return "呼叫被拒绝";
        case IDT.CAUSE_ROUTING_ERROR:
            return "路由错误";
        case IDT.CAUSE_FACILITY_REJECTED:
            return "设备拒绝";
        case IDT.CAUSE_NORMAL_UNSPECIFIED:
            return "通常,未指定";
        case IDT.CAUSE_TEMPORARY_FAILURE:
            return "临时错误";
        case IDT.CAUSE_RESOURCE_UNAVAIL:
            return "资源不可用";
        case IDT.CAUSE_INVALID_CALL_REF:
            return "不正确的呼叫参考号";
        case IDT.CAUSE_MANDATORY_IE_MISSING:
            return "必选信息单元丢失";
        case IDT.CAUSE_TIMER_EXPIRY:
            return "定时器超时";
        case IDT.CAUSE_CALL_REJ_BY_USER:
            return "被用户拒绝";
        case IDT.CAUSE_CALLEE_STOP:
            return "被叫停止";
        case IDT.CAUSE_USER_NO_EXIST:
            return "用户不存在";
        case IDT.CAUSE_MS_UNACCESSAVLE:
            return "不可接入";
        case IDT.CAUSE_MS_POWEROFF:
            return "用户关机";
        case IDT.CAUSE_FORCE_RELEASE:
            return "强制拆线";
        case IDT.CAUSE_HO_RELEASE:
            return "切换拆线";
        case IDT.CAUSE_CALL_CONFLICT:
            return "呼叫冲突";
        case IDT.CAUSE_TEMP_UNAVAIL:
            return "暂时无法接通";
        case IDT.CAUSE_AUTH_ERROR:
            return "鉴权错误";
        case IDT.CAUSE_NEED_AUTH:
            return "需要鉴权";
        case IDT.CAUSE_SDP_SEL:
            return "SDP选择错误";
        case IDT.CAUSE_MS_ERROR:
            return "媒体资源错误";
        case IDT.CAUSE_INNER_ERROR:
            return "内部错误";
        case IDT.CAUSE_PRIO_ERROR:
            return "优先级不够";
        case IDT.CAUSE_SRV_CONFLICT:
            return "业务冲突";
        case IDT.CAUSE_NOTREL_RECALL:
            return "由于业务要求,不释放,启动重呼定时器";
        case IDT.CAUSE_NO_CALL:
            return "呼叫不存在";
        case IDT.CAUSE_ERROR_IPADDR:
            return "错误IP地址过来的业务请求";
        case IDT.CAUSE_DUP_REG:
            return "重复注册";
        case IDT.CAUSE_MG_OFFLINE:
            return "MG离线";
        case IDT.CAUSE_DS_REQ_QUITCALL:
            return "调度员要求退出呼叫";
        case IDT.CAUSE_DB_ERROR:
            return "数据库操作错误";
        case IDT.CAUSE_TOOMANY_USER:
            return "用户数太多";
        case IDT.CAUSE_SAME_USERNUM:
            return "相同的用户号码";
        case IDT.CAUSE_SAME_USERIPADDR:
            return "相同的固定IP地址";
        case IDT.CAUSE_PARAM_ERROR:
            return "参数错误";
        case IDT.CAUSE_SAME_GNUM:
            return "相同的组号码";
        case IDT.CAUSE_TOOMANY_GROUP:
            return "太多的组";
        case IDT.CAUSE_NO_GROUP:
            return "没有这个组";
        case IDT.CAUSE_SAME_USERNAME:
            return "相同的用户名字";
        case IDT.CAUSE_OAM_OPT_ERROR:
            return "OAM操作错误";
        case IDT.CAUSE_INVALID_NUM_FORMAT:
            return "不正确的地址格式";
        case IDT.CAUSE_INVALID_DNSIP:
            return "DNS或IP地址错误";
        case IDT.CAUSE_SRV_NOTSUPPORT:
            return "不支持的业务";
        case IDT.CAUSE_MEDIA_NOTDATA:
            return "没有媒体数据";
        case IDT.CAUSE_RECALL:
            return "重新呼叫";
        case IDT.CAUSE_LINK_DISC:
            return "断链";
        case IDT.CAUSE_ORG_RIGHT:
            return "组织越权";
        case IDT.CAUSE_SAME_ORGNUM:
            return "相同的组织号码";
        case IDT.CAUSE_SAME_ORGNAME:
            return "相同的组织名字";
        case IDT.CAUSE_UNASSIGNED_ORG:
            return "未分配的组织号码";
        case IDT.CAUSE_INOTHER_ORG:
            return "在其他组织中";
        case IDT.CAUSE_HAVE_GCALL:
            return "已经有组呼存在";
        case IDT.CAUSE_HAVE_CONF:
            return "已经有会议存在";
        case IDT.CAUSE_SEG_FORMAT:
            return "错误的号段格式";
        case IDT.CAUSE_USEG_CONFLICT:
            return "用户号码段冲突";
        case IDT.CAUSE_GSEG_CONFLICT:
            return "组号码段冲突";
        case IDT.CAUSE_NOTIN_SEG:
            return "不在号段内";
        case IDT.CAUSE_USER_IN_TOOMANY_GROUP:
            return "用户所在组太多";
        case IDT.CAUSE_DSSEG_CONFLICT:
            return "调度台号段冲突";
        case IDT.CAUSE_OUTNETWORK_NUM:
            return "外网用户";
        case IDT.CAUSE_CFU:
            return "无条件呼叫前转";
        case IDT.CAUSE_CFB:
            return "遇忙呼叫前转";
        case IDT.CAUSE_CFNRc:
            return "不可及呼叫前转";
        case IDT.CAUSE_CFNRy:
            return "无应答呼叫前转";
        case IDT.CAUSE_MAX_FWDTIME:
            return "到达最大前转次数";
        case IDT.CAUSE_OAM_RIGHT:
            return "OAM操作无权限";
        case IDT.CAUSE_DGT_ERROR:
            return "号码错误";
        case IDT.CAUSE_RESOURCE_NOTENOUGH:
            return "资源不足";
        case IDT.CAUSE_ORG_EXPIRE:
            return "组织到期";
        case IDT.CAUSE_USER_EXPIRE:
            return "用户到期";
        case IDT.CAUSE_SAME_ROUTENAME:
            return "相同的路由名字";
        case IDT.CAUSE_UNASSIGNED_ROUTE:
            return "未分配的路由";

        default:
            strCause = "CAUSE=" + usCause;
            return strCause;
    }
};
//--------------------------------------------------------------------------------
//      获取关闭字符串
//  输入:
//      ucClose:        释放方向
//  返回:
//      0:              成功
//      -1:             失败
//--------------------------------------------------------------------------------
IDT.GetCloseStr = function (ucClose) {
    switch (ucClose) {
        case IDT.CLOSE_BYUSER:
            return "用户发起关闭";
        case IDT.CLOSE_BYPEER:
            return "对端发起关闭";
        case IDT.CLOSE_BYINNER:
            return "内部发起关闭";
        default:
            return "未知释放方向";
    }
};

module.exports = IDT;