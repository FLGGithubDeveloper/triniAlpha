angular.module('trinibiz.services', [])

.factory('AppActions', function() {
    return {
      like: "like",
      review: "review",
      call: "call",
      email: "email",
      login: "login",
      signup: "signup",
    //  registerBiz: "registerBiz",
      logout: "logout",
      view_profile: "view_profile",
      view_settings: "view_settings",
      view_terms: "view_terms",
      view_invite: "view_invite"
    };
})

.factory('AppViews', function() {
    return {
      menu: "menu",
      business: "business",
      nobusinesses: "nobusinesses",
      profile: "profile",
      categories: "categories",
      signup: "signup",
      login: "login",
      settings: "settings",
      noresults: "noresults",
      terms: "terms",
      invite:"invite",
    //  registerBiz: "registerBiz",
      businessNames: "businessNames"
    }
})

.factory('RolesPermissions', ['USER_ROLES', 'AppViews', 'AppActions', function(USER_ROLES, AppViews, AppActions) {
    var abilities = {}
    abilities[USER_ROLES.user] = [AppViews.noresults,AppViews.nobusinesses, AppViews.menu, AppViews.business, AppViews.businessNames, AppViews.profile, AppViews.categories, AppViews.settings, AppViews.terms,AppViews.invite, /*AppViews.registerBiz,*/ AppActions.like,
      AppActions.review, AppActions.call, AppActions.email, AppActions.logout, AppActions.view_profile, AppActions.view_terms, AppActions.view_invite, /*AppActions.registerBiz*/
    ];
    abilities[USER_ROLES.owner] = [AppViews.noresults, AppViews.nobusinesses, AppViews.menu, AppViews.business, AppViews.businessNames, AppViews.profile, AppViews.categories, AppViews.settings, AppActions.like,AppViews.terms,AppViews.invite,
      AppActions.review, AppActions.call, AppActions.email, AppActions.logout, AppActions.view_profile, AppActions.view_terms, AppActions.view_invite
    ];
    abilities[USER_ROLES.sprovider] = [AppViews.noresults, AppViews.nobusinesses, AppViews.menu, AppViews.business, AppViews.businessNames, AppViews.profile, AppViews.categories, AppViews.settings, AppActions.like,AppViews.terms,AppViews.invite,
      AppActions.review, AppActions.call, AppActions.email, AppActions.logout, AppActions.view_profile, AppActions.view_terms, AppActions.view_invite
    ];
    abilities[USER_ROLES.guest] = [AppViews.noresults,AppViews.nobusinesses,AppViews.menu, AppViews.business, AppViews.businessNames, AppViews.categories, AppViews.signup, AppViews.login, AppViews.settings, AppViews.terms, AppViews.invite,
      AppActions.signup, AppActions.login, AppActions.call, AppActions.email, AppActions.view_terms, AppActions.view_invite
    ];
    return abilities;
}])

.value('ParseFactory' ,Parse)

.service ('ToastService',['ionicToast', function(ionicToast){
  var showToast = function(message){
    ionicToast.show(message, 'center', false, 2000);
  };

  var hideToast = function(){
    ionicToast.hide();
  };

  return{
    showToast: showToast,
    hideToast: hideToast
  }
}])

