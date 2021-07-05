let mainNav = document.getElementById('js-menu');
let navBarToggle = document.getElementById('js-hamburger-toggle');

navBarToggle.addEventListener('click', function () {
    
    mainNav.classList.toggle('active');
});

window.onscroll = scrollShowNav;
function scrollShowNav() {
   if (document.body.scrollTop > 35 || document.documentElement.scrollTop > 35) {
      document.getElementsByTagName("nav")[0].style.display = "none";
   } else {
      document.getElementsByTagName("nav")[0].style.display = "inline";
   }
}