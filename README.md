- `Name` - Kedar Vartak
- `Walkthrough video link` - https://youtu.be/jsR2v82d_f0
- `Email` - kedar.vartak22@vit.edu

# Student Progress Management System

This is a full-stack MERN application for the position of full stack web developer at TLE Eliminators - https://www.tle-eliminators.com. The application includes a dashboard that stores data in MongoDB, while fetching a user's codeforces data once each day(2am) while also allowing to manually fetch whenever needed. 


## Technology Stack

| Category             | Technologies                               | Explanation                                                     |
| :------------------- | :----------------------------------------- | :-------------------------------------------------------------- |
| **Frontend**         | React, React Router, Tailwind CSS          | For building a sleek frontend, tailwind for styling. |
| **Backend**          | Node.js, Express.js                        | For creating the robust and scalable RESTful API.               |
| **Database**         | MongoDB                                    | For flexible, schema-less storage of student and schedule data.    |
| **Job Queue System** | BullMQ, Redis                              | To manage, persist, and process asynchronous background jobs.     |
| **Task Scheduling**  | node-cron                                  | To schedule automated tasks, such as the daily data sync.       |
| **API Communication**| Axios                                      | For making promise-based HTTP requests to the Codeforces API.   |
| **Utilities**        | date-fns                                   | For simple and consistent handling of dates and times.          |


## This solution includes


![Jist of the solution](images/jist.png)


*   **Student Management Dashboard:** The core of the frontend is a clean and responsive dashboard built with React. It provides full CRUD (Create, Read, Update, Delete) functionality for student profiles, allowing administrators to easily manage the roster of students being tracked.

  
![Dashboard](images/dashboard.png)


*   **Automated Codeforces Data Synchronization:** The system automatically fetches comprehensive data for each student from the Codeforces API once each day (2am) or when user manually selects to fetch updated data from the API.




*   **Performance Analytics:** For each student, the application generates and displays -
1. Most difficult problem solved (by rating)
2. Total problems solved
3. Average rating
4. Average problems per day
5. Bar chart of number of problems solved per rating bucket
6. Show a submission heat map


![Analytics](images/analytics-1.png)


![Analytics](images/dashboard-2.png)


![Analytics](images/dashboard-3.png)


![Analytics](images/analytics-2.png)


*   **Automated Inactivity Detection and Email Reminders:** The system  identifies students who have not made any submissions on Codeforces for a predefined period (seven days). Upon detection, it automatically triggers a job to send a polite, encouraging reminder email to the student. 

## The Scalability Architecture

This solution is scalable as well, the backend was architected as a distributed system using a Producer/Consumer pattern, orchestrated by specialized job queues. 

### The Components of the System


![Scalable](images/scalable.png)


1.  **The Scheduler (Producer):** A lightweight cron job serves as the system's main producer. Its sole responsibility is to trigger n times every 24 hours. When it runs, it queries the database for the list of all students and, for each student, enqueues a `sync-student` job into a dedicated queue. 

2.  **The Broker (BullMQ and Redis):** The system uses BullMQ, a job queue library built on top of Redis. Redis acts as the high-speed message broker that stores the jobs. This decouples the scheduler from the workers that perform the actual tasks. Jobs are persisted in Redis, ensuring that even if a worker process crashes, the tasks are not lost and can be retried. The system utilizes two distinct queues: `sync-queue` for data fetching and `email-queue` for sending notifications.

3.  **The Sync Worker:** This is the first and most critical consumer in the chain. It is a dedicated Node.js process that listens exclusively to the `sync-queue`. Its job is to process student data synchronization tasks. To keep in mind the Codeforces API limits , this worker is intentionally **rate-limited**. It will process only one job every few seconds. Its workflow is to:
    *   Dequeue a `sync-student` job.
    *   Make a single, data-rich API call to the Codeforces `user.status` endpoint.
    *   Process the returned submission history to calculate all necessary analytics.
    *   Update the student's record in the MongoDB database with the fresh data.
    *   Upon successful completion, enqueue a *new* `check-inactivity` job for that student into the `email-queue`.

4.  **The Email Worker:** This is the second consumer in the chain, listening to the `email-queue`.It checks the student's last submission date against the current date. If the student is deemed inactive (7 days ), it sends an email. Because these tasks are quick and independent, this worker is configured to process jobs **concurrently**, allowing it to clear the email queue very rapidly.


![Test](images/test-1.png)


![Test](images/test-2.png)


![Test](images/test-3.png)


![Mail](images/mail.png)


## API Endpoints

The backend exposes a RESTful API for managing students and sync schedules.

### Student Management (`/api/students`)

| Method | Endpoint               | Description                                                                                                   |
| :----- | :--------------------- | :------------------------------------------------------------------------------------------------------------ |
| `GET`  | `/`                    | Retrieves a list of all students.                                                                             |
| `GET`  | `/:id`                 | Retrieves a single student by their unique ID.                                                                |
| `POST` | `/`                    | Creates a new student. Expects a JSON body with `name`, `email`, and `codeforces_handle`.                       |
| `PUT`  | `/:id`                 | Updates a student's information. If the `codeforces_handle` is changed, it re-fetches data.                    |
| `DELETE`| `/:id`                 | Deletes a student from the database.                                                                          |
| `POST` | `/:id/sync`            | Manually triggers a data synchronization for a specific student from the Codeforces API.                      |

### Schedule Management (`/api/cron`)

| Method | Endpoint               | Description                                                                                                   |
| :----- | :--------------------- | :------------------------------------------------------------------------------------------------------------ |
| `GET`  | `/schedules`           | Retrieves all saved cron job schedules.                                                                       |
| `POST` | `/schedules`           | Creates a new cron job schedule. Expects `name` and `schedule` (cron pattern).                                |
| `PUT`  | `/schedules/:id`       | Updates an existing schedule by its ID. Can be used to change the name, pattern, or `isEnabled` status.       |
| `DELETE`| `/schedules/:id`       | Deletes a cron job schedule.                                                                                  |


## How to Run

To get the application up and running locally, you will need to start the backend server, the two specialized worker processes, and the frontend development server. Each should be run in a separate terminal.

### Backend Setup

All backend processes are run from the `express` directory.

1.  **Start the Express Server:**
    ```bash
    cd express
    npm start
    ```

2.  **Start the Sync Worker:** This worker is responsible for fetching data from the Codeforces API.
    ```bash
    cd express
    npm run sync-worker
    ```

3.  **Start the Email Worker:** This worker is responsible for sending inactivity reminder emails.
    ```bash
    cd express
    npm run worker
    ```

### Frontend Setup

Navigate to the `frontend` directory to start the React application.

```bash
cd frontend
npm run start
```

Once all processes are active, the application will be available at `http://localhost:3000`.