.service('UserService', ['$rootScope', 'AclService','ToastService', 'ParseFactory','USER_ROLES', function($rootScope, AclService,ToastService, ParseFactory,USER_ROLES) {
    var hasRole = AclService.hasRole;
    var flushRoles = AclService.flushRoles;
    var attachRole = AclService.attachRole;
    var getUser = function() {
      return $rootScope.sessionUser.user;
    }
    var getUserId = function(){
      return  $rootScope.sessionUser.userId;
    }

    var emailVerified = function(){
      var user = ParseFactory.User.current();
      return user.get("emailVerified");

    }
    var getUserRole = function(){
      return $rootScope.sessionUser.role;
    }
    var can = AclService.can;
    var setUser = function(user) {
      unsetUser();
      $rootScope.sessionUser.user = user.attributes;
    //  $rootScope.sessionUser.user.type = $rootScope.sessionUser.user.type || "service seeker";
      $rootScope.sessionUser.userId = user.id;
    }
    var unsetUser = function(){
      $rootScope.sessionUser = {};
    }
    var initialiseSession = function(user) {
      setUser(user);
      flushRoles();
      //attachRole(USER_ROLES.user);
      if(getUser().type == USER_ROLES.owner){
        attachRole(USER_ROLES.owner);
      }
      else{
        if(getUser().type == USER_ROLES.sprovider){
          attachRole(USER_ROLES.sprovider);
        }
        else{
            attachRole(USER_ROLES.user);
        }
      }

    }
    var logOut = function() {
      ParseFactory.User.logOut();
      unsetUser();//new function added
      flushRoles();
      attachRole(USER_ROLES.guest);
    }
    var login = function(username, password, success, error) {
      ParseFactory.User.logIn(username, password, {
        success: function(user) {
          ParseFactory.User.become(user.getSessionToken()).then(function(user) {
          //  if(user.get("emailVerified")){
              initialiseSession(user);
              success(user);
        //    }
          /*  else{
              alert("Please verify your email address to login");
            }*/

          }, function(error) {
            alert("The session was not initialised")
          });
        },
        error: function(user,error){
          alert('Error: '+error.message);
        }
      });
    }

    var isLoggedIn = function(){//new function used in isOwner function
      if(getUserRole() == USER_ROLES.user){
        return true;
      }
      return false;
    }

    var isOwner = function(){
      return AclService.hasRole(USER_ROLES.owner);

    }

    var isSProvider = function(){
      return AclService.hasRole(USER_ROLES.sprovider);

    }

    var isRegular = function(){
      return AclService.hasRole(USER_ROLES.user);

    }

    var register = function(firstname, lastname,username, password, email) {

      var user = new ParseFactory.User();
      user.set("firstName", firstname);
      user.set("lastName", lastname);
      user.set("username", username);
      user.set("password", password);
      user.set("email", email);
      user.set("type", "regular");

        return user.signUp(null,{
        success: function(user) {
      // Hooray! Let them use the app now.
        ToastService.showToast("Success!, you can now like and review businesses.");
      },
        error: function(user, error) {
        // Show the error message somewhere and let the user try again.
        alert("Error: " + error.code + " " + error.message);
      }
      });
    }

    var resetPassword = function(email) {
      ParseFactory.User.requestPasswordReset(email, {
        success: function() {
          alert("Password reset request was sent to " + email + ". Please check your email.");
        },
        error: function(error) {
          // Show the error message somewhere
          alert("Error: " + error.code + " " + error.message);
        }
      });
    }
    var loginFacebook = function() {
      ParseFactory.FacebookUtils.logIn(null, {
        success: function(user) {
          var message = "";
          console.log(user);
          if (!user.existed()) {
            message = "User signed up and logged in through Facebook!";
          //  alert();
          } else {
            message = "User logged in through Facebook!";
            //alert("User logged in through Facebook!");
          }
          initialiseSession(user);
          return message;
        },
        error: function(user, error) {
          var message = "User cancelled the Facebook login or did not fully authorize.";
          return message;
          //alert("User cancelled the Facebook login or did not fully authorize.");
        }
      });
    }
    var loginFacebookMobile = function() {
      $cordovaOauth.facebook(["public_profile", "email"]).then(function(success) {

        console.log(success);

        //Need to convert expiresIn format from FB to date
        var expiration_date = new Date();
        expiration.date.setSeconds(expiration_data.getSeconds() + success.authResponse.expiresIn);
        expiration_date = expiration__date.toISOString();

        var facebookAuthData = {
          "id": success.authResponse.userID,
          "access_token": success.authResponse.accessToken,
          "expiration_date": expiration_date
        };

        ParseFactory.FacebookUtils.logIn(facebookAuthData, {
          success: function(user) {
            console.log(user);
            if (!user.existed()) {
              alert("User signed up and logged in through Facebook!");
            } else {
              if (!ParseFactory.FacebookUtils.isLinked(user)) {
                ParseFactory.FacebookUtils.link(user, null, {
                  success: function(user) {
                    alert("Woohoo, user logged in with Facebook!");
                  },
                  error: function(user, error) {
                    alert("User cancelled the Facebook login or did not fully authorize.");
                  }
                });
              }
              //alert("User logged in through Facebook!");
            }
            initialiseSession(user);
          },
          error: function(user, error) {
            alert("User cancelled the Facebook login or did not fully authorize.");
          }
        });

      }, function(error) {
        console.log(error);
      });
    }
    return {
      hasRole: hasRole,
      getUser: getUser,
      getUserId: getUserId,
      emailVerified: emailVerified,
      setUser: setUser,
      unsetUser: unsetUser,
      isLoggedIn: isLoggedIn,
      flushRoles: flushRoles,
      attachRole: attachRole,
      isOwner: isOwner,
      isSProvider: isSProvider,
      isRegular: isRegular,
      can: can,
      logOut: logOut,
      logIn: login,
      register: register,
      resetPassword: resetPassword,
      loginFacebook: loginFacebook,
      loginFacebookMobile: loginFacebookMobile,
      initialiseSession:initialiseSession
    }
  }])

