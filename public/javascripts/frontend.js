var app = angular.module('Enrollment',  ['ngResource','ngRoute', 'ngCookies']);

app.config(['$routeProvider', function($routeProvider){
    $routeProvider
        .when('/', {
            templateUrl: 'partials/login.html',
            controller: 'LoginCtrl'
        }).when('/register', {
            templateUrl: 'partials/register.html',
            controller: 'RegisterCtrl'
        }).when('/homepage', {
            templateUrl: 'partials/homepage2.html',
            controller: 'HomepageCtrl'
        }).when('/add', {
            templateUrl: 'partials/add2.html',
            controller: 'AddCtrl'
        }).when('/drop', {
            templateUrl: 'partials/drop2.html',
            controller: 'DropCtrl'
        }).when('/viewcourses', {
            templateUrl: 'partials/viewcourses2.html',
            controller: 'ViewCoursesCtrl'
        }).when('/adminhomepage', {
            templateUrl: 'partials/adminhomepage2.html',
            controller: 'AdminHomeCtrl'
        }).when('/adminadd', {
            templateUrl: 'partials/adminadd2.html',
            controller: 'AdminAddCtrl'
        }).when('/admindrop', {
            templateUrl: 'partials/admindrop2.html',
            controller: 'AdminDropCtrl'
        }).when('/adminview', {
            templateUrl: 'partials/adminview2.html',
            controller: 'AdminViewCtrl'
        }).when('/adminterm', {
            templateUrl: 'partials/adminterm.html',
            controller: 'AdminTermCtrl'
        }).when('/dropping', {
            templateUrl: 'partials/dropping.html',
            controller: 'DroppingCtrl'
        })
        .otherwise({
            redirectTo: '/'
        });
}]);

app.factory("userPersistenceService", [
	"$cookies", function($cookies) {
		var email;
 
		return {
			setCookieData: function(useremail, admin) {
				email = useremail+admin;
				$cookies.put("Email", email);
			},
			getCookieData: function() {
				email = $cookies.get("Email");
				return email;
			},
			clearCookieData: function() {
				email;
				$cookies.remove("Email");
			}
		}
	}
]);


app.factory("sharecourse",  function() {
    var coursename;
    var coursecode

    return {
        setcourse: function(name, co) {
            coursename = name
            coursecode = co	
        },
        getcoursename: function() {
            return coursename;
        },
        getcoursecode: function() {
            return coursecode;
        }
    }
}
);




app.controller('AdminViewCtrl', function(userPersistenceService, $scope, $resource, $location, $sce, $http){
    // console.log("homepage", userPersistenceService.getCookieData())
    if(userPersistenceService.getCookieData() == undefined){
        $location.path('/'); 
    }
    else{

        var getcourses = $resource('/getallcourses');
        getcourses.query(function(var1, var2){
            console.log(var1)
            $scope.courses = var1
        })
        
        $scope.search =  function(){
            $http.post('/adminsearch', {coursename: $scope.coursename}).success(function(data, status) {
                console.log('--------------------', $scope.term, $scope.dept, data);
                newcourses = []
                // $scope.courses = data
                if($scope.term == 'Noterm' && $scope.dept == 'Nodept' ){
                    $scope.courses = data
                }
                
                else if($scope.term == 'Noterm' && $scope.dept != 'Nodept'){
                    for (i in data){
                        if($scope.dept == data[i]['dept']){
                            newcourses.push(data[i])
                        }
                    }
                    $scope.courses = newcourses
                }
                
                
                else if($scope.term != 'Noterm' && $scope.dept == 'Nodept'){
                    for (i in data){
                        if($scope.term == data[i]['courseoffering']){
                            newcourses.push(data[i])
                        }
                    }
                    $scope.courses = newcourses
                }

                else{
                    for (i in data){
                        if($scope.term == data[i]['courseoffering'] && $scope.dept == data[i]['dept']){
                            newcourses.push(data[i])
                        }
                    }
                    $scope.courses = newcourses
                }

              })

          }


        $scope.logout = function(){
            userPersistenceService.clearCookieData() 
        }
    }
    
    
});






