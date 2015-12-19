angular.module('trinibiz.routes', []).

config(function($stateProvider, $urlRouterProvider, $ionicFilterBarConfigProvider) {
  $stateProvider

    .state('app', {
      cache: false,
      url: '/app',
      //abstract: true,
      templateUrl: 'templates/menu.html',
      controller: 'MenuCtrl',
      resolve : {
        'acl' : ['$q', 'AclService','AppViews', function($q, AclService,AppViews){
          if(AclService.can(AppViews.menu)){
            // Has proper permissions
            return true;
          } else {
            // Does not have permission
            return $q.reject('Unauthorized');
          }
        }]
      }
    })
    .state('app.categories', {
      url: "/categories",
      views: {
        'menuContent': {
          templateUrl: "templates/categories.html",
          controller: 'AppController'
        }
      },
      resolve : {
        'acl' : ['$q', 'AclService','AppViews', function($q, AclService,AppViews){
          if(AclService.can(AppViews.categories)){
            // Has proper permissions
            return true;
          } else {
            // Does not have permission
            return $q.reject('Unauthorized');
          }
        }]
      }
    })
    .state('app.businesses', {
      url: "/businesses/:categoryId?categoryName",
      views: {
        'menuContent': {
          templateUrl: "templates/businesses.html",
          controller: 'BusinessListCtrl'
        }
      },
      resolve : {
        'acl' : ['$q', 'AclService','AppViews', function($q, AclService,AppViews){
          if(AclService.can(AppViews.businesses)){
            // Has proper permissions
            return true;
          } else {
            // Does not have permission
            return $q.reject('Unauthorized');
          }
        }]
      }
    })
    .state('app.userbusinesses', {
      url: "/businesses/:categoryId?/:categoryName/:ownerBusinesses?",
      views: {
        'menuContent': {
          templateUrl: "templates/businesses.html",
          controller: 'BusinessListCtrl'
        }
      },
      resolve : {
        'acl' : ['$q', 'AclService','AppViews', function($q, AclService,AppViews){
          if(AclService.can(AppViews.businesses)){
            // Has proper permissions
            return true;
          } else {
            // Does not have permission
            return $q.reject('Unauthorized');
          }
        }]
      }
    })
    .state('app.allbusinesses', {
      url: "/businesses",
      views: {
        'menuContent': {
          templateUrl: "templates/businesses.html",
          controller: 'BusinessListCtrl'
        }
      },
      resolve : {
        'acl' : ['$q', 'AclService','AppViews', function($q, AclService,AppViews){
          if(AclService.can(AppViews.businesses)){
            // Has proper permissions
            return true;
          } else {
            // Does not have permission
            return $q.reject('Unauthorized');
          }
        }]
      }
    })
    .state('app.signup', {
      url: '/signup',
      views: {
        'menuContent': {
          templateUrl: 'templates/signup.html',
          controller: 'RegistrationCtrl',
          controllerAs: 'registration'
        }
      },
      resolve : {
        'acl' : ['$q', 'AclService','AppViews', function($q, AclService,AppViews){
          if(AclService.can(AppViews.signup)){
            // Has proper permissions
            return true;
          } else {
            // Does not have permission
            return $q.reject('Unauthorized');
          }
        }]
      }
    })
    .state('app.login', {
      url: '/login',
      views: {
        'menuContent': {
          templateUrl: 'templates/login.html',
          controller: 'LoginCtrl',
          controllerAs: 'LOGIN'
        }
      },
      resolve : {
        'acl' : ['$q', 'AclService','AppViews', function($q, AclService,AppViews){
          if(AclService.can(AppViews.login)){
            // Has proper permissions
            return true;
          } else {
            // Does not have permission
            return $q.reject('Unauthorized');
          }
        }]
      }
    })
    .state('app.profile', {
      url: "/profile",
      views: {
        'menuContent': {
          templateUrl: "templates/myCenter.html",
          controller: "ProfileCtrl"
        }
      },
      resolve : {
        'acl' : ['$q', 'AclService','AppViews', function($q, AclService,AppViews){
          if(AclService.can(AppViews.profile)){
            // Has proper permissions
            return true;
          } else {
            // Does not have permission
            return $q.reject('Unauthorized');
          }
        }]
      }
    }).state('app.noresults', {
      url: "/noresults",
      views: {
        'menuContent': {
          templateUrl: "templates/no-results.html",
          //controller: "AppController"
        }
      },
      resolve : {
        'acl' : ['$q', 'AclService','AppViews', function($q, AclService,AppViews){
          if(AclService.can(AppViews.noresults)){
            // Has proper permissions
            return true;
          } else {
            // Does not have permission
            return $q.reject('Unauthorized');
          }
        }]
      }
    });
  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/app/categories');
});
