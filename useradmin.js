const express = require('express')
const jwt = require('jsonwebtoken')
const  mongoose=require('mongoose')
const jwtPassword='secret'

 

const app=express()
app.use(express.json())

mongoose.connect('mongodb+srv://admin:admin123@cluster0.uvpxgrw.mongodb.net/')
const admin=mongoose.model('admin',{username:String,password:String})
const users=mongoose.model('users',{username:String,password:String})
const courses=mongoose.model('courses',{ id:Number,title: String, description: String, price: Number })
const userscourses=mongoose.model('usercourses',{ username:String,id:Number,title: String, description: String, price: Number })


 // POST /admin/signup
 // Description: Creates a new admin account.
 //Input Body: { username: 'admin', password: 'pass' }
 //Output: { message: 'Admin created successfully' }
app.post('/admin/signup',async function(req,res){
    username_c=req.body.username;
    password_c=req.body.password;
    let adminExists=await admin.findOne({username:username_c});//finding if user already exists 
    if(adminExists){
        res.send("admin already exits try another username and password")

    }else{//creating bew adminn
        let newAdmin=new admin({
            username:username_c,
            password:password_c
        })
        newAdmin.save()//saving db
        res.send("new admin created in database")
    }
    

})

  //POST /admin/signin
  //Description: Logs in an admin account.
  //Input Body: { username: 'admin', password: 'pass' }
  //Output: { token: 'your-token' }
app.post('/admin/signin',async function(req,res){
    username_c=req.body.username;
    password_c=req.body.password;

    let adminExists=await admin.findOne({username:username_c});//finding if user already exists 
    if(adminExists){
        const adminToken=jwt.sign(username_c,jwtPassword);

        res.json({"token":adminToken})

    }else{
        res.send('user doesnt exists')
    } 
})

//POST /admin/courses
//Description: Creates a new course.
//Input: Headers: { 'Authorization': 'Bearer <your-token>' }, Body: { title: 'course title',
// description: 'course description', price: 100}
//Output: { message: 'Course created successfully', courseId: "new course id" }
function newId(){
    let a=Math.ceil(Math.random()*100)
    console.log(a)
    return a

}

app.post('/admin/courses',async function(req,res){
    let token=req.headers.authorization;
    const title_c=req.body.title;
    const description_c=req.body.description;
    const price_c=req.body.price;
    const id_c=newId()
    try{
        await jwt.verify(token,jwtPassword)
        console.log(1)
        let newCourses=new courses({
            id:id_c,
            title: title_c,
            description: description_c, 
            price: price_c


        })
        newCourses.save()
        res.json({"message":"Course created successfully","courseId":id_c})


    }
    catch{
        res.send("admin not matched error")
    }
})

//GET /admin/courses
//Description: Returns all the courses.
//Input: Headers: { 'Authorization': 'Bearer <your-token>' }
//Output: { courses: [ { id: 1, title: 'course title', description: 'course description', 
//price: 100 }
app.get('/admin/courses',async function(req,res){
    let token=req.headers.authorization;
    try{
        await jwt.verify(token,jwtPassword)
        console.log(1)
        getCourses=await courses.find({})
        console.log(1)

        res.json({getCourses})
    }
    catch{
        res.send("admin not matched error")
    }
    
})

//POST /users/signup
//Description: Creates a new user account.
//Input: { username: 'user', password: 'pass' }
//Output: { message: 'User created successfully' }
app.post('/users/signup',async function(req,res){
    username_c=req.body.username;
    password_c=req.body.password;
    let usersExists=await users.findOne({username:username_c});//finding if user already exists 
    if(usersExists){
        res.send("admin already exits try another username and password")

    }else{//creating bew adminn
        let newUsers=new users({
            username:username_c,
            password:password_c
        })
        newUsers.save()//saving db
        res.send("new users created in database")}

})

//POST /users/signin
//Description: Logs in a user account.
//Input: { username: 'user', password: 'pass' }
//Output: { token: 'your-token' }
app.post('/users/signin',async function(req,res){
    username_c=req.body.username;
    password_c=req.body.password;

    let userExists=await users.findOne({username:username_c});//finding if user already exists 
    if(userExists){
        const usersToken=jwt.sign(username_c,jwtPassword);

        res.json({"token":usersToken})

    }else{
        res.send('user doesnt exists')
    } 
})

//GET /users/courses
//Description: Lists all the courses.
//Input: Headers: { 'Authorization': 'Bearer <your-token>' }
//Output: { courses: [ { id: 1, title: 'course title',
// description: 'course description', price: 100, imageLink: 'https://linktoimage.com', published: true }, ... ] }
app.get('/users/courses',async function(req,res){
    try{
        const token=req.headers.authorization;
        await jwt.verify(token,jwtPassword)
        getCourses=await courses.find({})
        res.json({getCourses})
    }catch{
        res.send("invalid t0ken")

    }
})

//POST /users/courses/:courseId
//Description: Purchases a course. courseId in the URL path should be replaced with the ID of the course to be purchased.
//Input: Headers: { 'Authorization': 'Bearer <your-token>' }
//Output: { message: 'Course purchased successfully' }
app.post('/users/courses/:courseId',async function(req,res){
    try{
        const token=req.headers.authorization;
        jwtuser=await jwt.verify(token,jwtPassword)
        courseId=req.params.courseId;
        isCourseAvailable=await courses.findOne({id:courseId})
        if(isCourseAvailable){
            console.log(jwtuser)
            
            const newUserCourse=new userscourses({
                username:jwtuser,
                id:isCourseAvailable.id,
                title: isCourseAvailable.title,
                description: isCourseAvailable.description,
                price: isCourseAvailable.price
            })
            newUserCourse.save();
            res.send("course purchased")


        }
        else{
            res.send("following id doesnt resemble a course")
        }
    }catch{
        res.send("invalid t0ken")

    }
})


//GET /users/purchasedCourses
//Description: Lists all the courses purchased by the user.
//Input: Headers: { 'Authorization': 'Bearer <your-token>' }
//Output: { purchasedCourses: [ { id: 1, title: 'course title',
// description: 'course description', price: 100, imageLink: 'https://linktoimage.com', published: true }, ... ] }
app.get('/users/purchasedCourses',async function(req,res){
    try{
        jwtuser=await jwt.verify(req.headers.authorization,jwtPassword);
        isPurchasedCourseAvailable=await userscourses.findOne({username:jwtuser})
        console.log(1)
        if(isPurchasedCourseAvailable){
            console.log(3)
            res.json({
                "id": isPurchasedCourseAvailable.id, 
                "title": isPurchasedCourseAvailable.title,
                "description": isPurchasedCourseAvailable.description, 
                "price": isPurchasedCourseAvailable.price

                
            })
            console.log(isPurchasedCourseAvailable.id)
        }
    }catch{
        res.send("invalid token")
    }
})

app.listen(3000)