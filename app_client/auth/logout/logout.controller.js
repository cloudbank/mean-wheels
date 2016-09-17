(function () {

  angular
  .module('meanApp')
  .controller('logoutCtrl', logoutCtrl);

  loginCtrl.$inject = ['$location', '$window'];
  function logoutCtrl($location, $window) {
    
    $window.localStorage.clear();
    $location.path('home');

  }

})();