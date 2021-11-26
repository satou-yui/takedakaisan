$(".p-g-nav-openbtn").click(function () {
	$(this).toggleClass('active');
    $(".p-g-nav").toggleClass('panelactive');
});

$(".p-g-nav a").click(function () {
    $(".p-g-nav-openbtn").removeClass('active');
    $(".p-g-nav").removeClass('panelactive');
});