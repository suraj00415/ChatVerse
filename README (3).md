
# 💬 Chatting App

The Chatting App is a comprehensive real-time messaging application designed to facilitate seamless communication between users. Built with a modern tech stack, this application supports both group and direct messaging, ensuring users can interact in various contexts. The app is designed to be highly responsive, providing a smooth user experience across different devices.
## 🖼️ Screenshot

![Chatting App Screenshot](./screenshots/a.png?raw=true)
![Chatting App Screenshot](./screenshots/b.png?raw=true)
![Chatting App Screenshot](./screenshots/c.png?raw=true)
![Chatting App Screenshot](./screenshots/d.png?raw=true)
![Chatting App Screenshot](./screenshots/e.png?raw=true)
![Chatting App Screenshot](./screenshots/f.png?raw=true)


## 🌟 Key Features

- **💬 Real-Time Messaging:** Leveraging Socket.io, the app provides instant messaging capabilities, ensuring messages are delivered and received in real-time.
- **👥 Group and Direct Messaging:** Users can create group chats or engage in one-on-one conversations, catering to both personal and professional communication needs.
- **📁 File Uploads:** Integrated with Multer and Cloudinary, the app allows users to upload and share files within chats, enhancing the communication experience.
- **😊 Emoji Support:** Users can express themselves better with emoji reactions, making conversations more engaging and fun.
- **🔒 User Authentication and Authorization:** Secure user authentication is implemented using JWT, ensuring that only authorized users can access the app.
- **📱 Responsive Design:** Built with Tailwind CSS, the app is fully responsive, providing a consistent experience across desktops, tablets, and mobile devices.
- **✅ Message Read Receipts:** Users can see when their messages have been read, providing better communication transparency.
- **🔔 Notification System:** Toast notifications keep users informed about new messages, mentions, and other important events.

## 🛠️ Tech Stack

### 🎨 Client-Side
- **React:** A JavaScript library for building user interfaces.
- **Redux Toolkit:** For state management.
- **Tailwind CSS:** A utility-first CSS framework for styling.
- **Radix UI:** For accessible and customizable UI components.
- **Emoji Picker React:** For emoji selection and insertion.

### ⚙️ Server-Side
- **Node.js:** A JavaScript runtime built on Chrome's V8 JavaScript engine.
- **Express:** A minimal and flexible Node.js web application framework.
- **MongoDB:** A NoSQL database for storing user and chat data.
- **Mongoose:** An ODM (Object Data Modeling) library for MongoDB and Node.js.
- **Socket.io:** For real-time, bidirectional communication between web clients and servers.
- **Multer:** A middleware for handling multipart/form-data, used for file uploads.
- **Cloudinary:** A cloud service for managing images and videos.

## 🏛️ Architecture

The application follows a client-server architecture:

- **Client:** The front-end is built with React, providing a dynamic and interactive user interface. Redux Toolkit is used for state management, ensuring a predictable state container for JavaScript apps.
- **Server:** The back-end is powered by Node.js and Express, handling API requests, user authentication, and real-time communication via Socket.io. MongoDB serves as the database, with Mongoose providing a straightforward schema-based solution to model application data.
- **Real-Time Communication:** Socket.io is used to enable real-time messaging, ensuring that users receive messages instantly without needing to refresh the page.
- **File Management:** Multer handles file uploads, while Cloudinary is used for storing and managing media files.

## 🔐 Security

Security is a top priority in the Chatting App. The application uses JWT for secure user authentication and authorization. Passwords are hashed before being stored in the database, and sensitive data is transmitted over HTTPS to prevent eavesdropping and man-in-the-middle attacks.

## 🚀 Installation

To run this app locally:

1. Clone the repository:
   ```bash
   git clone https://github.com/suraj00415/ChatVerse
   ```

2. Navigate to the project directory:
   ```bash
   cd ChatVerse
   ```

3. Install dependencies for both the client and server:
   ```bash
   npm install
   cd client
   npm install
   ```

4. Set up environment variables for MongoDB, JWT, Cloudinary, and others in a `.env` file.

5. Start the development server:
   ```bash
   cd ..
   npm run dev
   ```

The app should now be running on `http://localhost:3000` for the client and `http://localhost:5000` for the server.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
