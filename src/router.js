var root = null;
var useHash = true; // Defaults to: false
var hash = '#!'; // Defaults to: '#'
var router = new Navigo(root, useHash, hash);

router
  .on({
    'jetzt-losgehen': function () {
      setContent('jetzt-losgehen');
    },
    '*': function () {
      setContent('home')
    }
  })
  .resolve();

function setContent(area) {
  console.log(area);
  $('section.route-active').removeClass('route-active').addClass('route-inactive');
  $('section#' + area).removeClass('route-inactive').addClass('route-active');
}
