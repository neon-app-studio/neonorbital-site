(function(){
  var KEY='dw-lang', html=document.documentElement;
  function setLang(l){
    html.lang=l; try{localStorage.setItem(KEY,l)}catch(e){}
    document.querySelectorAll('.lang button').forEach(function(b){b.setAttribute('aria-pressed',String(b.dataset.lang===l))});
    document.querySelectorAll('[data-ph-en]').forEach(function(el){el.placeholder=el.getAttribute('data-ph-'+l)||''});
    document.querySelectorAll('option[data-ja]').forEach(function(o){if(!o.dataset.en)o.dataset.en=o.textContent;o.textContent=l==='ja'?o.dataset.ja:o.dataset.en});
    var t=document.querySelector('meta[name=title-'+l+']'); if(t)document.title=t.content;
  }
  var q=new URLSearchParams(location.search).get('lang'), saved=null;
  try{saved=localStorage.getItem(KEY)}catch(e){}
  setLang(q==='ja'||q==='en'?q:(saved||((navigator.language||'').indexOf('ja')===0?'ja':'en')));
  document.querySelectorAll('.lang button').forEach(function(b){b.addEventListener('click',function(){setLang(b.dataset.lang)})});
  var f=document.getElementById('book-form');
  if(f){f.addEventListener('submit',function(ev){
    ev.preventDefault();
    if(!f.reportValidity())return;
    var d=new FormData(f),lines=[];
    d.forEach(function(v,k){if(v)lines.push(k+': '+v)});
    var to=f.dataset.email, subj=encodeURIComponent('Booking request / ご予約のお問い合わせ – '+(d.get('Name')||''));
    window.location.href='mailto:'+to+'?subject='+subj+'&body='+encodeURIComponent(lines.join('\n'));
    var ok=document.getElementById('sent'); if(ok){ok.hidden=false; ok.focus();}
  });}
})();