app.controller('LoginCtrl', function(userPersistenceService, $scope, $resource, $location, $sce){
    $scope.send = function(){
        var login = $resource('/login');
        login.save($scope.user, function(var1, var2){
            // console.log(authenticate.getuser())
            if(var1['data'] == "fill all fields"){
                $scope.myHTML= $sce.trustAsHtml("<div class='alert alert-danger'>Please fill all fields</div>");
                $location.path('/');    
            }
            else if(var1['data'] == "user not found"){
                $scope.myHTML= $sce.trustAsHtml("<div class='alert alert-danger'>User not registered</div>");
                $location.path('/');
            }
            else if(var1['data'] == "password is not correct"){
                $scope.myHTML= $sce.trustAsHtml("<div class='alert alert-danger'>Please enter correct password</div>");
                $location.path('/');
            }
            else{
                console.log("in login page", var1['isadmin'])
                userPersistenceService.setCookieData(var1['email'], var1["isadmin"])
                if(var1["isadmin"] == "1"){
                    $location.path('/adminhomepage');   
                }
                else{
                    $location.path('/homepage');
                }
                
            }

        });
    };
    
});

app.controller('RegisterCtrl', function(userPersistenceService, $scope, $resource, $location, $sce){
    $scope.save = function(){
        var Register = $resource('/register');
        Register.save($scope.user, function(var1, var2){
            console.log(var1['data'])
            if(var1['data'] == "fill all fields"){
                $scope.myHTML1= $sce.trustAsHtml("<div class='alert alert-danger'>Please fill all fields</div>");
                $location.path('/register');
            }
            else if(var1['data'] == "user already registered"){
                $scope.myHTML1= $sce.trustAsHtml("<div class='alert alert-danger'>User is already registered</div>");
                $location.path('/register')
            }
            else if(var1['data'] == "password"){
                $scope.myHTML1= $sce.trustAsHtml("<div class='alert alert-danger'>Password not strong enough!</div>");
                $location.path('/register')
            }
            else{
                $location.path('/');  
                  
            }
        });
    };
    
});

app.controller('HomepageCtrl', function(userPersistenceService, $scope, $resource, $location, $sce, $http){
    console.log("homepage", userPersistenceService.getCookieData())
    if(userPersistenceService.getCookieData() == undefined){
        $location.path('/'); 
    }
    else{
        // var getuserdata = $resource('/getuserdata')
        var cookie = userPersistenceService.getCookieData() 
        $http.post('/getuserdata', {email: cookie.substring(0, cookie.length-1)}).success(function(data, status) {
            console.log('Data posted successfully');
            console.log(data)
            $scope.userfirstname = data['firstname']
            $scope.userlastname = data['lastname']
            $scope.useremail = data['email']
            $scope.usercurrentcourses = data['currentcourses']
            $scope.userpastcourses = data['pastcourses']
            $scope.usermajor = data['major']
            $scope.GPA = data['gpa']
            $scope.address = data['address']
            $scope.phonenumber = data['phonenumber']
          })

          $http.post('/getusercourses', {email: cookie.substring(0, cookie.length-1)}).success(function(data, status) {
            console.log('Data posted successfully');
            console.log(data)
            
            $scope.courses = data
          })

          $http.post('/getuserpastcourses', {email: cookie.substring(0, cookie.length-1)}).success(function(data, status) {
            console.log('blah blah blah');
            console.log(data)
            if(data == "nocourse"){
                $scope.myHTML1= $sce.trustAsHtml("<div class='alert alert-danger'>You dont have a past courses history</div>");
            }
            else{
                $scope.courses1 = data
            }
            
            
          })

          $http.post('/getgrades', {email: cookie.substring(0, cookie.length-1)}).success(function(data, status) {
            console.log('blah blah blah');
            console.log(data)
            
            $scope.grades = data
          })


        $scope.logout = function(){
            userPersistenceService.clearCookieData() 
        }
          
        // userPersistenceService.clearCookieData()
    }


});

