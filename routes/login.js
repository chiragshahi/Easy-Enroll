var express = require('express');
var router = express.Router();
var passport =  require('passport')
var bcrypt = require('bcrypt')
var LocalStrategy = require('passport-local').Strategy;

var monk = require('monk');
var db = monk('localhost:27017/enrollmentsystem');
/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('login');
    
});

router.post('/login', function(req, res, next) {
    var collection = db.get('users');
    var useremail =  req.body.email
    var userpassword =  req.body.password
    
    console.log("email and password",useremail, userpassword)
    if(useremail != undefined && userpassword != undefined){
        collection.find({email: useremail }, function(err, user){
            if (err) throw err;
            // console.log("user is",user)
            if(user.length == 0){
                res.send({ data: "user not found"})
            }

            else{
                // console.log("in paass")
                bcrypt.compare(userpassword, user[0].password, function(err, response) {
                    if(response == true){
                        
                        res.send({ data: "Successful", email: useremail, isadmin: user[0].isadmin})
                    }
                    else{
                        res.send({ data: "password is not correct"})
                    }
                });
            }
            
        });
    }
    else{
        res.send({ data: "fill all fields"})
    }
    
});

router.post('/register', function(req, res, next) {
    var collection = db.get('users');
    var useremail =  req.body.email
    var userpassword =  req.body.password
    var userfirstname = req.body.firstname
    var userlastname = req.body.lastname
    var usermajor = req.body.major
    var userphonenumber = req.body.phonenumber
    var useraddress = req.body.address
    console.log(useremail, useraddress, userpassword, userfirstname, userlastname, usermajor, userphonenumber)

    if(userpassword.length > 8){
        if(useremail != undefined && userpassword != undefined && userfirstname != undefined && userlastname != undefined 
            && usermajor != undefined && userphonenumber != undefined && useraddress != undefined ){
                collection.find({email: useremail }, function(err, user){
                    if (err) throw err;
                    // console.log("user is", user)
                    if(user.length == 0){
                        bcrypt.genSalt(10, (err, salt) => 
                            bcrypt.hash(userpassword, salt, (err, hash) => {
                                if(err) throw err;
                                userpassword = hash
                                collection.insert({
                                    firstname: userfirstname,
                                    lastname: userfirstname,
                                    email: useremail,
                                    pastcourses: [],
                                    pastcoursesarr: [],
                                    isadmin: "0",
                                    gpa: 0.0,
                                    cart: [],
                                    password: userpassword,
                                    major: usermajor,
                                    phonenumber: userphonenumber,
                                    address: useraddress,
                                    credits: 9
                                })
                            }))
                        
                        res.send({data: "done"})    
                    }
                    else{
                        res.send({data: "user already registered"})
                    }
                });     
            }
        
            else{    
                res.send({data: "fill all fields"})       
        }
    }
    else{
        res.send({data: "password"})   
    }
});

router.post('/getuserdata', function(req, res, next) {
    var collection = db.get('users');
    console.log("getuserdata", req.body.params, req.body)
    var useremail =  req.body.email
    
    collection.findOne({email: useremail }, function(err, user){
        if (err) throw err;
        // console.log("user is",user)
        res.send(user)
    });
    
});

router.post('/getuserpastcourses', function(req, res, next) {
    var collection = db.get('users');
    var collection2 = db.get('courses')
    // console.log("getuserdata", req.body.params, req.body)
    var useremail =  req.body.email
    
    collection.findOne({email: useremail }, function(err, user){
        if (err) throw err;
        // console.log("user past courses are",user.pastcourses)
        arr1 = [] 
        arr2 = []
        console.log("user.pastcourses.length", user.pastcourses.length)
        if(user.pastcourses.length != undefined){
        for (var key in user.pastcourses){
            console.log()
            for (var k in user.pastcourses[key]){
                arr1.push(k.split(".")[0])
                arr2.push(k.split(".")[1].substring(k.split(".")[1].length-1))
                // console.log("--------------------------------->", k.split(".")[0])
            }
        }
    

        // console.log("111111111111111111111111111",arr2)
        collection2.find({ code: { $in: arr1 }, section: {$in: arr2}}, function(err, course){
            console.log(course)
            res.send(course)
        })
    }
    else{
        res.send("nocourse")
    }
        
        

    });
    
});

