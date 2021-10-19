<#-- VOD推荐位 -->
<#compress>
<#macro GuidanceContentGetPicByType gIdPic type>
	<#assign contentPicUnsafe = f_GetUnsafePoster(contentId, 3, distDomainId, gIdPic) />
	<#assign picPath = "" />
	<#assign listSizePics = contentPicUnsafe?size />
	<#list contentPicUnsafe as contentPicUnsafeItem>
		<#if contentPicUnsafeItem.picType == type ><#assign picPath = "/pic/"+contentPicUnsafeItem.picPath /></#if>
		<#if picPath == "" ><#nested></#if>
	</#list>
</#macro>
<#macro GuidanceContentInfos gIdstr picType>
{
	"title" : <@Guidance gId="${gIdstr}" />"${gName}",
	"categoryId" : "${gIdstr}",
	"data" : [
		<#assign mknrpzIndex = 0 />
		<@GuidanceContentList gId = gIdstr>
			<#assign picContent="" /><@GuidanceContentGetPicByType gIdPic="${currentGuidanceId}" type=picType></@GuidanceContentGetPicByType><#assign picContent = "${picPath}" />
			<#assign mknrpzLength = listSize />
			<#assign mknrpzType = contentType />
				<#if mknrpzType = "3">
					<#assign mknrpzType = "7" />
				<#elseif mknrpzType = "7">
					<#assign mknrpzType = "3" />
				</#if>
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
				"picContent":"${picContent}"
			}
			<#if mknrpzIndex < (mknrpzLength-1)>,<#assign mknrpzIndex = (mknrpzIndex + 1) /></#if>
		</@GuidanceContentList>
	]
}
</#macro>
{
	<#-- 现网:1100002624 测试:1100002584 海报类型:102 基础海报-竖图 -->
	"twelve" : <@GuidanceContentInfos gIdstr="1100002584" picType="102"></@GuidanceContentInfos>,
	<#-- 现网:1100002623 测试:1100002585 海报类型:101 基础海报-横图-->
	"four" : <@GuidanceContentInfos gIdstr="1100002585" picType="101"></@GuidanceContentInfos>
}
</#compress>