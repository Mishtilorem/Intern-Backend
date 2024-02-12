const express = require('express');
const {faker} = require('@faker-js/faker');
const path = require('path');
const axios = require('axios');
const app = express()

app.set('view engine', 'ejs');
app.set("views", path.join(__dirname, '/views'));

const PORT = 8080;
const imageCache = {}; // simple in-memory cache
const uniqueImageParam = () => Math.floor(Math.random() *1000);
const getUser = async ()=> {
  const uniqueParam = uniqueImageParam();
  const image = await getRandomHumanImage(uniqueParam);
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
app.get('/', (req, res) =>{

  res.send("hello wrld")
})

async function getRandomHumanImage(param) {
  const cacheKey = `randomHumanImage-${param}` ;
  if(imageCache[cacheKey]){
    return imageCache[cacheKey];
  }
  try {
    const response = await axios.get(`https://xsgames.co/randomusers/avatar.php?g=male&param=${param}&timestamp=${Date.now()}`); 
    const imageUrl = response.request.res.responseUrl;
    imageCache[cacheKey] = imageUrl;
    return imageUrl;
  } catch (error) {
    console.error('Error fetching random human image:', error.message);
    throw new error('Failed to fetch image');
  }
}

let getUsers = async (count) => {
  const user = [];
  for(let i=0; i<count;i++){
    const users= await getUser();
    user.push(users);
  }
  return user;
};

app.get('/user' , async (req,res,next) => {
  try{
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


//middlewares
app.listen(PORT, () => {
    // console.log('Server is running on PORT:' , PORT);
    console.log(`Server is running on http://localhost:${PORT}`);
  });
