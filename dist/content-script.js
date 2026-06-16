function ht(e){const n=e.tagName.toLowerCase();if(["input","select","textarea","button"].includes(n))return!0;const s=e.getAttribute("role");return!!(s&&["button","checkbox","radio","combobox","textbox","link"].includes(s))}function Nt(e){if(e.hasAttribute("hidden")||e.getAttribute("aria-hidden")==="true")return!1;const n=window.getComputedStyle(e);if(n.display==="none"||n.visibility==="hidden"||parseFloat(n.opacity||"1")===0&&!ht(e))return!1;const s=e.getBoundingClientRect();return!(s.width===0&&s.height===0&&!ht(e))}function q(e){const n=vt(e);if(n)return n;if(e.hasAttribute("id")){const a=e.getAttribute("id");if(a&&/^[a-zA-Z0-9_-]+$/.test(a))return`#${a}`}const s=[];let l=e;for(;l&&l.nodeType===Node.ELEMENT_NODE;){const a=vt(l);let p=a||l.tagName.toLowerCase();const E=l.getAttribute("id");if(!a&&E&&/^[a-zA-Z0-9_-]+$/.test(E)){p=`#${E}`,s.unshift(p);break}const L=l.getAttribute("class");if(!a&&L){const A=L.trim().split(/\s+/).filter(x=>/^[a-zA-Z0-9_-]+$/.test(x))[0];A&&(p+=`.${A}`)}const C=l.parentElement;if(C&&!a){const A=Array.from(C.children),x=A.indexOf(l)+1;A.filter(M=>M.tagName===l.tagName).length>1&&(p+=`:nth-child(${x})`)}if(s.unshift(p),a)break;l=l.parentElement}return s.join(" > ")}function vt(e){const n=e.tagName.toLowerCase(),s=["data-testid","data-test","data-cy","data-qa","data-track-id","aria-label"];for(const a of s){const p=e.getAttribute(a);if(p&&p.length<=80)return`${n}[${a}="${rt(p)}"]`}const l=e.getAttribute("role");if(l){const a=e.getAttribute("aria-label");return a&&a.length<=80?`${n}[role="${rt(l)}"][aria-label="${rt(a)}"]`:`${n}[role="${rt(l)}"]`}}function rt(e){return e.replace(/\\/g,"\\\\").replace(/"/g,'\\"')}function Ot(e){var ft,gt,mt,bt;const n=performance.now(),s=[],l=[],a=[],p=[],E=[],L=[],C=[],A=[],x=[];let T=0,M=0,$=0,h=0;const B=12e3;let P=!1;const V=new Map;function W(i){try{i.querySelectorAll("label").forEach(t=>{const c=t.getAttribute("for"),S=(t.textContent||"").trim().replace(/\s+/g," ");c&&S&&V.set(c,S)})}catch{}}W(document);const Q=((ft=e.siteProfile)==null?void 0:ft.ignoreSelectors)||[],tt=((gt=e.siteProfile)==null?void 0:gt.preserveSelectors)||[];function X(i,u){return u.some(t=>{try{return i.matches(t)}catch{return x.push({type:"other",message:"Invalid site profile selector ignored.",details:t}),!1}})}function o(i){return i.trim().replace(/\s+/g," ")}function m(i){let u="";for(let t=0;t<i.childNodes.length;t++){const c=i.childNodes[t];c.nodeType===Node.TEXT_NODE&&(u+=c.textContent)}return o(u)}function k(i,u){return["p","li","blockquote","td","span"].includes(u)||j(i)?o(i.textContent||""):m(i)}function j(i){const u=o(i.textContent||"");return u.length<4||u.length>700||i.querySelectorAll("article, section, div, table, form, ul, ol, nav, aside, header, footer").length>3?!1:i.querySelectorAll("a, span, strong, em, b, i, small, sup, sub").length>0}function G(i){const u=i.getAttribute("aria-label"),t=i.getAttribute("title"),c=i.getAttribute("aria-labelledby"),S=c==null?void 0:c.split(/\s+/).map(_=>{var O;return((O=document.getElementById(_))==null?void 0:O.textContent)||""}).filter(Boolean).join(" "),y=o(i.textContent||""),b=i.value,N=i.getAttribute("name")||i.getAttribute("data-testid")||i.getAttribute("data-test")||i.getAttribute("data-cy");return o(S||u||t||y||b||N||"")}function at(i,u){const t=i.getAttribute("role"),c=`${u} ${t||""} ${i.getAttribute("class")||""} ${i.getAttribute("data-testid")||""}`.toLowerCase();return c.includes("dialog")||t==="dialog"?"dialog":c.includes("nav")||t==="navigation"||u==="nav"?"nav":c.includes("card")||c.includes("plan")||c.includes("tier")||c.includes("price")?"card":u==="ul"||u==="ol"||t==="list"?"list":u==="section"||u==="article"||t==="region"?"section":"generic"}function ct(i,u){if(!["article","section","div","li","ul","ol","nav","aside"].includes(u))return!1;const t=o(i.textContent||"");if(t.length<20||t.length>1200)return!1;const c=`${u} ${i.getAttribute("role")||""} ${i.getAttribute("class")||""} ${i.getAttribute("data-testid")||""}`.toLowerCase(),S=i.querySelectorAll('button, a[href], img, video, svg, [role="button"], [aria-label]').length>0,y=/\b(plan|tier|price|premium|fan|mega|benefit|feature|subscription|monthly|yearly|\$\s?\d|\d+[.,]\d{2})\b/i.test(t+" "+c),b=i.querySelectorAll("article, section, div, li, table, form").length;return(S||y)&&b<=12}function et(i,u){return i.filter(t=>t.selectorHint===u||t.selectorHint.startsWith(`${u} > `)).map(t=>t.id).slice(0,20)}function kt(){return E.map(i=>({...i,childActionIds:et(p,i.selectorHint),childMediaIds:et(A,i.selectorHint)}))}function $t(i){const t=window.getComputedStyle(i).backgroundImage.match(/url\(["']?(.*?)["']?\)/);return t==null?void 0:t[1]}function ut(){return h++,h}function D(i){!i.text||E.some(u=>u.id===i.id)||E.push({...i,sourceOrder:i.sourceOrder||ut(),childActionIds:[],childMediaIds:[]})}function pt(){return/(^|\.)wikipedia\.org$/i.test(window.location.hostname)&&!!document.querySelector("#mw-content-text, .mw-parser-output")}function Lt(){var O,Y;if(!pt())return;const i=document.querySelector(".mw-parser-output");if(!i)return;x.push({type:"other",message:"Wikipedia semantic route applied: lead, TOC, infobox, sections, references, media, and nav are preserved as separate layout groups."});const u=o(((O=document.querySelector("#firstHeading"))==null?void 0:O.textContent)||document.title),t=[];for(const r of Array.from(i.children)){if(r.matches("h2, .mw-heading2, #toc, .vector-toc, table.infobox"))break;if(r.matches("p")){const d=o(r.textContent||"");d.length>40&&t.push(d)}}t.length>0&&D({id:"wikipedia-lead",label:`${u} lead`,role:"lead",text:t.join(`

`),selectorHint:".mw-parser-output > p"});const c=document.querySelector('#toc, .vector-toc, [aria-label="Contents"]');if(c){const r=Array.from(c.querySelectorAll("a")).map(d=>o(d.textContent||"")).filter(Boolean).slice(0,80);D({id:"wikipedia-toc",label:"Table of contents",role:"toc",text:r.join(`
`),selectorHint:q(c)})}const S=i.querySelector("table.infobox");if(S){const r=o(S.textContent||"");D({id:"wikipedia-infobox",label:o(((Y=S.querySelector("caption, th"))==null?void 0:Y.textContent)||`${u} infobox`),role:"infobox",text:r,selectorHint:q(S)})}Array.from(i.querySelectorAll("h2, .mw-heading2")).forEach((r,d)=>{const f=o(r.textContent||"").replace(/\[edit\]$/i,"").trim();if(!f)return;const g=[];let v=r.nextElementSibling;for(;v&&!v.matches("h2, .mw-heading2");){if(v.matches("p, ul, ol, table, figure, .thumb, .reflist, ol.references")){const w=o(v.textContent||"");w.length>20&&g.push(w)}v=v.nextElementSibling}g.length>0&&D({id:`wikipedia-section-${d+1}`,label:f,role:/references|notes|bibliography|external links/i.test(f)?"references":"article_section",text:g.join(`

`).slice(0,6e3),selectorHint:q(r)})});const b=i.querySelector('.reflist, ol.references, section[aria-labelledby="References"]');if(b){const r=Array.from(b.querySelectorAll("li, cite")).map(d=>o(d.textContent||"")).filter(d=>d.length>10).slice(0,80);D({id:"wikipedia-references",label:"References",role:"references",text:r.join(`
`),selectorHint:q(b)})}const N=document.querySelector("#p-navigation, .vector-page-toolbar, nav[aria-label]");if(N){const r=Array.from(N.querySelectorAll("a, button")).map(d=>o(d.textContent||d.getAttribute("aria-label")||"")).filter(Boolean).slice(0,60).join(`
`);D({id:"wikipedia-nav",label:"Page navigation",role:"nav",text:r,selectorHint:q(N)})}const _=new Set(A.map(r=>`${r.src||""}:${r.alt||""}`));i.querySelectorAll("figure, .thumb, .mw-file-description").forEach((r,d)=>{var Z;const f=r.querySelector("img"),g=(f==null?void 0:f.currentSrc)||(f==null?void 0:f.getAttribute("src"))||(f==null?void 0:f.getAttribute("srcset"))||void 0,v=(f==null?void 0:f.getAttribute("alt"))||void 0,w=o(((Z=r.querySelector("figcaption, .thumbcaption"))==null?void 0:Z.textContent)||(f==null?void 0:f.getAttribute("title"))||""),z=`${g||""}:${v||w}`;if(!g||_.has(z))return;_.add(z);const R=ut(),I=q(r),it=`wikipedia-media-${d+1}`;A.push({id:it,type:"image",alt:v,caption:w||void 0,src:g,selectorHint:I,sourceOrder:R}),D({id:`${it}-group`,label:w||v||"Wikipedia media",role:"media",text:w||v||g,selectorHint:I,sourceOrder:R})})}function Tt(){if(s.length!==0)return s[s.length-1].id}function F(i,u){var _,O,Y;if(P)return;if(T++,T>B){P||(P=!0,x.push({type:"node_limit",message:`Page size limit exceeded (processed over ${B} nodes). Extraction has been capped.`,details:`Processed nodes: ${T}`}));return}if(i.nodeType!==Node.ELEMENT_NODE){i.childNodes.forEach(r=>F(r,u));return}const t=i,c=t.tagName.toLowerCase(),S=X(t,tt);if(["script","style","noscript","template","head","meta","link","title"].includes(c)){$++;return}if(!S&&X(t,Q)){$++;return}if(!S&&!Nt(t)){$++;return}M++,h++;const y=t.getAttribute("id")||`visor-el-${h}`,b=q(t);if(ct(t,c)){const r=o(t.textContent||""),d=t.getAttribute("aria-label")||t.getAttribute("title")||"",f=o(((_=t.querySelector("h1, h2, h3, h4, h5, h6"))==null?void 0:_.textContent)||""),g=r.split(new RegExp("(?<=[.!?])\\s+"))[0]||r;E.push({id:`${y}-group`,label:o(d||f||g.slice(0,80)),role:at(t,c),text:r,selectorHint:b,sourceOrder:h,childActionIds:et(p,b),childMediaIds:et(A,b)})}const N=c.match(/^h([1-6])$/);if(N){const r=parseInt(N[1]),d=o(t.textContent||"");if(d){const f={id:y,text:d,level:r,selectorHint:b,sourceOrder:h};s.push(f),u=y}}else if(c==="pre"||c==="code"){if(!(c==="code"&&((O=t.parentElement)==null?void 0:O.tagName.toLowerCase())==="pre")){const r=t.textContent||"";r.trim()&&l.push({id:y,text:r,selectorHint:b,sourceOrder:h,parentHeadingId:u});return}}else if(c==="table"){const r=[],d=[];let f;const g=t.querySelector("caption");g&&(f=o(g.textContent||"")),t.querySelectorAll("th").forEach(v=>{const w=o(v.textContent||"");w&&r.push(w)}),t.querySelectorAll("tr").forEach(v=>{const w=[];v.querySelectorAll("th, td").forEach(z=>{const R=o(z.textContent||"");R&&w.push(R)}),w.length>0&&d.push(w)}),C.push({id:y,caption:f,headers:r,rows:d,selectorHint:b,sourceOrder:h});return}else if(["img","video","audio","canvas","svg"].includes(c)){const r=c==="img"||c==="svg"?"image":c,d=t,f=t.getAttribute("alt")||t.getAttribute("aria-label")||void 0,g=d.currentSrc||t.getAttribute("src")||t.getAttribute("data-src")||t.getAttribute("srcset")||t.getAttribute("data-srcset")||void 0,v=t.getAttribute("title")||void 0;A.push({id:y,type:r,alt:f,caption:v,src:g,selectorHint:b,sourceOrder:h}),c==="canvas"&&x.push({type:"canvas_only",message:"Page contains a Canvas element. Graphic contents inside Canvas are unreadable as HTML DOM."})}else if(c==="form"){const r=[],d=[];t.querySelectorAll("input, select, textarea, button").forEach((g,v)=>{const w=g.getAttribute("id")||`form-ctrl-${h}-${v}`,z=g.getAttribute("name")||void 0,R=g.tagName.toLowerCase(),I=g.getAttribute("type")||"text",it=g.hasAttribute("required"),Z=g.hasAttribute("disabled"),Pt=g.getAttribute("placeholder")||void 0;let U=V.get(g.getAttribute("id")||"")||void 0;if(!U){const H=g.closest("label");H&&(U=o(H.textContent||""))}if(U||(U=g.getAttribute("aria-label")||g.getAttribute("title")||void 0),R==="button"||["submit","button","image","reset"].includes(I)){const H=U||o(g.textContent||"")||I;d.push({id:w,type:"button",label:H,selectorHint:q(g),textContext:o(g.textContent||""),disabled:Z,sourceOrder:h})}else{let H=g.value||void 0;(I==="password"||I==="one-time-code"||g.getAttribute("autocomplete")==="one-time-code")&&(H=void 0),r.push({id:w,name:z,type:I,label:U,placeholder:Pt,required:it,disabled:Z,value:H})}}),L.push({id:y,selectorHint:b,label:t.getAttribute("aria-label")||t.getAttribute("name")||void 0,fields:r,submitControls:d,sourceOrder:h})}else if(c==="button"||t.getAttribute("role")==="button"||c==="input"&&["button","submit","image"].includes(t.getAttribute("type")||"")){const r="button",d=G(t)||"Button",f=t.hasAttribute("disabled");p.push({id:y,type:r,label:d,selectorHint:b,textContext:o(t.textContent||""),disabled:f,sourceOrder:h})}else if(c==="a"&&t.hasAttribute("href")){const r=t.getAttribute("href")||"",d=o(t.textContent||""),f=t.getAttribute("title")||void 0,g=t.getAttribute("rel")||void 0;t.getAttribute("role")==="button"?p.push({id:y,type:"button",label:d||f||"Link Button",selectorHint:b,textContext:d,sourceOrder:h}):a.push({id:y,text:d||r,href:r,title:f,rel:g,selectorHint:b,sourceOrder:h})}else if(["p","span","li","article","section","div","td","blockquote"].includes(c)){const r=k(t,c);r.length>3&&l.push({id:y,text:r,selectorHint:b,sourceOrder:h,parentHeadingId:u||Tt()});const d=$t(t);d&&A.push({id:`${y}-background`,type:"image",alt:t.getAttribute("aria-label")||void 0,caption:t.getAttribute("title")||void 0,src:d,selectorHint:b,sourceOrder:h})}if(t.shadowRoot&&(x.push({type:"shadow_dom",message:"Shadow DOM encountered and traversed."}),W(t.shadowRoot),t.shadowRoot.childNodes.forEach(r=>F(r,u))),c==="iframe")try{const r=t,d=r.contentDocument||((Y=r.contentWindow)==null?void 0:Y.document);d?(W(d),d.childNodes.forEach(f=>F(f,u))):x.push({type:"iframe",message:"Cross-origin iframe detected. Content is restricted due to browser same-origin policies.",details:`Source: ${r.src||"about:blank"}`})}catch(r){x.push({type:"iframe",message:"Iframe access blocked. Same-origin validation failed.",details:r.message||r})}t.childNodes.forEach(r=>F(r,u))}let ot=document.body;const nt=(mt=e.siteProfile)==null?void 0:mt.mainContentSelector;if(nt)try{ot=document.querySelector(nt)||document.body,ot===document.body&&x.push({type:"other",message:"Site profile main content selector did not match. Falling back to document body.",details:nt})}catch{x.push({type:"other",message:"Invalid site profile main content selector. Falling back to document body.",details:nt})}ot&&F(ot),Lt();const Mt=performance.now()-n;return{schemaVersion:"page_snapshot.v1",source:{url:window.location.href,canonicalUrl:((bt=document.querySelector('link[rel="canonical"]'))==null?void 0:bt.getAttribute("href"))||void 0,title:document.title,capturedAt:new Date().toISOString(),language:document.documentElement.lang||void 0},metadata:{generator:"Visor DOM Extractor v0.1.0",userAgent:navigator.userAgent,semanticRoute:pt()?"wikipedia_article":"generic"},headings:s,textBlocks:l,links:a,actions:p,layoutGroups:kt(),forms:L,tables:C,media:A,stats:{totalNodes:T,extractedNodes:M,ignoredNodes:$,timeElapsedMs:Mt},warnings:x}}const dt="pendingAgentExport",It=5*60*1e3,qt=25*1e3,Bt=500,xt={chatgpt:["chatgpt.com","chat.openai.com"],grok:["grok.com"],gemini:["gemini.google.com"],claude:["claude.ai"]},Dt=["textarea:not([disabled])",'[contenteditable="true"]','[role="textbox"]',".ProseMirror"];function At(e){const n=e.toLowerCase();return Object.keys(xt).find(s=>xt[s].some(l=>n===l||n.endsWith(`.${l}`)))}function _t(e,n=Date.now()){const s=Date.parse(e.createdAt);return Number.isFinite(s)&&n-s<=It}function Rt(e){const n=e.getBoundingClientRect(),s=window.getComputedStyle(e);return n.width>0&&n.height>0&&s.display!=="none"&&s.visibility!=="hidden"}function Ht(e=document){for(const n of Dt){const l=Array.from(e.querySelectorAll(n)).find(a=>Rt(a)?a instanceof HTMLTextAreaElement?!a.disabled&&!a.readOnly:a.isContentEditable||a.getAttribute("role")==="textbox":!1);if(l)return l}return null}function yt(e){e.dispatchEvent(new InputEvent("input",{bubbles:!0,inputType:"insertText"})),e.dispatchEvent(new Event("change",{bubbles:!0}))}function Vt(e,n){var p;if(e.focus(),e instanceof HTMLTextAreaElement||e instanceof HTMLInputElement)return e.value=n,yt(e),e.value===n;const s=window.getSelection(),l=document.createRange();return l.selectNodeContents(e),l.collapse(!1),s==null||s.removeAllRanges(),s==null||s.addRange(l),(!document.execCommand("insertText",!1,n)||((p=e.textContent)==null?void 0:p.trim())!==n.trim())&&(e.textContent=n),yt(e),(e.textContent||"").trim()===n.trim()}function Wt(){return new Promise(e=>{chrome.storage.local.get([dt],n=>{e(n[dt])})})}function jt(){return chrome.storage.local.remove(dt)}function Gt(e){return new Promise(n=>window.setTimeout(n,e))}async function zt(){const e=At(window.location.hostname);if(!e)return;const n=await Wt();if(!n||n.provider!==e||!_t(n))return;const s=Date.now();for(;Date.now()-s<=qt;){const l=Ht();if(l&&Vt(l,n.text)){await jt(),console.info(`Visor inserted context into ${e}. Review it before sending.`);return}await Gt(Bt)}}const st={chatgpt:"GPT",grok:"Grok",gemini:"Gemini",claude:"Claude"},Ut={chatgpt:"llm-chatgpt.png",grok:"llm-grok.png",gemini:"llm-gemini.png",claude:"llm-claude.png"};let K,J;function Et(){return chrome.storage.session}async function lt(e){const n=Et();if(n)return new Promise(s=>{n.get([e],l=>{if(chrome.runtime.lastError){s(void 0);return}s(l[e])})})}async function wt(e,n){const s=Et();if(s)return new Promise(l=>{s.set({[e]:n},()=>l())})}function Xt(){return window.top!==window.self||At(window.location.hostname)||document.documentElement.dataset.visorWidgetMounted==="true"?!1:!/^chrome:|^chrome-extension:|^about:|^devtools:/i.test(window.location.href)}function Ft(e,n){return new Promise(s=>{chrome.runtime.sendMessage({type:"VISOR_EXPORT_ACTIVE_TAB_TO_AGENT",payload:{provider:e,request:n}},l=>{if(chrome.runtime.lastError){s({ok:!1,userMessage:chrome.runtime.lastError.message||"Export failed."});return}s(l||{ok:!1,userMessage:"Export failed."})})})}function Yt(){const e=document.createElement("style");return e.textContent=`
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

    .visor-action[data-provider="chatgpt"] {
      background: #ffffff;
      border-color: rgba(255, 255, 255, 0.86);
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

    .visor-action[data-provider="chatgpt"] img {
      width: 78%;
      height: 78%;
      object-fit: contain;
    }

    .visor-action[disabled] {
      cursor: wait;
      opacity: 0.62;
    }

    .visor-widget.dragging .visor-main {
      cursor: grabbing;
    }
  `,e}async function Ct(){K==null||K.remove(),K=void 0,J=void 0,delete document.documentElement.dataset.visorWidgetMounted}async function Zt(e){J==null||J(e)}async function St(){if(!Xt())return;const e=await lt("settings")||{};if(e.widgetEnabled===!1)return;document.documentElement.dataset.visorWidgetMounted="true";const n={open:!1,mode:e.defaultMode||"agent_action",privacyLevel:e.privacyLevel||"medium",tokenBudget:e.tokenBudget||4e3};J=o=>{o.defaultMode&&(n.mode=o.defaultMode),o.privacyLevel&&(n.privacyLevel=o.privacyLevel),typeof o.tokenBudget=="number"&&(n.tokenBudget=o.tokenBudget)};const s=document.createElement("div");s.id="visor-floating-widget-root",K=s;const l=s.attachShadow({mode:"open"}),a=document.createElement("div");a.className="visor-widget";const p=document.createElement("button");p.className="visor-main",p.type="button",p.title="Open Visor agent export widget",p.setAttribute("aria-label","Open Visor agent export widget");const E=document.createElement("img");E.src=chrome.runtime.getURL("visor-logo.png"),E.alt="",p.appendChild(E);const L=document.createElement("div");L.className="visor-actions";const C=document.createElement("button");C.className="visor-close",C.type="button",C.title="Hide Visor widget",C.setAttribute("aria-label","Hide Visor widget"),C.addEventListener("click",async o=>{o.stopPropagation();const m=await lt("settings")||{};await wt("settings",{...m,widgetEnabled:!1}),await Ct()});const A=[70,0],x={chatgpt:[63,39],grok:[39,63],gemini:[0,72],claude:[-39,63]},T=new Map,M=()=>{const o=a.getBoundingClientRect(),m=o.left<76?1:-1,k=o.top<76?1:-1;C.style.setProperty("--close-x",`${A[0]*m}px`),C.style.setProperty("--close-y",`${A[1]*k}px`),T.forEach((j,G)=>{const[at,ct]=x[G];j.style.setProperty("--x",`${at*m}px`),j.style.setProperty("--y",`${ct*k}px`)})};Object.keys(st).forEach(o=>{const m=document.createElement("button");m.className="visor-action",m.dataset.provider=o,m.type="button",m.title=`Dump current page context to ${st[o]}`,m.setAttribute("aria-label",`Dump current page context to ${st[o]}`),m.style.setProperty("--x",`${x[o][0]}px`),m.style.setProperty("--y",`${x[o][1]}px`),T.set(o,m);const k=document.createElement("img");k.src=chrome.runtime.getURL(Ut[o]),k.alt="",m.appendChild(k),m.addEventListener("click",async j=>{j.stopPropagation(),n.exporting=o,$();const G=await Ft(o,{mode:n.mode,privacyLevel:n.privacyLevel,tokenBudget:n.tokenBudget});n.exporting=void 0,m.title=G.ok?`Opened ${st[o]}`:G.userMessage||"Export failed",$()}),L.appendChild(m)});function $(){M(),a.classList.toggle("open",n.open),L.querySelectorAll(".visor-action").forEach(o=>{o.disabled=!!n.exporting})}const h=async()=>{const o=await lt("visorWidgetPosition");if(typeof(o==null?void 0:o.left)!="number"||typeof(o==null?void 0:o.top)!="number")return;const m=Math.min(Math.max(8,o.left),Math.max(8,window.innerWidth-54)),k=Math.min(Math.max(8,o.top),Math.max(8,window.innerHeight-54));a.style.left=`${m}px`,a.style.top=`${k}px`,a.style.right="auto",a.style.bottom="auto",M()};let B,P=!1,V=!1,W=0,Q=0;const tt=async()=>{if(B&&(window.clearTimeout(B),B=void 0),!P)return;P=!1,a.classList.remove("dragging");const o=a.getBoundingClientRect();await wt("visorWidgetPosition",{left:o.left,top:o.top})};p.addEventListener("pointerdown",o=>{if(o.button!==0)return;const m=a.getBoundingClientRect();W=o.clientX-m.left,Q=o.clientY-m.top,B=window.setTimeout(()=>{P=!0,V=!0,n.open=!1,a.classList.add("dragging"),$(),p.setPointerCapture(o.pointerId)},260)}),p.addEventListener("pointermove",o=>{if(!P)return;const m=Math.min(Math.max(8,o.clientX-W),Math.max(8,window.innerWidth-a.offsetWidth-8)),k=Math.min(Math.max(8,o.clientY-Q),Math.max(8,window.innerHeight-a.offsetHeight-8));a.style.left=`${m}px`,a.style.top=`${k}px`,a.style.right="auto",a.style.bottom="auto",M()}),p.addEventListener("pointerup",()=>{tt()}),p.addEventListener("pointercancel",()=>{tt()}),p.addEventListener("click",o=>{if(o.stopPropagation(),V){V=!1;return}n.open=!n.open,$()}),document.addEventListener("keydown",o=>{o.key==="Escape"&&n.open&&(n.open=!1,$())}),l.append(Yt(),a),a.append(L,C,p),$(),h();const X=()=>{document.body.contains(s)||document.body.appendChild(s)};document.body?X():window.addEventListener("DOMContentLoaded",X,{once:!0})}zt();St();chrome.runtime.onMessage.addListener((e,n,s)=>{var l,a;if(e.type==="VISOR_EXTRACT_DOM")try{const p=e.payload.settings,E=Ot(p);s({ok:!0,snapshot:E})}catch(p){console.error("Visor content script extraction failed:",p),s({ok:!1,error:p.message||p})}return e.type==="VISOR_WIDGET_SET_ENABLED"?((!!((l=e.payload)!=null&&l.enabled)?St():Ct()).then(()=>{s({ok:!0})}),!0):(e.type==="VISOR_WIDGET_UPDATE_SETTINGS"&&Zt(((a=e.payload)==null?void 0:a.settings)||{}).then(()=>{s({ok:!0})}),!0)});console.log("Visor Content Script Active");
