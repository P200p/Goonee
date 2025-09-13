/* Namespaced collapsible nav JS — exposes initCollapsibleNav(options)
   Usage: gooneeCollapsibleNav.init({idPrefix:'goonee'}); */
(function(window,document){
  const gooneeCollapsibleNav = {
    init(opts){
      const prefix = (opts && opts.idPrefix) || 'goonee';
      console.log('[goonee] init prefix=', prefix);
      // find all toggle buttons that opt-in via data-goonee-toggle attribute
      const toggles = document.querySelectorAll('[data-'+prefix+'-toggle]');
      console.log('[goonee] found toggles:', toggles.length);
      toggles.forEach(btn=>{
        const target = btn.getAttribute('data-'+prefix+'-target');
        const panel = document.getElementById(target);
        const overlay = document.getElementById(btn.getAttribute('data-'+prefix+'-overlay'));
        if(!panel) return;
        const openClass = 'goonee-open';
        const overlayVisible = 'goonee-visible';

        function open(){
          panel.classList.add(openClass);
          if(overlay) overlay.classList.add(overlayVisible);
          btn.setAttribute('aria-expanded','true');
          panel.setAttribute('aria-hidden','false');
        }
        function close(){
          panel.classList.remove(openClass);
          if(overlay) overlay.classList.remove(overlayVisible);
          btn.setAttribute('aria-expanded','false');
          panel.setAttribute('aria-hidden','true');
        }

        btn.addEventListener('click',()=>{
          if(panel.classList.contains(openClass)) close(); else open();
        });
        if(overlay){overlay.addEventListener('click',close)}

        // close on Escape when focused inside panel
        panel.addEventListener('keydown',e=>{
          if(e.key==='Escape') close();
        });

        // expose dataset methods for external control
        btn.goonee = {open,close};
      });
      // submenu toggles (data-goonee-subtoggle -> aria controls a sublist id)
      const subtoggles = document.querySelectorAll('[data-'+(opts&&opts.idPrefix||'goonee')+'-subtoggle]');
      subtoggles.forEach(st=>{
        const subTarget = st.getAttribute('data-'+(opts&&opts.idPrefix||'goonee')+'-subtarget');
        const subList = document.getElementById(subTarget);
        if(!subList) return;
        st.setAttribute('aria-expanded','false');
        st.addEventListener('click',()=>{
          const isOpen = subList.classList.toggle('goonee-open');
          st.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
          // Keep aria-hidden on the sublist in sync for accessibility
          subList.setAttribute('aria-hidden', isOpen ? 'false' : 'true');
        });
      });
    }
  };
  window.gooneeCollapsibleNav = gooneeCollapsibleNav;
  // Auto-init when DOM is ready if script is included directly
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', ()=>{
      try{ window.gooneeCollapsibleNav.init && window.gooneeCollapsibleNav.init({idPrefix:'goonee'});}catch(e){}
    });
  } else {
    try{ window.gooneeCollapsibleNav.init && window.gooneeCollapsibleNav.init({idPrefix:'goonee'});}catch(e){}
  }
  // Delegated click handler as a fallback so toggles still work
  document.addEventListener('click', function(e){
    const btn = e.target.closest('[data-goonee-toggle]');
    if(btn){
      const prefix = 'goonee';
      const target = btn.getAttribute('data-'+prefix+'-target');
      const overlayId = btn.getAttribute('data-'+prefix+'-overlay');
      const panel = document.getElementById(target);
      const overlay = overlayId ? document.getElementById(overlayId) : null;
      if(!panel) return;
      const openClass = 'goonee-open';
      const overlayVisible = 'goonee-visible';
      if(panel.classList.contains(openClass)){
        panel.classList.remove(openClass);
        if(overlay) overlay.classList.remove(overlayVisible);
        btn.setAttribute('aria-expanded','false');
        panel.setAttribute('aria-hidden','true');
      } else {
        panel.classList.add(openClass);
        if(overlay) overlay.classList.add(overlayVisible);
        btn.setAttribute('aria-expanded','true');
        panel.setAttribute('aria-hidden','false');
      }
      return;
    }
    // overlay clicks close panels
    const ov = e.target.closest('.goonee-cnav-overlay');
    if(ov){
      document.querySelectorAll('.goonee-cnav-panel.goonee-open').forEach(p=>p.classList.remove('goonee-open'));
      document.querySelectorAll('.goonee-cnav-overlay.goonee-visible').forEach(o=>o.classList.remove('goonee-visible'));
      document.querySelectorAll('[data-goonee-toggle]').forEach(b=>b.setAttribute('aria-expanded','false'));
    }
    // close button inside panel
    const closeBtn = e.target.closest('.goonee-cnav-close');
    if(closeBtn){
      const panel = closeBtn.closest('.goonee-cnav-panel');
      if(panel){
        panel.classList.remove('goonee-open');
        panel.setAttribute('aria-hidden','true');
        const overlay = document.getElementById(panel.getAttribute('aria-labelledby')) || document.querySelector('.goonee-cnav-overlay.goonee-visible');
        if(overlay) overlay.classList.remove('goonee-visible');
        const toggle = document.querySelector('[data-goonee-target="'+panel.id+'"]');
        if(toggle) toggle.setAttribute('aria-expanded','false');
      }
    }
  }, false);

})(window,document);
