# lets-eat-web-dev

## What is Let's Eat?
Let's Eat is a group project developed and thought of by 5 people to assist with the easability when it comes to social interactions and decision making for restaurants. With the idea set in mind, we created a social Yelp which reduces the amount of applications used to simulate what we regularly do on a daily basis. It combines messaging, maps, and Yelp all into one app that allows users to easily navigate what they desire. If you are an indecisive person and want to try something new, our application returns the user a single restuarant based on the keywords they have entered randomly.

Users are able to create their own account that gives personalized restaurants based on their bookmarks and where they have visited. This project has both a website and Android app to give users a wide range of technology to access this project. Our Android application is available at the [Google Play Store](https://play.google.com/store/apps/details?id=lets_eat.project&hl=en_US). You can access the website [here](http://192.81.130.63/) (the location will be changed for better performance in the future).

## What are the Features?
* *Restaurant Search*: Regular search request depending on whether the user puts in a location or use their current location and an advanced search request returning a single result.
* *Account*: Create a personalized account based on location, preferences, and dietary restrictions.
  * *Bookmark Restaurants*: Bookmark restaurants and remove restaurants within the account page.
  * *Friends*: Add and remove friends through the account page.
  * *Groups*: Create groups with up to 6 friends. The one who creates the group becomes the host.
  * *Group Voting*: Based on one of the groups created, you are able to put in a preference or restaurant and allow others to vote. Whichever preference or restaurant has the highest vote within 5 minutes, a map to the location will pop up.

## Technology Used
This project is using a NodeJS and ExpressJS server using Firebase as the backend and EJS (Embedded JavaScript) as the frontend. From Firebase, I utilize authentication and database. The API's used is Yelp and Google Maps Directions. 
