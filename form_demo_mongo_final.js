var bodyParser = require("body-parser");
var express = require('express');
var app = express();
var qurl = require('url');
var MongoClient = require('mongodb').MongoClient;
var url = 'mongodb://localhost/form';
var autoIncrement = require("mongodb-autoincrement");
var pagination = require('pagination');
var str = "";

app.use(bodyParser.json());         
app.use(bodyParser.urlencoded({ extended: true }));

app.set('views', __dirname + '/views');
app.engine('html', require('ejs').renderFile);

app.get('/', function (req, res)
{
    res.render('form.html');
});

app.route('/insert').post(function(req,res){
	MongoClient.connect(url, function(err, db) {
		if (err) throw err;
		console.log('connected successfully!');
		str = "";
		  autoIncrement.getNextSequence(db, 'user', function (err, autoIndex) {
		  db.collection('user', function(err, response) {
			  var a = autoIndex.toString();
			var myobj = { "_id":a, "name":req.body.textnames, "gender": req.body.gender,"Course":req.body.Course,"emailid":req.body.emailid,"dob":req.body.dob,"mobileno":req.body.mobileno };  
		  response.insert(myobj, function(err, response) {
			if (err) throw err;
			//console.log(req.body);
			res.send(
				'inserted data: <br>'+
				autoIndex+'<br>'+req.body.textnames+'<br>'+req.body.gender+
				'<br>'+req.body.Course+'<br>'+req.body.emailid+'<br>'+req.body.dob+'<br>'+req.body.mobileno+
				'<br>1 row inserted!<br>'+
				'<br><a href="http://localhost:8088/select">user data</a>'
			);
			db.close();
		  });
		  
		  });
		  });
	});
});

app.route('/select').get(function(req, res) {
   MongoClient.connect(url,function(err, db) {
       var collection = db.collection('user');
       var cursor = collection.find({});
       str = "";
	   		//str = str + paginator.render();
	   		str = str + '<style type="text/css">table{border:1px solid #ccc; border-collapse:collapse;}tr,th,td{border:1px solid #ccc;padding:5px;};</style>';
			str = str + '<br><a href="http://localhost:8088/">user registration</a><br><br>';
	   		str = str + '<table><tr><th>Id</th><th>Name</th><th>Gender</th><th>Course</th><th>Email</th><th>DOB</th><th>Phone</th><th colspan=2>Action</th></tr>';
       cursor.forEach(function(item) {
           if (item != null) {
                   str = str + "<tr><td> " + item._id + 
				   		"</td>"+"<td> "+item.name+"</td>"+
						"<td> "+item.gender+ "</td>"+
						"<td> "+item.Course+ "</td>"+
						"<td> "+item.emailid+ "</td>"+
						"<td> "+item.dob+ "</td>"+
						"<td> "+item.mobileno+ "</td>"+
						"<td> "+"<a href='/update/"+item._id+"'>Edit</a>"+"</td>"+
						"<td> "+"<a href='/delete/"+item._id+"'>Delete</a>"+"</td></tr>";
           }
       }, function(err) {
		   
           res.send(str);
           db.close();
          }
       );
   });
});

app.get('/update/:id',function(req, res) {
	//var q = url.parse(req.qurl, true);
	console.log(req.params.id);
	var id = req.params.id;
	MongoClient.connect(url,function(err, db) {
      db.collection('user').find({ "_id": id}).forEach(function(data){
		  if (err) throw err;
	   //console.log(result);
				
       str = str +	"<form action='/update1/"+id+"' id='form' method='post'>"+
				"NAME: <input type='text' name='textnames' value='"+data.name+"'><br><br>";
				
		if(data.gender=="male"){
		   str = str +  "GENDER:<input type='radio' name='gender' value='male' checked='checked' size='10'>Male"+
		   				"<input type='radio' name='gender' value='Female' size='10'>Female<br><br>";
		 }
		 else{
			 str = str + "GENDER:<input type='radio' name='gender' value='male' size='10'>male"+
			 			 "<input type='radio' name='gender' value='Female' checked='checked' size='10'>Female<br><br>";
		 }
		 
		 str = str +"Course: <select name='Course'>"+
					"<option value='"+data.Course+"' selected>"+data.Course+"</option>"+
					"<option value='B.Tech'>B.Tech</option>"+
					"<option value='MCA'>MCA</option>"+
					"<option value='MBA'>MBA</option>"+
					"<option value='BCA'>BCA</option>"+
					"</select><br><br>";
		 				
			str = str +  "EMAIL: <input type='text' name='emailid' value='"+data.emailid+"'><br><br>"+
				"DOB: <input type='text' name='dob' value='"+data.dob+"'><br><br>"+
				"PHONE: <input type='text' name='mobileno' value='"+data.mobileno+"'><br><br>"+
				"<input type='submit' value='update' name='update'></form><br><br>";
		   
           res.send(str);
           db.close();
		
	  });
   });
});


	
app.post('/update1/:id', function(req, res) {
	MongoClient.connect(url,function(err, db) {

    var id = req.params.id;
	var newvalues = { "name":req.body.textnames, "gender": req.body.gender,"Course":req.body.Course,"emailid":req.body.emailid,"dob":req.body.dob,"mobileno":req.body.mobileno };
	//console.log('id2:'+id);
    db.collection('user').update({ _id:id}, newvalues, function (err, result) {
        res.send(
            'updated<br><a href="http://localhost:8088/select">user data</a>'
        );
    });
	});
});

app.get('/delete/:id',function(req, res) {
	//var q = url.parse(req.qurl, true);
	console.log(req.params.id);
	var id = req.params.id;
	MongoClient.connect(url,function(err, db) {
      db.collection('user').deleteOne({ "_id": id},function(err,data) {
		  if (err) throw err;
		  res.send(
            'delete successfully<br><a href="http://localhost:8088/select">user data</a>'
        	);
    	db.close();
	  });
	});
});

var server = app.listen(process.env.PORT || 8088);
