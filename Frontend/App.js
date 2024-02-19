 const express = require('express');
const {faker} = require('@faker-js/faker');
const path = require('path');
const axios = require('axios');



const app = express()


app.set('view engine', 'ejs');
app.set("views", path.join(__dirname, '/views'));

const PORT = 3000;
const imageCache = {}; // simple in-memory cache
const uniqueImageParam = () => Math.floor(Math.random() *1000);
const getUser = async () => {
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
    throw new Error('Failed to fetch image');
  }
}
app.get('/coolie', async (req, res) => {
    try {
        const coolieData = await getUser();
        await axios.post('http://localhost:8080/coolie', coolieData);
        res.send('Coolie data sent to backend');
    } catch (error) {
        console.error('Error fetching coolie data:', error);
        res.status(500).json({ error: 'Failed to fetch coolie data' });
    }
}); 

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

app.listen(PORT, () => {
    console.log(`Frontend server listening at http://localhost:${PORT}`);
});
