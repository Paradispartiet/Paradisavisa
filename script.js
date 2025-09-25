<!-- legg nederst i hver HTML-side -->
<script>
  // Include header.html
  (function(){
    fetch('header.html').then(r=>r.text()).then(html=>{
      const holder=document.querySelector('#header-placeholder');
      if(holder){ holder.innerHTML=html; initNav(); }
    });
  })();

  function initNav(){
    const toggle=document.querySelector('.nav-toggle');
    const nav=document.querySelector('.site-nav');
    if(toggle && nav){
      toggle.addEventListener('click',()=>{
        const open=nav.classList.toggle('show');
        toggle.setAttribute('aria-expanded', open ? 'true':'false');
      });
    }
  }
</script>
