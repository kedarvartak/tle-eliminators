# Student Progress Management System

## Project Overview

This is a full-stack MERN application designed to automate the process of tracking and managing student progress on the competitive programming platform, Codeforces. The system serves as a centralized dashboard for mentors and administrators to monitor student activity, view detailed performance analytics, and automatically engage with students who have become inactive. Its primary goal is to replace manual, time-consuming tracking with a scalable, automated, and reliable backend system, enabling proactive student mentorship.

## Core Problem and Solution

In educational or mentorship settings involving competitive programming, a common challenge is the consistent tracking of student engagement. Mentors often have to manually check profiles on platforms like Codeforces to see if students are practicing, which becomes untenable as the number of students grows. This manual process is not only inefficient but also makes it difficult to spot declining engagement early and provide timely encouragement.

This system directly solves that problem by providing a robust platform that automates the entire workflow. It maintains an up-to-date record of every student's progress by periodically fetching data directly from the Codeforces API. It visualizes this data through an intuitive frontend, offering deep insights into performance. Most critically, it includes an intelligent, automated system to detect student inactivity and dispatch email reminders, ensuring no student falls through the cracks.

## Key Features

*   **Student Management Dashboard:** The core of the frontend is a clean and responsive dashboard built with React. It provides full CRUD (Create, Read, Update, Delete) functionality for student profiles, allowing administrators to easily manage the roster of students being tracked.

*   **Automated Codeforces Data Synchronization:** The system automatically fetches comprehensive data for each student from the Codeforces API. This includes their complete submission history, rating changes, and problem-solving statistics. This data forms the foundation for all analytics and inactivity checks.

*   **In-Depth Performance Analytics:** For each student, the application generates and displays a rich set of performance metrics. This includes a GitHub-style submission heatmap to visualize daily activity, a chart tracking rating progression over time, and detailed statistics on the types and difficulties of problems solved.

*   **Automated Inactivity Detection and Email Reminders:** The system intelligently identifies students who have not made any submissions on Codeforces for a predefined period (e.g., seven days). Upon detection, it automatically triggers a job to send a polite, encouraging reminder email to the student. This feature is designed to be both reliable and highly scalable.

## The Scalability Architecture: From Monolith to Distributed Queues

A central requirement for this project was to build a backend that could scale from tracking ten students to thousands without a degradation in performance or reliability. A naive approach, such as a single cron job that iterates through all students and sequentially fetches their data, would create a massive bottleneck. Such a job would run for an increasingly long time, would be a single point of failure, and would be difficult to maintain.

To solve this, the backend was architected as a distributed system using a Producer/Consumer pattern, orchestrated by specialized job queues. This design ensures efficiency, resilience, and true scalability.

### The Components of the System

1.  **The Scheduler (Producer):** A lightweight cron job, powered by `node-cron`, serves as the system's main producer. Its sole responsibility is to trigger once every 24 hours. When it runs, it queries the database for the list of all students and, for each student, enqueues a `sync-student` job into a dedicated queue. This process is incredibly fast and is completed in seconds, regardless of the number of students, as it does not perform any heavy lifting itself.

2.  **The Broker (BullMQ and Redis):** The system uses BullMQ, a robust job queue library built on top of Redis. Redis acts as the high-speed message broker that stores the jobs. This decouples the scheduler from the workers that perform the actual tasks. Jobs are persisted in Redis, ensuring that even if a worker process crashes, the tasks are not lost and can be retried. The system utilizes two distinct queues: `sync-queue` for data fetching and `email-queue` for sending notifications.

3.  **The Sync Worker (Throttled Consumer):** This is the first and most critical consumer in the chain. It is a dedicated Node.js process that listens exclusively to the `sync-queue`. Its job is to process student data synchronization tasks. To respect the Codeforces API limits and act as a responsible client, this worker is intentionally **rate-limited**. It will process only one job every few seconds. Its workflow is to:
    *   Dequeue a `sync-student` job.
    *   Make a single, data-rich API call to the Codeforces `user.status` endpoint.
    *   Process the returned submission history to calculate all necessary analytics.
    *   Update the student's record in the MongoDB database with the fresh data.
    *   Upon successful completion, enqueue a *new* `check-inactivity` job for that student into the `email-queue`.

4.  **The Email Worker (Concurrent Consumer):** This is the second consumer in the chain, listening to the `email-queue`. Unlike the Sync Worker, this worker's tasks are very fast and do not depend on external APIs with rate limits. It checks the student's last submission date against the current date. If the student is deemed inactive, it sends an email. Because these tasks are quick and independent, this worker is configured to process jobs **concurrently**, allowing it to clear the email queue very rapidly.

### The Benefits of this Architecture

*   **Scalability:** The system can gracefully handle a massive increase in the number of students. The scheduler remains fast, and the work is distributed efficiently across the queues and workers.
*   **Resilience:** The use of BullMQ and Redis means that jobs are persistent. If the Sync Worker fails mid-task, the job is not lost and will be automatically retried according to a configurable backoff strategy. This prevents data loss and ensures every student is eventually processed.
*   **Decoupling and Specialization:** Each component has a single, well-defined responsibility. This makes the system far easier to develop, debug, and maintain. The slow, rate-limited work is completely isolated from the fast, concurrent work, preventing system-wide bottlenecks.

## Technology Stack

*   **Backend:** Node.js, Express.js
*   **Database:** MongoDB
*   **Frontend:** React, React Router
*   **Job Queues:** BullMQ, Redis
*   **Scheduling:** node-cron
*   **API Communication:** Axios
*   **Styling:** Tailwind CSS
*   **Date/Time Manipulation:** date-fns 