router.post('/getcart', function(req, res, next) {
    var collection = db.get('users');
    
    
    collection.findOne({email:  req.body.email}, function(err, user){
        if (err) throw err;
        // console.log(user)
        // console.log("usering",user.firstname)
        res.send(user.cart)
    });

    
});

router.post('/getgrades', function(req, res, next) {
    var collection = db.get('users');
    
    
    collection.findOne({email:  req.body.email}, function(err, user){
        if (err) throw err;

        arr1 = []
        for (var key in user.pastcourses){
            
            for (var k in user.pastcourses[key]){
                arr1.push(user.pastcourses[key][k][0])
                
            }
        }
        console.log("--------------------------------->", arr1)
        res.send(arr1)
    });

    
});


router.post('/addtocart', function(req, res, next) {
    var collection = db.get('users');
    var useremail =  req.body.email
    
    collection.update({email: useremail }, {$addToSet : {cart : req.body.code}}  , function(err, var1){
        if (err) throw err;

        collection.findOne({email:  req.body.email}, function(err, user){
            if (err) throw err;
    
            //   console.log("--------------------------------->", arr1)
            res.send(user.cart)
        });
        
    });

    
});



router.post('/dropfromcart', function(req, res, next) {
    var collection = db.get('users');
    var useremail =  req.body.email
    
    collection.update({email: useremail }, {$pull : {cart : req.body.code}}  , function(err, var1){
        if (err) throw err;
        collection.findOne({email:  req.body.email}, function(err, user){
            if (err) throw err;
    
            //   console.log("--------------------------------->", arr1)
            res.send(user.cart)
        });
    });

    
});


router.post('/notusercourses', function(req, res, next) {
    var collection = db.get('users')
    var collection2 = db.get('courses');
    var useremail =  req.body.email
    arr = []
    

    collection.findOne({email: useremail }, function(err, user){
        if (err) throw err;
        arr1 = []
        for (i in user.currentcourses){
            arr1.push(user.currentcourses[i].split(".")[0])
        }
        for (i in user.pastcoursesarr){
            arr1.push(user.pastcoursesarr[i].split(".")[0])
        }
        
        console.log("arr1", arr1)
        

        collection2.find({ code: { $nin: arr1}}, function(err, course){
            // console.log("qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq", course)
            res.send(course)
            
        })
    });    
});

router.post('/adminsearch', function(req, res, next) {

    var collection = db.get('courses');
     arr = []
    console.log("0000000000000000000000000000000000000000000000000", req.body.coursename)
     if(req.body.coursename != undefined)
     {
    
         collection.find({ code: { "$regex": req.body.coursename, "$options": "i" }}, function(err, c){
             
             // res.send(course)
             
             res.send(c)
            
         })
 }
 else{
     collection.find({}, function(err, course){
         res.send(course)
     })
 }
    
});


