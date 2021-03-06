(function () {

  angular
  .module('meanApp')
  .controller('pwdResetCtrl', pwdResetCtrl);

  loginCtrl.$inject = ['$location', 'authentication'];
  function pwdResetCtrl($location, authentication) {
    var vm = this;

    vm.credentials = {
      email : "",
      password : ""
    };

    vm.onSubmit = function () {
      authentication
        .login(vm.credentials)
        .error(function(err){
          alert(err);
        })
        .then(function(){
          $location.path('profile');
        });
    };

  }

})();