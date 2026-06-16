function bt(e){const i=e.tagName.toLowerCase();if(["input","select","textarea","button"].includes(i))return!0;const s=e.getAttribute("role");return!!(s&&["button","checkbox","radio","combobox","textbox","link"].includes(s))}function Pt(e){if(e.hasAttribute("hidden")||e.getAttribute("aria-hidden")==="true")return!1;const i=window.getComputedStyle(e);if(i.display==="none"||i.visibility==="hidden"||parseFloat(i.opacity||"1")===0&&!bt(e))return!1;const s=e.getBoundingClientRect();return!(s.width===0&&s.height===0&&!bt(e))}function I(e){const i=ht(e);if(i)return i;if(e.hasAttribute("id")){const a=e.getAttribute("id");if(a&&/^[a-zA-Z0-9_-]+$/.test(a))return`#${a}`}const s=[];let l=e;for(;l&&l.nodeType===Node.ELEMENT_NODE;){const a=ht(l);let g=a||l.tagName.toLowerCase();const S=l.getAttribute("id");if(!a&&S&&/^[a-zA-Z0-9_-]+$/.test(S)){g=`#${S}`,s.unshift(g);break}const L=l.getAttribute("class");if(!a&&L){const A=L.trim().split(/\s+/).filter(x=>/^[a-zA-Z0-9_-]+$/.test(x))[0];A&&(g+=`.${A}`)}const E=l.parentElement;if(E&&!a){const A=Array.from(E.children),x=A.indexOf(l)+1;A.filter(T=>T.tagName===l.tagName).length>1&&(g+=`:nth-child(${x})`)}if(s.unshift(g),a)break;l=l.parentElement}return s.join(" > ")}function ht(e){const i=e.tagName.toLowerCase(),s=["data-testid","data-test","data-cy","data-qa","data-track-id","aria-label"];for(const a of s){const g=e.getAttribute(a);if(g&&g.length<=80)return`${i}[${a}="${it(g)}"]`}const l=e.getAttribute("role");if(l){const a=e.getAttribute("aria-label");return a&&a.length<=80?`${i}[role="${it(l)}"][aria-label="${it(a)}"]`:`${i}[role="${it(l)}"]`}}function it(e){return e.replace(/\\/g,"\\\\").replace(/"/g,'\\"')}function Nt(e){var pt,ft,gt,mt;const i=performance.now(),s=[],l=[],a=[],g=[],S=[],L=[],E=[],A=[],x=[];let M=0,T=0,$=0,h=0;const B=12e3;let P=!1;const W=new Map;function V(n){try{n.querySelectorAll("label").forEach(t=>{const c=t.getAttribute("for"),C=(t.textContent||"").trim().replace(/\s+/g," ");c&&C&&W.set(c,C)})}catch{}}V(document);const J=((pt=e.siteProfile)==null?void 0:pt.ignoreSelectors)||[],Q=((ft=e.siteProfile)==null?void 0:ft.preserveSelectors)||[];function F(n,u){return u.some(t=>{try{return n.matches(t)}catch{return x.push({type:"other",message:"Invalid site profile selector ignored.",details:t}),!1}})}function o(n){return n.trim().replace(/\s+/g," ")}function m(n){let u="";for(let t=0;t<n.childNodes.length;t++){const c=n.childNodes[t];c.nodeType===Node.TEXT_NODE&&(u+=c.textContent)}return o(u)}function k(n,u){return["p","li","blockquote","td","span"].includes(u)||j(n)?o(n.textContent||""):m(n)}function j(n){const u=o(n.textContent||"");return u.length<4||u.length>700||n.querySelectorAll("article, section, div, table, form, ul, ol, nav, aside, header, footer").length>3?!1:n.querySelectorAll("a, span, strong, em, b, i, small, sup, sub").length>0}function G(n){const u=n.getAttribute("aria-label"),t=n.getAttribute("title"),c=n.getAttribute("aria-labelledby"),C=c==null?void 0:c.split(/\s+/).map(R=>{var O;return((O=document.getElementById(R))==null?void 0:O.textContent)||""}).filter(Boolean).join(" "),y=o(n.textContent||""),b=n.value,N=n.getAttribute("name")||n.getAttribute("data-testid")||n.getAttribute("data-test")||n.getAttribute("data-cy");return o(C||u||t||y||b||N||"")}function st(n,u){const t=n.getAttribute("role"),c=`${u} ${t||""} ${n.getAttribute("class")||""} ${n.getAttribute("data-testid")||""}`.toLowerCase();return c.includes("dialog")||t==="dialog"?"dialog":c.includes("nav")||t==="navigation"||u==="nav"?"nav":c.includes("card")||c.includes("plan")||c.includes("tier")||c.includes("price")?"card":u==="ul"||u==="ol"||t==="list"?"list":u==="section"||u==="article"||t==="region"?"section":"generic"}function at(n,u){if(!["article","section","div","li","ul","ol","nav","aside"].includes(u))return!1;const t=o(n.textContent||"");if(t.length<20||t.length>1200)return!1;const c=`${u} ${n.getAttribute("role")||""} ${n.getAttribute("class")||""} ${n.getAttribute("data-testid")||""}`.toLowerCase(),C=n.querySelectorAll('button, a[href], img, video, svg, [role="button"], [aria-label]').length>0,y=/\b(plan|tier|price|premium|fan|mega|benefit|feature|subscription|monthly|yearly|\$\s?\d|\d+[.,]\d{2})\b/i.test(t+" "+c),b=n.querySelectorAll("article, section, div, li, table, form").length;return(C||y)&&b<=12}function tt(n,u){return n.filter(t=>t.selectorHint===u||t.selectorHint.startsWith(`${u} > `)).map(t=>t.id).slice(0,20)}function St(){return S.map(n=>({...n,childActionIds:tt(g,n.selectorHint),childMediaIds:tt(A,n.selectorHint)}))}function kt(n){const t=window.getComputedStyle(n).backgroundImage.match(/url\(["']?(.*?)["']?\)/);return t==null?void 0:t[1]}function dt(){return h++,h}function D(n){!n.text||S.some(u=>u.id===n.id)||S.push({...n,sourceOrder:n.sourceOrder||dt(),childActionIds:[],childMediaIds:[]})}function ut(){return/(^|\.)wikipedia\.org$/i.test(window.location.hostname)&&!!document.querySelector("#mw-content-text, .mw-parser-output")}function $t(){var O,Y;if(!ut())return;const n=document.querySelector(".mw-parser-output");if(!n)return;x.push({type:"other",message:"Wikipedia semantic route applied: lead, TOC, infobox, sections, references, media, and nav are preserved as separate layout groups."});const u=o(((O=document.querySelector("#firstHeading"))==null?void 0:O.textContent)||document.title),t=[];for(const r of Array.from(n.children)){if(r.matches("h2, .mw-heading2, #toc, .vector-toc, table.infobox"))break;if(r.matches("p")){const d=o(r.textContent||"");d.length>40&&t.push(d)}}t.length>0&&D({id:"wikipedia-lead",label:`${u} lead`,role:"lead",text:t.join(`

`),selectorHint:".mw-parser-output > p"});const c=document.querySelector('#toc, .vector-toc, [aria-label="Contents"]');if(c){const r=Array.from(c.querySelectorAll("a")).map(d=>o(d.textContent||"")).filter(Boolean).slice(0,80);D({id:"wikipedia-toc",label:"Table of contents",role:"toc",text:r.join(`
`),selectorHint:I(c)})}const C=n.querySelector("table.infobox");if(C){const r=o(C.textContent||"");D({id:"wikipedia-infobox",label:o(((Y=C.querySelector("caption, th"))==null?void 0:Y.textContent)||`${u} infobox`),role:"infobox",text:r,selectorHint:I(C)})}Array.from(n.querySelectorAll("h2, .mw-heading2")).forEach((r,d)=>{const p=o(r.textContent||"").replace(/\[edit\]$/i,"").trim();if(!p)return;const f=[];let v=r.nextElementSibling;for(;v&&!v.matches("h2, .mw-heading2");){if(v.matches("p, ul, ol, table, figure, .thumb, .reflist, ol.references")){const w=o(v.textContent||"");w.length>20&&f.push(w)}v=v.nextElementSibling}f.length>0&&D({id:`wikipedia-section-${d+1}`,label:p,role:/references|notes|bibliography|external links/i.test(p)?"references":"article_section",text:f.join(`

`).slice(0,6e3),selectorHint:I(r)})});const b=n.querySelector('.reflist, ol.references, section[aria-labelledby="References"]');if(b){const r=Array.from(b.querySelectorAll("li, cite")).map(d=>o(d.textContent||"")).filter(d=>d.length>10).slice(0,80);D({id:"wikipedia-references",label:"References",role:"references",text:r.join(`
`),selectorHint:I(b)})}const N=document.querySelector("#p-navigation, .vector-page-toolbar, nav[aria-label]");if(N){const r=Array.from(N.querySelectorAll("a, button")).map(d=>o(d.textContent||d.getAttribute("aria-label")||"")).filter(Boolean).slice(0,60).join(`
`);D({id:"wikipedia-nav",label:"Page navigation",role:"nav",text:r,selectorHint:I(N)})}const R=new Set(A.map(r=>`${r.src||""}:${r.alt||""}`));n.querySelectorAll("figure, .thumb, .mw-file-description").forEach((r,d)=>{var Z;const p=r.querySelector("img"),f=(p==null?void 0:p.currentSrc)||(p==null?void 0:p.getAttribute("src"))||(p==null?void 0:p.getAttribute("srcset"))||void 0,v=(p==null?void 0:p.getAttribute("alt"))||void 0,w=o(((Z=r.querySelector("figcaption, .thumbcaption"))==null?void 0:Z.textContent)||(p==null?void 0:p.getAttribute("title"))||""),z=`${f||""}:${v||w}`;if(!f||R.has(z))return;R.add(z);const _=dt(),q=I(r),nt=`wikipedia-media-${d+1}`;A.push({id:nt,type:"image",alt:v,caption:w||void 0,src:f,selectorHint:q,sourceOrder:_}),D({id:`${nt}-group`,label:w||v||"Wikipedia media",role:"media",text:w||v||f,selectorHint:q,sourceOrder:_})})}function Lt(){if(s.length!==0)return s[s.length-1].id}function U(n,u){var R,O,Y;if(P)return;if(M++,M>B){P||(P=!0,x.push({type:"node_limit",message:`Page size limit exceeded (processed over ${B} nodes). Extraction has been capped.`,details:`Processed nodes: ${M}`}));return}if(n.nodeType!==Node.ELEMENT_NODE){n.childNodes.forEach(r=>U(r,u));return}const t=n,c=t.tagName.toLowerCase(),C=F(t,Q);if(["script","style","noscript","template","head","meta","link","title"].includes(c)){$++;return}if(!C&&F(t,J)){$++;return}if(!C&&!Pt(t)){$++;return}T++,h++;const y=t.getAttribute("id")||`visor-el-${h}`,b=I(t);if(at(t,c)){const r=o(t.textContent||""),d=t.getAttribute("aria-label")||t.getAttribute("title")||"",p=o(((R=t.querySelector("h1, h2, h3, h4, h5, h6"))==null?void 0:R.textContent)||""),f=r.split(new RegExp("(?<=[.!?])\\s+"))[0]||r;S.push({id:`${y}-group`,label:o(d||p||f.slice(0,80)),role:st(t,c),text:r,selectorHint:b,sourceOrder:h,childActionIds:tt(g,b),childMediaIds:tt(A,b)})}const N=c.match(/^h([1-6])$/);if(N){const r=parseInt(N[1]),d=o(t.textContent||"");if(d){const p={id:y,text:d,level:r,selectorHint:b,sourceOrder:h};s.push(p),u=y}}else if(c==="pre"||c==="code"){if(!(c==="code"&&((O=t.parentElement)==null?void 0:O.tagName.toLowerCase())==="pre")){const r=t.textContent||"";r.trim()&&l.push({id:y,text:r,selectorHint:b,sourceOrder:h,parentHeadingId:u});return}}else if(c==="table"){const r=[],d=[];let p;const f=t.querySelector("caption");f&&(p=o(f.textContent||"")),t.querySelectorAll("th").forEach(v=>{const w=o(v.textContent||"");w&&r.push(w)}),t.querySelectorAll("tr").forEach(v=>{const w=[];v.querySelectorAll("th, td").forEach(z=>{const _=o(z.textContent||"");_&&w.push(_)}),w.length>0&&d.push(w)}),E.push({id:y,caption:p,headers:r,rows:d,selectorHint:b,sourceOrder:h});return}else if(["img","video","audio","canvas","svg"].includes(c)){const r=c==="img"||c==="svg"?"image":c,d=t,p=t.getAttribute("alt")||t.getAttribute("aria-label")||void 0,f=d.currentSrc||t.getAttribute("src")||t.getAttribute("data-src")||t.getAttribute("srcset")||t.getAttribute("data-srcset")||void 0,v=t.getAttribute("title")||void 0;A.push({id:y,type:r,alt:p,caption:v,src:f,selectorHint:b,sourceOrder:h}),c==="canvas"&&x.push({type:"canvas_only",message:"Page contains a Canvas element. Graphic contents inside Canvas are unreadable as HTML DOM."})}else if(c==="form"){const r=[],d=[];t.querySelectorAll("input, select, textarea, button").forEach((f,v)=>{const w=f.getAttribute("id")||`form-ctrl-${h}-${v}`,z=f.getAttribute("name")||void 0,_=f.tagName.toLowerCase(),q=f.getAttribute("type")||"text",nt=f.hasAttribute("required"),Z=f.hasAttribute("disabled"),Tt=f.getAttribute("placeholder")||void 0;let X=W.get(f.getAttribute("id")||"")||void 0;if(!X){const H=f.closest("label");H&&(X=o(H.textContent||""))}if(X||(X=f.getAttribute("aria-label")||f.getAttribute("title")||void 0),_==="button"||["submit","button","image","reset"].includes(q)){const H=X||o(f.textContent||"")||q;d.push({id:w,type:"button",label:H,selectorHint:I(f),textContext:o(f.textContent||""),disabled:Z,sourceOrder:h})}else{let H=f.value||void 0;(q==="password"||q==="one-time-code"||f.getAttribute("autocomplete")==="one-time-code")&&(H=void 0),r.push({id:w,name:z,type:q,label:X,placeholder:Tt,required:nt,disabled:Z,value:H})}}),L.push({id:y,selectorHint:b,label:t.getAttribute("aria-label")||t.getAttribute("name")||void 0,fields:r,submitControls:d,sourceOrder:h})}else if(c==="button"||t.getAttribute("role")==="button"||c==="input"&&["button","submit","image"].includes(t.getAttribute("type")||"")){const r="button",d=G(t)||"Button",p=t.hasAttribute("disabled");g.push({id:y,type:r,label:d,selectorHint:b,textContext:o(t.textContent||""),disabled:p,sourceOrder:h})}else if(c==="a"&&t.hasAttribute("href")){const r=t.getAttribute("href")||"",d=o(t.textContent||""),p=t.getAttribute("title")||void 0,f=t.getAttribute("rel")||void 0;t.getAttribute("role")==="button"?g.push({id:y,type:"button",label:d||p||"Link Button",selectorHint:b,textContext:d,sourceOrder:h}):a.push({id:y,text:d||r,href:r,title:p,rel:f,selectorHint:b,sourceOrder:h})}else if(["p","span","li","article","section","div","td","blockquote"].includes(c)){const r=k(t,c);r.length>3&&l.push({id:y,text:r,selectorHint:b,sourceOrder:h,parentHeadingId:u||Lt()});const d=kt(t);d&&A.push({id:`${y}-background`,type:"image",alt:t.getAttribute("aria-label")||void 0,caption:t.getAttribute("title")||void 0,src:d,selectorHint:b,sourceOrder:h})}if(t.shadowRoot&&(x.push({type:"shadow_dom",message:"Shadow DOM encountered and traversed."}),V(t.shadowRoot),t.shadowRoot.childNodes.forEach(r=>U(r,u))),c==="iframe")try{const r=t,d=r.contentDocument||((Y=r.contentWindow)==null?void 0:Y.document);d?(V(d),d.childNodes.forEach(p=>U(p,u))):x.push({type:"iframe",message:"Cross-origin iframe detected. Content is restricted due to browser same-origin policies.",details:`Source: ${r.src||"about:blank"}`})}catch(r){x.push({type:"iframe",message:"Iframe access blocked. Same-origin validation failed.",details:r.message||r})}t.childNodes.forEach(r=>U(r,u))}let et=document.body;const ot=(gt=e.siteProfile)==null?void 0:gt.mainContentSelector;if(ot)try{et=document.querySelector(ot)||document.body,et===document.body&&x.push({type:"other",message:"Site profile main content selector did not match. Falling back to document body.",details:ot})}catch{x.push({type:"other",message:"Invalid site profile main content selector. Falling back to document body.",details:ot})}et&&U(et),$t();const Mt=performance.now()-i;return{schemaVersion:"page_snapshot.v1",source:{url:window.location.href,canonicalUrl:((mt=document.querySelector('link[rel="canonical"]'))==null?void 0:mt.getAttribute("href"))||void 0,title:document.title,capturedAt:new Date().toISOString(),language:document.documentElement.lang||void 0},metadata:{generator:"Visor DOM Extractor v0.1.0",userAgent:navigator.userAgent,semanticRoute:ut()?"wikipedia_article":"generic"},headings:s,textBlocks:l,links:a,actions:g,layoutGroups:St(),forms:L,tables:E,media:A,stats:{totalNodes:M,extractedNodes:T,ignoredNodes:$,timeElapsedMs:Mt},warnings:x}}const lt="pendingAgentExport",Ot=5*60*1e3,qt=25*1e3,It=500,vt={chatgpt:["chatgpt.com","chat.openai.com"],grok:["grok.com"],gemini:["gemini.google.com"],claude:["claude.ai"]},Bt=["textarea:not([disabled])",'[contenteditable="true"]','[role="textbox"]',".ProseMirror"];function wt(e){const i=e.toLowerCase();return Object.keys(vt).find(s=>vt[s].some(l=>i===l||i.endsWith(`.${l}`)))}function Dt(e,i=Date.now()){const s=Date.parse(e.createdAt);return Number.isFinite(s)&&i-s<=Ot}function Rt(e){const i=e.getBoundingClientRect(),s=window.getComputedStyle(e);return i.width>0&&i.height>0&&s.display!=="none"&&s.visibility!=="hidden"}function _t(e=document){for(const i of Bt){const l=Array.from(e.querySelectorAll(i)).find(a=>Rt(a)?a instanceof HTMLTextAreaElement?!a.disabled&&!a.readOnly:a.isContentEditable||a.getAttribute("role")==="textbox":!1);if(l)return l}return null}function xt(e){e.dispatchEvent(new InputEvent("input",{bubbles:!0,inputType:"insertText"})),e.dispatchEvent(new Event("change",{bubbles:!0}))}function Ht(e,i){var g;if(e.focus(),e instanceof HTMLTextAreaElement||e instanceof HTMLInputElement)return e.value=i,xt(e),e.value===i;const s=window.getSelection(),l=document.createRange();return l.selectNodeContents(e),l.collapse(!1),s==null||s.removeAllRanges(),s==null||s.addRange(l),(!document.execCommand("insertText",!1,i)||((g=e.textContent)==null?void 0:g.trim())!==i.trim())&&(e.textContent=i),xt(e),(e.textContent||"").trim()===i.trim()}function Wt(){return new Promise(e=>{chrome.storage.local.get([lt],i=>{e(i[lt])})})}function Vt(){return chrome.storage.local.remove(lt)}function jt(e){return new Promise(i=>window.setTimeout(i,e))}async function Gt(){const e=wt(window.location.hostname);if(!e)return;const i=await Wt();if(!i||i.provider!==e||!Dt(i))return;const s=Date.now();for(;Date.now()-s<=qt;){const l=_t();if(l&&Ht(l,i.text)){await Vt(),console.info(`Visor inserted context into ${e}. Review it before sending.`);return}await jt(It)}}const rt={chatgpt:"GPT",grok:"Grok",gemini:"Gemini",claude:"Claude"},zt={chatgpt:"llm-chatgpt.png",grok:"llm-grok.png",gemini:"llm-gemini.png",claude:"llm-claude.png"};let K;function At(){return chrome.storage.session}async function ct(e){const i=At();if(i)return new Promise(s=>{i.get([e],l=>{if(chrome.runtime.lastError){s(void 0);return}s(l[e])})})}async function yt(e,i){const s=At();if(s)return new Promise(l=>{s.set({[e]:i},()=>l())})}function Xt(){return window.top!==window.self||wt(window.location.hostname)||document.documentElement.dataset.visorWidgetMounted==="true"?!1:!/^chrome:|^chrome-extension:|^about:|^devtools:/i.test(window.location.href)}function Ft(e,i){return new Promise(s=>{chrome.runtime.sendMessage({type:"VISOR_EXPORT_ACTIVE_TAB_TO_AGENT",payload:{provider:e,request:i}},l=>{if(chrome.runtime.lastError){s({ok:!1,userMessage:chrome.runtime.lastError.message||"Export failed."});return}s(l||{ok:!1,userMessage:"Export failed."})})})}function Ut(){const e=document.createElement("style");return e.textContent=`
    :host {
      all: initial;
      color-scheme: dark;
      --visor-green: #1ed760;
      --visor-border: rgba(30, 215, 96, 0.38);
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    }

    .visor-widget {
      position: fixed;
      right: 18px;
      bottom: 18px;
      width: 46px;
      height: 46px;
      z-index: 2147483647;
      pointer-events: auto;
    }

    .visor-main,
    .visor-action,
    .visor-close {
      position: absolute;
      border: 1px solid var(--visor-border);
      border-radius: 999px;
      padding: 0;
      overflow: hidden;
      cursor: pointer;
      display: grid;
      place-items: center;
      line-height: 0;
      box-shadow: 0 10px 28px rgba(0, 0, 0, 0.32), 0 0 18px rgba(30, 215, 96, 0.14);
      transition: transform 180ms ease, border-color 160ms ease, box-shadow 160ms ease, opacity 160ms ease;
      transform-origin: center;
    }

    .visor-main {
      inset: 0;
      border-color: transparent;
      background: transparent;
      box-shadow: none;
      touch-action: none;
    }

    .visor-main:hover,
    .visor-action:hover,
    .visor-close:hover {
      border-color: rgba(30, 215, 96, 0.88);
      box-shadow: 0 12px 32px rgba(0, 0, 0, 0.36), 0 0 22px rgba(30, 215, 96, 0.22);
    }

    .visor-main img {
      width: 42px;
      height: 42px;
      border-radius: 999px;
      object-fit: cover;
      object-position: center;
      filter: saturate(1.18) contrast(1.06);
      pointer-events: none;
    }

    .visor-actions {
      position: absolute;
      inset: 0;
      pointer-events: none;
      opacity: 0;
      transition: opacity 140ms ease;
    }

    .visor-widget.open .visor-actions {
      opacity: 1;
      pointer-events: auto;
    }

    .visor-action {
      width: 34px;
      height: 34px;
      left: 6px;
      top: 6px;
      background: rgba(4, 10, 8, 0.56);
      backdrop-filter: blur(8px);
      transform: translate(0, 0) scale(0.72);
    }

    .visor-widget.open .visor-action {
      transform: translate(var(--x), var(--y)) scale(0.92);
    }

    .visor-close {
      width: 34px;
      height: 34px;
      left: 6px;
      top: 6px;
      background: rgba(30, 215, 96, 0.82);
      backdrop-filter: blur(8px);
      opacity: 0;
      pointer-events: none;
      transform: translate(var(--close-x, -48px), var(--close-y, 0)) scale(0.72);
    }

    .visor-close::before,
    .visor-close::after {
      content: "";
      position: absolute;
      left: 50%;
      top: 50%;
      width: 13px;
      height: 2.5px;
      border-radius: 999px;
      background: #001409;
      transform-origin: center;
    }

    .visor-close::before {
      transform: translate(-50%, -50%) rotate(45deg);
    }

    .visor-close::after {
      transform: translate(-50%, -50%) rotate(-45deg);
    }

    .visor-widget.open .visor-close {
      opacity: 1;
      pointer-events: auto;
      transform: translate(var(--close-x, -48px), var(--close-y, 0)) scale(0.92);
    }

    .visor-widget.open .visor-close:hover {
      transform: translate(var(--close-x, -48px), var(--close-y, 0)) scale(1.18);
      z-index: 3;
    }

    .visor-widget.open .visor-actions:hover .visor-action {
      transform: translate(calc(var(--x) * 0.94), calc(var(--y) * 0.94)) scale(0.82);
      opacity: 0.82;
    }

    .visor-widget.open .visor-actions:hover .visor-action:hover {
      transform: translate(var(--x), var(--y)) scale(1.14);
      opacity: 1;
      z-index: 2;
    }

    .visor-action img {
      width: 100%;
      height: 100%;
      display: block;
      border-radius: 999px;
      object-fit: cover;
      object-position: center;
      pointer-events: none;
    }

    .visor-action[disabled] {
      cursor: wait;
      opacity: 0.62;
    }

    .visor-widget.dragging .visor-main {
      cursor: grabbing;
    }
  `,e}async function Et(){K==null||K.remove(),K=void 0,delete document.documentElement.dataset.visorWidgetMounted}async function Ct(){if(!Xt())return;const e=await ct("settings")||{};if(e.widgetEnabled===!1)return;document.documentElement.dataset.visorWidgetMounted="true";const i={open:!1,mode:e.defaultMode||"agent_action",privacyLevel:e.privacyLevel||"medium",tokenBudget:e.tokenBudget||4e3},s=document.createElement("div");s.id="visor-floating-widget-root",K=s;const l=s.attachShadow({mode:"open"}),a=document.createElement("div");a.className="visor-widget";const g=document.createElement("button");g.className="visor-main",g.type="button",g.title="Open Visor agent export widget",g.setAttribute("aria-label","Open Visor agent export widget");const S=document.createElement("img");S.src=chrome.runtime.getURL("visor-logo.png"),S.alt="",g.appendChild(S);const L=document.createElement("div");L.className="visor-actions";const E=document.createElement("button");E.className="visor-close",E.type="button",E.title="Hide Visor widget",E.setAttribute("aria-label","Hide Visor widget"),E.addEventListener("click",async o=>{o.stopPropagation();const m=await ct("settings")||{};await yt("settings",{...m,widgetEnabled:!1}),await Et()});const A=[70,0],x={chatgpt:[63,39],grok:[39,63],gemini:[0,72],claude:[-39,63]},M=new Map,T=()=>{const o=a.getBoundingClientRect(),m=o.left<76?1:-1,k=o.top<76?1:-1;E.style.setProperty("--close-x",`${A[0]*m}px`),E.style.setProperty("--close-y",`${A[1]*k}px`),M.forEach((j,G)=>{const[st,at]=x[G];j.style.setProperty("--x",`${st*m}px`),j.style.setProperty("--y",`${at*k}px`)})};Object.keys(rt).forEach(o=>{const m=document.createElement("button");m.className="visor-action",m.type="button",m.title=`Dump current page context to ${rt[o]}`,m.setAttribute("aria-label",`Dump current page context to ${rt[o]}`),m.style.setProperty("--x",`${x[o][0]}px`),m.style.setProperty("--y",`${x[o][1]}px`),M.set(o,m);const k=document.createElement("img");k.src=chrome.runtime.getURL(zt[o]),k.alt="",m.appendChild(k),m.addEventListener("click",async j=>{j.stopPropagation(),i.exporting=o,$();const G=await Ft(o,{mode:i.mode,privacyLevel:i.privacyLevel,tokenBudget:i.tokenBudget});i.exporting=void 0,m.title=G.ok?`Opened ${rt[o]}`:G.userMessage||"Export failed",$()}),L.appendChild(m)});function $(){T(),a.classList.toggle("open",i.open),L.querySelectorAll(".visor-action").forEach(o=>{o.disabled=!!i.exporting})}const h=async()=>{const o=await ct("visorWidgetPosition");if(typeof(o==null?void 0:o.left)!="number"||typeof(o==null?void 0:o.top)!="number")return;const m=Math.min(Math.max(8,o.left),Math.max(8,window.innerWidth-54)),k=Math.min(Math.max(8,o.top),Math.max(8,window.innerHeight-54));a.style.left=`${m}px`,a.style.top=`${k}px`,a.style.right="auto",a.style.bottom="auto",T()};let B,P=!1,W=!1,V=0,J=0;const Q=async()=>{if(B&&(window.clearTimeout(B),B=void 0),!P)return;P=!1,a.classList.remove("dragging");const o=a.getBoundingClientRect();await yt("visorWidgetPosition",{left:o.left,top:o.top})};g.addEventListener("pointerdown",o=>{if(o.button!==0)return;const m=a.getBoundingClientRect();V=o.clientX-m.left,J=o.clientY-m.top,B=window.setTimeout(()=>{P=!0,W=!0,i.open=!1,a.classList.add("dragging"),$(),g.setPointerCapture(o.pointerId)},260)}),g.addEventListener("pointermove",o=>{if(!P)return;const m=Math.min(Math.max(8,o.clientX-V),Math.max(8,window.innerWidth-a.offsetWidth-8)),k=Math.min(Math.max(8,o.clientY-J),Math.max(8,window.innerHeight-a.offsetHeight-8));a.style.left=`${m}px`,a.style.top=`${k}px`,a.style.right="auto",a.style.bottom="auto",T()}),g.addEventListener("pointerup",()=>{Q()}),g.addEventListener("pointercancel",()=>{Q()}),g.addEventListener("click",o=>{if(o.stopPropagation(),W){W=!1;return}i.open=!i.open,$()}),document.addEventListener("keydown",o=>{o.key==="Escape"&&i.open&&(i.open=!1,$())}),l.append(Ut(),a),a.append(L,E,g),$(),h();const F=()=>{document.body.contains(s)||document.body.appendChild(s)};document.body?F():window.addEventListener("DOMContentLoaded",F,{once:!0})}Gt();Ct();chrome.runtime.onMessage.addListener((e,i,s)=>{var l;if(e.type==="VISOR_EXTRACT_DOM")try{const a=e.payload.settings,g=Nt(a);s({ok:!0,snapshot:g})}catch(a){console.error("Visor content script extraction failed:",a),s({ok:!1,error:a.message||a})}return e.type==="VISOR_WIDGET_SET_ENABLED"&&(!!((l=e.payload)!=null&&l.enabled)?Ct():Et()).then(()=>{s({ok:!0})}),!0});console.log("Visor Content Script Active");
