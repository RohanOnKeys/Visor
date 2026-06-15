function mt(e){const s=e.tagName.toLowerCase();if(["input","select","textarea","button"].includes(s))return!0;const r=e.getAttribute("role");return!!(r&&["button","checkbox","radio","combobox","textbox","link"].includes(r))}function Lt(e){if(e.hasAttribute("hidden")||e.getAttribute("aria-hidden")==="true")return!1;const s=window.getComputedStyle(e);if(s.display==="none"||s.visibility==="hidden"||parseFloat(s.opacity||"1")===0&&!mt(e))return!1;const r=e.getBoundingClientRect();return!(r.width===0&&r.height===0&&!mt(e))}function B(e){const s=bt(e);if(s)return s;if(e.hasAttribute("id")){const p=e.getAttribute("id");if(p&&/^[a-zA-Z0-9_-]+$/.test(p))return`#${p}`}const r=[];let c=e;for(;c&&c.nodeType===Node.ELEMENT_NODE;){const p=bt(c);let d=p||c.tagName.toLowerCase();const b=c.getAttribute("id");if(!p&&b&&/^[a-zA-Z0-9_-]+$/.test(b)){d=`#${b}`,r.unshift(d);break}const L=c.getAttribute("class");if(!p&&L){const h=L.trim().split(/\s+/).filter(w=>/^[a-zA-Z0-9_-]+$/.test(w))[0];h&&(d+=`.${h}`)}const $=c.parentElement;if($&&!p){const h=Array.from($.children),w=h.indexOf(c)+1;h.filter(T=>T.tagName===c.tagName).length>1&&(d+=`:nth-child(${w})`)}if(r.unshift(d),p)break;c=c.parentElement}return r.join(" > ")}function bt(e){const s=e.tagName.toLowerCase(),r=["data-testid","data-test","data-cy","data-qa","data-track-id","aria-label"];for(const p of r){const d=e.getAttribute(p);if(d&&d.length<=80)return`${s}[${p}="${it(d)}"]`}const c=e.getAttribute("role");if(c){const p=e.getAttribute("aria-label");return p&&p.length<=80?`${s}[role="${it(c)}"][aria-label="${it(p)}"]`:`${s}[role="${it(c)}"]`}}function it(e){return e.replace(/\\/g,"\\\\").replace(/"/g,'\\"')}function Mt(e){var ut,pt,gt,ft;const s=performance.now(),r=[],c=[],p=[],d=[],b=[],L=[],$=[],h=[],w=[];let M=0,T=0,k=0,x=0;const D=12e3;let P=!1;const V=new Map;function j(n){try{n.querySelectorAll("label").forEach(t=>{const a=t.getAttribute("for"),E=(t.textContent||"").trim().replace(/\s+/g," ");a&&E&&V.set(a,E)})}catch{}}j(document);const J=((ut=e.siteProfile)==null?void 0:ut.ignoreSelectors)||[],Q=((pt=e.siteProfile)==null?void 0:pt.preserveSelectors)||[];function F(n,u){return u.some(t=>{try{return n.matches(t)}catch{return w.push({type:"other",message:"Invalid site profile selector ignored.",details:t}),!1}})}function o(n){return n.trim().replace(/\s+/g," ")}function m(n){let u="";for(let t=0;t<n.childNodes.length;t++){const a=n.childNodes[t];a.nodeType===Node.TEXT_NODE&&(u+=a.textContent)}return o(u)}function S(n,u){return["p","li","blockquote","td","span"].includes(u)||N(n)?o(n.textContent||""):m(n)}function N(n){const u=o(n.textContent||"");return u.length<4||u.length>700||n.querySelectorAll("article, section, div, table, form, ul, ol, nav, aside, header, footer").length>3?!1:n.querySelectorAll("a, span, strong, em, b, i, small, sup, sub").length>0}function G(n){const u=n.getAttribute("aria-label"),t=n.getAttribute("title"),a=n.getAttribute("aria-labelledby"),E=a==null?void 0:a.split(/\s+/).map(_=>{var q;return((q=document.getElementById(_))==null?void 0:q.textContent)||""}).filter(Boolean).join(" "),A=o(n.textContent||""),v=n.value,O=n.getAttribute("name")||n.getAttribute("data-testid")||n.getAttribute("data-test")||n.getAttribute("data-cy");return o(E||u||t||A||v||O||"")}function st(n,u){const t=n.getAttribute("role"),a=`${u} ${t||""} ${n.getAttribute("class")||""} ${n.getAttribute("data-testid")||""}`.toLowerCase();return a.includes("dialog")||t==="dialog"?"dialog":a.includes("nav")||t==="navigation"||u==="nav"?"nav":a.includes("card")||a.includes("plan")||a.includes("tier")||a.includes("price")?"card":u==="ul"||u==="ol"||t==="list"?"list":u==="section"||u==="article"||t==="region"?"section":"generic"}function at(n,u){if(!["article","section","div","li","ul","ol","nav","aside"].includes(u))return!1;const t=o(n.textContent||"");if(t.length<20||t.length>1200)return!1;const a=`${u} ${n.getAttribute("role")||""} ${n.getAttribute("class")||""} ${n.getAttribute("data-testid")||""}`.toLowerCase(),E=n.querySelectorAll('button, a[href], img, video, svg, [role="button"], [aria-label]').length>0,A=/\b(plan|tier|price|premium|fan|mega|benefit|feature|subscription|monthly|yearly|\$\s?\d|\d+[.,]\d{2})\b/i.test(t+" "+a),v=n.querySelectorAll("article, section, div, li, table, form").length;return(E||A)&&v<=12}function tt(n,u){return n.filter(t=>t.selectorHint===u||t.selectorHint.startsWith(`${u} > `)).map(t=>t.id).slice(0,20)}function At(){return b.map(n=>({...n,childActionIds:tt(d,n.selectorHint),childMediaIds:tt(h,n.selectorHint)}))}function Ct(n){const t=window.getComputedStyle(n).backgroundImage.match(/url\(["']?(.*?)["']?\)/);return t==null?void 0:t[1]}function lt(){return x++,x}function R(n){!n.text||b.some(u=>u.id===n.id)||b.push({...n,sourceOrder:n.sourceOrder||lt(),childActionIds:[],childMediaIds:[]})}function dt(){return/(^|\.)wikipedia\.org$/i.test(window.location.hostname)&&!!document.querySelector("#mw-content-text, .mw-parser-output")}function Et(){var q,Y;if(!dt())return;const n=document.querySelector(".mw-parser-output");if(!n)return;w.push({type:"other",message:"Wikipedia semantic route applied: lead, TOC, infobox, sections, references, media, and nav are preserved as separate layout groups."});const u=o(((q=document.querySelector("#firstHeading"))==null?void 0:q.textContent)||document.title),t=[];for(const i of Array.from(n.children)){if(i.matches("h2, .mw-heading2, #toc, .vector-toc, table.infobox"))break;if(i.matches("p")){const l=o(i.textContent||"");l.length>40&&t.push(l)}}t.length>0&&R({id:"wikipedia-lead",label:`${u} lead`,role:"lead",text:t.join(`

`),selectorHint:".mw-parser-output > p"});const a=document.querySelector('#toc, .vector-toc, [aria-label="Contents"]');if(a){const i=Array.from(a.querySelectorAll("a")).map(l=>o(l.textContent||"")).filter(Boolean).slice(0,80);R({id:"wikipedia-toc",label:"Table of contents",role:"toc",text:i.join(`
`),selectorHint:B(a)})}const E=n.querySelector("table.infobox");if(E){const i=o(E.textContent||"");R({id:"wikipedia-infobox",label:o(((Y=E.querySelector("caption, th"))==null?void 0:Y.textContent)||`${u} infobox`),role:"infobox",text:i,selectorHint:B(E)})}Array.from(n.querySelectorAll("h2, .mw-heading2")).forEach((i,l)=>{const g=o(i.textContent||"").replace(/\[edit\]$/i,"").trim();if(!g)return;const f=[];let y=i.nextElementSibling;for(;y&&!y.matches("h2, .mw-heading2");){if(y.matches("p, ul, ol, table, figure, .thumb, .reflist, ol.references")){const C=o(y.textContent||"");C.length>20&&f.push(C)}y=y.nextElementSibling}f.length>0&&R({id:`wikipedia-section-${l+1}`,label:g,role:/references|notes|bibliography|external links/i.test(g)?"references":"article_section",text:f.join(`

`).slice(0,6e3),selectorHint:B(i)})});const v=n.querySelector('.reflist, ol.references, section[aria-labelledby="References"]');if(v){const i=Array.from(v.querySelectorAll("li, cite")).map(l=>o(l.textContent||"")).filter(l=>l.length>10).slice(0,80);R({id:"wikipedia-references",label:"References",role:"references",text:i.join(`
`),selectorHint:B(v)})}const O=document.querySelector("#p-navigation, .vector-page-toolbar, nav[aria-label]");if(O){const i=Array.from(O.querySelectorAll("a, button")).map(l=>o(l.textContent||l.getAttribute("aria-label")||"")).filter(Boolean).slice(0,60).join(`
`);R({id:"wikipedia-nav",label:"Page navigation",role:"nav",text:i,selectorHint:B(O)})}const _=new Set(h.map(i=>`${i.src||""}:${i.alt||""}`));n.querySelectorAll("figure, .thumb, .mw-file-description").forEach((i,l)=>{var Z;const g=i.querySelector("img"),f=(g==null?void 0:g.currentSrc)||(g==null?void 0:g.getAttribute("src"))||(g==null?void 0:g.getAttribute("srcset"))||void 0,y=(g==null?void 0:g.getAttribute("alt"))||void 0,C=o(((Z=i.querySelector("figcaption, .thumbcaption"))==null?void 0:Z.textContent)||(g==null?void 0:g.getAttribute("title"))||""),z=`${f||""}:${y||C}`;if(!f||_.has(z))return;_.add(z);const H=lt(),I=B(i),nt=`wikipedia-media-${l+1}`;h.push({id:nt,type:"image",alt:y,caption:C||void 0,src:f,selectorHint:I,sourceOrder:H}),R({id:`${nt}-group`,label:C||y||"Wikipedia media",role:"media",text:C||y||f,selectorHint:I,sourceOrder:H})})}function St(){if(r.length!==0)return r[r.length-1].id}function U(n,u){var _,q,Y;if(P)return;if(M++,M>D){P||(P=!0,w.push({type:"node_limit",message:`Page size limit exceeded (processed over ${D} nodes). Extraction has been capped.`,details:`Processed nodes: ${M}`}));return}if(n.nodeType!==Node.ELEMENT_NODE){n.childNodes.forEach(i=>U(i,u));return}const t=n,a=t.tagName.toLowerCase(),E=F(t,Q);if(["script","style","noscript","template","head","meta","link","title"].includes(a)){k++;return}if(!E&&F(t,J)){k++;return}if(!E&&!Lt(t)){k++;return}T++,x++;const A=t.getAttribute("id")||`visor-el-${x}`,v=B(t);if(at(t,a)){const i=o(t.textContent||""),l=t.getAttribute("aria-label")||t.getAttribute("title")||"",g=o(((_=t.querySelector("h1, h2, h3, h4, h5, h6"))==null?void 0:_.textContent)||""),f=i.split(new RegExp("(?<=[.!?])\\s+"))[0]||i;b.push({id:`${A}-group`,label:o(l||g||f.slice(0,80)),role:st(t,a),text:i,selectorHint:v,sourceOrder:x,childActionIds:tt(d,v),childMediaIds:tt(h,v)})}const O=a.match(/^h([1-6])$/);if(O){const i=parseInt(O[1]),l=o(t.textContent||"");if(l){const g={id:A,text:l,level:i,selectorHint:v,sourceOrder:x};r.push(g),u=A}}else if(a==="pre"||a==="code"){if(!(a==="code"&&((q=t.parentElement)==null?void 0:q.tagName.toLowerCase())==="pre")){const i=t.textContent||"";i.trim()&&c.push({id:A,text:i,selectorHint:v,sourceOrder:x,parentHeadingId:u});return}}else if(a==="table"){const i=[],l=[];let g;const f=t.querySelector("caption");f&&(g=o(f.textContent||"")),t.querySelectorAll("th").forEach(y=>{const C=o(y.textContent||"");C&&i.push(C)}),t.querySelectorAll("tr").forEach(y=>{const C=[];y.querySelectorAll("th, td").forEach(z=>{const H=o(z.textContent||"");H&&C.push(H)}),C.length>0&&l.push(C)}),$.push({id:A,caption:g,headers:i,rows:l,selectorHint:v,sourceOrder:x});return}else if(["img","video","audio","canvas","svg"].includes(a)){const i=a==="img"||a==="svg"?"image":a,l=t,g=t.getAttribute("alt")||t.getAttribute("aria-label")||void 0,f=l.currentSrc||t.getAttribute("src")||t.getAttribute("data-src")||t.getAttribute("srcset")||t.getAttribute("data-srcset")||void 0,y=t.getAttribute("title")||void 0;h.push({id:A,type:i,alt:g,caption:y,src:f,selectorHint:v,sourceOrder:x}),a==="canvas"&&w.push({type:"canvas_only",message:"Page contains a Canvas element. Graphic contents inside Canvas are unreadable as HTML DOM."})}else if(a==="form"){const i=[],l=[];t.querySelectorAll("input, select, textarea, button").forEach((f,y)=>{const C=f.getAttribute("id")||`form-ctrl-${x}-${y}`,z=f.getAttribute("name")||void 0,H=f.tagName.toLowerCase(),I=f.getAttribute("type")||"text",nt=f.hasAttribute("required"),Z=f.hasAttribute("disabled"),$t=f.getAttribute("placeholder")||void 0;let X=V.get(f.getAttribute("id")||"")||void 0;if(!X){const W=f.closest("label");W&&(X=o(W.textContent||""))}if(X||(X=f.getAttribute("aria-label")||f.getAttribute("title")||void 0),H==="button"||["submit","button","image","reset"].includes(I)){const W=X||o(f.textContent||"")||I;l.push({id:C,type:"button",label:W,selectorHint:B(f),textContext:o(f.textContent||""),disabled:Z,sourceOrder:x})}else{let W=f.value||void 0;(I==="password"||I==="one-time-code"||f.getAttribute("autocomplete")==="one-time-code")&&(W=void 0),i.push({id:C,name:z,type:I,label:X,placeholder:$t,required:nt,disabled:Z,value:W})}}),L.push({id:A,selectorHint:v,label:t.getAttribute("aria-label")||t.getAttribute("name")||void 0,fields:i,submitControls:l,sourceOrder:x})}else if(a==="button"||t.getAttribute("role")==="button"||a==="input"&&["button","submit","image"].includes(t.getAttribute("type")||"")){const i="button",l=G(t)||"Button",g=t.hasAttribute("disabled");d.push({id:A,type:i,label:l,selectorHint:v,textContext:o(t.textContent||""),disabled:g,sourceOrder:x})}else if(a==="a"&&t.hasAttribute("href")){const i=t.getAttribute("href")||"",l=o(t.textContent||""),g=t.getAttribute("title")||void 0,f=t.getAttribute("rel")||void 0;t.getAttribute("role")==="button"?d.push({id:A,type:"button",label:l||g||"Link Button",selectorHint:v,textContext:l,sourceOrder:x}):p.push({id:A,text:l||i,href:i,title:g,rel:f,selectorHint:v,sourceOrder:x})}else if(["p","span","li","article","section","div","td","blockquote"].includes(a)){const i=S(t,a);i.length>3&&c.push({id:A,text:i,selectorHint:v,sourceOrder:x,parentHeadingId:u||St()});const l=Ct(t);l&&h.push({id:`${A}-background`,type:"image",alt:t.getAttribute("aria-label")||void 0,caption:t.getAttribute("title")||void 0,src:l,selectorHint:v,sourceOrder:x})}if(t.shadowRoot&&(w.push({type:"shadow_dom",message:"Shadow DOM encountered and traversed."}),j(t.shadowRoot),t.shadowRoot.childNodes.forEach(i=>U(i,u))),a==="iframe")try{const i=t,l=i.contentDocument||((Y=i.contentWindow)==null?void 0:Y.document);l?(j(l),l.childNodes.forEach(g=>U(g,u))):w.push({type:"iframe",message:"Cross-origin iframe detected. Content is restricted due to browser same-origin policies.",details:`Source: ${i.src||"about:blank"}`})}catch(i){w.push({type:"iframe",message:"Iframe access blocked. Same-origin validation failed.",details:i.message||i})}t.childNodes.forEach(i=>U(i,u))}let et=document.body;const ot=(gt=e.siteProfile)==null?void 0:gt.mainContentSelector;if(ot)try{et=document.querySelector(ot)||document.body,et===document.body&&w.push({type:"other",message:"Site profile main content selector did not match. Falling back to document body.",details:ot})}catch{w.push({type:"other",message:"Invalid site profile main content selector. Falling back to document body.",details:ot})}et&&U(et),Et();const kt=performance.now()-s;return{schemaVersion:"page_snapshot.v1",source:{url:window.location.href,canonicalUrl:((ft=document.querySelector('link[rel="canonical"]'))==null?void 0:ft.getAttribute("href"))||void 0,title:document.title,capturedAt:new Date().toISOString(),language:document.documentElement.lang||void 0},metadata:{generator:"Visor DOM Extractor v0.1.0",userAgent:navigator.userAgent,semanticRoute:dt()?"wikipedia_article":"generic"},headings:r,textBlocks:c,links:p,actions:d,layoutGroups:At(),forms:L,tables:$,media:h,stats:{totalNodes:M,extractedNodes:T,ignoredNodes:k,timeElapsedMs:kt},warnings:w}}const ct="pendingAgentExport",Tt=5*60*1e3,Pt=25*1e3,Nt=500,ht={chatgpt:["chatgpt.com","chat.openai.com"],grok:["grok.com"],gemini:["gemini.google.com"],claude:["claude.ai"]},Ot=["textarea:not([disabled])",'[contenteditable="true"]','[role="textbox"]',".ProseMirror"];function xt(e){const s=e.toLowerCase();return Object.keys(ht).find(r=>ht[r].some(c=>s===c||s.endsWith(`.${c}`)))}function qt(e,s=Date.now()){const r=Date.parse(e.createdAt);return Number.isFinite(r)&&s-r<=Tt}function It(e){const s=e.getBoundingClientRect(),r=window.getComputedStyle(e);return s.width>0&&s.height>0&&r.display!=="none"&&r.visibility!=="hidden"}function Bt(e=document){for(const s of Ot){const c=Array.from(e.querySelectorAll(s)).find(p=>It(p)?p instanceof HTMLTextAreaElement?!p.disabled&&!p.readOnly:p.isContentEditable||p.getAttribute("role")==="textbox":!1);if(c)return c}return null}function vt(e){e.dispatchEvent(new InputEvent("input",{bubbles:!0,inputType:"insertText"})),e.dispatchEvent(new Event("change",{bubbles:!0}))}function Dt(e,s){var d;if(e.focus(),e instanceof HTMLTextAreaElement||e instanceof HTMLInputElement)return e.value=s,vt(e),e.value===s;const r=window.getSelection(),c=document.createRange();return c.selectNodeContents(e),c.collapse(!1),r==null||r.removeAllRanges(),r==null||r.addRange(c),(!document.execCommand("insertText",!1,s)||((d=e.textContent)==null?void 0:d.trim())!==s.trim())&&(e.textContent=s),vt(e),(e.textContent||"").trim()===s.trim()}function Rt(){return new Promise(e=>{chrome.storage.local.get([ct],s=>{e(s[ct])})})}function _t(){return chrome.storage.local.remove(ct)}function Ht(e){return new Promise(s=>window.setTimeout(s,e))}async function Wt(){const e=xt(window.location.hostname);if(!e)return;const s=await Rt();if(!s||s.provider!==e||!qt(s))return;const r=Date.now();for(;Date.now()-r<=Pt;){const c=Bt();if(c&&Dt(c,s.text)){await _t(),console.info(`Visor inserted context into ${e}. Review it before sending.`);return}await Ht(Nt)}}const rt={chatgpt:"GPT",grok:"Grok",gemini:"Gemini",claude:"Claude"},Vt={chatgpt:"llm-chatgpt.png",grok:"llm-grok.png",gemini:"llm-gemini.png",claude:"llm-claude.png"};let K;function jt(){return window.top!==window.self||xt(window.location.hostname)||document.documentElement.dataset.visorWidgetMounted==="true"?!1:!/^chrome:|^chrome-extension:|^about:|^devtools:/i.test(window.location.href)}function Gt(e,s){return new Promise(r=>{chrome.runtime.sendMessage({type:"VISOR_EXPORT_ACTIVE_TAB_TO_AGENT",payload:{provider:e,request:s}},c=>{if(chrome.runtime.lastError){r({ok:!1,userMessage:chrome.runtime.lastError.message||"Export failed."});return}r(c||{ok:!1,userMessage:"Export failed."})})})}function zt(){const e=document.createElement("style");return e.textContent=`
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
      width: 24px;
      height: 24px;
      left: 11px;
      top: 11px;
      background: var(--visor-green);
      color: #001409;
      font: 700 18px/1 Inter, ui-sans-serif, system-ui, sans-serif;
      opacity: 0;
      pointer-events: none;
      transform: translate(-28px, -28px) scale(0.7);
    }

    .visor-widget.open .visor-close {
      opacity: 1;
      pointer-events: auto;
      transform: translate(-34px, -34px) scale(1);
    }

    .visor-widget.open .visor-actions:hover .visor-action {
      transform: translate(calc(var(--x) * 0.82), calc(var(--y) * 0.82)) scale(0.74);
      opacity: 0.78;
    }

    .visor-widget.open .visor-actions:hover .visor-action:hover {
      transform: translate(calc(var(--x) * 0.92), calc(var(--y) * 0.92)) scale(1.18);
      opacity: 1;
      z-index: 2;
    }

    .visor-action img {
      width: 100%;
      height: 100%;
      display: block;
      border-radius: 999px;
      object-fit: cover;
      pointer-events: none;
    }

    .visor-action[disabled] {
      cursor: wait;
      opacity: 0.62;
    }

    .visor-widget.dragging .visor-main {
      cursor: grabbing;
    }
  `,e}async function yt(){K==null||K.remove(),K=void 0,delete document.documentElement.dataset.visorWidgetMounted}async function wt(){if(!jt())return;const s=(await chrome.storage.local.get(["settings"])).settings||{};if(s.widgetEnabled===!1)return;document.documentElement.dataset.visorWidgetMounted="true";const r={open:!1,mode:s.defaultMode||"agent_action",privacyLevel:s.privacyLevel||"medium",tokenBudget:s.tokenBudget||4e3},c=document.createElement("div");c.id="visor-floating-widget-root",K=c;const p=c.attachShadow({mode:"open"}),d=document.createElement("div");d.className="visor-widget";const b=document.createElement("button");b.className="visor-main",b.type="button",b.title="Open Visor agent export widget",b.setAttribute("aria-label","Open Visor agent export widget");const L=document.createElement("img");L.src=chrome.runtime.getURL("visor-logo.png"),L.alt="",b.appendChild(L);const $=document.createElement("div");$.className="visor-actions";const h=document.createElement("button");h.className="visor-close",h.type="button",h.title="Hide Visor widget",h.setAttribute("aria-label","Hide Visor widget"),h.textContent="×",h.addEventListener("click",async o=>{o.stopPropagation();const S=(await chrome.storage.local.get(["settings"])).settings||{};await chrome.storage.local.set({settings:{...S,widgetEnabled:!1}}),await yt()});const w={chatgpt:[-40,-2],grok:[-34,-38],gemini:[0,-54],claude:[34,-38]},M=new Map,T=()=>{const o=d.getBoundingClientRect(),m=o.left<76?-1:1,S=o.top<76?-1:1;M.forEach((N,G)=>{const[st,at]=w[G];N.style.setProperty("--x",`${st*m}px`),N.style.setProperty("--y",`${at*S}px`)})};Object.keys(rt).forEach(o=>{const m=document.createElement("button");m.className="visor-action",m.type="button",m.title=`Dump current page context to ${rt[o]}`,m.setAttribute("aria-label",`Dump current page context to ${rt[o]}`),m.style.setProperty("--x",`${w[o][0]}px`),m.style.setProperty("--y",`${w[o][1]}px`),M.set(o,m);const S=document.createElement("img");S.src=chrome.runtime.getURL(Vt[o]),S.alt="",m.appendChild(S),m.addEventListener("click",async N=>{N.stopPropagation(),r.exporting=o,k();const G=await Gt(o,{mode:r.mode,privacyLevel:r.privacyLevel,tokenBudget:r.tokenBudget});r.exporting=void 0,m.title=G.ok?`Opened ${rt[o]}`:G.userMessage||"Export failed",k()}),$.appendChild(m)});function k(){T(),d.classList.toggle("open",r.open),$.querySelectorAll(".visor-action").forEach(o=>{o.disabled=!!r.exporting})}const x=async()=>{const m=(await chrome.storage.local.get(["visorWidgetPosition"])).visorWidgetPosition;if(typeof(m==null?void 0:m.left)!="number"||typeof(m==null?void 0:m.top)!="number")return;const S=Math.min(Math.max(8,m.left),Math.max(8,window.innerWidth-54)),N=Math.min(Math.max(8,m.top),Math.max(8,window.innerHeight-54));d.style.left=`${S}px`,d.style.top=`${N}px`,d.style.right="auto",d.style.bottom="auto",T()};let D,P=!1,V=!1,j=0,J=0;const Q=async()=>{if(D&&(window.clearTimeout(D),D=void 0),!P)return;P=!1,d.classList.remove("dragging");const o=d.getBoundingClientRect();await chrome.storage.local.set({visorWidgetPosition:{left:o.left,top:o.top}})};b.addEventListener("pointerdown",o=>{if(o.button!==0)return;const m=d.getBoundingClientRect();j=o.clientX-m.left,J=o.clientY-m.top,D=window.setTimeout(()=>{P=!0,V=!0,r.open=!1,d.classList.add("dragging"),k(),b.setPointerCapture(o.pointerId)},260)}),b.addEventListener("pointermove",o=>{if(!P)return;const m=Math.min(Math.max(8,o.clientX-j),Math.max(8,window.innerWidth-d.offsetWidth-8)),S=Math.min(Math.max(8,o.clientY-J),Math.max(8,window.innerHeight-d.offsetHeight-8));d.style.left=`${m}px`,d.style.top=`${S}px`,d.style.right="auto",d.style.bottom="auto",T()}),b.addEventListener("pointerup",()=>{Q()}),b.addEventListener("pointercancel",()=>{Q()}),b.addEventListener("click",o=>{if(o.stopPropagation(),V){V=!1;return}r.open=!r.open,k()}),document.addEventListener("keydown",o=>{o.key==="Escape"&&r.open&&(r.open=!1,k())}),p.append(zt(),d),d.append($,h,b),k(),x();const F=()=>{document.body.contains(c)||document.body.appendChild(c)};document.body?F():window.addEventListener("DOMContentLoaded",F,{once:!0})}Wt();wt();chrome.runtime.onMessage.addListener((e,s,r)=>{var c;if(e.type==="VISOR_EXTRACT_DOM")try{const p=e.payload.settings,d=Mt(p);r({ok:!0,snapshot:d})}catch(p){console.error("Visor content script extraction failed:",p),r({ok:!1,error:p.message||p})}return e.type==="VISOR_WIDGET_SET_ENABLED"&&(!!((c=e.payload)!=null&&c.enabled)?wt():yt()).then(()=>{r({ok:!0})}),!0});console.log("Visor Content Script Active");
