//==UserScript==
// @name Venom +++
// @author  MusaaD.Sa
// @include https://aep6.tribalwars.ae/game.php?village=2429&screen=snob
// @include https://aep6.tribalwars.ae/game.php?screen=snob&village=*
// @include https://aep6.tribalwars.ae/game.php?t=616982&village=491&screen=snob
// @include https://aep6.tribalwars.ae/game.php?village=*&screen=snob
// @include https://aep6.tribalwars.ae/game.php?screen=snob&t=*&village=*
// @include https://aep6.tribalwars.ae/game.php?t=1653663&village=2453&screen=snob
// @include https://aep6.tribalwars.ae/game.php?t=1654859&village=28&screen=snob
// @include https://aep6.tribalwars.ae/game.php?t=*&village=*&screen=snob
// @include
// @include
// @include

// ==/UserScript==

javascript:
var rand = function()
{

return 200;
},
prägen = function () {
setTimeout(function ()
{
var leer = $(".vis").find("[id^=coin_mint_fill_max]");
if(leer[0] != null){
leer[0].click();
leer[0].nextElementSibling.click();
}
setTimeout(function () {
location.reload();
},5000);
}, rand());
};
prägen();