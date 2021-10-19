<#compress>
<#macro convertContentType type>
<#assign tmpContentType = type />
<#if tmpContentType = "3">
<#assign tmpContentType = "7" />
<#elseif tmpContentType = "7">
<#assign tmpContentType = "3" />
</#if>
</#macro>
<#macro GuidanceContentPicType>
<#assign typePicContent="6"/>
<#assign typePicRocks="45"/>
<#assign typePicBg="0"/>
<#assign typeNavIcon="1"/>
<#assign typeNavIconF="2"/>
<#assign typeNavIconC="3"/>
<#assign typeModuleIcon=""/>
<#assign typeLinn2="62"/>
<#assign typeLinn2out="83"/>
<#assign typeLinn3="63"/>
<#assign typeLinn3out="84"/>
<#assign typeLinn4="64"/>
<#assign typeLinn5="65"/>
<#assign typeLinn6="66"/>
<#assign typeLinn6out="81"/>
<#assign typeLinn8="68"/>
<#assign typeLinn8out="86"/>
<#assign typeLinn7="67"/>
<#assign typeLinn9="69"/>
<#assign typeLinn10="70"/>
<#assign typeLinn11="71"/>
<#assign typeLinn12="72"/>
<#assign typeLinn13="73"/>
<#assign typeLinnBuy="74"/>
<#assign typeLinnUnbuy="75"/>
<#assign typeLinn18="78"/>
<#assign typeLinn18out="82"/>
<#assign typeLinn19="79"/>
<#assign typeLinn20="80"/>
<#assign typeLinn20out="87"/>
<#assign typeLinn103="103"/>
<#assign typeLinn127="127"/>
</#macro>
<#macro GuidanceContentGetPicByType gIdPic type>
<#assign contentPicUnsafe = f_GetUnsafePoster(contentId, 3, distDomainId, gIdPic) />
<#assign picPath = "" />
<#assign listSizePics = contentPicUnsafe?size />
<#list contentPicUnsafe as contentPicUnsafeItem>
<#if contentPicUnsafeItem.picType == type ><#assign picPath = "/pic/"+contentPicUnsafeItem.picPath /></#if>
<#if picPath == "" ><#nested></#if>
</#list>
</#macro>
<#macro GuidanceContentGetPicByTypes gIdPic types>
<#assign contentPicUnsafe = f_GetUnsafePoster(contentId, 3, distDomainId, gIdPic) />
<#assign picPath = "" />
<#assign listSizePics = contentPicUnsafe?size />
<#list contentPicUnsafe as contentPicUnsafeItem>
<#if types?seq_contains(contentPicUnsafeItem.picType)>
<#if picPath != "">
,
</#if>
<#assign picPath = "/pic/"+contentPicUnsafeItem.picPath />
"${contentPicUnsafeItem.picType}" : "${picPath}"
</#if>
<#nested>
</#list>
</#macro>
<#macro GuidanceContentInfosMknrpzPics>
<@GuidanceContentPicType></@GuidanceContentPicType>
<#assign types = [
typePicBg,
typeNavIcon,
typePicContent,
typeLinn2,
typeLinn2out,
typeLinn3,
typeLinn3out,
typeLinn4,
typeLinn5,
typeLinn6,
typeLinn7,
typeLinn6out,
typeLinn8,
typeLinn8out,
typeLinn13
typeLinn18,
typeLinn18out,
typeLinn19,
typeLinn20,
typeLinn20out,
typeLinn103,
typeLinn127
] />
<@GuidanceContentGetPicByTypes gIdPic="${currentGuidanceId}" types=types></@GuidanceContentGetPicByTypes>
</#macro>
<#macro GuidanceContentInfosMknrpz gIdstr>
<@GuidanceContentPicType></@GuidanceContentPicType>
<#assign mknrpzIndex = 0 />
<@GuidanceContentList gId = gIdstr>
<#assign mknrpzLength = listSize />
<#assign mknrpzType = contentType /><@convertContentType type=contentType></@convertContentType><#assign mknrpzType = "${tmpContentType}" />
<#assign picRocks = "" /><@GuidanceContentGetPicByType gIdPic="${currentGuidanceId}" type="${typePicRocks}"></@GuidanceContentGetPicByType><#assign picRocks = "${picPath}" />
<#assign picBuy = "" /><@GuidanceContentGetPicByType gIdPic="${currentGuidanceId}" type="${typeLinnBuy}"></@GuidanceContentGetPicByType><#assign picBuy = "${picPath}" />
<#assign picUnbuy = "" /><@GuidanceContentGetPicByType gIdPic="${currentGuidanceId}" type="${typeLinnUnbuy}"></@GuidanceContentGetPicByType><#assign picUnbuy = "${picPath}" />
{
"contentType":"${mknrpzType}",
"contentName":"${contentName}",
<#if mknrpzType = "0" || mknrpzType = "2" || mknrpzType = "3">
"contentId":"${contentId}",
"vipFlag":"${vipFlag}",
"contentCharges":"${contentCharges}",
"contentCP":"${contentCP}",
</#if>
<#if mknrpzType = "5" || mknrpzType = "6">
"channelNum":"${channelId}",
</#if>
<#if mknrpzType = "6">
"startTime":"${TvodStartTime}",
"endTime":"${TvodEndTime}",
</#if>
<#if mknrpzType = "2" || mknrpzType = "3">
"episodeStatus":"${episodeStatus}",
<#elseif mknrpzType = "4" || mknrpzType = "7">
"contentUri":"${contentUrl}",
</#if>
<#if picBuy != "">
"picBuy":"${picBuy}",
"picUnbuy":"${picUnbuy}",
</#if>
"pics" : {
<@GuidanceContentInfosMknrpzPics></@GuidanceContentInfosMknrpzPics>
}
}
<#if mknrpzIndex < (mknrpzLength-1)>,<#assign mknrpzIndex = (mknrpzIndex + 1) /></#if>
</@GuidanceContentList>
</#macro>

