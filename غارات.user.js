// ==UserScript==
// @name         غارات

// @match        https://*.tribalwars.ae/game.php?*&screen=place&mode=scavenge
// @match        https://*.tribalwars.ae/game.php?*&screen=place&mode=scavenge&
// @grant        none
// ==/UserScript==



(function() {
  var scavengeUnits1 = { spear: 150, sword: 20, axe: 0, archer: 0, light: 100, marcher: 0, heavy: 0 };
  var scavengeUnits2 = { spear: 200, sword: 70, axe: 0, archer: 0, light: 150, marcher: 0, heavy: 0 };
  var scavengeUnits3 = { spear: 300, sword: 300, axe: 0, archer: 0, light: 300, marcher: 0, heavy: 0 };
  var scavengeUnits4 = { spear: 400, sword: 400, axe: 0, archer: 0, light: 800, marcher: 0, heavy: 0 };

        setTimeout(function() {

  for (var u in scavengeUnits1) {
    var availableUnits = Number($('.units-entry-all[data-unit="' + u + '"]').text().match(/\d+/));
   $('.unitsInput[name="' + u + '"]').val(availableUnits < scavengeUnits1[u] ? availableUnits : scavengeUnits1[u]).change();
       }


      $('a.btn.btn-default.free_send_button')[3].click();
    }, 250);



        setTimeout(function() {
  for (var u in scavengeUnits2) {
    var availableUnits = Number($('.units-entry-all[data-unit="' + u + '"]').text().match(/\d+/));
      $('.unitsInput[name="' + u + '"]').val(availableUnits < scavengeUnits2[u] ? availableUnits : scavengeUnits2[u]).change();
       }


      $('a.btn.btn-default.free_send_button')[2].click();
    }, 500);



    setTimeout(function() {
  for (var u in scavengeUnits3) {
    var availableUnits = Number($('.units-entry-all[data-unit="' + u + '"]').text().match(/\d+/));
      $('.unitsInput[name="' + u + '"]').val(availableUnits < scavengeUnits3[u] ? availableUnits : scavengeUnits3[u]).change();
       }


      $('a.btn.btn-default.free_send_button')[1].click();
    }, 750);




    setTimeout(function() {
  for (var u in scavengeUnits4) {
    var availableUnits = Number($('.units-entry-all[data-unit="' + u + '"]').text().match(/\d+/));
      $('.unitsInput[name="' + u + '"]').val(availableUnits < scavengeUnits4[u] ? availableUnits : scavengeUnits4[u]).change();
       }


      $('a.btn.btn-default.free_send_button')[0].click();
    }, 1000);




        setTimeout(function() {
      if (!$('#village_switch_right').length) {
        location.href = document.URL;
      } else {
        location.href = $('#village_switch_right').attr('href');
      }
    }, 1300);
})();