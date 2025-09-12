/* Namespaced collapsible nav JS — exposes initCollapsibleNav(options)
   Usage: gooneeCollapsibleNav.init({idPrefix:'goonee'}); */
(function(window,document){
  const gooneeCollapsibleNav = {
    init(opts){
      const prefix = (opts && opts.idPrefix) || 'goonee';
      // find all toggle buttons that opt-in via data-goonee-toggle attribute
      const toggles = document.querySelectorAll('[data-'+prefix+'-toggle]');
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
        });
      });
    }
  };
  window.gooneeCollapsibleNav = gooneeCollapsibleNav;
})(window,document);