app.controller('AddCtrl', function($route, userPersistenceService, $document, $scope, $resource, $location, $sce, $http){
    // console.log("homepage", userPersistenceService.getCookieData())
    if(userPersistenceService.getCookieData() == undefined){
        $location.path('/'); 
    }
    else{
        var cookie = userPersistenceService.getCookieData()
         
        $http.post('/notusercourses', {email: cookie.substring(0, cookie.length-1)}).success(function(data, status) {
            console.log('Data posted successfully');
            console.log(data[0])
            
            $scope.courses = data
          })
          var cartis;

          $http.post('/getcart', {email: cookie.substring(0, cookie.length-1)}).success(function(data, status) {
            // console.log('Data posted successfully');
            console.log("wishlist", data)
            if(data.length == 0){
                $scope.myHTML2= $sce.trustAsHtml("<div class='alert alert-warning'>No courses in shopping cart</div>");
            }
            else{
                cartis = data
                $scope.myHTML2= $sce.trustAsHtml("<div class='alert alert-warning'>Your shopping cart is:</div>");
                $scope.cart = data

            }
            
            // $scope.cart = data
          })

          $scope.search =  function(){
            $http.post('/newusercourses', {email: cookie.substring(0, cookie.length-1), coursename: $scope.coursename}).success(function(data, status) {
                console.log('--------------------', $scope.term, $scope.dept);
                newcourses = []
                // $scope.courses = data
                if($scope.term == 'Noterm' && $scope.dept == 'Nodept' ){
                    $scope.courses = data
                }
                
                else if($scope.term == 'Noterm' && $scope.dept != 'Nodept'){
                    for (i in data){
                        if($scope.dept == data[i]['dept']){
                            newcourses.push(data[i])
                        }
                    }
                    $scope.courses = newcourses
                }
                
                
                else if($scope.term != 'Noterm' && $scope.dept == 'Nodept'){
                    for (i in data){
                        if($scope.term == data[i]['courseoffering']){
                            newcourses.push(data[i])
                        }
                    }
                    $scope.courses = newcourses
                }

                else{
                    for (i in data){
                        if($scope.term == data[i]['courseoffering'] && $scope.dept == data[i]['dept']){
                            newcourses.push(data[i])
                        }
                    }
                    $scope.courses = newcourses
                }

              })

          }

          $scope.add = function(){
            console.log("selcted course is ", $scope.coursesel)
            var termis
            $http.post('/getterm', {}).success(function(data, status) {
                console.log('Data posted successfully');
                termis = data
                console.log("term is", data)
                

                $http.post('/addcourse', {email: cookie.substring(0, cookie.length-1), code: $scope.coursesel, term: termis}).success(function(data, status) {
                    console.log('Data posted successfully');
                    console.log(data)

                    if(data['data'] == 'credits'){
                        $scope.myHTML1 = $sce.trustAsHtml("<div class='alert alert-danger'>Cannot Register! You are at max credit hour limit</div>");
            
                    }
                    else if(data['data'] == 'seats'){
                        $scope.myHTML1 = $sce.trustAsHtml("<div class='alert alert-danger'>Cannot Register! Seats are filled for the class</div>");
                    }
                    else if(data['data'] == 'term'){
                        $scope.myHTML1 = $sce.trustAsHtml("<div class='alert alert-danger'>Cannot Register! The current term is not valid</div>");
                    }
                    else if(data['data'] == 'prereq'){
                        $scope.myHTML1 = $sce.trustAsHtml("<div class='alert alert-danger'>Cannot Register! Prerequisites dont match</div>");
                    }
                    else{
                        $scope.myHTML1 = $sce.trustAsHtml("<div class='alert alert-success'>Successfully Registered!!</div>");
                        $http.post('/updateuser', {email: cookie.substring(0, cookie.length-1), changecre: data['newcre'], addcourse: data['course']}).success(function(data, status) {
                            console.log(data)
                            $location.path("/homepage")
                            
                        })
                    }

                })
            })
        }

        $scope.addtocart = function(){
            
            c = $scope.coursesel.split(",")[0] + ".00" + $scope.coursesel.split(",")[1] 
            console.log("yopp", c)

            // if(!(c in data)){
                $http.post('/addtocart', {email: cookie.substring(0, cookie.length-1), code: c}).success(function(data, status) {
                    console.log('successfully');
                    // $location.path('/homepage');
                    // $route.reload();
                    if(data.length == 0){
                        $scope.myHTML2= $sce.trustAsHtml("<div class='alert alert-warning'>No courses in shopping cart</div>");
                    }
                    else{
                        cartis = data
                        $scope.myHTML2= $sce.trustAsHtml("<div class='alert alert-warning'>Your shopping cart is:</div>");
                        $scope.cart = data
        
                    }
                    // $scope.cart = data
                })
            // }
        }

        $scope.dropfromcart = function(){
            
            c = $scope.coursesel.split(",")[0] + ".00" + $scope.coursesel.split(",")[1] 
            console.log("asdsa", c)

            // if(!(c in data)){
                $http.post('/dropfromcart', {email: cookie.substring(0, cookie.length-1), code: c}).success(function(data, status) {
                    console.log('successfully');
                    // $location.path('/homepage');
                    // $route.reload();
                    if(data.length == 0){
                        $scope.myHTML2= $sce.trustAsHtml("<div class='alert alert-warning'>No courses in shopping cart</div>");
                        $scope.cart = data
                    }
                    else{
                        cartis = data
                        $scope.myHTML2= $sce.trustAsHtml("<div class='alert alert-warning'>Your shopping cart is:</div>");
                        $scope.cart = data
        
                    }
                    
                })
            // }
        }

        
        $scope.logout = function(){
            userPersistenceService.clearCookieData() 
        }


    }
    
});