<#macro GuidanceContentInfosFqpz gIdstr>
<#assign fqpzIndex = 0 />
<#assign dataAll = f_GuidanceData(pageId, gIdstr, distNodeId) />
<#assign fqpzLength = dataAll.guidanceContentDataList?size />
<@GuidanceContentList gId = gIdstr>
{
<#assign gId_mknrpz = "${contentUrl}" />
"moduleTitle":<@Guidance gId="${gId_mknrpz}" />"${gName}",
"moduleIcon":"",
"moduleType":"${contentName}",
"categoryId":"${gId_mknrpz}",
"moduleContent":[
<@GuidanceContentInfosMknrpz gIdstr="${gId_mknrpz}"></@GuidanceContentInfosMknrpz>
]
}
<#if fqpzIndex < (fqpzLength-1)>,<#assign fqpzIndex = (fqpzIndex + 1) /></#if>
</@GuidanceContentList>
</#macro>

<#macro GuidanceContentInfosNav gIdstr>
<@GuidanceContentPicType></@GuidanceContentPicType>
<#assign navLength = 0 />
<#if true>
<#assign navIndex = 0 />
<#assign dataAll = f_GuidanceData(pageId, gIdstr, distNodeId) />
<#assign navLength = dataAll.guidanceContentDataList?size />
<@GuidanceContentList gId = gIdstr>
<#assign picBg = "" /><@GuidanceContentGetPicByType gIdPic="${currentGuidanceId}" type="${typePicBg}"></@GuidanceContentGetPicByType><#assign picBg = "${picPath}" />
<#assign navIcon = "" /><@GuidanceContentGetPicByType gIdPic="${currentGuidanceId}" type="${typeNavIcon}"></@GuidanceContentGetPicByType><#assign navIcon = "${picPath}" />
<#assign navIconF = "" /><@GuidanceContentGetPicByType gIdPic="${currentGuidanceId}" type="${typeNavIconF}"></@GuidanceContentGetPicByType><#assign navIconF = "${picPath}" />
<#assign navIconC = "" /><@GuidanceContentGetPicByType gIdPic="${currentGuidanceId}" type="${typeNavIconC}"></@GuidanceContentGetPicByType><#assign navIconC = "${picPath}" />
<#assign navIconWidth = ""/>
<#assign contentNameTmp = "${contentName}"/>
<#assign contentNameTmpIndex = contentNameTmp?index_of("#")/>
<#if contentNameTmpIndex != -1>
<#assign contentNameTmpLength = contentNameTmp?length/>
<#assign contentName = contentNameTmp?substring(0, contentNameTmpIndex)/>
<#assign navIconWidth = contentNameTmp?substring(contentNameTmpIndex + 1, contentNameTmpLength)/>
</#if>
"${contentName}" : {
"order":${navIndex},
"contentId":"${contentId}",
"contentName":"${contentName}",
<#if navIconWidth != "">
"navIcon":"${navIcon}",
"navIconF":"${navIconF}",
"navIconC":"${navIconC}",
"navIconWidth":"${navIconWidth}",
</#if>
"bg":"${picBg}",
"subContent":[
<@GuidanceContentInfosFqpz gIdstr="${contentUrl}"></@GuidanceContentInfosFqpz>
]
}
<#if navIndex < (navLength-1)>,<#assign navIndex = (navIndex + 1) /></#if>
</@GuidanceContentList>
</#if>
</#macro>
{
/*${.now?string('yyyy-MM-dd HH:mm:ss.SSS')}*/
<@GuidanceContentInfosNav gIdstr="1100002629"></@GuidanceContentInfosNav>
,
"msg" : {
"order" : "${navLength}",
"data" : [<@GuidanceContent gId="1100002621" order=1 >"${contentUrl}"</@GuidanceContent>]
,
"datatj" : [<@GuidanceContent gId="1100004306" order=1 >
<#assign picBg = "" /><@GuidancePic gId="${currentGuidanceId}" picType="125"></@GuidancePic><#assign picBg = "${picPath}" />
<#assign picBgF = "" /><@GuidancePic gId="${currentGuidanceId}" picType="126"></@GuidancePic><#assign picBgF = "${picPath}" />
<#assign tjContentType = contentType /><@convertContentType type=contentType></@convertContentType><#assign tjContentType = "${tmpContentType}" />
{
"contentName" : "${contentName}",
"categoryId" : "${currentGuidanceId}",
"contentId" : "${contentId}",
"contentUrl" : "${contentUrl}",
"contentType" : "${tjContentType}",
"contentDescription" : "${contentDescription}",
"pic" : "${picBg}",
"picF" : "${picBgF}"
}
</@GuidanceContent>],
"oldHome" : {
<#assign picOldBg = "" /><@GuidancePic gId="1100006182" picType="0"></@GuidancePic><#assign picOldBg = "${picPath}" />
<#assign picOldBg0 = "" /><@GuidancePic gId="1100006182" picType="6"></@GuidancePic><#assign picOldBg0 = "${picPath}" />
	"bg":"${picOldBg}",
	"bg0":"${picOldBg0}",
	"gnid":<@Guidance gId="1100006182" />"${gDescription}",
	"subContent":[
	<@GuidanceContentInfosFqpz gIdstr="1100006182"></@GuidanceContentInfosFqpz>
]
},
"childHome" : {
<#assign picChildBg = "" /><@GuidancePic gId="1100007867" picType="0"></@GuidancePic><#assign picChildBg = "${picPath}" />
<#assign picChildBg0 = "" /><@GuidancePic gId="1100007867" picType="6"></@GuidancePic><#assign picChildBg0 = "${picPath}" />
	"bg":"${picChildBg}",
	"bg0":"${picChildBg0}",
	"gnid":<@Guidance gId="1100007867" />"${gDescription}",
	"subContent":[
	<@GuidanceContentInfosFqpz gIdstr="1100007867"></@GuidanceContentInfosFqpz>
]
}
}
}
</#compress>