router.post('/newusercourses', function(req, res, next) {
    var collection = db.get('users')
    var collection2 = db.get('courses');
    var useremail =  req.body.email
    arr = []
    

    collection.findOne({email: useremail }, function(err, user){
        if (err) throw err;
        arr1 = []
        for (i in user.currentcourses){
            arr1.push(user.currentcourses[i].split(".")[0])
        }
        for (i in user.pastcoursesarr){
            arr1.push(user.pastcoursesarr[i].split(".")[0])
        }
        
        console.log("arr1", arr1)
        var course1;
        var course2;
        console.log("qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq234", req.body.coursename)

        if(req.body.coursename != undefined)
        {
            collection2.find({ code: { $nin: arr1}}, function(err, course){
            // console.log("qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq", course)
            // res.send(course)
            course1 = course
            collection2.find({ code: { "$regex": req.body.coursename, "$options": "i" }}, function(err, c){
                
                // res.send(course)
                course2 = c

                sending = []

                for (i in course1){
                    for (j in course2){
                        if((course1[i].code == course2[j].code) &&(course1[i].section == course2[j].section)){
                            sending.push(course1[i])
                        }
                    }
                   
                    // console.log("qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq", course1[i])
                }
                
                res.send(sending)
               
            })
                
           
        })
    }
    else{
        collection2.find({ code: { $nin: arr1}}, function(err, course){
            res.send(course)
        })
    }

        
    });    
});

router.post('/getusercourses', function(req, res, next) {
    var collection = db.get('users');
    var collection2 = db.get('courses')
    var useremail =  req.body.email
    arr = []
    // console.log(useremail)
    
    collection.findOne({email: useremail }, function(err, user){
        if (err) throw err;
        console.log(user)
        arr1 = []
        for (i in user.currentcourses){
            arr1.push(user.currentcourses[i].split(".")[0])
        }
        console.log(arr1)
        collection2.find({ code: { $in: arr1 }}, function(err, course){
            console.log(course)
            res.send(course)
        })
    });
    
});


router.post('/addcourse', function(req, res, next) {
    var collection = db.get('users');
    var collection2 = db.get('courses')
    var useremail =  req.body.email
    var usercode =  req.body.code.split(",")[0]
    var usersection =  req.body.code.split(",")[1]
    var term = req.body.term
    // var usersection =  req.body.code[1]
    console.log(usercode)
    console.log(usersection)
    console.log("term is", term)
    arr = []
    
    collection.findOne({email: useremail }, function(err, user){
        if (err) throw err;
        
        collection2.findOne({ code: usercode, section: usersection}, function(err, course){
            console.log(course)
            // console.log(user.pastcoursesarr, course.prereq)
            if(term == course.courseoffering){
                if(user.credits >= course.credits ){
                    
                    if(course.availableseats > 0 ){
                        check = 0
                        for (i in user.pastcoursesarr){
                            if(course.prereq == user.pastcoursesarr[i]){
                                newcredits = user.credits - course.credits
                                newcourse = usercode+".00"+usersection
                                res.send({data : "success", newcre: newcredits , course: newcourse})
                                check = 1
                                    
                            }
                        }
                        
                        if(check ==0){res.send({data : "prereq"})}
                    }

                    else{
                        res.send({data: "seats"})
                    }
                }
                else{
                    res.send({data: "credits"})
                }
            }
            else{
                res.send({data: "term"})
            }
            
        })
    });
    
});

router.post('/updateuser', function(req, res, next) {
    var collection = db.get('users');
    var collection2 = db.get('courses')
    var useremail =  req.body.email
    var cred = req.body.changecre
    var course = req.body.addcourse

    // console.log(cred, "==================================================================================", req.body.addcourse)
    arr = []
      
    collection.update({email: useremail }, { $set: {credits: cred}}  , function(err, var1){
                if (err) throw err;

                console.log(var1);
            });
        
    collection.update({email: useremail }, {$addToSet : {currentcourses :course}}  , function(err, var1){
        if (err) throw err;

        console.log(var1);
    });
    collection.update({email: useremail }, {$pull : {cart : course}}  , function(err, var1){
        if (err) throw err;
        
    });



    var course1 = req.body.addcourse.split(".")[0]
    collection2.update({code: course1 }, { $inc: {enrolled: 1, availableseats: -1}}  , function(err, var1){
        if (err) throw err;

        console.log(var1);
    });
        
        
    res.send("done")
});

