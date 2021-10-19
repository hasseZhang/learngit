
<#-- 菜单 -->
<#macro menu gIdstr type order father bgtype needMask iconFlag>
    "${type?upper_case}" : {
        "name": "<@Guidance gId=gIdstr/>${gName}",
        "className": [
            "menu",
            "${type?lower_case}"
        ],
		"needMask": "${needMask}",
        "iconFlag" : "${iconFlag}",
        "father" : "${father}",
        "order" : ${order},
        "subListOrign": [
            <#assign i = 0 />
            <@GuidanceContentList gId=gIdstr>
                {
                    "contentName" : "${contentName}",
                    "contentUrl" : "${contentUrl}"
                }
                <#if i < (listSize-1)>,<#assign i = (i + 1) /></#if>
            </@GuidanceContentList>
        ],
        "categoryId": "<@Guidance gId=gIdstr/>${gDescription}",
        "logo" : "<@GuidancePic gId=gIdstr picType="0">${picPath}</@GuidancePic>"
        ,
        "vodBg" : "<@GuidancePic gId=gIdstr picType="2">${picPath}</@GuidancePic>"
        <#if bgtype != "">
        ,
        "bg" : "<@GuidancePic gId=gIdstr picType=bgtype>${picPath}</@GuidancePic>"
        </#if>
    }
</#macro>

<#macro menuGuidanceList gIdstr>
	<@GuidanceContentList gId = gIdstr>
		<#assign infoTemp = "${contentUrl}"/>
		<#assign mgid = "" />
		<#assign mtype = "" />
		<#assign morder = "" />
		<#assign mfather = "" />
		<#assign mbgtype = "" />
		<#assign mmaskflag = "" />
		<#assign miconFlag = "" />
		<#list infoTemp?split("@") as info>	
			<#if (info_index == 0)>
				<#assign mgid = "${info}" />
			</#if>
			<#if (info_index == 1)>
				<#assign mtype = "${info}" />
			</#if>
			<#if (info_index == 2)>
				<#assign morder = "${info}" />
			</#if>
			<#if (info_index == 3)>
				<#assign mfather = "${info}" />
			</#if>
			<#if (info_index == 4)>
				<#assign mbgtype = "${info}" />
			</#if>
			<#if (info_index == 5)>
				<#assign mmaskflag = "${info}" />
			</#if>
            <#if (info_index == 6)>
				<#assign miconFlag = "${info}" />
			</#if>
		</#list>
		<@menu gIdstr="${mgid}" type="${mtype}" order="${morder}" father="${mfather}" bgtype="${mbgtype}" needMask="${mmaskflag}" iconFlag="${miconFlag}"></@menu>
		,
	</@GuidanceContentList>
</#macro>

