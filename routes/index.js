var express = require('express');
var router = express.Router();

var monk = require('monk');
var db = monk('localhost:27017/enrollmentsystem');
/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', { title: 'talal' });
    // var collection = db.get('courses');
    // collection.find({}, function(err, course){
    //     if (err) throw err;
    //   	res.json(course);
    // });
});
//   // 
// });


module.exports = router;
