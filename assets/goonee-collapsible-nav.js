// Namespaced collapsible nav JS — exposes initCollapsibleNav(options)
// @ts-check
(function(window, document) {
  'use strict';
  
  // Type declarations
  /** @typedef {Object} GooneeNavMethods
   * @property {() => void} open - Opens the nav panel
   * @property {() => void} close - Closes the nav panel
   */
  
  /** @typedef {HTMLElement & { goonee?: GooneeNavMethods }} GooneeToggleButton */
  const gooneeCollapsibleNav = {
    init(opts){
      const prefix = (opts && opts.idPrefix) || 'goonee';
      // find all toggle buttons that opt-in via data-goonee-toggle attribute
      // @ts-ignore - We know these are buttons with our custom data attributes
      const toggles = /** @type {NodeListOf<GooneeToggleButton>} */ (document.querySelectorAll('[data-'+prefix+'-toggle]'));
      toggles.forEach((btn) => {
        const target = btn.getAttribute('data-'+prefix+'-target');
        if (!target) return;
        
        const panel = document.getElementById(target);
        if (!panel) return;
        
        const overlayId = btn.getAttribute('data-'+prefix+'-overlay');
        const overlay = overlayId ? document.getElementById(overlayId) : null;
        if(!panel) return;
        const openClass = 'goonee-open';
        const overlayVisible = 'goonee-visible';

        function open(){
          if (!panel) return; // Additional safety check
          panel.classList.add(openClass);
          if(overlay) overlay.classList.add(overlayVisible);
          btn.setAttribute('aria-expanded','true');
          panel.setAttribute('aria-hidden','false');
        }
        function close(){
          if (!panel) return; // Additional safety check
          panel.classList.remove(openClass);
          if(overlay) overlay.classList.remove(overlayVisible);
          btn.setAttribute('aria-expanded','false');
          panel.setAttribute('aria-hidden','true');
        }

        btn.addEventListener('click',()=>{
          if(panel.classList.contains(openClass)) close(); else open();
        });
        if(overlay){overlay.addEventListener('click',close)}

        // close button inside panel
        const closeBtn = panel.querySelector('.'+prefix+'-cnav-close');
        if (closeBtn) {
          closeBtn.addEventListener('click', close);
        }

        // close on Escape when focused inside panel
        panel.addEventListener('keydown',e=>{
          if(e.key==='Escape') close();
        });

        // expose dataset methods for external control
        // @ts-ignore - Adding methods to button element
        btn.goonee = { open, close };
      });
      // submenu toggles (data-goonee-subtoggle -> aria controls a sublist id)
      const subtoggles = document.querySelectorAll('[data-'+prefix+'-subtoggle]');
      subtoggles.forEach(st=>{
        const subTarget = st.getAttribute('data-'+prefix+'-subtarget');
        if (!subTarget) return;
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
  // @ts-ignore - Attach to window for global access
  window.gooneeCollapsibleNav = gooneeCollapsibleNav;
})(window,document);
