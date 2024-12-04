<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

# NestChat Project

NestChat is a real-time chat application built with NestJS.

## Prerequisites

Before starting, ensure you have the following installed on your machine:
- [Docker](https://www.docker.com/)
- [Docker Compose](https://docs.docker.com/compose/)
- [Node.js](https://nodejs.org/) (for local development if needed)

---

## Features

- WebSocket communication for real-time chat
- REST API endpoints for managing users and messages
- PostgreSQL and MongoDB database support
- Dockerized environment for easy deployment
- Secure authentication with jwt

---

## Installation and Setup

### 1. Clone the Repository

```bash
git clone https://github.com/Armelsteve1/nestchat.git
cd nestchat
```

### 2. Environment Variables

Create a `.env` file in the root directory and configure the following variables:

```env
# PostgreSQL
POSTGRES_USER=postgres
POSTGRES_PASSWORD=password
POSTGRES_DB=nestchat

# MongoDB
MONGODB_URI= mongodb

# Application
APP_PORT=3000
```

---

## Running the Project with Docker

1. **Build and Start Services**

   Run the following command to start the Docker containers:
   ```bash
   docker-compose up --build
   ```

2. **Access the Application**

   Once all services are running, the application will be available at:
   ```
   http://localhost:3000
   ```

3. **Access Databases**

   - PostgreSQL: Port `5432`
   - MongoDB: Port `27017`

---

## Development

### 1. Install Dependencies

If running locally, install the required Node.js dependencies:
```bash
npm install
```

### 2. Start the Development Server

Run the application in development mode:
```bash
npm run start:dev
```

---

## Testing

Run the following command to execute unit and integration tests:
```bash
npm test
```

---

## Project Structure

```plaintext
src/
├── auth/             # Authentication module
├── messaging/        # Messaging module
├── users/            # User module
├── main.ts           # Application entry point
docker-compose.yml    # Docker Compose configuration
package.json          # Node.js dependencies
tsconfig.json         # TypeScript configuration
```

---

## API Documentation

Once the application is running, you can access the API documentation via Swagger:
```
http://localhost:3000/api
```

---

## Contributing

Feel free to fork the repository and submit pull requests. Contributions are welcome!

---

## License

This project is licensed under the MIT License. See the LICENSE file for more information.

--- 

## Notes

- Ensure Docker is running before starting the project.
- Modify environment variables in the `.env` file as needed for production.