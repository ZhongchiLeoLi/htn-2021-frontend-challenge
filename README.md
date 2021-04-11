# Hack the North 2021 Frontend Developer Coding Challenge

https://htnfrontendchallenge.herokuapp.com/events

A website to display events for both hackers and the general public. Attendees would have to log in to access the full list of events and see the events' private links as hackers! 

Feel free to register your own dummy account or use "leo" for both username and password to login!

## How it was built

* This frontend challenge is built using **Node**, **Express** and **EJS template engine**
* **MongoDB** is used to store users' account information and their **Express-session** information
* **Passport** is used to authorize and create new users
* **Connet-flash** is used to flash success and error messages to users
* The website is made fully responsive with custom CSS and **Bootstrap**


## Project Write-up

### Setting Up

Upon reading about this frontend challenge and checking out the JSON provided by the API, I got the idea that this is going to be a simple web application with an index page that displays all the events as a landing page, a show page that displays details for each of the events, and a login/sign-up page to apply some authentication so private events can be hidden for users who are not logged in.

To start, I set up my **Express** app in **Node** as this is my most familiar environment. The web app would consist of two main parts, the *events* part responsible for displaying a list of events and each individual event, and the *hackers* part responsible for signing hackers up and logging hackers in/out. So, I created the corresponding js files in the `routes` folder, where the Express routers would be handling requests, and in the `controllers` folder, where the server-side functions would be exported and used in the `routes` folder. That way, if more routes that serve extended functionalities to the events are to be added in the future, the structure of the project will be kept organized. 

Since there will be a lot of repeating features on the show page of each event, I used the **EJS template engine** and its `layout` and `partial` functions to save me from redundant codes and make future expansion easier. Aside from that, since I knew I need to implement user authentication and need a place to store users’ accounts and session information, I created a cluster on **MongoDB Atlas** and connected it to my application using mongoose.


### Events Pages

With my Express server running and the database connection established, it was time to start building the site. Inside the `views` folder, I created `navbar.ejs` and `footer.ejs` under the `partials` folder and `eventsBoilerplate.ejs` under the `layouts` folder. I also stored the corresponding asset files in the `public` folder. The style of my web app is hugely inspired by the current Hack the North theme because I actually really like that theme and the fun vibe that comes with it. With the boilerplate built, I could then use it on any future events site. 

To display the events on the index page (`index.ejs`), I wanted to present them as a group of flex-wrapped cards, and I quickly realized that I don’t have a picture to display for each event and the start_time and end_time are not very friendly to read when displayed. So I created some helpers in the events controller to added a few fields to the JSON object I fetched from the given API. I used **axios** and the **Unsplash API** to fetch some nice hackathon-looking photos as placeholders and created a more readable time display. The events are then sorted and passed to `index.ejs` to be looped through and rendered. That way, the index page can display an arbitrary number of events depending on the size of the array. 

Moving on to building the events show pages (`show.ejs`), which can be reached with ‘/events/:id’, I noticed that not all speakers have profile pictures. So I added another helper to fetch images from a collection of portraits on Unsplash and added their urls to the speakers without profile pictures. I then realized that every event’s `public_url` is a youtube link, so I extracted the video ids from those links and concatenated them behind “https://www.youtube.com/embed/” so I could embed the videos as iframes. In case an event has no `public_url`, I placed an illustration as a filler. Since I had not yet implemented user authentication, the `private_url` section contained just a login button. To display the related events, I used the same format as the index page and showed them as flex-wrapped cards. 

Since the functions that render the index page and show pages are both async functions as axios requests and searching through an array take time and must be awaited, I created a `catchAsync` wrapper function in the utils folder that can be used to wrap any async function so that the website won’t be completely broken when an async error occurs. In addition, I created the `ExpressError` class in the utils folder and an error handler right before the end of `app.js` so that any error caught before would be redirected here and treated (basically displayed on an error page). 


### Hackers Pages

To implemented user authentication, I first needed sessions. I used **express-session** to configure and create a session cookie for the browser. The session is then stored in the previously connected MongoDB through **connect-mongo**, so that users don’t have to login every time they visit. Next, I used **passport** for its simple and expandable authentication strategies. I only used **passport-local** login strategy, but in the future, logging in with Google, Facebook, Twitter and so on could all be implemented with passport if the web app is to expand. To use passport’s authentication, I need to initialize it with a model, so I created the `Hacker` model under the models folder. It only has the username field for now but other information such as name and email could all be added if necessary. 

I then built the corresponding routes and controller for hacker pages along with `login.ejs` and `signup.ejs` in `views/hackers` (they both utilize `authForm.ejs` in `views/templates`). Upon signing up, the hacker’s password would be hashed and the generated salt would be store together with the username in the connected MongoDB cluster.

Additionally, I wanted to be able to flash messages under certain situations, for example, when a hacker logs in. I used **connect-flash** and created a `flash.ejs` partial so that I could add a flash message to any existing page.


### Returning to Events Pages

Now that user authentication is implemented, it was time to go back to set some restrictions on the events pages. With passport set in place, I could check if a user is logged in using `req.isAuthenticated()`. That way, if a user is not logged in, I excluded the private events from the array of events and the array of related events before I passed them on to be rendered. Inside the ejs files, I could check if a user is logged in with the variable `currentUser` which I stored. Using that, I only display the `private_url` on the event show page if the user is logged in, and display a login button otherwise. Furthermore, if a user tries to visit the show page of a private event through the url, they will be redirected to the login page and displayed a flash message. Lastly, I want the user to be redirected back to whichever page they were on before they logged in. To do this, I stored their current url in a field, `returnTo`, in the user’s session if they are visiting an event's show page while not logged in. That way, when they decide to log in, they will be redirected to the url stored in `returnTo`.

Now that I can flash messages, I don’t want to redirect users to an error page whenever they want to view an event with an invalid id, for example, ‘/events/23’, so I changed the controller so that the user is redirected back to the index page when that happens with an error flash message so that users could continue browsing.


### Extra Features

Now that the functionalities are implemented, it’s time to get a little fancy. I added some hover effects to the cards on the index page so that it almost feels like the user is picking them up with their mouse when they are hovering over it. I also added some hover animation that I thought matched with the theme to the login/sign-up buttons on the navbar. In addition, I also added smart-toggle to the navbar so that it comes down and scrolls up accordingly when a user is scrolling, similar to the navbar on the current Hack the North website. With my web app built with **bootstrap**, I could easily add a tabbed interface to the index page. Along with filtering the events array with different types, I implemented the tabbed interface for viewing events by type. Adding additional event types would be just as simple as adding additional tabs to display them. 


### Possible Extensions

I was looking into how to let the browser remember which tab was selected so that the users can return to the same tab when they refresh the website. However, there seemed to be a way for older versions of bootstrap tabbed interface, but not for the newest version, `v5.0`, which is also what I used. I tried switching to older versions of bootstrap, but that completely changed the look of the website. With not enough time to restyle the entire website to accommodate for the older version of bootstrap or look into other ways to make it work, it is a shame that I cannot implement this feature. That is why with more time, I would want to find out a way to make the browser remember the tab the user is currently choosing. That way, it is also easy to implement the ability to reorder the events. Other than that, a “back to top” button would be a nice addition when the list of events gets too long. Lastly, more security features such as **helmet** could be used to make this web app more secure before it can become a fully functional product the general public can use safely.