.service('CategoriesService', ['ParseFactory', function(ParseFactory) {
    var getAllCategories = function() {
      var BusinessCategory = ParseFactory.Object.extend("BusinessCategory");
      var query = new ParseFactory.Query(BusinessCategory);
      return query.find();
    }
    return {
      getAllCategories: getAllCategories,
    }
}])


.service('ContactsService', ['ParseFactory', function(ParseFactory) {

    var getContacts = function(businessId) {
      var Business = ParseFactory.Object.extend("Business");
      var query = new ParseFactory.Query(Business);
      if (businessId !== undefined && businessId !== ""){
        query.equalTo("objectId", businessId);
        return query.find().then(function(result){
          return result[0].get("contactPersons");
        });
      }
      else {
        return {};
      }
    }
    return {
      getContacts: getContacts
    }
  }])

.service('BusinessesService', ['ParseFactory', 'UserService','$ionicLoading','USER_ROLES',function(ParseFactory, UserService,$ionicLoading,USER_ROLES) {


    var registerBiz = function(owner_id,usertype,category_id,name,street,address1,city,email,phone,mphone,fax,website,facebook,services){

      var user = ParseFactory.User.current();

      var owner = {
        "__type": "Pointer",
        "className": "_User",
        "objectId": owner_id
      };

      var category = {
        "__type": "Pointer",
        "className": "BusinessCategory",
        "objectId": category_id
      };

        var contact = {};
        var contactPersons = [];
        contact["email"] = email;
        contact["phone"] = phone;
        contact["type"] = usertype;
        contact["firstName"] = user.get("firstName");
        contact["lastName"] = user.get("lastName");
        contactPersons.push(contact);

        var Business = ParseFactory.Object.extend("Business");
        var biz = new Business();

        biz.set("owner", owner);
        biz.set("name", name);
        biz.set("category", category);
        biz.set("street", street);
        biz.set("address1",address1);
        biz.set("city",city);
        biz.set("featured",false);
        biz.set("email", email);
        biz.set("phone", phone);
        biz.set("mphone",mphone);
        biz.set("fax", fax);
        biz.set("website", website);
        biz.set("facebook", facebook);
        biz.set("Services", services);
        biz.set("contactPersons", contactPersons);
        //biz.set("verified","false")

        biz.save(null, {
        success: function(biz,owner) {
          // Execute any logic that should take place after the object is saved.

        //  user.set("type",usertype);
            user.save(null,{
              success:function(user){
                alert('Congratulations! You will be contacted in 3 business days via the email you listed in the registration.');
              },
              error: function(user,error){
                alert('Failed to register new Biz ' +              error.message);
              }
            });
        },
        error: function(biz, error) {
          // Execute any logic that should take place if the save fails.
          // error is a Parse.Error with an error code and message.
          alert('Failed to register new Biz ' +              error.message);
        }
      });

    }

    var mapBusinesses = function(rawBusinesses){//function to process the businesses for use in the app
      var items = [];
      var business = {};
      var reviews = [];
      var contactPersons = [];
      var likes = [];
      for (var i = 0; i < rawBusinesses.length; i++) {
        business.name = rawBusinesses[i].get("name");
        business.id = rawBusinesses[i].id;
        business.phone = rawBusinesses[i].get("phone");
        business.mphone = rawBusinesses[i].get("mphone");
        business.website = rawBusinesses[i].get("website");
        business.street = rawBusinesses[i].get("street");
        business.city = rawBusinesses[i].get("city");
        contactPersons = rawBusinesses[i].get("contactPersons");
        business.contactPersons = contactPersons ? contactPersons : [];
        business.services = rawBusinesses[i].get("Services");
        likes = rawBusinesses[i].get("Likes");
        business.likes = likes ? likes : [];
        if (UserService.hasRole(USER_ROLES.user)|| UserService.hasRole(USER_ROLES.sprovider)||
        UserService.hasRole(USER_ROLES.owner)) {
          if (business.likes.length !== 0 || business.likes !== undefined) {
            for (var j = 0; j < business.likes.length; j++) {
              if (UserService.getUser().username.localeCompare(business.likes[j]) == 0) {
                //if username exists in likes array, setup like settings on view
                business.liked = "Unlike";
                business.hasLiked = UserService.getUser().username; //set to this sessions username
                break;
              }
            }
            if (business.liked == undefined) { //All the likes are not from this user.
              business.liked = "Like";
              business.hasLiked = {}; //set to empty object
            }
          } else { //business had no likes. Means business was never liked by the user
            business.liked = "Like";
            business.hasLiked = {}; //set to empty object
          }
        }
        reviews = rawBusinesses[i].get("Reviews");
        business.reviews = reviews ? reviews : []; //business.reviews is referenced in view. Each business object in the scope has 0 or more reviews in them
        items.push(business);
        business = {}; //clear business object for next iteration
      }
      return items;
    }

    var mapBusinessesSummary = function(rawBusinesses){//function to process the businesses for use in the app
      var items = [];
      var business = {};
      var contactPersons = [];

      for (var i = 0; i < rawBusinesses.length; i++) {
        business.name = rawBusinesses[i].get("name");
        business.id = rawBusinesses[i].id;
        business.phone = rawBusinesses[i].get("phone");
        business.mphone = rawBusinesses[i].get("mphone");
        contactPersons = rawBusinesses[i].get("contactPersons");
        business.contactPersons = contactPersons ? contactPersons : [];

        items.push(business);
        business = {}; //clear business object for next iteration
      }
      return items;
    }

    var getBusinesses = function(categoryId, ownerBusinesses) {
      var Business = ParseFactory.Object.extend("Business");
      var query = new ParseFactory.Query(Business);

      if (categoryId !== undefined && categoryId !== "") {

        var category = {
          "__type": "Pointer",
          "className": "BusinessCategory",
          "objectId": categoryId
        };
        query.equalTo("category", category);
    }else if (Boolean(ownerBusinesses) == true) {
      //parameter that tells the service that its a query for the business owners business
      var userId = UserService.getUserId();
      var owner = {
        "__type": "Pointer",
        "className": "_User",
        "objectId": userId
      };
      query.equalTo("owner", owner);
    }
    query.select("contactPersons", "name");


    //category id not defined so its either all businesses or business details
    return query.find().then(function(results){
      var mappedBusinesses = mapBusinessesSummary(results);
      return mappedBusinesses;
    });
  }

    var getBusinessDetails = function(businessId) {//function to get businesses through either query to backend database or localStorage
      var Business = ParseFactory.Object.extend("Business");
      var query = new ParseFactory.Query(Business);
      if (businessId !== undefined && businessId !== "") {
        // if($sessionStorage["categoryBusinesses"][categoryId]){
        //   //if localStorage with businesses in a specific category
        //   //is set already set
        //   return new Promise(function(resolve, reject) {
        //     resolve($sessionStorage["categoryBusinesses"][categoryId]);
        //     //return localStorage businesses.
        //   });
        // }
      /*  var category = {
          "__type": "Pointer",
          "className": "BusinessCategory",
          "objectId": categoryId
        };*/
        query.equalTo("objectId", businessId);
      }
        // }else {
        //   if($sessionStorage["allBusinesses"].length > 0){//if localStorage has all the businesses already stored
        //   //  $ionicLoading.hide();
        //     return new Promise(function(resolve, reject) {
        //       resolve($sessionStorage["allBusinesses"]);
        //     });
        //   }
        // }
      return query.find().then(function(results){
        var mappedBusinesses = mapBusinesses(results);
        // if(categoryId){
        //   $sessionStorage["categoryBusinesses"][categoryId] = mappedBusinesses;
        // }else if(Boolean(ownerBusinesses) == false) {
        //   $sessionStorage["allBusinesses"] = mappedBusinesses;
        // }
        return mappedBusinesses;
      });
    }

    var likeUnlike = function(business) {
        var Business = ParseFactory.Object.extend("Business");
        var query = new ParseFactory.Query(Business);


      var userWhoPressed;
      if (business.hasLiked) {
        userWhoPressed = business.likes.splice(business.hasLiked); //remove this person from like list since they unliked
        business.hasLiked = false; //reset hasLiked since this user unliked
        business.liked = 'Like';

        query.get(business.id, {
          success: function(business) {
            business.remove("Likes", userWhoPressed[0]);
            business.save();
          },
          error: function(object, error) {
          //  ParseErrorHandler.handleParseError(error);
          }
        });
      } else {
        business.hasLiked = UserService.getUser().username; //let scope know this person liked the biz
        business.likes.push(business.hasLiked); //add this person to the list of persons who liked this biz
        business.liked = 'Unlike'; //update scope like/unlike action
        //userWhoPressed = business.hasLiked; //record who liked to update remote db
        query.get(business.id, {
          success: function(this_business) {
            this_business.addUnique("Likes", business.hasLiked);
            this_business.save();
          },
          error: function(object, error) {

          }
        });
      }
    }

    var isSProvider = function(business){
      return business.contactPersons.type == "service provider";//business.owner == null;
    }

    var isBusiness = function(business){
      return business.contactPersons.type == "owner";//business.owner != null;
    }

    var submitReview = function(business,review,callback) {
      review.author = UserService.getUser().username;
      var datetime = new Date();
      //datetime = $filter('date').(datetime,short);
      business.reviews.push(review);
      var review_to_send = {};
      review_to_send["comment"] = review.comment;
      review_to_send["rating"] = Number(review.rating);
      review_to_send["author"] = UserService.getUser().username;
      review_to_send["datetime"] = datetime;
      var id = business.id;

      var Business = ParseFactory.Object.extend("Business");
      var query = new ParseFactory.Query(Business);
      query.get(id, {
          success: function(business) {
            business.addUnique("Reviews", review_to_send);
            business.save();
          },
          error: function(object, error) {
          }
        })
        //this.reviews.push(review_to_send);//this suppose to allow review to persist on view
      callback && callback();
    }
    return {
      getBusinesses: getBusinesses,
      getBusinessDetails: getBusinessDetails,
      registerBiz:  registerBiz,
      likeUnlike: likeUnlike,
      isSProvider: isSProvider,
      isBusiness: isBusiness,
      submitReview: submitReview
    }
  }])