app.controller('DropCtrl', function(sharecourse, userPersistenceService, $scope, $resource, $location, $sce, $http){
    // console.log("homepage", userPersistenceService.getCookieData())
    if(userPersistenceService.getCookieData() == undefined){
        $location.path('/'); 
    }
    else{
        var cookie = userPersistenceService.getCookieData() 
        $http.post('/getusercourses', {email: cookie.substring(0, cookie.length-1)}).success(function(data, status) {
            console.log('Data posted successfully');
            console.log(data)
            
            $scope.courses = data
          })

        $scope.drop = function(){
            console.log($scope.coursesel.split(",")[0], $scope.coursesel.split(",")[1])
            sharecourse.setcourse($scope.coursesel.split(",")[0], $scope.coursesel.split(",")[1])
            $location.path("/dropping")
            

        }
        
        $scope.logout = function(){
            userPersistenceService.clearCookieData() 
        }
    }
    
    
});


app.controller('DroppingCtrl', function(sharecourse, userPersistenceService, $scope, $resource, $location, $sce, $http){
    // console.log("adminaddpage", userPersistenceService.getCookieData())
    if(userPersistenceService.getCookieData() == undefined){
        $location.path('/'); 
    }
    else{
        code = sharecourse.getcoursecode()
        name = sharecourse.getcoursename()
        $scope.coursename = name
        $scope.coursecode = code.split(".")[0]
        $scope.coursesection = code.split(".")[1]

        // console.log("code is ", code)
        var cookie = userPersistenceService.getCookieData()
        $scope.delete =  function(){
            $http.post('/dropcourse', {email: cookie.substring(0, cookie.length-1), code: code}).success(function(data, status) {
                    console.log('Data posted successfully');
                    console.log("drop", data)
                    $location.path("/homepage")

                })
        }
        console.log("Dropping")
        
    }
    
});





app.controller('ViewCoursesCtrl', function(userPersistenceService, $scope, $resource, $location, $sce, $http){
    // console.log("homepage", userPersistenceService.getCookieData())
    if(userPersistenceService.getCookieData() == undefined){
        $location.path('/'); 
    }
    else{
        var getcourses = $resource('/getallcourses');
        getcourses.query(function(var1, var2){
            console.log(var1)
            $scope.courses = var1
        })
        
        $scope.logout = function(){
            userPersistenceService.clearCookieData() 
        }
    }
    
    
});



app.controller('AdminHomeCtrl', function(userPersistenceService, $scope, $resource, $location, $sce, $http){
    console.log("adminhomepage", userPersistenceService.getCookieData())
    if(userPersistenceService.getCookieData() == undefined){
        $location.path('/'); 
    }
    else{
        var termis
        $http.post('/getterm', {}).success(function(data, status) {
            if(data == "Fall"){
                termis = "Fall"
                $scope.myHTML1 = $sce.trustAsHtml("<div class='alert alert-success'>The current term is Fall</div>");
            }
            else{
                termis = "Spring"
                $scope.myHTML1 = $sce.trustAsHtml("<div class='alert alert-success'>The current term is Spring</div>");
            }
        })
        
        var cookie = userPersistenceService.getCookieData()

        $http.post('/getuserdata', {email: cookie.substring(0, cookie.length-1)}).success(function(data, status) {
            console.log('Data posted successfully');
            console.log(data)
            $scope.userfirstname = data['firstname']
            $scope.userlastname = data['lastname']
            $scope.useremail = data['email']
            $scope.address = data['address']
            $scope.phonenumber = data['phonenumber']
          })

        $scope.change = function(){
            $http.post('/changeterm', {term: termis}).success(function(data, status) {
                console.log("term changed", data)
                if(data == "Fall"){
                    termis = "Fall"
                    $scope.myHTML1 = $sce.trustAsHtml("<div class='alert alert-success'>The current term is Fall</div>");
                }
                else{
                    termis = "Spring"
                    $scope.myHTML1 = $sce.trustAsHtml("<div class='alert alert-success'>The current term is Spring</div>");
                }
            })
        }

        $scope.logout = function(){
            userPersistenceService.clearCookieData() 
        }
    }
    
    
});

