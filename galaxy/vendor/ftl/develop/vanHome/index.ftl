<#macro GuidanceContentInfosMknrpz gIdstr>
<#assign mknrpzIndex = 0 />
<@GuidanceContentList gId = gIdstr>
<#assign mknrpzLength = listSize />
<#if mknrpzIndex < (mknrpzLength-1)><#assign mknrpzIndex = (mknrpzIndex + 1) /></#if>
</@GuidanceContentList>
</#macro>

<#macro GuidanceContentInfosFqpz gIdstr>
<#assign fqpzIndex = 0 />
<#assign dataAll = f_GuidanceData(pageId, gIdstr, distNodeId) />
<#assign fqpzLength = dataAll.guidanceContentDataList?size />
<@GuidanceContentList gId = gIdstr>
<#assign gId_mknrpz = "${contentUrl}" />
<@GuidanceContentInfosMknrpz gIdstr="${gId_mknrpz}"></@GuidanceContentInfosMknrpz>
<#if fqpzIndex < (fqpzLength-1)><#assign fqpzIndex = (fqpzIndex + 1) /></#if>
</@GuidanceContentList>
</#macro>

<#macro GuidanceContentInfosNav gIdstr>
<#if true>
<#assign navIndex = 0 />
<#assign dataAll = f_GuidanceData(pageId, gIdstr, distNodeId) />
<#assign navLength = dataAll.guidanceContentDataList?size />
<@GuidanceContentList gId = gIdstr>
<@GuidanceContentInfosFqpz gIdstr="${contentUrl}"></@GuidanceContentInfosFqpz>
<#if navIndex < (navLength-1)><#assign navIndex = (navIndex + 1) /></#if>
</@GuidanceContentList>
</#if>
</#macro>
{${.now?string('yyyy-MM-dd HH:mm:ss.SSS')}}
<@GuidanceContentInfosNav gIdstr="1100002309"></@GuidanceContentInfosNav>
<@GuidanceContent gId="1100002581" order=1 ></@GuidanceContent>
<@GuidanceContent gId="1100004296" order=1 ></@GuidanceContent>