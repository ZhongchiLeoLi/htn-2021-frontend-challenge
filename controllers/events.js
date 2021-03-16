const axios = require('axios').default;

let eventsSorted = [];

// Helper to create a more readable date display
function formateDateDisplay ( date ) {
    let hour = date.getHours();
    hour = hour % 12;
    hour = hour ? hour : 12;
    let minute = date.getMinutes();
    minute = minute < 10 ? '0'+ minute : minute;
    let ampm = hour >= 12 ? 'PM' : 'AM';
    return hour + ':' + minute + ' ' + ampm;
}

// Helper to retrieve placeholder event images from Unsplash
async function getEventImages() {
    const imgResult = await axios.get('https://api.unsplash.com/collections/4449967/photos?per_page=30&client_id=CMs1FvW3A7Fw2rKriDHORnEYMXNREdcxAIPJz57QMng');
    const imgs = [];
    for(let i = 0; i < 15; i++) {
        // Use own alt description if the image comes with it
        if (imgResult.data[i].alt_description) {
            imgs.push({url: imgResult.data[i].urls.regular, alt: imgResult.data[i].alt_description});
        }
        // Use description instead
        else {
            imgs.push({url: imgResult.data[i].urls.regular, alt: imgResult.data[i].description});
        }
    }
    return imgs;
}

// Helper to retrieve placeholder profile images from Unsplash
async function getProfileImages() {
    const profileResult = await axios.get('https://api.unsplash.com/collections/1867054/photos?per_page=30&client_id=CMs1FvW3A7Fw2rKriDHORnEYMXNREdcxAIPJz57QMng');
    const profiles = [];
    for(let i = 0; i < 15; i++) {
        profiles.push(profileResult.data[i].urls.small);
    }
    return profiles;
}

// Export index page
module.exports.index = async (req, res) => {
    // Fetch events data
    const result = await axios.get('https://api.hackthenorth.com/v3/graphql?query={ events { id name event_type permission start_time end_time description speakers { name profile_pic } public_url private_url related_events } }')
    let events = result.data.data.events;

    // Fetch placeholder images from unsplash
    const eventImgs = await getEventImages();
    const profileImgs = await getProfileImages();

    // Sort the events by starting time (earliest to latest)
    eventsSorted = events.sort((a, b) => a.start_time - b.start_time)

    // Add in time_display, img, profile_pic fields to each event if needed
    eventsSorted.forEach(function (event, index) {
        let startTime = new Date( event.start_time );
        let endTime = new Date( event.end_time );
        event.time_display = startTime.toGMTString().slice(0, 16) + ', ' + formateDateDisplay(startTime) + ' — ' + formateDateDisplay(endTime);
        event.img = eventImgs[index];
        if (event.speakers.length && !event.speakers[0].profile_pic) {
            event.speakers[0].profile_pic = profileImgs[index];
        }
    })

    // If user is not logged in, exclude private events from events array
    if(!req.isAuthenticated()) {
        events = events.filter( event => event.permission == 'public' );
    }
    delete req.session.returnTo;
    
    // Render the index page
    res.render('events/index', {events});
}

// Export show pages
module.exports.show = async (req, res) => {
    // Find event with the given id
    const event = await eventsSorted.find(element => element.id == req.params.id);

    // Flash an error message if the event cannot be found
    if(!event) {
        req.flash('error', 'Event not found!');
        return res.redirect('/events');
    }

    // If the event is private and the user is not logged in, redirect to log in page
    if(!req.isAuthenticated() && event.permission == 'private') {
        req.session.returnTo = req.originalUrl;
        req.flash('error', 'Please log in first to view private events!');
        return res.redirect('/login');
    }

    // Create an array of related events to pass in with the found event
    let related_events = [];
    for( let eventId of event.related_events ) {
        const related_event = eventsSorted.find(element => element.id == eventId);
        related_events.push(related_event);
    }

    // If user is not logged in, exclude private events from related_events
    if(!req.isAuthenticated()) {
        // Store the current url to bring the user back to when they sign in
        req.session.returnTo = req.originalUrl;
        related_events = related_events.filter( event => event.permission == 'public' );
    }

    // Render the corresponding show page
    res.render('events/show', {event, related_events});
}