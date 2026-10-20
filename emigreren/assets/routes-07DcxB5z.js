import{n as e,r as t,t as n}from"./index-DC_4gOmB.js";var r=t(e()),i=n(),a=`
<header class="app-header">
  <div class="header-row">
    <div class="brand">
      <span class="mark" aria-hidden="true">
        <svg width="36" height="36" viewBox="0 0 20 20" fill="none">
          <circle cx="10" cy="10" r="7.2" stroke="var(--primary-fg)" stroke-width="1.4"/>
          <ellipse cx="10" cy="10" rx="3.2" ry="7.2" stroke="var(--primary-fg)" stroke-width="1.3"/>
          <path d="M2.8 10h14.4M4 6.4h12M4 13.6h12" stroke="var(--primary-fg)" stroke-width="1.3" stroke-linecap="round"/>
        </svg>
      </span>
      <h1>Emigreren</h1>
    </div>
    <div class="header-meta">
      <button class="tab-icon" id="reload-app" type="button" title="Vernieuwen" aria-label="Vernieuwen">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M21 12a9 9 0 1 1-2.2-5.8"/>
          <path d="M21 3v6h-6"/>
        </svg>
      </button>
      <button class="icon-btn" id="theme-toggle" type="button" aria-label="Thema">
        <svg class="icon-sun" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75">
          <circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>
        </svg>
        <svg class="icon-moon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" style="display:none">
          <path d="M21 14.3A8.5 8.5 0 1 1 9.7 3a7 7 0 0 0 11.3 11.3z"/>
        </svg>
      </button>
    </div>
  </div>
  <nav class="tabs">
    <button data-tab="plan" class="active">Stappenplan</button>
    <button data-tab="lijst">Afvinklijst</button>
    <button data-tab="fiscaal">Fiscaal</button>
    <button data-tab="mail">E-maillijst</button>
    <button data-tab="sociaal">Mensen</button>
    <span class="tab-actions">
      <button class="tab-reset" id="reset-data" type="button">Wissen</button>
    </span>
  </nav>
</header>
<main id="view"><section class="grid-2"><article class="card card-plan"><h2>Stappenplan</h2><p class="muted">Kies eerst een bestemming in het dossier. Taken en e-mails volgen daarna het land.</p></article><article class="card card-dossier"><h2>Jouw dossier</h2><p class="muted">Deze gegevens vullen de e-mails. Alles blijft in deze browser.</p></article></section></main>
<p class="site-footer"><a href="https://www.willemvroom.nl" target="_blank" rel="noopener">willemvroom.nl</a></p>
`;function o(e){return new Promise((t,n)=>{if(document.querySelector(`script[data-emig="${e}"]`)){t();return}let r=document.createElement(`script`);r.src=e,r.dataset.emig=e,r.onload=()=>t(),r.onerror=()=>n(Error(e)),document.body.appendChild(r)})}function s(){return(0,r.useEffect)(()=>{let e=window,t=`laadt-weer`;e.__emigrerenBooted!==t&&(e.__emigrerenBooted=t,o(`/emigreren/emigreren/data.js?v=186`).then(()=>o(`/emigreren/emigreren/fiscal.js?v=186`)).then(()=>o(`/emigreren/emigreren/app.js?v=186`)).catch(e=>{let t=document.getElementById(`view`);t&&(t.textContent=String(e))}))},[]),(0,i.jsx)(`div`,{dangerouslySetInnerHTML:{__html:a}})}export{s as component};