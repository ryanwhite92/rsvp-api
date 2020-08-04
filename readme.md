# RSVP API

REST API built to store RSVP data for events. All API routes require authentication and have separate access roles for guests and admins. Admins can add guests, remove guests, and edit guest information. Guests are only able to update the status of their RSVP for themselves and their plus one(s).

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See deployment for notes on how to deploy the project on a live system.

- Fork and clone the repo
- `cd` into the cloned repo's directory and run `npm install` or `yarn install`
- Create a `.env` file based on `.env.example`
- `npm run start` or `yarn start` to start a local development server

## Running the tests

- Run all tests: `npm run test` or `yarn test`
- Run admin and guest resource tests: `npm run test-resources` or `yarn test-resources`
- Run server tests: `npm run test-server` or `yarn test-server`
- Run utils tests: `npm run test-utils` or `yarn test-utils`

## API

All endpoints accept and return JSON.

**GET /auth-token**  
Gets a CSRF token from the server. This is required for `/signin` routes.

**POST /guest/:id/signin**  
Guest signin route.

Parameters:  
password: _string_

```
{
  "password": "guest"
}
```

**POST /admin/signin**  
Admin signin route.

Parameters:  
email: _string_
password: _string_

```
{
  "email": "ryan@example.com",
  "password": "admin"
}
```

### Guests

**GET /guest/:id**  
Retrieves the details of an existing guest.

**PUT /guest/:id**  
Updates the RSVP status of an existing guest.

Parameters:  
rsvpStatus: _boolean_  
plusOnes: _array_ (optional)

Child Parameters (plusOnes):  
name: _string_  
rsvpStatus: _boolean_

```
{
  "rsvpStatus": true,
  "plusOnes": [{
    "name": "Ryan",
    "rsvpStatus": true
  }]
}
```

### Admins

**GET /guest/**  
Retrieves a list of all guests as JSON.

**POST /guest/**  
Creates a new guest.

Parameters:  
firstName: _string_  
lastName: _string_  
plusOnes: _array_ (optional)

Child Parameters (plusOnes):  
name: _string_

**GET /guest/:id**  
Retrieves the details of an existing guest.

**PUT /guest/:id**  
Updates the information of an existing guest.

Parameters:  
firstName: _string_ (optional)  
lastName: _string_ (optional)  
rsvpStatus: _boolean_ (optional)  
plusOnes: _array_ (optional)

Child Parameters (plusOnes):  
name: _string_ (optional)  
rsvpStatus: _boolean_ (optional)

**DELETE /guest/:id**  
Permanently deletes a guest. This cannot be undone.

**GET /admin/**  
Retrieves a list of existing admins as JSON.

**GET /admin/:id**  
Retrieves the details of an existing admin.

**POST /admin/signup**  
Allows an existing admin to add another admin account.

Parameters:  
email: _string_  
password: _string_

## Built With

- [Node](https://nodejs.org/) - JavaScript runtime
- [Express](https://expressjs.com/) - Web framework
- [MongoDB](https://www.mongodb.com/) - NoSQL Database

## License

This project is licensed under the MIT License
