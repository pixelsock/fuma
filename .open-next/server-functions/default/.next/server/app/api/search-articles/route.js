(()=>{var e={};e.id=430,e.ids=[430],e.modules={3295:e=>{"use strict";e.exports=require("next/dist/server/app-render/after-task-async-storage.external.js")},10846:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},29294:e=>{"use strict";e.exports=require("next/dist/server/app-render/work-async-storage.external.js")},44870:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},63033:e=>{"use strict";e.exports=require("next/dist/server/app-render/work-unit-async-storage.external.js")},68026:(e,r,t)=>{"use strict";t.r(r),t.d(r,{patchFetch:()=>f,routeModule:()=>d,serverHooks:()=>g,workAsyncStorage:()=>p,workUnitAsyncStorage:()=>h});var s={};t.r(s),t.d(s,{GET:()=>u});var n=t(96559),a=t(48088),o=t(37719),i=t(32190),c=t(42929);async function l(e,r){let t=function(){let e="https://admin.charlotteudo.org",r="H8AAfXMOVHZc7Bicu1JVsaNdF0ZXIYoM";return console.log("[directus-server] Creating client with URL:",e),console.log("[directus-server] Token configured:",!!r),(0,c.ieq)(e).with((0,c.zs8)()).with(r?(0,c.iyv)(r):(0,c.jhO)())}();try{let s={_and:[{content:{_icontains:e}},{status:{_in:["publish","published","draft"]}}]};return r&&s._and.push({slug:{_neq:r}}),await t.request((0,c.F1f)("articles",{filter:s,fields:["id","name","slug","content","pdf","category"],limit:10}))}catch(e){throw console.error("[directus-server] Error searching articles:",e),e}}async function u(e){let r=e.nextUrl.searchParams,t=r.get("q"),s=r.get("current");if(!t)return i.NextResponse.json({error:"Search term required"},{status:400});try{console.log("[/api/search-articles] Searching for:",t,"excluding:",s);let e=await l(t,s||void 0);console.log("[/api/search-articles] Found articles:",e.length);let r=(e||[]).map(e=>{let r=e.content||"";if(!r)return null;let s=RegExp(t.replace(/[.*+?^${}()|[\]\\]/g,"\\$&"),"gi"),n=r.match(s),a=n?n.length:0,o="";if(n&&n.length>0){let e=r.toLowerCase().indexOf(t.toLowerCase()),s=Math.max(0,e-50),n=Math.min(r.length,e+t.length+50);o=r.substring(s,n),s>0&&(o="..."+o),n<r.length&&(o+="...")}return{id:e.id,name:e.name||"Untitled",slug:e.slug,count:a,snippet:o}}).filter(Boolean);return r.sort((e,r)=>r.count-e.count),i.NextResponse.json({articles:r.filter(e=>e.count>0),total:r.filter(e=>e.count>0).length})}catch(e){return console.error("[/api/search-articles] Error searching articles:",e),console.error("[/api/search-articles] Error details:",{message:e instanceof Error?e.message:"Unknown error",searchTerm:t,currentSlug:s}),i.NextResponse.json({error:"Failed to search articles",details:e instanceof Error?e.message:"Unknown error"},{status:500})}}let d=new n.AppRouteRouteModule({definition:{kind:a.RouteKind.APP_ROUTE,page:"/api/search-articles/route",pathname:"/api/search-articles",filename:"route",bundlePath:"app/api/search-articles/route"},resolvedPagePath:"/Users/nick/Sites/charlotteUDO/directus/frontend-fumadocs/fuma/app/api/search-articles/route.ts",nextConfigOutput:"standalone",userland:s}),{workAsyncStorage:p,workUnitAsyncStorage:h,serverHooks:g}=d;function f(){return(0,o.patchFetch)({workAsyncStorage:p,workUnitAsyncStorage:h})}},78335:()=>{},96487:()=>{}};var r=require("../../../webpack-runtime.js");r.C(e);var t=e=>r(r.s=e),s=r.X(0,[719,929,580],()=>t(68026));module.exports=s})();