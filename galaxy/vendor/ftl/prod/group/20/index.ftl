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
<#assign typeNavIconB="4"/>
<#assign typeModuleIcon=""/>
<#assign typeLinn2="62"/>
<#assign typeLinn2out="83"/>
<#assign typeLinn2outlt="108"/>
<#assign typeLinn3="63"/>
<#assign typeLinn3out="84"/>
<#assign typeLinn3outlt="109"/>
<#assign typeLinn4="64"/>
<#assign typeLinn5="65"/>
<#assign typeLinn6="66"/>
<#assign typeLinn6out="81"/>
<#assign typeLinn8="68"/>
<#assign typeLinn8out="86"/>
<#assign typeLinn8outlt="110"/>
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
<#assign typeLinn18outlt="107"/>
<#assign typeLinn19="79"/>
<#assign typeLinn20="80"/>
<#assign typeLinn20out="87"/>
<#assign typeLinn20outlt="111"/>
<#assign typeLinn101="101"/>
<#assign typeLinn102="102"/>
<#assign typeLinn103="103"/>
<#assign typeLinn112="112"/>
<#assign typeLinn112out="115"/>
<#assign typeLinn113="113"/>
<#assign typeLinn113out="116"/>
<#assign typeLinn114="114"/>
<#assign typeLinn114out="117"/>
<#assign typeLinn118="118"/>
<#assign typeLinn119="119"/>
<#assign typeLinn121="121"/>
<#assign typeLinn127="127"/>
<#assign typeLinn132="132"/>
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
typeNavIcon,
typeNavIconF,
typeNavIconC,
typeNavIconB,
typePicContent,
typeLinn2,
typeLinn2out,
typeLinn2outlt,
typeLinn3,
typeLinn3out,
typeLinn3outlt,
typeLinn4,
typeLinn5,
typeLinn6,
typeLinn7,
typeLinn6out,
typeLinn8,
typeLinn8out,
typeLinn8outlt,
typeLinn9,
typeLinn10,
typeLinn11,
typeLinn12,
typeLinn13
typeLinn18,
typeLinn18out,
typeLinn18outlt,
typeLinn19,
typeLinn20,
typeLinn20out,
typeLinn20outlt,
typeLinn101,
typeLinn102,
typeLinn103,
typeLinn112,
typeLinn112out,
typeLinn113,
typeLinn113out,
typeLinn114,
typeLinn114out,
typeLinn118,
typeLinn119,
typeLinn121,
typeLinn127,
typeLinn132
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
"categoryId":"${gId_mknrpz}",
"gVersion":<@Guidance gId="${gId_mknrpz}" />"${gVersion}",
"moduleTitle":<@Guidance gId="${gId_mknrpz}" />"${gName}",
"moduleIcon":"",
"moduleType":"${contentName}",
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
</#if>
</#macro>
<#assign moonGId = "1100008854" />
{
/*${.now?string('yyyy-MM-dd HH:mm:ss.SSS')}*/
<#assign picMoonBg = "" /><@GuidancePic gId=moonGId picType="0"></@GuidancePic><#assign picMoonBg = "${picPath}" />
<#assign picMoonBg0 = "" /><@GuidancePic gId=moonGId picType="6"></@GuidancePic><#assign picMoonBg0 = "${picPath}" />
"bg":"${picMoonBg}",
"bg0":"${picMoonBg0}",
"gnid":<@Guidance gId=moonGId />"${gDescription}",
"subContent":[
<@GuidanceContentInfosFqpz gIdstr=moonGId></@GuidanceContentInfosFqpz>
]
}
</#compress>