/*.service('ParseErrorHandler', function(){

  var handleParseError = function(err){
    switch (err.code) {
     case Parse.Error.INVALID_SESSION_TOKEN:
       Parse.User.logOut();
       $scope.go('app.login');
       break;
     case Parse.Error.InternalServerError:
       alert("Error accessing our online servers. Please be patient, our engineers are working to correct the problem");
       $scope.go('app.login');//change this to a No Response page
       break;
     case Parse.Error.ConnectionFailed:
       alert("Error connecting to our online servers. Please check your phone settings and try again.If this does not work, please verify connectivity with your service provider, our your WiFi network");
       $scope.go('app.login'); //change to connection failed page
       break;
     case Parse.Error.UsernameTaken:
        alert("The email provided has already been registered as a user with TriniBiz. Please try another email or login with the email provided");
        $scope.go('app.login');
        break;
     case Parse.Error.AccountAlreadyLinked:
        alert("This account has already been linked to another user");
        $scope.go('app.login');
        break;
     default:
        alert("TriniBiz is experiencing a technical problem and must exit.");
      // Other Parse API errors that you want to explicit handle
      //List of Parse.com Error Codes to reference at link below
      //T_Parse_ParseException_ErrorCode.htm
  }
  return {
    handleParseError: handleParseError,
  }
})
  */
