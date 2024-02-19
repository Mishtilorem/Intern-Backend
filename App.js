//Importing necessary modules
const express = require('express');
const {faker} = require('@faker-js/faker');
const path = require('path');
const axios = require('axios');
const mongoose = require('mongoose');

const {db} = require('../Backend/db/db.js');
const app = express()
require('dotenv').congfig();

//setting up views engine and views directory
app.set('view engine', 'ejs');
app.set("views", path.join(__dirname, '/views'));
// setting server
const PORT = process.env.PORT;
//declaring cache to prevent cache storing
const imageCache = {}; // simple in-memory cache
const uniqueImageParam = () => Math.floor(Math.random() *1000);
//declaring asynchronous function to get user data
const getUser = async ()=> {
  //declaring parameter to fetch image
  const uniqueParam = uniqueImageParam();
  //fetch a random user image using a parameter
  const image = await getRandomHumanImage(uniqueParam);
  //return random data about the user
  return {
    image,
    name: faker.person.fullName(),
    rating: faker.number.int({min:1 ,max:10}),
    badge_Number: faker.number.int({min:1,max:999}),
    phone: faker.phone.number(),
    noOfTrips: faker.number.int({min:1 , max:50}),
    location: faker.location.streetAddress()
    
};
};
//a sample req sending for root path '/'
app.get('/', (req, res) =>{

  res.send("hello wrld")
})
//function to fetch a random image
async function getRandomHumanImage(param) {
  //generate a cache key for image on the basis of parameter
  const cacheKey = `randomHumanImage-${param}` ;
  //if image is cached then return the image
  if(imageCache[cacheKey]){
    return imageCache[cacheKey];
  }
  try {
    //fetch the image from external api 
    const response = await axios.get(`https://xsgames.co/randomusers/avatar.php?g=male&param=${param}&timestamp=${Date.now()}`); 
    //extract the image url from response
    const imageUrl = response.request.res.responseUrl;
    // cache the image url for future use
    imageCache[cacheKey] = imageUrl;
    return imageUrl;
  } catch (error) {
    //log and handle error if failed loading it
    console.error('Error fetching random human image:', error.message);
    throw new error('Failed to fetch image');
  }
}
//function to get multiple users
let getUsers = async (count) => {
  const user = [];
  // loop to get user asynchronously
  for(let i=0; i<count;i++){
    const users= await getUser();
    user.push(users);
  }
  return user;
};
//router handler for'/user' path
app.get('/user' , async (req,res,next) => {
  try{
    //get 25 users and render the data using ejs
  const data = await getUsers(25);
  res.render("data.ejs",{data});
  } catch (error){
    next (error); //Pass error to Express error handling middleware
  }
});

// console.log(getUser());
//Error handling middle ware
app.use((err,req,res,next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

//starting the server and listening to port
//middlewares
const server = () => {
  db()
  app.listen(PORT, () => {
    // console.log('Server is running on PORT:' , PORT);
    console.log(`Server is running on http://localhost:${PORT}`);
  })
}
server ()