router.post('/dropcourse', function(req, res, next) {
    var collection = db.get('users');
    var collection2 = db.get('courses')
    var useremail =  req.body.email
    var code = req.body.code

    var var1 = code.split(".")[0]

    console.log("hello",  var1)    
    
    console.log(useremail, code)
    collection.findOne({email: useremail }, function(err, user){
        if (err) throw err;
        console.log(user)

        arr1 = []
        for (i in user.currentcourses){
            if(user.currentcourses[i] != code){
                arr1.push(user.currentcourses[i])
            }
        }

        
        collection.update({email: useremail }, { $set: {currentcourses: arr1}}  , function(err, var1){
            if (err) throw err;

            console.log("var1", var1);
        });
        collection.update({email: useremail }, { $inc: {credits: 3}} , function(err, var1){
            if (err) throw err;

            console.log("var1", var1);
        });
    });

    
    collection2.update({code: var1 }, { $inc: {enrolled: -1}}   , function(err, var1){
        if (err) throw err;

        console.log(var1);
    });

    collection2.update({code: var1 }, { $inc: {availableseats: 1}}  , function(err, var1){
        if (err) throw err;

        console.log(var1);
    });

    res.send("done")
    
});

router.post('/adminaddcourse', function(req, res, next) {
    var collection = db.get('courses')
    var cname =  req.body.name
    var ccode =  req.body.code
    var csection = req.body.section
    var cinstructor = req.body.instructor
    var cprereq = req.body.prereq
    var ctotalseats = parseInt(req.body.totalseats, 10)
    var clocation = req.body.location
    var cstarttime = req.body.starttime
    var cendtime = req.body.endtime
    var coffering = req.body.offering
    var cdept = ccode.substring(0,2)
    var day = [req.body.dayoffering.split(",")[0], req.body.dayoffering.split(",")[1]]


    console.log("\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\", day)    
    
    // console.log(useremail, code)
    collection.insert({name: cname,
           code: ccode,
           section: csection,
           instructor: cinstructor,
           prereq: cprereq,
           dept: cdept,
           coursedescription: "coursedescription",
           totalseats: ctotalseats,
           enrolled: 0,
           availableseats: ctotalseats,
           location: clocation,
           starttime: cstarttime,
           endtime:cendtime,
           classstatus: "open",
           credits: 3,
           courseoffering: coffering,
           days : day

    });

    
    res.send("done")
    
});



router.post('/admindropcourse', function(req, res, next) {
    var collection = db.get('courses')
    var coursecode =  req.body.code.split(",")[0]
    var coursesection = req.body.code.split(",")[1]

    console.log("hello", coursecode, coursesection)    
    
    // console.log(useremail, code)
    collection.remove({code: coursecode, section: coursesection});

    
    res.send("done")
    
});

router.get('/getallcourses', function(req, res, next) {
    var collection = db.get('courses')

    // console.log("hello", coursecode, coursesection)    
    
    // console.log(useremail, code)
    collection.find({}, function(err, course){
        if(err) throw err

        console.log(course)
        
        res.send(course)
    })
    
    
    
    
});


router.post('/getterm', function(req, res, next) {
    var collection = db.get('users')
    
    collection.findOne({isadmin: "1"}, function(err, user){
        if(err) throw err

        console.log(user)
        res.send(user.term)
    })
      
    
});

router.post('/changeterm', function(req, res, next) {
    var collection = db.get('users')
    console.log("term is ", req.body.term)
    if(req.body.term == "Fall"){
        collection.update({isadmin: "1"}, { $set: {term: "Spring"}}  , function(err, var1){
            if (err) throw err;

            console.log("var1", var1);
            res.send("Spring")
        });
    }
    else{
        collection.update({isadmin: "1"}, { $set: {term: "Fall"}}  , function(err, var1){
            if (err) throw err;

            console.log("var1", var1);
            res.send("Fall")
        });
    }
      
    
    
});


module.exports = router;