app.controller('AdminAddCtrl', function(userPersistenceService, $scope, $resource, $location, $sce, $http){
    console.log("adminaddpage", userPersistenceService.getCookieData())
    if(userPersistenceService.getCookieData() == undefined){
        $location.path('/'); 
    }
    else{
        $scope.save = function(){
            var Register = $resource('/adminaddcourse');
            console.log($scope.course)
            Register.save($scope.course, function(var1, var2){
                console.log(var1)
                $location.path("/adminhomepage")
            })

        }
        console.log("adminadd")
        
        $scope.logout = function(){
            userPersistenceService.clearCookieData() 
        }
    }
    
});

app.controller('AdminDropCtrl', function(userPersistenceService, $scope, $resource, $location, $sce, $http){
    console.log("adminaddpage", userPersistenceService.getCookieData())
    if(userPersistenceService.getCookieData() == undefined){
        $location.path('/'); 
    }
    else{
        console.log("admindrop")
        var cookie = userPersistenceService.getCookieData()
        var getcourses = $resource('/getallcourses');
        getcourses.query(function(var1, var2){
            console.log(var1)
            $scope.courses = var1
        })

        $scope.search =  function(){
            $http.post('/adminsearch', {coursename: $scope.coursename}).success(function(data, status) {
                console.log('--------------------', $scope.term, $scope.dept, data);
                newcourses = []
                // $scope.courses = data
                if($scope.term == 'Noterm' && $scope.dept == 'Nodept' ){
                    $scope.courses = data
                }
                
                else if($scope.term == 'Noterm' && $scope.dept != 'Nodept'){
                    for (i in data){
                        if($scope.dept == data[i]['dept']){
                            newcourses.push(data[i])
                        }
                    }
                    $scope.courses = newcourses
                }
                
                
                else if($scope.term != 'Noterm' && $scope.dept == 'Nodept'){
                    for (i in data){
                        if($scope.term == data[i]['courseoffering']){
                            newcourses.push(data[i])
                        }
                    }
                    $scope.courses = newcourses
                }

                else{
                    for (i in data){
                        if($scope.term == data[i]['courseoffering'] && $scope.dept == data[i]['dept']){
                            newcourses.push(data[i])
                        }
                    }
                    $scope.courses = newcourses
                }

              })

          }

        
        $scope.drop = function(){
            console.log($scope.coursesel)
            $http.post('/admindropcourse', {email: cookie.substring(0, cookie.length-1), code: $scope.coursesel}).success(function(data, status) {
                console.log('Data posted successfully');
                console.log("drop", data)
                $location.path("/adminhomepage")

              })


        }

        
        $scope.logout = function(){
            userPersistenceService.clearCookieData() 
        }
        
    }
    
});


app.controller('AdminTermCtrl', function(userPersistenceService, $scope, $resource, $location, $sce, $http){
    console.log("adminhomepage", userPersistenceService.getCookieData())
    if(userPersistenceService.getCookieData() == undefined){
        $location.path('/'); 
    }
    else{
        console.log("here")
        $http.post('/getterm', {}).success(function(data, status) {
            if(data == "Fall"){
                $scope.myHTML1 = $sce.trustAsHtml("<div class='alert alert-success'>The current term is Fall</div>");
            }
            else{
                $scope.myHTML1 = $sce.trustAsHtml("<div class='alert alert-success'>The current term is Fall</div>");
            }
        })
    }
    
    
});