{
    <@menu gIdstr="1100002622" type="Dy" order=0 father="list" bgtype=""  needMask="1" iconFlag=""></@menu>
    ,
    <@menu gIdstr="1100002625" type="Dsj" order=1 father="list" bgtype=""  needMask="1" iconFlag=""></@menu>
    ,
    <@menu gIdstr="1100002626" type="Zy" order=2 father="list" bgtype=""  needMask="1" iconFlag=""></@menu>
    ,
    <@menu gIdstr="1100002627" type="Se" order=3 father="list" bgtype=""  needMask="1" iconFlag=""></@menu>
    ,
    <@menu gIdstr="1100002962" type="Jlp" order=4 father="list" bgtype=""  needMask="1" iconFlag=""></@menu>
    ,
    <@menu gIdstr="1100002963" type="Yy" order=5 father="list" bgtype=""  needMask="1" iconFlag=""></@menu>
    ,
    <@menu gIdstr="1100002961" type="Xw" order=6 father="list" bgtype=""  needMask="1" iconFlag=""></@menu>
    ,
    <@menu gIdstr="1100003012" type="Sk" order=7 father="list" bgtype=""  needMask="1" iconFlag=""></@menu>
    ,
    <#-- VIP -->
    <@menu gIdstr="1100003013" type="VIPDy" order=0 father="vip" bgtype=""  needMask="1" iconFlag=""></@menu>
    ,
    <@menu gIdstr="1100003014" type="VIPDsj" order=1 father="vip" bgtype=""  needMask="1" iconFlag=""></@menu>
    ,
    <@menu gIdstr="1100003015" type="VIPZy" order=2 father="vip" bgtype=""  needMask="1" iconFlag=""></@menu>
    ,
    <@menu gIdstr="1100003016" type="VIPSe" order=3 father="vip" bgtype=""  needMask="1" iconFlag=""></@menu>
    ,
    <#-- 单列专区 -->
    <@menu gIdstr="1100004612" type="Smkx" order=0 father="" bgtype="1"  needMask="1" iconFlag=""></@menu>
    ,
    <@menu gIdstr="1100004613" type="Yzdq" order=0 father="" bgtype="1"  needMask="1" iconFlag=""></@menu>
    ,
    <@menu gIdstr="1100004614" type="Zgrx" order=0 father="" bgtype="1"  needMask="1" iconFlag=""></@menu>
    ,
    <@menu gIdstr="1100005180" type="Xxty" order=0 father="" bgtype="1" needMask="1" iconFlag=""></@menu>
    ,
    <#-- 天天学霸小学 -->
    <@menu gIdstr="1100004640" type="TtxbXxYnj" order=0 father="ttxbxx" bgtype=""  needMask="1" iconFlag=""></@menu>
    ,
    <@menu gIdstr="1100004641" type="TtxbXxEnj" order=1 father="ttxbxx" bgtype=""  needMask="1" iconFlag=""></@menu>
    ,
    <@menu gIdstr="1100004642" type="TtxbXxSnj" order=2 father="ttxbxx" bgtype=""  needMask="1" iconFlag=""></@menu>
    ,
    <@menu gIdstr="1100004643" type="TtxbXxSsnj" order=3 father="ttxbxx" bgtype=""  needMask="1" iconFlag=""></@menu>
    ,
    <@menu gIdstr="1100004644" type="TtxbXxWnj" order=4 father="ttxbxx" bgtype=""  needMask="1" iconFlag=""></@menu>
    ,
    <@menu gIdstr="1100004645" type="TtxbXxLnj" order=5 father="ttxbxx" bgtype=""  needMask="1" iconFlag=""></@menu>
    ,
    <#-- 天天学霸初中 -->
    <@menu gIdstr="1100004648" type="TtxbCzCy" order=0 father="ttxbCz" bgtype=""  needMask="1" iconFlag=""></@menu>
    ,
    <@menu gIdstr="1100004649" type="TtxbCzCe" order=1 father="ttxbCz" bgtype=""  needMask="1" iconFlag=""></@menu>
    ,
    <@menu gIdstr="1100004650" type="TtxbCzCs" order=2 father="ttxbCz" bgtype=""  needMask="1" iconFlag=""></@menu>
    ,
    <#-- 天天学霸高中 -->
    <@menu gIdstr="1100004651" type="TtxbGzGy" order=0 father="ttxbGz" bgtype=""  needMask="1" iconFlag=""></@menu>
    ,
    <@menu gIdstr="1100004652" type="TtxbGzGe" order=1 father="ttxbGz" bgtype=""  needMask="1" iconFlag=""></@menu>
    ,
    <@menu gIdstr="1100004653" type="TtxbGzGs" order=2 father="ttxbGz" bgtype=""  needMask="1" iconFlag=""></@menu>
    ,
    <#-- 天天学霸冲刺班 -->
    <@menu gIdstr="1100004654" type="TtxbCcZk" order=0 father="ttxbCc" bgtype="" needMask="1" iconFlag=""></@menu>
    ,
    <@menu gIdstr="1100004655" type="TtxbCcGk" order=1 father="ttxbCc" bgtype="" needMask="1" iconFlag=""></@menu>
	,
	
	
	<#-- SP二级 -->
	<@menuGuidanceList gIdstr="1100005306"></@menuGuidanceList>

    "FAV" : {
        "name":"我的收藏",
        "className" :["menu","fav"],
		"needVipFlag" : "1",
		"needMask" : "1",
        "subList" : [
            {
                "id": "",
                "index": 0,
                "key": "dbjm",
                "name": "点播节目",
                "pageType": "2",
                "type": "FAV"
            }
            ,
            {
                "id": "",
                "index": 1,
                "key": "zbpd",
                "name": "直播频道",
                "pageType": "2",
                "type": "FAV"
            }
        ]
    },
    "PH" : {
        "name" : "观看记录",
        "className" : ["menu","ph"],
		"needVipFlag" : "1",
		"needMask" : "1",
        "subList" :[
            {
                "id" : "",
                "index" : 0,
                "key" : "qbls",
                "name" : "全部历史",
                "pageType" : "2",
                "type" : "PH"
            }
        ]
    },
    "LN": {
        "name": "直播预约",
        "className": ["menu", "ln"],
		"needVipFlag" : "1",
		"needMask" : "1",
        "subList": [
            {
                "id": "",
                "index": 0,
                "key": "qbls",
                "name": "全部历史",
                "pageType": 2,
                "type": "LN"
            }
        ]
    },
    "MO": {
        "name": "我的订购",
        "className": ["menu", "mo"],
		"needVipFlag" : "1",
		"needMask" : "1",
        "subList": [
            {
                "id": "",
                "index": 0,
                "key": "sfb",
                "name": "收费包",
                "pageType": 2,
                "type": "MO"
            }
            ,
            {
                "id": "",
                "index": 1,
                "key": "dp",
                "name": "单片",
                "pageType": 2,
                "type": "MO"
            }
        ]
    },
     "MC": {
        "name": "我的优惠券",
        "className": ["menu", "mc"],
		"needVipFlag" : "1",
		"needMask" : "1",
        "subList": [
            {
                "id": "",
                "index": 0,
                "key": "nouse",
                "name": "未使用",
                "pageType": 2,
                "type": "MC"
            },
            {
                "id": "",
                "index": 1,
                "key": "used",
                "name": "已使用",
                "pageType": 2,
                "type": "MC"
            },
            {
                "id": "",
                "index": 2,
                "key": "expire",
                "name": "已过期",
                "pageType": 2,
                "type": "MC"
            }
        ]
    },
    "EMAIL": {
        "name": "我的消息",
        "className": ["menu", "email"],
		"needVipFlag" : "1",
		"needMask" : "1",
        "subList": [
            {
                "id": "",
                "index": 0,
                "key": "qbyj",
                "name": "全部消息",
                "pageType": 2,
                "type": "EMAIL"
            }
        ]
    },
     "PhoneBind": {
        "name": "我的",
        "className": ["menu", "phoneBind"],
		"needVipFlag" : "1",
		"needMask" : "1",
        "subList": [
            {
                "id": "",
                "index": 0,
                "key": "ph",
                "name": "手机遥控",
                "pageType": 2,
                "type": "PhoneBind"
            }
        ]
    }
}